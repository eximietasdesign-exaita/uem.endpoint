using System.Security.Claims;
﻿using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
using UEM.Satellite.API;
using UEM.Satellite.API.Data;
using UEM.Satellite.API.Hubs;
using UEM.Satellite.API.Services;
using UEM.Satellite.API.Hubs;


//var builder = WebApplication.CreateBuilder(args);
var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/uem-.log", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 14));


// Keep host alive if a background service throws
builder.Services.Configure<HostOptions>(o => {
    o.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
});

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(o => o.TimestampFormat = "HH:mm:ss ");
builder.Logging.SetMinimumLevel(LogLevel.Information);

// Controllers/Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "UEM Satellite API", Version = "v1" }));

// CORS for UI
const string DevCors = "DevCors";
builder.Services.AddCors(opt => {
    opt.AddPolicy(DevCors, p => p
        .WithOrigins("http://localhost:5173", "https://localhost:5173")
        .AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

//  JWT auth (key length ≥ 32 bytes)
var signingKey = builder.Configuration["Jwt:SigningKey"] ?? "ThisIsA32+ByteMinimumDemoSigningKey!!!";
var keyBytes = Encoding.UTF8.GetBytes(signingKey);
if (keyBytes.Length < 32) throw new Exception("Jwt:SigningKey must be ≥ 32 bytes");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            RoleClaimType = ClaimTypes.Role,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
        };
        //allow SignalR WebSockets to send token via query string `access_token`
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var accessToken = ctx.Request.Query["access_token"];
                var path = ctx.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/agent-hub"))
                    ctx.Token = accessToken;
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<AgentRegistry>();
builder.Services.AddSingleton<TokenService>();

builder.Services.AddSingleton<IDbFactory, DbFactory>();
builder.Services.AddSingleton<HeartbeatRepository>();

// Correlation ID middleware
builder.Services.AddSingleton<ICorrelationIdAccessor, CorrelationIdAccessor>();
// SignalR
builder.Services.AddSignalR();

// Kafka services (your resilient versions)
builder.Services.AddHostedService<KafkaTopicProvisioner>();
builder.Services.AddHostedService<KafkaCommandConsumer>();
builder.Services.AddSingleton<KafkaResponseProducer>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

app.UseCors(DevCors);
app.UseHttpsRedirection();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseSerilogRequestLogging(); // logs method, path, status, duration

////  put auth in the pipeline
//app.UseAuthentication();
//app.UseAuthorization();

app.MapControllers();
app.MapHub<AgentHub>("/agent-hub");

// Protect hub (requires JWT)
//app.MapHub<HeartbeatDtos>("/agent-hub").RequireAuthorization();

// Public health
//app.MapGet("/health", () => Results.Ok(new { ok = true, ts = DateTime.UtcNow }));

app.UseSwagger();
app.UseSwaggerUI();

app.Run();

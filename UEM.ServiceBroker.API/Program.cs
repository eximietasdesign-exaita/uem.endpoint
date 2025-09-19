using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using Serilog;
using UEM.ServiceBroker.API;
using UEM.ServiceBroker.API.Controllers;
using UEM.ServiceBroker.API.Services;
        
var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/uem-.log", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 14));

builder.Services.Configure<HostOptions>(o =>
{
    o.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
});

builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(o => o.TimestampFormat = "HH:mm:ss ");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo { Title = "UEM ServiceBroker", Version = "v1" }));

const string DevCors = "DevCors";
builder.Services.AddCors(o =>
    o.AddPolicy(DevCors, p => p.WithOrigins("http://localhost:5173", "https://localhost:5173")
                               .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

builder.Services.AddSingleton<IStreamBus, StreamBus>();
builder.Services.AddHostedService<KafkaResponseConsumerDelayed>();
builder.Services.AddHttpContextAccessor();

// Register CorrelationIdMiddleware as a scoped service
builder.Services.AddScoped<CorrelationIdMiddleware>();

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseSerilogRequestLogging(); // logs method, path, status, duration

app.UseCors(DevCors);
app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { ok = true, ts = DateTime.UtcNow }));

app.Run();

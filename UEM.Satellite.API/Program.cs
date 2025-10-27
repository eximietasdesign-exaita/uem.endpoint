using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UEM.Satellite.API.Data;
using Dapper;
using UEM.Satellite.API.Data.Repositories;
using UEM.Satellite.API.Services;
using UEM.Satellite.API.Store;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/satellite-api-.log", rollingInterval: RollingInterval.Day)
        .Enrich.FromLogContext();
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "UEM Satellite API", 
        Version = "v1",
        Description = "Enterprise-grade Unified Endpoint Management Satellite API"
    });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey
    });
});

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("Postgres") 
    ?? Environment.GetEnvironmentVariable("DATABASE_URL") 
    ?? throw new InvalidOperationException("Database connection string not found");

// Database repositories with Dapper
builder.Services.AddScoped<IAgentRepository, AgentRepository>();
builder.Services.AddScoped<IHardwareRepository, HardwareRepository>();
builder.Services.AddScoped<ISoftwareRepository, SoftwareRepository>();
builder.Services.AddScoped<IProcessRepository, ProcessRepository>();
builder.Services.AddScoped<INetworkRepository, NetworkRepository>();
builder.Services.AddScoped<IEnhancedHeartbeatRepository, EnhancedHeartbeatRepository>();

// Agent simulation service for testing
builder.Services.AddHostedService<UEM.Satellite.API.Services.AgentSimulationService>();

// Dapper factory for legacy repository compatibility
builder.Services.AddSingleton<IDbFactory>(provider => new DbFactory(builder.Configuration));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"] ?? "your-super-secret-jwt-key-here")),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// CORS for UI
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAnyOrigin", policy => { // Renamed policy for clarity
        policy
            .AllowAnyOrigin()      // Allows any origin
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Add CORS configuration before adding controllers
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5000",  // WebApp
                "http://localhost:5173",  // Vite dev server
                "http://localhost:3000"   // Alternative dev port
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Register services
builder.Services.AddScoped<AgentRegistry>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<HeartbeatRepository>();
builder.Services.AddScoped<AgentStore>();
builder.Services.AddScoped<DiscoveryScriptPopulationService>();

// Policy deployment services
builder.Services.AddScoped<IPolicyDeploymentService, PolicyDeploymentService>();
builder.Services.AddScoped<IAgentStatusService, AgentStatusService>();

// Health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => 
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "UEM Satellite API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseSerilogRequestLogging();
app.UseRouting();
app.UseCors("AllowAll"); // Use the new policy name
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Serve static files from built frontend
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "../UEM.WebApp/dist/public")),
    RequestPath = ""
});

app.MapControllers();
app.MapHealthChecks("/health");

// Serve index.html for SPA routes (everything that's not API or static files)
app.MapFallback(async (HttpContext context) =>
{
    var indexPath = Path.Combine(Directory.GetCurrentDirectory(), "../UEM.WebApp/dist/public/index.html");
    if (File.Exists(indexPath))
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(indexPath);
    }
    else
    {
        context.Response.StatusCode = 404;
        await context.Response.WriteAsync("Frontend files not found. Please build the frontend first.");
    }
});

app.MapGet("/api/status", () => new { 
    status = "healthy", 
    timestamp = DateTime.UtcNow,
    version = "v1.0.0",
    environment = app.Environment.EnvironmentName
});

// Additional Swagger endpoints
app.MapGet("/swagger", () => Results.Redirect("/swagger/index.html"));

// Initialize database tables through repositories if needed
try
{
    using var scope = app.Services.CreateScope();
    var agentRepo = scope.ServiceProvider.GetRequiredService<IAgentRepository>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    // Test database connection
    var dbFactory = scope.ServiceProvider.GetRequiredService<IDbFactory>();
    using var connection = dbFactory.Open();
    await connection.ExecuteAsync("SELECT 1");
    
    logger.LogInformation("Database connection and repositories initialized successfully");
}
catch (Exception ex)
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "Failed to initialize database connection");
    throw; // Fail fast if database connection fails
}

// Test database connection endpoint
app.MapGet("/api/database-test", async (IDbFactory dbFactory) =>
{
    try
    {
        using var connection = dbFactory.Open();
        await connection.ExecuteAsync("SELECT 1");
        return Results.Ok(new { status = "Database connection successful" });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { status = "Database connection failed", error = ex.Message });
    }
});

app.Use(async (context, next) => {
    try
    {
        await next();
    }
    catch (Exception ex) when (ex is InvalidOperationException && ex.Message.Contains("CORS"))
    {
        context.Response.StatusCode = 500;
        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "CORS error occurred");
        await context.Response.WriteAsJsonAsync(new { 
            error = "CORS error", 
            message = ex.Message,
            allowedOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>() 
        });
    }
});

// Start the application (respects --urls command-line parameter)
app.Run();
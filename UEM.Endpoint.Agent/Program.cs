using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using UEM.Endpoint.Agent.Services;
using UEM.Endpoint.Agent.Data.Contexts;
using UEM.Endpoint.Agent.Data.Services;
using UEM.Shared.Infrastructure.Logging;
using Serilog;
using Serilog.Events;

// Initialize Serilog early to capture startup logs
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateBootstrapLogger();

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<HostOptions>(o =>
{
    // keep running even if BackgroundService throws
    o.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
});

// Configure Serilog from appsettings.json
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services));

// Ensure log directories exist
var logDirs = new[]
{
    "logs/agent",
    "logs/services", 
    "logs/errors"
};

foreach (var dir in logDirs)
{
    Directory.CreateDirectory(dir);
}

// For Windows service, also create system log directory
if (OperatingSystem.IsWindows())
{
    var systemLogDir = @"C:\ProgramData\EximietasDesign\UEM.Endpoint.Service\Logs";
    Directory.CreateDirectory(systemLogDir);
}

// SQLite databases
builder.Services.AddDbContext<AgentDataContext>(options =>
{
    var dbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "agentdata.db");
    options.UseSqlite($"Data Source={dbPath}");
});

builder.Services.AddDbContext<ServerDataContext>(options =>
{
    var dbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "serverdata.db");
    options.UseSqlite($"Data Source={dbPath}");
});

// Database services
builder.Services.AddScoped<AgentDataService>();
builder.Services.AddScoped<ServerDataService>();

// Database initialization and maintenance
builder.Services.AddHostedService<DatabaseInitializationService>();
builder.Services.AddSingleton<DatabaseMaintenanceService>();
builder.Services.AddHostedService<DatabaseMaintenanceService>();

// Core agent services
builder.Services.AddSingleton<AgentRegistrationService>();
builder.Services.AddSingleton<HeartbeatCollector>();
builder.Services.AddHostedService<HeartbeatService>();

// Logging services
builder.Services.AddSingleton<LogFileManager>();

// Enterprise discovery services
builder.Services.AddSingleton<EnterpriseHardwareDiscoveryService>();
builder.Services.AddSingleton<EnterpriseSoftwareDiscoveryService>();
builder.Services.AddSingleton<EnterpriseSecurityDiscoveryService>();

// Add this registration for EnterpriseDiscoveryOrchestrator as a singleton:
builder.Services.AddSingleton<EnterpriseDiscoveryOrchestrator>(sp =>
{
    var logger = sp.GetRequiredService<ILogger<EnterpriseDiscoveryOrchestrator>>();
    var config = sp.GetRequiredService<IConfiguration>();
    var reg = sp.GetRequiredService<AgentRegistrationService>();
    var hardware = sp.GetRequiredService<EnterpriseHardwareDiscoveryService>();
    var software = sp.GetRequiredService<EnterpriseSoftwareDiscoveryService>();
    var security = sp.GetRequiredService<EnterpriseSecurityDiscoveryService>();
    return new EnterpriseDiscoveryOrchestrator(logger, config, reg, hardware, software, security);
});

// And keep the hosted service registration:
builder.Services.AddHostedService<EnterpriseDiscoveryOrchestrator>(sp => sp.GetRequiredService<EnterpriseDiscoveryOrchestrator>());

// Command handling
builder.Services.AddSingleton<CommandChannel>(sp =>
{
    var logger = sp.GetRequiredService<ILogger<CommandChannel>>();
    var config = sp.GetRequiredService<IConfiguration>();
    return new CommandChannel(logger, config);
});

// Main agent worker
builder.Services.AddHostedService<AgentWorker>();

var app = builder.Build();

var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Starting UEM Enterprise Endpoint Agent with comprehensive discovery and daily file logging...");

try
{
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "UEM Enterprise Endpoint Agent terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}

sealed class AgentWorker : BackgroundService
{
    private readonly ILogger<AgentWorker> _log;
    private readonly AgentRegistrationService _reg;
    private readonly CommandChannel _commandChannel;
    private readonly EnterpriseDiscoveryOrchestrator _discoveryOrchestrator;

    public AgentWorker(
        ILogger<AgentWorker> log, 
        AgentRegistrationService reg, 
        CommandChannel commandChannel,
        EnterpriseDiscoveryOrchestrator discoveryOrchestrator)
    {
        _log = log;
        _reg = reg;
        _commandChannel = commandChannel;
        _discoveryOrchestrator = discoveryOrchestrator;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _log.LogInformation("Enterprise Agent Worker starting...");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Ensure agent is registered
                await _reg.EnsureRegisteredAsync(stoppingToken);
                var agentId = _reg.AgentId ?? throw new InvalidOperationException("AgentId unset after registration.");
                var jwt = _reg.Jwt ?? throw new InvalidOperationException("JWT unset after registration.");

                var baseUrl = (Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200")
                              .Trim().Trim('"', '\'');

                _log.LogInformation("Enterprise Agent {AgentId} connecting to {BaseUrl}", agentId, baseUrl);

                // Connect to command channel
                await _commandChannel.ConnectAsync(baseUrl, agentId, jwt, stoppingToken);

                var handler = new CommandHandler(baseUrl, agentId);

                // Process incoming commands
                await foreach (var cmd in _commandChannel.ReadCommandsAsync(stoppingToken))
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            // Handle special discovery commands
                            if (cmd.Type == "trigger-discovery")
                            {
                                _log.LogInformation("Triggering manual discovery via command");
                                await _discoveryOrchestrator.TriggerDiscoveryAsync(stoppingToken);
                            }
                            else
                            {
                                // Handle other commands
                                await handler.HandleAsync(cmd, stoppingToken);
                            }
                        }
                        catch (Exception ex)
                        {
                            _log.LogError(ex, "Error handling command {CommandId} of type {CommandType}", cmd.Id, cmd.Type);
                        }
                    }, stoppingToken);
                }

                // If the foreach exits, reconnect after a short delay
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Agent loop error; retrying in 120s");
                await Task.Delay(TimeSpan.FromSeconds(120), stoppingToken);
            }
        }

        _log.LogInformation("Enterprise Agent Worker stopped");
    }
}

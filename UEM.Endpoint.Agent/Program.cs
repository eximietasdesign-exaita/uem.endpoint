using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using UEM.Endpoint.Agent.Services;
using UEM.Shared.Infrastructure.Logging;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.Configure<HostOptions>(o =>
{
    // keep running even if BackgroundService throws
    o.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
});

builder.Logging.ClearProviders();
builder.Logging.AddSimpleConsole(o => o.TimestampFormat = "HH:mm:ss ");

// Add file logging for Windows
if (OperatingSystem.IsWindows())
{
    var logDir = @"C:\ProgramData\EximietasDesign\UEM.Endpoint.Service\Logs";
    Directory.CreateDirectory(logDir);
    // builder.Logging.AddFile(Path.Combine(logDir, "agent.log"), append: true);
}

// Core agent services
builder.Services.AddSingleton<AgentRegistrationService>();
builder.Services.AddSingleton<HeartbeatCollector>();
builder.Services.AddHostedService<HeartbeatService>();

// Enterprise discovery services
builder.Services.AddSingleton<EnterpriseHardwareDiscoveryService>();
builder.Services.AddSingleton<EnterpriseSoftwareDiscoveryService>();
builder.Services.AddSingleton<EnterpriseSecurityDiscoveryService>();
builder.Services.AddHostedService<EnterpriseDiscoveryOrchestrator>();

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
logger.LogInformation("Starting UEM Enterprise Endpoint Agent with comprehensive discovery capabilities...");

await app.RunAsync();

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

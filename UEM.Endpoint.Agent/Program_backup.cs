using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
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

//// Add file logging for Windows
//if (OperatingSystem.IsWindows())
//{
//    var logDir = @"C:\ProgramData\EximietasDesign\UEM.Endpoint.Service\Logs";
//    Directory.CreateDirectory(logDir);
//    builder.Logging.AddFile(Path.Combine(logDir, "agent.log"), append: true);
//}

builder.Services.AddSingleton<AgentRegistrationService>();
builder.Services.AddHostedService<AgentWorker>();

builder.Services.AddSingleton<HeartbeatCollector>();
builder.Services.AddHostedService<HeartbeatService>();

builder.Services.AddSingleton<CommandChannel>(sp =>
{
    var logger = sp.GetRequiredService<ILogger<CommandChannel>>();
    var config = sp.GetRequiredService<IConfiguration>();
    return new CommandChannel(logger, config);
});

var app = builder.Build();
await app.RunAsync();

sealed class AgentWorker : BackgroundService
{
    private readonly ILogger<AgentWorker> _log;
    private readonly AgentRegistrationService _reg;
    private readonly CommandChannel _commandChannel;

    public AgentWorker(ILogger<AgentWorker> log, AgentRegistrationService reg, CommandChannel commandChannel)
    {
        _log = log;
        _reg = reg;
        _commandChannel = commandChannel;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await _reg.EnsureRegisteredAsync(stoppingToken);
                var agentId = _reg.AgentId ?? throw new InvalidOperationException("AgentId unset after registration.");
                var jwt = _reg.Jwt ?? throw new InvalidOperationException("JWT unset after registration.");

                var baseUrl = (Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200")
                              .Trim().Trim('"', '\'');

                _log.LogInformation("Agent {AgentId} connecting to {BaseUrl}", agentId, baseUrl);

                await _commandChannel.ConnectAsync(baseUrl, agentId, jwt, stoppingToken);

                var handler = new CommandHandler(baseUrl, agentId);

                await foreach (var cmd in _commandChannel.ReadCommandsAsync(stoppingToken))
                    _ = Task.Run(() => handler.HandleAsync(cmd, stoppingToken), stoppingToken);

                // If the foreach exits, reconnect after a short delay
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Agent loop error; retrying in 5s…");
                await Task.Delay(1000 * 120, stoppingToken);
            }
        }
    }
}
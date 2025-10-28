using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Http.Json;
using UEM.Endpoint.Agent.Services;

public sealed class AgentInitializationService : BackgroundService
{
    private readonly IServiceProvider _provider;
    private readonly IConfiguration _config;
    private readonly ILogger<AgentInitializationService> _log;

    public AgentInitializationService(IServiceProvider provider, IConfiguration config, ILogger<AgentInitializationService> log)
    {
        _provider = provider;
        _config = config;
        _log = log;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); // Delay for service startup

        using var scope = _provider.CreateScope();

        if (!OperatingSystem.IsWindows())
        {
            _log.LogWarning("EnterpriseHardwareDiscoveryService is only supported on Windows. Skipping hardware discovery.");
            return;
        }

        var hardwareDiscovery = scope.ServiceProvider.GetRequiredService<EnterpriseHardwareDiscoveryService>();
        var hardwareInfo = await hardwareDiscovery.DiscoverAsync();

        var apiUrl = _config.GetValue<string>("Api:CommandResponseUrl") ?? "https://localhost:7201";
        apiUrl = $"{apiUrl}/api/commands/response";

        var handler = new HttpClientHandler();
        handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
        using var httpClient = new HttpClient(handler);

        var responsePayload = new
        {
            CommandId = Guid.NewGuid().ToString(),
            AgentId = hardwareInfo.Hostname,
            Output = hardwareInfo
        };

        try
        {
            var resp = await httpClient.PostAsJsonAsync(apiUrl, responsePayload, stoppingToken);
            if (resp.IsSuccessStatusCode)
                _log.LogInformation("Hardware details sent to API endpoint: {ApiUrl}", apiUrl);
            else
                _log.LogWarning("Failed to send hardware details to API endpoint: {ApiUrl} Status: {StatusCode}", apiUrl, resp.StatusCode);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error sending hardware details to API endpoint: {ApiUrl}", apiUrl);
        }
    }
}

//// New background service for delayed hardware reporting
//public sealed class StartupHardwareReporter : BackgroundService
//{
//    private readonly IServiceProvider _provider;
//    private readonly IConfiguration _config;
//    private readonly ILogger<StartupHardwareReporter> _log;

//    public StartupHardwareReporter(IServiceProvider provider, IConfiguration config, ILogger<StartupHardwareReporter> log)
//    {
//        _provider = provider;
//        _config = config;
//        _log = log;
//    }

//    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
//    {
//        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); // Delay before starting functionality
//        return;
//        using var scope = _provider.CreateScope();
//        var hardwareDiscovery = scope.ServiceProvider.GetRequiredService<EnterpriseHardwareDiscoveryService>();
//        var hardwareInfo = await hardwareDiscovery.DiscoverAsync();

//        var apiUrl = _config.GetValue<string>("Api:CommandResponseUrl") ?? "https://localhost:7201";
//        apiUrl = $"{apiUrl}/api/commands/response";

//        var handler = new HttpClientHandler();
//        handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
//        using var httpClient = new HttpClient(handler);

//        var responsePayload = new
//        {
//            CommandId = Guid.NewGuid().ToString(),
//            AgentId = hardwareInfo.Hostname,
//            Output = hardwareInfo
//        };

//        try
//        {
//            var resp = await httpClient.PostAsJsonAsync(apiUrl, responsePayload, stoppingToken);

//            if (resp.IsSuccessStatusCode)
//                _log.LogInformation("Hardware details sent to API endpoint: {ApiUrl}", apiUrl);
//            else
//                _log.LogWarning("Failed to send hardware details to API endpoint: {ApiUrl} Status: {StatusCode}", apiUrl, resp.StatusCode);
//        }
//        catch (Exception ex)
//        {
//            _log.LogError(ex, "Error sending hardware details to API endpoint: {ApiUrl}", apiUrl);
//        }
//    }
//}


sealed class AgentWorkerService : BackgroundService
{
    private readonly ILogger<AgentWorkerService> _log;
    private readonly AgentRegistrationService _reg;
    private readonly ILogger<CommandChannel> _commandChannelLogger;
    private readonly IConfiguration _config;

    public AgentWorkerService(ILogger<AgentWorkerService> log, AgentRegistrationService reg, ILogger<CommandChannel> commandChannelLogger, IConfiguration config)
    {
        _log = log;
        _reg = reg;
        _commandChannelLogger = commandChannelLogger;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var defaultSatelliteBaseUrl = _config.GetValue<string>("Satellite:BaseUrl") ?? "https://localhost:7200";
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await _reg.EnsureRegisteredAsync(stoppingToken);
                var agentId = _reg.AgentId ?? throw new InvalidOperationException("AgentId unset after registration.");
                var jwt = _reg.Jwt ?? throw new InvalidOperationException("JWT unset after registration.");

                var baseUrl = (Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? defaultSatelliteBaseUrl)
                              .Trim().Trim('"', '\'');

                _log.LogInformation("Agent {AgentId} connecting to {BaseUrl}", agentId, baseUrl);

                var chan = new CommandChannel(_commandChannelLogger, _config);
                await chan.ConnectAsync(baseUrl, agentId, jwt, stoppingToken);

                var handler = new CommandHandler(baseUrl, agentId);

                await foreach (var cmd in chan.ReadCommandsAsync(stoppingToken))
                    _ = Task.Run(() => handler.HandleAsync(cmd, stoppingToken), stoppingToken);

                // If the foreach exits, reconnect after a short delay
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Unhandled exception in AgentWorker loop: {Message}", ex.Message);
                _log.LogWarning(ex, "Agent loop error; retrying in 5s�");
                await Task.Delay(1000 * 120, stoppingToken);
            }
        }
    }
}
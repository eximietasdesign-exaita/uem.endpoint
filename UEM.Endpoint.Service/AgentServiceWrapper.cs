using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using UEM.Endpoint.Agent;
using UEM.Endpoint.Agent.Services; // Add this using statement

public sealed class AgentServiceWrapper : BackgroundService
{
    private readonly ILogger<AgentServiceWrapper> _logger;
    private readonly IHostApplicationLifetime _appLifetime;

    public AgentServiceWrapper(ILogger<AgentServiceWrapper> logger, IHostApplicationLifetime appLifetime)
    {
        _logger = logger;
        _appLifetime = appLifetime;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AgentServiceWrapper is starting.");

        try
        {
            // Run the Agent's Program.cs logic here
            // You might need to adapt the Agent's code to fit this context
            // For example, move the Agent's service registrations to a separate method
            // and call that method here

            // Example:
            var agentHostBuilder = Host.CreateDefaultBuilder()
                .ConfigureServices((hostContext, services) =>
                {
                    // Add the Agent's services here
                    services.AddSingleton<AgentRegistrationService>();
                    services.AddHostedService<AgentWorker>();
                    services.AddSingleton<HeartbeatCollector>();
                    services.AddHostedService<HeartbeatService>();
                    services.AddSingleton<EnterpriseHardwareDiscoveryService>();

                  
                    services.AddSingleton<CommandChannel>(sp =>
                    {
                        var logger = sp.GetRequiredService<ILogger<CommandChannel>>();
                        var config = sp.GetRequiredService<IConfiguration>();
                        return new CommandChannel(logger, config);
                    });

                })
                .Build();

            await agentHostBuilder.RunAsync(stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running Agent: {Message}", ex.Message);
            _appLifetime.StopApplication(); // Stop the service if the Agent fails
        }

        _logger.LogInformation("AgentServiceWrapper is stopping.");
    }
}
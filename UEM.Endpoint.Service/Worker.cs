namespace UEM.Endpoint.Service;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;

    public Worker(ILogger<Worker> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("UEM.Endpoint.Service has started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

            // Your custom logic goes here!
            // For example: poll a database, check a message queue, process files, etc.

            await Task.Delay(5000, stoppingToken); // Wait for 5 seconds
        }

        _logger.LogInformation("UEM.Endpoint.Service is stopping.");
    }
}

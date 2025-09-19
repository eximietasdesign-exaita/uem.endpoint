using Confluent.Kafka;
using Confluent.Kafka.Admin;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace UEM.Satellite.API.Services;

public sealed class KafkaTopicProvisioner : IHostedService
{
    private readonly ILogger<KafkaTopicProvisioner> _log;
    private readonly IConfiguration _cfg;
    public KafkaTopicProvisioner(ILogger<KafkaTopicProvisioner> log, IConfiguration cfg)
    { _log = log; _cfg = cfg; }

    public async Task StartAsync(CancellationToken ct)
    {
        var bootstrap = _cfg["Kafka:BootstrapServers"] ?? "localhost:9092";
        var commands = _cfg["Kafka:Topics:Commands"] ?? "uem.commands";
        var responses = _cfg["Kafka:Topics:Responses"] ?? "uem.commands.responses";

        try
        {
            using var admin = new AdminClientBuilder(new AdminClientConfig { BootstrapServers = bootstrap }).Build();
            var specs = new[]
            {
                new TopicSpecification { Name = commands,  NumPartitions = 3, ReplicationFactor = 1 },
                new TopicSpecification { Name = responses, NumPartitions = 3, ReplicationFactor = 1 }
            };
            await admin.CreateTopicsAsync(specs);
            _log.LogInformation("Kafka topics ensured: {Commands}, {Responses}", commands, responses);
        }
        catch (CreateTopicsException) { /* already exists – fine */ }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Topic provision skipped (broker down?) – consumer will retry later");
        }
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}

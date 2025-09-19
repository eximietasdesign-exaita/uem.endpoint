using Confluent.Kafka;
using System.Text.Json;
using UEM.ServiceBroker.API.Controllers;

namespace UEM.ServiceBroker.API.Services;
public class KafkaResponseConsumer : BackgroundService
{
    private readonly IConfiguration _cfg;
    private readonly IStreamBus _bus;
    public KafkaResponseConsumer(IConfiguration cfg, IStreamBus bus) { _cfg = cfg; _bus = bus; }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var conf = new ConsumerConfig
        {
            BootstrapServers = _cfg["Kafka:BootstrapServers"] ?? "localhost:9092",
            GroupId = "broker-resp-consumer",
            AutoOffsetReset = AutoOffsetReset.Latest
        };
        using var consumer = new ConsumerBuilder<string, string>(conf).Build();
        var topic = _cfg["Kafka:Topics:Responses"] ?? "uem.commands.responses";
        consumer.Subscribe(topic);
        while (!stoppingToken.IsCancellationRequested)
        {
            var cr = consumer.Consume(stoppingToken);
            if (cr is null) continue;
            try
            {
                var obj = JsonSerializer.Deserialize<object>(cr.Message.Value ?? "{}");
                if (obj is not null) await _bus.PublishAsync(obj);
            }
            catch { /* swallow for demo */ }
        }
    }
}
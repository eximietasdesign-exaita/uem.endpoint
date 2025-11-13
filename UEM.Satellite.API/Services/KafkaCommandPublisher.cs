using Confluent.Kafka;
using System.Text.Json;

namespace UEM.Satellite.API.Services;

public class KafkaCommandPublisher : IAsyncDisposable
{
    private readonly IConfiguration _cfg;
    private IProducer<string, string>? _producer;
    private string _topic = "";

    public KafkaCommandPublisher(IConfiguration cfg) { _cfg = cfg; }

    private void EnsureProducer()
    {
        if (_producer != null) return;
        var bootstrap = _cfg["Kafka:BootstrapServers"] ?? "localhost:9092";
        _topic = _cfg["Kafka:Topics:Commands"] ?? "uem.commands";
        var conf = new ProducerConfig
        {
            BootstrapServers = bootstrap,
            SocketKeepaliveEnable = true,
            BrokerAddressFamily = BrokerAddressFamily.V4
        };
        _producer = new ProducerBuilder<string, string>(conf).Build();
    }

    public async Task PublishAsync(object payload, string key = "broadcast")
    {
        try
        {
            EnsureProducer();
            await _producer!.ProduceAsync(_topic, new Message<string, string>
            {
                Key = key,
                Value = JsonSerializer.Serialize(payload)
            });
        }
        catch
        {
            // swallow + retry later; do not kill the app
        }
    }

    public ValueTask DisposeAsync()
    {
        try { _producer?.Flush(TimeSpan.FromSeconds(2)); _producer?.Dispose(); } catch { }
        return ValueTask.CompletedTask;
    }
}

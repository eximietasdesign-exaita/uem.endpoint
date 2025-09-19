using Confluent.Kafka;
using System.Text.Json;

namespace UEM.ServiceBroker.API.Services;
public class KafkaCommandPublisher
{
    private readonly IProducer<string, string> _producer;
    private readonly string _topic;
    public KafkaCommandPublisher(IConfiguration cfg)
    {
        var pconf = new ProducerConfig{ BootstrapServers = cfg["Kafka:BootstrapServers"] ?? "localhost:9092" };
        _producer = new ProducerBuilder<string, string>(pconf).Build();
        _topic = cfg["Kafka:Topics:Commands"] ?? "uem.commands";
    }
    public Task PublishAsync(string key, object payload)
        => _producer.ProduceAsync(_topic, new Message<string, string>{ Key = key, Value = JsonSerializer.Serialize(payload) });
}

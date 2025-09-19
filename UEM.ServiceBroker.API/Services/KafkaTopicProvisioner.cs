using Confluent.Kafka;
using Confluent.Kafka.Admin;
using System.Text.Json;
using UEM.ServiceBroker.API.Controllers;

using Microsoft.Extensions.Hosting;

namespace UEM.ServiceBroker.API.Services;

public sealed class KafkaTopicProvisioner : IHostedService
{
    private readonly IConfiguration _cfg;

    public KafkaTopicProvisioner(IConfiguration cfg) => _cfg = cfg;

    public async Task StartAsync(CancellationToken ct)
    {
        var bootstrap = _cfg["Kafka:BootstrapServers"] ?? "localhost:9092";
        var commands = _cfg["Kafka:Topics:Commands"] ?? "uem.commands";
        var responses = _cfg["Kafka:Topics:Responses"] ?? "uem.commands.responses";

        var topics = new[] { commands, responses };
        using var admin = new AdminClientBuilder(new AdminClientConfig { BootstrapServers = bootstrap }).Build();

        try
        {
            // describe to see which exist
            var meta = admin.GetMetadata(TimeSpan.FromSeconds(5));
            var existing = meta.Topics.Select(t => t.Topic).ToHashSet(StringComparer.Ordinal);

            var toCreate = topics
                .Where(t => !existing.Contains(t))
                .Select(t => new TopicSpecification { Name = t, NumPartitions = 3, ReplicationFactor = 1 })
                .ToList();

            if (toCreate.Count > 0)
                await admin.CreateTopicsAsync(toCreate);
        }
        catch (Exception)
        {
            // don’t crash the host if Kafka isn’t up yet; the consumers will retry
        }
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}

//-----------------
public sealed class KafkaResponseConsumerDelayed : IHostedService
{
    private readonly ILogger<KafkaResponseConsumerDelayed> _log;
    private readonly IConfiguration _cfg;
    private readonly IStreamBus _bus;
    private readonly IHostApplicationLifetime _lifetime;
    private Task? _runner;
    private CancellationTokenSource? _cts;

    public KafkaResponseConsumerDelayed(ILogger<KafkaResponseConsumerDelayed> log, IConfiguration cfg, IStreamBus bus, IHostApplicationLifetime lifetime)
    { _log = log; _cfg = cfg; _bus = bus; _lifetime = lifetime; }

    public Task StartAsync(CancellationToken _)
    {
        _cts = new CancellationTokenSource();
        var ct = _cts.Token;

        _runner = Task.Run(async () =>
        {
            _lifetime.ApplicationStarted.WaitHandle.WaitOne();

            var bootstrap = _cfg["Kafka:BootstrapServers"] ?? "localhost:9092";
            var topic = _cfg["Kafka:Topics:Responses"] ?? "uem.commands.responses";

            var conf = new ConsumerConfig
            {
                BootstrapServers = bootstrap,
                GroupId = "broker-resp-consumer",
                AutoOffsetReset = AutoOffsetReset.Latest,
                EnableAutoCommit = true,
                BrokerAddressFamily = BrokerAddressFamily.V4,
                SocketKeepaliveEnable = true,
                SessionTimeoutMs = 45000,
                HeartbeatIntervalMs = 15000
            };

            while (!ct.IsCancellationRequested)
            {
                try
                {
                    using var consumer = new ConsumerBuilder<string, string>(conf).Build();

                    while (!ct.IsCancellationRequested)
                    {
                        try { consumer.Subscribe(topic); _log.LogInformation("Subscribed to {Topic}", topic); break; }
                        catch { await Task.Delay(2000, ct); }
                    }

                    while (!ct.IsCancellationRequested)
                    {
                        try
                        {
                            var cr = consumer.Consume(ct);
                            if (cr is null || cr.IsPartitionEOF) continue;

                            object payload;
                            try { payload = JsonSerializer.Deserialize<object>(cr.Message.Value ?? "{}") ?? new { }; }
                            catch { payload = new { raw = cr.Message.Value }; }

                            await _bus.PublishAsync(payload, ct);
                        }
                        catch (ConsumeException) { await Task.Delay(1000, ct); }
                    }
                }
                catch { await Task.Delay(2000, ct); }
            }
        }, ct);

        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken _)
    {
        try { _cts?.Cancel(); } catch { }
        if (_runner != null) { try { await _runner; } catch { } }
    }
}
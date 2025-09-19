using Confluent.Kafka;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using UEM.Satellite.API.Hubs;
using UEM.Shared.Infrastructure.Constants;

namespace UEM.Satellite.API.Services;

public sealed class KafkaCommandConsumer : IHostedService
{
    private readonly ILogger<KafkaCommandConsumer> _log;
    private readonly IConfiguration _cfg;
    private readonly IHubContext<AgentHub> _hub;
    private CancellationTokenSource? _cts;
    private Task? _runner;

    public KafkaCommandConsumer(ILogger<KafkaCommandConsumer> log, IConfiguration cfg, IHubContext<AgentHub> hub)
    { _log = log; _cfg = cfg; _hub = hub; }

    private sealed record Envelope(string id, string type, JsonElement payload, int ttl);

    public Task StartAsync(CancellationToken ct)
    {
        _cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        var lct = _cts.Token;

        _runner = Task.Run(async () =>
        {
            var bootstrap = _cfg["Kafka:BootstrapServers"] ?? "localhost:9092";
            var topic = _cfg["Kafka:Topics:Commands"] ?? TopicNames.Commands;

            var conf = new ConsumerConfig
            {
                BootstrapServers = bootstrap,
                GroupId = "satellite-dispatcher",
                AutoOffsetReset = AutoOffsetReset.Latest,
                EnableAutoCommit = true,
                SocketKeepaliveEnable = true,
                BrokerAddressFamily = BrokerAddressFamily.V4
            };

            using var consumer = new ConsumerBuilder<string, string>(conf).Build();
            consumer.Subscribe(topic);
            _log.LogInformation("Kafka consumer subscribed to {Topic} @ {Bootstrap}", topic, bootstrap);

            while (!lct.IsCancellationRequested)
            {
                try
                {
                    var cr = consumer.Consume(lct);
                    if (cr is null) continue;

                    var key = cr.Message.Key ?? "all";
                    var env = JsonSerializer.Deserialize<Envelope>(cr.Message.Value);
                    if (env is null) continue;

                    var payloadJson = env.payload.GetRawText();

                    if (key == "all")
                    {
                        await _hub.Clients.All.SendAsync("command", env.id, env.type, payloadJson, env.ttl, lct);
                        _log.LogInformation("Dispatched broadcast command id={Id} type={Type}", env.id, env.type);
                    }
                    else
                    {
                        await _hub.Clients.Group($"agent:{key}").SendAsync("command", env.id, env.type, payloadJson, env.ttl, lct);
                        _log.LogInformation("Dispatched command id={Id} to agent={Agent}", env.id, key);
                    }
                }
                catch (OperationCanceledException) when (lct.IsCancellationRequested) { break; }
                catch (Exception ex)
                {
                    _log.LogError(ex, "Error while consuming commands");
                    await Task.Delay(1000, lct);
                }
            }

            try { consumer.Close(); } catch { }
            _log.LogInformation("Kafka consumer stopped");
        }, lct);

        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken _)
    {
        try { _cts?.Cancel(); } catch { }
        if (_runner != null) { try { await _runner; } catch { } }
    }
}

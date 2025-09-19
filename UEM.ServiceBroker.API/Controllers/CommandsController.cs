using Confluent.Kafka;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace UEM.ServiceBroker.API.Controllers;

[ApiController]
[Route("api/commands")]
public class CommandsController : ControllerBase
{
    private readonly IConfiguration _cfg;
    public CommandsController(IConfiguration cfg) => _cfg = cfg;

    public record CommandDto(string agentId, string type, JsonElement payload);

    public record CommandResponseDto(string CommandId, string AgentId, string Output);

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CommandDto dto, CancellationToken ct)
    {
        var bootstrap = _cfg["Kafka:BootstrapServers"] ?? "localhost:9092";
        var topic = _cfg["Kafka:Topics:Commands"] ?? "uem.commands";

        using var producer = new ProducerBuilder<string, string>(new ProducerConfig
        {
            BootstrapServers = bootstrap,
            SocketKeepaliveEnable = true,
            BrokerAddressFamily = BrokerAddressFamily.V4
        }).Build();

        var key = string.IsNullOrWhiteSpace(dto.agentId) ? "all" : dto.agentId.Trim();
        var value = JsonSerializer.Serialize(new { id = Guid.NewGuid(), type = dto.type, payload = dto.payload, ttl = 120 });

        try
        {
            var dr = await producer.ProduceAsync(topic, new Message<string, string> { Key = key, Value = value }, ct);
            return Ok(new { ok = true, topic, partition = dr.Partition.Value, offset = dr.Offset.Value });
        }
        catch (Exception ex)
        {
            return Accepted(new { ok = false, queued = false, reason = ex.Message });
        }
    }

    [HttpPost("response")]
    public async Task<IActionResult> PostResponse([FromBody] CommandResponseDto dto, CancellationToken ct)
    {
        var bootstrap = _cfg["Kafka:BootstrapServers"] ?? "localhost:9092";
        var topic = _cfg["Kafka:Topics:CommandResponses"] ?? "uem.commands.responses";

        using var producer = new ProducerBuilder<string, string>(new ProducerConfig
        {
            BootstrapServers = bootstrap,
            SocketKeepaliveEnable = true,
            BrokerAddressFamily = BrokerAddressFamily.V4
        }).Build();

        var key = string.IsNullOrWhiteSpace(dto.CommandId) ? "unknown" : dto.CommandId.Trim();
        var value = JsonSerializer.Serialize(new { commandId = dto.CommandId, agentId = dto.AgentId, output = dto.Output });

        try
        {
            var dr = await producer.ProduceAsync(topic, new Message<string, string> { Key = key, Value = value }, ct);
            return Ok(new { ok = true, topic, partition = dr.Partition.Value, offset = dr.Offset.Value });
        }
        catch (Exception ex)
        {
            return Accepted(new { ok = false, queued = false, reason = ex.Message });
        }
    }
}

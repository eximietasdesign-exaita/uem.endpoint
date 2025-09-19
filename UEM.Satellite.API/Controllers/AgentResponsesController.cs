using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Services;

namespace UEM.Satellite.API.Controllers;

//[Authorize]
[ApiController]
[Route("api/agents/{agentId}/responses")]
public class AgentResponsesController : ControllerBase
{
    private readonly KafkaResponseProducer _producer;
    public AgentResponsesController(KafkaResponseProducer producer) => _producer = producer;

    public record AgentResponseDto(string commandId, string status, object? output, long? durationMs);

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Post(string agentId, [FromBody] AgentResponseDto dto, CancellationToken ct)
    {
        var payload = new
        {
            agentId,
            commandId = dto.commandId,
            status = dto.status,          // "ok" | "error"
            output = dto.output,
            durationMs = dto.durationMs,
            ts = DateTimeOffset.UtcNow
        };

        await _producer.PublishAsync(payload, key: agentId);
        return Ok(new { ok = true });
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Data;
using UEM.Satellite.API.Models;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/agents")]
public class HeartbeatsController : ControllerBase
{
    private readonly HeartbeatRepository _repo;
    private readonly ILogger<HeartbeatsController> _log;
    public HeartbeatsController(HeartbeatRepository repo, ILogger<HeartbeatsController> log)
    { _repo = repo; _log = log; }

    // Agent pushes heartbeat (body does NOT need AgentId; we take it from route)
    [HttpPost("{agentId}/heartbeat")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "agent")]
    public async Task<IActionResult> PostHeartbeat(string agentId, [FromBody] HeartbeatBody hb, CancellationToken ct)
    {
        var payload = new HeartbeatUpsert(
            AgentId: agentId,
            UniqueId: hb.UniqueId,
            SerialNumber: hb.SerialNumber,
            Hostname: hb.Hostname,
            IpAddress: hb.IpAddress,
            MacAddress: hb.MacAddress,
            AgentVersion: hb.AgentVersion
        );

        await _repo.UpsertAsync(payload, ct);
        _log.LogInformation("Heartbeat from {AgentId} host={Host} ip={Ip}", agentId, hb.Hostname, hb.IpAddress);
        return Ok(new { ok = true });
    }

    // UI reads latest
    [HttpGet("latest-heartbeats")]
    [AllowAnonymous] // lock down with admin auth in prod
    public async Task<ActionResult<IReadOnlyList<HeartbeatView>>> GetLatest(CancellationToken ct)
    {
        var rows = await _repo.ListLatestAsync(ct);

        return Ok(rows);
    }

    public record HeartbeatBody(
        string UniqueId,
        string? SerialNumber,
        string Hostname,
        string? IpAddress,
        string? MacAddress,
        string? AgentVersion
    );
}

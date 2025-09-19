using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using UEM.Satellite.API.Services;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/agents")]
public class AgentsController : ControllerBase
{
    private readonly TokenService _tokens;
    private readonly AgentRegistry _registry;

    public AgentsController(TokenService tokens, AgentRegistry registry)
    { _tokens = tokens; _registry = registry; }

    public record RegisterRequest([Required] string encryptedKey, [Required] string hardwareFingerprint);
    public record RegisterResponse(string agentId, string jwt, string refreshToken);

    // Called by agent
    [AllowAnonymous]
    [HttpPost("register")]
    public ActionResult<RegisterResponse> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.encryptedKey))
            return BadRequest("missing key");

        var agentId = MakeDeterministicId(req.hardwareFingerprint);
        _registry.UpsertRegistered(agentId); // track registration

        var jwt = _tokens.Issue(agentId);
        return Ok(new RegisterResponse(agentId, jwt, refreshToken: Guid.NewGuid().ToString("N")));
    }

    // Called by UI to list agents
    [AllowAnonymous]
    [HttpGet]
    public ActionResult<IEnumerable<AgentRegistry.AgentView>> List()
        => Ok(_registry.ListViews());

    [Authorize]
    [HttpGet("{agentId}/status")]
    public IActionResult Status(string agentId)
        => Ok(_registry.ToView(agentId));

    private static string MakeDeterministicId(string input)
    {
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return "uem-" + Convert.ToHexString(hash).ToLowerInvariant()[..32];
    }
}

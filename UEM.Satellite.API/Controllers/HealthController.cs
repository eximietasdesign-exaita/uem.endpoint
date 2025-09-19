using Microsoft.AspNetCore.Mvc;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { ok = true, ts = DateTime.UtcNow });
}

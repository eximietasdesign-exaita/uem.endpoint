using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Services;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    private readonly DiscoveryScriptPopulationService _scriptPopulationService;
    
    public HealthController(DiscoveryScriptPopulationService scriptPopulationService)
    {
        _scriptPopulationService = scriptPopulationService;
    }

    [HttpGet]
    public IActionResult Get() => Ok(new { ok = true, ts = DateTime.UtcNow });
    
    [HttpPost("populate-discovery-scripts")]
    public async Task<IActionResult> PopulateDiscoveryScripts()
    {
        try
        {
            await _scriptPopulationService.PopulateDiscoveryScriptsAsync();
            return Ok(new { 
                success = true, 
                message = "Discovery scripts populated successfully",
                timestamp = DateTime.UtcNow 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                success = false, 
                message = $"Failed to populate discovery scripts: {ex.Message}",
                timestamp = DateTime.UtcNow 
            });
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Data;
using Dapper;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/discovery-scripts")]
public class DiscoveryScriptsController : ControllerBase
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<DiscoveryScriptsController> _logger;

    public DiscoveryScriptsController(IDbFactory dbFactory, ILogger<DiscoveryScriptsController> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllScripts()
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var scripts = await connection.QueryAsync<DiscoveryScript>(@"
                SELECT 
                    id,
                    name,
                    description,
                    category,
                    type,
                    target_os,
                    template,
                    vendor,
                    complexity,
                    estimated_run_time_seconds,
                    requires_elevation,
                    requires_network,
                    parameters,
                    output_format,
                    output_processing,
                    credential_requirements,
                    tags,
                    industries,
                    compliance_frameworks,
                    version,
                    is_standard,
                    is_active,
                    created_at,
                    updated_at
                FROM discovery_scripts 
                WHERE is_active = TRUE
                ORDER BY created_at DESC
            ");

            return Ok(scripts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve discovery scripts");
            return StatusCode(500, new { error = "Failed to retrieve discovery scripts" });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetScript(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var script = await connection.QuerySingleOrDefaultAsync<DiscoveryScript>(@"
                SELECT 
                    id,
                    name,
                    description,
                    category,
                    type,
                    target_os,
                    template,
                    vendor,
                    complexity,
                    estimated_run_time_seconds,
                    requires_elevation,
                    requires_network,
                    parameters,
                    output_format,
                    output_processing,
                    credential_requirements,
                    tags,
                    industries,
                    compliance_frameworks,
                    version,
                    is_standard,
                    is_active,
                    created_at,
                    updated_at
                FROM discovery_scripts 
                WHERE id = @id AND is_active = TRUE
            ", new { id });

            if (script == null)
            {
                return NotFound(new { error = "Discovery script not found" });
            }

            return Ok(script);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve discovery script with id {Id}", id);
            return StatusCode(500, new { error = "Failed to retrieve discovery script" });
        }
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var categories = await connection.QueryAsync<string>(@"
                SELECT DISTINCT category 
                FROM discovery_scripts 
                WHERE is_active = TRUE AND category IS NOT NULL
                ORDER BY category
            ");

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve discovery script categories");
            return StatusCode(500, new { error = "Failed to retrieve categories" });
        }
    }

    [HttpGet("types")]
    public async Task<IActionResult> GetTypes()
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var types = await connection.QueryAsync<string>(@"
                SELECT DISTINCT type 
                FROM discovery_scripts 
                WHERE is_active = TRUE AND type IS NOT NULL
                ORDER BY type
            ");

            return Ok(types);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve discovery script types");
            return StatusCode(500, new { error = "Failed to retrieve types" });
        }
    }
}

public class DiscoveryScript
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Type { get; set; }
    public string? TargetOs { get; set; }
    public string? Template { get; set; }
    public string Vendor { get; set; } = "UEM Enterprise";
    public string Complexity { get; set; } = "Medium";
    public int EstimatedRunTimeSeconds { get; set; } = 30;
    public bool RequiresElevation { get; set; } = false;
    public bool RequiresNetwork { get; set; } = false;
    public object Parameters { get; set; } = new();
    public string OutputFormat { get; set; } = "JSON";
    public object OutputProcessing { get; set; } = new();
    public object CredentialRequirements { get; set; } = new();
    public string[]? Tags { get; set; }
    public string[]? Industries { get; set; }
    public string[]? ComplianceFrameworks { get; set; }
    public string Version { get; set; } = "1.0.0";
    public bool IsStandard { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
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

    [HttpPost]
    public async Task<IActionResult> CreateScript([FromBody] CreateDiscoveryScriptRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var insertSql = @"
                INSERT INTO discovery_scripts (
                    name, description, category, type, target_os, template, 
                    vendor, complexity, estimated_run_time_seconds, 
                    requires_elevation, requires_network, parameters, 
                    output_format, output_processing, credential_requirements,
                    tags, industries, compliance_frameworks, version, 
                    is_standard, is_active, created_at, updated_at
                ) VALUES (
                    @Name, @Description, @Category, @Type, @TargetOs, @Template,
                    @Vendor, @Complexity, @EstimatedRunTimeSeconds,
                    @RequiresElevation, @RequiresNetwork, @Parameters::jsonb,
                    @OutputFormat, @OutputProcessing::jsonb, @CredentialRequirements::jsonb,
                    @Tags, @Industries, @ComplianceFrameworks,
                    @Version, @IsStandard, @IsActive, @CreatedAt, @UpdatedAt
                ) 
                RETURNING id, name, description, category, type, target_os, template,
                         vendor, complexity, estimated_run_time_seconds,
                         requires_elevation, requires_network, parameters,
                         output_format, output_processing, credential_requirements,
                         tags, industries, compliance_frameworks, version,
                         is_standard, is_active, created_at, updated_at";

            var now = DateTime.UtcNow;
            var newScript = await connection.QuerySingleAsync<DiscoveryScript>(insertSql, new 
            {
                request.Name,
                request.Description,
                request.Category,
                request.Type,
                request.TargetOs,
                request.Template,
                Vendor = request.Vendor ?? "Custom",
                Complexity = request.Complexity ?? "medium", 
                EstimatedRunTimeSeconds = request.EstimatedRunTimeSeconds ?? 30,
                RequiresElevation = request.RequiresElevation ?? false,
                RequiresNetwork = request.RequiresNetwork ?? false,
                Parameters = request.Parameters ?? "{}",
                OutputFormat = request.OutputFormat ?? "json",
                OutputProcessing = request.OutputProcessing ?? "null",
                CredentialRequirements = request.CredentialRequirements ?? "null",
                Tags = request.Tags ?? new string[0],
                Industries = request.Industries ?? new string[0],
                ComplianceFrameworks = request.ComplianceFrameworks,
                Version = request.Version ?? "1.0",
                IsStandard = request.IsStandard ?? false,
                IsActive = request.IsActive ?? true,
                CreatedAt = now,
                UpdatedAt = now
            });

            _logger.LogInformation("Created new discovery script: {ScriptName} (ID: {ScriptId})", newScript.Name, newScript.Id);
            return CreatedAtAction(nameof(GetScript), new { id = newScript.Id }, newScript);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create discovery script");
            return StatusCode(500, new { error = "Failed to create discovery script" });
        }
    }

    [HttpPut("{id}")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateScript(int id, [FromBody] CreateDiscoveryScriptRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var updateSql = @"
                UPDATE discovery_scripts SET 
                    name = @Name,
                    description = @Description,
                    category = @Category,
                    type = @Type,
                    target_os = @TargetOs,
                    template = @Template,
                    vendor = @Vendor,
                    complexity = @Complexity,
                    estimated_run_time_seconds = @EstimatedRunTimeSeconds,
                    requires_elevation = @RequiresElevation,
                    requires_network = @RequiresNetwork,
                    parameters = @Parameters::jsonb,
                    output_format = @OutputFormat,
                    output_processing = @OutputProcessing::jsonb,
                    credential_requirements = @CredentialRequirements::jsonb,
                    tags = @Tags,
                    industries = @Industries,
                    compliance_frameworks = @ComplianceFrameworks,
                    version = @Version,
                    is_standard = @IsStandard,
                    is_active = @IsActive,
                    updated_at = @UpdatedAt
                WHERE id = @Id AND is_active = TRUE
                RETURNING id, name, description, category, type, target_os, template,
                         vendor, complexity, estimated_run_time_seconds,
                         requires_elevation, requires_network, parameters,
                         output_format, output_processing, credential_requirements,
                         tags, industries, compliance_frameworks, version,
                         is_standard, is_active, created_at, updated_at";

            var updatedScript = await connection.QuerySingleOrDefaultAsync<DiscoveryScript>(updateSql, new 
            {
                Id = id,
                request.Name,
                request.Description,
                request.Category,
                request.Type,
                request.TargetOs,
                request.Template,
                Vendor = request.Vendor ?? "Custom",
                Complexity = request.Complexity ?? "medium",
                EstimatedRunTimeSeconds = request.EstimatedRunTimeSeconds ?? 30,
                RequiresElevation = request.RequiresElevation ?? false,
                RequiresNetwork = request.RequiresNetwork ?? false,
                Parameters = request.Parameters ?? "{}",
                OutputFormat = request.OutputFormat ?? "json",
                OutputProcessing = request.OutputProcessing ?? "null",
                CredentialRequirements = request.CredentialRequirements ?? "null",
                Tags = request.Tags ?? new string[0],
                Industries = request.Industries ?? new string[0],
                ComplianceFrameworks = request.ComplianceFrameworks,
                Version = request.Version ?? "1.0",
                IsStandard = request.IsStandard ?? false,
                IsActive = request.IsActive ?? true,
                UpdatedAt = DateTime.UtcNow
            });

            if (updatedScript == null)
            {
                return NotFound(new { error = "Discovery script not found" });
            }

            _logger.LogInformation("Updated discovery script: {ScriptName} (ID: {ScriptId})", updatedScript.Name, updatedScript.Id);
            return Ok(updatedScript);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update discovery script with id {Id}", id);
            return StatusCode(500, new { error = "Failed to update discovery script" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteScript(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var deleteResult = await connection.ExecuteAsync(@"
                UPDATE discovery_scripts 
                SET is_active = FALSE, updated_at = @UpdatedAt
                WHERE id = @Id AND is_active = TRUE
            ", new { Id = id, UpdatedAt = DateTime.UtcNow });

            if (deleteResult == 0)
            {
                return NotFound(new { error = "Discovery script not found" });
            }

            _logger.LogInformation("Deleted discovery script with id {ScriptId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete discovery script with id {Id}", id);
            return StatusCode(500, new { error = "Failed to delete discovery script" });
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

public class CreateDiscoveryScriptRequest
{
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Type { get; set; }
    public string? TargetOs { get; set; }
    public string? Template { get; set; }
    public string? Vendor { get; set; }
    public string? Complexity { get; set; }
    public int? EstimatedRunTimeSeconds { get; set; }
    public bool? RequiresElevation { get; set; }
    public bool? RequiresNetwork { get; set; }
    public string? Parameters { get; set; }
    public string? OutputFormat { get; set; }
    public string? OutputProcessing { get; set; }
    public string? CredentialRequirements { get; set; }
    public string[]? Tags { get; set; }
    public string[]? Industries { get; set; }
    public string[]? ComplianceFrameworks { get; set; }
    public string? Version { get; set; }
    public bool? IsStandard { get; set; }
    public bool? IsActive { get; set; }
}
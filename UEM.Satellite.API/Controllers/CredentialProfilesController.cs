using Microsoft.AspNetCore.Mvc;
using Dapper;
using UEM.Satellite.API.Data;
using System.Text.Json;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/credential-profiles")]
public class CredentialProfilesController : ControllerBase
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<CredentialProfilesController> _logger;

    public CredentialProfilesController(IDbFactory dbFactory, ILogger<CredentialProfilesController> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetCredentialProfiles()
    {
        try
        {
            using var connection = _dbFactory.Open();
            var profiles = await connection.QueryAsync<object>(@"
                SELECT 
                    id,
                    name,
                    description,
                    type,
                    credentials as ""credentialsLegacy"",
                    is_active as ""isActive"",
                    usage_count as ""usageCount"",
                    last_used as ""lastUsed"",
                    created_by as ""createdBy"",
                    created_at as ""createdAt"",
                    updated_at as ""updatedAt"",
                    domain_id as ""domainId"",
                    tenant_id as ""tenantId"",
                    scope,
                    category,
                    encryption_level as ""encryptionLevel"",
                    compliance_level as ""complianceLevel"",
                    access_level as ""accessLevel"",
                    vault_provider as ""vaultProvider"",
                    vault_path as ""vaultPath"",
                    storage_type as ""storageType"",
                    local_encryption as ""localEncryption"",
                    audit_level as ""auditLevel"",
                    monitoring_enabled as ""monitoringEnabled"",
                    alerting_enabled as ""alertingEnabled"",
                    tags,
                    environments,
                    last_rotated as ""lastRotated"",
                    expires_at as ""expiresAt""
                FROM uem_app_credential_profiles
                ORDER BY created_at DESC");
            
            return Ok(profiles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch credential profiles");
            return StatusCode(500, new { message = "Failed to fetch credential profiles" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetCredentialProfile(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var profile = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT 
                    id,
                    name,
                    description,
                    type,
                    credentials as ""credentialsLegacy"",
                    is_active as ""isActive"",
                    usage_count as ""usageCount"",
                    last_used as ""lastUsed"",
                    created_by as ""createdBy"",
                    created_at as ""createdAt"",
                    updated_at as ""updatedAt"",
                    domain_id as ""domainId"",
                    tenant_id as ""tenantId"",
                    scope,
                    category,
                    encryption_level as ""encryptionLevel"",
                    compliance_level as ""complianceLevel"",
                    access_level as ""accessLevel"",
                    vault_provider as ""vaultProvider"",
                    vault_path as ""vaultPath"",
                    storage_type as ""storageType"",
                    local_encryption as ""localEncryption"",
                    audit_level as ""auditLevel"",
                    monitoring_enabled as ""monitoringEnabled"",
                    alerting_enabled as ""alertingEnabled"",
                    tags,
                    environments,
                    last_rotated as ""lastRotated"",
                    expires_at as ""expiresAt""
                FROM uem_app_credential_profiles
                WHERE id = @Id", new { Id = id });

            if (profile == null)
                return NotFound(new { message = "Credential profile not found" });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch credential profile with id {Id}", id);
            return StatusCode(500, new { message = "Failed to fetch credential profile" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateCredentialProfile([FromBody] CreateCredentialProfileRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var profile = await connection.QueryFirstAsync<object>(@"
                INSERT INTO uem_app_credential_profiles 
                (name, description, type, credentials, is_active, usage_count, created_at, updated_at, storage_type, encryption_level, audit_level, monitoring_enabled, alerting_enabled)
                VALUES (@Name, @Description, 'general', @Credentials::jsonb, true, 0, NOW(), NOW(), 'encrypted', 'aes256', 'standard', true, false)
                RETURNING 
                    id,
                    name,
                    description,
                    type,
                    credentials as ""credentialsLegacy"",
                    is_active as ""isActive"",
                    usage_count as ""usageCount"",
                    created_at as ""createdAt"",
                    updated_at as ""updatedAt""", 
                new 
                { 
                    request.Name, 
                    request.Description,
                    request.Credentials
                });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create credential profile");
            return StatusCode(500, new { message = "Failed to create credential profile" });
        }
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<object>> UpdateCredentialProfile(int id, [FromBody] UpdateCredentialProfileRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var setClauses = new List<string>();
            var parameters = new DynamicParameters();
            parameters.Add("Id", id);

            if (!string.IsNullOrEmpty(request.Name))
            {
                setClauses.Add("name = @Name");
                parameters.Add("Name", request.Name);
            }

            if (request.Description != null)
            {
                setClauses.Add("description = @Description");
                parameters.Add("Description", request.Description);
            }

            if (request.Credentials != null)
            {
                setClauses.Add("credentials = @Credentials::jsonb");
                parameters.Add("Credentials", request.Credentials);
            }

            if (setClauses.Count == 0)
                return BadRequest(new { message = "No fields to update" });

            setClauses.Add("updated_at = NOW()");

            var sql = $@"
                UPDATE uem_app_credential_profiles 
                SET {string.Join(", ", setClauses)}
                WHERE id = @Id
                RETURNING 
                    id,
                    name,
                    description,
                    type,
                    credentials as ""credentialsLegacy"",
                    is_active as ""isActive"",
                    usage_count as ""usageCount"",
                    updated_at as ""updatedAt""";

            var profile = await connection.QueryFirstOrDefaultAsync<object>(sql, parameters);

            if (profile == null)
                return NotFound(new { message = "Credential profile not found" });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update credential profile with id {Id}", id);
            return StatusCode(500, new { message = "Failed to update credential profile" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCredentialProfile(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var deleted = await connection.ExecuteAsync(@"
                DELETE FROM uem_app_credential_profiles 
                WHERE id = @Id", new { Id = id });

            if (deleted == 0)
                return NotFound(new { message = "Credential profile not found" });

            return Ok(new { message = "Credential profile deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete credential profile with id {Id}", id);
            return StatusCode(500, new { message = "Failed to delete credential profile" });
        }
    }
}

public record CreateCredentialProfileRequest(
    string Name,
    string? Description,
    string Credentials
);

public record UpdateCredentialProfileRequest(
    string? Name,
    string? Description,
    string? Credentials
);

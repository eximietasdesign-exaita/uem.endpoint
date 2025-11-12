using Microsoft.AspNetCore.Mvc;
using Dapper;
using UEM.Satellite.API.Data;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Data;

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

    // Helper: ensure credentials JSON is returned as an object (not raw string)
    private object? NormalizeJson(object? raw, string fieldName = "unknown")
    {
        _logger.LogInformation("NormalizeJson called for field: {FieldName}, raw type: {RawType}, raw value: {RawValue}", 
            fieldName, 
            raw?.GetType().Name ?? "null", 
            raw?.ToString() ?? "null");

        if (raw == null)
        {
            _logger.LogInformation("NormalizeJson: returning null for field {FieldName}", fieldName);
            return null;
        }

        try
        {
            // If the DB driver returned JsonDocument/JsonElement, return as-is
            if (raw is System.Text.Json.JsonElement je)
            {
                _logger.LogInformation("NormalizeJson: field {FieldName} is JsonElement with ValueKind: {ValueKind}", 
                    fieldName, je.ValueKind);
                
                if (je.ValueKind == JsonValueKind.Undefined || je.ValueKind == JsonValueKind.Null)
                {
                    _logger.LogInformation("NormalizeJson: JsonElement is Undefined or Null, returning null");
                    return null;
                }
                
                var deserialized = JsonSerializer.Deserialize<object>(je.GetRawText());
                _logger.LogInformation("NormalizeJson: deserialized JsonElement to: {Result}", 
                    JsonSerializer.Serialize(deserialized));
                return deserialized;
            }

            var s = raw as string ?? raw.ToString();
            _logger.LogInformation("NormalizeJson: field {FieldName} converted to string: {StringValue}", 
                fieldName, s);

            if (string.IsNullOrWhiteSpace(s))
            {
                _logger.LogInformation("NormalizeJson: string is null or whitespace, returning null");
                return null;
            }

            // Try parse JSON string to object
            var parsed = JsonSerializer.Deserialize<object>(s);
            _logger.LogInformation("NormalizeJson: successfully parsed string to object: {Result}", 
                JsonSerializer.Serialize(parsed));
            return parsed;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "NormalizeJson: failed to parse field {FieldName}, returning raw string", fieldName);
            return raw.ToString();
        }
    }

    // Safe type conversion helpers to avoid InvalidCastException from dynamic rows
    private static int ToInt(object? v, int def = 0)
    {
        if (v == null) return def;
        try { return Convert.ToInt32(v); } catch { return def; }
    }

    private static int? ToNullableInt(object? v)
    {
        if (v == null) return null;
        try { return Convert.ToInt32(v); } catch { return null; }
    }

    private static bool ToBool(object? v, bool def = false)
    {
        if (v == null) return def;
        try { return Convert.ToBoolean(v); } catch { return def; }
    }

    private static string ToStringSafe(object? v)
    {
        if (v == null) return string.Empty;
        try { return v.ToString() ?? string.Empty; } catch { return string.Empty; }
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetCredentialProfiles()
    {
        try
        {
            using var connection = _dbFactory.Open();
            var rows = await connection.QueryAsync<dynamic>(@"
                 SELECT 
                     id,
                     name,
                     description,
                     type,
                     credentials,
                     is_active,
                     usage_count,
                     last_used,
                     created_by,
                     created_at,
                     updated_at,
                     domain_id,
                     tenant_id,
                     scope,
                     category,
                     encryption_level,
                     compliance_level,
                     access_level,
                     vault_provider,
                     vault_path,
                     storage_type,
                     local_encryption,
                     audit_level,
                     monitoring_enabled,
                     alerting_enabled,
                     tags,
                     environments,
                     last_rotated,
                     expires_at
                 FROM uem_app_credential_profiles
                 ORDER BY created_at DESC");

            var list = new List<object>();
            foreach (var r in rows)
            {
                object? credObj = null;
                try
                {
                    credObj = NormalizeJson(r.credentials, $"credentials-id-{r.id}");
                }
                catch (Exception je)
                {
                    _logger.LogWarning(je, "GetCredentialProfiles: failed to parse credentials for id {Id}", (object)r.id);
                    credObj = null;
                }

                list.Add(new
                {
                    id = ToInt(r.id),
                    name = ToStringSafe(r.name),
                    description = ToStringSafe(r.description),
                    type = ToStringSafe(r.type) == string.Empty ? "general" : ToStringSafe(r.type),
                    credentials = credObj,
                    isActive = ToBool(r.is_active, true),
                    usageCount = ToInt(r.usage_count, 0),
                    lastUsed = r.last_used,
                    createdBy = ToNullableInt(r.created_by),
                    createdAt = r.created_at,
                    updatedAt = r.updated_at,
                    domainId = ToNullableInt(r.domain_id),
                    tenantId = ToNullableInt(r.tenant_id),
                    scope = r.scope,
                    category = r.category,
                    encryptionLevel = r.encryption_level,
                    complianceLevel = r.compliance_level,
                    accessLevel = r.access_level,
                    vaultProvider = r.vault_provider,
                    vaultPath = r.vault_path,
                    storageType = r.storage_type,
                    localEncryption = r.local_encryption,
                    rotationPolicy = NormalizeJson(r.rotation_policy, $"rotation_policy-id-{r.id}"),
                    accessRestrictions = NormalizeJson(r.access_restrictions, $"access_restrictions-id-{r.id}"),
                    auditLevel = r.audit_level,
                    monitoringEnabled = r.monitoring_enabled,
                    alertingEnabled = r.alerting_enabled,
                    tags = NormalizeJson(r.tags, $"tags-id-{r.id}"),
                    environments = NormalizeJson(r.environments, $"environments-id-{r.id}"),
                    lastRotated = r.last_rotated,
                    expiresAt = r.expires_at
                } as object);
            }

            _logger.LogInformation("GetCredentialProfiles: returning {Count} profiles", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetCredentialProfiles: failed to fetch credential profiles");
            return StatusCode(500, new { message = "Failed to fetch credential profiles", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetCredentialProfile(int id)
    {
        _logger.LogInformation("GetCredentialProfile: Fetching profile with id: {Id}", id);

        try
        {
            using var connection = _dbFactory.Open();
            var row = await connection.QueryFirstOrDefaultAsync<dynamic>(@"
     SELECT 
         id,
         name,
         description,
         type,
         credentials,
         is_active,
         usage_count,
         last_used,
         created_by,
         created_at,
         updated_at,
         domain_id,
         tenant_id,
         scope,
         category,
         encryption_level,
         compliance_level,
         access_level,
         vault_provider,
         vault_path,
         vault_namespace,
         vault_role,
         storage_type,
         local_encryption,
         rotation_policy,
         access_restrictions,
         audit_level,
         monitoring_enabled,
         alerting_enabled,
         tags,
         environments,
         last_rotated,
         expires_at,
         updated_by
     FROM uem_app_credential_profiles
     WHERE id = @Id", new { Id = id });

            if (row == null)
            {
                _logger.LogWarning("GetCredentialProfile: Profile not found for id: {Id}", id);
                return NotFound(new { message = "Credential profile not found" });
            }

            _logger.LogInformation("GetCredentialProfile: Found profile, processing credentials");

            var credObj = NormalizeJson(row.credentials, $"credentials-id-{id}");
            var profile = new
            {
                id = ToInt(row.id),
                name = ToStringSafe(row.name),
                description = ToStringSafe(row.description),
                type = ToStringSafe(row.type) == string.Empty ? "general" : ToStringSafe(row.type),
                credentials = credObj,
                isActive = ToBool(row.is_active, true),
                usageCount = ToInt(row.usage_count, 0),
                lastUsed = row.last_used,
                createdBy = ToNullableInt(row.created_by),
                createdAt = row.created_at,
                updatedAt = row.updated_at,
                domainId = ToNullableInt(row.domain_id),
                tenantId = ToNullableInt(row.tenant_id),
                scope = row.scope,
                category = row.category,
                encryptionLevel = row.encryption_level,
                complianceLevel = row.compliance_level,
                accessLevel = row.access_level,
                vaultProvider = row.vault_provider,
                vaultPath = row.vault_path,
                storageType = row.storage_type,
                localEncryption = row.local_encryption,
                rotationPolicy = NormalizeJson(row.rotation_policy, $"rotation_policy-id-{id}"),
                accessRestrictions = NormalizeJson(row.access_restrictions, $"access_restrictions-id-{id}"),
                auditLevel = row.audit_level,
                monitoringEnabled = row.monitoring_enabled,
                alertingEnabled = row.alerting_enabled,
                tags = NormalizeJson(row.tags, $"tags-id-{id}"),
                environments = NormalizeJson(row.environments, $"environments-id-{id}"),
                lastRotated = row.last_rotated,
                expiresAt = row.expires_at
            };

            _logger.LogInformation("GetCredentialProfile: Returning profile: {Profile}", JsonSerializer.Serialize(profile));

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetCredentialProfile: Failed to fetch credential profile with id {Id}", id);
            return StatusCode(500, new { message = "Failed to fetch credential profile", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateCredentialProfile([FromBody] CreateCredentialProfileRequest request)
    {
        _logger.LogInformation("CreateCredentialProfile: Creating new profile with name: {Name}", request.Name);
        _logger.LogInformation("CreateCredentialProfile: Credentials received: {Credentials}", request.Credentials);

        try
        {
            using var connection = _dbFactory.Open();
            var row = await connection.QueryFirstAsync<dynamic>(@"
     INSERT INTO uem_app_credential_profiles 
     (name, description, type, credentials, is_active, usage_count, created_at, updated_at, storage_type, encryption_level, audit_level, monitoring_enabled, alerting_enabled)
     VALUES (@Name, @Description, 'general', @Credentials::jsonb, true, 0, NOW(), NOW(), 'encrypted', 'aes256', 'standard', true, false)
     RETURNING id, name, description, type, credentials, is_active, usage_count, created_at, updated_at", new { request.Name, request.Description, request.Credentials });

            _logger.LogInformation("CreateCredentialProfile: Profile created with id: {Id}", (object)row.id);

            var credObj = NormalizeJson(row.credentials, "credentials-create");
            var created = new
            {
                id = ToInt(row.id),
                name = ToStringSafe(row.name),
                description = ToStringSafe(row.description),
                type = ToStringSafe(row.type) ?? "general",
                credentials = credObj,
                isActive = ToBool(row.is_active, true),
                usageCount = ToInt(row.usage_count, 0),
                createdAt = row.created_at,
                updatedAt = row.updated_at
            };

            _logger.LogInformation("CreateCredentialProfile: Returning created profile: {Profile}", 
                JsonSerializer.Serialize(created));

            return Ok(created);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateCredentialProfile: Failed to create credential profile");
            return StatusCode(500, new { message = "Failed to create credential profile", error = ex.Message });
        }
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<object>> UpdateCredentialProfile(int id, [FromBody] UpdateCredentialProfileRequest request)
    {
        _logger.LogInformation("UpdateCredentialProfile: Updating profile id: {Id}", id);
        _logger.LogInformation("UpdateCredentialProfile: Request - Name: {Name}, Description: {Description}, Credentials: {Credentials}", 
            request.Name, request.Description, request.Credentials);

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
                _logger.LogInformation("UpdateCredentialProfile: Will update name");
            }

            if (request.Description != null)
            {
                setClauses.Add("description = @Description");
                parameters.Add("Description", request.Description);
                _logger.LogInformation("UpdateCredentialProfile: Will update description");
            }

            if (request.Credentials != null)
            {
                setClauses.Add("credentials = @Credentials::jsonb");
                parameters.Add("Credentials", request.Credentials);
                _logger.LogInformation("UpdateCredentialProfile: Will update credentials: {Credentials}", request.Credentials);
            }

            if (setClauses.Count == 0)
            {
                _logger.LogWarning("UpdateCredentialProfile: No fields to update");
                return BadRequest(new { message = "No fields to update" });
            }

            setClauses.Add("updated_at = NOW()");

            var sql = $@"
     UPDATE uem_app_credential_profiles 
     SET {string.Join(", ", setClauses)}
     WHERE id = @Id
     RETURNING id, name, description, type, credentials, is_active, usage_count, updated_at";

            _logger.LogInformation("UpdateCredentialProfile: Executing SQL: {Sql}", sql);

            var row = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, parameters);

            if (row == null)
            {
                _logger.LogWarning("UpdateCredentialProfile: Profile not found for id: {Id}", id);
                return NotFound(new { message = "Credential profile not found" });
            }

            _logger.LogInformation("UpdateCredentialProfile: Profile updated successfully");

            var credObj = NormalizeJson(row.credentials, $"credentials-update-{id}");
            var profile = new
            {
                id = ToInt(row.id),
                name = ToStringSafe(row.name),
                description = ToStringSafe(row.description),
                type = ToStringSafe(row.type) ?? "general",
                credentials = credObj,
                isActive = ToBool(row.is_active, true),
                usageCount = ToInt(row.usage_count, 0),
                updatedAt = row.updated_at
            };

            _logger.LogInformation("UpdateCredentialProfile: Returning updated profile: {Profile}", 
                JsonSerializer.Serialize(profile));

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateCredentialProfile: Failed to update credential profile with id {Id}", id);
            return StatusCode(500, new { message = "Failed to update credential profile", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCredentialProfile(int id)
    {
        _logger.LogInformation("DeleteCredentialProfile: Deleting profile id: {Id}", id);

        try
        {
            using var connection = _dbFactory.Open();
            var deleted = await connection.ExecuteAsync(@"
                DELETE FROM uem_app_credential_profiles 
                WHERE id = @Id", new { Id = id });

            if (deleted == 0)
            {
                _logger.LogWarning("DeleteCredentialProfile: Profile not found for id: {Id}", id);
                return NotFound(new { message = "Credential profile not found" });
            }

            _logger.LogInformation("DeleteCredentialProfile: Profile deleted successfully, id: {Id}", id);
            return Ok(new { message = "Credential profile deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DeleteCredentialProfile: Failed to delete credential profile with id {Id}", id);
            return StatusCode(500, new { message = "Failed to delete credential profile", error = ex.Message });
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
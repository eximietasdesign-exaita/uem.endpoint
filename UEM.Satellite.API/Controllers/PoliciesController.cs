using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Data;
using Dapper;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
using System;
using System.Linq;
using System.Collections.Generic;
using UEM.Satellite.API.Models;

namespace UEM.Satellite.API.Controllers
{
    [ApiController]
    [Route("api/script-policies")] // frontend expects /api/script-policies
    public class PoliciesController : ControllerBase
    {
        private readonly IDbFactory _dbFactory;
        private readonly ILogger<PoliciesController> _logger;

        public PoliciesController(IDbFactory dbFactory, ILogger<PoliciesController> logger)
        {
            _dbFactory = dbFactory;
            _logger = logger;
        }

        #region DTO for Create/Update
        
        public class PolicyPayload
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public string? Category { get; set; }
            public string? TargetOs { get; set; }
            public string? PublishStatus { get; set; }
            public int ExecutionOrder { get; set; }
            public bool IsActive { get; set; }
            public string Version { get; set; } = "1.0.0";
            public string? Scope { get; set; }
            public string? PublishScope { get; set; }
            public List<string>? AvailableScripts { get; set; }
            public JsonElement ExecutionFlow { get; set; } // Accept raw JSON for flexibility
        }
        
        #endregion

        /// <summary>
        /// GET /api/script-policies[?ids=1,2,3]
        /// Returns rows from uem_app_policies. If ids query provided, filters by those ids.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string? ids = null, CancellationToken cancellationToken = default)
        {
            try
            {
                using var conn = _dbFactory.Open();

                var sql = @"
                    SELECT
                        id,
                        name,
                        description,
                        category,
                        target_os,
                        available_scripts,
                        execution_flow,
                        publish_status,
                        is_active,
                        execution_order,
                        created_at,
                        updated_at
                    FROM uem_app_policies
                    /**WHERE**/
                    ORDER BY updated_at DESC;
                ";

                var parameters = new DynamicParameters();
                if (!string.IsNullOrWhiteSpace(ids))
                {
                    var idList = ids.Split(',').Select(x => int.TryParse(x.Trim(), out var i) ? i : -1).Where(i => i > 0).ToArray();
                    if (idList.Length == 0) return Ok(Array.Empty<object>());
                    sql = sql.Replace("/**WHERE**/", "WHERE id = ANY(@Ids)");
                    parameters.Add("Ids", idList);
                }
                else
                {
                    sql = sql.Replace("/**WHERE**/", "");
                }

                var rows = await conn.QueryAsync(sql, parameters, commandTimeout: 30, commandType: System.Data.CommandType.Text);
                var list = rows.Select(r => new
                {
                    id = (int)r.id,
                    name = r.name as string ?? string.Empty,
                    description = r.description as string ?? string.Empty,
                    category = r.category as string ?? string.Empty,
                    targetOs = r.target_os as string ?? "Any",
                    availableScripts = r.available_scripts,
                    executionFlow = r.execution_flow,
                    publishStatus = r.publish_status as string ?? "published",
                    isActive = r.is_active == true,
                    executionOrder = r.execution_order ?? 0,
                    createdAt = r.created_at,
                    updatedAt = r.updated_at
                }).ToList();

                _logger.LogInformation("Retrieved {Count} policies from uem_app_policies.", list.Count);
                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve policies.");
                return StatusCode(500, new { error = "An internal server error occurred." });
            }
        }

        /// <summary>
        /// Creates a new policy in the uem_app_policies table.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreatePolicy([FromBody] PolicyPayload payload, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(payload?.Name)) 
                return BadRequest(new { error = "Policy name is required." });

            try
            {
                using var conn = _dbFactory.Open();
                
                const string sql = @"
                    INSERT INTO uem_app_policies (
                        name, description, category, target_os, publish_status, execution_order, is_active, 
                        version, scope, publish_scope, available_scripts, execution_flow, created_at, updated_at
                    ) VALUES (
                        @Name, @Description, @Category, @TargetOs, @PublishStatus, @ExecutionOrder, @IsActive, 
                        @Version, @Scope, @PublishScope, @AvailableScripts::jsonb, @ExecutionFlow::jsonb, NOW(), NOW()
                    )
                    RETURNING id;
                ";

                var newId = await conn.ExecuteScalarAsync<int>(new CommandDefinition(sql, new 
                {
                    payload.Name,
                    payload.Description,
                    payload.Category,
                    TargetOs = payload.TargetOs,
                    PublishStatus = payload.PublishStatus,
                    payload.ExecutionOrder,
                    payload.IsActive,
                    payload.Version,
                    payload.Scope,
                    payload.PublishScope,
                    // Serialize the C# List<string> to a JSON array string
                    AvailableScripts = JsonSerializer.Serialize(payload.AvailableScripts ?? new List<string>()),
                    // Pass the raw JSON string from the JsonElement for the database to handle
                    ExecutionFlow = JsonSerializer.Serialize(payload.ExecutionFlow)
                }, cancellationToken: cancellationToken));
                
                _logger.LogInformation("Successfully created policy with ID {PolicyId}.", newId);
                
                return CreatedAtAction(nameof(Get), new { id = newId }, new { id = newId });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create new policy '{PolicyName}'.", payload.Name);
                return StatusCode(500, new { error = "An internal server error occurred while creating the policy." });
            }
        }

        /// <summary>
        /// PATCH /api/script-policies/{id}
        /// Partial update of a policy. Accepts PascalCase or snake_case JSON keys.
        /// Supports updating JSONB columns (available_scripts, execution_flow) by passing JSON arrays/objects.
        /// </summary>
        [HttpPatch("{id}")]
        public async Task<IActionResult> PatchPolicy(int id, [FromBody] JsonElement payload, CancellationToken cancellationToken = default)
        {
            if (payload.ValueKind != JsonValueKind.Object)
                return BadRequest(new { error = "Invalid payload, expected JSON object." });

            try
            {
                using var conn = _dbFactory.Open();

                var sets = new List<string>();
                var parameters = new DynamicParameters();
                parameters.Add("Id", id);

                static string? GetString(JsonElement obj, string[] keys)
                {
                    foreach (var k in keys)
                    {
                        if (obj.TryGetProperty(k, out var v) && v.ValueKind != JsonValueKind.Null)
                            return v.ValueKind == JsonValueKind.String ? v.GetString() : v.ToString();
                    }
                    return null;
                }

                static int? GetInt(JsonElement obj, string[] keys)
                {
                    foreach (var k in keys)
                    {
                        if (obj.TryGetProperty(k, out var v) && v.ValueKind == JsonValueKind.Number)
                            return v.GetInt32();
                        if (obj.TryGetProperty(k, out v) && v.ValueKind == JsonValueKind.String && int.TryParse(v.GetString(), out var i))
                            return i;
                    }
                    return null;
                }

                static bool? GetBool(JsonElement obj, string[] keys)
                {
                    foreach (var k in keys)
                    {
                        if (obj.TryGetProperty(k, out var v))
                        {
                            if (v.ValueKind == JsonValueKind.True) return true;
                            if (v.ValueKind == JsonValueKind.False) return false;
                            if (v.ValueKind == JsonValueKind.String && bool.TryParse(v.GetString(), out var b)) return b;
                        }
                    }
                    return null;
                }

                // string fields
                if (GetString(payload, new[] { "name", "Name" }) is string name)
                {
                    sets.Add("name = @Name");
                    parameters.Add("Name", name.Trim());
                }
                if (GetString(payload, new[] { "description", "Description" }) is string desc)
                {
                    sets.Add("description = @Description");
                    parameters.Add("Description", desc);
                }
                if (GetString(payload, new[] { "category", "Category" }) is string cat)
                {
                    sets.Add("category = @Category");
                    parameters.Add("Category", cat);
                }
                if (GetString(payload, new[] { "target_os", "targetOs", "TargetOs" }) is string to)
                {
                    sets.Add("target_os = @TargetOs");
                    parameters.Add("TargetOs", to);
                }
                if (GetString(payload, new[] { "publish_status", "publishStatus", "PublishStatus" }) is string ps)
                {
                    sets.Add("publish_status = @PublishStatus");
                    parameters.Add("PublishStatus", ps);
                }
                if (GetString(payload, new[] { "version", "Version" }) is string ver)
                {
                    sets.Add("version = @Version");
                    parameters.Add("Version", ver);
                }
                if (GetString(payload, new[] { "scope", "Scope" }) is string scope)
                {
                    sets.Add("scope = @Scope");
                    parameters.Add("Scope", scope);
                }
                if (GetString(payload, new[] { "publish_scope", "publishScope", "PublishScope" }) is string pubscope)
                {
                    sets.Add("publish_scope = @PublishScope");
                    parameters.Add("PublishScope", pubscope);
                }

                // numeric
                if (GetInt(payload, new[] { "execution_order", "executionOrder", "ExecutionOrder" }) is int execOrder)
                {
                    sets.Add("execution_order = @ExecutionOrder");
                    parameters.Add("ExecutionOrder", execOrder);
                }

                // boolean
                if (GetBool(payload, new[] { "is_active", "isActive", "IsActive" }) is bool isActive)
                {
                    sets.Add("is_active = @IsActive");
                    parameters.Add("IsActive", isActive);
                }

                // JSONB fields: available_scripts (array of strings/nums) and execution_flow (array of objects)
                if (payload.TryGetProperty("available_scripts", out var pAvailable) || payload.TryGetProperty("AvailableScripts", out pAvailable))
                {
                    // serialize whatever was sent into a JSON array string
                    var serialized = JsonSerializer.Serialize(pAvailable);
                    sets.Add("available_scripts = @AvailableScripts::jsonb");
                    parameters.Add("AvailableScripts", serialized);
                }
                if (payload.TryGetProperty("execution_flow", out var pFlow) || payload.TryGetProperty("ExecutionFlow", out pFlow))
                {
                    var serialized = JsonSerializer.Serialize(pFlow);
                    sets.Add("execution_flow = @ExecutionFlow::jsonb");
                    parameters.Add("ExecutionFlow", serialized);
                }

                if (!sets.Any())
                    return BadRequest(new { error = "No updatable fields provided." });

                var sql = $@"
                    UPDATE uem_app_policies
                    SET {string.Join(", ", sets)}, updated_at = NOW()
                    WHERE id = @Id
                    RETURNING id, name, description, category, target_os, available_scripts, execution_flow, publish_status, is_active, execution_order, version, scope, publish_scope, created_at, updated_at;
                ";

                var updated = await conn.QuerySingleOrDefaultAsync(sql, parameters);
                if (updated == null)
                {
                    return NotFound(new { error = "Policy not found." });
                }

                _logger.LogInformation("Updated policy {Id}. Fields: {Fields}", id, string.Join(", ", sets));
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to patch policy {PolicyId}.", id);
                return StatusCode(500, new { error = "An internal server error occurred while updating the policy." });
            }
        }
        
        // You can add DELETE and GET by ID methods here later...
    }
}
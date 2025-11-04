using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Data;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Dapper;
using System.Threading;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;

namespace UEM.Satellite.API.Controllers
{
    /// <summary>
    /// Handles creation and management of agent-policy deployment jobs.
    /// The table <c>uem_app_agent_deployments</c> stores every deployment request.
    /// </summary>
    [ApiController]
    [Route("api/policy-deployments")]
    public class PolicyDeploymentsController : ControllerBase
    {
        private readonly IDbFactory _dbFactory;
        private readonly ILogger<PolicyDeploymentsController> _logger;

        public PolicyDeploymentsController(IDbFactory dbFactory, ILogger<PolicyDeploymentsController> logger)
        {
            _dbFactory = dbFactory;
            _logger = logger;
        }

        #region DTOs

        public class TargetsDto
        {
            public List<string>? IpRanges { get; set; }
            public List<string>? Hostnames { get; set; }
            public List<string>? OuPaths { get; set; }
            public List<string>? IpSegments { get; set; }
        }

        public class ScheduleDto
        {
            public string? Type { get; set; }
            public string? Frequency { get; set; }
            public string? Time { get; set; }
            public bool? BusinessHours { get; set; }
        }

        public class NewScriptDto
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
            public object? Parameters { get; set; }
            public object? OutputProcessing { get; set; }
            public object? CredentialRequirements { get; set; }
            public string? OutputFormat { get; set; }
            public string? Version { get; set; }
            public bool? IsActive { get; set; }
            public bool? IsStandard { get; set; }
            public string? PublishStatus { get; set; }
        }

        public class PublishDto
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public List<int>? PolicyIds { get; set; } = new();
            // Accept either "deploymentTargets" or legacy "targets"
            public TargetsDto? DeploymentTargets { get; set; }
            public TargetsDto? Targets { get; set; }
            public AgentConfigurationDto? AgentConfiguration { get; set; }
            public ScheduleDto? Schedule { get; set; }
            public List<NewScriptDto>? NewScripts { get; set; }
            public string? CreatedBy { get; set; }
        }

        public class AgentConfigurationDto
        {
            public int? CredentialProfileId { get; set; }
            public List<int>? ProbeIds { get; set; }
            public string? TriggerType { get; set; }
        }

        #endregion

    #region NEW GET Endpoint
    /// <summary>
    /// Gets all saved agent deployment jobs.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAll(CancellationToken cancellationToken = default)
{
    try
    {
        using var conn = _dbFactory.Open();

        // This query selects all the necessary columns from the correct table.
        // It's designed to provide the frontend with all the data it needs to normalize.
        const string sql = @"
            SELECT
                id,
                name,
                description,
                policy_ids,
                targets,
                deployment_method,
                schedule,
                status,
                progress,
                results AS deployment_results,
                probe_id,
                credential_profile_id,
                created_by,
                started_at,
                completed_at,
                created_at,
                updated_at,
                domain_id,
                tenant_id
            FROM uem_app_agent_deployments
            ORDER BY created_at DESC;
        ";

        var jobs = await conn.QueryAsync(new CommandDefinition(sql, cancellationToken: cancellationToken));
        
        _logger.LogInformation("Retrieved {Count} agent deployment jobs.", jobs.Count());
        
        return Ok(jobs);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to retrieve agent deployment jobs.");
        return StatusCode(500, new { error = "An internal server error occurred while fetching deployment jobs." });
    }
}

    #endregion

        /// <summary>
        /// Creates a new deployment job and optionally persists custom scripts.
        /// </summary>
        /// <remarks>
        /// POST api/policy-deployments/publish
        /// </remarks>
        [HttpPost("publish")]
        public async Task<ActionResult<object>> Publish([FromBody] PublishDto dto, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(dto?.Name))
                return BadRequest(new { error = "Name is required" });

            try
            {
                using var conn = _dbFactory.Open();

                // normalize policy ids
                var policyIdsJson = JsonSerializer.Serialize(dto.PolicyIds ?? new List<int>());

                // normalize targets (support both DeploymentTargets and Targets)
                var targets = dto.DeploymentTargets ?? dto.Targets ?? new TargetsDto();

                // build target criteria object containing targets + agent configuration + schedule
                var targetCriteriaObj = new
                {
                    targets,
                    agentConfiguration = dto.AgentConfiguration ?? new AgentConfigurationDto(),
                    schedule = dto.Schedule ?? new ScheduleDto()
                };
                var targetCriteriaJson = JsonSerializer.Serialize(targetCriteriaObj);

                // determine simple target_type
                var hasExplicitTargets = (targets.IpRanges?.Count > 0) || (targets.Hostnames?.Count > 0);
                var targetType = hasExplicitTargets ? "agent_list" : "criteria_based";

                // Persist the wizard into the agent deployments table (uem_app_agent_deployments)
                // Map fields to the table columns shown in the DB (policy_ids jsonb, targets jsonb, schedule jsonb, probe_id, credential_profile_id, etc.)
                var targetsJson = JsonSerializer.Serialize(targets);
                var scheduleJson = JsonSerializer.Serialize(dto.Schedule ?? new ScheduleDto());
                // progress must be JSON matching the table schema
                var progressObj = new
                {
                    total = 0,
                    applied = 0,
                    inProgress = 0,
                    pending = 0,
                    failed = 0
                };
                var progressJson = JsonSerializer.Serialize(progressObj);
                int? probeId = dto.AgentConfiguration?.ProbeIds?.FirstOrDefault();
                int? credentialProfileId = dto.AgentConfiguration?.CredentialProfileId;

                const string sql = @"
                    INSERT INTO uem_app_agent_deployments
                        (name, description, policy_ids, targets, deployment_method, schedule, status, progress, probe_id, credential_profile_id, created_by, created_at)
                    VALUES
                        (@Name, @Description, @PolicyIds::jsonb, @Targets::jsonb, @DeploymentMethod, @Schedule::jsonb, 'pending', @Progress::jsonb, @ProbeId, @CredentialProfileId, @CreatedBy, NOW())
                    RETURNING id, status, created_at;
                ";

                // Use CommandDefinition to set a timeout and pass cancellation token.
                var parameters = new
                {
                    Name = dto.Name.Trim(),
                    Description = dto.Description ?? "",
                    PolicyIds = policyIdsJson,
                    Targets = targetsJson,
                    DeploymentMethod = targetType,
                    Schedule = scheduleJson,
                    Progress = progressJson,
                    ProbeId = probeId,
                    CredentialProfileId = credentialProfileId,
                    CreatedBy = (int?)null
                };

                try
                {
                    var cmd = new CommandDefinition(sql, parameters, commandTimeout: 60, cancellationToken: cancellationToken);
                    var job = await conn.QueryFirstOrDefaultAsync(cmd);
                    if (job == null)
                    {
                        _logger.LogError("DB insert returned no row for deployment job (null result). SQL may have failed silently.");
                        return StatusCode(500, new { error = "Failed to create deployment job (no response from DB)" });
                    }

                    // Materialize for logging/response
                    object jobId = job.id;
                    object jobStatus = job.status;
                    object jobCreatedAt = job.created_at;

                    _logger.LogInformation("Created deployment job {JobId} name={Name} policies={Count}", jobId, dto.Name, dto.PolicyIds?.Count ?? 0);
                    return Ok(new { id = jobId, status = jobStatus, createdAt = jobCreatedAt });
                }
                catch (Npgsql.NpgsqlException npgEx)
                {
                    _logger.LogError(npgEx, "Postgres error inserting deployment job (SqlState={SqlState}, Message={Message})",
                        npgEx.SqlState, npgEx.Message);

                    _logger.LogError("Payload sizes: policyIdsJson={LenPolicyIds}, targetsJson={LenTargets}, scheduleJson={LenSchedule}, progressJson={LenProgress}",
                        policyIdsJson?.Length ?? 0, targetsJson?.Length ?? 0, scheduleJson?.Length ?? 0, progressJson?.Length ?? 0);
                    return StatusCode(500, new { error = "Database error while creating deployment job. Check server logs." });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to insert deployment job");
                    return StatusCode(500, new { error = "Failed to create deployment job" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create deployment job");
                return StatusCode(500, new { error = "Failed to create deployment job" });
            }
        }
    }
}
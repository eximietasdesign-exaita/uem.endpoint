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

namespace UEM.Satellite.API.Controllers
{
    [ApiController]
    [Route("api/agentless-discovery-jobs")]
    public class AgentlessDiscoveryJobsController : ControllerBase
    {
        private readonly IDbFactory _dbFactory;
        private readonly ILogger<AgentlessDiscoveryJobsController> _logger;

        public AgentlessDiscoveryJobsController(IDbFactory dbFactory, ILogger<AgentlessDiscoveryJobsController> logger)
        {
            _dbFactory = dbFactory ?? throw new ArgumentNullException(nameof(dbFactory));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public class CreateJobRequest
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public object? PolicyIds { get; set; }
            public object? Targets { get; set; }
            public int? CredentialProfileId { get; set; }
            public int? ProbeId { get; set; }
            public object? Schedule { get; set; }
            public string? Status { get; set; } = "scheduled";
            public int? TenantId { get; set; }
            public int? DomainId { get; set; }
            // frontend may send a user id (number) or a username; DB expects integer user id
            // accept string here but we'll coerce to int? before insert
            public string? CreatedBy { get; set; }
            // optional initial fields to persist
            public DateTime? StartedAt { get; set; }
            public object? Progress { get; set; }
            public object? Results { get; set; }
        }

        public class UpdateJobRequest
        {
            public string? Name { get; set; }
            public string? Description { get; set; }
            public object? PolicyIds { get; set; }
            public object? Targets { get; set; }
            public int? CredentialProfileId { get; set; }
            public int? ProbeId { get; set; }
            public object? Schedule { get; set; }
            public string? Status { get; set; }
            public decimal? Progress { get; set; }
            public object? Results { get; set; }
            public DateTime? StartedAt { get; set; }
            public DateTime? CompletedAt { get; set; }
            public int? TenantId { get; set; }
            public int? DomainId { get; set; }
        }

        // GET /api/agentless-discovery-jobs?tenantId=...&domainId=...
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? tenantId = null, [FromQuery] int? domainId = null, CancellationToken cancellationToken = default)
        {
            try
            {
                using var conn = _dbFactory.Open();

                var sql = @"
                    SELECT
                        id,
                        name,
                        description,
                        type,
                        status,
                        targets,
                        discovery_profiles,
                        schedule,
                        progress,
                        results,
                        probe_id,
                        credential_profile_id,
                        created_by,
                        started_at,
                        completed_at,
                        created_at,
                        updated_at,
                        domain_id,
                        tenant_id
                    FROM uem_app_discovery_jobs
                    WHERE (@tenantId IS NULL OR tenant_id = @tenantId)
                      AND (@domainId IS NULL OR domain_id = @domainId)
                    ORDER BY created_at DESC;
                ";

                var rows = await conn.QueryAsync(sql, new { tenantId, domainId }, commandTimeout: 30);

                var list = rows.Select(r => new
                {
                    id = (int)r.id,
                    name = r.name as string ?? "",
                    description = r.description as string ?? "",
                    type = r.type as string ?? "agentless",
                    tenantId = r.tenant_id,
                    domainId = r.domain_id,
                    status = r.status as string ?? "pending",
                    targets = r.targets,
                    // keep legacy property name
                    discoveryProfiles = r.discovery_profiles,
                    // provide frontend-friendly alias expected by UI
                    policyIds = r.discovery_profiles,
                    schedule = r.schedule,
                    credentialProfileId = r.credential_profile_id,
                    probeId = r.probe_id,
                    createdBy = r.created_by,
                    createdAt = r.created_at,
                    updatedAt = r.updated_at
                }).ToList();

                return Ok(list);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch agentless discovery jobs");
                return StatusCode(500, new { error = "Failed to fetch agentless discovery jobs" });
            }
        }

        // GET /api/agentless-discovery-jobs/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                using var conn = _dbFactory.Open();
                const string sql = @"
                    SELECT
                        id,
                        name,
                        description,
                        type,
                        status,
                        targets,
                        discovery_profiles,
                        schedule,
                        progress,
                        results,
                        probe_id,
                        credential_profile_id,
                        created_by,
                        started_at,
                        completed_at,
                        created_at,
                        updated_at,
                        domain_id,
                        tenant_id
                    FROM uem_app_discovery_jobs
                    WHERE id = @Id
                    LIMIT 1;
                ";
                var row = await conn.QuerySingleOrDefaultAsync(sql, new { Id = id }, commandTimeout: 30);
                if (row == null) return NotFound(new { error = "Job not found" });

                var result = new
                {
                    id = (int)row.id,
                    name = row.name as string ?? "",
                    description = row.description as string ?? "",
                    type = row.type as string ?? "agentless",
                    status = row.status as string ?? "pending",
                    targets = row.targets,
                    discoveryProfiles = row.discovery_profiles,
                    // alias for frontend
                    policyIds = row.discovery_profiles,
                    schedule = row.schedule,
                    progress = row.progress,
                    results = row.results,
                    probeId = row.probe_id,
                    credentialProfileId = row.credential_profile_id,
                    createdBy = row.created_by,
                    startedAt = row.started_at,
                    completedAt = row.completed_at,
                    createdAt = row.created_at,
                    updatedAt = row.updated_at,
                    domainId = row.domain_id,
                    tenantId = row.tenant_id
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch agentless discovery job {Id}", id);
                return StatusCode(500, new { error = "Failed to fetch job" });
            }
        }

        // POST /api/agentless-discovery-jobs
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateJobRequest req, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(req?.Name))
                return BadRequest(new { error = "Name is required" });
 
            try
            {
                using var conn = _dbFactory.Open();
 
                // Normalize JSONB fields: accept both raw object or pre-serialized string
                string targetsJson = req.Targets == null
                    ? "{}"
                    : (req.Targets is string sTargets ? sTargets : JsonSerializer.Serialize(req.Targets));
 
                string discoveryProfilesJson = req.PolicyIds == null
                    ? "[]"
                    : (req.PolicyIds is string sPolicies ? sPolicies : JsonSerializer.Serialize(req.PolicyIds));
 
string scheduleJson = req.Schedule == null
    ? "{}"
    : (req.Schedule is string sSchedule ? sSchedule : JsonSerializer.Serialize(req.Schedule));

// normalize progress/results JSONB payloads (store as jsonb)
string progressJson = req.Progress == null
    ? JsonSerializer.Serialize(new { total = 0, failed = 0, discovered = 0, inProgress = 0, legacyPercent = 0 })
    : (req.Progress is string sp ? sp : JsonSerializer.Serialize(req.Progress));

string resultsJson = req.Results == null
    ? JsonSerializer.Serialize(new { errors = Array.Empty<object>(), newAssets = 0, totalAssets = 0, updatedAssets = 0 })
    : (req.Results is string sr ? sr : JsonSerializer.Serialize(req.Results));

// determine started_at: if job is running and no started_at provided, set NOW()
DateTime? startedAtValue = req.StartedAt;
if (string.Equals(req.Status, "running", StringComparison.OrdinalIgnoreCase) && startedAtValue == null)
{
    startedAtValue = DateTime.UtcNow;
}
 
                const string sql = @"
                    INSERT INTO uem_app_discovery_jobs
                        (name, description, type, status, targets, discovery_profiles, schedule, progress, results, credential_profile_id, probe_id, tenant_id, domain_id, created_by, started_at, created_at, updated_at)
                    VALUES
                        (@Name, @Description, @Type, @Status, @Targets::jsonb, @DiscoveryProfiles::jsonb, @Schedule::jsonb, @Progress::jsonb, @Results::jsonb, @CredentialProfileId, @ProbeId, @TenantId, @DomainId, @CreatedBy, @StartedAt, NOW(), NOW())
                    RETURNING id, name, description, type, status, targets, discovery_profiles, schedule, progress, results, probe_id, credential_profile_id, created_by, started_at, completed_at, created_at, updated_at, domain_id, tenant_id;
                ";
 
                var parameters = new
                {
                    Name = req.Name.Trim(),
                    Description = req.Description ?? "",
                    Type = "agentless",
                    Status = req.Status ?? "scheduled",
                    Targets = targetsJson,
                    DiscoveryProfiles = discoveryProfilesJson,
                    Schedule = scheduleJson,
                    Progress = progressJson,
                    Results = resultsJson,
                    CredentialProfileId = req.CredentialProfileId,
                    ProbeId = req.ProbeId,
                    TenantId = req.TenantId,
                    DomainId = req.DomainId,
                    CreatedBy = ParseCreatedByToNullableInt(req.CreatedBy),
                    StartedAt = startedAtValue
                };
 
                var row = await conn.QuerySingleAsync(sql, parameters);
                // ensure response includes policyIds alias so frontend can read count consistently
                var created = new
                {
                    id = (int)row.id,
                    name = row.name as string ?? "",
                    description = row.description as string ?? "",
                    discoveryProfiles = row.discovery_profiles,
                    policyIds = row.discovery_profiles,
                    targets = row.targets,
                    schedule = row.schedule,
                    status = row.status,
                    credentialProfileId = row.credential_profile_id,
                    probeId = row.probe_id,
                    createdBy = row.created_by,
                    startedAt = row.started_at,
                    createdAt = row.created_at,
                    updatedAt = row.updated_at
                };
                return CreatedAtAction(nameof(GetById), new { id = row.id }, created);
             }
             catch (Exception ex)
             {
                 // log full exception for debugging (remove detailed message in production)
                 _logger.LogError(ex, "Failed to create agentless discovery job - full exception: {Ex}", ex.ToString());
                 // return more detailed message temporarily to help debug from frontend
                 return StatusCode(500, new { error = "Failed to create job", details = ex.Message, stack = ex.StackTrace });
             }
         }

        // PATCH /api/agentless-discovery-jobs/{id}
        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateJobRequest req, CancellationToken cancellationToken = default)
        {
            try
            {
                using var conn = _dbFactory.Open();
                var sets = new List<string>();
                var dyn = new DynamicParameters();
                dyn.Add("Id", id);

                if (req.Name != null) { sets.Add("name = @Name"); dyn.Add("Name", req.Name.Trim()); }
                if (req.Description != null) { sets.Add("description = @Description"); dyn.Add("Description", req.Description); }
                if (req.Status != null) { sets.Add("status = @Status"); dyn.Add("Status", req.Status); }
                if (req.Targets != null) { sets.Add("targets = @Targets::jsonb"); dyn.Add("Targets", req.Targets is string st ? st : JsonSerializer.Serialize(req.Targets)); }
                if (req.PolicyIds != null) { sets.Add("discovery_profiles = @DiscoveryProfiles::jsonb"); dyn.Add("DiscoveryProfiles", req.PolicyIds is string sp ? sp : JsonSerializer.Serialize(req.PolicyIds)); }
                if (req.Schedule != null) { sets.Add("schedule = @Schedule::jsonb"); dyn.Add("Schedule", req.Schedule is string ss ? ss : JsonSerializer.Serialize(req.Schedule)); }
                if (req.CredentialProfileId != null) { sets.Add("credential_profile_id = @CredentialProfileId"); dyn.Add("CredentialProfileId", req.CredentialProfileId); }
                if (req.ProbeId != null) { sets.Add("probe_id = @ProbeId"); dyn.Add("ProbeId", req.ProbeId); }
                if (req.Progress != null) { sets.Add("progress = @Progress"); dyn.Add("Progress", req.Progress); }
                if (req.Results != null) { sets.Add("results = @Results::jsonb"); dyn.Add("Results", req.Results is string sr ? sr : JsonSerializer.Serialize(req.Results)); }
                if (req.StartedAt != null) { sets.Add("started_at = @StartedAt"); dyn.Add("StartedAt", req.StartedAt); }
                if (req.CompletedAt != null) { sets.Add("completed_at = @CompletedAt"); dyn.Add("CompletedAt", req.CompletedAt); }
                if (req.TenantId != null) { sets.Add("tenant_id = @TenantId"); dyn.Add("TenantId", req.TenantId); }
                if (req.DomainId != null) { sets.Add("domain_id = @DomainId"); dyn.Add("DomainId", req.DomainId); }

                if (!sets.Any())
                    return BadRequest(new { error = "No updatable fields provided" });

                var sql = $@"
                    UPDATE uem_app_discovery_jobs
                    SET {string.Join(", ", sets)}, updated_at = NOW()
                    WHERE id = @Id
                    RETURNING id, name, description, type, status, targets, discovery_profiles, schedule, progress, results, probe_id, credential_profile_id, created_by, started_at, completed_at, created_at, updated_at, domain_id, tenant_id;
                ";

                var updated = await conn.QuerySingleOrDefaultAsync(sql, dyn);
                if (updated == null) return NotFound(new { error = "Job not found" });
                return Ok(updated);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update agentless discovery job {Id}", id);
                return StatusCode(500, new { error = "Failed to update job" });
            }
        }

        // DELETE /api/agentless-discovery-jobs/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                using var conn = _dbFactory.Open();
                var rows = await conn.ExecuteAsync("DELETE FROM uem_app_discovery_jobs WHERE id = @Id", new { Id = id });
                if (rows == 0) return NotFound(new { error = "Job not found" });
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete agentless discovery job {Id}", id);
                return StatusCode(500, new { error = "Failed to delete job" });
            }
        }

        // helper - parse incoming createdBy to nullable int
        private static int? ParseCreatedByToNullableInt(string? createdBy)
        {
            if (string.IsNullOrWhiteSpace(createdBy))
                return null;
            if (int.TryParse(createdBy, out var id))
                return id;
            // optionally: map known string identifiers -> ids, otherwise null
            return null;
        }
    }
}
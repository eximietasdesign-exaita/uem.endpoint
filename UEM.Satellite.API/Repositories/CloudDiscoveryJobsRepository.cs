using Dapper;
using Npgsql;
using UEM.Satellite.API.Models;

namespace UEM.Satellite.API.Repositories;

public class CloudDiscoveryJobsRepository
{
    private readonly string _connectionString;
    private readonly ILogger<CloudDiscoveryJobsRepository> _logger;

    public CloudDiscoveryJobsRepository(
        IConfiguration configuration,
        ILogger<CloudDiscoveryJobsRepository> logger)
    {
        _connectionString = configuration.GetConnectionString("Postgres") 
            ?? Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? throw new InvalidOperationException("Database connection string not configured");
        _logger = logger;
    }

    public async Task<CloudDiscoveryJob?> GetByIdAsync(int id)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    job_name AS JobName,
                    credential_id AS CredentialId,
                    tenant_id AS TenantId,
                    domain_id AS DomainId,
                    is_enabled AS IsEnabled,
                    schedule_type AS ScheduleType,
                    cron_expression AS CronExpression,
                    target_regions AS TargetRegions,
                    resource_types AS ResourceTypes,
                    last_run_at AS LastRunAt,
                    last_run_status AS LastRunStatus,
                    next_run_at AS NextRunAt,
                    total_runs AS TotalRuns,
                    successful_runs AS SuccessfulRuns,
                    failed_runs AS FailedRuns,
                    created_at AS CreatedAt,
                    created_by AS CreatedBy,
                    updated_at AS UpdatedAt,
                    updated_by AS UpdatedBy
                FROM cloud_discovery_jobs
                WHERE id = @Id";

            return await connection.QueryFirstOrDefaultAsync<CloudDiscoveryJob>(sql, new { Id = id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cloud discovery job by id {Id}", id);
            throw;
        }
    }

    public async Task<List<CloudDiscoveryJob>> GetByTenantAsync(int tenantId, int? domainId = null)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    job_name AS JobName,
                    credential_id AS CredentialId,
                    tenant_id AS TenantId,
                    domain_id AS DomainId,
                    is_enabled AS IsEnabled,
                    schedule_type AS ScheduleType,
                    cron_expression AS CronExpression,
                    target_regions AS TargetRegions,
                    resource_types AS ResourceTypes,
                    last_run_at AS LastRunAt,
                    last_run_status AS LastRunStatus,
                    next_run_at AS NextRunAt,
                    total_runs AS TotalRuns,
                    successful_runs AS SuccessfulRuns,
                    failed_runs AS FailedRuns,
                    created_at AS CreatedAt,
                    created_by AS CreatedBy,
                    updated_at AS UpdatedAt,
                    updated_by AS UpdatedBy
                FROM cloud_discovery_jobs
                WHERE tenant_id = @TenantId 
                  AND (@DomainId IS NULL OR domain_id = @DomainId)
                ORDER BY job_name";

            var jobs = await connection.QueryAsync<CloudDiscoveryJob>(sql, new { TenantId = tenantId, DomainId = domainId });
            return jobs.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cloud discovery jobs for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<List<CloudDiscoveryJob>> GetActiveJobsAsync()
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    job_name AS JobName,
                    credential_id AS CredentialId,
                    tenant_id AS TenantId,
                    domain_id AS DomainId,
                    is_enabled AS IsEnabled,
                    schedule_type AS ScheduleType,
                    cron_expression AS CronExpression,
                    target_regions AS TargetRegions,
                    resource_types AS ResourceTypes,
                    last_run_at AS LastRunAt,
                    last_run_status AS LastRunStatus,
                    next_run_at AS NextRunAt,
                    total_runs AS TotalRuns,
                    successful_runs AS SuccessfulRuns,
                    failed_runs AS FailedRuns,
                    created_at AS CreatedAt,
                    created_by AS CreatedBy,
                    updated_at AS UpdatedAt,
                    updated_by AS UpdatedBy
                FROM cloud_discovery_jobs
                WHERE is_enabled = true
                ORDER BY next_run_at NULLS LAST";

            var jobs = await connection.QueryAsync<CloudDiscoveryJob>(sql);
            return jobs.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get active cloud discovery jobs");
            throw;
        }
    }

    public async Task<List<CloudDiscoveryJob>> GetJobsDueForExecutionAsync()
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    job_name AS JobName,
                    credential_id AS CredentialId,
                    tenant_id AS TenantId,
                    domain_id AS DomainId,
                    is_enabled AS IsEnabled,
                    schedule_type AS ScheduleType,
                    cron_expression AS CronExpression,
                    target_regions AS TargetRegions,
                    resource_types AS ResourceTypes,
                    last_run_at AS LastRunAt,
                    last_run_status AS LastRunStatus,
                    next_run_at AS NextRunAt,
                    total_runs AS TotalRuns,
                    successful_runs AS SuccessfulRuns,
                    failed_runs AS FailedRuns,
                    created_at AS CreatedAt,
                    created_by AS CreatedBy,
                    updated_at AS UpdatedAt,
                    updated_by AS UpdatedBy
                FROM cloud_discovery_jobs
                WHERE is_enabled = true
                  AND next_run_at IS NOT NULL
                  AND next_run_at <= @CurrentTime
                ORDER BY next_run_at";

            var jobs = await connection.QueryAsync<CloudDiscoveryJob>(sql, new { CurrentTime = DateTime.UtcNow });
            return jobs.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get jobs due for execution");
            throw;
        }
    }

    public async Task<int> CreateAsync(CloudDiscoveryJob job)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                INSERT INTO cloud_discovery_jobs (
                    job_name, credential_id, tenant_id, domain_id,
                    is_enabled, schedule_type, cron_expression,
                    target_regions, resource_types, next_run_at,
                    created_at, created_by
                ) VALUES (
                    @JobName, @CredentialId, @TenantId, @DomainId,
                    @IsEnabled, @ScheduleType, @CronExpression,
                    @TargetRegions, @ResourceTypes, @NextRunAt,
                    @CreatedAt, @CreatedBy
                ) RETURNING id";

            var id = await connection.ExecuteScalarAsync<int>(sql, new
            {
                job.JobName,
                job.CredentialId,
                job.TenantId,
                job.DomainId,
                IsEnabled = job.IsEnabled ?? true,
                job.ScheduleType,
                job.CronExpression,
                job.TargetRegions,
                job.ResourceTypes,
                job.NextRunAt,
                CreatedAt = DateTime.UtcNow,
                job.CreatedBy
            });

            _logger.LogInformation("Created cloud discovery job {Id}: {JobName}", id, job.JobName);
            return id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create cloud discovery job {JobName}", job.JobName);
            throw;
        }
    }

    public async Task UpdateAsync(CloudDiscoveryJob job)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                UPDATE cloud_discovery_jobs SET
                    job_name = @JobName,
                    is_enabled = @IsEnabled,
                    schedule_type = @ScheduleType,
                    cron_expression = @CronExpression,
                    target_regions = @TargetRegions,
                    resource_types = @ResourceTypes,
                    next_run_at = @NextRunAt,
                    updated_at = @UpdatedAt,
                    updated_by = @UpdatedBy
                WHERE id = @Id";

            await connection.ExecuteAsync(sql, new
            {
                job.Id,
                job.JobName,
                job.IsEnabled,
                job.ScheduleType,
                job.CronExpression,
                job.TargetRegions,
                job.ResourceTypes,
                job.NextRunAt,
                UpdatedAt = DateTime.UtcNow,
                job.UpdatedBy
            });

            _logger.LogInformation("Updated cloud discovery job {Id}", job.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update cloud discovery job {Id}", job.Id);
            throw;
        }
    }

    public async Task UpdateJobExecutionStatsAsync(int jobId, DateTime lastRunAt, string status, DateTime? nextRunAt = null)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            const string sql = @"
                UPDATE cloud_discovery_jobs SET
                    last_run_at = @LastRunAt,
                    last_run_status = @Status,
                    next_run_at = @NextRunAt,
                    total_runs = total_runs + 1,
                    successful_runs = successful_runs + CASE WHEN @Status = 'completed' THEN 1 ELSE 0 END,
                    failed_runs = failed_runs + CASE WHEN @Status = 'failed' THEN 1 ELSE 0 END,
                    updated_at = @UpdatedAt
                WHERE id = @JobId";

            await connection.ExecuteAsync(sql, new
            {
                JobId = jobId,
                LastRunAt = lastRunAt,
                Status = status,
                NextRunAt = nextRunAt,
                UpdatedAt = DateTime.UtcNow
            });

            _logger.LogInformation("Updated execution stats for job {JobId}: {Status}", jobId, status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update job execution stats for job {JobId}", jobId);
            throw;
        }
    }

    public async Task DeleteAsync(int id)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            // Soft delete by setting is_enabled to false
            const string sql = @"
                UPDATE cloud_discovery_jobs 
                SET is_enabled = false, updated_at = @UpdatedAt 
                WHERE id = @Id";

            await connection.ExecuteAsync(sql, new { Id = id, UpdatedAt = DateTime.UtcNow });

            _logger.LogInformation("Deleted (soft) cloud discovery job {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete cloud discovery job {Id}", id);
            throw;
        }
    }

    public async Task<Dictionary<string, int>> GetJobStatisticsAsync(int tenantId)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    COUNT(*) as TotalJobs,
                    COUNT(*) FILTER (WHERE is_enabled = true) as ActiveJobs,
                    COUNT(*) FILTER (WHERE last_run_status = 'completed') as SuccessfulJobs,
                    COUNT(*) FILTER (WHERE last_run_status = 'failed') as FailedJobs,
                    COALESCE(SUM(total_runs), 0) as TotalRuns
                FROM cloud_discovery_jobs
                WHERE tenant_id = @TenantId";

            var stats = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { TenantId = tenantId });

            return new Dictionary<string, int>
            {
                ["TotalJobs"] = stats?.TotalJobs ?? 0,
                ["ActiveJobs"] = stats?.ActiveJobs ?? 0,
                ["SuccessfulJobs"] = stats?.SuccessfulJobs ?? 0,
                ["FailedJobs"] = stats?.FailedJobs ?? 0,
                ["TotalRuns"] = (int)(stats?.TotalRuns ?? 0)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get job statistics for tenant {TenantId}", tenantId);
            throw;
        }
    }
}

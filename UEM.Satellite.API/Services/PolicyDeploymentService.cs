using UEM.Satellite.API.Models;
using UEM.Satellite.API.Data;
using Dapper;
using Npgsql;
using System.Text.Json;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;

namespace UEM.Satellite.API.Services;

/// <summary>
/// Policy deployment service implementation
/// </summary>
public class PolicyDeploymentService : IPolicyDeploymentService
{
    private readonly IDbFactory _dbFactory;
    private readonly IAgentStatusService _agentStatusService;
    private readonly IConfiguration _config;
    private readonly ILogger<PolicyDeploymentService> _logger;
    private readonly ConcurrentDictionary<int, PolicyDeploymentStatus> _deploymentCache = new();
    private readonly ConcurrentDictionary<string, List<PolicyExecutionCommand>> _pendingCommands = new();
    private readonly SemaphoreSlim _deploymentSemaphore = new(1, 1);

    public PolicyDeploymentService(
        IDbFactory dbFactory,
        IConfiguration config,
        IAgentStatusService agentStatusService,
        ILogger<PolicyDeploymentService> logger)
    {
        _dbFactory = dbFactory ?? throw new ArgumentNullException(nameof(dbFactory));
        _config = config ?? throw new ArgumentNullException(nameof(config));
        _agentStatusService = agentStatusService ?? throw new ArgumentNullException(nameof(agentStatusService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<PolicyDeploymentStatus> DeployPolicyAsync(PolicyDeploymentRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (request.ExecutionFlow?.Count == 0)
            throw new ArgumentException("Policy must have at least one execution step");

        await _deploymentSemaphore.WaitAsync(cancellationToken);
        try
        {
            // Create deployment job record
            var jobId = await CreateDeploymentJobAsync(request, cancellationToken);
            
            // Resolve target agents
            var targetAgents = await ResolveTargetAgentsAsync(request, cancellationToken);
            
            if (targetAgents.Count == 0)
            {
                await UpdateDeploymentStatusAsync(jobId, "failed", "No active agents match the target criteria", cancellationToken);
                throw new ArgumentException("No active agents match the target criteria");
            }

            // Create deployment status
            var deploymentStatus = new PolicyDeploymentStatus
            {
                JobId = jobId,
                Status = "running",
                TotalTargets = targetAgents.Count,
                CompletedTargets = 0,
                FailedTargets = 0,
                Progress = 0.0f,
                StartedAt = DateTime.UtcNow,
                AgentResults = targetAgents.Select(agentId => new AgentDeploymentStatus
                {
                    AgentId = agentId,
                    Hostname = GetAgentHostname(agentId),
                    Status = "pending"
                }).ToList()
            };

            _deploymentCache[jobId] = deploymentStatus;

            // Deploy to agents asynchronously
            _ = Task.Run(async () => await ExecuteDeploymentAsync(jobId, request, targetAgents, cancellationToken), cancellationToken);

            return deploymentStatus;
        }
        finally
        {
            _deploymentSemaphore.Release();
        }
    }

    public async Task<PolicyDeploymentStatus?> GetDeploymentStatusAsync(int jobId, CancellationToken cancellationToken = default)
    {
        // Check cache first
        if (_deploymentCache.TryGetValue(jobId, out var cachedStatus))
        {
            return cachedStatus;
        }

        // Load from database
        try
        {
            using var connection = _dbFactory.Open();
            const string sql = @"
                SELECT 
                    id, name, status, total_targets, completed_targets, failed_targets,
                    progress, started_at, completed_at, deployment_results
                FROM uem_app_policy_deployment_jobs 
                WHERE id = @JobId";

            var job = await connection.QueryFirstOrDefaultAsync(sql, new { JobId = jobId });
            
            if (job == null)
                return null;

            var deploymentResults = job.deployment_results != null 
                ? JsonSerializer.Deserialize<object>(job.deployment_results)
                : null;

            return new PolicyDeploymentStatus
            {
                JobId = (int)job.id,
                Status = job.status,
                TotalTargets = job.total_targets ?? 0,
                CompletedTargets = job.completed_targets ?? 0,
                FailedTargets = job.failed_targets ?? 0,
                Progress = job.progress ?? 0.0f,
                StartedAt = job.started_at,
                CompletedAt = job.completed_at,
                AgentResults = new List<AgentDeploymentStatus>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load deployment status for job {JobId}", jobId);
            return null;
        }
    }

    public async Task<bool> CancelDeploymentAsync(int jobId, CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _dbFactory.Open();
            const string sql = @"
                UPDATE uem_app_policy_deployment_jobs 
                SET status = 'cancelled', completed_at = NOW()
                WHERE id = @JobId AND status IN ('pending', 'running')";

            var rowsAffected = await connection.ExecuteAsync(sql, new { JobId = jobId });
            
            if (rowsAffected > 0)
            {
                // Update cache
                if (_deploymentCache.TryGetValue(jobId, out var status))
                {
                    status.Status = "cancelled";
                    status.CompletedAt = DateTime.UtcNow;
                }

                _logger.LogInformation("Cancelled deployment job {JobId}", jobId);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cancel deployment job {JobId}", jobId);
            return false;
        }
    }

    public async Task ProcessExecutionResultAsync(PolicyExecutionResult result, CancellationToken cancellationToken = default)
    {
        if (result == null)
            throw new ArgumentNullException(nameof(result));

        try
        {
            // Store execution result in database
            await StoreExecutionResultAsync(result, cancellationToken);

            // Update deployment status if this result completes a deployment
            await UpdateDeploymentProgressAsync(result, cancellationToken);

            _logger.LogInformation("Processed execution result for {ExecutionId} from agent {AgentId}", 
                result.ExecutionId, result.AgentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process execution result for {ExecutionId}", result.ExecutionId);
            throw;
        }
    }

    public async Task<List<PolicyExecutionResult>> GetAgentExecutionsAsync(
        string agentId, 
        int? policyId = null, 
        string? status = null, 
        int limit = 50, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var whereConditions = new List<string> { "agent_id = @AgentId" };
            var parameters = new { AgentId = agentId, PolicyId = policyId, Status = status, Limit = limit };

            if (policyId.HasValue)
                whereConditions.Add("policy_id = @PolicyId");

            if (!string.IsNullOrEmpty(status))
                whereConditions.Add("status = @Status");

            var sql = $@"
                SELECT 
                    execution_id, agent_id, policy_id, status, progress, total_steps,
                    completed_steps, current_step, execution_results, final_output,
                    final_status, error_summary, total_execution_time_ms,
                    started_at, completed_at, agent_version, operating_system,
                    os_version, retry_count, created_at
                FROM uem_app_policy_execution_results 
                WHERE {string.Join(" AND ", whereConditions)}
                ORDER BY created_at DESC
                LIMIT @Limit";

            var results = await connection.QueryAsync(sql, parameters);
            
            return results.Select(MapToExecutionResult).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get executions for agent {AgentId}", agentId);
            return new List<PolicyExecutionResult>();
        }
    }

    public async Task<List<PolicyExecutionCommand>> GetPendingCommandsAsync(string agentId, CancellationToken cancellationToken = default)
    {
        // Check in-memory cache first
        if (_pendingCommands.TryGetValue(agentId, out var cachedCommands))
        {
            var nonExpiredCommands = cachedCommands.Where(c => c.ExpiresAt > DateTime.UtcNow).ToList();
            _pendingCommands[agentId] = nonExpiredCommands;
            return nonExpiredCommands;
        }

        // For now, return empty list - real implementation would check database
        return new List<PolicyExecutionCommand>();
    }

    public async Task AcknowledgeCommandAsync(string agentId, string executionId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Remove from pending commands
            if (_pendingCommands.TryGetValue(agentId, out var commands))
            {
                var updatedCommands = commands.Where(c => c.ExecutionId != executionId).ToList();
                _pendingCommands[agentId] = updatedCommands;
            }

            _logger.LogDebug("Command {ExecutionId} acknowledged by agent {AgentId}", executionId, agentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to acknowledge command {ExecutionId} for agent {AgentId}", 
                executionId, agentId);
            throw;
        }
    }

    public async Task<List<string>> FilterAgentsByCriteriaAsync(PolicyTargetCriteria criteria, CancellationToken cancellationToken = default)
    {
        try
        {
            var activeAgents = await _agentStatusService.GetActiveAgentsAsync(cancellationToken);
            var filteredAgents = new List<string>();

            foreach (var agentId in activeAgents)
            {
                if (await MatchesAgentCriteriaAsync(agentId, criteria, cancellationToken))
                {
                    filteredAgents.Add(agentId);
                }
            }

            return filteredAgents;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to filter agents by criteria");
            return new List<string>();
        }
    }

    public async Task<object> GetPolicyStatisticsAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            // Get execution statistics
            const string executionStatsQuery = @"
                SELECT 
                    COUNT(*) as total_executions,
                    COUNT(CASE WHEN final_status = 'success' THEN 1 END) as successful_executions,
                    COUNT(CASE WHEN final_status = 'failed' THEN 1 END) as failed_executions,
                    COUNT(CASE WHEN final_status = 'partial_success' THEN 1 END) as partial_executions,
                    AVG(total_execution_time_ms) as avg_execution_time_ms,
                    COUNT(DISTINCT agent_id) as agents_involved,
                    COUNT(DISTINCT policy_id) as policies_executed
                FROM uem_app_policy_execution_results 
                WHERE created_at BETWEEN @FromDate AND @ToDate";

            var stats = await connection.QueryFirstAsync(executionStatsQuery, new { FromDate = fromDate, ToDate = toDate });

            // Get deployment statistics
            const string deploymentStatsQuery = @"
                SELECT 
                    COUNT(*) as total_deployments,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_deployments,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_deployments,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_deployments,
                    AVG(completed_targets::float / NULLIF(total_targets, 0)) * 100 as avg_success_rate
                FROM uem_app_policy_deployment_jobs 
                WHERE created_at BETWEEN @FromDate AND @ToDate";

            var deploymentStats = await connection.QueryFirstAsync(deploymentStatsQuery, new { FromDate = fromDate, ToDate = toDate });

            return new
            {
                period = new { from = fromDate, to = toDate },
                executions = new
                {
                    total = (int)stats.total_executions,
                    successful = (int)stats.successful_executions,
                    failed = (int)stats.failed_executions,
                    partial = (int)stats.partial_executions,
                    successRate = stats.total_executions > 0 ? (double)stats.successful_executions / stats.total_executions * 100 : 0,
                    averageExecutionTimeMs = (double?)stats.avg_execution_time_ms,
                    agentsInvolved = (int)stats.agents_involved,
                    policiesExecuted = (int)stats.policies_executed
                },
                deployments = new
                {
                    total = (int)deploymentStats.total_deployments,
                    completed = (int)deploymentStats.completed_deployments,
                    failed = (int)deploymentStats.failed_deployments,
                    cancelled = (int)deploymentStats.cancelled_deployments,
                    averageSuccessRate = (double?)deploymentStats.avg_success_rate ?? 0
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get policy statistics");
            return new { error = "Failed to retrieve statistics" };
        }
    }

    public async Task<IEnumerable<ScriptPolicy>> GetScriptPoliciesAsync(string? ids = null, CancellationToken cancellationToken = default)
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
                    target_os AS ""TargetOs"",
                    parameters AS ""Parameters"",
                    output_format AS ""OutputFormat"",
                    estimated_run_time_seconds AS ""EstimatedRunTimeSeconds"",
                    requires_elevation AS ""RequiresElevation"",
                    vendor AS ""Vendor"",
                    version AS ""Version"",
                    COALESCE(publish_status, 'published') AS ""PublishStatus"",
                    is_active AS ""IsActive"",
                    created_at AS ""CreatedAt"",
                    updated_at AS ""UpdatedAt""
                FROM uem_app_scripts
                /**-- WHERE clause will be added dynamically --**/
                ORDER BY name;
            ";

            var parameters = new DynamicParameters();
            var idList = new List<int>();

            if (!string.IsNullOrWhiteSpace(ids))
            {
                idList = ids.Split(',')
                            .Select(idStr => int.TryParse(idStr.Trim(), out var id) ? id : -1)
                            .Where(id => id > 0)
                            .ToList();

                if (idList.Any())
                {
                    sql = sql.Replace("/**-- WHERE clause will be added dynamically --**/", "WHERE id = ANY(@Ids)");
                    parameters.Add("Ids", idList.ToArray());
                }
            }
            else
            {
                // remove placeholder if no ids
                sql = sql.Replace("/**-- WHERE clause will be added dynamically --**/", "");
            }

            var rows = await conn.QueryAsync<ScriptPolicy>(new CommandDefinition(sql, parameters, cancellationToken: cancellationToken));
            return rows ?? Enumerable.Empty<ScriptPolicy>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load script policies from uem_app_scripts");
            return Enumerable.Empty<ScriptPolicy>();
        }
    }
 
    #region Private Methods

    private async Task<int> CreateDeploymentJobAsync(PolicyDeploymentRequest request, CancellationToken cancellationToken)
    {
        using var connection = _dbFactory.Open();
        const string sql = @"
            CREATE TABLE IF NOT EXISTS uem_app_policy_deployment_jobs (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                policy_ids JSONB NOT NULL,
                target_type TEXT NOT NULL,
                target_agents JSONB,
                target_criteria JSONB,
                deployment_strategy TEXT NOT NULL DEFAULT 'parallel',
                status TEXT NOT NULL DEFAULT 'pending',
                total_targets INTEGER DEFAULT 0,
                completed_targets INTEGER DEFAULT 0,
                failed_targets INTEGER DEFAULT 0,
                progress REAL DEFAULT 0.0,
                deployment_results JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                started_at TIMESTAMPTZ,
                completed_at TIMESTAMPTZ
            );

            INSERT INTO uem_app_policy_deployment_jobs (
                name, description, policy_ids, target_type, target_agents,
                target_criteria, deployment_strategy, status
            ) VALUES (
                @Name, @Description, @PolicyIds, @TargetType, @TargetAgents,
                @TargetCriteria, @DeploymentStrategy, 'pending'
            ) RETURNING id";

        var jobId = await connection.QuerySingleAsync<int>(sql, new
        {
            Name = $"Policy {request.PolicyName} Deployment",
            Description = request.Description,
            PolicyIds = JsonSerializer.Serialize(new[] { request.PolicyId }),
            TargetType = request.TargetAgents.Count > 0 ? "agent_list" : "criteria_based",
            TargetAgents = JsonSerializer.Serialize(request.TargetAgents),
            TargetCriteria = JsonSerializer.Serialize(request.TargetCriteria),
            DeploymentStrategy = request.DeploymentConfig?.DeploymentStrategy ?? "parallel"
        });

        return jobId;
    }

    private async Task<List<string>> ResolveTargetAgentsAsync(PolicyDeploymentRequest request, CancellationToken cancellationToken)
    {
        if (request.TargetAgents?.Count > 0)
        {
            // Filter to only active agents
            var activeAgents = await _agentStatusService.GetActiveAgentsAsync(cancellationToken);
            return request.TargetAgents.Where(activeAgents.Contains).ToList();
        }

        if (request.TargetCriteria != null)
        {
            return await FilterAgentsByCriteriaAsync(request.TargetCriteria, cancellationToken);
        }

        return new List<string>();
    }

    private async Task ExecuteDeploymentAsync(int jobId, PolicyDeploymentRequest request, List<string> targetAgents, CancellationToken cancellationToken)
    {
        try
        {
            await UpdateDeploymentStatusAsync(jobId, "running", null, cancellationToken);

            var deploymentStrategy = request.DeploymentConfig?.DeploymentStrategy ?? "parallel";
            var maxConcurrency = request.DeploymentConfig?.MaxConcurrency ?? 50;

            if (deploymentStrategy == "parallel")
            {
                await ExecuteParallelDeploymentAsync(jobId, request, targetAgents, maxConcurrency, cancellationToken);
            }
            else
            {
                await ExecuteSequentialDeploymentAsync(jobId, request, targetAgents, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Deployment execution failed for job {JobId}", jobId);
            await UpdateDeploymentStatusAsync(jobId, "failed", ex.Message, cancellationToken);
        }
    }

    private async Task ExecuteParallelDeploymentAsync(int jobId, PolicyDeploymentRequest request, List<string> targetAgents, int maxConcurrency, CancellationToken cancellationToken)
    {
        var semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
        var tasks = targetAgents.Select(async agentId =>
        {
            await semaphore.WaitAsync(cancellationToken);
            try
            {
                await DeployToAgentAsync(jobId, request, agentId, cancellationToken);
            }
            finally
            {
                semaphore.Release();
            }
        });

        await Task.WhenAll(tasks);
        await UpdateDeploymentStatusAsync(jobId, "completed", null, cancellationToken);
    }

    private async Task ExecuteSequentialDeploymentAsync(int jobId, PolicyDeploymentRequest request, List<string> targetAgents, CancellationToken cancellationToken)
    {
        foreach (var agentId in targetAgents)
        {
            await DeployToAgentAsync(jobId, request, agentId, cancellationToken);
        }
        await UpdateDeploymentStatusAsync(jobId, "completed", null, cancellationToken);
    }

    private async Task DeployToAgentAsync(int jobId, PolicyDeploymentRequest request, string agentId, CancellationToken cancellationToken)
    {
        try
        {
            var executionId = Guid.NewGuid().ToString();
            var command = new PolicyExecutionCommand
            {
                ExecutionId = executionId,
                AgentId = agentId,
                PolicyId = request.PolicyId,
                PolicyName = request.PolicyName,
                ExecutionSteps = request.ExecutionFlow,
                TriggerType = request.TriggerType,
                TriggeredBy = request.TriggeredBy
            };

            // Add to pending commands
            if (!_pendingCommands.ContainsKey(agentId))
            {
                _pendingCommands[agentId] = new List<PolicyExecutionCommand>();
            }
            _pendingCommands[agentId].Add(command);

            _logger.LogInformation("Deployed policy {PolicyId} to agent {AgentId} with execution ID {ExecutionId}", 
                request.PolicyId, agentId, executionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deploy policy to agent {AgentId}", agentId);
            throw;
        }
    }

    private async Task UpdateDeploymentStatusAsync(int jobId, string status, string? errorMessage, CancellationToken cancellationToken)
    {
        try
        {
            using var connection = _dbFactory.Open();
            const string sql = @"
                UPDATE uem_app_policy_deployment_jobs 
                SET status = @Status, completed_at = CASE WHEN @Status IN ('completed', 'failed', 'cancelled') THEN NOW() ELSE completed_at END
                WHERE id = @JobId";

            await connection.ExecuteAsync(sql, new { JobId = jobId, Status = status });

            // Update cache
            if (_deploymentCache.TryGetValue(jobId, out var cachedStatus))
            {
                cachedStatus.Status = status;
                if (status is "completed" or "failed" or "cancelled")
                {
                    cachedStatus.CompletedAt = DateTime.UtcNow;
                }
                if (!string.IsNullOrEmpty(errorMessage))
                {
                    cachedStatus.ErrorMessage = errorMessage;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update deployment status for job {JobId}", jobId);
        }
    }

    private async Task StoreExecutionResultAsync(PolicyExecutionResult result, CancellationToken cancellationToken)
    {
        using var connection = _dbFactory.Open();
        const string sql = @"
            CREATE TABLE IF NOT EXISTS uem_app_policy_execution_results (
                id SERIAL PRIMARY KEY,
                execution_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                policy_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                progress REAL DEFAULT 0.0,
                total_steps INTEGER NOT NULL,
                completed_steps INTEGER DEFAULT 0,
                current_step INTEGER DEFAULT 1,
                execution_results JSONB,
                final_output TEXT,
                final_status TEXT,
                error_summary TEXT,
                total_execution_time_ms BIGINT DEFAULT 0,
                started_at TIMESTAMPTZ,
                completed_at TIMESTAMPTZ,
                agent_version TEXT,
                operating_system TEXT,
                os_version TEXT,
                retry_count INTEGER DEFAULT 0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            INSERT INTO uem_app_policy_execution_results (
                execution_id, agent_id, policy_id, status, progress, total_steps,
                completed_steps, current_step, execution_results, final_output,
                final_status, error_summary, total_execution_time_ms,
                started_at, completed_at, agent_version, operating_system,
                os_version, retry_count
            ) VALUES (
                @ExecutionId, @AgentId, @PolicyId, @Status, @Progress, @TotalSteps,
                @CompletedSteps, @CurrentStep, @ExecutionResults, @FinalOutput,
                @FinalStatus, @ErrorSummary, @TotalExecutionTimeMs,
                @StartedAt, @CompletedAt, @AgentVersion, @OperatingSystem,
                @OsVersion, @RetryCount
            ) ON CONFLICT (execution_id) DO UPDATE SET
                status = EXCLUDED.status,
                progress = EXCLUDED.progress,
                completed_steps = EXCLUDED.completed_steps,
                current_step = EXCLUDED.current_step,
                execution_results = EXCLUDED.execution_results,
                final_output = EXCLUDED.final_output,
                final_status = EXCLUDED.final_status,
                error_summary = EXCLUDED.error_summary,
                total_execution_time_ms = EXCLUDED.total_execution_time_ms,
                completed_at = EXCLUDED.completed_at,
                retry_count = EXCLUDED.retry_count";

        await connection.ExecuteAsync(sql, new
        {
            result.ExecutionId,
            result.AgentId,
            result.PolicyId,
            result.Status,
            result.Progress,
            result.TotalSteps,
            result.CompletedSteps,
            result.CurrentStep,
            ExecutionResults = JsonSerializer.Serialize(result.StepResults),
            result.FinalOutput,
            result.FinalStatus,
            result.ErrorSummary,
            result.TotalExecutionTimeMs,
            result.StartedAt,
            result.CompletedAt,
            result.AgentVersion,
            result.OperatingSystem,
            result.OsVersion,
            result.RetryCount
        });
    }

    private async Task UpdateDeploymentProgressAsync(PolicyExecutionResult result, CancellationToken cancellationToken)
    {
        // This would update deployment job progress based on individual execution results
        // Implementation would track completion across all target agents
        await Task.CompletedTask;
    }

    private async Task<bool> MatchesAgentCriteriaAsync(string agentId, PolicyTargetCriteria criteria, CancellationToken cancellationToken)
    {
        var agentInfo = await _agentStatusService.GetAgentSystemInfoAsync(agentId, cancellationToken);
        if (agentInfo == null) return false;

        if (criteria.OperatingSystem?.Count > 0 && !criteria.OperatingSystem.Contains(agentInfo.OperatingSystem))
            return false;

        if (criteria.OsVersion?.Count > 0 && !string.IsNullOrEmpty(agentInfo.OsVersion) && !criteria.OsVersion.Contains(agentInfo.OsVersion))
            return false;

        if (criteria.Domain?.Count > 0 && !string.IsNullOrEmpty(agentInfo.Domain) && !criteria.Domain.Contains(agentInfo.Domain))
            return false;

        if (criteria.AgentVersion?.Count > 0 && !string.IsNullOrEmpty(agentInfo.AgentVersion) && !criteria.AgentVersion.Contains(agentInfo.AgentVersion))
            return false;

        return true;
    }

    private string GetAgentHostname(string agentId)
    {
        // Simplified - in real implementation would query from agent status service
        return $"Agent-{agentId}";
    }

    private PolicyExecutionResult MapToExecutionResult(dynamic row)
    {
        var stepResults = row.execution_results != null 
            ? JsonSerializer.Deserialize<List<PolicyStepResult>>(row.execution_results)
            : new List<PolicyStepResult>();

        return new PolicyExecutionResult
        {
            ExecutionId = row.execution_id,
            AgentId = row.agent_id,
            PolicyId = row.policy_id,
            Status = row.status,
            Progress = row.progress,
            TotalSteps = row.total_steps,
            CompletedSteps = row.completed_steps,
            CurrentStep = row.current_step,
            StepResults = stepResults ?? new List<PolicyStepResult>(),
            FinalOutput = row.final_output,
            FinalStatus = row.final_status,
            ErrorSummary = row.error_summary,
            TotalExecutionTimeMs = row.total_execution_time_ms,
            StartedAt = row.started_at,
            CompletedAt = row.completed_at,
            AgentVersion = row.agent_version,
            OperatingSystem = row.operating_system,
            OsVersion = row.os_version,
            RetryCount = row.retry_count,
            ReportedAt = row.created_at
        };
    }

    #endregion
}

public class ScriptPolicy
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? TargetOs { get; set; }
    public string? Parameters { get; set; }
    public string? OutputFormat { get; set; }
    public int? EstimatedRunTimeSeconds { get; set; }
    public bool? RequiresElevation { get; set; }
    public string? Vendor { get; set; }
    public string? Version { get; set; }
    public string? PublishStatus { get; set; }
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
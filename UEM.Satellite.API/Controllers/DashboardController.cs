using Microsoft.AspNetCore.Mvc;
using Dapper;
using UEM.Satellite.API.Data;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDbFactory dbFactory, ILogger<DashboardController> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        try
        {
            using var connection = _dbFactory.Open();
            var stats = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT 
                    total_endpoints as totalEndpoints,
                    online_endpoints as onlineEndpoints,
                    offline_endpoints as offlineEndpoints,
                    critical_alerts as criticalAlerts,
                    warning_alerts as warningAlerts,
                    total_users as totalUsers,
                    active_policies as activePolicies,
                    pending_deployments as pendingDeployments,
                    completed_discoveries as completedDiscoveries,
                    failed_discoveries as failedDiscoveries,
                    total_scripts as totalScripts,
                    successful_script_executions as successfulScriptExecutions,
                    last_updated as lastUpdated
                FROM uem_app_dashboard_stats
                ORDER BY last_updated DESC
                LIMIT 1");
            
            // If no stats exist, return default values
            if (stats == null)
            {
                stats = new
                {
                    totalEndpoints = 0,
                    onlineEndpoints = 0,
                    offlineEndpoints = 0,
                    criticalAlerts = 0,
                    warningAlerts = 0,
                    totalUsers = 0,
                    activePolicies = 0,
                    pendingDeployments = 0,
                    completedDiscoveries = 0,
                    failedDiscoveries = 0,
                    totalScripts = 0,
                    successfulScriptExecutions = 0,
                    lastUpdated = DateTime.UtcNow
                };
            }
            
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch dashboard stats");
            return StatusCode(500, new { message = "Failed to fetch dashboard stats" });
        }
    }

    [HttpGet("activities")]
    public async Task<ActionResult<IEnumerable<object>>> GetRecentActivities([FromQuery] int limit = 20)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var activities = await connection.QueryAsync<object>(@"
                SELECT 
                    id,
                    action_type as actionType,
                    action_description as actionDescription,
                    user_id as userId,
                    username,
                    endpoint_id as endpointId,
                    endpoint_name as endpointName,
                    severity,
                    details,
                    tenant_id as tenantId,
                    domain_id as domainId,
                    created_at as createdAt
                FROM uem_app_activity_logs
                ORDER BY created_at DESC
                LIMIT @Limit", new { Limit = Math.Min(limit, 100) });
            
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch recent activities");
            return StatusCode(500, new { message = "Failed to fetch recent activities" });
        }
    }

    [HttpGet("system-status")]
    public async Task<ActionResult<object>> GetSystemStatus()
    {
        try
        {
            using var connection = _dbFactory.Open();
            var status = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT 
                    system_version as systemVersion,
                    database_status as databaseStatus,
                    cache_status as cacheStatus,
                    message_queue_status as messageQueueStatus,
                    storage_status as storageStatus,
                    api_status as apiStatus,
                    overall_health as overallHealth,
                    last_health_check as lastHealthCheck,
                    uptime_seconds as uptimeSeconds
                FROM uem_app_system_status
                ORDER BY last_health_check DESC
                LIMIT 1");
            
            // If no status exists, return default values
            if (status == null)
            {
                status = new
                {
                    systemVersion = "1.0.0",
                    databaseStatus = "healthy",
                    cacheStatus = "healthy",
                    messageQueueStatus = "healthy",
                    storageStatus = "healthy",
                    apiStatus = "healthy",
                    overallHealth = "healthy",
                    lastHealthCheck = DateTime.UtcNow,
                    uptimeSeconds = 0
                };
            }
            
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch system status");
            return StatusCode(500, new { message = "Failed to fetch system status" });
        }
    }

    [HttpPost("stats")]
    public async Task<ActionResult<object>> UpdateDashboardStats([FromBody] UpdateStatsRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            // Insert or update the latest stats
            await connection.ExecuteAsync(@"
                INSERT INTO uem_app_dashboard_stats (
                    total_endpoints, online_endpoints, offline_endpoints, critical_alerts, 
                    warning_alerts, total_users, active_policies, pending_deployments,
                    completed_discoveries, failed_discoveries, total_scripts, 
                    successful_script_executions, last_updated
                ) VALUES (
                    @TotalEndpoints, @OnlineEndpoints, @OfflineEndpoints, @CriticalAlerts,
                    @WarningAlerts, @TotalUsers, @ActivePolicies, @PendingDeployments,
                    @CompletedDiscoveries, @FailedDiscoveries, @TotalScripts,
                    @SuccessfulScriptExecutions, CURRENT_TIMESTAMP
                )", request);
            
            // Return the updated stats
            var stats = await connection.QueryFirstAsync<object>(@"
                SELECT 
                    total_endpoints as totalEndpoints,
                    online_endpoints as onlineEndpoints,
                    offline_endpoints as offlineEndpoints,
                    critical_alerts as criticalAlerts,
                    warning_alerts as warningAlerts,
                    total_users as totalUsers,
                    active_policies as activePolicies,
                    pending_deployments as pendingDeployments,
                    completed_discoveries as completedDiscoveries,
                    failed_discoveries as failedDiscoveries,
                    total_scripts as totalScripts,
                    successful_script_executions as successfulScriptExecutions,
                    last_updated as lastUpdated
                FROM uem_app_dashboard_stats
                ORDER BY last_updated DESC
                LIMIT 1");
            
            return CreatedAtAction(nameof(GetDashboardStats), stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update dashboard stats");
            return BadRequest(new { message = "Invalid dashboard stats data" });
        }
    }
}

public record UpdateStatsRequest(
    int TotalEndpoints,
    int OnlineEndpoints,
    int OfflineEndpoints,
    int CriticalAlerts,
    int WarningAlerts,
    int TotalUsers,
    int ActivePolicies,
    int PendingDeployments,
    int CompletedDiscoveries,
    int FailedDiscoveries,
    int TotalScripts,
    int SuccessfulScriptExecutions
);
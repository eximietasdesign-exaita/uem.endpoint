using UEM.Satellite.API.Models;
using UEM.Satellite.API.Data;
using Dapper;
using System.Text.Json;
using System.Collections.Concurrent;

namespace UEM.Satellite.API.Services;

/// <summary>
/// Agent status and capabilities service implementation
/// </summary>
public class AgentStatusService : IAgentStatusService
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<AgentStatusService> _logger;
    private readonly ConcurrentDictionary<string, AgentPolicyCapabilities> _capabilitiesCache = new();
    private readonly ConcurrentDictionary<string, AgentSystemInfo> _systemInfoCache = new();
    private readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(5);

    public AgentStatusService(IDbFactory dbFactory, ILogger<AgentStatusService> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task<AgentPolicyCapabilities?> GetAgentCapabilitiesAsync(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check cache first
            if (_capabilitiesCache.TryGetValue(agentId, out var cachedCapabilities))
            {
                if (DateTime.UtcNow - cachedCapabilities.LastCapabilityUpdate < _cacheExpiry)
                {
                    return cachedCapabilities;
                }
            }

            // Load from database or create default
            var capabilities = await LoadAgentCapabilitiesFromDatabaseAsync(agentId, cancellationToken) 
                              ?? await CreateDefaultCapabilitiesAsync(agentId, cancellationToken);

            if (capabilities != null)
            {
                _capabilitiesCache[agentId] = capabilities;
            }

            return capabilities;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get capabilities for agent {AgentId}", agentId);
            return null;
        }
    }

    public async Task UpdateAgentCapabilitiesAsync(AgentPolicyCapabilities capabilities, CancellationToken cancellationToken = default)
    {
        if (capabilities == null)
            throw new ArgumentNullException(nameof(capabilities));

        try
        {
            capabilities.LastCapabilityUpdate = DateTime.UtcNow;

            // Store in database
            await StoreAgentCapabilitiesAsync(capabilities, cancellationToken);

            // Update cache
            _capabilitiesCache[capabilities.AgentId] = capabilities;

            _logger.LogInformation("Updated capabilities for agent {AgentId}", capabilities.AgentId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update capabilities for agent {AgentId}", capabilities.AgentId);
            throw;
        }
    }

    public async Task<List<string>> GetActiveAgentsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            // Get agents from the heartbeat table that have been seen recently
            const string sql = @"
                SELECT DISTINCT agent_id 
                FROM agent_heartbeat_current 
                WHERE last_contacted > NOW() - INTERVAL '5 minutes'
                ORDER BY agent_id";

            var agentIds = await connection.QueryAsync<string>(sql);
            return agentIds.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get active agents from database, using cache");
            
            // Fallback to cache
            return _systemInfoCache
                .Where(kvp => DateTime.UtcNow - kvp.Value.LastHeartbeat < TimeSpan.FromMinutes(5))
                .Select(kvp => kvp.Key)
                .ToList();
        }
    }

    public async Task<bool> IsAgentOnlineAsync(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            const string sql = @"
                SELECT 1 FROM agent_heartbeat_current 
                WHERE agent_id = @AgentId 
                AND last_contacted > NOW() - INTERVAL '2 minutes'";

            var result = await connection.QueryFirstOrDefaultAsync<int?>(sql, new { AgentId = agentId });
            return result.HasValue;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check agent online status for {AgentId}", agentId);
            
            // Fallback to cache
            if (_systemInfoCache.TryGetValue(agentId, out var info))
            {
                return DateTime.UtcNow - info.LastHeartbeat < TimeSpan.FromMinutes(2);
            }
            
            return false;
        }
    }

    public async Task<AgentSystemInfo?> GetAgentSystemInfoAsync(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check cache first
            if (_systemInfoCache.TryGetValue(agentId, out var cachedInfo))
            {
                if (DateTime.UtcNow - cachedInfo.LastHeartbeat < _cacheExpiry)
                {
                    return cachedInfo;
                }
            }

            // Load from database
            var systemInfo = await LoadAgentSystemInfoFromDatabaseAsync(agentId, cancellationToken);
            
            if (systemInfo != null)
            {
                _systemInfoCache[agentId] = systemInfo;
            }

            return systemInfo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get system info for agent {AgentId}", agentId);
            return null;
        }
    }

    #region Private Methods

    private async Task<AgentPolicyCapabilities?> LoadAgentCapabilitiesFromDatabaseAsync(string agentId, CancellationToken cancellationToken)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            // Try to load from a capabilities table (if it exists)
            const string sql = @"
                CREATE TABLE IF NOT EXISTS agent_policy_capabilities (
                    agent_id TEXT PRIMARY KEY,
                    supported_script_types JSONB,
                    operating_system TEXT,
                    os_version TEXT,
                    agent_version TEXT,
                    supports_parallel_execution BOOLEAN DEFAULT true,
                    max_concurrent_executions INTEGER DEFAULT 5,
                    supports_long_running_tasks BOOLEAN DEFAULT true,
                    available_features JSONB,
                    last_capability_update TIMESTAMPTZ DEFAULT NOW()
                );

                SELECT 
                    agent_id, supported_script_types, operating_system, os_version,
                    agent_version, supports_parallel_execution, max_concurrent_executions,
                    supports_long_running_tasks, available_features, last_capability_update
                FROM agent_policy_capabilities 
                WHERE agent_id = @AgentId";

            var result = await connection.QueryFirstOrDefaultAsync(sql, new { AgentId = agentId });
            
            if (result == null)
                return null;

            return new AgentPolicyCapabilities
            {
                AgentId = result.agent_id,
                SupportedScriptTypes = JsonSerializer.Deserialize<List<string>>(result.supported_script_types ?? "[]") ?? new List<string>(),
                OperatingSystem = result.operating_system ?? "Unknown",
                OsVersion = result.os_version,
                AgentVersion = result.agent_version,
                SupportsParallelExecution = result.supports_parallel_execution ?? true,
                MaxConcurrentExecutions = result.max_concurrent_executions ?? 5,
                SupportsLongRunningTasks = result.supports_long_running_tasks ?? true,
                AvailableFeatures = JsonSerializer.Deserialize<List<string>>(result.available_features ?? "[]") ?? new List<string>(),
                LastCapabilityUpdate = result.last_capability_update ?? DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load capabilities from database for agent {AgentId}", agentId);
            return null;
        }
    }

    private async Task<AgentPolicyCapabilities?> CreateDefaultCapabilitiesAsync(string agentId, CancellationToken cancellationToken)
    {
        try
        {
            // Get basic agent info to determine capabilities
            var systemInfo = await GetAgentSystemInfoAsync(agentId, cancellationToken);
            if (systemInfo == null)
                return null;

            var defaultCapabilities = new AgentPolicyCapabilities
            {
                AgentId = agentId,
                OperatingSystem = systemInfo.OperatingSystem,
                OsVersion = systemInfo.OsVersion,
                AgentVersion = systemInfo.AgentVersion,
                SupportsParallelExecution = true,
                MaxConcurrentExecutions = 5,
                SupportsLongRunningTasks = true,
                LastCapabilityUpdate = DateTime.UtcNow
            };

            // Set default script types based on OS
            defaultCapabilities.SupportedScriptTypes = systemInfo.OperatingSystem.ToLowerInvariant() switch
            {
                var os when os.Contains("windows") => new List<string> { "powershell", "batch", "wmi" },
                var os when os.Contains("linux") => new List<string> { "bash", "python", "shell" },
                var os when os.Contains("macos") => new List<string> { "bash", "python", "shell" },
                _ => new List<string> { "bash", "powershell" }
            };

            // Set default features
            defaultCapabilities.AvailableFeatures = new List<string>
            {
                "script_execution",
                "file_operations",
                "registry_access",
                "service_management",
                "network_operations"
            };

            // Store default capabilities
            await StoreAgentCapabilitiesAsync(defaultCapabilities, cancellationToken);

            return defaultCapabilities;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create default capabilities for agent {AgentId}", agentId);
            return null;
        }
    }

    private async Task StoreAgentCapabilitiesAsync(AgentPolicyCapabilities capabilities, CancellationToken cancellationToken)
    {
        using var connection = _dbFactory.Open();
        
        const string sql = @"
            INSERT INTO agent_policy_capabilities (
                agent_id, supported_script_types, operating_system, os_version,
                agent_version, supports_parallel_execution, max_concurrent_executions,
                supports_long_running_tasks, available_features, last_capability_update
            ) VALUES (
                @AgentId, @SupportedScriptTypes, @OperatingSystem, @OsVersion,
                @AgentVersion, @SupportsParallelExecution, @MaxConcurrentExecutions,
                @SupportsLongRunningTasks, @AvailableFeatures, @LastCapabilityUpdate
            ) ON CONFLICT (agent_id) DO UPDATE SET
                supported_script_types = EXCLUDED.supported_script_types,
                operating_system = EXCLUDED.operating_system,
                os_version = EXCLUDED.os_version,
                agent_version = EXCLUDED.agent_version,
                supports_parallel_execution = EXCLUDED.supports_parallel_execution,
                max_concurrent_executions = EXCLUDED.max_concurrent_executions,
                supports_long_running_tasks = EXCLUDED.supports_long_running_tasks,
                available_features = EXCLUDED.available_features,
                last_capability_update = EXCLUDED.last_capability_update";

        await connection.ExecuteAsync(sql, new
        {
            capabilities.AgentId,
            SupportedScriptTypes = JsonSerializer.Serialize(capabilities.SupportedScriptTypes),
            capabilities.OperatingSystem,
            capabilities.OsVersion,
            capabilities.AgentVersion,
            capabilities.SupportsParallelExecution,
            capabilities.MaxConcurrentExecutions,
            capabilities.SupportsLongRunningTasks,
            AvailableFeatures = JsonSerializer.Serialize(capabilities.AvailableFeatures),
            capabilities.LastCapabilityUpdate
        });
    }

    private async Task<AgentSystemInfo?> LoadAgentSystemInfoFromDatabaseAsync(string agentId, CancellationToken cancellationToken)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            const string sql = @"
                SELECT 
                    agent_id, hostname, ip_address, mac_address, agent_version, last_contacted
                FROM agent_heartbeat_current 
                WHERE agent_id = @AgentId";

            var result = await connection.QueryFirstOrDefaultAsync(sql, new { AgentId = agentId });
            
            if (result == null)
                return null;

            // Try to get more detailed info from agents table if it exists
            const string detailedSql = @"
                SELECT 
                    operating_system, os_version, domain, status
                FROM agents 
                WHERE agent_id = @AgentId";

            var detailedInfo = await connection.QueryFirstOrDefaultAsync(detailedSql, new { AgentId = agentId });

            return new AgentSystemInfo
            {
                AgentId = result.agent_id,
                Hostname = result.hostname ?? "Unknown",
                OperatingSystem = detailedInfo?.operating_system ?? "Unknown",
                OsVersion = detailedInfo?.os_version,
                AgentVersion = result.agent_version,
                Domain = detailedInfo?.domain,
                LastHeartbeat = result.last_contacted ?? DateTime.UtcNow.AddMinutes(-10),
                Status = detailedInfo?.status ?? "Unknown",
                Tags = new List<string>() // Could be loaded from a separate tags table
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to load system info from database for agent {AgentId}", agentId);
            return null;
        }
    }

    #endregion
}
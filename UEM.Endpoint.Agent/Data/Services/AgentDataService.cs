using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using UEM.Endpoint.Agent.Data.Contexts;
using UEM.Endpoint.Agent.Data.Models;
using UEM.Endpoint.Agent.Services;

namespace UEM.Endpoint.Agent.Data.Services;

/// <summary>
/// Service for managing agent data that gets sent to the server
/// Handles: heartbeats, discoveries, script executions, registrations, API communications
/// </summary>
public class AgentDataService
{
    private readonly AgentDataContext _context;
    private readonly ILogger<AgentDataService> _logger;

    public AgentDataService(AgentDataContext context, ILogger<AgentDataService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Heartbeat Operations

    /// <summary>
    /// Store heartbeat data before sending to server
    /// </summary>
    public async Task<int> StoreHeartbeatAsync(string agentId, string uniqueId, string? serialNumber, 
        string hostname, string? ipAddress, string? macAddress, string? agentVersion)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreHeartbeat");

        var heartbeat = new HeartbeatRecord
        {
            AgentId = agentId,
            UniqueId = uniqueId,
            SerialNumber = serialNumber,
            Hostname = hostname,
            IpAddress = ipAddress,
            MacAddress = macAddress,
            AgentVersion = agentVersion,
            Timestamp = DateTime.UtcNow,
            SentToServer = false
        };

        _context.Heartbeats.Add(heartbeat);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Stored heartbeat for agent {AgentId} with ID {HeartbeatId}", agentId, heartbeat.Id);
        return heartbeat.Id;
    }

    /// <summary>
    /// Mark heartbeat as sent to server with response details
    /// </summary>
    public async Task MarkHeartbeatSentAsync(int heartbeatId, int responseCode, string? responseMessage = null)
    {
        var heartbeat = await _context.Heartbeats.FindAsync(heartbeatId);
        if (heartbeat != null)
        {
            heartbeat.SentToServer = true;
            heartbeat.ServerSentAt = DateTime.UtcNow;
            heartbeat.ServerResponseCode = responseCode;
            heartbeat.ServerResponseMessage = responseMessage;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Marked heartbeat {HeartbeatId} as sent with response code {ResponseCode}", 
                heartbeatId, responseCode);
        }
    }

    /// <summary>
    /// Get unsent heartbeats for retry logic
    /// </summary>
    public async Task<List<HeartbeatRecord>> GetUnsentHeartbeatsAsync(string agentId, int maxCount = 50)
    {
        return await _context.Heartbeats
            .Where(h => h.AgentId == agentId && !h.SentToServer)
            .OrderBy(h => h.Timestamp)
            .Take(maxCount)
            .ToListAsync();
    }

    #endregion

    #region Hardware Discovery Operations

    /// <summary>
    /// Store hardware discovery data before sending to server
    /// </summary>
    public async Task<int> StoreHardwareDiscoveryAsync(string agentId, object hardwareData, 
        string? discoverySessionId = null)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreHardwareDiscovery");

        var jsonData = JsonSerializer.Serialize(hardwareData, new JsonSerializerOptions { WriteIndented = false });
        var dataSize = System.Text.Encoding.UTF8.GetByteCount(jsonData);

        var discovery = new HardwareDiscoveryRecord
        {
            AgentId = agentId,
            HardwareDataJson = jsonData,
            DiscoveredAt = DateTime.UtcNow,
            SentToServer = false,
            DiscoverySessionId = discoverySessionId,
            DataSizeBytes = dataSize
        };

        _context.HardwareDiscoveries.Add(discovery);
        await _context.SaveChangesAsync();

        _logger.LogDiscoveryOperation("HardwareDiscovery", TimeSpan.Zero, 1, 
            $"Stored {dataSize} bytes for session {discoverySessionId}");
        return discovery.Id;
    }

    /// <summary>
    /// Mark hardware discovery as sent to server
    /// </summary>
    public async Task MarkHardwareDiscoverySentAsync(int discoveryId, int responseCode, string? responseMessage = null)
    {
        var discovery = await _context.HardwareDiscoveries.FindAsync(discoveryId);
        if (discovery != null)
        {
            discovery.SentToServer = true;
            discovery.ServerSentAt = DateTime.UtcNow;
            discovery.ServerResponseCode = responseCode;
            discovery.ServerResponseMessage = responseMessage;
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region Software Discovery Operations

    /// <summary>
    /// Store software discovery data before sending to server
    /// </summary>
    public async Task<int> StoreSoftwareDiscoveryAsync(string agentId, object softwareData, int softwareCount,
        string? discoverySessionId = null)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreSoftwareDiscovery");

        var jsonData = JsonSerializer.Serialize(softwareData, new JsonSerializerOptions { WriteIndented = false });
        var dataSize = System.Text.Encoding.UTF8.GetByteCount(jsonData);

        var discovery = new SoftwareDiscoveryRecord
        {
            AgentId = agentId,
            SoftwareDataJson = jsonData,
            DiscoveredAt = DateTime.UtcNow,
            SentToServer = false,
            DiscoverySessionId = discoverySessionId,
            DataSizeBytes = dataSize,
            SoftwareItemsCount = softwareCount
        };

        _context.SoftwareDiscoveries.Add(discovery);
        await _context.SaveChangesAsync();

        _logger.LogDiscoveryOperation("SoftwareDiscovery", TimeSpan.Zero, softwareCount, 
            $"Stored {dataSize} bytes for session {discoverySessionId}");
        return discovery.Id;
    }

    /// <summary>
    /// Mark software discovery as sent to server
    /// </summary>
    public async Task MarkSoftwareDiscoverySentAsync(int discoveryId, int responseCode, string? responseMessage = null)
    {
        var discovery = await _context.SoftwareDiscoveries.FindAsync(discoveryId);
        if (discovery != null)
        {
            discovery.SentToServer = true;
            discovery.ServerSentAt = DateTime.UtcNow;
            discovery.ServerResponseCode = responseCode;
            discovery.ServerResponseMessage = responseMessage;
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region Security Discovery Operations

    /// <summary>
    /// Store security discovery data before sending to server
    /// </summary>
    public async Task<int> StoreSecurityDiscoveryAsync(string agentId, object securityData,
        string? discoverySessionId = null)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreSecurityDiscovery");

        var jsonData = JsonSerializer.Serialize(securityData, new JsonSerializerOptions { WriteIndented = false });
        var dataSize = System.Text.Encoding.UTF8.GetByteCount(jsonData);

        var discovery = new SecurityDiscoveryRecord
        {
            AgentId = agentId,
            SecurityDataJson = jsonData,
            DiscoveredAt = DateTime.UtcNow,
            SentToServer = false,
            DiscoverySessionId = discoverySessionId,
            DataSizeBytes = dataSize
        };

        _context.SecurityDiscoveries.Add(discovery);
        await _context.SaveChangesAsync();

        _logger.LogDiscoveryOperation("SecurityDiscovery", TimeSpan.Zero, 1,
            $"Stored {dataSize} bytes for session {discoverySessionId}");
        return discovery.Id;
    }

    /// <summary>
    /// Mark security discovery as sent to server
    /// </summary>
    public async Task MarkSecurityDiscoverySentAsync(int discoveryId, int responseCode, string? responseMessage = null)
    {
        var discovery = await _context.SecurityDiscoveries.FindAsync(discoveryId);
        if (discovery != null)
        {
            discovery.SentToServer = true;
            discovery.ServerSentAt = DateTime.UtcNow;
            discovery.ServerResponseCode = responseCode;
            discovery.ServerResponseMessage = responseMessage;
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region Script Execution Operations

    /// <summary>
    /// Store script execution result before sending to server
    /// </summary>
    public async Task<int> StoreScriptExecutionAsync(string agentId, string commandId, string commandType,
        string scriptContent, object executionResult, int executionTimeMs, bool success, string? scriptType = null)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreScriptExecution");

        var jsonResult = JsonSerializer.Serialize(executionResult, new JsonSerializerOptions { WriteIndented = false });

        var execution = new ScriptExecutionRecord
        {
            AgentId = agentId,
            CommandId = commandId,
            CommandType = commandType,
            ScriptContent = scriptContent,
            ExecutionResultJson = jsonResult,
            ExecutedAt = DateTime.UtcNow,
            SentToServer = false,
            ExecutionTimeMs = executionTimeMs,
            ExecutionSuccess = success,
            ScriptType = scriptType
        };

        _context.ScriptExecutions.Add(execution);
        await _context.SaveChangesAsync();

        _logger.LogCommandExecution(commandId, commandType, success, TimeSpan.FromMilliseconds(executionTimeMs));
        return execution.Id;
    }

    /// <summary>
    /// Mark script execution as sent to server
    /// </summary>
    public async Task MarkScriptExecutionSentAsync(int executionId, int responseCode, string? responseMessage = null)
    {
        var execution = await _context.ScriptExecutions.FindAsync(executionId);
        if (execution != null)
        {
            execution.SentToServer = true;
            execution.ServerSentAt = DateTime.UtcNow;
            execution.ServerResponseCode = responseCode;
            execution.ServerResponseMessage = responseMessage;
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region API Communication Logging

    /// <summary>
    /// Log API communication for audit and retry purposes
    /// </summary>
    public async Task<int> LogApiCommunicationAsync(string agentId, string endpoint, string httpMethod,
        object requestData, object? responseData = null, int? statusCode = null, bool success = false,
        int durationMs = 0, string? errorMessage = null)
    {
        var requestJson = JsonSerializer.Serialize(requestData, new JsonSerializerOptions { WriteIndented = false });
        var responseJson = responseData != null 
            ? JsonSerializer.Serialize(responseData, new JsonSerializerOptions { WriteIndented = false }) 
            : null;

        var requestSize = System.Text.Encoding.UTF8.GetByteCount(requestJson);
        var responseSize = responseJson != null ? System.Text.Encoding.UTF8.GetByteCount(responseJson) : 0;

        var communication = new ApiCommunicationRecord
        {
            AgentId = agentId,
            Endpoint = endpoint,
            HttpMethod = httpMethod,
            RequestDataJson = requestJson,
            ResponseDataJson = responseJson,
            RequestTimestamp = DateTime.UtcNow,
            ResponseTimestamp = success ? DateTime.UtcNow : null,
            ResponseStatusCode = statusCode,
            RequestSizeBytes = requestSize,
            ResponseSizeBytes = responseSize,
            Success = success,
            ErrorMessage = errorMessage,
            DurationMs = durationMs
        };

        _context.ApiCommunications.Add(communication);
        await _context.SaveChangesAsync();

        _logger.LogApiCommunication(endpoint, httpMethod, statusCode ?? 0, TimeSpan.FromMilliseconds(durationMs));
        return communication.Id;
    }

    #endregion

    #region Data Cleanup and Maintenance

    /// <summary>
    /// Clean up old sent data to prevent database bloat
    /// </summary>
    public async Task CleanupOldDataAsync(int keepDays = 30)
    {
        using var timer = _logger.BeginPerformanceTimer("DatabaseCleanup");
        var cutoffDate = DateTime.UtcNow.AddDays(-keepDays);

        try
        {
            // Clean up old heartbeats
            var oldHeartbeats = await _context.Heartbeats
                .Where(h => h.SentToServer && h.Timestamp < cutoffDate)
                .CountAsync();
            
            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM heartbeats WHERE SentToServer = 1 AND Timestamp < {0}", cutoffDate);

            // Clean up old API communications
            var oldApiCalls = await _context.ApiCommunications
                .Where(a => a.RequestTimestamp < cutoffDate)
                .CountAsync();

            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM api_communications WHERE RequestTimestamp < {0}", cutoffDate);

            _logger.LogInformation("Database cleanup completed: {HeartbeatCount} heartbeats, {ApiCallCount} API calls removed",
                oldHeartbeats, oldApiCalls);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database cleanup failed");
            throw;
        }
    }

    /// <summary>
    /// Get database statistics
    /// </summary>
    public async Task<Dictionary<string, int>> GetDatabaseStatsAsync()
    {
        return new Dictionary<string, int>
        {
            ["Heartbeats"] = await _context.Heartbeats.CountAsync(),
            ["HardwareDiscoveries"] = await _context.HardwareDiscoveries.CountAsync(),
            ["SoftwareDiscoveries"] = await _context.SoftwareDiscoveries.CountAsync(),
            ["SecurityDiscoveries"] = await _context.SecurityDiscoveries.CountAsync(),
            ["ScriptExecutions"] = await _context.ScriptExecutions.CountAsync(),
            ["AgentRegistrations"] = await _context.AgentRegistrations.CountAsync(),
            ["ApiCommunications"] = await _context.ApiCommunications.CountAsync(),
            ["UnsentHeartbeats"] = await _context.Heartbeats.CountAsync(h => !h.SentToServer),
            ["UnsentDiscoveries"] = await _context.HardwareDiscoveries.CountAsync(h => !h.SentToServer) +
                                   await _context.SoftwareDiscoveries.CountAsync(s => !s.SentToServer) +
                                   await _context.SecurityDiscoveries.CountAsync(s => !s.SentToServer),
            ["UnsentScriptExecutions"] = await _context.ScriptExecutions.CountAsync(s => !s.SentToServer)
        };
    }

    #endregion
}
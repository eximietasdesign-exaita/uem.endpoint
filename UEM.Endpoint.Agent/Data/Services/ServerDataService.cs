using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using UEM.Endpoint.Agent.Data.Contexts;
using UEM.Endpoint.Agent.Data.Models;
using UEM.Endpoint.Agent.Services;

namespace UEM.Endpoint.Agent.Data.Services;

/// <summary>
/// Service for managing server data received by the agent
/// Handles: configurations, commands, scripts, policies, updates, responses, notifications
/// </summary>
public class ServerDataService
{
    private readonly ServerDataContext _context;
    private readonly ILogger<ServerDataService> _logger;

    public ServerDataService(ServerDataContext context, ILogger<ServerDataService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Configuration Operations

    /// <summary>
    /// Store configuration received from server
    /// </summary>
    public async Task<int> StoreConfigurationAsync(string agentId, string configType, object configData,
        string? configVersion = null, string? configHash = null)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreConfiguration");

        var jsonData = JsonSerializer.Serialize(configData, new JsonSerializerOptions { WriteIndented = false });
        var dataSize = System.Text.Encoding.UTF8.GetByteCount(jsonData);

        // Deactivate previous configs of same type
        var existingConfigs = await _context.ServerConfigurations
            .Where(c => c.AgentId == agentId && c.ConfigType == configType && c.IsActive)
            .ToListAsync();

        foreach (var config in existingConfigs)
        {
            config.IsActive = false;
        }

        var newConfig = new ServerConfigurationRecord
        {
            AgentId = agentId,
            ConfigType = configType,
            ConfigDataJson = jsonData,
            ReceivedAt = DateTime.UtcNow,
            IsActive = true,
            ConfigVersion = configVersion,
            ConfigHash = configHash,
            DataSizeBytes = dataSize
        };

        _context.ServerConfigurations.Add(newConfig);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Stored configuration {ConfigType} for agent {AgentId} with {DataSize} bytes",
            configType, agentId, dataSize);
        return newConfig.Id;
    }

    /// <summary>
    /// Get active configuration by type
    /// </summary>
    public async Task<ServerConfigurationRecord?> GetActiveConfigurationAsync(string agentId, string configType)
    {
        return await _context.ServerConfigurations
            .Where(c => c.AgentId == agentId && c.ConfigType == configType && c.IsActive)
            .OrderByDescending(c => c.ReceivedAt)
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Mark configuration as applied
    /// </summary>
    public async Task MarkConfigurationAppliedAsync(int configId)
    {
        var config = await _context.ServerConfigurations.FindAsync(configId);
        if (config != null)
        {
            config.AppliedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region Command Operations

    /// <summary>
    /// Store command received from server
    /// </summary>
    public async Task<int> StoreCommandAsync(string agentId, string commandId, string commandType,
        object commandPayload, int timeToLiveSeconds = 3600)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreCommand");

        var jsonPayload = JsonSerializer.Serialize(commandPayload, new JsonSerializerOptions { WriteIndented = false });
        var payloadSize = System.Text.Encoding.UTF8.GetByteCount(jsonPayload);

        var command = new ServerCommandRecord
        {
            AgentId = agentId,
            CommandId = commandId,
            CommandType = commandType,
            CommandPayloadJson = jsonPayload,
            ReceivedAt = DateTime.UtcNow,
            Status = "Pending",
            TimeToLiveSeconds = timeToLiveSeconds,
            IsExpired = false,
            PayloadSizeBytes = payloadSize
        };

        _context.ServerCommands.Add(command);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Stored command {CommandId} of type {CommandType} for agent {AgentId}",
            commandId, commandType, agentId);
        return command.Id;
    }

    /// <summary>
    /// Get pending commands for execution
    /// </summary>
    public async Task<List<ServerCommandRecord>> GetPendingCommandsAsync(string agentId, int maxCount = 10)
    {
        // Mark expired commands first
        await MarkExpiredCommandsAsync(agentId);

        return await _context.ServerCommands
            .Where(c => c.AgentId == agentId && c.Status == "Pending" && !c.IsExpired)
            .OrderBy(c => c.ReceivedAt)
            .Take(maxCount)
            .ToListAsync();
    }

    /// <summary>
    /// Update command execution status
    /// </summary>
    public async Task UpdateCommandStatusAsync(int commandId, string status, object? executionResult = null,
        string? errorMessage = null)
    {
        var command = await _context.ServerCommands.FindAsync(commandId);
        if (command != null)
        {
            command.Status = status;
            
            if (status == "Executing" && command.ExecutedAt == null)
            {
                command.ExecutedAt = DateTime.UtcNow;
            }
            else if (status is "Completed" or "Failed")
            {
                command.CompletedAt = DateTime.UtcNow;
            }

            if (executionResult != null)
            {
                command.ExecutionResultJson = JsonSerializer.Serialize(executionResult, 
                    new JsonSerializerOptions { WriteIndented = false });
            }

            if (!string.IsNullOrEmpty(errorMessage))
            {
                command.ErrorMessage = errorMessage;
            }

            await _context.SaveChangesAsync();

            _logger.LogCommandExecution(command.CommandId, command.CommandType, status == "Completed",
                command.CompletedAt - command.ExecutedAt, 
                status == "Completed" ? "Success" : null,
                status == "Failed" ? errorMessage : null);
        }
    }

    /// <summary>
    /// Mark expired commands based on TTL
    /// </summary>
    private async Task MarkExpiredCommandsAsync(string agentId)
    {
        var expiredCommands = await _context.ServerCommands
            .Where(c => c.AgentId == agentId && !c.IsExpired && 
                       DateTime.UtcNow > c.ReceivedAt.AddSeconds(c.TimeToLiveSeconds))
            .ToListAsync();

        foreach (var command in expiredCommands)
        {
            command.IsExpired = true;
            command.Status = "Expired";
        }

        if (expiredCommands.Any())
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Marked {Count} commands as expired for agent {AgentId}",
                expiredCommands.Count, agentId);
        }
    }

    #endregion

    #region Discovery Script Operations

    /// <summary>
    /// Store discovery script received from server
    /// </summary>
    public async Task<int> StoreDiscoveryScriptAsync(string agentId, string scriptId, string scriptName,
        string scriptContent, string scriptType, string? targetOS = null, string? scriptVersion = null,
        string? description = null)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreDiscoveryScript");

        var contentSize = System.Text.Encoding.UTF8.GetByteCount(scriptContent);

        // Deactivate previous version of same script
        var existingScripts = await _context.ServerDiscoveryScripts
            .Where(s => s.AgentId == agentId && s.ScriptId == scriptId && s.IsActive)
            .ToListAsync();

        foreach (var script in existingScripts)
        {
            script.IsActive = false;
        }

        var newScript = new ServerDiscoveryScriptRecord
        {
            AgentId = agentId,
            ScriptId = scriptId,
            ScriptName = scriptName,
            ScriptContent = scriptContent,
            ScriptType = scriptType,
            TargetOS = targetOS,
            ReceivedAt = DateTime.UtcNow,
            IsActive = true,
            ScriptVersion = scriptVersion,
            Description = description,
            ContentSizeBytes = contentSize,
            ExecutionCount = 0
        };

        _context.ServerDiscoveryScripts.Add(newScript);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Stored discovery script {ScriptName} ({ScriptId}) for agent {AgentId}",
            scriptName, scriptId, agentId);
        return newScript.Id;
    }

    /// <summary>
    /// Get active discovery scripts
    /// </summary>
    public async Task<List<ServerDiscoveryScriptRecord>> GetActiveDiscoveryScriptsAsync(string agentId,
        string? targetOS = null)
    {
        var query = _context.ServerDiscoveryScripts
            .Where(s => s.AgentId == agentId && s.IsActive);

        if (!string.IsNullOrEmpty(targetOS))
        {
            query = query.Where(s => s.TargetOS == null || s.TargetOS == targetOS);
        }

        return await query.OrderBy(s => s.ScriptName).ToListAsync();
    }

    /// <summary>
    /// Update script execution count
    /// </summary>
    public async Task UpdateScriptExecutionCountAsync(int scriptId)
    {
        var script = await _context.ServerDiscoveryScripts.FindAsync(scriptId);
        if (script != null)
        {
            script.ExecutionCount++;
            script.LastExecutedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region Server Response Logging

    /// <summary>
    /// Log server response for audit purposes
    /// </summary>
    public async Task<int> LogServerResponseAsync(string agentId, string endpoint, string httpMethod,
        object? responseData, int statusCode, int responseTimeMs, bool success,
        string? responseHeaders = null, string? errorMessage = null, string? correlationId = null)
    {
        var responseJson = responseData != null
            ? JsonSerializer.Serialize(responseData, new JsonSerializerOptions { WriteIndented = false })
            : null;

        var responseSize = responseJson != null ? System.Text.Encoding.UTF8.GetByteCount(responseJson) : 0;

        var response = new ServerResponseRecord
        {
            AgentId = agentId,
            Endpoint = endpoint,
            HttpMethod = httpMethod,
            ResponseDataJson = responseJson,
            ResponseTimestamp = DateTime.UtcNow,
            ResponseStatusCode = statusCode,
            ResponseSizeBytes = responseSize,
            ResponseHeaders = responseHeaders,
            Success = success,
            ErrorMessage = errorMessage,
            ResponseTimeMs = responseTimeMs,
            CorrelationId = correlationId
        };

        _context.ServerResponses.Add(response);
        await _context.SaveChangesAsync();

        _logger.LogApiCommunication(endpoint, httpMethod, statusCode, TimeSpan.FromMilliseconds(responseTimeMs));
        return response.Id;
    }

    #endregion

    #region Notification Operations

    /// <summary>
    /// Store notification received from server
    /// </summary>
    public async Task<int> StoreNotificationAsync(string agentId, string notificationId, string notificationType,
        string title, string message, string priority, DateTime? expiresAt = null, object? additionalData = null)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreNotification");

        var additionalDataJson = additionalData != null
            ? JsonSerializer.Serialize(additionalData, new JsonSerializerOptions { WriteIndented = false })
            : null;

        var notification = new ServerNotificationRecord
        {
            AgentId = agentId,
            NotificationId = notificationId,
            NotificationType = notificationType,
            Title = title,
            Message = message,
            Priority = priority,
            ReceivedAt = DateTime.UtcNow,
            ExpiresAt = expiresAt,
            IsRead = false,
            IsExpired = false,
            AdditionalDataJson = additionalDataJson
        };

        _context.ServerNotifications.Add(notification);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Stored notification {NotificationId} with priority {Priority} for agent {AgentId}",
            notificationId, priority, agentId);
        return notification.Id;
    }

    /// <summary>
    /// Get unread notifications
    /// </summary>
    public async Task<List<ServerNotificationRecord>> GetUnreadNotificationsAsync(string agentId)
    {
        // Mark expired notifications first
        await MarkExpiredNotificationsAsync(agentId);

        return await _context.ServerNotifications
            .Where(n => n.AgentId == agentId && !n.IsRead && !n.IsExpired)
            .OrderByDescending(n => n.ReceivedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Mark notification as read
    /// </summary>
    public async Task MarkNotificationReadAsync(int notificationId)
    {
        var notification = await _context.ServerNotifications.FindAsync(notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Mark expired notifications
    /// </summary>
    private async Task MarkExpiredNotificationsAsync(string agentId)
    {
        var expiredNotifications = await _context.ServerNotifications
            .Where(n => n.AgentId == agentId && !n.IsExpired && n.ExpiresAt != null && 
                       DateTime.UtcNow > n.ExpiresAt)
            .ToListAsync();

        foreach (var notification in expiredNotifications)
        {
            notification.IsExpired = true;
        }

        if (expiredNotifications.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    #endregion

    #region Data Cleanup and Maintenance

    /// <summary>
    /// Clean up old server data to prevent database bloat
    /// </summary>
    public async Task CleanupOldDataAsync(int keepDays = 90)
    {
        using var timer = _logger.BeginPerformanceTimer("ServerDataCleanup");
        var cutoffDate = DateTime.UtcNow.AddDays(-keepDays);

        try
        {
            // Clean up old responses
            var oldResponses = await _context.ServerResponses
                .Where(r => r.ResponseTimestamp < cutoffDate)
                .CountAsync();

            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM server_responses WHERE ResponseTimestamp < {0}", cutoffDate);

            // Clean up read notifications
            var oldNotifications = await _context.ServerNotifications
                .Where(n => n.IsRead && n.ReceivedAt < cutoffDate)
                .CountAsync();

            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM server_notifications WHERE IsRead = 1 AND ReceivedAt < {0}", cutoffDate);

            // Clean up completed commands
            var oldCommands = await _context.ServerCommands
                .Where(c => (c.Status == "Completed" || c.Status == "Failed" || c.IsExpired) && 
                           c.ReceivedAt < cutoffDate)
                .CountAsync();

            await _context.Database.ExecuteSqlRawAsync(
                "DELETE FROM server_commands WHERE (Status = 'Completed' OR Status = 'Failed' OR IsExpired = 1) AND ReceivedAt < {0}", 
                cutoffDate);

            _logger.LogInformation(
                "Server data cleanup completed: {ResponseCount} responses, {NotificationCount} notifications, {CommandCount} commands removed",
                oldResponses, oldNotifications, oldCommands);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Server data cleanup failed");
            throw;
        }
    }

    /// <summary>
    /// Get server database statistics
    /// </summary>
    public async Task<Dictionary<string, int>> GetDatabaseStatsAsync()
    {
        return new Dictionary<string, int>
        {
            ["ServerConfigurations"] = await _context.ServerConfigurations.CountAsync(),
            ["ServerCommands"] = await _context.ServerCommands.CountAsync(),
            ["ServerDiscoveryScripts"] = await _context.ServerDiscoveryScripts.CountAsync(),
            ["ServerPolicies"] = await _context.ServerPolicies.CountAsync(),
            ["ServerUpdates"] = await _context.ServerUpdates.CountAsync(),
            ["ServerResponses"] = await _context.ServerResponses.CountAsync(),
            ["ServerNotifications"] = await _context.ServerNotifications.CountAsync(),
            ["ActiveConfigurations"] = await _context.ServerConfigurations.CountAsync(c => c.IsActive),
            ["PendingCommands"] = await _context.ServerCommands.CountAsync(c => c.Status == "Pending" && !c.IsExpired),
            ["UnreadNotifications"] = await _context.ServerNotifications.CountAsync(n => !n.IsRead && !n.IsExpired)
        };
    }

    #endregion
}
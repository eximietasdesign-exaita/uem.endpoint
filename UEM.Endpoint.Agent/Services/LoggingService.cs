using Microsoft.Extensions.Logging;
using Serilog;
using System.Runtime.CompilerServices;

namespace UEM.Endpoint.Agent.Services;

/// <summary>
/// Enhanced logging service for UEM Agent with daily file-based logging
/// Provides structured logging with automatic context enrichment
/// </summary>
public static class LoggingService
{
    /// <summary>
    /// Log agent lifecycle events with structured data
    /// </summary>
    public static void LogAgentLifecycle(this ILogger logger, string eventType, string? details = null, 
        [CallerMemberName] string? callerName = null)
    {
        logger.LogInformation("Agent Lifecycle Event: {EventType} | Caller: {Caller} | Details: {Details}", 
            eventType, callerName, details);
    }

    /// <summary>
    /// Log discovery operations with timing and results
    /// </summary>
    public static void LogDiscoveryOperation(this ILogger logger, string operation, TimeSpan duration, 
        int? itemsFound = null, string? details = null)
    {
        logger.LogInformation("Discovery Operation: {Operation} | Duration: {Duration:mm\\:ss\\.fff} | Items: {ItemsFound} | Details: {Details}", 
            operation, duration, itemsFound, details);
    }

    /// <summary>
    /// Log heartbeat status with metrics
    /// </summary>
    public static void LogHeartbeat(this ILogger logger, string agentId, bool success, 
        TimeSpan? responseTime = null, string? error = null)
    {
        if (success)
        {
            logger.LogInformation("Heartbeat sent successfully | Agent: {AgentId} | ResponseTime: {ResponseTime:mm\\:ss\\.fff}", 
                agentId, responseTime);
        }
        else
        {
            logger.LogWarning("Heartbeat failed | Agent: {AgentId} | Error: {Error}", agentId, error);
        }
    }

    /// <summary>
    /// Log command execution with context
    /// </summary>
    public static void LogCommandExecution(this ILogger logger, string commandId, string commandType, 
        bool success, TimeSpan? duration = null, string? result = null, string? error = null)
    {
        if (success)
        {
            logger.LogInformation("Command executed successfully | ID: {CommandId} | Type: {CommandType} | Duration: {Duration:mm\\:ss\\.fff} | Result: {Result}", 
                commandId, commandType, duration, result);
        }
        else
        {
            logger.LogError("Command execution failed | ID: {CommandId} | Type: {CommandType} | Duration: {Duration:mm\\:ss\\.fff} | Error: {Error}", 
                commandId, commandType, duration, error);
        }
    }

    /// <summary>
    /// Log API communication events
    /// </summary>
    public static void LogApiCommunication(this ILogger logger, string endpoint, string method, 
        int statusCode, TimeSpan? duration = null, string? details = null)
    {
        if (statusCode >= 200 && statusCode < 300)
        {
            logger.LogInformation("API call successful | {Method} {Endpoint} | Status: {StatusCode} | Duration: {Duration:mm\\:ss\\.fff} | Details: {Details}", 
                method, endpoint, statusCode, duration, details);
        }
        else
        {
            logger.LogWarning("API call failed | {Method} {Endpoint} | Status: {StatusCode} | Duration: {Duration:mm\\:ss\\.fff} | Details: {Details}", 
                method, endpoint, statusCode, duration, details);
        }
    }

    /// <summary>
    /// Log security events with high priority
    /// </summary>
    public static void LogSecurityEvent(this ILogger logger, string eventType, string description, 
        LogLevel level = LogLevel.Warning, string? additionalData = null)
    {
        logger.Log(level, "SECURITY EVENT: {EventType} | Description: {Description} | Data: {AdditionalData}", 
            eventType, description, additionalData);
    }

    /// <summary>
    /// Log performance metrics
    /// </summary>
    public static void LogPerformanceMetric(this ILogger logger, string metricName, double value, 
        string? unit = null, string? context = null)
    {
        logger.LogInformation("Performance Metric | {MetricName}: {Value} {Unit} | Context: {Context}", 
            metricName, value, unit, context);
    }

    /// <summary>
    /// Create a performance timer that auto-logs completion
    /// </summary>
    public static IDisposable BeginPerformanceTimer(this ILogger logger, string operationName)
    {
        return new PerformanceTimer(logger, operationName);
    }

    private class PerformanceTimer : IDisposable
    {
        private readonly ILogger _logger;
        private readonly string _operationName;
        private readonly DateTime _startTime;
        private bool _disposed;

        public PerformanceTimer(ILogger logger, string operationName)
        {
            _logger = logger;
            _operationName = operationName;
            _startTime = DateTime.UtcNow;
            
            _logger.LogDebug("Performance timer started for operation: {OperationName}", _operationName);
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                var duration = DateTime.UtcNow - _startTime;
                _logger.LogPerformanceMetric(_operationName, duration.TotalMilliseconds, "ms");
                _disposed = true;
            }
        }
    }
}

/// <summary>
/// Log file rotation and cleanup service
/// </summary>
public class LogFileManager
{
    private readonly ILogger<LogFileManager> _logger;
    private readonly string[] _logDirectories = { "logs/agent", "logs/services", "logs/errors" };

    public LogFileManager(ILogger<LogFileManager> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Perform log file cleanup and rotation maintenance
    /// </summary>
    public async Task PerformMaintenanceAsync()
    {
        using var timer = _logger.BeginPerformanceTimer("LogMaintenanceOperation");
        
        try
        {
            foreach (var directory in _logDirectories)
            {
                if (Directory.Exists(directory))
                {
                    await CleanupOldLogsAsync(directory);
                    await CompressOldLogsAsync(directory);
                }
            }
            
            _logger.LogInformation("Log file maintenance completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Log file maintenance failed");
        }
    }

    private async Task CleanupOldLogsAsync(string directory)
    {
        var files = Directory.GetFiles(directory, "*.log")
            .Where(f => File.GetCreationTime(f) < DateTime.Now.AddDays(-60))
            .ToArray();

        foreach (var file in files)
        {
            try
            {
                File.Delete(file);
                _logger.LogDebug("Deleted old log file: {FileName}", Path.GetFileName(file));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to delete old log file: {FileName}", Path.GetFileName(file));
            }
        }

        if (files.Length > 0)
        {
            _logger.LogInformation("Cleaned up {FileCount} old log files from {Directory}", files.Length, directory);
        }

        await Task.CompletedTask;
    }

    private async Task CompressOldLogsAsync(string directory)
    {
        // Implementation for log compression if needed
        // This is a placeholder for future enhancement
        await Task.CompletedTask;
    }
}
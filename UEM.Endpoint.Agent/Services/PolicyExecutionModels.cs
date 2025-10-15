using System.Text.Json.Serialization;

namespace UEM.Endpoint.Agent.Services;

/// <summary>
/// Policy execution command received from server
/// </summary>
/// 

/*
public class PolicyExecutionCommand
{
    public string ExecutionId { get; set; } = string.Empty;
    public string AgentId { get; set; } = string.Empty;
    public int PolicyId { get; set; }
    public string PolicyName { get; set; } = string.Empty;
    public List<PolicyExecutionStep> ExecutionSteps { get; set; } = new();
    public int TimeoutSeconds { get; set; } = 1800;
    public string TriggerType { get; set; } = "manual";
    public int? TriggeredBy { get; set; }
    public DateTime IssuedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Individual policy execution step
/// </summary>
public class PolicyExecutionStep
{
    public int StepNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ScriptType { get; set; } = string.Empty;
    public string ScriptContent { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 300;
    public string OnSuccess { get; set; } = "continue"; // continue, stop, jump_to_step
    public string OnFailure { get; set; } = "stop"; // continue, stop, retry
    public int MaxRetries { get; set; } = 3;
    public int? JumpToStep { get; set; }
    public Dictionary<string, object>? Parameters { get; set; }
    public Dictionary<string, string>? EnvironmentVariables { get; set; }
    public bool RunAsAdmin { get; set; } = false;
    public string? WorkingDirectory { get; set; }
}

/// <summary>
/// Policy execution result sent back to server
/// </summary>
public class PolicyExecutionResult
{
    public string ExecutionId { get; set; } = string.Empty;
    public string AgentId { get; set; } = string.Empty;
    public int PolicyId { get; set; }
    public string Status { get; set; } = "pending"; // pending, running, completed, failed, cancelled
    public float Progress { get; set; } = 0.0f;
    public int TotalSteps { get; set; }
    public int CompletedSteps { get; set; }
    public int CurrentStep { get; set; } = 1;
    public List<PolicyStepResult> StepResults { get; set; } = new();
    public string? FinalOutput { get; set; }
    public string? FinalStatus { get; set; }
    public string? ErrorSummary { get; set; }
    public long TotalExecutionTimeMs { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? AgentVersion { get; set; }
    public string? OperatingSystem { get; set; }
    public string? OsVersion { get; set; }
    public int RetryCount { get; set; } = 0;
    public DateTime? ReportedAt { get; set; }
}

/// <summary>
/// Result of individual policy step execution
/// </summary>
public class PolicyStepResult
{
    public int StepNumber { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending, running, completed, failed, skipped
    public string? Output { get; set; }
    public string? Error { get; set; }
    public int? ExitCode { get; set; }
    public long ExecutionTimeMs { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int RetryCount { get; set; } = 0;
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Script execution request for individual steps
/// </summary>
public class ScriptExecutionRequest
{
    public string ScriptType { get; set; } = string.Empty;
    public string ScriptContent { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 300;
    public Dictionary<string, object>? Parameters { get; set; }
    public Dictionary<string, string>? EnvironmentVariables { get; set; }
    public bool RunAsAdmin { get; set; } = false;
    public string? WorkingDirectory { get; set; }
    public string ExecutionId { get; set; } = string.Empty;
    public int StepNumber { get; set; }
}

/// <summary>
/// Script execution result for individual scripts
/// </summary>
public class ScriptExecutionResult
{
    public bool Success { get; set; }
    public string? Output { get; set; }
    public string? Error { get; set; }
    public int? ExitCode { get; set; }
    public long ExecutionTimeMs { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}


/// <summary>
/// Performance extension methods for logging
/// </summary>
public static class LoggerExtensions
{
    public static IDisposable BeginPerformanceTimer(this ILogger logger, string operationName)
    {
        return new PerformanceTimer(logger, operationName);
    }
}

/// <summary>
/// Performance timer for measuring operation duration
/// </summary>
internal class PerformanceTimer : IDisposable
{
    private readonly ILogger _logger;
    private readonly string _operationName;
    private readonly DateTime _startTime;

    public PerformanceTimer(ILogger logger, string operationName)
    {
        _logger = logger;
        _operationName = operationName;
        _startTime = DateTime.UtcNow;
    }

    public void Dispose()
    {
        var duration = DateTime.UtcNow - _startTime;
        _logger.LogDebug("Operation {OperationName} completed in {Duration}ms", _operationName, duration.TotalMilliseconds);
    }
}
*/
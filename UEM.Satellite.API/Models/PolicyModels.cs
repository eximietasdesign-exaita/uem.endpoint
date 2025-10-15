using System.ComponentModel.DataAnnotations;

namespace UEM.Satellite.API.Models;

/// <summary>
/// Policy deployment request from UI
/// </summary>
public class PolicyDeploymentRequest
{
    [Required]
    public int PolicyId { get; set; }
    
    [Required]
    public string PolicyName { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public string TargetOs { get; set; } = string.Empty;
    
    public List<string> TargetAgents { get; set; } = new();
    
    public PolicyTargetCriteria? TargetCriteria { get; set; }
    
    [Required]
    public List<PolicyExecutionStep> ExecutionFlow { get; set; } = new();
    
    public PolicyDeploymentConfig? DeploymentConfig { get; set; }
    
    public string TriggerType { get; set; } = "manual"; // manual, scheduled, event_driven
    
    public int? TriggeredBy { get; set; }
}

/// <summary>
/// Policy target criteria for dynamic agent selection
/// </summary>
public class PolicyTargetCriteria
{
    public List<string>? OperatingSystem { get; set; }
    public List<string>? OsVersion { get; set; }
    public List<string>? Domain { get; set; }
    public List<string>? AgentVersion { get; set; }
    public List<string>? Tags { get; set; }
    public string? CustomQuery { get; set; }
}

/// <summary>
/// Policy execution step configuration
/// </summary>
public class PolicyExecutionStep
{
    [Required]
    public int StepNumber { get; set; }
    
    [Required]
    public int ScriptId { get; set; }
    
    [Required]
    public string ScriptName { get; set; } = string.Empty;
    
    [Required]
    public string ScriptType { get; set; } = string.Empty; // powershell, bash, python, wmi
    
    [Required]
    public string ScriptContent { get; set; } = string.Empty;
    
    public string RunCondition { get; set; } = "always"; // always, on_success, on_failure, conditional
    
    public string OnSuccess { get; set; } = "continue"; // continue, stop, jump_to_step
    
    public string OnFailure { get; set; } = "stop"; // continue, stop, retry, jump_to_step
    
    public int TimeoutSeconds { get; set; } = 300;
    
    public int MaxRetries { get; set; } = 0;
    
    public Dictionary<string, object>? Parameters { get; set; }
}

/// <summary>
/// Policy deployment configuration
/// </summary>
public class PolicyDeploymentConfig
{
    public string DeploymentStrategy { get; set; } = "parallel"; // parallel, sequential, rolling
    
    public int BatchSize { get; set; } = 10;
    
    public int MaxConcurrency { get; set; } = 50;
    
    public bool BusinessHoursOnly { get; set; } = false;
    
    public string? Timezone { get; set; }
    
    public DateTime? ScheduledFor { get; set; }
    
    public bool RequireApproval { get; set; } = false;
    
    public PolicyNotificationSettings? NotificationSettings { get; set; }
}

/// <summary>
/// Policy notification settings
/// </summary>
public class PolicyNotificationSettings
{
    public bool EmailOnCompletion { get; set; } = true;
    
    public bool EmailOnError { get; set; } = true;
    
    public string? WebhookUrl { get; set; }
    
    public List<string> Recipients { get; set; } = new();
}

/// <summary>
/// Policy execution command for agent
/// </summary>
public class PolicyExecutionCommand
{
    [Required]
    public string ExecutionId { get; set; } = string.Empty;
    
    [Required]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    public int PolicyId { get; set; }
    
    [Required]
    public string PolicyName { get; set; } = string.Empty;
    
    [Required]
    public List<PolicyExecutionStep> ExecutionSteps { get; set; } = new();
    
    public int TimeoutSeconds { get; set; } = 1800; // 30 minutes default
    
    public string TriggerType { get; set; } = "manual";
    
    public int? TriggeredBy { get; set; }
    
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
    
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Policy execution result from agent
/// </summary>
public class PolicyExecutionResult
{
    [Required]
    public string ExecutionId { get; set; } = string.Empty;
    
    [Required]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    public int PolicyId { get; set; }
    
    [Required]
    public string Status { get; set; } = string.Empty; // pending, running, completed, failed, cancelled, timeout
    
    public float Progress { get; set; } = 0.0f;
    
    public int TotalSteps { get; set; }
    
    public int CompletedSteps { get; set; }
    
    public int CurrentStep { get; set; } = 1;
    
    public List<PolicyStepResult> StepResults { get; set; } = new();
    
    public string? FinalOutput { get; set; }
    
    public string? FinalStatus { get; set; } // success, partial_success, failed
    
    public string? ErrorSummary { get; set; }
    
    public long TotalExecutionTimeMs { get; set; }
    
    public PolicyResourceUsage? ResourceUsage { get; set; }
    
    public DateTime? StartedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public string? AgentVersion { get; set; }
    
    public string? OperatingSystem { get; set; }
    
    public string? OsVersion { get; set; }
    
    public int RetryCount { get; set; } = 0;
    
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Individual step execution result
/// </summary>
public class PolicyStepResult
{
    [Required]
    public int StepNumber { get; set; }
    
    [Required]
    public int ScriptId { get; set; }
    
    [Required]
    public string ScriptName { get; set; } = string.Empty;
    
    [Required]
    public string Status { get; set; } = string.Empty; // success, failed, skipped, timeout
    
    public int? ExitCode { get; set; }
    
    public string? Output { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    public long ExecutionTimeMs { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Resource usage metrics during policy execution
/// </summary>
public class PolicyResourceUsage
{
    public float? PeakCpuUsage { get; set; }
    
    public long? PeakMemoryUsage { get; set; }
    
    public long? DiskIOBytes { get; set; }
    
    public long? NetworkIOBytes { get; set; }
}

/// <summary>
/// Policy deployment job status
/// </summary>
public class PolicyDeploymentStatus
{
    [Required]
    public int JobId { get; set; }
    
    [Required]
    public string Status { get; set; } = string.Empty;
    
    public float Progress { get; set; } = 0.0f;
    
    public int TotalTargets { get; set; }
    
    public int CompletedTargets { get; set; }
    
    public int FailedTargets { get; set; }
    
    public List<AgentDeploymentStatus> AgentResults { get; set; } = new();
    
    public DateTime? StartedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Individual agent deployment status
/// </summary>
public class AgentDeploymentStatus
{
    [Required]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    public string Hostname { get; set; } = string.Empty;
    
    [Required]
    public string Status { get; set; } = string.Empty;
    
    public string? ExecutionId { get; set; }
    
    public float Progress { get; set; } = 0.0f;
    
    public string? Error { get; set; }
    
    public DateTime? StartedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Agent policy capabilities
/// </summary>
public class AgentPolicyCapabilities
{
    [Required]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    public List<string> SupportedScriptTypes { get; set; } = new();
    
    [Required]
    public string OperatingSystem { get; set; } = string.Empty;
    
    public string? OsVersion { get; set; }
    
    public string? AgentVersion { get; set; }
    
    public bool SupportsParallelExecution { get; set; } = true;
    
    public int MaxConcurrentExecutions { get; set; } = 5;
    
    public bool SupportsLongRunningTasks { get; set; } = true;
    
    public List<string> AvailableFeatures { get; set; } = new();
    
    public DateTime LastCapabilityUpdate { get; set; } = DateTime.UtcNow;
}
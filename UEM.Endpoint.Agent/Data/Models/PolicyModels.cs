using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UEM.Endpoint.Agent.Data.Models;

/// <summary>
/// Policy command record stored in local SQLite database
/// </summary>
[Table("policy_commands")]
public class PolicyCommandRecord
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string ExecutionId { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string AgentId { get; set; } = string.Empty;

    public int PolicyId { get; set; }

    [Required]
    [MaxLength(255)]
    public string PolicyName { get; set; } = string.Empty;

    [Required]
    public string ExecutionStepsJson { get; set; } = string.Empty;

    public int TimeoutSeconds { get; set; } = 1800;

    [MaxLength(50)]
    public string TriggerType { get; set; } = "manual";

    public int? TriggeredBy { get; set; }

    public DateTime IssuedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public string? MetadataJson { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "pending";

    public string? ErrorMessage { get; set; }

    public DateTime ReceivedAt { get; set; }

    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Policy execution result record stored in local SQLite database
/// </summary>
[Table("policy_execution_results")]
public class PolicyExecutionResultRecord
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string ExecutionId { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string AgentId { get; set; } = string.Empty;

    public int PolicyId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    public float Progress { get; set; } = 0.0f;

    public int TotalSteps { get; set; }

    public int CompletedSteps { get; set; }

    public int CurrentStep { get; set; } = 1;

    [Required]
    public string StepResultsJson { get; set; } = "[]";

    public string? FinalOutput { get; set; }

    [MaxLength(50)]
    public string? FinalStatus { get; set; }

    public string? ErrorSummary { get; set; }

    public long TotalExecutionTimeMs { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    [MaxLength(50)]
    public string? AgentVersion { get; set; }

    [MaxLength(100)]
    public string? OperatingSystem { get; set; }

    [MaxLength(100)]
    public string? OsVersion { get; set; }

    public int RetryCount { get; set; } = 0;

    public bool ReportedToServer { get; set; } = false;

    public DateTime? ReportedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
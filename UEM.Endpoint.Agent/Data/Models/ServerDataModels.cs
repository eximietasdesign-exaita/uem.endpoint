using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UEM.Endpoint.Agent.Data.Models;

/// <summary>
/// Configuration data received from server
/// </summary>
[Table("server_configurations")]
public class ServerConfigurationRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string ConfigType { get; set; } = string.Empty;
    
    [Required]
    public string ConfigDataJson { get; set; } = string.Empty;
    
    public DateTime ReceivedAt { get; set; }
    
    public DateTime? AppliedAt { get; set; }
    
    public bool IsActive { get; set; }
    
    [StringLength(50)]
    public string? ConfigVersion { get; set; }
    
    [StringLength(1000)]
    public string? ConfigHash { get; set; }
    
    public long DataSizeBytes { get; set; }
}

/// <summary>
/// Commands received from server
/// </summary>
[Table("server_commands")]
public class ServerCommandRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string CommandId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string CommandType { get; set; } = string.Empty;
    
    [Required]
    public string CommandPayloadJson { get; set; } = string.Empty;
    
    public DateTime ReceivedAt { get; set; }
    
    public DateTime? ExecutedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    [StringLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Executing, Completed, Failed
    
    public string? ExecutionResultJson { get; set; }
    
    [StringLength(1000)]
    public string? ErrorMessage { get; set; }
    
    public int TimeToLiveSeconds { get; set; }
    
    public bool IsExpired { get; set; }
    
    public long PayloadSizeBytes { get; set; }
}

/// <summary>
/// Discovery scripts received from server
/// </summary>
[Table("server_discovery_scripts")]
public class ServerDiscoveryScriptRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string ScriptId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string ScriptName { get; set; } = string.Empty;
    
    [Required]
    public string ScriptContent { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string ScriptType { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? TargetOS { get; set; }
    
    public DateTime ReceivedAt { get; set; }
    
    public DateTime? LastExecutedAt { get; set; }
    
    public bool IsActive { get; set; }
    
    [StringLength(50)]
    public string? ScriptVersion { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public long ContentSizeBytes { get; set; }
    
    public int ExecutionCount { get; set; }
}

/// <summary>
/// Policy configurations received from server
/// </summary>
[Table("server_policies")]
public class ServerPolicyRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string PolicyId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string PolicyName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string PolicyType { get; set; } = string.Empty;
    
    [Required]
    public string PolicyDataJson { get; set; } = string.Empty;
    
    public DateTime ReceivedAt { get; set; }
    
    public DateTime? AppliedAt { get; set; }
    
    public bool IsActive { get; set; }
    
    [StringLength(50)]
    public string? PolicyVersion { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
    
    public long DataSizeBytes { get; set; }
}

/// <summary>
/// Updates and patches received from server
/// </summary>
[Table("server_updates")]
public class ServerUpdateRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string UpdateId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string UpdateType { get; set; } = string.Empty; // AgentUpdate, ConfigUpdate, ScriptUpdate
    
    [Required]
    [StringLength(50)]
    public string UpdateVersion { get; set; } = string.Empty;
    
    public string UpdateDataJson { get; set; } = string.Empty;
    
    public DateTime ReceivedAt { get; set; }
    
    public DateTime? AppliedAt { get; set; }
    
    [StringLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Applying, Applied, Failed
    
    [StringLength(1000)]
    public string? ErrorMessage { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public long UpdateSizeBytes { get; set; }
    
    public bool RequiresRestart { get; set; }
}

/// <summary>
/// Server responses to agent communications
/// </summary>
[Table("server_responses")]
public class ServerResponseRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string Endpoint { get; set; } = string.Empty;
    
    [Required]
    [StringLength(10)]
    public string HttpMethod { get; set; } = string.Empty;
    
    public string? ResponseDataJson { get; set; }
    
    public DateTime ResponseTimestamp { get; set; }
    
    public int ResponseStatusCode { get; set; }
    
    public long ResponseSizeBytes { get; set; }
    
    [StringLength(100)]
    public string? ResponseHeaders { get; set; }
    
    public bool Success { get; set; }
    
    [StringLength(1000)]
    public string? ErrorMessage { get; set; }
    
    public int ResponseTimeMs { get; set; }
    
    [StringLength(100)]
    public string? CorrelationId { get; set; }
}

/// <summary>
/// System notifications received from server
/// </summary>
[Table("server_notifications")]
public class ServerNotificationRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string NotificationId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string NotificationType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Priority { get; set; } = string.Empty; // Low, Medium, High, Critical
    
    public DateTime ReceivedAt { get; set; }
    
    public DateTime? ReadAt { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
    
    public bool IsRead { get; set; }
    
    public bool IsExpired { get; set; }
    
    public string? AdditionalDataJson { get; set; }
}
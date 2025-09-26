using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UEM.Endpoint.Agent.Data.Models;

/// <summary>
/// Heartbeat data sent to server
/// </summary>
[Table("uem_app_heartbeats")]
public class HeartbeatRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string UniqueId { get; set; } = string.Empty;
    
    [StringLength(100)]
    public string? SerialNumber { get; set; }
    
    [Required]
    [StringLength(255)]
    public string Hostname { get; set; } = string.Empty;
    
    [StringLength(45)]
    public string? IpAddress { get; set; }
    
    [StringLength(17)]
    public string? MacAddress { get; set; }
    
    [StringLength(50)]
    public string? AgentVersion { get; set; }
    
    public DateTime Timestamp { get; set; }
    
    public bool SentToServer { get; set; }
    
    public DateTime? ServerSentAt { get; set; }
    
    public int? ServerResponseCode { get; set; }
    
    [StringLength(500)]
    public string? ServerResponseMessage { get; set; }
}

/// <summary>
/// Hardware discovery data sent to server
/// </summary>
[Table("uem_app_hardware_discoveries")]
public class HardwareDiscoveryRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    public string HardwareDataJson { get; set; } = string.Empty;
    
    public DateTime DiscoveredAt { get; set; }
    
    public bool SentToServer { get; set; }
    
    public DateTime? ServerSentAt { get; set; }
    
    public int? ServerResponseCode { get; set; }
    
    [StringLength(500)]
    public string? ServerResponseMessage { get; set; }
    
    [StringLength(100)]
    public string? DiscoverySessionId { get; set; }
    
    public long DataSizeBytes { get; set; }
}

/// <summary>
/// Software discovery data sent to server
/// </summary>
[Table("uem_app_software_discoveries")]
public class SoftwareDiscoveryRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    public string SoftwareDataJson { get; set; } = string.Empty;
    
    public DateTime DiscoveredAt { get; set; }
    
    public bool SentToServer { get; set; }
    
    public DateTime? ServerSentAt { get; set; }
    
    public int? ServerResponseCode { get; set; }
    
    [StringLength(500)]
    public string? ServerResponseMessage { get; set; }
    
    [StringLength(100)]
    public string? DiscoverySessionId { get; set; }
    
    public long DataSizeBytes { get; set; }
    
    public int SoftwareItemsCount { get; set; }
}

/// <summary>
/// Security discovery data sent to server
/// </summary>
[Table("uem_app_security_discoveries")]
public class SecurityDiscoveryRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    public string SecurityDataJson { get; set; } = string.Empty;
    
    public DateTime DiscoveredAt { get; set; }
    
    public bool SentToServer { get; set; }
    
    public DateTime? ServerSentAt { get; set; }
    
    public int? ServerResponseCode { get; set; }
    
    [StringLength(500)]
    public string? ServerResponseMessage { get; set; }
    
    [StringLength(100)]
    public string? DiscoverySessionId { get; set; }
    
    public long DataSizeBytes { get; set; }
}

/// <summary>
/// Script execution results sent to server
/// </summary>
[Table("uem_app_script_executions")]
public class ScriptExecutionRecord
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
    public string ScriptContent { get; set; } = string.Empty;
    
    [Required]
    public string ExecutionResultJson { get; set; } = string.Empty;
    
    public DateTime ExecutedAt { get; set; }
    
    public bool SentToServer { get; set; }
    
    public DateTime? ServerSentAt { get; set; }
    
    public int? ServerResponseCode { get; set; }
    
    [StringLength(500)]
    public string? ServerResponseMessage { get; set; }
    
    public int ExecutionTimeMs { get; set; }
    
    public bool ExecutionSuccess { get; set; }
    
    [StringLength(100)]
    public string? ScriptType { get; set; }
}

/// <summary>
/// Agent registration data sent to server
/// </summary>
[Table("uem_app_agent_registrations")]
public class AgentRegistrationRecord
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(500)]
    public string HardwareFingerprint { get; set; } = string.Empty;
    
    [Required]
    public string RegistrationDataJson { get; set; } = string.Empty;
    
    public DateTime RegisteredAt { get; set; }
    
    public bool SentToServer { get; set; }
    
    public DateTime? ServerSentAt { get; set; }
    
    public int? ServerResponseCode { get; set; }
    
    [StringLength(500)]
    public string? ServerResponseMessage { get; set; }
    
    [StringLength(1000)]
    public string? JwtToken { get; set; }
}

/// <summary>
/// API communication log for data sent to server
/// </summary>
[Table("uem_app_api_communications")]
public class ApiCommunicationRecord
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
    
    [Required]
    public string RequestDataJson { get; set; } = string.Empty;
    
    public string? ResponseDataJson { get; set; }
    
    public DateTime RequestTimestamp { get; set; }
    
    public DateTime? ResponseTimestamp { get; set; }
    
    public int? ResponseStatusCode { get; set; }
    
    public long RequestSizeBytes { get; set; }
    
    public long ResponseSizeBytes { get; set; }
    
    public bool Success { get; set; }
    
    [StringLength(1000)]
    public string? ErrorMessage { get; set; }
    
    public int DurationMs { get; set; }
}
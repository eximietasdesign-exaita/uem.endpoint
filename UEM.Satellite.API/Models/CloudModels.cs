using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace UEM.Satellite.API.Models;

/// <summary>
/// Cloud provider registry (AWS, GCP, Azure)
/// </summary>
public class CloudProvider
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Type { get; set; } = string.Empty; // aws, gcp, azure, alibaba, oracle
    
    public string? Description { get; set; }
    
    [StringLength(255)]
    public string? Icon { get; set; }
    
    [StringLength(500)]
    public string? ApiEndpoint { get; set; }
    
    [StringLength(500)]
    public string? DocumentationUrl { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int DisplayOrder { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Cloud credentials with encrypted storage
/// </summary>
public class CloudCredential
{
    public int Id { get; set; }
    
    [Required]
    public int ProviderId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string CredentialType { get; set; } = string.Empty; // access_key, service_account, client_secret, api_key
    
    [Required]
    public string EncryptedCredentials { get; set; } = string.Empty; // AES-256 encrypted JSON
    
    [StringLength(100)]
    public string? EncryptionKeyId { get; set; }
    
    [StringLength(100)]
    public string? Region { get; set; } // AWS region, GCP zone, Azure location
    
    public int? TenantId { get; set; }
    
    public int? DomainId { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime? LastValidated { get; set; }
    
    [StringLength(50)]
    public string ValidationStatus { get; set; } = "pending"; // pending, valid, invalid, expired
    
    [StringLength(100)]
    public string? CreatedBy { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    public DateTime? LastUsedAt { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
    
    // Navigation property
    public CloudProvider? Provider { get; set; }
}

/// <summary>
/// Cloud discovery job configuration
/// </summary>
public class CloudDiscoveryJob
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public int ProviderId { get; set; }
    
    [Required]
    public int CredentialId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string DiscoveryScope { get; set; } = string.Empty; // compute, storage, database, network, all, custom
    
    public string? ScopeConfig { get; set; } // JSON: regions, resource types, tags
    
    [StringLength(50)]
    public string ScheduleType { get; set; } = "manual"; // manual, hourly, daily, weekly, monthly, custom
    
    [StringLength(100)]
    public string? CronExpression { get; set; }
    
    public DateTime? LastRun { get; set; }
    
    public DateTime? NextRun { get; set; }
    
    [StringLength(50)]
    public string Status { get; set; } = "active"; // active, paused, disabled, failed, running
    
    public int? TenantId { get; set; }
    
    public int? DomainId { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public int RetryCount { get; set; } = 0;
    
    public int MaxRetries { get; set; } = 3;
    
    public int TimeoutMinutes { get; set; } = 30;
    
    [StringLength(100)]
    public string? CreatedBy { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public CloudProvider? Provider { get; set; }
    public CloudCredential? Credential { get; set; }
}

/// <summary>
/// Discovered cloud assets (EC2, S3, RDS, GCE, etc.)
/// </summary>
public class CloudAsset
{
    public int Id { get; set; }
    
    [Required]
    public int ProviderId { get; set; }
    
    public int? JobId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string ResourceType { get; set; } = string.Empty; // ec2, s3, rds, gce, gcs, azure-vm
    
    [Required]
    [StringLength(500)]
    public string ResourceId { get; set; } = string.Empty; // AWS ARN, GCP resource ID, Azure resource ID
    
    [StringLength(500)]
    public string? Name { get; set; }
    
    [StringLength(100)]
    public string? Region { get; set; }
    
    [StringLength(100)]
    public string? Zone { get; set; } // GCP zone, AWS availability zone
    
    [StringLength(100)]
    public string? Status { get; set; } // running, stopped, active, deleted
    
    public string? TagsJson { get; set; } // JSONB in database
    
    public string? MetadataJson { get; set; } // JSONB in database
    
    public decimal? CostEstimate { get; set; } // Estimated monthly cost
    
    public DateTime DiscoveredAt { get; set; }
    
    public DateTime LastSeen { get; set; }
    
    public int? TenantId { get; set; }
    
    public int? DomainId { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public CloudProvider? Provider { get; set; }
    public CloudDiscoveryJob? Job { get; set; }
    
    // Helper properties for JSON deserialization
    public Dictionary<string, string>? Tags => 
        string.IsNullOrEmpty(TagsJson) ? null : JsonSerializer.Deserialize<Dictionary<string, string>>(TagsJson);
    
    public Dictionary<string, object>? Metadata => 
        string.IsNullOrEmpty(MetadataJson) ? null : JsonSerializer.Deserialize<Dictionary<string, object>>(MetadataJson);
}

/// <summary>
/// Cloud discovery execution results and audit trail
/// </summary>
public class CloudDiscoveryResult
{
    public int Id { get; set; }
    
    [Required]
    public int JobId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string RunId { get; set; } = string.Empty; // UUID for each execution
    
    public int AssetsDiscovered { get; set; } = 0;
    
    public int AssetsUpdated { get; set; } = 0;
    
    public int AssetsDeleted { get; set; } = 0;
    
    public int? ExecutionTimeSeconds { get; set; }
    
    public string? ErrorsJson { get; set; } // JSONB in database
    
    public string? WarningsJson { get; set; } // JSONB in database
    
    [Required]
    [StringLength(50)]
    public string Status { get; set; } = string.Empty; // pending, running, completed, failed, cancelled
    
    public DateTime StartedAt { get; set; }
    
    public DateTime? CompletedAt { get; set; }
    
    [StringLength(100)]
    public string? ExecutedBy { get; set; }
    
    [StringLength(50)]
    public string TriggerType { get; set; } = "manual"; // manual, scheduled, api, system
    
    // Navigation property
    public CloudDiscoveryJob? Job { get; set; }
    
    // Helper properties for JSON deserialization
    public List<string>? Errors => 
        string.IsNullOrEmpty(ErrorsJson) ? null : JsonSerializer.Deserialize<List<string>>(ErrorsJson);
    
    public List<string>? Warnings => 
        string.IsNullOrEmpty(WarningsJson) ? null : JsonSerializer.Deserialize<List<string>>(WarningsJson);
}

/// <summary>
/// Cloud audit log for security and compliance
/// </summary>
public class CloudAuditLog
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string EventType { get; set; } = string.Empty; // credential_created, job_executed, etc.
    
    [Required]
    [StringLength(50)]
    public string EntityType { get; set; } = string.Empty; // credential, job, asset, provider
    
    public int? EntityId { get; set; }
    
    [StringLength(100)]
    public string? UserId { get; set; }
    
    [StringLength(255)]
    public string? UserEmail { get; set; }
    
    [StringLength(45)]
    public string? IpAddress { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Action { get; set; } = string.Empty; // create, update, delete, execute, view
    
    public string? DetailsJson { get; set; } // JSONB in database
    
    public int? TenantId { get; set; }
    
    public int? DomainId { get; set; }
    
    [StringLength(20)]
    public string Severity { get; set; } = "info"; // info, warning, error, critical
    
    public DateTime CreatedAt { get; set; }
    
    // Helper property for JSON deserialization
    public Dictionary<string, object>? Details => 
        string.IsNullOrEmpty(DetailsJson) ? null : JsonSerializer.Deserialize<Dictionary<string, object>>(DetailsJson);
}

/// <summary>
/// Request model for creating cloud credentials
/// </summary>
public class CreateCloudCredentialRequest
{
    [Required]
    public int ProviderId { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public Dictionary<string, string> Credentials { get; set; } = new(); // Will be encrypted
    
    public string? Region { get; set; }
    
    public int? TenantId { get; set; }
    
    public int? DomainId { get; set; }
}

/// <summary>
/// Request model for creating cloud discovery job
/// </summary>
public class CreateCloudDiscoveryJobRequest
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public int ProviderId { get; set; }
    
    [Required]
    public int CredentialId { get; set; }
    
    [Required]
    public string DiscoveryScope { get; set; } = "all";
    
    public Dictionary<string, object>? ScopeConfig { get; set; }
    
    public string ScheduleType { get; set; } = "manual";
    
    public string? CronExpression { get; set; }
    
    public int? TenantId { get; set; }
    
    public int? DomainId { get; set; }
}

/// <summary>
/// Response model for cloud discovery statistics
/// </summary>
public class CloudDiscoveryStats
{
    public int TotalProviders { get; set; }
    public int ActiveCredentials { get; set; }
    public int ActiveJobs { get; set; }
    public int TotalAssets { get; set; }
    public int AssetsLast24Hours { get; set; }
    public int RunningJobs { get; set; }
    public int FailedJobsLast24Hours { get; set; }
    public Dictionary<string, int> AssetsByProvider { get; set; } = new();
    public Dictionary<string, int> AssetsByType { get; set; } = new();
    public decimal TotalEstimatedCost { get; set; }
}

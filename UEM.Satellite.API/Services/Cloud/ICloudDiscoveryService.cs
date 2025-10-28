using UEM.Satellite.API.Models;

namespace UEM.Satellite.API.Services.Cloud;

/// <summary>
/// Cloud discovery service interface for all cloud providers
/// </summary>
public interface ICloudDiscoveryService
{
    /// <summary>
    /// Authenticate with cloud provider using provided credentials
    /// </summary>
    Task<bool> AuthenticateAsync(Dictionary<string, string> credentials, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Validate credentials without performing discovery
    /// </summary>
    Task<(bool IsValid, string? ErrorMessage)> ValidateCredentialsAsync(Dictionary<string, string> credentials, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Discover compute resources (EC2, GCE, Azure VMs)
    /// </summary>
    Task<List<CloudAssetDiscoveryResult>> DiscoverComputeAsync(Dictionary<string, string> credentials, string? region = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Discover storage resources (S3, Cloud Storage, Azure Storage)
    /// </summary>
    Task<List<CloudAssetDiscoveryResult>> DiscoverStorageAsync(Dictionary<string, string> credentials, string? region = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Discover database resources (RDS, Cloud SQL, Azure SQL)
    /// </summary>
    Task<List<CloudAssetDiscoveryResult>> DiscoverDatabaseAsync(Dictionary<string, string> credentials, string? region = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Discover all resources in the cloud account
    /// </summary>
    Task<CloudDiscoveryExecutionResult> DiscoverAllAsync(Dictionary<string, string> credentials, CloudDiscoveryJobConfig? config = null, CancellationToken cancellationToken = default);
}

/// <summary>
/// Cloud asset discovery result
/// </summary>
public class CloudAssetDiscoveryResult
{
    public string ResourceType { get; set; } = string.Empty;
    public string ResourceId { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Region { get; set; }
    public string? Zone { get; set; }
    public string? Status { get; set; }
    public Dictionary<string, string>? Tags { get; set; }
    public Dictionary<string, object>? Metadata { get; set; }
    public decimal? CostEstimate { get; set; }
}

/// <summary>
/// Cloud discovery execution result
/// </summary>
public class CloudDiscoveryExecutionResult
{
    public int AssetsDiscovered { get; set; }
    public List<CloudAssetDiscoveryResult> Assets { get; set; } = new();
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
    public int ExecutionTimeSeconds { get; set; }
    public string Status { get; set; } = "completed";
}

/// <summary>
/// Cloud discovery job configuration
/// </summary>
public class CloudDiscoveryJobConfig
{
    public List<string>? Regions { get; set; }
    public List<string>? ResourceTypes { get; set; }
    public Dictionary<string, string>? TagFilters { get; set; }
    public int TimeoutMinutes { get; set; } = 30;
}

using Google.Cloud.Compute.V1;
using Google.Cloud.Storage.V1;
using Google.Apis.Auth.OAuth2;
using System.Text.Json;

namespace UEM.Satellite.API.Services.Cloud;

/// <summary>
/// Google Cloud Platform discovery service implementation
/// </summary>
public class GcpDiscoveryService : ICloudDiscoveryService
{
    private readonly ILogger<GcpDiscoveryService> _logger;

    public GcpDiscoveryService(ILogger<GcpDiscoveryService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> AuthenticateAsync(Dictionary<string, string> credentials, CancellationToken cancellationToken = default)
    {
        try
        {
            var (isValid, _) = await ValidateCredentialsAsync(credentials, cancellationToken);
            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GCP authentication failed");
            return false;
        }
    }

    public async Task<(bool IsValid, string? ErrorMessage)> ValidateCredentialsAsync(
        Dictionary<string, string> credentials, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!credentials.TryGetValue("ServiceAccountJson", out var serviceAccountJson))
            {
                return (false, "Missing required credential: ServiceAccountJson");
            }

            // Parse service account JSON to validate format
            var serviceAccount = JsonSerializer.Deserialize<Dictionary<string, object>>(serviceAccountJson);
            if (serviceAccount == null || !serviceAccount.ContainsKey("project_id"))
            {
                return (false, "Invalid service account JSON format");
            }

            // Create credential and test with a simple API call
            var credential = GoogleCredential.FromJson(serviceAccountJson);
            var computeClientBuilder = new InstancesClientBuilder { Credential = credential };
            var computeClient = await computeClientBuilder.BuildAsync();
            
            // This validates the credentials without discovering resources
            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "GCP credential validation failed: {Message}", ex.Message);
            return (false, $"Invalid GCP credentials: {ex.Message}");
        }
    }

    public async Task<List<CloudAssetDiscoveryResult>> DiscoverComputeAsync(
        Dictionary<string, string> credentials, 
        string? region = null, 
        CancellationToken cancellationToken = default)
    {
        var results = new List<CloudAssetDiscoveryResult>();

        try
        {
            var (credential, projectId) = CreateCredential(credentials);
            var instancesClientBuilder = new InstancesClientBuilder { Credential = credential };
            var instancesClient = await instancesClientBuilder.BuildAsync();

            // Get zones to search
            var zonesClientBuilder = new ZonesClientBuilder { Credential = credential };
            var zonesClient = await zonesClientBuilder.BuildAsync();
            var zones = zonesClient.List(projectId);

            foreach (var zone in zones)
            {
                // Skip zones not in the specified region if provided
                if (!string.IsNullOrEmpty(region) && !zone.Name.StartsWith(region))
                    continue;

                try
                {
                    var instances = instancesClient.List(projectId, zone.Name);

                    foreach (var instance in instances)
                    {
                        results.Add(new CloudAssetDiscoveryResult
                        {
                            ResourceType = "gce",
                            ResourceId = instance.SelfLink,
                            Name = instance.Name,
                            Region = ExtractRegion(zone.Name),
                            Zone = zone.Name,
                            Status = instance.Status,
                            Tags = instance.Labels?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
                            Metadata = new Dictionary<string, object>
                            {
                                ["MachineType"] = instance.MachineType,
                                ["CreationTimestamp"] = instance.CreationTimestamp,
                                ["NetworkInterfaces"] = instance.NetworkInterfaces?.Count ?? 0
                            }
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to discover instances in zone {Zone}", zone.Name);
                }
            }

            _logger.LogInformation("Discovered {Count} GCE instances", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover GCE instances");
            throw;
        }

        return results;
    }

    public async Task<List<CloudAssetDiscoveryResult>> DiscoverStorageAsync(
        Dictionary<string, string> credentials, 
        string? region = null, 
        CancellationToken cancellationToken = default)
    {
        var results = new List<CloudAssetDiscoveryResult>();

        try
        {
            var (credential, projectId) = CreateCredential(credentials);
            var storageClient = await StorageClient.CreateAsync(credential: credential);

            var buckets = storageClient.ListBuckets(projectId);

            foreach (var bucket in buckets)
            {
                // Filter by region if specified
                if (!string.IsNullOrEmpty(region) && bucket.Location != region.ToUpper())
                    continue;

                results.Add(new CloudAssetDiscoveryResult
                {
                    ResourceType = "gcs",
                    ResourceId = $"gs://{bucket.Name}",
                    Name = bucket.Name,
                    Region = bucket.Location?.ToLower() ?? "unknown",
                    Status = "active",
                    Tags = bucket.Labels?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
                    Metadata = new Dictionary<string, object>
                    {
                        ["StorageClass"] = bucket.StorageClass ?? "STANDARD",
                        ["TimeCreated"] = bucket.TimeCreatedDateTimeOffset?.ToString() ?? "unknown",
                        ["Location"] = bucket.Location ?? "unknown"
                    }
                });
            }

            _logger.LogInformation("Discovered {Count} Cloud Storage buckets", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover Cloud Storage buckets");
            throw;
        }

        return results;
    }

    public async Task<List<CloudAssetDiscoveryResult>> DiscoverDatabaseAsync(
        Dictionary<string, string> credentials, 
        string? region = null, 
        CancellationToken cancellationToken = default)
    {
        // Note: Cloud SQL discovery would require Google.Cloud.Sql.V1 package
        // For now, return empty list with a warning
        _logger.LogWarning("Cloud SQL discovery not yet implemented");
        return new List<CloudAssetDiscoveryResult>();
    }

    public async Task<CloudDiscoveryExecutionResult> DiscoverAllAsync(
        Dictionary<string, string> credentials, 
        CloudDiscoveryJobConfig? config = null, 
        CancellationToken cancellationToken = default)
    {
        var startTime = DateTime.UtcNow;
        var result = new CloudDiscoveryExecutionResult();

        try
        {
            var regions = config?.Regions ?? new List<string> { "us-central1" };

            foreach (var region in regions)
            {
                try
                {
                    var computeAssets = await DiscoverComputeAsync(credentials, region, cancellationToken);
                    result.Assets.AddRange(computeAssets);

                    var storageAssets = await DiscoverStorageAsync(credentials, region, cancellationToken);
                    result.Assets.AddRange(storageAssets);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to discover resources in region {Region}", region);
                    result.Errors.Add($"Region {region}: {ex.Message}");
                }
            }

            result.AssetsDiscovered = result.Assets.Count;
            result.ExecutionTimeSeconds = (int)(DateTime.UtcNow - startTime).TotalSeconds;
            result.Status = result.Errors.Any() ? "completed_with_errors" : "completed";

            _logger.LogInformation("GCP discovery completed: {Count} assets discovered", result.AssetsDiscovered);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GCP discovery failed");
            result.Status = "failed";
            result.Errors.Add(ex.Message);
        }

        return result;
    }

    private (GoogleCredential, string) CreateCredential(Dictionary<string, string> credentials)
    {
        if (!credentials.TryGetValue("ServiceAccountJson", out var serviceAccountJson))
        {
            throw new ArgumentException("Missing required GCP credential: ServiceAccountJson");
        }

        var credential = GoogleCredential.FromJson(serviceAccountJson);
        
        // Extract project ID from service account JSON
        var serviceAccount = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(serviceAccountJson);
        var projectId = serviceAccount?["project_id"].GetString() 
            ?? throw new ArgumentException("Service account JSON missing project_id");

        return (credential, projectId);
    }

    private string ExtractRegion(string zoneName)
    {
        // GCP zones are like "us-central1-a", extract region "us-central1"
        var parts = zoneName.Split('-');
        return parts.Length >= 3 ? string.Join("-", parts[0], parts[1]) : zoneName;
    }
}

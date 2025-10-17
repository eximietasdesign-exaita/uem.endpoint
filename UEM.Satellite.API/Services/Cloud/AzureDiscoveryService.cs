using Azure.Core;
using Azure.Identity;
using Azure.ResourceManager;
using Azure.ResourceManager.Compute;
using Azure.ResourceManager.Storage;
using Azure.ResourceManager.Resources;

namespace UEM.Satellite.API.Services.Cloud;

/// <summary>
/// Microsoft Azure discovery service implementation
/// </summary>
public class AzureDiscoveryService : ICloudDiscoveryService
{
    private readonly ILogger<AzureDiscoveryService> _logger;

    public AzureDiscoveryService(ILogger<AzureDiscoveryService> logger)
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
            _logger.LogError(ex, "Azure authentication failed");
            return false;
        }
    }

    public async Task<(bool IsValid, string? ErrorMessage)> ValidateCredentialsAsync(
        Dictionary<string, string> credentials, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!credentials.TryGetValue("TenantId", out var tenantId) ||
                !credentials.TryGetValue("ClientId", out var clientId) ||
                !credentials.TryGetValue("ClientSecret", out var clientSecret) ||
                !credentials.TryGetValue("SubscriptionId", out var subscriptionId))
            {
                return (false, "Missing required credentials: TenantId, ClientId, ClientSecret, SubscriptionId");
            }

            var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
            var armClient = new ArmClient(credential, subscriptionId);

            // Validate by getting subscription
            var subscription = await armClient.GetSubscriptionResource(
                new Azure.Core.ResourceIdentifier($"/subscriptions/{subscriptionId}")
            ).GetAsync(cancellationToken);

            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Azure credential validation failed: {Message}", ex.Message);
            return (false, $"Invalid Azure credentials: {ex.Message}");
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
            var (armClient, subscriptionId) = CreateArmClient(credentials);
            var subscription = armClient.GetSubscriptionResource(
                new Azure.Core.ResourceIdentifier($"/subscriptions/{subscriptionId}")
            );

            // Get all resource groups
            var resourceGroups = subscription.GetResourceGroups();

            foreach (var resourceGroup in resourceGroups)
            {
                try
                {
                    var vms = resourceGroup.GetVirtualMachines();

                    foreach (var vm in vms)
                    {
                        // Filter by region if specified
                        if (!string.IsNullOrEmpty(region) && vm.Data.Location != region)
                            continue;

                        results.Add(new CloudAssetDiscoveryResult
                        {
                            ResourceType = "azure-vm",
                            ResourceId = vm.Id.ToString(),
                            Name = vm.Data.Name,
                            Region = vm.Data.Location.ToString(),
                            Status = vm.Data.ProvisioningState ?? "unknown",
                            Tags = vm.Data.Tags?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
                            Metadata = new Dictionary<string, object>
                            {
                                ["VmSize"] = vm.Data.HardwareProfile?.VmSize ?? "unknown",
                                ["ResourceGroup"] = resourceGroup.Data.Name,
                                ["OsType"] = vm.Data.StorageProfile?.OsDisk?.OSType.ToString() ?? "unknown"
                            }
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to discover VMs in resource group {ResourceGroup}", resourceGroup.Data.Name);
                }
            }

            _logger.LogInformation("Discovered {Count} Azure VMs", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover Azure VMs");
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
            var (armClient, subscriptionId) = CreateArmClient(credentials);
            var subscription = armClient.GetSubscriptionResource(
                new Azure.Core.ResourceIdentifier($"/subscriptions/{subscriptionId}")
            );

            var resourceGroups = subscription.GetResourceGroups();

            foreach (var resourceGroup in resourceGroups)
            {
                try
                {
                    var storageAccounts = resourceGroup.GetStorageAccounts();

                    foreach (var storageAccount in storageAccounts)
                    {
                        // Filter by region if specified
                        if (!string.IsNullOrEmpty(region) && storageAccount.Data.Location != region)
                            continue;

                        results.Add(new CloudAssetDiscoveryResult
                        {
                            ResourceType = "azure-storage",
                            ResourceId = storageAccount.Id.ToString(),
                            Name = storageAccount.Data.Name,
                            Region = storageAccount.Data.Location.ToString(),
                            Status = storageAccount.Data.ProvisioningState.ToString(),
                            Tags = storageAccount.Data.Tags?.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
                            Metadata = new Dictionary<string, object>
                            {
                                ["ResourceGroup"] = resourceGroup.Data.Name,
                                ["Kind"] = storageAccount.Data.Kind.ToString(),
                                ["SkuName"] = storageAccount.Data.Sku.Name.ToString(),
                                ["CreationTime"] = storageAccount.Data.CreatedOn ?? DateTime.MinValue
                            }
                        });
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to discover storage accounts in resource group {ResourceGroup}", resourceGroup.Data.Name);
                }
            }

            _logger.LogInformation("Discovered {Count} Azure Storage accounts", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover Azure Storage accounts");
            throw;
        }

        return results;
    }

    public async Task<List<CloudAssetDiscoveryResult>> DiscoverDatabaseAsync(
        Dictionary<string, string> credentials, 
        string? region = null, 
        CancellationToken cancellationToken = default)
    {
        // Note: SQL Database discovery would require Azure.ResourceManager.Sql package
        // For now, return empty list with a warning
        _logger.LogWarning("Azure SQL Database discovery not yet implemented");
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
            var regions = config?.Regions ?? new List<string> { "eastus" };

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

            _logger.LogInformation("Azure discovery completed: {Count} assets discovered", result.AssetsDiscovered);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Azure discovery failed");
            result.Status = "failed";
            result.Errors.Add(ex.Message);
        }

        return result;
    }

    private (ArmClient, string) CreateArmClient(Dictionary<string, string> credentials)
    {
        if (!credentials.TryGetValue("TenantId", out var tenantId) ||
            !credentials.TryGetValue("ClientId", out var clientId) ||
            !credentials.TryGetValue("ClientSecret", out var clientSecret) ||
            !credentials.TryGetValue("SubscriptionId", out var subscriptionId))
        {
            throw new ArgumentException("Missing required Azure credentials");
        }

        var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
        var armClient = new ArmClient(credential, subscriptionId);

        return (armClient, subscriptionId);
    }
}

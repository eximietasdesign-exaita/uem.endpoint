namespace UEM.Satellite.API.Services.Cloud;

/// <summary>
/// Factory for creating cloud discovery services based on provider type
/// </summary>
public class CloudDiscoveryServiceFactory
{
    private readonly AwsDiscoveryService _awsService;
    private readonly GcpDiscoveryService _gcpService;
    private readonly AzureDiscoveryService _azureService;
    private readonly ILogger<CloudDiscoveryServiceFactory> _logger;

    public CloudDiscoveryServiceFactory(
        AwsDiscoveryService awsService,
        GcpDiscoveryService gcpService,
        AzureDiscoveryService azureService,
        ILogger<CloudDiscoveryServiceFactory> logger)
    {
        _awsService = awsService;
        _gcpService = gcpService;
        _azureService = azureService;
        _logger = logger;
    }

    /// <summary>
    /// Get the appropriate cloud discovery service for a provider type
    /// </summary>
    public ICloudDiscoveryService GetService(string providerType)
    {
        return providerType.ToLower() switch
        {
            "aws" => _awsService,
            "gcp" => _gcpService,
            "azure" => _azureService,
            _ => throw new ArgumentException($"Unsupported cloud provider type: {providerType}")
        };
    }

    /// <summary>
    /// Get all available cloud discovery services
    /// </summary>
    public Dictionary<string, ICloudDiscoveryService> GetAllServices()
    {
        return new Dictionary<string, ICloudDiscoveryService>
        {
            ["aws"] = _awsService,
            ["gcp"] = _gcpService,
            ["azure"] = _azureService
        };
    }

    /// <summary>
    /// Check if a provider type is supported
    /// </summary>
    public bool IsSupported(string providerType)
    {
        return providerType.ToLower() is "aws" or "gcp" or "azure";
    }
}

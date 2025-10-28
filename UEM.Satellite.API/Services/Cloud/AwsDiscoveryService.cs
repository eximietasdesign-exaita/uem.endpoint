using Amazon;
using Amazon.EC2;
using Amazon.EC2.Model;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.RDS;
using Amazon.RDS.Model;
using Amazon.Runtime;

namespace UEM.Satellite.API.Services.Cloud;

/// <summary>
/// AWS cloud discovery service implementation
/// </summary>
public class AwsDiscoveryService : ICloudDiscoveryService
{
    private readonly ILogger<AwsDiscoveryService> _logger;

    public AwsDiscoveryService(ILogger<AwsDiscoveryService> logger)
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
            _logger.LogError(ex, "AWS authentication failed");
            return false;
        }
    }

    public async Task<(bool IsValid, string? ErrorMessage)> ValidateCredentialsAsync(
        Dictionary<string, string> credentials, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!credentials.TryGetValue("AccessKeyId", out var accessKeyId) ||
                !credentials.TryGetValue("SecretAccessKey", out var secretAccessKey))
            {
                return (false, "Missing required credentials: AccessKeyId and SecretAccessKey");
            }

            var awsCredentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
            var region = credentials.TryGetValue("Region", out var r) ? r : "us-east-1";
            
            using var ec2Client = new AmazonEC2Client(awsCredentials, RegionEndpoint.GetBySystemName(region));
            
            // Simple validation call
            await ec2Client.DescribeRegionsAsync(new DescribeRegionsRequest(), cancellationToken);
            
            return (true, null);
        }
        catch (AmazonServiceException ex)
        {
            _logger.LogWarning(ex, "AWS credential validation failed: {Message}", ex.Message);
            return (false, $"Invalid AWS credentials: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AWS credential validation error");
            return (false, $"Validation error: {ex.Message}");
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
            var awsCredentials = CreateCredentials(credentials);
            var regionEndpoint = RegionEndpoint.GetBySystemName(region ?? "us-east-1");
            
            using var ec2Client = new AmazonEC2Client(awsCredentials, regionEndpoint);
            
            var request = new DescribeInstancesRequest();
            var response = await ec2Client.DescribeInstancesAsync(request, cancellationToken);

            foreach (var reservation in response.Reservations)
            {
                foreach (var instance in reservation.Instances)
                {
                    results.Add(new CloudAssetDiscoveryResult
                    {
                        ResourceType = "ec2",
                        ResourceId = $"arn:aws:ec2:{regionEndpoint.SystemName}::instance/{instance.InstanceId}",
                        Name = instance.Tags?.FirstOrDefault(t => t.Key == "Name")?.Value ?? instance.InstanceId,
                        Region = regionEndpoint.SystemName,
                        Zone = instance.Placement.AvailabilityZone,
                        Status = instance.State.Name.Value,
                        Tags = instance.Tags?.ToDictionary(t => t.Key, t => t.Value),
                        Metadata = new Dictionary<string, object>
                        {
                            ["InstanceType"] = instance.InstanceType.Value,
                            ["LaunchTime"] = instance.LaunchTime,
                            ["PrivateIpAddress"] = instance.PrivateIpAddress ?? "",
                            ["PublicIpAddress"] = instance.PublicIpAddress ?? "",
                            ["VpcId"] = instance.VpcId ?? ""
                        }
                    });
                }
            }

            _logger.LogInformation("Discovered {Count} EC2 instances in {Region}", results.Count, regionEndpoint.SystemName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover EC2 instances");
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
            var awsCredentials = CreateCredentials(credentials);
            var regionEndpoint = RegionEndpoint.GetBySystemName(region ?? "us-east-1");
            
            using var s3Client = new AmazonS3Client(awsCredentials, regionEndpoint);
            
            var response = await s3Client.ListBucketsAsync(cancellationToken);

            foreach (var bucket in response.Buckets)
            {
                try
                {
                    var locationResponse = await s3Client.GetBucketLocationAsync(bucket.BucketName, cancellationToken);
                    
                    results.Add(new CloudAssetDiscoveryResult
                    {
                        ResourceType = "s3",
                        ResourceId = $"arn:aws:s3:::{bucket.BucketName}",
                        Name = bucket.BucketName,
                        Region = locationResponse.Location.Value ?? "us-east-1",
                        Status = "active",
                        Metadata = new Dictionary<string, object>
                        {
                            ["CreationDate"] = bucket.CreationDate
                        }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to get bucket location for {Bucket}", bucket.BucketName);
                }
            }

            _logger.LogInformation("Discovered {Count} S3 buckets", results.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover S3 buckets");
            throw;
        }

        return results;
    }

    public async Task<List<CloudAssetDiscoveryResult>> DiscoverDatabaseAsync(
        Dictionary<string, string> credentials, 
        string? region = null, 
        CancellationToken cancellationToken = default)
    {
        var results = new List<CloudAssetDiscoveryResult>();

        try
        {
            var awsCredentials = CreateCredentials(credentials);
            var regionEndpoint = RegionEndpoint.GetBySystemName(region ?? "us-east-1");
            
            using var rdsClient = new AmazonRDSClient(awsCredentials, regionEndpoint);
            
            var response = await rdsClient.DescribeDBInstancesAsync(new DescribeDBInstancesRequest(), cancellationToken);

            foreach (var dbInstance in response.DBInstances)
            {
                results.Add(new CloudAssetDiscoveryResult
                {
                    ResourceType = "rds",
                    ResourceId = dbInstance.DBInstanceArn,
                    Name = dbInstance.DBInstanceIdentifier,
                    Region = regionEndpoint.SystemName,
                    Zone = dbInstance.AvailabilityZone,
                    Status = dbInstance.DBInstanceStatus,
                    Metadata = new Dictionary<string, object>
                    {
                        ["Engine"] = dbInstance.Engine,
                        ["EngineVersion"] = dbInstance.EngineVersion,
                        ["InstanceClass"] = dbInstance.DBInstanceClass,
                        ["AllocatedStorage"] = dbInstance.AllocatedStorage,
                        ["MultiAZ"] = dbInstance.MultiAZ,
                        ["Endpoint"] = dbInstance.Endpoint?.Address ?? ""
                    }
                });
            }

            _logger.LogInformation("Discovered {Count} RDS instances in {Region}", results.Count, regionEndpoint.SystemName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to discover RDS instances");
            throw;
        }

        return results;
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
            var regions = config?.Regions ?? new List<string> { "us-east-1" };

            foreach (var region in regions)
            {
                try
                {
                    var computeAssets = await DiscoverComputeAsync(credentials, region, cancellationToken);
                    result.Assets.AddRange(computeAssets);

                    var storageAssets = await DiscoverStorageAsync(credentials, region, cancellationToken);
                    result.Assets.AddRange(storageAssets);

                    var databaseAssets = await DiscoverDatabaseAsync(credentials, region, cancellationToken);
                    result.Assets.AddRange(databaseAssets);
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

            _logger.LogInformation("AWS discovery completed: {Count} assets discovered", result.AssetsDiscovered);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AWS discovery failed");
            result.Status = "failed";
            result.Errors.Add(ex.Message);
        }

        return result;
    }

    private BasicAWSCredentials CreateCredentials(Dictionary<string, string> credentials)
    {
        if (!credentials.TryGetValue("AccessKeyId", out var accessKeyId) ||
            !credentials.TryGetValue("SecretAccessKey", out var secretAccessKey))
        {
            throw new ArgumentException("Missing required AWS credentials");
        }

        return new BasicAWSCredentials(accessKeyId, secretAccessKey);
    }
}

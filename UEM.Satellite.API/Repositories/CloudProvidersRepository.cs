using Dapper;
using Npgsql;
using UEM.Satellite.API.Models;

namespace UEM.Satellite.API.Repositories;

public class CloudProvidersRepository
{
    private readonly string _connectionString;
    private readonly ILogger<CloudProvidersRepository> _logger;

    public CloudProvidersRepository(
        IConfiguration configuration,
        ILogger<CloudProvidersRepository> logger)
    {
        _connectionString = configuration.GetConnectionString("Postgres") 
            ?? Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? throw new InvalidOperationException("Database connection string not configured");
        _logger = logger;
    }

    public async Task<CloudProvider?> GetByIdAsync(int id)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    provider_name AS ProviderName,
                    provider_type AS ProviderType,
                    is_active AS IsActive,
                    api_endpoint AS ApiEndpoint,
                    required_credentials AS RequiredCredentials,
                    supported_regions AS SupportedRegions,
                    icon_url AS IconUrl,
                    documentation_url AS DocumentationUrl,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt
                FROM cloud_providers
                WHERE id = @Id";

            return await connection.QueryFirstOrDefaultAsync<CloudProvider>(sql, new { Id = id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cloud provider by id {Id}", id);
            throw;
        }
    }

    public async Task<CloudProvider?> GetByTypeAsync(string providerType)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    provider_name AS ProviderName,
                    provider_type AS ProviderType,
                    is_active AS IsActive,
                    api_endpoint AS ApiEndpoint,
                    required_credentials AS RequiredCredentials,
                    supported_regions AS SupportedRegions,
                    icon_url AS IconUrl,
                    documentation_url AS DocumentationUrl,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt
                FROM cloud_providers
                WHERE provider_type = @ProviderType";

            return await connection.QueryFirstOrDefaultAsync<CloudProvider>(sql, new { ProviderType = providerType });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cloud provider by type {ProviderType}", providerType);
            throw;
        }
    }

    public async Task<List<CloudProvider>> GetAllAsync(bool activeOnly = true)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    provider_name AS ProviderName,
                    provider_type AS ProviderType,
                    is_active AS IsActive,
                    api_endpoint AS ApiEndpoint,
                    required_credentials AS RequiredCredentials,
                    supported_regions AS SupportedRegions,
                    icon_url AS IconUrl,
                    documentation_url AS DocumentationUrl,
                    created_at AS CreatedAt,
                    updated_at AS UpdatedAt
                FROM cloud_providers
                WHERE @ActiveOnly = false OR is_active = true
                ORDER BY provider_name";

            var providers = await connection.QueryAsync<CloudProvider>(sql, new { ActiveOnly = activeOnly });
            return providers.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all cloud providers");
            throw;
        }
    }

    public async Task<int> CreateAsync(CloudProvider provider)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                INSERT INTO cloud_providers (
                    provider_name, provider_type, is_active, api_endpoint,
                    required_credentials, supported_regions, icon_url, 
                    documentation_url, created_at
                ) VALUES (
                    @ProviderName, @ProviderType, @IsActive, @ApiEndpoint,
                    @RequiredCredentials, @SupportedRegions, @IconUrl,
                    @DocumentationUrl, @CreatedAt
                ) RETURNING id";

            var id = await connection.ExecuteScalarAsync<int>(sql, new
            {
                provider.ProviderName,
                provider.ProviderType,
                IsActive = provider.IsActive ?? true,
                provider.ApiEndpoint,
                provider.RequiredCredentials,
                provider.SupportedRegions,
                provider.IconUrl,
                provider.DocumentationUrl,
                CreatedAt = DateTime.UtcNow
            });

            _logger.LogInformation("Created cloud provider {Id}: {ProviderName}", id, provider.ProviderName);
            return id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create cloud provider {ProviderName}", provider.ProviderName);
            throw;
        }
    }

    public async Task UpdateAsync(CloudProvider provider)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                UPDATE cloud_providers SET
                    provider_name = @ProviderName,
                    is_active = @IsActive,
                    api_endpoint = @ApiEndpoint,
                    required_credentials = @RequiredCredentials,
                    supported_regions = @SupportedRegions,
                    icon_url = @IconUrl,
                    documentation_url = @DocumentationUrl,
                    updated_at = @UpdatedAt
                WHERE id = @Id";

            await connection.ExecuteAsync(sql, new
            {
                provider.Id,
                provider.ProviderName,
                provider.IsActive,
                provider.ApiEndpoint,
                provider.RequiredCredentials,
                provider.SupportedRegions,
                provider.IconUrl,
                provider.DocumentationUrl,
                UpdatedAt = DateTime.UtcNow
            });

            _logger.LogInformation("Updated cloud provider {Id}", provider.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update cloud provider {Id}", provider.Id);
            throw;
        }
    }

    public async Task DeleteAsync(int id)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            // Soft delete by setting is_active to false
            const string sql = @"
                UPDATE cloud_providers 
                SET is_active = false, updated_at = @UpdatedAt 
                WHERE id = @Id";

            await connection.ExecuteAsync(sql, new { Id = id, UpdatedAt = DateTime.UtcNow });

            _logger.LogInformation("Deleted (soft) cloud provider {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete cloud provider {Id}", id);
            throw;
        }
    }

    public async Task InitializeDefaultProvidersAsync()
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            // Check if providers already exist
            const string checkSql = "SELECT COUNT(*) FROM cloud_providers";
            var count = await connection.ExecuteScalarAsync<int>(checkSql);
            
            if (count > 0)
            {
                _logger.LogInformation("Cloud providers already initialized ({Count} providers)", count);
                return;
            }

            // Insert default providers
            const string insertSql = @"
                INSERT INTO cloud_providers (
                    provider_name, provider_type, is_active, api_endpoint,
                    required_credentials, supported_regions, icon_url,
                    documentation_url, created_at
                ) VALUES 
                (
                    'Amazon Web Services', 
                    'aws', 
                    true, 
                    'https://aws.amazon.com',
                    ARRAY['AccessKeyId', 'SecretAccessKey', 'Region'],
                    ARRAY['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
                    'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
                    'https://docs.aws.amazon.com',
                    @CreatedAt
                ),
                (
                    'Google Cloud Platform', 
                    'gcp', 
                    true, 
                    'https://cloud.google.com',
                    ARRAY['ServiceAccountJson'],
                    ARRAY['us-central1', 'us-east1', 'europe-west1', 'asia-southeast1'],
                    'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
                    'https://cloud.google.com/docs',
                    @CreatedAt
                ),
                (
                    'Microsoft Azure', 
                    'azure', 
                    true, 
                    'https://portal.azure.com',
                    ARRAY['TenantId', 'ClientId', 'ClientSecret', 'SubscriptionId'],
                    ARRAY['eastus', 'westus', 'northeurope', 'southeastasia'],
                    'https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg',
                    'https://docs.microsoft.com/azure',
                    @CreatedAt
                )";

            await connection.ExecuteAsync(insertSql, new { CreatedAt = DateTime.UtcNow });

            _logger.LogInformation("Initialized 3 default cloud providers (AWS, GCP, Azure)");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize default cloud providers");
            throw;
        }
    }
}

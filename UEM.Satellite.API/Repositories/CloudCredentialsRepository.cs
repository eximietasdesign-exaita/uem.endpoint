using Dapper;
using Npgsql;
using UEM.Satellite.API.Models;
using UEM.Satellite.API.Services.Cloud;

namespace UEM.Satellite.API.Repositories;

public class CloudCredentialsRepository
{
    private readonly string _connectionString;
    private readonly ICredentialEncryptionService _encryptionService;
    private readonly ILogger<CloudCredentialsRepository> _logger;

    public CloudCredentialsRepository(
        IConfiguration configuration,
        ICredentialEncryptionService encryptionService,
        ILogger<CloudCredentialsRepository> logger)
    {
        _connectionString = configuration.GetConnectionString("Postgres") 
            ?? Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? throw new InvalidOperationException("Database connection string not configured");
        _encryptionService = encryptionService;
        _logger = logger;
    }

    public async Task<CloudCredential?> GetByIdAsync(int id)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    provider_id AS ProviderId,
                    tenant_id AS TenantId,
                    domain_id AS DomainId,
                    name AS CredentialName,
                    encrypted_credentials AS EncryptedCredentials,
                    is_active AS IsActive,
                    last_validated AS LastValidatedAt,
                    validation_status AS ValidationStatus,
                    '' AS ValidationError,
                    expires_at AS ExpiresAt,
                    created_at AS CreatedAt,
                    created_by AS CreatedBy,
                    updated_at AS UpdatedAt,
                    '' AS UpdatedBy
                FROM cloud_credentials
                WHERE id = @Id";

            var credential = await connection.QueryFirstOrDefaultAsync<CloudCredential>(sql, new { Id = id });
            
            if (credential != null)
            {
                credential.Credentials = _encryptionService.Decrypt(credential.EncryptedCredentials);
            }
            
            return credential;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cloud credential by id {Id}", id);
            throw;
        }
    }

    public async Task<List<CloudCredential>> GetByTenantAsync(int tenantId, int? domainId = null)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    provider_id AS ProviderId,
                    tenant_id AS TenantId,
                    domain_id AS DomainId,
                    name AS CredentialName,
                    encrypted_credentials AS EncryptedCredentials,
                    is_active AS IsActive,
                    last_validated AS LastValidatedAt,
                    validation_status AS ValidationStatus,
                    '' AS ValidationError,
                    expires_at AS ExpiresAt,
                    created_at AS CreatedAt,
                    created_by AS CreatedBy,
                    updated_at AS UpdatedAt,
                    '' AS UpdatedBy
                FROM cloud_credentials
                WHERE tenant_id = @TenantId 
                  AND (@DomainId IS NULL OR domain_id = @DomainId)
                  AND is_active = true
                ORDER BY name";

            var credentials = await connection.QueryAsync<CloudCredential>(sql, new { TenantId = tenantId, DomainId = domainId });
            
            foreach (var credential in credentials)
            {
                credential.Credentials = _encryptionService.Decrypt(credential.EncryptedCredentials);
            }
            
            return credentials.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cloud credentials for tenant {TenantId}", tenantId);
            throw;
        }
    }

    public async Task<List<CloudCredential>> GetByProviderAsync(int providerId, int tenantId)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    provider_id AS ProviderId,
                    tenant_id AS TenantId,
                    domain_id AS DomainId,
                    name AS CredentialName,
                    encrypted_credentials AS EncryptedCredentials,
                    is_active AS IsActive,
                    last_validated AS LastValidatedAt,
                    validation_status AS ValidationStatus,
                    '' AS ValidationError,
                    expires_at AS ExpiresAt,
                    created_at AS CreatedAt,
                    created_by AS CreatedBy,
                    updated_at AS UpdatedAt,
                    '' AS UpdatedBy
                FROM cloud_credentials
                WHERE provider_id = @ProviderId 
                  AND tenant_id = @TenantId
                  AND is_active = true
                ORDER BY name";

            var credentials = await connection.QueryAsync<CloudCredential>(sql, new { ProviderId = providerId, TenantId = tenantId });
            
            foreach (var credential in credentials)
            {
                credential.Credentials = _encryptionService.Decrypt(credential.EncryptedCredentials);
            }
            
            return credentials.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cloud credentials for provider {ProviderId}", providerId);
            throw;
        }
    }

    public async Task<int> CreateAsync(CloudCredential credential)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            // Encrypt credentials before storing
            credential.EncryptedCredentials = _encryptionService.Encrypt(credential.Credentials);
            
            const string sql = @"
                INSERT INTO cloud_credentials (
                    provider_id, tenant_id, domain_id, name,
                    encrypted_credentials, is_active, validation_status,
                    expires_at, created_at, created_by
                ) VALUES (
                    @ProviderId, @TenantId, @DomainId, @CredentialName,
                    @EncryptedCredentials, @IsActive, @ValidationStatus,
                    @ExpiresAt, @CreatedAt, @CreatedBy
                ) RETURNING id";

            var id = await connection.ExecuteScalarAsync<int>(sql, new
            {
                credential.ProviderId,
                credential.TenantId,
                credential.DomainId,
                credential.CredentialName,
                credential.EncryptedCredentials,
                credential.IsActive,
                ValidationStatus = credential.ValidationStatus ?? "pending",
                credential.ExpiresAt,
                CreatedAt = DateTime.UtcNow,
                credential.CreatedBy
            });

            _logger.LogInformation("Created cloud credential {Id} for provider {ProviderId}", id, credential.ProviderId);
            return id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create cloud credential");
            throw;
        }
    }

    public async Task UpdateAsync(CloudCredential credential)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            
            // Re-encrypt credentials if they were modified
            if (credential.Credentials != null && credential.Credentials.Any())
            {
                credential.EncryptedCredentials = _encryptionService.Encrypt(credential.Credentials);
            }
            
            const string sql = @"
                UPDATE cloud_credentials SET
                    name = @CredentialName,
                    encrypted_credentials = COALESCE(@EncryptedCredentials, encrypted_credentials),
                    is_active = @IsActive,
                    validation_status = @ValidationStatus,
                    last_validated = @LastValidatedAt,
                    expires_at = @ExpiresAt,
                    updated_at = @UpdatedAt
                WHERE id = @Id";

            await connection.ExecuteAsync(sql, new
            {
                credential.Id,
                credential.CredentialName,
                credential.EncryptedCredentials,
                credential.IsActive,
                credential.ValidationStatus,
                credential.ValidationError,
                credential.LastValidatedAt,
                credential.ExpiresAt,
                UpdatedAt = DateTime.UtcNow,
                credential.UpdatedBy
            });

            _logger.LogInformation("Updated cloud credential {Id}", credential.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update cloud credential {Id}", credential.Id);
            throw;
        }
    }

    public async Task<bool> ValidateCredentialAsync(int credentialId, ICloudDiscoveryService discoveryService)
    {
        try
        {
            var credential = await GetByIdAsync(credentialId);
            if (credential == null)
            {
                _logger.LogWarning("Credential {Id} not found for validation", credentialId);
                return false;
            }

            var (isValid, errorMessage) = await discoveryService.ValidateCredentialsAsync(credential.Credentials);

            credential.ValidationStatus = isValid ? "valid" : "invalid";
            credential.ValidationError = errorMessage;
            credential.LastValidatedAt = DateTime.UtcNow;

            await UpdateAsync(credential);

            return isValid;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate credential {Id}", credentialId);
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
                UPDATE cloud_credentials 
                SET is_active = false, updated_at = @UpdatedAt 
                WHERE id = @Id";

            await connection.ExecuteAsync(sql, new { Id = id, UpdatedAt = DateTime.UtcNow });

            _logger.LogInformation("Deleted (soft) cloud credential {Id}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete cloud credential {Id}", id);
            throw;
        }
    }

    public async Task<List<CloudCredential>> GetExpiringCredentialsAsync(int daysThreshold = 30)
    {
        try
        {
            using var connection = new NpgsqlConnection(_connectionString);
            const string sql = @"
                SELECT 
                    id AS Id,
                    provider_id AS ProviderId,
                    tenant_id AS TenantId,
                    domain_id AS DomainId,
                    name AS CredentialName,
                    encrypted_credentials AS EncryptedCredentials,
                    is_active AS IsActive,
                    last_validated AS LastValidatedAt,
                    validation_status AS ValidationStatus,
                    '' AS ValidationError,
                    expires_at AS ExpiresAt,
                    created_at AS CreatedAt,
                    created_by AS CreatedBy,
                    updated_at AS UpdatedAt,
                    '' AS UpdatedBy
                FROM cloud_credentials
                WHERE is_active = true
                  AND expires_at IS NOT NULL
                  AND expires_at <= @ExpiryThreshold
                ORDER BY expires_at";

            var expiryThreshold = DateTime.UtcNow.AddDays(daysThreshold);
            var credentials = await connection.QueryAsync<CloudCredential>(sql, new { ExpiryThreshold = expiryThreshold });
            
            foreach (var credential in credentials)
            {
                credential.Credentials = _encryptionService.Decrypt(credential.EncryptedCredentials);
            }
            
            return credentials.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get expiring credentials");
            throw;
        }
    }
}

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace UEM.Satellite.API.Services.Cloud;

/// <summary>
/// AES-256 encryption service for cloud credentials
/// </summary>
public class CredentialEncryptionService : ICredentialEncryptionService
{
    private readonly byte[] _encryptionKey;
    private readonly ILogger<CredentialEncryptionService> _logger;

    public CredentialEncryptionService(IConfiguration configuration, ILogger<CredentialEncryptionService> logger)
    {
        _logger = logger;
        
        // Get encryption key from environment or configuration
        var keyString = configuration["CloudDiscovery:EncryptionKey"] 
            ?? Environment.GetEnvironmentVariable("CLOUD_CREDENTIAL_ENCRYPTION_KEY")
            ?? throw new InvalidOperationException("Cloud credential encryption key not configured. Set CLOUD_CREDENTIAL_ENCRYPTION_KEY environment variable.");
        
        // Ensure key is 32 bytes (256 bits) for AES-256
        _encryptionKey = DeriveKey(keyString, 32);
    }

    public string Encrypt(Dictionary<string, string> credentials)
    {
        try
        {
            var json = JsonSerializer.Serialize(credentials);
            var plainTextBytes = Encoding.UTF8.GetBytes(json);

            using var aes = Aes.Create();
            aes.Key = _encryptionKey;
            aes.GenerateIV();
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var encryptor = aes.CreateEncryptor();
            var encryptedBytes = encryptor.TransformFinalBlock(plainTextBytes, 0, plainTextBytes.Length);

            // Combine IV and encrypted data
            var result = new byte[aes.IV.Length + encryptedBytes.Length];
            Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
            Buffer.BlockCopy(encryptedBytes, 0, result, aes.IV.Length, encryptedBytes.Length);

            return Convert.ToBase64String(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to encrypt credentials");
            throw new InvalidOperationException("Credential encryption failed", ex);
        }
    }

    public Dictionary<string, string> Decrypt(string encryptedCredentials)
    {
        try
        {
            var encryptedBytes = Convert.FromBase64String(encryptedCredentials);

            using var aes = Aes.Create();
            aes.Key = _encryptionKey;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            // Extract IV (first 16 bytes)
            var iv = new byte[16];
            Buffer.BlockCopy(encryptedBytes, 0, iv, 0, 16);
            aes.IV = iv;

            // Extract encrypted data
            var cipherText = new byte[encryptedBytes.Length - 16];
            Buffer.BlockCopy(encryptedBytes, 16, cipherText, 0, cipherText.Length);

            using var decryptor = aes.CreateDecryptor();
            var decryptedBytes = decryptor.TransformFinalBlock(cipherText, 0, cipherText.Length);
            var json = Encoding.UTF8.GetString(decryptedBytes);

            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) 
                ?? new Dictionary<string, string>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to decrypt credentials");
            throw new InvalidOperationException("Credential decryption failed", ex);
        }
    }

    public string GenerateKeyId()
    {
        return $"key-{Guid.NewGuid():N}";
    }

    public bool IsValidFormat(string encryptedCredentials)
    {
        try
        {
            var bytes = Convert.FromBase64String(encryptedCredentials);
            return bytes.Length > 16; // At least IV + some data
        }
        catch
        {
            return false;
        }
    }

    private static byte[] DeriveKey(string password, int keyLength)
    {
        // Use PBKDF2 to derive a key of specified length
        using var deriveBytes = new Rfc2898DeriveBytes(
            password, 
            Encoding.UTF8.GetBytes("CloudDiscoverySalt2024"), // Static salt for deterministic key
            100000, 
            HashAlgorithmName.SHA256
        );
        return deriveBytes.GetBytes(keyLength);
    }
}

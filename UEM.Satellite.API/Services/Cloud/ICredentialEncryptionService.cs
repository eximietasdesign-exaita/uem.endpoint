namespace UEM.Satellite.API.Services.Cloud;

/// <summary>
/// Credential encryption service for secure storage of cloud credentials
/// </summary>
public interface ICredentialEncryptionService
{
    /// <summary>
    /// Encrypt credentials dictionary to encrypted string
    /// </summary>
    string Encrypt(Dictionary<string, string> credentials);
    
    /// <summary>
    /// Decrypt encrypted string to credentials dictionary
    /// </summary>
    Dictionary<string, string> Decrypt(string encryptedCredentials);
    
    /// <summary>
    /// Generate a new encryption key ID for key rotation
    /// </summary>
    string GenerateKeyId();
    
    /// <summary>
    /// Validate encrypted credentials format
    /// </summary>
    bool IsValidFormat(string encryptedCredentials);
}

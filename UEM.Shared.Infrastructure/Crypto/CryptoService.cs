using System.Security.Cryptography;
using System.Text;

namespace UEM.Shared.Infrastructure.Crypto;
public sealed class CryptoService
{
    public static string Sha256(string input)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input))).ToLowerInvariant();
}

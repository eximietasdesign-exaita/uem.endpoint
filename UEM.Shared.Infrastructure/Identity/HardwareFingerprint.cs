using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Text;
using System.Security.Cryptography;

namespace UEM.Shared.Infrastructure.Identity;
public static class HardwareFingerprint
{
    public static string Collect()
    {
        var sb = new StringBuilder();
        try { sb.Append(string.Join(";", NetworkInterface.GetAllNetworkInterfaces().Select(i => i.GetPhysicalAddress().ToString()).OrderBy(x => x))); } catch {}
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows)) sb.Append(";win");
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux)) sb.Append(";linux");
        else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX)) sb.Append(";osx");
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(sb.ToString()))).ToLowerInvariant();
    }
}

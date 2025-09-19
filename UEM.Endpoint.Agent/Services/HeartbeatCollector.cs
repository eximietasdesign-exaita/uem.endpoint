using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Reflection;
using UEM.Shared.Infrastructure.Identity;

namespace UEM.Endpoint.Agent.Services;

public sealed class HeartbeatCollector
{
    public Task<HeartbeatPayload> CollectAsync(CancellationToken ct = default)
    {
        var uniqueId = HardwareFingerprint.Collect();
        var hostname = Environment.MachineName;
        var ip = GetPrimaryIPv4();
        var mac = GetPrimaryMac();
        var version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0";
        var serial = TryGetSerialNumber();

        return Task.FromResult(new HeartbeatPayload(
            uniqueId, serial, hostname, ip, mac, version
        ));
    }

    private static string? GetPrimaryIPv4()
    {
        foreach (var ni in NetworkInterface.GetAllNetworkInterfaces()
                     .Where(n => n.OperationalStatus == OperationalStatus.Up))
        {
            var ip = ni.GetIPProperties().UnicastAddresses
                .FirstOrDefault(a => a.Address.AddressFamily == AddressFamily.InterNetwork)?.Address;
            if (ip != null) return ip.ToString();
        }
        return null;
    }

    private static string? GetPrimaryMac()
    {
        var ni = NetworkInterface.GetAllNetworkInterfaces()
            .FirstOrDefault(n => n.OperationalStatus == OperationalStatus.Up && n.NetworkInterfaceType != NetworkInterfaceType.Loopback);
        return ni?.GetPhysicalAddress()?.ToString();
    }

    private static string? TryGetSerialNumber()
    {
        try
        {
            if (OperatingSystem.IsWindows())
            {
                // WMI via ManagementObjectSearcher would require System.Management (Windows-only). Use a fast fallback:
                var envVar = Environment.GetEnvironmentVariable("COMPUTERNAME");
                return envVar; // replace with WMI if you want exact BIOS serial
            }
            if (OperatingSystem.IsLinux())
            {
                var path = "/sys/class/dmi/id/product_serial";
                if (File.Exists(path)) return File.ReadAllText(path).Trim();
            }
            if (OperatingSystem.IsMacOS())
            {
                // ioreg fallback requires invoking a process; keep simple:
                return Environment.MachineName;
            }
        }
        catch { /* swallow */ }
        return null;
    }
}

public record HeartbeatPayload(
    string UniqueId,
    string? SerialNumber,
    string Hostname,
    string? IpAddress,
    string? MacAddress,
    string? AgentVersion
);

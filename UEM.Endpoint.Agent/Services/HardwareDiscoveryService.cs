using System;
using System.Collections.Generic;
using System.Linq;
using System.Management;
using System.Net;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;

namespace UEM.Endpoint.Agent.Services;

public class HardwareDiscoveryService
{
    public HardwareAssetInfo Discover()
    {
        var info = new HardwareAssetInfo
        {
            DeviceType = GetDeviceType(),
            Hostname = Dns.GetHostName(),
            IpAddresses = GetIpAddresses(),
            MacAddresses = GetMacAddresses(),
            OperatingSystem = RuntimeInformation.OSDescription,
            Manufacturer = GetWmiProperty("Win32_ComputerSystem", "Manufacturer"),
            Model = GetWmiProperty("Win32_ComputerSystem", "Model"),
            SerialNumber = GetWmiProperty("Win32_BIOS", "SerialNumber"),
            AssetTag = GetWmiProperty("Win32_SystemEnclosure", "SMBIOSAssetTag"),
            Cpu = GetCpuInfo(),
            Memory = GetMemoryInfo(),
            Storage = GetStorageInfo(),
            NetworkAdapters = GetNetworkAdapters(),
            BiosVersion = GetWmiProperty("Win32_BIOS", "SMBIOSBIOSVersion")
        };
        return info;
    }

    private string GetDeviceType()
    {
        // Simple heuristic, can be extended
        var model = GetWmiProperty("Win32_ComputerSystem", "Model")?.ToLowerInvariant() ?? "";
        if (model.Contains("server")) return "Server";
        if (model.Contains("laptop") || model.Contains("notebook")) return "Laptop";
        if (model.Contains("desktop")) return "Desktop";
        return "Unknown";
    }

    private List<string> GetIpAddresses()
        => NetworkInterface.GetAllNetworkInterfaces()
            .SelectMany(ni => ni.GetIPProperties().UnicastAddresses)
            .Where(ip => ip.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
            .Select(ip => ip.Address.ToString())
            .Distinct()
            .ToList();

    private List<string> GetMacAddresses()
        => NetworkInterface.GetAllNetworkInterfaces()
            .Where(ni => ni.OperationalStatus == OperationalStatus.Up)
            .Select(ni => ni.GetPhysicalAddress().ToString())
            .Where(mac => !string.IsNullOrWhiteSpace(mac))
            .Distinct()
            .ToList();

    private string? GetWmiProperty(string wmiClass, string property)
    {
        try
        {
            using var searcher = new ManagementObjectSearcher($"SELECT {property} FROM {wmiClass}");
            foreach (ManagementObject obj in searcher.Get())
            {
                return obj[property]?.ToString();
            }
        }
        catch { }
        return null;
    }

    private CpuInfo GetCpuInfo()
    {
        var info = new CpuInfo();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor");
            foreach (ManagementObject obj in searcher.Get())
            {
                info.Model = obj["Name"]?.ToString();
                info.Cores = Convert.ToInt32(obj["NumberOfCores"]);
                info.LogicalProcessors = Convert.ToInt32(obj["NumberOfLogicalProcessors"]);
                info.SpeedMHz = Convert.ToInt32(obj["MaxClockSpeed"]);
                info.Architecture = obj["Architecture"]?.ToString();
                break;
            }
        }
        catch { }
        return info;
    }

    private MemoryInfo GetMemoryInfo()
    {
        var info = new MemoryInfo();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PhysicalMemory");
            foreach (ManagementObject obj in searcher.Get())
            {
                info.TotalBytes += Convert.ToInt64(obj["Capacity"]);
                info.Type = obj["MemoryType"]?.ToString();
                info.SpeedMHz = obj["Speed"]?.ToString();
            }
        }
        catch { }
        return info;
    }

    private List<StorageInfo> GetStorageInfo()
    {
        var list = new List<StorageInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_DiskDrive");
            foreach (ManagementObject obj in searcher.Get())
            {
                list.Add(new StorageInfo
                {
                    Model = obj["Model"]?.ToString(),
                    Type = obj["MediaType"]?.ToString(),
                    CapacityBytes = Convert.ToInt64(obj["Size"] ?? 0)
                });
            }
        }
        catch { }
        return list;
    }

    private List<NetworkAdapterInfo> GetNetworkAdapters()
    {
        var list = new List<NetworkAdapterInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_NetworkAdapter WHERE PhysicalAdapter = True");
            foreach (ManagementObject obj in searcher.Get())
            {
                list.Add(new NetworkAdapterInfo
                {
                    Name = obj["Name"]?.ToString(),
                    Type = obj["AdapterType"]?.ToString(),
                    Speed = obj["Speed"]?.ToString()
                });
            }
        }
        catch { }
        return list;
    }
}

public class HardwareAssetInfo
{
    public string? DeviceType { get; set; }
    public string? Hostname { get; set; }
    public List<string>? IpAddresses { get; set; }
    public List<string>? MacAddresses { get; set; }
    public string? OperatingSystem { get; set; }
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }
    public string? AssetTag { get; set; }
    public CpuInfo? Cpu { get; set; }
    public MemoryInfo? Memory { get; set; }
    public List<StorageInfo>? Storage { get; set; }
    public List<NetworkAdapterInfo>? NetworkAdapters { get; set; }
    public string? BiosVersion { get; set; }
}

public class CpuInfo
{
    public string? Model { get; set; }
    public int Cores { get; set; }
    public int LogicalProcessors { get; set; }
    public int SpeedMHz { get; set; }
    public string? Architecture { get; set; }
}

public class MemoryInfo
{
    public long TotalBytes { get; set; }
    public string? Type { get; set; }
    public string? SpeedMHz { get; set; }
}

public class StorageInfo
{
    public string? Model { get; set; }
    public string? Type { get; set; }
    public long CapacityBytes { get; set; }
}

public class NetworkAdapterInfo
{
    public string? Name { get; set; }
    public string? Type { get; set; }
    public string? Speed { get; set; }
}               
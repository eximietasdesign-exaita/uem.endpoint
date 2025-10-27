using System;
using System.Collections.Generic;
using System.Linq;
using System.Management;
using System.Net;
using System.Runtime.Versioning;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.IO;
using Microsoft.Win32;

namespace UEM.Endpoint.Agent.Services;

[SupportedOSPlatform("windows")]
public class EnterpriseHardwareDiscoveryService
{
    private readonly ILogger<EnterpriseHardwareDiscoveryService> _logger;

    public EnterpriseHardwareDiscoveryService(ILogger<EnterpriseHardwareDiscoveryService> logger)
    {
        _logger = logger;
    }

    public async Task<EnterpriseHardwareInfo> DiscoverAsync()
    {
        _logger.LogInformation("Starting comprehensive hardware discovery...");
        
        var info = new EnterpriseHardwareInfo
        {
            DiscoveryTimestamp = DateTime.UtcNow,
            DeviceType = GetDeviceType(),
            Hostname = Dns.GetHostName(),
            DomainName = GetDomainName(),
            OperatingSystem = GetOperatingSystemInfo(),
            SystemInfo = GetSystemInfo(),
            Processors = GetProcessorInfo(),
            Memory = GetMemoryInfo(),
            Storage = GetStorageInfo(),
            NetworkAdapters = GetNetworkAdapters(),
            GraphicsAdapters = GetGraphicsAdapters(),
            AudioDevices = GetAudioDevices(),
            UsbDevices = GetUsbDevices(),
            Motherboard = GetMotherboardInfo(),
            BiosInfo = GetBiosInfo(),
            PowerSupply = GetPowerSupplyInfo(),
            Chassis = GetChassisInfo(),
            Monitors = GetMonitorInfo(),
            Printers = GetPrinterInfo(),
            CdRomDrives = GetCdRomDrives(),
            PhysicalDisks = GetPhysicalDisks(),
            LogicalDisks = GetLogicalDisks(),
            NetworkConfiguration = GetNetworkConfiguration(),
            EnvironmentalSensors = GetEnvironmentalSensors(),
            PowerStatus = GetPowerStatus(),
            UptimeInfo = GetUptimeInfo()
        };

        _logger.LogInformation("Hardware discovery completed successfully");
        return info;
    }

    private string GetDeviceType()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem");
            foreach (ManagementObject obj in searcher.Get())
            {
                var model = obj["Model"]?.ToString()?.ToLowerInvariant() ?? "";
                var pcroleMap = new Dictionary<string, string>
                {
                    ["1"] = "Desktop",
                    ["2"] = "Mobile",
                    ["3"] = "Workstation", 
                    ["4"] = "Enterprise Server",
                    ["5"] = "Small Office/Home Office Server",
                    ["6"] = "Appliance PC",
                    ["7"] = "Performance Server",
                    ["8"] = "Maximum"
                };

                var pcrole = obj["PCSystemType"]?.ToString();
                if (!string.IsNullOrEmpty(pcrole) && pcroleMap.ContainsKey(pcrole))
                    return pcroleMap[pcrole];
                
                // Fallback to model detection
                if (model.Contains("server")) return "Server";
                if (model.Contains("laptop") || model.Contains("notebook")) return "Laptop";
                if (model.Contains("desktop")) return "Desktop";
                if (model.Contains("tablet")) return "Tablet";
                
                return "Workstation";
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to determine device type");
        }
        return "Unknown";
    }

    private string GetDomainName()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem");
            foreach (ManagementObject obj in searcher.Get())
            {
                var domain = obj["Domain"]?.ToString();
                var workgroup = obj["Workgroup"]?.ToString();
                return !string.IsNullOrEmpty(domain) ? domain : workgroup ?? "WORKGROUP";
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get domain name");
        }
        return "WORKGROUP";
    }

    private OperatingSystemInfo GetOperatingSystemInfo()
    {
        var info = new OperatingSystemInfo();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem");
            foreach (ManagementObject obj in searcher.Get())
            {
                info.Name = obj["Caption"]?.ToString();
                info.Version = obj["Version"]?.ToString();
                info.BuildNumber = obj["BuildNumber"]?.ToString();
                info.ServicePack = obj["ServicePackMajorVersion"]?.ToString();
                info.Architecture = obj["OSArchitecture"]?.ToString();
                info.InstallDate = ManagementDateTimeConverter.ToDateTime(obj["InstallDate"]?.ToString() ?? "");
                info.LastBootUpTime = ManagementDateTimeConverter.ToDateTime(obj["LastBootUpTime"]?.ToString() ?? "");
                info.SerialNumber = obj["SerialNumber"]?.ToString();
                info.Locale = obj["Locale"]?.ToString();
                info.TimeZone = obj["CurrentTimeZone"]?.ToString();
                info.TotalVirtualMemoryBytes = Convert.ToInt64(obj["TotalVirtualMemorySize"] ?? 0) * 1024;
                info.TotalVisibleMemoryBytes = Convert.ToInt64(obj["TotalVisibleMemorySize"] ?? 0) * 1024;
                info.FreePhysicalMemoryBytes = Convert.ToInt64(obj["FreePhysicalMemory"] ?? 0) * 1024;
                break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get OS info");
        }
        return info;
    }

    private SystemInfo GetSystemInfo()
    {
        var info = new SystemInfo();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_ComputerSystem");
            foreach (ManagementObject obj in searcher.Get())
            {
                info.Manufacturer = obj["Manufacturer"]?.ToString();
                info.Model = obj["Model"]?.ToString();
                info.SystemFamily = obj["SystemFamily"]?.ToString();
                info.SystemSKUNumber = obj["SystemSKUNumber"]?.ToString();
                info.TotalPhysicalMemoryBytes = Convert.ToInt64(obj["TotalPhysicalMemory"] ?? 0);
                info.NumberOfProcessors = Convert.ToInt32(obj["NumberOfProcessors"] ?? 0);
                info.NumberOfLogicalProcessors = Convert.ToInt32(obj["NumberOfLogicalProcessors"] ?? 0);
                info.AutomaticManagedPagefile = Convert.ToBoolean(obj["AutomaticManagedPagefile"] ?? false);
                info.AutomaticResetBootOption = Convert.ToBoolean(obj["AutomaticResetBootOption"] ?? false);
                info.DomainRole = obj["DomainRole"]?.ToString();
                break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get system info");
        }
        return info;
    }

    private List<ProcessorInfo> GetProcessorInfo()
    {
        var processors = new List<ProcessorInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Processor");
            foreach (ManagementObject obj in searcher.Get())
            {
                processors.Add(new ProcessorInfo
                {
                    Name = obj["Name"]?.ToString(),
                    Manufacturer = obj["Manufacturer"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    ProcessorId = obj["ProcessorId"]?.ToString(),
                    SocketDesignation = obj["SocketDesignation"]?.ToString(),
                    Family = obj["Family"]?.ToString(),
                    Model = obj["Model"]?.ToString(),
                    Stepping = obj["Stepping"]?.ToString(),
                    MaxClockSpeedMHz = Convert.ToInt32(obj["MaxClockSpeed"] ?? 0),
                    CurrentClockSpeedMHz = Convert.ToInt32(obj["CurrentClockSpeed"] ?? 0),
                    ExtClockMHz = Convert.ToInt32(obj["ExtClock"] ?? 0),
                    NumberOfCores = Convert.ToInt32(obj["NumberOfCores"] ?? 0),
                    NumberOfLogicalProcessors = Convert.ToInt32(obj["NumberOfLogicalProcessors"] ?? 0),
                    ThreadCount = Convert.ToInt32(obj["ThreadCount"] ?? 0),
                    L2CacheSize = Convert.ToInt32(obj["L2CacheSize"] ?? 0),
                    L3CacheSize = Convert.ToInt32(obj["L3CacheSize"] ?? 0),
                    Architecture = obj["Architecture"]?.ToString(),
                    DataWidth = Convert.ToInt32(obj["DataWidth"] ?? 0),
                    AddressWidth = Convert.ToInt32(obj["AddressWidth"] ?? 0),
                    VirtualizationFirmwareEnabled = Convert.ToBoolean(obj["VirtualizationFirmwareEnabled"] ?? false),
                    VMMonitorModeExtensions = Convert.ToBoolean(obj["VMMonitorModeExtensions"] ?? false),
                    SecondLevelAddressTranslationExtensions = Convert.ToBoolean(obj["SecondLevelAddressTranslationExtensions"] ?? false)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get processor info");
        }
        return processors;
    }

    private List<MemoryModuleInfo> GetMemoryInfo()
    {
        var modules = new List<MemoryModuleInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PhysicalMemory");
            foreach (ManagementObject obj in searcher.Get())
            {
                modules.Add(new MemoryModuleInfo
                {
                    Tag = obj["Tag"]?.ToString(),
                    DeviceLocator = obj["DeviceLocator"]?.ToString(),
                    BankLabel = obj["BankLabel"]?.ToString(),
                    CapacityBytes = Convert.ToInt64(obj["Capacity"] ?? 0),
                    MemoryType = obj["MemoryType"]?.ToString(),
                    TypeDetail = obj["TypeDetail"]?.ToString(),
                    SpeedMHz = Convert.ToInt32(obj["Speed"] ?? 0),
                    ConfiguredClockSpeedMHz = Convert.ToInt32(obj["ConfiguredClockSpeed"] ?? 0),
                    ConfiguredVoltage = Convert.ToInt32(obj["ConfiguredVoltage"] ?? 0),
                    DataWidth = Convert.ToInt32(obj["DataWidth"] ?? 0),
                    TotalWidth = Convert.ToInt32(obj["TotalWidth"] ?? 0),
                    Manufacturer = obj["Manufacturer"]?.ToString(),
                    PartNumber = obj["PartNumber"]?.ToString(),
                    SerialNumber = obj["SerialNumber"]?.ToString(),
                    FormFactor = obj["FormFactor"]?.ToString()
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get memory info");
        }
        return modules;
    }

    private List<StorageDeviceInfo> GetStorageInfo()
    {
        var devices = new List<StorageDeviceInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_DiskDrive");
            foreach (ManagementObject obj in searcher.Get())
            {
                devices.Add(new StorageDeviceInfo
                {
                    DeviceID = obj["DeviceID"]?.ToString(),
                    Model = obj["Model"]?.ToString(),
                    Manufacturer = obj["Manufacturer"]?.ToString(),
                    SerialNumber = obj["SerialNumber"]?.ToString(),
                    Size = Convert.ToInt64(obj["Size"] ?? 0),
                    MediaType = obj["MediaType"]?.ToString(),
                    InterfaceType = obj["InterfaceType"]?.ToString(),
                    FirmwareRevision = obj["FirmwareRevision"]?.ToString(),
                    Partitions = Convert.ToInt32(obj["Partitions"] ?? 0),
                    SectorsPerTrack = Convert.ToInt32(obj["SectorsPerTrack"] ?? 0),
                    TracksPerCylinder = Convert.ToInt32(obj["TracksPerCylinder"] ?? 0),
                    TotalCylinders = Convert.ToInt64(obj["TotalCylinders"] ?? 0),
                    TotalHeads = Convert.ToInt32(obj["TotalHeads"] ?? 0),
                    TotalSectors = Convert.ToInt64(obj["TotalSectors"] ?? 0),
                    TotalTracks = Convert.ToInt64(obj["TotalTracks"] ?? 0),
                    BytesPerSector = Convert.ToInt32(obj["BytesPerSector"] ?? 0)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get storage info");
        }
        return devices;
    }

    private List<EnterpriseNetworkAdapterInfo> GetNetworkAdapters()
    {
        var adapters = new List<EnterpriseNetworkAdapterInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_NetworkAdapter WHERE PhysicalAdapter = True");
            foreach (ManagementObject obj in searcher.Get())
            {
                var adapterId = obj["DeviceID"]?.ToString();
                adapters.Add(new EnterpriseNetworkAdapterInfo
                {
                    DeviceID = adapterId,
                    Name = obj["Name"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    AdapterType = obj["AdapterType"]?.ToString(),
                    MACAddress = obj["MACAddress"]?.ToString(),
                    Manufacturer = obj["Manufacturer"]?.ToString(),
                    ProductName = obj["ProductName"]?.ToString(),
                    Speed = obj["Speed"]?.ToString(),
                    NetConnectionID = obj["NetConnectionID"]?.ToString(),
                    NetConnectionStatus = obj["NetConnectionStatus"]?.ToString(),
                    ServiceName = obj["ServiceName"]?.ToString(),
                    TimeOfLastReset = obj["TimeOfLastReset"]?.ToString(),
                    ConfigurationInfo = GetNetworkAdapterConfiguration(adapterId)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get network adapter info");
        }
        return adapters;
    }

    private NetworkAdapterConfiguration? GetNetworkAdapterConfiguration(string? adapterId)
    {
        if (string.IsNullOrEmpty(adapterId)) return null;
        
        try
        {
            using var searcher = new ManagementObjectSearcher($"SELECT * FROM Win32_NetworkAdapterConfiguration WHERE Index = {adapterId}");
            foreach (ManagementObject obj in searcher.Get())
            {
                return new NetworkAdapterConfiguration
                {
                    IPEnabled = Convert.ToBoolean(obj["IPEnabled"] ?? false),
                    IPAddress = (obj["IPAddress"] as string[])?.ToList(),
                    IPSubnet = (obj["IPSubnet"] as string[])?.ToList(),
                    DefaultIPGateway = (obj["DefaultIPGateway"] as string[])?.ToList(),
                    DNSServerSearchOrder = (obj["DNSServerSearchOrder"] as string[])?.ToList(),
                    DHCPEnabled = Convert.ToBoolean(obj["DHCPEnabled"] ?? false),
                    DHCPServer = obj["DHCPServer"]?.ToString(),
                    DNSDomain = obj["DNSDomain"]?.ToString(),
                    DNSHostName = obj["DNSHostName"]?.ToString(),
                    WINSPrimaryServer = obj["WINSPrimaryServer"]?.ToString(),
                    WINSSecondaryServer = obj["WINSSecondaryServer"]?.ToString()
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get network adapter configuration for {AdapterId}", adapterId);
        }
        return null;
    }

    private List<GraphicsAdapterInfo> GetGraphicsAdapters()
    {
        var adapters = new List<GraphicsAdapterInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_VideoController");
            foreach (ManagementObject obj in searcher.Get())
            {
                adapters.Add(new GraphicsAdapterInfo
                {
                    Name = obj["Name"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    AdapterRAM = Convert.ToInt64(obj["AdapterRAM"] ?? 0),
                    DriverVersion = obj["DriverVersion"]?.ToString(),
                    DriverDate = obj["DriverDate"]?.ToString(),
                    VideoProcessor = obj["VideoProcessor"]?.ToString(),
                    VideoArchitecture = obj["VideoArchitecture"]?.ToString(),
                    VideoMemoryType = obj["VideoMemoryType"]?.ToString(),
                    CurrentBitsPerPixel = Convert.ToInt32(obj["CurrentBitsPerPixel"] ?? 0),
                    CurrentHorizontalResolution = Convert.ToInt32(obj["CurrentHorizontalResolution"] ?? 0),
                    CurrentVerticalResolution = Convert.ToInt32(obj["CurrentVerticalResolution"] ?? 0),
                    CurrentRefreshRate = Convert.ToInt32(obj["CurrentRefreshRate"] ?? 0),
                    MaxRefreshRate = Convert.ToInt32(obj["MaxRefreshRate"] ?? 0),
                    MinRefreshRate = Convert.ToInt32(obj["MinRefreshRate"] ?? 0)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get graphics adapter info");
        }
        return adapters;
    }

    private List<AudioDeviceInfo> GetAudioDevices()
    {
        var devices = new List<AudioDeviceInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_SoundDevice");
            foreach (ManagementObject obj in searcher.Get())
            {
                devices.Add(new AudioDeviceInfo
                {
                    Name = obj["Name"]?.ToString(),
                    Manufacturer = obj["Manufacturer"]?.ToString(),
                    ProductName = obj["ProductName"]?.ToString(),
                    DeviceID = obj["DeviceID"]?.ToString(),
                    Status = obj["Status"]?.ToString(),
                    StatusInfo = obj["StatusInfo"]?.ToString()
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get audio device info");
        }
        return devices;
    }

    private List<UsbDeviceInfo> GetUsbDevices()
    {
        var devices = new List<UsbDeviceInfo>();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_USBControllerDevice");
            foreach (ManagementObject obj in searcher.Get())
            {
                var dependent = obj["Dependent"]?.ToString();
                if (!string.IsNullOrEmpty(dependent))
                {
                    var deviceId = dependent.Split('"')[1];
                    var deviceInfo = GetUsbDeviceDetails(deviceId);
                    if (deviceInfo != null)
                        devices.Add(deviceInfo);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get USB device info");
        }
        return devices;
    }

    private UsbDeviceInfo? GetUsbDeviceDetails(string deviceId)
    {
        try
        {
            using var searcher = new ManagementObjectSearcher($"SELECT * FROM Win32_PnPEntity WHERE DeviceID = '{deviceId}'");
            foreach (ManagementObject obj in searcher.Get())
            {
                return new UsbDeviceInfo
                {
                    DeviceID = obj["DeviceID"]?.ToString(),
                    Name = obj["Name"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    Manufacturer = obj["Manufacturer"]?.ToString(),
                    Service = obj["Service"]?.ToString(),
                    ClassGuid = obj["ClassGuid"]?.ToString(),
                    CompatibleID = obj["CompatibleID"]?.ToString(),
                    HardwareID = obj["HardwareID"]?.ToString(),
                    Status = obj["Status"]?.ToString()
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get USB device details for {DeviceId}", deviceId);
        }
        return null;
    }

    private MotherboardInfo GetMotherboardInfo()
    {
        var info = new MotherboardInfo();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_BaseBoard");
            foreach (ManagementObject obj in searcher.Get())
            {
                info.Manufacturer = obj["Manufacturer"]?.ToString();
                info.Product = obj["Product"]?.ToString();
                info.Version = obj["Version"]?.ToString();
                info.SerialNumber = obj["SerialNumber"]?.ToString();
                info.Tag = obj["Tag"]?.ToString();
                info.Model = obj["Model"]?.ToString();
                info.PartNumber = obj["PartNumber"]?.ToString();
                info.PoweredOn = Convert.ToBoolean(obj["PoweredOn"] ?? false);
                info.Removable = Convert.ToBoolean(obj["Removable"] ?? false);
                info.Replaceable = Convert.ToBoolean(obj["Replaceable"] ?? false);
                break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get motherboard info");
        }
        return info;
    }

    private BiosInfo GetBiosInfo()
    {
        var info = new BiosInfo();
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_BIOS");
            foreach (ManagementObject obj in searcher.Get())
            {
                info.Name = obj["Name"]?.ToString();
                info.Manufacturer = obj["Manufacturer"]?.ToString();
                info.Version = obj["Version"]?.ToString();
                info.SerialNumber = obj["SerialNumber"]?.ToString();
                info.SMBIOSBIOSVersion = obj["SMBIOSBIOSVersion"]?.ToString();
                info.SMBIOSMajorVersion = Convert.ToInt32(obj["SMBIOSMajorVersion"] ?? 0);
                info.SMBIOSMinorVersion = Convert.ToInt32(obj["SMBIOSMinorVersion"] ?? 0);
                info.ReleaseDate = obj["ReleaseDate"]?.ToString();
                info.BuildNumber = obj["BuildNumber"]?.ToString();
                info.CodeSet = obj["CodeSet"]?.ToString();
                info.CurrentLanguage = obj["CurrentLanguage"]?.ToString();
                info.Description = obj["Description"]?.ToString();
                info.EmbeddedControllerMajorVersion = Convert.ToInt32(obj["EmbeddedControllerMajorVersion"] ?? 0);
                info.EmbeddedControllerMinorVersion = Convert.ToInt32(obj["EmbeddedControllerMinorVersion"] ?? 0);
                info.SystemBiosMajorVersion = Convert.ToInt32(obj["SystemBiosMajorVersion"] ?? 0);
                info.SystemBiosMinorVersion = Convert.ToInt32(obj["SystemBiosMinorVersion"] ?? 0);
                break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get BIOS info");
        }
        return info;
    }

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
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get WMI property {Property} from {WmiClass}", property, wmiClass);
        }
        return null;
    }

    // Additional methods for other hardware discovery...
    private PowerSupplyInfo GetPowerSupplyInfo() => new PowerSupplyInfo();
    private ChassisInfo GetChassisInfo() => new ChassisInfo();
    private List<MonitorInfo> GetMonitorInfo() => new List<MonitorInfo>();
    private List<PrinterInfo> GetPrinterInfo() => new List<PrinterInfo>();
    private List<CdRomDriveInfo> GetCdRomDrives() => new List<CdRomDriveInfo>();
    private List<PhysicalDiskInfo> GetPhysicalDisks() => new List<PhysicalDiskInfo>();
    private List<LogicalDiskInfo> GetLogicalDisks() => new List<LogicalDiskInfo>();
    private NetworkConfigurationInfo GetNetworkConfiguration() => new NetworkConfigurationInfo();
    private List<EnvironmentalSensorInfo> GetEnvironmentalSensors() => new List<EnvironmentalSensorInfo>();
    private PowerStatusInfo GetPowerStatus() => new PowerStatusInfo();
    private UptimeInfo GetUptimeInfo() => new UptimeInfo
    {
        LastBootTime = DateTime.Now.AddMilliseconds(-Environment.TickCount64),
        UptimeSeconds = Environment.TickCount64 / 1000
    };
}

// Data models for enterprise hardware discovery
public class EnterpriseHardwareInfo
{
    public DateTime DiscoveryTimestamp { get; set; }
    public string? DeviceType { get; set; }
    public string? Hostname { get; set; }
    public string? DomainName { get; set; }
    public OperatingSystemInfo? OperatingSystem { get; set; }
    public SystemInfo? SystemInfo { get; set; }
    public List<ProcessorInfo>? Processors { get; set; }
    public List<MemoryModuleInfo>? Memory { get; set; }
    public List<StorageDeviceInfo>? Storage { get; set; }
    public List<EnterpriseNetworkAdapterInfo>? NetworkAdapters { get; set; }
    public List<GraphicsAdapterInfo>? GraphicsAdapters { get; set; }
    public List<AudioDeviceInfo>? AudioDevices { get; set; }
    public List<UsbDeviceInfo>? UsbDevices { get; set; }
    public MotherboardInfo? Motherboard { get; set; }
    public BiosInfo? BiosInfo { get; set; }
    public PowerSupplyInfo? PowerSupply { get; set; }
    public ChassisInfo? Chassis { get; set; }
    public List<MonitorInfo>? Monitors { get; set; }
    public List<PrinterInfo>? Printers { get; set; }
    public List<CdRomDriveInfo>? CdRomDrives { get; set; }
    public List<PhysicalDiskInfo>? PhysicalDisks { get; set; }
    public List<LogicalDiskInfo>? LogicalDisks { get; set; }
    public NetworkConfigurationInfo? NetworkConfiguration { get; set; }
    public List<EnvironmentalSensorInfo>? EnvironmentalSensors { get; set; }
    public PowerStatusInfo? PowerStatus { get; set; }
    public UptimeInfo? UptimeInfo { get; set; }
}

public class OperatingSystemInfo
{
    public string? Name { get; set; }
    public string? Version { get; set; }
    public string? BuildNumber { get; set; }
    public string? ServicePack { get; set; }
    public string? Architecture { get; set; }
    public DateTime InstallDate { get; set; }
    public DateTime LastBootUpTime { get; set; }
    public string? SerialNumber { get; set; }
    public string? Locale { get; set; }
    public string? TimeZone { get; set; }
    public long TotalVirtualMemoryBytes { get; set; }
    public long TotalVisibleMemoryBytes { get; set; }
    public long FreePhysicalMemoryBytes { get; set; }
}

public class SystemInfo
{
    public string? Manufacturer { get; set; }
    public string? Model { get; set; }
    public string? SystemFamily { get; set; }
    public string? SystemSKUNumber { get; set; }
    public long TotalPhysicalMemoryBytes { get; set; }
    public int NumberOfProcessors { get; set; }
    public int NumberOfLogicalProcessors { get; set; }
    public bool AutomaticManagedPagefile { get; set; }
    public bool AutomaticResetBootOption { get; set; }
    public string? DomainRole { get; set; }
}

public class ProcessorInfo
{
    public string? Name { get; set; }
    public string? Manufacturer { get; set; }
    public string? Description { get; set; }
    public string? ProcessorId { get; set; }
    public string? SocketDesignation { get; set; }
    public string? Family { get; set; }
    public string? Model { get; set; }
    public string? Stepping { get; set; }
    public int MaxClockSpeedMHz { get; set; }
    public int CurrentClockSpeedMHz { get; set; }
    public int ExtClockMHz { get; set; }
    public int NumberOfCores { get; set; }
    public int NumberOfLogicalProcessors { get; set; }
    public int ThreadCount { get; set; }
    public int L2CacheSize { get; set; }
    public int L3CacheSize { get; set; }
    public string? Architecture { get; set; }
    public int DataWidth { get; set; }
    public int AddressWidth { get; set; }
    public bool VirtualizationFirmwareEnabled { get; set; }
    public bool VMMonitorModeExtensions { get; set; }
    public bool SecondLevelAddressTranslationExtensions { get; set; }
}

public class MemoryModuleInfo
{
    public string? Tag { get; set; }
    public string? DeviceLocator { get; set; }
    public string? BankLabel { get; set; }
    public long CapacityBytes { get; set; }
    public string? MemoryType { get; set; }
    public string? TypeDetail { get; set; }
    public int SpeedMHz { get; set; }
    public int ConfiguredClockSpeedMHz { get; set; }
    public int ConfiguredVoltage { get; set; }
    public int DataWidth { get; set; }
    public int TotalWidth { get; set; }
    public string? Manufacturer { get; set; }
    public string? PartNumber { get; set; }
    public string? SerialNumber { get; set; }
    public string? FormFactor { get; set; }
}

public class StorageDeviceInfo
{
    public string? DeviceID { get; set; }
    public string? Model { get; set; }
    public string? Manufacturer { get; set; }
    public string? SerialNumber { get; set; }
    public long Size { get; set; }
    public string? MediaType { get; set; }
    public string? InterfaceType { get; set; }
    public string? FirmwareRevision { get; set; }
    public int Partitions { get; set; }
    public int SectorsPerTrack { get; set; }
    public int TracksPerCylinder { get; set; }
    public long TotalCylinders { get; set; }
    public int TotalHeads { get; set; }
    public long TotalSectors { get; set; }
    public long TotalTracks { get; set; }
    public int BytesPerSector { get; set; }
}

public class EnterpriseNetworkAdapterInfo
{
    public string? DeviceID { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? AdapterType { get; set; }
    public string? MACAddress { get; set; }
    public string? Manufacturer { get; set; }
    public string? ProductName { get; set; }
    public string? Speed { get; set; }
    public string? NetConnectionID { get; set; }
    public string? NetConnectionStatus { get; set; }
    public string? ServiceName { get; set; }
    public string? TimeOfLastReset { get; set; }
    public NetworkAdapterConfiguration? ConfigurationInfo { get; set; }
}

public class NetworkAdapterConfiguration
{
    public bool IPEnabled { get; set; }
    public List<string>? IPAddress { get; set; }
    public List<string>? IPSubnet { get; set; }
    public List<string>? DefaultIPGateway { get; set; }
    public List<string>? DNSServerSearchOrder { get; set; }
    public bool DHCPEnabled { get; set; }
    public string? DHCPServer { get; set; }
    public string? DNSDomain { get; set; }
    public string? DNSHostName { get; set; }
    public string? WINSPrimaryServer { get; set; }
    public string? WINSSecondaryServer { get; set; }
}

public class GraphicsAdapterInfo
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public long AdapterRAM { get; set; }
    public string? DriverVersion { get; set; }
    public string? DriverDate { get; set; }
    public string? VideoProcessor { get; set; }
    public string? VideoArchitecture { get; set; }
    public string? VideoMemoryType { get; set; }
    public int CurrentBitsPerPixel { get; set; }
    public int CurrentHorizontalResolution { get; set; }
    public int CurrentVerticalResolution { get; set; }
    public int CurrentRefreshRate { get; set; }
    public int MaxRefreshRate { get; set; }
    public int MinRefreshRate { get; set; }
}

public class AudioDeviceInfo
{
    public string? Name { get; set; }
    public string? Manufacturer { get; set; }
    public string? ProductName { get; set; }
    public string? DeviceID { get; set; }
    public string? Status { get; set; }
    public string? StatusInfo { get; set; }
}

public class UsbDeviceInfo
{
    public string? DeviceID { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Manufacturer { get; set; }
    public string? Service { get; set; }
    public string? ClassGuid { get; set; }
    public string? CompatibleID { get; set; }
    public string? HardwareID { get; set; }
    public string? Status { get; set; }
}

public class MotherboardInfo
{
    public string? Manufacturer { get; set; }
    public string? Product { get; set; }
    public string? Version { get; set; }
    public string? SerialNumber { get; set; }
    public string? Tag { get; set; }
    public string? Model { get; set; }
    public string? PartNumber { get; set; }
    public bool PoweredOn { get; set; }
    public bool Removable { get; set; }
    public bool Replaceable { get; set; }
}

public class BiosInfo
{
    public string? Name { get; set; }
    public string? Manufacturer { get; set; }
    public string? Version { get; set; }
    public string? SerialNumber { get; set; }
    public string? SMBIOSBIOSVersion { get; set; }
    public int SMBIOSMajorVersion { get; set; }
    public int SMBIOSMinorVersion { get; set; }
    public string? ReleaseDate { get; set; }
    public string? BuildNumber { get; set; }
    public string? CodeSet { get; set; }
    public string? CurrentLanguage { get; set; }
    public string? Description { get; set; }
    public int EmbeddedControllerMajorVersion { get; set; }
    public int EmbeddedControllerMinorVersion { get; set; }
    public int SystemBiosMajorVersion { get; set; }
    public int SystemBiosMinorVersion { get; set; }
}

// Placeholder classes for additional hardware components
public class PowerSupplyInfo { }
public class ChassisInfo { }
public class MonitorInfo { }
public class PrinterInfo { }
public class CdRomDriveInfo { }
public class PhysicalDiskInfo { }
public class LogicalDiskInfo { }
public class NetworkConfigurationInfo { }
public class EnvironmentalSensorInfo { }
public class PowerStatusInfo { }

public class UptimeInfo
{
    public DateTime LastBootTime { get; set; }
    public long UptimeSeconds { get; set; }
}
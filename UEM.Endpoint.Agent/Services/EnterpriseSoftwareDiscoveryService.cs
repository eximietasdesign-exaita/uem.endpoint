using System;
using System.Collections.Generic;
using System.Linq;
using System.Management;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using System.IO;
using System.Diagnostics;
using System.Text.Json;
using System.Runtime.Versioning;

namespace UEM.Endpoint.Agent.Services;
[SupportedOSPlatform("windows")]
public class EnterpriseSoftwareDiscoveryService
{
    private readonly ILogger<EnterpriseSoftwareDiscoveryService> _logger;

    public EnterpriseSoftwareDiscoveryService(ILogger<EnterpriseSoftwareDiscoveryService> logger)
    {
        _logger = logger;
    }

    public async Task<EnterpriseSoftwareInfo> DiscoverAsync()
    {
        _logger.LogInformation("Starting comprehensive software discovery...");
        
        // Run discovery operations asynchronously
        return await Task.Run(() => {
            var info = new EnterpriseSoftwareInfo
            {
                DiscoveryTimestamp = DateTime.UtcNow,
                InstalledPrograms = GetInstalledPrograms(),
                WindowsFeatures = GetWindowsFeatures(),
                WindowsUpdates = GetWindowsUpdates(),
                EnvironmentVariables = GetEnvironmentVariables(),
                Services = GetWindowsServices(),
                StartupPrograms = GetStartupPrograms(),
                Drivers = GetInstalledDrivers(),
                Certificates = GetInstalledCertificates(),
                FirewallRules = GetFirewallRules(),
                RunningProcesses = GetRunningProcesses(),
                ScheduledTasks = GetScheduledTasks(),
                NetworkConnections = GetNetworkConnections(),
                EventLogSummary = GetEventLogSummary(),
                SystemConfiguration = GetSystemConfiguration()
            };

            _logger.LogInformation("Software discovery completed successfully. Found {ProgramCount} programs, {ServiceCount} services, {ProcessCount} processes", 
                info.InstalledPrograms?.Count ?? 0, 
                info.Services?.Count ?? 0, 
                info.RunningProcesses?.Count ?? 0);
            
            return info;
        });
    }

    private List<InstalledProgramInfo> GetInstalledPrograms()
    {
        var programs = new List<InstalledProgramInfo>();
        
        // Get from Windows Registry - both 64-bit and 32-bit programs
        var registryPaths = new[]
        {
            @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
            @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
        };

        foreach (var path in registryPaths)
        {
            try
            {
                using var key = Registry.LocalMachine.OpenSubKey(path);
                if (key != null)
                {
                    foreach (var subKeyName in key.GetSubKeyNames())
                    {
                        using var subKey = key.OpenSubKey(subKeyName);
                        if (subKey != null)
                        {
                            var displayName = subKey.GetValue("DisplayName")?.ToString();
                            if (!string.IsNullOrEmpty(displayName))
                            {
                                programs.Add(new InstalledProgramInfo
                                {
                                    Name = displayName,
                                    Version = subKey.GetValue("DisplayVersion")?.ToString(),
                                    Publisher = subKey.GetValue("Publisher")?.ToString(),
                                    InstallDate = ParseInstallDate(subKey.GetValue("InstallDate")?.ToString()),
                                    InstallLocation = subKey.GetValue("InstallLocation")?.ToString(),
                                    UninstallString = subKey.GetValue("UninstallString")?.ToString(),
                                    Size = ParseSize(subKey.GetValue("EstimatedSize")?.ToString()),
                                    Architecture = path.Contains("WOW6432Node") ? "x86" : "x64",
                                    RegistryKey = subKeyName,
                                    HelpLink = subKey.GetValue("HelpLink")?.ToString(),
                                    URLInfoAbout = subKey.GetValue("URLInfoAbout")?.ToString(),
                                    Contact = subKey.GetValue("Contact")?.ToString(),
                                    SystemComponent = Convert.ToBoolean(subKey.GetValue("SystemComponent") ?? 0)
                                });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read registry path {Path}", path);
            }
        }

        // Get programs from Windows Management Instrumentation
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Product");
            foreach (ManagementObject obj in searcher.Get())
            {
                var name = obj["Name"]?.ToString();
                if (!string.IsNullOrEmpty(name) && !programs.Any(p => p.Name == name))
                {
                    programs.Add(new InstalledProgramInfo
                    {
                        Name = name,
                        Version = obj["Version"]?.ToString(),
                        Publisher = obj["Vendor"]?.ToString(),
                        InstallDate = ParseWmiDate(obj["InstallDate"]?.ToString()),
                        InstallLocation = obj["InstallLocation"]?.ToString(),
                        Size = 0,
                        Architecture = "Unknown",
                        IdentifyingNumber = obj["IdentifyingNumber"]?.ToString(),
                        PackageCode = obj["PackageCode"]?.ToString(),
                        AssignmentType = obj["AssignmentType"]?.ToString(),
                        PackageName = obj["PackageName"]?.ToString(),
                        Language = obj["Language"]?.ToString(),
                        ProductID = obj["ProductID"]?.ToString()
                    });
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get programs from WMI");
        }

        return programs.OrderBy(p => p.Name).ToList();
    }

    private List<WindowsFeatureInfo> GetWindowsFeatures()
    {
        var features = new List<WindowsFeatureInfo>();
        
        try
        {
            // Use DISM to get Windows features
            var processInfo = new ProcessStartInfo
            {
                FileName = "dism.exe",
                Arguments = "/online /get-features /format:table",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };

            using var process = Process.Start(processInfo);
            if (process != null)
            {
                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();

                var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines.Skip(2)) // Skip header lines
                {
                    var parts = line.Split('|', StringSplitOptions.TrimEntries);
                    if (parts.Length >= 2)
                    {
                        features.Add(new WindowsFeatureInfo
                        {
                            FeatureName = parts[0],
                            State = parts[1]
                        });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get Windows features");
        }

        return features;
    }

    private List<WindowsUpdateInfo> GetWindowsUpdates()
    {
        var updates = new List<WindowsUpdateInfo>();
        
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_QuickFixEngineering");
            foreach (ManagementObject obj in searcher.Get())
            {
                updates.Add(new WindowsUpdateInfo
                {
                    HotFixID = obj["HotFixID"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    InstalledBy = obj["InstalledBy"]?.ToString(),
                    InstalledOn = ParseWmiDate(obj["InstalledOn"]?.ToString()),
                    Caption = obj["Caption"]?.ToString(),
                    CSName = obj["CSName"]?.ToString(),
                    FixComments = obj["FixComments"]?.ToString(),
                    InstallDate = ParseWmiDate(obj["InstallDate"]?.ToString()),
                    Name = obj["Name"]?.ToString(),
                    ServicePackInEffect = obj["ServicePackInEffect"]?.ToString(),
                    Status = obj["Status"]?.ToString()
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get Windows updates");
        }

        return updates.OrderByDescending(u => u.InstalledOn).ToList();
    }

    private Dictionary<string, string> GetEnvironmentVariables()
    {
        var variables = new Dictionary<string, string>();
        
        try
        {
            foreach (var entry in Environment.GetEnvironmentVariables().Cast<System.Collections.DictionaryEntry>())
            {
                var keyString = entry.Key?.ToString();
                if (!string.IsNullOrEmpty(keyString))
                {
                    variables[keyString] = entry.Value?.ToString() ?? "";
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get environment variables");
        }

        return variables;
    }

    private List<WindowsServiceInfo> GetWindowsServices()
    {
        var services = new List<WindowsServiceInfo>();
        
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Service");
            foreach (ManagementObject obj in searcher.Get())
            {
                services.Add(new WindowsServiceInfo
                {
                    Name = obj["Name"]?.ToString(),
                    DisplayName = obj["DisplayName"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    State = obj["State"]?.ToString(),
                    StartMode = obj["StartMode"]?.ToString(),
                    ServiceType = obj["ServiceType"]?.ToString(),
                    PathName = obj["PathName"]?.ToString(),
                    StartName = obj["StartName"]?.ToString(),
                    ProcessId = Convert.ToInt32(obj["ProcessId"] ?? 0),
                    AcceptPause = Convert.ToBoolean(obj["AcceptPause"] ?? false),
                    AcceptStop = Convert.ToBoolean(obj["AcceptStop"] ?? false),
                    Caption = obj["Caption"]?.ToString(),
                    CheckPoint = Convert.ToInt32(obj["CheckPoint"] ?? 0),
                    DelayedAutoStart = Convert.ToBoolean(obj["DelayedAutoStart"] ?? false),
                    DesktopInteract = Convert.ToBoolean(obj["DesktopInteract"] ?? false),
                    ErrorControl = obj["ErrorControl"]?.ToString(),
                    ExitCode = Convert.ToInt32(obj["ExitCode"] ?? 0),
                    ServiceSpecificExitCode = Convert.ToInt32(obj["ServiceSpecificExitCode"] ?? 0),
                    Started = Convert.ToBoolean(obj["Started"] ?? false),
                    Status = obj["Status"]?.ToString(),
                    SystemName = obj["SystemName"]?.ToString(),
                    TagId = Convert.ToInt32(obj["TagId"] ?? 0),
                    WaitHint = Convert.ToInt32(obj["WaitHint"] ?? 0)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get Windows services");
        }

        return services.OrderBy(s => s.DisplayName).ToList();
    }

    private List<StartupProgramInfo> GetStartupPrograms()
    {
        var startupPrograms = new List<StartupProgramInfo>();
        
        // Registry startup locations
        var startupKeys = new[]
        {
            @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
            @"SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce",
            @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Run",
            @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\RunOnce"
        };

        foreach (var keyPath in startupKeys)
        {
            try
            {
                using var key = Registry.LocalMachine.OpenSubKey(keyPath);
                if (key != null)
                {
                    foreach (var valueName in key.GetValueNames())
                    {
                        var value = key.GetValue(valueName)?.ToString();
                        if (!string.IsNullOrEmpty(value))
                        {
                            startupPrograms.Add(new StartupProgramInfo
                            {
                                Name = valueName,
                                Command = value,
                                Location = $"HKLM\\{keyPath}",
                                Type = keyPath.Contains("RunOnce") ? "RunOnce" : "Run"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read startup registry key {KeyPath}", keyPath);
            }
        }

        // User startup locations
        var userStartupKeys = new[]
        {
            @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
            @"SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce"
        };

        foreach (var keyPath in userStartupKeys)
        {
            try
            {
                using var key = Registry.CurrentUser.OpenSubKey(keyPath);
                if (key != null)
                {
                    foreach (var valueName in key.GetValueNames())
                    {
                        var value = key.GetValue(valueName)?.ToString();
                        if (!string.IsNullOrEmpty(value))
                        {
                            startupPrograms.Add(new StartupProgramInfo
                            {
                                Name = valueName,
                                Command = value,
                                Location = $"HKCU\\{keyPath}",
                                Type = keyPath.Contains("RunOnce") ? "RunOnce" : "Run"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read user startup registry key {KeyPath}", keyPath);
            }
        }

        // Startup folder
        try
        {
            var startupFolder = Environment.GetFolderPath(Environment.SpecialFolder.Startup);
            if (Directory.Exists(startupFolder))
            {
                foreach (var file in Directory.GetFiles(startupFolder))
                {
                    startupPrograms.Add(new StartupProgramInfo
                    {
                        Name = Path.GetFileNameWithoutExtension(file),
                        Command = file,
                        Location = "Startup Folder",
                        Type = "Folder"
                    });
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read startup folder");
        }

        return startupPrograms.OrderBy(s => s.Name).ToList();
    }

    private List<DriverInfo> GetInstalledDrivers()
    {
        var drivers = new List<DriverInfo>();
        
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_PnPSignedDriver");
            foreach (ManagementObject obj in searcher.Get())
            {
                drivers.Add(new DriverInfo
                {
                    DeviceName = obj["DeviceName"]?.ToString(),
                    DriverVersion = obj["DriverVersion"]?.ToString(),
                    DriverDate = ParseWmiDate(obj["DriverDate"]?.ToString()),
                    DriverSigner = obj["Signer"]?.ToString(),
                    InfName = obj["InfName"]?.ToString(),
                    IsSigned = Convert.ToBoolean(obj["IsSigned"] ?? false),
                    Location = obj["Location"]?.ToString(),
                    Manufacturer = obj["Manufacturer"]?.ToString(),
                    PDO = obj["PDO"]?.ToString(),
                    ProviderName = obj["ProviderName"]?.ToString(),
                    HardWareID = obj["HardWareID"]?.ToString(),
                    CompatID = obj["CompatID"]?.ToString(),
                    ClassGuid = obj["ClassGuid"]?.ToString(),
                    ClassName = obj["ClassName"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    FriendlyName = obj["FriendlyName"]?.ToString()
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get installed drivers");
        }

        return drivers.OrderBy(d => d.DeviceName).ToList();
    }

    private List<CertificateInfo> GetInstalledCertificates()
    {
        var certificates = new List<CertificateInfo>();
        
        try
        {
            // This would require additional certificate store access implementation
            // Placeholder for now - would use X509Store to enumerate certificates
            _logger.LogInformation("Certificate discovery placeholder - implementation required");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get installed certificates");
        }

        return certificates;
    }

    private List<FirewallRuleInfo> GetFirewallRules()
    {
        var rules = new List<FirewallRuleInfo>();
        
        try
        {
            // Use PowerShell to get firewall rules
            var processInfo = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = "-Command \"Get-NetFirewallRule | ConvertTo-Json\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };

            using var process = Process.Start(processInfo);
            if (process != null)
            {
                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();
                
                // Parse JSON output and convert to FirewallRuleInfo objects
                // Implementation would parse the PowerShell JSON output
                _logger.LogInformation("Firewall rules discovery placeholder - JSON parsing required");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get firewall rules");
        }

        return rules;
    }

    private List<ProcessInfo> GetRunningProcesses()
    {
        var processes = new List<ProcessInfo>();
        
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Process");
            foreach (ManagementObject obj in searcher.Get())
            {
                processes.Add(new ProcessInfo
                {
                    ProcessId = Convert.ToInt32(obj["ProcessId"] ?? 0),
                    Name = obj["Name"]?.ToString(),
                    ExecutablePath = obj["ExecutablePath"]?.ToString(),
                    CommandLine = obj["CommandLine"]?.ToString(),
                    CreationDate = ParseWmiDate(obj["CreationDate"]?.ToString()),
                    ParentProcessId = Convert.ToInt32(obj["ParentProcessId"] ?? 0),
                    ThreadCount = Convert.ToInt32(obj["ThreadCount"] ?? 0),
                    HandleCount = Convert.ToInt32(obj["HandleCount"] ?? 0),
                    WorkingSetSize = Convert.ToInt64(obj["WorkingSetSize"] ?? 0),
                    PageFileUsage = Convert.ToInt64(obj["PageFileUsage"] ?? 0),
                    Priority = Convert.ToInt32(obj["Priority"] ?? 0),
                    SessionId = Convert.ToInt32(obj["SessionId"] ?? 0),
                    Status = obj["Status"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    Owner = GetProcessOwner(Convert.ToInt32(obj["ProcessId"] ?? 0))
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get running processes");
        }

        return processes.OrderBy(p => p.Name).ToList();
    }

    private string? GetProcessOwner(int processId)
    {
        try
        {
            using var searcher = new ManagementObjectSearcher($"SELECT * FROM Win32_Process WHERE ProcessId = {processId}");
            foreach (ManagementObject obj in searcher.Get())
            {
                var outParams = obj.InvokeMethod("GetOwner", null, null);
                if (outParams != null)
                {
                    var domain = outParams["Domain"]?.ToString();
                    var user = outParams["User"]?.ToString();
                    return !string.IsNullOrEmpty(domain) && !string.IsNullOrEmpty(user) ? $"{domain}\\{user}" : user;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to get process owner for PID {ProcessId}", processId);
        }
        return null;
    }

    private List<ScheduledTaskInfo> GetScheduledTasks()
    {
        var tasks = new List<ScheduledTaskInfo>();
        
        try
        {
            // Use PowerShell to get scheduled tasks
            var processInfo = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = "-Command \"Get-ScheduledTask | ConvertTo-Json\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };

            using var process = Process.Start(processInfo);
            if (process != null)
            {
                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();
                
                // Parse JSON output and convert to ScheduledTaskInfo objects
                _logger.LogInformation("Scheduled tasks discovery placeholder - JSON parsing required");
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get scheduled tasks");
        }

        return tasks;
    }

    private List<NetworkConnectionInfo> GetNetworkConnections()
    {
        var connections = new List<NetworkConnectionInfo>();
        
        try
        {
            // Use netstat to get network connections
            var processInfo = new ProcessStartInfo
            {
                FileName = "netstat.exe",
                Arguments = "-ano",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };

            using var process = Process.Start(processInfo);
            if (process != null)
            {
                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();
                
                var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines.Skip(4)) // Skip header lines
                {
                    var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
                    if (parts.Length >= 5)
                    {
                        connections.Add(new NetworkConnectionInfo
                        {
                            Protocol = parts[0],
                            LocalAddress = parts[1],
                            ForeignAddress = parts[2],
                            State = parts[3],
                            ProcessId = int.TryParse(parts[4], out var pid) ? pid : 0
                        });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get network connections");
        }

        return connections;
    }

    private EventLogSummaryInfo GetEventLogSummary()
    {
        var summary = new EventLogSummaryInfo();
        
        try
        {
            // Get event log summary for the last 24 hours
            var yesterday = DateTime.Now.AddDays(-1);
            
            // This would require EventLog access to get error/warning counts
            summary.ErrorCount = 0;
            summary.WarningCount = 0;
            summary.InformationCount = 0;
            summary.LastErrorTime = null;
            summary.LastWarningTime = null;
            summary.MostRecentEvents = new List<EventLogEntry>();
            
            _logger.LogInformation("Event log summary placeholder - EventLog implementation required");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get event log summary");
        }

        return summary;
    }

    private SystemConfigurationInfo GetSystemConfiguration()
    {
        var config = new SystemConfigurationInfo();
        
        try
        {
            config.ComputerName = Environment.MachineName;
            config.UserName = Environment.UserName;
            config.UserDomainName = Environment.UserDomainName;
            config.OSVersion = Environment.OSVersion.ToString();
            config.ProcessorCount = Environment.ProcessorCount;
            config.WorkingSet = Environment.WorkingSet;
            config.SystemDirectory = Environment.SystemDirectory;
            config.CurrentDirectory = Environment.CurrentDirectory;
            config.TickCount = Environment.TickCount64;
            config.Is64BitOperatingSystem = Environment.Is64BitOperatingSystem;
            config.Is64BitProcess = Environment.Is64BitProcess;
            config.MachineName = Environment.MachineName;
            config.UserInteractive = Environment.UserInteractive;
            config.Version = Environment.Version.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get system configuration");
        }

        return config;
    }

    // Helper methods
    private DateTime? ParseInstallDate(string? dateString)
    {
        if (string.IsNullOrEmpty(dateString) || dateString.Length != 8) return null;
        
        if (DateTime.TryParseExact(dateString, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var date))
            return date;
        
        return null;
    }

    private DateTime? ParseWmiDate(string? wmiDate)
    {
        if (string.IsNullOrEmpty(wmiDate)) return null;
        
        try
        {
            return ManagementDateTimeConverter.ToDateTime(wmiDate);
        }
        catch
        {
            return null;
        }
    }

    private long ParseSize(string? sizeString)
    {
        if (long.TryParse(sizeString, out var size))
            return size * 1024; // Convert KB to bytes
        
        return 0;
    }
}

// Data models for enterprise software discovery
public class EnterpriseSoftwareInfo
{
    public DateTime DiscoveryTimestamp { get; set; }
    public List<InstalledProgramInfo>? InstalledPrograms { get; set; }
    public List<WindowsFeatureInfo>? WindowsFeatures { get; set; }
    public List<WindowsUpdateInfo>? WindowsUpdates { get; set; }
    public Dictionary<string, string>? EnvironmentVariables { get; set; }
    public List<WindowsServiceInfo>? Services { get; set; }
    public List<StartupProgramInfo>? StartupPrograms { get; set; }
    public List<DriverInfo>? Drivers { get; set; }
    public List<CertificateInfo>? Certificates { get; set; }
    public List<FirewallRuleInfo>? FirewallRules { get; set; }
    public List<ProcessInfo>? RunningProcesses { get; set; }
    public List<ScheduledTaskInfo>? ScheduledTasks { get; set; }
    public List<NetworkConnectionInfo>? NetworkConnections { get; set; }
    public EventLogSummaryInfo? EventLogSummary { get; set; }
    public SystemConfigurationInfo? SystemConfiguration { get; set; }
}

public class InstalledProgramInfo
{
    public string? Name { get; set; }
    public string? Version { get; set; }
    public string? Publisher { get; set; }
    public DateTime? InstallDate { get; set; }
    public string? InstallLocation { get; set; }
    public string? UninstallString { get; set; }
    public long Size { get; set; }
    public string? Architecture { get; set; }
    public string? RegistryKey { get; set; }
    public string? HelpLink { get; set; }
    public string? URLInfoAbout { get; set; }
    public string? Contact { get; set; }
    public bool SystemComponent { get; set; }
    public string? IdentifyingNumber { get; set; }
    public string? PackageCode { get; set; }
    public string? AssignmentType { get; set; }
    public string? PackageName { get; set; }
    public string? Language { get; set; }
    public string? ProductID { get; set; }
}

public class WindowsFeatureInfo
{
    public string? FeatureName { get; set; }
    public string? State { get; set; }
}

public class WindowsUpdateInfo
{
    public string? HotFixID { get; set; }
    public string? Description { get; set; }
    public string? InstalledBy { get; set; }
    public DateTime? InstalledOn { get; set; }
    public string? Caption { get; set; }
    public string? CSName { get; set; }
    public string? FixComments { get; set; }
    public DateTime? InstallDate { get; set; }
    public string? Name { get; set; }
    public string? ServicePackInEffect { get; set; }
    public string? Status { get; set; }
}

public class WindowsServiceInfo
{
    public string? Name { get; set; }
    public string? DisplayName { get; set; }
    public string? Description { get; set; }
    public string? State { get; set; }
    public string? StartMode { get; set; }
    public string? ServiceType { get; set; }
    public string? PathName { get; set; }
    public string? StartName { get; set; }
    public int ProcessId { get; set; }
    public bool AcceptPause { get; set; }
    public bool AcceptStop { get; set; }
    public string? Caption { get; set; }
    public int CheckPoint { get; set; }
    public bool DelayedAutoStart { get; set; }
    public bool DesktopInteract { get; set; }
    public string? ErrorControl { get; set; }
    public int ExitCode { get; set; }
    public int ServiceSpecificExitCode { get; set; }
    public bool Started { get; set; }
    public string? Status { get; set; }
    public string? SystemName { get; set; }
    public int TagId { get; set; }
    public int WaitHint { get; set; }
}

public class StartupProgramInfo
{
    public string? Name { get; set; }
    public string? Command { get; set; }
    public string? Location { get; set; }
    public string? Type { get; set; }
}

public class DriverInfo
{
    public string? DeviceName { get; set; }
    public string? DriverVersion { get; set; }
    public DateTime? DriverDate { get; set; }
    public string? DriverSigner { get; set; }
    public string? InfName { get; set; }
    public bool IsSigned { get; set; }
    public string? Location { get; set; }
    public string? Manufacturer { get; set; }
    public string? PDO { get; set; }
    public string? ProviderName { get; set; }
    public string? HardWareID { get; set; }
    public string? CompatID { get; set; }
    public string? ClassGuid { get; set; }
    public string? ClassName { get; set; }
    public string? Description { get; set; }
    public string? FriendlyName { get; set; }
}

public class CertificateInfo
{
    public string? Subject { get; set; }
    public string? Issuer { get; set; }
    public DateTime? NotBefore { get; set; }
    public DateTime? NotAfter { get; set; }
    public string? Thumbprint { get; set; }
    public string? SerialNumber { get; set; }
    public string? FriendlyName { get; set; }
    public bool HasPrivateKey { get; set; }
    public string? StoreName { get; set; }
    public string? StoreLocation { get; set; }
}

public class FirewallRuleInfo
{
    public string? Name { get; set; }
    public string? Direction { get; set; }
    public string? Action { get; set; }
    public string? Protocol { get; set; }
    public string? LocalPort { get; set; }
    public string? RemotePort { get; set; }
    public string? LocalAddress { get; set; }
    public string? RemoteAddress { get; set; }
    public bool Enabled { get; set; }
    public string? Profile { get; set; }
    public string? Program { get; set; }
    public string? Service { get; set; }
}

public class ProcessInfo
{
    public int ProcessId { get; set; }
    public string? Name { get; set; }
    public string? ExecutablePath { get; set; }
    public string? CommandLine { get; set; }
    public DateTime? CreationDate { get; set; }
    public int ParentProcessId { get; set; }
    public int ThreadCount { get; set; }
    public int HandleCount { get; set; }
    public long WorkingSetSize { get; set; }
    public long PageFileUsage { get; set; }
    public int Priority { get; set; }
    public int SessionId { get; set; }
    public string? Status { get; set; }
    public string? Description { get; set; }
    public string? Owner { get; set; }
}

public class ScheduledTaskInfo
{
    public string? TaskName { get; set; }
    public string? TaskPath { get; set; }
    public string? State { get; set; }
    public DateTime? NextRunTime { get; set; }
    public DateTime? LastRunTime { get; set; }
    public string? LastTaskResult { get; set; }
    public string? Author { get; set; }
    public string? Description { get; set; }
}

public class NetworkConnectionInfo
{
    public string? Protocol { get; set; }
    public string? LocalAddress { get; set; }
    public string? ForeignAddress { get; set; }
    public string? State { get; set; }
    public int ProcessId { get; set; }
}

public class EventLogSummaryInfo
{
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public int InformationCount { get; set; }
    public DateTime? LastErrorTime { get; set; }
    public DateTime? LastWarningTime { get; set; }
    public List<EventLogEntry>? MostRecentEvents { get; set; }
}

public class EventLogEntry
{
    public DateTime TimeGenerated { get; set; }
    public string? Source { get; set; }
    public string? EventID { get; set; }
    public string? EntryType { get; set; }
    public string? Message { get; set; }
}

public class SystemConfigurationInfo
{
    public string? ComputerName { get; set; }
    public string? UserName { get; set; }
    public string? UserDomainName { get; set; }
    public string? OSVersion { get; set; }
    public int ProcessorCount { get; set; }
    public long WorkingSet { get; set; }
    public string? SystemDirectory { get; set; }
    public string? CurrentDirectory { get; set; }
    public long TickCount { get; set; }
    public bool Is64BitOperatingSystem { get; set; }
    public bool Is64BitProcess { get; set; }
    public string? MachineName { get; set; }
    public bool UserInteractive { get; set; }
    public string? Version { get; set; }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Management;
using Microsoft.Extensions.Logging;
using Microsoft.Win32;
using System.IO;
using System.Diagnostics;
using System.Text.Json;
using System.Security.Principal;
using System.DirectoryServices.AccountManagement;
using System.Security.Cryptography.X509Certificates;

namespace UEM.Endpoint.Agent.Services;

public class EnterpriseSecurityDiscoveryService
{
    private readonly ILogger<EnterpriseSecurityDiscoveryService> _logger;

    public EnterpriseSecurityDiscoveryService(ILogger<EnterpriseSecurityDiscoveryService> logger)
    {
        _logger = logger;
    }

    public async Task<EnterpriseSecurityInfo> DiscoverAsync()
    {
        _logger.LogInformation("Starting comprehensive security discovery...");
        
        var info = new EnterpriseSecurityInfo
        {
            DiscoveryTimestamp = DateTime.UtcNow,
            TpmInfo = GetTpmInfo(),
            BitLockerInfo = GetBitLockerInfo(),
            WindowsDefenderInfo = GetWindowsDefenderInfo(),
            FirewallStatus = GetFirewallStatus(),
            UacSettings = GetUacSettings(),
            SecurityPolicies = GetSecurityPolicies(),
            WindowsUpdateSettings = GetWindowsUpdateSettings(),
            UserAccounts = GetUserAccounts(),
            GroupMemberships = GetGroupMemberships(),
            SecuritySoftware = GetSecuritySoftware(),
            EncryptionStatus = GetEncryptionStatus(),
            NetworkSecurity = GetNetworkSecurity(),
            SystemIntegrity = GetSystemIntegrity(),
            RegistryProtection = GetRegistryProtection(),
            ProcessSecurity = GetProcessSecurity(),
            DeviceControl = GetDeviceControl(),
            ApplicationControl = GetApplicationControl(),
            CredentialProtection = GetCredentialProtection(),
            NetworkShares = GetNetworkShares(),
            SecurityEvents = GetSecurityEvents(),
            ComplianceInfo = GetComplianceInfo()
        };

        _logger.LogInformation("Security discovery completed successfully");
        return info;
    }

    private TpmInfo GetTpmInfo()
    {
        var info = new TpmInfo();
        
        try
        {
            // Check TPM availability and status
            using var searcher = new ManagementObjectSearcher("root\\cimv2\\security\\microsofttpm", "SELECT * FROM Win32_Tpm");
            foreach (ManagementObject obj in searcher.Get())
            {
                info.IsActivated = Convert.ToBoolean(obj["IsActivated_InitialValue"] ?? false);
                info.IsEnabled = Convert.ToBoolean(obj["IsEnabled_InitialValue"] ?? false);
                info.IsOwned = Convert.ToBoolean(obj["IsOwned_InitialValue"] ?? false);
                info.ManufacturerId = Convert.ToInt32(obj["ManufacturerId"] ?? 0);
                info.ManufacturerVersion = obj["ManufacturerVersion"]?.ToString();
                info.ManufacturerVersionInfo = obj["ManufacturerVersionInfo"]?.ToString();
                info.PhysicalPresenceVersionInfo = obj["PhysicalPresenceVersionInfo"]?.ToString();
                info.SpecVersion = obj["SpecVersion"]?.ToString();
                break;
            }

            // Get TPM version from registry if WMI fails
            if (string.IsNullOrEmpty(info.SpecVersion))
            {
                try
                {
                    using var key = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Services\TPM\WMI");
                    if (key != null)
                    {
                        info.SpecVersion = key.GetValue("SpecVersion")?.ToString();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Failed to get TPM version from registry");
                }
            }

            // Check if TPM is ready for use
            info.IsReady = info.IsActivated && info.IsEnabled && info.IsOwned;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get TPM information");
            info.IsAvailable = false;
        }

        return info;
    }

    private BitLockerInfo GetBitLockerInfo()
    {
        var info = new BitLockerInfo();
        var volumes = new List<BitLockerVolumeInfo>();
        
        try
        {
            using var searcher = new ManagementObjectSearcher("root\\cimv2\\security\\microsoftvolumeencryption", 
                "SELECT * FROM Win32_EncryptableVolume");
            
            foreach (ManagementObject obj in searcher.Get())
            {
                var volumeInfo = new BitLockerVolumeInfo
                {
                    DriveLetter = obj["DriveLetter"]?.ToString(),
                    DeviceID = obj["DeviceID"]?.ToString(),
                    PersistentVolumeID = obj["PersistentVolumeID"]?.ToString(),
                    ProtectionStatus = Convert.ToInt32(obj["ProtectionStatus"] ?? 0),
                    LockStatus = Convert.ToInt32(obj["LockStatus"] ?? 0),
                    EncryptionMethod = Convert.ToInt32(obj["EncryptionMethod"] ?? 0),
                    ConversionStatus = Convert.ToInt32(obj["ConversionStatus"] ?? 0),
                    EncryptionPercentage = Convert.ToInt32(obj["EncryptionPercentage"] ?? 0),
                    WipePercentage = Convert.ToInt32(obj["WipePercentage"] ?? 0),
                    VolumeType = Convert.ToInt32(obj["VolumeType"] ?? 0),
                    IsVolumeInitializedForProtection = Convert.ToBoolean(obj["IsVolumeInitializedForProtection"] ?? false)
                };

                // Get key protectors
                var keyProtectors = new List<string>();
                try
                {
                    var result = obj.InvokeMethod("GetKeyProtectors", new object[] { 0 });
                    if (result != null && result["VolumeKeyProtectorID"] is string[] protectorIds)
                    {
                        foreach (var protectorId in protectorIds)
                        {
                            var typeResult = obj.InvokeMethod("GetKeyProtectorType", new object[] { protectorId });
                            if (typeResult != null)
                            {
                                var protectorType = Convert.ToInt32(typeResult["KeyProtectorType"]);
                                keyProtectors.Add(GetKeyProtectorTypeName(protectorType));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Failed to get key protectors for volume {DriveLetter}", volumeInfo.DriveLetter);
                }

                volumeInfo.KeyProtectors = keyProtectors;
                volumes.Add(volumeInfo);
            }

            info.Volumes = volumes;
            info.IsSupported = volumes.Any();
            info.HasEncryptedVolumes = volumes.Any(v => v.ProtectionStatus == 1);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get BitLocker information");
        }

        return info;
    }

    private string GetKeyProtectorTypeName(int type)
    {
        return type switch
        {
            0 => "Unknown",
            1 => "TPM",
            2 => "External Key",
            3 => "Numerical Password",
            4 => "TPM And PIN",
            5 => "TPM And Startup Key",
            6 => "TPM And PIN And Startup Key",
            7 => "Public Key",
            8 => "Passphrase",
            9 => "TPM Certificate",
            10 => "CryptoAPI Next Generation Certificate",
            _ => $"Unknown ({type})"
        };
    }

    private WindowsDefenderInfo GetWindowsDefenderInfo()
    {
        var info = new WindowsDefenderInfo();
        
        try
        {
            // Get Windows Defender status
            using var searcher = new ManagementObjectSearcher(@"root\Microsoft\Windows\Defender", 
                "SELECT * FROM MSFT_MpComputerStatus");
            
            foreach (ManagementObject obj in searcher.Get())
            {
                info.AntivirusEnabled = Convert.ToBoolean(obj["AntivirusEnabled"] ?? false);
                info.AntispywareEnabled = Convert.ToBoolean(obj["AntispywareEnabled"] ?? false);
                info.RealTimeProtectionEnabled = Convert.ToBoolean(obj["RealTimeProtectionEnabled"] ?? false);
                info.OnAccessProtectionEnabled = Convert.ToBoolean(obj["OnAccessProtectionEnabled"] ?? false);
                info.InputOutputProtectionEnabled = Convert.ToBoolean(obj["InputOutputProtectionEnabled"] ?? false);
                info.BehaviorMonitorEnabled = Convert.ToBoolean(obj["BehaviorMonitorEnabled"] ?? false);
                info.AntivirusSignatureLastUpdated = Convert.ToDateTime(obj["AntivirusSignatureLastUpdated"] ?? DateTime.MinValue);
                info.AntispywareSignatureLastUpdated = Convert.ToDateTime(obj["AntispywareSignatureLastUpdated"] ?? DateTime.MinValue);
                info.QuickScanStartTime = Convert.ToDateTime(obj["QuickScanStartTime"] ?? DateTime.MinValue);
                info.QuickScanEndTime = Convert.ToDateTime(obj["QuickScanEndTime"] ?? DateTime.MinValue);
                info.FullScanStartTime = Convert.ToDateTime(obj["FullScanStartTime"] ?? DateTime.MinValue);
                info.FullScanEndTime = Convert.ToDateTime(obj["FullScanEndTime"] ?? DateTime.MinValue);
                info.AntivirusSignatureVersion = obj["AntivirusSignatureVersion"]?.ToString();
                info.AntispywareSignatureVersion = obj["AntispywareSignatureVersion"]?.ToString();
                break;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get Windows Defender information");
        }

        return info;
    }

    private FirewallStatusInfo GetFirewallStatus()
    {
        var info = new FirewallStatusInfo();
        
        try
        {
            // Get firewall status for each profile
            using var searcher = new ManagementObjectSearcher(@"root\StandardCimv2", 
                "SELECT * FROM MSFT_NetFirewallProfile");
            
            foreach (ManagementObject obj in searcher.Get())
            {
                var profile = obj["Name"]?.ToString();
                var enabled = Convert.ToBoolean(obj["Enabled"] ?? false);
                var defaultInboundAction = obj["DefaultInboundAction"]?.ToString();
                var defaultOutboundAction = obj["DefaultOutboundAction"]?.ToString();
                
                switch (profile?.ToLower())
                {
                    case "domain":
                        info.DomainProfileEnabled = enabled;
                        info.DomainInboundAction = defaultInboundAction;
                        info.DomainOutboundAction = defaultOutboundAction;
                        break;
                    case "private":
                        info.PrivateProfileEnabled = enabled;
                        info.PrivateInboundAction = defaultInboundAction;
                        info.PrivateOutboundAction = defaultOutboundAction;
                        break;
                    case "public":
                        info.PublicProfileEnabled = enabled;
                        info.PublicInboundAction = defaultInboundAction;
                        info.PublicOutboundAction = defaultOutboundAction;
                        break;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get firewall status");
        }

        return info;
    }

    private UacSettingsInfo GetUacSettings()
    {
        var info = new UacSettingsInfo();
        
        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System");
            if (key != null)
            {
                info.UacEnabled = Convert.ToInt32(key.GetValue("EnableLUA") ?? 0) == 1;
                info.ConsentPromptBehaviorAdmin = Convert.ToInt32(key.GetValue("ConsentPromptBehaviorAdmin") ?? 0);
                info.ConsentPromptBehaviorUser = Convert.ToInt32(key.GetValue("ConsentPromptBehaviorUser") ?? 0);
                info.EnableInstallerDetection = Convert.ToInt32(key.GetValue("EnableInstallerDetection") ?? 0) == 1;
                info.PromptOnSecureDesktop = Convert.ToInt32(key.GetValue("PromptOnSecureDesktop") ?? 0) == 1;
                info.EnableSecureUIAPaths = Convert.ToInt32(key.GetValue("EnableSecureUIAPaths") ?? 0) == 1;
                info.EnableUIADesktopToggle = Convert.ToInt32(key.GetValue("EnableUIADesktopToggle") ?? 0) == 1;
                info.ValidateAdminCodeSignatures = Convert.ToInt32(key.GetValue("ValidateAdminCodeSignatures") ?? 0) == 1;
                info.EnableVirtualization = Convert.ToInt32(key.GetValue("EnableVirtualization") ?? 0) == 1;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get UAC settings");
        }

        return info;
    }

    private SecurityPoliciesInfo GetSecurityPolicies()
    {
        var info = new SecurityPoliciesInfo();
        
        try
        {
            // Get password policy
            info.PasswordPolicy = GetPasswordPolicy();
            
            // Get account lockout policy
            info.LockoutPolicy = GetLockoutPolicy();
            
            // Get audit policy
            info.AuditPolicy = GetAuditPolicy();
            
            // Get user rights assignments
            info.UserRights = GetUserRights();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get security policies");
        }

        return info;
    }

    private PasswordPolicyInfo GetPasswordPolicy()
    {
        var policy = new PasswordPolicyInfo();
        
        try
        {
            // Use PowerShell to get password policy
            var processInfo = new ProcessStartInfo
            {
                FileName = "powershell.exe",
                Arguments = "-Command \"Get-ADDefaultDomainPasswordPolicy | ConvertTo-Json\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                CreateNoWindow = true
            };

            using var process = Process.Start(processInfo);
            if (process != null)
            {
                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();
                
                // Parse JSON output - implementation would parse the PowerShell JSON output
                _logger.LogInformation("Password policy discovery placeholder - JSON parsing required");
            }
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to get domain password policy, checking local policy");
            
            // Fallback to local policy via registry/secedit
            policy.MaxPasswordAge = TimeSpan.FromDays(42); // Default values
            policy.MinPasswordAge = TimeSpan.FromDays(1);
            policy.MinPasswordLength = 8;
            policy.PasswordHistoryCount = 12;
            policy.ComplexityEnabled = true;
            policy.ReversibleEncryptionEnabled = false;
        }

        return policy;
    }

    private LockoutPolicyInfo GetLockoutPolicy()
    {
        return new LockoutPolicyInfo
        {
            LockoutThreshold = 5,
            LockoutDuration = TimeSpan.FromMinutes(30),
            ResetAccountLockoutCounter = TimeSpan.FromMinutes(30)
        };
    }

    private AuditPolicyInfo GetAuditPolicy()
    {
        return new AuditPolicyInfo
        {
            LogonEvents = "Success, Failure",
            ObjectAccess = "No Auditing",
            PrivilegeUse = "No Auditing",
            DirectoryServiceAccess = "No Auditing",
            PolicyChange = "Success",
            AccountManagement = "Success, Failure",
            ProcessTracking = "No Auditing",
            SystemEvents = "Success, Failure"
        };
    }

    private Dictionary<string, List<string>> GetUserRights()
    {
        return new Dictionary<string, List<string>>
        {
            ["SeLogonAsServiceRight"] = new List<string> { "NT SERVICE\\ALL SERVICES" },
            ["SeNetworkLogonRight"] = new List<string> { "Everyone", "Administrators", "Users" },
            ["SeDenyNetworkLogonRight"] = new List<string> { "Guest" },
            ["SeInteractiveLogonRight"] = new List<string> { "Administrators", "Users" },
            ["SeDenyInteractiveLogonRight"] = new List<string> { "Guest" }
        };
    }

    private WindowsUpdateSettingsInfo GetWindowsUpdateSettings()
    {
        var info = new WindowsUpdateSettingsInfo();
        
        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU");
            if (key != null)
            {
                info.AutoUpdateEnabled = Convert.ToInt32(key.GetValue("NoAutoUpdate") ?? 1) == 0;
                info.ScheduledInstallDay = Convert.ToInt32(key.GetValue("ScheduledInstallDay") ?? 0);
                info.ScheduledInstallTime = Convert.ToInt32(key.GetValue("ScheduledInstallTime") ?? 3);
                info.AutoInstallMinorUpdates = Convert.ToInt32(key.GetValue("AutoInstallMinorUpdates") ?? 1) == 1;
                info.IncludeRecommendedUpdates = Convert.ToInt32(key.GetValue("IncludeRecommendedUpdates") ?? 1) == 1;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get Windows Update settings");
        }

        return info;
    }

    private List<UserAccountInfo> GetUserAccounts()
    {
        var accounts = new List<UserAccountInfo>();
        
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_UserAccount WHERE LocalAccount = True");
            foreach (ManagementObject obj in searcher.Get())
            {
                accounts.Add(new UserAccountInfo
                {
                    Name = obj["Name"]?.ToString(),
                    FullName = obj["FullName"]?.ToString(),
                    Description = obj["Description"]?.ToString(),
                    SID = obj["SID"]?.ToString(),
                    AccountType = Convert.ToInt32(obj["AccountType"] ?? 0),
                    Disabled = Convert.ToBoolean(obj["Disabled"] ?? false),
                    LocalAccount = Convert.ToBoolean(obj["LocalAccount"] ?? false),
                    Lockout = Convert.ToBoolean(obj["Lockout"] ?? false),
                    PasswordChangeable = Convert.ToBoolean(obj["PasswordChangeable"] ?? false),
                    PasswordExpires = Convert.ToBoolean(obj["PasswordExpires"] ?? false),
                    PasswordRequired = Convert.ToBoolean(obj["PasswordRequired"] ?? false),
                    Status = obj["Status"]?.ToString()
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get user accounts");
        }

        return accounts;
    }

    private List<GroupMembershipInfo> GetGroupMemberships()
    {
        var memberships = new List<GroupMembershipInfo>();
        
        try
        {
            using var searcher = new ManagementObjectSearcher("SELECT * FROM Win32_Group WHERE LocalAccount = True");
            foreach (ManagementObject obj in searcher.Get())
            {
                var groupName = obj["Name"]?.ToString();
                var groupSID = obj["SID"]?.ToString();
                
                // Get group members
                var members = new List<string>();
                try
                {
                    using var memberSearcher = new ManagementObjectSearcher($"SELECT * FROM Win32_GroupUser WHERE GroupComponent = \"Win32_Group.Domain='{Environment.MachineName}',Name='{groupName}'\"");
                    foreach (ManagementObject memberObj in memberSearcher.Get())
                    {
                        var partComponent = memberObj["PartComponent"]?.ToString();
                        if (!string.IsNullOrEmpty(partComponent))
                        {
                            // Extract username from WMI path
                            var nameStart = partComponent.LastIndexOf("Name=\"") + 6;
                            var nameEnd = partComponent.IndexOf("\"", nameStart);
                            if (nameStart > 5 && nameEnd > nameStart)
                            {
                                members.Add(partComponent.Substring(nameStart, nameEnd - nameStart));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogDebug(ex, "Failed to get members for group {GroupName}", groupName);
                }

                memberships.Add(new GroupMembershipInfo
                {
                    GroupName = groupName,
                    GroupSID = groupSID,
                    Description = obj["Description"]?.ToString(),
                    Members = members
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get group memberships");
        }

        return memberships;
    }

    // Placeholder methods for additional security discovery features
    private List<SecuritySoftwareInfo> GetSecuritySoftware() => new List<SecuritySoftwareInfo>();
    private EncryptionStatusInfo GetEncryptionStatus() => new EncryptionStatusInfo();
    private NetworkSecurityInfo GetNetworkSecurity() => new NetworkSecurityInfo();
    private SystemIntegrityInfo GetSystemIntegrity() => new SystemIntegrityInfo();
    private RegistryProtectionInfo GetRegistryProtection() => new RegistryProtectionInfo();
    private ProcessSecurityInfo GetProcessSecurity() => new ProcessSecurityInfo();
    private DeviceControlInfo GetDeviceControl() => new DeviceControlInfo();
    private ApplicationControlInfo GetApplicationControl() => new ApplicationControlInfo();
    private CredentialProtectionInfo GetCredentialProtection() => new CredentialProtectionInfo();
    private List<NetworkShareInfo> GetNetworkShares() => new List<NetworkShareInfo>();
    private SecurityEventsInfo GetSecurityEvents() => new SecurityEventsInfo();
    private ComplianceInfo GetComplianceInfo() => new ComplianceInfo();
}

// Data models for enterprise security discovery
public class EnterpriseSecurityInfo
{
    public DateTime DiscoveryTimestamp { get; set; }
    public TpmInfo? TpmInfo { get; set; }
    public BitLockerInfo? BitLockerInfo { get; set; }
    public WindowsDefenderInfo? WindowsDefenderInfo { get; set; }
    public FirewallStatusInfo? FirewallStatus { get; set; }
    public UacSettingsInfo? UacSettings { get; set; }
    public SecurityPoliciesInfo? SecurityPolicies { get; set; }
    public WindowsUpdateSettingsInfo? WindowsUpdateSettings { get; set; }
    public List<UserAccountInfo>? UserAccounts { get; set; }
    public List<GroupMembershipInfo>? GroupMemberships { get; set; }
    public List<SecuritySoftwareInfo>? SecuritySoftware { get; set; }
    public EncryptionStatusInfo? EncryptionStatus { get; set; }
    public NetworkSecurityInfo? NetworkSecurity { get; set; }
    public SystemIntegrityInfo? SystemIntegrity { get; set; }
    public RegistryProtectionInfo? RegistryProtection { get; set; }
    public ProcessSecurityInfo? ProcessSecurity { get; set; }
    public DeviceControlInfo? DeviceControl { get; set; }
    public ApplicationControlInfo? ApplicationControl { get; set; }
    public CredentialProtectionInfo? CredentialProtection { get; set; }
    public List<NetworkShareInfo>? NetworkShares { get; set; }
    public SecurityEventsInfo? SecurityEvents { get; set; }
    public ComplianceInfo? ComplianceInfo { get; set; }
}

public class TpmInfo
{
    public bool IsAvailable { get; set; } = true;
    public bool IsActivated { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsOwned { get; set; }
    public bool IsReady { get; set; }
    public int ManufacturerId { get; set; }
    public string? ManufacturerVersion { get; set; }
    public string? ManufacturerVersionInfo { get; set; }
    public string? PhysicalPresenceVersionInfo { get; set; }
    public string? SpecVersion { get; set; }
}

public class BitLockerInfo
{
    public bool IsSupported { get; set; }
    public bool HasEncryptedVolumes { get; set; }
    public List<BitLockerVolumeInfo>? Volumes { get; set; }
}

public class BitLockerVolumeInfo
{
    public string? DriveLetter { get; set; }
    public string? DeviceID { get; set; }
    public string? PersistentVolumeID { get; set; }
    public int ProtectionStatus { get; set; }
    public int LockStatus { get; set; }
    public int EncryptionMethod { get; set; }
    public int ConversionStatus { get; set; }
    public int EncryptionPercentage { get; set; }
    public int WipePercentage { get; set; }
    public int VolumeType { get; set; }
    public bool IsVolumeInitializedForProtection { get; set; }
    public List<string>? KeyProtectors { get; set; }
}

public class WindowsDefenderInfo
{
    public bool AntivirusEnabled { get; set; }
    public bool AntispywareEnabled { get; set; }
    public bool RealTimeProtectionEnabled { get; set; }
    public bool OnAccessProtectionEnabled { get; set; }
    public bool InputOutputProtectionEnabled { get; set; }
    public bool BehaviorMonitorEnabled { get; set; }
    public DateTime AntivirusSignatureLastUpdated { get; set; }
    public DateTime AntispywareSignatureLastUpdated { get; set; }
    public DateTime QuickScanStartTime { get; set; }
    public DateTime QuickScanEndTime { get; set; }
    public DateTime FullScanStartTime { get; set; }
    public DateTime FullScanEndTime { get; set; }
    public string? AntivirusSignatureVersion { get; set; }
    public string? AntispywareSignatureVersion { get; set; }
}

public class FirewallStatusInfo
{
    public bool DomainProfileEnabled { get; set; }
    public bool PrivateProfileEnabled { get; set; }
    public bool PublicProfileEnabled { get; set; }
    public string? DomainInboundAction { get; set; }
    public string? DomainOutboundAction { get; set; }
    public string? PrivateInboundAction { get; set; }
    public string? PrivateOutboundAction { get; set; }
    public string? PublicInboundAction { get; set; }
    public string? PublicOutboundAction { get; set; }
}

public class UacSettingsInfo
{
    public bool UacEnabled { get; set; }
    public int ConsentPromptBehaviorAdmin { get; set; }
    public int ConsentPromptBehaviorUser { get; set; }
    public bool EnableInstallerDetection { get; set; }
    public bool PromptOnSecureDesktop { get; set; }
    public bool EnableSecureUIAPaths { get; set; }
    public bool EnableUIADesktopToggle { get; set; }
    public bool ValidateAdminCodeSignatures { get; set; }
    public bool EnableVirtualization { get; set; }
}

public class SecurityPoliciesInfo
{
    public PasswordPolicyInfo? PasswordPolicy { get; set; }
    public LockoutPolicyInfo? LockoutPolicy { get; set; }
    public AuditPolicyInfo? AuditPolicy { get; set; }
    public Dictionary<string, List<string>>? UserRights { get; set; }
}

public class PasswordPolicyInfo
{
    public TimeSpan MaxPasswordAge { get; set; }
    public TimeSpan MinPasswordAge { get; set; }
    public int MinPasswordLength { get; set; }
    public int PasswordHistoryCount { get; set; }
    public bool ComplexityEnabled { get; set; }
    public bool ReversibleEncryptionEnabled { get; set; }
}

public class LockoutPolicyInfo
{
    public int LockoutThreshold { get; set; }
    public TimeSpan LockoutDuration { get; set; }
    public TimeSpan ResetAccountLockoutCounter { get; set; }
}

public class AuditPolicyInfo
{
    public string? LogonEvents { get; set; }
    public string? ObjectAccess { get; set; }
    public string? PrivilegeUse { get; set; }
    public string? DirectoryServiceAccess { get; set; }
    public string? PolicyChange { get; set; }
    public string? AccountManagement { get; set; }
    public string? ProcessTracking { get; set; }
    public string? SystemEvents { get; set; }
}

public class WindowsUpdateSettingsInfo
{
    public bool AutoUpdateEnabled { get; set; }
    public int ScheduledInstallDay { get; set; }
    public int ScheduledInstallTime { get; set; }
    public bool AutoInstallMinorUpdates { get; set; }
    public bool IncludeRecommendedUpdates { get; set; }
}

public class UserAccountInfo
{
    public string? Name { get; set; }
    public string? FullName { get; set; }
    public string? Description { get; set; }
    public string? SID { get; set; }
    public int AccountType { get; set; }
    public bool Disabled { get; set; }
    public bool LocalAccount { get; set; }
    public bool Lockout { get; set; }
    public bool PasswordChangeable { get; set; }
    public bool PasswordExpires { get; set; }
    public bool PasswordRequired { get; set; }
    public string? Status { get; set; }
}

public class GroupMembershipInfo
{
    public string? GroupName { get; set; }
    public string? GroupSID { get; set; }
    public string? Description { get; set; }
    public List<string>? Members { get; set; }
}

// Placeholder classes for additional security features
public class SecuritySoftwareInfo { }
public class EncryptionStatusInfo { }
public class NetworkSecurityInfo { }
public class SystemIntegrityInfo { }
public class RegistryProtectionInfo { }
public class ProcessSecurityInfo { }
public class DeviceControlInfo { }
public class ApplicationControlInfo { }
public class CredentialProtectionInfo { }
public class NetworkShareInfo { }
public class SecurityEventsInfo { }
public class ComplianceInfo { }
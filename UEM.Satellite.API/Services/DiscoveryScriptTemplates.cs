namespace UEM.Satellite.API.Services;

public static class DiscoveryScriptTemplates
{
    #region Windows PowerShell Scripts

    public static DiscoveryScriptTemplate CreateWindowsHardwareDiscoveryScript() => new()
    {
        Name = "Windows Hardware Discovery - PowerShell",
        Description = "Comprehensive hardware discovery for Windows systems including CPU, memory, storage, motherboard, and peripheral devices",
        Category = "Hardware Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 45,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"
# Windows Hardware Discovery Script
# Outputs comprehensive hardware information in JSON format

$ErrorActionPreference = 'SilentlyContinue'

$hardwareInfo = @{}

# CPU Information
$cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
$hardwareInfo.CPU = @{
    Name = $cpu.Name
    Manufacturer = $cpu.Manufacturer
    Architecture = $cpu.Architecture
    Cores = $cpu.NumberOfCores
    LogicalProcessors = $cpu.NumberOfLogicalProcessors
    MaxClockSpeed = $cpu.MaxClockSpeed
    CurrentClockSpeed = $cpu.CurrentClockSpeed
    SocketDesignation = $cpu.SocketDesignation
    L2CacheSize = $cpu.L2CacheSize
    L3CacheSize = $cpu.L3CacheSize
    ProcessorId = $cpu.ProcessorId
    Description = $cpu.Description
}

# Memory Information
$memory = Get-WmiObject -Class Win32_PhysicalMemory
$totalMemory = ($memory | Measure-Object -Property Capacity -Sum).Sum
$hardwareInfo.Memory = @{
    TotalMemoryBytes = $totalMemory
    TotalMemoryGB = [Math]::Round($totalMemory / 1GB, 2)
    Modules = @()
}

foreach ($module in $memory) {
    $hardwareInfo.Memory.Modules += @{
        Capacity = $module.Capacity
        CapacityGB = [Math]::Round($module.Capacity / 1GB, 2)
        Speed = $module.Speed
        Manufacturer = $module.Manufacturer
        PartNumber = $module.PartNumber
        SerialNumber = $module.SerialNumber
        BankLabel = $module.BankLabel
        DeviceLocator = $module.DeviceLocator
        MemoryType = $module.MemoryType
        TypeDetail = $module.TypeDetail
    }
}

# Storage Information
$disks = Get-WmiObject -Class Win32_DiskDrive
$hardwareInfo.Storage = @{
    PhysicalDisks = @()
}

foreach ($disk in $disks) {
    $partitions = Get-WmiObject -Class Win32_DiskPartition | Where-Object { $_.DiskIndex -eq $disk.Index }
    $logicalDisks = @()
    
    foreach ($partition in $partitions) {
        $logical = Get-WmiObject -Class Win32_LogicalDiskToDiskPartition | Where-Object { $_.Antecedent -match $partition.DeviceID }
        if ($logical) {
            $logicalDisk = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DeviceID -eq $logical.Dependent.Split('=')[1].Trim('""') }
            if ($logicalDisk) {
                $logicalDisks += @{
                    DriveLetter = $logicalDisk.DeviceID
                    FileSystem = $logicalDisk.FileSystem
                    Size = $logicalDisk.Size
                    FreeSpace = $logicalDisk.FreeSpace
                    VolumeLabel = $logicalDisk.VolumeName
                }
            }
        }
    }
    
    $hardwareInfo.Storage.PhysicalDisks += @{
        Model = $disk.Model
        Manufacturer = $disk.Manufacturer
        SerialNumber = $disk.SerialNumber
        Size = $disk.Size
        SizeGB = [Math]::Round($disk.Size / 1GB, 2)
        MediaType = $disk.MediaType
        InterfaceType = $disk.InterfaceType
        Partitions = $partitions.Count
        LogicalDisks = $logicalDisks
        Index = $disk.Index
        Status = $disk.Status
    }
}

# Motherboard Information
$motherboard = Get-WmiObject -Class Win32_BaseBoard
$hardwareInfo.Motherboard = @{
    Manufacturer = $motherboard.Manufacturer
    Product = $motherboard.Product
    SerialNumber = $motherboard.SerialNumber
    Version = $motherboard.Version
}

# BIOS Information
$bios = Get-WmiObject -Class Win32_BIOS
$hardwareInfo.BIOS = @{
    Manufacturer = $bios.Manufacturer
    Version = $bios.Version
    ReleaseDate = $bios.ReleaseDate
    SerialNumber = $bios.SerialNumber
    SMBIOSVersion = $bios.SMBIOSMajorVersion.ToString() + '.' + $bios.SMBIOSMinorVersion.ToString()
}

# Graphics Cards
$graphics = Get-WmiObject -Class Win32_VideoController
$hardwareInfo.Graphics = @()
foreach ($gpu in $graphics) {
    $hardwareInfo.Graphics += @{
        Name = $gpu.Name
        AdapterRAM = $gpu.AdapterRAM
        DriverVersion = $gpu.DriverVersion
        DriverDate = $gpu.DriverDate
        VideoProcessor = $gpu.VideoProcessor
        CurrentHorizontalResolution = $gpu.CurrentHorizontalResolution
        CurrentVerticalResolution = $gpu.CurrentVerticalResolution
        MaxRefreshRate = $gpu.MaxRefreshRate
        MinRefreshRate = $gpu.MinRefreshRate
    }
}

# Network Adapters
$networkAdapters = Get-WmiObject -Class Win32_NetworkAdapter | Where-Object { $_.PhysicalAdapter -eq $true -and $_.MACAddress -ne $null }
$hardwareInfo.NetworkAdapters = @()
foreach ($adapter in $networkAdapters) {
    $config = Get-WmiObject -Class Win32_NetworkAdapterConfiguration | Where-Object { $_.Index -eq $adapter.Index }
    $hardwareInfo.NetworkAdapters += @{
        Name = $adapter.Name
        Manufacturer = $adapter.Manufacturer
        MACAddress = $adapter.MACAddress
        Speed = $adapter.Speed
        AdapterType = $adapter.AdapterType
        NetConnectionStatus = $adapter.NetConnectionStatus
        IPEnabled = $config.IPEnabled
        IPAddress = $config.IPAddress
        SubnetMask = $config.IPSubnet
        DefaultGateway = $config.DefaultIPGateway
    }
}

# USB Devices
$usbDevices = Get-WmiObject -Class Win32_USBDevice
$hardwareInfo.USBDevices = @()
foreach ($usb in $usbDevices) {
    $hardwareInfo.USBDevices += @{
        Name = $usb.Name
        Description = $usb.Description
        DeviceID = $usb.DeviceID
        Manufacturer = $usb.Manufacturer
        Service = $usb.Service
        Status = $usb.Status
    }
}

# Audio Devices
$audioDevices = Get-WmiObject -Class Win32_SoundDevice
$hardwareInfo.AudioDevices = @()
foreach ($audio in $audioDevices) {
    $hardwareInfo.AudioDevices += @{
        Name = $audio.Name
        Manufacturer = $audio.Manufacturer
        ProductName = $audio.ProductName
        Status = $audio.Status
    }
}

$hardwareInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$hardwareInfo.ScriptVersion = '1.0.0'

# Output as JSON
$hardwareInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "CPU", "Memory", "Storage", "Motherboard", "BIOS", "Graphics", "NetworkAdapters" } },
            { "validateRequired", new[] { "CPU.Name", "Memory.TotalMemoryGB", "Storage.PhysicalDisks" } }
        },
        Tags = new List<string> { "hardware", "discovery", "inventory", "cpu", "memory", "storage", "motherboard", "bios" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    public static DiscoveryScriptTemplate CreateWindowsSoftwareDiscoveryScript() => new()
    {
        Name = "Windows Software Discovery - PowerShell",
        Description = "Comprehensive software inventory for Windows systems including installed programs, Windows features, and system components",
        Category = "Software Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 60,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"
# Windows Software Discovery Script
# Outputs comprehensive software inventory in JSON format

$ErrorActionPreference = 'SilentlyContinue'

$softwareInfo = @{
    InstalledPrograms = @()
    WindowsFeatures = @()
    WindowsUpdates = @()
    SystemComponents = @()
    StartupPrograms = @()
}

# Installed Programs from Registry (64-bit)
$uninstallPath64 = 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*'
$programs64 = Get-ItemProperty $uninstallPath64 | Where-Object { $_.DisplayName -and $_.DisplayName -notmatch '^KB[0-9]+' }

# Installed Programs from Registry (32-bit on 64-bit systems)
$uninstallPath32 = 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
$programs32 = if (Test-Path $uninstallPath32) { Get-ItemProperty $uninstallPath32 | Where-Object { $_.DisplayName -and $_.DisplayName -notmatch '^KB[0-9]+' } } else { @() }

# Combine and process all programs
$allPrograms = $programs64 + $programs32
foreach ($program in $allPrograms) {
    $installDate = $null
    if ($program.InstallDate) {
        try {
            $installDate = [DateTime]::ParseExact($program.InstallDate, 'yyyyMMdd', $null).ToString('yyyy-MM-dd')
        } catch {
            $installDate = $program.InstallDate
        }
    }
    
    $size = $null
    if ($program.EstimatedSize) {
        $size = [int64]$program.EstimatedSize * 1024  # Convert from KB to bytes
    }
    
    $softwareInfo.InstalledPrograms += @{
        Name = $program.DisplayName
        Version = $program.DisplayVersion
        Publisher = $program.Publisher
        InstallDate = $installDate
        InstallLocation = $program.InstallLocation
        UninstallString = $program.UninstallString
        EstimatedSizeBytes = $size
        Architecture = if ($program.PSPath -match 'WOW6432Node') { 'x86' } else { 'x64' }
        ProductCode = $program.PSChildName
        HelpLink = $program.HelpLink
        URLInfoAbout = $program.URLInfoAbout
        Contact = $program.Contact
        Comments = $program.Comments
    }
}

# Windows Features
try {
    $features = Get-WindowsOptionalFeature -Online -ErrorAction SilentlyContinue
    foreach ($feature in $features) {
        $softwareInfo.WindowsFeatures += @{
            FeatureName = $feature.FeatureName
            DisplayName = $feature.DisplayName
            State = $feature.State.ToString()
            RestartRequired = $feature.RestartRequired
            LogLevel = $feature.LogLevel.ToString()
            Description = $feature.Description
        }
    }
} catch {
    # Fallback method for older systems
    $features = dism /online /get-features /format:table | Select-String '^\w'
    foreach ($line in $features) {
        if ($line -match '^([^\s]+)\s+([^\s]+)') {
            $softwareInfo.WindowsFeatures += @{
                FeatureName = $matches[1]
                State = $matches[2]
            }
        }
    }
}

# Windows Updates/Hotfixes
$hotfixes = Get-HotFix
foreach ($hotfix in $hotfixes) {
    $softwareInfo.WindowsUpdates += @{
        HotFixID = $hotfix.HotFixID
        Description = $hotfix.Description
        InstalledOn = if ($hotfix.InstalledOn) { $hotfix.InstalledOn.ToString('yyyy-MM-dd') } else { $null }
        InstalledBy = $hotfix.InstalledBy
        Caption = $hotfix.Caption
    }
}

# System Components
$components = Get-WmiObject -Class Win32_SystemDriver
foreach ($component in $components) {
    $softwareInfo.SystemComponents += @{
        Name = $component.Name
        DisplayName = $component.DisplayName
        Description = $component.Description
        PathName = $component.PathName
        ServiceType = $component.ServiceType
        StartMode = $component.StartMode
        State = $component.State
        Status = $component.Status
    }
}

# Startup Programs
$startupPrograms = @()

# Current User Startup
try {
    $currentUserStartup = Get-ItemProperty 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run' -ErrorAction SilentlyContinue
    if ($currentUserStartup) {
        $currentUserStartup.PSObject.Properties | Where-Object { $_.Name -ne 'PSPath' -and $_.Name -ne 'PSParentPath' -and $_.Name -ne 'PSChildName' -and $_.Name -ne 'PSDrive' -and $_.Name -ne 'PSProvider' } | ForEach-Object {
            $startupPrograms += @{
                Name = $_.Name
                Command = $_.Value
                Location = 'HKCU\Run'
                User = 'Current User'
            }
        }
    }
} catch { }

# All Users Startup
try {
    $allUsersStartup = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run' -ErrorAction SilentlyContinue
    if ($allUsersStartup) {
        $allUsersStartup.PSObject.Properties | Where-Object { $_.Name -ne 'PSPath' -and $_.Name -ne 'PSParentPath' -and $_.Name -ne 'PSChildName' -and $_.Name -ne 'PSDrive' -and $_.Name -ne 'PSProvider' } | ForEach-Object {
            $startupPrograms += @{
                Name = $_.Name
                Command = $_.Value
                Location = 'HKLM\Run'
                User = 'All Users'
            }
        }
    }
} catch { }

# Startup Folder Programs
try {
    $startupFolders = @(
        [Environment]::GetFolderPath('Startup'),
        [Environment]::GetFolderPath('CommonStartup')
    )
    
    foreach ($folder in $startupFolders) {
        if (Test-Path $folder) {
            $items = Get-ChildItem $folder -ErrorAction SilentlyContinue
            foreach ($item in $items) {
                $startupPrograms += @{
                    Name = $item.Name
                    Command = $item.FullName
                    Location = 'Startup Folder'
                    User = if ($folder -match 'Common') { 'All Users' } else { 'Current User' }
                }
            }
        }
    }
} catch { }

$softwareInfo.StartupPrograms = $startupPrograms

# Add metadata
$softwareInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$softwareInfo.ScriptVersion = '1.0.0'
$softwareInfo.TotalPrograms = $softwareInfo.InstalledPrograms.Count
$softwareInfo.TotalFeatures = $softwareInfo.WindowsFeatures.Count
$softwareInfo.TotalUpdates = $softwareInfo.WindowsUpdates.Count

# Output as JSON
$softwareInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "InstalledPrograms", "WindowsFeatures", "WindowsUpdates", "StartupPrograms" } },
            { "validateRequired", new[] { "TotalPrograms", "DiscoveryTimestamp" } }
        },
        Tags = new List<string> { "software", "discovery", "inventory", "programs", "features", "updates", "startup" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS" }
    };

    public static DiscoveryScriptTemplate CreateWindowsNetworkDiscoveryScript() => new()
    {
        Name = "Windows Network Discovery - PowerShell",
        Description = "Comprehensive network discovery for Windows systems including adapters, configuration, routing, and connectivity",
        Category = "Network Discovery", 
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = true,
        Template = @"
# Windows Network Discovery Script
# Outputs comprehensive network information in JSON format

$ErrorActionPreference = 'SilentlyContinue'

$networkInfo = @{
    NetworkAdapters = @()
    RoutingTable = @()
    DNSConfiguration = @()
    ActiveConnections = @()
    NetworkShares = @()
    WirelessProfiles = @()
    FirewallStatus = @()
}

# Network Adapters with Configuration
$adapters = Get-WmiObject -Class Win32_NetworkAdapter | Where-Object { $_.PhysicalAdapter -eq $true }
foreach ($adapter in $adapters) {
    $config = Get-WmiObject -Class Win32_NetworkAdapterConfiguration | Where-Object { $_.Index -eq $adapter.Index }
    
    $adapterInfo = @{
        Name = $adapter.Name
        Description = $adapter.Description
        Manufacturer = $adapter.Manufacturer
        MACAddress = $adapter.MACAddress
        Speed = $adapter.Speed
        SpeedMbps = if ($adapter.Speed) { [Math]::Round($adapter.Speed / 1MB, 2) } else { $null }
        AdapterType = $adapter.AdapterType
        AdapterTypeId = $adapter.AdapterTypeId
        NetConnectionStatus = $adapter.NetConnectionStatus
        NetConnectionID = $adapter.NetConnectionID
        PhysicalAdapter = $adapter.PhysicalAdapter
        DeviceID = $adapter.DeviceID
        Index = $adapter.Index
    }
    
    if ($config) {
        $adapterInfo.IPEnabled = $config.IPEnabled
        $adapterInfo.IPAddress = $config.IPAddress
        $adapterInfo.SubnetMask = $config.IPSubnet
        $adapterInfo.DefaultGateway = $config.DefaultIPGateway
        $adapterInfo.DNSServers = $config.DNSServerSearchOrder
        $adapterInfo.DHCPEnabled = $config.DHCPEnabled
        $adapterInfo.DHCPServer = $config.DHCPServer
        $adapterInfo.DHCPLeaseObtained = $config.DHCPLeaseObtained
        $adapterInfo.DHCPLeaseExpires = $config.DHCPLeaseExpires
        $adapterInfo.WINSPrimaryServer = $config.WINSPrimaryServer
        $adapterInfo.WINSSecondaryServer = $config.WINSSecondaryServer
        $adapterInfo.DNSDomain = $config.DNSDomain
        $adapterInfo.DNSDomainSuffixSearchOrder = $config.DNSDomainSuffixSearchOrder
        $adapterInfo.MTU = $config.MTU
    }
    
    $networkInfo.NetworkAdapters += $adapterInfo
}

# Routing Table
try {
    $routes = Get-WmiObject -Class Win32_IP4RouteTable
    foreach ($route in $routes) {
        $networkInfo.RoutingTable += @{
            Destination = $route.Destination
            Mask = $route.Mask
            NextHop = $route.NextHop
            InterfaceIndex = $route.InterfaceIndex
            Metric1 = $route.Metric1
            Type = $route.Type
            Protocol = $route.Protocol
            Age = $route.Age
        }
    }
} catch { }

# DNS Configuration
try {
    $dnsSettings = Get-WmiObject -Class Win32_NetworkAdapterConfiguration | Where-Object { $_.IPEnabled -eq $true }
    foreach ($dns in $dnsSettings) {
        if ($dns.DNSServerSearchOrder) {
            $networkInfo.DNSConfiguration += @{
                InterfaceIndex = $dns.Index
                InterfaceDescription = $dns.Description
                DNSServers = $dns.DNSServerSearchOrder
                DNSDomain = $dns.DNSDomain
                DNSDomainSuffixSearchOrder = $dns.DNSDomainSuffixSearchOrder
                DNSEnabledForWINSResolution = $dns.DNSEnabledForWINSResolution
            }
        }
    }
} catch { }

# Active Network Connections
try {
    $connections = netstat -ano | Select-String '\s+(TCP|UDP)'
    foreach ($line in $connections) {
        if ($line -match '\s+(TCP|UDP)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)?') {
            $networkInfo.ActiveConnections += @{
                Protocol = $matches[1]
                LocalAddress = $matches[2]
                ForeignAddress = $matches[3]
                State = $matches[4]
                PID = $matches[5]
            }
        }
    }
} catch { }

# Network Shares
try {
    $shares = Get-WmiObject -Class Win32_Share
    foreach ($share in $shares) {
        $networkInfo.NetworkShares += @{
            Name = $share.Name
            Path = $share.Path
            Description = $share.Description
            Type = $share.Type
            AllowMaximum = $share.AllowMaximum
            MaximumAllowed = $share.MaximumAllowed
            Status = $share.Status
        }
    }
} catch { }

# Wireless Profiles (if available)
try {
    $wifiProfiles = netsh wlan show profiles | Select-String 'All User Profile\s+:\s+(.+)' | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }
    foreach ($profile in $wifiProfiles) {
        $profileDetail = netsh wlan show profile name=""$profile"" key=clear
        $ssid = ($profileDetail | Select-String 'SSID name\s+:\s+""(.+)""').Matches.Groups[1].Value
        $auth = ($profileDetail | Select-String 'Authentication\s+:\s+(.+)').Matches.Groups[1].Value
        $cipher = ($profileDetail | Select-String 'Cipher\s+:\s+(.+)').Matches.Groups[1].Value
        
        $networkInfo.WirelessProfiles += @{
            ProfileName = $profile
            SSID = $ssid
            Authentication = $auth
            Cipher = $cipher
        }
    }
} catch { }

# Windows Firewall Status
try {
    $firewallProfiles = @('Domain', 'Private', 'Public')
    foreach ($profile in $firewallProfiles) {
        $status = netsh advfirewall show $profile.ToLower() | Select-String 'State\s+(.+)'
        if ($status) {
            $networkInfo.FirewallStatus += @{
                Profile = $profile
                Status = $status.Matches.Groups[1].Value.Trim()
            }
        }
    }
} catch { }

# Network Statistics
try {
    $networkStats = @{
        TotalAdapters = $networkInfo.NetworkAdapters.Count
        EnabledAdapters = ($networkInfo.NetworkAdapters | Where-Object { $_.IPEnabled -eq $true }).Count
        PhysicalAdapters = ($networkInfo.NetworkAdapters | Where-Object { $_.PhysicalAdapter -eq $true }).Count
        ActiveConnections = $networkInfo.ActiveConnections.Count
        SharedFolders = $networkInfo.NetworkShares.Count
        WirelessProfiles = $networkInfo.WirelessProfiles.Count
    }
    $networkInfo.Statistics = $networkStats
} catch { }

# Add metadata
$networkInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$networkInfo.ScriptVersion = '1.0.0'
$networkInfo.ComputerName = $env:COMPUTERNAME
$networkInfo.Domain = $env:USERDOMAIN

# Output as JSON
$networkInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "NetworkAdapters", "RoutingTable", "DNSConfiguration", "ActiveConnections", "Statistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp" } }
        },
        Tags = new List<string> { "network", "discovery", "adapters", "routing", "dns", "connections", "firewall", "wireless" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS" }
    };

    public static DiscoveryScriptTemplate CreateWindowsSecurityDiscoveryScript() => new()
    {
        Name = "Windows Security Discovery - PowerShell",
        Description = "Comprehensive security discovery for Windows systems including antivirus, firewall, encryption, and security policies",
        Category = "Security Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 45,
        RequiresElevation = true,
        RequiresNetwork = false,
        Template = @"
# Windows Security Discovery Script
# Outputs comprehensive security information in JSON format
# Requires elevated privileges for complete security assessment

$ErrorActionPreference = 'SilentlyContinue'

$securityInfo = @{
    AntivirusProducts = @()
    FirewallStatus = @()
    WindowsDefender = @{}
    BitLockerStatus = @()
    TPMStatus = @{}
    SecurityPolicies = @()
    UserAccountControl = @{}
    WindowsUpdates = @{}
    EncryptionStatus = @()
    SecurityEvents = @()
}

# Antivirus Products
try {
    $antivirusProducts = Get-WmiObject -Namespace 'root\SecurityCenter2' -Class AntiVirusProduct -ErrorAction SilentlyContinue
    foreach ($av in $antivirusProducts) {
        $productState = $av.productState
        $realTimeProtection = ($productState -band 0x10) -ne 0
        $definitionsUpToDate = ($productState -band 0x20) -ne 0
        
        $securityInfo.AntivirusProducts += @{
            DisplayName = $av.displayName
            InstanceGuid = $av.instanceGuid
            PathToSignedProductExe = $av.pathToSignedProductExe
            PathToSignedReportingExe = $av.pathToSignedReportingExe
            ProductState = $productState
            RealTimeProtectionEnabled = $realTimeProtection
            DefinitionsUpToDate = $definitionsUpToDate
            Timestamp = $av.timestamp
        }
    }
} catch { }

# Windows Firewall Status
try {
    $firewallProfiles = @{
        Domain = netsh advfirewall show domain | Select-String 'State\s+(.+)'
        Private = netsh advfirewall show private | Select-String 'State\s+(.+)'
        Public = netsh advfirewall show public | Select-String 'State\s+(.+)'
    }
    
    foreach ($profile in $firewallProfiles.Keys) {
        $status = $firewallProfiles[$profile]
        $securityInfo.FirewallStatus += @{
            Profile = $profile
            Status = if ($status) { $status.Matches.Groups[1].Value.Trim() } else { 'Unknown' }
        }
    }
} catch { }

# Windows Defender Status
try {
    $defenderStatus = Get-MpComputerStatus -ErrorAction SilentlyContinue
    if ($defenderStatus) {
        $securityInfo.WindowsDefender = @{
            AntivirusEnabled = $defenderStatus.AntivirusEnabled
            AntispywareEnabled = $defenderStatus.AntispywareEnabled
            RealTimeProtectionEnabled = $defenderStatus.RealTimeProtectionEnabled
            OnAccessProtectionEnabled = $defenderStatus.OnAccessProtectionEnabled
            IoavProtectionEnabled = $defenderStatus.IoavProtectionEnabled
            BehaviorMonitorEnabled = $defenderStatus.BehaviorMonitorEnabled
            AntivirusSignatureLastUpdated = $defenderStatus.AntivirusSignatureLastUpdated
            AntispywareSignatureLastUpdated = $defenderStatus.AntispywareSignatureLastUpdated
            QuickScanAge = $defenderStatus.QuickScanAge
            FullScanAge = $defenderStatus.FullScanAge
            AntivirusSignatureAge = $defenderStatus.AntivirusSignatureAge
            AntispywareSignatureAge = $defenderStatus.AntispywareSignatureAge
        }
    }
} catch { }

# BitLocker Status
try {
    $bitlockerVolumes = Get-BitLockerVolume -ErrorAction SilentlyContinue
    foreach ($volume in $bitlockerVolumes) {
        $securityInfo.BitLockerStatus += @{
            MountPoint = $volume.MountPoint
            EncryptionMethod = $volume.EncryptionMethod.ToString()
            EncryptionPercentage = $volume.EncryptionPercentage
            VolumeStatus = $volume.VolumeStatus.ToString()
            ProtectionStatus = $volume.ProtectionStatus.ToString()
            LockStatus = $volume.LockStatus.ToString()
            AutoUnlockEnabled = $volume.AutoUnlockEnabled
            AutoUnlockKeyStored = $volume.AutoUnlockKeyStored
            KeyProtector = $volume.KeyProtector | ForEach-Object { @{
                KeyProtectorType = $_.KeyProtectorType.ToString()
                KeyProtectorId = $_.KeyProtectorId
            }}
        }
    }
} catch { }

# TPM Status
try {
    $tpm = Get-Tpm -ErrorAction SilentlyContinue
    if ($tpm) {
        $securityInfo.TPMStatus = @{
            TpmPresent = $tpm.TpmPresent
            TpmReady = $tmp.TpmReady
            TpmEnabled = $tpm.TpmEnabled
            TpmActivated = $tpm.TpmActivated
            TpmOwned = $tpm.TpmOwned
            RestartPending = $tpm.RestartPending
            ManufacturerIdTxt = $tpm.ManufacturerIdTxt
            ManufacturerVersion = $tpm.ManufacturerVersion
            ManagedAuthLevel = $tpm.ManagedAuthLevel.ToString()
            OwnerAuth = $tpm.OwnerAuth.ToString()
            OwnerClearDisabled = $tpm.OwnerClearDisabled
            AutoProvisioning = $tmp.AutoProvisioning.ToString()
            LockedOut = $tpm.LockedOut
            LockoutHealTime = $tpm.LockoutHealTime
            LockoutCount = $tpm.LockoutCount
            LockoutMax = $tpm.LockoutMax
        }
    }
} catch { }

# Security Policies (Sample)
try {
    $securityOptions = @{
        'PasswordComplexity' = Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters' -Name RequireSignOrSeal -ErrorAction SilentlyContinue
        'PasswordHistory' = Get-ItemProperty 'HKLM:\SAM\SAM\Domains\Account' -Name MinPwdLen -ErrorAction SilentlyContinue
        'AccountLockout' = Get-ItemProperty 'HKLM:\SAM\SAM\Domains\Account' -Name LockoutDuration -ErrorAction SilentlyContinue
    }
    
    foreach ($policy in $securityOptions.Keys) {
        if ($securityOptions[$policy]) {
            $securityInfo.SecurityPolicies += @{
                PolicyName = $policy
                Value = $securityOptions[$policy]
            }
        }
    }
} catch { }

# User Account Control (UAC)
try {
    $uacSettings = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -ErrorAction SilentlyContinue
    if ($uacSettings) {
        $securityInfo.UserAccountControl = @{
            EnableLUA = $uacSettings.EnableLUA
            ConsentPromptBehaviorAdmin = $uacSettings.ConsentPromptBehaviorAdmin
            ConsentPromptBehaviorUser = $uacSettings.ConsentPromptBehaviorUser
            EnableInstallerDetection = $uacSettings.EnableInstallerDetection
            EnableSecureUIAPaths = $uacSettings.EnableSecureUIAPaths
            EnableUIADesktopToggle = $uacSettings.EnableUIADesktopToggle
            EnableVirtualization = $uacSettings.EnableVirtualization
            PromptOnSecureDesktop = $uacSettings.PromptOnSecureDesktop
            ValidateAdminCodeSignatures = $uacSettings.ValidateAdminCodeSignatures
        }
    }
} catch { }

# Windows Update Status
try {
    $updateSession = New-Object -ComObject Microsoft.Update.Session
    $updateSearcher = $updateSession.CreateUpdateSearcher()
    $searchResult = $updateSearcher.Search('IsInstalled=0')
    
    $securityInfo.WindowsUpdates = @{
        PendingUpdates = $searchResult.Updates.Count
        LastUpdateCheck = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update\Results\Detect' -Name LastSuccessTime -ErrorAction SilentlyContinue).LastSuccessTime
        AutoUpdateEnabled = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update' -Name AUOptions -ErrorAction SilentlyContinue).AUOptions
    }
} catch { }

# Encryption Status for drives
try {
    $drives = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 }
    foreach ($drive in $drives) {
        $encStatus = manage-bde -status $drive.DeviceID 2>$null
        $isEncrypted = $encStatus -match 'Protection On'
        
        $securityInfo.EncryptionStatus += @{
            Drive = $drive.DeviceID
            IsEncrypted = $isEncrypted
            Size = $drive.Size
            FreeSpace = $drive.FreeSpace
            FileSystem = $drive.FileSystem
        }
    }
} catch { }

# Recent Security Events (last 24 hours)
try {
    $yesterday = (Get-Date).AddDays(-1)
    $securityEvents = Get-WinEvent -FilterHashtable @{LogName='Security'; StartTime=$yesterday; ID=4624,4625,4648,4672,4720,4726,4728,4732,4756} -MaxEvents 100 -ErrorAction SilentlyContinue
    
    foreach ($event in $securityEvents) {
        $securityInfo.SecurityEvents += @{
            EventId = $event.Id
            TimeCreated = $event.TimeCreated.ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            LevelDisplayName = $event.LevelDisplayName
            Message = $event.Message.Substring(0, [Math]::Min(200, $event.Message.Length))
            UserId = $event.UserId
            MachineName = $event.MachineName
        }
    }
} catch { }

# Add metadata
$securityInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$securityInfo.ScriptVersion = '1.0.0'
$securityInfo.ComputerName = $env:COMPUTERNAME
$securityInfo.RequiredElevation = $true
$securityInfo.SecurityEventCount = $securityInfo.SecurityEvents.Count

# Output as JSON
$securityInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "AntivirusProducts", "FirewallStatus", "WindowsDefender", "BitLockerStatus", "TPMStatus", "SecurityPolicies" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "RequiredElevation" } }
        },
        Tags = new List<string> { "security", "discovery", "antivirus", "firewall", "bitlocker", "tpm", "uac", "encryption", "compliance" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS", "GDPR" }
    };

    public static DiscoveryScriptTemplate CreateWindowsServicesDiscoveryScript() => new()
    {
        Name = "Windows Services Discovery - PowerShell",
        Description = "Comprehensive discovery of Windows services including status, configuration, and dependencies",
        Category = "Services Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"
# Windows Services Discovery Script
# Outputs comprehensive service information in JSON format

$ErrorActionPreference = 'SilentlyContinue'

$servicesInfo = @{
    Services = @()
    ServiceStatistics = @{}
}

# Get all services with detailed information
$services = Get-WmiObject -Class Win32_Service
foreach ($service in $services) {
    $serviceInfo = @{
        Name = $service.Name
        DisplayName = $service.DisplayName
        Description = $service.Description
        State = $service.State
        Status = $service.Status
        StartMode = $service.StartMode
        ServiceType = $service.ServiceType
        ProcessId = $service.ProcessId
        PathName = $service.PathName
        StartName = $service.StartName
        SystemName = $service.SystemName
        AcceptPause = $service.AcceptPause
        AcceptStop = $service.AcceptStop
        DesktopInteract = $service.DesktopInteract
        ErrorControl = $service.ErrorControl
        ExitCode = $service.ExitCode
        ServiceSpecificExitCode = $service.ServiceSpecificExitCode
        TagId = $service.TagId
        CheckPoint = $service.CheckPoint
        WaitHint = $service.WaitHint
    }
    
    # Get service dependencies
    try {
        $dependencies = Get-Service -Name $service.Name | Select-Object -ExpandProperty DependentServices -ErrorAction SilentlyContinue
        $serviceInfo.DependentServices = $dependencies | ForEach-Object { $_.Name }
        
        $requiredServices = Get-Service -Name $service.Name | Select-Object -ExpandProperty ServicesDependedOn -ErrorAction SilentlyContinue
        $serviceInfo.ServicesDependedOn = $requiredServices | ForEach-Object { $_.Name }
    } catch {
        $serviceInfo.DependentServices = @()
        $serviceInfo.ServicesDependedOn = @()
    }
    
    $servicesInfo.Services += $serviceInfo
}

# Calculate service statistics
$runningServices = ($servicesInfo.Services | Where-Object { $_.State -eq 'Running' }).Count
$stoppedServices = ($servicesInfo.Services | Where-Object { $_.State -eq 'Stopped' }).Count
$autoStartServices = ($servicesInfo.Services | Where-Object { $_.StartMode -eq 'Auto' }).Count
$manualStartServices = ($servicesInfo.Services | Where-Object { $_.StartMode -eq 'Manual' }).Count
$disabledServices = ($servicesInfo.Services | Where-Object { $_.StartMode -eq 'Disabled' }).Count

$servicesInfo.ServiceStatistics = @{
    TotalServices = $servicesInfo.Services.Count
    RunningServices = $runningServices
    StoppedServices = $stoppedServices
    AutoStartServices = $autoStartServices
    ManualStartServices = $manualStartServices
    DisabledServices = $disabledServices
    RunningPercentage = if ($servicesInfo.Services.Count -gt 0) { [Math]::Round(($runningServices / $servicesInfo.Services.Count) * 100, 2) } else { 0 }
}

# Add metadata
$servicesInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$servicesInfo.ScriptVersion = '1.0.0'
$servicesInfo.ComputerName = $env:COMPUTERNAME

# Output as JSON
$servicesInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "Services", "ServiceStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "ServiceStatistics.TotalServices" } }
        },
        Tags = new List<string> { "services", "discovery", "windows", "processes", "dependencies", "configuration" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    public static DiscoveryScriptTemplate CreateWindowsProcessDiscoveryScript() => new()
    {
        Name = "Windows Process Discovery - PowerShell",
        Description = "Comprehensive discovery of running processes including resource usage, network connections, and security context",
        Category = "Process Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 45,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"
# Windows Process Discovery Script
# Outputs comprehensive process information in JSON format

$ErrorActionPreference = 'SilentlyContinue'

$processInfo = @{
    Processes = @()
    ProcessStatistics = @{}
    NetworkConnections = @()
}

# Get all processes with detailed information
$processes = Get-WmiObject -Class Win32_Process
$performanceCounters = Get-WmiObject -Class Win32_PerfRawData_PerfProc_Process

foreach ($process in $processes) {
    $perfCounter = $performanceCounters | Where-Object { $_.IDProcess -eq $process.ProcessId }
    
    $proc = @{
        ProcessId = $process.ProcessId
        Name = $process.Name
        ExecutablePath = $process.ExecutablePath
        CommandLine = $process.CommandLine
        CreationDate = if ($process.CreationDate) { [Management.ManagementDateTimeConverter]::ToDateTime($process.CreationDate).ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
        ParentProcessId = $process.ParentProcessId
        ThreadCount = $process.ThreadCount
        HandleCount = $process.HandleCount
        Priority = $process.Priority
        PageFileUsage = $process.PageFileUsage
        PageFaults = $process.PageFaults
        PeakPageFileUsage = $process.PeakPageFileUsage
        WorkingSetSize = $process.WorkingSetSize
        PeakWorkingSetSize = $process.PeakWorkingSetSize
        VirtualSize = $process.VirtualSize
        PeakVirtualSize = $process.PeakVirtualSize
        SessionId = $process.SessionId
        Description = $process.Description
        CSName = $process.CSName
        WindowsVersion = $process.WindowsVersion
    }
    
    # Get process owner
    try {
        $owner = $process.GetOwner()
        if ($owner.ReturnValue -eq 0) {
            $proc.Owner = ""$($owner.Domain)\$($owner.User)""
        }
    } catch { }
    
    # Get additional process details using Get-Process
    try {
        $psProcess = Get-Process -Id $process.ProcessId -ErrorAction SilentlyContinue
        if ($psProcess) {
            $proc.CPU = $psProcess.CPU
            $proc.NPM = $psProcess.NPM
            $proc.PM = $psProcess.PM
            $proc.WS = $psProcess.WS
            $proc.VM = $psProcess.VM
            $proc.StartTime = if ($psProcess.StartTime) { $psProcess.StartTime.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
            $proc.TotalProcessorTime = if ($psProcess.TotalProcessorTime) { $psProcess.TotalProcessorTime.TotalSeconds } else { $null }
            $proc.UserProcessorTime = if ($psProcess.UserProcessorTime) { $psProcess.UserProcessorTime.TotalSeconds } else { $null }
            $proc.PrivilegedProcessorTime = if ($psProcess.PrivilegedProcessorTime) { $psProcess.PrivilegedProcessorTime.TotalSeconds } else { $null }
            $proc.MachineName = $psProcess.MachineName
            $proc.MainWindowTitle = $psProcess.MainWindowTitle
            $proc.MainModule = if ($psProcess.MainModule) {
                @{
                    ModuleName = $psProcess.MainModule.ModuleName
                    FileName = $psProcess.MainModule.FileName
                    FileVersionInfo = @{
                        CompanyName = $psProcess.MainModule.FileVersionInfo.CompanyName
                        ProductName = $psProcess.MainModule.FileVersionInfo.ProductName
                        ProductVersion = $psProcess.MainModule.FileVersionInfo.ProductVersion
                        FileVersion = $psProcess.MainModule.FileVersionInfo.FileVersion
                        FileDescription = $psProcess.MainModule.FileVersionInfo.FileDescription
                    }
                }
            } else { $null }
        }
    } catch { }
    
    $processInfo.Processes += $proc
}

# Get network connections and associate with processes
try {
    $connections = netstat -ano | Select-String '\s+(TCP|UDP)'
    foreach ($line in $connections) {
        if ($line -match '\s+(TCP|UDP)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)') {
            $pid = $matches[5]
            $processName = ($processInfo.Processes | Where-Object { $_.ProcessId -eq $pid } | Select-Object -First 1).Name
            
            $processInfo.NetworkConnections += @{
                Protocol = $matches[1]
                LocalAddress = $matches[2]
                ForeignAddress = $matches[3]
                State = $matches[4]
                ProcessId = $pid
                ProcessName = $processName
            }
        }
    }
} catch { }

# Calculate process statistics
$totalMemoryUsage = ($processInfo.Processes | Where-Object { $_.WorkingSetSize } | Measure-Object -Property WorkingSetSize -Sum).Sum
$totalVirtualMemory = ($processInfo.Processes | Where-Object { $_.VirtualSize } | Measure-Object -Property VirtualSize -Sum).Sum
$totalThreads = ($processInfo.Processes | Where-Object { $_.ThreadCount } | Measure-Object -Property ThreadCount -Sum).Sum
$totalHandles = ($processInfo.Processes | Where-Object { $_.HandleCount } | Measure-Object -Property HandleCount -Sum).Sum

$processInfo.ProcessStatistics = @{
    TotalProcesses = $processInfo.Processes.Count
    TotalMemoryUsageBytes = $totalMemoryUsage
    TotalMemoryUsageMB = if ($totalMemoryUsage) { [Math]::Round($totalMemoryUsage / 1MB, 2) } else { 0 }
    TotalVirtualMemoryBytes = $totalVirtualMemory
    TotalVirtualMemoryMB = if ($totalVirtualMemory) { [Math]::Round($totalVirtualMemory / 1MB, 2) } else { 0 }
    TotalThreads = $totalThreads
    TotalHandles = $totalHandles
    TotalNetworkConnections = $processInfo.NetworkConnections.Count
    UniqueProcessNames = ($processInfo.Processes | Select-Object -ExpandProperty Name | Sort-Object -Unique).Count
    ProcessesWithOwner = ($processInfo.Processes | Where-Object { $_.Owner }).Count
    SystemProcesses = ($processInfo.Processes | Where-Object { $_.SessionId -eq 0 }).Count
    UserProcesses = ($processInfo.Processes | Where-Object { $_.SessionId -ne 0 }).Count
}

# Top processes by memory usage
$topProcessesByMemory = $processInfo.Processes | 
    Where-Object { $_.WorkingSetSize } | 
    Sort-Object WorkingSetSize -Descending | 
    Select-Object -First 10 | 
    ForEach-Object {
        @{
            Name = $_.Name
            ProcessId = $_.ProcessId
            WorkingSetSizeMB = [Math]::Round($_.WorkingSetSize / 1MB, 2)
            Owner = $_.Owner
        }
    }

$processInfo.TopProcessesByMemory = $topProcessesByMemory

# Add metadata
$processInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$processInfo.ScriptVersion = '1.0.0'
$processInfo.ComputerName = $env:COMPUTERNAME

# Output as JSON
$processInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "Processes", "ProcessStatistics", "NetworkConnections", "TopProcessesByMemory" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "ProcessStatistics.TotalProcesses" } }
        },
        Tags = new List<string> { "processes", "discovery", "windows", "memory", "cpu", "performance", "network", "security" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    public static DiscoveryScriptTemplate CreateWindowsEventLogDiscoveryScript() => new()
    {
        Name = "Windows Event Log Discovery - PowerShell", 
        Description = "Discovery and analysis of Windows event logs including system, security, and application events",
        Category = "Event Log Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 60,
        RequiresElevation = true,
        RequiresNetwork = false,
        Template = @"
# Windows Event Log Discovery Script
# Outputs event log information and recent critical events in JSON format
# Requires elevated privileges for security log access

$ErrorActionPreference = 'SilentlyContinue'

$eventInfo = @{
    EventLogs = @()
    RecentCriticalEvents = @()
    SecurityEvents = @()
    SystemEvents = @()
    ApplicationEvents = @()
    EventStatistics = @{}
}

# Get all event logs
$logs = Get-WinEvent -ListLog * -ErrorAction SilentlyContinue
foreach ($log in $logs) {
    $eventInfo.EventLogs += @{
        LogName = $log.LogName
        LogMode = $log.LogMode.ToString()
        MaximumSizeInBytes = $log.MaximumSizeInBytes
        RecordCount = $log.RecordCount
        LogType = $log.LogType.ToString()
        IsEnabled = $log.IsEnabled
        IsClassicLog = $log.IsClassicLog
        SecurityDescriptor = $log.SecurityDescriptor
        LogFilePath = $log.LogFilePath
        CreationTime = if ($log.CreationTime) { $log.CreationTime.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
        LastAccessTime = if ($log.LastAccessTime) { $log.LastAccessTime.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
        LastWriteTime = if ($log.LastWriteTime) { $log.LastWriteTime.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
        OldestRecordNumber = $log.OldestRecordNumber
        OwningProviderName = $log.OwningProviderName
    }
}

# Get recent critical and error events (last 7 days)
$startTime = (Get-Date).AddDays(-7)
try {
    $criticalEvents = Get-WinEvent -FilterHashtable @{Level=1,2; StartTime=$startTime} -MaxEvents 50 -ErrorAction SilentlyContinue
    foreach ($event in $criticalEvents) {
        $eventInfo.RecentCriticalEvents += @{
            LogName = $event.LogName
            EventId = $event.Id
            Level = $event.Level
            LevelDisplayName = $event.LevelDisplayName
            TimeCreated = $event.TimeCreated.ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            ProviderName = $event.ProviderName
            Message = if ($event.Message) { $event.Message.Substring(0, [Math]::Min(500, $event.Message.Length)) } else { '' }
            UserId = $event.UserId
            ProcessId = $event.ProcessId
            ThreadId = $event.ThreadId
            MachineName = $event.MachineName
            Keywords = $event.Keywords
            Opcode = $event.Opcode
            Task = $event.Task
            RecordId = $event.RecordId
        }
    }
} catch { }

# Security Events (last 24 hours) - Login attempts, account changes, etc.
try {
    $yesterday = (Get-Date).AddDays(-1)
    $securityEvents = Get-WinEvent -FilterHashtable @{LogName='Security'; StartTime=$yesterday; ID=4624,4625,4648,4672,4720,4726,4728,4732,4756,4648} -MaxEvents 100 -ErrorAction SilentlyContinue
    
    foreach ($event in $securityEvents) {
        $eventInfo.SecurityEvents += @{
            EventId = $event.Id
            TimeCreated = $event.TimeCreated.ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            LevelDisplayName = $event.LevelDisplayName
            Message = if ($event.Message) { $event.Message.Substring(0, [Math]::Min(300, $event.Message.Length)) } else { '' }
            UserId = $event.UserId
            MachineName = $event.MachineName
            Keywords = $event.Keywords
            RecordId = $event.RecordId
        }
    }
} catch { }

# System Events (last 24 hours) - Service starts/stops, driver issues, etc.
try {
    $yesterday = (Get-Date).AddDays(-1)
    $systemEvents = Get-WinEvent -FilterHashtable @{LogName='System'; StartTime=$yesterday; Level=1,2,3} -MaxEvents 50 -ErrorAction SilentlyContinue
    
    foreach ($event in $systemEvents) {
        $eventInfo.SystemEvents += @{
            EventId = $event.Id
            TimeCreated = $event.TimeCreated.ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            LevelDisplayName = $event.LevelDisplayName
            ProviderName = $event.ProviderName
            Message = if ($event.Message) { $event.Message.Substring(0, [Math]::Min(300, $event.Message.Length)) } else { '' }
            ProcessId = $event.ProcessId
            ThreadId = $event.ThreadId
            RecordId = $event.RecordId
        }
    }
} catch { }

# Application Events (last 24 hours) - Application errors and warnings
try {
    $yesterday = (Get-Date).AddDays(-1)
    $appEvents = Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=$yesterday; Level=1,2} -MaxEvents 50 -ErrorAction SilentlyContinue
    
    foreach ($event in $appEvents) {
        $eventInfo.ApplicationEvents += @{
            EventId = $event.Id
            TimeCreated = $event.TimeCreated.ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            LevelDisplayName = $event.LevelDisplayName
            ProviderName = $event.ProviderName
            Message = if ($event.Message) { $event.Message.Substring(0, [Math]::Min(300, $event.Message.Length)) } else { '' }
            ProcessId = $event.ProcessId
            ThreadId = $event.ThreadId
            RecordId = $event.RecordId
        }
    }
} catch { }

# Event Statistics
$totalEventLogs = $eventInfo.EventLogs.Count
$enabledLogs = ($eventInfo.EventLogs | Where-Object { $_.IsEnabled }).Count
$totalEventRecords = ($eventInfo.EventLogs | Where-Object { $_.RecordCount } | Measure-Object -Property RecordCount -Sum).Sum

$eventInfo.EventStatistics = @{
    TotalEventLogs = $totalEventLogs
    EnabledEventLogs = $enabledLogs
    DisabledEventLogs = $totalEventLogs - $enabledLogs
    TotalEventRecords = $totalEventRecords
    RecentCriticalEventsCount = $eventInfo.RecentCriticalEvents.Count
    SecurityEventsCount = $eventInfo.SecurityEvents.Count
    SystemEventsCount = $eventInfo.SystemEvents.Count
    ApplicationEventsCount = $eventInfo.ApplicationEvents.Count
    LargestLogSizeBytes = ($eventInfo.EventLogs | Where-Object { $_.MaximumSizeInBytes } | Measure-Object -Property MaximumSizeInBytes -Maximum).Maximum
    MostActiveLog = ($eventInfo.EventLogs | Where-Object { $_.RecordCount } | Sort-Object RecordCount -Descending | Select-Object -First 1).LogName
}

# Add metadata
$eventInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$eventInfo.ScriptVersion = '1.0.0'
$eventInfo.ComputerName = $env:COMPUTERNAME
$eventInfo.RequiredElevation = $true

# Output as JSON
$eventInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "EventLogs", "RecentCriticalEvents", "SecurityEvents", "EventStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "EventStatistics.TotalEventLogs" } }
        },
        Tags = new List<string> { "eventlogs", "discovery", "windows", "security", "system", "application", "audit", "monitoring" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS", "GDPR" }
    };

    public static DiscoveryScriptTemplate CreateWindowsRegistryDiscoveryScript() => new()
    {
        Name = "Windows Registry Discovery - PowerShell",
        Description = "Discovery of key Windows registry settings for security, configuration, and compliance assessment",
        Category = "Registry Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"
# Windows Registry Discovery Script
# Outputs key registry information for security and configuration assessment

$ErrorActionPreference = 'SilentlyContinue'

$registryInfo = @{
    SystemConfiguration = @{}
    SecuritySettings = @{}
    SoftwareConfiguration = @{}
    NetworkConfiguration = @{}
    UserConfiguration = @{}
    InstalledPrograms = @{}
}

# System Configuration
$registryInfo.SystemConfiguration = @{
    ComputerName = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\ComputerName\ComputerName' -Name ComputerName -ErrorAction SilentlyContinue).ComputerName
    WindowsVersion = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name ProductName -ErrorAction SilentlyContinue).ProductName
    BuildNumber = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name CurrentBuildNumber -ErrorAction SilentlyContinue).CurrentBuildNumber
    InstallDate = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name InstallDate -ErrorAction SilentlyContinue).InstallDate
    RegisteredOwner = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name RegisteredOwner -ErrorAction SilentlyContinue).RegisteredOwner
    RegisteredOrganization = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name RegisteredOrganization -ErrorAction SilentlyContinue).RegisteredOrganization
    SystemRoot = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name SystemRoot -ErrorAction SilentlyContinue).SystemRoot
    TimeZone = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\TimeZoneInformation' -Name TimeZoneKeyName -ErrorAction SilentlyContinue).TimeZoneKeyName
    LastBootUpTime = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Windows' -Name ShutdownTime -ErrorAction SilentlyContinue).ShutdownTime
    ProcessorArchitecture = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment' -Name PROCESSOR_ARCHITECTURE -ErrorAction SilentlyContinue).PROCESSOR_ARCHITECTURE
}

# Security Settings
$registryInfo.SecuritySettings = @{
    # UAC Settings
    UACEnabled = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -Name EnableLUA -ErrorAction SilentlyContinue).EnableLUA
    ConsentPromptBehaviorAdmin = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -Name ConsentPromptBehaviorAdmin -ErrorAction SilentlyContinue).ConsentPromptBehaviorAdmin
    PromptOnSecureDesktop = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System' -Name PromptOnSecureDesktop -ErrorAction SilentlyContinue).PromptOnSecureDesktop
    
    # Windows Defender
    DefenderEnabled = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows Defender' -Name DisableAntiSpyware -ErrorAction SilentlyContinue).DisableAntiSpyware
    DefenderRealTimeProtection = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows Defender\Real-Time Protection' -Name DisableRealtimeMonitoring -ErrorAction SilentlyContinue).DisableRealtimeMonitoring
    
    # Remote Desktop
    RemoteDesktopEnabled = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server' -Name fDenyTSConnections -ErrorAction SilentlyContinue).fDenyTSConnections
    NLARequired = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp' -Name UserAuthentication -ErrorAction SilentlyContinue).UserAuthentication
    
    # Password Policy
    MinimumPasswordLength = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters' -Name RequireSignOrSeal -ErrorAction SilentlyContinue).RequireSignOrSeal
    
    # Firewall
    DomainFirewallEnabled = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\DomainProfile' -Name EnableFirewall -ErrorAction SilentlyContinue).EnableFirewall
    PublicFirewallEnabled = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\PublicProfile' -Name EnableFirewall -ErrorAction SilentlyContinue).EnableFirewall
    PrivateFirewallEnabled = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\StandardProfile' -Name EnableFirewall -ErrorAction SilentlyContinue).EnableFirewall
}

# Software Configuration
$registryInfo.SoftwareConfiguration = @{
    # Windows Update
    AutoUpdateEnabled = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate\Auto Update' -Name AUOptions -ErrorAction SilentlyContinue).AUOptions
    WSUSServer = (Get-ItemProperty 'HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate' -Name WUServer -ErrorAction SilentlyContinue).WUServer
    
    # Internet Explorer
    IEVersion = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Internet Explorer' -Name svcVersion -ErrorAction SilentlyContinue).svcVersion
    IESecurityZones = @{}
    
    # Office Configuration
    OfficeVersion = (Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Office\ClickToRun\Configuration' -Name VersionToReport -ErrorAction SilentlyContinue).VersionToReport
    
    # .NET Framework
    DotNetVersions = @()
}

# Get .NET Framework versions
$dotNetRegPath = 'HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP'
if (Test-Path $dotNetRegPath) {
    $dotNetKeys = Get-ChildItem $dotNetRegPath -ErrorAction SilentlyContinue
    foreach ($key in $dotNetKeys) {
        $version = Get-ItemProperty $key.PSPath -Name Version -ErrorAction SilentlyContinue
        if ($version) {
            $registryInfo.SoftwareConfiguration.DotNetVersions += @{
                Name = $key.PSChildName
                Version = $version.Version
                Install = (Get-ItemProperty $key.PSPath -Name Install -ErrorAction SilentlyContinue).Install
            }
        }
    }
}

# Network Configuration
$registryInfo.NetworkConfiguration = @{
    # TCP/IP Configuration
    EnableDHCP = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters' -Name EnableDHCP -ErrorAction SilentlyContinue).EnableDHCP
    HostName = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters' -Name Hostname -ErrorAction SilentlyContinue).Hostname
    Domain = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters' -Name Domain -ErrorAction SilentlyContinue).Domain
    SearchList = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters' -Name SearchList -ErrorAction SilentlyContinue).SearchList
    
    # File Sharing
    ServerEnabled = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\lanmanserver\Parameters' -Name Start -ErrorAction SilentlyContinue).Start
    WorkstationEnabled = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\lanmanworkstation\Parameters' -Name Start -ErrorAction SilentlyContinue).Start
    
    # SMB Configuration
    SMB1Enabled = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\mrxsmb10' -Name Start -ErrorAction SilentlyContinue).Start
    SMB2Enabled = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\mrxsmb20' -Name Start -ErrorAction SilentlyContinue).Start
}

# User Configuration (Current User)
$registryInfo.UserConfiguration = @{
    # Desktop Settings
    Wallpaper = (Get-ItemProperty 'HKCU:\Control Panel\Desktop' -Name Wallpaper -ErrorAction SilentlyContinue).Wallpaper
    ScreenSaver = (Get-ItemProperty 'HKCU:\Control Panel\Desktop' -Name SCRNSAVE.EXE -ErrorAction SilentlyContinue).'SCRNSAVE.EXE'
    ScreenSaverTimeout = (Get-ItemProperty 'HKCU:\Control Panel\Desktop' -Name ScreenSaveTimeOut -ErrorAction SilentlyContinue).ScreenSaveTimeOut
    
    # Internet Explorer User Settings
    IEHomePage = (Get-ItemProperty 'HKCU:\SOFTWARE\Microsoft\Internet Explorer\Main' -Name 'Start Page' -ErrorAction SilentlyContinue).'Start Page'
    
    # Windows Explorer Settings
    ShowHiddenFiles = (Get-ItemProperty 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced' -Name Hidden -ErrorAction SilentlyContinue).Hidden
    ShowFileExtensions = (Get-ItemProperty 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced' -Name HideFileExt -ErrorAction SilentlyContinue).HideFileExt
}

# Installed Programs (Quick overview from Uninstall registry)
$uninstallKeys = @(
    'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
)

$installedPrograms = @()
foreach ($path in $uninstallKeys) {
    if (Test-Path ($path -replace '\*', '')) {
        $programs = Get-ItemProperty $path -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -and $_.DisplayName -notmatch '^KB[0-9]+' }
        foreach ($program in $programs) {
            $installedPrograms += @{
                Name = $program.DisplayName
                Version = $program.DisplayVersion
                Publisher = $program.Publisher
                InstallDate = $program.InstallDate
                Architecture = if ($path -match 'WOW6432Node') { 'x86' } else { 'x64' }
            }
        }
    }
}

$registryInfo.InstalledPrograms = @{
    Programs = $installedPrograms
    TotalCount = $installedPrograms.Count
    x64Programs = ($installedPrograms | Where-Object { $_.Architecture -eq 'x64' }).Count
    x86Programs = ($installedPrograms | Where-Object { $_.Architecture -eq 'x86' }).Count
    UniquePublishers = ($installedPrograms | Where-Object { $_.Publisher } | Select-Object -ExpandProperty Publisher | Sort-Object -Unique).Count
}

# Add metadata
$registryInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$registryInfo.ScriptVersion = '1.0.0'
$registryInfo.ComputerName = $env:COMPUTERNAME
$registryInfo.CurrentUser = $env:USERNAME

# Output as JSON
$registryInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "SystemConfiguration", "SecuritySettings", "SoftwareConfiguration", "NetworkConfiguration", "InstalledPrograms" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "CurrentUser" } }
        },
        Tags = new List<string> { "registry", "discovery", "windows", "configuration", "security", "software", "system", "compliance" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS", "GDPR" }
    };

    public static DiscoveryScriptTemplate CreateWindowsUserAccountDiscoveryScript() => new()
    {
        Name = "Windows User Account Discovery - PowerShell",
        Description = "Comprehensive discovery of Windows user accounts, groups, and access privileges",
        Category = "User Account Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"
# Windows User Account Discovery Script
# Outputs comprehensive user account and group information in JSON format

$ErrorActionPreference = 'SilentlyContinue'

$userInfo = @{
    LocalUsers = @()
    LocalGroups = @()
    CurrentUser = @{}
    UserProfiles = @()
    UserStatistics = @{}
    LogonSessions = @()
}

# Local Users
$users = Get-WmiObject -Class Win32_UserAccount -Filter ""LocalAccount=True""
foreach ($user in $users) {
    $userDetail = @{
        Name = $user.Name
        FullName = $user.FullName
        Description = $user.Description
        SID = $user.SID
        AccountType = $user.AccountType
        Disabled = $user.Disabled
        Lockout = $user.Lockout
        PasswordChangeable = $user.PasswordChangeable
        PasswordExpires = $user.PasswordExpires
        PasswordRequired = $user.PasswordRequired
        Status = $user.Status
        Domain = $user.Domain
        Caption = $user.Caption
    }
    
    # Get additional user information from local user accounts
    try {
        $localUser = Get-LocalUser -Name $user.Name -ErrorAction SilentlyContinue
        if ($localUser) {
            $userDetail.AccountExpires = if ($localUser.AccountExpires) { $localUser.AccountExpires.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
            $userDetail.LastLogon = if ($localUser.LastLogon) { $localUser.LastLogon.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
            $userDetail.PasswordLastSet = if ($localUser.PasswordLastSet) { $localUser.PasswordLastSet.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
            $userDetail.UserMayChangePassword = $localUser.UserMayChangePassword
            $userDetail.PrincipalSource = $localUser.PrincipalSource.ToString()
        }
    } catch { }
    
    # Get user group memberships
    try {
        $groupMemberships = net user $user.Name 2>$null | Select-String 'Local Group Memberships' -A 20 | Select-String '\*([^*]+)' | ForEach-Object { $_.Matches.Groups[1].Value.Trim() }
        $userDetail.GroupMemberships = $groupMemberships
    } catch {
        $userDetail.GroupMemberships = @()
    }
    
    $userInfo.LocalUsers += $userDetail
}

# Local Groups
$groups = Get-WmiObject -Class Win32_Group -Filter ""LocalAccount=True""
foreach ($group in $groups) {
    $groupDetail = @{
        Name = $group.Name
        Description = $group.Description
        SID = $group.SID
        GroupType = $group.GroupType
        Status = $group.Status
        Domain = $group.Domain
        Caption = $group.Caption
    }
    
    # Get group members
    try {
        $groupMembers = net localgroup $group.Name 2>$null | Select-String '^\w' | Where-Object { $_ -notmatch 'Alias name|Comment|Members|command completed' }
        $groupDetail.Members = $groupMembers | ForEach-Object { $_.ToString().Trim() }
    } catch {
        $groupDetail.Members = @()
    }
    
    $userInfo.LocalGroups += $groupDetail
}

# Current User Information
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$userInfo.CurrentUser = @{
    Name = $currentUser.Name
    AuthenticationType = $currentUser.AuthenticationType
    IsAuthenticated = $currentUser.IsAuthenticated
    IsAnonymous = $currentUser.IsAnonymous
    IsGuest = $currentUser.IsGuest
    IsSystem = $currentUser.IsSystem
    Token = $currentUser.Token.ToString()
    ImpersonationLevel = $currentUser.ImpersonationLevel.ToString()
    Owner = $currentUser.Owner.ToString()
    User = $currentUser.User.ToString()
    Groups = $currentUser.Groups | ForEach-Object { $_.ToString() }
    Claims = $currentUser.Claims | ForEach-Object { 
        @{
            Type = $_.Type
            Value = $_.Value
            Issuer = $_.Issuer
        }
    }
}

# User Profiles
$profiles = Get-WmiObject -Class Win32_UserProfile
foreach ($profile in $profiles) {
    $profileDetail = @{
        LocalPath = $profile.LocalPath
        SID = $profile.SID
        Loaded = $profile.Loaded
        Special = $profile.Special
        LastUseTime = if ($profile.LastUseTime) { [Management.ManagementDateTimeConverter]::ToDateTime($profile.LastUseTime).ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
        RoamingConfigured = $profile.RoamingConfigured
        RoamingPath = $profile.RoamingPath
        RoamingPreference = $profile.RoamingPreference
        Status = $profile.Status
    }
    
    # Try to get username from SID
    try {
        $objSID = New-Object System.Security.Principal.SecurityIdentifier($profile.SID)
        $objUser = $objSID.Translate([System.Security.Principal.NTAccount])
        $profileDetail.UserName = $objUser.Value
    } catch {
        $profileDetail.UserName = 'Unknown'
    }
    
    $userInfo.UserProfiles += $profileDetail
}

# Logon Sessions
try {
    $logonSessions = Get-WmiObject -Class Win32_LogonSession
    foreach ($session in $logonSessions) {
        $sessionDetail = @{
            LogonId = $session.LogonId
            LogonType = $session.LogonType
            AuthenticationPackage = $session.AuthenticationPackage
            StartTime = if ($session.StartTime) { [Management.ManagementDateTimeConverter]::ToDateTime($session.StartTime).ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
            Status = $session.Status
        }
        
        # Get associated user for this session
        try {
            $loggedOnUser = Get-WmiObject -Class Win32_LoggedOnUser | Where-Object { $_.Dependent -match $session.LogonId }
            if ($loggedOnUser) {
                $userAccount = Get-WmiObject -Class Win32_Account | Where-Object { $_.Name -eq $loggedOnUser.Antecedent.Split('=')[1].Trim('""') }
                if ($userAccount) {
                    $sessionDetail.UserName = $userAccount.Name
                    $sessionDetail.Domain = $userAccount.Domain
                }
            }
        } catch { }
        
        $userInfo.LogonSessions += $sessionDetail
    }
} catch { }

# User Statistics
$enabledUsers = ($userInfo.LocalUsers | Where-Object { -not $_.Disabled }).Count
$disabledUsers = ($userInfo.LocalUsers | Where-Object { $_.Disabled }).Count
$adminUsers = ($userInfo.LocalUsers | Where-Object { $_.GroupMemberships -contains 'Administrators' }).Count
$activeProfiles = ($userInfo.UserProfiles | Where-Object { $_.Loaded }).Count
$totalGroups = $userInfo.LocalGroups.Count

$userInfo.UserStatistics = @{
    TotalLocalUsers = $userInfo.LocalUsers.Count
    EnabledUsers = $enabledUsers
    DisabledUsers = $disabledUsers
    AdministratorUsers = $adminUsers
    TotalLocalGroups = $totalGroups
    TotalUserProfiles = $userInfo.UserProfiles.Count
    ActiveUserProfiles = $activeProfiles
    InactiveUserProfiles = $userInfo.UserProfiles.Count - $activeProfiles
    CurrentLogonSessions = $userInfo.LogonSessions.Count
    InteractiveLogonSessions = ($userInfo.LogonSessions | Where-Object { $_.LogonType -eq 2 }).Count
    NetworkLogonSessions = ($userInfo.LogonSessions | Where-Object { $_.LogonType -eq 3 }).Count
    ServiceLogonSessions = ($userInfo.LogonSessions | Where-Object { $_.LogonType -eq 5 }).Count
}

# Add metadata
$userInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$userInfo.ScriptVersion = '1.0.0'
$userInfo.ComputerName = $env:COMPUTERNAME
$userInfo.MachineDomain = $env:USERDOMAIN

# Output as JSON
$userInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "LocalUsers", "LocalGroups", "CurrentUser", "UserProfiles", "UserStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "UserStatistics.TotalLocalUsers" } }
        },
        Tags = new List<string> { "users", "discovery", "windows", "accounts", "groups", "security", "profiles", "logon", "access" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS", "GDPR" }
    };

    public static DiscoveryScriptTemplate CreateWindowsPerformanceDiscoveryScript() => new()
    {
        Name = "Windows Performance Discovery - PowerShell",
        Description = "Comprehensive performance monitoring including CPU, memory, disk, and network metrics",
        Category = "Performance Discovery",
        Type = "powershell",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 45,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"
# Windows Performance Discovery Script
# Outputs comprehensive performance metrics in JSON format

$ErrorActionPreference = 'SilentlyContinue'

$performanceInfo = @{
    CPUMetrics = @{}
    MemoryMetrics = @{}
    DiskMetrics = @()
    NetworkMetrics = @()
    SystemMetrics = @{}
    ProcessMetrics = @()
    PerformanceCounters = @{}
}

# CPU Metrics
$cpu = Get-WmiObject -Class Win32_Processor | Select-Object -First 1
$cpuUsage = (Get-WmiObject -Class Win32_PerfRawData_PerfOS_Processor -Filter ""Name='_Total'"").PercentProcessorTime

$performanceInfo.CPUMetrics = @{
    Name = $cpu.Name
    Manufacturer = $cpu.Manufacturer
    MaxClockSpeed = $cpu.MaxClockSpeed
    CurrentClockSpeed = $cpu.CurrentClockSpeed
    NumberOfCores = $cpu.NumberOfCores
    NumberOfLogicalProcessors = $cpu.NumberOfLogicalProcessors
    Architecture = $cpu.Architecture
    Family = $cpu.Family
    Model = $cpu.Model
    Stepping = $cpu.Stepping
    ProcessorId = $cpu.ProcessorId
    L2CacheSize = $cpu.L2CacheSize
    L3CacheSize = $cpu.L3CacheSize
    LoadPercentage = $cpu.LoadPercentage
    ProcessorType = $cpu.ProcessorType
    Role = $cpu.Role
    Status = $cpu.Status
    ThermalState = $cpu.ThermalState
    VoltageCaps = $cpu.VoltageCaps
}

# Memory Metrics
$memory = Get-WmiObject -Class Win32_OperatingSystem
$physicalMemory = Get-WmiObject -Class Win32_PhysicalMemory
$totalPhysicalMemory = ($physicalMemory | Measure-Object -Property Capacity -Sum).Sum

$performanceInfo.MemoryMetrics = @{
    TotalVisibleMemorySize = $memory.TotalVisibleMemorySize
    FreePhysicalMemory = $memory.FreePhysicalMemory
    TotalVirtualMemorySize = $memory.TotalVirtualMemorySize
    FreeVirtualMemory = $memory.FreeVirtualMemory
    TotalSwapSpaceSize = $memory.TotalSwapSpaceSize
    FreeSpaceInPagingFiles = $memory.FreeSpaceInPagingFiles
    SizeStoredInPagingFiles = $memory.SizeStoredInPagingFiles
    TotalPhysicalMemoryBytes = $totalPhysicalMemory
    TotalPhysicalMemoryGB = [Math]::Round($totalPhysicalMemory / 1GB, 2)
    AvailableMemoryMB = [Math]::Round($memory.FreePhysicalMemory / 1KB, 2)
    UsedMemoryMB = [Math]::Round(($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / 1KB, 2)
    MemoryUsagePercentage = [Math]::Round((($memory.TotalVisibleMemorySize - $memory.FreePhysicalMemory) / $memory.TotalVisibleMemorySize) * 100, 2)
    MemoryModules = @()
}

# Memory Module Details
foreach ($module in $physicalMemory) {
    $performanceInfo.MemoryMetrics.MemoryModules += @{
        Capacity = $module.Capacity
        CapacityGB = [Math]::Round($module.Capacity / 1GB, 2)
        Speed = $module.Speed
        Manufacturer = $module.Manufacturer
        PartNumber = $module.PartNumber
        SerialNumber = $module.SerialNumber
        BankLabel = $module.BankLabel
        DeviceLocator = $module.DeviceLocator
        MemoryType = $module.MemoryType
        TypeDetail = $module.TypeDetail
        FormFactor = $module.FormFactor
    }
}

# Disk Metrics
$disks = Get-WmiObject -Class Win32_LogicalDisk
foreach ($disk in $disks) {
    $diskInfo = @{
        DeviceID = $disk.DeviceID
        DriveType = $disk.DriveType
        FileSystem = $disk.FileSystem
        Size = $disk.Size
        SizeGB = if ($disk.Size) { [Math]::Round($disk.Size / 1GB, 2) } else { 0 }
        FreeSpace = $disk.FreeSpace
        FreeSpaceGB = if ($disk.FreeSpace) { [Math]::Round($disk.FreeSpace / 1GB, 2) } else { 0 }
        UsedSpace = if ($disk.Size -and $disk.FreeSpace) { $disk.Size - $disk.FreeSpace } else { 0 }
        UsedSpaceGB = if ($disk.Size -and $disk.FreeSpace) { [Math]::Round(($disk.Size - $disk.FreeSpace) / 1GB, 2) } else { 0 }
        UsagePercentage = if ($disk.Size -and $disk.Size -gt 0) { [Math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 2) } else { 0 }
        VolumeName = $disk.VolumeName
        VolumeSerialNumber = $disk.VolumeSerialNumber
        Description = $disk.Description
    }
    
    # Get physical disk information
    try {
        $physicalDisk = Get-WmiObject -Class Win32_DiskDrive | Where-Object { $_.Index -eq ($disk.DeviceID -replace ':', '') }
        if ($physicalDisk) {
            $diskInfo.PhysicalDisk = @{
                Model = $physicalDisk.Model
                Manufacturer = $physicalDisk.Manufacturer
                SerialNumber = $physicalDisk.SerialNumber
                InterfaceType = $physicalDisk.InterfaceType
                MediaType = $physicalDisk.MediaType
                Size = $physicalDisk.Size
                SizeGB = if ($physicalDisk.Size) { [Math]::Round($physicalDisk.Size / 1GB, 2) } else { 0 }
                Partitions = $physicalDisk.Partitions
                Status = $physicalDisk.Status
            }
        }
    } catch { }
    
    $performanceInfo.DiskMetrics += $diskInfo
}

# Network Metrics
$networkAdapters = Get-WmiObject -Class Win32_NetworkAdapter | Where-Object { $_.PhysicalAdapter -eq $true -and $_.MACAddress -ne $null }
foreach ($adapter in $networkAdapters) {
    $config = Get-WmiObject -Class Win32_NetworkAdapterConfiguration | Where-Object { $_.Index -eq $adapter.Index }
    $perfData = Get-WmiObject -Class Win32_PerfRawData_Tcpip_NetworkInterface | Where-Object { $_.Name -eq $adapter.NetConnectionID }
    
    $networkInfo = @{
        Name = $adapter.Name
        Description = $adapter.Description
        MACAddress = $adapter.MACAddress
        Speed = $adapter.Speed
        SpeedMbps = if ($adapter.Speed) { [Math]::Round($adapter.Speed / 1MB, 2) } else { 0 }
        AdapterType = $adapter.AdapterType
        NetConnectionStatus = $adapter.NetConnectionStatus
        NetConnectionID = $adapter.NetConnectionID
        PhysicalAdapter = $adapter.PhysicalAdapter
    }
    
    if ($config) {
        $networkInfo.IPEnabled = $config.IPEnabled
        $networkInfo.IPAddress = $config.IPAddress
        $networkInfo.DHCPEnabled = $config.DHCPEnabled
    }
    
    if ($perfData) {
        $networkInfo.BytesReceivedPerSec = $perfData.BytesReceivedPerSec
        $networkInfo.BytesSentPerSec = $perfData.BytesSentPerSec
        $networkInfo.BytesTotalPerSec = $perfData.BytesTotalPerSec
        $networkInfo.PacketsReceivedPerSec = $perfData.PacketsReceivedPerSec
        $networkInfo.PacketsSentPerSec = $perfData.PacketsSentPerSec
        $networkInfo.PacketsPerSec = $perfData.PacketsPerSec
    }
    
    $performanceInfo.NetworkMetrics += $networkInfo
}

# System Metrics
$system = Get-WmiObject -Class Win32_OperatingSystem
$computer = Get-WmiObject -Class Win32_ComputerSystem

$uptime = (Get-Date) - [Management.ManagementDateTimeConverter]::ToDateTime($system.LastBootUpTime)

$performanceInfo.SystemMetrics = @{
    LastBootUpTime = [Management.ManagementDateTimeConverter]::ToDateTime($system.LastBootUpTime).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    LocalDateTime = [Management.ManagementDateTimeConverter]::ToDateTime($system.LocalDateTime).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    UptimeDays = [Math]::Round($uptime.TotalDays, 2)
    UptimeHours = [Math]::Round($uptime.TotalHours, 2)
    UptimeMinutes = [Math]::Round($uptime.TotalMinutes, 2)
    NumberOfProcesses = $system.NumberOfProcesses
    NumberOfUsers = $system.NumberOfUsers
    MaxNumberOfProcesses = $system.MaxNumberOfProcesses
    MaxProcessMemorySize = $system.MaxProcessMemorySize
    TotalVisibleMemorySize = $system.TotalVisibleMemorySize
    OperatingSystemSKU = $system.OperatingSystemSKU
    ProductType = $system.ProductType
    ServicePackMajorVersion = $system.ServicePackMajorVersion
    ServicePackMinorVersion = $system.ServicePackMinorVersion
    SuiteMask = $system.SuiteMask
    TotalProcessors = $computer.NumberOfProcessors
    TotalLogicalProcessors = $computer.NumberOfLogicalProcessors
    ThermalState = $computer.ThermalState
    PowerState = $computer.PowerState
    PCSystemType = $computer.PCSystemType
    SystemFamily = $computer.SystemFamily
    SystemSKUNumber = $computer.SystemSKUNumber
}

# Top Processes by CPU and Memory
$topProcesses = Get-Process | Where-Object { $_.CPU -gt 0 } | Sort-Object CPU -Descending | Select-Object -First 10
foreach ($process in $topProcesses) {
    $processInfo = @{
        Name = $process.Name
        Id = $process.Id
        CPU = $process.CPU
        WorkingSet = $process.WorkingSet
        WorkingSetMB = [Math]::Round($process.WorkingSet / 1MB, 2)
        VirtualMemorySize = $process.VirtualMemorySize
        VirtualMemorySizeMB = [Math]::Round($process.VirtualMemorySize / 1MB, 2)
        PagedMemorySize = $process.PagedMemorySize
        PagedMemorySizeMB = [Math]::Round($process.PagedMemorySize / 1MB, 2)
        NonpagedSystemMemorySize = $process.NonpagedSystemMemorySize
        Threads = $process.Threads.Count
        Handles = $process.Handles
        StartTime = if ($process.StartTime) { $process.StartTime.ToString('yyyy-MM-ddTHH:mm:ss.fffZ') } else { $null }
        ProcessorAffinity = $process.ProcessorAffinity
        PriorityClass = $process.PriorityClass.ToString()
    }
    
    $performanceInfo.ProcessMetrics += $processInfo
}

# Performance Counters (Sample)
try {
    $performanceInfo.PerformanceCounters = @{
        ProcessorTime = (Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 1).CounterSamples[0].CookedValue
        AvailableMemoryMB = (Get-Counter '\Memory\Available MBytes' -SampleInterval 1 -MaxSamples 1).CounterSamples[0].CookedValue
        DiskQueueLength = (Get-Counter '\PhysicalDisk(_Total)\Current Disk Queue Length' -SampleInterval 1 -MaxSamples 1).CounterSamples[0].CookedValue
        NetworkBytesTotal = (Get-Counter '\Network Interface(*)\Bytes Total/sec' -SampleInterval 1 -MaxSamples 1).CounterSamples | ForEach-Object { $_.CookedValue } | Measure-Object -Sum | Select-Object -ExpandProperty Sum
        PageFaultsPerSec = (Get-Counter '\Memory\Page Faults/sec' -SampleInterval 1 -MaxSamples 1).CounterSamples[0].CookedValue
        ContextSwitchesPerSec = (Get-Counter '\System\Context Switches/sec' -SampleInterval 1 -MaxSamples 1).CounterSamples[0].CookedValue
        SystemCallsPerSec = (Get-Counter '\System\System Calls/sec' -SampleInterval 1 -MaxSamples 1).CounterSamples[0].CookedValue
    }
} catch { }

# Add metadata
$performanceInfo.DiscoveryTimestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$performanceInfo.ScriptVersion = '1.0.0'
$performanceInfo.ComputerName = $env:COMPUTERNAME
$performanceInfo.SampleDurationSeconds = 1

# Output as JSON
$performanceInfo | ConvertTo-Json -Depth 10
",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "CPUMetrics", "MemoryMetrics", "DiskMetrics", "NetworkMetrics", "SystemMetrics", "ProcessMetrics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "SystemMetrics.UptimeDays" } }
        },
        Tags = new List<string> { "performance", "discovery", "windows", "cpu", "memory", "disk", "network", "processes", "metrics", "monitoring" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };
}
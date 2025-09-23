using Dapper;
using System.Text.Json;
using UEM.Satellite.API.Data;

namespace UEM.Satellite.API.Services;

public class DiscoveryScriptPopulationService
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<DiscoveryScriptPopulationService> _logger;

    public DiscoveryScriptPopulationService(IDbFactory dbFactory, ILogger<DiscoveryScriptPopulationService> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task PopulateDiscoveryScriptsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting population of enterprise discovery scripts...");

        try
        {
            await CreateTableIfNotExistsAsync();
            await ClearExistingStandardScriptsAsync();
            await PopulateWindowsPowerShellScriptsAsync();
            await PopulateLinuxBashScriptsAsync();
            await PopulateMacOSBashScriptsAsync();
            await PopulateCrossPlatformPythonScriptsAsync();
            await PopulateWindowsWMIScriptsAsync();

            _logger.LogInformation("Successfully populated all enterprise discovery scripts");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to populate discovery scripts");
            throw;
        }
    }

    private async Task CreateTableIfNotExistsAsync()
    {
        const string sql = @"
            CREATE TABLE IF NOT EXISTS uem_app_standard_script_templates (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                type TEXT NOT NULL,
                target_os TEXT NOT NULL,
                template TEXT NOT NULL,
                vendor TEXT,
                complexity TEXT,
                estimated_run_time_seconds INTEGER,
                requires_elevation BOOLEAN,
                requires_network BOOLEAN,
                parameters JSONB,
                output_format TEXT,
                output_processing JSONB,
                credential_requirements JSONB,
                tags JSONB,
                industries JSONB,
                compliance_frameworks JSONB,
                version TEXT,
                is_standard BOOLEAN DEFAULT true,
                is_active BOOLEAN DEFAULT true,
                deprecated_at TIMESTAMPTZ,
                usage_count INTEGER DEFAULT 0,
                avg_execution_time REAL,
                success_rate REAL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );";

        using var connection = _dbFactory.Open();
        await connection.ExecuteAsync(sql);
    }

    private async Task ClearExistingStandardScriptsAsync()
    {
        const string sql = "DELETE FROM uem_app_standard_script_templates WHERE is_standard = true;";
        using var connection = _dbFactory.Open();
        await connection.ExecuteAsync(sql);
        _logger.LogInformation("Cleared existing standard discovery scripts");
    }

    private async Task InsertScriptTemplateAsync(DiscoveryScriptTemplate template)
    {
        const string sql = @"
            INSERT INTO uem_app_standard_script_templates (
                name, description, category, type, target_os, template, vendor, complexity,
                estimated_run_time_seconds, requires_elevation, requires_network, parameters,
                output_format, output_processing, credential_requirements, tags, industries,
                compliance_frameworks, version, is_standard, is_active
            ) VALUES (
                @Name, @Description, @Category, @Type, @TargetOS, @Template, @Vendor, @Complexity,
                @EstimatedRunTimeSeconds, @RequiresElevation, @RequiresNetwork, @Parameters,
                @OutputFormat, @OutputProcessing, @CredentialRequirements, @Tags, @Industries,
                @ComplianceFrameworks, @Version, @IsStandard, @IsActive
            );";

        using var connection = _dbFactory.Open();
        await connection.ExecuteAsync(sql, new
        {
            template.Name,
            template.Description,
            template.Category,
            template.Type,
            template.TargetOS,
            template.Template,
            template.Vendor,
            template.Complexity,
            template.EstimatedRunTimeSeconds,
            template.RequiresElevation,
            template.RequiresNetwork,
            Parameters = JsonSerializer.Serialize(template.Parameters),
            template.OutputFormat,
            OutputProcessing = JsonSerializer.Serialize(template.OutputProcessing),
            CredentialRequirements = JsonSerializer.Serialize(template.CredentialRequirements),
            Tags = JsonSerializer.Serialize(template.Tags),
            Industries = JsonSerializer.Serialize(template.Industries),
            ComplianceFrameworks = JsonSerializer.Serialize(template.ComplianceFrameworks),
            template.Version,
            template.IsStandard,
            template.IsActive
        });
    }

    private async Task PopulateWindowsPowerShellScriptsAsync()
    {
        var scripts = new List<DiscoveryScriptTemplate>
        {
            CreateWindowsHardwareDiscoveryScript(),
            CreateWindowsSoftwareDiscoveryScript(),
            CreateWindowsNetworkDiscoveryScript(),
            CreateWindowsSecurityDiscoveryScript(),
            CreateWindowsServicesDiscoveryScript(),
            CreateWindowsProcessDiscoveryScript(),
            CreateWindowsEventLogDiscoveryScript(),
            CreateWindowsRegistryDiscoveryScript(),
            CreateWindowsUserAccountDiscoveryScript(),
            CreateWindowsPerformanceDiscoveryScript()
        };

        foreach (var script in scripts)
        {
            await InsertScriptTemplateAsync(script);
        }

        _logger.LogInformation("Populated {Count} Windows PowerShell discovery scripts", scripts.Count);
    }

    private async Task PopulateLinuxBashScriptsAsync()
    {
        var scripts = new List<DiscoveryScriptTemplate>
        {
            CreateLinuxHardwareDiscoveryScript(),
            CreateLinuxSoftwareDiscoveryScript(),
            CreateLinuxNetworkDiscoveryScript(),
            CreateLinuxSecurityDiscoveryScript(),
            CreateLinuxServicesDiscoveryScript(),
            CreateLinuxProcessDiscoveryScript(),
            CreateLinuxSystemInfoDiscoveryScript(),
            CreateLinuxUserAccountDiscoveryScript(),
            CreateLinuxPerformanceDiscoveryScript(),
            CreateLinuxFilesystemDiscoveryScript()
        };

        foreach (var script in scripts)
        {
            await InsertScriptTemplateAsync(script);
        }

        _logger.LogInformation("Populated {Count} Linux Bash discovery scripts", scripts.Count);
    }

    private async Task PopulateMacOSBashScriptsAsync()
    {
        var scripts = new List<DiscoveryScriptTemplate>
        {
            CreateMacOSHardwareDiscoveryScript(),
            CreateMacOSSoftwareDiscoveryScript(),
            CreateMacOSNetworkDiscoveryScript(),
            CreateMacOSSecurityDiscoveryScript(),
            CreateMacOSServicesDiscoveryScript(),
            CreateMacOSProcessDiscoveryScript(),
            CreateMacOSSystemInfoDiscoveryScript(),
            CreateMacOSUserAccountDiscoveryScript(),
            CreateMacOSPerformanceDiscoveryScript()
        };

        foreach (var script in scripts)
        {
            await InsertScriptTemplateAsync(script);
        }

        _logger.LogInformation("Populated {Count} macOS Bash discovery scripts", scripts.Count);
    }

    private async Task PopulateCrossPlatformPythonScriptsAsync()
    {
        var scripts = new List<DiscoveryScriptTemplate>
        {
            CreatePythonSystemInfoDiscoveryScript(),
            CreatePythonNetworkDiscoveryScript(),
            CreatePythonProcessDiscoveryScript(),
            CreatePythonPerformanceDiscoveryScript(),
            CreatePythonFileSystemDiscoveryScript(),
            CreatePythonUserAccountDiscoveryScript(),
            CreatePythonEnvironmentDiscoveryScript()
        };

        foreach (var script in scripts)
        {
            await InsertScriptTemplateAsync(script);
        }

        _logger.LogInformation("Populated {Count} Cross-platform Python discovery scripts", scripts.Count);
    }

    private async Task PopulateWindowsWMIScriptsAsync()
    {
        var scripts = new List<DiscoveryScriptTemplate>
        {
            CreateWMIHardwareDiscoveryScript(),
            CreateWMISoftwareDiscoveryScript(),
            CreateWMINetworkDiscoveryScript(),
            CreateWMISecurityDiscoveryScript(),
            CreateWMISystemInfoDiscoveryScript(),
            CreateWMIServicesDiscoveryScript(),
            CreateWMIProcessDiscoveryScript(),
            CreateWMIEventLogDiscoveryScript(),
            CreateWMIPerformanceDiscoveryScript(),
            CreateWMIStorageDiscoveryScript()
        };

        foreach (var script in scripts)
        {
            await InsertScriptTemplateAsync(script);
        }

        _logger.LogInformation("Populated {Count} Windows WMI discovery scripts", scripts.Count);
    }

    // Windows PowerShell Scripts
    private DiscoveryScriptTemplate CreateWindowsHardwareDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsHardwareDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsSoftwareDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsSoftwareDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsNetworkDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsNetworkDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsSecurityDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsSecurityDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsServicesDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsServicesDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsProcessDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsProcessDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsEventLogDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsEventLogDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsRegistryDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsRegistryDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsUserAccountDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsUserAccountDiscoveryScript();
    private DiscoveryScriptTemplate CreateWindowsPerformanceDiscoveryScript() => DiscoveryScriptTemplates.CreateWindowsPerformanceDiscoveryScript();
    
    // Linux Bash Scripts
    private DiscoveryScriptTemplate CreateLinuxHardwareDiscoveryScript() => new()
    {
        Name = "Linux Hardware Discovery - Bash",
        Description = "Comprehensive hardware discovery for Linux systems using native commands and /proc filesystem",
        Category = "Hardware Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux Hardware Discovery Script
# Outputs comprehensive hardware information in JSON format

set -e

# Function to safely read from files
safe_read() {
    if [ -r ""$1"" ]; then
        cat ""$1"" 2>/dev/null || echo ""unavailable""
    else
        echo ""unavailable""
    fi
}

# Function to extract value from key=value format
extract_value() {
    echo ""$1"" | cut -d'=' -f2 | tr -d '\"'
}

echo '{'

# CPU Information
echo '""CPU"": {'
if [ -r /proc/cpuinfo ]; then
    CPU_MODEL=$(grep -m1 ""model name"" /proc/cpuinfo | cut -d':' -f2 | sed 's/^[ \t]*//')
    CPU_VENDOR=$(grep -m1 ""vendor_id"" /proc/cpuinfo | cut -d':' -f2 | sed 's/^[ \t]*//')
    CPU_CORES=$(grep -c ^processor /proc/cpuinfo)
    CPU_MHZ=$(grep -m1 ""cpu MHz"" /proc/cpuinfo | cut -d':' -f2 | sed 's/^[ \t]*//')
    CPU_FLAGS=$(grep -m1 ""flags"" /proc/cpuinfo | cut -d':' -f2 | sed 's/^[ \t]*//')
    CPU_CACHE=$(grep -m1 ""cache size"" /proc/cpuinfo | cut -d':' -f2 | sed 's/^[ \t]*//')
    
    echo ""  \""Name\"": \""$CPU_MODEL\"",""
    echo ""  \""Vendor\"": \""$CPU_VENDOR\"",""
    echo ""  \""Cores\"": $CPU_CORES,""
    echo ""  \""CurrentMHz\"": \""$CPU_MHZ\"",""
    echo ""  \""CacheSize\"": \""$CPU_CACHE\"",""
    echo ""  \""Flags\"": \""$CPU_FLAGS\""""
else
    echo '""  \""Error\"": \""Unable to read CPU information\""""'
fi
echo '},'

# Memory Information
echo '""Memory"": {'
if [ -r /proc/meminfo ]; then
    TOTAL_MEM=$(grep ""MemTotal"" /proc/meminfo | awk '{print $2}')
    FREE_MEM=$(grep ""MemFree"" /proc/meminfo | awk '{print $2}')
    AVAILABLE_MEM=$(grep ""MemAvailable"" /proc/meminfo | awk '{print $2}')
    CACHED_MEM=$(grep ""Cached"" /proc/meminfo | head -1 | awk '{print $2}')
    BUFFER_MEM=$(grep ""Buffers"" /proc/meminfo | awk '{print $2}')
    SWAP_TOTAL=$(grep ""SwapTotal"" /proc/meminfo | awk '{print $2}')
    SWAP_FREE=$(grep ""SwapFree"" /proc/meminfo | awk '{print $2}')
    
    TOTAL_GB=$(echo ""scale=2; $TOTAL_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    FREE_GB=$(echo ""scale=2; $FREE_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    AVAILABLE_GB=$(echo ""scale=2; $AVAILABLE_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    
    echo ""  \""TotalKB\"": $TOTAL_MEM,""
    echo ""  \""TotalGB\"": $TOTAL_GB,""
    echo ""  \""FreeKB\"": $FREE_MEM,""
    echo ""  \""FreeGB\"": $FREE_GB,""
    echo ""  \""AvailableKB\"": $AVAILABLE_MEM,""
    echo ""  \""AvailableGB\"": $AVAILABLE_GB,""
    echo ""  \""CachedKB\"": $CACHED_MEM,""
    echo ""  \""BuffersKB\"": $BUFFER_MEM,""
    echo ""  \""SwapTotalKB\"": $SWAP_TOTAL,""
    echo ""  \""SwapFreeKB\"": $SWAP_FREE""
else
    echo '""  \""Error\"": \""Unable to read memory information\""""'
fi
echo '},'

# Disk Information
echo '""Storage"": ['
if command -v lsblk >/dev/null 2>&1; then
    FIRST_DISK=true
    while IFS= read -r line; do
        if [ ""$FIRST_DISK"" = false ]; then
            echo ','
        fi
        FIRST_DISK=false
        
        NAME=$(echo ""$line"" | awk '{print $1}')
        SIZE=$(echo ""$line"" | awk '{print $4}')
        TYPE=$(echo ""$line"" | awk '{print $6}')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $7}')
        
        echo ""    {""
        echo ""      \""Device\"": \""/dev/$NAME\"",""
        echo ""      \""Size\"": \""$SIZE\"",""
        echo ""      \""Type\"": \""$TYPE\"",""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\""""
        echo ""    }""
    done < <(lsblk -rn | grep -E ""^sd|^nvme|^hd"")
fi
echo '],'

# Network Adapters
echo '""NetworkAdapters"": ['
if [ -d /sys/class/net ]; then
    FIRST_ADAPTER=true
    for interface in /sys/class/net/*; do
        if [ ""$FIRST_ADAPTER"" = false ]; then
            echo ','
        fi
        FIRST_ADAPTER=false
        
        IFACE=$(basename ""$interface"")
        if [ ""$IFACE"" != ""lo"" ]; then
            MAC=$(safe_read ""$interface/address"")
            SPEED=$(safe_read ""$interface/speed"")
            STATE=$(safe_read ""$interface/operstate"")
            
            echo ""    {""
            echo ""      \""Interface\"": \""$IFACE\"",""
            echo ""      \""MACAddress\"": \""$MAC\"",""
            echo ""      \""Speed\"": \""$SPEED\"",""
            echo ""      \""State\"": \""$STATE\""""
            echo ""    }""
        fi
    done
fi
echo '],'

# System Information
echo '""System"": {'
HOSTNAME=$(hostname 2>/dev/null || echo ""unknown"")
KERNEL=$(uname -r 2>/dev/null || echo ""unknown"")
ARCH=$(uname -m 2>/dev/null || echo ""unknown"")
OS_RELEASE=""unknown""
if [ -r /etc/os-release ]; then
    OS_RELEASE=$(grep ""PRETTY_NAME"" /etc/os-release | cut -d'=' -f2 | tr -d '""')
fi
UPTIME=$(uptime -s 2>/dev/null || echo ""unknown"")

echo ""  \""Hostname\"": \""$HOSTNAME\"",""
echo ""  \""Kernel\"": \""$KERNEL\"",""
echo ""  \""Architecture\"": \""$ARCH\"",""
echo ""  \""OSRelease\"": \""$OS_RELEASE\"",""
echo ""  \""Uptime\"": \""$UPTIME\""""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "CPU", "Memory", "Storage", "NetworkAdapters", "System" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "Platform" } }
        },
        Tags = new List<string> { "hardware", "discovery", "linux", "cpu", "memory", "storage", "network", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateLinuxSoftwareDiscoveryScript() => new()
    {
        Name = "Linux Software Discovery - Bash",
        Description = "Comprehensive software inventory for Linux systems using package managers and system commands",
        Category = "Software Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 45,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux Software Discovery Script
# Outputs comprehensive software inventory in JSON format

set -e

echo '{'

# Installed Packages
echo '""InstalledPackages"": ['
FIRST_PACKAGE=true

# Detect package manager and get packages
if command -v dpkg >/dev/null 2>&1; then
    # Debian/Ubuntu systems
    while IFS= read -r line; do
        if [ ""$FIRST_PACKAGE"" = false ]; then
            echo ','
        fi
        FIRST_PACKAGE=false
        
        NAME=$(echo ""$line"" | awk '{print $2}')
        VERSION=$(echo ""$line"" | awk '{print $3}')
        DESCRIPTION=$(echo ""$line"" | awk '{print $4}' | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""Name\"": \""$NAME\"",""
        echo ""      \""Version\"": \""$VERSION\"",""
        echo ""      \""Description\"": \""$DESCRIPTION\"",""
        echo ""      \""PackageManager\"": \""dpkg\""""
        echo ""    }""
    done < <(dpkg-query -W -f='${Status} ${Package} ${Version} ${Description}\n' | grep ""^install ok installed"")
elif command -v rpm >/dev/null 2>&1; then
    # Red Hat/CentOS/SUSE systems
    while IFS= read -r line; do
        if [ ""$FIRST_PACKAGE"" = false ]; then
            echo ','
        fi
        FIRST_PACKAGE=false
        
        NAME=$(echo ""$line"" | cut -d' ' -f1)
        VERSION=$(echo ""$line"" | cut -d' ' -f2)
        
        echo ""    {""
        echo ""      \""Name\"": \""$NAME\"",""
        echo ""      \""Version\"": \""$VERSION\"",""
        echo ""      \""PackageManager\"": \""rpm\""""
        echo ""    }""
    done < <(rpm -qa --queryformat '%{NAME} %{VERSION}-%{RELEASE}\n')
elif command -v pacman >/dev/null 2>&1; then
    # Arch Linux systems
    while IFS= read -r line; do
        if [ ""$FIRST_PACKAGE"" = false ]; then
            echo ','
        fi
        FIRST_PACKAGE=false
        
        NAME=$(echo ""$line"" | awk '{print $1}')
        VERSION=$(echo ""$line"" | awk '{print $2}')
        
        echo ""    {""
        echo ""      \""Name\"": \""$NAME\"",""
        echo ""      \""Version\"": \""$VERSION\"",""
        echo ""      \""PackageManager\"": \""pacman\""""
        echo ""    }""
    done < <(pacman -Q)
fi
echo '],'

# Services
echo '""Services"": ['
FIRST_SERVICE=true
if command -v systemctl >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_SERVICE"" = false ]; then
            echo ','
        fi
        FIRST_SERVICE=false
        
        UNIT=$(echo ""$line"" | awk '{print $1}')
        LOAD=$(echo ""$line"" | awk '{print $2}')
        ACTIVE=$(echo ""$line"" | awk '{print $3}')
        SUB=$(echo ""$line"" | awk '{print $4}')
        DESCRIPTION=$(echo ""$line"" | cut -d' ' -f5- | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""Unit\"": \""$UNIT\"",""
        echo ""      \""Load\"": \""$LOAD\"",""
        echo ""      \""Active\"": \""$ACTIVE\"",""
        echo ""      \""Sub\"": \""$SUB\"",""
        echo ""      \""Description\"": \""$DESCRIPTION\""""
        echo ""    }""
    done < <(systemctl list-units --type=service --no-pager --no-legend)
fi
echo '],'

# Kernel Modules
echo '""KernelModules"": ['
FIRST_MODULE=true
if [ -r /proc/modules ]; then
    while IFS= read -r line; do
        if [ ""$FIRST_MODULE"" = false ]; then
            echo ','
        fi
        FIRST_MODULE=false
        
        MODULE_NAME=$(echo ""$line"" | awk '{print $1}')
        MODULE_SIZE=$(echo ""$line"" | awk '{print $2}')
        USED_COUNT=$(echo ""$line"" | awk '{print $3}')
        
        echo ""    {""
        echo ""      \""Name\"": \""$MODULE_NAME\"",""
        echo ""      \""Size\"": $MODULE_SIZE,""
        echo ""      \""UsedCount\"": $USED_COUNT""
        echo ""    }""
    done < /proc/modules
fi
echo '],'

# System Information
KERNEL_VERSION=$(uname -r)
OS_INFO=""unknown""
if [ -r /etc/os-release ]; then
    OS_INFO=$(grep ""PRETTY_NAME"" /etc/os-release | cut -d'=' -f2 | tr -d '""')
fi

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux"",'
echo '""KernelVersion"": ""'$KERNEL_VERSION'"",""OSInfo"": ""'$OS_INFO'""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "InstalledPackages", "Services", "KernelModules" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "Platform" } }
        },
        Tags = new List<string> { "software", "discovery", "linux", "packages", "services", "modules", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateLinuxNetworkDiscoveryScript() => new()
    {
        Name = "Linux Network Discovery - Bash",
        Description = "Comprehensive network discovery for Linux systems including interfaces, routing, and connections",
        Category = "Network Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux Network Discovery Script
# Outputs comprehensive network information in JSON format

set -e

echo '{'

# Network Interfaces
echo '""NetworkInterfaces"": ['
FIRST_INTERFACE=true
if [ -d /sys/class/net ]; then
    for interface in /sys/class/net/*; do
        IFACE=$(basename ""$interface"")
        
        if [ ""$FIRST_INTERFACE"" = false ]; then
            echo ','
        fi
        FIRST_INTERFACE=false
        
        MAC=$(cat ""$interface/address"" 2>/dev/null || echo ""unknown"")
        SPEED=$(cat ""$interface/speed"" 2>/dev/null || echo ""unknown"")
        STATE=$(cat ""$interface/operstate"" 2>/dev/null || echo ""unknown"")
        MTU=$(cat ""$interface/mtu"" 2>/dev/null || echo ""unknown"")
        
        # Get IP addresses using ip command
        IP_ADDRESSES=""""
        if command -v ip >/dev/null 2>&1; then
            IP_ADDRESSES=$(ip addr show ""$IFACE"" 2>/dev/null | grep -oP 'inet \K[^/]+' | tr '\n' ',' | sed 's/,$//')
        fi
        
        echo ""    {""
        echo ""      \""Interface\"": \""$IFACE\"",""
        echo ""      \""MACAddress\"": \""$MAC\"",""
        echo ""      \""Speed\"": \""$SPEED\"",""
        echo ""      \""State\"": \""$STATE\"",""
        echo ""      \""MTU\"": \""$MTU\"",""
        echo ""      \""IPAddresses\"": \""$IP_ADDRESSES\""""
        echo ""    }""
    done
fi
echo '],'

# Routing Table
echo '""RoutingTable"": ['
FIRST_ROUTE=true
if command -v ip >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_ROUTE"" = false ]; then
            echo ','
        fi
        FIRST_ROUTE=false
        
        DESTINATION=$(echo ""$line"" | awk '{print $1}')
        GATEWAY=$(echo ""$line"" | awk '{print $3}')
        INTERFACE=$(echo ""$line"" | awk '{print $5}')
        
        echo ""    {""
        echo ""      \""Destination\"": \""$DESTINATION\"",""
        echo ""      \""Gateway\"": \""$GATEWAY\"",""
        echo ""      \""Interface\"": \""$INTERFACE\""""
        echo ""    }""
    done < <(ip route show | grep -v ""linkdown"")
fi
echo '],'

# Active Connections
echo '""ActiveConnections"": ['
FIRST_CONNECTION=true
if command -v ss >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_CONNECTION"" = false ]; then
            echo ','
        fi
        FIRST_CONNECTION=false
        
        PROTOCOL=$(echo ""$line"" | awk '{print $1}')
        STATE=$(echo ""$line"" | awk '{print $2}')
        LOCAL=$(echo ""$line"" | awk '{print $5}')
        REMOTE=$(echo ""$line"" | awk '{print $6}')
        
        echo ""    {""
        echo ""      \""Protocol\"": \""$PROTOCOL\"",""
        echo ""      \""State\"": \""$STATE\"",""
        echo ""      \""LocalAddress\"": \""$LOCAL\"",""
        echo ""      \""RemoteAddress\"": \""$REMOTE\""""
        echo ""    }""
    done < <(ss -tuln | tail -n +2)
elif command -v netstat >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_CONNECTION"" = false ]; then
            echo ','
        fi
        FIRST_CONNECTION=false
        
        PROTOCOL=$(echo ""$line"" | awk '{print $1}')
        LOCAL=$(echo ""$line"" | awk '{print $4}')
        REMOTE=$(echo ""$line"" | awk '{print $5}')
        STATE=$(echo ""$line"" | awk '{print $6}')
        
        echo ""    {""
        echo ""      \""Protocol\"": \""$PROTOCOL\"",""
        echo ""      \""LocalAddress\"": \""$LOCAL\"",""
        echo ""      \""RemoteAddress\"": \""$REMOTE\"",""
        echo ""      \""State\"": \""$STATE\""""
        echo ""    }""
    done < <(netstat -tuln | tail -n +3)
fi
echo '],'

# DNS Configuration
echo '""DNSConfiguration"": {'
if [ -r /etc/resolv.conf ]; then
    NAMESERVERS=$(grep ""^nameserver"" /etc/resolv.conf | awk '{print $2}' | tr '\n' ',' | sed 's/,$//')
    SEARCH_DOMAINS=$(grep ""^search"" /etc/resolv.conf | cut -d' ' -f2- | tr ' ' ',' | tr '\n' ',' | sed 's/,$//')
    
    echo ""  \""Nameservers\"": \""$NAMESERVERS\"",""
    echo ""  \""SearchDomains\"": \""$SEARCH_DOMAINS\""""
else
    echo '""  \""Error\"": \""Unable to read DNS configuration\""""'
fi
echo '},'

# Network Statistics
HOSTNAME=$(hostname 2>/dev/null || echo ""unknown"")
DOMAIN=$(hostname -d 2>/dev/null || echo ""unknown"")

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$HOSTNAME'"",""Domain"": ""'$DOMAIN'"",""Platform"": ""Linux""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "NetworkInterfaces", "RoutingTable", "ActiveConnections", "DNSConfiguration" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "Platform" } }
        },
        Tags = new List<string> { "network", "discovery", "linux", "interfaces", "routing", "connections", "dns", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateLinuxSecurityDiscoveryScript() => new()
    {
        Name = "Linux Security Discovery - Bash",
        Description = "Comprehensive security discovery for Linux systems including firewall, users, and security configurations",
        Category = "Security Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = true,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux Security Discovery Script
# Outputs comprehensive security information in JSON format
# Requires elevated privileges for complete security assessment

set -e

echo '{'

# Firewall Status
echo '""FirewallStatus"": {'
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(ufw status 2>/dev/null | head -1 | awk '{print $2}')
    echo ""  \""Type\"": \""ufw\"",""
    echo ""  \""Status\"": \""$UFW_STATUS\""""
elif command -v firewall-cmd >/dev/null 2>&1; then
    FIREWALLD_STATUS=$(systemctl is-active firewalld 2>/dev/null || echo ""inactive"")
    echo ""  \""Type\"": \""firewalld\"",""
    echo ""  \""Status\"": \""$FIREWALLD_STATUS\""""
elif command -v iptables >/dev/null 2>&1; then
    IPTABLES_RULES=$(iptables -L 2>/dev/null | wc -l)
    echo ""  \""Type\"": \""iptables\"",""
    echo ""  \""RuleCount\"": $IPTABLES_RULES""
else
    echo '""  \""Type\"": \""unknown\"", \""Status\"": \""unknown\""""'
fi
echo '},'

# SELinux Status
echo '""SELinuxStatus"": {'
if command -v sestatus >/dev/null 2>&1; then
    SELINUX_STATUS=$(sestatus 2>/dev/null | grep ""SELinux status"" | awk '{print $3}')
    SELINUX_MODE=$(sestatus 2>/dev/null | grep ""Current mode"" | awk '{print $3}')
    echo ""  \""Status\"": \""$SELINUX_STATUS\"",""
    echo ""  \""Mode\"": \""$SELINUX_MODE\""""
else
    echo '""  \""Status\"": \""not_available\"", \""Mode\"": \""not_available\""""'
fi
echo '},'

# User Accounts
echo '""UserAccounts"": ['
FIRST_USER=true
while IFS=: read -r username _ uid gid _ home shell; do
    if [ ""$FIRST_USER"" = false ]; then
        echo ','
    fi
    FIRST_USER=false
    
    # Check if user can login (shell is not /bin/false or /usr/sbin/nologin)
    CAN_LOGIN=""false""
    if [[ ""$shell"" != ""/bin/false"" && ""$shell"" != ""/usr/sbin/nologin"" && ""$shell"" != ""/sbin/nologin"" ]]; then
        CAN_LOGIN=""true""
    fi
    
    echo ""    {""
    echo ""      \""Username\"": \""$username\"",""
    echo ""      \""UID\"": $uid,""
    echo ""      \""GID\"": $gid,""
    echo ""      \""HomeDirectory\"": \""$home\"",""
    echo ""      \""Shell\"": \""$shell\"",""
    echo ""      \""CanLogin\"": $CAN_LOGIN""
    echo ""    }""
done < /etc/passwd
echo '],'

# Groups
echo '""Groups"": ['
FIRST_GROUP=true
while IFS=: read -r groupname _ gid members; do
    if [ ""$FIRST_GROUP"" = false ]; then
        echo ','
    fi
    FIRST_GROUP=false
    
    echo ""    {""
    echo ""      \""GroupName\"": \""$groupname\"",""
    echo ""      \""GID\"": $gid,""
    echo ""      \""Members\"": \""$members\""""
    echo ""    }""
done < /etc/group
echo '],'

# Sudo Configuration
echo '""SudoConfiguration"": ['
FIRST_SUDO=true
if [ -r /etc/sudoers ]; then
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ ""$line"" =~ ^[[:space:]]*# ]] || [[ -z ""$line"" ]]; then
            continue
        fi
        
        # Look for user privilege specifications
        if [[ ""$line"" =~ ^[^[:space:]]+[[:space:]]+[^[:space:]]+=[^[:space:]]+ ]]; then
            if [ ""$FIRST_SUDO"" = false ]; then
                echo ','
            fi
            FIRST_SUDO=false
            
            USER=$(echo ""$line"" | awk '{print $1}')
            HOSTS=$(echo ""$line"" | awk -F'=' '{print $1}' | awk '{print $2}')
            COMMANDS=$(echo ""$line"" | awk -F'=' '{print $2}')
            
            echo ""    {""
            echo ""      \""User\"": \""$USER\"",""
            echo ""      \""Hosts\"": \""$HOSTS\"",""
            echo ""      \""Commands\"": \""$COMMANDS\""""
            echo ""    }""
        fi
    done < /etc/sudoers
fi
echo '],'

# SSH Configuration
echo '""SSHConfiguration"": {'
if [ -r /etc/ssh/sshd_config ]; then
    SSH_PORT=$(grep ""^Port"" /etc/ssh/sshd_config | awk '{print $2}' || echo ""22"")
    ROOT_LOGIN=$(grep ""^PermitRootLogin"" /etc/ssh/sshd_config | awk '{print $2}' || echo ""unknown"")
    PASSWORD_AUTH=$(grep ""^PasswordAuthentication"" /etc/ssh/sshd_config | awk '{print $2}' || echo ""unknown"")
    PUBKEY_AUTH=$(grep ""^PubkeyAuthentication"" /etc/ssh/sshd_config | awk '{print $2}' || echo ""unknown"")
    
    echo ""  \""Port\"": \""$SSH_PORT\"",""
    echo ""  \""PermitRootLogin\"": \""$ROOT_LOGIN\"",""
    echo ""  \""PasswordAuthentication\"": \""$PASSWORD_AUTH\"",""
    echo ""  \""PubkeyAuthentication\"": \""$PUBKEY_AUTH\""""
else
    echo '""  \""Error\"": \""Unable to read SSH configuration\""""'
fi
echo '},'

# Running Processes with root privileges
echo '""RootProcesses"": ['
FIRST_PROC=true
if command -v ps >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_PROC"" = false ]; then
            echo ','
        fi
        FIRST_PROC=false
        
        PID=$(echo ""$line"" | awk '{print $1}')
        CMD=$(echo ""$line"" | awk '{print $8}' | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""PID\"": $PID,""
        echo ""      \""Command\"": \""$CMD\""""
        echo ""    }""
    done < <(ps aux | grep ""^root"" | head -20)
fi
echo '],'

# System Uptime and Load
UPTIME_INFO=$(uptime | sed 's/,//g')
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | sed 's/^ *//')

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux"",'
echo '""UptimeInfo"": ""'$UPTIME_INFO'"",""LoadAverage"": ""'$LOAD_AVG'"",""RequiredElevation"": true'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "FirewallStatus", "SELinuxStatus", "UserAccounts", "Groups", "SSHConfiguration" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "RequiredElevation" } }
        },
        Tags = new List<string> { "security", "discovery", "linux", "firewall", "selinux", "users", "ssh", "sudo", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS" }
    };

    private DiscoveryScriptTemplate CreateLinuxServicesDiscoveryScript() => new()
    {
        Name = "Linux Services Discovery - Bash",
        Description = "Comprehensive discovery of Linux services and daemons using systemctl and service commands",
        Category = "Services Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux Services Discovery Script
# Outputs comprehensive service information in JSON format

set -e

echo '{'

# Systemd Services
echo '""SystemdServices"": ['
FIRST_SERVICE=true
if command -v systemctl >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_SERVICE"" = false ]; then
            echo ','
        fi
        FIRST_SERVICE=false
        
        UNIT=$(echo ""$line"" | awk '{print $1}')
        LOAD=$(echo ""$line"" | awk '{print $2}')
        ACTIVE=$(echo ""$line"" | awk '{print $3}')
        SUB=$(echo ""$line"" | awk '{print $4}')
        DESCRIPTION=$(echo ""$line"" | cut -d' ' -f5- | sed 's/""/\\\\""/g')
        
        # Get additional service information
        ENABLED=""unknown""
        if systemctl is-enabled ""$UNIT"" >/dev/null 2>&1; then
            ENABLED=$(systemctl is-enabled ""$UNIT"" 2>/dev/null || echo ""unknown"")
        fi
        
        echo ""    {""
        echo ""      \""Unit\"": \""$UNIT\"",""
        echo ""      \""Load\"": \""$LOAD\"",""
        echo ""      \""Active\"": \""$ACTIVE\"",""
        echo ""      \""Sub\"": \""$SUB\"",""
        echo ""      \""Enabled\"": \""$ENABLED\"",""
        echo ""      \""Description\"": \""$DESCRIPTION\""""
        echo ""    }""
    done < <(systemctl list-units --type=service --no-pager --no-legend --all)
fi
echo '],'

# Running Processes (Top 20 by CPU)
echo '""RunningProcesses"": ['
FIRST_PROCESS=true
if command -v ps >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_PROCESS"" = false ]; then
            echo ','
        fi
        FIRST_PROCESS=false
        
        PID=$(echo ""$line"" | awk '{print $2}')
        CPU=$(echo ""$line"" | awk '{print $3}')
        MEM=$(echo ""$line"" | awk '{print $4}')
        USER=$(echo ""$line"" | awk '{print $1}')
        COMMAND=$(echo ""$line"" | awk '{print $11}' | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""PID\"": $PID,""
        echo ""      \""User\"": \""$USER\"",""
        echo ""      \""CPUPercent\"": \""$CPU\"",""
        echo ""      \""MemoryPercent\"": \""$MEM\"",""
        echo ""      \""Command\"": \""$COMMAND\""""
        echo ""    }""
    done < <(ps aux --sort=-%cpu | head -21 | tail -20)
fi
echo '],'

# Cron Jobs
echo '""CronJobs"": ['
FIRST_CRON=true

# System cron jobs
if [ -r /etc/crontab ]; then
    while IFS= read -r line; do
        # Skip comments and empty lines
        if [[ ""$line"" =~ ^[[:space:]]*# ]] || [[ -z ""$line"" ]] || [[ ""$line"" =~ ^[[:space:]]*$ ]]; then
            continue
        fi
        
        # Skip variable definitions
        if [[ ""$line"" =~ ^[A-Z_]+=.* ]]; then
            continue
        fi
        
        if [ ""$FIRST_CRON"" = false ]; then
            echo ','
        fi
        FIRST_CRON=false
        
        SCHEDULE=$(echo ""$line"" | awk '{print $1"" ""$2"" ""$3"" ""$4"" ""$5}')
        USER=$(echo ""$line"" | awk '{print $6}')
        COMMAND=$(echo ""$line"" | cut -d' ' -f7- | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""Type\"": \""system\"",""
        echo ""      \""Schedule\"": \""$SCHEDULE\"",""
        echo ""      \""User\"": \""$USER\"",""
        echo ""      \""Command\"": \""$COMMAND\""""
        echo ""    }""
    done < /etc/crontab
fi

# User cron jobs
if command -v crontab >/dev/null 2>&1; then
    CURRENT_USER_CRON=$(crontab -l 2>/dev/null || echo """")
    if [ -n ""$CURRENT_USER_CRON"" ]; then
        while IFS= read -r line; do
            # Skip comments and empty lines
            if [[ ""$line"" =~ ^[[:space:]]*# ]] || [[ -z ""$line"" ]]; then
                continue
            fi
            
            if [ ""$FIRST_CRON"" = false ]; then
                echo ','
            fi
            FIRST_CRON=false
            
            SCHEDULE=$(echo ""$line"" | awk '{print $1"" ""$2"" ""$3"" ""$4"" ""$5}')
            COMMAND=$(echo ""$line"" | cut -d' ' -f6- | sed 's/""/\\\\""/g')
            
            echo ""    {""
            echo ""      \""Type\"": \""user\"",""
            echo ""      \""Schedule\"": \""$SCHEDULE\"",""
            echo ""      \""User\"": ""$(whoami)\"",""
            echo ""      \""Command\"": \""$COMMAND\""""
            echo ""    }""
        done <<< ""$CURRENT_USER_CRON""
    fi
fi
echo '],'

# Listening Ports
echo '""ListeningPorts"": ['
FIRST_PORT=true
if command -v ss >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_PORT"" = false ]; then
            echo ','
        fi
        FIRST_PORT=false
        
        PROTOCOL=$(echo ""$line"" | awk '{print $1}')
        STATE=$(echo ""$line"" | awk '{print $2}')
        LOCAL=$(echo ""$line"" | awk '{print $5}')
        PROCESS=$(echo ""$line"" | awk '{print $7}' | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""Protocol\"": \""$PROTOCOL\"",""
        echo ""      \""State\"": \""$STATE\"",""
        echo ""      \""LocalAddress\"": \""$LOCAL\"",""
        echo ""      \""Process\"": \""$PROCESS\""""
        echo ""    }""
    done < <(ss -tulnp | grep LISTEN)
elif command -v netstat >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_PORT"" = false ]; then
            echo ','
        fi
        FIRST_PORT=false
        
        PROTOCOL=$(echo ""$line"" | awk '{print $1}')
        LOCAL=$(echo ""$line"" | awk '{print $4}')
        STATE=$(echo ""$line"" | awk '{print $6}')
        PROCESS=$(echo ""$line"" | awk '{print $7}' | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""Protocol\"": \""$PROTOCOL\"",""
        echo ""      \""LocalAddress\"": \""$LOCAL\"",""
        echo ""      \""State\"": \""$STATE\"",""
        echo ""      \""Process\"": \""$PROCESS\""""
        echo ""    }""
    done < <(netstat -tulnp | grep LISTEN)
fi
echo '],'

# Service Statistics
TOTAL_SERVICES=0
ACTIVE_SERVICES=0
FAILED_SERVICES=0

if command -v systemctl >/dev/null 2>&1; then
    TOTAL_SERVICES=$(systemctl list-units --type=service --no-pager --no-legend --all | wc -l)
    ACTIVE_SERVICES=$(systemctl list-units --type=service --no-pager --no-legend --state=active | wc -l)
    FAILED_SERVICES=$(systemctl list-units --type=service --no-pager --no-legend --state=failed | wc -l)
fi

echo '""ServiceStatistics"": {'
echo ""  \""TotalServices\"": $TOTAL_SERVICES,""
echo ""  \""ActiveServices\"": $ACTIVE_SERVICES,""
echo ""  \""FailedServices\"": $FAILED_SERVICES""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "SystemdServices", "RunningProcesses", "CronJobs", "ListeningPorts", "ServiceStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "ServiceStatistics.TotalServices" } }
        },
        Tags = new List<string> { "services", "discovery", "linux", "systemd", "processes", "cron", "ports", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateLinuxProcessDiscoveryScript() => new()
    {
        Name = "Linux Process Discovery - Bash",
        Description = "Comprehensive discovery of running processes including resource usage and process hierarchy",
        Category = "Process Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux Process Discovery Script
# Outputs comprehensive process information in JSON format

set -e

echo '{'

# Running Processes (detailed)
echo '""RunningProcesses"": ['
FIRST_PROCESS=true
if command -v ps >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_PROCESS"" = false ]; then
            echo ','
        fi
        FIRST_PROCESS=false
        
        USER=$(echo ""$line"" | awk '{print $1}')
        PID=$(echo ""$line"" | awk '{print $2}')
        PPID=$(echo ""$line"" | awk '{print $3}')
        CPU=$(echo ""$line"" | awk '{print $4}')
        MEM=$(echo ""$line"" | awk '{print $5}')
        VSZ=$(echo ""$line"" | awk '{print $6}')
        RSS=$(echo ""$line"" | awk '{print $7}')
        TTY=$(echo ""$line"" | awk '{print $8}')
        STAT=$(echo ""$line"" | awk '{print $9}')
        START=$(echo ""$line"" | awk '{print $10}')
        TIME=$(echo ""$line"" | awk '{print $11}')
        COMMAND=$(echo ""$line"" | cut -d' ' -f12- | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""User\"": \""$USER\"",""
        echo ""      \""PID\"": $PID,""
        echo ""      \""PPID\"": $PPID,""
        echo ""      \""CPUPercent\"": \""$CPU\"",""
        echo ""      \""MemoryPercent\"": \""$MEM\"",""
        echo ""      \""VirtualSizeKB\"": $VSZ,""
        echo ""      \""ResidentSizeKB\"": $RSS,""
        echo ""      \""TTY\"": \""$TTY\"",""
        echo ""      \""Status\"": \""$STAT\"",""
        echo ""      \""StartTime\"": \""$START\"",""
        echo ""      \""CPUTime\"": \""$TIME\"",""
        echo ""      \""Command\"": \""$COMMAND\""""
        echo ""    }""
    done < <(ps aux --sort=-%cpu | head -51 | tail -50)
fi
echo '],'

# Process Tree (top-level processes)
echo '""ProcessTree"": ['
FIRST_TREE=true
if command -v ps >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_TREE"" = false ]; then
            echo ','
        fi
        FIRST_TREE=false
        
        PID=$(echo ""$line"" | awk '{print $1}')
        PPID=$(echo ""$line"" | awk '{print $2}')
        COMMAND=$(echo ""$line"" | awk '{print $3}' | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""PID\"": $PID,""
        echo ""      \""PPID\"": $PPID,""
        echo ""      \""Command\"": \""$COMMAND\""""
        echo ""    }""
    done < <(ps -eo pid,ppid,comm --no-headers | head -30)
fi
echo '],'

# Memory Usage by Process
echo '""MemoryUsage"": ['
FIRST_MEM=true
if command -v ps >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_MEM"" = false ]; then
            echo ','
        fi
        FIRST_MEM=false
        
        PID=$(echo ""$line"" | awk '{print $1}')
        RSS=$(echo ""$line"" | awk '{print $2}')
        VSZ=$(echo ""$line"" | awk '{print $3}')
        COMMAND=$(echo ""$line"" | awk '{print $4}' | sed 's/""/\\\\""/g')
        
        RSS_MB=$(echo ""scale=2; $RSS/1024"" | bc 2>/dev/null || echo ""0"")
        VSZ_MB=$(echo ""scale=2; $VSZ/1024"" | bc 2>/dev/null || echo ""0"")
        
        echo ""    {""
        echo ""      \""PID\"": $PID,""
        echo ""      \""ResidentSizeKB\"": $RSS,""
        echo ""      \""ResidentSizeMB\"": $RSS_MB,""
        echo ""      \""VirtualSizeKB\"": $VSZ,""
        echo ""      \""VirtualSizeMB\"": $VSZ_MB,""
        echo ""      \""Command\"": \""$COMMAND\""""
        echo ""    }""
    done < <(ps aux --sort=-rss | awk '{print $2,$6,$5,$11}' | head -21 | tail -20)
fi
echo '],'

# System Load and Statistics
echo '""SystemLoad"": {'
if [ -r /proc/loadavg ]; then
    LOAD_AVG=$(cat /proc/loadavg)
    LOAD_1MIN=$(echo ""$LOAD_AVG"" | awk '{print $1}')
    LOAD_5MIN=$(echo ""$LOAD_AVG"" | awk '{print $2}')
    LOAD_15MIN=$(echo ""$LOAD_AVG"" | awk '{print $3}')
    RUNNING_PROCS=$(echo ""$LOAD_AVG"" | awk '{print $4}' | cut -d'/' -f1)
    TOTAL_PROCS=$(echo ""$LOAD_AVG"" | awk '{print $4}' | cut -d'/' -f2)
    
    echo ""  \""Load1Min\"": $LOAD_1MIN,""
    echo ""  \""Load5Min\"": $LOAD_5MIN,""
    echo ""  \""Load15Min\"": $LOAD_15MIN,""
    echo ""  \""RunningProcesses\"": $RUNNING_PROCS,""
    echo ""  \""TotalProcesses\"": $TOTAL_PROCS""
else
    echo '""  \""Error\"": \""Unable to read load average\""""'
fi
echo '},'

# CPU Information from /proc/stat
echo '""CPUStats"": {'
if [ -r /proc/stat ]; then
    CPU_LINE=$(grep ""^cpu "" /proc/stat)
    USER_TIME=$(echo ""$CPU_LINE"" | awk '{print $2}')
    NICE_TIME=$(echo ""$CPU_LINE"" | awk '{print $3}')
    SYSTEM_TIME=$(echo ""$CPU_LINE"" | awk '{print $4}')
    IDLE_TIME=$(echo ""$CPU_LINE"" | awk '{print $5}')
    IOWAIT_TIME=$(echo ""$CPU_LINE"" | awk '{print $6}')
    
    echo ""  \""UserTime\"": $USER_TIME,""
    echo ""  \""NiceTime\"": $NICE_TIME,""
    echo ""  \""SystemTime\"": $SYSTEM_TIME,""
    echo ""  \""IdleTime\"": $IDLE_TIME,""
    echo ""  \""IOWaitTime\"": $IOWAIT_TIME""
else
    echo '""  \""Error\"": \""Unable to read CPU statistics\""""'
fi
echo '},'

# Memory Statistics
echo '""MemoryStats"": {'
if [ -r /proc/meminfo ]; then
    TOTAL_MEM=$(grep ""MemTotal"" /proc/meminfo | awk '{print $2}')
    FREE_MEM=$(grep ""MemFree"" /proc/meminfo | awk '{print $2}')
    AVAILABLE_MEM=$(grep ""MemAvailable"" /proc/meminfo | awk '{print $2}')
    CACHED_MEM=$(grep ""^Cached"" /proc/meminfo | awk '{print $2}')
    BUFFER_MEM=$(grep ""Buffers"" /proc/meminfo | awk '{print $2}')
    
    TOTAL_GB=$(echo ""scale=2; $TOTAL_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    USED_MEM=$((TOTAL_MEM - AVAILABLE_MEM))
    USED_GB=$(echo ""scale=2; $USED_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    
    echo ""  \""TotalKB\"": $TOTAL_MEM,""
    echo ""  \""TotalGB\"": $TOTAL_GB,""
    echo ""  \""UsedKB\"": $USED_MEM,""
    echo ""  \""UsedGB\"": $USED_GB,""
    echo ""  \""FreeKB\"": $FREE_MEM,""
    echo ""  \""AvailableKB\"": $AVAILABLE_MEM,""
    echo ""  \""CachedKB\"": $CACHED_MEM,""
    echo ""  \""BuffersKB\"": $BUFFER_MEM""
else
    echo '""  \""Error\"": \""Unable to read memory statistics\""""'
fi
echo '},'

# Process Statistics
TOTAL_PROCESSES=$(ps aux | wc -l)
USER_PROCESSES=$(ps aux | grep -v ""^root"" | wc -l)
ROOT_PROCESSES=$(ps aux | grep ""^root"" | wc -l)

echo '""ProcessStatistics"": {'
echo ""  \""TotalProcesses\"": $TOTAL_PROCESSES,""
echo ""  \""UserProcesses\"": $USER_PROCESSES,""
echo ""  \""RootProcesses\"": $ROOT_PROCESSES""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "RunningProcesses", "ProcessTree", "MemoryUsage", "SystemLoad", "ProcessStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "ProcessStatistics.TotalProcesses" } }
        },
        Tags = new List<string> { "processes", "discovery", "linux", "memory", "cpu", "performance", "load", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateLinuxSystemInfoDiscoveryScript() => new()
    {
        Name = "Linux System Information Discovery - Bash",
        Description = "Comprehensive system information discovery for Linux including OS details, kernel, and environment",
        Category = "System Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 20,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux System Information Discovery Script
# Outputs comprehensive system information in JSON format

set -e

echo '{'

# Operating System Information
echo '""OperatingSystem"": {'
if [ -r /etc/os-release ]; then
    while IFS='=' read -r key value; do
        case ""$key"" in
            ""NAME"") OS_NAME=$(echo ""$value"" | tr -d '""') ;;
            ""VERSION"") OS_VERSION=$(echo ""$value"" | tr -d '""') ;;
            ""ID"") OS_ID=$(echo ""$value"" | tr -d '""') ;;
            ""VERSION_ID"") OS_VERSION_ID=$(echo ""$value"" | tr -d '""') ;;
            ""PRETTY_NAME"") OS_PRETTY_NAME=$(echo ""$value"" | tr -d '""') ;;
            ""VERSION_CODENAME"") OS_CODENAME=$(echo ""$value"" | tr -d '""') ;;
        esac
    done < /etc/os-release
    
    echo ""  \""Name\"": \""${OS_NAME:-unknown}\"",""
    echo ""  \""Version\"": \""${OS_VERSION:-unknown}\"",""
    echo ""  \""ID\"": \""${OS_ID:-unknown}\"",""
    echo ""  \""VersionID\"": \""${OS_VERSION_ID:-unknown}\"",""
    echo ""  \""PrettyName\"": \""${OS_PRETTY_NAME:-unknown}\"",""
    echo ""  \""Codename\"": \""${OS_CODENAME:-unknown}\""""
else
    echo '""  \""Error\"": \""Unable to read OS information\""""'
fi
echo '},'

# Kernel Information
echo '""Kernel"": {'
KERNEL_VERSION=$(uname -r)
KERNEL_NAME=$(uname -s)
ARCHITECTURE=$(uname -m)
PROCESSOR=$(uname -p 2>/dev/null || echo ""unknown"")

echo ""  \""Name\"": \""$KERNEL_NAME\"",""
echo ""  \""Version\"": \""$KERNEL_VERSION\"",""
echo ""  \""Architecture\"": \""$ARCHITECTURE\"",""
echo ""  \""Processor\"": \""$PROCESSOR\""""
echo '},'

# Hardware Information
echo '""Hardware"": {'
HOSTNAME=$(hostname)
DOMAIN=$(hostname -d 2>/dev/null || echo ""unknown"")

# Get system information from DMI if available
MANUFACTURER=""unknown""
PRODUCT_NAME=""unknown""
SERIAL_NUMBER=""unknown""
if [ -r /sys/class/dmi/id/sys_vendor ]; then
    MANUFACTURER=$(cat /sys/class/dmi/id/sys_vendor 2>/dev/null || echo ""unknown"")
fi
if [ -r /sys/class/dmi/id/product_name ]; then
    PRODUCT_NAME=$(cat /sys/class/dmi/id/product_name 2>/dev/null || echo ""unknown"")
fi
if [ -r /sys/class/dmi/id/product_serial ]; then
    SERIAL_NUMBER=$(cat /sys/class/dmi/id/product_serial 2>/dev/null || echo ""unknown"")
fi

echo ""  \""Hostname\"": \""$HOSTNAME\"",""
echo ""  \""Domain\"": \""$DOMAIN\"",""
echo ""  \""Manufacturer\"": \""$MANUFACTURER\"",""
echo ""  \""ProductName\"": \""$PRODUCT_NAME\"",""
echo ""  \""SerialNumber\"": \""$SERIAL_NUMBER\""""
echo '},'

# System Uptime and Boot Time
echo '""Uptime"": {'
UPTIME_SECONDS=$(cat /proc/uptime | awk '{print $1}')
BOOT_TIME=$(date -d ""$(uptime -s)"" +%Y-%m-%dT%H:%M:%S.%3NZ 2>/dev/null || echo ""unknown"")
CURRENT_TIME=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)

UPTIME_DAYS=$(echo ""scale=2; $UPTIME_SECONDS/86400"" | bc 2>/dev/null || echo ""0"")
UPTIME_HOURS=$(echo ""scale=2; $UPTIME_SECONDS/3600"" | bc 2>/dev/null || echo ""0"")

echo ""  \""UptimeSeconds\"": $UPTIME_SECONDS,""
echo ""  \""UptimeDays\"": $UPTIME_DAYS,""
echo ""  \""UptimeHours\"": $UPTIME_HOURS,""
echo ""  \""BootTime\"": \""$BOOT_TIME\"",""
echo ""  \""CurrentTime\"": \""$CURRENT_TIME\""""
echo '},'

# Environment Variables (selected)
echo '""Environment"": {'
PATH_VAR=""$PATH""
HOME_DIR=""$HOME""
USER_NAME=""$USER""
SHELL_VAR=""$SHELL""
LANG_VAR=""$LANG""
TIMEZONE=""unknown""
if [ -r /etc/timezone ]; then
    TIMEZONE=$(cat /etc/timezone 2>/dev/null || echo ""unknown"")
elif [ -L /etc/localtime ]; then
    TIMEZONE=$(readlink /etc/localtime | sed 's|.*/zoneinfo/||' 2>/dev/null || echo ""unknown"")
fi

echo ""  \""Path\"": \""$PATH_VAR\"",""
echo ""  \""Home\"": \""$HOME_DIR\"",""
echo ""  \""User\"": \""$USER_NAME\"",""
echo ""  \""Shell\"": \""$SHELL_VAR\"",""
echo ""  \""Language\"": \""$LANG_VAR\"",""
echo ""  \""Timezone\"": \""$TIMEZONE\""""
echo '},'

# File System Information
echo '""FileSystems"": ['
FIRST_FS=true
if command -v df >/dev/null 2>&1; then
    while IFS= read -r line; do
        # Skip header line
        if [[ ""$line"" =~ ^Filesystem ]]; then
            continue
        fi
        
        if [ ""$FIRST_FS"" = false ]; then
            echo ','
        fi
        FIRST_FS=false
        
        FILESYSTEM=$(echo ""$line"" | awk '{print $1}')
        SIZE=$(echo ""$line"" | awk '{print $2}')
        USED=$(echo ""$line"" | awk '{print $3}')
        AVAILABLE=$(echo ""$line"" | awk '{print $4}')
        USE_PERCENT=$(echo ""$line"" | awk '{print $5}' | tr -d '%')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $6}')
        
        SIZE_GB=$(echo ""scale=2; $SIZE/1024/1024"" | bc 2>/dev/null || echo ""0"")
        USED_GB=$(echo ""scale=2; $USED/1024/1024"" | bc 2>/dev/null || echo ""0"")
        AVAILABLE_GB=$(echo ""scale=2; $AVAILABLE/1024/1024"" | bc 2>/dev/null || echo ""0"")
        
        echo ""    {""
        echo ""      \""Filesystem\"": \""$FILESYSTEM\"",""
        echo ""      \""SizeKB\"": $SIZE,""
        echo ""      \""SizeGB\"": $SIZE_GB,""
        echo ""      \""UsedKB\"": $USED,""
        echo ""      \""UsedGB\"": $USED_GB,""
        echo ""      \""AvailableKB\"": $AVAILABLE,""
        echo ""      \""AvailableGB\"": $AVAILABLE_GB,""
        echo ""      \""UsePercent\"": $USE_PERCENT,""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\""""
        echo ""    }""
    done < <(df -k)
fi
echo '],'

# CPU Information Summary
echo '""CPUSummary"": {'
if [ -r /proc/cpuinfo ]; then
    CPU_COUNT=$(grep -c ^processor /proc/cpuinfo)
    CPU_MODEL=$(grep -m1 ""model name"" /proc/cpuinfo | cut -d':' -f2 | sed 's/^[ \t]*//')
    CPU_MHZ=$(grep -m1 ""cpu MHz"" /proc/cpuinfo | cut -d':' -f2 | sed 's/^[ \t]*//')
    
    echo ""  \""ProcessorCount\"": $CPU_COUNT,""
    echo ""  \""ModelName\"": \""$CPU_MODEL\"",""
    echo ""  \""CurrentMHz\"": \""$CPU_MHZ\""""
else
    echo '""  \""Error\"": \""Unable to read CPU information\""""'
fi
echo '},'

# Memory Summary
echo '""MemorySummary"": {'
if [ -r /proc/meminfo ]; then
    TOTAL_MEM=$(grep ""MemTotal"" /proc/meminfo | awk '{print $2}')
    FREE_MEM=$(grep ""MemFree"" /proc/meminfo | awk '{print $2}')
    AVAILABLE_MEM=$(grep ""MemAvailable"" /proc/meminfo | awk '{print $2}')
    
    TOTAL_GB=$(echo ""scale=2; $TOTAL_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    AVAILABLE_GB=$(echo ""scale=2; $AVAILABLE_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    
    echo ""  \""TotalGB\"": $TOTAL_GB,""
    echo ""  \""AvailableGB\"": $AVAILABLE_GB""
else
    echo '""  \""Error\"": \""Unable to read memory information\""""'
fi
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "OperatingSystem", "Kernel", "Hardware", "Uptime", "Environment", "FileSystems" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "Platform" } }
        },
        Tags = new List<string> { "system", "discovery", "linux", "os", "kernel", "hardware", "uptime", "filesystem", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateLinuxUserAccountDiscoveryScript() => new()
    {
        Name = "Linux User Account Discovery - Bash",
        Description = "Comprehensive discovery of Linux user accounts, groups, and login information",
        Category = "User Account Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 25,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux User Account Discovery Script
# Outputs comprehensive user account information in JSON format

set -e

echo '{'

# User Accounts
echo '""UserAccounts"": ['
FIRST_USER=true
while IFS=: read -r username password uid gid gecos home shell; do
    if [ ""$FIRST_USER"" = false ]; then
        echo ','
    fi
    FIRST_USER=false
    
    # Determine account type
    ACCOUNT_TYPE=""user""
    if [ ""$uid"" -eq 0 ]; then
        ACCOUNT_TYPE=""root""
    elif [ ""$uid"" -lt 1000 ] && [ ""$uid"" -ne 65534 ]; then
        ACCOUNT_TYPE=""system""
    elif [ ""$uid"" -eq 65534 ]; then
        ACCOUNT_TYPE=""nobody""
    fi
    
    # Check if user can login
    CAN_LOGIN=""false""
    if [[ ""$shell"" != ""/bin/false"" && ""$shell"" != ""/usr/sbin/nologin"" && ""$shell"" != ""/sbin/nologin"" ]]; then
        CAN_LOGIN=""true""
    fi
    
    # Get last login information if available
    LAST_LOGIN=""unknown""
    if command -v lastlog >/dev/null 2>&1; then
        LAST_LOGIN=$(lastlog -u ""$username"" 2>/dev/null | tail -1 | awk '{print $4"" ""$5"" ""$6"" ""$7}' | sed 's/Never logged in/never/' || echo ""unknown"")
    fi
    
    echo ""    {""
    echo ""      \""Username\"": \""$username\"",""
    echo ""      \""UID\"": $uid,""
    echo ""      \""GID\"": $gid,""
    echo ""      \""GECOS\"": \""$gecos\"",""
    echo ""      \""HomeDirectory\"": \""$home\"",""
    echo ""      \""Shell\"": \""$shell\"",""
    echo ""      \""AccountType\"": \""$ACCOUNT_TYPE\"",""
    echo ""      \""CanLogin\"": $CAN_LOGIN,""
    echo ""      \""LastLogin\"": \""$LAST_LOGIN\""""
    echo ""    }""
done < /etc/passwd
echo '],'

# Groups
echo '""Groups"": ['
FIRST_GROUP=true
while IFS=: read -r groupname password gid members; do
    if [ ""$FIRST_GROUP"" = false ]; then
        echo ','
    fi
    FIRST_GROUP=false
    
    # Determine group type
    GROUP_TYPE=""user""
    if [ ""$gid"" -eq 0 ]; then
        GROUP_TYPE=""root""
    elif [ ""$gid"" -lt 1000 ]; then
        GROUP_TYPE=""system""
    fi
    
    echo ""    {""
    echo ""      \""GroupName\"": \""$groupname\"",""
    echo ""      \""GID\"": $gid,""
    echo ""      \""GroupType\"": \""$GROUP_TYPE\"",""
    echo ""      \""Members\"": \""$members\""""
    echo ""    }""
done < /etc/group
echo '],'

# Current User Information
echo '""CurrentUser"": {'
CURRENT_USER=$(whoami)
CURRENT_UID=$(id -u)
CURRENT_GID=$(id -g)
CURRENT_GROUPS=$(groups | tr ' ' ',')
CURRENT_HOME=""$HOME""
CURRENT_SHELL=""$SHELL""

echo ""  \""Username\"": \""$CURRENT_USER\"",""
echo ""  \""UID\"": $CURRENT_UID,""
echo ""  \""GID\"": $CURRENT_GID,""
echo ""  \""Groups\"": \""$CURRENT_GROUPS\"",""
echo ""  \""HomeDirectory\"": \""$CURRENT_HOME\"",""
echo ""  \""Shell\"": \""$CURRENT_SHELL\""""
echo '},'

# Logged In Users
echo '""LoggedInUsers"": ['
FIRST_LOGIN=true
if command -v who >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_LOGIN"" = false ]; then
            echo ','
        fi
        FIRST_LOGIN=false
        
        USERNAME=$(echo ""$line"" | awk '{print $1}')
        TERMINAL=$(echo ""$line"" | awk '{print $2}')
        LOGIN_TIME=$(echo ""$line"" | awk '{print $3"" ""$4}')
        FROM_HOST=$(echo ""$line"" | awk '{print $5}' | tr -d '()')
        
        echo ""    {""
        echo ""      \""Username\"": \""$USERNAME\"",""
        echo ""      \""Terminal\"": \""$TERMINAL\"",""
        echo ""      \""LoginTime\"": \""$LOGIN_TIME\"",""
        echo ""      \""FromHost\"": \""$FROM_HOST\""""
        echo ""    }""
    done < <(who)
fi
echo '],'

# SSH Key Information (for current user)
echo '""SSHKeys"": ['
FIRST_KEY=true
if [ -d ""$HOME/.ssh"" ]; then
    for key_file in ""$HOME/.ssh""/*.pub; do
        if [ -f ""$key_file"" ]; then
            if [ ""$FIRST_KEY"" = false ]; then
                echo ','
            fi
            FIRST_KEY=false
            
            KEY_TYPE=$(head -1 ""$key_file"" | awk '{print $1}')
            KEY_COMMENT=$(head -1 ""$key_file"" | awk '{print $3}')
            KEY_FILENAME=$(basename ""$key_file"")
            
            echo ""    {""
            echo ""      \""Filename\"": \""$KEY_FILENAME\"",""
            echo ""      \""Type\"": \""$KEY_TYPE\"",""
            echo ""      \""Comment\"": \""$KEY_COMMENT\""""
            echo ""    }""
        fi
    done
fi
echo '],'

# Sudo Access (check if current user can sudo)
echo '""SudoAccess"": {'
CAN_SUDO=""false""
SUDO_COMMANDS=""none""

if command -v sudo >/dev/null 2>&1; then
    if sudo -n true 2>/dev/null; then
        CAN_SUDO=""true""
        SUDO_COMMANDS=$(sudo -l 2>/dev/null | grep -v ""may run"" | tail -n +3 | tr '\n' ';' || echo ""unknown"")
    elif sudo -v 2>/dev/null; then
        CAN_SUDO=""true""
        SUDO_COMMANDS=""requires_password""
    fi
fi

echo ""  \""CanUseSudo\"": $CAN_SUDO,""
echo ""  \""Commands\"": \""$SUDO_COMMANDS\""""
echo '},'

# User Statistics
TOTAL_USERS=$(wc -l < /etc/passwd)
SYSTEM_USERS=$(awk -F: '$3 < 1000 && $3 != 65534 {count++} END {print count+0}' /etc/passwd)
REGULAR_USERS=$(awk -F: '$3 >= 1000 && $3 != 65534 {count++} END {print count+0}' /etc/passwd)
LOGIN_ENABLED_USERS=$(awk -F: '$7 !~ /(false|nologin)$/ {count++} END {print count+0}' /etc/passwd)
TOTAL_GROUPS=$(wc -l < /etc/group)
CURRENTLY_LOGGED_IN=$(who | wc -l)

echo '""UserStatistics"": {'
echo ""  \""TotalUsers\"": $TOTAL_USERS,""
echo ""  \""SystemUsers\"": $SYSTEM_USERS,""
echo ""  \""RegularUsers\"": $REGULAR_USERS,""
echo ""  \""LoginEnabledUsers\"": $LOGIN_ENABLED_USERS,""
echo ""  \""TotalGroups\"": $TOTAL_GROUPS,""
echo ""  \""CurrentlyLoggedIn\"": $CURRENTLY_LOGGED_IN""
echo '},'

# Password Policy Information (if available)
echo '""PasswordPolicy"": {'
if [ -r /etc/login.defs ]; then
    PASS_MAX_DAYS=$(grep ""^PASS_MAX_DAYS"" /etc/login.defs | awk '{print $2}' || echo ""unknown"")
    PASS_MIN_DAYS=$(grep ""^PASS_MIN_DAYS"" /etc/login.defs | awk '{print $2}' || echo ""unknown"")
    PASS_WARN_AGE=$(grep ""^PASS_WARN_AGE"" /etc/login.defs | awk '{print $2}' || echo ""unknown"")
    PASS_MIN_LEN=$(grep ""^PASS_MIN_LEN"" /etc/login.defs | awk '{print $2}' || echo ""unknown"")
    
    echo ""  \""MaxPasswordDays\"": \""$PASS_MAX_DAYS\"",""
    echo ""  \""MinPasswordDays\"": \""$PASS_MIN_DAYS\"",""
    echo ""  \""PasswordWarnAge\"": \""$PASS_WARN_AGE\"",""
    echo ""  \""MinPasswordLength\"": \""$PASS_MIN_LEN\""""
else
    echo '""  \""Error\"": \""Unable to read password policy\""""'
fi
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "UserAccounts", "Groups", "CurrentUser", "LoggedInUsers", "UserStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "UserStatistics.TotalUsers" } }
        },
        Tags = new List<string> { "users", "discovery", "linux", "accounts", "groups", "ssh", "sudo", "login", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS" }
    };

    private DiscoveryScriptTemplate CreateLinuxPerformanceDiscoveryScript() => new()
    {
        Name = "Linux Performance Discovery - Bash",
        Description = "Comprehensive performance monitoring including CPU, memory, disk I/O, and network statistics",
        Category = "Performance Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 35,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux Performance Discovery Script
# Outputs comprehensive performance metrics in JSON format

set -e

echo '{'

# CPU Performance
echo '""CPUPerformance"": {'
if [ -r /proc/stat ]; then
    # Read CPU stats twice with 1 second interval for calculation
    CPU_STATS1=$(grep ""^cpu "" /proc/stat)
    sleep 1
    CPU_STATS2=$(grep ""^cpu "" /proc/stat)
    
    # Extract values from first reading
    USER1=$(echo ""$CPU_STATS1"" | awk '{print $2}')
    NICE1=$(echo ""$CPU_STATS1"" | awk '{print $3}')
    SYSTEM1=$(echo ""$CPU_STATS1"" | awk '{print $4}')
    IDLE1=$(echo ""$CPU_STATS1"" | awk '{print $5}')
    IOWAIT1=$(echo ""$CPU_STATS1"" | awk '{print $6}')
    
    # Extract values from second reading
    USER2=$(echo ""$CPU_STATS2"" | awk '{print $2}')
    NICE2=$(echo ""$CPU_STATS2"" | awk '{print $3}')
    SYSTEM2=$(echo ""$CPU_STATS2"" | awk '{print $4}')
    IDLE2=$(echo ""$CPU_STATS2"" | awk '{print $5}')
    IOWAIT2=$(echo ""$CPU_STATS2"" | awk '{print $6}')
    
    # Calculate differences
    USER_DIFF=$((USER2 - USER1))
    NICE_DIFF=$((NICE2 - NICE1))
    SYSTEM_DIFF=$((SYSTEM2 - SYSTEM1))
    IDLE_DIFF=$((IDLE2 - IDLE1))
    IOWAIT_DIFF=$((IOWAIT2 - IOWAIT1))
    
    TOTAL_DIFF=$((USER_DIFF + NICE_DIFF + SYSTEM_DIFF + IDLE_DIFF + IOWAIT_DIFF))
    
    # Calculate percentages
    if [ ""$TOTAL_DIFF"" -gt 0 ]; then
        USER_PERCENT=$(echo ""scale=2; $USER_DIFF * 100 / $TOTAL_DIFF"" | bc 2>/dev/null || echo ""0"")
        SYSTEM_PERCENT=$(echo ""scale=2; $SYSTEM_DIFF * 100 / $TOTAL_DIFF"" | bc 2>/dev/null || echo ""0"")
        IDLE_PERCENT=$(echo ""scale=2; $IDLE_DIFF * 100 / $TOTAL_DIFF"" | bc 2>/dev/null || echo ""0"")
        IOWAIT_PERCENT=$(echo ""scale=2; $IOWAIT_DIFF * 100 / $TOTAL_DIFF"" | bc 2>/dev/null || echo ""0"")
    else
        USER_PERCENT=""0""
        SYSTEM_PERCENT=""0""
        IDLE_PERCENT=""0""
        IOWAIT_PERCENT=""0""
    fi
    
    # CPU count and load average
    CPU_COUNT=$(grep -c ^processor /proc/cpuinfo)
    LOAD_AVG=$(cat /proc/loadavg)
    LOAD_1MIN=$(echo ""$LOAD_AVG"" | awk '{print $1}')
    LOAD_5MIN=$(echo ""$LOAD_AVG"" | awk '{print $2}')
    LOAD_15MIN=$(echo ""$LOAD_AVG"" | awk '{print $3}')
    
    echo ""  \""CPUCount\"": $CPU_COUNT,""
    echo ""  \""UserPercent\"": $USER_PERCENT,""
    echo ""  \""SystemPercent\"": $SYSTEM_PERCENT,""
    echo ""  \""IdlePercent\"": $IDLE_PERCENT,""
    echo ""  \""IOWaitPercent\"": $IOWAIT_PERCENT,""
    echo ""  \""Load1Min\"": $LOAD_1MIN,""
    echo ""  \""Load5Min\"": $LOAD_5MIN,""
    echo ""  \""Load15Min\"": $LOAD_15MIN""
else
    echo '""  \""Error\"": \""Unable to read CPU statistics\""""'
fi
echo '},'

# Memory Performance
echo '""MemoryPerformance"": {'
if [ -r /proc/meminfo ]; then
    TOTAL_MEM=$(grep ""MemTotal"" /proc/meminfo | awk '{print $2}')
    FREE_MEM=$(grep ""MemFree"" /proc/meminfo | awk '{print $2}')
    AVAILABLE_MEM=$(grep ""MemAvailable"" /proc/meminfo | awk '{print $2}')
    CACHED_MEM=$(grep ""^Cached"" /proc/meminfo | awk '{print $2}')
    BUFFER_MEM=$(grep ""Buffers"" /proc/meminfo | awk '{print $2}')
    SWAP_TOTAL=$(grep ""SwapTotal"" /proc/meminfo | awk '{print $2}')
    SWAP_FREE=$(grep ""SwapFree"" /proc/meminfo | awk '{print $2}')
    
    USED_MEM=$((TOTAL_MEM - AVAILABLE_MEM))
    SWAP_USED=$((SWAP_TOTAL - SWAP_FREE))
    
    # Convert to GB
    TOTAL_GB=$(echo ""scale=2; $TOTAL_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    USED_GB=$(echo ""scale=2; $USED_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    AVAILABLE_GB=$(echo ""scale=2; $AVAILABLE_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    CACHED_GB=$(echo ""scale=2; $CACHED_MEM/1024/1024"" | bc 2>/dev/null || echo ""0"")
    
    # Calculate percentages
    if [ ""$TOTAL_MEM"" -gt 0 ]; then
        USED_PERCENT=$(echo ""scale=2; $USED_MEM * 100 / $TOTAL_MEM"" | bc 2>/dev/null || echo ""0"")
        CACHED_PERCENT=$(echo ""scale=2; $CACHED_MEM * 100 / $TOTAL_MEM"" | bc 2>/dev/null || echo ""0"")
    else
        USED_PERCENT=""0""
        CACHED_PERCENT=""0""
    fi
    
    echo ""  \""TotalGB\"": $TOTAL_GB,""
    echo ""  \""UsedGB\"": $USED_GB,""
    echo ""  \""AvailableGB\"": $AVAILABLE_GB,""
    echo ""  \""CachedGB\"": $CACHED_GB,""
    echo ""  \""UsedPercent\"": $USED_PERCENT,""
    echo ""  \""CachedPercent\"": $CACHED_PERCENT,""
    echo ""  \""SwapTotalKB\"": $SWAP_TOTAL,""
    echo ""  \""SwapUsedKB\"": $SWAP_USED,""
    echo ""  \""SwapFreeKB\"": $SWAP_FREE""
else
    echo '""  \""Error\"": \""Unable to read memory statistics\""""'
fi
echo '},'

# Disk I/O Performance
echo '""DiskIOPerformance"": ['
FIRST_DISK=true
if [ -r /proc/diskstats ]; then
    while IFS= read -r line; do
        DEVICE=$(echo ""$line"" | awk '{print $3}')
        
        # Filter for main disk devices (skip partitions)
        if [[ ""$DEVICE"" =~ ^sd[a-z]$ ]] || [[ ""$DEVICE"" =~ ^nvme[0-9]+n[0-9]+$ ]] || [[ ""$DEVICE"" =~ ^hd[a-z]$ ]]; then
            if [ ""$FIRST_DISK"" = false ]; then
                echo ','
            fi
            FIRST_DISK=false
            
            READS_COMPLETED=$(echo ""$line"" | awk '{print $4}')
            READS_SECTORS=$(echo ""$line"" | awk '{print $6}')
            WRITES_COMPLETED=$(echo ""$line"" | awk '{print $8}')
            WRITES_SECTORS=$(echo ""$line"" | awk '{print $10}')
            IO_TIME=$(echo ""$line"" | awk '{print $13}')
            
            echo ""    {""
            echo ""      \""Device\"": \""/dev/$DEVICE\"",""
            echo ""      \""ReadsCompleted\"": $READS_COMPLETED,""
            echo ""      \""ReadsSectors\"": $READS_SECTORS,""
            echo ""      \""WritesCompleted\"": $WRITES_COMPLETED,""
            echo ""      \""WritesSectors\"": $WRITES_SECTORS,""
            echo ""      \""IOTimeMs\"": $IO_TIME""
            echo ""    }""
        fi
    done < /proc/diskstats
fi
echo '],'

# Disk Space Usage
echo '""DiskSpaceUsage"": ['
FIRST_FS=true
if command -v df >/dev/null 2>&1; then
    while IFS= read -r line; do
        # Skip header and special filesystems
        if [[ ""$line"" =~ ^Filesystem ]] || [[ ""$line"" =~ ^tmpfs ]] || [[ ""$line"" =~ ^udev ]] || [[ ""$line"" =~ ^devpts ]]; then
            continue
        fi
        
        if [ ""$FIRST_FS"" = false ]; then
            echo ','
        fi
        FIRST_FS=false
        
        FILESYSTEM=$(echo ""$line"" | awk '{print $1}')
        SIZE=$(echo ""$line"" | awk '{print $2}')
        USED=$(echo ""$line"" | awk '{print $3}')
        AVAILABLE=$(echo ""$line"" | awk '{print $4}')
        USE_PERCENT=$(echo ""$line"" | awk '{print $5}' | tr -d '%')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $6}')
        
        SIZE_GB=$(echo ""scale=2; $SIZE/1024/1024"" | bc 2>/dev/null || echo ""0"")
        USED_GB=$(echo ""scale=2; $USED/1024/1024"" | bc 2>/dev/null || echo ""0"")
        AVAILABLE_GB=$(echo ""scale=2; $AVAILABLE/1024/1024"" | bc 2>/dev/null || echo ""0"")
        
        echo ""    {""
        echo ""      \""Filesystem\"": \""$FILESYSTEM\"",""
        echo ""      \""SizeGB\"": $SIZE_GB,""
        echo ""      \""UsedGB\"": $USED_GB,""
        echo ""      \""AvailableGB\"": $AVAILABLE_GB,""
        echo ""      \""UsePercent\"": $USE_PERCENT,""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\""""
        echo ""    }""
    done < <(df -k)
fi
echo '],'

# Network Interface Statistics
echo '""NetworkPerformance"": ['
FIRST_NET=true
if [ -r /proc/net/dev ]; then
    while IFS= read -r line; do
        # Skip header lines
        if [[ ""$line"" =~ Inter- ]] || [[ ""$line"" =~ face ]]; then
            continue
        fi
        
        INTERFACE=$(echo ""$line"" | awk -F: '{print $1}' | tr -d ' ')
        
        # Skip loopback interface
        if [ ""$INTERFACE"" = ""lo"" ]; then
            continue
        fi
        
        if [ ""$FIRST_NET"" = false ]; then
            echo ','
        fi
        FIRST_NET=false
        
        STATS=$(echo ""$line"" | awk -F: '{print $2}')
        RX_BYTES=$(echo ""$STATS"" | awk '{print $1}')
        RX_PACKETS=$(echo ""$STATS"" | awk '{print $2}')
        RX_ERRORS=$(echo ""$STATS"" | awk '{print $3}')
        TX_BYTES=$(echo ""$STATS"" | awk '{print $9}')
        TX_PACKETS=$(echo ""$STATS"" | awk '{print $10}')
        TX_ERRORS=$(echo ""$STATS"" | awk '{print $11}')
        
        RX_MB=$(echo ""scale=2; $RX_BYTES/1024/1024"" | bc 2>/dev/null || echo ""0"")
        TX_MB=$(echo ""scale=2; $TX_BYTES/1024/1024"" | bc 2>/dev/null || echo ""0"")
        
        echo ""    {""
        echo ""      \""Interface\"": \""$INTERFACE\"",""
        echo ""      \""RxBytes\"": $RX_BYTES,""
        echo ""      \""RxMB\"": $RX_MB,""
        echo ""      \""RxPackets\"": $RX_PACKETS,""
        echo ""      \""RxErrors\"": $RX_ERRORS,""
        echo ""      \""TxBytes\"": $TX_BYTES,""
        echo ""      \""TxMB\"": $TX_MB,""
        echo ""      \""TxPackets\"": $TX_PACKETS,""
        echo ""      \""TxErrors\"": $TX_ERRORS""
        echo ""    }""
    done < /proc/net/dev
fi
echo '],'

# Top Processes by CPU and Memory
echo '""TopProcesses"": ['
FIRST_PROC=true
if command -v ps >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_PROC"" = false ]; then
            echo ','
        fi
        FIRST_PROC=false
        
        PID=$(echo ""$line"" | awk '{print $2}')
        CPU=$(echo ""$line"" | awk '{print $3}')
        MEM=$(echo ""$line"" | awk '{print $4}')
        COMMAND=$(echo ""$line"" | awk '{print $11}' | sed 's/""/\\\\""/g')
        
        echo ""    {""
        echo ""      \""PID\"": $PID,""
        echo ""      \""CPUPercent\"": \""$CPU\"",""
        echo ""      \""MemoryPercent\"": \""$MEM\"",""
        echo ""      \""Command\"": \""$COMMAND\""""
        echo ""    }""
    done < <(ps aux --sort=-%cpu | head -11 | tail -10)
fi
echo '],'

# System Performance Summary
UPTIME_SECONDS=$(cat /proc/uptime | awk '{print $1}')
UPTIME_DAYS=$(echo ""scale=2; $UPTIME_SECONDS/86400"" | bc 2>/dev/null || echo ""0"")
PROCESS_COUNT=$(ps aux | wc -l)

echo '""PerformanceSummary"": {'
echo ""  \""UptimeDays\"": $UPTIME_DAYS,""
echo ""  \""ProcessCount\"": $PROCESS_COUNT,""
echo ""  \""SampleDuration\"": ""1 second\""""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "CPUPerformance", "MemoryPerformance", "DiskIOPerformance", "NetworkPerformance", "TopProcesses" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "PerformanceSummary.UptimeDays" } }
        },
        Tags = new List<string> { "performance", "discovery", "linux", "cpu", "memory", "disk", "network", "monitoring", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateLinuxFilesystemDiscoveryScript() => new()
    {
        Name = "Linux Filesystem Discovery - Bash",
        Description = "Comprehensive filesystem discovery including mount points, disk usage, and file system information",
        Category = "Filesystem Discovery",
        Type = "bash",
        TargetOS = "linux",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# Linux Filesystem Discovery Script
# Outputs comprehensive filesystem information in JSON format

set -e

echo '{'

# Mounted Filesystems
echo '""MountedFilesystems"": ['
FIRST_MOUNT=true
if command -v mount >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_MOUNT"" = false ]; then
            echo ','
        fi
        FIRST_MOUNT=false
        
        DEVICE=$(echo ""$line"" | awk '{print $1}')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $3}')
        FSTYPE=$(echo ""$line"" | awk '{print $5}')
        OPTIONS=$(echo ""$line"" | awk -F'(' '{print $2}' | tr -d ')')
        
        echo ""    {""
        echo ""      \""Device\"": \""$DEVICE\"",""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\"",""
        echo ""      \""FilesystemType\"": \""$FSTYPE\"",""
        echo ""      \""Options\"": \""$OPTIONS\""""
        echo ""    }""
    done < <(mount | grep -E '^\/dev\/')
fi
echo '],'

# Disk Usage by Filesystem
echo '""DiskUsage"": ['
FIRST_USAGE=true
if command -v df >/dev/null 2>&1; then
    while IFS= read -r line; do
        # Skip header and special filesystems
        if [[ ""$line"" =~ ^Filesystem ]] || [[ ""$line"" =~ ^tmpfs ]] || [[ ""$line"" =~ ^udev ]]; then
            continue
        fi
        
        if [ ""$FIRST_USAGE"" = false ]; then
            echo ','
        fi
        FIRST_USAGE=false
        
        FILESYSTEM=$(echo ""$line"" | awk '{print $1}')
        SIZE=$(echo ""$line"" | awk '{print $2}')
        USED=$(echo ""$line"" | awk '{print $3}')
        AVAILABLE=$(echo ""$line"" | awk '{print $4}')
        USE_PERCENT=$(echo ""$line"" | awk '{print $5}' | tr -d '%')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $6}')
        
        # Convert to human readable sizes
        SIZE_MB=$(echo ""scale=2; $SIZE/1024"" | bc 2>/dev/null || echo ""0"")
        SIZE_GB=$(echo ""scale=2; $SIZE/1024/1024"" | bc 2>/dev/null || echo ""0"")
        USED_MB=$(echo ""scale=2; $USED/1024"" | bc 2>/dev/null || echo ""0"")
        USED_GB=$(echo ""scale=2; $USED/1024/1024"" | bc 2>/dev/null || echo ""0"")
        AVAILABLE_MB=$(echo ""scale=2; $AVAILABLE/1024"" | bc 2>/dev/null || echo ""0"")
        AVAILABLE_GB=$(echo ""scale=2; $AVAILABLE/1024/1024"" | bc 2>/dev/null || echo ""0"")
        
        echo ""    {""
        echo ""      \""Filesystem\"": \""$FILESYSTEM\"",""
        echo ""      \""SizeKB\"": $SIZE,""
        echo ""      \""SizeMB\"": $SIZE_MB,""
        echo ""      \""SizeGB\"": $SIZE_GB,""
        echo ""      \""UsedKB\"": $USED,""
        echo ""      \""UsedMB\"": $USED_MB,""
        echo ""      \""UsedGB\"": $USED_GB,""
        echo ""      \""AvailableKB\"": $AVAILABLE,""
        echo ""      \""AvailableMB\"": $AVAILABLE_MB,""
        echo ""      \""AvailableGB\"": $AVAILABLE_GB,""
        echo ""      \""UsePercent\"": $USE_PERCENT,""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\""""
        echo ""    }""
    done < <(df -k)
fi
echo '],'

# Block Devices
echo '""BlockDevices"": ['
FIRST_BLOCK=true
if command -v lsblk >/dev/null 2>&1; then
    while IFS= read -r line; do
        if [ ""$FIRST_BLOCK"" = false ]; then
            echo ','
        fi
        FIRST_BLOCK=false
        
        NAME=$(echo ""$line"" | awk '{print $1}')
        SIZE=$(echo ""$line"" | awk '{print $4}')
        TYPE=$(echo ""$line"" | awk '{print $6}')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $7}')
        
        # Get additional info if available
        MODEL=""unknown""
        VENDOR=""unknown""
        if [ -e ""/sys/block/$NAME/device/model"" ]; then
            MODEL=$(cat ""/sys/block/$NAME/device/model"" 2>/dev/null | tr -d ' \n' || echo ""unknown"")
        fi
        if [ -e ""/sys/block/$NAME/device/vendor"" ]; then
            VENDOR=$(cat ""/sys/block/$NAME/device/vendor"" 2>/dev/null | tr -d ' \n' || echo ""unknown"")
        fi
        
        echo ""    {""
        echo ""      \""Name\"": \""$NAME\"",""
        echo ""      \""Size\"": \""$SIZE\"",""
        echo ""      \""Type\"": \""$TYPE\"",""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\"",""
        echo ""      \""Model\"": \""$MODEL\"",""
        echo ""      \""Vendor\"": \""$VENDOR\""""
        echo ""    }""
    done < <(lsblk -rn | grep -E ""^[a-z]"")
fi
echo '],'

# Inode Usage
echo '""InodeUsage"": ['
FIRST_INODE=true
if command -v df >/dev/null 2>&1; then
    while IFS= read -r line; do
        # Skip header and special filesystems
        if [[ ""$line"" =~ ^Filesystem ]] || [[ ""$line"" =~ ^tmpfs ]] || [[ ""$line"" =~ ^udev ]]; then
            continue
        fi
        
        if [ ""$FIRST_INODE"" = false ]; then
            echo ','
        fi
        FIRST_INODE=false
        
        FILESYSTEM=$(echo ""$line"" | awk '{print $1}')
        INODES=$(echo ""$line"" | awk '{print $2}')
        USED_INODES=$(echo ""$line"" | awk '{print $3}')
        FREE_INODES=$(echo ""$line"" | awk '{print $4}')
        INODE_USE_PERCENT=$(echo ""$line"" | awk '{print $5}' | tr -d '%')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $6}')
        
        echo ""    {""
        echo ""      \""Filesystem\"": \""$FILESYSTEM\"",""
        echo ""      \""TotalInodes\"": $INODES,""
        echo ""      \""UsedInodes\"": $USED_INODES,""
        echo ""      \""FreeInodes\"": $FREE_INODES,""
        echo ""      \""InodeUsePercent\"": $INODE_USE_PERCENT,""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\""""
        echo ""    }""
    done < <(df -i | grep -E '^\/dev\/')
fi
echo '],'

# Filesystem Types Summary
echo '""FilesystemTypes"": ['
FIRST_TYPE=true
if [ -r /proc/filesystems ]; then
    while IFS= read -r line; do
        if [ ""$FIRST_TYPE"" = false ]; then
            echo ','
        fi
        FIRST_TYPE=false
        
        FSTYPE=$(echo ""$line"" | awk '{print $2}')
        NODEV=$(echo ""$line"" | awk '{print $1}')
        
        echo ""    {""
        echo ""      \""Type\"": \""$FSTYPE\"",""
        echo ""      \""RequiresDevice\"": ""$(if [ ""$NODEV"" = ""nodev"" ]; then echo ""false""; else echo ""true""; fi)\""""
        echo ""    }""
    done < /proc/filesystems
fi
echo '],'

# Large Files and Directories (top directories by size)
echo '""LargeDirectories"": ['
FIRST_DIR=true
if command -v du >/dev/null 2>&1; then
    # Get top 10 largest directories in root (excluding proc, sys, dev)
    while IFS= read -r line; do
        if [ ""$FIRST_DIR"" = false ]; then
            echo ','
        fi
        FIRST_DIR=false
        
        SIZE=$(echo ""$line"" | awk '{print $1}')
        DIRECTORY=$(echo ""$line"" | awk '{print $2}')
        
        SIZE_MB=$(echo ""scale=2; $SIZE/1024"" | bc 2>/dev/null || echo ""0"")
        SIZE_GB=$(echo ""scale=2; $SIZE/1024/1024"" | bc 2>/dev/null || echo ""0"")
        
        echo ""    {""
        echo ""      \""Directory\"": \""$DIRECTORY\"",""
        echo ""      \""SizeKB\"": $SIZE,""
        echo ""      \""SizeMB\"": $SIZE_MB,""
        echo ""      \""SizeGB\"": $SIZE_GB""
        echo ""    }""
    done < <(du -sk /* 2>/dev/null | grep -v -E ""^[0-9]+[[:space:]]+(\/proc|\/sys|\/dev)"" | sort -nr | head -10)
fi
echo '],'

# File System Statistics
TOTAL_FILESYSTEMS=0
TOTAL_DISK_SIZE=0
TOTAL_DISK_USED=0

if command -v df >/dev/null 2>&1; then
    TOTAL_FILESYSTEMS=$(df -k | grep -E '^\/dev\/' | wc -l)
    TOTAL_DISK_SIZE=$(df -k | grep -E '^\/dev\/' | awk '{sum += $2} END {print sum+0}')
    TOTAL_DISK_USED=$(df -k | grep -E '^\/dev\/' | awk '{sum += $3} END {print sum+0}')
fi

TOTAL_SIZE_GB=$(echo ""scale=2; $TOTAL_DISK_SIZE/1024/1024"" | bc 2>/dev/null || echo ""0"")
TOTAL_USED_GB=$(echo ""scale=2; $TOTAL_DISK_USED/1024/1024"" | bc 2>/dev/null || echo ""0"")
TOTAL_FREE_GB=$(echo ""scale=2; ($TOTAL_DISK_SIZE - $TOTAL_DISK_USED)/1024/1024"" | bc 2>/dev/null || echo ""0"")

if [ ""$TOTAL_DISK_SIZE"" -gt 0 ]; then
    TOTAL_USED_PERCENT=$(echo ""scale=2; $TOTAL_DISK_USED * 100 / $TOTAL_DISK_SIZE"" | bc 2>/dev/null || echo ""0"")
else
    TOTAL_USED_PERCENT=""0""
fi

echo '""FilesystemStatistics"": {'
echo ""  \""TotalFilesystems\"": $TOTAL_FILESYSTEMS,""
echo ""  \""TotalSizeGB\"": $TOTAL_SIZE_GB,""
echo ""  \""TotalUsedGB\"": $TOTAL_USED_GB,""
echo ""  \""TotalFreeGB\"": $TOTAL_FREE_GB,""
echo ""  \""TotalUsedPercent\"": $TOTAL_USED_PERCENT""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""Linux""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "MountedFilesystems", "DiskUsage", "BlockDevices", "InodeUsage", "FilesystemStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "FilesystemStatistics.TotalFilesystems" } }
        },
        Tags = new List<string> { "filesystem", "discovery", "linux", "storage", "mount", "disk", "inodes", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };
    
    private DiscoveryScriptTemplate CreateMacOSHardwareDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateMacOSSoftwareDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateMacOSNetworkDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateMacOSSecurityDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateMacOSServicesDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateMacOSProcessDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateMacOSSystemInfoDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateMacOSUserAccountDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateMacOSPerformanceDiscoveryScript() => throw new NotImplementedException();
    
    private DiscoveryScriptTemplate CreatePythonSystemInfoDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreatePythonNetworkDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreatePythonProcessDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreatePythonPerformanceDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreatePythonFileSystemDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreatePythonUserAccountDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreatePythonEnvironmentDiscoveryScript() => throw new NotImplementedException();
    
    private DiscoveryScriptTemplate CreateWMIHardwareDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMISoftwareDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMINetworkDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMISecurityDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMISystemInfoDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMIServicesDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMIProcessDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMIEventLogDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMIPerformanceDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreateWMIStorageDiscoveryScript() => throw new NotImplementedException();
}

public class DiscoveryScriptTemplate
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string Category { get; set; } = "";
    public string Type { get; set; } = "";
    public string TargetOS { get; set; } = "";
    public string Template { get; set; } = "";
    public string Vendor { get; set; } = "UEM Enterprise";
    public string Complexity { get; set; } = "Medium";
    public int EstimatedRunTimeSeconds { get; set; } = 30;
    public bool RequiresElevation { get; set; } = false;
    public bool RequiresNetwork { get; set; } = false;
    public Dictionary<string, object> Parameters { get; set; } = new();
    public string OutputFormat { get; set; } = "JSON";
    public Dictionary<string, object> OutputProcessing { get; set; } = new();
    public Dictionary<string, object> CredentialRequirements { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public List<string> Industries { get; set; } = new();
    public List<string> ComplianceFrameworks { get; set; } = new();
    public string Version { get; set; } = "1.0.0";
    public bool IsStandard { get; set; } = true;
    public bool IsActive { get; set; } = true;
}
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

    // macOS Bash Scripts
    private DiscoveryScriptTemplate CreateMacOSHardwareDiscoveryScript() => new()
    {
        Name = "macOS Hardware Discovery - Bash", 
        Description = "Comprehensive hardware discovery for macOS systems using system_profiler and native commands",
        Category = "Hardware Discovery",
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 45,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS Hardware Discovery Script
# Outputs comprehensive hardware information in JSON format

set -e

echo '{'

# Hardware Overview
echo '""HardwareOverview"": {'
if command -v system_profiler >/dev/null 2>&1; then
    HARDWARE_OVERVIEW=$(system_profiler SPHardwareDataType -json 2>/dev/null)
    if [ $? -eq 0 ] && [ ""$HARDWARE_OVERVIEW"" != """" ]; then
        MODEL_NAME=$(echo ""$HARDWARE_OVERVIEW"" | grep -o '""machine_name"": ""[^""]*""' | cut -d'""' -f4)
        MODEL_ID=$(echo ""$HARDWARE_OVERVIEW"" | grep -o '""machine_model"": ""[^""]*""' | cut -d'""' -f4)
        PROCESSOR_NAME=$(echo ""$HARDWARE_OVERVIEW"" | grep -o '""processor_name"": ""[^""]*""' | cut -d'""' -f4)
        PROCESSOR_SPEED=$(echo ""$HARDWARE_OVERVIEW"" | grep -o '""processor_speed"": ""[^""]*""' | cut -d'""' -f4)
        NUMBER_PROCESSORS=$(echo ""$HARDWARE_OVERVIEW"" | grep -o '""number_processors"": [0-9]*' | cut -d':' -f2 | tr -d ' ')
        TOTAL_CORES=$(echo ""$HARDWARE_OVERVIEW"" | grep -o '""packages"": [0-9]*' | cut -d':' -f2 | tr -d ' ')
        MEMORY=$(echo ""$HARDWARE_OVERVIEW"" | grep -o '""physical_memory"": ""[^""]*""' | cut -d'""' -f4)
        SERIAL_NUMBER=$(echo ""$HARDWARE_OVERVIEW"" | grep -o '""serial_number"": ""[^""]*""' | cut -d'""' -f4)
        
        echo ""  \""ModelName\"": \""$MODEL_NAME\"",""
        echo ""  \""ModelIdentifier\"": \""$MODEL_ID\"",""
        echo ""  \""ProcessorName\"": \""$PROCESSOR_NAME\"",""
        echo ""  \""ProcessorSpeed\"": \""$PROCESSOR_SPEED\"",""
        echo ""  \""NumberOfProcessors\"": $NUMBER_PROCESSORS,""
        echo ""  \""TotalCores\"": $TOTAL_CORES,""
        echo ""  \""PhysicalMemory\"": \""$MEMORY\"",""
        echo ""  \""SerialNumber\"": \""$SERIAL_NUMBER\""""
    else
        echo '""  \""Error\"": \""Unable to read hardware information\""""'
    fi
else
    echo '""  \""Error\"": \""system_profiler not available\""""'
fi
echo '},'

# Storage Information
echo '""Storage"": ['
FIRST_STORAGE=true
if command -v system_profiler >/dev/null 2>&1; then
    STORAGE_INFO=$(system_profiler SPStorageDataType -json 2>/dev/null)
    if [ $? -eq 0 ] && [ ""$STORAGE_INFO"" != """" ]; then
        # Extract storage devices using more robust parsing
        echo ""$STORAGE_INFO"" | grep -A 20 '""_name""' | while IFS= read -r line; do
            if [[ ""$line"" =~ \""_name\"": ]]; then
                if [ ""$FIRST_STORAGE"" = false ]; then
                    echo ','
                fi
                FIRST_STORAGE=false
                
                VOLUME_NAME=$(echo ""$line"" | cut -d'""' -f4)
                # This is simplified - in practice you'd parse more fields
                echo ""    {""
                echo ""      \""VolumeName\"": \""$VOLUME_NAME\""""
                echo ""    }""
            fi
        done
    fi
fi
echo '],'

# Memory Information
echo '""Memory"": ['
FIRST_MEMORY=true
if command -v system_profiler >/dev/null 2>&1; then
    MEMORY_INFO=$(system_profiler SPMemoryDataType -json 2>/dev/null)
    if [ $? -eq 0 ] && [ ""$MEMORY_INFO"" != """" ]; then
        # Parse memory slots
        echo ""$MEMORY_INFO"" | grep -E '""_name""|""dimm_size""|""dimm_speed""|""dimm_type""' | while IFS= read -r line; do
            if [[ ""$line"" =~ \""_name\"": ]]; then
                if [ ""$FIRST_MEMORY"" = false ]; then
                    echo ','
                fi
                FIRST_MEMORY=false
                
                SLOT_NAME=$(echo ""$line"" | cut -d'""' -f4)
                echo ""    {""
                echo ""      \""SlotName\"": \""$SLOT_NAME\""""
                echo ""    }""
            fi
        done
    fi
fi
echo '],'

# Graphics Information
echo '""Graphics"": ['
FIRST_GRAPHICS=true
if command -v system_profiler >/dev/null 2>&1; then
    GRAPHICS_INFO=$(system_profiler SPDisplaysDataType -json 2>/dev/null)
    if [ $? -eq 0 ] && [ ""$GRAPHICS_INFO"" != """" ]; then
        echo ""$GRAPHICS_INFO"" | grep -E '""_name""|""sppci_model""' | while IFS= read -r line; do
            if [[ ""$line"" =~ \""_name\"": ]]; then
                if [ ""$FIRST_GRAPHICS"" = false ]; then
                    echo ','
                fi
                FIRST_GRAPHICS=false
                
                GPU_NAME=$(echo ""$line"" | cut -d'""' -f4)
                echo ""    {""
                echo ""      \""GPUName\"": \""$GPU_NAME\""""
                echo ""    }""
            fi
        done
    fi
fi
echo '],'

# System Information using sysctl
echo '""SystemInfo"": {'
HOSTNAME=$(hostname 2>/dev/null || echo ""unknown"")
KERNEL_VERSION=$(uname -r 2>/dev/null || echo ""unknown"")
OS_VERSION=$(sw_vers -productVersion 2>/dev/null || echo ""unknown"")
OS_BUILD=$(sw_vers -buildVersion 2>/dev/null || echo ""unknown"")
HARDWARE_MODEL=$(sysctl -n hw.model 2>/dev/null || echo ""unknown"")
CPU_BRAND=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo ""unknown"")
CPU_CORES=$(sysctl -n hw.ncpu 2>/dev/null || echo ""unknown"")
PHYSICAL_MEMORY=$(sysctl -n hw.memsize 2>/dev/null || echo ""unknown"")

# Convert memory to GB
if [ ""$PHYSICAL_MEMORY"" != ""unknown"" ] && [ ""$PHYSICAL_MEMORY"" -gt 0 ]; then
    MEMORY_GB=$(echo ""scale=2; $PHYSICAL_MEMORY/1024/1024/1024"" | bc 2>/dev/null || echo ""0"")
else
    MEMORY_GB=""0""
fi

echo ""  \""Hostname\"": \""$HOSTNAME\"",""
echo ""  \""KernelVersion\"": \""$KERNEL_VERSION\"",""
echo ""  \""OSVersion\"": \""$OS_VERSION\"",""
echo ""  \""OSBuild\"": \""$OS_BUILD\"",""
echo ""  \""HardwareModel\"": \""$HARDWARE_MODEL\"",""
echo ""  \""CPUBrand\"": \""$CPU_BRAND\"",""
echo ""  \""CPUCores\"": $CPU_CORES,""
echo ""  \""PhysicalMemoryBytes\"": $PHYSICAL_MEMORY,""
echo ""  \""PhysicalMemoryGB\"": $MEMORY_GB""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "HardwareOverview", "Storage", "Memory", "Graphics", "SystemInfo" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "Platform" } }
        },
        Tags = new List<string> { "hardware", "discovery", "macos", "system_profiler", "sysctl", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateMacOSSoftwareDiscoveryScript() => new()
    {
        Name = "macOS Software Discovery - Bash",
        Description = "Comprehensive software discovery for macOS including installed applications and system software",
        Category = "Software Discovery",
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 40,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS Software Discovery Script
# Outputs comprehensive software information in JSON format

set -e

echo '{'

# Installed Applications
echo '""InstalledApplications"": ['
FIRST_APP=true
if [ -d ""/Applications"" ]; then
    find /Applications -name ""*.app"" -maxdepth 2 | while IFS= read -r app_path; do
        if [ ""$FIRST_APP"" = false ]; then
            echo ','
        fi
        FIRST_APP=false
        
        APP_NAME=$(basename ""$app_path"" .app)
        INFO_PLIST=""$app_path/Contents/Info.plist""
        
        VERSION=""unknown""
        BUNDLE_ID=""unknown""
        if [ -f ""$INFO_PLIST"" ]; then
            if command -v plutil >/dev/null 2>&1; then
                VERSION=$(plutil -extract CFBundleShortVersionString raw ""$INFO_PLIST"" 2>/dev/null || echo ""unknown"")
                BUNDLE_ID=$(plutil -extract CFBundleIdentifier raw ""$INFO_PLIST"" 2>/dev/null || echo ""unknown"")
            fi
        fi
        
        echo ""    {""
        echo ""      \""Name\"": \""$APP_NAME\"",""
        echo ""      \""Version\"": \""$VERSION\"",""
        echo ""      \""BundleIdentifier\"": \""$BUNDLE_ID\"",""
        echo ""      \""Path\"": \""$app_path\""""
        echo ""    }""
    done
fi
echo '],'

# System Software using system_profiler
echo '""SystemSoftware"": ['
FIRST_SOFTWARE=true
if command -v system_profiler >/dev/null 2>&1; then
    SOFTWARE_INFO=$(system_profiler SPSoftwareDataType -json 2>/dev/null)
    if [ $? -eq 0 ] && [ ""$SOFTWARE_INFO"" != """" ]; then
        SYSTEM_VERSION=$(echo ""$SOFTWARE_INFO"" | grep -o '""os_version"": ""[^""]*""' | cut -d'""' -f4)
        KERNEL_VERSION=$(echo ""$SOFTWARE_INFO"" | grep -o '""kernel_version"": ""[^""]*""' | cut -d'""' -f4)
        BOOT_VOLUME=$(echo ""$SOFTWARE_INFO"" | grep -o '""boot_volume"": ""[^""]*""' | cut -d'""' -f4)
        BOOT_MODE=$(echo ""$SOFTWARE_INFO"" | grep -o '""boot_mode"": ""[^""]*""' | cut -d'""' -f4)
        COMPUTER_NAME=$(echo ""$SOFTWARE_INFO"" | grep -o '""local_host_name"": ""[^""]*""' | cut -d'""' -f4)
        USER_NAME=$(echo ""$SOFTWARE_INFO"" | grep -o '""user_name"": ""[^""]*""' | cut -d'""' -f4)
        
        echo ""    {""
        echo ""      \""Type\"": \""System\"",""
        echo ""      \""OSVersion\"": \""$SYSTEM_VERSION\"",""
        echo ""      \""KernelVersion\"": \""$KERNEL_VERSION\"",""
        echo ""      \""BootVolume\"": \""$BOOT_VOLUME\"",""
        echo ""      \""BootMode\"": \""$BOOT_MODE\"",""
        echo ""      \""ComputerName\"": \""$COMPUTER_NAME\"",""
        echo ""      \""UserName\"": \""$USER_NAME\""""
        echo ""    }""
    fi
fi
echo '],'

# Homebrew Packages (if available)
echo '""HomebrewPackages"": ['
FIRST_BREW=true
if command -v brew >/dev/null 2>&1; then
    brew list --formula 2>/dev/null | while IFS= read -r package; do
        if [ ""$FIRST_BREW"" = false ]; then
            echo ','
        fi
        FIRST_BREW=false
        
        VERSION=$(brew list --versions ""$package"" 2>/dev/null | awk '{print $2}')
        
        echo ""    {""
        echo ""      \""Name\"": \""$package\"",""
        echo ""      \""Version\"": \""$VERSION\"",""
        echo ""      \""Type\"": \""Homebrew Formula\""""
        echo ""    }""
    done
fi
echo '],'

# Launch Agents and Daemons
echo '""LaunchItems"": ['
FIRST_LAUNCH=true

# System Launch Agents
if [ -d ""/System/Library/LaunchAgents"" ]; then
    find /System/Library/LaunchAgents -name ""*.plist"" | while IFS= read -r plist_file; do
        if [ ""$FIRST_LAUNCH"" = false ]; then
            echo ','
        fi
        FIRST_LAUNCH=false
        
        LABEL=$(basename ""$plist_file"" .plist)
        
        echo ""    {""
        echo ""      \""Label\"": \""$LABEL\"",""
        echo ""      \""Type\"": \""System Launch Agent\"",""
        echo ""      \""Path\"": \""$plist_file\""""
        echo ""    }""
    done
fi

# System Launch Daemons
if [ -d ""/System/Library/LaunchDaemons"" ]; then
    find /System/Library/LaunchDaemons -name ""*.plist"" | head -10 | while IFS= read -r plist_file; do
        if [ ""$FIRST_LAUNCH"" = false ]; then
            echo ','
        fi
        FIRST_LAUNCH=false
        
        LABEL=$(basename ""$plist_file"" .plist)
        
        echo ""    {""
        echo ""      \""Label\"": \""$LABEL\"",""
        echo ""      \""Type\"": \""System Launch Daemon\"",""
        echo ""      \""Path\"": \""$plist_file\""""
        echo ""    }""
    done
fi
echo '],'

# System Extensions
echo '""SystemExtensions"": ['
FIRST_EXT=true
if command -v systemextensionsctl >/dev/null 2>&1; then
    systemextensionsctl list 2>/dev/null | tail -n +2 | while IFS= read -r line; do
        if [ ""$line"" != """" ]; then
            if [ ""$FIRST_EXT"" = false ]; then
                echo ','
            fi
            FIRST_EXT=false
            
            BUNDLE_ID=$(echo ""$line"" | awk '{print $2}')
            VERSION=$(echo ""$line"" | awk '{print $3}')
            STATE=$(echo ""$line"" | awk '{print $4}')
            
            echo ""    {""
            echo ""      \""BundleIdentifier\"": \""$BUNDLE_ID\"",""
            echo ""      \""Version\"": \""$VERSION\"",""
            echo ""      \""State\"": \""$STATE\""""
            echo ""    }""
        fi
    done
fi
echo '],'

# Software Statistics
TOTAL_APPLICATIONS=$(find /Applications -name ""*.app"" -maxdepth 2 | wc -l | tr -d ' ')
TOTAL_HOMEBREW=0
if command -v brew >/dev/null 2>&1; then
    TOTAL_HOMEBREW=$(brew list --formula 2>/dev/null | wc -l | tr -d ' ')
fi

echo '""SoftwareStatistics"": {'
echo ""  \""TotalApplications\"": $TOTAL_APPLICATIONS,""
echo ""  \""TotalHomebrewPackages\"": $TOTAL_HOMEBREW""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "InstalledApplications", "SystemSoftware", "HomebrewPackages", "LaunchItems", "SoftwareStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "SoftwareStatistics.TotalApplications" } }
        },
        Tags = new List<string> { "software", "discovery", "macos", "applications", "homebrew", "launch", "extensions", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateMacOSNetworkDiscoveryScript() => new()
    {
        Name = "macOS Network Discovery - Bash",
        Description = "Comprehensive network discovery for macOS including interfaces, WiFi, and network services",
        Category = "Network Discovery",
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS Network Discovery Script
# Outputs comprehensive network information in JSON format

set -e

echo '{'

# Network Interfaces
echo '""NetworkInterfaces"": ['
FIRST_INTERFACE=true
if command -v ifconfig >/dev/null 2>&1; then
    ifconfig -a | grep -E '^[a-z]' | while IFS= read -r line; do
        if [ ""$FIRST_INTERFACE"" = false ]; then
            echo ','
        fi
        FIRST_INTERFACE=false
        
        INTERFACE=$(echo ""$line"" | awk '{print $1}' | tr -d ':')
        FLAGS=$(echo ""$line"" | grep -o 'flags=[^>]*>' | cut -d'=' -f2 | tr -d '>')
        
        # Get interface details
        INTERFACE_INFO=$(ifconfig ""$INTERFACE"" 2>/dev/null)
        INET_ADDR=$(echo ""$INTERFACE_INFO"" | grep 'inet ' | awk '{print $2}')
        NETMASK=$(echo ""$INTERFACE_INFO"" | grep 'inet ' | awk '{print $4}')
        ETHER_ADDR=$(echo ""$INTERFACE_INFO"" | grep 'ether ' | awk '{print $2}')
        STATUS=$(echo ""$INTERFACE_INFO"" | grep 'status: ' | cut -d' ' -f2)
        
        echo ""    {""
        echo ""      \""Interface\"": \""$INTERFACE\"",""
        echo ""      \""Flags\"": \""$FLAGS\"",""
        echo ""      \""IPAddress\"": \""$INET_ADDR\"",""
        echo ""      \""Netmask\"": \""$NETMASK\"",""
        echo ""      \""MACAddress\"": \""$ETHER_ADDR\"",""
        echo ""      \""Status\"": \""$STATUS\""""
        echo ""    }""
    done
fi
echo '],'

# WiFi Information
echo '""WiFiInformation"": {'
if command -v networksetup >/dev/null 2>&1; then
    WIFI_DEVICE=$(networksetup -listallhardwareports | grep -A 1 'Wi-Fi' | grep 'Device:' | awk '{print $2}')
    if [ ""$WIFI_DEVICE"" != """" ]; then
        WIFI_POWER=$(networksetup -getairportpower ""$WIFI_DEVICE"" 2>/dev/null | awk '{print $4}')
        
        # Get current WiFi network
        CURRENT_NETWORK=""unknown""
        if command -v /System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport >/dev/null 2>&1; then
            CURRENT_NETWORK=$(/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep ' SSID:' | awk '{print $2}')
        fi
        
        echo ""  \""Device\"": \""$WIFI_DEVICE\"",""
        echo ""  \""Power\"": \""$WIFI_POWER\"",""
        echo ""  \""CurrentNetwork\"": \""$CURRENT_NETWORK\""""
    else
        echo '""  \""Error\"": \""WiFi device not found\""""'
    fi
else
    echo '""  \""Error\"": \""networksetup not available\""""'
fi
echo '},'

# Network Services
echo '""NetworkServices"": ['
FIRST_SERVICE=true
if command -v networksetup >/dev/null 2>&1; then
    networksetup -listallnetworkservices | tail -n +2 | while IFS= read -r service; do
        if [ ""$FIRST_SERVICE"" = false ]; then
            echo ','
        fi
        FIRST_SERVICE=false
        
        # Get service configuration
        DHCP_INFO=$(networksetup -getinfo ""$service"" 2>/dev/null | grep 'DHCP Configuration')
        IP_ADDRESS=$(networksetup -getinfo ""$service"" 2>/dev/null | grep 'IP address:' | awk '{print $3}')
        SUBNET_MASK=$(networksetup -getinfo ""$service"" 2>/dev/null | grep 'Subnet mask:' | awk '{print $3}')
        ROUTER=$(networksetup -getinfo ""$service"" 2>/dev/null | grep 'Router:' | awk '{print $2}')
        
        echo ""    {""
        echo ""      \""ServiceName\"": \""$service\"",""
        echo ""      \""IPAddress\"": \""$IP_ADDRESS\"",""
        echo ""      \""SubnetMask\"": \""$SUBNET_MASK\"",""
        echo ""      \""Router\"": \""$ROUTER\"",""
        echo ""      \""UsesDHCP\"": ""$(if [ ""$DHCP_INFO"" != """" ]; then echo ""true""; else echo ""false""; fi)\""""
        echo ""    }""
    done
fi
echo '],'

# DNS Configuration
echo '""DNSConfiguration"": {'
if command -v scutil >/dev/null 2>&1; then
    DNS_SERVERS=$(scutil --dns | grep 'nameserver' | awk '{print $3}' | tr '\n' ',' | sed 's/,$//')
    SEARCH_DOMAINS=$(scutil --dns | grep 'search domain' | awk '{print $4}' | tr '\n' ',' | sed 's/,$//')
    
    echo ""  \""DNSServers\"": \""$DNS_SERVERS\"",""
    echo ""  \""SearchDomains\"": \""$SEARCH_DOMAINS\""""
else
    echo '""  \""Error\"": \""scutil not available\""""'
fi
echo '},'

# Active Network Connections
echo '""ActiveConnections"": ['
FIRST_CONNECTION=true
if command -v lsof >/dev/null 2>&1; then
    lsof -i -n | grep ESTABLISHED | head -20 | while IFS= read -r line; do
        if [ ""$FIRST_CONNECTION"" = false ]; then
            echo ','
        fi
        FIRST_CONNECTION=false
        
        PROCESS=$(echo ""$line"" | awk '{print $1}')
        PID=$(echo ""$line"" | awk '{print $2}')
        PROTOCOL=$(echo ""$line"" | awk '{print $5}' | cut -d'*' -f1)
        LOCAL_ADDRESS=$(echo ""$line"" | awk '{print $9}' | cut -d'-' -f1)
        REMOTE_ADDRESS=$(echo ""$line"" | awk '{print $9}' | cut -d'>' -f2)
        
        echo ""    {""
        echo ""      \""Process\"": \""$PROCESS\"",""
        echo ""      \""PID\"": $PID,""
        echo ""      \""Protocol\"": \""$PROTOCOL\"",""
        echo ""      \""LocalAddress\"": \""$LOCAL_ADDRESS\"",""
        echo ""      \""RemoteAddress\"": \""$REMOTE_ADDRESS\""""
        echo ""    }""
    done
elif command -v netstat >/dev/null 2>&1; then
    netstat -an | grep ESTABLISHED | head -20 | while IFS= read -r line; do
        if [ ""$FIRST_CONNECTION"" = false ]; then
            echo ','
        fi
        FIRST_CONNECTION=false
        
        PROTOCOL=$(echo ""$line"" | awk '{print $1}')
        LOCAL_ADDRESS=$(echo ""$line"" | awk '{print $4}')
        REMOTE_ADDRESS=$(echo ""$line"" | awk '{print $5}')
        STATE=$(echo ""$line"" | awk '{print $6}')
        
        echo ""    {""
        echo ""      \""Protocol\"": \""$PROTOCOL\"",""
        echo ""      \""LocalAddress\"": \""$LOCAL_ADDRESS\"",""
        echo ""      \""RemoteAddress\"": \""$REMOTE_ADDRESS\"",""
        echo ""      \""State\"": \""$STATE\""""
        echo ""    }""
    done
fi
echo '],'

# Firewall Status
echo '""FirewallStatus"": {'
if command -v /usr/libexec/ApplicationFirewall/socketfilterfw >/dev/null 2>&1; then
    FIREWALL_STATE=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null | awk '{print $3}')
    STEALTH_MODE=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getstealthmode 2>/dev/null | awk '{print $3}')
    
    echo ""  \""GlobalState\"": \""$FIREWALL_STATE\"",""
    echo ""  \""StealthMode\"": \""$STEALTH_MODE\""""
else
    echo '""  \""Error\"": \""Firewall information not accessible\""""'
fi
echo '},'

# Network Statistics
HOSTNAME=$(hostname)
COMPUTER_NAME=$(scutil --get ComputerName 2>/dev/null || echo ""unknown"")
LOCAL_HOSTNAME=$(scutil --get LocalHostName 2>/dev/null || echo ""unknown"")

echo '""NetworkStatistics"": {'
echo ""  \""Hostname\"": \""$HOSTNAME\"",""
echo ""  \""ComputerName\"": \""$COMPUTER_NAME\"",""
echo ""  \""LocalHostName\"": \""$LOCAL_HOSTNAME\""""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "NetworkInterfaces", "WiFiInformation", "NetworkServices", "DNSConfiguration", "ActiveConnections" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "Platform" } }
        },
        Tags = new List<string> { "network", "discovery", "macos", "wifi", "dns", "interfaces", "connections", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateMacOSSecurityDiscoveryScript() => new()
    {
        Name = "macOS Security Discovery - Bash",
        Description = "Comprehensive security discovery for macOS including firewall, Gatekeeper, and system integrity",
        Category = "Security Discovery",
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 35,
        RequiresElevation = true,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS Security Discovery Script
# Outputs comprehensive security information in JSON format
# Requires elevated privileges for complete security assessment

set -e

echo '{'

# Gatekeeper Status
echo '""GatekeeperStatus"": {'
if command -v spctl >/dev/null 2>&1; then
    GATEKEEPER_STATUS=$(spctl --status 2>/dev/null | awk '{print $2}')
    
    echo ""  \""Status\"": \""$GATEKEEPER_STATUS\""""
else
    echo '""  \""Error\"": \""spctl not available\""""'
fi
echo '},'

# System Integrity Protection (SIP)
echo '""SystemIntegrityProtection"": {'
if command -v csrutil >/dev/null 2>&1; then
    SIP_STATUS=$(csrutil status 2>/dev/null | awk '{print $5}' | tr -d '.')
    
    echo ""  \""Status\"": \""$SIP_STATUS\""""
else
    echo '""  \""Error\"": \""csrutil not available\""""'
fi
echo '},'

# FileVault Status
echo '""FileVaultStatus"": {'
if command -v fdesetup >/dev/null 2>&1; then
    FILEVAULT_STATUS=$(fdesetup status 2>/dev/null | head -1)
    
    echo ""  \""Status\"": \""$FILEVAULT_STATUS\""""
else
    echo '""  \""Error\"": \""fdesetup not available\""""'
fi
echo '},'

# User Accounts
echo '""UserAccounts"": ['
FIRST_USER=true
if command -v dscl >/dev/null 2>&1; then
    dscl . list /Users | grep -v '^_' | while IFS= read -r username; do
        if [ ""$FIRST_USER"" = false ]; then
            echo ','
        fi
        FIRST_USER=false
        
        USER_ID=$(dscl . read /Users/""$username"" UniqueID 2>/dev/null | awk '{print $2}')
        REAL_NAME=$(dscl . read /Users/""$username"" RealName 2>/dev/null | cut -d':' -f2 | sed 's/^ *//')
        USER_SHELL=$(dscl . read /Users/""$username"" UserShell 2>/dev/null | awk '{print $2}')
        HOME_DIR=$(dscl . read /Users/""$username"" NFSHomeDirectory 2>/dev/null | awk '{print $2}')
        
        # Check if user is admin
        IS_ADMIN=""false""
        if dscl . read /Groups/admin GroupMembership 2>/dev/null | grep -q ""$username""; then
            IS_ADMIN=""true""
        fi
        
        echo ""    {""
        echo ""      \""Username\"": \""$username\"",""
        echo ""      \""UserID\"": $USER_ID,""
        echo ""      \""RealName\"": \""$REAL_NAME\"",""
        echo ""      \""Shell\"": \""$USER_SHELL\"",""
        echo ""      \""HomeDirectory\"": \""$HOME_DIR\"",""
        echo ""      \""IsAdmin\"": $IS_ADMIN""
        echo ""    }""
    done
fi
echo '],'

# Security Updates
echo '""SecurityUpdates"": ['
FIRST_UPDATE=true
if command -v softwareupdate >/dev/null 2>&1; then
    softwareupdate -l 2>/dev/null | grep -E '^\s*\*.*recommended' | head -10 | while IFS= read -r line; do
        if [ ""$FIRST_UPDATE"" = false ]; then
            echo ','
        fi
        FIRST_UPDATE=false
        
        UPDATE_NAME=$(echo ""$line"" | sed 's/^\s*\* //' | sed 's/-.*//')
        UPDATE_SIZE=$(echo ""$line"" | grep -o '[0-9]*K\|[0-9]*M\|[0-9]*G' | head -1)
        
        echo ""    {""
        echo ""      \""UpdateName\"": \""$UPDATE_NAME\"",""
        echo ""      \""Size\"": \""$UPDATE_SIZE\""""
        echo ""    }""
    done
fi
echo '],'

# Running Processes (Security-relevant)
echo '""SecurityProcesses"": ['
FIRST_PROC=true
ps aux | grep -E '(SecurityAgent|authd|securityd|trustd)' | grep -v grep | while IFS= read -r line; do
    if [ ""$FIRST_PROC"" = false ]; then
        echo ','
    fi
    FIRST_PROC=false
    
    USER=$(echo ""$line"" | awk '{print $1}')
    PID=$(echo ""$line"" | awk '{print $2}')
    COMMAND=$(echo ""$line"" | awk '{print $11}')
    
    echo ""    {""
    echo ""      \""User\"": \""$USER\"",""
    echo ""      \""PID\"": $PID,""
    echo ""      \""Command\"": \""$COMMAND\""""
    echo ""    }""
done
echo '],'

# Installed Security Software
echo '""SecuritySoftware"": ['
FIRST_SECURITY=true

# Check for common security applications
SECURITY_APPS=(""CrowdStrike Falcon"" ""Carbon Black"" ""Sophos"" ""Trend Micro"" ""Symantec"" ""McAfee"" ""Bitdefender"" ""ESET"" ""Kaspersky"")
for app in ""${SECURITY_APPS[@]}""; do
    if find /Applications -name ""*$app*"" -type d 2>/dev/null | grep -q ""$app""; then
        if [ ""$FIRST_SECURITY"" = false ]; then
            echo ','
        fi
        FIRST_SECURITY=false
        
        APP_PATH=$(find /Applications -name ""*$app*"" -type d | head -1)
        
        echo ""    {""
        echo ""      \""Name\"": \""$app\"",""
        echo ""      \""Path\"": \""$APP_PATH\"",""
        echo ""      \""Type\"": \""Endpoint Security\""""
        echo ""    }""
    fi
done
echo '],'

# Keychain Information
echo '""KeychainInfo"": ['
FIRST_KEYCHAIN=true
if command -v security >/dev/null 2>&1; then
    security list-keychains 2>/dev/null | while IFS= read -r keychain; do
        if [ ""$FIRST_KEYCHAIN"" = false ]; then
            echo ','
        fi
        FIRST_KEYCHAIN=false
        
        KEYCHAIN_PATH=$(echo ""$keychain"" | tr -d '""' | sed 's/^[ \t]*//')
        KEYCHAIN_NAME=$(basename ""$KEYCHAIN_PATH"")
        
        echo ""    {""
        echo ""      \""Name\"": \""$KEYCHAIN_NAME\"",""
        echo ""      \""Path\"": \""$KEYCHAIN_PATH\""""
        echo ""    }""
    done
fi
echo '],'

# Privacy and Security Settings
echo '""PrivacySettings"": {'
# Check some basic privacy settings using defaults
ANALYTICS_ENABLED=$(defaults read com.apple.SubmitDiagInfo AutoSubmit 2>/dev/null || echo ""unknown"")
LOCATION_SERVICES=$(defaults read com.apple.MCX DisableLocationServices 2>/dev/null || echo ""unknown"")

echo ""  \""AnalyticsEnabled\"": \""$ANALYTICS_ENABLED\"",""
echo ""  \""LocationServicesDisabled\"": \""$LOCATION_SERVICES\""""
echo '},'

# Security Statistics
TOTAL_USERS=$(dscl . list /Users | grep -v '^_' | wc -l | tr -d ' ')
ADMIN_USERS=0
if command -v dscl >/dev/null 2>&1; then
    ADMIN_USERS=$(dscl . read /Groups/admin GroupMembership 2>/dev/null | wc -w | tr -d ' ')
fi

echo '""SecurityStatistics"": {'
echo ""  \""TotalUsers\"": $TOTAL_USERS,""
echo ""  \""AdminUsers\"": $ADMIN_USERS""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS"",""RequiredElevation"": true'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "GatekeeperStatus", "SystemIntegrityProtection", "FileVaultStatus", "UserAccounts", "SecuritySoftware" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "RequiredElevation" } }
        },
        Tags = new List<string> { "security", "discovery", "macos", "gatekeeper", "sip", "filevault", "users", "keychain", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS", "GDPR" }
    };

    private DiscoveryScriptTemplate CreateMacOSServicesDiscoveryScript() => new()
    {
        Name = "macOS Services Discovery - Bash",
        Description = "Comprehensive discovery of macOS services including Launch Agents, Launch Daemons, and running processes",
        Category = "Services Discovery", 
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS Services Discovery Script
# Outputs comprehensive service information in JSON format

set -e

echo '{'

# Launch Agents (User)
echo '""LaunchAgents"": ['
FIRST_AGENT=true
if [ -d ""$HOME/Library/LaunchAgents"" ]; then
    find ""$HOME/Library/LaunchAgents"" -name ""*.plist"" | while IFS= read -r plist_file; do
        if [ ""$FIRST_AGENT"" = false ]; then
            echo ','
        fi
        FIRST_AGENT=false
        
        LABEL=$(basename ""$plist_file"" .plist)
        
        # Check if loaded
        LOADED=""false""
        if launchctl list | grep -q ""$LABEL""; then
            LOADED=""true""
        fi
        
        echo ""    {""
        echo ""      \""Label\"": \""$LABEL\"",""
        echo ""      \""Path\"": \""$plist_file\"",""
        echo ""      \""Type\"": \""User Launch Agent\"",""
        echo ""      \""Loaded\"": $LOADED""
        echo ""    }""
    done
fi

# System Launch Agents
if [ -d ""/Library/LaunchAgents"" ]; then
    find ""/Library/LaunchAgents"" -name ""*.plist"" | while IFS= read -r plist_file; do
        if [ ""$FIRST_AGENT"" = false ]; then
            echo ','
        fi
        FIRST_AGENT=false
        
        LABEL=$(basename ""$plist_file"" .plist)
        
        # Check if loaded
        LOADED=""false""
        if launchctl list | grep -q ""$LABEL""; then
            LOADED=""true""
        fi
        
        echo ""    {""
        echo ""      \""Label\"": \""$LABEL\"",""
        echo ""      \""Path\"": \""$plist_file\"",""
        echo ""      \""Type\"": \""System Launch Agent\"",""
        echo ""      \""Loaded\"": $LOADED""
        echo ""    }""
    done
fi
echo '],'

# Launch Daemons
echo '""LaunchDaemons"": ['
FIRST_DAEMON=true
if [ -d ""/Library/LaunchDaemons"" ]; then
    find ""/Library/LaunchDaemons"" -name ""*.plist"" | head -20 | while IFS= read -r plist_file; do
        if [ ""$FIRST_DAEMON"" = false ]; then
            echo ','
        fi
        FIRST_DAEMON=false
        
        LABEL=$(basename ""$plist_file"" .plist)
        
        # Check if loaded
        LOADED=""false""
        if sudo launchctl list 2>/dev/null | grep -q ""$LABEL""; then
            LOADED=""true""
        fi
        
        echo ""    {""
        echo ""      \""Label\"": \""$LABEL\"",""
        echo ""      \""Path\"": \""$plist_file\"",""
        echo ""      \""Type\"": \""Launch Daemon\"",""
        echo ""      \""Loaded\"": $LOADED""
        echo ""    }""
    done
fi
echo '],'

# Running Processes
echo '""RunningProcesses"": ['
FIRST_PROCESS=true
ps aux | head -31 | tail -30 | while IFS= read -r line; do
    if [ ""$FIRST_PROCESS"" = false ]; then
        echo ','
    fi
    FIRST_PROCESS=false
    
    USER=$(echo ""$line"" | awk '{print $1}')
    PID=$(echo ""$line"" | awk '{print $2}')
    CPU=$(echo ""$line"" | awk '{print $3}')
    MEM=$(echo ""$line"" | awk '{print $4}')
    COMMAND=$(echo ""$line"" | awk '{print $11}' | sed 's/""/\\\\""/g')
    
    echo ""    {""
    echo ""      \""User\"": \""$USER\"",""
    echo ""      \""PID\"": $PID,""
    echo ""      \""CPUPercent\"": \""$CPU\"",""
    echo ""      \""MemoryPercent\"": \""$MEM\"",""
    echo ""      \""Command\"": \""$COMMAND\""""
    echo ""    }""
done
echo '],'

# Loaded Launch Services
echo '""LoadedServices"": ['
FIRST_LOADED=true
launchctl list | tail -n +2 | head -20 | while IFS= read -r line; do
    if [ ""$FIRST_LOADED"" = false ]; then
        echo ','
    fi
    FIRST_LOADED=false
    
    PID=$(echo ""$line"" | awk '{print $1}')
    STATUS=$(echo ""$line"" | awk '{print $2}')
    LABEL=$(echo ""$line"" | awk '{print $3}')
    
    echo ""    {""
    echo ""      \""PID\"": \""$PID\"",""
    echo ""      \""Status\"": \""$STATUS\"",""
    echo ""      \""Label\"": \""$LABEL\""""
    echo ""    }""
done
echo '],'

# System Services Status
echo '""SystemServices"": ['
FIRST_SYSTEM=true

# Check some common system services
SYSTEM_SERVICES=(""com.apple.loginwindow"" ""com.apple.WindowServer"" ""com.apple.Finder"" ""com.apple.Dock"" ""com.apple.SystemUIServer"")
for service in ""${SYSTEM_SERVICES[@]}""; do
    if [ ""$FIRST_SYSTEM"" = false ]; then
        echo ','
    fi
    FIRST_SYSTEM=false
    
    # Check if service is running
    RUNNING=""false""
    SERVICE_PID=""""
    if launchctl list | grep -q ""$service""; then
        RUNNING=""true""
        SERVICE_PID=$(launchctl list | grep ""$service"" | awk '{print $1}')
    fi
    
    echo ""    {""
    echo ""      \""ServiceName\"": \""$service\"",""
    echo ""      \""Running\"": $RUNNING,""
    echo ""      \""PID\"": \""$SERVICE_PID\""""
    echo ""    }""
done
echo '],'

# Network Services
echo '""NetworkServices"": ['
FIRST_NET=true
if command -v lsof >/dev/null 2>&1; then
    lsof -i -P | grep LISTEN | head -10 | while IFS= read -r line; do
        if [ ""$FIRST_NET"" = false ]; then
            echo ','
        fi
        FIRST_NET=false
        
        PROCESS=$(echo ""$line"" | awk '{print $1}')
        PID=$(echo ""$line"" | awk '{print $2}')
        PROTOCOL=$(echo ""$line"" | awk '{print $5}')
        ADDRESS=$(echo ""$line"" | awk '{print $9}')
        
        echo ""    {""
        echo ""      \""Process\"": \""$PROCESS\"",""
        echo ""      \""PID\"": $PID,""
        echo ""      \""Protocol\"": \""$PROTOCOL\"",""
        echo ""      \""Address\"": \""$ADDRESS\""""
        echo ""    }""
    done
fi
echo '],'

# Service Statistics
TOTAL_PROCESSES=$(ps aux | wc -l)
TOTAL_LAUNCH_AGENTS=0
TOTAL_LAUNCH_DAEMONS=0
LOADED_SERVICES=$(launchctl list | wc -l)

if [ -d ""$HOME/Library/LaunchAgents"" ]; then
    USER_AGENTS=$(find ""$HOME/Library/LaunchAgents"" -name ""*.plist"" | wc -l)
    TOTAL_LAUNCH_AGENTS=$((TOTAL_LAUNCH_AGENTS + USER_AGENTS))
fi

if [ -d ""/Library/LaunchAgents"" ]; then
    SYSTEM_AGENTS=$(find ""/Library/LaunchAgents"" -name ""*.plist"" | wc -l)
    TOTAL_LAUNCH_AGENTS=$((TOTAL_LAUNCH_AGENTS + SYSTEM_AGENTS))
fi

if [ -d ""/Library/LaunchDaemons"" ]; then
    TOTAL_LAUNCH_DAEMONS=$(find ""/Library/LaunchDaemons"" -name ""*.plist"" | wc -l)
fi

echo '""ServiceStatistics"": {'
echo ""  \""TotalProcesses\"": $TOTAL_PROCESSES,""
echo ""  \""TotalLaunchAgents\"": $TOTAL_LAUNCH_AGENTS,""
echo ""  \""TotalLaunchDaemons\"": $TOTAL_LAUNCH_DAEMONS,""
echo ""  \""LoadedServices\"": $LOADED_SERVICES""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "LaunchAgents", "LaunchDaemons", "RunningProcesses", "LoadedServices", "ServiceStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "ServiceStatistics.TotalProcesses" } }
        },
        Tags = new List<string> { "services", "discovery", "macos", "launch", "daemons", "agents", "processes", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateMacOSProcessDiscoveryScript() => new()
    {
        Name = "macOS Process Discovery - Bash",
        Description = "Comprehensive discovery of running processes including resource usage and process hierarchy",
        Category = "Process Discovery",
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS Process Discovery Script
# Outputs comprehensive process information in JSON format

set -e

echo '{'

# Running Processes (detailed)
echo '""RunningProcesses"": ['
FIRST_PROCESS=true
ps aux | head -51 | tail -50 | while IFS= read -r line; do
    if [ ""$FIRST_PROCESS"" = false ]; then
        echo ','
    fi
    FIRST_PROCESS=false
    
    USER=$(echo ""$line"" | awk '{print $1}')
    PID=$(echo ""$line"" | awk '{print $2}')
    CPU=$(echo ""$line"" | awk '{print $3}')
    MEM=$(echo ""$line"" | awk '{print $4}')
    VSZ=$(echo ""$line"" | awk '{print $5}')
    RSS=$(echo ""$line"" | awk '{print $6}')
    TT=$(echo ""$line"" | awk '{print $7}')
    STAT=$(echo ""$line"" | awk '{print $8}')
    STARTED=$(echo ""$line"" | awk '{print $9}')
    TIME=$(echo ""$line"" | awk '{print $10}')
    COMMAND=$(echo ""$line"" | cut -d' ' -f11- | sed 's/""/\\\\""/g')
    
    echo ""    {""
    echo ""      \""User\"": \""$USER\"",""
    echo ""      \""PID\"": $PID,""
    echo ""      \""CPUPercent\"": \""$CPU\"",""
    echo ""      \""MemoryPercent\"": \""$MEM\"",""
    echo ""      \""VirtualMemoryKB\"": $VSZ,""
    echo ""      \""ResidentMemoryKB\"": $RSS,""
    echo ""      \""Terminal\"": \""$TT\"",""
    echo ""      \""Status\"": \""$STAT\"",""
    echo ""      \""Started\"": \""$STARTED\"",""
    echo ""      \""CPUTime\"": \""$TIME\"",""
    echo ""      \""Command\"": \""$COMMAND\""""
    echo ""    }""
done
echo '],'

# Top Processes by CPU
echo '""TopProcessesByCPU"": ['
FIRST_CPU=true
ps aux | sort -k3 -nr | head -11 | tail -10 | while IFS= read -r line; do
    if [ ""$FIRST_CPU"" = false ]; then
        echo ','
    fi
    FIRST_CPU=false
    
    USER=$(echo ""$line"" | awk '{print $1}')
    PID=$(echo ""$line"" | awk '{print $2}')
    CPU=$(echo ""$line"" | awk '{print $3}')
    COMMAND=$(echo ""$line"" | awk '{print $11}' | sed 's/""/\\\\""/g')
    
    echo ""    {""
    echo ""      \""User\"": \""$USER\"",""
    echo ""      \""PID\"": $PID,""
    echo ""      \""CPUPercent\"": \""$CPU\"",""
    echo ""      \""Command\"": \""$COMMAND\""""
    echo ""    }""
done
echo '],'

# Top Processes by Memory
echo '""TopProcessesByMemory"": ['
FIRST_MEM=true
ps aux | sort -k4 -nr | head -11 | tail -10 | while IFS= read -r line; do
    if [ ""$FIRST_MEM"" = false ]; then
        echo ','
    fi
    FIRST_MEM=false
    
    USER=$(echo ""$line"" | awk '{print $1}')
    PID=$(echo ""$line"" | awk '{print $2}')
    MEM=$(echo ""$line"" | awk '{print $4}')
    RSS=$(echo ""$line"" | awk '{print $6}')
    COMMAND=$(echo ""$line"" | awk '{print $11}' | sed 's/""/\\\\""/g')
    
    RSS_MB=$(echo ""scale=2; $RSS/1024"" | bc 2>/dev/null || echo ""0"")
    
    echo ""    {""
    echo ""      \""User\"": \""$USER\"",""
    echo ""      \""PID\"": $PID,""
    echo ""      \""MemoryPercent\"": \""$MEM\"",""
    echo ""      \""ResidentMemoryMB\"": $RSS_MB,""
    echo ""      \""Command\"": \""$COMMAND\""""
    echo ""    }""
done
echo '],'

# Process Tree (using pstree if available, otherwise ps)
echo '""ProcessTree"": ['
FIRST_TREE=true
if command -v pstree >/dev/null 2>&1; then
    pstree -p | head -20 | while IFS= read -r line; do
        if [ ""$FIRST_TREE"" = false ]; then
            echo ','
        fi
        FIRST_TREE=false
        
        # Extract PID and process name from pstree output
        PROCESS=$(echo ""$line"" | sed 's/.*├─\|.*└─\|.*─//' | sed 's/(.*//')
        PID=$(echo ""$line"" | grep -o '([0-9]*)' | tr -d '()')
        
        echo ""    {""
        echo ""      \""Process\"": \""$PROCESS\"",""
        echo ""      \""PID\"": \""$PID\"",""
        echo ""      \""TreeLine\"": \""$line\""""
        echo ""    }""
    done
else
    # Fallback to ps hierarchy
    ps -eo pid,ppid,comm | head -21 | tail -20 | while IFS= read -r line; do
        if [ ""$FIRST_TREE"" = false ]; then
            echo ','
        fi
        FIRST_TREE=false
        
        PID=$(echo ""$line"" | awk '{print $1}')
        PPID=$(echo ""$line"" | awk '{print $2}')
        COMMAND=$(echo ""$line"" | awk '{print $3}')
        
        echo ""    {""
        echo ""      \""PID\"": $PID,""
        echo ""      \""PPID\"": $PPID,""
        echo ""      \""Command\"": \""$COMMAND\""""
        echo ""    }""
    done
fi
echo '],'

# System Load and Performance
echo '""SystemLoad"": {'
LOAD_AVG=$(uptime | awk -F'load averages:' '{print $2}' | tr -d ' ')
LOAD_1MIN=$(echo ""$LOAD_AVG"" | cut -d',' -f1)
LOAD_5MIN=$(echo ""$LOAD_AVG"" | cut -d',' -f2)
LOAD_15MIN=$(echo ""$LOAD_AVG"" | cut -d',' -f3)

# Get CPU count
CPU_COUNT=$(sysctl -n hw.ncpu 2>/dev/null || echo ""unknown"")

echo ""  \""Load1Min\"": \""$LOAD_1MIN\"",""
echo ""  \""Load5Min\"": \""$LOAD_5MIN\"",""
echo ""  \""Load15Min\"": \""$LOAD_15MIN\"",""
echo ""  \""CPUCount\"": $CPU_COUNT""
echo '},'

# Memory Usage
echo '""MemoryUsage"": {'
if command -v vm_stat >/dev/null 2>&1; then
    VM_STAT=$(vm_stat)
    
    PAGE_SIZE=$(vm_stat | grep ""page size"" | awk '{print $8}')
    PAGES_FREE=$(echo ""$VM_STAT"" | grep ""Pages free"" | awk '{print $3}' | tr -d '.')
    PAGES_ACTIVE=$(echo ""$VM_STAT"" | grep ""Pages active"" | awk '{print $3}' | tr -d '.')
    PAGES_INACTIVE=$(echo ""$VM_STAT"" | grep ""Pages inactive"" | awk '{print $3}' | tr -d '.')
    PAGES_WIRED=$(echo ""$VM_STAT"" | grep ""Pages wired down"" | awk '{print $4}' | tr -d '.')
    PAGES_COMPRESSED=$(echo ""$VM_STAT"" | grep ""Pages stored in compressor"" | awk '{print $5}' | tr -d '.')
    
    # Calculate memory in bytes
    if [ ""$PAGE_SIZE"" != """" ] && [ ""$PAGES_FREE"" != """" ]; then
        FREE_BYTES=$((PAGES_FREE * PAGE_SIZE))
        ACTIVE_BYTES=$((PAGES_ACTIVE * PAGE_SIZE))
        INACTIVE_BYTES=$((PAGES_INACTIVE * PAGE_SIZE))
        WIRED_BYTES=$((PAGES_WIRED * PAGE_SIZE))
        COMPRESSED_BYTES=$((PAGES_COMPRESSED * PAGE_SIZE))
        
        FREE_MB=$(echo ""scale=2; $FREE_BYTES/1024/1024"" | bc 2>/dev/null || echo ""0"")
        ACTIVE_MB=$(echo ""scale=2; $ACTIVE_BYTES/1024/1024"" | bc 2>/dev/null || echo ""0"")
        INACTIVE_MB=$(echo ""scale=2; $INACTIVE_BYTES/1024/1024"" | bc 2>/dev/null || echo ""0"")
        WIRED_MB=$(echo ""scale=2; $WIRED_BYTES/1024/1024"" | bc 2>/dev/null || echo ""0"")
        COMPRESSED_MB=$(echo ""scale=2; $COMPRESSED_BYTES/1024/1024"" | bc 2>/dev/null || echo ""0"")
        
        echo ""  \""PageSize\"": $PAGE_SIZE,""
        echo ""  \""FreeMemoryMB\"": $FREE_MB,""
        echo ""  \""ActiveMemoryMB\"": $ACTIVE_MB,""
        echo ""  \""InactiveMemoryMB\"": $INACTIVE_MB,""
        echo ""  \""WiredMemoryMB\"": $WIRED_MB,""
        echo ""  \""CompressedMemoryMB\"": $COMPRESSED_MB""
    else
        echo '""  \""Error\"": \""Unable to calculate memory usage\""""'
    fi
else
    echo '""  \""Error\"": \""vm_stat not available\""""'
fi
echo '},'

# Process Statistics
TOTAL_PROCESSES=$(ps aux | wc -l | tr -d ' ')
USER_PROCESSES=$(ps aux | grep -v ""^root"" | wc -l | tr -d ' ')
ROOT_PROCESSES=$(ps aux | grep ""^root"" | wc -l | tr -d ' ')

echo '""ProcessStatistics"": {'
echo ""  \""TotalProcesses\"": $TOTAL_PROCESSES,""
echo ""  \""UserProcesses\"": $USER_PROCESSES,""
echo ""  \""RootProcesses\"": $ROOT_PROCESSES""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "RunningProcesses", "TopProcessesByCPU", "TopProcessesByMemory", "SystemLoad", "ProcessStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "ProcessStatistics.TotalProcesses" } }
        },
        Tags = new List<string> { "processes", "discovery", "macos", "memory", "cpu", "performance", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateMacOSSystemInfoDiscoveryScript() => new()
    {
        Name = "macOS System Information Discovery - Bash",
        Description = "Comprehensive system information discovery for macOS including OS details, hardware, and environment",
        Category = "System Discovery",
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 25,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS System Information Discovery Script
# Outputs comprehensive system information in JSON format

set -e

echo '{'

# System Overview
echo '""SystemOverview"": {'
HOSTNAME=$(hostname)
OS_VERSION=$(sw_vers -productVersion 2>/dev/null || echo ""unknown"")
OS_BUILD=$(sw_vers -buildVersion 2>/dev/null || echo ""unknown"")
OS_NAME=$(sw_vers -productName 2>/dev/null || echo ""unknown"")
KERNEL_VERSION=$(uname -r)
ARCHITECTURE=$(uname -m)
UPTIME=$(uptime | awk '{print $3"" ""$4}' | tr -d ',')

echo ""  \""Hostname\"": \""$HOSTNAME\"",""
echo ""  \""OSName\"": \""$OS_NAME\"",""
echo ""  \""OSVersion\"": \""$OS_VERSION\"",""
echo ""  \""OSBuild\"": \""$OS_BUILD\"",""
echo ""  \""KernelVersion\"": \""$KERNEL_VERSION\"",""
echo ""  \""Architecture\"": \""$ARCHITECTURE\"",""
echo ""  \""Uptime\"": \""$UPTIME\""""
echo '},'

# Hardware Information
echo '""HardwareInfo"": {'
MODEL_NAME=$(system_profiler SPHardwareDataType | grep ""Model Name"" | awk -F': ' '{print $2}')
MODEL_ID=$(system_profiler SPHardwareDataType | grep ""Model Identifier"" | awk -F': ' '{print $2}')
PROCESSOR=$(system_profiler SPHardwareDataType | grep ""Processor Name"" | awk -F': ' '{print $2}')
PROCESSOR_SPEED=$(system_profiler SPHardwareDataType | grep ""Processor Speed"" | awk -F': ' '{print $2}')
NUMBER_PROCESSORS=$(system_profiler SPHardwareDataType | grep ""Number of Processors"" | awk -F': ' '{print $2}')
TOTAL_CORES=$(system_profiler SPHardwareDataType | grep ""Total Number of Cores"" | awk -F': ' '{print $2}')
MEMORY=$(system_profiler SPHardwareDataType | grep ""Memory"" | awk -F': ' '{print $2}')
SERIAL_NUMBER=$(system_profiler SPHardwareDataType | grep ""Serial Number"" | awk -F': ' '{print $2}')

echo ""  \""ModelName\"": \""$MODEL_NAME\"",""
echo ""  \""ModelIdentifier\"": \""$MODEL_ID\"",""
echo ""  \""Processor\"": \""$PROCESSOR\"",""
echo ""  \""ProcessorSpeed\"": \""$PROCESSOR_SPEED\"",""
echo ""  \""NumberOfProcessors\"": \""$NUMBER_PROCESSORS\"",""
echo ""  \""TotalCores\"": \""$TOTAL_CORES\"",""
echo ""  \""Memory\"": \""$MEMORY\"",""
echo ""  \""SerialNumber\"": \""$SERIAL_NUMBER\""""
echo '},'

# Environment Variables
echo '""Environment"": {'
USER_NAME=""$USER""
HOME_DIR=""$HOME""
SHELL_VAR=""$SHELL""
PATH_VAR=""$PATH""
LANG_VAR=""$LANG""
TERM_VAR=""$TERM""

echo ""  \""User\"": \""$USER_NAME\"",""
echo ""  \""Home\"": \""$HOME_DIR\"",""
echo ""  \""Shell\"": \""$SHELL_VAR\"",""
echo ""  \""Language\"": \""$LANG_VAR\"",""
echo ""  \""Terminal\"": \""$TERM_VAR\"",""
echo ""  \""Path\"": \""$PATH_VAR\""""
echo '},'

# Disk Information
echo '""DiskInfo"": ['
FIRST_DISK=true
df -h | tail -n +2 | while IFS= read -r line; do
    if [[ ""$line"" =~ ^/dev/ ]]; then
        if [ ""$FIRST_DISK"" = false ]; then
            echo ','
        fi
        FIRST_DISK=false
        
        FILESYSTEM=$(echo ""$line"" | awk '{print $1}')
        SIZE=$(echo ""$line"" | awk '{print $2}')
        USED=$(echo ""$line"" | awk '{print $3}')
        AVAILABLE=$(echo ""$line"" | awk '{print $4}')
        USE_PERCENT=$(echo ""$line"" | awk '{print $5}')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $9}')
        
        echo ""    {""
        echo ""      \""Filesystem\"": \""$FILESYSTEM\"",""
        echo ""      \""Size\"": \""$SIZE\"",""
        echo ""      \""Used\"": \""$USED\"",""
        echo ""      \""Available\"": \""$AVAILABLE\"",""
        echo ""      \""UsePercent\"": \""$USE_PERCENT\"",""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\""""
        echo ""    }""
    fi
done
echo '],'

# Network Configuration
echo '""NetworkConfig"": {'
COMPUTER_NAME=$(scutil --get ComputerName 2>/dev/null || echo ""unknown"")
LOCAL_HOSTNAME=$(scutil --get LocalHostName 2>/dev/null || echo ""unknown"")
PRIMARY_INTERFACE=$(route get default | grep interface | awk '{print $2}')
PRIMARY_IP=$(ifconfig ""$PRIMARY_INTERFACE"" 2>/dev/null | grep 'inet ' | awk '{print $2}')

echo ""  \""ComputerName\"": \""$COMPUTER_NAME\"",""
echo ""  \""LocalHostName\"": \""$LOCAL_HOSTNAME\"",""
echo ""  \""PrimaryInterface\"": \""$PRIMARY_INTERFACE\"",""
echo ""  \""PrimaryIPAddress\"": \""$PRIMARY_IP\""""
echo '},'

# System Preferences
echo '""SystemPreferences"": {'
TIMEZONE=$(systemsetup -gettimezone 2>/dev/null | awk -F': ' '{print $2}')
SLEEP_SETTINGS=$(pmset -g | grep -E ""sleep|standby"" | head -3 | tr '\n' '; ')
ENERGY_SAVER=$(pmset -g ps | head -1)

echo ""  \""Timezone\"": \""$TIMEZONE\"",""
echo ""  \""SleepSettings\"": \""$SLEEP_SETTINGS\"",""
echo ""  \""PowerSource\"": \""$ENERGY_SAVER\""""
echo '},'

# Boot Information
echo '""BootInfo"": {'
BOOT_VOLUME=$(diskutil info / | grep ""Volume Name"" | awk -F': ' '{print $2}' | sed 's/^[ \t]*//')
BOOT_TIME=$(sysctl kern.boottime | awk '{print $5}' | tr -d ',')
SYSTEM_UPTIME=$(uptime | awk '{print $3"" ""$4}' | tr -d ',')

echo ""  \""BootVolume\"": \""$BOOT_VOLUME\"",""
echo ""  \""BootTime\"": \""$BOOT_TIME\"",""
echo ""  \""SystemUptime\"": \""$SYSTEM_UPTIME\""""
echo '},'

# System Performance
echo '""SystemPerformance"": {'
CPU_USAGE=$(ps aux | awk '{sum += $3} END {print sum""%""}')
MEMORY_PRESSURE=$(memory_pressure | grep ""System-wide memory free percentage"" | awk '{print $5}' | tr -d '%')
LOAD_AVERAGE=$(uptime | awk -F'load averages:' '{print $2}' | tr -d ' ')

echo ""  \""CPUUsage\"": \""$CPU_USAGE\"",""
echo ""  \""MemoryFreePercent\"": \""$MEMORY_PRESSURE\"",""
echo ""  \""LoadAverage\"": \""$LOAD_AVERAGE\""""
echo '},'

# System Configuration
echo '""SystemConfiguration"": {'
SIP_STATUS=$(csrutil status 2>/dev/null | awk '{print $5}' | tr -d '.' || echo ""unknown"")
GATEKEEPER_STATUS=$(spctl --status 2>/dev/null | awk '{print $2}' || echo ""unknown"")
FILEVAULT_STATUS=$(fdesetup status 2>/dev/null || echo ""unknown"")

echo ""  \""SIPStatus\"": \""$SIP_STATUS\"",""
echo ""  \""GatekeeperStatus\"": \""$GATEKEEPER_STATUS\"",""
echo ""  \""FileVaultStatus\"": \""$FILEVAULT_STATUS\""""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "SystemOverview", "HardwareInfo", "Environment", "DiskInfo", "NetworkConfig", "SystemConfiguration" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "SystemOverview.OSVersion" } }
        },
        Tags = new List<string> { "system", "discovery", "macos", "hardware", "environment", "configuration", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateMacOSUserAccountDiscoveryScript() => new()
    {
        Name = "macOS User Account Discovery - Bash",
        Description = "Comprehensive discovery of macOS user accounts, groups, and login information",
        Category = "User Account Discovery",
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 25,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS User Account Discovery Script
# Outputs comprehensive user account information in JSON format

set -e

echo '{'

# User Accounts
echo '""UserAccounts"": ['
FIRST_USER=true
if command -v dscl >/dev/null 2>&1; then
    dscl . list /Users | grep -v '^_' | while IFS= read -r username; do
        if [ ""$FIRST_USER"" = false ]; then
            echo ','
        fi
        FIRST_USER=false
        
        USER_ID=$(dscl . read /Users/""$username"" UniqueID 2>/dev/null | awk '{print $2}')
        REAL_NAME=$(dscl . read /Users/""$username"" RealName 2>/dev/null | cut -d':' -f2 | sed 's/^ *//' | tr -d '\n')
        USER_SHELL=$(dscl . read /Users/""$username"" UserShell 2>/dev/null | awk '{print $2}')
        HOME_DIR=$(dscl . read /Users/""$username"" NFSHomeDirectory 2>/dev/null | awk '{print $2}')
        GENERATED_UID=$(dscl . read /Users/""$username"" GeneratedUID 2>/dev/null | awk '{print $2}')
        
        # Check if user is admin
        IS_ADMIN=""false""
        if dscl . read /Groups/admin GroupMembership 2>/dev/null | grep -q ""$username""; then
            IS_ADMIN=""true""
        fi
        
        # Check if user can login
        CAN_LOGIN=""true""
        if [[ ""$USER_SHELL"" == ""/usr/bin/false"" ]] || [[ ""$USER_SHELL"" == ""/dev/null"" ]]; then
            CAN_LOGIN=""false""
        fi
        
        # Get last login time if available
        LAST_LOGIN=""unknown""
        if command -v last >/dev/null 2>&1; then
            LAST_LOGIN=$(last ""$username"" | head -1 | awk '{print $4"" ""$5"" ""$6"" ""$7}' 2>/dev/null || echo ""unknown"")
        fi
        
        echo ""    {""
        echo ""      \""Username\"": \""$username\"",""
        echo ""      \""UserID\"": $USER_ID,""
        echo ""      \""RealName\"": \""$REAL_NAME\"",""
        echo ""      \""Shell\"": \""$USER_SHELL\"",""
        echo ""      \""HomeDirectory\"": \""$HOME_DIR\"",""
        echo ""      \""GeneratedUID\"": \""$GENERATED_UID\"",""
        echo ""      \""IsAdmin\"": $IS_ADMIN,""
        echo ""      \""CanLogin\"": $CAN_LOGIN,""
        echo ""      \""LastLogin\"": \""$LAST_LOGIN\""""
        echo ""    }""
    done
fi
echo '],'

# Groups
echo '""Groups"": ['
FIRST_GROUP=true
if command -v dscl >/dev/null 2>&1; then
    dscl . list /Groups | head -20 | while IFS= read -r groupname; do
        if [ ""$FIRST_GROUP"" = false ]; then
            echo ','
        fi
        FIRST_GROUP=false
        
        GROUP_ID=$(dscl . read /Groups/""$groupname"" PrimaryGroupID 2>/dev/null | awk '{print $2}')
        REAL_NAME=$(dscl . read /Groups/""$groupname"" RealName 2>/dev/null | cut -d':' -f2 | sed 's/^ *//' | tr -d '\n')
        MEMBERS=$(dscl . read /Groups/""$groupname"" GroupMembership 2>/dev/null | cut -d':' -f2 | sed 's/^ *//' | tr '\n' ',' | sed 's/,$//')
        
        echo ""    {""
        echo ""      \""GroupName\"": \""$groupname\"",""
        echo ""      \""GroupID\"": $GROUP_ID,""
        echo ""      \""RealName\"": \""$REAL_NAME\"",""
        echo ""      \""Members\"": \""$MEMBERS\""""
        echo ""    }""
    done
fi
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
    who | while IFS= read -r line; do
        if [ ""$FIRST_LOGIN"" = false ]; then
            echo ','
        fi
        FIRST_LOGIN=false
        
        USERNAME=$(echo ""$line"" | awk '{print $1}')
        TERMINAL=$(echo ""$line"" | awk '{print $2}')
        LOGIN_TIME=$(echo ""$line"" | awk '{print $3"" ""$4}')
        
        echo ""    {""
        echo ""      \""Username\"": \""$USERNAME\"",""
        echo ""      \""Terminal\"": \""$TERMINAL\"",""
        echo ""      \""LoginTime\"": \""$LOGIN_TIME\""""
        echo ""    }""
    done
fi
echo '],'

# Fast User Switching Information
echo '""FastUserSwitching"": {'
if command -v defaults >/dev/null 2>&1; then
    FUS_ENABLED=$(defaults read /Library/Preferences/com.apple.loginwindow.plist MultipleSessionEnabled 2>/dev/null || echo ""false"")
    DISPLAY_USERS=$(defaults read /Library/Preferences/com.apple.loginwindow.plist SHOWOTHERUSERS_MANAGED 2>/dev/null || echo ""unknown"")
    
    echo ""  \""Enabled\"": $FUS_ENABLED,""
    echo ""  \""ShowOtherUsers\"": \""$DISPLAY_USERS\""""
else
    echo '""  \""Error\"": \""Unable to read Fast User Switching settings\""""'
fi
echo '},'

# Login Items (for current user)
echo '""LoginItems"": ['
FIRST_LOGIN_ITEM=true
if command -v osascript >/dev/null 2>&1; then
    osascript -e 'tell application ""System Events"" to get the name of every login item' 2>/dev/null | tr ',' '\n' | while IFS= read -r item; do
        if [ ""$item"" != """" ]; then
            if [ ""$FIRST_LOGIN_ITEM"" = false ]; then
                echo ','
            fi
            FIRST_LOGIN_ITEM=false
            
            ITEM_NAME=$(echo ""$item"" | sed 's/^[ \t]*//' | sed 's/[ \t]*$//')
            
            echo ""    {""
            echo ""      \""Name\"": \""$ITEM_NAME\"",""
            echo ""      \""Type\"": \""Login Item\""""
            echo ""    }""
        fi
    done
fi
echo '],'

# SSH Keys (for current user)
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
            KEY_SIZE=$(ssh-keygen -lf ""$key_file"" 2>/dev/null | awk '{print $1}')
            
            echo ""    {""
            echo ""      \""Filename\"": \""$KEY_FILENAME\"",""
            echo ""      \""Type\"": \""$KEY_TYPE\"",""
            echo ""      \""Size\"": \""$KEY_SIZE\"",""
            echo ""      \""Comment\"": \""$KEY_COMMENT\""""
            echo ""    }""
        fi
    done
fi
echo '],'

# User Statistics
TOTAL_USERS=0
ADMIN_USERS=0
SYSTEM_USERS=0
REGULAR_USERS=0
CURRENTLY_LOGGED_IN=0

if command -v dscl >/dev/null 2>&1; then
    TOTAL_USERS=$(dscl . list /Users | grep -v '^_' | wc -l | tr -d ' ')
    ADMIN_USERS=$(dscl . read /Groups/admin GroupMembership 2>/dev/null | wc -w | tr -d ' ')
    SYSTEM_USERS=$(dscl . list /Users | grep '^_' | wc -l | tr -d ' ')
    REGULAR_USERS=$((TOTAL_USERS - ADMIN_USERS))
fi

if command -v who >/dev/null 2>&1; then
    CURRENTLY_LOGGED_IN=$(who | wc -l | tr -d ' ')
fi

echo '""UserStatistics"": {'
echo ""  \""TotalUsers\"": $TOTAL_USERS,""
echo ""  \""AdminUsers\"": $ADMIN_USERS,""
echo ""  \""RegularUsers\"": $REGULAR_USERS,""
echo ""  \""SystemUsers\"": $SYSTEM_USERS,""
echo ""  \""CurrentlyLoggedIn\"": $CURRENTLY_LOGGED_IN""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "UserAccounts", "Groups", "CurrentUser", "LoggedInUsers", "UserStatistics" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "UserStatistics.TotalUsers" } }
        },
        Tags = new List<string> { "users", "discovery", "macos", "accounts", "groups", "login", "ssh", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS" }
    };

    private DiscoveryScriptTemplate CreateMacOSPerformanceDiscoveryScript() => new()
    {
        Name = "macOS Performance Discovery - Bash",
        Description = "Comprehensive performance monitoring including CPU, memory, disk, and network statistics for macOS",
        Category = "Performance Discovery",
        Type = "bash",
        TargetOS = "macos",
        EstimatedRunTimeSeconds = 35,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/bin/bash
# macOS Performance Discovery Script
# Outputs comprehensive performance metrics in JSON format

set -e

echo '{'

# CPU Performance
echo '""CPUPerformance"": {'
CPU_COUNT=$(sysctl -n hw.ncpu)
CPU_BRAND=$(sysctl -n machdep.cpu.brand_string)
CPU_FREQ=$(sysctl -n hw.cpufrequency 2>/dev/null || echo ""unknown"")

# Get CPU usage using iostat (1 second sample)
if command -v iostat >/dev/null 2>&1; then
    CPU_STATS=$(iostat -c 1 2 | tail -1)
    USER_CPU=$(echo ""$CPU_STATS"" | awk '{print $1}')
    SYSTEM_CPU=$(echo ""$CPU_STATS"" | awk '{print $2}')
    IDLE_CPU=$(echo ""$CPU_STATS"" | awk '{print $3}')
else
    USER_CPU=""unknown""
    SYSTEM_CPU=""unknown""
    IDLE_CPU=""unknown""
fi

# Load averages
LOAD_AVG=$(uptime | awk -F'load averages:' '{print $2}' | tr -d ' ')
LOAD_1MIN=$(echo ""$LOAD_AVG"" | cut -d',' -f1)
LOAD_5MIN=$(echo ""$LOAD_AVG"" | cut -d',' -f2)
LOAD_15MIN=$(echo ""$LOAD_AVG"" | cut -d',' -f3)

echo ""  \""CPUCount\"": $CPU_COUNT,""
echo ""  \""CPUBrand\"": \""$CPU_BRAND\"",""
echo ""  \""CPUFrequency\"": \""$CPU_FREQ\"",""
echo ""  \""UserCPUPercent\"": \""$USER_CPU\"",""
echo ""  \""SystemCPUPercent\"": \""$SYSTEM_CPU\"",""
echo ""  \""IdleCPUPercent\"": \""$IDLE_CPU\"",""
echo ""  \""Load1Min\"": \""$LOAD_1MIN\"",""
echo ""  \""Load5Min\"": \""$LOAD_5MIN\"",""
echo ""  \""Load15Min\"": \""$LOAD_15MIN\""""
echo '},'

# Memory Performance
echo '""MemoryPerformance"": {'
PHYSICAL_MEMORY=$(sysctl -n hw.memsize)
PHYSICAL_MEMORY_GB=$(echo ""scale=2; $PHYSICAL_MEMORY/1024/1024/1024"" | bc 2>/dev/null || echo ""0"")

if command -v vm_stat >/dev/null 2>&1; then
    VM_STAT=$(vm_stat)
    
    PAGE_SIZE=$(vm_stat | grep ""page size"" | awk '{print $8}')
    PAGES_FREE=$(echo ""$VM_STAT"" | grep ""Pages free"" | awk '{print $3}' | tr -d '.')
    PAGES_ACTIVE=$(echo ""$VM_STAT"" | grep ""Pages active"" | awk '{print $3}' | tr -d '.')
    PAGES_INACTIVE=$(echo ""$VM_STAT"" | grep ""Pages inactive"" | awk '{print $3}' | tr -d '.')
    PAGES_WIRED=$(echo ""$VM_STAT"" | grep ""Pages wired down"" | awk '{print $4}' | tr -d '.')
    PAGES_COMPRESSED=$(echo ""$VM_STAT"" | grep ""Pages stored in compressor"" | awk '{print $5}' | tr -d '.')
    PAGES_SWAPINS=$(echo ""$VM_STAT"" | grep ""Swapins"" | awk '{print $2}' | tr -d '.')
    PAGES_SWAPOUTS=$(echo ""$VM_STAT"" | grep ""Swapouts"" | awk '{print $2}' | tr -d '.')
    
    # Calculate memory in bytes and convert to GB
    if [ ""$PAGE_SIZE"" != """" ] && [ ""$PAGES_FREE"" != """" ]; then
        FREE_BYTES=$((PAGES_FREE * PAGE_SIZE))
        ACTIVE_BYTES=$((PAGES_ACTIVE * PAGE_SIZE))
        INACTIVE_BYTES=$((PAGES_INACTIVE * PAGE_SIZE))
        WIRED_BYTES=$((PAGES_WIRED * PAGE_SIZE))
        COMPRESSED_BYTES=$((PAGES_COMPRESSED * PAGE_SIZE))
        
        FREE_GB=$(echo ""scale=2; $FREE_BYTES/1024/1024/1024"" | bc 2>/dev/null || echo ""0"")
        ACTIVE_GB=$(echo ""scale=2; $ACTIVE_BYTES/1024/1024/1024"" | bc 2>/dev/null || echo ""0"")
        INACTIVE_GB=$(echo ""scale=2; $INACTIVE_BYTES/1024/1024/1024"" | bc 2>/dev/null || echo ""0"")
        WIRED_GB=$(echo ""scale=2; $WIRED_BYTES/1024/1024/1024"" | bc 2>/dev/null || echo ""0"")
        COMPRESSED_GB=$(echo ""scale=2; $COMPRESSED_BYTES/1024/1024/1024"" | bc 2>/dev/null || echo ""0"")
        
        # Calculate memory pressure
        USED_MEMORY=$((ACTIVE_BYTES + INACTIVE_BYTES + WIRED_BYTES))
        MEMORY_PRESSURE=$(echo ""scale=2; $USED_MEMORY * 100 / $PHYSICAL_MEMORY"" | bc 2>/dev/null || echo ""0"")
        
        echo ""  \""PhysicalMemoryGB\"": $PHYSICAL_MEMORY_GB,""
        echo ""  \""FreeMemoryGB\"": $FREE_GB,""
        echo ""  \""ActiveMemoryGB\"": $ACTIVE_GB,""
        echo ""  \""InactiveMemoryGB\"": $INACTIVE_GB,""
        echo ""  \""WiredMemoryGB\"": $WIRED_GB,""
        echo ""  \""CompressedMemoryGB\"": $COMPRESSED_GB,""
        echo ""  \""MemoryPressurePercent\"": $MEMORY_PRESSURE,""
        echo ""  \""SwapIns\"": $PAGES_SWAPINS,""
        echo ""  \""SwapOuts\"": $PAGES_SWAPOUTS""
    else
        echo '""  \""Error\"": \""Unable to calculate memory statistics\""""'
    fi
else
    echo '""  \""Error\"": \""vm_stat not available\""""'
fi
echo '},'

# Disk I/O Performance
echo '""DiskIOPerformance"": ['
FIRST_DISK=true
if command -v iostat >/dev/null 2>&1; then
    iostat -d 1 2 | tail -n +3 | grep -E '^disk[0-9]' | while IFS= read -r line; do
        if [ ""$FIRST_DISK"" = false ]; then
            echo ','
        fi
        FIRST_DISK=false
        
        DEVICE=$(echo ""$line"" | awk '{print $1}')
        KB_READ=$(echo ""$line"" | awk '{print $2}')
        KB_WRITTEN=$(echo ""$line"" | awk '{print $3}')
        
        echo ""    {""
        echo ""      \""Device\"": \""$DEVICE\"",""
        echo ""      \""KBytesRead\"": \""$KB_READ\"",""
        echo ""      \""KBytesWritten\"": \""$KB_WRITTEN\""""
        echo ""    }""
    done
fi
echo '],'

# Disk Space Usage
echo '""DiskSpaceUsage"": ['
FIRST_MOUNT=true
df -h | tail -n +2 | while IFS= read -r line; do
    if [[ ""$line"" =~ ^/dev/ ]]; then
        if [ ""$FIRST_MOUNT"" = false ]; then
            echo ','
        fi
        FIRST_MOUNT=false
        
        FILESYSTEM=$(echo ""$line"" | awk '{print $1}')
        SIZE=$(echo ""$line"" | awk '{print $2}')
        USED=$(echo ""$line"" | awk '{print $3}')
        AVAILABLE=$(echo ""$line"" | awk '{print $4}')
        USE_PERCENT=$(echo ""$line"" | awk '{print $5}' | tr -d '%')
        MOUNTPOINT=$(echo ""$line"" | awk '{print $9}')
        
        echo ""    {""
        echo ""      \""Filesystem\"": \""$FILESYSTEM\"",""
        echo ""      \""Size\"": \""$SIZE\"",""
        echo ""      \""Used\"": \""$USED\"",""
        echo ""      \""Available\"": \""$AVAILABLE\"",""
        echo ""      \""UsePercent\"": $USE_PERCENT,""
        echo ""      \""Mountpoint\"": \""$MOUNTPOINT\""""
        echo ""    }""
    fi
done
echo '],'

# Network Performance
echo '""NetworkPerformance"": ['
FIRST_NET=true
if command -v netstat >/dev/null 2>&1; then
    netstat -i | tail -n +2 | grep -v lo0 | while IFS= read -r line; do
        if [ ""$FIRST_NET"" = false ]; then
            echo ','
        fi
        FIRST_NET=false
        
        INTERFACE=$(echo ""$line"" | awk '{print $1}')
        MTU=$(echo ""$line"" | awk '{print $2}')
        NETWORK=$(echo ""$line"" | awk '{print $3}')
        ADDRESS=$(echo ""$line"" | awk '{print $4}')
        IPKTS=$(echo ""$line"" | awk '{print $5}')
        IERRS=$(echo ""$line"" | awk '{print $6}')
        OPKTS=$(echo ""$line"" | awk '{print $7}')
        OERRS=$(echo ""$line"" | awk '{print $8}')
        COLLS=$(echo ""$line"" | awk '{print $9}')
        
        echo ""    {""
        echo ""      \""Interface\"": \""$INTERFACE\"",""
        echo ""      \""MTU\"": $MTU,""
        echo ""      \""Network\"": \""$NETWORK\"",""
        echo ""      \""Address\"": \""$ADDRESS\"",""
        echo ""      \""InputPackets\"": $IPKTS,""
        echo ""      \""InputErrors\"": $IERRS,""
        echo ""      \""OutputPackets\"": $OPKTS,""
        echo ""      \""OutputErrors\"": $OERRS,""
        echo ""      \""Collisions\"": $COLLS""
        echo ""    }""
    done
fi
echo '],'

# Top Processes by CPU
echo '""TopProcessesByCPU"": ['
FIRST_CPU_PROC=true
ps aux | sort -k3 -nr | head -11 | tail -10 | while IFS= read -r line; do
    if [ ""$FIRST_CPU_PROC"" = false ]; then
        echo ','
    fi
    FIRST_CPU_PROC=false
    
    USER=$(echo ""$line"" | awk '{print $1}')
    PID=$(echo ""$line"" | awk '{print $2}')
    CPU=$(echo ""$line"" | awk '{print $3}')
    MEM=$(echo ""$line"" | awk '{print $4}')
    COMMAND=$(echo ""$line"" | awk '{print $11}' | sed 's/""/\\\\""/g')
    
    echo ""    {""
    echo ""      \""User\"": \""$USER\"",""
    echo ""      \""PID\"": $PID,""
    echo ""      \""CPUPercent\"": \""$CPU\"",""
    echo ""      \""MemoryPercent\"": \""$MEM\"",""
    echo ""      \""Command\"": \""$COMMAND\""""
    echo ""    }""
done
echo '],'

# Top Processes by Memory
echo '""TopProcessesByMemory"": ['
FIRST_MEM_PROC=true
ps aux | sort -k4 -nr | head -11 | tail -10 | while IFS= read -r line; do
    if [ ""$FIRST_MEM_PROC"" = false ]; then
        echo ','
    fi
    FIRST_MEM_PROC=false
    
    USER=$(echo ""$line"" | awk '{print $1}')
    PID=$(echo ""$line"" | awk '{print $2}')
    CPU=$(echo ""$line"" | awk '{print $3}')
    MEM=$(echo ""$line"" | awk '{print $4}')
    RSS=$(echo ""$line"" | awk '{print $6}')
    COMMAND=$(echo ""$line"" | awk '{print $11}' | sed 's/""/\\\\""/g')
    
    RSS_MB=$(echo ""scale=2; $RSS/1024"" | bc 2>/dev/null || echo ""0"")
    
    echo ""    {""
    echo ""      \""User\"": \""$USER\"",""
    echo ""      \""PID\"": $PID,""
    echo ""      \""CPUPercent\"": \""$CPU\"",""
    echo ""      \""MemoryPercent\"": \""$MEM\"",""
    echo ""      \""ResidentMemoryMB\"": $RSS_MB,""
    echo ""      \""Command\"": \""$COMMAND\""""
    echo ""    }""
done
echo '],'

# System Performance Summary
UPTIME_INFO=$(uptime)
BOOT_TIME=$(sysctl kern.boottime | awk '{print $5}' | tr -d ',')
TOTAL_PROCESSES=$(ps aux | wc -l | tr -d ' ')

echo '""PerformanceSummary"": {'
echo ""  \""UptimeInfo\"": \""$UPTIME_INFO\"",""
echo ""  \""BootTime\"": \""$BOOT_TIME\"",""
echo ""  \""TotalProcesses\"": $TOTAL_PROCESSES,""
echo ""  \""SampleDuration\"": ""1-2 seconds\""""
echo '},'

# Add metadata
echo '""DiscoveryTimestamp"": ""'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"",""ScriptVersion"": ""1.0.0"",'
echo '""ComputerName"": ""'$(hostname)'"",""Platform"": ""macOS""'

echo '}'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "CPUPerformance", "MemoryPerformance", "DiskIOPerformance", "NetworkPerformance", "TopProcessesByCPU" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "PerformanceSummary.TotalProcesses" } }
        },
        Tags = new List<string> { "performance", "discovery", "macos", "cpu", "memory", "disk", "network", "monitoring", "bash" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    // Python Cross-platform Scripts  
    private DiscoveryScriptTemplate CreatePythonSystemInfoDiscoveryScript() => new()
    {
        Name = "Cross-Platform System Discovery - Python",
        Description = "Comprehensive cross-platform system information discovery using Python standard libraries",
        Category = "System Discovery",
        Type = "python",
        TargetOS = "cross-platform",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/usr/bin/env python3
import json
import platform
import psutil
import socket
import os
import sys
from datetime import datetime, timezone

def get_system_info():
    """"""Collect comprehensive cross-platform system information""""""
    
    # System Information
    system_info = {
        ""hostname"": socket.gethostname(),
        ""platform"": platform.platform(),
        ""system"": platform.system(),
        ""release"": platform.release(),
        ""version"": platform.version(),
        ""machine"": platform.machine(),
        ""processor"": platform.processor(),
        ""architecture"": platform.architecture(),
        ""python_version"": platform.python_version(),
        ""python_build"": platform.python_build(),
    }
    
    # CPU Information
    cpu_info = {
        ""physical_cores"": psutil.cpu_count(logical=False),
        ""total_cores"": psutil.cpu_count(logical=True),
        ""max_frequency"": psutil.cpu_freq().max if psutil.cpu_freq() else None,
        ""min_frequency"": psutil.cpu_freq().min if psutil.cpu_freq() else None,
        ""current_frequency"": psutil.cpu_freq().current if psutil.cpu_freq() else None,
        ""cpu_usage"": psutil.cpu_percent(interval=1, percpu=True),
        ""cpu_usage_total"": psutil.cpu_percent(interval=1)
    }
    
    # Memory Information
    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    memory_info = {
        ""total"": memory.total,
        ""available"": memory.available,
        ""used"": memory.used,
        ""free"": memory.free,
        ""percentage"": memory.percent,
        ""swap_total"": swap.total,
        ""swap_used"": swap.used,
        ""swap_free"": swap.free,
        ""swap_percentage"": swap.percent
    }
    
    # Disk Information
    disk_info = []
    for partition in psutil.disk_partitions():
        try:
            partition_usage = psutil.disk_usage(partition.mountpoint)
            disk_info.append({
                ""device"": partition.device,
                ""mountpoint"": partition.mountpoint,
                ""file_system"": partition.fstype,
                ""total_size"": partition_usage.total,
                ""used"": partition_usage.used,
                ""free"": partition_usage.free,
                ""percentage"": (partition_usage.used / partition_usage.total) * 100
            })
        except PermissionError:
            continue
    
    # Network Information
    network_info = []
    for interface_name, interface_addresses in psutil.net_if_addrs().items():
        interface_stats = psutil.net_if_stats()[interface_name]
        interface_data = {
            ""interface"": interface_name,
            ""is_up"": interface_stats.isup,
            ""speed"": interface_stats.speed,
            ""mtu"": interface_stats.mtu,
            ""addresses"": []
        }
        
        for address in interface_addresses:
            interface_data[""addresses""].append({
                ""family"": str(address.family),
                ""address"": address.address,
                ""netmask"": address.netmask,
                ""broadcast"": address.broadcast
            })
        
        network_info.append(interface_data)
    
    # Boot Time
    boot_time = datetime.fromtimestamp(psutil.boot_time(), tz=timezone.utc)
    
    # Environment Variables (selected)
    env_info = {
        ""PATH"": os.environ.get(""PATH"", """"),
        ""HOME"": os.environ.get(""HOME"", os.environ.get(""USERPROFILE"", """")),
        ""USER"": os.environ.get(""USER"", os.environ.get(""USERNAME"", """")),
        ""SHELL"": os.environ.get(""SHELL"", """"),
        ""LANG"": os.environ.get(""LANG"", """"),
        ""TZ"": os.environ.get(""TZ"", """")
    }
    
    # Compile all information
    discovery_data = {
        ""DiscoveryTimestamp"": datetime.now(timezone.utc).isoformat(),
        ""ScriptVersion"": ""1.0.0"",
        ""ComputerName"": socket.gethostname(),
        ""Platform"": platform.system(),
        ""SystemInfo"": system_info,
        ""CPUInfo"": cpu_info,
        ""MemoryInfo"": memory_info,
        ""DiskInfo"": disk_info,
        ""NetworkInfo"": network_info,
        ""BootTime"": boot_time.isoformat(),
        ""Environment"": env_info
    }
    
    return discovery_data

if __name__ == ""__main__"":
    try:
        data = get_system_info()
        print(json.dumps(data, indent=2, default=str))
    except Exception as e:
        error_data = {
            ""error"": str(e),
            ""error_type"": type(e).__name__,
            ""DiscoveryTimestamp"": datetime.now(timezone.utc).isoformat(),
            ""ComputerName"": socket.gethostname(),
            ""Platform"": platform.system()
        }
        print(json.dumps(error_data, indent=2))
        sys.exit(1)",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "SystemInfo", "CPUInfo", "MemoryInfo", "DiskInfo", "NetworkInfo" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "Platform" } }
        },
        Tags = new List<string> { "system", "discovery", "python", "cross-platform", "psutil", "hardware", "performance" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreatePythonNetworkDiscoveryScript() => new()
    {
        Name = "Cross-Platform Network Discovery - Python",
        Description = "Comprehensive network discovery using Python psutil for cross-platform compatibility",
        Category = "Network Discovery",
        Type = "python",
        TargetOS = "cross-platform",
        EstimatedRunTimeSeconds = 25,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/usr/bin/env python3
import json
import psutil
import socket
import platform
from datetime import datetime, timezone

def get_network_info():
    """"""Collect comprehensive network information across platforms""""""
    
    # Network Interfaces
    network_interfaces = []
    if_addrs = psutil.net_if_addrs()
    if_stats = psutil.net_if_stats()
    
    for interface_name, addresses in if_addrs.items():
        stats = if_stats.get(interface_name)
        
        interface_data = {
            ""interface_name"": interface_name,
            ""is_up"": stats.isup if stats else False,
            ""speed"": stats.speed if stats else 0,
            ""mtu"": stats.mtu if stats else 0,
            ""duplex"": str(stats.duplex) if stats else ""unknown"",
            ""addresses"": []
        }
        
        for addr in addresses:
            address_info = {
                ""family"": str(addr.family),
                ""address"": addr.address,
                ""netmask"": addr.netmask,
                ""broadcast"": addr.broadcast,
                ""ptp"": addr.ptp
            }
            interface_data[""addresses""].append(address_info)
        
        network_interfaces.append(interface_data)
    
    # Network I/O Statistics
    net_io = psutil.net_io_counters(pernic=True)
    network_io_stats = []
    
    for interface, stats in net_io.items():
        io_data = {
            ""interface"": interface,
            ""bytes_sent"": stats.bytes_sent,
            ""bytes_recv"": stats.bytes_recv,
            ""packets_sent"": stats.packets_sent,
            ""packets_recv"": stats.packets_recv,
            ""errin"": stats.errin,
            ""errout"": stats.errout,
            ""dropin"": stats.dropin,
            ""dropout"": stats.dropout
        }
        network_io_stats.append(io_data)
    
    # Active Network Connections
    connections = []
    try:
        for conn in psutil.net_connections(kind=""inet""):
            connection_data = {
                ""family"": str(conn.family),
                ""type"": str(conn.type),
                ""local_address"": f""{conn.laddr.ip}:{conn.laddr.port}"" if conn.laddr else None,
                ""remote_address"": f""{conn.raddr.ip}:{conn.raddr.port}"" if conn.raddr else None,
                ""status"": conn.status,
                ""pid"": conn.pid
            }
            connections.append(connection_data)
    except (psutil.AccessDenied, OSError):
        # Some systems require elevated privileges for connection info
        connections.append({""error"": ""Access denied - elevated privileges required""})
    
    # System Network Configuration
    hostname = socket.gethostname()
    try:
        fqdn = socket.getfqdn()
    except:
        fqdn = hostname
    
    try:
        local_ip = socket.gethostbyname(hostname)
    except:
        local_ip = ""127.0.0.1""
    
    # DNS Configuration (platform-specific)
    dns_servers = []
    if platform.system() == ""Windows"":
        try:
            import winreg
            reg_key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, 
                r""SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters"")
            dns_str, _ = winreg.QueryValueEx(reg_key, ""NameServer"")
            if dns_str:
                dns_servers = dns_str.split("","")
            winreg.CloseKey(reg_key)
        except:
            pass
    else:
        # Unix-like systems
        try:
            with open(""/etc/resolv.conf"", ""r"") as f:
                for line in f:
                    if line.startswith(""nameserver""):
                        dns_servers.append(line.split()[1])
        except:
            pass
    
    # Compile network discovery data
    discovery_data = {
        ""DiscoveryTimestamp"": datetime.now(timezone.utc).isoformat(),
        ""ScriptVersion"": ""1.0.0"",
        ""ComputerName"": hostname,
        ""Platform"": platform.system(),
        ""NetworkInterfaces"": network_interfaces,
        ""NetworkIOStats"": network_io_stats,
        ""ActiveConnections"": connections[:50],  # Limit to first 50 connections
        ""NetworkConfiguration"": {
            ""hostname"": hostname,
            ""fqdn"": fqdn,
            ""local_ip"": local_ip,
            ""dns_servers"": dns_servers
        },
        ""NetworkSummary"": {
            ""total_interfaces"": len(network_interfaces),
            ""active_interfaces"": len([i for i in network_interfaces if i[""is_up""]]),
            ""total_connections"": len(connections),
            ""total_bytes_sent"": sum(s[""bytes_sent""] for s in network_io_stats),
            ""total_bytes_recv"": sum(s[""bytes_recv""] for s in network_io_stats)
        }
    }
    
    return discovery_data

if __name__ == ""__main__"":
    try:
        data = get_network_info()
        print(json.dumps(data, indent=2, default=str))
    except Exception as e:
        error_data = {
            ""error"": str(e),
            ""error_type"": type(e).__name__,
            ""DiscoveryTimestamp"": datetime.now(timezone.utc).isoformat(),
            ""ComputerName"": socket.gethostname(),
            ""Platform"": platform.system()
        }
        print(json.dumps(error_data, indent=2))
        sys.exit(1)",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "NetworkInterfaces", "NetworkIOStats", "ActiveConnections", "NetworkConfiguration" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "NetworkSummary.total_interfaces" } }
        },
        Tags = new List<string> { "network", "discovery", "python", "cross-platform", "psutil", "connections", "interfaces" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreatePythonProcessDiscoveryScript() => new()
    {
        Name = "Cross-Platform Process Discovery - Python",
        Description = "Comprehensive process and service discovery using Python psutil across all platforms",
        Category = "Process Discovery",
        Type = "python",
        TargetOS = "cross-platform",
        EstimatedRunTimeSeconds = 35,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/usr/bin/env python3
import json
import psutil
import socket
import platform
import os
from datetime import datetime, timezone

def get_process_info():
    """"""Collect comprehensive process and service information""""""
    
    # Running Processes
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'username', 'status', 'create_time', 
                                   'cpu_percent', 'memory_percent', 'memory_info', 'cmdline']):
        try:
            process_info = proc.info
            process_data = {
                ""pid"": process_info['pid'],
                ""name"": process_info['name'],
                ""username"": process_info['username'] or ""unknown"",
                ""status"": process_info['status'],
                ""create_time"": datetime.fromtimestamp(process_info['create_time'], 
                                                      tz=timezone.utc).isoformat(),
                ""cpu_percent"": process_info['cpu_percent'],
                ""memory_percent"": process_info['memory_percent'],
                ""memory_rss"": process_info['memory_info'].rss if process_info['memory_info'] else 0,
                ""memory_vms"": process_info['memory_info'].vms if process_info['memory_info'] else 0,
                ""cmdline"": "" "".join(process_info['cmdline']) if process_info['cmdline'] else """"
            }
            processes.append(process_data)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    
    # Sort processes by CPU usage
    processes.sort(key=lambda x: x['cpu_percent'] or 0, reverse=True)
    
    # Top processes by CPU and Memory
    top_cpu_processes = processes[:10]
    top_memory_processes = sorted(processes, key=lambda x: x['memory_percent'] or 0, reverse=True)[:10]
    
    # Process Statistics
    total_processes = len(processes)
    running_processes = len([p for p in processes if p['status'] == 'running'])
    sleeping_processes = len([p for p in processes if p['status'] == 'sleeping'])
    
    # System Load and Performance
    load_avg = os.getloadavg() if hasattr(os, 'getloadavg') else [0, 0, 0]
    
    # Platform-specific services
    services = []
    if platform.system() == ""Windows"":
        # Windows Services
        try:
            import win32service
            import win32serviceutil
            
            services_list = win32serviceutil.ListServices()
            for service in services_list[:20]:  # Limit to first 20 services
                try:
                    service_status = win32serviceutil.QueryServiceStatus(service[0])
                    services.append({
                        ""name"": service[0],
                        ""display_name"": service[1],
                        ""status"": service_status[1],
                        ""type"": ""Windows Service""
                    })
                except:
                    continue
        except ImportError:
            services.append({""error"": ""Windows service APIs not available""})
    
    elif platform.system() in [""Linux"", ""Darwin""]:
        # Unix-like systems - check for systemd services on Linux
        if platform.system() == ""Linux"":
            try:
                import subprocess
                result = subprocess.run(['systemctl', 'list-units', '--type=service', '--no-pager'], 
                                      capture_output=True, text=True, timeout=10)
                if result.returncode == 0:
                    lines = result.stdout.split('\n')[1:]  # Skip header
                    for line in lines[:20]:  # Limit to first 20
                        if line.strip() and not line.startswith('●'):
                            parts = line.split()
                            if len(parts) >= 4:
                                services.append({
                                    ""name"": parts[0],
                                    ""load"": parts[1],
                                    ""active"": parts[2],
                                    ""sub"": parts[3],
                                    ""type"": ""systemd service""
                                })
            except (subprocess.TimeoutExpired, FileNotFoundError):
                pass
    
    # Memory Usage Summary
    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    
    # CPU Usage Summary
    cpu_percent = psutil.cpu_percent(interval=1, percpu=True)
    cpu_count = psutil.cpu_count()
    cpu_count_logical = psutil.cpu_count(logical=True)
    
    # Compile process discovery data
    discovery_data = {
        ""DiscoveryTimestamp"": datetime.now(timezone.utc).isoformat(),
        ""ScriptVersion"": ""1.0.0"",
        ""ComputerName"": socket.gethostname(),
        ""Platform"": platform.system(),
        ""ProcessSummary"": {
            ""total_processes"": total_processes,
            ""running_processes"": running_processes,
            ""sleeping_processes"": sleeping_processes,
            ""cpu_count"": cpu_count,
            ""cpu_count_logical"": cpu_count_logical,
            ""load_average"": load_avg
        },
        ""TopProcessesByCPU"": top_cpu_processes,
        ""TopProcessesByMemory"": top_memory_processes,
        ""AllProcesses"": processes[:100],  # Limit to first 100 processes
        ""Services"": services,
        ""SystemPerformance"": {
            ""cpu_percent_per_core"": cpu_percent,
            ""cpu_percent_total"": sum(cpu_percent) / len(cpu_percent),
            ""memory_total"": memory.total,
            ""memory_used"": memory.used,
            ""memory_percent"": memory.percent,
            ""swap_total"": swap.total,
            ""swap_used"": swap.used,
            ""swap_percent"": swap.percent
        }
    }
    
    return discovery_data

if __name__ == ""__main__"":
    try:
        data = get_process_info()
        print(json.dumps(data, indent=2, default=str))
    except Exception as e:
        error_data = {
            ""error"": str(e),
            ""error_type"": type(e).__name__,
            ""DiscoveryTimestamp"": datetime.now(timezone.utc).isoformat(),
            ""ComputerName"": socket.gethostname(),
            ""Platform"": platform.system()
        }
        print(json.dumps(error_data, indent=2))
        sys.exit(1)",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "ProcessSummary", "TopProcessesByCPU", "TopProcessesByMemory", "Services", "SystemPerformance" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "ProcessSummary.total_processes" } }
        },
        Tags = new List<string> { "processes", "discovery", "python", "cross-platform", "psutil", "services", "performance" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreatePythonPerformanceDiscoveryScript() => new()
    {
        Name = "Cross-Platform Performance Discovery - Python",
        Description = "Comprehensive performance monitoring using Python psutil for CPU, memory, disk, and network metrics",
        Category = "Performance Discovery",
        Type = "python",
        TargetOS = "cross-platform",
        EstimatedRunTimeSeconds = 40,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"#!/usr/bin/env python3
import json
import psutil
import socket
import platform
import time
from datetime import datetime, timezone

def get_performance_metrics():
    """"""Collect comprehensive performance metrics across platforms""""""
    
    # CPU Performance
    cpu_percent_per_core = psutil.cpu_percent(interval=1, percpu=True)
    cpu_times = psutil.cpu_times()
    cpu_stats = psutil.cpu_stats()
    cpu_freq = psutil.cpu_freq()
    
    cpu_performance = {
        ""cpu_count_physical"": psutil.cpu_count(logical=False),
        ""cpu_count_logical"": psutil.cpu_count(logical=True),
        ""cpu_percent_total"": sum(cpu_percent_per_core) / len(cpu_percent_per_core),
        ""cpu_percent_per_core"": cpu_percent_per_core,
        ""cpu_times"": {
            ""user"": cpu_times.user,
            ""system"": cpu_times.system,
            ""idle"": cpu_times.idle,
            ""interrupt"": getattr(cpu_times, 'interrupt', 0),
            ""dpc"": getattr(cpu_times, 'dpc', 0),
            ""iowait"": getattr(cpu_times, 'iowait', 0),
            ""irq"": getattr(cpu_times, 'irq', 0),
            ""softirq"": getattr(cpu_times, 'softirq', 0),
            ""steal"": getattr(cpu_times, 'steal', 0),
            ""guest"": getattr(cpu_times, 'guest', 0)
        },
        ""cpu_stats"": {
            ""ctx_switches"": cpu_stats.ctx_switches,
            ""interrupts"": cpu_stats.interrupts,
            ""soft_interrupts"": cpu_stats.soft_interrupts,
            ""syscalls"": cpu_stats.syscalls
        },
        ""cpu_frequency"": {
            ""current"": cpu_freq.current if cpu_freq else 0,
            ""min"": cpu_freq.min if cpu_freq else 0,
            ""max"": cpu_freq.max if cpu_freq else 0
        }
    }
    
    # Memory Performance
    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    
    memory_performance = {
        ""virtual_memory"": {
            ""total"": memory.total,
            ""available"": memory.available,
            ""used"": memory.used,
            ""free"": memory.free,
            ""percent"": memory.percent,
            ""active"": getattr(memory, 'active', 0),
            ""inactive"": getattr(memory, 'inactive', 0),
            ""buffers"": getattr(memory, 'buffers', 0),
            ""cached"": getattr(memory, 'cached', 0),
            ""shared"": getattr(memory, 'shared', 0),
            ""slab"": getattr(memory, 'slab', 0)
        },
        ""swap_memory"": {
            ""total"": swap.total,
            ""used"": swap.used,
            ""free"": swap.free,
            ""percent"": swap.percent,
            ""sin"": swap.sin,
            ""sout"": swap.sout
        }
    }
    
    # Disk Performance
    disk_usage = []
    disk_io_counters = psutil.disk_io_counters(perdisk=True)
    
    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            partition_data = {
                ""device"": partition.device,
                ""mountpoint"": partition.mountpoint,
                ""fstype"": partition.fstype,
                ""total"": usage.total,
                ""used"": usage.used,
                ""free"": usage.free,
                ""percent"": (usage.used / usage.total) * 100 if usage.total > 0 else 0
            }
            
            # Add I/O stats if available
            device_name = partition.device.split('/')[-1] if '/' in partition.device else partition.device
            if device_name in disk_io_counters:
                io = disk_io_counters[device_name]
                partition_data[""io_stats""] = {
                    ""read_count"": io.read_count,
                    ""write_count"": io.write_count,
                    ""read_bytes"": io.read_bytes,
                    ""write_bytes"": io.write_bytes,
                    ""read_time"": io.read_time,
                    ""write_time"": io.write_time
                }
            
            disk_usage.append(partition_data)
        except PermissionError:
            continue
    
    # Network Performance
    net_io_start = psutil.net_io_counters(pernic=True)
    time.sleep(1)  # Wait 1 second for rate calculation
    net_io_end = psutil.net_io_counters(pernic=True)
    
    network_performance = []
    for interface in net_io_start:
        if interface in net_io_end:
            start = net_io_start[interface]
            end = net_io_end[interface]
            
            # Calculate rates (bytes per second)
            bytes_sent_rate = end.bytes_sent - start.bytes_sent
            bytes_recv_rate = end.bytes_recv - start.bytes_recv
            packets_sent_rate = end.packets_sent - start.packets_sent
            packets_recv_rate = end.packets_recv - start.packets_recv
            
            interface_data = {
                ""interface"": interface,
                ""bytes_sent"": end.bytes_sent,
                ""bytes_recv"": end.bytes_recv,
                ""packets_sent"": end.packets_sent,
                ""packets_recv"": end.packets_recv,
                ""errin"": end.errin,
                ""errout"": end.errout,
                ""dropin"": end.dropin,
                ""dropout"": end.dropout,
                ""rates"": {
                    ""bytes_sent_per_sec"": bytes_sent_rate,
                    ""bytes_recv_per_sec"": bytes_recv_rate,
                    ""packets_sent_per_sec"": packets_sent_rate,
                    ""packets_recv_per_sec"": packets_recv_rate
                }
            }
            network_performance.append(interface_data)
    
    # System Load
    load_avg = []
    if hasattr(psutil, 'getloadavg'):
        try:
            load_avg = list(psutil.getloadavg())
        except:
            pass
    
    # Boot time and uptime
    boot_time = datetime.fromtimestamp(psutil.boot_time(), tz=timezone.utc)
    current_time = datetime.now(timezone.utc)
    uptime_seconds = (current_time - boot_time).total_seconds()
    
    # Top processes by resource usage
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
        try:
            processes.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    
    top_cpu_processes = sorted(processes, key=lambda x: x['cpu_percent'] or 0, reverse=True)[:10]
    top_memory_processes = sorted(processes, key=lambda x: x['memory_percent'] or 0, reverse=True)[:10]
    
    # Compile performance data
    discovery_data = {
        ""DiscoveryTimestamp"": datetime.now(timezone.utc).isoformat(),
        ""ScriptVersion"": ""1.0.0"",
        ""ComputerName"": socket.gethostname(),
        ""Platform"": platform.system(),
        ""CPUPerformance"": cpu_performance,
        ""MemoryPerformance"": memory_performance,
        ""DiskPerformance"": disk_usage,
        ""NetworkPerformance"": network_performance,
        ""SystemLoad"": {
            ""load_average"": load_avg,
            ""boot_time"": boot_time.isoformat(),
            ""uptime_seconds"": uptime_seconds,
            ""uptime_days"": uptime_seconds / 86400
        },
        ""TopProcesses"": {
            ""by_cpu"": top_cpu_processes,
            ""by_memory"": top_memory_processes
        },
        ""PerformanceSummary"": {
            ""cpu_usage_avg"": sum(cpu_percent_per_core) / len(cpu_percent_per_core),
            ""memory_usage_percent"": memory.percent,
            ""disk_usage_total"": sum(d['percent'] for d in disk_usage) / len(disk_usage) if disk_usage else 0,
            ""total_network_bytes_sent"": sum(n['bytes_sent'] for n in network_performance),
            ""total_network_bytes_recv"": sum(n['bytes_recv'] for n in network_performance),
            ""sample_duration_seconds"": 1
        }
    }
    
    return discovery_data

if __name__ == ""__main__"":
    try:
        data = get_performance_metrics()
        print(json.dumps(data, indent=2, default=str))
    except Exception as e:
        error_data = {
            ""error"": str(e),
            ""error_type"": type(e).__name__,
            ""DiscoveryTimestamp"": datetime.now(timezone.utc).isoformat(),
            ""ComputerName"": socket.gethostname(),
            ""Platform"": platform.system()
        }
        print(json.dumps(error_data, indent=2))
        sys.exit(1)",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", true },
            { "extractFields", new[] { "CPUPerformance", "MemoryPerformance", "DiskPerformance", "NetworkPerformance", "SystemLoad" } },
            { "validateRequired", new[] { "ComputerName", "DiscoveryTimestamp", "PerformanceSummary.cpu_usage_avg" } }
        },
        Tags = new List<string> { "performance", "discovery", "python", "cross-platform", "psutil", "monitoring", "metrics" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };
    private DiscoveryScriptTemplate CreatePythonFileSystemDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreatePythonUserAccountDiscoveryScript() => throw new NotImplementedException();
    private DiscoveryScriptTemplate CreatePythonEnvironmentDiscoveryScript() => throw new NotImplementedException();
    
    // Windows WMI Query Scripts
    private DiscoveryScriptTemplate CreateWMIHardwareDiscoveryScript() => new()
    {
        Name = "Windows Hardware Discovery - WMI",
        Description = "Comprehensive Windows hardware discovery using WMI queries",
        Category = "Hardware Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 20,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    CS.Manufacturer,
    CS.Model,
    CS.TotalPhysicalMemory,
    CPU.Name as ProcessorName,
    CPU.MaxClockSpeed,
    CPU.NumberOfCores,
    CPU.NumberOfLogicalProcessors,
    GPU.Name as GraphicsCard,
    GPU.AdapterRAM as GraphicsMemory,
    BIOS.SMBIOSBIOSVersion as BIOSVersion
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_Processor CPU ON CPU.DeviceID = 'CPU0'
LEFT JOIN Win32_VideoController GPU ON GPU.PNPDeviceID LIKE 'PCI%'
LEFT JOIN Win32_BIOS BIOS ON BIOS.PrimaryBIOS = TRUE",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "Manufacturer", "ProcessorName", "GraphicsCard" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "hardware", "discovery", "windows", "wmi", "cpu", "memory", "gpu" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateWMISoftwareDiscoveryScript() => new()
    {
        Name = "Windows Software Discovery - WMI",
        Description = "Comprehensive Windows software inventory using WMI",
        Category = "Software Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    PROD.Name as ProductName,
    PROD.Version,
    PROD.Vendor,
    PROD.InstallDate
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_Product PROD ON PROD.Name IS NOT NULL
WHERE PROD.Name IS NOT NULL",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "ProductName", "Version" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "software", "discovery", "windows", "wmi", "applications" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateWMINetworkDiscoveryScript() => new()
    {
        Name = "Windows Network Discovery - WMI",
        Description = "Comprehensive Windows network configuration discovery using WMI",
        Category = "Network Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 25,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    NET.Description as NetworkAdapter,
    NET.MACAddress,
    NET.Speed as AdapterSpeed,
    IP.IPAddress,
    IP.IPSubnet,
    IP.DefaultIPGateway,
    IP.DHCPEnabled
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_NetworkAdapter NET ON NET.NetConnectionStatus = 2
LEFT JOIN Win32_NetworkAdapterConfiguration IP ON IP.Index = NET.Index AND IP.IPEnabled = TRUE
WHERE NET.Description IS NOT NULL",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "NetworkAdapter", "IPAddress" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "network", "discovery", "windows", "wmi", "adapters" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateWMISecurityDiscoveryScript() => new()
    {
        Name = "Windows Security Discovery - WMI",
        Description = "Comprehensive Windows security configuration discovery using WMI",
        Category = "Security Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = true,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    USER.Name as UserName,
    USER.AccountType,
    USER.Disabled as UserDisabled,
    GRP.Name as GroupName
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_UserAccount USER ON USER.LocalAccount = TRUE
LEFT JOIN Win32_Group GRP ON GRP.LocalAccount = TRUE
WHERE USER.Name IS NOT NULL OR GRP.Name IS NOT NULL",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "UserName", "GroupName" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "security", "discovery", "windows", "wmi", "users", "groups" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS" }
    };

    private DiscoveryScriptTemplate CreateWMISystemInfoDiscoveryScript() => new()
    {
        Name = "Windows System Information Discovery - WMI",
        Description = "Comprehensive Windows system information discovery using WMI",
        Category = "System Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 25,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    CS.Domain,
    CS.Manufacturer,
    CS.Model,
    OS.Caption as OperatingSystem,
    OS.Version as OSVersion,
    OS.BuildNumber,
    OS.InstallDate as OSInstallDate,
    OS.LastBootUpTime
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_OperatingSystem OS ON OS.Primary = TRUE",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "OperatingSystem", "OSVersion" } },
            { "validateRequired", new[] { "ComputerName", "OperatingSystem" } }
        },
        Tags = new List<string> { "system", "discovery", "windows", "wmi", "os" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateWMIServicesDiscoveryScript() => new()
    {
        Name = "Windows Services Discovery - WMI",
        Description = "Comprehensive Windows services discovery using WMI",
        Category = "Services Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 25,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    SVC.Name as ServiceName,
    SVC.DisplayName,
    SVC.StartMode,
    SVC.State,
    SVC.ProcessId
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_Service SVC ON SVC.Name IS NOT NULL",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "ServiceName", "State" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "services", "discovery", "windows", "wmi" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateWMIProcessDiscoveryScript() => new()
    {
        Name = "Windows Process Discovery - WMI",
        Description = "Comprehensive Windows process discovery using WMI",
        Category = "Process Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    PROC.Name as ProcessName,
    PROC.ProcessId,
    PROC.CommandLine,
    PROC.CreationDate,
    PROC.WorkingSetSize
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_Process PROC ON PROC.Name LIKE '%.exe'",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "ProcessName", "ProcessId" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "processes", "discovery", "windows", "wmi" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateWMIEventLogDiscoveryScript() => new()
    {
        Name = "Windows Event Log Discovery - WMI",
        Description = "Comprehensive Windows event log discovery using WMI",
        Category = "Event Log Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 35,
        RequiresElevation = true,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    EVT.LogFile,
    EVT.EventCode,
    EVT.EventType,
    EVT.TimeGenerated,
    EVT.SourceName,
    EVT.Message
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_NTLogEvent EVT ON EVT.LogFile IN ('System', 'Application', 'Security')
WHERE EVT.TimeGenerated > DATEADD(day, -1, GETDATE())",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "LogFile", "EventCode" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "eventlogs", "discovery", "windows", "wmi", "security", "audit" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST", "PCI DSS" }
    };

    private DiscoveryScriptTemplate CreateWMIPerformanceDiscoveryScript() => new()
    {
        Name = "Windows Performance Discovery - WMI",
        Description = "Comprehensive Windows performance metrics discovery using WMI",
        Category = "Performance Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 30,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    CPU.LoadPercentage as CPUUsage,
    MEM.TotalVisibleMemorySize,
    MEM.AvailableMemorySize,
    DISK.Size as DiskSize,
    DISK.FreeSpace as DiskFreeSpace
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_Processor CPU ON CPU.DeviceID = 'CPU0'
LEFT JOIN Win32_OperatingSystem MEM ON MEM.Primary = TRUE
LEFT JOIN Win32_LogicalDisk DISK ON DISK.DriveType = 3",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "CPUUsage", "TotalVisibleMemorySize" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "performance", "discovery", "windows", "wmi", "cpu", "memory", "disk" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };

    private DiscoveryScriptTemplate CreateWMIStorageDiscoveryScript() => new()
    {
        Name = "Windows Storage Discovery - WMI",
        Description = "Comprehensive Windows storage discovery using WMI",
        Category = "Storage Discovery",
        Type = "wmi",
        TargetOS = "windows",
        EstimatedRunTimeSeconds = 25,
        RequiresElevation = false,
        RequiresNetwork = false,
        Template = @"SELECT 
    CS.Name as ComputerName,
    DISK.Size as DiskSize,
    DISK.FreeSpace as DiskFreeSpace,
    DISK.FileSystem,
    DISK.VolumeName,
    DISK.DeviceID,
    PHYS.MediaType,
    PHYS.Size as PhysicalDiskSize
FROM Win32_ComputerSystem CS
LEFT JOIN Win32_LogicalDisk DISK ON DISK.DriveType = 3
LEFT JOIN Win32_DiskDrive PHYS ON PHYS.DeviceID IS NOT NULL",
        OutputFormat = "JSON",
        OutputProcessing = new Dictionary<string, object>
        {
            { "parseAsJson", false },
            { "convertToJson", true },
            { "extractFields", new[] { "ComputerName", "DiskSize", "FileSystem" } },
            { "validateRequired", new[] { "ComputerName" } }
        },
        Tags = new List<string> { "storage", "discovery", "windows", "wmi", "disk", "filesystem" },
        Industries = new List<string> { "Enterprise", "Healthcare", "Finance", "Government", "Education" },
        ComplianceFrameworks = new List<string> { "SOX", "HIPAA", "ISO 27001", "NIST" }
    };
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
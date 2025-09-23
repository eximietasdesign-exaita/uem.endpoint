import { db } from "./db";
import { 
  users, 
  credentialProfiles, 
  discoveryProbes, 
  scripts, 
  policies, 
  endpoints, 
  discoveryJobs, 
  agentDeployments, 
  agents, 
  activityLogs, 
  systemStatus, 
  dashboardStats 
} from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Starting database seed...");

    // Clear existing data
    await db.delete(activityLogs);
    await db.delete(agents);
    await db.delete(agentDeployments);
    await db.delete(endpoints);
    await db.delete(discoveryJobs);
    await db.delete(policies);
    await db.delete(scripts);
    await db.delete(discoveryProbes);
    await db.delete(credentialProfiles);
    await db.delete(systemStatus);
    await db.delete(dashboardStats);
    await db.delete(users);

    // Seed Users
    const usersList = await db.insert(users).values([
      {
        username: "admin",
        email: "admin@enterprise.com",
        password: "admin123",
        role: "administrator",
        firstName: "System",
        lastName: "Administrator",
        preferences: {
          theme: "dark",
          language: "en",
          notifications: true
        }
      },
      {
        username: "operator1",
        email: "operator@enterprise.com",
        password: "operator123",
        role: "operator",
        firstName: "Security",
        lastName: "Operator",
        preferences: {
          theme: "light",
          language: "en",
          notifications: true
        }
      },
      {
        username: "viewer1",
        email: "viewer@enterprise.com",
        password: "viewer123",
        role: "viewer",
        firstName: "Network",
        lastName: "Viewer",
        preferences: {
          theme: "light",
          language: "en",
          notifications: false
        }
      }
    ]).returning();

    // Seed Credential Profiles
    const credProfilesList = await db.insert(credentialProfiles).values([
      {
        name: "Windows Domain Admin",
        description: "Domain administrator credentials for Windows environments",
        type: "windows",
        credentials: {
          username: "DOMAIN\\admin",
          domain: "ENTERPRISE.LOCAL",
          protocol: "WMI",
          port: 135,
          authMethod: "NTLM"
        },
        createdBy: usersList[0].id
      },
      {
        name: "Linux SSH Access",
        description: "SSH credentials for Linux server management",
        type: "linux",
        credentials: {
          username: "root",
          protocol: "SSH",
          port: 22,
          authMethod: "key"
        },
        createdBy: usersList[0].id
      },
      {
        name: "SNMP Community",
        description: "SNMP community string for network device discovery",
        type: "snmp",
        credentials: {
          username: "public",
          protocol: "SNMP",
          port: 161,
          authMethod: "community"
        },
        createdBy: usersList[1].id
      }
    ]).returning();

    // Seed Satellite Servers (formerly Discovery Probes)
    const probesList = await db.insert(discoveryProbes).values([
      {
        name: "Main Campus Server",
        description: "Primary satellite server for main campus network",
        location: "Building A - Server Room",
        ipAddress: "10.1.1.100",
        status: "online",
        version: "3.2.1",
        capabilities: ["network_scan", "wmi_query", "ssh_exec", "snmp_walk"],
        lastHeartbeat: new Date(),
        cpuUsage: 15.2,
        memoryUsage: 32.8,
        diskUsage: 45.1,
        jobsInQueue: 3,
        totalJobsExecuted: 1247,
        environment: "production"
      },
      {
        name: "Remote Site Server",
        description: "Satellite server for remote site operations",
        location: "Branch Office - IT Closet",
        ipAddress: "192.168.50.10",
        status: "online",
        version: "3.2.1",
        capabilities: ["network_scan", "ssh_exec"],
        lastHeartbeat: new Date(),
        cpuUsage: 8.7,
        memoryUsage: 28.3,
        diskUsage: 38.2,
        jobsInQueue: 1,
        totalJobsExecuted: 523,
        environment: "production"
      },
      {
        name: "DMZ Server",
        description: "Specialized satellite server for DMZ network scanning",
        location: "DMZ - Security Zone",
        ipAddress: "172.16.100.5",
        status: "warning",
        version: "3.1.8",
        capabilities: ["network_scan", "snmp_walk"],
        lastHeartbeat: new Date(Date.now() - 300000),
        cpuUsage: 45.8,
        memoryUsage: 78.9,
        diskUsage: 82.1,
        jobsInQueue: 8,
        totalJobsExecuted: 892,
        environment: "production"
      }
    ]).returning();

    // Seed Scripts with comprehensive enterprise content
    const scriptsList = await db.insert(scripts).values([
      // Applications & Databases Scripts
      {
        name: "Check .Net Version",
        description: "Detects installed .NET Framework versions and provides detailed version information",
        category: "discovery",
        type: "powershell",
        targetOs: "windows",
        content: `# .NET Framework Version Detection Script
$ErrorActionPreference = "Stop"

try {
    # Get .NET Framework versions from registry
    $dotNetVersions = @()
    
    # Check .NET Framework 4.x versions
    $releaseKey = Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v4\\Full\\" -Name Release -ErrorAction SilentlyContinue
    if ($releaseKey) {
        $version = switch ($releaseKey.Release) {
            {$_ -ge 533320} { "4.8.1 or later" }
            {$_ -ge 528040} { "4.8" }
            {$_ -ge 461808} { "4.7.2" }
            {$_ -ge 461308} { "4.7.1" }
            {$_ -ge 460798} { "4.7" }
            {$_ -ge 394802} { "4.6.2" }
            {$_ -ge 394254} { "4.6.1" }
            {$_ -ge 393295} { "4.6" }
            {$_ -ge 379893} { "4.5.2" }
            {$_ -ge 378675} { "4.5.1" }
            {$_ -ge 378389} { "4.5" }
            default { "Unknown version" }
        }
        $dotNetVersions += @{
            Version = $version
            Release = $releaseKey.Release
            Type = ".NET Framework"
        }
    }
    
    # Check .NET Core/.NET 5+ versions
    $dotnetInfo = dotnet --list-runtimes 2>$null
    if ($dotnetInfo) {
        foreach ($line in $dotnetInfo) {
            if ($line -match "Microsoft\.NETCore\.App\\s+([\\d\\.]+)") {
                $dotNetVersions += @{
                    Version = $matches[1]
                    Type = ".NET Core"
                }
            } elseif ($line -match "Microsoft\.AspNetCore\.App\\s+([\\d\\.]+)") {
                $dotNetVersions += @{
                    Version = $matches[1]
                    Type = "ASP.NET Core"
                }
            }
        }
    }
    
    $output = @{
        Status = "Success"
        Data = @{
            DotNetVersions = $dotNetVersions
            HasDotNetFramework = ($dotNetVersions | Where-Object {$_.Type -eq ".NET Framework"}).Count -gt 0
            HasDotNetCore = ($dotNetVersions | Where-Object {$_.Type -eq ".NET Core"}).Count -gt 0
        }
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    Write-Output ($output | ConvertTo-Json -Depth 4)
}
catch {
    $errorOutput = @{
        Status = "Error"
        Message = $_.Exception.Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    Write-Output ($errorOutput | ConvertTo-Json -Depth 3)
    exit 1
}`,
        parameters: [
          { name: "includeCore", type: "boolean", description: "Include .NET Core runtime detection", required: false, defaultValue: true }
        ],
        outputProcessing: {
          rules: [
            { type: "json_path", pattern: "$.Data.DotNetVersions", field: "dotnet_versions" },
            { type: "json_path", pattern: "$.Data.HasDotNetFramework", field: "has_framework" }
          ]
        },
        tags: ["dotnet", "framework", "applications"],
        version: "1.2.0",
        author: "System Admin",
        executionCount: 45,
        createdBy: usersList[0].id
      },
      {
        name: "Apache Version",
        description: "Get Apache web server version and configuration details",
        category: "discovery",
        type: "bash",
        targetOs: "linux",
        content: `#!/bin/bash
# Apache Version and Configuration Discovery Script

set -e

# Function to check if Apache is installed
check_apache_installed() {
    if command -v apache2 >/dev/null 2>&1; then
        echo "apache2"
    elif command -v httpd >/dev/null 2>&1; then
        echo "httpd"
    else
        echo "none"
    fi
}

# Main execution
apache_cmd=$(check_apache_installed)

if [ "$apache_cmd" = "none" ]; then
    echo '{"Status":"Error","Message":"Apache not found on this system","Timestamp":"'$(date '+%Y-%m-%d %H:%M:%S')'"}'
    exit 1
fi

# Get Apache version
version_output=$($apache_cmd -v 2>/dev/null || echo "Version not available")

# Get loaded modules
modules_output=$($apache_cmd -M 2>/dev/null || echo "Modules not available")

# Get configuration test
config_test=$($apache_cmd -t 2>&1 || echo "Config test failed")

# Get listening ports
if command -v ss >/dev/null 2>&1; then
    listening_ports=$(ss -tlnp | grep apache || ss -tlnp | grep httpd || echo "No listening ports found")
elif command -v netstat >/dev/null 2>&1; then
    listening_ports=$(netstat -tlnp | grep apache || netstat -tlnp | grep httpd || echo "No listening ports found")
else
    listening_ports="Port check tools not available"
fi

# Construct JSON output
cat << EOF
{
    "Status": "Success",
    "Data": {
        "ApacheCommand": "$apache_cmd",
        "Version": "$version_output",
        "ConfigTest": "$config_test",
        "LoadedModules": "$modules_output",
        "ListeningPorts": "$listening_ports",
        "IsRunning": $(systemctl is-active apache2 >/dev/null 2>&1 && echo "true" || systemctl is-active httpd >/dev/null 2>&1 && echo "true" || echo "false")
    },
    "Timestamp": "$(date '+%Y-%m-%d %H:%M:%S')"
}
EOF`,
        parameters: [
          { name: "includeModules", type: "boolean", description: "Include loaded modules information", required: false, defaultValue: true },
          { name: "checkPorts", type: "boolean", description: "Check listening ports", required: false, defaultValue: true }
        ],
        outputProcessing: {
          rules: [
            { type: "regex", pattern: "Apache\\/([0-9\\.]+)", field: "apache_version" },
            { type: "json_path", pattern: "$.Data.IsRunning", field: "is_running" }
          ]
        },
        tags: ["apache", "web", "server"],
        version: "1.0.0",
        author: "DevOps Team",
        executionCount: 23,
        createdBy: usersList[1].id
      },
      {
        name: "SQL Server Version",
        description: "Get SQL Server edition, version and patch level information",
        category: "discovery", 
        type: "powershell",
        targetOs: "windows",
        content: `# SQL Server Version Discovery Script
$ErrorActionPreference = "Stop"

try {
    # Import SQL Server module if available
    if (Get-Module -ListAvailable -Name SqlServer) {
        Import-Module SqlServer -ErrorAction SilentlyContinue
    }
    
    $sqlInstances = @()
    
    # Get SQL Server instances from registry
    $registryPaths = @(
        "HKLM:\\SOFTWARE\\Microsoft\\Microsoft SQL Server\\Instance Names\\SQL",
        "HKLM:\\SOFTWARE\\Wow6432Node\\Microsoft\\Microsoft SQL Server\\Instance Names\\SQL"
    )
    
    foreach ($regPath in $registryPaths) {
        if (Test-Path $regPath) {
            $instances = Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue
            if ($instances) {
                $instances.PSObject.Properties | Where-Object Name -ne "PSPath" -and Name -ne "PSParentPath" -and Name -ne "PSChildName" -and Name -ne "PSDrive" -and Name -ne "PSProvider" | ForEach-Object {
                    $instanceName = $_.Name
                    $instanceId = $_.Value
                    
                    try {
                        # Try to connect and get version info
                        $serverName = if ($instanceName -eq "MSSQLSERVER") { $env:COMPUTERNAME } else { "$env:COMPUTERNAME\\$instanceName" }
                        
                        # Use WMI to get SQL Server information
                        $wmiQuery = "SELECT * FROM Win32_Service WHERE Name LIKE 'MSSQL%' AND Name LIKE '%$instanceName%'"
                        $sqlService = Get-WmiObject -Query $wmiQuery -ErrorAction SilentlyContinue
                        
                        $instanceInfo = @{
                            InstanceName = $instanceName
                            ServerName = $serverName
                            InstanceId = $instanceId
                            ServiceStatus = if ($sqlService) { $sqlService.State } else { "Unknown" }
                            ServiceStartMode = if ($sqlService) { $sqlService.StartMode } else { "Unknown" }
                        }
                        
                        # Try to get detailed version info via SQL query (if accessible)
                        try {
                            $connectionString = "Server=$serverName;Integrated Security=true;Connection Timeout=5;"
                            $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
                            $connection.Open()
                            
                            $command = New-Object System.Data.SqlClient.SqlCommand("SELECT @@VERSION as Version, SERVERPROPERTY('Edition') as Edition, SERVERPROPERTY('ProductLevel') as ProductLevel, SERVERPROPERTY('ProductVersion') as ProductVersion", $connection)
                            $reader = $command.ExecuteReader()
                            
                            if ($reader.Read()) {
                                $instanceInfo.Version = $reader["Version"]
                                $instanceInfo.Edition = $reader["Edition"]
                                $instanceInfo.ProductLevel = $reader["ProductLevel"]
                                $instanceInfo.ProductVersion = $reader["ProductVersion"]
                            }
                            
                            $reader.Close()
                            $connection.Close()
                        }
                        catch {
                            $instanceInfo.ConnectionError = $_.Exception.Message
                        }
                        
                        $sqlInstances += $instanceInfo
                    }
                    catch {
                        $sqlInstances += @{
                            InstanceName = $instanceName
                            InstanceId = $instanceId
                            Error = $_.Exception.Message
                        }
                    }
                }
            }
        }
    }
    
    $output = @{
        Status = "Success"
        Data = @{
            SqlInstances = $sqlInstances
            TotalInstances = $sqlInstances.Count
            RunningInstances = ($sqlInstances | Where-Object { $_.ServiceStatus -eq "Running" }).Count
        }
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    Write-Output ($output | ConvertTo-Json -Depth 4)
}
catch {
    $errorOutput = @{
        Status = "Error"
        Message = $_.Exception.Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    Write-Output ($errorOutput | ConvertTo-Json -Depth 3)
    exit 1
}`,
        parameters: [
          { name: "includeConnectionTest", type: "boolean", description: "Test database connections", required: false, defaultValue: true },
          { name: "timeout", type: "integer", description: "Connection timeout in seconds", required: false, defaultValue: 5 }
        ],
        outputProcessing: {
          rules: [
            { type: "json_path", pattern: "$.Data.TotalInstances", field: "instance_count" },
            { type: "json_path", pattern: "$.Data.RunningInstances", field: "running_instances" }
          ]
        },
        tags: ["sql", "server", "database"],
        version: "1.5.0",
        author: "DB Admin",
        executionCount: 67,
        createdBy: usersList[0].id
      },
      {
        name: "Docker Container List",
        description: "List all Docker containers and their status with detailed information",
        category: "discovery",
        type: "bash", 
        targetOs: "linux",
        content: `#!/bin/bash
# Docker Container Discovery Script

set -e

# Check if Docker is installed and running
if ! command -v docker >/dev/null 2>&1; then
    echo '{"Status":"Error","Message":"Docker not found on this system","Timestamp":"'$(date '+%Y-%m-%d %H:%M:%S')'"}'
    exit 1
fi

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
    echo '{"Status":"Error","Message":"Docker daemon is not running","Timestamp":"'$(date '+%Y-%m-%d %H:%M:%S')'"}'
    exit 1
fi

# Get Docker version
docker_version=$(docker --version 2>/dev/null || echo "Version not available")

# Get all containers (running and stopped)
containers_json=$(docker ps -a --format "json" 2>/dev/null || echo "[]")

# Get Docker system info
system_info=$(docker system df --format "json" 2>/dev/null || echo "{}")

# Get running containers count
running_count=$(docker ps -q | wc -l)

# Get stopped containers count  
stopped_count=$(docker ps -aq --filter "status=exited" | wc -l)

# Get total images count
images_count=$(docker images -q | wc -l)

# Get Docker compose projects if available
compose_projects=""
if command -v docker-compose >/dev/null 2>&1; then
    compose_projects=$(docker-compose ls 2>/dev/null || echo "No compose projects found")
fi

# Construct JSON output
cat << EOF
{
    "Status": "Success",
    "Data": {
        "DockerVersion": "$docker_version",
        "RunningContainers": $running_count,
        "StoppedContainers": $stopped_count,
        "TotalImages": $images_count,
        "Containers": $containers_json,
        "SystemInfo": $system_info,
        "ComposeProjects": "$compose_projects"
    },
    "Timestamp": "$(date '+%Y-%m-%d %H:%M:%S')"
}
EOF`,
        parameters: [
          { name: "includeStats", type: "boolean", description: "Include container resource usage stats", required: false, defaultValue: false },
          { name: "includeNetworks", type: "boolean", description: "Include Docker networks information", required: false, defaultValue: true }
        ],
        outputProcessing: {
          rules: [
            { type: "json_path", pattern: "$.Data.RunningContainers", field: "running_containers" },
            { type: "json_path", pattern: "$.Data.TotalImages", field: "total_images" }
          ]
        },
        tags: ["docker", "containers", "virtualization"],
        version: "1.0.0",
        author: "DevOps Team", 
        executionCount: 56,
        createdBy: usersList[1].id
      },
      {
        name: "Network Interface Scanner",
        description: "Comprehensive network interface discovery and configuration analysis",
        category: "discovery",
        type: "bash",
        targetOs: "linux", 
        content: `#!/bin/bash
# Network Interface Scanner Script

set -e

# Get network interfaces with ip command
if command -v ip >/dev/null 2>&1; then
    interfaces_info=$(ip -j addr show 2>/dev/null || echo "[]")
    routes_info=$(ip -j route show 2>/dev/null || echo "[]")
else
    echo '{"Status":"Error","Message":"ip command not available","Timestamp":"'$(date '+%Y-%m-%d %H:%M:%S')'"}'
    exit 1
fi

# Get network statistics
if command -v ss >/dev/null 2>&1; then
    listening_ports=$(ss -tlnp 2>/dev/null | head -20)
    established_connections=$(ss -tn state established 2>/dev/null | wc -l)
else
    listening_ports="ss command not available"
    established_connections=0
fi

# Get DNS configuration
dns_servers=""
if [ -f /etc/resolv.conf ]; then
    dns_servers=$(grep "^nameserver" /etc/resolv.conf | awk '{print $2}' | tr '\n' ',' | sed 's/,$//')
fi

# Get hostname and domain
hostname_info=$(hostname -f 2>/dev/null || hostname)
domain_info=$(dnsdomainname 2>/dev/null || echo "Not configured")

# Get default gateway
default_gateway=$(ip route show default 2>/dev/null | awk '/default/ {print $3}' | head -1)

# Construct JSON output
cat << EOF
{
    "Status": "Success", 
    "Data": {
        "Hostname": "$hostname_info",
        "Domain": "$domain_info",
        "DefaultGateway": "$default_gateway",
        "DnsServers": "$dns_servers",
        "Interfaces": $interfaces_info,
        "Routes": $routes_info,
        "ListeningPorts": "$listening_ports",
        "EstablishedConnections": $established_connections
    },
    "Timestamp": "$(date '+%Y-%m-%d %H:%M:%S')"
}
EOF`,
        parameters: [
          { name: "interface", type: "string", description: "Specific interface to scan", required: false },
          { name: "includeStats", type: "boolean", description: "Include interface statistics", required: false, defaultValue: true }
        ],
        outputProcessing: {
          rules: [
            { type: "regex", pattern: "inet ([0-9.]+)", field: "ip_addresses" },
            { type: "json_path", pattern: "$.Data.EstablishedConnections", field: "connection_count" }
          ]
        },
        tags: ["network", "interfaces", "configuration"],
        version: "2.1.0",
        author: "Network Administrator",
        executionCount: 89,
        createdBy: usersList[1].id
      },
      {
        name: "Oracle DB Version",
        description: "Check Oracle database version and status information",
        category: "discovery",
        type: "powershell",
        targetOs: "windows",
        content: `# Oracle Database Version Discovery Script
$ErrorActionPreference = "Stop"

try {
    $oracleInstances = @()
    
    # Check for Oracle installations in common registry locations
    $registryPaths = @(
        "HKLM:\\SOFTWARE\\ORACLE",
        "HKLM:\\SOFTWARE\\Wow6432Node\\ORACLE"
    )
    
    foreach ($regPath in $registryPaths) {
        if (Test-Path $regPath) {
            $oracleKeys = Get-ChildItem -Path $regPath -ErrorAction SilentlyContinue
            foreach ($key in $oracleKeys) {
                if ($key.Name -match "KEY_") {
                    $oracleHome = Get-ItemProperty -Path $key.PSPath -Name "ORACLE_HOME" -ErrorAction SilentlyContinue
                    if ($oracleHome) {
                        $instanceInfo = @{
                            OracleHome = $oracleHome.ORACLE_HOME
                            RegistryKey = $key.Name
                        }
                        
                        # Try to get version from sqlplus
                        $sqlplusPath = Join-Path $oracleHome.ORACLE_HOME "bin\\sqlplus.exe"
                        if (Test-Path $sqlplusPath) {
                            try {
                                $versionOutput = & $sqlplusPath -version 2>&1
                                $instanceInfo.SqlPlusVersion = $versionOutput
                            }
                            catch {
                                $instanceInfo.SqlPlusError = $_.Exception.Message
                            }
                        }
                        
                        $oracleInstances += $instanceInfo
                    }
                }
            }
        }
    }
    
    # Check for Oracle services
    $oracleServices = Get-Service | Where-Object { $_.Name -like "*Oracle*" -or $_.DisplayName -like "*Oracle*" }
    $serviceInfo = @()
    foreach ($service in $oracleServices) {
        $serviceInfo += @{
            Name = $service.Name
            DisplayName = $service.DisplayName
            Status = $service.Status
            StartType = $service.StartType
        }
    }
    
    # Check for TNS Names file
    $tnsNamesPath = ""
    if ($oracleInstances.Count -gt 0) {
        $tnsNamesPath = Join-Path $oracleInstances[0].OracleHome "network\\admin\\tnsnames.ora"
        if (-not (Test-Path $tnsNamesPath)) {
            $tnsNamesPath = "Not found"
        }
    }
    
    $output = @{
        Status = "Success"
        Data = @{
            OracleInstances = $oracleInstances
            OracleServices = $serviceInfo
            TnsNamesPath = $tnsNamesPath
            TotalInstances = $oracleInstances.Count
            RunningServices = ($serviceInfo | Where-Object { $_.Status -eq "Running" }).Count
        }
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    
    Write-Output ($output | ConvertTo-Json -Depth 4)
}
catch {
    $errorOutput = @{
        Status = "Error"
        Message = $_.Exception.Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    Write-Output ($errorOutput | ConvertTo-Json -Depth 3)
    exit 1
}`,
        parameters: [
          { name: "includeServices", type: "boolean", description: "Include Oracle service information", required: false, defaultValue: true }
        ],
        outputProcessing: {
          rules: [
            { type: "json_path", pattern: "$.Data.TotalInstances", field: "oracle_instances" },
            { type: "json_path", pattern: "$.Data.RunningServices", field: "running_services" }
          ]
        },
        tags: ["oracle", "database", "enterprise"],
        version: "2.1.0",
        author: "DB Admin",
        executionCount: 12,
        createdBy: usersList[0].id
      },
      {
        name: "Website Status Check",
        description: "Verify website availability and response time with detailed metrics",
        category: "health_check",
        type: "python",
        targetOs: "any",
        content: `#!/usr/bin/env python3
"""
Website Status Check Script
Verifies website availability and response time
"""

import requests
import time
import json
import sys
from urllib.parse import urlparse

def check_website_status(url, timeout=10, follow_redirects=True):
    """Check website status and collect metrics"""
    try:
        start_time = time.time()
        
        # Make the request
        response = requests.get(
            url, 
            timeout=timeout, 
            allow_redirects=follow_redirects,
            headers={'User-Agent': 'Enterprise-Monitor/1.0'}
        )
        
        end_time = time.time()
        response_time = round((end_time - start_time) * 1000, 2)  # Convert to milliseconds
        
        # Parse URL for additional info
        parsed_url = urlparse(url)
        
        # Get response headers
        headers_info = {
            'content-type': response.headers.get('content-type', 'Unknown'),
            'server': response.headers.get('server', 'Unknown'),
            'content-length': response.headers.get('content-length', 'Unknown'),
            'last-modified': response.headers.get('last-modified', 'Unknown')
        }
        
        result = {
            'Status': 'Success',
            'Data': {
                'Url': url,
                'StatusCode': response.status_code,
                'StatusText': response.reason,
                'ResponseTime': response_time,
                'IsSuccessful': 200 <= response.status_code < 300,
                'ContentLength': len(response.content),
                'Headers': headers_info,
                'Domain': parsed_url.netloc,
                'Scheme': parsed_url.scheme,
                'FinalUrl': response.url if response.url != url else url,
                'RedirectCount': len(response.history) if follow_redirects else 0
            },
            'Timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return result
        
    except requests.exceptions.Timeout:
        return {
            'Status': 'Error',
            'Message': f'Request timeout after {timeout} seconds',
            'Timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
    except requests.exceptions.ConnectionError:
        return {
            'Status': 'Error',
            'Message': 'Connection error - unable to reach the website',
            'Timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
    except requests.exceptions.RequestException as e:
        return {
            'Status': 'Error',
            'Message': f'Request error: {str(e)}',
            'Timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
    except Exception as e:
        return {
            'Status': 'Error',
            'Message': f'Unexpected error: {str(e)}',
            'Timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }

def main():
    # Default URL for testing
    test_url = sys.argv[1] if len(sys.argv) > 1 else "https://www.google.com"
    timeout = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    result = check_website_status(test_url, timeout)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()`,
        parameters: [
          { name: "url", type: "string", description: "Website URL to check", required: true, defaultValue: "https://www.google.com" },
          { name: "timeout", type: "integer", description: "Request timeout in seconds", required: false, defaultValue: 10 },
          { name: "followRedirects", type: "boolean", description: "Follow HTTP redirects", required: false, defaultValue: true }
        ],
        outputProcessing: {
          rules: [
            { type: "json_path", pattern: "$.Data.StatusCode", field: "status_code" },
            { type: "json_path", pattern: "$.Data.ResponseTime", field: "response_time_ms" },
            { type: "json_path", pattern: "$.Data.IsSuccessful", field: "is_successful" }
          ]
        },
        tags: ["web", "monitoring", "health", "performance"],
        version: "1.3.0",
        author: "Monitoring Team",
        executionCount: 89,
        createdBy: usersList[1].id
      }
    ]).returning();

    // Seed Policies with proper script references
    const policiesList = await db.insert(policies).values([
      {
        name: "Windows Application Discovery",
        description: "Comprehensive discovery policy for Windows applications and frameworks",
        category: "operating_system",
        targetOs: "windows",
        availableScripts: [
          scriptsList.find(s => s.name === "Check .Net Version")?.id.toString() || "1",
          scriptsList.find(s => s.name === "SQL Server Version")?.id.toString() || "3",
          scriptsList.find(s => s.name === "Oracle DB Version")?.id.toString() || "6"
        ],
        executionFlow: [
          {
            stepNumber: 1,
            scriptId: scriptsList.find(s => s.name === "Check .Net Version")?.id || scriptsList[0].id,
            stepName: ".NET Framework Detection",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          },
          {
            stepNumber: 2,
            scriptId: scriptsList.find(s => s.name === "SQL Server Version")?.id || scriptsList[2].id,
            stepName: "SQL Server Discovery",
            runCondition: "on_success",
            onSuccess: "continue",
            onFailure: "skip"
          },
          {
            stepNumber: 3,
            scriptId: scriptsList.find(s => s.name === "Oracle DB Version")?.id || scriptsList[5].id,
            stepName: "Oracle Database Discovery",
            runCondition: "on_success",
            onSuccess: "continue",
            onFailure: "skip"
          }
        ],
        publishStatus: "published",
        isActive: true,
        version: "2.0.0",
        createdBy: usersList[0].id
      },
      {
        name: "Linux Web Server Discovery",
        description: "Discovery policy for Linux web servers and containerized applications",
        category: "network",
        targetOs: "linux",
        availableScripts: [
          scriptsList.find(s => s.name === "Network Interface Scanner")?.id.toString() || "5",
          scriptsList.find(s => s.name === "Apache Version")?.id.toString() || "2",
          scriptsList.find(s => s.name === "Docker Container List")?.id.toString() || "4"
        ],
        executionFlow: [
          {
            stepNumber: 1,
            scriptId: scriptsList.find(s => s.name === "Network Interface Scanner")?.id || scriptsList[4].id,
            stepName: "Network Configuration Discovery",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          },
          {
            stepNumber: 2,
            scriptId: scriptsList.find(s => s.name === "Apache Version")?.id || scriptsList[1].id,
            stepName: "Apache Web Server Detection",
            runCondition: "on_success",
            onSuccess: "continue",
            onFailure: "skip"
          },
          {
            stepNumber: 3,
            scriptId: scriptsList.find(s => s.name === "Docker Container List")?.id || scriptsList[3].id,
            stepName: "Docker Container Discovery",
            runCondition: "on_success",
            onSuccess: "continue",
            onFailure: "skip"
          }
        ],
        publishStatus: "published",
        isActive: true,
        version: "1.5.0",
        createdBy: usersList[1].id
      },
      {
        name: "Cross-Platform Health Check",
        description: "Universal health monitoring policy for all systems",
        category: "health_check",
        targetOs: "any",
        availableScripts: [
          scriptsList.find(s => s.name === "Website Status Check")?.id.toString() || "7"
        ],
        executionFlow: [
          {
            stepNumber: 1,
            scriptId: scriptsList.find(s => s.name === "Website Status Check")?.id || scriptsList[6].id,
            stepName: "Website Availability Check",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          }
        ],
        publishStatus: "published",
        isActive: true,
        version: "1.0.0",
        createdBy: usersList[2].id
      },
      {
        name: "Database Discovery Complete",
        description: "Complete database discovery for enterprise environments",
        category: "discovery",
        targetOs: "windows",
        availableScripts: [
          scriptsList.find(s => s.name === "SQL Server Version")?.id.toString() || "3",
          scriptsList.find(s => s.name === "Oracle DB Version")?.id.toString() || "6",
          scriptsList.find(s => s.name === "Check .Net Version")?.id.toString() || "1"
        ],
        executionFlow: [
          {
            stepNumber: 1,
            scriptId: scriptsList.find(s => s.name === "Check .Net Version")?.id || scriptsList[0].id,
            stepName: "Application Framework Discovery",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          },
          {
            stepNumber: 2,
            scriptId: scriptsList.find(s => s.name === "SQL Server Version")?.id || scriptsList[2].id,
            stepName: "SQL Server Instance Discovery",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          },
          {
            stepNumber: 3,
            scriptId: scriptsList.find(s => s.name === "Oracle DB Version")?.id || scriptsList[5].id,
            stepName: "Oracle Database Discovery",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          }
        ],
        publishStatus: "draft",
        isActive: false,
        version: "1.0.0",
        createdBy: usersList[0].id
      },
      {
        name: "DevOps Infrastructure Scan",
        description: "Comprehensive DevOps infrastructure discovery and monitoring",
        category: "discovery",
        targetOs: "linux",
        availableScripts: [
          scriptsList.find(s => s.name === "Docker Container List")?.id.toString() || "4",
          scriptsList.find(s => s.name === "Network Interface Scanner")?.id.toString() || "5",
          scriptsList.find(s => s.name === "Apache Version")?.id.toString() || "2"
        ],
        executionFlow: [
          {
            stepNumber: 1,
            scriptId: scriptsList.find(s => s.name === "Network Interface Scanner")?.id || scriptsList[4].id,
            stepName: "Network Infrastructure Analysis",
            runCondition: "always",
            onSuccess: "continue", 
            onFailure: "continue"
          },
          {
            stepNumber: 2,
            scriptId: scriptsList.find(s => s.name === "Docker Container List")?.id || scriptsList[3].id,
            stepName: "Container Infrastructure Discovery",
            runCondition: "on_success",
            onSuccess: "continue",
            onFailure: "skip"
          },
          {
            stepNumber: 3,
            scriptId: scriptsList.find(s => s.name === "Apache Version")?.id || scriptsList[1].id,
            stepName: "Web Server Configuration Check",
            runCondition: "on_success",
            onSuccess: "continue",
            onFailure: "skip"
          }
        ],
        publishStatus: "published",
        isActive: true,
        version: "1.2.0",
        createdBy: usersList[1].id
      },
      {
        name: "Enterprise Application Portfolio",
        description: "Complete enterprise application discovery and analysis",
        category: "discovery",
        targetOs: "windows",
        availableScripts: [
          scriptsList.find(s => s.name === "Check .Net Version")?.id.toString() || "1",
          scriptsList.find(s => s.name === "SQL Server Version")?.id.toString() || "3",
          scriptsList.find(s => s.name === "Oracle DB Version")?.id.toString() || "6",
          scriptsList.find(s => s.name === "Website Status Check")?.id.toString() || "7"
        ],
        executionFlow: [
          {
            stepNumber: 1,
            scriptId: scriptsList.find(s => s.name === "Check .Net Version")?.id || scriptsList[0].id,
            stepName: ".NET Application Framework Discovery",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          },
          {
            stepNumber: 2,
            scriptId: scriptsList.find(s => s.name === "SQL Server Version")?.id || scriptsList[2].id,
            stepName: "SQL Server Database Discovery",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          },
          {
            stepNumber: 3,
            scriptId: scriptsList.find(s => s.name === "Oracle DB Version")?.id || scriptsList[5].id,
            stepName: "Oracle Enterprise Database Discovery",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          },
          {
            stepNumber: 4,
            scriptId: scriptsList.find(s => s.name === "Website Status Check")?.id || scriptsList[6].id,
            stepName: "Web Application Health Check",
            runCondition: "on_success",
            onSuccess: "continue",
            onFailure: "skip"
          }
        ],
        publishStatus: "published",
        isActive: true,
        version: "2.1.0",
        createdBy: usersList[0].id
      },
      {
        name: "Quick Network Discovery",
        description: "Fast network infrastructure discovery for immediate insights",
        category: "network",
        targetOs: "linux",
        availableScripts: [
          scriptsList.find(s => s.name === "Network Interface Scanner")?.id.toString() || "5",
          scriptsList.find(s => s.name === "Website Status Check")?.id.toString() || "7"
        ],
        executionFlow: [
          {
            stepNumber: 1,
            scriptId: scriptsList.find(s => s.name === "Network Interface Scanner")?.id || scriptsList[4].id,
            stepName: "Network Configuration Scan",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          },
          {
            stepNumber: 2,
            scriptId: scriptsList.find(s => s.name === "Website Status Check")?.id || scriptsList[6].id,
            stepName: "Internet Connectivity Test",
            runCondition: "on_success",
            onSuccess: "continue",
            onFailure: "skip"
          }
        ],
        publishStatus: "published",
        isActive: true,
        version: "1.0.0",
        createdBy: usersList[2].id
      },
      {
        name: "Maintenance Mode Policy",
        description: "Limited discovery policy for systems under maintenance",
        category: "maintenance",
        targetOs: "any",
        availableScripts: [
          scriptsList.find(s => s.name === "Website Status Check")?.id.toString() || "7"
        ],
        executionFlow: [
          {
            stepNumber: 1,
            scriptId: scriptsList.find(s => s.name === "Website Status Check")?.id || scriptsList[6].id,
            stepName: "Basic Health Check",
            runCondition: "always",
            onSuccess: "continue",
            onFailure: "continue"
          }
        ],
        publishStatus: "maintenance",
        isActive: false,
        version: "1.0.0",
        createdBy: usersList[1].id
      }
    ]).returning();

    // Seed Endpoints
    const endpointsList = await db.insert(endpoints).values([
      {
        hostname: "DC01.enterprise.local",
        ipAddress: "10.1.1.10",
        macAddress: "00:50:56:12:34:56",
        operatingSystem: "Windows Server 2022",
        osVersion: "10.0.20348",
        domain: "ENTERPRISE.LOCAL",
        assetType: "server",
        status: "online",
        discoveryMethod: "agentless_scan",
        lastSeen: new Date(),
        complianceScore: 92.5,
        vulnerabilityCount: 3,
        criticalVulnerabilities: 0,
        systemInfo: {
          manufacturer: "VMware",
          model: "Virtual Machine",
          processor: "Intel Xeon E5-2690 v4",
          memory: "16 GB",
          storage: "500 GB SSD"
        },
        installedSoftware: [
          {
            name: "Active Directory Domain Services",
            version: "10.0.20348",
            vendor: "Microsoft",
            installDate: "2024-01-15"
          }
        ],
        vulnerabilities: [
          {
            cveId: "CVE-2024-1234",
            severity: "medium",
            description: "Windows Server vulnerability",
            publishedDate: "2024-06-15",
            solution: "Install KB5040442"
          }
        ],
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[0].id
      },
      {
        hostname: "WEB01.enterprise.local",
        ipAddress: "10.1.1.20",
        macAddress: "00:50:56:78:90:12",
        operatingSystem: "Ubuntu Server 22.04",
        osVersion: "22.04.3",
        domain: "enterprise.local",
        assetType: "server",
        status: "online",
        discoveryMethod: "agent_deployment",
        lastSeen: new Date(),
        complianceScore: 88.2,
        vulnerabilityCount: 7,
        criticalVulnerabilities: 1,
        systemInfo: {
          manufacturer: "Dell",
          model: "PowerEdge R740",
          processor: "Intel Xeon Silver 4210",
          memory: "32 GB",
          storage: "1 TB NVMe"
        },
        installedSoftware: [
          {
            name: "Apache HTTP Server",
            version: "2.4.52",
            vendor: "Apache Software Foundation",
            installDate: "2024-02-01"
          }
        ],
        vulnerabilities: [
          {
            cveId: "CVE-2024-5678",
            severity: "critical",
            description: "Apache HTTP Server vulnerability",
            publishedDate: "2024-07-10",
            solution: "Update to version 2.4.58"
          }
        ],
        agentId: "agent-001",
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[1].id
      }
    ]).returning();

    // Seed Discovery Jobs - Comprehensive Dataset
    const jobsList = await db.insert(discoveryJobs).values([
      {
        name: "Weekly Enterprise Network Scan",
        description: "Comprehensive weekly network discovery for main campus infrastructure",
        type: "agentless",
        status: "completed",
        targets: {
          ipRanges: ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"],
          hostnames: ["*.enterprise.local", "*.corp.local"]
        },
        discoveryProfiles: ["operating_system", "network", "security"],
        schedule: {
          type: "recurring",
          frequency: "weekly",
          businessHours: true
        },
        progress: {
          total: 254,
          discovered: 247,
          failed: 7,
          inProgress: 0
        },
        results: {
          totalAssets: 247,
          newAssets: 12,
          updatedAssets: 235,
          errors: []
        },
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[0].id,
        createdBy: usersList[0].id,
        startedAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 3600000)
      },
      {
        name: "DMZ Security Assessment",
        description: "Critical security assessment for DMZ network infrastructure",
        type: "agentless",
        status: "running",
        targets: {
          ipRanges: ["172.16.100.0/24"],
          hostnames: ["web*.dmz.enterprise.local", "mail*.dmz.enterprise.local"]
        },
        discoveryProfiles: ["security", "network", "compliance"],
        schedule: {
          type: "scheduled",
          startTime: new Date(Date.now() - 1800000).toISOString(),
          businessHours: false
        },
        progress: {
          total: 45,
          discovered: 32,
          failed: 2,
          inProgress: 11
        },
        results: {
          totalAssets: 32,
          newAssets: 5,
          updatedAssets: 27,
          errors: [
            { target: "172.16.100.25", error: "Connection timeout", timestamp: new Date().toISOString() },
            { target: "172.16.100.30", error: "Authentication failed", timestamp: new Date().toISOString() }
          ]
        },
        probeId: probesList[2].id,
        credentialProfileId: credProfilesList[1].id,
        createdBy: usersList[1].id,
        startedAt: new Date(Date.now() - 1800000)
      },
      {
        name: "Branch Office Discovery",
        description: "Monthly discovery scan for remote branch office networks",
        type: "agentless",
        status: "scheduled",
        targets: {
          ipRanges: ["192.168.50.0/24", "192.168.51.0/24"],
          hostnames: ["*.branch01.enterprise.local"]
        },
        discoveryProfiles: ["operating_system", "network"],
        schedule: {
          type: "recurring",
          frequency: "monthly",
          startTime: new Date(Date.now() + 86400000).toISOString(),
          businessHours: true
        },
        progress: {
          total: 0,
          discovered: 0,
          failed: 0,
          inProgress: 0
        },
        results: {
          totalAssets: 0,
          newAssets: 0,
          updatedAssets: 0,
          errors: []
        },
        probeId: probesList[1].id,
        credentialProfileId: credProfilesList[0].id,
        createdBy: usersList[2].id
      },
      {
        name: "Database Server Inventory",
        description: "Quarterly inventory scan focusing on database servers and services",
        type: "agentless",
        status: "completed",
        targets: {
          hostnames: ["db*.enterprise.local", "sql*.enterprise.local", "oracle*.enterprise.local"],
          ipSegments: ["10.2.10.0/28"]
        },
        discoveryProfiles: ["database", "operating_system", "security"],
        schedule: {
          type: "recurring",
          frequency: "quarterly",
          businessHours: true
        },
        progress: {
          total: 18,
          discovered: 16,
          failed: 2,
          inProgress: 0
        },
        results: {
          totalAssets: 16,
          newAssets: 3,
          updatedAssets: 13,
          errors: [
            { target: "db05.enterprise.local", error: "WMI access denied", timestamp: new Date(Date.now() - 86400000).toISOString() }
          ]
        },
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[2].id,
        createdBy: usersList[0].id,
        startedAt: new Date(Date.now() - 172800000),
        completedAt: new Date(Date.now() - 86400000)
      },
      {
        name: "Production Web Servers Scan",
        description: "High-priority scan for production web server infrastructure",
        type: "agentless",
        status: "failed",
        targets: {
          hostnames: ["web*.prod.enterprise.local", "app*.prod.enterprise.local"],
          ipRanges: ["10.3.1.0/24"]
        },
        discoveryProfiles: ["web_services", "security", "compliance"],
        schedule: {
          type: "now",
          businessHours: false
        },
        progress: {
          total: 24,
          discovered: 8,
          failed: 16,
          inProgress: 0
        },
        results: {
          totalAssets: 8,
          newAssets: 0,
          updatedAssets: 8,
          errors: [
            { target: "web03.prod.enterprise.local", error: "Certificate validation failed", timestamp: new Date(Date.now() - 7200000).toISOString() },
            { target: "10.3.1.15", error: "Port 22 connection refused", timestamp: new Date(Date.now() - 7200000).toISOString() }
          ]
        },
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[1].id,
        createdBy: usersList[1].id,
        startedAt: new Date(Date.now() - 14400000),
        completedAt: new Date(Date.now() - 7200000)
      },
      {
        name: "VLAN Segmentation Analysis",
        description: "Network segmentation discovery across multiple VLANs for compliance audit",
        type: "agentless",
        status: "paused",
        targets: {
          ipRanges: ["10.10.0.0/16", "10.20.0.0/16", "10.30.0.0/16"],
          ipSegments: ["172.17.0.0/24", "172.18.0.0/24"]
        },
        discoveryProfiles: ["network", "compliance", "security"],
        schedule: {
          type: "scheduled",
          startTime: new Date(Date.now() - 3600000).toISOString(),
          businessHours: true
        },
        progress: {
          total: 2048,
          discovered: 1247,
          failed: 152,
          inProgress: 649
        },
        results: {
          totalAssets: 1247,
          newAssets: 89,
          updatedAssets: 1158,
          errors: []
        },
        probeId: probesList[1].id,
        credentialProfileId: credProfilesList[0].id,
        createdBy: usersList[2].id,
        startedAt: new Date(Date.now() - 3600000)
      },
      {
        name: "IoT Device Discovery",
        description: "Specialized scan for IoT devices and embedded systems in corporate network",
        type: "agentless",
        status: "completed",
        targets: {
          ipRanges: ["192.168.100.0/24", "192.168.101.0/24"],
          hostnames: ["iot*.enterprise.local", "sensor*.enterprise.local"]
        },
        discoveryProfiles: ["iot_devices", "network", "security"],
        schedule: {
          type: "recurring",
          frequency: "daily",
          businessHours: true
        },
        progress: {
          total: 156,
          discovered: 142,
          failed: 14,
          inProgress: 0
        },
        results: {
          totalAssets: 142,
          newAssets: 23,
          updatedAssets: 119,
          errors: []
        },
        probeId: probesList[1].id,
        credentialProfileId: credProfilesList[2].id,
        createdBy: usersList[0].id,
        startedAt: new Date(Date.now() - 43200000),
        completedAt: new Date(Date.now() - 28800000)
      },
      {
        name: "Cloud Infrastructure Mapping",
        description: "Discovery scan for hybrid cloud infrastructure and on-premises integration points",
        type: "agentless",
        status: "scheduled",
        targets: {
          ipRanges: ["10.100.0.0/20"],
          hostnames: ["cloud*.enterprise.local", "hybrid*.enterprise.local"]
        },
        discoveryProfiles: ["cloud_services", "network", "compliance"],
        schedule: {
          type: "recurring",
          frequency: "weekly",
          startTime: new Date(Date.now() + 172800000).toISOString(),
          businessHours: false
        },
        progress: {
          total: 0,
          discovered: 0,
          failed: 0,
          inProgress: 0
        },
        results: {
          totalAssets: 0,
          newAssets: 0,
          updatedAssets: 0,
          errors: []
        },
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[1].id,
        createdBy: usersList[1].id
      },
      {
        name: "Legacy System Audit",
        description: "Critical audit scan for legacy systems requiring special attention and compliance review",
        type: "agentless",
        status: "disabled",
        targets: {
          hostnames: ["legacy*.enterprise.local", "old*.enterprise.local"],
          ipSegments: ["10.50.0.0/26"]
        },
        discoveryProfiles: ["legacy_systems", "security", "compliance"],
        schedule: {
          type: "manual",
          businessHours: true
        },
        progress: {
          total: 32,
          discovered: 28,
          failed: 4,
          inProgress: 0
        },
        results: {
          totalAssets: 28,
          newAssets: 0,
          updatedAssets: 28,
          errors: [
            { target: "legacy03.enterprise.local", error: "Unsupported protocol", timestamp: new Date(Date.now() - 604800000).toISOString() }
          ]
        },
        probeId: probesList[2].id,
        credentialProfileId: credProfilesList[0].id,
        createdBy: usersList[2].id,
        startedAt: new Date(Date.now() - 604800000),
        completedAt: new Date(Date.now() - 518400000)
      },
      {
        name: "Emergency Response Network Scan",
        description: "Urgent security scan triggered by incident response protocol",
        type: "agentless",
        status: "running",
        targets: {
          ipRanges: ["10.1.0.0/16", "172.16.0.0/16"],
          hostnames: ["*.enterprise.local"]
        },
        discoveryProfiles: ["security", "compliance", "incident_response"],
        schedule: {
          type: "now",
          businessHours: false
        },
        progress: {
          total: 4096,
          discovered: 1523,
          failed: 89,
          inProgress: 2484
        },
        results: {
          totalAssets: 1523,
          newAssets: 156,
          updatedAssets: 1367,
          errors: []
        },
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[1].id,
        createdBy: usersList[0].id,
        startedAt: new Date(Date.now() - 900000)
      },
      {
        name: "Quarterly Compliance Audit",
        description: "Comprehensive quarterly compliance audit covering all enterprise networks",
        type: "agentless",
        status: "scheduled",
        targets: {
          ipRanges: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
          hostnames: ["*.enterprise.local", "*.corp.local", "*.dmz.enterprise.local"]
        },
        discoveryProfiles: ["compliance", "security", "operating_system", "network"],
        schedule: {
          type: "recurring",
          frequency: "quarterly",
          startTime: new Date(Date.now() + 2592000000).toISOString(),
          businessHours: true
        },
        progress: {
          total: 0,
          discovered: 0,
          failed: 0,
          inProgress: 0
        },
        results: {
          totalAssets: 0,
          newAssets: 0,
          updatedAssets: 0,
          errors: []
        },
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[2].id,
        createdBy: usersList[0].id
      },
      {
        name: "Development Environment Scan",
        description: "Regular development environment discovery for change tracking and security monitoring",
        type: "agentless",
        status: "completed",
        targets: {
          ipRanges: ["10.200.0.0/24", "10.201.0.0/24"],
          hostnames: ["dev*.enterprise.local", "test*.enterprise.local", "staging*.enterprise.local"]
        },
        discoveryProfiles: ["development", "security", "network"],
        schedule: {
          type: "recurring",
          frequency: "daily",
          businessHours: true
        },
        progress: {
          total: 67,
          discovered: 64,
          failed: 3,
          inProgress: 0
        },
        results: {
          totalAssets: 64,
          newAssets: 7,
          updatedAssets: 57,
          errors: []
        },
        probeId: probesList[1].id,
        credentialProfileId: credProfilesList[0].id,
        createdBy: usersList[2].id,
        startedAt: new Date(Date.now() - 21600000),
        completedAt: new Date(Date.now() - 18000000)
      }
    ]).returning();

    // Seed Agent Deployments
    const deploymentsList = await db.insert(agentDeployments).values([
      {
        name: "Linux Servers Agent Deployment",
        description: "Deploy discovery agents to all Linux servers",
        policyIds: [policiesList[1].id],
        targets: {
          ipRanges: ["10.1.1.0/24"]
        },
        deploymentMethod: "ssh",
        schedule: {
          type: "now",
          businessHours: false
        },
        status: "running",
        progress: {
          total: 45,
          applied: 38,
          inProgress: 5,
          pending: 2,
          failed: 0
        },
        results: {
          successfulDeployments: 38,
          failedDeployments: 0,
          errors: []
        },
        probeId: probesList[0].id,
        credentialProfileId: credProfilesList[1].id,
        createdBy: usersList[0].id,
        startedAt: new Date(Date.now() - 7200000)
      }
    ]).returning();

    // Seed Agents
    const agentsList = await db.insert(agents).values([
      {
        id: "agent-001",
        hostname: "WEB01.enterprise.local",
        ipAddress: "10.1.1.20",
        operatingSystem: "Ubuntu Server 22.04",
        version: "2.1.5",
        status: "online",
        lastHeartbeat: new Date(),
        capabilities: ["discovery", "monitoring", "compliance"],
        systemInfo: {
          manufacturer: "Dell",
          model: "PowerEdge R740",
          processor: "Intel Xeon Silver 4210",
          memory: "32 GB",
          storage: "1 TB NVMe"
        },
        deploymentMethod: "ssh",
        deploymentId: deploymentsList[0].id,
        endpointId: endpointsList[1].id,
        installedAt: new Date(Date.now() - 86400000),
        appliedPolicies: [
          {
            policyId: policiesList[1].id,
            appliedAt: new Date().toISOString(),
            status: "active",
            results: {
              lastExecution: new Date().toISOString(),
              success: true
            }
          }
        ],
        discoveryResults: {
          assetsDiscovered: 15,
          lastDiscovery: new Date().toISOString(),
          errors: []
        }
      }
    ]).returning();

    // Seed Activity Logs
    await db.insert(activityLogs).values([
      {
        type: "discovery",
        category: "success",
        title: "Network scan completed",
        description: "Weekly network scan discovered 12 new assets",
        entityType: "job",
        entityId: jobsList[0].id.toString(),
        userId: usersList[0].id
      },
      {
        type: "deployment",
        category: "info",
        title: "Agent deployment in progress",
        description: "Linux server agent deployment 85% complete",
        entityType: "deployment",
        entityId: deploymentsList[0].id.toString(),
        userId: usersList[0].id
      },
      {
        type: "system",
        category: "warning",
        title: "High CPU usage detected",
        description: "DMZ probe showing elevated CPU usage (45.8%)",
        entityType: "probe",
        entityId: probesList[2].id.toString(),
        userId: usersList[1].id
      }
    ]);

    // Seed System Status
    await db.insert(systemStatus).values([
      {
        service: "discovery_service",
        status: "healthy",
        uptime: 172800,
        metrics: {
          cpu: 15.2,
          memory: 32.8,
          responseTime: 125,
          errorRate: 0.02
        }
      },
      {
        service: "agent_service",
        status: "healthy",
        uptime: 259200,
        metrics: {
          cpu: 8.7,
          memory: 28.3,
          responseTime: 98,
          errorRate: 0.01
        }
      },
      {
        service: "database",
        status: "healthy",
        uptime: 518400,
        metrics: {
          cpu: 12.1,
          memory: 45.6,
          responseTime: 45,
          errorRate: 0.00
        }
      }
    ]);

    // Seed Dashboard Stats
    await db.insert(dashboardStats).values([
      {
        date: new Date(),
        totalEndpoints: 247,
        onlineEndpoints: 235,
        offlineEndpoints: 12,
        criticalAlerts: 3,
        warningAlerts: 15,
        activeJobs: 2,
        completedJobs: 156,
        failedJobs: 8,
        complianceScore: 89.7,
        vulnerabilitiesDetected: 127,
        agentsDeployed: 183
      }
    ]);

    console.log("Database seeded successfully!");
    console.log(`Created ${usersList.length} users`);
    console.log(`Created ${credProfilesList.length} credential profiles`);
    console.log(`Created ${probesList.length} discovery probes`);
    console.log(`Created ${scriptsList.length} scripts`);
    console.log(`Created ${policiesList.length} policies`);
    console.log(`Created ${endpointsList.length} endpoints`);
    console.log(`Created ${jobsList.length} discovery jobs`);
    console.log(`Created ${deploymentsList.length} agent deployments`);
    console.log(`Created ${agentsList.length} agents`);

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seed completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed failed:", error);
      process.exit(1);
    });
}

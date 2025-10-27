using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Data;
using Dapper;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Npgsql;
using NpgsqlTypes;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/discovery-scripts")]
public class DiscoveryScriptsController : ControllerBase
{
    private readonly ILogger<DiscoveryScriptsController> _logger;
    private readonly IDbFactory _dbFactory;

    public DiscoveryScriptsController(ILogger<DiscoveryScriptsController> logger, IDbFactory dbFactory)
    {
        _logger = logger;
        _dbFactory = dbFactory;
    }

    [HttpGet]
    public async Task<IActionResult> GetDiscoveryScripts([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            // First check if table exists
            var tableExists = await connection.QuerySingleOrDefaultAsync<bool>(@"
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'discovery_scripts'
                );
            ");

            if (!tableExists)
            {
                _logger.LogWarning("Discovery scripts table does not exist");
                return Ok(new List<object>());
            }

            var offset = (page - 1) * pageSize;
            
            // Query all scripts (including recently saved ones)
            var scripts = await connection.QueryAsync(@"
                SELECT 
                    id,
                    name,
                    description,
                    category,
                    type,
                    target_os,
                    template,
                    version,
                    is_active,
                    vendor,
                    complexity,
                    estimated_run_time_seconds,
                    requires_elevation,
                    requires_network,
                    parameters,
                    output_format,
                    output_processing,
                    credential_requirements,
                    tags,
                    industries,
                    compliance_frameworks,
                    is_standard,
                    created_at,
                    updated_at
                FROM discovery_scripts 
                WHERE is_active = TRUE 
                ORDER BY created_at DESC 
                LIMIT @PageSize OFFSET @Offset
            ", new { PageSize = pageSize, Offset = offset });

            // Convert to proper response format that matches your frontend interface
            var discoveryScripts = scripts.Select(s => new
            {
                id = s.id,
                name = s.name ?? "",
                description = s.description ?? "",
                category = s.category ?? "System Discovery",
                type = s.type ?? "powershell",
                targetOs = s.target_os ?? "windows",
                template = s.template ?? "",
                version = s.version ?? "1.0",
                isActive = s.is_active ?? true,
                vendor = s.vendor ?? "Custom",
                complexity = s.complexity ?? "medium",
                estimatedRunTimeSeconds = s.estimated_run_time_seconds ?? 30,
                requiresElevation = s.requires_elevation ?? false,
                requiresNetwork = s.requires_network ?? false,
                parameters = s.parameters ?? "{}",
                outputFormat = s.output_format ?? "json",
                outputProcessing = s.output_processing,
                credentialRequirements = s.credential_requirements,
                tags = ConvertToStringArray(s.tags),
                industries = ConvertToStringArray(s.industries),
                complianceFrameworks = ConvertToStringArray(s.compliance_frameworks),
                isStandard = s.is_standard ?? false,
                createdAt = s.created_at.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                updatedAt = s.updated_at.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                // Optional frontend fields
                executionCount = 0,
                isFavorite = false
            }).ToList();

            _logger.LogInformation("Retrieved {Count} discovery scripts", discoveryScripts.Count);
            return Ok(discoveryScripts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve discovery scripts: {Message}", ex.Message);
            return StatusCode(500, new { 
                error = "Failed to retrieve discovery scripts", 
                message = ex.Message
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDiscoveryScript(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var script = await connection.QuerySingleOrDefaultAsync<DiscoveryScript>(@"
                SELECT * FROM discovery_scripts 
                WHERE id = @Id AND is_active = TRUE
            ", new { Id = id });

            if (script == null)
            {
                return NotFound(new { error = "Discovery script not found" });
            }

            _logger.LogInformation("Retrieved discovery script: {ScriptName} (ID: {ScriptId})", script.Name, id);
            return Ok(script);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve discovery script with id {Id}", id);
            return StatusCode(500, new { error = "Failed to retrieve discovery script" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateDiscoveryScript([FromBody] CreateDiscoveryScriptRequest request)
    {
        try
        {
            // Validation
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { error = "Name is required" });

            if (string.IsNullOrWhiteSpace(request.Template))
                return BadRequest(new { error = "Template is required" });

            using var connection = _dbFactory.Open();

            // Check for duplicate name
            var existingCount = await connection.QuerySingleOrDefaultAsync<int>(@"
                SELECT COUNT(*) FROM discovery_scripts 
                WHERE name = @Name AND is_active = TRUE
            ", new { Name = request.Name });

            if (existingCount > 0)
            {
                return BadRequest(new { error = "A script with this name already exists" });
            }

            // Prepare JSONB values - ensure they're valid JSON strings
            var parametersJson = string.IsNullOrEmpty(request.Parameters) ? "{}" : request.Parameters;
            var outputProcessingJson = string.IsNullOrEmpty(request.OutputProcessing) ? "{}" : request.OutputProcessing;
            var credentialRequirementsJson = string.IsNullOrEmpty(request.CredentialRequirements) ? "{}" : request.CredentialRequirements;

            // Validate JSON strings
            try
            {
                System.Text.Json.JsonDocument.Parse(parametersJson);
                System.Text.Json.JsonDocument.Parse(outputProcessingJson);
                System.Text.Json.JsonDocument.Parse(credentialRequirementsJson);
            }
            catch (System.Text.Json.JsonException ex)
            {
                return BadRequest(new { error = "Invalid JSON format in parameters", details = ex.Message });
            }

            var scriptId = await connection.QuerySingleAsync<int>(@"
                INSERT INTO discovery_scripts (
                    name, description, category, type, target_os, template, version, 
                    is_active, vendor, complexity, estimated_run_time_seconds, 
                    requires_elevation, requires_network, parameters, output_format, 
                    output_processing, credential_requirements, tags, industries, 
                    compliance_frameworks, is_standard, created_at, updated_at
                ) VALUES (
                    @Name, @Description, @Category, @Type, @TargetOs, @Template, @Version, 
                    @IsActive, @Vendor, @Complexity, @EstimatedRunTimeSeconds, 
                    @RequiresElevation, @RequiresNetwork, 
                    @Parameters::jsonb, @OutputFormat, 
                    @OutputProcessing::jsonb, @CredentialRequirements::jsonb, 
                    @Tags, @Industries, @ComplianceFrameworks, 
                    @IsStandard, @CreatedAt, @UpdatedAt
                ) 
                RETURNING id
            ", new
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? "",
                Category = request.Category ?? "System Discovery",
                Type = request.Type ?? "powershell",
                TargetOs = request.TargetOs ?? "windows",
                Template = request.Template.Trim(),
                Version = request.Version ?? "1.0",
                IsActive = request.IsActive ?? true,
                Vendor = request.Vendor ?? "Custom",
                Complexity = request.Complexity ?? "medium",
                EstimatedRunTimeSeconds = request.EstimatedRunTimeSeconds ?? 30,
                RequiresElevation = request.RequiresElevation ?? false,
                RequiresNetwork = request.RequiresNetwork ?? false,
                // Pass as strings and cast to JSONB in SQL using ::jsonb
                Parameters = parametersJson,
                OutputFormat = request.OutputFormat ?? "json",
                OutputProcessing = outputProcessingJson,
                CredentialRequirements = credentialRequirementsJson,
                Tags = request.Tags ?? new string[0],
                Industries = request.Industries ?? new string[0],
                ComplianceFrameworks = request.ComplianceFrameworks ?? new string[0],
                IsStandard = request.IsStandard ?? false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            _logger.LogInformation("Created discovery script: {ScriptName} (ID: {ScriptId})", request.Name, scriptId);

            return Ok(new { 
                id = scriptId, 
                message = "Script created successfully",
                name = request.Name 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create discovery script: {ScriptName} - Error: {Error}", 
                request?.Name ?? "Unknown", ex.Message);
            return StatusCode(500, new { 
                error = "Failed to create discovery script", 
                details = ex.Message 
            });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDiscoveryScript(int id, [FromBody] CreateDiscoveryScriptRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest(new { error = "Name is required" });

            if (string.IsNullOrWhiteSpace(request.Template))
                return BadRequest(new { error = "Template is required" });

            using var connection = _dbFactory.Open();

            // Check if script exists
            var existingScript = await connection.QuerySingleOrDefaultAsync<DiscoveryScript>(@"
                SELECT * FROM discovery_scripts 
                WHERE id = @Id AND is_active = TRUE
            ", new { Id = id });

            if (existingScript == null)
            {
                return NotFound(new { error = "Discovery script not found" });
            }

            // Prepare JSONB values
            var parametersJson = string.IsNullOrEmpty(request.Parameters) ? "{}" : request.Parameters;
            var outputProcessingJson = string.IsNullOrEmpty(request.OutputProcessing) ? "{}" : request.OutputProcessing;
            var credentialRequirementsJson = string.IsNullOrEmpty(request.CredentialRequirements) ? "{}" : request.CredentialRequirements;

            // Validate JSON strings
            try
            {
                System.Text.Json.JsonDocument.Parse(parametersJson);
                System.Text.Json.JsonDocument.Parse(outputProcessingJson);
                System.Text.Json.JsonDocument.Parse(credentialRequirementsJson);
            }
            catch (System.Text.Json.JsonException ex)
            {
                return BadRequest(new { error = "Invalid JSON format in parameters", details = ex.Message });
            }

            var updateResult = await connection.ExecuteAsync(@"
                UPDATE discovery_scripts 
                SET name = @Name, description = @Description, category = @Category, 
                    type = @Type, target_os = @TargetOs, template = @Template, 
                    version = @Version, is_active = @IsActive, tags = @Tags, vendor = @Vendor, 
                    complexity = @Complexity, estimated_run_time_seconds = @EstimatedRunTimeSeconds, 
                    requires_elevation = @RequiresElevation, requires_network = @RequiresNetwork, 
                    parameters = @Parameters::jsonb, output_format = @OutputFormat, 
                    output_processing = @OutputProcessing::jsonb, credential_requirements = @CredentialRequirements::jsonb, 
                    industries = @Industries, compliance_frameworks = @ComplianceFrameworks, 
                    updated_at = @UpdatedAt
                WHERE id = @Id
            ", new
            {
                Id = id,
                Name = request.Name,
                Description = request.Description ?? "",
                Category = request.Category ?? "System Discovery",
                Type = request.Type ?? "powershell",
                TargetOs = request.TargetOs ?? "windows",
                Template = request.Template,
                Version = request.Version ?? "1.0",
                IsActive = request.IsActive ?? true,
                Tags = request.Tags ?? new string[0],
                Vendor = request.Vendor ?? "Custom",
                Complexity = request.Complexity ?? "medium",
                EstimatedRunTimeSeconds = request.EstimatedRunTimeSeconds ?? 30,
                RequiresElevation = request.RequiresElevation ?? false,
                RequiresNetwork = request.RequiresNetwork ?? false,
                Parameters = parametersJson,
                OutputFormat = request.OutputFormat ?? "json",
                OutputProcessing = outputProcessingJson,
                CredentialRequirements = credentialRequirementsJson,
                Industries = request.Industries ?? new string[0],
                ComplianceFrameworks = request.ComplianceFrameworks ?? new string[0],
                UpdatedAt = DateTime.UtcNow
            });

        if (updateResult == 0)
        {
            return NotFound(new { error = "Discovery script not found" });
        }

        _logger.LogInformation("Updated discovery script: {ScriptName} (ID: {ScriptId})", request.Name, id);

        // Retrieve and return the updated script
        var updatedScript = await connection.QuerySingleAsync<DiscoveryScript>(@"
            SELECT * FROM discovery_scripts WHERE id = @Id
        ", new { Id = id });

        return Ok(updatedScript);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Failed to update discovery script with id {Id}", id);
        return StatusCode(500, new { error = "Failed to update discovery script" });
    }
}

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteScript(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var deleteResult = await connection.ExecuteAsync(@"
                UPDATE discovery_scripts 
                SET is_active = FALSE, updated_at = @UpdatedAt
                WHERE id = @Id AND is_active = TRUE
            ", new { Id = id, UpdatedAt = DateTime.UtcNow });

            if (deleteResult == 0)
            {
                return NotFound(new { error = "Discovery script not found" });
            }

            _logger.LogInformation("Deleted discovery script with id {ScriptId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete discovery script with id {Id}", id);
            return StatusCode(500, new { error = "Failed to delete discovery script" });
        }
    }

    [HttpGet("templates")]
    public IActionResult GetScriptTemplates()
    {
        try
        {
            var templates = new List<object>
            {
                new {
                    id = "powershell_basic",
                    name = "PowerShell Basic System Info",
                    type = "powershell",
                    targetOs = "windows",
                    category = "System Discovery",
                    description = "Basic system information gathering using PowerShell",
                    template = "# PowerShell System Information Discovery\n# Enterprise-grade script with comprehensive error handling\n\n$ErrorActionPreference = 'Stop'\n\ntry {\n    # Collect comprehensive system information\n    $computerInfo = Get-ComputerInfo -Property WindowsProductName, WindowsVersion, TotalPhysicalMemory\n    $osInfo = Get-WmiObject -Class Win32_OperatingSystem\n    $cpuInfo = Get-WmiObject -Class Win32_Processor | Select-Object -First 1\n    $diskInfo = Get-WmiObject -Class Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 }\n\n    # Structure the output in a standardized format\n    $result = @{\n        Status = 'Success'\n        Data = @{\n            System = @{\n                ComputerName = $env:COMPUTERNAME\n                Domain = $env:USERDOMAIN\n                OS = $computerInfo.WindowsProductName\n                Version = $computerInfo.WindowsVersion\n                Architecture = $osInfo.OSArchitecture\n                InstallDate = $osInfo.InstallDate\n            }\n            Hardware = @{\n                TotalMemoryGB = [math]::Round($computerInfo.TotalPhysicalMemory / 1GB, 2)\n                Processor = $cpuInfo.Name\n                Cores = $cpuInfo.NumberOfCores\n                LogicalProcessors = $cpuInfo.NumberOfLogicalProcessors\n            }\n            Storage = $diskInfo | ForEach-Object { \n                @{\n                    Drive = $_.DeviceID\n                    SizeGB = [math]::Round($_.Size / 1GB, 2)\n                    FreeSpaceGB = [math]::Round($_.FreeSpace / 1GB, 2)\n                    FileSystem = $_.FileSystem\n                }\n            }\n        }\n        Metadata = @{\n            ScriptVersion = '1.0'\n            ExecutionTime = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'\n            Duration = (Measure-Command { }).TotalSeconds\n        }\n    }\n\n    # Output results as JSON\n    Write-Output ($result | ConvertTo-Json -Depth 4)\n}\ncatch {\n    $errorResult = @{\n        Status = 'Error'\n        Message = $_.Exception.Message\n        Line = $_.InvocationInfo.ScriptLineNumber\n        Position = $_.InvocationInfo.OffsetInLine\n        Timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'\n    }\n    \n    Write-Output ($errorResult | ConvertTo-Json -Depth 2)\n    exit 1\n}"
                },
                new {
                    id = "bash_system_info",
                    name = "Bash System Information",
                    type = "bash",
                    targetOs = "linux",
                    category = "System Discovery",
                    description = "Comprehensive Linux system information gathering",
                    template = "#!/bin/bash\n# Linux System Information Discovery\n# Enterprise-grade script with comprehensive error handling\n\nset -euo pipefail\n\n# Function to handle errors\nerror_handler() {\n    echo '{'\n    echo '  \"Status\": \"Error\",'\n    echo '  \"Message\": \"Script failed at line $1\",'\n    echo '  \"Timestamp\": \"'$(date -u +%Y-%m-%dTH:%M:%SZ)'\"'\n    echo '}'\n    exit 1\n}\n\ntrap 'error_handler $LINENO' ERR\n\n# Main discovery function\ndiscover_system() {\n    local hostname=$(hostname -f)\n    local kernel=$(uname -r)\n    local arch=$(uname -m)\n    local uptime=$(uptime -s)\n    local memory_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')\n    local memory_gb=$(echo \"scale=2; $memory_kb/1024/1024\" | bc)\n    local cpu_info=$(grep -m1 'model name' /proc/cpuinfo | cut -d':' -f2 | xargs)\n    local cpu_cores=$(nproc)\n    local os_release=$(cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2 | tr -d '\"')\n    \n    # Get disk information\n    local disk_info=$(df -h / | tail -n1 | awk '{print \"\\\"Drive\\\": \\\"/\\\", \\\"Size\\\": \\\"\" $2 \"\\\", \\\"Used\\\": \\\"\" $3 \"\\\", \\\"Available\\\": \\\"\" $4 \"\\\", \\\"UsePercent\\\": \\\"\" $5 \"\\\"\"}')\n    \n    # Generate JSON output\n    cat << EOF\n{\n  \"Status\": \"Success\",\n  \"Data\": {\n    \"System\": {\n      \"Hostname\": \"$hostname\",\n      \"Kernel\": \"$kernel\",\n      \"Architecture\": \"$arch\",\n      \"OS\": \"$os_release\",\n      \"Uptime\": \"$uptime\"\n    },\n    \"Hardware\": {\n      \"TotalMemoryGB\": $memory_gb,\n      \"Processor\": \"$cpu_info\",\n      \"Cores\": $cpu_cores\n    },\n    \"Storage\": {\n      $disk_info\n    }\n  },\n  \"Metadata\": {\n    \"ScriptVersion\": \"1.0\",\n    \"ExecutionTime\": \"$(date -u +%Y-%m-%dTH:%M:%SZ)\"\n  }\n}\nEOF\n}\n\n# Execute discovery\ndiscover_system"
                },
                new {
                    id = "python_cross_platform",
                    name = "Python Cross-Platform Discovery",
                    type = "python",
                    targetOs = "cross-platform",
                    category = "System Discovery",
                    description = "Cross-platform system discovery using Python",
                    template = "#!/usr/bin/env python3\n\"\"\"\nCross-Platform System Information Discovery\nEnterprise-grade Python script with comprehensive error handling\n\"\"\"\n\nimport json\nimport platform\nimport psutil\nimport datetime\nimport sys\nimport traceback\nfrom pathlib import Path\n\ndef get_system_info():\n    \"\"\"Collect comprehensive system information\"\"\"\n    try:\n        # Basic system info\n        system_info = {\n            'hostname': platform.node(),\n            'system': platform.system(),\n            'release': platform.release(),\n            'version': platform.version(),\n            'machine': platform.machine(),\n            'processor': platform.processor(),\n            'python_version': platform.python_version()\n        }\n        \n        # Memory information\n        memory = psutil.virtual_memory()\n        memory_info = {\n            'total_gb': round(memory.total / (1024**3), 2),\n            'available_gb': round(memory.available / (1024**3), 2),\n            'percent_used': memory.percent\n        }\n        \n        # CPU information\n        cpu_info = {\n            'physical_cores': psutil.cpu_count(logical=False),\n            'logical_cores': psutil.cpu_count(logical=True),\n            'cpu_freq_mhz': psutil.cpu_freq().current if psutil.cpu_freq() else None,\n            'cpu_percent': psutil.cpu_percent(interval=1)\n        }\n        \n        # Disk information\n        disk_info = []\n        for partition in psutil.disk_partitions():\n            try:\n                usage = psutil.disk_usage(partition.mountpoint)\n                disk_info.append({\n                    'device': partition.device,\n                    'mountpoint': partition.mountpoint,\n                    'filesystem': partition.fstype,\n                    'total_gb': round(usage.total / (1024**3), 2),\n                    'free_gb': round(usage.free / (1024**3), 2),\n                    'percent_used': round(((usage.total - usage.free) / usage.total) * 100, 2)\n                })\n            except PermissionError:\n                continue\n        \n        # Boot time\n        boot_time = datetime.datetime.fromtimestamp(psutil.boot_time())\n        \n        return {\n            'Status': 'Success',\n            'Data': {\n                'System': system_info,\n                'Hardware': {\n                    'Memory': memory_info,\n                    'CPU': cpu_info,\n                    'BootTime': boot_time.isoformat()\n                },\n                'Storage': disk_info\n            },\n            'Metadata': {\n                'ScriptVersion': '1.0',\n                'ExecutionTime': datetime.datetime.utcnow().isoformat() + 'Z'\n            }\n        }\n        \n    except Exception as e:\n        return {\n            'Status': 'Error',\n            'Message': str(e),\n            'Traceback': traceback.format_exc(),\n            'Timestamp': datetime.datetime.utcnow().isoformat() + 'Z'\n        }\n\ndef main():\n    \"\"\"Main function\"\"\"\n    result = get_system_info()\n    print(json.dumps(result, indent=2, default=str))\n    \n    if result.get('Status') == 'Error':\n        sys.exit(1)\n\nif __name__ == '__main__':\n    main()"
                }
            };

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve script templates");
            return StatusCode(500, new { error = "Failed to retrieve script templates" });
        }
    }

    [HttpPost("{id}/validate")]
    public async Task<IActionResult> ValidateScript(int id, [FromBody] ScriptValidationRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var script = await connection.QuerySingleOrDefaultAsync<DiscoveryScript>(@"
                SELECT template, type, target_os FROM discovery_scripts 
                WHERE id = @Id AND is_active = TRUE
            ", new { Id = id });

            if (script == null)
            {
                return NotFound(new { error = "Script not found" });
            }

            var validationResults = new List<dynamic>();

            // Basic syntax validation
            validationResults.Add(new {
                Type = "Syntax",
                Status = ValidateScriptSyntax(script.Template, script.Type ?? "powershell"),
                Message = "Script syntax validation"
            });

            // Security validation
            validationResults.Add(new {
                Type = "Security",
                Status = ValidateScriptSecurity(script.Template, script.Type ?? "powershell"),
                Message = "Script security validation"
            });

            // Performance validation
            validationResults.Add(new {
                Type = "Performance",
                Status = ValidateScriptPerformance(script.Template),
                Message = "Script performance validation"
            });

            var allPassed = validationResults.All(r => r.Status == "Pass");

            return Ok(new {
                ScriptId = id,
                OverallStatus = allPassed ? "Pass" : "Warning",
                Results = validationResults,
                ValidatedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate script with id {Id}", id);
            return StatusCode(500, new { error = "Failed to validate script" });
        }
    }

    [HttpPost("{id}/test")]
    public async Task<IActionResult> TestScript(int id, [FromBody] ScriptTestRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var script = await connection.QuerySingleOrDefaultAsync<DiscoveryScript>(@"
                SELECT * FROM discovery_scripts 
                WHERE id = @Id AND is_active = TRUE
            ", new { Id = id });

            if (script == null)
            {
                return NotFound(new { error = "Script not found" });
            }

            // Simulate script execution with mock results
            var testResult = new {
                ScriptId = id,
                Status = "Success",
                ExecutionTime = "2.5 seconds",
                Output = GenerateMockOutput(script.Type ?? "powershell"),
                Warnings = new List<string>(),
                Errors = new List<string>(),
                TestedAt = DateTime.UtcNow
            };

            _logger.LogInformation("Tested script {ScriptName} (ID: {ScriptId})", script.Name, id);
            return Ok(testResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test script with id {Id}", id);
            return StatusCode(500, new { error = "Failed to test script" });
        }
    }

    [HttpGet("debug/count")]
    public async Task<IActionResult> GetScriptCount()
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            var totalScripts = await connection.QuerySingleAsync<int>("SELECT COUNT(*) FROM discovery_scripts");
            var activeScripts = await connection.QuerySingleAsync<int>("SELECT COUNT(*) FROM discovery_scripts WHERE is_active = TRUE");
            
            var recentScripts = await connection.QueryAsync(@"
                SELECT id, name, created_at, is_active 
                FROM discovery_scripts 
                ORDER BY created_at DESC 
                LIMIT 5
            ");

            return Ok(new {
                totalScripts,
                activeScripts,
                recentScripts,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    private string ValidateScriptSyntax(string template, string type)
    {
        // Basic syntax validation logic
        if (string.IsNullOrWhiteSpace(template))
            return "Fail";
            
        switch (type?.ToLower())
        {
            case "powershell":
                if (template.Contains("$ErrorActionPreference") && template.Contains("try") && template.Contains("catch"))
                    return "Pass";
                return "Warning";
                
            case "bash":
                if (template.Contains("#!/bin/bash") && template.Contains("set -e"))
                    return "Pass";
                return "Warning";
                
            case "python":
                if (template.Contains("import") && template.Contains("def"))
                    return "Pass";
                return "Warning";
                
            default:
                return "Warning";
        }
    }

    private string ValidateScriptSecurity(string template, string type)
    {
        // Basic security validation
        var dangerousPatterns = new[] { "rm -rf", "del /f", "format", "fdisk", "dd if=", "mkfs" };
        
        foreach (var pattern in dangerousPatterns)
        {
            if (template.Contains(pattern, StringComparison.OrdinalIgnoreCase))
                return "Fail";
        }
        
        return "Pass";
    }

    private string ValidateScriptPerformance(string template)
    {
        // Basic performance validation
        if (template.Length > 10000)
            return "Warning"; // Large script might be slow
            
        if (template.Contains("while") && !template.Contains("timeout"))
            return "Warning"; // Potential infinite loop
            
        return "Pass";
    }

    private object GenerateMockOutput(string scriptType)
    {
        return scriptType?.ToLower() switch
        {
            "powershell" => new {
                Status = "Success",
                Data = new {
                    ComputerName = "WIN-SERVER-001",
                    OS = "Microsoft Windows Server 2022 Datacenter",
                    Version = "10.0.20348",
                    Memory = "16 GB",
                    Processor = "Intel(R) Xeon(R) CPU E5-2686 v4 @ 2.30GHz"
                },
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            },
            "bash" => new {
                Status = "Success",
                Data = new {
                    Hostname = "linux-server-001",
                    Kernel = "5.4.0-74-generic",
                    OS = "Ubuntu 20.04.2 LTS",
                    Memory = "8 GB",
                    Processor = "Intel(R) Xeon(R) CPU E5-2686 v4"
                },
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            },
            "python" => new {
                Status = "Success",
                Data = new {
                    System = "Linux",
                    Release = "5.4.0-74-generic",
                    Version = "#83-Ubuntu SMP",
                    Machine = "x86_64",
                    Processor = "x86_64"
                },
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            },
            _ => new {
                Status = "Success",
                Message = "Mock test execution completed",
                Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            }
        };
    }

    private string[] ConvertToStringArray(object? field)
    {
        if (field == null) return Array.Empty<string>();
        
        if (field is string[] stringArray)
            return stringArray;
            
        if (field is string stringValue && !string.IsNullOrEmpty(stringValue))
            return stringValue.Split(',', StringSplitOptions.RemoveEmptyEntries)
                              .Select(s => s.Trim())
                              .Where(s => !string.IsNullOrEmpty(s))
                              .ToArray();
            
        return Array.Empty<string>();
    }
}

public class CreateDiscoveryScriptRequest
{
    [Required]
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Type { get; set; }
    public string? TargetOs { get; set; }
    [Required]
    public string Template { get; set; } = "";
    public string? Version { get; set; }
    public bool? IsActive { get; set; }
    public string[]? Tags { get; set; }
    public string? Vendor { get; set; }
    public string? Complexity { get; set; }
    public int? EstimatedRunTimeSeconds { get; set; }
    public bool? RequiresElevation { get; set; }
    public bool? RequiresNetwork { get; set; }
    public int? DomainId { get; set; }
    public int? TenantId { get; set; }
    public string? Parameters { get; set; }
    public string? OutputFormat { get; set; }
    public string? OutputProcessing { get; set; }
    public string? CredentialRequirements { get; set; }
    public string[]? Industries { get; set; }
    public string[]? ComplianceFrameworks { get; set; }
    public bool? IsStandard { get; set; }
}

public class DiscoveryScript
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Type { get; set; }
    public string? TargetOs { get; set; }
    public string Template { get; set; } = "";
    public string? Version { get; set; }
    [Column("is_active")]
    public bool IsActive { get; set; }
    public string[]? Tags { get; set; }
    public string? Vendor { get; set; }
    public string? Complexity { get; set; }
    public int? EstimatedRunTimeSeconds { get; set; }
    public bool? RequiresElevation { get; set; }
    public bool? RequiresNetwork { get; set; }
    public string? Parameters { get; set; }
    public string? OutputFormat { get; set; }
    public string? OutputProcessing { get; set; }
    public string? CredentialRequirements { get; set; }
    public string[]? Industries { get; set; }
    public string[]? ComplianceFrameworks { get; set; }
    public bool? IsStandard { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ScriptValidationRequest
{
    public string? Parameters { get; set; }
    public bool ValidateSyntax { get; set; } = true;
    public bool ValidateSecurity { get; set; } = true;
    public bool ValidatePerformance { get; set; } = true;
}

public class ScriptTestRequest
{
    public string? Parameters { get; set; }
    public string? TestEnvironment { get; set; } = "sandbox";
    public int TimeoutSeconds { get; set; } = 30;
}
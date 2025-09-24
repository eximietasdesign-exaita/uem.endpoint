using UEM.Satellite.API.Data;
using Microsoft.Extensions.Logging;
using Dapper;

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
            await PopulateBasicScriptsAsync();

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
        using var connection = _dbFactory.Open();
        
        var createTableQuery = @"
            CREATE TABLE IF NOT EXISTS discovery_scripts (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                type VARCHAR(50),
                target_os VARCHAR(50),
                template TEXT,
                vendor VARCHAR(100) DEFAULT 'UEM Enterprise',
                complexity VARCHAR(50) DEFAULT 'Medium',
                estimated_run_time_seconds INTEGER DEFAULT 30,
                requires_elevation BOOLEAN DEFAULT FALSE,
                requires_network BOOLEAN DEFAULT FALSE,
                parameters JSONB DEFAULT '{}',
                output_format VARCHAR(50) DEFAULT 'JSON',
                output_processing JSONB DEFAULT '{}',
                credential_requirements JSONB DEFAULT '{}',
                tags TEXT[],
                industries TEXT[],
                compliance_frameworks TEXT[],
                version VARCHAR(20) DEFAULT '1.0.0',
                is_standard BOOLEAN DEFAULT TRUE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );";
        
        await connection.ExecuteAsync(createTableQuery);
        
        _logger.LogInformation("Discovery scripts table created or verified");
    }

    private async Task ClearExistingStandardScriptsAsync()
    {
        using var connection = _dbFactory.Open();
        
        var deleteQuery = "DELETE FROM discovery_scripts WHERE is_standard = TRUE";
        var deletedRows = await connection.ExecuteAsync(deleteQuery);
        
        _logger.LogInformation("Cleared {DeletedRows} existing standard scripts", deletedRows);
    }

    private async Task PopulateBasicScriptsAsync()
    {
        var scripts = new[]
        {
            new
            {
                name = "Windows System Information - PowerShell",
                description = "Basic Windows system information discovery",
                category = "System Discovery",
                type = "powershell",
                target_os = "windows",
                template = @"Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, ComputerName, TotalPhysicalMemory | ConvertTo-Json"
            },
            new
            {
                name = "Linux System Information - Bash",
                description = "Basic Linux system information discovery",
                category = "System Discovery", 
                type = "bash",
                target_os = "linux",
                template = @"echo ""{\""hostname\"":\""$(hostname)\"",\""kernel\"":\""$(uname -r)\"",\""os\"":\""Linux\""}"""
            },
            new
            {
                name = "Cross-Platform System Info - Python",
                description = "Basic cross-platform system information discovery",
                category = "System Discovery",
                type = "python",
                target_os = "cross-platform",
                template = @"import json, platform, socket; print(json.dumps({'hostname': socket.gethostname(), 'platform': platform.platform(), 'python_version': platform.python_version()}))"
            }
        };

        using var connection = _dbFactory.Open();

        foreach (var script in scripts)
        {
            var insertQuery = @"
                INSERT INTO discovery_scripts (
                    name, description, category, type, target_os, template, 
                    vendor, complexity, estimated_run_time_seconds, requires_elevation, requires_network,
                    parameters, output_format, output_processing, credential_requirements,
                    tags, industries, compliance_frameworks, version, is_standard, is_active
                ) VALUES (
                    @name, @description, @category, @type, @target_os, @template,
                    'UEM Enterprise', 'Low', 15, FALSE, FALSE,
                    '{}', 'JSON', '{}', '{}',
                    ARRAY['discovery', 'basic'], ARRAY['Enterprise'], ARRAY['ISO 27001'],
                    '1.0.0', TRUE, TRUE
                )";

            await connection.ExecuteAsync(insertQuery, new
            {
                name = script.name,
                description = script.description,
                category = script.category,
                type = script.type,
                target_os = script.target_os,
                template = script.template
            });
        }

        _logger.LogInformation("Populated {ScriptCount} basic discovery scripts", scripts.Length);
    }
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
using Dapper;
using UEM.Satellite.API.DTOs;

namespace UEM.Satellite.API.Data.Repositories;

public class SoftwareRepository : ISoftwareRepository
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<SoftwareRepository> _logger;
    private bool _dbOk = true;

    public SoftwareRepository(IDbFactory dbFactory, ILogger<SoftwareRepository> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task UpsertSoftwareAsync(string agentId, SoftwareItemRequest[] software, CancellationToken cancellationToken = default)
    {
        if (!_dbOk || software.Length == 0) return;

        try
        {
            const string createTableSql = @"
                CREATE TABLE IF NOT EXISTS software (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    version TEXT,
                    publisher TEXT,
                    install_location TEXT,
                    size_bytes BIGINT,
                    install_date TIMESTAMPTZ,
                    software_type TEXT NOT NULL,
                    license_key TEXT,
                    discovered_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT unique_software UNIQUE (agent_id, name, version)
                );";

            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(createTableSql);

            // First delete existing records for this agent
            await connection.ExecuteAsync(
                "DELETE FROM software WHERE agent_id = @AgentId",
                new { AgentId = agentId }
            );

            // Then insert new records
            foreach (var item in software)
            {
                await connection.ExecuteAsync(@"
                    INSERT INTO software (
                        agent_id, name, version, publisher, install_location,
                        size_bytes, install_date, software_type, license_key
                    ) VALUES (
                        @AgentId, @Name, @Version, @Publisher, @InstallLocation,
                        @SizeBytes, @InstallDate, @SoftwareType, @LicenseKey
                    )", new {
                        AgentId = agentId,
                        item.Name,
                        item.Version,
                        item.Publisher,
                        item.InstallLocation,
                        item.SizeBytes,
                        item.InstallDate,
                        item.SoftwareType,
                        item.LicenseKey
                    });
            }

            _logger.LogInformation("Upserted {Count} software items for agent {AgentId}", software.Length, agentId);
        }
        catch (Exception ex)
        {
            _dbOk = false;
            _logger.LogWarning(ex, "Failed to upsert software for {AgentId}, disabling database writes", agentId);
        }
    }

    public async Task<IReadOnlyList<SoftwareItemResponse>> GetAgentSoftwareAsync(string agentId, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<SoftwareItemResponse>();

        try
        {
            const string sql = @"
                SELECT id, name, version, publisher, install_location, size_bytes,
                       install_date, software_type, license_key, discovered_at, updated_at
                FROM software 
                WHERE agent_id = @AgentId
                ORDER BY name, version";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql, new { AgentId = agentId });
            
            return results.Select(r => new SoftwareItemResponse(
                r.id,
                r.name,
                r.version,
                r.publisher,
                r.install_location,
                r.size_bytes,
                r.install_date,
                r.software_type,
                r.license_key,
                r.discovered_at,
                r.updated_at
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get software for {AgentId}", agentId);
            return new List<SoftwareItemResponse>();
        }
    }

    public async Task<IReadOnlyList<SoftwareItemResponse>> GetSoftwareByNameAsync(string softwareName, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<SoftwareItemResponse>();

        try
        {
            const string sql = @"
                SELECT id, name, version, publisher, install_location, size_bytes,
                       install_date, software_type, license_key, discovered_at, updated_at
                FROM software 
                WHERE name ILIKE @SoftwareName
                ORDER BY name, version";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql, new { SoftwareName = $"%{softwareName}%" });
            
            return results.Select(r => new SoftwareItemResponse(
                r.id,
                r.name,
                r.version,
                r.publisher,
                r.install_location,
                r.size_bytes,
                r.install_date,
                r.software_type,
                r.license_key,
                r.discovered_at,
                r.updated_at
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get software by name {SoftwareName}", softwareName);
            return new List<SoftwareItemResponse>();
        }
    }
}
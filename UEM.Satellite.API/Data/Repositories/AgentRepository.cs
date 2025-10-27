using Dapper;
using System.Security.Cryptography;
using System.Text;
using UEM.Satellite.API.DTOs;

namespace UEM.Satellite.API.Data.Repositories;

public class AgentRepository : IAgentRepository
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<AgentRepository> _logger;
    private bool _dbOk = true;

    public AgentRepository(IDbFactory dbFactory, ILogger<AgentRepository> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task<string> RegisterAgentAsync(AgentRegistrationRequest request, CancellationToken cancellationToken = default)
    {
        var agentId = GenerateAgentId(request.HardwareFingerprint);
        
        if (!_dbOk) return agentId;

        try
        {
            const string sql = @"
                CREATE TABLE IF NOT EXISTS agents (
                    agent_id TEXT PRIMARY KEY,
                    hardware_fingerprint TEXT NOT NULL,
                    hostname TEXT,
                    ip_address TEXT,
                    mac_address TEXT,
                    operating_system TEXT,
                    os_version TEXT,
                    architecture TEXT,
                    domain TEXT,
                    agent_version TEXT,
                    status TEXT DEFAULT 'Online',
                    registered_at TIMESTAMPTZ DEFAULT NOW(),
                    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                INSERT INTO agents (
                    agent_id, hardware_fingerprint, hostname, ip_address, mac_address, 
                    operating_system, os_version, architecture, domain, agent_version
                ) VALUES (
                    @AgentId, @HardwareFingerprint, @Hostname, @IpAddress, @MacAddress,
                    @OperatingSystem, @OSVersion, @Architecture, @Domain, @AgentVersion
                ) ON CONFLICT (agent_id) DO UPDATE SET
                    hostname = EXCLUDED.hostname,
                    ip_address = EXCLUDED.ip_address,
                    mac_address = EXCLUDED.mac_address,
                    operating_system = EXCLUDED.operating_system,
                    os_version = EXCLUDED.os_version,
                    architecture = EXCLUDED.architecture,
                    domain = EXCLUDED.domain,
                    agent_version = EXCLUDED.agent_version,
                    last_seen_at = NOW(),
                    updated_at = NOW();";

            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(sql, new
            {
                AgentId = agentId,
                request.HardwareFingerprint,
                request.Hostname,
                request.IpAddress,
                request.MacAddress,
                request.OperatingSystem,
                request.OSVersion,
                request.Architecture,
                request.Domain,
                request.AgentVersion
            });

            _logger.LogInformation("Agent {AgentId} registered successfully", agentId);
            return agentId;
        }
        catch (Exception ex)
        {
            _dbOk = false;
            _logger.LogWarning(ex, "Failed to register agent, disabling database writes");
            return agentId;
        }
    }

    public async Task<AgentInfoResponse?> GetAgentAsync(string agentId, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return null;

        try
        {
            const string sql = @"
                SELECT agent_id, hostname, ip_address, mac_address, operating_system, 
                       os_version, architecture, domain, agent_version, status, 
                       registered_at, last_seen_at
                FROM agents 
                WHERE agent_id = @AgentId";

            using var connection = _dbFactory.Open();
            var result = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { AgentId = agentId });
            
            if (result == null) return null;

            return new AgentInfoResponse(
                result.agent_id,
                result.hostname,
                result.ip_address,
                result.mac_address,
                result.operating_system,
                result.os_version,
                result.architecture,
                result.domain,
                result.agent_version,
                result.status,
                result.registered_at,
                result.last_seen_at
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get agent {AgentId}", agentId);
            return null;
        }
    }

    public async Task<IReadOnlyList<AgentInfoResponse>> GetAllAgentsAsync(CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<AgentInfoResponse>();

        try
        {
            const string sql = @"
                SELECT agent_id, hostname, ip_address, mac_address, operating_system, 
                       os_version, architecture, domain, agent_version, status, 
                       registered_at, last_seen_at
                FROM agents 
                ORDER BY last_seen_at DESC";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql);
            
            return results.Select(r => new AgentInfoResponse(
                r.agent_id,
                r.hostname,
                r.ip_address,
                r.mac_address,
                r.operating_system,
                r.os_version,
                r.architecture,
                r.domain,
                r.agent_version,
                r.status,
                r.registered_at,
                r.last_seen_at
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get all agents");
            return new List<AgentInfoResponse>();
        }
    }

    public async Task UpdateAgentStatusAsync(string agentId, string status, DateTime lastSeen, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return;

        try
        {
            const string sql = @"
                UPDATE agents 
                SET status = @Status, last_seen_at = @LastSeen, updated_at = NOW()
                WHERE agent_id = @AgentId";

            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(sql, new { AgentId = agentId, Status = status, LastSeen = lastSeen });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to update agent status for {AgentId}", agentId);
        }
    }

    public async Task<bool> AgentExistsAsync(string agentId, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return false;

        try
        {
            const string sql = "SELECT COUNT(*) FROM agents WHERE agent_id = @AgentId";
            using var connection = _dbFactory.Open();
            var count = await connection.QuerySingleAsync<int>(sql, new { AgentId = agentId });
            return count > 0;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to check agent existence for {AgentId}", agentId);
            return false;
        }
    }

    private static string GenerateAgentId(string hardwareFingerprint)
    {
        using var sha = SHA256.Create();
        var hash = sha.ComputeHash(Encoding.UTF8.GetBytes(hardwareFingerprint));
        return "uem-" + Convert.ToHexString(hash).ToLowerInvariant()[..32];
    }
}
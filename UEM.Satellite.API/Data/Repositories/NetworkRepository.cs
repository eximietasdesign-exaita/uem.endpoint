using Dapper;
using UEM.Satellite.API.DTOs;

namespace UEM.Satellite.API.Data.Repositories;

public class NetworkRepository : INetworkRepository
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<NetworkRepository> _logger;
    private bool _dbOk = true;

    public NetworkRepository(IDbFactory dbFactory, ILogger<NetworkRepository> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task UpsertNetworkInterfacesAsync(string agentId, NetworkInterfaceRequest[] interfaces, CancellationToken cancellationToken = default)
    {
        if (!_dbOk || interfaces.Length == 0) return;

        try
        {
            const string createTableSql = @"
                CREATE TABLE IF NOT EXISTS network_interfaces (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id TEXT NOT NULL,
                    interface_name TEXT NOT NULL,
                    description TEXT,
                    mac_address TEXT,
                    ip_address TEXT,
                    subnet_mask TEXT,
                    gateway TEXT,
                    dns_servers TEXT,
                    is_active BOOLEAN NOT NULL,
                    interface_type TEXT NOT NULL,
                    bytes_sent BIGINT NOT NULL,
                    bytes_received BIGINT NOT NULL,
                    speed DOUBLE PRECISION NOT NULL,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_network_interfaces_agent_name 
                ON network_interfaces(agent_id, interface_name);";

            const string upsertSql = @"
                INSERT INTO network_interfaces (
                    agent_id, interface_name, description, mac_address, ip_address,
                    subnet_mask, gateway, dns_servers, is_active, interface_type,
                    bytes_sent, bytes_received, speed
                ) VALUES (
                    @AgentId, @InterfaceName, @Description, @MacAddress, @IpAddress,
                    @SubnetMask, @Gateway, @DnsServers, @IsActive, @InterfaceType,
                    @BytesSent, @BytesReceived, @Speed
                ) ON CONFLICT (agent_id, interface_name) 
                DO UPDATE SET
                    description = EXCLUDED.description,
                    mac_address = EXCLUDED.mac_address,
                    ip_address = EXCLUDED.ip_address,
                    subnet_mask = EXCLUDED.subnet_mask,
                    gateway = EXCLUDED.gateway,
                    dns_servers = EXCLUDED.dns_servers,
                    is_active = EXCLUDED.is_active,
                    interface_type = EXCLUDED.interface_type,
                    bytes_sent = EXCLUDED.bytes_sent,
                    bytes_received = EXCLUDED.bytes_received,
                    speed = EXCLUDED.speed,
                    timestamp = NOW()";

            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(createTableSql);

            foreach (var networkInterface in interfaces)
            {
                var dnsServers = networkInterface.DnsServers != null ? 
                    string.Join(",", networkInterface.DnsServers) : null;

                await connection.ExecuteAsync(upsertSql, new
                {
                    AgentId = agentId,
                    networkInterface.InterfaceName,
                    networkInterface.Description,
                    networkInterface.MacAddress,
                    networkInterface.IpAddress,
                    networkInterface.SubnetMask,
                    networkInterface.Gateway,
                    DnsServers = dnsServers,
                    networkInterface.IsActive,
                    networkInterface.InterfaceType,
                    networkInterface.BytesSent,
                    networkInterface.BytesReceived,
                    networkInterface.Speed
                });
            }

            _logger.LogInformation("Upserted {Count} network interfaces for agent {AgentId}", interfaces.Length, agentId);
        }
        catch (Exception ex)
        {
            _dbOk = false;
            _logger.LogWarning(ex, "Failed to upsert network interfaces for {AgentId}, disabling database writes", agentId);
        }
    }

    public async Task<IReadOnlyList<NetworkInterfaceResponse>> GetAgentNetworkInterfacesAsync(string agentId, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<NetworkInterfaceResponse>();

        try
        {
            const string sql = @"
                SELECT DISTINCT ON (interface_name)
                    id, interface_name, description, mac_address, ip_address,
                    subnet_mask, gateway, dns_servers, is_active, interface_type,
                    bytes_sent, bytes_received, speed, timestamp
                FROM network_interfaces 
                WHERE agent_id = @AgentId
                ORDER BY interface_name, timestamp DESC";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql, new { AgentId = agentId });
            
            return results.Select(r => new NetworkInterfaceResponse(
                r.id,
                r.interface_name,
                r.description,
                r.mac_address,
                r.ip_address,
                r.subnet_mask,
                r.gateway,
                ParseDnsServers(r.dns_servers),
                r.is_active,
                r.interface_type,
                r.bytes_sent,
                r.bytes_received,
                r.speed,
                r.timestamp
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get network interfaces for {AgentId}", agentId);
            return new List<NetworkInterfaceResponse>();
        }
    }

    private static string[]? ParseDnsServers(string? dnsServers)
    {
        if (string.IsNullOrEmpty(dnsServers)) return null;
        return dnsServers.Split(',', StringSplitOptions.RemoveEmptyEntries);
    }
}
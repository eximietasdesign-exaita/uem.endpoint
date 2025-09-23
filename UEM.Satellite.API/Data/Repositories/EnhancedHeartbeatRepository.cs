using Dapper;
using UEM.Satellite.API.DTOs;
using System.Text.Json;

namespace UEM.Satellite.API.Data.Repositories;

public class EnhancedHeartbeatRepository : IEnhancedHeartbeatRepository
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<EnhancedHeartbeatRepository> _logger;
    private readonly IHardwareRepository _hardwareRepository;
    private readonly ISoftwareRepository _softwareRepository;
    private readonly IProcessRepository _processRepository;
    private readonly INetworkRepository _networkRepository;
    private bool _dbOk = true;

    public EnhancedHeartbeatRepository(
        IDbFactory dbFactory, 
        ILogger<EnhancedHeartbeatRepository> logger,
        IHardwareRepository hardwareRepository,
        ISoftwareRepository softwareRepository,
        IProcessRepository processRepository,
        INetworkRepository networkRepository)
    {
        _dbFactory = dbFactory;
        _logger = logger;
        _hardwareRepository = hardwareRepository;
        _softwareRepository = softwareRepository;
        _processRepository = processRepository;
        _networkRepository = networkRepository;
    }

    public async Task UpsertHeartbeatAsync(string agentId, EnhancedHeartbeatRequest heartbeat, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return;

        try
        {
            const string sql = @"
                CREATE TABLE IF NOT EXISTS enhanced_heartbeats (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id TEXT NOT NULL,
                    cpu_usage DOUBLE PRECISION NOT NULL,
                    memory_used_bytes BIGINT NOT NULL,
                    memory_total_bytes BIGINT NOT NULL,
                    disk_used_bytes BIGINT NOT NULL,
                    disk_total_bytes BIGINT NOT NULL,
                    process_count INTEGER NOT NULL,
                    network_connection_count INTEGER NOT NULL,
                    uptime_hours DOUBLE PRECISION NOT NULL,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_enhanced_heartbeats_agent_timestamp 
                ON enhanced_heartbeats(agent_id, timestamp DESC);

                INSERT INTO enhanced_heartbeats (
                    agent_id, cpu_usage, memory_used_bytes, memory_total_bytes,
                    disk_used_bytes, disk_total_bytes, process_count, 
                    network_connection_count, uptime_hours
                ) VALUES (
                    @AgentId, @CpuUsage, @MemoryUsedBytes, @MemoryTotalBytes,
                    @DiskUsedBytes, @DiskTotalBytes, @ProcessCount,
                    @NetworkConnectionCount, @UptimeHours
                );";

            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(sql, new
            {
                AgentId = agentId,
                heartbeat.CpuUsage,
                heartbeat.MemoryUsedBytes,
                heartbeat.MemoryTotalBytes,
                heartbeat.DiskUsedBytes,
                heartbeat.DiskTotalBytes,
                heartbeat.ProcessCount,
                heartbeat.NetworkConnectionCount,
                heartbeat.UptimeHours
            });

            // Update related data in parallel
            var tasks = new List<Task>();
            
            if (heartbeat.Hardware?.Length > 0)
                tasks.Add(_hardwareRepository.UpsertHardwareAsync(agentId, heartbeat.Hardware, cancellationToken));
            
            if (heartbeat.Software?.Length > 0)
                tasks.Add(_softwareRepository.UpsertSoftwareAsync(agentId, heartbeat.Software, cancellationToken));
            
            if (heartbeat.Processes?.Length > 0)
                tasks.Add(_processRepository.UpsertProcessesAsync(agentId, heartbeat.Processes, cancellationToken));
            
            if (heartbeat.NetworkInterfaces?.Length > 0)
                tasks.Add(_networkRepository.UpsertNetworkInterfacesAsync(agentId, heartbeat.NetworkInterfaces, cancellationToken));

            await Task.WhenAll(tasks);
            
            _logger.LogInformation("Enhanced heartbeat from {AgentId} processed successfully", agentId);
        }
        catch (Exception ex)
        {
            _dbOk = false;
            _logger.LogWarning(ex, "Failed to upsert enhanced heartbeat for {AgentId}, disabling database writes", agentId);
        }
    }

    public async Task<EnhancedHeartbeatResponse?> GetLatestHeartbeatAsync(string agentId, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return null;

        try
        {
            const string sql = @"
                SELECT id, agent_id, cpu_usage, memory_used_bytes, memory_total_bytes,
                       disk_used_bytes, disk_total_bytes, process_count, 
                       network_connection_count, uptime_hours, timestamp
                FROM enhanced_heartbeats 
                WHERE agent_id = @AgentId
                ORDER BY timestamp DESC 
                LIMIT 1";

            using var connection = _dbFactory.Open();
            var result = await connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { AgentId = agentId });
            
            if (result == null) return null;

            return new EnhancedHeartbeatResponse(
                result.id,
                result.agent_id,
                result.cpu_usage,
                result.memory_used_bytes,
                result.memory_total_bytes,
                result.disk_used_bytes,
                result.disk_total_bytes,
                result.process_count,
                result.network_connection_count,
                result.uptime_hours,
                result.timestamp
            );
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get latest heartbeat for {AgentId}", agentId);
            return null;
        }
    }

    public async Task<IReadOnlyList<EnhancedHeartbeatResponse>> GetAllLatestHeartbeatsAsync(CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<EnhancedHeartbeatResponse>();

        try
        {
            const string sql = @"
                SELECT DISTINCT ON (agent_id) 
                    id, agent_id, cpu_usage, memory_used_bytes, memory_total_bytes,
                    disk_used_bytes, disk_total_bytes, process_count, 
                    network_connection_count, uptime_hours, timestamp
                FROM enhanced_heartbeats 
                ORDER BY agent_id, timestamp DESC";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql);
            
            return results.Select(r => new EnhancedHeartbeatResponse(
                r.id,
                r.agent_id,
                r.cpu_usage,
                r.memory_used_bytes,
                r.memory_total_bytes,
                r.disk_used_bytes,
                r.disk_total_bytes,
                r.process_count,
                r.network_connection_count,
                r.uptime_hours,
                r.timestamp
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get all latest heartbeats");
            return new List<EnhancedHeartbeatResponse>();
        }
    }

    public async Task<IReadOnlyList<EnhancedHeartbeatResponse>> GetHeartbeatHistoryAsync(string agentId, DateTime since, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<EnhancedHeartbeatResponse>();

        try
        {
            const string sql = @"
                SELECT id, agent_id, cpu_usage, memory_used_bytes, memory_total_bytes,
                       disk_used_bytes, disk_total_bytes, process_count, 
                       network_connection_count, uptime_hours, timestamp
                FROM enhanced_heartbeats 
                WHERE agent_id = @AgentId AND timestamp >= @Since
                ORDER BY timestamp DESC 
                LIMIT 100";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql, new { AgentId = agentId, Since = since });
            
            return results.Select(r => new EnhancedHeartbeatResponse(
                r.id,
                r.agent_id,
                r.cpu_usage,
                r.memory_used_bytes,
                r.memory_total_bytes,
                r.disk_used_bytes,
                r.disk_total_bytes,
                r.process_count,
                r.network_connection_count,
                r.uptime_hours,
                r.timestamp
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get heartbeat history for {AgentId}", agentId);
            return new List<EnhancedHeartbeatResponse>();
        }
    }
}
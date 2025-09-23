using Dapper;
using UEM.Satellite.API.DTOs;

namespace UEM.Satellite.API.Data.Repositories;

public class ProcessRepository : IProcessRepository
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<ProcessRepository> _logger;
    private bool _dbOk = true;

    public ProcessRepository(IDbFactory dbFactory, ILogger<ProcessRepository> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task UpsertProcessesAsync(string agentId, ProcessInfoRequest[] processes, CancellationToken cancellationToken = default)
    {
        if (!_dbOk || processes.Length == 0) return;

        try
        {
            const string createTableSql = @"
                CREATE TABLE IF NOT EXISTS processes (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id TEXT NOT NULL,
                    process_id INTEGER NOT NULL,
                    process_name TEXT NOT NULL,
                    executable_path TEXT,
                    command_line TEXT,
                    user_name TEXT,
                    memory_usage_bytes BIGINT NOT NULL,
                    cpu_usage_percent DOUBLE PRECISION NOT NULL,
                    thread_count INTEGER NOT NULL,
                    start_time TIMESTAMPTZ NOT NULL,
                    status TEXT NOT NULL,
                    timestamp TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_processes_agent_timestamp 
                ON processes(agent_id, timestamp DESC);
                
                CREATE INDEX IF NOT EXISTS idx_processes_name 
                ON processes(process_name);";

            // Clear old processes for this agent (keep only latest snapshot)
            const string clearOldSql = @"
                DELETE FROM processes 
                WHERE agent_id = @AgentId 
                AND timestamp < NOW() - INTERVAL '5 minutes'";

            const string insertSql = @"
                INSERT INTO processes (
                    agent_id, process_id, process_name, executable_path, command_line,
                    user_name, memory_usage_bytes, cpu_usage_percent, thread_count,
                    start_time, status
                ) VALUES (
                    @AgentId, @ProcessId, @ProcessName, @ExecutablePath, @CommandLine,
                    @UserName, @MemoryUsageBytes, @CpuUsagePercent, @ThreadCount,
                    @StartTime, @Status
                )";

            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(createTableSql);
            await connection.ExecuteAsync(clearOldSql, new { AgentId = agentId });

            foreach (var process in processes)
            {
                await connection.ExecuteAsync(insertSql, new
                {
                    AgentId = agentId,
                    process.ProcessId,
                    process.ProcessName,
                    process.ExecutablePath,
                    process.CommandLine,
                    process.UserName,
                    process.MemoryUsageBytes,
                    process.CpuUsagePercent,
                    process.ThreadCount,
                    process.StartTime,
                    process.Status
                });
            }

            _logger.LogInformation("Upserted {Count} processes for agent {AgentId}", processes.Length, agentId);
        }
        catch (Exception ex)
        {
            _dbOk = false;
            _logger.LogWarning(ex, "Failed to upsert processes for {AgentId}, disabling database writes", agentId);
        }
    }

    public async Task<IReadOnlyList<ProcessInfoResponse>> GetAgentProcessesAsync(string agentId, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<ProcessInfoResponse>();

        try
        {
            const string sql = @"
                SELECT DISTINCT ON (process_id) 
                    id, process_id, process_name, executable_path, command_line,
                    user_name, memory_usage_bytes, cpu_usage_percent, thread_count,
                    start_time, status, timestamp
                FROM processes 
                WHERE agent_id = @AgentId
                ORDER BY process_id, timestamp DESC";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql, new { AgentId = agentId });
            
            return results.Select(r => new ProcessInfoResponse(
                r.id,
                r.process_id,
                r.process_name,
                r.executable_path,
                r.command_line,
                r.user_name,
                r.memory_usage_bytes,
                r.cpu_usage_percent,
                r.thread_count,
                r.start_time,
                r.status,
                r.timestamp
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get processes for {AgentId}", agentId);
            return new List<ProcessInfoResponse>();
        }
    }

    public async Task<IReadOnlyList<ProcessInfoResponse>> GetProcessesByNameAsync(string processName, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<ProcessInfoResponse>();

        try
        {
            const string sql = @"
                SELECT id, process_id, process_name, executable_path, command_line,
                       user_name, memory_usage_bytes, cpu_usage_percent, thread_count,
                       start_time, status, timestamp
                FROM processes 
                WHERE process_name ILIKE @ProcessName
                AND timestamp > NOW() - INTERVAL '1 hour'
                ORDER BY timestamp DESC";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql, new { ProcessName = $"%{processName}%" });
            
            return results.Select(r => new ProcessInfoResponse(
                r.id,
                r.process_id,
                r.process_name,
                r.executable_path,
                r.command_line,
                r.user_name,
                r.memory_usage_bytes,
                r.cpu_usage_percent,
                r.thread_count,
                r.start_time,
                r.status,
                r.timestamp
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get processes by name {ProcessName}", processName);
            return new List<ProcessInfoResponse>();
        }
    }
}
using Dapper;
using UEM.Satellite.API.DTOs;
using System.Text.Json;

namespace UEM.Satellite.API.Data.Repositories;

public class HardwareRepository : IHardwareRepository
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<HardwareRepository> _logger;
    private bool _dbOk = true;

    public HardwareRepository(IDbFactory dbFactory, ILogger<HardwareRepository> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    public async Task UpsertHardwareAsync(string agentId, HardwareComponentRequest[] hardware, CancellationToken cancellationToken = default)
    {
        if (!_dbOk || hardware.Length == 0) return;

        try
        {
            const string createTableSql = @"
                CREATE TABLE IF NOT EXISTS hardware (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id TEXT NOT NULL,
                    component_type TEXT NOT NULL,
                    manufacturer TEXT NOT NULL,
                    model TEXT NOT NULL,
                    serial_number TEXT,
                    version TEXT,
                    capacity BIGINT,
                    properties JSONB,
                    discovered_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_hardware_agent_type 
                ON hardware(agent_id, component_type);";

            const string upsertSql = @"
                INSERT INTO hardware (
                    agent_id, component_type, manufacturer, model, serial_number, 
                    version, capacity, properties
                ) VALUES (
                    @AgentId, @ComponentType, @Manufacturer, @Model, @SerialNumber,
                    @Version, @Capacity, @Properties::jsonb
                ) ON CONFLICT (agent_id, component_type, manufacturer, model) 
                DO UPDATE SET
                    serial_number = EXCLUDED.serial_number,
                    version = EXCLUDED.version,
                    capacity = EXCLUDED.capacity,
                    properties = EXCLUDED.properties,
                    updated_at = NOW()";

            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(createTableSql);

            foreach (var component in hardware)
            {
                var properties = component.Properties != null ? JsonSerializer.Serialize(component.Properties) : null;
                
                await connection.ExecuteAsync(upsertSql, new
                {
                    AgentId = agentId,
                    component.ComponentType,
                    component.Manufacturer,
                    component.Model,
                    component.SerialNumber,
                    component.Version,
                    component.Capacity,
                    Properties = properties
                });
            }

            _logger.LogInformation("Upserted {Count} hardware components for agent {AgentId}", hardware.Length, agentId);
        }
        catch (Exception ex)
        {
            _dbOk = false;
            _logger.LogWarning(ex, "Failed to upsert hardware for {AgentId}, disabling database writes", agentId);
        }
    }

    public async Task<IReadOnlyList<HardwareComponentResponse>> GetAgentHardwareAsync(string agentId, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<HardwareComponentResponse>();

        try
        {
            const string sql = @"
                SELECT id, component_type, manufacturer, model, serial_number, 
                       version, capacity, properties, discovered_at, updated_at
                FROM hardware 
                WHERE agent_id = @AgentId
                ORDER BY component_type, manufacturer, model";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql, new { AgentId = agentId });
            
            return results.Select(r => new HardwareComponentResponse(
                r.id,
                r.component_type,
                r.manufacturer,
                r.model,
                r.serial_number,
                r.version,
                r.capacity,
                DeserializeProperties(r.properties),
                r.discovered_at,
                r.updated_at
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get hardware for {AgentId}", agentId);
            return new List<HardwareComponentResponse>();
        }
    }

    public async Task<IReadOnlyList<HardwareComponentResponse>> GetHardwareByTypeAsync(string componentType, CancellationToken cancellationToken = default)
    {
        if (!_dbOk) return new List<HardwareComponentResponse>();

        try
        {
            const string sql = @"
                SELECT id, component_type, manufacturer, model, serial_number, 
                       version, capacity, properties, discovered_at, updated_at
                FROM hardware 
                WHERE component_type = @ComponentType
                ORDER BY manufacturer, model";

            using var connection = _dbFactory.Open();
            var results = await connection.QueryAsync<dynamic>(sql, new { ComponentType = componentType });
            
            return results.Select(r => new HardwareComponentResponse(
                r.id,
                r.component_type,
                r.manufacturer,
                r.model,
                r.serial_number,
                r.version,
                r.capacity,
                DeserializeProperties(r.properties),
                r.discovered_at,
                r.updated_at
            )).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get hardware by type {ComponentType}", componentType);
            return new List<HardwareComponentResponse>();
        }
    }

    private static Dictionary<string, object>? DeserializeProperties(string? propertiesJson)
    {
        if (string.IsNullOrEmpty(propertiesJson)) return null;
        
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, object>>(propertiesJson);
        }
        catch
        {
            return null;
        }
    }
}
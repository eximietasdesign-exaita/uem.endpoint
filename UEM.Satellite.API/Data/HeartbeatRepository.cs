using Dapper;
using UEM.Satellite.API.Data;
using UEM.Satellite.API.Models;
using System.Collections.Concurrent;

public sealed class HeartbeatRepository
{
    private readonly IDbFactory _db; private readonly ILogger<HeartbeatRepository> _log;
    private bool _dbOk = true;
    private readonly ConcurrentDictionary<string, HeartbeatView> _mem = new();

    public HeartbeatRepository(IDbFactory db, ILogger<HeartbeatRepository> log) { _db = db; _log = log; }

    public async Task UpsertAsync(HeartbeatUpsert hb, CancellationToken ct)
    {
        var view = new HeartbeatView(hb.AgentId, hb.UniqueId ?? string.Empty, hb.SerialNumber ?? string.Empty, hb.Hostname, hb.IpAddress ?? string.Empty, hb.MacAddress ?? string.Empty, hb.AgentVersion ?? string.Empty, DateTime.UtcNow, DateTime.UtcNow);
        _mem[hb.AgentId] = view;

        if (!_dbOk) return;

        try
        {
            const string upsertCurrent = @"
create table if not exists agent_heartbeat_current(
    agent_id text primary key,
    unique_id text,
    serial_number text,
    hostname text not null,
    ip_address text,
    mac_address text,
    agent_version text,
    first_contacted timestamptz not null,
    last_contacted timestamptz not null
);
insert into agent_heartbeat_current(agent_id, unique_id, serial_number, hostname, ip_address, mac_address, agent_version, first_contacted, last_contacted)
values (@AgentId, @UniqueId, @SerialNumber, @Hostname, @IpAddress, @MacAddress, @AgentVersion, now(), now())
on conflict (agent_id) do update
set unique_id = excluded.unique_id,
    serial_number = excluded.serial_number,
    hostname = excluded.hostname,
    ip_address = excluded.ip_address,
    mac_address = excluded.mac_address,
    agent_version = excluded.agent_version,
    last_contacted = now();";

            using var conn = _db.Open();
            await conn.ExecuteAsync(new CommandDefinition(upsertCurrent, hb, cancellationToken: ct));
        }
        catch (Exception ex)
        {
            _dbOk = false;
            _log.LogWarning(ex, "Disabling Postgres writes for heartbeats; using in-memory only");
        }
    }

    private sealed class Row
    {
        public string AgentId { get; set; } = "";
        public string? UniqueId { get; set; }
        public string? SerialNumber { get; set; }
        public string Hostname { get; set; } = "";
        public string? IpAddress { get; set; }
        public string? MacAddress { get; set; }
        public string? AgentVersion { get; set; }
        public DateTime FirstContacted { get; set; }
        public DateTime LastContacted { get; set; }
    }

    public async Task<IReadOnlyList<HeartbeatView>> ListLatestAsync(CancellationToken ct)
    {
        if (_dbOk)
        {
            try
            {
                const string sql = @"
select agent_id as AgentId, unique_id as UniqueId, serial_number as SerialNumber, hostname as Hostname,
       ip_address as IpAddress, mac_address as MacAddress, agent_version as AgentVersion,
       first_contacted as FirstContacted, last_contacted as LastContacted
from agent_heartbeat_current
order by last_contacted desc";
                using var conn = _db.Open();
                var rows = await conn.QueryAsync<Row>(new CommandDefinition(sql, cancellationToken: ct));
                return rows.Select(r => new HeartbeatView(
                    r.AgentId,
                    r.UniqueId ?? string.Empty,
                    r.SerialNumber ?? string.Empty,
                    r.Hostname,
                    r.IpAddress ?? string.Empty,
                    r.MacAddress ?? string.Empty,
                    r.AgentVersion ?? string.Empty,
                    r.FirstContacted,
                    r.LastContacted
                )).ToList();
            }
            catch (Exception ex)
            {
                _dbOk = false;
                _log.LogWarning(ex, "Disabling Postgres reads; using in-memory only");
            }
        }
        return _mem.Values.OrderByDescending(x => x.LastContacted).ToList();
    }
}

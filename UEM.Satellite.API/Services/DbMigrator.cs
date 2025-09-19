using Dapper;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using UEM.Satellite.API.Data;

namespace UEM.Satellite.API.Services;

public sealed class DbMigrator : IHostedService
{
    private readonly IDbFactory _db;
    private readonly ILogger<DbMigrator> _log;
    public DbMigrator(IDbFactory db, ILogger<DbMigrator> log) { _db = db; _log = log; }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var conn = _db.Open();
            const string ddl = @"
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
create index if not exists ix_agent_hb_last on agent_heartbeat_current(last_contacted desc);";
            conn.Execute(ddl);
            _log.LogInformation("Database migration complete");
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Database not available; continuing with in-memory heartbeat store");
        }
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

using Microsoft.EntityFrameworkCore;
using UEM.Endpoint.Agent.Data.Models;

namespace UEM.Endpoint.Agent.Data.Contexts;

/// <summary>
/// Database context for agent data that gets sent to the server
/// Stores: heartbeats, hardware/software/security discoveries, script executions, registrations, API communications
/// </summary>
public class AgentDataContext : DbContext
{
    public AgentDataContext(DbContextOptions<AgentDataContext> options) : base(options)
    {
    }

    // Agent data tables
    public DbSet<HeartbeatRecord> Heartbeats { get; set; }
    public DbSet<HardwareDiscoveryRecord> HardwareDiscoveries { get; set; }
    public DbSet<SoftwareDiscoveryRecord> SoftwareDiscoveries { get; set; }
    public DbSet<SecurityDiscoveryRecord> SecurityDiscoveries { get; set; }
    public DbSet<ScriptExecutionRecord> ScriptExecutions { get; set; }
    public DbSet<AgentRegistrationRecord> AgentRegistrations { get; set; }
    public DbSet<ApiCommunicationRecord> ApiCommunications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure indexes for performance
        modelBuilder.Entity<HeartbeatRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.SentToServer);
            entity.HasIndex(e => new { e.AgentId, e.Timestamp });
        });

        modelBuilder.Entity<HardwareDiscoveryRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.DiscoveredAt);
            entity.HasIndex(e => e.SentToServer);
            entity.HasIndex(e => e.DiscoverySessionId);
        });

        modelBuilder.Entity<SoftwareDiscoveryRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.DiscoveredAt);
            entity.HasIndex(e => e.SentToServer);
            entity.HasIndex(e => e.DiscoverySessionId);
        });

        modelBuilder.Entity<SecurityDiscoveryRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.DiscoveredAt);
            entity.HasIndex(e => e.SentToServer);
            entity.HasIndex(e => e.DiscoverySessionId);
        });

        modelBuilder.Entity<ScriptExecutionRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.CommandId);
            entity.HasIndex(e => e.ExecutedAt);
            entity.HasIndex(e => e.SentToServer);
            entity.HasIndex(e => e.CommandType);
        });

        modelBuilder.Entity<AgentRegistrationRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.RegisteredAt);
            entity.HasIndex(e => e.SentToServer);
        });

        modelBuilder.Entity<ApiCommunicationRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.RequestTimestamp);
            entity.HasIndex(e => e.Endpoint);
            entity.HasIndex(e => e.Success);
        });

        // Configure JSON columns appropriately
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.Name.EndsWith("Json", StringComparison.OrdinalIgnoreCase))
                {
                    property.SetColumnType("TEXT");
                }
            }
        }
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var dbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "agentdata.db");
            var directoryPath = Path.GetDirectoryName(dbPath);
            
            if (!string.IsNullOrEmpty(directoryPath) && !Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }
            
            optionsBuilder.UseSqlite($"Data Source={dbPath}");
        }
    }
}
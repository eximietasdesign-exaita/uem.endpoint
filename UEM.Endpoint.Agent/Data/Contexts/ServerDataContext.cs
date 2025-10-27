using Microsoft.EntityFrameworkCore;
using UEM.Endpoint.Agent.Data.Models;

namespace UEM.Endpoint.Agent.Data.Contexts;

/// <summary>
/// Database context for server data received by the agent
/// Stores: configurations, commands, scripts, policies, updates, responses, notifications
/// </summary>
public class ServerDataContext : DbContext
{
    public ServerDataContext(DbContextOptions<ServerDataContext> options) : base(options)
    {
    }

    // Server data tables
    public DbSet<ServerConfigurationRecord> ServerConfigurations { get; set; }
    public DbSet<ServerCommandRecord> ServerCommands { get; set; }
    public DbSet<ServerDiscoveryScriptRecord> ServerDiscoveryScripts { get; set; }
    public DbSet<ServerPolicyRecord> ServerPolicies { get; set; }
    public DbSet<ServerUpdateRecord> ServerUpdates { get; set; }
    public DbSet<ServerResponseRecord> ServerResponses { get; set; }
    public DbSet<ServerNotificationRecord> ServerNotifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure indexes for performance
        modelBuilder.Entity<ServerConfigurationRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.ConfigType);
            entity.HasIndex(e => e.ReceivedAt);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => new { e.AgentId, e.ConfigType, e.IsActive });
        });

        modelBuilder.Entity<ServerCommandRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.CommandId).IsUnique();
            entity.HasIndex(e => e.CommandType);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ReceivedAt);
            entity.HasIndex(e => e.IsExpired);
            entity.HasIndex(e => new { e.AgentId, e.Status });
        });

        modelBuilder.Entity<ServerDiscoveryScriptRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.ScriptId);
            entity.HasIndex(e => e.ScriptType);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.TargetOS);
            entity.HasIndex(e => new { e.AgentId, e.IsActive });
        });

        modelBuilder.Entity<ServerPolicyRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.PolicyId);
            entity.HasIndex(e => e.PolicyType);
            entity.HasIndex(e => e.IsActive);
            entity.HasIndex(e => e.ExpiresAt);
            entity.HasIndex(e => new { e.AgentId, e.IsActive });
        });

        modelBuilder.Entity<ServerUpdateRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.UpdateId);
            entity.HasIndex(e => e.UpdateType);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ReceivedAt);
            entity.HasIndex(e => new { e.AgentId, e.Status });
        });

        modelBuilder.Entity<ServerResponseRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.Endpoint);
            entity.HasIndex(e => e.ResponseTimestamp);
            entity.HasIndex(e => e.Success);
            entity.HasIndex(e => e.CorrelationId);
        });

        modelBuilder.Entity<ServerNotificationRecord>(entity =>
        {
            entity.HasIndex(e => e.AgentId);
            entity.HasIndex(e => e.NotificationId);
            entity.HasIndex(e => e.NotificationType);
            entity.HasIndex(e => e.Priority);
            entity.HasIndex(e => e.IsRead);
            entity.HasIndex(e => e.IsExpired);
            entity.HasIndex(e => e.ExpiresAt);
            entity.HasIndex(e => new { e.AgentId, e.IsRead });
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
            var dbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "serverdata.db");
            var directoryPath = Path.GetDirectoryName(dbPath);
            
            if (!string.IsNullOrEmpty(directoryPath) && !Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }
            
            optionsBuilder.UseSqlite($"Data Source={dbPath}");
        }
    }
}
using Microsoft.EntityFrameworkCore;

namespace UEM.Satellite.API.Data;
public class SatelliteDb(DbContextOptions<SatelliteDb> opts) : DbContext(opts)
{
    public DbSet<AgentEntity> Agents => Set<AgentEntity>();
    public DbSet<CommandEntity> Commands => Set<CommandEntity>();
    public DbSet<HeartbeatEntity> Heartbeats => Set<HeartbeatEntity>();
    public DbSet<HardwareEntity> Hardware => Set<HardwareEntity>();
    public DbSet<SoftwareEntity> Software => Set<SoftwareEntity>();
    public DbSet<ProcessEntity> Processes => Set<ProcessEntity>();
    public DbSet<NetworkInterfaceEntity> NetworkInterfaces => Set<NetworkInterfaceEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure AgentEntity
        modelBuilder.Entity<AgentEntity>(entity =>
        {
            entity.HasIndex(e => e.AgentId).IsUnique();
            entity.Property(e => e.AgentId).HasMaxLength(100);
            entity.Property(e => e.HardwareFingerprint).HasMaxLength(500);
            entity.Property(e => e.Hostname).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        // Configure HeartbeatEntity
        modelBuilder.Entity<HeartbeatEntity>(entity =>
        {
            entity.HasIndex(e => new { e.AgentId, e.Timestamp });
            entity.Property(e => e.AgentId).HasMaxLength(100);
        });

        // Configure HardwareEntity
        modelBuilder.Entity<HardwareEntity>(entity =>
        {
            entity.HasIndex(e => new { e.AgentId, e.ComponentType });
            entity.Property(e => e.AgentId).HasMaxLength(100);
            entity.Property(e => e.ComponentType).HasMaxLength(100);
            entity.Property(e => e.Manufacturer).HasMaxLength(255);
            entity.Property(e => e.Model).HasMaxLength(255);
        });

        // Configure SoftwareEntity
        modelBuilder.Entity<SoftwareEntity>(entity =>
        {
            entity.HasIndex(e => new { e.AgentId, e.Name });
            entity.Property(e => e.AgentId).HasMaxLength(100);
            entity.Property(e => e.Name).HasMaxLength(500);
            entity.Property(e => e.SoftwareType).HasMaxLength(100);
        });

        // Configure ProcessEntity
        modelBuilder.Entity<ProcessEntity>(entity =>
        {
            entity.HasIndex(e => new { e.AgentId, e.ProcessId, e.Timestamp });
            entity.Property(e => e.AgentId).HasMaxLength(100);
            entity.Property(e => e.ProcessName).HasMaxLength(255);
            entity.Property(e => e.Status).HasMaxLength(50);
        });

        // Configure NetworkInterfaceEntity
        modelBuilder.Entity<NetworkInterfaceEntity>(entity =>
        {
            entity.HasIndex(e => new { e.AgentId, e.InterfaceName });
            entity.Property(e => e.AgentId).HasMaxLength(100);
            entity.Property(e => e.InterfaceName).HasMaxLength(255);
            entity.Property(e => e.InterfaceType).HasMaxLength(100);
        });

        // Configure foreign key relationships
        modelBuilder.Entity<HeartbeatEntity>()
            .HasOne(h => h.Agent)
            .WithMany(a => a.Heartbeats)
            .HasForeignKey(h => h.AgentId)
            .HasPrincipalKey(a => a.AgentId);

        modelBuilder.Entity<HardwareEntity>()
            .HasOne(h => h.Agent)
            .WithMany(a => a.Hardware)
            .HasForeignKey(h => h.AgentId)
            .HasPrincipalKey(a => a.AgentId);

        modelBuilder.Entity<SoftwareEntity>()
            .HasOne(s => s.Agent)
            .WithMany(a => a.Software)
            .HasForeignKey(s => s.AgentId)
            .HasPrincipalKey(a => a.AgentId);

        modelBuilder.Entity<ProcessEntity>()
            .HasOne(p => p.Agent)
            .WithMany(a => a.Processes)
            .HasForeignKey(p => p.AgentId)
            .HasPrincipalKey(a => a.AgentId);

        modelBuilder.Entity<NetworkInterfaceEntity>()
            .HasOne(n => n.Agent)
            .WithMany(a => a.NetworkInterfaces)
            .HasForeignKey(n => n.AgentId)
            .HasPrincipalKey(a => a.AgentId);
    }
}

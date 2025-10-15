using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UEM.Satellite.API.Data;

public class AgentEntity
{
    [Key] public Guid Id { get; set; }
    public string AgentId { get; set; } = default!;
    public string HardwareFingerprint { get; set; } = default!;
    public string? Hostname { get; set; }
    public string? IpAddress { get; set; }
    public string? MacAddress { get; set; }
    public string? OperatingSystem { get; set; }
    public string? OSVersion { get; set; }
    public string? Architecture { get; set; }
    public string? Domain { get; set; }
    public string? AgentVersion { get; set; }
    public DateTime RegisteredAt { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public string Status { get; set; } = "Unknown";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<HeartbeatEntity> Heartbeats { get; set; } = new List<HeartbeatEntity>();
    public virtual ICollection<HardwareEntity> Hardware { get; set; } = new List<HardwareEntity>();
    public virtual ICollection<SoftwareEntity> Software { get; set; } = new List<SoftwareEntity>();
    public virtual ICollection<ProcessEntity> Processes { get; set; } = new List<ProcessEntity>();
    public virtual ICollection<NetworkInterfaceEntity> NetworkInterfaces { get; set; } = new List<NetworkInterfaceEntity>();
}

public class HeartbeatEntity
{
    [Key] public Guid Id { get; set; }
    public string AgentId { get; set; } = default!;
    public double CpuUsage { get; set; }
    public long MemoryUsedBytes { get; set; }
    public long MemoryTotalBytes { get; set; }
    public long DiskUsedBytes { get; set; }
    public long DiskTotalBytes { get; set; }
    public int ProcessCount { get; set; }
    public int NetworkConnectionCount { get; set; }
    public double UptimeHours { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("AgentId")]
    public virtual AgentEntity? Agent { get; set; }
}

public class HardwareEntity
{
    [Key] public Guid Id { get; set; }
    public string AgentId { get; set; } = default!;
    public string ComponentType { get; set; } = default!; // CPU, Memory, Disk, GPU, etc.
    public string Manufacturer { get; set; } = default!;
    public string Model { get; set; } = default!;
    public string? SerialNumber { get; set; }
    public string? Version { get; set; }
    public long? Capacity { get; set; }
    public string? Properties { get; set; } // JSON for additional properties
    public DateTime DiscoveredAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("AgentId")]
    public virtual AgentEntity? Agent { get; set; }
}

public class SoftwareEntity
{
    [Key] public Guid Id { get; set; }
    public string AgentId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Version { get; set; }
    public string? Publisher { get; set; }
    public string? InstallLocation { get; set; }
    public long? SizeBytes { get; set; }
    public DateTime? InstallDate { get; set; }
    public string SoftwareType { get; set; } = default!; // Application, Service, Driver, etc.
    public string? LicenseKey { get; set; }
    public DateTime DiscoveredAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("AgentId")]
    public virtual AgentEntity? Agent { get; set; }
}

public class ProcessEntity
{
    [Key] public Guid Id { get; set; }
    public string AgentId { get; set; } = default!;
    public int ProcessId { get; set; }
    public string ProcessName { get; set; } = default!;
    public string? ExecutablePath { get; set; }
    public string? CommandLine { get; set; }
    public string? UserName { get; set; }
    public long MemoryUsageBytes { get; set; }
    public double CpuUsagePercent { get; set; }
    public int ThreadCount { get; set; }
    public DateTime StartTime { get; set; }
    public string Status { get; set; } = default!; // Running, Stopped, etc.
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("AgentId")]
    public virtual AgentEntity? Agent { get; set; }
}

public class NetworkInterfaceEntity
{
    [Key] public Guid Id { get; set; }
    public string AgentId { get; set; } = default!;
    public string InterfaceName { get; set; } = default!;
    public string? Description { get; set; }
    public string? MacAddress { get; set; }
    public string? IpAddress { get; set; }
    public string? SubnetMask { get; set; }
    public string? Gateway { get; set; }
    public string? DnsServers { get; set; }
    public bool IsActive { get; set; }
    public string InterfaceType { get; set; } = default!; // Ethernet, WiFi, etc.
    public long BytesSent { get; set; }
    public long BytesReceived { get; set; }
    public double Speed { get; set; } // In Mbps
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Navigation property
    [ForeignKey("AgentId")]
    public virtual AgentEntity? Agent { get; set; }
}

public class CommandEntity
{
    [Key] public Guid Id { get; set; }
    public string TargetAgentId { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string Payload { get; set; } = default!;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExecutedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Result { get; set; }
    public string? ErrorMessage { get; set; }
}

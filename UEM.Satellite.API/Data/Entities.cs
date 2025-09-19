using System.ComponentModel.DataAnnotations;

namespace UEM.Satellite.API.Data;
public class AgentEntity
{
    [Key] public Guid Id { get; set; }
    public string AgentId { get; set; } = default!;
    public string HardwareFingerprint { get; set; } = default!;
    public DateTime RegisteredAt { get; set; }
    public DateTime? LastSeenAt { get; set; }
    public string? Status { get; set; }
}

public class CommandEntity
{
    [Key] public Guid Id { get; set; }
    public string TargetAgentId { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string Payload { get; set; } = default!;
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

namespace UEM.Satellite.API.Models;

public record HeartbeatUpsert(
    string AgentId,
    string UniqueId,
    string? SerialNumber,
    string Hostname,
    string? IpAddress,
    string? MacAddress,
    string? AgentVersion
);

public record HeartbeatView(
    string AgentId,
    string UniqueId,
    string? SerialNumber,
    string Hostname,
    string? IpAddress,
    string? MacAddress,
    string? AgentVersion,
    DateTime FirstContacted,
    DateTime LastContacted
);

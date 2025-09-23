namespace UEM.Satellite.API.DTOs;

// Agent registration and information DTOs
public record AgentRegistrationRequest(
    string EncryptedKey,
    string HardwareFingerprint,
    string Hostname,
    string? IpAddress,
    string? MacAddress,
    string OperatingSystem,
    string OSVersion,
    string Architecture,
    string? Domain,
    string AgentVersion
);

public record AgentRegistrationResponse(
    string AgentId,
    string Jwt,
    string RefreshToken
);

public record AgentInfoResponse(
    string AgentId,
    string Hostname,
    string? IpAddress,
    string? MacAddress,
    string OperatingSystem,
    string OSVersion,
    string Architecture,
    string? Domain,
    string AgentVersion,
    string Status,
    DateTime RegisteredAt,
    DateTime? LastSeenAt
);

// Hardware DTOs
public record HardwareComponentRequest(
    string ComponentType,
    string Manufacturer,
    string Model,
    string? SerialNumber,
    string? Version,
    long? Capacity,
    Dictionary<string, object>? Properties
);

public record HardwareComponentResponse(
    Guid Id,
    string ComponentType,
    string Manufacturer,
    string Model,
    string? SerialNumber,
    string? Version,
    long? Capacity,
    Dictionary<string, object>? Properties,
    DateTime DiscoveredAt,
    DateTime UpdatedAt
);

// Software DTOs
public record SoftwareItemRequest(
    string Name,
    string? Version,
    string? Publisher,
    string? InstallLocation,
    long? SizeBytes,
    DateTime? InstallDate,
    string SoftwareType,
    string? LicenseKey
);

public record SoftwareItemResponse(
    Guid Id,
    string Name,
    string? Version,
    string? Publisher,
    string? InstallLocation,
    long? SizeBytes,
    DateTime? InstallDate,
    string SoftwareType,
    string? LicenseKey,
    DateTime DiscoveredAt,
    DateTime UpdatedAt
);

// Process DTOs
public record ProcessInfoRequest(
    int ProcessId,
    string ProcessName,
    string? ExecutablePath,
    string? CommandLine,
    string? UserName,
    long MemoryUsageBytes,
    double CpuUsagePercent,
    int ThreadCount,
    DateTime StartTime,
    string Status
);

public record ProcessInfoResponse(
    Guid Id,
    int ProcessId,
    string ProcessName,
    string? ExecutablePath,
    string? CommandLine,
    string? UserName,
    long MemoryUsageBytes,
    double CpuUsagePercent,
    int ThreadCount,
    DateTime StartTime,
    string Status,
    DateTime Timestamp
);

// Network DTOs
public record NetworkInterfaceRequest(
    string InterfaceName,
    string? Description,
    string? MacAddress,
    string? IpAddress,
    string? SubnetMask,
    string? Gateway,
    string[]? DnsServers,
    bool IsActive,
    string InterfaceType,
    long BytesSent,
    long BytesReceived,
    double Speed
);

public record NetworkInterfaceResponse(
    Guid Id,
    string InterfaceName,
    string? Description,
    string? MacAddress,
    string? IpAddress,
    string? SubnetMask,
    string? Gateway,
    string[]? DnsServers,
    bool IsActive,
    string InterfaceType,
    long BytesSent,
    long BytesReceived,
    double Speed,
    DateTime Timestamp
);

// Enhanced Heartbeat DTOs
public record EnhancedHeartbeatRequest(
    double CpuUsage,
    long MemoryUsedBytes,
    long MemoryTotalBytes,
    long DiskUsedBytes,
    long DiskTotalBytes,
    int ProcessCount,
    int NetworkConnectionCount,
    double UptimeHours,
    HardwareComponentRequest[]? Hardware,
    SoftwareItemRequest[]? Software,
    ProcessInfoRequest[]? Processes,
    NetworkInterfaceRequest[]? NetworkInterfaces
);

public record EnhancedHeartbeatResponse(
    Guid Id,
    string AgentId,
    double CpuUsage,
    long MemoryUsedBytes,
    long MemoryTotalBytes,
    long DiskUsedBytes,
    long DiskTotalBytes,
    int ProcessCount,
    int NetworkConnectionCount,
    double UptimeHours,
    DateTime Timestamp
);

// Comprehensive endpoint view for UI
public record EndpointDetailsResponse(
    AgentInfoResponse Agent,
    EnhancedHeartbeatResponse? LatestHeartbeat,
    HardwareComponentResponse[] Hardware,
    SoftwareItemResponse[] Software,
    ProcessInfoResponse[] ActiveProcesses,
    NetworkInterfaceResponse[] NetworkInterfaces
);
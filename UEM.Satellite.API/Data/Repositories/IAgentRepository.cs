using UEM.Satellite.API.DTOs;

namespace UEM.Satellite.API.Data.Repositories;

public interface IAgentRepository
{
    Task<string> RegisterAgentAsync(AgentRegistrationRequest request, CancellationToken cancellationToken = default);
    Task<AgentInfoResponse?> GetAgentAsync(string agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AgentInfoResponse>> GetAllAgentsAsync(CancellationToken cancellationToken = default);
    Task UpdateAgentStatusAsync(string agentId, string status, DateTime lastSeen, CancellationToken cancellationToken = default);
    Task<bool> AgentExistsAsync(string agentId, CancellationToken cancellationToken = default);
}

public interface IHardwareRepository
{
    Task UpsertHardwareAsync(string agentId, HardwareComponentRequest[] hardware, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HardwareComponentResponse>> GetAgentHardwareAsync(string agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<HardwareComponentResponse>> GetHardwareByTypeAsync(string componentType, CancellationToken cancellationToken = default);
}

public interface ISoftwareRepository
{
    Task UpsertSoftwareAsync(string agentId, SoftwareItemRequest[] software, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SoftwareItemResponse>> GetAgentSoftwareAsync(string agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SoftwareItemResponse>> GetSoftwareByNameAsync(string softwareName, CancellationToken cancellationToken = default);
}

public interface IProcessRepository
{
    Task UpsertProcessesAsync(string agentId, ProcessInfoRequest[] processes, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProcessInfoResponse>> GetAgentProcessesAsync(string agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProcessInfoResponse>> GetProcessesByNameAsync(string processName, CancellationToken cancellationToken = default);
}

public interface INetworkRepository
{
    Task UpsertNetworkInterfacesAsync(string agentId, NetworkInterfaceRequest[] interfaces, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NetworkInterfaceResponse>> GetAgentNetworkInterfacesAsync(string agentId, CancellationToken cancellationToken = default);
}

public interface IEnhancedHeartbeatRepository
{
    Task UpsertHeartbeatAsync(string agentId, EnhancedHeartbeatRequest heartbeat, CancellationToken cancellationToken = default);
    Task<EnhancedHeartbeatResponse?> GetLatestHeartbeatAsync(string agentId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EnhancedHeartbeatResponse>> GetAllLatestHeartbeatsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EnhancedHeartbeatResponse>> GetHeartbeatHistoryAsync(string agentId, DateTime since, CancellationToken cancellationToken = default);
}
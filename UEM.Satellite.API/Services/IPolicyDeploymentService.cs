using UEM.Satellite.API.Models;

namespace UEM.Satellite.API.Services;

/// <summary>
/// Service interface for policy deployment and execution management
/// </summary>
public interface IPolicyDeploymentService
{
    /// <summary>
    /// Deploy a policy to target agents
    /// </summary>
    Task<PolicyDeploymentStatus> DeployPolicyAsync(PolicyDeploymentRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get deployment status for a specific job
    /// </summary>
    Task<PolicyDeploymentStatus?> GetDeploymentStatusAsync(int jobId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancel a running deployment
    /// </summary>
    Task<bool> CancelDeploymentAsync(int jobId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Process policy execution result from agent
    /// </summary>
    Task ProcessExecutionResultAsync(PolicyExecutionResult result, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get policy execution results for an agent
    /// </summary>
    Task<List<PolicyExecutionResult>> GetAgentExecutionsAsync(
        string agentId, 
        int? policyId = null, 
        string? status = null, 
        int limit = 50, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get pending policy commands for an agent
    /// </summary>
    Task<List<PolicyExecutionCommand>> GetPendingCommandsAsync(string agentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Acknowledge command receipt by agent
    /// </summary>
    Task AcknowledgeCommandAsync(string agentId, string executionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Filter agents by target criteria
    /// </summary>
    Task<List<string>> FilterAgentsByCriteriaAsync(PolicyTargetCriteria criteria, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get policy execution statistics
    /// </summary>
    Task<object> GetPolicyStatisticsAsync(DateTime fromDate, DateTime toDate, CancellationToken cancellationToken = default);
}

/// <summary>
/// Service interface for agent status and capabilities management
/// </summary>
public interface IAgentStatusService
{
    /// <summary>
    /// Get agent policy capabilities
    /// </summary>
    Task<AgentPolicyCapabilities?> GetAgentCapabilitiesAsync(string agentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update agent policy capabilities
    /// </summary>
    Task UpdateAgentCapabilitiesAsync(AgentPolicyCapabilities capabilities, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get list of active agents
    /// </summary>
    Task<List<string>> GetActiveAgentsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if agent is online and responsive
    /// </summary>
    Task<bool> IsAgentOnlineAsync(string agentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get agent system information
    /// </summary>
    Task<AgentSystemInfo?> GetAgentSystemInfoAsync(string agentId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Agent system information
/// </summary>
public class AgentSystemInfo
{
    public string AgentId { get; set; } = string.Empty;
    public string Hostname { get; set; } = string.Empty;
    public string OperatingSystem { get; set; } = string.Empty;
    public string? OsVersion { get; set; }
    public string? AgentVersion { get; set; }
    public string? Domain { get; set; }
    public DateTime LastHeartbeat { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = new();
}
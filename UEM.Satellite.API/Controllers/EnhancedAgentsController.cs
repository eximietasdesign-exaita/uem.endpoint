using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Data.Repositories;
using UEM.Satellite.API.DTOs;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/enhanced/agents")]
public class EnhancedAgentsController : ControllerBase
{
    private readonly IAgentRepository _agentRepository;
    private readonly IEnhancedHeartbeatRepository _heartbeatRepository;
    private readonly IHardwareRepository _hardwareRepository;
    private readonly ISoftwareRepository _softwareRepository;
    private readonly IProcessRepository _processRepository;
    private readonly INetworkRepository _networkRepository;
    private readonly ILogger<EnhancedAgentsController> _logger;

    public EnhancedAgentsController(
        IAgentRepository agentRepository,
        IEnhancedHeartbeatRepository heartbeatRepository,
        IHardwareRepository hardwareRepository,
        ISoftwareRepository softwareRepository,
        IProcessRepository processRepository,
        INetworkRepository networkRepository,
        ILogger<EnhancedAgentsController> logger)
    {
        _agentRepository = agentRepository;
        _heartbeatRepository = heartbeatRepository;
        _hardwareRepository = hardwareRepository;
        _softwareRepository = softwareRepository;
        _processRepository = processRepository;
        _networkRepository = networkRepository;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AgentRegistrationResponse>> RegisterAgent(AgentRegistrationRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var agentId = await _agentRepository.RegisterAgentAsync(request, cancellationToken);
            
            _logger.LogInformation("Agent registered successfully: {AgentId}", agentId);
            
            return Ok(new AgentRegistrationResponse(agentId, "mock-jwt-token", "mock-refresh-token"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register agent");
            return StatusCode(500, new AgentRegistrationResponse(string.Empty, string.Empty, string.Empty));
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AgentInfoResponse>>> GetAllAgents(CancellationToken cancellationToken = default)
    {
        try
        {
            var agents = await _agentRepository.GetAllAgentsAsync(cancellationToken);
            return Ok(agents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all agents");
            return StatusCode(500, "Failed to retrieve agents");
        }
    }

    [HttpGet("{agentId}")]
    public async Task<ActionResult<AgentInfoResponse>> GetAgent(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var agent = await _agentRepository.GetAgentAsync(agentId, cancellationToken);
            if (agent == null)
            {
                return NotFound($"Agent {agentId} not found");
            }
            
            return Ok(agent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get agent {AgentId}", agentId);
            return StatusCode(500, "Failed to retrieve agent");
        }
    }

    [HttpPost("{agentId}/heartbeat")]
    public async Task<ActionResult> SubmitEnhancedHeartbeat(string agentId, EnhancedHeartbeatRequest heartbeat, CancellationToken cancellationToken = default)
    {
        try
        {
            // Verify agent exists
            if (!await _agentRepository.AgentExistsAsync(agentId, cancellationToken))
            {
                return NotFound($"Agent {agentId} not found");
            }

            // Update agent status to online
            await _agentRepository.UpdateAgentStatusAsync(agentId, "Online", DateTime.UtcNow, cancellationToken);

            // Process enhanced heartbeat
            await _heartbeatRepository.UpsertHeartbeatAsync(agentId, heartbeat, cancellationToken);

            _logger.LogInformation("Enhanced heartbeat processed for agent {AgentId}", agentId);
            return Ok(new { Message = "Enhanced heartbeat processed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process enhanced heartbeat for agent {AgentId}", agentId);
            return StatusCode(500, "Failed to process heartbeat");
        }
    }

    [HttpGet("{agentId}/heartbeat/latest")]
    public async Task<ActionResult<EnhancedHeartbeatResponse>> GetLatestHeartbeat(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var heartbeat = await _heartbeatRepository.GetLatestHeartbeatAsync(agentId, cancellationToken);
            if (heartbeat == null)
            {
                return NotFound($"No heartbeat found for agent {agentId}");
            }
            
            return Ok(heartbeat);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get latest heartbeat for agent {AgentId}", agentId);
            return StatusCode(500, "Failed to retrieve heartbeat");
        }
    }

    [HttpGet("heartbeats/latest")]
    public async Task<ActionResult<IReadOnlyList<EnhancedHeartbeatResponse>>> GetAllLatestHeartbeats(CancellationToken cancellationToken = default)
    {
        try
        {
            var heartbeats = await _heartbeatRepository.GetAllLatestHeartbeatsAsync(cancellationToken);
            return Ok(heartbeats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get all latest heartbeats");
            return StatusCode(500, "Failed to retrieve heartbeats");
        }
    }

    [HttpGet("{agentId}/hardware")]
    public async Task<ActionResult<IReadOnlyList<HardwareComponentResponse>>> GetAgentHardware(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var hardware = await _hardwareRepository.GetAgentHardwareAsync(agentId, cancellationToken);
            return Ok(hardware);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get hardware for agent {AgentId}", agentId);
            return StatusCode(500, "Failed to retrieve hardware");
        }
    }

    [HttpGet("{agentId}/software")]
    public async Task<ActionResult<IReadOnlyList<SoftwareItemResponse>>> GetAgentSoftware(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var software = await _softwareRepository.GetAgentSoftwareAsync(agentId, cancellationToken);
            return Ok(software);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get software for agent {AgentId}", agentId);
            return StatusCode(500, "Failed to retrieve software");
        }
    }

    [HttpGet("{agentId}/processes")]
    public async Task<ActionResult<IReadOnlyList<ProcessInfoResponse>>> GetAgentProcesses(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var processes = await _processRepository.GetAgentProcessesAsync(agentId, cancellationToken);
            return Ok(processes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get processes for agent {AgentId}", agentId);
            return StatusCode(500, "Failed to retrieve processes");
        }
    }

    [HttpGet("{agentId}/network")]
    public async Task<ActionResult<IReadOnlyList<NetworkInterfaceResponse>>> GetAgentNetworkInterfaces(string agentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var interfaces = await _networkRepository.GetAgentNetworkInterfacesAsync(agentId, cancellationToken);
            return Ok(interfaces);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get network interfaces for agent {AgentId}", agentId);
            return StatusCode(500, "Failed to retrieve network interfaces");
        }
    }
}
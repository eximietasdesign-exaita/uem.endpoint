using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Models;
using UEM.Satellite.API.Services;
using System.ComponentModel.DataAnnotations;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PolicyController : ControllerBase
{
    private readonly IPolicyDeploymentService _policyDeploymentService;
    private readonly IAgentStatusService _agentStatusService;
    private readonly ILogger<PolicyController> _logger;

    public PolicyController(
        IPolicyDeploymentService policyDeploymentService,
        IAgentStatusService agentStatusService,
        ILogger<PolicyController> logger)
    {
        _policyDeploymentService = policyDeploymentService;
        _agentStatusService = agentStatusService;
        _logger = logger;
    }


    [HttpGet("script-policies")]
    public async Task<ActionResult<IEnumerable<ScriptPolicy>>> GetScriptPolicies(
        [FromQuery] string? ids = null, // Accept an optional comma-separated list of IDs
        CancellationToken cancellationToken = default)
    {
        try
        {
            // The service method now needs to handle the optional filter
            var policies = await _policyDeploymentService.GetScriptPoliciesAsync(ids, cancellationToken);
            return Ok(policies ?? Array.Empty<ScriptPolicy>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get script policies");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Deploy a policy to target agents
    /// </summary>
    [HttpPost("deploy")]
    public async Task<ActionResult<PolicyDeploymentStatus>> DeployPolicy(
        [FromBody] PolicyDeploymentRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Deploying policy {PolicyId} ({PolicyName}) to {TargetCount} targets", 
                request.PolicyId, request.PolicyName, request.TargetAgents.Count);

            var result = await _policyDeploymentService.DeployPolicyAsync(request, cancellationToken);
            
            _logger.LogInformation("Policy deployment initiated: JobId={JobId}, Status={Status}", 
                result.JobId, result.Status);
            
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid policy deployment request");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deploy policy {PolicyId}", request.PolicyId);
            return StatusCode(500, new { error = "Internal server error during policy deployment" });
        }
    }

    /// <summary>
    /// Get deployment status for a specific job
    /// </summary>
    [HttpGet("deployment/{jobId}/status")]
    public async Task<ActionResult<PolicyDeploymentStatus>> GetDeploymentStatus(
        [FromRoute] int jobId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var status = await _policyDeploymentService.GetDeploymentStatusAsync(jobId, cancellationToken);
            
            if (status == null)
            {
                return NotFound(new { error = $"Deployment job {jobId} not found" });
            }
            
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get deployment status for job {JobId}", jobId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Cancel a running deployment
    /// </summary>
    [HttpPost("deployment/{jobId}/cancel")]
    public async Task<ActionResult> CancelDeployment(
        [FromRoute] int jobId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var success = await _policyDeploymentService.CancelDeploymentAsync(jobId, cancellationToken);
            
            if (!success)
            {
                return NotFound(new { error = $"Deployment job {jobId} not found or cannot be cancelled" });
            }
            
            _logger.LogInformation("Deployment job {JobId} cancelled", jobId);
            return Ok(new { message = "Deployment cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cancel deployment job {JobId}", jobId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Submit policy execution result from agent
    /// </summary>
    [HttpPost("execution/result")]
    public async Task<ActionResult> SubmitExecutionResult(
        [FromBody] PolicyExecutionResult result,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Received policy execution result: ExecutionId={ExecutionId}, AgentId={AgentId}, Status={Status}", 
                result.ExecutionId, result.AgentId, result.Status);

            await _policyDeploymentService.ProcessExecutionResultAsync(result, cancellationToken);
            
            return Ok(new { message = "Execution result processed successfully" });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid execution result");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process execution result for {ExecutionId}", result.ExecutionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get policy execution results for an agent
    /// </summary>
    [HttpGet("agent/{agentId}/executions")]
    public async Task<ActionResult<List<PolicyExecutionResult>>> GetAgentExecutions(
        [FromRoute] string agentId,
        [FromQuery] int? policyId = null,
        [FromQuery] string? status = null,
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var executions = await _policyDeploymentService.GetAgentExecutionsAsync(
                agentId, policyId, status, limit, cancellationToken);
            
            return Ok(executions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get executions for agent {AgentId}", agentId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get pending policy commands for an agent
    /// </summary>
    [HttpGet("agent/{agentId}/pending-commands")]
    public async Task<ActionResult<List<PolicyExecutionCommand>>> GetPendingCommands(
        [FromRoute] string agentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var commands = await _policyDeploymentService.GetPendingCommandsAsync(agentId, cancellationToken);
            
            _logger.LogDebug("Retrieved {CommandCount} pending commands for agent {AgentId}", 
                commands.Count, agentId);
            
            return Ok(commands);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get pending commands for agent {AgentId}", agentId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Acknowledge command receipt by agent
    /// </summary>
    [HttpPost("agent/{agentId}/commands/{executionId}/acknowledge")]
    public async Task<ActionResult> AcknowledgeCommand(
        [FromRoute] string agentId,
        [FromRoute] string executionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _policyDeploymentService.AcknowledgeCommandAsync(agentId, executionId, cancellationToken);
            
            _logger.LogDebug("Command {ExecutionId} acknowledged by agent {AgentId}", executionId, agentId);
            
            return Ok(new { message = "Command acknowledged" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to acknowledge command {ExecutionId} for agent {AgentId}", 
                executionId, agentId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get agent policy capabilities
    /// </summary>
    [HttpGet("agent/{agentId}/capabilities")]
    public async Task<ActionResult<AgentPolicyCapabilities>> GetAgentCapabilities(
        [FromRoute] string agentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var capabilities = await _agentStatusService.GetAgentCapabilitiesAsync(agentId, cancellationToken);
            
            if (capabilities == null)
            {
                return NotFound(new { error = $"Agent {agentId} not found or offline" });
            }
            
            return Ok(capabilities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get capabilities for agent {AgentId}", agentId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Update agent policy capabilities
    /// </summary>
    [HttpPost("agent/{agentId}/capabilities")]
    public async Task<ActionResult> UpdateAgentCapabilities(
        [FromRoute] string agentId,
        [FromBody] AgentPolicyCapabilities capabilities,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (agentId != capabilities.AgentId)
            {
                return BadRequest(new { error = "Agent ID mismatch" });
            }

            await _agentStatusService.UpdateAgentCapabilitiesAsync(capabilities, cancellationToken);
            
            _logger.LogInformation("Updated capabilities for agent {AgentId}", agentId);
            
            return Ok(new { message = "Capabilities updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update capabilities for agent {AgentId}", agentId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get active agents that match target criteria
    /// </summary>
    [HttpPost("agents/filter")]
    public async Task<ActionResult<List<string>>> FilterAgentsByCriteria(
        [FromBody] PolicyTargetCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var agents = await _policyDeploymentService.FilterAgentsByCriteriaAsync(criteria, cancellationToken);
            
            return Ok(agents);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to filter agents by criteria");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get policy execution statistics
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetPolicyStatistics(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var stats = await _policyDeploymentService.GetPolicyStatisticsAsync(
                fromDate ?? DateTime.UtcNow.AddDays(-30),
                toDate ?? DateTime.UtcNow,
                cancellationToken);
            
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get policy statistics");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Health check endpoint for policy service
    /// </summary>
    [HttpGet("health")]
    public ActionResult GetHealth()
    {
        return Ok(new
        {
            service = "PolicyController",
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0"
        });
    }
}
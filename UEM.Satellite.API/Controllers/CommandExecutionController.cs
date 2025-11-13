using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Services;
using System.ComponentModel.DataAnnotations;

namespace UEM.Satellite.API.Controllers;

/// <summary>
/// Controller for command execution workflow with hostname matching
/// </summary>
[ApiController]
[Route("api/command-execution")]
public class CommandExecutionController : ControllerBase
{
    private readonly ICommandExecutionService _commandExecutionService;
    private readonly ILogger<CommandExecutionController> _logger;

    public CommandExecutionController(
        ICommandExecutionService commandExecutionService,
        ILogger<CommandExecutionController> logger)
    {
        _commandExecutionService = commandExecutionService;
        _logger = logger;
    }

    /// <summary>
    /// Create and publish a new command execution (minimal payload to Kafka)
    /// </summary>
    [HttpPost("create")]
    public async Task<ActionResult<CommandExecutionResponse>> CreateCommandExecution(
        [FromBody] CommandExecutionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Creating command execution for hostname filter: {HostnameFilter}", 
                request.HostnameFilter);

            var response = await _commandExecutionService.CreateCommandExecutionAsync(request, cancellationToken);
            
            _logger.LogInformation("Command execution created: ExecutionId={ExecutionId}, CommandId={CommandId}", 
                response.ExecutionId, response.CommandId);
            
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid command execution request");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create command execution");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get full command details by execution ID (called by agent after hostname match)
    /// </summary>
    [HttpGet("{executionId}")]
    public async Task<ActionResult<CommandExecutionDetails>> GetCommandExecutionDetails(
        [FromRoute] string executionId,
        [FromQuery] string agentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Agent {AgentId} requesting full details for execution {ExecutionId}", 
                agentId, executionId);

            var details = await _commandExecutionService.GetCommandExecutionDetailsAsync(
                executionId, agentId, cancellationToken);
            
            if (details == null)
            {
                return NotFound(new { error = $"Command execution {executionId} not found" });
            }
            
            return Ok(details);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get command execution details for {ExecutionId}", executionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Submit command execution result from agent
    /// </summary>
    [HttpPost("{executionId}/result")]
    public async Task<ActionResult> SubmitExecutionResult(
        [FromRoute] string executionId,
        [FromBody] CommandExecutionResult result,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Received execution result: ExecutionId={ExecutionId}, AgentId={AgentId}, Status={Status}", 
                executionId, result.AgentId, result.Status);

            await _commandExecutionService.ProcessExecutionResultAsync(executionId, result, cancellationToken);
            
            return Ok(new { message = "Execution result processed successfully" });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid execution result");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process execution result for {ExecutionId}", executionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get execution status
    /// </summary>
    [HttpGet("{executionId}/status")]
    public async Task<ActionResult<CommandExecutionStatus>> GetExecutionStatus(
        [FromRoute] string executionId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var status = await _commandExecutionService.GetExecutionStatusAsync(executionId, cancellationToken);
            
            if (status == null)
            {
                return NotFound(new { error = $"Execution {executionId} not found" });
            }
            
            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get execution status for {ExecutionId}", executionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// List all command executions with optional filters
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<CommandExecutionStatus>>> ListCommandExecutions(
        [FromQuery] string? status = null,
        [FromQuery] string? agentId = null,
        [FromQuery] int limit = 50,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var executions = await _commandExecutionService.ListCommandExecutionsAsync(
                status, agentId, limit, cancellationToken);
            
            return Ok(executions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list command executions");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}

// DTOs

public class CommandExecutionRequest
{
    [Required]
    public string CommandType { get; set; } = string.Empty; // powershell, bash, python, wmi
    
    [Required]
    public string ScriptContent { get; set; } = string.Empty;
    
    /// <summary>
    /// Hostname pattern to match (e.g., "DESKTOP-*", "server-001", etc.)
    /// </summary>
    [Required]
    public string HostnameFilter { get; set; } = string.Empty;
    
    public int TimeoutSeconds { get; set; } = 300;
    
    public Dictionary<string, object>? Parameters { get; set; }
    
    public string? Description { get; set; }
    
    public int? TriggeredBy { get; set; }
}

public class CommandExecutionResponse
{
    public string ExecutionId { get; set; } = string.Empty;
    public string CommandId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Message { get; set; } = "Command published to agents";
}

public class CommandExecutionDetails
{
    public string ExecutionId { get; set; } = string.Empty;
    public string CommandType { get; set; } = string.Empty;
    public string ScriptContent { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; }
    public Dictionary<string, object>? Parameters { get; set; }
    public AgentDetails AgentDetails { get; set; } = new();
    public DateTime IssuedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class AgentDetails
{
    public string AgentId { get; set; } = string.Empty;
    public string Hostname { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? MacAddress { get; set; }
    public string? OperatingSystem { get; set; }
    public string? OsVersion { get; set; }
    public string? Architecture { get; set; }
    public string? Domain { get; set; }
    public string? AgentVersion { get; set; }
}

public class CommandExecutionResult
{
    [Required]
    public string AgentId { get; set; } = string.Empty;
    
    [Required]
    public string Status { get; set; } = string.Empty; // success, failed, timeout
    
    public int? ExitCode { get; set; }
    
    public string? Output { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    public long ExecutionTimeMs { get; set; }
    
    public DateTime StartedAt { get; set; }
    
    public DateTime CompletedAt { get; set; }
    
    public Dictionary<string, object>? Metadata { get; set; }
}

public class CommandExecutionStatus
{
    public string ExecutionId { get; set; } = string.Empty;
    public string CommandId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AgentId { get; set; }
    public string? Hostname { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Output { get; set; }
    public string? ErrorMessage { get; set; }
    public long? ExecutionTimeMs { get; set; }
}

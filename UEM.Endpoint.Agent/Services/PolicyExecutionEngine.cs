using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using UEM.Endpoint.Agent.Data.Services;

namespace UEM.Endpoint.Agent.Services;

/// <summary>
/// Enterprise-grade policy execution engine for dynamic script execution
/// </summary>
public class PolicyExecutionEngine : BackgroundService
{
    private readonly ILogger<PolicyExecutionEngine> _logger;
    private readonly IConfiguration _configuration;
    private readonly AgentRegistrationService _registrationService;
    private readonly PolicyDataService _policyDataService;
    private readonly HttpClient _httpClient;
    private readonly TimeSpan _pollInterval;
    private readonly ScriptExecutionService _scriptExecutor;

    public PolicyExecutionEngine(
        ILogger<PolicyExecutionEngine> logger,
        IConfiguration configuration,
        AgentRegistrationService registrationService,
        PolicyDataService policyDataService,
        ScriptExecutionService scriptExecutor)
    {
        _logger = logger;
        _configuration = configuration;
        _registrationService = registrationService;
        _policyDataService = policyDataService;
        _scriptExecutor = scriptExecutor;

        // Configure HTTP client
        var handler = new SocketsHttpHandler
        {
            PooledConnectionIdleTimeout = TimeSpan.FromMinutes(2),
            KeepAlivePingPolicy = HttpKeepAlivePingPolicy.Always,
            KeepAlivePingDelay = TimeSpan.FromSeconds(15),
            KeepAlivePingTimeout = TimeSpan.FromSeconds(5),
            SslOptions = new System.Net.Security.SslClientAuthenticationOptions
            {
                RemoteCertificateValidationCallback = (_, __, ___, ____) => true
            }
        };
        
        _httpClient = new HttpClient(handler) 
        { 
            Timeout = TimeSpan.FromMinutes(10) // Extended timeout for policy operations
        };

        _pollInterval = TimeSpan.FromSeconds(_configuration.GetValue<int>("Policy:PollIntervalSeconds", 30));
        
        _logger.LogInformation("Policy Execution Engine initialized. Poll Interval: {Interval}", _pollInterval);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PollForPendingPoliciesAsync(stoppingToken);
                await ProcessPendingExecutionsAsync(stoppingToken);
                await ReportExecutionResultsAsync(stoppingToken);
                
                await Task.Delay(_pollInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Policy execution engine stopping due to cancellation");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in policy execution engine main loop");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Backoff on error
            }
        }
    }

    /// <summary>
    /// Poll for pending policy commands from Satellite API
    /// </summary>
    private async Task PollForPendingPoliciesAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(_registrationService.AgentId))
        {
            _logger.LogDebug("Agent not registered, skipping policy poll");
            return;
        }

        try
        {
            var satelliteUrl = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200";
            var requestUri = $"{satelliteUrl}/api/policy/agent/{_registrationService.AgentId}/pending-commands";

            var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
            if (!string.IsNullOrEmpty(_registrationService.Jwt))
            {
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _registrationService.Jwt);
            }

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                var commandsJson = await response.Content.ReadAsStringAsync(cancellationToken);
                var commands = JsonSerializer.Deserialize<List<PolicyExecutionCommand>>(commandsJson);

                if (commands?.Count > 0)
                {
                    _logger.LogInformation("Retrieved {CommandCount} pending policy commands", commands.Count);
                    
                    foreach (var command in commands)
                    {
                        await _policyDataService.StorePendingCommandAsync(command, cancellationToken);
                        
                        // Acknowledge command receipt
                        await AcknowledgeCommandAsync(command.ExecutionId, cancellationToken);
                    }
                }
            }
            else if (response.StatusCode != System.Net.HttpStatusCode.NotFound)
            {
                _logger.LogWarning("Failed to retrieve pending policies: {StatusCode}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error polling for pending policies");
        }
    }

    /// <summary>
    /// Process pending policy executions
    /// </summary>
    private async Task ProcessPendingExecutionsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var pendingCommands = await _policyDataService.GetPendingCommandsAsync(cancellationToken);
            
            foreach (var command in pendingCommands)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                try
                {
                    await ExecutePolicyAsync(command, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error executing policy {ExecutionId}", command.ExecutionId);
                    await RecordExecutionFailureAsync(command, ex.Message, cancellationToken);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing pending executions");
        }
    }

    /// <summary>
    /// Execute a single policy with all its steps
    /// </summary>
    private async Task ExecutePolicyAsync(PolicyExecutionCommand command, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting execution of policy {PolicyId} ({PolicyName}) - Execution ID: {ExecutionId}", 
            command.PolicyId, command.PolicyName, command.ExecutionId);

        var executionResult = new PolicyExecutionResult
        {
            ExecutionId = command.ExecutionId,
            AgentId = command.AgentId,
            PolicyId = command.PolicyId,
            Status = "running",
            TotalSteps = command.ExecutionSteps.Count,
            CompletedSteps = 0,
            CurrentStep = 1,
            StartedAt = DateTime.UtcNow,
            AgentVersion = GetAgentVersion(),
            OperatingSystem = Environment.OSVersion.Platform.ToString(),
            OsVersion = Environment.OSVersion.VersionString
        };

        var stepResults = new List<PolicyStepResult>();
        var overallSuccess = true;
        var stopExecution = false;

        try
        {
            await _policyDataService.StoreExecutionResultAsync(executionResult, cancellationToken);

            foreach (var step in command.ExecutionSteps.OrderBy(s => s.StepNumber))
            {
                if (cancellationToken.IsCancellationRequested || stopExecution)
                    break;

                executionResult.CurrentStep = step.StepNumber;
                executionResult.Progress = (float)executionResult.CompletedSteps / executionResult.TotalSteps * 100;

                var stepResult = await ExecuteStepAsync(step, cancellationToken);
                stepResults.Add(stepResult);

                if (stepResult.Status == "success")
                {
                    executionResult.CompletedSteps++;
                    
                    if (step.OnSuccess == "stop")
                    {
                        _logger.LogInformation("Step {StepNumber} succeeded with stop condition", step.StepNumber);
                        stopExecution = true;
                    }
                }
                else
                {
                    overallSuccess = false;
                    
                    if (step.OnFailure == "stop")
                    {
                        _logger.LogWarning("Step {StepNumber} failed with stop condition", step.StepNumber);
                        stopExecution = true;
                    }
                    else if (step.OnFailure == "retry" && step.MaxRetries > 0)
                    {
                        // Implement retry logic
                        for (int retry = 1; retry <= step.MaxRetries; retry++)
                        {
                            _logger.LogInformation("Retrying step {StepNumber}, attempt {Attempt}/{MaxRetries}", 
                                step.StepNumber, retry, step.MaxRetries);
                            
                            await Task.Delay(TimeSpan.FromSeconds(Math.Min(retry * 2, 30)), cancellationToken);
                            
                            var retryResult = await ExecuteStepAsync(step, cancellationToken);
                            if (retryResult.Status == "success")
                            {
                                stepResult = retryResult;
                                executionResult.CompletedSteps++;
                                overallSuccess = true;
                                break;
                            }
                        }
                    }
                }

                // Update execution result
                executionResult.StepResults = stepResults;
                await _policyDataService.UpdateExecutionResultAsync(executionResult, cancellationToken);
            }

            // Finalize execution
            executionResult.Status = "completed";
            executionResult.Progress = 100.0f;
            executionResult.CompletedAt = DateTime.UtcNow;
            executionResult.TotalExecutionTimeMs = (long)(executionResult.CompletedAt.Value - executionResult.StartedAt.Value).TotalMilliseconds;
            
            if (overallSuccess && executionResult.CompletedSteps == executionResult.TotalSteps)
            {
                executionResult.FinalStatus = "success";
                executionResult.FinalOutput = "All steps completed successfully";
            }
            else if (executionResult.CompletedSteps > 0)
            {
                executionResult.FinalStatus = "partial_success";
                executionResult.FinalOutput = $"Completed {executionResult.CompletedSteps} of {executionResult.TotalSteps} steps";
            }
            else
            {
                executionResult.FinalStatus = "failed";
                executionResult.FinalOutput = "No steps completed successfully";
            }

            await _policyDataService.UpdateExecutionResultAsync(executionResult, cancellationToken);
            await _policyDataService.MarkCommandCompletedAsync(command.ExecutionId, cancellationToken);

            _logger.LogInformation("Policy execution completed: {ExecutionId}, Status: {Status}, Steps: {Completed}/{Total}", 
                command.ExecutionId, executionResult.FinalStatus, executionResult.CompletedSteps, executionResult.TotalSteps);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during policy execution {ExecutionId}", command.ExecutionId);
            await RecordExecutionFailureAsync(command, ex.Message, cancellationToken);
        }
    }

    /// <summary>
    /// Execute a single policy step
    /// </summary>
    private async Task<PolicyStepResult> ExecuteStepAsync(PolicyExecutionStep step, CancellationToken cancellationToken)
    {
        var stopwatch = Stopwatch.StartNew();
        var stepResult = new PolicyStepResult
        {
            StepNumber = step.StepNumber,
            ScriptId = step.ScriptId,
            ScriptName = step.ScriptName,
            Timestamp = DateTime.UtcNow
        };

        try
        {
            _logger.LogInformation("Executing step {StepNumber}: {ScriptName} ({ScriptType})", 
                step.StepNumber, step.ScriptName, step.ScriptType);

            var executionRequest = new ScriptExecutionRequest
            {
                ScriptType = step.ScriptType,
                ScriptContent = step.ScriptContent,
                TimeoutSeconds = step.TimeoutSeconds,
                Parameters = step.Parameters ?? new Dictionary<string, object>()
            };

            var result = await _scriptExecutor.ExecuteScriptAsync(executionRequest, cancellationToken);
            
            stepResult.Status = result.Success ? "success" : "failed";
            stepResult.ExitCode = result.ExitCode;
            stepResult.Output = result.Output;
            stepResult.ErrorMessage = result.Error;
            stepResult.ExecutionTimeMs = stopwatch.ElapsedMilliseconds;

            _logger.LogInformation("Step {StepNumber} completed with status: {Status}, Exit Code: {ExitCode}", 
                step.StepNumber, stepResult.Status, stepResult.ExitCode);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            stepResult.Status = "cancelled";
            stepResult.ErrorMessage = "Execution was cancelled";
            stepResult.ExecutionTimeMs = stopwatch.ElapsedMilliseconds;
        }
        catch (Exception ex)
        {
            stepResult.Status = "failed";
            stepResult.ErrorMessage = ex.Message;
            stepResult.ExecutionTimeMs = stopwatch.ElapsedMilliseconds;
            
            _logger.LogError(ex, "Step {StepNumber} execution failed", step.StepNumber);
        }

        return stepResult;
    }

    /// <summary>
    /// Report execution results back to Satellite API
    /// </summary>
    private async Task ReportExecutionResultsAsync(CancellationToken cancellationToken)
    {
        try
        {
            var unreportedResults = await _policyDataService.GetUnreportedExecutionResultsAsync(cancellationToken);
            
            foreach (var result in unreportedResults)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                await SendExecutionResultAsync(result, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reporting execution results");
        }
    }

    /// <summary>
    /// Send execution result to Satellite API
    /// </summary>
    private async Task SendExecutionResultAsync(PolicyExecutionResult result, CancellationToken cancellationToken)
    {
        try
        {
            var satelliteUrl = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200";
            var requestUri = $"{satelliteUrl}/api/policy/execution/result";

            var json = JsonSerializer.Serialize(result, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var request = new HttpRequestMessage(HttpMethod.Post, requestUri)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            };

            if (!string.IsNullOrEmpty(_registrationService.Jwt))
            {
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _registrationService.Jwt);
            }

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                await _policyDataService.MarkExecutionResultReportedAsync(result.ExecutionId, cancellationToken);
                _logger.LogInformation("Successfully reported execution result for {ExecutionId}", result.ExecutionId);
            }
            else
            {
                _logger.LogWarning("Failed to report execution result for {ExecutionId}: {StatusCode}", 
                    result.ExecutionId, response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending execution result for {ExecutionId}", result.ExecutionId);
        }
    }

    /// <summary>
    /// Acknowledge command receipt
    /// </summary>
    private async Task AcknowledgeCommandAsync(string executionId, CancellationToken cancellationToken)
    {
        try
        {
            var satelliteUrl = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200";
            var requestUri = $"{satelliteUrl}/api/policy/agent/{_registrationService.AgentId}/commands/{executionId}/acknowledge";

            var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            if (!string.IsNullOrEmpty(_registrationService.Jwt))
            {
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _registrationService.Jwt);
            }

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogDebug("Acknowledged command {ExecutionId}", executionId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error acknowledging command {ExecutionId}", executionId);
        }
    }

    /// <summary>
    /// Record execution failure
    /// </summary>
    private async Task RecordExecutionFailureAsync(PolicyExecutionCommand command, string errorMessage, CancellationToken cancellationToken)
    {
        var executionResult = new PolicyExecutionResult
        {
            ExecutionId = command.ExecutionId,
            AgentId = command.AgentId,
            PolicyId = command.PolicyId,
            Status = "failed",
            FinalStatus = "failed",
            ErrorSummary = errorMessage,
            TotalSteps = command.ExecutionSteps.Count,
            CompletedSteps = 0,
            StartedAt = DateTime.UtcNow,
            CompletedAt = DateTime.UtcNow,
            AgentVersion = GetAgentVersion(),
            OperatingSystem = Environment.OSVersion.Platform.ToString(),
            OsVersion = Environment.OSVersion.VersionString
        };

        await _policyDataService.StoreExecutionResultAsync(executionResult, cancellationToken);
        await _policyDataService.MarkCommandCompletedAsync(command.ExecutionId, cancellationToken);
    }

    private string GetAgentVersion()
    {
        return System.Reflection.Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "Unknown";
    }

    public override void Dispose()
    {
        _httpClient?.Dispose();
        base.Dispose();
    }
}

#region Data Models

/// <summary>
/// Policy execution command received from Satellite API
/// </summary>
public class PolicyExecutionCommand
{
    public string ExecutionId { get; set; } = string.Empty;
    public string AgentId { get; set; } = string.Empty;
    public int PolicyId { get; set; }
    public string PolicyName { get; set; } = string.Empty;
    public List<PolicyExecutionStep> ExecutionSteps { get; set; } = new();
    public int TimeoutSeconds { get; set; } = 1800;
    public string TriggerType { get; set; } = "manual";
    public int? TriggeredBy { get; set; }
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
    public Dictionary<string, object>? Metadata { get; set; }
}

/// <summary>
/// Individual policy execution step
/// </summary>
public class PolicyExecutionStep
{
    public int StepNumber { get; set; }
    public int ScriptId { get; set; }
    public string ScriptName { get; set; } = string.Empty;
    public string ScriptType { get; set; } = string.Empty;
    public string ScriptContent { get; set; } = string.Empty;
    public string RunCondition { get; set; } = "always";
    public string OnSuccess { get; set; } = "continue";
    public string OnFailure { get; set; } = "stop";
    public int TimeoutSeconds { get; set; } = 300;
    public int MaxRetries { get; set; } = 0;
    public Dictionary<string, object>? Parameters { get; set; }
}

/// <summary>
/// Policy execution result to send back to Satellite API
/// </summary>
public class PolicyExecutionResult
{
    public string ExecutionId { get; set; } = string.Empty;
    public string AgentId { get; set; } = string.Empty;
    public int PolicyId { get; set; }
    public string Status { get; set; } = string.Empty;
    public float Progress { get; set; } = 0.0f;
    public int TotalSteps { get; set; }
    public int CompletedSteps { get; set; }
    public int CurrentStep { get; set; } = 1;
    public List<PolicyStepResult> StepResults { get; set; } = new();
    public string? FinalOutput { get; set; }
    public string? FinalStatus { get; set; }
    public string? ErrorSummary { get; set; }
    public long TotalExecutionTimeMs { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? AgentVersion { get; set; }
    public string? OperatingSystem { get; set; }
    public string? OsVersion { get; set; }
    public int RetryCount { get; set; } = 0;
    public DateTime ReportedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Individual step execution result
/// </summary>
public class PolicyStepResult
{
    public int StepNumber { get; set; }
    public int ScriptId { get; set; }
    public string ScriptName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? ExitCode { get; set; }
    public string? Output { get; set; }
    public string? ErrorMessage { get; set; }
    public long ExecutionTimeMs { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Script execution request for script executor service
/// </summary>
public class ScriptExecutionRequest
{
    public string ScriptType { get; set; } = string.Empty;
    public string ScriptContent { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 300;
    public Dictionary<string, object> Parameters { get; set; } = new();
}

/// <summary>
/// Script execution result from script executor service
/// </summary>
public class ScriptExecutionResult
{
    public bool Success { get; set; }
    public int? ExitCode { get; set; }
    public string? Output { get; set; }
    public string? Error { get; set; }
    public long ExecutionTimeMs { get; set; }
}

#endregion
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using UEM.Endpoint.Agent.Data.Contexts;
using UEM.Endpoint.Agent.Data.Models;
using UEM.Endpoint.Agent.Services;

namespace UEM.Endpoint.Agent.Data.Services;

/// <summary>
/// Data service for policy execution management in local SQLite database
/// </summary>
public class PolicyDataService
{
    private readonly AgentDataContext _context;
    private readonly ILogger<PolicyDataService> _logger;

    public PolicyDataService(AgentDataContext context, ILogger<PolicyDataService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Policy Command Operations

    /// <summary>
    /// Store a pending policy command
    /// </summary>
    public async Task<int> StorePendingCommandAsync(PolicyExecutionCommand command, CancellationToken cancellationToken = default)
    {
        using var timer = _logger.BeginPerformanceTimer("StorePendingCommand");

        try
        {
            var commandRecord = new PolicyCommandRecord
            {
                ExecutionId = command.ExecutionId,
                AgentId = command.AgentId,
                PolicyId = command.PolicyId,
                PolicyName = command.PolicyName,
                ExecutionStepsJson = JsonSerializer.Serialize(command.ExecutionSteps),
                TimeoutSeconds = command.TimeoutSeconds,
                TriggerType = command.TriggerType,
                TriggeredBy = command.TriggeredBy,
                IssuedAt = command.IssuedAt,
                ExpiresAt = command.ExpiresAt,
                MetadataJson = command.Metadata != null ? JsonSerializer.Serialize(command.Metadata) : null,
                Status = "pending",
                ReceivedAt = DateTime.UtcNow
            };

            _context.PolicyCommands.Add(commandRecord);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Stored pending policy command {ExecutionId} for policy {PolicyId}", 
                command.ExecutionId, command.PolicyId);
            
            return commandRecord.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to store pending command {ExecutionId}", command.ExecutionId);
            throw;
        }
    }

    /// <summary>
    /// Get pending policy commands for execution
    /// </summary>
    public async Task<List<PolicyExecutionCommand>> GetPendingCommandsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var pendingRecords = await _context.PolicyCommands
                .Where(c => c.Status == "pending" && c.ExpiresAt > DateTime.UtcNow)
                .OrderBy(c => c.IssuedAt)
                .ToListAsync(cancellationToken);

            var commands = new List<PolicyExecutionCommand>();
            
            foreach (var record in pendingRecords)
            {
                try
                {
                    var executionSteps = JsonSerializer.Deserialize<List<PolicyExecutionStep>>(record.ExecutionStepsJson) ?? new List<PolicyExecutionStep>();
                    var metadata = record.MetadataJson != null ? JsonSerializer.Deserialize<Dictionary<string, object>>(record.MetadataJson) : null;

                    commands.Add(new PolicyExecutionCommand
                    {
                        ExecutionId = record.ExecutionId,
                        AgentId = record.AgentId,
                        PolicyId = record.PolicyId,
                        PolicyName = record.PolicyName,
                        ExecutionSteps = executionSteps,
                        TimeoutSeconds = record.TimeoutSeconds,
                        TriggerType = record.TriggerType,
                        TriggeredBy = record.TriggeredBy,
                        IssuedAt = record.IssuedAt,
                        ExpiresAt = record.ExpiresAt,
                        Metadata = metadata
                    });
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to deserialize command {ExecutionId}, marking as failed", record.ExecutionId);
                    record.Status = "failed";
                    record.ErrorMessage = "Failed to deserialize command data";
                }
            }

            await _context.SaveChangesAsync(cancellationToken);
            return commands;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get pending commands");
            return new List<PolicyExecutionCommand>();
        }
    }

    /// <summary>
    /// Mark command as completed
    /// </summary>
    public async Task MarkCommandCompletedAsync(string executionId, CancellationToken cancellationToken = default)
    {
        try
        {
            var command = await _context.PolicyCommands
                .FirstOrDefaultAsync(c => c.ExecutionId == executionId, cancellationToken);

            if (command != null)
            {
                command.Status = "completed";
                command.CompletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
                
                _logger.LogInformation("Marked command {ExecutionId} as completed", executionId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark command {ExecutionId} as completed", executionId);
        }
    }

    /// <summary>
    /// Mark command as failed
    /// </summary>
    public async Task MarkCommandFailedAsync(string executionId, string errorMessage, CancellationToken cancellationToken = default)
    {
        try
        {
            var command = await _context.PolicyCommands
                .FirstOrDefaultAsync(c => c.ExecutionId == executionId, cancellationToken);

            if (command != null)
            {
                command.Status = "failed";
                command.ErrorMessage = errorMessage;
                command.CompletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
                
                _logger.LogInformation("Marked command {ExecutionId} as failed: {ErrorMessage}", executionId, errorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark command {ExecutionId} as failed", executionId);
        }
    }

    #endregion

    #region Policy Execution Results Operations

    /// <summary>
    /// Store policy execution result
    /// </summary>
    public async Task<int> StoreExecutionResultAsync(PolicyExecutionResult result, CancellationToken cancellationToken = default)
    {
        using var timer = _logger.BeginPerformanceTimer("StoreExecutionResult");

        try
        {
            var resultRecord = new PolicyExecutionResultRecord
            {
                ExecutionId = result.ExecutionId,
                AgentId = result.AgentId,
                PolicyId = result.PolicyId,
                Status = result.Status,
                Progress = result.Progress,
                TotalSteps = result.TotalSteps,
                CompletedSteps = result.CompletedSteps,
                CurrentStep = result.CurrentStep,
                StepResultsJson = JsonSerializer.Serialize(result.StepResults),
                FinalOutput = result.FinalOutput,
                FinalStatus = result.FinalStatus,
                ErrorSummary = result.ErrorSummary,
                TotalExecutionTimeMs = result.TotalExecutionTimeMs,
                StartedAt = result.StartedAt,
                CompletedAt = result.CompletedAt,
                AgentVersion = result.AgentVersion,
                OperatingSystem = result.OperatingSystem,
                OsVersion = result.OsVersion,
                RetryCount = result.RetryCount,
                ReportedToServer = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.PolicyExecutionResults.Add(resultRecord);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Stored execution result for {ExecutionId} with status {Status}", 
                result.ExecutionId, result.Status);
            
            return resultRecord.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to store execution result for {ExecutionId}", result.ExecutionId);
            throw;
        }
    }

    /// <summary>
    /// Update existing execution result
    /// </summary>
    public async Task UpdateExecutionResultAsync(PolicyExecutionResult result, CancellationToken cancellationToken = default)
    {
        try
        {
            var existingRecord = await _context.PolicyExecutionResults
                .FirstOrDefaultAsync(r => r.ExecutionId == result.ExecutionId, cancellationToken);

            if (existingRecord != null)
            {
                existingRecord.Status = result.Status;
                existingRecord.Progress = result.Progress;
                existingRecord.CompletedSteps = result.CompletedSteps;
                existingRecord.CurrentStep = result.CurrentStep;
                existingRecord.StepResultsJson = JsonSerializer.Serialize(result.StepResults);
                existingRecord.FinalOutput = result.FinalOutput;
                existingRecord.FinalStatus = result.FinalStatus;
                existingRecord.ErrorSummary = result.ErrorSummary;
                existingRecord.TotalExecutionTimeMs = result.TotalExecutionTimeMs;
                existingRecord.CompletedAt = result.CompletedAt;
                existingRecord.RetryCount = result.RetryCount;
                existingRecord.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync(cancellationToken);
                
                _logger.LogDebug("Updated execution result for {ExecutionId}", result.ExecutionId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update execution result for {ExecutionId}", result.ExecutionId);
        }
    }

    /// <summary>
    /// Get unreported execution results for sending to server
    /// </summary>
    public async Task<List<PolicyExecutionResult>> GetUnreportedExecutionResultsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var unreportedRecords = await _context.PolicyExecutionResults
                .Where(r => !r.ReportedToServer && r.Status == "completed")
                .OrderBy(r => r.CreatedAt)
                .Take(50) // Limit batch size
                .ToListAsync(cancellationToken);

            var results = new List<PolicyExecutionResult>();
            
            foreach (var record in unreportedRecords)
            {
                try
                {
                    var stepResults = JsonSerializer.Deserialize<List<PolicyStepResult>>(record.StepResultsJson) ?? new List<PolicyStepResult>();

                    results.Add(new PolicyExecutionResult
                    {
                        ExecutionId = record.ExecutionId,
                        AgentId = record.AgentId,
                        PolicyId = record.PolicyId,
                        Status = record.Status,
                        Progress = record.Progress,
                        TotalSteps = record.TotalSteps,
                        CompletedSteps = record.CompletedSteps,
                        CurrentStep = record.CurrentStep,
                        StepResults = stepResults,
                        FinalOutput = record.FinalOutput,
                        FinalStatus = record.FinalStatus,
                        ErrorSummary = record.ErrorSummary,
                        TotalExecutionTimeMs = record.TotalExecutionTimeMs,
                        StartedAt = record.StartedAt,
                        CompletedAt = record.CompletedAt,
                        AgentVersion = record.AgentVersion,
                        OperatingSystem = record.OperatingSystem,
                        OsVersion = record.OsVersion,
                        RetryCount = record.RetryCount,
                        ReportedAt = DateTime.UtcNow
                    });
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Failed to deserialize execution result {ExecutionId}", record.ExecutionId);
                }
            }

            return results;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get unreported execution results");
            return new List<PolicyExecutionResult>();
        }
    }

    /// <summary>
    /// Mark execution result as reported to server
    /// </summary>
    public async Task MarkExecutionResultReportedAsync(string executionId, CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _context.PolicyExecutionResults
                .FirstOrDefaultAsync(r => r.ExecutionId == executionId, cancellationToken);

            if (result != null)
            {
                result.ReportedToServer = true;
                result.ReportedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
                
                _logger.LogDebug("Marked execution result {ExecutionId} as reported", executionId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark execution result {ExecutionId} as reported", executionId);
        }
    }

    /// <summary>
    /// Get execution result by execution ID
    /// </summary>
    public async Task<PolicyExecutionResult?> GetExecutionResultAsync(string executionId, CancellationToken cancellationToken = default)
    {
        try
        {
            var record = await _context.PolicyExecutionResults
                .FirstOrDefaultAsync(r => r.ExecutionId == executionId, cancellationToken);

            if (record == null)
                return null;

            var stepResults = JsonSerializer.Deserialize<List<PolicyStepResult>>(record.StepResultsJson) ?? new List<PolicyStepResult>();

            return new PolicyExecutionResult
            {
                ExecutionId = record.ExecutionId,
                AgentId = record.AgentId,
                PolicyId = record.PolicyId,
                Status = record.Status,
                Progress = record.Progress,
                TotalSteps = record.TotalSteps,
                CompletedSteps = record.CompletedSteps,
                CurrentStep = record.CurrentStep,
                StepResults = stepResults,
                FinalOutput = record.FinalOutput,
                FinalStatus = record.FinalStatus,
                ErrorSummary = record.ErrorSummary,
                TotalExecutionTimeMs = record.TotalExecutionTimeMs,
                StartedAt = record.StartedAt,
                CompletedAt = record.CompletedAt,
                AgentVersion = record.AgentVersion,
                OperatingSystem = record.OperatingSystem,
                OsVersion = record.OsVersion,
                RetryCount = record.RetryCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get execution result for {ExecutionId}", executionId);
            return null;
        }
    }

    #endregion

    #region Policy Statistics and Management

    /// <summary>
    /// Get policy execution statistics
    /// </summary>
    public async Task<Dictionary<string, object>> GetPolicyStatisticsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var totalCommands = await _context.PolicyCommands.CountAsync(cancellationToken);
            var pendingCommands = await _context.PolicyCommands.CountAsync(c => c.Status == "pending", cancellationToken);
            var completedCommands = await _context.PolicyCommands.CountAsync(c => c.Status == "completed", cancellationToken);
            var failedCommands = await _context.PolicyCommands.CountAsync(c => c.Status == "failed", cancellationToken);

            var totalResults = await _context.PolicyExecutionResults.CountAsync(cancellationToken);
            var unreportedResults = await _context.PolicyExecutionResults.CountAsync(r => !r.ReportedToServer, cancellationToken);
            var successfulResults = await _context.PolicyExecutionResults.CountAsync(r => r.FinalStatus == "success", cancellationToken);
            var failedResults = await _context.PolicyExecutionResults.CountAsync(r => r.FinalStatus == "failed", cancellationToken);

            return new Dictionary<string, object>
            {
                ["Commands"] = new
                {
                    Total = totalCommands,
                    Pending = pendingCommands,
                    Completed = completedCommands,
                    Failed = failedCommands
                },
                ["ExecutionResults"] = new
                {
                    Total = totalResults,
                    Unreported = unreportedResults,
                    Successful = successfulResults,
                    Failed = failedResults,
                    SuccessRate = totalResults > 0 ? (double)successfulResults / totalResults * 100 : 0
                },
                ["GeneratedAt"] = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get policy statistics");
            return new Dictionary<string, object>
            {
                ["Error"] = ex.Message,
                ["GeneratedAt"] = DateTime.UtcNow
            };
        }
    }

    /// <summary>
    /// Clean up old policy data
    /// </summary>
    public async Task CleanupOldDataAsync(int retentionDays = 30, CancellationToken cancellationToken = default)
    {
        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);

            // Clean up old completed commands
            var oldCommands = await _context.PolicyCommands
                .Where(c => (c.Status == "completed" || c.Status == "failed") && c.CompletedAt < cutoffDate)
                .ToListAsync(cancellationToken);

            if (oldCommands.Count > 0)
            {
                _context.PolicyCommands.RemoveRange(oldCommands);
                _logger.LogInformation("Removing {Count} old policy commands", oldCommands.Count);
            }

            // Clean up old reported execution results
            var oldResults = await _context.PolicyExecutionResults
                .Where(r => r.ReportedToServer && r.CreatedAt < cutoffDate)
                .ToListAsync(cancellationToken);

            if (oldResults.Count > 0)
            {
                _context.PolicyExecutionResults.RemoveRange(oldResults);
                _logger.LogInformation("Removing {Count} old execution results", oldResults.Count);
            }

            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup old policy data");
        }
    }

    #endregion
}
using UEM.Satellite.API.Controllers;

namespace UEM.Satellite.API.Services;

public interface ICommandExecutionService
{
    Task<CommandExecutionResponse> CreateCommandExecutionAsync(
        CommandExecutionRequest request, 
        CancellationToken cancellationToken = default);
    
    Task<CommandExecutionDetails?> GetCommandExecutionDetailsAsync(
        string executionId, 
        string agentId, 
        CancellationToken cancellationToken = default);
    
    Task ProcessExecutionResultAsync(
        string executionId, 
        CommandExecutionResult result, 
        CancellationToken cancellationToken = default);
    
    Task<CommandExecutionStatus?> GetExecutionStatusAsync(
        string executionId, 
        CancellationToken cancellationToken = default);
    
    Task<List<CommandExecutionStatus>> ListCommandExecutionsAsync(
        string? status, 
        string? agentId, 
        int limit, 
        CancellationToken cancellationToken = default);
}

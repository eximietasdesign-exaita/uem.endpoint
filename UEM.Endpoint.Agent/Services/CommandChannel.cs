using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Logging;
using ScriptExecLib;
using ScriptExecLib.Models;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Channels;
using UEM.Shared.Infrastructure.Helpers;
using Microsoft.Extensions.Configuration;

namespace UEM.Endpoint.Agent.Services;

public sealed class CommandChannel
{
    private readonly Channel<CommandMessage> _channel = Channel.CreateUnbounded<CommandMessage>();
    private readonly ILogger<CommandChannel> _logger;
    private HubConnection? _conn;
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;

    public CommandChannel(ILogger<CommandChannel> logger, IConfiguration config)
    {
        _logger = logger;
        _httpClient = new HttpClient();
        _apiUrl = config.GetValue<string>("Api:CommandResponseUrl") ?? "https://localhost:7201";
        _apiUrl = $"{_apiUrl}/api/commands/response";
    }

    public IAsyncEnumerable<CommandMessage> ReadCommandsAsync(CancellationToken ct)
        => _channel.Reader.ReadAllAsync(ct);

    private static bool HostnameMatches(string hostname, string filter)
    {
        // Simple wildcard matching (supports * and ?)
        if (filter == "*") return true;
        if (filter == hostname) return true;
        
        // Convert wildcard pattern to regex
        var regexPattern = "^" + System.Text.RegularExpressions.Regex.Escape(filter)
            .Replace("\\*", ".*")
            .Replace("\\?", ".") + "$";
        
        return System.Text.RegularExpressions.Regex.IsMatch(hostname, regexPattern, 
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }

    public async Task ConnectAsync(string baseUrl, string agentId, string? accessToken, CancellationToken ct = default)
    {
        baseUrl = baseUrl.Trim().TrimEnd('/');
        var hubUrl = $"{baseUrl}/agent-hub?agentId={Uri.EscapeDataString(agentId)}";

        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        };

        _conn = new HubConnectionBuilder()
            .WithUrl(hubUrl, o =>
            {
                o.HttpMessageHandlerFactory = _ => handler;
                if (!string.IsNullOrWhiteSpace(accessToken))
                    o.AccessTokenProvider = () => Task.FromResult(accessToken)!;
            })
            .WithAutomaticReconnect()
            .Build();

        _conn.On<string, string, string, int>("command", async (executionId, commandType, payloadJson, ttl) =>
        {
            _logger.LogInformation("Received command notification: ExecutionId={ExecutionId}, Type={Type}, Ttl={Ttl}", 
                executionId, commandType, ttl);
            _logger.LogDebug("Command payload JSON: {Payload}", payloadJson);

            try
            {
                // Parse minimal payload
                var minimalPayload = JsonSerializer.Deserialize<MinimalCommandPayload>(payloadJson);
                if (minimalPayload == null)
                {
                    _logger.LogWarning("Failed to deserialize minimal payload for execution {ExecutionId}", executionId);
                    return;
                }

                // Get current hostname
                var currentHostname = Environment.MachineName;
                _logger.LogInformation("Current hostname: {Hostname}, Filter: {Filter}", currentHostname, minimalPayload.HostnameFilter);
                
                // Check if hostname matches the filter
                if (!HostnameMatches(currentHostname, minimalPayload.HostnameFilter))
                {
                    _logger.LogInformation("Hostname {Hostname} does not match filter {Filter}, ignoring command", 
                        currentHostname, minimalPayload.HostnameFilter);
                    return;
                }

                _logger.LogInformation("Hostname {Hostname} matched filter {Filter}, fetching full command details", 
                    currentHostname, minimalPayload.HostnameFilter);

                // Fetch full command details from Satellite API
                var satelliteUrl = baseUrl.TrimEnd('/');
                var detailsUrl = $"{satelliteUrl}/api/command-execution/{executionId}?agentId={Uri.EscapeDataString(agentId)}";
                
                var detailsResponse = await _httpClient.GetAsync(detailsUrl, ct);
                if (!detailsResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to fetch command details for {ExecutionId}: {StatusCode}", 
                        executionId, detailsResponse.StatusCode);
                    return;
                }

                var commandDetails = await detailsResponse.Content.ReadFromJsonAsync<CommandExecutionDetails>(cancellationToken: ct);
                if (commandDetails == null)
                {
                    _logger.LogWarning("Received null command details for {ExecutionId}", executionId);
                    return;
                }

                _logger.LogInformation("Fetched full command details for {ExecutionId}, executing script", executionId);

                // Execute the script
                var startTime = DateTime.UtcNow;
                var facade = new ScriptExecFacade();
                var execRequest = new ExecRequest(commandDetails.ScriptContent, Timeout: TimeSpan.FromSeconds(commandDetails.TimeoutSeconds));
                var result = await facade.RunBatchAsync(execRequest);
                var endTime = DateTime.UtcNow;

                var executionTimeMs = (long)(endTime - startTime).TotalMilliseconds;
                var success = result.Success;
                var output = result.ToJson();

                _logger.LogInformation("Script execution completed for {ExecutionId}: Success={Success}, Time={TimeMs}ms", 
                    executionId, success, executionTimeMs);

                // Submit result to Satellite API
                var resultPayload = new
                {
                    AgentId = agentId,
                    Status = success ? "success" : "failed",
                    ExitCode = result.ExitCode,
                    Output = output,
                    ErrorMessage = success ? null : result.Error,
                    ExecutionTimeMs = executionTimeMs,
                    StartedAt = startTime,
                    CompletedAt = endTime
                };

                var resultUrl = $"{satelliteUrl}/api/command-execution/{executionId}/result";
                var resultResponse = await _httpClient.PostAsJsonAsync(resultUrl, resultPayload, ct);
                
                if (resultResponse.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Successfully submitted execution result for {ExecutionId}", executionId);
                }
                else
                {
                    _logger.LogWarning("Failed to submit execution result for {ExecutionId}: {StatusCode}", 
                        executionId, resultResponse.StatusCode);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing command {ExecutionId}", executionId);
            }
        });

        // Add reconnection event handlers for debugging
        _conn.Reconnecting += error =>
        {
            _logger.LogWarning(error, "SignalR connection lost, attempting to reconnect...");
            return Task.CompletedTask;
        };

        _conn.Reconnected += connectionId =>
        {
            _logger.LogInformation("SignalR reconnected successfully. ConnectionId: {ConnectionId}", connectionId);
            return Task.CompletedTask;
        };

        _conn.Closed += error =>
        {
            _logger.LogError(error, "SignalR connection closed");
            return Task.CompletedTask;
        };

        try
        {
            _logger.LogInformation("Attempting to connect to SignalR hub at {HubUrl}", hubUrl);
            await _conn.StartAsync(ct);
            _logger.LogInformation("✅ SignalR connection established successfully! ConnectionId: {ConnectionId}", _conn.ConnectionId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to connect to SignalR hub at {HubUrl}", hubUrl);
            throw;
        }
    }
}

public record CommandMessage(string Id, string Type, string PayloadJson, int Ttl);

// DTOs for hostname-based command execution
public class MinimalCommandPayload
{
    [System.Text.Json.Serialization.JsonPropertyName("executionId")]
    public string ExecutionId { get; set; } = string.Empty;
    
    [System.Text.Json.Serialization.JsonPropertyName("commandId")]
    public string CommandId { get; set; } = string.Empty;
    
    [System.Text.Json.Serialization.JsonPropertyName("hostnameFilter")]
    public string HostnameFilter { get; set; } = string.Empty;
    
    [System.Text.Json.Serialization.JsonPropertyName("commandType")]
    public string CommandType { get; set; } = string.Empty;
    
    [System.Text.Json.Serialization.JsonPropertyName("ttl")]
    public int Ttl { get; set; }
    
    [System.Text.Json.Serialization.JsonPropertyName("issuedAt")]
    public DateTime IssuedAt { get; set; }
    
    [System.Text.Json.Serialization.JsonPropertyName("expiresAt")]
    public DateTime ExpiresAt { get; set; }
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

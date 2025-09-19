using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Logging;
using ScriptExecLib;
using ScriptExecLib.Models;
using System.Net.Http;
using System.Net.Http.Json;
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

        _conn.On<string, string, string, int>("command", async (id, type, payloadJson, ttl) =>
        {
            //await _channel.Writer.WriteAsync(new CommandMessage(id, type, payloadJson, ttl), ct);


            var cmd = new CommandMessage(id, type, payloadJson, ttl);
            _logger.LogInformation("Received command: Id={Id}, Type={Type}, Ttl={Ttl}, Payload={PayloadJson}", cmd.Id, cmd.Type, cmd.Ttl, cmd.PayloadJson);
            await _channel.Writer.WriteAsync(cmd, ct);

            try
            {
                var facade = new ScriptExecFacade();
                var result = await facade.RunBatchAsync(new ExecRequest(payloadJson.GetCommandFromJson(), Timeout: TimeSpan.FromSeconds(15)));
                var jsonOutput = result.ToJson();
                _logger.LogInformation("Script execution result: {JsonOutput}", jsonOutput);

                // Pick API URL from config
                var responsePayload = new
                {
                    CommandId = id,
                    AgentId = agentId,
                    Output = jsonOutput
                };
                var resp = await _httpClient.PostAsJsonAsync(_apiUrl, responsePayload, ct);
                if (resp.IsSuccessStatusCode)
                    _logger.LogInformation("Pushed command output to API endpoint: {ApiUrl}", _apiUrl);
                else
                    _logger.LogWarning("Failed to push command output to API endpoint: {ApiUrl} Status: {StatusCode}", _apiUrl, resp.StatusCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing script");
            }

        });

        await _conn.StartAsync(ct);
    }
}

public record CommandMessage(string Id, string Type, string PayloadJson, int Ttl)
{
}

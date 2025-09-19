using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace UEM.Endpoint.Agent.Services;

public sealed class HeartbeatService : BackgroundService
{
    private readonly ILogger<HeartbeatService> _log;
    private readonly HeartbeatCollector _collector;
    private readonly AgentRegistrationService _reg;
    private readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(15) };
    private readonly TimeSpan _interval;

    public HeartbeatService(ILogger<HeartbeatService> log, HeartbeatCollector collector, AgentRegistrationService reg, IConfiguration cfg)
    {
        _log = log; _collector = collector; _reg = reg;
        _interval = TimeSpan.FromSeconds(cfg.GetValue<int?>("Heartbeat:IntervalSeconds") ?? 30);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(_reg.AgentId) || string.IsNullOrWhiteSpace(_reg.Jwt))
                {
                    _log.LogDebug("Agent not registered, attempting registration...");
                    await _reg.EnsureRegisteredAsync(stoppingToken);
                    if (string.IsNullOrWhiteSpace(_reg.AgentId) || string.IsNullOrWhiteSpace(_reg.Jwt))
                    {

                        _log.LogDebug("Skipping heartbeat; agent not registered yet");
                    }
                }
                else
                {
                    var hb = await _collector.CollectAsync(stoppingToken);
                    var baseUrl = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200";
                    using var req = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/agents/{_reg.AgentId}/heartbeat")
                    { Content = JsonContent.Create(hb) };
                    req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _reg.Jwt);
                    var res = await _http.SendAsync(req, stoppingToken);
                    if (!res.IsSuccessStatusCode)
                    {
                        var body = await res.Content.ReadAsStringAsync(stoppingToken);
                        _log.LogWarning("Heartbeat failed: {Code} {Body}", (int)res.StatusCode, body);
                    }
                    else
                    {
                        _log.LogInformation("Heartbeat sent ({AgentId})", _reg.AgentId);
                    }
                }
            }
            catch (Exception ex)
            {
                _log.LogWarning(ex, "Heartbeat loop error");
            }

            try { await Task.Delay(_interval, stoppingToken); } catch { }
        }
    }
}

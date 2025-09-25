using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Diagnostics;

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
        _log.LogAgentLifecycle("HeartbeatService Started", $"Interval: {_interval.TotalSeconds}s");
        
        while (!stoppingToken.IsCancellationRequested)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                if (string.IsNullOrWhiteSpace(_reg.AgentId) || string.IsNullOrWhiteSpace(_reg.Jwt))
                {
                    _log.LogDebug("Agent not registered, attempting registration...");
                    await _reg.EnsureRegisteredAsync(stoppingToken);
                    if (string.IsNullOrWhiteSpace(_reg.AgentId) || string.IsNullOrWhiteSpace(_reg.Jwt))
                    {
                        _log.LogDebug("Skipping heartbeat; agent not registered yet");
                        continue;
                    }
                }

                // Collect heartbeat data with timing
                var collectSw = Stopwatch.StartNew();
                var hb = await _collector.CollectAsync(stoppingToken);
                collectSw.Stop();
                _log.LogPerformanceMetric("HeartbeatCollection", collectSw.ElapsedMilliseconds, "ms");

                // Send heartbeat to satellite API
                var baseUrl = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200";
                var endpoint = $"{baseUrl}/api/agents/{_reg.AgentId}/heartbeat";
                
                using var req = new HttpRequestMessage(HttpMethod.Post, endpoint)
                { Content = JsonContent.Create(hb) };
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _reg.Jwt);
                
                var apiSw = Stopwatch.StartNew();
                var res = await _http.SendAsync(req, stoppingToken);
                apiSw.Stop();
                
                _log.LogApiCommunication(endpoint, "POST", (int)res.StatusCode, apiSw.Elapsed);
                
                if (!res.IsSuccessStatusCode)
                {
                    var body = await res.Content.ReadAsStringAsync(stoppingToken);
                    _log.LogHeartbeat(_reg.AgentId, false, apiSw.Elapsed, 
                        $"HTTP {(int)res.StatusCode}: {body}");
                }
                else
                {
                    _log.LogHeartbeat(_reg.AgentId, true, apiSw.Elapsed);
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                _log.LogError(ex, "Heartbeat loop error after {Duration:mm\\:ss\\.fff}", sw.Elapsed);
                
                if (_reg.AgentId != null)
                {
                    _log.LogHeartbeat(_reg.AgentId, false, sw.Elapsed, ex.Message);
                }
            }

            try { await Task.Delay(_interval, stoppingToken); } catch { }
        }
        
        _log.LogAgentLifecycle("HeartbeatService Stopped");
    }
}

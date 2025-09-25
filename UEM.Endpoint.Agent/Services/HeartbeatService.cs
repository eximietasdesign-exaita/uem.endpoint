using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using UEM.Endpoint.Agent.Data.Services;

namespace UEM.Endpoint.Agent.Services;

public sealed class HeartbeatService : BackgroundService
{
    private readonly ILogger<HeartbeatService> _log;
    private readonly HeartbeatCollector _collector;
    private readonly AgentRegistrationService _reg;
    private readonly IServiceProvider _serviceProvider;
    private readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(15) };
    private readonly TimeSpan _interval;

    public HeartbeatService(ILogger<HeartbeatService> log, HeartbeatCollector collector, 
        AgentRegistrationService reg, IConfiguration cfg, IServiceProvider serviceProvider)
    {
        _log = log; _collector = collector; _reg = reg; _serviceProvider = serviceProvider;
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

                // Store heartbeat data in SQLite database first
                int heartbeatId = 0;
                using (var scope = _serviceProvider.CreateScope())
                {
                    var agentDataService = scope.ServiceProvider.GetRequiredService<AgentDataService>();
                    heartbeatId = await agentDataService.StoreHeartbeatAsync(
                        _reg.AgentId!, 
                        hb.UniqueId ?? Environment.MachineName,
                        hb.SerialNumber,
                        hb.Hostname ?? Environment.MachineName,
                        hb.IpAddress,
                        hb.MacAddress,
                        hb.AgentVersion
                    );
                }

                // Send heartbeat to satellite API
                var baseUrl = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200";
                var endpoint = $"{baseUrl}/api/agents/{_reg.AgentId}/heartbeat";
                
                using var req = new HttpRequestMessage(HttpMethod.Post, endpoint)
                { Content = JsonContent.Create(hb) };
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _reg.Jwt);
                
                var apiSw = Stopwatch.StartNew();
                var res = await _http.SendAsync(req, stoppingToken);
                apiSw.Stop();
                
                // Update SQLite record with server response
                using (var scope = _serviceProvider.CreateScope())
                {
                    var agentDataService = scope.ServiceProvider.GetRequiredService<AgentDataService>();
                    var responseBody = res.IsSuccessStatusCode ? null : await res.Content.ReadAsStringAsync(stoppingToken);
                    await agentDataService.MarkHeartbeatSentAsync(heartbeatId, (int)res.StatusCode, responseBody);
                    
                    // Also log the API communication
                    await agentDataService.LogApiCommunicationAsync(
                        _reg.AgentId!,
                        endpoint,
                        "POST",
                        hb,
                        responseBody,
                        (int)res.StatusCode,
                        res.IsSuccessStatusCode,
                        (int)apiSw.ElapsedMilliseconds,
                        res.IsSuccessStatusCode ? null : responseBody
                    );
                }
                
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

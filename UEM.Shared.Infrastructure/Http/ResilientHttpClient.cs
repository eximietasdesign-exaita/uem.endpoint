// ResilientHttpClient.cs
using Serilog;
using Polly;
using Polly.Contrib.WaitAndRetry;
using System.Net.Http.Headers;

public sealed class ResilientHttpClient
{
    private readonly HttpClient _client;
    private readonly ILogger _log;

    public ResilientHttpClient(HttpClient client, ILogger? log = null)
    {
        _client = client;
        _log = log ?? Log.Logger;
    }

    public async Task<HttpResponseMessage> PostAsync(string url, HttpContent content, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
        InjectCorrelation(req);
        return await SendWithRetry(req, ct);
    }

    public async Task<HttpResponseMessage> GetAsync(string url, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        InjectCorrelation(req);
        return await SendWithRetry(req, ct);
    }

    private void InjectCorrelation(HttpRequestMessage req)
    {
        // pass-through correlation if upstream set it
        var cid = System.Diagnostics.Activity.Current?.Id ?? Guid.NewGuid().ToString("n");
        req.Headers.TryAddWithoutValidation("X-Correlation-Id", cid);
        req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    private async Task<HttpResponseMessage> SendWithRetry(HttpRequestMessage req, CancellationToken ct)
    {
        var delays = Backoff.DecorrelatedJitterBackoffV2(TimeSpan.FromMilliseconds(200), retryCount: 6, fastFirst: true);
        var policy = Policy<HttpResponseMessage>
            .Handle<HttpRequestException>()
            .OrResult(r => (int)r.StatusCode >= 500 || (int)r.StatusCode == 429)
            .WaitAndRetryAsync(delays, (outcome, delay, attempt, _) =>
                _log.Warning("HTTP retry {Attempt} in {Delay} for {Method} {Uri}. Reason: {Reason}",
                    attempt, delay, req.Method, req.RequestUri, outcome.Exception?.Message ?? outcome.Result.StatusCode.ToString()));

        _log.Information("HTTP {Method} {Uri}", req.Method, req.RequestUri);
        var res = await policy.ExecuteAsync(ct2 => _client.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct2), ct);
        _log.Information("HTTP {Status} {Method} {Uri}", (int)res.StatusCode, req.Method, req.RequestUri);
        return res;
    }
}

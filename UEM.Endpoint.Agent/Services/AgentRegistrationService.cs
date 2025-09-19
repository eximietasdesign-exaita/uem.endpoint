using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using UEM.Shared.Infrastructure.Identity;

namespace UEM.Endpoint.Agent.Services;

public sealed class AgentRegistrationService
{
    public string? AgentId { get; private set; }
    public string? Jwt { get; private set; }

    private readonly HttpClient _http;

    public AgentRegistrationService()
    {
        var handler = new SocketsHttpHandler
        {
            // keep connections healthy
            PooledConnectionIdleTimeout = TimeSpan.FromMinutes(2),
            KeepAlivePingPolicy = HttpKeepAlivePingPolicy.Always,
            KeepAlivePingDelay = TimeSpan.FromSeconds(15),
            KeepAlivePingTimeout = TimeSpan.FromSeconds(5),
            // accept self-signed in dev
            SslOptions = new System.Net.Security.SslClientAuthenticationOptions
            {
                RemoteCertificateValidationCallback = (_, __, ___, ____) => true
            }
        };
        _http = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(30) };
    }

    public async Task EnsureRegisteredAsync(CancellationToken ct)
    {
        var raw = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL");
        var baseUrl = string.IsNullOrWhiteSpace(raw) ? "https://localhost:7200" : raw.Trim().Trim('"', '\'');

        if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri))
            throw new InvalidOperationException($"Invalid SATELLITE_BASE_URL: {baseUrl}");

        try
        {
            await RegisterAgainst(uri, ct);
        }
        catch (Exception)
        {
            // any failure on HTTPS → try HTTP same host/port (dev convenience)
            if (uri.Scheme == Uri.UriSchemeHttps)
            {
                var http = new UriBuilder(uri) { Scheme = "http", Port = uri.Port == 443 ? 80 : uri.Port }.Uri;
                await RegisterAgainst(http, ct);
                Environment.SetEnvironmentVariable("SATELLITE_BASE_URL", http.ToString());
            }
            else { throw; }
        }
    }

    private async Task RegisterAgainst(Uri baseUri, CancellationToken ct)
    {
        var requestUri = new Uri(baseUri, "/api/agents/register");

        var req = new HttpRequestMessage(HttpMethod.Post, requestUri)
        {
            Version = new Version(1, 1), // force HTTP/1.1
            VersionPolicy = HttpVersionPolicy.RequestVersionOrLower,
            Content = JsonContent.Create(new
            {
                encryptedKey = "bootstrap-demo",
                hardwareFingerprint = HardwareFingerprint.Collect()
            })
        };

        using var res = await _http.SendAsync(req, ct);
        res.EnsureSuccessStatusCode();

        var reg = await res.Content.ReadFromJsonAsync<RegisterResponse>(cancellationToken: ct)
                  ?? throw new InvalidOperationException("Invalid register response");

        AgentId = reg.agentId;
        Jwt = reg.jwt;
    }

    private record RegisterResponse(string agentId, string jwt, string refreshToken);
}

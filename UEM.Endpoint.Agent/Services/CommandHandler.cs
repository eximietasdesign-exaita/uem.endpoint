using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;

namespace UEM.Endpoint.Agent.Services;

public sealed class CommandHandler
{
    private readonly HttpClient _http;
    private readonly string _satBase;
    private readonly string _agentId;

    public CommandHandler(string satelliteBaseUrl, string agentId)
    {
        _satBase = satelliteBaseUrl.Trim().TrimEnd('/');
        _agentId = agentId;

        var handler = new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback =
                HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        };
        _http = new HttpClient(handler) { Timeout = TimeSpan.FromMinutes(2) };
    }

    public async Task HandleAsync(CommandMessage cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            object result = cmd.Type switch
            {
                "run-shell" => await RunShellAsync(cmd.PayloadJson, ct),
                _ => new { message = $"unknown command type '{cmd.Type}'" }
            };

            await PostResultAsync(cmd.Id, "ok", result, sw.ElapsedMilliseconds, ct);
        }
        catch (Exception ex)
        {
            await PostResultAsync(cmd.Id, "error", new { error = ex.Message }, sw.ElapsedMilliseconds, ct);
        }
    }

    private static async Task<object> RunShellAsync(string payloadJson, CancellationToken ct)
    {
        var payload = JsonSerializer.Deserialize<RunShellPayload>(payloadJson) ?? new();
        var shell = payload.Shell ?? (OperatingSystem.IsWindows() ? "cmd.exe" : "/bin/bash");
        var args = OperatingSystem.IsWindows() ? $"/c {payload.Command}" : $"-lc \"{payload.Command}\"";

        var psi = new ProcessStartInfo
        {
            FileName = shell,
            Arguments = args,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };

        using var p = Process.Start(psi)!;
        var stdout = await p.StandardOutput.ReadToEndAsync(ct);
        var stderr = await p.StandardError.ReadToEndAsync(ct);
        await p.WaitForExitAsync(ct);

        return new { exitCode = p.ExitCode, stdout, stderr };
    }

    private record RunShellPayload(string Command = "", string? Shell = null);

    private async Task PostResultAsync(string commandId, string status, object output, long durationMs, CancellationToken ct)
    {
        var uri = $"{_satBase}/api/agents/{_agentId}/responses";
        var body = new { commandId, status, output, durationMs };
        using var content = JsonContent.Create(body);
        var res = await _http.PostAsync(uri, content, ct);
        res.EnsureSuccessStatusCode();
    }
}

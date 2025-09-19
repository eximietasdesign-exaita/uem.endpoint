using ScriptExecLib.Models;
using System.Diagnostics;
namespace ScriptExecLib.Utils;
internal static class ProcessRunner
{
    public static async Task<ExecResult> RunAsync(string fileName, string arguments, ExecRequest req, CancellationToken ct)
    {
        var start = DateTimeOffset.UtcNow;
        using var p = new Process();
        p.StartInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
            WorkingDirectory = req.WorkingDirectory ?? Environment.CurrentDirectory
        };
        if (req.Environment is not null)
            foreach (var kv in req.Environment) p.StartInfo.Environment[kv.Key] = kv.Value;
        try
        {
            p.Start();
            var to = req.Timeout ?? TimeSpan.FromMinutes(5);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(to);
            var stdOutTask = p.StandardOutput.ReadToEndAsync(cts.Token);
            var stdErrTask = p.StandardError.ReadToEndAsync(cts.Token);
            await Task.WhenAll(Task.Run(() => p.WaitForExit(), cts.Token));
            return new ExecResult
            {
                ExitCode = p.ExitCode,
                StdOut = await stdOutTask ?? string.Empty,
                StdErr = req.CaptureStdErr ? (await stdErrTask ?? string.Empty) : string.Empty,
                TimedOut = false,
                Error = null,
                StartedAt = start,
                EndedAt = DateTimeOffset.UtcNow
            };
        }
        catch (OperationCanceledException oce)
        {
            TryKill(p);
            return new ExecResult
            {
                ExitCode = -1,
                StdOut = string.Empty,
                StdErr = string.Empty,
                TimedOut = true,
                Error = new ErrorInfo { Type = oce.GetType().Name, Message = oce.Message, StackTrace = oce.StackTrace },
                StartedAt = start,
                EndedAt = DateTimeOffset.UtcNow
            };
        }
        catch (Exception ex)
        {
            TryKill(p);
            return new ExecResult
            {
                ExitCode = -1,
                StdOut = string.Empty,
                StdErr = string.Empty,
                TimedOut = false,
                Error = new ErrorInfo { Type = ex.GetType().Name, Message = ex.Message, StackTrace = ex.StackTrace },
                StartedAt = start,
                EndedAt = DateTimeOffset.UtcNow
            };
        }
    }
    private static void TryKill(Process p) { try { if (!p.HasExited) p.Kill(true); } catch { } }
}

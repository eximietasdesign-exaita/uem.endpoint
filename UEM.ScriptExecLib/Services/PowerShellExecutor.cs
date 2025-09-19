using System;
using System.Linq;                                // ✅ needed for Select(...)
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Management.Automation;               // from Microsoft.PowerShell.SDK
using System.Management.Automation.Runspaces;     // from Microsoft.PowerShell.SDK

using ScriptExecLib.Abstractions;
using ScriptExecLib.Models;
using ScriptExecLib.Utils;

namespace ScriptExecLib.Services
{
    /// <summary>
    /// Hosts PowerShell (Microsoft.PowerShell.SDK) in-process.
    /// Guarded for Windows; returns ExecResult with JSON via ToJson().
    /// </summary>
    public sealed class PowerShellExecutor : IScriptExecutor
    {
        public async Task<ExecResult> ExecuteAsync(ExecRequest request, CancellationToken ct = default)
        {
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return new ExecResult
                {
                    ExitCode = -1,
                    StdOut = string.Empty,
                    StdErr = string.Empty,
                    TimedOut = false,
                    Error = new ErrorInfo
                    {
                        Type = "PlatformNotSupportedException",
                        Message = "PowerShell execution is only supported on Windows via this API."
                    },
                    StartedAt = DateTimeOffset.UtcNow,
                    EndedAt = DateTimeOffset.UtcNow
                };
            }

            var start = DateTimeOffset.UtcNow;

            try
            {
                using var runspace = RunspaceFactory.CreateRunspace();
                runspace.Open();

                using var ps = PowerShell.Create();
                ps.Runspace = runspace;

                // Set working directory if provided
                if (!string.IsNullOrWhiteSpace(request.WorkingDirectory))
                {
                    ps.AddScript($"Set-Location -Path '{EscapeSingleQuotes(request.WorkingDirectory)}'");
                }

                // Set environment variables for the session
                if (request.Environment is not null)
                {
                    foreach (var kv in request.Environment)
                    {
                        var k = kv.Key ?? string.Empty;
                        var v = kv.Value ?? string.Empty;
                        ps.AddScript($"$env:{k} = '{EscapeSingleQuotes(v)}'");
                    }
                }

                // Add the user's command/script as the final step
                ps.AddScript(request.Command ?? string.Empty);

                var timeout = request.Timeout ?? TimeSpan.FromMinutes(5);
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(timeout);

                // Invoke PowerShell on a worker so we can honor cancellation/timeout
                var results = await Task.Run(() => ps.Invoke(), cts.Token).ConfigureAwait(false);

                // Capture errors from the PowerShell streams
                var errors = ps.Streams.Error.ReadAll();

                var stdOut = string.Join(Environment.NewLine, results.Select(r => r?.ToString()));
                var stdErr = string.Join(Environment.NewLine, errors.Select(e => e?.ToString()));

                return new ExecResult
                {
                    ExitCode = ps.HadErrors ? 1 : 0,
                    StdOut = stdOut ?? string.Empty,
                    StdErr = request.CaptureStdErr ? (stdErr ?? string.Empty) : string.Empty,
                    TimedOut = false,
                    Error = null,
                    StartedAt = start,
                    EndedAt = DateTimeOffset.UtcNow
                };
            }
            catch (OperationCanceledException oce)
            {
                // Timeout/cancel
                return new ExecResult
                {
                    ExitCode = -1,
                    StdOut = string.Empty,
                    StdErr = string.Empty,
                    TimedOut = true,
                    Error = new ErrorInfo
                    {
                        Type = oce.GetType().Name,
                        Message = oce.Message,
                        StackTrace = oce.StackTrace
                    },
                    StartedAt = start,
                    EndedAt = DateTimeOffset.UtcNow
                };
            }
            catch (Exception ex)
            {
                return new ExecResult
                {
                    ExitCode = -1,
                    StdOut = string.Empty,
                    StdErr = string.Empty,
                    TimedOut = false,
                    Error = new ErrorInfo
                    {
                        Type = ex.GetType().Name,
                        Message = ex.Message,
                        StackTrace = ex.StackTrace
                    },
                    StartedAt = start,
                    EndedAt = DateTimeOffset.UtcNow
                };
            }
        }

        public string ToJson(ExecResult result) => JsonHelpers.Serialize(result);

        private static string EscapeSingleQuotes(string s) => (s ?? string.Empty).Replace("'", "''");
    }
}

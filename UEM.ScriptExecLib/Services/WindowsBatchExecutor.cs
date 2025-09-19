using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using ScriptExecLib.Abstractions;
using ScriptExecLib.Models;
using ScriptExecLib.Utils;

namespace ScriptExecLib.Services
{
    /// <summary>
    /// Executes Windows batch (.cmd/.bat) scripts. Accepts multi-line content via ExecRequest.Command,
    /// writes to a temporary .cmd file, executes with cmd.exe, and captures output.
    /// </summary>
    public sealed class WindowsBatchExecutor : IScriptExecutor
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
                        Message = "Windows batch execution is only supported on Windows."
                    },
                    StartedAt = DateTimeOffset.UtcNow,
                    EndedAt = DateTimeOffset.UtcNow
                };
            }

            // Normalize newlines to CRLF for cmd.exe and write to a temp .cmd file
            var tmpDir = string.IsNullOrWhiteSpace(request.WorkingDirectory)
                ? Path.GetTempPath()
                : request.WorkingDirectory;

            var fileName = $"batch_{Guid.NewGuid():N}.cmd";
            var tempPath = Path.Combine(tmpDir, fileName);

            // Ensure directory exists
            Directory.CreateDirectory(Path.GetDirectoryName(tempPath)!);

            var content = request.Command ?? string.Empty;
            content = content.Replace("\r\n", "\n").Replace("\r", "\n").Replace("\n", "\r\n");

            // Add a safe header if the user didn't specify one
            if (!content.TrimStart().StartsWith("@echo", StringComparison.OrdinalIgnoreCase))
            {
                content = "@echo off\r\n" + content;
            }

            await File.WriteAllTextAsync(tempPath, content, ct);

            try
            {
                var args = $"/c \"{tempPath}\"";
                var startedAt = DateTimeOffset.UtcNow;
                var result = await ProcessRunner.RunAsync("cmd.exe", args, request, ct).ConfigureAwait(false);
                return result;
            }
            finally
            {
                try { File.Delete(tempPath); } catch { /* ignore */ }
            }
        }

        public string ToJson(ExecResult result) => JsonHelpers.Serialize(result);
    }
}

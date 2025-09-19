using ScriptExecLib.Abstractions;
using ScriptExecLib.Models;
using ScriptExecLib.Utils;
using System.Runtime.InteropServices;
namespace ScriptExecLib.Services;
public sealed class ShellExecutor : IScriptExecutor
{
    public Task<ExecResult> ExecuteAsync(ExecRequest request, CancellationToken ct = default)
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            return ProcessRunner.RunAsync("cmd.exe", $"/c {request.Command}", request, ct);
        var shell = request.UseLoginShell ? "/bin/bash" : "/bin/sh";
        var args = request.UseLoginShell ? $"-lc \"{request.Command}\"" : $"-c \"{request.Command}\"";
        return ProcessRunner.RunAsync(shell, args, request, ct);
    }
    public string ToJson(ExecResult result) => JsonHelpers.Serialize(result);
}

using ScriptExecLib.Abstractions;
using ScriptExecLib.Models;
using ScriptExecLib.Utils;
namespace ScriptExecLib.Services;
public sealed class PythonExecutor : IScriptExecutor
{
    public Task<ExecResult> ExecuteAsync(ExecRequest request, CancellationToken ct = default)
    {
        var python = string.IsNullOrWhiteSpace(request.InterpreterPath) ? "python" : request.InterpreterPath!;
        var args = request.Command.Contains('\n') || request.Command.Contains("import ")
            ? $"-c \"{request.Command.Replace("\"", "\\\"")}\""
            : request.Command;
        return ProcessRunner.RunAsync(python, args, request, ct);
    }
    public string ToJson(ExecResult result) => JsonHelpers.Serialize(result);
}

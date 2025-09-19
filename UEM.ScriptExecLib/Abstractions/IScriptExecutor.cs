namespace ScriptExecLib.Abstractions;
using ScriptExecLib.Models;
public interface IScriptExecutor
{
    Task<ExecResult> ExecuteAsync(ExecRequest request, CancellationToken ct = default);
    string ToJson(ExecResult result);
}

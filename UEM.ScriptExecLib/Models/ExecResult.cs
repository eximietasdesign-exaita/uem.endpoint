using ScriptExecLib.Abstractions;
using System.Text.Json.Serialization;
namespace ScriptExecLib.Models;
public sealed class ExecResult : IJsonResult
{
    public required int ExitCode { get; init; }
    public string StdOut { get; init; } = string.Empty;
    public string StdErr { get; init; } = string.Empty;
    public bool TimedOut { get; init; }
    public ErrorInfo? Error { get; init; }
    public DateTimeOffset StartedAt { get; init; }
    public DateTimeOffset EndedAt { get; init; }
    public TimeSpan Duration => EndedAt - StartedAt;
    [JsonIgnore] public bool Success => ExitCode == 0 && Error is null && !TimedOut;
    public string ToJson() => Utils.JsonHelpers.Serialize(this);
}

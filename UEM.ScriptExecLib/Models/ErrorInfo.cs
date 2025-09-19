namespace ScriptExecLib.Models;
public sealed class ErrorInfo
{
    public required string Type { get; init; }
    public required string Message { get; init; }
    public string? StackTrace { get; init; }
}

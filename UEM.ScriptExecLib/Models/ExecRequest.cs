namespace ScriptExecLib.Models;
public sealed record ExecRequest(
    string Command,
    string? WorkingDirectory = null,
    IReadOnlyDictionary<string, string>? Environment = null,
    TimeSpan? Timeout = null,
    bool CaptureStdErr = true,
    bool UseLoginShell = false,
    string? InterpreterPath = null
);

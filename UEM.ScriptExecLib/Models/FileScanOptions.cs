namespace ScriptExecLib.Models;
public sealed class FileScanOptions
{
    public required string RootPath { get; init; }
    public int MaxDepth { get; init; } = 3;
    public IReadOnlyCollection<string>? IncludeExtensions { get; init; }
    public bool FollowSymlinks { get; init; } = false;
    public bool IncludeHidden { get; init; } = false;
}

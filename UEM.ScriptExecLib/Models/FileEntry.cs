namespace ScriptExecLib.Models;
public sealed class FileEntry
{
    public required string Path { get; init; }
    public required long SizeBytes { get; init; }
    public required DateTimeOffset LastModifiedUtc { get; init; }
    public required bool IsDirectory { get; init; }
}

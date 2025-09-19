namespace ScriptExecLib.Models;
public sealed class RegistryQueryOptions
{
    public required string RootKeyPath { get; init; }
    public int MaxDepth { get; init; } = 2;
    public bool IncludeValues { get; init; } = true;
}

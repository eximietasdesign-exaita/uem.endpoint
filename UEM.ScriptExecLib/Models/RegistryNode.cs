namespace ScriptExecLib.Models;
public sealed class RegistryNode
{
    public required string KeyPath { get; init; }
    public Dictionary<string, object?> Values { get; init; } = new();
    public List<RegistryNode> SubKeys { get; init; } = new();
}

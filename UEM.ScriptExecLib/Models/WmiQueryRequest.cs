namespace ScriptExecLib.Models;
public sealed record WmiQueryRequest(string Query, string? Namespace = "root/cimv2", TimeSpan? Timeout = null);

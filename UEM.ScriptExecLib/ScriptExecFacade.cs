namespace ScriptExecLib;
using ScriptExecLib.Models;
using ScriptExecLib.Services;

public enum ScriptType
{
    PowerShell,
    Batch,
    Python,
    Shell,
    Wmi,
    Registry,
    FileSystem
}

public sealed class ScriptExecFacade
{
    private readonly PowerShellExecutor _ps = new();
    private readonly ShellExecutor _sh = new();
    private readonly PythonExecutor _py = new();
    private readonly WmiQueryService _wmi = new();
    private readonly RegistryQueryService _reg = new();
    private readonly FileSystemScanner _fs = new();
    private readonly WindowsBatchExecutor _bat = new();

    public async Task<object?> ExecuteAsync(ScriptType type, object request, CancellationToken ct = default)
    {
        return type switch
        {
            ScriptType.PowerShell => await _ps.ExecuteAsync((ExecRequest)request, ct),
            ScriptType.Batch => await _bat.ExecuteAsync((ExecRequest)request, ct),
            ScriptType.Python => await _py.ExecuteAsync((ExecRequest)request, ct),
            ScriptType.Shell => await _sh.ExecuteAsync((ExecRequest)request, ct),
            ScriptType.Wmi => await _wmi.QueryAsync((WmiQueryRequest)request, ct),
            ScriptType.Registry => _reg.QueryAsJson((RegistryQueryOptions)request),
            ScriptType.FileSystem => await _fs.ScanAsync((FileScanOptions)request, ct),
            _ => throw new NotSupportedException($"Script type {type} is not supported.")
        };
    }

    public Task<Models.ExecResult> RunPowerShellAsync(ExecRequest req, CancellationToken ct = default) => _ps.ExecuteAsync(req, ct);
    public Task<Models.ExecResult> RunShellAsync(ExecRequest req, CancellationToken ct = default) => _sh.ExecuteAsync(req, ct);
    public Task<Models.ExecResult> RunPythonAsync(ExecRequest req, CancellationToken ct = default) => _py.ExecuteAsync(req, ct);
    public Task<string> RunWmiAsync(WmiQueryRequest req, CancellationToken ct = default) => _wmi.QueryAsync(req, ct);
    public string QueryRegistryAsJson(RegistryQueryOptions options) => _reg.QueryAsJson(options);
    public Task<string> ScanFileSystemAsync(FileScanOptions options, CancellationToken ct = default) => _fs.ScanAsync(options, ct);
    public Task<ExecResult> RunBatchAsync(ExecRequest req, CancellationToken ct = default) => _bat.ExecuteAsync(req, ct);
}

using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

namespace UEM.Endpoint.Agent.Services;

/// <summary>
/// Cross-platform script execution service for policy steps
/// </summary>
public class ScriptExecutionService
{
    private readonly ILogger<ScriptExecutionService> _logger;

    public ScriptExecutionService(ILogger<ScriptExecutionService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Execute a script based on its type and platform
    /// </summary>
    public async Task<ScriptExecutionResult> ExecuteScriptAsync(ScriptExecutionRequest request, CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            _logger.LogInformation("Executing {ScriptType} script with timeout {TimeoutSeconds}s", 
                request.ScriptType, request.TimeoutSeconds);

            var result = request.ScriptType.ToLowerInvariant() switch
            {
                "powershell" => await ExecutePowerShellAsync(request, cancellationToken),
                "bash" => await ExecuteBashAsync(request, cancellationToken),
                "cmd" or "batch" => await ExecuteBatchAsync(request, cancellationToken),
                "python" => await ExecutePythonAsync(request, cancellationToken),
                "shell" => await ExecuteShellAsync(request, cancellationToken),
                "wmi" => await ExecuteWmiQueryAsync(request, cancellationToken),
                _ => new ScriptExecutionResult
                {
                    Success = false,
                    Error = $"Unsupported script type: {request.ScriptType}",
                    ExecutionTimeMs = stopwatch.ElapsedMilliseconds
                }
            };

            result.ExecutionTimeMs = stopwatch.ElapsedMilliseconds;
            
            _logger.LogInformation("Script execution completed in {Duration}ms: Success={Success}, ExitCode={ExitCode}", 
                result.ExecutionTimeMs, result.Success, result.ExitCode);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing {ScriptType} script", request.ScriptType);
            return new ScriptExecutionResult
            {
                Success = false,
                Error = ex.Message,
                ExecutionTimeMs = stopwatch.ElapsedMilliseconds
            };
        }
    }

    /// <summary>
    /// Execute PowerShell script (Windows and cross-platform PowerShell Core)
    /// </summary>
    private async Task<ScriptExecutionResult> ExecutePowerShellAsync(ScriptExecutionRequest request, CancellationToken cancellationToken)
    {
        var executable = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "powershell.exe" : "pwsh";
        var arguments = RuntimeInformation.IsOSPlatform(OSPlatform.Windows) 
            ? "-NoProfile -ExecutionPolicy Bypass -Command -"
            : "-NoProfile -Command -";

        return await ExecuteProcessAsync(executable, arguments, request.ScriptContent, request.TimeoutSeconds, cancellationToken);
    }

    /// <summary>
    /// Execute Bash script (Linux/macOS)
    /// </summary>
    private async Task<ScriptExecutionResult> ExecuteBashAsync(ScriptExecutionRequest request, CancellationToken cancellationToken)
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            // Try WSL or Git Bash on Windows
            var bashPath = FindBashOnWindows();
            if (bashPath != null)
            {
                return await ExecuteProcessAsync(bashPath, "-c", request.ScriptContent, request.TimeoutSeconds, cancellationToken);
            }
            else
            {
                return new ScriptExecutionResult
                {
                    Success = false,
                    Error = "Bash not available on this Windows system"
                };
            }
        }
        
        return await ExecuteProcessAsync("/bin/bash", "-c", request.ScriptContent, request.TimeoutSeconds, cancellationToken);
    }

    /// <summary>
    /// Execute Windows batch script
    /// </summary>
    private async Task<ScriptExecutionResult> ExecuteBatchAsync(ScriptExecutionRequest request, CancellationToken cancellationToken)
    {
        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return new ScriptExecutionResult
            {
                Success = false,
                Error = "Batch scripts are only supported on Windows"
            };
        }

        return await ExecuteProcessAsync("cmd.exe", "/c", request.ScriptContent, request.TimeoutSeconds, cancellationToken);
    }

    /// <summary>
    /// Execute Python script
    /// </summary>
    private async Task<ScriptExecutionResult> ExecutePythonAsync(ScriptExecutionRequest request, CancellationToken cancellationToken)
    {
        var pythonExecutable = FindPythonExecutable();
        if (pythonExecutable == null)
        {
            return new ScriptExecutionResult
            {
                Success = false,
                Error = "Python interpreter not found"
            };
        }

        return await ExecuteProcessAsync(pythonExecutable, "-c", request.ScriptContent, request.TimeoutSeconds, cancellationToken);
    }

    /// <summary>
    /// Execute shell script (adaptive based on platform)
    /// </summary>
    private async Task<ScriptExecutionResult> ExecuteShellAsync(ScriptExecutionRequest request, CancellationToken cancellationToken)
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return await ExecuteBatchAsync(request, cancellationToken);
        }
        else
        {
            return await ExecuteBashAsync(request, cancellationToken);
        }
    }

    /// <summary>
    /// Execute WMI query (Windows only)
    /// </summary>
    private async Task<ScriptExecutionResult> ExecuteWmiQueryAsync(ScriptExecutionRequest request, CancellationToken cancellationToken)
    {
        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return new ScriptExecutionResult
            {
                Success = false,
                Error = "WMI queries are only supported on Windows"
            };
        }

        // Execute WMI query via PowerShell
        var wmiScript = $"Get-WmiObject -Query \"{request.ScriptContent}\" | ConvertTo-Json -Depth 10";
        var powerShellRequest = new ScriptExecutionRequest
        {
            ScriptType = "powershell",
            ScriptContent = wmiScript,
            TimeoutSeconds = request.TimeoutSeconds,
            Parameters = request.Parameters
        };

        return await ExecutePowerShellAsync(powerShellRequest, cancellationToken);
    }

    /// <summary>
    /// Execute process with timeout and input handling
    /// </summary>
    private async Task<ScriptExecutionResult> ExecuteProcessAsync(
        string fileName, 
        string arguments, 
        string input, 
        int timeoutSeconds, 
        CancellationToken cancellationToken)
    {
        using var process = new Process();
        var outputBuilder = new StringBuilder();
        var errorBuilder = new StringBuilder();

        process.StartInfo = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            UseShellExecute = false,
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8
        };

        // Handle environment variables from parameters
        if (fileName.Contains("powershell") || fileName.Contains("pwsh"))
        {
            process.StartInfo.Environment["PSModulePath"] = Environment.GetEnvironmentVariable("PSModulePath") ?? "";
        }

        var outputCompleted = new TaskCompletionSource<bool>();
        var errorCompleted = new TaskCompletionSource<bool>();

        process.OutputDataReceived += (sender, e) =>
        {
            if (e.Data != null)
            {
                outputBuilder.AppendLine(e.Data);
            }
            else
            {
                outputCompleted.SetResult(true);
            }
        };

        process.ErrorDataReceived += (sender, e) =>
        {
            if (e.Data != null)
            {
                errorBuilder.AppendLine(e.Data);
            }
            else
            {
                errorCompleted.SetResult(true);
            }
        };

        try
        {
            _logger.LogDebug("Starting process: {FileName} {Arguments}", fileName, arguments);
            
            if (!process.Start())
            {
                return new ScriptExecutionResult
                {
                    Success = false,
                    Error = $"Failed to start process: {fileName}"
                };
            }

            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            // Send script content to stdin
            if (!string.IsNullOrEmpty(input))
            {
                await process.StandardInput.WriteAsync(input);
                await process.StandardInput.FlushAsync();
                process.StandardInput.Close();
            }

            // Wait for completion with timeout
            using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSeconds));
            using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            try
            {
                await process.WaitForExitAsync(combinedCts.Token);
                await Task.WhenAll(outputCompleted.Task, errorCompleted.Task).WaitAsync(combinedCts.Token);
            }
            catch (OperationCanceledException)
            {
                if (!process.HasExited)
                {
                    _logger.LogWarning("Process timed out or was cancelled, killing process");
                    process.Kill(entireProcessTree: true);
                    
                    return new ScriptExecutionResult
                    {
                        Success = false,
                        Error = timeoutCts.Token.IsCancellationRequested ? "Script execution timed out" : "Script execution was cancelled",
                        Output = outputBuilder.ToString(),
                        ExitCode = -1
                    };
                }
            }

            var output = outputBuilder.ToString();
            var error = errorBuilder.ToString();
            var exitCode = process.ExitCode;

            return new ScriptExecutionResult
            {
                Success = exitCode == 0,
                ExitCode = exitCode,
                Output = output,
                Error = string.IsNullOrEmpty(error) ? null : error
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing process {FileName}", fileName);
            return new ScriptExecutionResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }

    /// <summary>
    /// Find Bash on Windows (WSL, Git Bash, etc.)
    /// </summary>
    private string? FindBashOnWindows()
    {
        var bashPaths = new[]
        {
            @"C:\Windows\System32\bash.exe", // WSL
            @"C:\Program Files\Git\bin\bash.exe", // Git Bash
            @"C:\Program Files (x86)\Git\bin\bash.exe", // Git Bash (x86)
            @"C:\msys64\usr\bin\bash.exe", // MSYS2
            @"C:\cygwin64\bin\bash.exe", // Cygwin
            @"C:\cygwin\bin\bash.exe" // Cygwin (32-bit)
        };

        return bashPaths.FirstOrDefault(File.Exists);
    }

    /// <summary>
    /// Find Python executable
    /// </summary>
    private string? FindPythonExecutable()
    {
        var pythonExecutables = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
            ? new[] { "python.exe", "python3.exe", "py.exe" }
            : new[] { "python3", "python" };

        foreach (var executable in pythonExecutables)
        {
            try
            {
                using var process = new Process();
                process.StartInfo = new ProcessStartInfo
                {
                    FileName = executable,
                    Arguments = "--version",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                if (process.Start())
                {
                    process.WaitForExit(5000); // 5 second timeout
                    if (process.ExitCode == 0)
                    {
                        return executable;
                    }
                }
            }
            catch
            {
                // Continue to next executable
            }
        }

        return null;
    }

    /// <summary>
    /// Get supported script types for current platform
    /// </summary>
    public List<string> GetSupportedScriptTypes()
    {
        var supportedTypes = new List<string> { "shell" };

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            supportedTypes.AddRange(new[] { "powershell", "cmd", "batch", "wmi" });
            
            // Check for PowerShell Core
            if (File.Exists("pwsh.exe") || File.Exists("/usr/bin/pwsh"))
            {
                supportedTypes.Add("pwsh");
            }
        }
        else
        {
            supportedTypes.Add("bash");
            
            // Check for PowerShell Core on Linux/macOS
            if (File.Exists("/usr/bin/pwsh") || File.Exists("/usr/local/bin/pwsh"))
            {
                supportedTypes.Add("powershell");
            }
        }

        // Check for Python
        if (FindPythonExecutable() != null)
        {
            supportedTypes.Add("python");
        }

        return supportedTypes;
    }
}
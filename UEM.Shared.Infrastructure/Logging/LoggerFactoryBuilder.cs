using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;
using Serilog.Extensions.Logging;

namespace UEM.Shared.Infrastructure.Logging;

public static class LoggerFactoryBuilder
{
    public static ILoggerFactory Create(string logDir, LogEventLevel level)
    {
        Directory.CreateDirectory(logDir);

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Is(level)
            .WriteTo.File(
                Path.Combine(logDir, "uem-.log"),
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14
            )
            .WriteTo.Console()
            .CreateLogger();

        return LoggerFactory.Create(builder => builder.AddSerilog());
    }
}
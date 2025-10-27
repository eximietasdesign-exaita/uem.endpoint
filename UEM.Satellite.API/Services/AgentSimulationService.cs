using UEM.Satellite.API.DTOs;
using System.Text.Json;

namespace UEM.Satellite.API.Services;

public class AgentSimulationService : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AgentSimulationService> _logger;
    private Timer? _timer;
    private readonly Random _random = new();
    private readonly string[] _simulatedAgents = ["uem-simulation-001", "uem-simulation-002", "uem-simulation-003"];

    public AgentSimulationService(IServiceProvider serviceProvider, ILogger<AgentSimulationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Agent Simulation Service starting");
        
        // Register simulated agents and start sending heartbeats every 30 seconds
        _ = Task.Run(async () => await InitializeSimulatedAgents(), cancellationToken);
        _timer = new Timer(SendSimulatedHeartbeats, null, TimeSpan.Zero, TimeSpan.FromSeconds(30));
        
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Agent Simulation Service stopping");
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    private async Task InitializeSimulatedAgents()
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var agentRepository = scope.ServiceProvider.GetRequiredService<Data.Repositories.IAgentRepository>();

            for (int i = 0; i < _simulatedAgents.Length; i++)
            {
                var registrationRequest = CreateSimulatedAgentRegistration(i);
                await agentRepository.RegisterAgentAsync(registrationRequest);
                _logger.LogInformation("Simulated agent {AgentId} registered", _simulatedAgents[i]);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize simulated agents");
        }
    }

    private async void SendSimulatedHeartbeats(object? state)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var heartbeatRepository = scope.ServiceProvider.GetRequiredService<Data.Repositories.IEnhancedHeartbeatRepository>();

            foreach (var agentId in _simulatedAgents)
            {
                var heartbeat = CreateSimulatedHeartbeat();
                await heartbeatRepository.UpsertHeartbeatAsync(agentId, heartbeat);
            }

            _logger.LogInformation("Sent simulated heartbeats for {Count} agents", _simulatedAgents.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send simulated heartbeats");
        }
    }

    private AgentRegistrationRequest CreateSimulatedAgentRegistration(int index)
    {
        var hostnames = new[] { "CORP-WS001", "CORP-SRV002", "CORP-LAP003" };
        var oses = new[] { "Windows 11 Pro", "Windows Server 2022", "Windows 10 Enterprise" };
        var architectures = new[] { "x64", "x64", "x64" };

        return new AgentRegistrationRequest(
            $"mock-encrypted-key-{index}",
            $"HW-SIM-{index:D3}-{Guid.NewGuid():N}",
            hostnames[index % hostnames.Length],
            $"192.168.1.{100 + index}",
            $"00:1A:2B:3C:4D:{index:X2}",
            oses[index % oses.Length],
            "10.0.22621",
            architectures[index % architectures.Length],
            "CORPORATE.LOCAL",
            "1.0.0-simulation"
        );
    }

    private EnhancedHeartbeatRequest CreateSimulatedHeartbeat()
    {
        var baseMemory = 16L * 1024 * 1024 * 1024; // 16GB
        var baseDisk = 500L * 1024 * 1024 * 1024; // 500GB

        return new EnhancedHeartbeatRequest(
            _random.NextDouble() * 80 + 5, // 5-85%
            (long)(baseMemory * (_random.NextDouble() * 0.6 + 0.2)), // 20-80% of 16GB
            baseMemory,
            (long)(baseDisk * (_random.NextDouble() * 0.7 + 0.1)), // 10-80% of 500GB
            baseDisk,
            _random.Next(120, 250),
            _random.Next(5, 50),
            _random.NextDouble() * 24 * 30, // 0-30 days
            CreateSimulatedHardware(),
            CreateSimulatedSoftware(),
            CreateSimulatedProcesses(),
            CreateSimulatedNetworkInterfaces()
        );
    }

    private HardwareComponentRequest[] CreateSimulatedHardware()
    {
        var cpus = new[] { "Intel Core i7-12700K", "AMD Ryzen 7 5800X", "Intel Core i5-11600K" };
        var gpus = new[] { "NVIDIA GeForce RTX 3070", "AMD Radeon RX 6700 XT", "NVIDIA GeForce GTX 1660 Ti" };

        return new[]
        {
            new HardwareComponentRequest(
                "CPU",
                "Intel",
                cpus[_random.Next(cpus.Length)],
                $"CPU{_random.Next(100000, 999999)}",
                "1.0",
                8, // 8 cores
                new Dictionary<string, object> { { "Cores", 8 }, { "Threads", 16 }, { "BaseClockGHz", 3.6 } }
            ),
            new HardwareComponentRequest(
                "GPU",
                "NVIDIA",
                gpus[_random.Next(gpus.Length)],
                $"GPU{_random.Next(100000, 999999)}",
                "1.0",
                8L * 1024 * 1024 * 1024, // 8GB VRAM
                new Dictionary<string, object> { { "MemoryGB", 8 }, { "CoreClockMHz", 1725 } }
            ),
            new HardwareComponentRequest(
                "Memory",
                "Corsair",
                "Vengeance DDR4",
                $"MEM{_random.Next(100000, 999999)}",
                "1.0",
                16L * 1024 * 1024 * 1024, // 16GB
                new Dictionary<string, object> { { "SpeedMHz", 3200 }, { "Modules", 2 } }
            )
        };
    }

    private SoftwareItemRequest[] CreateSimulatedSoftware()
    {
        var software = new[]
        {
            new { Name = "Microsoft Office 365", Publisher = "Microsoft Corporation", Type = "Productivity" },
            new { Name = "Google Chrome", Publisher = "Google LLC", Type = "Browser" },
            new { Name = "Visual Studio Code", Publisher = "Microsoft Corporation", Type = "Development" },
            new { Name = "Adobe Acrobat Reader DC", Publisher = "Adobe Inc.", Type = "Utility" },
            new { Name = "Slack", Publisher = "Slack Technologies", Type = "Communication" }
        };

        return software.Select(s => new SoftwareItemRequest(
            s.Name,
            $"{_random.Next(1, 10)}.{_random.Next(0, 10)}.{_random.Next(0, 100)}",
            s.Publisher,
            $"C:\\Program Files\\{s.Name}",
            _random.NextInt64(50 * 1024 * 1024, 2L * 1024 * 1024 * 1024), // 50MB - 2GB
            DateTime.UtcNow.AddDays(-_random.Next(1, 365)),
            s.Type,
            null
        )).ToArray();
    }

    private ProcessInfoRequest[] CreateSimulatedProcesses()
    {
        var processes = new[]
        {
            new { Name = "chrome.exe", User = "CORPORATE\\user1" },
            new { Name = "code.exe", User = "CORPORATE\\user1" },
            new { Name = "outlook.exe", User = "CORPORATE\\user1" },
            new { Name = "svchost.exe", User = "NT AUTHORITY\\SYSTEM" },
            new { Name = "explorer.exe", User = "CORPORATE\\user1" }
        };

        return processes.Select(p => new ProcessInfoRequest(
            _random.Next(1000, 9999),
            p.Name,
            $"C:\\Program Files\\{p.Name}",
            $"\"{p.Name}\" --startup",
            p.User,
            _random.NextInt64(10 * 1024 * 1024, 500 * 1024 * 1024), // 10MB - 500MB
            _random.NextDouble() * 15, // 0-15% CPU
            _random.Next(1, 20),
            DateTime.UtcNow.AddMinutes(-_random.Next(5, 1440)), // Started 5 mins to 24 hours ago
            "Running"
        )).ToArray();
    }

    private NetworkInterfaceRequest[] CreateSimulatedNetworkInterfaces()
    {
        return new[]
        {
            new NetworkInterfaceRequest(
                "Ethernet",
                "Intel(R) Ethernet Connection",
                $"00:1A:2B:3C:4D:{_random.Next(10, 99):X2}",
                $"192.168.1.{_random.Next(100, 200)}",
                "255.255.255.0",
                "192.168.1.1",
                new[] { "8.8.8.8", "8.8.4.4" },
                true,
                "Ethernet",
                _random.NextInt64(1024 * 1024, 1024 * 1024 * 1024), // 1MB - 1GB
                _random.NextInt64(1024 * 1024, 5L * 1024 * 1024 * 1024), // 1MB - 5GB
                1000 // 1Gbps
            )
        };
    }

    public void Dispose()
    {
        _timer?.Dispose();
    }
}
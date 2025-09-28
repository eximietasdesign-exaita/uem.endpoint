using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace UEM.Endpoint.Agent.Services;

public class EnterpriseDiscoveryOrchestrator : BackgroundService
{
    private readonly ILogger<EnterpriseDiscoveryOrchestrator> _logger;
    private readonly IConfiguration _configuration;
    private readonly AgentRegistrationService _registrationService;
    private readonly EnterpriseHardwareDiscoveryService _hardwareDiscovery;
    private readonly EnterpriseSoftwareDiscoveryService _softwareDiscovery;
    private readonly EnterpriseSecurityDiscoveryService _securityDiscovery;
    private readonly HttpClient _httpClient;
    private readonly TimeSpan _discoveryInterval;
    private readonly bool _enablePeriodicDiscovery;

    public EnterpriseDiscoveryOrchestrator(
        ILogger<EnterpriseDiscoveryOrchestrator> logger,
        IConfiguration configuration,
        AgentRegistrationService registrationService,
        EnterpriseHardwareDiscoveryService hardwareDiscovery,
        EnterpriseSoftwareDiscoveryService softwareDiscovery,
        EnterpriseSecurityDiscoveryService securityDiscovery)
    {
        _logger = logger;
        _configuration = configuration;
        _registrationService = registrationService;
        _hardwareDiscovery = hardwareDiscovery;
        _softwareDiscovery = softwareDiscovery;
        _securityDiscovery = securityDiscovery;

        // Configure HTTP client for API communication
        var handler = new SocketsHttpHandler
        {
            PooledConnectionIdleTimeout = TimeSpan.FromMinutes(2),
            KeepAlivePingPolicy = HttpKeepAlivePingPolicy.Always,
            KeepAlivePingDelay = TimeSpan.FromSeconds(15),
            KeepAlivePingTimeout = TimeSpan.FromSeconds(5),
            SslOptions = new System.Net.Security.SslClientAuthenticationOptions
            {
                RemoteCertificateValidationCallback = (_, __, ___, ____) => true
            }
        };

        _httpClient = new HttpClient(handler)
        {
            Timeout = TimeSpan.FromMinutes(5) // Extended timeout for large discovery payloads
        };

        // Configure discovery settings
        _discoveryInterval = TimeSpan.FromHours(_configuration.GetValue<int>("Discovery:IntervalHours", 24));
        _enablePeriodicDiscovery = _configuration.GetValue<bool>("Discovery:EnablePeriodic", true);

        _logger.LogInformation("Enterprise Discovery Orchestrator initialized. Interval: {Interval}, Periodic: {Periodic}",
            _discoveryInterval, _enablePeriodicDiscovery);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Enterprise Discovery Orchestrator starting...");

        // Initial discovery on startup
        await RunDiscoveryAsync(stoppingToken);

        if (!_enablePeriodicDiscovery)
        {
            _logger.LogInformation("Periodic discovery disabled. Discovery orchestrator will only run once on startup.");
            return;
        }

        // Periodic discovery loop
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(_discoveryInterval, stoppingToken);
                await RunDiscoveryAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Discovery orchestrator cancelled");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in discovery orchestrator loop");
                // Continue the loop even if there's an error
            }
        }

        _logger.LogInformation("Enterprise Discovery Orchestrator stopped");
    }

    public async Task<bool> TriggerDiscoveryAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Manual discovery triggered");
        return await RunDiscoveryAsync(cancellationToken);
    }

    private async Task<bool> RunDiscoveryAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting comprehensive enterprise discovery...");

            // Ensure agent is registered
            if (string.IsNullOrWhiteSpace(_registrationService.AgentId))
            {
                _logger.LogWarning("Agent not registered, attempting registration...");
                await _registrationService.EnsureRegisteredAsync(cancellationToken);

                if (string.IsNullOrWhiteSpace(_registrationService.AgentId))
                {
                    _logger.LogError("Agent registration failed, skipping discovery");
                    return false;
                }
            }

            var discoveryData = new ComprehensiveDiscoveryData
            {
                AgentId = _registrationService.AgentId,
                Timestamp = DateTime.UtcNow,
                DiscoveryVersion = "1.0.0"
            };

            // Run discovery components in parallel for better performance
            var hardwareTask = DiscoverHardwareAsync(cancellationToken);
            var softwareTask = DiscoverSoftwareAsync(cancellationToken);
            var securityTask = DiscoverSecurityAsync(cancellationToken);

            await Task.WhenAll(hardwareTask, softwareTask, securityTask);

            discoveryData.Hardware = await hardwareTask;
            discoveryData.Software = await softwareTask;
            discoveryData.Security = await securityTask;

            // Calculate discovery metrics
            discoveryData.DiscoveryMetrics = CalculateDiscoveryMetrics(discoveryData);

            // Send discovery data to Satellite API
            var success = await SendDiscoveryDataAsync(discoveryData, cancellationToken);

            if (success)
            {
                _logger.LogInformation("Enterprise discovery completed successfully. Hardware: {HardwareComponents}, Software: {SoftwareItems}, Security: {SecurityPolicies}",
                    discoveryData.DiscoveryMetrics?.HardwareComponentCount ?? 0,
                    discoveryData.DiscoveryMetrics?.SoftwareItemCount ?? 0,
                    discoveryData.DiscoveryMetrics?.SecurityPolicyCount ?? 0);
            }
            else
            {
                _logger.LogWarning("Discovery completed but failed to send data to API");
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during enterprise discovery");
            return false;
        }
    }

    private async Task<EnterpriseHardwareInfo> DiscoverHardwareAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting hardware discovery...");
            var hardware = await _hardwareDiscovery.DiscoverAsync();
            _logger.LogInformation("Hardware discovery completed");
            return hardware;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Hardware discovery failed");
            return new EnterpriseHardwareInfo { DiscoveryTimestamp = DateTime.UtcNow };
        }
    }

    private async Task<EnterpriseSoftwareInfo> DiscoverSoftwareAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting software discovery...");
            var software = await _softwareDiscovery.DiscoverAsync();
            _logger.LogInformation("Software discovery completed");
            return software;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Software discovery failed");
            return new EnterpriseSoftwareInfo { DiscoveryTimestamp = DateTime.UtcNow };
        }
    }

    private async Task<EnterpriseSecurityInfo> DiscoverSecurityAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting security discovery...");
            var security = await _securityDiscovery.DiscoverAsync();
            _logger.LogInformation("Security discovery completed");
            return security;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Security discovery failed");
            return new EnterpriseSecurityInfo { DiscoveryTimestamp = DateTime.UtcNow };
        }
    }

    private DiscoveryMetrics CalculateDiscoveryMetrics(ComprehensiveDiscoveryData data)
    {
        return new DiscoveryMetrics
        {
            HardwareComponentCount = CalculateHardwareComponentCount(data.Hardware),
            SoftwareItemCount = data.Software?.InstalledPrograms?.Count ?? 0,
            SecurityPolicyCount = CalculateSecurityPolicyCount(data.Security),
            NetworkAdapterCount = data.Hardware?.NetworkAdapters?.Count ?? 0,
            ProcessorCount = data.Hardware?.Processors?.Count ?? 0,
            MemoryModuleCount = data.Hardware?.Memory?.Count ?? 0,
            StorageDeviceCount = data.Hardware?.Storage?.Count ?? 0,
            ServiceCount = data.Software?.Services?.Count ?? 0,
            UserAccountCount = data.Security?.UserAccounts?.Count ?? 0,
            GroupCount = data.Security?.GroupMemberships?.Count ?? 0,
            EncryptedVolumeCount = data.Security?.BitLockerInfo?.Volumes?.Count ?? 0,
            TmpEnabled = data.Security?.TpmInfo?.IsReady ?? false,
            WindowsDefenderEnabled = data.Security?.WindowsDefenderInfo?.AntivirusEnabled ?? false,
            FirewallEnabled = (data.Security?.FirewallStatus?.DomainProfileEnabled ?? false) ||
                             (data.Security?.FirewallStatus?.PrivateProfileEnabled ?? false) ||
                             (data.Security?.FirewallStatus?.PublicProfileEnabled ?? false),
            UacEnabled = data.Security?.UacSettings?.UacEnabled ?? false
        };
    }

    private int CalculateHardwareComponentCount(EnterpriseHardwareInfo? hardware)
    {
        if (hardware == null) return 0;

        var count = 0;
        count += hardware.Processors?.Count ?? 0;
        count += hardware.Memory?.Count ?? 0;
        count += hardware.Storage?.Count ?? 0;
        count += hardware.NetworkAdapters?.Count ?? 0;
        count += hardware.GraphicsAdapters?.Count ?? 0;
        count += hardware.AudioDevices?.Count ?? 0;
        count += hardware.UsbDevices?.Count ?? 0;
        count += hardware.Monitors?.Count ?? 0;
        count += hardware.Printers?.Count ?? 0;

        return count;
    }

    private int CalculateSecurityPolicyCount(EnterpriseSecurityInfo? security)
    {
        if (security == null) return 0;

        var count = 0;
        if (security.TpmInfo != null) count++;
        if (security.BitLockerInfo != null) count++;
        if (security.WindowsDefenderInfo != null) count++;
        if (security.FirewallStatus != null) count++;
        if (security.UacSettings != null) count++;
        if (security.SecurityPolicies != null) count++;
        if (security.WindowsUpdateSettings != null) count++;

        return count;
    }

    private async Task<bool> SendDiscoveryDataAsync(ComprehensiveDiscoveryData data, CancellationToken cancellationToken)
    {
        try
        {
            var baseUrl = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "https://localhost:7200";
            var endpoint = $"{baseUrl}/api/agents/{data.AgentId}/enterprise-discovery";

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };

            var jsonData = JsonSerializer.Serialize(data, jsonOptions);

            using var content = new StringContent(jsonData, System.Text.Encoding.UTF8, "application/json");
            using var request = new HttpRequestMessage(HttpMethod.Post, endpoint) { Content = content };

            if (!string.IsNullOrWhiteSpace(_registrationService.Jwt))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _registrationService.Jwt);
            }

            _logger.LogInformation("Sending discovery data to {Endpoint}. Payload size: {PayloadSize} bytes",
                endpoint, jsonData.Length);

            using var response = await _httpClient.SendAsync(request, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Discovery data sent successfully to Satellite API");
                return true;
            }
            else
            {
                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Failed to send discovery data. Status: {StatusCode}, Response: {Response}",
                    response.StatusCode, responseBody);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending discovery data to API");
            return false;
        }
    }

    public override void Dispose()
    {
        _httpClient?.Dispose();
        base.Dispose();
    }
}

// Comprehensive discovery data model
public class ComprehensiveDiscoveryData
{
    public string? AgentId { get; set; }
    public DateTime Timestamp { get; set; }
    public string? DiscoveryVersion { get; set; }
    public EnterpriseHardwareInfo? Hardware { get; set; }
    public EnterpriseSoftwareInfo? Software { get; set; }
    public EnterpriseSecurityInfo? Security { get; set; }
    public DiscoveryMetrics? DiscoveryMetrics { get; set; }
}

public class DiscoveryMetrics
{
    public int HardwareComponentCount { get; set; }
    public int SoftwareItemCount { get; set; }
    public int SecurityPolicyCount { get; set; }
    public int NetworkAdapterCount { get; set; }
    public int ProcessorCount { get; set; }
    public int MemoryModuleCount { get; set; }
    public int StorageDeviceCount { get; set; }
    public int ServiceCount { get; set; }
    public int UserAccountCount { get; set; }
    public int GroupCount { get; set; }
    public int EncryptedVolumeCount { get; set; }
    public bool TmpEnabled { get; set; }
    public bool WindowsDefenderEnabled { get; set; }
    public bool FirewallEnabled { get; set; }
    public bool UacEnabled { get; set; }
}
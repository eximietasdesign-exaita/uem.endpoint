using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using UEM.Endpoint.Agent.Data.Services;

namespace UEM.Endpoint.Agent.Services;

public class EnterpriseDiscoveryOrchestrator : BackgroundService
{
    private readonly ILogger<EnterpriseDiscoveryOrchestrator> _logger;
    private readonly IConfiguration _configuration;
    private readonly AgentRegistrationService _registrationService;
    private readonly EnterpriseHardwareDiscoveryService _hardwareDiscovery;
    private readonly EnterpriseSoftwareDiscoveryService _softwareDiscovery;
    private readonly EnterpriseSecurityDiscoveryService _securityDiscovery;
    private readonly AgentDataService _agentDataService;
    private readonly HttpClient _httpClient;
    private readonly TimeSpan _discoveryInterval;
    private readonly bool _enablePeriodicDiscovery;

    public EnterpriseDiscoveryOrchestrator(
        ILogger<EnterpriseDiscoveryOrchestrator> logger,
        IConfiguration configuration,
        AgentRegistrationService registrationService,
        EnterpriseHardwareDiscoveryService hardwareDiscovery,
        EnterpriseSoftwareDiscoveryService softwareDiscovery,
        EnterpriseSecurityDiscoveryService securityDiscovery,
        AgentDataService agentDataService)
    {
        _logger = logger;
        _configuration = configuration;
        _registrationService = registrationService;
        _hardwareDiscovery = hardwareDiscovery;
        _softwareDiscovery = softwareDiscovery;
        _securityDiscovery = securityDiscovery;
        _agentDataService = agentDataService;

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
        var discoverySessionId = Guid.NewGuid().ToString();
        _logger.LogInformation("Starting comprehensive enterprise discovery session {DiscoverySessionId}...", discoverySessionId);

        try
        {
            // Step 1: Ensure agent is registered
            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Step 1: Validating agent registration", discoverySessionId);
            if (string.IsNullOrWhiteSpace(_registrationService.AgentId))
            {
                _logger.LogWarning("[Discovery Session {DiscoverySessionId}] Agent not registered, attempting registration...", discoverySessionId);
                await _registrationService.EnsureRegisteredAsync(cancellationToken);

                if (string.IsNullOrWhiteSpace(_registrationService.AgentId))
                {
                    _logger.LogError("[Discovery Session {DiscoverySessionId}] Agent registration failed, aborting discovery", discoverySessionId);
                    return false;
                }
            }
            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Agent registration validated: {AgentId}", discoverySessionId, _registrationService.AgentId);

            var discoveryStartTime = DateTime.UtcNow;
            var discoveryData = new ComprehensiveDiscoveryData
            {
                AgentId = _registrationService.AgentId,
                Timestamp = discoveryStartTime,
                DiscoveryVersion = "1.0.0"
            };

            // Step 2: Run discovery components in parallel for better performance
            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Step 2: Starting parallel discovery processes", discoverySessionId);
            var hardwareTask = DiscoverAndStoreHardwareAsync(discoverySessionId, cancellationToken);
            var softwareTask = DiscoverAndStoreSoftwareAsync(discoverySessionId, cancellationToken);
            var securityTask = DiscoverAndStoreSecurityAsync(discoverySessionId, cancellationToken);

            await Task.WhenAll(hardwareTask, softwareTask, securityTask);

            discoveryData.Hardware = await hardwareTask;
            discoveryData.Software = await softwareTask;
            discoveryData.Security = await securityTask;

            // Step 3: Calculate and log discovery metrics
            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Step 3: Calculating discovery metrics", discoverySessionId);
            discoveryData.DiscoveryMetrics = CalculateDiscoveryMetrics(discoveryData);
            var discoveryTime = DateTime.UtcNow - discoveryStartTime;

            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Local discovery completed in {DiscoveryTime:c}. Hardware: {HardwareComponents}, Software: {SoftwareItems}, Security: {SecurityPolicies}",
                discoverySessionId, discoveryTime, 
                discoveryData.DiscoveryMetrics?.HardwareComponentCount ?? 0,
                discoveryData.DiscoveryMetrics?.SoftwareItemCount ?? 0,
                discoveryData.DiscoveryMetrics?.SecurityPolicyCount ?? 0);

            // Step 4: Send discovery data to Satellite API
            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Step 4: Transmitting discovery data to Satellite API", discoverySessionId);
            var success = await SendDiscoveryDataAsync(discoveryData, discoverySessionId, cancellationToken);

            if (success)
            {
                _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Discovery session completed successfully. Total time: {TotalTime:c}",
                    discoverySessionId, DateTime.UtcNow - discoveryStartTime);
            }
            else
            {
                _logger.LogWarning("[Discovery Session {DiscoverySessionId}] Discovery completed locally but failed to transmit to server. Data preserved in local database.", discoverySessionId);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Discovery Session {DiscoverySessionId}] Critical error during enterprise discovery", discoverySessionId);
            return false;
        }
    }

    private async Task<EnterpriseHardwareInfo> DiscoverAndStoreHardwareAsync(string discoverySessionId, CancellationToken cancellationToken)
    {
        var startTime = DateTime.UtcNow;
        _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Starting hardware discovery and local storage...", discoverySessionId);
        
        try
        {
            // Discover hardware information
            var hardware = await _hardwareDiscovery.DiscoverAsync();
            var discoveryTime = DateTime.UtcNow - startTime;

            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Hardware discovery completed in {DiscoveryTime:c}. Found {ComponentCount} components", 
                discoverySessionId, discoveryTime, CalculateHardwareComponentCount(hardware));

            // Store in local SQLite database
            var storeStartTime = DateTime.UtcNow;
            var recordId = await _agentDataService.StoreHardwareDiscoveryAsync(_registrationService.AgentId!, hardware, discoverySessionId);
            var storeTime = DateTime.UtcNow - storeStartTime;

            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Hardware data stored to local database (Record ID: {RecordId}) in {StoreTime:c}", 
                discoverySessionId, recordId, storeTime);

            return hardware;
        }
        catch (Exception ex)
        {
            var totalTime = DateTime.UtcNow - startTime;
            _logger.LogError(ex, "[Discovery Session {DiscoverySessionId}] Hardware discovery failed after {TotalTime:c}", discoverySessionId, totalTime);
            return new EnterpriseHardwareInfo { DiscoveryTimestamp = DateTime.UtcNow };
        }
    }

    private async Task<EnterpriseSoftwareInfo> DiscoverAndStoreSoftwareAsync(string discoverySessionId, CancellationToken cancellationToken)
    {
        var startTime = DateTime.UtcNow;
        _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Starting software discovery and local storage...", discoverySessionId);
        
        try
        {
            // Discover software information
            var software = await _softwareDiscovery.DiscoverAsync();
            var discoveryTime = DateTime.UtcNow - startTime;
            var softwareCount = software?.InstalledPrograms?.Count ?? 0;

            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Software discovery completed in {DiscoveryTime:c}. Found {SoftwareCount} installed programs", 
                discoverySessionId, discoveryTime, softwareCount);

            // Store in local SQLite database
            var storeStartTime = DateTime.UtcNow;
            var recordId = await _agentDataService.StoreSoftwareDiscoveryAsync(_registrationService.AgentId!, software, softwareCount, discoverySessionId);
            var storeTime = DateTime.UtcNow - storeStartTime;

            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Software data stored to local database (Record ID: {RecordId}) in {StoreTime:c}", 
                discoverySessionId, recordId, storeTime);

            return software;
        }
        catch (Exception ex)
        {
            var totalTime = DateTime.UtcNow - startTime;
            _logger.LogError(ex, "[Discovery Session {DiscoverySessionId}] Software discovery failed after {TotalTime:c}", discoverySessionId, totalTime);
            return new EnterpriseSoftwareInfo { DiscoveryTimestamp = DateTime.UtcNow };
        }
    }

    private async Task<EnterpriseSecurityInfo> DiscoverAndStoreSecurityAsync(string discoverySessionId, CancellationToken cancellationToken)
    {
        var startTime = DateTime.UtcNow;
        _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Starting security discovery and local storage...", discoverySessionId);
        
        try
        {
            // Discover security information
            var security = await _securityDiscovery.DiscoverAsync();
            var discoveryTime = DateTime.UtcNow - startTime;

            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Security discovery completed in {DiscoveryTime:c}. Found {PolicyCount} security policies", 
                discoverySessionId, discoveryTime, CalculateSecurityPolicyCount(security));

            // Store in local SQLite database
            var storeStartTime = DateTime.UtcNow;
            var recordId = await _agentDataService.StoreSecurityDiscoveryAsync(_registrationService.AgentId!, security, discoverySessionId);
            var storeTime = DateTime.UtcNow - storeStartTime;

            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Security data stored to local database (Record ID: {RecordId}) in {StoreTime:c}", 
                discoverySessionId, recordId, storeTime);

            return security;
        }
        catch (Exception ex)
        {
            var totalTime = DateTime.UtcNow - startTime;
            _logger.LogError(ex, "[Discovery Session {DiscoverySessionId}] Security discovery failed after {TotalTime:c}", discoverySessionId, totalTime);
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

    private async Task<bool> SendDiscoveryDataAsync(ComprehensiveDiscoveryData data, string discoverySessionId, CancellationToken cancellationToken)
    {
        var transmitStartTime = DateTime.UtcNow;
        try
        {
            var baseUrl = Environment.GetEnvironmentVariable("SATELLITE_BASE_URL") ?? "http://localhost:8000";
            var endpoint = $"{baseUrl}/api/agents/{data.AgentId}/enterprise-discovery";

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            };

            var jsonData = JsonSerializer.Serialize(data, jsonOptions);
            var payloadSize = System.Text.Encoding.UTF8.GetByteCount(jsonData);

            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Preparing transmission to {Endpoint}. Payload size: {PayloadSize} bytes ({PayloadMB:F2} MB)", 
                discoverySessionId, endpoint, payloadSize, payloadSize / 1024.0 / 1024.0);

            using var content = new StringContent(jsonData, System.Text.Encoding.UTF8, "application/json");
            using var request = new HttpRequestMessage(HttpMethod.Post, endpoint) { Content = content };

            if (!string.IsNullOrWhiteSpace(_registrationService.Jwt))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _registrationService.Jwt);
            }

            // Add custom headers for tracking
            request.Headers.Add("X-Discovery-Session-Id", discoverySessionId);
            request.Headers.Add("X-Agent-Version", "1.0.0");
            
            _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Transmitting discovery data to Satellite API...", discoverySessionId);

            using var response = await _httpClient.SendAsync(request, cancellationToken);
            var transmitTime = DateTime.UtcNow - transmitStartTime;

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[Discovery Session {DiscoverySessionId}] Discovery data transmitted successfully in {TransmitTime:c}. Server responded with {StatusCode}", 
                    discoverySessionId, transmitTime, response.StatusCode);
                
                // Log successful API communication
                await _agentDataService.LogApiCommunicationAsync(
                    data.AgentId!, endpoint, "POST", data, null, 
                    (int)response.StatusCode, true, (int)transmitTime.TotalMilliseconds);
                
                return true;
            }
            else
            {
                var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("[Discovery Session {DiscoverySessionId}] Failed to transmit discovery data after {TransmitTime:c}. Status: {StatusCode}, Response: {Response}",
                    discoverySessionId, transmitTime, response.StatusCode, responseBody);
                
                // Log failed API communication
                await _agentDataService.LogApiCommunicationAsync(
                    data.AgentId!, endpoint, "POST", data, responseBody, 
                    (int)response.StatusCode, false, (int)transmitTime.TotalMilliseconds, responseBody);
                
                return false;
            }
        }
        catch (Exception ex)
        {
            var transmitTime = DateTime.UtcNow - transmitStartTime;
            _logger.LogError(ex, "[Discovery Session {DiscoverySessionId}] Critical error during discovery data transmission after {TransmitTime:c}", 
                discoverySessionId, transmitTime);
            
            // Log failed API communication
            try
            {
                await _agentDataService.LogApiCommunicationAsync(
                    data.AgentId!, "unknown", "POST", data, null, 
                    null, false, (int)transmitTime.TotalMilliseconds, ex.Message);
            }
            catch
            {
                // Ignore errors in error logging to prevent infinite loops
            }
            
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
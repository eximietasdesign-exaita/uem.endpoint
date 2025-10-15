using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Data.Repositories;
using UEM.Satellite.API.DTOs;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/search")]
public class AssetSearchController : ControllerBase
{
    private readonly IHardwareRepository _hardwareRepository;
    private readonly ISoftwareRepository _softwareRepository;
    private readonly IProcessRepository _processRepository;
    private readonly ILogger<AssetSearchController> _logger;

    public AssetSearchController(
        IHardwareRepository hardwareRepository,
        ISoftwareRepository softwareRepository,
        IProcessRepository processRepository,
        ILogger<AssetSearchController> logger)
    {
        _hardwareRepository = hardwareRepository;
        _softwareRepository = softwareRepository;
        _processRepository = processRepository;
        _logger = logger;
    }

    [HttpGet("hardware")]
    public async Task<ActionResult<IReadOnlyList<HardwareComponentResponse>>> SearchHardware(
        [FromQuery] string? type = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(type))
            {
                return BadRequest("Hardware type parameter is required");
            }

            var hardware = await _hardwareRepository.GetHardwareByTypeAsync(type, cancellationToken);
            return Ok(hardware);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search hardware by type {Type}", type);
            return StatusCode(500, "Failed to search hardware");
        }
    }

    [HttpGet("software")]
    public async Task<ActionResult<IReadOnlyList<SoftwareItemResponse>>> SearchSoftware(
        [FromQuery] string? name = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("Software name parameter is required");
            }

            var software = await _softwareRepository.GetSoftwareByNameAsync(name, cancellationToken);
            return Ok(software);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search software by name {Name}", name);
            return StatusCode(500, "Failed to search software");
        }
    }

    [HttpGet("processes")]
    public async Task<ActionResult<IReadOnlyList<ProcessInfoResponse>>> SearchProcesses(
        [FromQuery] string? name = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("Process name parameter is required");
            }

            var processes = await _processRepository.GetProcessesByNameAsync(name, cancellationToken);
            return Ok(processes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search processes by name {Name}", name);
            return StatusCode(500, "Failed to search processes");
        }
    }

    [HttpGet("assets/summary")]
    public async Task<ActionResult<AssetSummaryResponse>> GetAssetSummary(CancellationToken cancellationToken = default)
    {
        try
        {
            // This could be optimized with dedicated summary queries in the future
            var cpuHardware = await _hardwareRepository.GetHardwareByTypeAsync("CPU", cancellationToken);
            var memoryHardware = await _hardwareRepository.GetHardwareByTypeAsync("Memory", cancellationToken);
            var diskHardware = await _hardwareRepository.GetHardwareByTypeAsync("Disk", cancellationToken);

            var summary = new AssetSummaryResponse
            {
                TotalCpuCores = cpuHardware.Count,
                TotalMemoryGB = memoryHardware.Sum(m => m.Capacity ?? 0) / (1024 * 1024 * 1024),
                TotalDiskGB = diskHardware.Sum(d => d.Capacity ?? 0) / (1024 * 1024 * 1024),
                LastUpdated = DateTime.UtcNow
            };

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get asset summary");
            return StatusCode(500, "Failed to get asset summary");
        }
    }
}

public class AssetSummaryResponse
{
    public int TotalCpuCores { get; set; }
    public long TotalMemoryGB { get; set; }
    public long TotalDiskGB { get; set; }
    public DateTime LastUpdated { get; set; }
}
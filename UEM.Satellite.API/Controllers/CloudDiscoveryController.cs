using Microsoft.AspNetCore.Mvc;
using UEM.Satellite.API.Repositories;
using UEM.Satellite.API.Models;
using UEM.Satellite.API.Services.Cloud;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/cloud")]
public class CloudDiscoveryController : ControllerBase
{
    private readonly CloudProvidersRepository _providersRepo;
    private readonly CloudCredentialsRepository _credentialsRepo;
    private readonly CloudDiscoveryJobsRepository _jobsRepo;
    private readonly ILogger<CloudDiscoveryController> _logger;

    public CloudDiscoveryController(
        CloudProvidersRepository providersRepo,
        CloudCredentialsRepository credentialsRepo,
        CloudDiscoveryJobsRepository jobsRepo,
        ILogger<CloudDiscoveryController> logger)
    {
        _providersRepo = providersRepo;
        _credentialsRepo = credentialsRepo;
        _jobsRepo = jobsRepo;
        _logger = logger;
    }

    [HttpGet("providers")]
    public async Task<IActionResult> GetProviders()
    {
        try
        {
            var providers = await _providersRepo.GetAllAsync();
            return Ok(providers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cloud providers");
            return StatusCode(500, new { error = "Failed to fetch cloud providers" });
        }
    }

    [HttpGet("credentials")]
    public async Task<IActionResult> GetCredentials([FromQuery] int? tenantId = null, [FromQuery] int? domainId = null)
    {
        try
        {
            // Return empty list if no tenantId provided
            if (!tenantId.HasValue)
            {
                return Ok(new List<CloudCredential>());
            }
            
            var credentials = await _credentialsRepo.GetByTenantAsync(tenantId.Value, domainId);
            return Ok(credentials);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cloud credentials");
            return StatusCode(500, new { error = "Failed to fetch cloud credentials" });
        }
    }

    [HttpPost("credentials")]
    public async Task<IActionResult> CreateCredential([FromBody] CloudCredential credential)
    {
        try
        {
            var id = await _credentialsRepo.CreateAsync(credential);
            credential.Id = id;
            return CreatedAtAction(nameof(GetCredentialById), new { id }, credential);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating cloud credential");
            return StatusCode(500, new { error = "Failed to create cloud credential" });
        }
    }

    [HttpGet("credentials/{id}")]
    public async Task<IActionResult> GetCredentialById(int id)
    {
        try
        {
            var credential = await _credentialsRepo.GetByIdAsync(id);
            if (credential == null)
            {
                return NotFound(new { error = "Credential not found" });
            }
            return Ok(credential);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cloud credential {Id}", id);
            return StatusCode(500, new { error = "Failed to fetch cloud credential" });
        }
    }

    [HttpPut("credentials/{id}")]
    public async Task<IActionResult> UpdateCredential(int id, [FromBody] CloudCredential credential)
    {
        try
        {
            credential.Id = id;
            await _credentialsRepo.UpdateAsync(credential);
            return Ok(credential);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cloud credential {Id}", id);
            return StatusCode(500, new { error = "Failed to update cloud credential" });
        }
    }

    [HttpDelete("credentials/{id}")]
    public async Task<IActionResult> DeleteCredential(int id)
    {
        try
        {
            await _credentialsRepo.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting cloud credential {Id}", id);
            return StatusCode(500, new { error = "Failed to delete cloud credential" });
        }
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> GetJobs([FromQuery] int? tenantId = null, [FromQuery] int? domainId = null)
    {
        try
        {
            // Return empty list if no tenantId provided
            if (!tenantId.HasValue)
            {
                return Ok(new List<CloudDiscoveryJob>());
            }
            
            var jobs = await _jobsRepo.GetByTenantAsync(tenantId.Value, domainId);
            return Ok(jobs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cloud discovery jobs");
            return StatusCode(500, new { error = "Failed to fetch cloud discovery jobs" });
        }
    }

    [HttpPost("jobs")]
    public async Task<IActionResult> CreateJob([FromBody] CloudDiscoveryJob job)
    {
        try
        {
            var id = await _jobsRepo.CreateAsync(job);
            job.Id = id;
            return CreatedAtAction(nameof(GetJobById), new { id }, job);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating cloud discovery job");
            return StatusCode(500, new { error = "Failed to create cloud discovery job" });
        }
    }

    [HttpGet("jobs/{id}")]
    public async Task<IActionResult> GetJobById(int id)
    {
        try
        {
            var job = await _jobsRepo.GetByIdAsync(id);
            if (job == null)
            {
                return NotFound(new { error = "Job not found" });
            }
            return Ok(job);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cloud discovery job {Id}", id);
            return StatusCode(500, new { error = "Failed to fetch cloud discovery job" });
        }
    }

    [HttpPut("jobs/{id}")]
    public async Task<IActionResult> UpdateJob(int id, [FromBody] CloudDiscoveryJob job)
    {
        try
        {
            job.Id = id;
            await _jobsRepo.UpdateAsync(job);
            return Ok(job);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating cloud discovery job {Id}", id);
            return StatusCode(500, new { error = "Failed to update cloud discovery job" });
        }
    }

    [HttpDelete("jobs/{id}")]
    public async Task<IActionResult> DeleteJob(int id)
    {
        try
        {
            await _jobsRepo.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting cloud discovery job {Id}", id);
            return StatusCode(500, new { error = "Failed to delete cloud discovery job" });
        }
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats([FromQuery] int? tenantId = null, [FromQuery] int? domainId = null)
    {
        try
        {
            var providers = await _providersRepo.GetAllAsync();
            
            // Get credentials and jobs only if tenantId is provided
            var credentialsCount = 0;
            var jobsCount = 0;
            
            if (tenantId.HasValue)
            {
                var credentials = await _credentialsRepo.GetByTenantAsync(tenantId.Value, domainId);
                var jobs = await _jobsRepo.GetByTenantAsync(tenantId.Value, domainId);
                credentialsCount = credentials.Count;
                jobsCount = jobs.Count;
            }

            var stats = new
            {
                providersCount = providers.Count(),
                credentialsCount,
                jobsCount,
                assetsCount = 0 // Will be implemented with cloud assets repository
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching cloud discovery stats");
            return StatusCode(500, new { error = "Failed to fetch cloud discovery stats" });
        }
    }
}

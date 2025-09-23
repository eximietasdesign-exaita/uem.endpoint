using Microsoft.AspNetCore.Mvc;
using Dapper;
using UEM.Satellite.API.Data;
using Npgsql;
using System.ComponentModel.DataAnnotations;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/domains")]
public class DomainsController : ControllerBase
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<DomainsController> _logger;

    public DomainsController(IDbFactory dbFactory, ILogger<DomainsController> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAllDomains()
    {
        try
        {
            using var connection = _dbFactory.Open();
            var domains = await connection.QueryAsync<object>(@"
                SELECT id, name, display_name as displayName, description, parent_domain_id as parentDomainId,
                       is_active as isActive, is_default as isDefault, created_at as createdAt, 
                       updated_at as updatedAt 
                FROM uem_app_domains 
                ORDER BY display_name");
            
            return Ok(domains);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch domains");
            return StatusCode(500, new { message = "Failed to fetch domains" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetDomain(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var domain = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT id, name, display_name as displayName, description, parent_domain_id as parentDomainId,
                       is_active as isActive, is_default as isDefault, created_at as createdAt, 
                       updated_at as updatedAt 
                FROM uem_app_domains 
                WHERE id = @Id", new { Id = id });
            
            if (domain == null)
            {
                return NotFound(new { message = "Domain not found" });
            }
            
            return Ok(domain);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch domain with id {DomainId}", id);
            return StatusCode(500, new { message = "Failed to fetch domain" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateDomain([FromBody] CreateDomainRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var id = await connection.QuerySingleAsync<int>(@"
                INSERT INTO uem_app_domains (name, display_name, description, parent_domain_id, is_active, is_default)
                VALUES (@Name, @DisplayName, @Description, @ParentDomainId, @IsActive, @IsDefault)
                RETURNING id", request);
            
            var domain = await connection.QueryFirstAsync<object>(@"
                SELECT id, name, display_name as displayName, description, parent_domain_id as parentDomainId,
                       is_active as isActive, is_default as isDefault, created_at as createdAt, 
                       updated_at as updatedAt 
                FROM uem_app_domains 
                WHERE id = @Id", new { Id = id });
            
            return CreatedAtAction(nameof(GetDomain), new { id }, domain);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create domain");
            return BadRequest(new { message = "Invalid domain data" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<object>> UpdateDomain(int id, [FromBody] UpdateDomainRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(@"
                UPDATE uem_app_domains 
                SET name = @Name, display_name = @DisplayName, description = @Description, 
                    parent_domain_id = @ParentDomainId, is_active = @IsActive, is_default = @IsDefault,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = @Id", new { Id = id, request.Name, request.DisplayName, request.Description, 
                                     request.ParentDomainId, request.IsActive, request.IsDefault });
            
            var domain = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT id, name, display_name as displayName, description, parent_domain_id as parentDomainId,
                       is_active as isActive, is_default as isDefault, created_at as createdAt, 
                       updated_at as updatedAt 
                FROM uem_app_domains 
                WHERE id = @Id", new { Id = id });
            
            if (domain == null)
            {
                return NotFound(new { message = "Domain not found" });
            }
            
            return Ok(domain);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update domain with id {DomainId}", id);
            return BadRequest(new { message = "Invalid domain data" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteDomain(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var rowsAffected = await connection.ExecuteAsync(@"
                DELETE FROM uem_app_domains WHERE id = @Id", new { Id = id });
            
            if (rowsAffected == 0)
            {
                return NotFound(new { message = "Domain not found" });
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete domain with id {DomainId}", id);
            return StatusCode(500, new { message = "Failed to delete domain" });
        }
    }
}

public record CreateDomainRequest(
    [Required] string Name,
    [Required] string DisplayName,
    string? Description,
    int? ParentDomainId,
    bool IsActive = true,
    bool IsDefault = false
);

public record UpdateDomainRequest(
    string Name,
    string DisplayName,
    string? Description,
    int? ParentDomainId,
    bool? IsActive,
    bool? IsDefault
);
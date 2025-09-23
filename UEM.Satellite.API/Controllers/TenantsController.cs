using Microsoft.AspNetCore.Mvc;
using Dapper;
using UEM.Satellite.API.Data;
using System.ComponentModel.DataAnnotations;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/tenants")]
public class TenantsController : ControllerBase
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<TenantsController> _logger;

    public TenantsController(IDbFactory dbFactory, ILogger<TenantsController> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAllTenants([FromQuery] int? domainId)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var query = @"
                SELECT t.id, t.name, t.display_name as displayName, t.description, t.domain_id as domainId,
                       t.type, t.status, t.is_active as isActive, t.created_by as createdBy,
                       t.created_at as createdAt, t.updated_at as updatedAt,
                       d.name as domainName, d.display_name as domainDisplayName
                FROM uem_app_tenants t
                LEFT JOIN uem_app_domains d ON t.domain_id = d.id";
            
            var parameters = new DynamicParameters();
            
            if (domainId.HasValue)
            {
                query += " WHERE t.domain_id = @DomainId";
                parameters.Add("DomainId", domainId.Value);
            }
            
            query += " ORDER BY t.display_name";
            
            var tenants = await connection.QueryAsync<object>(query, parameters);
            return Ok(tenants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tenants");
            return StatusCode(500, new { message = "Failed to fetch tenants" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetTenant(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var tenant = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT t.id, t.name, t.display_name as displayName, t.description, t.domain_id as domainId,
                       t.type, t.status, t.is_active as isActive, t.created_by as createdBy,
                       t.created_at as createdAt, t.updated_at as updatedAt,
                       d.name as domainName, d.display_name as domainDisplayName
                FROM uem_app_tenants t
                LEFT JOIN uem_app_domains d ON t.domain_id = d.id
                WHERE t.id = @Id", new { Id = id });
            
            if (tenant == null)
            {
                return NotFound(new { message = "Tenant not found" });
            }
            
            return Ok(tenant);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch tenant with id {TenantId}", id);
            return StatusCode(500, new { message = "Failed to fetch tenant" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateTenant([FromBody] CreateTenantRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var id = await connection.QuerySingleAsync<int>(@"
                INSERT INTO uem_app_tenants (name, display_name, description, domain_id, type, status, is_active, created_by)
                VALUES (@Name, @DisplayName, @Description, @DomainId, @Type, @Status, @IsActive, @CreatedBy)
                RETURNING id", request);
            
            var tenant = await connection.QueryFirstAsync<object>(@"
                SELECT t.id, t.name, t.display_name as displayName, t.description, t.domain_id as domainId,
                       t.type, t.status, t.is_active as isActive, t.created_by as createdBy,
                       t.created_at as createdAt, t.updated_at as updatedAt,
                       d.name as domainName, d.display_name as domainDisplayName
                FROM uem_app_tenants t
                LEFT JOIN uem_app_domains d ON t.domain_id = d.id
                WHERE t.id = @Id", new { Id = id });
            
            return CreatedAtAction(nameof(GetTenant), new { id }, tenant);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create tenant");
            return BadRequest(new { message = "Invalid tenant data" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<object>> UpdateTenant(int id, [FromBody] UpdateTenantRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(@"
                UPDATE uem_app_tenants 
                SET name = @Name, display_name = @DisplayName, description = @Description, 
                    domain_id = @DomainId, type = @Type, status = @Status,
                    is_active = @IsActive, updated_at = CURRENT_TIMESTAMP
                WHERE id = @Id", new { Id = id, request.Name, request.DisplayName, request.Description, 
                                     request.DomainId, request.Type, request.Status, request.IsActive });
            
            var tenant = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT t.id, t.name, t.display_name as displayName, t.description, t.domain_id as domainId,
                       t.type, t.status, t.is_active as isActive, t.created_by as createdBy,
                       t.created_at as createdAt, t.updated_at as updatedAt,
                       d.name as domainName, d.display_name as domainDisplayName
                FROM uem_app_tenants t
                LEFT JOIN uem_app_domains d ON t.domain_id = d.id
                WHERE t.id = @Id", new { Id = id });
            
            if (tenant == null)
            {
                return NotFound(new { message = "Tenant not found" });
            }
            
            return Ok(tenant);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update tenant with id {TenantId}", id);
            return BadRequest(new { message = "Invalid tenant data" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTenant(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var rowsAffected = await connection.ExecuteAsync(@"
                DELETE FROM uem_app_tenants WHERE id = @Id", new { Id = id });
            
            if (rowsAffected == 0)
            {
                return NotFound(new { message = "Tenant not found" });
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete tenant with id {TenantId}", id);
            return StatusCode(500, new { message = "Failed to delete tenant" });
        }
    }
}

public record CreateTenantRequest(
    [Required] string Name,
    [Required] string DisplayName,
    string? Description,
    [Required] int DomainId,
    string? Type = "standard",
    string? Status = "active",
    bool IsActive = true,
    int? CreatedBy = null
);

public record UpdateTenantRequest(
    string? Name,
    string? DisplayName,
    string? Description,
    int? DomainId,
    string? Type,
    string? Status,
    bool? IsActive
);
using Microsoft.AspNetCore.Mvc;
using Dapper;
using UEM.Satellite.API.Data;
using System.ComponentModel.DataAnnotations;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/endpoints")]
public class EndpointsController : ControllerBase
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<EndpointsController> _logger;

    public EndpointsController(IDbFactory dbFactory, ILogger<EndpointsController> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetAllEndpoints(
        [FromQuery] int? tenantId = null,
        [FromQuery] int? domainId = null,
        [FromQuery] string? status = null)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var query = @"
                SELECT 
                    e.id, e.name, e.hostname, e.ip_address as ipAddress, e.mac_address as macAddress,
                    e.operating_system as operatingSystem, e.os_version as osVersion, e.status,
                    e.last_seen as lastSeen, e.agent_version as agentVersion, e.tenant_id as tenantId,
                    e.domain_id as domainId, e.created_at as createdAt, e.updated_at as updatedAt,
                    t.name as tenantName, t.display_name as tenantDisplayName,
                    d.name as domainName, d.display_name as domainDisplayName
                FROM uem_app_endpoints e
                LEFT JOIN uem_app_tenants t ON e.tenant_id = t.id
                LEFT JOIN uem_app_domains d ON e.domain_id = d.id";

            var whereConditions = new List<string>();
            var parameters = new DynamicParameters();

            if (tenantId.HasValue)
            {
                whereConditions.Add("e.tenant_id = @TenantId");
                parameters.Add("TenantId", tenantId.Value);
            }

            if (domainId.HasValue)
            {
                whereConditions.Add("e.domain_id = @DomainId");
                parameters.Add("DomainId", domainId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                whereConditions.Add("e.status = @Status");
                parameters.Add("Status", status);
            }

            if (whereConditions.Any())
            {
                query += " WHERE " + string.Join(" AND ", whereConditions);
            }

            query += " ORDER BY e.name";

            var endpoints = await connection.QueryAsync<object>(query, parameters);
            return Ok(endpoints);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch endpoints");
            return StatusCode(500, new { message = "Failed to fetch endpoints" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetEndpoint(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var endpoint = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT 
                    e.id, e.name, e.hostname, e.ip_address as ipAddress, e.mac_address as macAddress,
                    e.operating_system as operatingSystem, e.os_version as osVersion, e.status,
                    e.last_seen as lastSeen, e.agent_version as agentVersion, e.tenant_id as tenantId,
                    e.domain_id as domainId, e.created_at as createdAt, e.updated_at as updatedAt,
                    t.name as tenantName, t.display_name as tenantDisplayName,
                    d.name as domainName, d.display_name as domainDisplayName
                FROM uem_app_endpoints e
                LEFT JOIN uem_app_tenants t ON e.tenant_id = t.id
                LEFT JOIN uem_app_domains d ON e.domain_id = d.id
                WHERE e.id = @Id", new { Id = id });

            if (endpoint == null)
            {
                return NotFound(new { message = "Endpoint not found" });
            }

            return Ok(endpoint);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch endpoint with id {EndpointId}", id);
            return StatusCode(500, new { message = "Failed to fetch endpoint" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateEndpoint([FromBody] CreateEndpointRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var id = await connection.QuerySingleAsync<int>(@"
                INSERT INTO uem_app_endpoints (name, hostname, ip_address, mac_address, operating_system, 
                                             os_version, status, agent_version, tenant_id, domain_id)
                VALUES (@Name, @Hostname, @IpAddress, @MacAddress, @OperatingSystem, 
                        @OsVersion, @Status, @AgentVersion, @TenantId, @DomainId)
                RETURNING id", request);

            var endpoint = await connection.QueryFirstAsync<object>(@"
                SELECT 
                    e.id, e.name, e.hostname, e.ip_address as ipAddress, e.mac_address as macAddress,
                    e.operating_system as operatingSystem, e.os_version as osVersion, e.status,
                    e.last_seen as lastSeen, e.agent_version as agentVersion, e.tenant_id as tenantId,
                    e.domain_id as domainId, e.created_at as createdAt, e.updated_at as updatedAt,
                    t.name as tenantName, t.display_name as tenantDisplayName,
                    d.name as domainName, d.display_name as domainDisplayName
                FROM uem_app_endpoints e
                LEFT JOIN uem_app_tenants t ON e.tenant_id = t.id
                LEFT JOIN uem_app_domains d ON e.domain_id = d.id
                WHERE e.id = @Id", new { Id = id });

            return CreatedAtAction(nameof(GetEndpoint), new { id }, endpoint);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create endpoint");
            return BadRequest(new { message = "Invalid endpoint data" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<object>> UpdateEndpoint(int id, [FromBody] UpdateEndpointRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(@"
                UPDATE uem_app_endpoints 
                SET name = @Name, hostname = @Hostname, ip_address = @IpAddress, mac_address = @MacAddress,
                    operating_system = @OperatingSystem, os_version = @OsVersion, status = @Status,
                    agent_version = @AgentVersion, tenant_id = @TenantId, domain_id = @DomainId,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = @Id", new { Id = id, request.Name, request.Hostname, request.IpAddress, 
                                     request.MacAddress, request.OperatingSystem, request.OsVersion, 
                                     request.Status, request.AgentVersion, request.TenantId, request.DomainId });

            var endpoint = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT 
                    e.id, e.name, e.hostname, e.ip_address as ipAddress, e.mac_address as macAddress,
                    e.operating_system as operatingSystem, e.os_version as osVersion, e.status,
                    e.last_seen as lastSeen, e.agent_version as agentVersion, e.tenant_id as tenantId,
                    e.domain_id as domainId, e.created_at as createdAt, e.updated_at as updatedAt,
                    t.name as tenantName, t.display_name as tenantDisplayName,
                    d.name as domainName, d.display_name as domainDisplayName
                FROM uem_app_endpoints e
                LEFT JOIN uem_app_tenants t ON e.tenant_id = t.id
                LEFT JOIN uem_app_domains d ON e.domain_id = d.id
                WHERE e.id = @Id", new { Id = id });

            if (endpoint == null)
            {
                return NotFound(new { message = "Endpoint not found" });
            }

            return Ok(endpoint);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update endpoint with id {EndpointId}", id);
            return BadRequest(new { message = "Invalid endpoint data" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteEndpoint(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var rowsAffected = await connection.ExecuteAsync(@"
                DELETE FROM uem_app_endpoints WHERE id = @Id", new { Id = id });

            if (rowsAffected == 0)
            {
                return NotFound(new { message = "Endpoint not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete endpoint with id {EndpointId}", id);
            return StatusCode(500, new { message = "Failed to delete endpoint" });
        }
    }
}

public record CreateEndpointRequest(
    [Required] string Name,
    [Required] string Hostname,
    [Required] string IpAddress,
    string? MacAddress,
    [Required] string OperatingSystem,
    string? OsVersion,
    string Status = "offline",
    string? AgentVersion,
    int? TenantId,
    int? DomainId
);

public record UpdateEndpointRequest(
    string? Name,
    string? Hostname,
    string? IpAddress,
    string? MacAddress,
    string? OperatingSystem,
    string? OsVersion,
    string? Status,
    string? AgentVersion,
    int? TenantId,
    int? DomainId
);
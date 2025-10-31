using Microsoft.AspNetCore.Mvc;
using Dapper;
using UEM.Satellite.API.Data;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace UEM.Satellite.API.Controllers
{
    [ApiController]
    [Route("api/discovery-probes")]
    public class DiscoveryProbesController : ControllerBase
    {
        private readonly IDbFactory _dbFactory;
        private readonly ILogger<DiscoveryProbesController> _logger;

        public DiscoveryProbesController(IDbFactory dbFactory, ILogger<DiscoveryProbesController> logger)
        {
            _dbFactory = dbFactory;
            _logger = logger;
        }

        // GET /api/discovery-probes?tenantId=...&domainId=...
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll([FromQuery] int? tenantId = null, [FromQuery] int? domainId = null, CancellationToken cancellationToken = default)
        {
            try
            {
                using var conn = _dbFactory.Open();

                var sql = @"
                    SELECT
                        id,
                        name,
                        description,
                        location,
                        ip_address AS ""ipAddress"",
                        port,
                        status,
                        version,
                        capabilities,
                        created_at AS ""createdAt"",
                        updated_at AS ""updatedAt""
                    FROM uem_app_discovery_probes
                    WHERE (@tenantId IS NULL OR tenant_id = @tenantId)
                      AND (@domainId IS NULL OR domain_id = @domainId)
                    ORDER BY name;
                ";

                var rows = await conn.QueryAsync(new CommandDefinition(sql, new { tenantId, domainId }, cancellationToken: cancellationToken));
                return Ok(rows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load discovery probes");
                return StatusCode(500, new { error = "Failed to load discovery probes" });
            }
        }

        // GET /api/discovery-probes/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<object>> GetById(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                using var conn = _dbFactory.Open();

                var sql = @"
                    SELECT
                        id,
                        name,
                        description,
                        location,
                        ip_address AS ""ipAddress"",
                        port,
                        status,
                        version,
                        capabilities,
                        created_at AS ""createdAt"",
                        updated_at AS ""updatedAt""
                    FROM uem_app_discovery_probes
                    WHERE id = @Id
                    LIMIT 1;
                ";

                var probe = await conn.QuerySingleOrDefaultAsync(new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken));
                if (probe == null) return NotFound(new { error = "Discovery probe not found" });
                return Ok(probe);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load discovery probe id={Id}", id);
                return StatusCode(500, new { error = "Failed to load discovery probe" });
            }
        }
    }
}
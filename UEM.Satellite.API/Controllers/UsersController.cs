using Microsoft.AspNetCore.Mvc;
using Dapper;
using UEM.Satellite.API.Data;
using System.ComponentModel.DataAnnotations;

namespace UEM.Satellite.API.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IDbFactory _dbFactory;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IDbFactory dbFactory, ILogger<UsersController> logger)
    {
        _dbFactory = dbFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 50,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] string? globalRole = null,
        [FromQuery] int? domainId = null,
        [FromQuery] int? tenantId = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "asc")
    {
        try
        {
            // Validate pagination parameters
            if (page < 1 || limit < 1 || limit > 1000)
            {
                return BadRequest(new { message = "Invalid pagination parameters. Page must be >= 1, limit must be between 1-1000" });
            }

            using var connection = _dbFactory.Open();
            
            var whereConditions = new List<string>();
            var parameters = new DynamicParameters();
            
            // Build dynamic WHERE clause
            if (!string.IsNullOrEmpty(search))
            {
                whereConditions.Add("(u.username ILIKE @Search OR u.email ILIKE @Search OR u.full_name ILIKE @Search)");
                parameters.Add("Search", $"%{search}%");
            }
            
            if (!string.IsNullOrEmpty(role))
            {
                whereConditions.Add("u.role = @Role");
                parameters.Add("Role", role);
            }
            
            if (!string.IsNullOrEmpty(globalRole))
            {
                whereConditions.Add("u.global_role = @GlobalRole");
                parameters.Add("GlobalRole", globalRole);
            }
            
            if (domainId.HasValue)
            {
                whereConditions.Add("u.domain_id = @DomainId");
                parameters.Add("DomainId", domainId.Value);
            }
            
            if (tenantId.HasValue)
            {
                whereConditions.Add("u.tenant_id = @TenantId");
                parameters.Add("TenantId", tenantId.Value);
            }
            
            if (isActive.HasValue)
            {
                whereConditions.Add("u.is_active = @IsActive");
                parameters.Add("IsActive", isActive.Value);
            }

            var whereClause = whereConditions.Any() ? "WHERE " + string.Join(" AND ", whereConditions) : "";
            
            // Build ORDER BY clause
            var validSortColumns = new[] { "username", "email", "full_name", "role", "global_role", "created_at", "last_login" };
            var orderByColumn = validSortColumns.Contains(sortBy) ? sortBy : "username";
            var orderByDirection = sortOrder?.ToLower() == "desc" ? "DESC" : "ASC";
            var orderByClause = $"ORDER BY u.{orderByColumn} {orderByDirection}";

            // Get total count
            var countQuery = $@"
                SELECT COUNT(*) 
                FROM uem_app_users u 
                LEFT JOIN uem_app_domains d ON u.domain_id = d.id
                LEFT JOIN uem_app_tenants t ON u.tenant_id = t.id
                {whereClause}";
            
            var total = await connection.QuerySingleAsync<int>(countQuery, parameters);
            var totalPages = (int)Math.Ceiling((double)total / limit);

            // Get paginated users (exclude password)
            parameters.Add("Offset", (page - 1) * limit);
            parameters.Add("Limit", limit);
            
            var usersQuery = $@"
                SELECT 
                    u.id, u.username, u.email, u.full_name as fullName, u.role, u.global_role as globalRole,
                    u.domain_id as domainId, u.tenant_id as tenantId, u.is_active as isActive,
                    u.last_login as lastLogin, u.created_at as createdAt, u.updated_at as updatedAt,
                    d.name as domainName, d.display_name as domainDisplayName,
                    t.name as tenantName, t.display_name as tenantDisplayName
                FROM uem_app_users u
                LEFT JOIN uem_app_domains d ON u.domain_id = d.id
                LEFT JOIN uem_app_tenants t ON u.tenant_id = t.id
                {whereClause}
                {orderByClause}
                OFFSET @Offset LIMIT @Limit";
            
            var users = await connection.QueryAsync<object>(usersQuery, parameters);

            return Ok(new
            {
                users,
                pagination = new
                {
                    page,
                    limit,
                    total,
                    totalPages
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch users");
            return StatusCode(500, new { message = "Failed to fetch users", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetUser(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var user = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT 
                    u.id, u.username, u.email, u.full_name as fullName, u.role, u.global_role as globalRole,
                    u.domain_id as domainId, u.tenant_id as tenantId, u.is_active as isActive,
                    u.last_login as lastLogin, u.created_at as createdAt, u.updated_at as updatedAt,
                    d.name as domainName, d.display_name as domainDisplayName,
                    t.name as tenantName, t.display_name as tenantDisplayName
                FROM uem_app_users u
                LEFT JOIN uem_app_domains d ON u.domain_id = d.id
                LEFT JOIN uem_app_tenants t ON u.tenant_id = t.id
                WHERE u.id = @Id", new { Id = id });
            
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch user with id {UserId}", id);
            return StatusCode(500, new { message = "Failed to fetch user", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            // Check for existing username
            var existingUsername = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT id FROM uem_app_users WHERE username = @Username", new { request.Username });
            if (existingUsername != null)
            {
                return Conflict(new { message = "Username already exists" });
            }
            
            // Check for existing email
            var existingEmail = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT id FROM uem_app_users WHERE email = @Email", new { request.Email });
            if (existingEmail != null)
            {
                return Conflict(new { message = "Email already exists" });
            }

            var id = await connection.QuerySingleAsync<int>(@"
                INSERT INTO uem_app_users (username, email, password, full_name, role, global_role, 
                                         domain_id, tenant_id, is_active)
                VALUES (@Username, @Email, @Password, @FullName, @Role, @GlobalRole, 
                        @DomainId, @TenantId, @IsActive)
                RETURNING id", request);
            
            var user = await connection.QueryFirstAsync<object>(@"
                SELECT 
                    u.id, u.username, u.email, u.full_name as fullName, u.role, u.global_role as globalRole,
                    u.domain_id as domainId, u.tenant_id as tenantId, u.is_active as isActive,
                    u.last_login as lastLogin, u.created_at as createdAt, u.updated_at as updatedAt,
                    d.name as domainName, d.display_name as domainDisplayName,
                    t.name as tenantName, t.display_name as tenantDisplayName
                FROM uem_app_users u
                LEFT JOIN uem_app_domains d ON u.domain_id = d.id
                LEFT JOIN uem_app_tenants t ON u.tenant_id = t.id
                WHERE u.id = @Id", new { Id = id });
            
            return CreatedAtAction(nameof(GetUser), new { id }, user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create user");
            return BadRequest(new { message = "Failed to create user", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<object>> UpdateUser(int id, [FromBody] UpdateUserRequest request)
    {
        try
        {
            using var connection = _dbFactory.Open();
            
            // Check if user exists
            var existingUser = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT id, username, email FROM uem_app_users WHERE id = @Id", new { Id = id });
            if (existingUser == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Build dynamic update query
            var updateFields = new List<string>();
            var parameters = new DynamicParameters();
            parameters.Add("Id", id);

            if (!string.IsNullOrEmpty(request.Username))
            {
                // Check for username conflicts
                var usernameConflict = await connection.QueryFirstOrDefaultAsync<object>(@"
                    SELECT id FROM uem_app_users WHERE username = @Username AND id != @Id", 
                    new { Username = request.Username, Id = id });
                if (usernameConflict != null)
                {
                    return Conflict(new { message = "Username already exists" });
                }
                updateFields.Add("username = @Username");
                parameters.Add("Username", request.Username);
            }

            if (!string.IsNullOrEmpty(request.Email))
            {
                // Check for email conflicts
                var emailConflict = await connection.QueryFirstOrDefaultAsync<object>(@"
                    SELECT id FROM uem_app_users WHERE email = @Email AND id != @Id", 
                    new { Email = request.Email, Id = id });
                if (emailConflict != null)
                {
                    return Conflict(new { message = "Email already exists" });
                }
                updateFields.Add("email = @Email");
                parameters.Add("Email", request.Email);
            }

            if (!string.IsNullOrEmpty(request.FullName))
            {
                updateFields.Add("full_name = @FullName");
                parameters.Add("FullName", request.FullName);
            }

            if (!string.IsNullOrEmpty(request.Role))
            {
                updateFields.Add("role = @Role");
                parameters.Add("Role", request.Role);
            }

            if (!string.IsNullOrEmpty(request.GlobalRole))
            {
                updateFields.Add("global_role = @GlobalRole");
                parameters.Add("GlobalRole", request.GlobalRole);
            }

            if (request.DomainId.HasValue)
            {
                updateFields.Add("domain_id = @DomainId");
                parameters.Add("DomainId", request.DomainId.Value);
            }

            if (request.TenantId.HasValue)
            {
                updateFields.Add("tenant_id = @TenantId");
                parameters.Add("TenantId", request.TenantId.Value);
            }

            if (request.IsActive.HasValue)
            {
                updateFields.Add("is_active = @IsActive");
                parameters.Add("IsActive", request.IsActive.Value);
            }

            if (updateFields.Any())
            {
                updateFields.Add("updated_at = CURRENT_TIMESTAMP");
                var updateQuery = $"UPDATE uem_app_users SET {string.Join(", ", updateFields)} WHERE id = @Id";
                await connection.ExecuteAsync(updateQuery, parameters);
            }
            
            var user = await connection.QueryFirstAsync<object>(@"
                SELECT 
                    u.id, u.username, u.email, u.full_name as fullName, u.role, u.global_role as globalRole,
                    u.domain_id as domainId, u.tenant_id as tenantId, u.is_active as isActive,
                    u.last_login as lastLogin, u.created_at as createdAt, u.updated_at as updatedAt,
                    d.name as domainName, d.display_name as domainDisplayName,
                    t.name as tenantName, t.display_name as tenantDisplayName
                FROM uem_app_users u
                LEFT JOIN uem_app_domains d ON u.domain_id = d.id
                LEFT JOIN uem_app_tenants t ON u.tenant_id = t.id
                WHERE u.id = @Id", new { Id = id });
            
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update user with id {UserId}", id);
            return BadRequest(new { message = "Failed to update user", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            var rowsAffected = await connection.ExecuteAsync(@"
                DELETE FROM uem_app_users WHERE id = @Id", new { Id = id });
            
            if (rowsAffected == 0)
            {
                return NotFound(new { message = "User not found" });
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete user with id {UserId}", id);
            return StatusCode(500, new { message = "Failed to delete user", error = ex.Message });
        }
    }

    [HttpPatch("{id}/activate")]
    public async Task<ActionResult<object>> ActivateUser(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(@"
                UPDATE uem_app_users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = @Id", new { Id = id });
            
            var user = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT 
                    u.id, u.username, u.email, u.full_name as fullName, u.role, u.global_role as globalRole,
                    u.domain_id as domainId, u.tenant_id as tenantId, u.is_active as isActive,
                    u.last_login as lastLogin, u.created_at as createdAt, u.updated_at as updatedAt
                FROM uem_app_users u
                WHERE u.id = @Id", new { Id = id });
            
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to activate user with id {UserId}", id);
            return StatusCode(500, new { message = "Failed to activate user", error = ex.Message });
        }
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<ActionResult<object>> DeactivateUser(int id)
    {
        try
        {
            using var connection = _dbFactory.Open();
            await connection.ExecuteAsync(@"
                UPDATE uem_app_users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = @Id", new { Id = id });
            
            var user = await connection.QueryFirstOrDefaultAsync<object>(@"
                SELECT 
                    u.id, u.username, u.email, u.full_name as fullName, u.role, u.global_role as globalRole,
                    u.domain_id as domainId, u.tenant_id as tenantId, u.is_active as isActive,
                    u.last_login as lastLogin, u.created_at as createdAt, u.updated_at as updatedAt
                FROM uem_app_users u
                WHERE u.id = @Id", new { Id = id });
            
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }
            
            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to deactivate user with id {UserId}", id);
            return StatusCode(500, new { message = "Failed to deactivate user", error = ex.Message });
        }
    }
}

public record CreateUserRequest(
    [Required] string Username,
    [Required] string Email,
    [Required] string Password,
    string? FullName,
    string Role = "viewer",
    string GlobalRole = "user",
    int? DomainId = null,
    int? TenantId = null,
    bool IsActive = true
);

public record UpdateUserRequest(
    string? Username = null,
    string? Email = null,
    string? FullName = null,
    string? Role = null,
    string? GlobalRole = null,
    int? DomainId = null,
    int? TenantId = null,
    bool? IsActive = null
);
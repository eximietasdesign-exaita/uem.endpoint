using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace UEM.Satellite.API.Services;

public sealed class TokenService
{
    private readonly IConfiguration _cfg;
    public TokenService(IConfiguration cfg) => _cfg = cfg;

    public string Issue(string agentId)
    {
        var signingKey = _cfg["Jwt:SigningKey"] ?? "ThisIsA32+ByteMinimumDemoSigningKey!!!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var now = DateTime.UtcNow;
        var jwt = new JwtSecurityToken(
            claims: new[] { new Claim("agentId", agentId), new Claim(ClaimTypes.Role, "agent") },
            notBefore: now,
            expires: now.AddHours(8),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}


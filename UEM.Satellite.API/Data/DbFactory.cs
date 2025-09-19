using System.Data;
using Npgsql;
using Dapper;

namespace UEM.Satellite.API.Data;

public interface IDbFactory { IDbConnection Open(); }

public sealed class DbFactory : IDbFactory
{
    private readonly string _cs;
    public DbFactory(IConfiguration cfg)
        => _cs = cfg.GetConnectionString("Postgres")
            ?? throw new InvalidOperationException("ConnectionStrings:Postgres missing");
    public IDbConnection Open()
    {
        var c = new NpgsqlConnection(_cs);
        c.Open();
        return c;
    }
}

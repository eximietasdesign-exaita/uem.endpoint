using Microsoft.EntityFrameworkCore;

namespace UEM.Satellite.API.Data;
public class SatelliteDb(DbContextOptions<SatelliteDb> opts) : DbContext(opts)
{
    public DbSet<AgentEntity> Agents => Set<AgentEntity>();
    public DbSet<CommandEntity> Commands => Set<CommandEntity>();
}

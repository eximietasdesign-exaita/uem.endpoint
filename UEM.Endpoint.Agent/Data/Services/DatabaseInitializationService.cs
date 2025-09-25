using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using UEM.Endpoint.Agent.Data.Contexts;
using UEM.Endpoint.Agent.Services;

namespace UEM.Endpoint.Agent.Data.Services;

/// <summary>
/// Service for initializing and migrating SQLite databases on agent startup
/// </summary>
public class DatabaseInitializationService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseInitializationService> _logger;

    public DatabaseInitializationService(IServiceProvider serviceProvider, ILogger<DatabaseInitializationService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var timer = _logger.BeginPerformanceTimer("DatabaseInitialization");

        try
        {
            _logger.LogAgentLifecycle("DatabaseInitialization_Started", "Initializing SQLite databases for Agent");

            using var scope = _serviceProvider.CreateScope();
            
            // Initialize Agent Data Database
            await InitializeAgentDataDatabaseAsync(scope);
            
            // Initialize Server Data Database
            await InitializeServerDataDatabaseAsync(scope);
            
            // Verify database integrity
            await VerifyDatabaseIntegrityAsync(scope);

            _logger.LogAgentLifecycle("DatabaseInitialization_Completed", "SQLite databases initialized successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize SQLite databases");
            throw;
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    private async Task InitializeAgentDataDatabaseAsync(IServiceScope scope)
    {
        var context = scope.ServiceProvider.GetRequiredService<AgentDataContext>();
        
        _logger.LogInformation("Initializing Agent Data database (agentdata.db)");
        
        // Ensure database and directory exist
        var dbPath = GetDatabasePath("agentdata.db");
        EnsureDirectoryExists(dbPath);
        
        // Create database and apply migrations
        await context.Database.EnsureCreatedAsync();
        
        // Apply any pending migrations
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            _logger.LogInformation("Applying {MigrationCount} pending migrations to Agent Data database", 
                pendingMigrations.Count());
            await context.Database.MigrateAsync();
        }

        // Verify tables exist
        var tableNames = new[] { "heartbeats", "hardware_discoveries", "software_discoveries", 
                                "security_discoveries", "script_executions", "agent_registrations", 
                                "api_communications" };
        
        await VerifyTablesExistAsync(context, tableNames, "Agent Data");
        
        _logger.LogInformation("Agent Data database initialized successfully at: {DatabasePath}", dbPath);
    }

    private async Task InitializeServerDataDatabaseAsync(IServiceScope scope)
    {
        var context = scope.ServiceProvider.GetRequiredService<ServerDataContext>();
        
        _logger.LogInformation("Initializing Server Data database (serverdata.db)");
        
        // Ensure database and directory exist
        var dbPath = GetDatabasePath("serverdata.db");
        EnsureDirectoryExists(dbPath);
        
        // Create database and apply migrations
        await context.Database.EnsureCreatedAsync();
        
        // Apply any pending migrations
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            _logger.LogInformation("Applying {MigrationCount} pending migrations to Server Data database", 
                pendingMigrations.Count());
            await context.Database.MigrateAsync();
        }

        // Verify tables exist
        var tableNames = new[] { "server_configurations", "server_commands", "server_discovery_scripts", 
                                "server_policies", "server_updates", "server_responses", 
                                "server_notifications" };
        
        await VerifyTablesExistAsync(context, tableNames, "Server Data");
        
        _logger.LogInformation("Server Data database initialized successfully at: {DatabasePath}", dbPath);
    }

    private async Task VerifyDatabaseIntegrityAsync(IServiceScope scope)
    {
        _logger.LogInformation("Verifying database integrity and performance");

        // Test Agent Data database
        var agentContext = scope.ServiceProvider.GetRequiredService<AgentDataContext>();
        var agentDataService = scope.ServiceProvider.GetRequiredService<AgentDataService>();
        
        var agentStats = await agentDataService.GetDatabaseStatsAsync();
        _logger.LogInformation("Agent Data database stats: {Stats}", string.Join(", ", 
            agentStats.Select(kvp => $"{kvp.Key}={kvp.Value}")));

        // Test Server Data database
        var serverContext = scope.ServiceProvider.GetRequiredService<ServerDataContext>();
        var serverDataService = scope.ServiceProvider.GetRequiredService<ServerDataService>();
        
        var serverStats = await serverDataService.GetDatabaseStatsAsync();
        _logger.LogInformation("Server Data database stats: {Stats}", string.Join(", ", 
            serverStats.Select(kvp => $"{kvp.Key}={kvp.Value}")));

        // Test connectivity with sample operations
        await TestDatabaseConnectivityAsync(agentContext, serverContext);
    }

    private async Task TestDatabaseConnectivityAsync(AgentDataContext agentContext, ServerDataContext serverContext)
    {
        try
        {
            // Test Agent Data database
            await agentContext.Database.ExecuteSqlRawAsync("SELECT COUNT(*) FROM sqlite_master WHERE type='table'");
            
            // Test Server Data database
            await serverContext.Database.ExecuteSqlRawAsync("SELECT COUNT(*) FROM sqlite_master WHERE type='table'");
            
            _logger.LogInformation("Database connectivity test passed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database connectivity test failed");
            throw;
        }
    }

    private async Task VerifyTablesExistAsync(DbContext context, string[] expectedTables, string databaseName)
    {
        foreach (var tableName in expectedTables)
        {
            var tableExists = await context.Database.ExecuteSqlRawAsync(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name = {0}", tableName);
                
            if (tableExists == 0)
            {
                _logger.LogWarning("Table {TableName} not found in {DatabaseName} database", tableName, databaseName);
            }
        }
    }

    private string GetDatabasePath(string dbFileName)
    {
        return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", dbFileName);
    }

    private void EnsureDirectoryExists(string filePath)
    {
        var directoryPath = Path.GetDirectoryName(filePath);
        if (!string.IsNullOrEmpty(directoryPath) && !Directory.Exists(directoryPath))
        {
            Directory.CreateDirectory(directoryPath);
            _logger.LogInformation("Created database directory: {DirectoryPath}", directoryPath);
        }
    }
}

/// <summary>
/// Maintenance service for periodic database cleanup and optimization
/// </summary>
public class DatabaseMaintenanceService : IHostedService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DatabaseMaintenanceService> _logger;
    private Timer? _cleanupTimer;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(24); // Run daily

    public DatabaseMaintenanceService(IServiceProvider serviceProvider, ILogger<DatabaseMaintenanceService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting database maintenance service with {Interval} interval", _cleanupInterval);
        
        _cleanupTimer = new Timer(DoMaintenance, null, TimeSpan.FromMinutes(30), _cleanupInterval);
        
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _cleanupTimer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    private async void DoMaintenance(object? state)
    {
        using var timer = _logger.BeginPerformanceTimer("DatabaseMaintenance");
        
        try
        {
            using var scope = _serviceProvider.CreateScope();
            
            var agentDataService = scope.ServiceProvider.GetRequiredService<AgentDataService>();
            var serverDataService = scope.ServiceProvider.GetRequiredService<ServerDataService>();
            
            // Cleanup old agent data (keep 30 days)
            await agentDataService.CleanupOldDataAsync(30);
            
            // Cleanup old server data (keep 90 days)
            await serverDataService.CleanupOldDataAsync(90);
            
            // Run VACUUM on databases for optimization
            await VacuumDatabasesAsync(scope);
            
            _logger.LogInformation("Database maintenance completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database maintenance failed");
        }
    }

    private async Task VacuumDatabasesAsync(IServiceScope scope)
    {
        try
        {
            var agentContext = scope.ServiceProvider.GetRequiredService<AgentDataContext>();
            await agentContext.Database.ExecuteSqlRawAsync("VACUUM");
            
            var serverContext = scope.ServiceProvider.GetRequiredService<ServerDataContext>();
            await serverContext.Database.ExecuteSqlRawAsync("VACUUM");
            
            _logger.LogInformation("Database VACUUM completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Database VACUUM failed");
        }
    }

    public void Dispose()
    {
        _cleanupTimer?.Dispose();
    }
}
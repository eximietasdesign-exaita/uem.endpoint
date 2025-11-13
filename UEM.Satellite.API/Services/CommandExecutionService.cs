using Dapper;
using System.Text.Json;
using UEM.Satellite.API.Controllers;
using UEM.Satellite.API.Data;

namespace UEM.Satellite.API.Services;

public class CommandExecutionService : ICommandExecutionService
{
    private readonly IDbFactory _dbFactory;
    private readonly KafkaCommandPublisher _kafkaCommandPublisher;
    private readonly KafkaResponseProducer _kafkaResponseProducer;
    private readonly ILogger<CommandExecutionService> _logger;
    private readonly IConfiguration _configuration;

    public CommandExecutionService(
        IDbFactory dbFactory,
        KafkaCommandPublisher kafkaCommandPublisher,
        KafkaResponseProducer kafkaResponseProducer,
        ILogger<CommandExecutionService> logger,
        IConfiguration configuration)
    {
        _dbFactory = dbFactory;
        _kafkaCommandPublisher = kafkaCommandPublisher;
        _kafkaResponseProducer = kafkaResponseProducer;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<CommandExecutionResponse> CreateCommandExecutionAsync(
        CommandExecutionRequest request,
        CancellationToken cancellationToken = default)
    {
        var executionId = Guid.NewGuid().ToString();
        var commandId = Guid.NewGuid().ToString();

        using var connection = _dbFactory.Open();
        
        // Store command execution in database
        const string insertSql = @"
            INSERT INTO command_executions (
                execution_id, command_id, command_type, script_content,
                hostname_filter, timeout_seconds, parameters, description,
                status, triggered_by, created_at, expires_at
            ) VALUES (
                @ExecutionId, @CommandId, @CommandType, @ScriptContent,
                @HostnameFilter, @TimeoutSeconds, @Parameters::jsonb, @Description,
                'pending', @TriggeredBy, @CreatedAt, @ExpiresAt
            )";

        var createdAt = DateTime.UtcNow;
        var expiresAt = createdAt.AddHours(24);

        await connection.ExecuteAsync(insertSql, new
        {
            ExecutionId = executionId,
            CommandId = commandId,
            request.CommandType,
            request.ScriptContent,
            request.HostnameFilter,
            request.TimeoutSeconds,
            Parameters = request.Parameters != null ? JsonSerializer.Serialize(request.Parameters) : null,
            request.Description,
            request.TriggeredBy,
            CreatedAt = createdAt,
            ExpiresAt = expiresAt
        });

        // Publish minimal payload to Kafka (uem.commands topic)
        var minimalPayload = new
        {
            executionId,
            commandId,
            hostnameFilter = request.HostnameFilter,
            commandType = request.CommandType,
            ttl = 3600, // 1 hour
            issuedAt = createdAt,
            expiresAt
        };

        await _kafkaCommandPublisher.PublishAsync(minimalPayload, "broadcast");

        _logger.LogInformation(
            "Command execution created and published: ExecutionId={ExecutionId}, HostnameFilter={HostnameFilter}",
            executionId, request.HostnameFilter);

        return new CommandExecutionResponse
        {
            ExecutionId = executionId,
            CommandId = commandId,
            Status = "pending",
            CreatedAt = createdAt,
            Message = $"Command published to all agents with hostname filter: {request.HostnameFilter}"
        };
    }

    public async Task<CommandExecutionDetails?> GetCommandExecutionDetailsAsync(
        string executionId,
        string agentId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _dbFactory.Open();

        // Get command execution details
        const string commandSql = @"
            SELECT 
                execution_id as ExecutionId,
                command_type as CommandType,
                script_content as ScriptContent,
                timeout_seconds as TimeoutSeconds,
                parameters as Parameters,
                created_at as IssuedAt,
                expires_at as ExpiresAt
            FROM command_executions
            WHERE execution_id = @ExecutionId";

        var command = await connection.QueryFirstOrDefaultAsync<dynamic>(commandSql, new { ExecutionId = executionId });

        if (command == null)
        {
            _logger.LogWarning("Command execution {ExecutionId} not found", executionId);
            return null;
        }

        // Get agent details from agents table
        const string agentSql = @"
            SELECT 
                agent_id as AgentId,
                hostname as Hostname,
                ip_address as IpAddress,
                mac_address as MacAddress,
                operating_system as OperatingSystem,
                os_version as OsVersion,
                architecture as Architecture,
                domain as Domain,
                agent_version as AgentVersion
            FROM agents
            WHERE agent_id = @AgentId";

        var agent = await connection.QueryFirstOrDefaultAsync<AgentDetails>(agentSql, new { AgentId = agentId });

        bool agentExists = agent != null;
        if (agent == null)
        {
            _logger.LogWarning("Agent {AgentId} not found in database, using fallback details", agentId);
            agent = new AgentDetails { AgentId = agentId, Hostname = "Unknown" };
        }

        // Update command execution with matched agent (only if agent exists in agents table to satisfy FK constraint)
        if (agentExists)
        {
            const string updateSql = @"
                UPDATE command_executions
                SET matched_agent_id = @AgentId,
                    status = 'matched',
                    matched_at = @MatchedAt
                WHERE execution_id = @ExecutionId AND matched_agent_id IS NULL";

            await connection.ExecuteAsync(updateSql, new
            {
                ExecutionId = executionId,
                AgentId = agentId,
                MatchedAt = DateTime.UtcNow
            });

            _logger.LogInformation(
                "Agent {AgentId} matched with execution {ExecutionId}, fetching full details",
                agentId, executionId);
        }
        else
        {
            _logger.LogInformation(
                "Agent {AgentId} (not in agents table) matched with execution {ExecutionId}, fetching full details",
                agentId, executionId);
        }

        return new CommandExecutionDetails
        {
            ExecutionId = executionId,
            CommandType = command.CommandType ?? "powershell",
            ScriptContent = command.ScriptContent ?? string.Empty,
            TimeoutSeconds = command.TimeoutSeconds ?? 300, // Default 5 minutes
            Parameters = command.Parameters != null 
                ? JsonSerializer.Deserialize<Dictionary<string, object>>(command.Parameters)
                : null,
            AgentDetails = agent,
            IssuedAt = command.IssuedAt ?? DateTime.UtcNow,
            ExpiresAt = command.ExpiresAt ?? DateTime.UtcNow.AddHours(1)
        };
    }

    public async Task ProcessExecutionResultAsync(
        string executionId,
        CommandExecutionResult result,
        CancellationToken cancellationToken = default)
    {
        using var connection = _dbFactory.Open();

        // Store execution result in database
        const string insertResultSql = @"
            INSERT INTO command_execution_results (
                execution_id, agent_id, status, exit_code, output,
                error_message, execution_time_ms, started_at, completed_at,
                metadata, created_at
            ) VALUES (
                @ExecutionId, @AgentId, @Status, @ExitCode, @Output,
                @ErrorMessage, @ExecutionTimeMs, @StartedAt, @CompletedAt,
                @Metadata::jsonb, @CreatedAt
            )";

        await connection.ExecuteAsync(insertResultSql, new
        {
            ExecutionId = executionId,
            result.AgentId,
            result.Status,
            result.ExitCode,
            result.Output,
            result.ErrorMessage,
            result.ExecutionTimeMs,
            result.StartedAt,
            result.CompletedAt,
            Metadata = result.Metadata != null ? JsonSerializer.Serialize(result.Metadata) : null,
            CreatedAt = DateTime.UtcNow
        });

        // Update command execution status
        const string updateSql = @"
            UPDATE command_executions
            SET status = @Status,
                completed_at = @CompletedAt
            WHERE execution_id = @ExecutionId";

        await connection.ExecuteAsync(updateSql, new
        {
            ExecutionId = executionId,
            result.Status,
            result.CompletedAt
        });

        // Publish result to Kafka responses topic
        var responsePayload = new
        {
            executionId,
            agentId = result.AgentId,
            status = result.Status,
            exitCode = result.ExitCode,
            output = result.Output,
            errorMessage = result.ErrorMessage,
            executionTimeMs = result.ExecutionTimeMs,
            completedAt = result.CompletedAt
        };

        await _kafkaResponseProducer.PublishAsync(responsePayload, executionId);

        _logger.LogInformation(
            "Execution result processed: ExecutionId={ExecutionId}, AgentId={AgentId}, Status={Status}",
            executionId, result.AgentId, result.Status);
    }

    public async Task<CommandExecutionStatus?> GetExecutionStatusAsync(
        string executionId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _dbFactory.Open();

        const string sql = @"
            SELECT 
                ce.execution_id as ExecutionId,
                ce.command_id as CommandId,
                ce.status as Status,
                ce.matched_agent_id as AgentId,
                a.hostname as Hostname,
                ce.created_at as CreatedAt,
                ce.matched_at as StartedAt,
                ce.completed_at as CompletedAt,
                cer.output as Output,
                cer.error_message as ErrorMessage,
                cer.execution_time_ms as ExecutionTimeMs
            FROM command_executions ce
            LEFT JOIN agents a ON ce.matched_agent_id = a.agent_id
            LEFT JOIN command_execution_results cer ON ce.execution_id = cer.execution_id
            WHERE ce.execution_id = @ExecutionId";

        var status = await connection.QueryFirstOrDefaultAsync<CommandExecutionStatus>(sql, new { ExecutionId = executionId });

        return status;
    }

    public async Task<List<CommandExecutionStatus>> ListCommandExecutionsAsync(
        string? status,
        string? agentId,
        int limit,
        CancellationToken cancellationToken = default)
    {
        using var connection = _dbFactory.Open();

        var whereClauses = new List<string>();
        var parameters = new DynamicParameters();

        if (!string.IsNullOrEmpty(status))
        {
            whereClauses.Add("ce.status = @Status");
            parameters.Add("Status", status);
        }

        if (!string.IsNullOrEmpty(agentId))
        {
            whereClauses.Add("ce.matched_agent_id = @AgentId");
            parameters.Add("AgentId", agentId);
        }

        var whereClause = whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", whereClauses) : "";

        var sql = $@"
            SELECT 
                ce.execution_id as ExecutionId,
                ce.command_id as CommandId,
                ce.status as Status,
                ce.matched_agent_id as AgentId,
                a.hostname as Hostname,
                ce.created_at as CreatedAt,
                ce.matched_at as StartedAt,
                ce.completed_at as CompletedAt,
                cer.output as Output,
                cer.error_message as ErrorMessage,
                cer.execution_time_ms as ExecutionTimeMs
            FROM command_executions ce
            LEFT JOIN agents a ON ce.matched_agent_id = a.agent_id
            LEFT JOIN command_execution_results cer ON ce.execution_id = cer.execution_id
            {whereClause}
            ORDER BY ce.created_at DESC
            LIMIT @Limit";

        parameters.Add("Limit", limit);

        var executions = await connection.QueryAsync<CommandExecutionStatus>(sql, parameters);

        return executions.ToList();
    }
}

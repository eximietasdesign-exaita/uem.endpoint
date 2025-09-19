// src/UEM.Satellite.API/Hubs/AgentHub.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using UEM.Satellite.API.Services;

namespace UEM.Satellite.API.Hubs;

[Authorize]
public class AgentHub : Hub
{
    private readonly AgentRegistry _registry;
    private readonly ILogger<AgentHub> _log;
    public AgentHub(AgentRegistry registry, ILogger<AgentHub> log)
    { _registry = registry; _log = log; }

    public override async Task OnConnectedAsync()
    {
        var ctx = Context.GetHttpContext();
        var agentId = ctx?.Request.Query["agentId"].ToString()?.Trim();
        if (!string.IsNullOrWhiteSpace(agentId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"agent:{agentId}");
            _registry.SetOnline(agentId, true);
            _log.LogInformation("Hub connect {ConnId} agent={AgentId}", Context.ConnectionId, agentId);
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var ctx = Context.GetHttpContext();
        var agentId = ctx?.Request.Query["agentId"].ToString()?.Trim();
        if (!string.IsNullOrWhiteSpace(agentId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"agent:{agentId}");
            _registry.SetOnline(agentId, false);
        }
        _log.LogInformation("Hub disconnect {ConnId} agent={AgentId} ex={Ex}", Context.ConnectionId, agentId, exception?.Message);
        await base.OnDisconnectedAsync(exception);
    }
}

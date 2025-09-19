using System.Collections.Concurrent;
using System.Linq;

namespace UEM.Satellite.API.Services;

public sealed class AgentRegistry
{
    // Registered agents
    private readonly ConcurrentDictionary<string, AgentInfo> _agents = new();
    // Online connection counts (some agents can have multiple connections)
    private readonly ConcurrentDictionary<string, int> _online = new();

    public IReadOnlyCollection<AgentInfo> List() => _agents.Values.ToArray(); // ← materialize to array

    public AgentInfo UpsertRegistered(string agentId)
    {
        var info = _agents.AddOrUpdate(agentId,
            addValueFactory: id => new AgentInfo(id)
            {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                RegisteredAtUtc = DateTimeOffset.UtcNow,
                LastSeenUtc = DateTimeOffset.UtcNow
            },
            updateValueFactory: (id, existing) =>
            {
                existing.LastSeenUtc = DateTimeOffset.UtcNow;
                return existing;
            });

        return info;
    }

    public void SetOnline(string agentId, bool online)
    {
        if (online)
        {
            _online.AddOrUpdate(agentId, 1, (_, curr) => curr + 1);
        }
        else
        {
            _online.AddOrUpdate(agentId, 0, (_, curr) => Math.Max(0, curr - 1));
        }
        Touch(agentId);
    }

    public void Touch(string agentId)
    {
        if (_agents.TryGetValue(agentId, out var info))
            info.LastSeenUtc = DateTimeOffset.UtcNow;
    }

    public AgentView ToView(string agentId)
    {
        _agents.TryGetValue(agentId, out var info);
        _online.TryGetValue(agentId, out var conn);
        var online = (conn > 0);
        return new AgentView(agentId, online, info?.RegisteredAtUtc, info?.LastSeenUtc);
    }

    public IEnumerable<AgentView> ListViews() => _agents.Keys.Select(ToView);

    public sealed class AgentInfo
    {
        public AgentInfo(string agentId) { AgentId = agentId; }
        public string AgentId { get; }
        public DateTimeOffset RegisteredAtUtc { get; set; }
        public DateTimeOffset LastSeenUtc { get; set; }
    }

    public record AgentView(string AgentId, bool Online, DateTimeOffset? RegisteredAtUtc, DateTimeOffset? LastSeenUtc);
}

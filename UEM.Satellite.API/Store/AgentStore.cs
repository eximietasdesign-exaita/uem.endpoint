namespace UEM.Satellite.API.Store;
public class AgentStore
{
    private readonly List<(string AgentId, DateTime LastSeen)> _agents = new();
    public void Upsert(string agentId) {
        lock(_agents){
            var i = _agents.FindIndex(a => a.AgentId == agentId);
            if (i >= 0) _agents[i] = (agentId, DateTime.UtcNow);
            else _agents.Add((agentId, DateTime.UtcNow));
        }
    }
    public IEnumerable<object> List() { lock(_agents){ return _agents.Select(a => new { agentId = a.AgentId, lastSeenAt = a.LastSeen }).ToArray(); } }
}

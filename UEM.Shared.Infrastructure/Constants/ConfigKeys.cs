namespace UEM.Shared.Infrastructure.Constants;
public static class ConfigKeys
{
    public const string SatelliteBaseUrl = "Satellite:BaseUrl";
    public const string SatelliteWsUrl = "Satellite:WsUrl";
    public const string BootstrapKey = "Agent:BootstrapKey";
    public const string Jwt = "Agent:Jwt";
    public const string RefreshToken = "Agent:RefreshToken";
    public const string BandwidthKbps = "Agent:Bandwidth:Kbps";
    public const string BandwidthBurstKb = "Agent:Bandwidth:BurstKb";
    public const string WorkingHours = "Agent:WorkingHours";
    public const string HeartbeatSeconds = "Agent:HeartbeatSeconds";
    public const string KafkaBootstrap = "Kafka:BootstrapServers";
}

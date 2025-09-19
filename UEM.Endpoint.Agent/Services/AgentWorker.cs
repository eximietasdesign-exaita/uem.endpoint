using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System.Threading;
using System.Threading.Tasks;

namespace UEM.Endpoint.Agent.Services
{
    public sealed class AgentWorker : BackgroundService
    {
        private readonly ILogger<AgentWorker> _log;
        private readonly AgentRegistrationService _reg;
        private readonly ILogger<CommandChannel> _commandChannelLogger;
        private readonly IConfiguration _config;

        public AgentWorker(ILogger<AgentWorker> log, AgentRegistrationService reg, ILogger<CommandChannel> commandChannelLogger, IConfiguration config)
        {
            _log = log;
            _reg = reg;
            _commandChannelLogger = commandChannelLogger;
            _config = config;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Implementation here
            return Task.CompletedTask;
        }
    }
}
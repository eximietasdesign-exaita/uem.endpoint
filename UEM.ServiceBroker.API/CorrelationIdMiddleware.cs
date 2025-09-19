using Microsoft.Extensions.Configuration;

namespace UEM.ServiceBroker.API
{
    // CorrelationIdMiddleware.cs (in each API)
    public sealed class CorrelationIdMiddleware : IMiddleware
    {
        private readonly ILogger<CorrelationIdMiddleware> _log;
        private readonly string _header;

        public CorrelationIdMiddleware(ILogger<CorrelationIdMiddleware> log, IConfiguration config)
        {
            _log = log;
            _header = config.GetValue<string>("CorrelationId:Header") ?? "X-Correlation-Id";
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var cid = context.Request.Headers.TryGetValue(_header, out var h) && !string.IsNullOrWhiteSpace(h)
                ? h.ToString()
                : Guid.NewGuid().ToString("n");
            using (_log.BeginScope(new Dictionary<string, object?> { ["cid"] = cid }))
            {
                context.Response.Headers[_header] = cid;
                await next(context);
            }
        }
    }

    // ICorrelationIdAccessor.cs
    public interface ICorrelationIdAccessor { string? Current { get; } }
    public sealed class CorrelationIdAccessor(IHttpContextAccessor acc, IConfiguration config) : ICorrelationIdAccessor
    {
        private readonly string _header = config.GetValue<string>("CorrelationId:Header") ?? "X-Correlation-Id";
        public string? Current => acc.HttpContext?.Response.Headers[_header].ToString();
    }
}
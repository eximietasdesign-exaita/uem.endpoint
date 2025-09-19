namespace UEM.Satellite.API
{
    // CorrelationIdMiddleware.cs (in each API)
    public sealed class CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> log)
    {
        private const string Header = "X-Correlation-Id";
        public async Task Invoke(HttpContext ctx)
        {
            var cid = ctx.Request.Headers.TryGetValue(Header, out var h) && !string.IsNullOrWhiteSpace(h)
                ? h.ToString()
                : Guid.NewGuid().ToString("n");
            using (log.BeginScope(new Dictionary<string, object?> { ["cid"] = cid }))
            {
                ctx.Response.Headers[Header] = cid;
                await next(ctx);
            }
        }
    }

    // ICorrelationIdAccessor.cs
    public interface ICorrelationIdAccessor { string? Current { get; } }
    public sealed class CorrelationIdAccessor(IHttpContextAccessor acc) : ICorrelationIdAccessor
    {
        public string? Current => acc.HttpContext?.Response.Headers["X-Correlation-Id"].ToString();
    }
}

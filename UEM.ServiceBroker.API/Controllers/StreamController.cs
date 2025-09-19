using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using UEM.ServiceBroker.API.Services;
using System.Threading.Channels;

namespace UEM.ServiceBroker.API.Controllers;

[ApiController]
[Route("api/stream")]
public class StreamController : ControllerBase
{
    private readonly IStreamBus _bus;
    public StreamController(IStreamBus bus) => _bus = bus;

    [HttpGet("events")]
    public async Task Get(CancellationToken ct)
    {
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Add("X-Accel-Buffering", "no");
        Response.ContentType = "text/event-stream";

        await foreach (var evt in _bus.Subscribe(ct))
        {
            await Response.WriteAsync($"data: {JsonSerializer.Serialize(evt)}\n\n", ct);
            await Response.Body.FlushAsync(ct);
        }
    }
}


public interface IStreamBus
{
    ValueTask PublishAsync(object evt, CancellationToken ct = default);
    IAsyncEnumerable<object> Subscribe(CancellationToken ct = default);
}

public sealed class StreamBus : IStreamBus
{
    private readonly Channel<object> _ch = Channel.CreateUnbounded<object>();
    public ValueTask PublishAsync(object evt, CancellationToken ct = default) => _ch.Writer.WriteAsync(evt, ct);
    public IAsyncEnumerable<object> Subscribe(CancellationToken ct = default) => _ch.Reader.ReadAllAsync(ct);
}

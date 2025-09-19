using System.Net.WebSockets;
using System.Text;

namespace UEM.Shared.Infrastructure.Http;
public sealed class WebSocketClient : IAsyncDisposable
{
    private readonly ClientWebSocket _ws = new();
    public async Task ConnectAsync(Uri uri, CancellationToken ct) => await _ws.ConnectAsync(uri, ct);
    public async Task SendTextAsync(string json, CancellationToken ct)
    {
        var bytes = Encoding.UTF8.GetBytes(json);
        await _ws.SendAsync(bytes, WebSocketMessageType.Text, true, ct);
    }
    public async IAsyncEnumerable<string> ReadAllAsync([System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        var buffer = new byte[64 * 1024];
        while (!ct.IsCancellationRequested && _ws.State == WebSocketState.Open)
        {
            var res = await _ws.ReceiveAsync(buffer, ct);
            if (res.MessageType == WebSocketMessageType.Close) yield break;
            yield return Encoding.UTF8.GetString(buffer, 0, res.Count);
        }
    }
    public async ValueTask DisposeAsync() { if (_ws.State == WebSocketState.Open) await _ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "bye", CancellationToken.None); _ws.Dispose(); }
}

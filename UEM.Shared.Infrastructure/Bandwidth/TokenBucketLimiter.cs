namespace UEM.Shared.Infrastructure.Bandwidth;
public sealed class TokenBucketLimiter
{
    private readonly long _capacityBytes; private readonly long _refillBytesPerSec; private long _tokens; private DateTime _last;
    public TokenBucketLimiter(long kbps, long burstKb)
    { _capacityBytes = burstKb * 1024; _refillBytesPerSec = kbps * 1024; _tokens = _capacityBytes; _last = DateTime.UtcNow; }
    private void Refill()
    { var now = DateTime.UtcNow; var delta = (now - _last).TotalSeconds; _last = now; _tokens = Math.Min(_capacityBytes, _tokens + (long)(_refillBytesPerSec * delta)); }
    public async Task ThrottleAsync(int bytes)
    { Refill(); if (_tokens >= bytes) { _tokens -= bytes; return; } var needed = bytes - _tokens; var waitSec = (double)needed / _refillBytesPerSec; await Task.Delay(TimeSpan.FromSeconds(Math.Max(0.01, waitSec))); Refill(); _tokens = Math.Max(0, _tokens - bytes); }
}

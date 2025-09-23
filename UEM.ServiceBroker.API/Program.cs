var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// CORS for UI
builder.Services.AddCors(opt => {
    opt.AddPolicy("AllowAll", p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseCors("AllowAll");

app.MapControllers();

app.MapGet("/", () => "UEM ServiceBroker API is running!");
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

// Mock streaming events endpoint
app.MapGet("/api/stream/events", () => 
{
    return new object[]
    {
        new { 
            eventType = "AgentHeartbeat", 
            agentId = "agent-001", 
            timestamp = DateTime.UtcNow,
            data = new { status = "Online", cpuUsage = 25.5 }
        },
        new { 
            eventType = "AgentStatus", 
            agentId = "agent-002", 
            timestamp = DateTime.UtcNow.AddMinutes(-1),
            data = new { status = "Online", memoryUsage = 52.1 }
        }
    };
});

app.Run();

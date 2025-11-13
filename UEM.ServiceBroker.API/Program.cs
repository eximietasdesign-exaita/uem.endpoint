using UEM.ServiceBroker.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register stream bus for SSE
builder.Services.AddSingleton<UEM.ServiceBroker.API.Controllers.IStreamBus, UEM.ServiceBroker.API.Controllers.StreamBus>();

// Register Kafka services
builder.Services.AddSingleton<KafkaCommandPublisher>();
builder.Services.AddHostedService<KafkaTopicProvisioner>();
builder.Services.AddHostedService<KafkaResponseConsumerDelayed>();

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

// Remove duplicate endpoint - handled by StreamController

// Configure port from settings
var port = builder.Configuration.GetValue<int>("ServerSettings:Port", 8099);
app.Run($"http://0.0.0.0:{port}");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "UEM Satellite API", Version = "v1" });
});

// CORS for UI
builder.Services.AddCors(opt => {
    opt.AddPolicy("AllowAll", p => p
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c => 
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "UEM Satellite API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");

app.MapControllers();

app.MapGet("/", () => "UEM Satellite API is running!");
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow });

// Additional Swagger endpoints
app.MapGet("/swagger", () => Results.Redirect("/swagger/index.html"));

app.Run();
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using UEM.Endpoint.Agent;
using UEM.Endpoint.Agent.Services; // Add this using statement

var builder = Host.CreateApplicationBuilder(args);

// Add the Agent's services
builder.Services.AddHostedService<AgentServiceWrapper>();

var host = builder.Build();

await host.RunAsync();

// Create a wrapper service to run the Agent
using AgniRakshak.Api.Data;
using AgniRakshak.Api.Hubs;
using AgniRakshak.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string ReactDevCors = "ReactDevCors";

// Configure SQLite Database with Entity Framework Core
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
                      ?? "Data Source=agnirakshak.db"));

// SignalR Real-Time WebSocket Service (<30ms latency)
builder.Services.AddSignalR();

// Core Disaster Prediction & Sensor Fusion Services
builder.Services.AddSingleton<FireState>();
builder.Services.AddSingleton<FirePropagationService>();
builder.Services.AddScoped<EmergencyDispatchService>();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy(ReactDevCors, policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// Ensure SQLite database & seed records are created on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors(ReactDevCors);

app.MapControllers();
app.MapHub<FireHub>("/hubs/fire");

app.Run();

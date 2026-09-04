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
builder.Services.AddHttpClient();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy(ReactDevCors, policy =>
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// Ensure SQLite database & seed records are recreated on startup to apply seed changes
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureDeleted(); // Wipes the DB to allow fresh seeding of the 1 farmer
    db.Database.EnsureCreated();
}

app.UseCors(ReactDevCors);

app.MapControllers();
app.MapHub<FireHub>("/hubs/fire");

app.Run();

using Microsoft.EntityFrameworkCore;
using AgniRakshak.Api.Models;

namespace AgniRakshak.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<IncidentLog> Incidents => Set<IncidentLog>();
    public DbSet<FarmerNode> FarmerNodes => Set<FarmerNode>();
    public DbSet<TelemetryRecord> TelemetryLogs => Set<TelemetryRecord>();
    public DbSet<ActuationRecord> ActuationLogs => Set<ActuationRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed 15 Cadastral Farmer Nodes in Sector B (coordinates centered around Tower Node 01)
        // Tower Node 01 is at Lat 29.9680, Lng 76.8780
        var nodes = new List<FarmerNode>
        {
            new() { Id = 1, Initials = "SP", Name = "Suresh Patil", Phone = "+91 96276 66041", Sector = "Sector B", PlotNumber = "Plot 07 · East Field", Latitude = 29.9695, Longitude = 76.8830, LivestockCount = 14, CropType = "Mustard", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" }
        };

        modelBuilder.Entity<FarmerNode>().HasData(nodes);

        // Seed initial historical incident log for forensics demonstration
        var incidents = new List<IncidentLog>
        {
            new()
            {
                Id = 101,
                Timestamp = DateTime.UtcNow.AddDays(-2).AddHours(-4),
                Sector = "Sector B",
                PeakConfidence = 94.6,
                FlameAreaSqMeters = 42.5,
                MaxSmokeDensity = 78.2,
                Status = "Resolved",
                EvacuationTriggered = true,
                HashSignature = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                MitigationAction = "Automated Sprinkler Relay 04 Activated · 110dB LoRa Siren Triggered · 4 Farmers Evacuated via SMS",
                Notes = "Contained within 4.2 minutes by autonomous perimeter mist valves. Zero livestock or structural loss reported."
            },
            new()
            {
                Id = 102,
                Timestamp = DateTime.UtcNow.AddDays(-1).AddHours(-11),
                Sector = "Sector B",
                PeakConfidence = 88.1,
                FlameAreaSqMeters = 18.0,
                MaxSmokeDensity = 64.0,
                Status = "Resolved",
                EvacuationTriggered = false,
                HashSignature = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                MitigationAction = "Sector Mist Valve 01 Triggered · Telegram Dispatch Push",
                Notes = "Stubble burning trace detected near Plot 19. Extinguished before spread."
            }
        };

        modelBuilder.Entity<IncidentLog>().HasData(incidents);
    }
}

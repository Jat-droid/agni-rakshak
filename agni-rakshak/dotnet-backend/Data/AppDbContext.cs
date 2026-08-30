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
            new() { Id = 1, Initials = "RK", Name = "Ramesh Kumar", Phone = "+91 98765 43210", Sector = "Sector B", PlotNumber = "Plot 12 · North Field", Latitude = 29.9712, Longitude = 76.8795, LivestockCount = 8, CropType = "Wheat", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 2, Initials = "SP", Name = "Suresh Patil", Phone = "+91 91234 56789", Sector = "Sector B", PlotNumber = "Plot 07 · East Field", Latitude = 29.9695, Longitude = 76.8830, LivestockCount = 14, CropType = "Mustard", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 3, Initials = "AV", Name = "Anita Verma", Phone = "+91 99887 76655", Sector = "Sector B", PlotNumber = "Plot 19 · South Field", Latitude = 29.9640, Longitude = 76.8765, LivestockCount = 4, CropType = "Sugarcane", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 4, Initials = "MJ", Name = "Manoj Jadhav", Phone = "+91 90909 80808", Sector = "Sector B", PlotNumber = "Plot 03 · West Field", Latitude = 29.9665, Longitude = 76.8720, LivestockCount = 12, CropType = "Wheat", LanguagePreference = "Marathi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 5, Initials = "GS", Name = "Gurpreet Singh", Phone = "+91 98111 22334", Sector = "Sector B", PlotNumber = "Plot 08 · NE Perimeter", Latitude = 29.9725, Longitude = 76.8820, LivestockCount = 20, CropType = "Paddy / Wheat", LanguagePreference = "Punjabi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 6, Initials = "HS", Name = "Harvinder Sandhu", Phone = "+91 98112 33445", Sector = "Sector B", PlotNumber = "Plot 14 · NE Canal Edge", Latitude = 29.9740, Longitude = 76.8850, LivestockCount = 6, CropType = "Wheat", LanguagePreference = "Punjabi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 7, Initials = "RS", Name = "Rajesh Sharma", Phone = "+91 97223 44556", Sector = "Sector B", PlotNumber = "Plot 02 · East Well", Latitude = 29.9675, Longitude = 76.8860, LivestockCount = 10, CropType = "Mustard", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 8, Initials = "DK", Name = "Dinesh Khatri", Phone = "+91 96554 11223", Sector = "Sector B", PlotNumber = "Plot 11 · NW Sector", Latitude = 29.9730, Longitude = 76.8740, LivestockCount = 5, CropType = "Barley", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 9, Initials = "BS", Name = "Balwant Sodhi", Phone = "+91 94112 99887", Sector = "Sector B", PlotNumber = "Plot 05 · North Ridge", Latitude = 29.9750, Longitude = 76.8785, LivestockCount = 18, CropType = "Wheat", LanguagePreference = "Punjabi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 10, Initials = "VK", Name = "Vikas Kadam", Phone = "+91 93221 44332", Sector = "Sector B", PlotNumber = "Plot 16 · SW Orchard", Latitude = 29.9630, Longitude = 76.8730, LivestockCount = 2, CropType = "Mango / Citrus", LanguagePreference = "Marathi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 11, Initials = "PL", Name = "Pooja Lal", Phone = "+91 92110 55667", Sector = "Sector B", PlotNumber = "Plot 09 · SE Boundary", Latitude = 29.9635, Longitude = 76.8825, LivestockCount = 7, CropType = "Vegetables", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 12, Initials = "ST", Name = "Sanjay Tyagi", Phone = "+91 91998 77661", Sector = "Sector B", PlotNumber = "Plot 01 · Tower Center", Latitude = 29.9685, Longitude = 76.8775, LivestockCount = 15, CropType = "Wheat", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 13, Initials = "JS", Name = "Jaswinder Saran", Phone = "+91 98770 12345", Sector = "Sector B", PlotNumber = "Plot 22 · East Meadow", Latitude = 29.9705, Longitude = 76.8870, LivestockCount = 22, CropType = "Fodder / Grass", LanguagePreference = "Punjabi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 14, Initials = "SC", Name = "Suman Choudhary", Phone = "+91 99114 88776", Sector = "Sector B", PlotNumber = "Plot 18 · West Canal", Latitude = 29.9670, Longitude = 76.8690, LivestockCount = 9, CropType = "Mustard", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" },
            new() { Id = 15, Initials = "RM", Name = "Ravi Maurya", Phone = "+91 94551 22339", Sector = "Sector B", PlotNumber = "Plot 20 · South Gate", Latitude = 29.9615, Longitude = 76.8790, LivestockCount = 11, CropType = "Sugarcane", LanguagePreference = "Hindi", RiskStatus = "SAFE", Status = "ONLINE" }
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

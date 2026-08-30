namespace AgniRakshak.Api.Models;

public class IncidentLog
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Sector { get; set; } = "Sector B";
    public double PeakConfidence { get; set; }
    public double FlameAreaSqMeters { get; set; }
    public double MaxSmokeDensity { get; set; }
    public string Status { get; set; } = "Active"; // "Active", "Contained", "Resolved"
    public bool EvacuationTriggered { get; set; }
    public string HashSignature { get; set; } = string.Empty; // Tamper-proof SHA-256 string for insurance audit
    public string MitigationAction { get; set; } = "Autonomous Sprinkler Grid Active";
    public string? VideoClipPath { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class FarmerNode
{
    public int Id { get; set; }
    public string Initials { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Sector { get; set; } = "Sector B";
    public string PlotNumber { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int LivestockCount { get; set; }
    public double FarmAreaAcres { get; set; } = 5.0;
    public string EmergencyContact { get; set; } = string.Empty;
    public string CropType { get; set; } = "Wheat / Mustard";
    public string LanguagePreference { get; set; } = "Hindi";
    public string RiskStatus { get; set; } = "SAFE"; // "SAFE", "WARNING", "CRITICAL_EVACUATE"
    public double TimeToImpactMinutes { get; set; } = -1; // -1 means out of direct spread path
    public string Status { get; set; } = "ONLINE";
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public class TelemetryRecord
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public double AmbientTemp { get; set; }
    public double Humidity { get; set; }
    public double RateOfRise { get; set; } // ΔT/Δt in °C/min
    public double GasPpm { get; set; }
    public double WindSpeed { get; set; } // km/h
    public double WindDirection { get; set; } // degrees (0-360)
    public double SolarRadiation { get; set; }
    public double ComputedFRI { get; set; } // Composite Fire Risk Index (0-100)
}

public class ActuationRecord
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Sector { get; set; } = "Sector B";
    public string DeviceType { get; set; } = "SprinklerGrid"; // "SprinklerGrid", "SirenArray", "TwilioIVR", "ExotelDispatch"
    public string TriggeredBy { get; set; } = "Autonomous AI Fusion (TTI < 5m)";
    public bool State { get; set; } = true;
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
}

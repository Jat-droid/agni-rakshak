namespace AgniRakshak.Api.Models;

public class StatusDto
{
    public string ClassName { get; set; } = "Normal";
    public double Confidence { get; set; }
    public bool IsFire { get; set; }
    public double SmokeDensity { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Multi-Modal Sensor Fusion Fields (Patent Claim 1)
    public double AmbientTemp { get; set; } = 32.4;
    public double Humidity { get; set; } = 28.5;
    public double RateOfRise { get; set; } = 0.4; // ΔT/Δt in °C/min
    public double GasPpm { get; set; } = 42.0; // MQ-135 / MQ-2 reading
    public double WindSpeed { get; set; } = 1000.0; // km/h (Extreme wind for demo map coverage)
    public double WindDirection { get; set; } = 65.0; // Wind azimuth degrees
    public double FftFlickerHz { get; set; } = 9.8; // Flame flicker frequency (8-12 Hz for real flame)
    public double OpticalFlowScore { get; set; } = 0.88; // Upward smoke divergence index
    public double FireRiskIndex { get; set; } = 15.0; // Composite FRI (0-100)
    public string ThreatLevel { get; set; } = "NOMINAL"; // NOMINAL, ELEVATED, DANGER, CATASTROPHIC
    public string Sector { get; set; } = "Sector B";
}

public class IsochronePolygon
{
    public int MinuteInterval { get; set; } // 5, 10, 15 min
    public string FillColor { get; set; } = "#ef444433";
    public string StrokeColor { get; set; } = "#ef4444";
    public List<GeoPoint> Coordinates { get; set; } = new();
}

public class GeoPoint
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public GeoPoint() { }
    public GeoPoint(double lat, double lng)
    {
        Latitude = lat;
        Longitude = lng;
    }
}

public class FirePropagationResult
{
    public double ForwardRateOfSpreadMPerMin { get; set; }
    public double WindDirectionDegrees { get; set; }
    public double WindSpeedKmH { get; set; }
    public double PlumeAngleDegrees { get; set; } = 45.0;
    public double MaxSpreadDistance15MinMeters { get; set; }
    public List<IsochronePolygon> Isochrones { get; set; } = new();
    public List<FarmerNode> EndangeredNodes { get; set; } = new();
    public int CriticalEvacuationCount { get; set; }
    public int WarningCount { get; set; }
}

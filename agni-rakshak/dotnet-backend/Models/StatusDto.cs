namespace AgniRakshak.Api.Models;

public class StatusDto
{
    public string ClassName { get; set; } = "Normal";
    public double Confidence { get; set; }
    public bool IsFire { get; set; }
    public double SmokeDensity { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

using AgniRakshak.Api.Data;
using AgniRakshak.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api")]
public class DataController : ControllerBase
{
    private readonly AppDbContext _db;

    public DataController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("settings/dispatch")]
    public IActionResult GetDispatchSettings() => Ok(
        new DispatchSettings("Station 42 — Sector B Regional HQ", "+91 100", "+91 98220 11442", "~7.5 minutes"));

    [HttpGet("subscription/plans")]
    public IActionResult GetPlans() => Ok(new List<PricingPlan>
    {
        new("Basic Farm Guard", "₹999", "/ month", false, new List<string>
        {
            "1 Edge AI Tower Pod (Sector B)",
            "Up to 5 farm plots covered",
            "Direct Multi-dialect SMS Alerts",
            "24-hour incident log retention",
            "Standard Rothermel plume estimate"
        }),
        new("Pro Agro-Shield", "₹3,499", "/ month", true, new List<string>
        {
            "Up to 3 Thermal AI Tower Nodes",
            "Up to 25 farm plots & livestock tracking",
            "Autonomous Solenoid Sprinkler Relay Trigger",
            "Automated Multi-Dialect IVR Voice Dispatch",
            "30-day SHA-256 Chained Forensics Log",
            "Real-time SignalR GIS Command Console"
        }),
        new("District Enterprise", "Custom", "", false, new List<string>
        {
            "Unlimited Tower Pods & LoRa Mesh Relays",
            "District-wide Cadastral GIS Integration",
            "Direct Fire Brigade & SDMA Hotline Link",
            "Cryptographic Insurance Forensics Audit Reports",
            "24/7 Dedicated Remote Response Engineer"
        }),
    });
}

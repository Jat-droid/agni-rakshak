using AgniRakshak.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api")]
public class DataController : ControllerBase
{
    // In a real system these three would come from a database / config table.
    // Kept as static seed data here so the frontend has something real to render.

    [HttpGet("network/nodes")]
    public IActionResult GetNodes() => Ok(new List<FarmerNode>
    {
        new("RK", "Ramesh Kumar", "Plot 12 · North Field", "+91 98765 43210", "ONLINE"),
        new("SP", "Suresh Patil",  "Plot 07 · East Field",  "+91 91234 56789", "ONLINE"),
        new("AV", "Anita Verma",  "Plot 19 · South Field", "+91 99887 76655", "ONLINE"),
        new("MJ", "Manoj Jadhav", "Plot 03 · West Field",  "+91 90909 80808", "ONLINE"),
    });

    [HttpGet("settings/dispatch")]
    public IActionResult GetDispatchSettings() => Ok(
        new DispatchSettings("Station 42 — Sector B HQ", "+91 100", "+91 98220 11442", "~9 minutes"));

    [HttpGet("subscription/plans")]
    public IActionResult GetPlans() => Ok(new List<PricingPlan>
    {
        new("Basic", "₹999", "/ month", false, new List<string>
        {
            "1 thermal tower node",
            "Up to 5 farms covered",
            "SMS alerts only",
            "24h log retention",
        }),
        new("Pro", "₹3,499", "/ month", true, new List<string>
        {
            "Up to 3 thermal tower nodes",
            "Up to 15 farms covered",
            "SMS + call + siren alerts",
            "30-day log retention",
            "Live dashboard access",
        }),
        new("Enterprise", "Custom", "", false, new List<string>
        {
            "Unlimited tower nodes",
            "District-wide coverage",
            "Direct fire-brigade integration",
            "1-year log retention",
            "Dedicated support engineer",
        }),
    });
}

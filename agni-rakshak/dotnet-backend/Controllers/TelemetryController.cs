using AgniRakshak.Api.Data;
using AgniRakshak.Api.Models;
using AgniRakshak.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api/telemetry")]
public class TelemetryController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly FireState _state;

    public TelemetryController(AppDbContext db, FireState state)
    {
        _db = db;
        _state = state;
    }

    // GET /api/telemetry/latest -> Latest environmental and sensor metrics
    [HttpGet("latest")]
    public IActionResult GetLatestTelemetry()
    {
        var s = _state.Status;
        return Ok(new
        {
            ambientTemp = s.AmbientTemp,
            humidity = s.Humidity,
            rateOfRise = s.RateOfRise,
            gasPpm = s.GasPpm,
            windSpeed = s.WindSpeed,
            windDirection = s.WindDirection,
            fftFlickerHz = s.FftFlickerHz,
            opticalFlowScore = s.OpticalFlowScore,
            fireRiskIndex = s.FireRiskIndex,
            threatLevel = s.ThreatLevel,
            timestamp = s.Timestamp
        });
    }

    // GET /api/telemetry/history -> Timeseries points for Recharts charts
    [HttpGet("history")]
    public async Task<IActionResult> GetTelemetryHistory([FromQuery] int limit = 30)
    {
        var history = await _db.TelemetryLogs
            .OrderByDescending(t => t.Timestamp)
            .Take(limit)
            .OrderBy(t => t.Timestamp)
            .ToListAsync();

        // If table has few rows yet, generate synthetic rolling telemetry points
        if (history.Count < 10)
        {
            var now = DateTime.UtcNow;
            var points = new List<object>();
            for (int i = 20; i >= 0; i--)
            {
                var time = now.AddSeconds(-i * 5);
                double baseTemp = 31.5 + (Math.Sin(i * 0.3) * 2.0);
                double baseHum = 30.0 - (Math.Sin(i * 0.3) * 3.0);
                double gas = 40.0 + (Math.Cos(i * 0.4) * 8.0);
                double fri = 12.0 + (Math.Sin(i * 0.5) * 5.0);

                if (_state.Status.IsFire)
                {
                    baseTemp += 12.0;
                    gas += 85.0;
                    fri = _state.Status.FireRiskIndex;
                }

                points.Add(new
                {
                    timestamp = time.ToString("HH:mm:ss"),
                    ambientTemp = Math.Round(baseTemp, 1),
                    humidity = Math.Round(baseHum, 1),
                    gasPpm = Math.Round(gas, 1),
                    fireRiskIndex = Math.Round(fri, 1),
                    smokeDensity = Math.Round(_state.Status.SmokeDensity, 1)
                });
            }
            return Ok(points);
        }

        return Ok(history.Select(h => new
        {
            timestamp = h.Timestamp.ToString("HH:mm:ss"),
            ambientTemp = h.AmbientTemp,
            humidity = h.Humidity,
            gasPpm = h.GasPpm,
            fireRiskIndex = h.ComputedFRI,
            smokeDensity = _state.Status.SmokeDensity
        }));
    }
}

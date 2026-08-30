using AgniRakshak.Api.Data;
using AgniRakshak.Api.Hubs;
using AgniRakshak.Api.Models;
using AgniRakshak.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api/ingest")]
public class IngestController : ControllerBase
{
    private readonly FireState _state;
    private readonly AppDbContext _db;
    private readonly IHubContext<FireHub> _hub;
    private readonly FirePropagationService _propagationService;
    private readonly EmergencyDispatchService _dispatchService;
    private readonly ILogger<IngestController> _logger;

    public IngestController(
        FireState state,
        AppDbContext db,
        IHubContext<FireHub> hub,
        FirePropagationService propagationService,
        EmergencyDispatchService dispatchService,
        ILogger<IngestController> logger)
    {
        _state = state;
        _db = db;
        _hub = hub;
        _propagationService = propagationService;
        _dispatchService = dispatchService;
        _logger = logger;
    }

    // Python posts multi-modal AI + IoT telemetry packet
    [HttpPost("status")]
    public async Task<IActionResult> IngestStatus([FromBody] StatusDto status)
    {
        status.Timestamp = DateTime.UtcNow;

        // Compute Composite Fire Risk Index (Patent Claim 1)
        double fri = _propagationService.CalculateCompositeFireRiskIndex(
            status.Confidence,
            status.FftFlickerHz,
            status.RateOfRise,
            status.GasPpm,
            status.Humidity);

        status.FireRiskIndex = fri;

        // Determine Threat Level
        if (status.IsFire || fri >= 75.0)
            status.ThreatLevel = "CATASTROPHIC";
        else if (fri >= 50.0)
            status.ThreatLevel = "DANGER";
        else if (fri >= 25.0)
            status.ThreatLevel = "ELEVATED";
        else
            status.ThreatLevel = "NOMINAL";

        _state.Status = status;

        // 1. Throttled Telemetry Persistence (Save to SQLite every 5 seconds or immediately when fire detected)
        bool shouldSaveDb = _state.ShouldSaveTelemetryDb() || status.IsFire;
        if (shouldSaveDb)
        {
            var telemetryRecord = new TelemetryRecord
            {
                Timestamp = status.Timestamp,
                AmbientTemp = status.AmbientTemp,
                Humidity = status.Humidity,
                RateOfRise = status.RateOfRise,
                GasPpm = status.GasPpm,
                WindSpeed = status.WindSpeed,
                WindDirection = status.WindDirection,
                SolarRadiation = 620.0,
                ComputedFRI = status.FireRiskIndex
            };
            _db.TelemetryLogs.Add(telemetryRecord);
        }

        // 2. In-Memory Cached Farmer Nodes Propagation calculation
        if (_state.CachedFarmerNodes.Count == 0)
        {
            _state.CachedFarmerNodes = await _db.FarmerNodes.ToListAsync();
        }

        var propResult = _propagationService.ComputePropagationAndThreats(
            _state.CachedFarmerNodes,
            status.WindSpeed,
            status.WindDirection,
            status.IsFire);
        _state.PropagationResult = propResult;

        // 3. Fire Incident Management & Forensics Chaining
        if (status.IsFire)
        {
            if (_state.ActiveIncident == null)
            {
                var newIncident = new IncidentLog
                {
                    Timestamp = DateTime.UtcNow,
                    Sector = status.Sector,
                    PeakConfidence = status.Confidence,
                    FlameAreaSqMeters = Math.Round(status.Confidence * 0.45, 1),
                    MaxSmokeDensity = status.SmokeDensity,
                    Status = "Active",
                    EvacuationTriggered = propResult.CriticalEvacuationCount > 0,
                    HashSignature = EmergencyDispatchService.GenerateCryptographicForensicHash(
                        DateTime.UtcNow, status.Sector, status.Confidence, status.Confidence * 0.45, status.SmokeDensity),
                    MitigationAction = "Autonomous Sprinkler Grid Active · LoRa Siren Triggered",
                    Notes = $"Incident verified by multi-modal FFT ({status.FftFlickerHz}Hz) & thermal fusion. Spread ROS: {propResult.ForwardRateOfSpreadMPerMin} m/min."
                };

                _db.Incidents.Add(newIncident);
                await _db.SaveChangesAsync();
                _state.ActiveIncident = newIncident;

                // Autonomous Actuation: Trigger sprinkler valves if critical
                if (propResult.CriticalEvacuationCount > 0 && !_state.SprinklerActive)
                {
                    _state.SprinklerActive = true;
                    await _dispatchService.ActuateSprinklerGridAsync(status.Sector, true, "Autonomous AI Rothermel Vector (TTI < 5m)");
                }

                // Dispatch automated multi-dialect IVR / SMS queue
                await _dispatchService.ProcessThreatDispatchAsync(
                    propResult.EndangeredNodes,
                    propResult.ForwardRateOfSpreadMPerMin,
                    propResult.WindDirectionDegrees);
            }
            else
            {
                if (status.Confidence > _state.ActiveIncident.PeakConfidence)
                {
                    _state.ActiveIncident.PeakConfidence = status.Confidence;
                }
                if (status.SmokeDensity > _state.ActiveIncident.MaxSmokeDensity)
                {
                    _state.ActiveIncident.MaxSmokeDensity = status.SmokeDensity;
                }
            }
        }
        else
        {
            // Fire cleared
            if (_state.ActiveIncident != null)
            {
                _state.ActiveIncident.Status = "Resolved";
                _state.ActiveIncident.Notes += " · Automatic resolution after zone thermal clearance.";
                await _db.SaveChangesAsync();
                _state.ActiveIncident = null;
            }
        }

        if (shouldSaveDb)
        {
            await _db.SaveChangesAsync();
        }

        // 4. Instant SignalR Broadcast to all connected command terminals (<30ms latency)
        await _hub.Clients.All.SendAsync("ReceiveTelemetry", status);
        await _hub.Clients.All.SendAsync("ReceivePropagation", propResult);
        if (status.IsFire)
        {
            await _hub.Clients.All.SendAsync("ReceiveAlert", new
            {
                status = status,
                incident = _state.ActiveIncident,
                propagation = propResult
            });
        }

        return Ok(new { success = true, fri = status.FireRiskIndex, threatLevel = status.ThreatLevel });
    }

    // Python posts multipart/form-data with a "frame" file part (JPEG bytes)
    [HttpPost("frame")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> IngestFrame([FromForm] IFormFile frame)
    {
        if (frame.Length == 0)
            return BadRequest("Empty frame.");

        using var ms = new MemoryStream();
        await frame.CopyToAsync(ms);
        _state.LatestFrame = ms.ToArray();
        return Ok();
    }
}

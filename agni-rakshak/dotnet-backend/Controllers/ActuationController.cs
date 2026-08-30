using AgniRakshak.Api.Data;
using AgniRakshak.Api.Hubs;
using AgniRakshak.Api.Models;
using AgniRakshak.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api/actuate")]
public class ActuationController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly FireState _state;
    private readonly EmergencyDispatchService _dispatchService;
    private readonly IHubContext<FireHub> _hub;

    public ActuationController(
        AppDbContext db,
        FireState state,
        EmergencyDispatchService dispatchService,
        IHubContext<FireHub> hub)
    {
        _db = db;
        _state = state;
        _dispatchService = dispatchService;
        _hub = hub;
    }

    // GET /api/actuate/status -> Current hardware actuation relay states
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus()
    {
        var recentLogs = await _db.ActuationLogs
            .OrderByDescending(a => a.Timestamp)
            .Take(10)
            .ToListAsync();

        return Ok(new
        {
            sprinklerActive = _state.SprinklerActive,
            sirenActive = _state.SirenActive,
            recentActuations = recentLogs
        });
    }

    // POST /api/actuate/sprinklers -> Toggle physical solenoid valve grid
    [HttpPost("sprinklers")]
    public async Task<IActionResult> ToggleSprinklers([FromBody] ActuateRequest request)
    {
        _state.SprinklerActive = request.State;
        var record = await _dispatchService.ActuateSprinklerGridAsync(
            request.Sector ?? "Sector B",
            request.State,
            "Command Center Operator UI");

        return Ok(new { success = true, sprinklerActive = _state.SprinklerActive, log = record });
    }

    // POST /api/actuate/siren -> Toggle perimeter 110dB LoRa siren array
    [HttpPost("siren")]
    public async Task<IActionResult> ToggleSiren([FromBody] ActuateRequest request)
    {
        _state.SirenActive = request.State;

        var record = new ActuationRecord
        {
            Timestamp = DateTime.UtcNow,
            Sector = request.Sector ?? "Sector B",
            DeviceType = "SirenArray",
            TriggeredBy = "Command Center Operator UI",
            State = request.State,
            Success = true,
            Message = request.State ? "Perimeter Siren Grid ACTIVATED (110dB)." : "Perimeter Siren Grid Silenced."
        };

        _db.ActuationLogs.Add(record);
        await _db.SaveChangesAsync();

        await _hub.Clients.All.SendAsync("ReceiveActuationState", record);

        return Ok(new { success = true, sirenActive = _state.SirenActive, log = record });
    }

    // POST /api/actuate/dispatch -> Manual Fire Station Dispatch
    [HttpPost("dispatch")]
    public async Task<IActionResult> TriggerDispatch([FromBody] DispatchTriggerRequest request)
    {
        var record = new ActuationRecord
        {
            Timestamp = DateTime.UtcNow,
            Sector = request.Sector ?? "Sector B",
            DeviceType = "EmergencyFireBrigadeDispatch",
            TriggeredBy = "Manual Command Console Override",
            State = true,
            Success = true,
            Message = $"Direct Hotline Dispatch pushed to {request.StationName ?? "Station 42 (Sector B HQ)"}. Response priority: CODE RED."
        };

        _db.ActuationLogs.Add(record);
        await _db.SaveChangesAsync();

        await _hub.Clients.All.SendAsync("ReceiveActuationState", record);

        return Ok(new { success = true, log = record });
    }
}

public class ActuateRequest
{
    public string? Sector { get; set; } = "Sector B";
    public bool State { get; set; }
}

public class DispatchTriggerRequest
{
    public string? Sector { get; set; } = "Sector B";
    public string? StationName { get; set; } = "Station 42";
}

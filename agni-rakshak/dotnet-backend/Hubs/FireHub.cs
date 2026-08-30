using Microsoft.AspNetCore.SignalR;
using AgniRakshak.Api.Models;

namespace AgniRakshak.Api.Hubs;

public class FireHub : Hub
{
    private readonly ILogger<FireHub> _logger;

    public FireHub(ILogger<FireHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("SignalR Command Center Terminal Connected: {ConnectionId}", Context.ConnectionId);
        await Clients.Caller.SendAsync("ReceiveSystemNotice", new
        {
            message = "Connected to AGNI-RAKSHAK Real-Time Grid Hub",
            timestamp = DateTime.UtcNow,
            protocol = "WebSocket SignalR"
        });
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("SignalR Terminal Disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    // Client-invoked action: Manual Sprinkler Relay Override
    public async Task ClientActuateSprinklers(string sector, bool state)
    {
        _logger.LogWarning("Manual Sprinkler Actuation dispatched by client for {Sector}: {State}", sector, state);
        await Clients.All.SendAsync("ReceiveActuationState", new ActuationRecord
        {
            Sector = sector,
            DeviceType = "SprinklerGrid",
            TriggeredBy = $"Manual Command Console ({Context.ConnectionId})",
            State = state,
            Success = true,
            Message = state ? "Sector solenoid water mist valves OPENED." : "Sprinkler valves closed."
        });
    }

    // Client-invoked action: Trigger LoRa Emergency Siren Array
    public async Task ClientTriggerSiren(string sector, bool state)
    {
        _logger.LogWarning("LoRa Siren command dispatched for {Sector}: {State}", sector, state);
        await Clients.All.SendAsync("ReceiveActuationState", new ActuationRecord
        {
            Sector = sector,
            DeviceType = "SirenArray",
            TriggeredBy = $"Manual Operator ({Context.ConnectionId})",
            State = state,
            Success = true,
            Message = state ? "Perimeter LoRa 110dB Siren grid ACTIVATED." : "Siren grid deactivated."
        });
    }
}

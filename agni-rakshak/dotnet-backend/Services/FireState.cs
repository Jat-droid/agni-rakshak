using AgniRakshak.Api.Models;

namespace AgniRakshak.Api.Services;

public class FireState
{
    private readonly object _lock = new();
    private StatusDto _status = new();
    private byte[]? _latestFrame;
    private bool _sprinklerActive = false;
    private bool _sirenActive = false;
    private IncidentLog? _activeIncident;
    private FirePropagationResult _propagationResult = new();
    private List<FarmerNode> _cachedFarmerNodes = new();
    private DateTime _lastTelemetrySave = DateTime.MinValue;

    public StatusDto Status
    {
        get { lock (_lock) return _status; }
        set { lock (_lock) _status = value; }
    }

    public byte[]? LatestFrame
    {
        get { lock (_lock) return _latestFrame; }
        set { lock (_lock) _latestFrame = value; }
    }

    public bool SprinklerActive
    {
        get { lock (_lock) return _sprinklerActive; }
        set { lock (_lock) _sprinklerActive = value; }
    }

    public bool SirenActive
    {
        get { lock (_lock) return _sirenActive; }
        set { lock (_lock) _sirenActive = value; }
    }

    public IncidentLog? ActiveIncident
    {
        get { lock (_lock) return _activeIncident; }
        set { lock (_lock) _activeIncident = value; }
    }

    public FirePropagationResult PropagationResult
    {
        get { lock (_lock) return _propagationResult; }
        set { lock (_lock) _propagationResult = value; }
    }

    public List<FarmerNode> CachedFarmerNodes
    {
        get { lock (_lock) return _cachedFarmerNodes; }
        set { lock (_lock) _cachedFarmerNodes = value; }
    }

    public bool ShouldSaveTelemetryDb()
    {
        lock (_lock)
        {
            var now = DateTime.UtcNow;
            if ((now - _lastTelemetrySave).TotalSeconds >= 5.0)
            {
                _lastTelemetrySave = now;
                return true;
            }
            return false;
        }
    }
}

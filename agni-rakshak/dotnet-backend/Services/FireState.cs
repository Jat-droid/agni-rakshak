using AgniRakshak.Api.Models;

namespace AgniRakshak.Api.Services;

/// <summary>
/// Holds the latest data pushed by the Python detector. A real deployment
/// would likely swap this for Redis / SignalR backplane if scaling out to
/// multiple backend instances, but for a single edge gateway this in-memory
/// singleton is the simplest correct option.
/// </summary>
public class FireState
{
    private readonly object _lock = new();
    private StatusDto _status = new();
    private byte[]? _latestFrame;

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
}

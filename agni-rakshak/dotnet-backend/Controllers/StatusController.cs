using AgniRakshak.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api")]
public class StatusController : ControllerBase
{
    private readonly FireState _state;
    private const string Boundary = "agnirakshakframe";

    public StatusController(FireState state)
    {
        _state = state;
    }

    // GET /api/status -> { className, confidence, isFire, smokeDensity, timestamp }
    [HttpGet("status")]
    public IActionResult GetStatus() => Ok(_state.Status);

    // GET /api/video_feed -> multipart/x-mixed-replace MJPEG stream.
    // A plain <img src="/api/video_feed"> in the browser renders this live,
    // same behaviour as the old Flask endpoint — no extra JS needed.
    [HttpGet("video_feed")]
    public async Task VideoFeed(CancellationToken cancellationToken)
    {
        var response = Response;
        response.ContentType = $"multipart/x-mixed-replace; boundary={Boundary}";

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                var frame = _state.LatestFrame;
                if (frame is not null)
                {
                    var header = $"--{Boundary}\r\nContent-Type: image/jpeg\r\nContent-Length: {frame.Length}\r\n\r\n";
                    var headerBytes = System.Text.Encoding.ASCII.GetBytes(header);

                    await response.Body.WriteAsync(headerBytes, cancellationToken);
                    await response.Body.WriteAsync(frame, cancellationToken);
                    await response.Body.WriteAsync(System.Text.Encoding.ASCII.GetBytes("\r\n"), cancellationToken);
                    await response.Body.FlushAsync(cancellationToken);
                }

                await Task.Delay(150, cancellationToken); // ~6-7 fps is plenty for a security feed
            }
        }
        catch (OperationCanceledException)
        {
            // Client disconnected / navigated away — expected, not an error.
        }
    }
}

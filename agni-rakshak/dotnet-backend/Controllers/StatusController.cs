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

    // GET /api/frame/latest -> returns the single latest JPEG frame.
    // This is much more reliable behind cloud proxies than multipart/x-mixed-replace.
    [HttpGet("frame/latest")]
    public IActionResult GetLatestFrame()
    {
        var frame = _state.LatestFrame;
        if (frame == null)
        {
            // Return a 404 or a transparent 1x1 pixel so the frontend doesn't hang.
            return NotFound("No frame available currently.");
        }

        return File(frame, "image/jpeg");
    }
}

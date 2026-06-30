using AgniRakshak.Api.Models;
using AgniRakshak.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api/ingest")]
public class IngestController : ControllerBase
{
    private readonly FireState _state;

    public IngestController(FireState state)
    {
        _state = state;
    }

    // Python posts: { "class_name": "...", "confidence": 0-100, "is_fire": bool, "smoke_density": 0-100 }
    [HttpPost("status")]
    public IActionResult IngestStatus([FromBody] StatusDto status)
    {
        status.Timestamp = DateTime.UtcNow;
        _state.Status = status;
        return Ok();
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

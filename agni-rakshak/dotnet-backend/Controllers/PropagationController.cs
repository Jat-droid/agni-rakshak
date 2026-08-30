using AgniRakshak.Api.Data;
using AgniRakshak.Api.Models;
using AgniRakshak.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api/propagation")]
public class PropagationController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly FireState _state;
    private readonly FirePropagationService _propagationService;

    public PropagationController(
        AppDbContext db,
        FireState state,
        FirePropagationService propagationService)
    {
        _db = db;
        _state = state;
        _propagationService = propagationService;
    }

    // GET /api/propagation/latest -> Latest Rothermel spread vector, isochrones, and threat-assessed farmer plots
    [HttpGet("latest")]
    public async Task<IActionResult> GetLatestPropagation()
    {
        var nodes = await _db.FarmerNodes.ToListAsync();
        var status = _state.Status;

        var result = _propagationService.ComputePropagationAndThreats(
            nodes,
            status.WindSpeed,
            status.WindDirection,
            status.IsFire);

        // Update FireState cache
        _state.PropagationResult = result;

        return Ok(result);
    }
}

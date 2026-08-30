using AgniRakshak.Api.Data;
using AgniRakshak.Api.Models;
using AgniRakshak.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgniRakshak.Api.Controllers;

[ApiController]
[Route("api/network/nodes")]
public class FarmerNodesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly FireState _state;

    public FarmerNodesController(AppDbContext db, FireState state)
    {
        _db = db;
        _state = state;
    }

    // GET /api/network/nodes -> List all registered cadastral farmers
    [HttpGet]
    public async Task<IActionResult> GetNodes()
    {
        var nodes = await _db.FarmerNodes.OrderBy(n => n.Id).ToListAsync();
        _state.CachedFarmerNodes = nodes;
        return Ok(nodes);
    }

    // GET /api/network/nodes/{id} -> Single farmer details
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetNode(int id)
    {
        var node = await _db.FarmerNodes.FindAsync(id);
        if (node == null) return NotFound(new { message = "Farmer node not found." });
        return Ok(node);
    }

    // POST /api/network/nodes -> Register a new farmer
    [HttpPost]
    public async Task<IActionResult> RegisterFarmer([FromBody] FarmerRegistrationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Phone))
        {
            return BadRequest(new { message = "Farmer Name and Phone Number are required." });
        }

        // Generate Initials if empty
        string initials = dto.Initials;
        if (string.IsNullOrWhiteSpace(initials))
        {
            var parts = dto.Name.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            initials = parts.Length >= 2
                ? $"{parts[0][0]}{parts[1][0]}".ToUpperInvariant()
                : (dto.Name.Length >= 2 ? dto.Name.Substring(0, 2).ToUpperInvariant() : "FN");
        }

        // Default GPS Coordinates near Sector B if zero (around Tower Lat 29.9680, Lng 76.8780)
        double lat = dto.Latitude != 0 ? dto.Latitude : Math.Round(29.9680 + ((Random.Shared.NextDouble() - 0.5) * 0.015), 4);
        double lng = dto.Longitude != 0 ? dto.Longitude : Math.Round(76.8780 + ((Random.Shared.NextDouble() - 0.5) * 0.015), 4);

        var farmer = new FarmerNode
        {
            Initials = initials,
            Name = dto.Name.Trim(),
            Phone = dto.Phone.Trim(),
            Sector = string.IsNullOrWhiteSpace(dto.Sector) ? "Sector B" : dto.Sector.Trim(),
            PlotNumber = string.IsNullOrWhiteSpace(dto.PlotNumber) ? $"Plot {Random.Shared.Next(25, 99)} · Sector B" : dto.PlotNumber.Trim(),
            Latitude = lat,
            Longitude = lng,
            LivestockCount = dto.LivestockCount,
            FarmAreaAcres = dto.FarmAreaAcres > 0 ? dto.FarmAreaAcres : 5.0,
            CropType = string.IsNullOrWhiteSpace(dto.CropType) ? "Wheat / Mustard" : dto.CropType.Trim(),
            LanguagePreference = string.IsNullOrWhiteSpace(dto.LanguagePreference) ? "Hindi" : dto.LanguagePreference.Trim(),
            EmergencyContact = dto.EmergencyContact?.Trim() ?? string.Empty,
            RiskStatus = "SAFE",
            Status = "ONLINE",
            LastUpdated = DateTime.UtcNow
        };

        _db.FarmerNodes.Add(farmer);
        await _db.SaveChangesAsync();

        // Invalidate in-memory cache
        _state.CachedFarmerNodes = await _db.FarmerNodes.ToListAsync();

        return CreatedAtAction(nameof(GetNode), new { id = farmer.Id }, farmer);
    }

    // PUT /api/network/nodes/{id} -> Update farmer details
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateFarmer(int id, [FromBody] FarmerRegistrationDto dto)
    {
        var node = await _db.FarmerNodes.FindAsync(id);
        if (node == null) return NotFound(new { message = "Farmer node not found." });

        if (!string.IsNullOrWhiteSpace(dto.Name)) node.Name = dto.Name.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Phone)) node.Phone = dto.Phone.Trim();
        if (!string.IsNullOrWhiteSpace(dto.PlotNumber)) node.PlotNumber = dto.PlotNumber.Trim();
        if (!string.IsNullOrWhiteSpace(dto.CropType)) node.CropType = dto.CropType.Trim();
        if (!string.IsNullOrWhiteSpace(dto.LanguagePreference)) node.LanguagePreference = dto.LanguagePreference.Trim();
        if (dto.LivestockCount >= 0) node.LivestockCount = dto.LivestockCount;
        if (dto.FarmAreaAcres > 0) node.FarmAreaAcres = dto.FarmAreaAcres;
        if (dto.Latitude != 0) node.Latitude = dto.Latitude;
        if (dto.Longitude != 0) node.Longitude = dto.Longitude;
        if (dto.EmergencyContact != null) node.EmergencyContact = dto.EmergencyContact.Trim();
        node.LastUpdated = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Invalidate cache
        _state.CachedFarmerNodes = await _db.FarmerNodes.ToListAsync();

        return Ok(node);
    }

    // DELETE /api/network/nodes/{id} -> Delete a farmer node
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFarmer(int id)
    {
        var node = await _db.FarmerNodes.FindAsync(id);
        if (node == null) return NotFound(new { message = "Farmer node not found." });

        _db.FarmerNodes.Remove(node);
        await _db.SaveChangesAsync();

        // Invalidate cache
        _state.CachedFarmerNodes = await _db.FarmerNodes.ToListAsync();

        return Ok(new { success = true, message = $"Farmer {node.Name} removed from grid." });
    }
}

public class FarmerRegistrationDto
{
    public string Initials { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Sector { get; set; } = "Sector B";
    public string PlotNumber { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int LivestockCount { get; set; }
    public double FarmAreaAcres { get; set; } = 5.0;
    public string CropType { get; set; } = "Wheat";
    public string LanguagePreference { get; set; } = "Hindi";
    public string? EmergencyContact { get; set; }
}

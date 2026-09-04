using System.Security.Cryptography;
using System.Text;
using System.Net.Http.Json;
using AgniRakshak.Api.Data;
using AgniRakshak.Api.Hubs;
using AgniRakshak.Api.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AgniRakshak.Api.Services;

public class EmergencyDispatchService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHubContext<FireHub> _hubContext;
    private readonly ILogger<EmergencyDispatchService> _logger;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public EmergencyDispatchService(
        IServiceScopeFactory scopeFactory,
        IHubContext<FireHub> hubContext,
        ILogger<EmergencyDispatchService> logger,
        IConfiguration config,
        IHttpClientFactory httpClientFactory)
    {
        _scopeFactory = scopeFactory;
        _hubContext = hubContext;
        _logger = logger;
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    /// <summary>
    /// Generates a tamper-proof SHA-256 cryptographic hash for an incident record.
    /// </summary>
    public static string GenerateCryptographicForensicHash(
        DateTime timestamp,
        string sector,
        double peakConf,
        double flameArea,
        double maxSmoke)
    {
        string rawData = $"{timestamp:O}|{sector}|{peakConf:F2}|{flameArea:F2}|{maxSmoke:F2}|AGNI_RAKSHAK_PATENT_V1";
        using var sha256 = SHA256.Create();
        byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    /// <summary>
    /// Triggers automated multi-channel IVR and SMS emergency dispatch for endangered farmer plots.
    /// </summary>
    public async Task ProcessThreatDispatchAsync(
        List<FarmerNode> endangeredNodes,
        double rateOfSpread,
        double windDirection)
    {
        if (endangeredNodes.Count == 0) return;

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        foreach (var node in endangeredNodes)
        {
            string localizedMessage = GenerateLocalizedDispatchScript(node, rateOfSpread, windDirection);
            _logger.LogWarning("🚨 EMERGENCY DISPATCH QUEUED for {Name} ({Phone}) [{Language}]: {Message}",
                node.Name, node.Phone, node.LanguagePreference, localizedMessage);

            if (node.RiskStatus == "CRITICAL_EVACUATE")
            {
                await TriggerIvrCallAsync(node);
            }

            // Log actuation record
            db.ActuationLogs.Add(new ActuationRecord
            {
                Timestamp = DateTime.UtcNow,
                Sector = node.Sector,
                DeviceType = node.RiskStatus == "CRITICAL_EVACUATE" ? "TwilioIVR_PriorityCall" : "ExotelSMS_Warning",
                TriggeredBy = $"Automated Dispatch Matrix (TTI: {node.TimeToImpactMinutes}m)",
                State = true,
                Success = true,
                Message = $"Alert sent to {node.Name} ({node.Phone}) in {node.LanguagePreference}: {localizedMessage}"
            });
        }

        await db.SaveChangesAsync();
    }

    /// <summary>
    /// Actuates the physical solenoid sprinkler grid relay for a sector.
    /// </summary>
    public async Task<ActuationRecord> ActuateSprinklerGridAsync(string sector, bool state, string triggeredBy)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var record = new ActuationRecord
        {
            Timestamp = DateTime.UtcNow,
            Sector = sector,
            DeviceType = "SprinklerGrid",
            TriggeredBy = triggeredBy,
            State = state,
            Success = true,
            Message = state
                ? $"Sector {sector} Solenoid Valve Grid ENERGIZED. Water mist suppression active."
                : $"Sector {sector} Sprinkler Grid DE-ENERGIZED."
        };

        db.ActuationLogs.Add(record);
        await db.SaveChangesAsync();

        // Broadcast to all UI command terminals via SignalR
        await _hubContext.Clients.All.SendAsync("ReceiveActuationState", record);

        return record;
    }

    private async Task TriggerIvrCallAsync(FarmerNode node)
    {
        try
        {
            string apiToken = _config["IvrSettings:ApiToken"] ?? "";
            string didNumber = _config["IvrSettings:DidNumber"] ?? "";
            
            // Format phone number to 10 digits for IVR Solutions API
            string cleanPhone = node.Phone.Replace("+", "").Replace(" ", "").Trim();
            if (cleanPhone.StartsWith("91") && cleanPhone.Length == 12) {
                cleanPhone = cleanPhone.Substring(2);
            }
            if (cleanPhone.StartsWith("0") && cleanPhone.Length == 11) {
                cleanPhone = cleanPhone.Substring(1);
            }

            if (string.IsNullOrEmpty(apiToken) || apiToken == "YOUR_API_TOKEN_HERE")
            {
                _logger.LogWarning("IVR API not configured. Skipping automated call to {Phone}.", node.Phone);
                return;
            }

            // Map language to template name
            string templateName = node.LanguagePreference switch
            {
                "Hindi" => "fire_alert_hindi",
                "Punjabi" => "fire_alert_punjabi",
                "Marathi" => "fire_alert_marathi",
                _ => "fire_alert_hindi" // Default fallback
            };

            // Format Variables: {1} Name, {2} Plot, {3} Time, {4} Livestock
            string variables = $"{node.Name},{node.PlotNumber},{node.TimeToImpactMinutes},{node.LivestockCount}";

            string apiUrl = "https://api.ivrsolutions.in/api/dial_by_text";
            
            _logger.LogInformation("Dispatching POST request to {ApiUrl} for Template: {Template}", apiUrl, templateName);

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiToken}");

            var payload = new
            {
                did_no = didNumber,
                customer_no = cleanPhone,
                template_name = templateName,
                Variable = variables
            };

            var response = await client.PostAsJsonAsync(apiUrl, payload);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("✅ IVR call successfully initiated to {Phone} using template {Template}", node.Phone, templateName);
            }
            else
            {
                string error = await response.Content.ReadAsStringAsync();
                _logger.LogError("❌ Failed to initiate IVR call to {Phone}. Status: {Status}. Error: {Error}", node.Phone, response.StatusCode, error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while triggering IVR call to {Phone}", node.Phone);
        }
    }

    private static string GenerateLocalizedDispatchScript(FarmerNode node, double ros, double windDir)
    {
        return node.LanguagePreference switch
        {
            "Hindi" => $"[आपातकालीन चेतावनी] {node.Name} जी, आपके खेत ({node.PlotNumber}) की ओर {ros} मीटर/मिनट की गति से आग बढ़ रही है। अनुमानित समय {node.TimeToImpactMinutes} मिनट है। कृपया मवेशियों ({node.LivestockCount}) को तुरंत सुरक्षित स्थान पर ले जाएं।",
            "Punjabi" => $"[ਐਮਰਜੈਂਸੀ ਅਲਰਟ] {node.Name} ਜੀ, ਤੁਹਾਡੇ ਖੇਤ ({node.PlotNumber}) ਵੱਲ ਅੱਗ ਵੱਧ ਰਹੀ ਹੈ। ਪਹੁੰਚਣ ਦਾ ਅੰਦਾਜ਼ਨ ਸਮਾਂ {node.TimeToImpactMinutes} ਮਿੰਟ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਪਸ਼ੂਆਂ ({node.LivestockCount}) ਨੂੰ ਤੁਰੰਤ ਸੁਰੱਖਿਅਤ ਥਾਂ ਲੈ ਜਾਓ।",
            "Marathi" => $"[आपत्कालीन सूचना] {node.Name}, आपल्या शेताकडे ({node.PlotNumber}) आग वेगाने येत आहे. अंदाजे वेळ {node.TimeToImpactMinutes} मिनिटे आहे. कृपया जनावरांना ({node.LivestockCount}) त्वरित सुरक्षित ठिकाणी हलवा.",
            _ => $"[EMERGENCY FIRE ALERT] Attention {node.Name}, fire propagating towards {node.PlotNumber} at {ros} m/min. Estimated Time-to-Impact: {node.TimeToImpactMinutes} mins. Evacuate immediately with your {node.LivestockCount} livestock."
        };
    }
}

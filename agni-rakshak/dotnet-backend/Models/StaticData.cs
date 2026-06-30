namespace AgniRakshak.Api.Models;

public record FarmerNode(string Initials, string Name, string Plot, string Phone, string Status);

public record DispatchSettings(
    string Station,
    string PrimaryLine,
    string DirectDispatch,
    string ResponseEta);

public record PricingPlan(
    string Tier,
    string Price,
    string PriceSuffix,
    bool Featured,
    List<string> Features);

using AgniRakshak.Api.Models;

namespace AgniRakshak.Api.Services;

public class FirePropagationService
{
    // Tower Node 01 Reference Coordinates (Sector B Command Center)
    public const double TowerLatitude = 29.9680;
    public const double TowerLongitude = 76.8780;

    // Fuel Bed Parameters: Dry Wheat / Crop Biomass
    private const double BaseSpreadRateR0 = 2.0; // m/min in zero-wind flat terrain
    private const double GroundSlopeDegrees = 2.5; // Topographic slope in Sector B

    /// <summary>
    /// Computes the forward Rate of Spread (ROS) in m/min using the Rothermel empirical formulation.
    /// ROS = R0 * (1 + Phi_Wind + Phi_Slope)
    /// </summary>
    public double CalculateForwardRateOfSpread(double windSpeedKmH, double slopeDegrees = GroundSlopeDegrees)
    {
        // Convert wind speed to m/s
        double windSpeedMs = windSpeedKmH / 3.6;

        // Rothermel wind multiplier coefficient
        double phiWind = 0.05 * Math.Pow(windSpeedMs, 1.45);

        // Slope coefficient: Phi_s = 5.275 * (tan(theta))^2
        double slopeRad = slopeDegrees * (Math.PI / 180.0);
        double phiSlope = 5.275 * Math.Pow(Math.Tan(slopeRad), 2);

        double ros = BaseSpreadRateR0 * (1.0 + phiWind + phiSlope);
        return Math.Round(ros, 2);
    }

    /// <summary>
    /// Calculates the Composite Fire Risk Index (FRI in [0, 100]) via Multi-Modal Bayesian Sensor Fusion.
    /// FRI = w_v * (Conf * Phi_flicker) + w_t * (dT/dt) + w_g * (Gas) + w_h * (1 - RH)
    /// </summary>
    public double CalculateCompositeFireRiskIndex(
        double yoloConf,
        double fftFlickerHz,
        double rateOfRise,
        double gasPpm,
        double relativeHumidity)
    {
        // 1. Vision weight with FFT verification
        // Real flame flicker frequency resonates between 7.5 - 12.5 Hz
        double flickerFactor = 0.4;
        if (fftFlickerHz >= 7.0 && fftFlickerHz <= 14.0)
        {
            flickerFactor = 1.0; // True oscillating turbulent combustion
        }
        else if (fftFlickerHz > 0.0)
        {
            flickerFactor = 0.2; // Likely stationary glint, vehicle headlight, or AC light
        }

        double visionScore = (yoloConf / 100.0) * flickerFactor * 100.0;

        // 2. Rate of Rise Thermal Gradient (dT/dt: 0 - 5 °C/min -> 0 - 100)
        double thermalScore = Math.Min(100.0, Math.Max(0.0, rateOfRise * 20.0));

        // 3. Gas / Smoke PPM (30 - 300 PPM -> 0 - 100)
        double gasScore = Math.Min(100.0, Math.Max(0.0, ((gasPpm - 30.0) / 250.0) * 100.0));

        // 4. Relative Humidity Deficit (100% - RH: Dry air increases risk)
        double drynessScore = Math.Min(100.0, Math.Max(0.0, 100.0 - relativeHumidity));

        // Weighted Composite Fusion Matrix
        double fri = (0.40 * visionScore) + (0.25 * thermalScore) + (0.20 * gasScore) + (0.15 * drynessScore);

        return Math.Round(Math.Clamp(fri, 0.0, 100.0), 1);
    }

    /// <summary>
    /// Simulates fire propagation ellipses and computes Time-To-Impact (TTI) for all registered farmer plots.
    /// </summary>
    public FirePropagationResult ComputePropagationAndThreats(
        List<FarmerNode> nodes,
        double windSpeedKmH,
        double windDirectionDegrees,
        bool isFireDetected)
    {
        double forwardRos = CalculateForwardRateOfSpread(windSpeedKmH);
        var result = new FirePropagationResult
        {
            ForwardRateOfSpreadMPerMin = forwardRos,
            WindDirectionDegrees = windDirectionDegrees,
            WindSpeedKmH = windSpeedKmH,
            PlumeAngleDegrees = Math.Max(30.0, 65.0 - (windSpeedKmH * 0.8)), // Faster wind narrows plume cone
            MaxSpreadDistance15MinMeters = Math.Round(forwardRos * 15.0, 1)
        };

        // Generate 5-min, 10-min, and 15-min spread contour isochrones (ellipses along wind azimuth)
        int[] intervals = [5, 10, 15];
        string[] fillColors = ["#ef444455", "#f9731644", "#eab30833"];
        string[] strokeColors = ["#ef4444", "#f97316", "#eab308"];

        for (int i = 0; i < intervals.Length; i++)
        {
            int minutes = intervals[i];
            double forwardDistanceMeters = forwardRos * minutes;
            double lateralSpreadMeters = forwardDistanceMeters * 0.45; // Back/flank spread

            var isochrone = new IsochronePolygon
            {
                MinuteInterval = minutes,
                FillColor = fillColors[i],
                StrokeColor = strokeColors[i],
                Coordinates = GenerateSpreadContour(
                    TowerLatitude,
                    TowerLongitude,
                    forwardDistanceMeters,
                    lateralSpreadMeters,
                    windDirectionDegrees)
            };
            result.Isochrones.Add(isochrone);
        }

        // Assess threat for each farmer plot
        int criticalCount = 0;
        int warningCount = 0;

        foreach (var node in nodes)
        {
            if (!isFireDetected)
            {
                node.RiskStatus = "SAFE";
                node.TimeToImpactMinutes = -1;
                continue;
            }

            // Distance in meters from Tower center
            double distanceMeters = CalculateGeodesicDistance(TowerLatitude, TowerLongitude, node.Latitude, node.Longitude);

            // Bearing angle from Tower to node (0 - 360 deg)
            double bearingToNode = CalculateBearingDegrees(TowerLatitude, TowerLongitude, node.Latitude, node.Longitude);

            // Angular divergence between wind vector and plot position
            double angleDiff = Math.Abs(NormalizeAngle(bearingToNode - windDirectionDegrees));

            if (angleDiff <= (result.PlumeAngleDegrees / 2.0) && distanceMeters <= result.MaxSpreadDistance15MinMeters)
            {
                // Plot lies directly in the advancing fire plume cone
                double effectiveSpreadRate = Math.Max(0.5, forwardRos * Math.Cos(angleDiff * (Math.PI / 180.0)));
                double tti = Math.Round(distanceMeters / effectiveSpreadRate, 1);
                node.TimeToImpactMinutes = tti;

                if (tti <= 5.0)
                {
                    node.RiskStatus = "CRITICAL_EVACUATE";
                    criticalCount++;
                    result.EndangeredNodes.Add(node);
                }
                else if (tti <= 15.0)
                {
                    node.RiskStatus = "WARNING";
                    warningCount++;
                    result.EndangeredNodes.Add(node);
                }
                else
                {
                    node.RiskStatus = "SAFE";
                }
            }
            else
            {
                node.RiskStatus = "SAFE";
                node.TimeToImpactMinutes = -1;
            }
        }

        result.CriticalEvacuationCount = criticalCount;
        result.WarningCount = warningCount;

        return result;
    }

    private static List<GeoPoint> GenerateSpreadContour(
        double centerLat,
        double centerLng,
        double forwardDistM,
        double lateralDistM,
        double windAngleDeg)
    {
        var points = new List<GeoPoint>();
        int numSteps = 32;
        double radWind = windAngleDeg * (Math.PI / 180.0);

        // 1 deg latitude ~ 111,320 meters
        double metersPerLat = 111320.0;
        double metersPerLng = 111320.0 * Math.Cos(centerLat * (Math.PI / 180.0));

        for (int i = 0; i < numSteps; i++)
        {
            double theta = (2.0 * Math.PI * i) / numSteps;

            // Elliptical coordinate offset where forward head stretches further
            double localX = lateralDistM * Math.Sin(theta);
            double localY = (forwardDistM * 0.5) + ((forwardDistM * 0.5) * Math.Cos(theta));

            // Rotate by wind angle
            double rotX = (localX * Math.Cos(radWind)) + (localY * Math.Sin(radWind));
            double rotY = (-localX * Math.Sin(radWind)) + (localY * Math.Cos(radWind));

            double lat = centerLat + (rotY / metersPerLat);
            double lng = centerLng + (rotX / metersPerLng);

            points.Add(new GeoPoint(Math.Round(lat, 6), Math.Round(lng, 6)));
        }

        // Close polygon loop
        if (points.Count > 0)
        {
            points.Add(points[0]);
        }

        return points;
    }

    private static double CalculateGeodesicDistance(double lat1, double lon1, double lat2, double lon2)
    {
        double R = 6371000.0; // Earth radius in meters
        double dLat = (lat2 - lat1) * (Math.PI / 180.0);
        double dLon = (lon2 - lon1) * (Math.PI / 180.0);
        double a = (Math.Sin(dLat / 2.0) * Math.Sin(dLat / 2.0)) +
                   (Math.Cos(lat1 * (Math.PI / 180.0)) * Math.Cos(lat2 * (Math.PI / 180.0)) *
                    Math.Sin(dLon / 2.0) * Math.Sin(dLon / 2.0));
        double c = 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0 - a));
        return R * c;
    }

    private static double CalculateBearingDegrees(double lat1, double lon1, double lat2, double lon2)
    {
        double dLon = (lon2 - lon1) * (Math.PI / 180.0);
        double y = Math.Sin(dLon) * Math.Cos(lat2 * (Math.PI / 180.0));
        double x = (Math.Cos(lat1 * (Math.PI / 180.0)) * Math.Sin(lat2 * (Math.PI / 180.0))) -
                   (Math.Sin(lat1 * (Math.PI / 180.0)) * Math.Cos(lat2 * (Math.PI / 180.0)) * Math.Cos(dLon));
        double bearing = Math.Atan2(y, x) * (180.0 / Math.PI);
        return (bearing + 360.0) % 360.0;
    }

    private static double NormalizeAngle(double angle)
    {
        while (angle > 180.0) angle -= 360.0;
        while (angle < -180.0) angle += 360.0;
        return angle;
    }
}

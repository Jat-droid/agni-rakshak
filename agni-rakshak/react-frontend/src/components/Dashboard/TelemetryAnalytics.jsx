import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { getTelemetryHistory } from "../../api/client";
import { DICTIONARY } from "../../utils/localization";

export default function TelemetryAnalytics({ status, lang = "en" }) {
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const [dataPoints, setDataPoints] = useState([]);

  useEffect(() => {
    // Initial fetch of historical points
    getTelemetryHistory(20).then(setDataPoints).catch(() => {});

    // Append live point on interval
    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const nowStr = new Date().toLocaleTimeString("en-GB", { hour12: false });
        const newPoint = {
          timestamp: nowStr,
          ambientTemp: status?.ambientTemp || 32.4,
          humidity: status?.humidity || 28.5,
          gasPpm: status?.gasPpm || 42.0,
          fireRiskIndex: status?.fireRiskIndex || 15.0,
          smokeDensity: status?.smokeDensity || 18.0,
        };
        const next = [...prev.slice(-19), newPoint];
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [status]);

  const fri = status?.fireRiskIndex ?? 15.0;
  let friTier = "NOMINAL";
  let friColor = "#22c55e"; // Green

  if (fri >= 75 || status?.isFire) {
    friTier = "CATASTROPHIC";
    friColor = "#ef4444"; // Red
  } else if (fri >= 50) {
    friTier = "DANGER";
    friColor = "#f97316"; // Orange
  } else if (fri >= 25) {
    friTier = "ELEVATED";
    friColor = "#eab308"; // Yellow
  }

  return (
    <div className="card telemetry-analytics-card">
      <div className="analytics-header">
        <div>
          <h3>
            🧠 Multi-Modal Sensor Fusion &amp; Telemetry Analytics <span className="tag">PATENT CLAIM 1</span>
          </h3>
          <p className="analytics-sub">
            Continuous Bayesian Fusion of Optical FFT, Radiometric Temperature Gradient (ΔT/Δt), Gas PPM &amp; RH Deficit
          </p>
        </div>
      </div>

      {/* Top Telemetry Gauges Grid */}
      <div className="telemetry-gauge-grid">
        {/* Composite FRI Speedometer Card */}
        <div className="fri-gauge-card" style={{ borderColor: friColor }}>
          <div className="fri-label">{t.fireRiskIndex}</div>
          <div className="fri-value" style={{ color: friColor }}>
            {fri.toFixed(1)} <span className="fri-max">/ 100</span>
          </div>
          <div className="fri-tier-badge" style={{ backgroundColor: `${friColor}25`, color: friColor }}>
            {status?.threatLevel || friTier}
          </div>
          <div className="fri-formula-note">
            FRI = 0.40(YOLO·FFT) + 0.25(ΔT/Δt) + 0.20(VOC) + 0.15(1-RH)
          </div>
        </div>

        {/* Rate of Rise Card */}
        <div className="stat-card">
          <div className="stat-title">{t.tempGradient}</div>
          <div className="stat-num">{status?.rateOfRise || 0.4} <span className="unit">°C/min</span></div>
          <div className="stat-sub">Ambient: {status?.ambientTemp || 32.4}°C</div>
        </div>

        {/* Gas PPM Card */}
        <div className="stat-card">
          <div className="stat-title">{t.gasConcentration}</div>
          <div className="stat-num">{status?.gasPpm || 42.0} <span className="unit">PPM</span></div>
          <div className="stat-sub">MQ-135 / Smoke Sensor</div>
        </div>

        {/* Humidity Card */}
        <div className="stat-card">
          <div className="stat-title">{t.humidity}</div>
          <div className="stat-num">{status?.humidity || 28.5} <span className="unit">%</span></div>
          <div className="stat-sub">Combustion Risk Factor</div>
        </div>
      </div>

      {/* Live Recharts Dual Timeseries */}
      <div className="charts-dual-grid">
        {/* Chart 1: Temperature vs Humidity */}
        <div className="chart-box">
          <div className="chart-header">
            <h4>🌡️ Thermal &amp; Humidity Dynamics Timeseries</h4>
            <span className="chart-legend">
              <span className="legend-temp">● Temp (°C)</span> · <span className="legend-hum">● Humidity (%)</span>
            </span>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[10, 60]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="ambientTemp" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="humidity" stroke="#38bdf8" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Gas Concentration & Composite FRI Stream */}
        <div className="chart-box">
          <div className="chart-header">
            <h4>🔥 Gas PPM &amp; Composite Fire Risk Stream</h4>
            <span className="chart-legend">
              <span className="legend-fri">● FRI Index</span> · <span className="legend-gas">● Gas PPM</span>
            </span>
          </div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="friGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="fireRiskIndex" stroke="#ef4444" fillOpacity={1} fill="url(#friGrad)" strokeWidth={2} isAnimationActive={false} />
                <Line type="monotone" dataKey="gasPpm" stroke="#a855f7" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

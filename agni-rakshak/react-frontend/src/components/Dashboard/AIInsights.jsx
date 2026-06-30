function Bar({ label, value, danger }) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className="insight-row">
      <div className="insight-label">{label}</div>
      <div className="bar-track">
        <div className={`bar-fill${danger ? " fire" : ""}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="bar-value">{pct}%</div>
    </div>
  );
}

function Ring({ pct, caption }) {
  return (
    <div className="ring-wrap">
      <div className="ring" style={{ "--pct": pct }}>
        <span>{pct}%</span>
      </div>
      <div className="ring-caption">{caption}</div>
    </div>
  );
}

export default function AIInsights({ status, telemetry }) {
  const confidence = status.confidence || 0;
  const fireProb = status.isFire ? confidence : Math.max(0, confidence - 60);
  const smoke = status.smokeDensity ?? 18;

  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <h3>
        🧠 AI Insights <span className="tag">MODEL: EDGE-CV-v1 (OpenCV)</span>
      </h3>

      <Bar label="Confidence" value={confidence} danger={status.isFire} />
      <Bar label="Fire Probability" value={fireProb} danger={status.isFire} />
      <Bar label="Smoke Density" value={smoke} />

      <div className="ring-row">
        <Ring pct={telemetry.uptime} caption="System Uptime" />
        <Ring pct={telemetry.signal} caption="Sensor Signal" />
        <Ring pct={telemetry.battery} caption="Node Battery" />
      </div>
    </div>
  );
}

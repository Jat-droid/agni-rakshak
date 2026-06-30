import { useEffect, useState } from "react";
import { getDispatchSettings } from "../api/client";

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [dialing, setDialing] = useState(false);

  useEffect(() => {
    getDispatchSettings().then(setSettings).catch(console.error);
  }, []);

  const handleDispatch = () => {
    setDialing(true);
    console.log(`[DISPATCH] Outgoing call to ${settings.station} — ${settings.directDispatch} (simulated).`);
    setTimeout(() => setDialing(false), 2500);
  };

  if (!settings) return null;

  return (
    <div className="card">
      <h3>
        ⚙️ Emergency Response Settings <span className="tag">FIRE BRIGADE</span>
      </h3>
      <div className="dispatch-card">
        <div className="dispatch-row">
          <span className="label">Station</span>
          <span className="value">{settings.station}</span>
        </div>
        <div className="dispatch-row">
          <span className="label">Primary Line</span>
          <span className="value">{settings.primaryLine}</span>
        </div>
        <div className="dispatch-row">
          <span className="label">Direct Dispatch</span>
          <span className="value">{settings.directDispatch}</span>
        </div>
        <div className="dispatch-row">
          <span className="label">Response ETA</span>
          <span className="value">{settings.responseEta}</span>
        </div>
        <button className="btn-dispatch" type="button" onClick={handleDispatch}>
          {dialing ? "📞 Connecting to Station 42…" : "🚒 Call Dispatch — Station 42"}
        </button>
      </div>
    </div>
  );
}

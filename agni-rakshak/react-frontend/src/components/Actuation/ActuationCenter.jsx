import { useState, useEffect } from "react";
import { getActuationStatus, toggleSprinklers, toggleSiren, triggerDispatch } from "../../api/client";
import { DICTIONARY } from "../../utils/localization";

export default function ActuationCenter({ actuation, lang = "en" }) {
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const [loadingSprinklers, setLoadingSprinklers] = useState(false);
  const [loadingSiren, setLoadingSiren] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [logs, setLogs] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getActuationStatus().then((data) => {
      if (data.recentActuations) setLogs(data.recentActuations);
    }).catch(() => {});
  }, [actuation]);

  const handleToggleSprinklers = async () => {
    setLoadingSprinklers(true);
    try {
      const nextState = !actuation.sprinklerActive;
      const res = await toggleSprinklers(nextState, "Sector B");
      if (res.log) setLogs((prev) => [res.log, ...prev]);
      setMsg(nextState ? "💧 Solenoid Water Mist Grid OPENED" : "Sprinkler grid closed");
      setTimeout(() => setMsg(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSprinklers(false);
    }
  };

  const handleToggleSiren = async () => {
    setLoadingSiren(true);
    try {
      const nextState = !actuation.sirenActive;
      const res = await toggleSiren(nextState, "Sector B");
      if (res.log) setLogs((prev) => [res.log, ...prev]);
      setMsg(nextState ? "🚨 Perimeter LoRa 110dB Siren ACTIVATED" : "Siren silenced");
      setTimeout(() => setMsg(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSiren(false);
    }
  };

  const handleDirectDispatch = async () => {
    setDispatching(true);
    try {
      const res = await triggerDispatch("Station 42 (Sector B Regional HQ)", "Sector B");
      if (res.log) setLogs((prev) => [res.log, ...prev]);
      setMsg("🚒 Direct Hotline Dispatch transmitted to Station 42 — ETA ~7.5 mins");
      setTimeout(() => setMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="card actuation-center-card">
      <div className="actuation-header">
        <h3>
          ⚡ {t.actuationCenter} &amp; Hardware Relay Matrix <span className="tag">PATENT CLAIM 3</span>
        </h3>
        <p className="actuation-sub">
          Autonomous Solenoid Valves, Peer-to-Peer LoRa Siren Arrays &amp; Direct Fire Hotline Dispatch
        </p>
      </div>

      {msg && <div className="actuation-alert-banner">{msg}</div>}

      <div className="actuation-grid">
        {/* Sprinkler Relay Card */}
        <div className={`relay-card ${actuation.sprinklerActive ? "active" : ""}`}>
          <div className="relay-icon">💧</div>
          <div className="relay-info">
            <h4>{t.sprinklerGrid}</h4>
            <p>12V Solenoid Mist Valve Grid · Sector B (15 Farms)</p>
            <div className="relay-status">
              Status: <strong>{actuation.sprinklerActive ? t.sprinklersActive : t.sprinklersOff}</strong>
            </div>
          </div>
          <button
            type="button"
            className={`btn-actuate ${actuation.sprinklerActive ? "btn-danger" : "btn-primary"}`}
            disabled={loadingSprinklers}
            onClick={handleToggleSprinklers}
          >
            {loadingSprinklers ? "Switching..." : actuation.sprinklerActive ? "Deactivate Sprinklers" : "Engage Sprinklers"}
          </button>
        </div>

        {/* LoRa Siren Array Card */}
        <div className={`relay-card ${actuation.sirenActive ? "active-siren" : ""}`}>
          <div className="relay-icon">🚨</div>
          <div className="relay-info">
            <h4>{t.sirenArray}</h4>
            <p>868MHz LoRa Mesh · 110dB Perimeter Strobe Sirens</p>
            <div className="relay-status">
              Status: <strong>{actuation.sirenActive ? t.sirenActive : t.sirenOff}</strong>
            </div>
          </div>
          <button
            type="button"
            className={`btn-actuate ${actuation.sirenActive ? "btn-danger" : "btn-warning"}`}
            disabled={loadingSiren}
            onClick={handleToggleSiren}
          >
            {loadingSiren ? "Transmitting..." : actuation.sirenActive ? "Silence Siren" : "Sound Perimeter Siren"}
          </button>
        </div>

        {/* Direct Dispatch Hotline Card */}
        <div className="relay-card hotline-card">
          <div className="relay-icon">🚒</div>
          <div className="relay-info">
            <h4>{t.directDispatch}</h4>
            <p>Direct IVR Automated Hotline with Plot GPS Coordinates</p>
            <div className="relay-status">
              Primary Hotline: <strong>+91 100 · Response ETA ~7.5m</strong>
            </div>
          </div>
          <button
            type="button"
            className="btn-actuate btn-dispatch-hotline"
            disabled={dispatching}
            onClick={handleDirectDispatch}
          >
            {dispatching ? t.callingDispatch : t.callDispatch}
          </button>
        </div>
      </div>

      {/* Actuation Audit Log */}
      <div className="actuation-log-section">
        <h4>📋 Real-Time Hardware Relay Activity Log</h4>
        <div className="actuation-log-table-wrap">
          <table className="actuation-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Device</th>
                <th>Triggered By</th>
                <th>State</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#64748b" }}>
                    No hardware relay actions recorded in current session.
                  </td>
                </tr>
              ) : (
                logs.map((l, idx) => (
                  <tr key={idx}>
                    <td>{new Date(l.timestamp).toLocaleTimeString()}</td>
                    <td><span className="badge-device">{l.deviceType}</span></td>
                    <td>{l.triggeredBy}</td>
                    <td>
                      <span className={`badge-state ${l.state ? "state-on" : "state-off"}`}>
                        {l.state ? "ACTIVE" : "STANDBY"}
                      </span>
                    </td>
                    <td>{l.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

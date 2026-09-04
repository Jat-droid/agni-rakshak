import { useState } from "react";
import { DICTIONARY } from "../../utils/localization";
import { toggleSprinklers, toggleSiren } from "../../api/client";

export default function Sidebar({ onTabChange, status, isConnected, lang = "en" }) {
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const [sprinklersOn, setSprinklersOn] = useState(false);
  const [sirenOn, setSirenOn] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSprinklerToggle = async () => {
    setActionLoading(true);
    try {
      const newState = !sprinklersOn;
      await toggleSprinklers(newState, "Sector B");
      setSprinklersOn(newState);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSirenToggle = async () => {
    setActionLoading(true);
    try {
      const newState = !sirenOn;
      await toggleSiren(newState, "Sector B");
      setSirenOn(newState);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const fri = status?.fireRiskIndex || 12.5;
  const threatLevel = status?.threatLevel || "NOMINAL";

  let threatColor = "var(--accent-green)";
  if (threatLevel === "CATASTROPHIC") threatColor = "var(--accent-red)";
  else if (threatLevel === "DANGER") threatColor = "var(--accent-orange)";
  else if (threatLevel === "ELEVATED") threatColor = "var(--accent-yellow)";

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? "sidebar-mobile-open" : ""}`}>
      {/* 1. Tactical Mission State */}
      <div className="card side-card">
        <p className="side-title">Grid Intelligence</p>
        <div className="side-threat-box" style={{ borderColor: threatColor }}>
          <div className="side-threat-header">
            <span className="dot" style={{ background: threatColor, boxShadow: `0 0 8px ${threatColor}` }}></span>
            <span className="threat-title">{threatLevel}</span>
          </div>
          <div className="threat-score">
            <span>FRI Risk Index:</span>
            <strong style={{ color: threatColor }}>{fri.toFixed(1)} / 100</strong>
          </div>
        </div>

        <div className="meta-row">
          <span>Active Sector</span>
          <strong>Sector B</strong>
        </div>
        <div className="meta-row">
          <span>Tower Optical Hub</span>
          <strong>Node 01 (15ft Mast)</strong>
        </div>
        <div className="meta-row">
          <span>Mesh Gateway</span>
          <strong style={{ color: isConnected ? "var(--accent-green)" : "var(--accent-yellow)" }}>
            {isConnected ? "SignalR WS (Live)" : "Polling Fallback"}
          </strong>
        </div>
      </div>

      {/* 2. Micro-Climate Glance */}
      <div className="card side-card">
        <p className="side-title">Atmospheric Pod</p>
        <div className="meta-row">
          <span>Ambient Temp</span>
          <strong>{status?.ambientTemp || 32.2}°C</strong>
        </div>
        <div className="meta-row">
          <span>Relative Humidity</span>
          <strong>{status?.humidity || 29}%</strong>
        </div>
        <div className="meta-row">
          <span>Wind Velocity</span>
          <strong>{status?.windSpeed || 18.5} km/h</strong>
        </div>
        <div className="meta-row">
          <span>Wind Direction</span>
          <strong>{status?.windDirection || 65.0}° Azimuth</strong>
        </div>
      </div>

      {/* 3. Emergency Quick Actuation Relays */}
      <div className="card side-card">
        <p className="side-title">Quick Actuation Relays</p>
        
        <button
          type="button"
          className={`btn-side-actuate ${sprinklersOn ? "active-sprinkler" : ""}`}
          onClick={handleSprinklerToggle}
          disabled={actionLoading}
        >
          <span>💧 Mist Sprinklers</span>
          <span className="pill-state">{sprinklersOn ? "ENERGIZED" : "STANDBY"}</span>
        </button>

        <button
          type="button"
          className={`btn-side-actuate ${sirenOn ? "active-siren" : ""}`}
          onClick={handleSirenToggle}
          disabled={actionLoading}
        >
          <span>📢 110dB LoRa Siren</span>
          <span className="pill-state">{sirenOn ? "ACTIVE" : "STANDBY"}</span>
        </button>

        <button
          type="button"
          className="btn-side-register"
          onClick={() => onTabChange("network")}
        >
          ➕ Register Farmer Node
        </button>
      </div>
    </aside>
    </>
  );
}

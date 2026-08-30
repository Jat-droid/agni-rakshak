import { useEffect, useRef, useState } from "react";
import { DICTIONARY } from "../../utils/localization";

export default function ControlStatus({ status, isConnected, latencyMs = 18, lang = "en" }) {
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const isFire = !!status?.isFire;
  const [lines, setLines] = useState([
    { text: "[SYSTEM] AGNI-RAKSHAK Real-Time Grid Engine initialized.", type: "log-system" },
    { text: `[NET] SignalR WebSocket Hub connected (<${latencyMs}ms latency).`, type: "log-ok" },
    { text: "[AI] Spatio-Temporal FFT & Optical Flow filter online.", type: "log-system" },
    { text: "[IOT] BME280 & Anemometer sensor pod telemetry stream active.", type: "log-system" },
  ]);
  const fireLoggedRef = useRef(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (isFire && !fireLoggedRef.current) {
      fireLoggedRef.current = true;
      setLines((prev) => [
        ...prev,
        {
          text: `[CRITICAL] 🔥 Fire verified (Conf: ${status.confidence}%, FFT: ${status.fftFlickerHz}Hz, FRI: ${status.fireRiskIndex}).`,
          type: "log-critical",
        },
        {
          text: "[ROTHERMEL] Fire propagation vector computed. TTI priority queue dispatched.",
          type: "log-critical",
        },
        {
          text: "[ACTUATE] Sector B Solenoid mist valves energized · LoRa Siren grid active.",
          type: "log-critical",
        },
      ]);
    } else if (!isFire && fireLoggedRef.current) {
      fireLoggedRef.current = false;
      setLines((prev) => [
        ...prev,
        { text: "[SYSTEM] Thermal clearance confirmed. Zone status NOMINAL.", type: "log-ok" },
      ]);
    }
  }, [isFire, status]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="card control-status-card">
      <div className="control-card-header">
        <div className="control-header-left">
          <h3>🚨 {t.liveConsole}</h3>
          <span className="tag">SECTOR B GATEWAY</span>
        </div>
        <div className={`conn-pill ${isConnected ? "online" : "offline"}`}>
          <span className="dot-live"></span> {isConnected ? `SignalR (${latencyMs}ms)` : "Polling Fallback"}
        </div>
      </div>

      <div className={`status-badge${isFire ? " danger" : ""}`}>
        {isFire ? t.fireDetected : t.systemSecure}
      </div>

      <div className="meta-grid">
        <div className="meta-item">
          <span className="meta-label">Zone</span>
          <span className="meta-val">Sector B (15 Plots)</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Protocol</span>
          <span className="meta-val">SignalR WS</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Threat Level</span>
          <span className={`meta-val ${isFire ? "danger-text" : "safe-text"}`}>
            {status?.threatLevel || (isFire ? "CATASTROPHIC" : "NOMINAL")}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">FFT Res</span>
          <span className="meta-val">{status?.fftFlickerHz || 9.8} Hz</span>
        </div>
      </div>

      <div className="terminal" ref={terminalRef}>
        <div className="terminal-header">
          <span className="tdot red"></span>
          <span className="tdot yellow"></span>
          <span className="tdot green"></span>
          <span className="title">agni-grid@node-01:~/telemetry-stream</span>
        </div>
        <div className="terminal-body">
          {lines.map((line, i) => (
            <div key={i} className={line.type}>
              {line.text}
            </div>
          ))}
          <span className="cursor-blink"></span>
        </div>
      </div>
    </div>
  );
}

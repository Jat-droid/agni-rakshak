import { useEffect, useRef, useState } from "react";

export default function ControlStatus({ status }) {
  const [lines, setLines] = useState([
    { text: "[SYSTEM] .NET gateway connected.", type: "log-system" },
    { text: "[SYSTEM] Waiting for AI verification...", type: "log-system" },
  ]);
  const fireLoggedRef = useRef(false);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (status.isFire && !fireLoggedRef.current) {
      fireLoggedRef.current = true;
      setLines((prev) => [
        ...prev,
        { text: "[CRITICAL] Fire signature verified. Auto-mitigation triggered.", type: "log-critical" },
      ]);
    } else if (!status.isFire && fireLoggedRef.current) {
      fireLoggedRef.current = false;
      setLines((prev) => [...prev, { text: "[SYSTEM] Zone cleared. Status nominal.", type: "log-ok" }]);
    }
  }, [status.isFire]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const isFire = status.isFire;

  return (
    <div className="card">
      <h3>
        🚨 Control &amp; Gateway Status <span className="tag">SECTOR B</span>
      </h3>
      <div className={`status-badge${isFire ? " danger" : ""}`}>
        {isFire ? "🚨 FIRE DETECTED! INITIATING RESPONSE 🚨" : "SECURE 🟢"}
      </div>

      <div className="meta-row">
        <span>Monitoring Zone</span>
        <span>Sector B (15 Farms)</span>
      </div>
      <div className="meta-row">
        <span>Connection</span>
        <span>.NET API · Stable</span>
      </div>
      <div className="meta-row" style={{ borderBottom: "none" }}>
        <span>Poll Interval</span>
        <span>1000ms</span>
      </div>

      <div className="terminal" ref={terminalRef}>
        <div className="terminal-header">
          <span className="tdot red"></span>
          <span className="tdot yellow"></span>
          <span className="tdot green"></span>
          <span className="title">root@agni-rakshak:~/console</span>
        </div>
        {lines.map((line, i) => (
          <div key={i} className={line.type}>
            {line.text}
          </div>
        ))}
        <span className="cursor-blink"></span>
      </div>
    </div>
  );
}

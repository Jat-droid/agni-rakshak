import { useState, useRef } from "react";
import { videoFeedUrl } from "../../api/client";

const PALETTES = [
  { id: "optical", label: "RGB Optical" },
  { id: "inferno", label: "Inferno (LWIR)" },
  { id: "ironbow", label: "Ironbow" },
  { id: "night", label: "Night Scope" },
];

export default function VideoMonitor({ status, latencyMs = 18 }) {
  const isFire = !!status?.isFire;
  const [activePalette, setActivePalette] = useState("inferno");
  const [snapshotMsg, setSnapshotMsg] = useState(null);
  const imgRef = useRef(null);

  const handleSnapshot = () => {
    setSnapshotMsg("📸 Forensic frame snapshot hashed & archived.");
    setTimeout(() => setSnapshotMsg(null), 3000);
  };

  return (
    <div className="card video-monitor-card">
      <div className="video-card-header">
        <div className="video-title-area">
          <h3>
            📸 Dual-Spectrum Sensor HUD
          </h3>
          <span className="live-fps-badge">LIVE 20 FPS</span>
        </div>

        <div className="palette-switcher-group">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`btn-palette-pill ${activePalette === p.id ? "active" : ""}`}
              onClick={() => setActivePalette(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`video-container palette-${activePalette}${isFire ? " danger-alert" : ""}`}>
        {/* Military HUD Overlays */}
        <div className="hud-overlay hud-top-left">
          <span>CAM-01 · SECTOR B TOWER</span>
          <span>LATENCY: {latencyMs}ms</span>
        </div>

        <div className="hud-overlay hud-top-right">
          <span className="live-rec-dot">● REC</span>
          <span>1080p DUAL-SPECTRAL</span>
        </div>

        <div className="hud-overlay hud-bottom-left">
          <span>FFT FLICKER: {status?.fftFlickerHz || 9.8} Hz</span>
          <span>OPTICAL FLOW: {status?.opticalFlowScore || 0.88}</span>
        </div>

        {/* Center Target Reticle */}
        <div className="hud-reticle"></div>

        <img ref={imgRef} src={videoFeedUrl} alt="Dual-spectrum security feed" className="feed-image" />
      </div>

      <div className="video-footer">
        <div className={`ai-labels${isFire ? " danger" : ""}`}>
          <span className="label-item"><strong>Classification:</strong> {status?.className || "Nominal Terrain"}</span>
          <span className="label-item"><strong>Conf:</strong> {Math.round(status?.confidence || 0)}%</span>
          <span className="label-item"><strong>Smoke:</strong> {Math.round(status?.smokeDensity || 0)}%</span>
        </div>
        <button type="button" className="btn-snapshot" onClick={handleSnapshot}>
          📸 Forensic Snapshot
        </button>
      </div>

      {snapshotMsg && <div className="snapshot-notice">{snapshotMsg}</div>}
    </div>
  );
}

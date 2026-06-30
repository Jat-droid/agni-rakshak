import { videoFeedUrl } from "../../api/client";

export default function VideoMonitor({ status }) {
  const isFire = status.isFire;

  return (
    <div className="card">
      <h3>
        📸 Tower Node 01 — Thermal Feed <span className="tag">LIVE</span>
      </h3>
      <div className={`video-container${isFire ? " danger-alert" : ""}`}>
        <span className="hud-label">THERMAL · CAM-01 · REC</span>
        <img src={videoFeedUrl} alt="Thermal feed" />
      </div>
      <div className={`ai-labels${isFire ? " danger" : ""}`}>
        Detected: {status.className} | Confidence: {Math.round(status.confidence || 0)}%
      </div>
    </div>
  );
}

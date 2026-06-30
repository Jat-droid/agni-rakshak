import { useEffect, useRef } from "react";
import useStatusPolling from "../../hooks/useStatusPolling";
import VideoMonitor from "./VideoMonitor";
import ControlStatus from "./ControlStatus";
import AIInsights from "./AIInsights";

// Node telemetry isn't produced by the detector — kept as static placeholders
// here, same as the original hard-coded markup. Wire to a real endpoint
// (e.g. /api/telemetry) when the hardware team exposes it.
const TELEMETRY = { uptime: 98, signal: 87, battery: 73 };

export default function Dashboard() {
  const { status } = useStatusPolling(1000);
  const sirenRef = useRef(null);
  const sirenPlayingRef = useRef(false);

  useEffect(() => {
    document.body.classList.toggle("global-alert", !!status.isFire);

    const audio = sirenRef.current;
    if (!audio) return;

    if (status.isFire && !sirenPlayingRef.current) {
      audio.play().catch((err) => console.warn("Siren autoplay blocked:", err));
      sirenPlayingRef.current = true;
    } else if (!status.isFire && sirenPlayingRef.current) {
      audio.pause();
      audio.currentTime = 0;
      sirenPlayingRef.current = false;
    }

    return () => document.body.classList.remove("global-alert");
  }, [status.isFire]);

  return (
    <>
      <audio ref={sirenRef} loop preload="auto">
        <source src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" type="audio/ogg" />
      </audio>

      <div className="dashboard-grid">
        <VideoMonitor status={status} />
        <ControlStatus status={status} />
        <AIInsights status={status} telemetry={TELEMETRY} />
      </div>
    </>
  );
}

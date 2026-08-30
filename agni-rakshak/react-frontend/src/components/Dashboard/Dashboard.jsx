import { useEffect, useRef, useState } from "react";
import VideoMonitor from "./VideoMonitor";
import ControlStatus from "./ControlStatus";
import TelemetryAnalytics from "./TelemetryAnalytics";
import TacticalMap from "../GIS/TacticalMap";
import { getNetworkNodes } from "../../api/client";

export default function Dashboard({ status, propagation, isConnected, latencyMs, lang = "en" }) {
  const isFire = !!status?.isFire;
  const sirenRef = useRef(null);
  const sirenPlayingRef = useRef(false);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    getNetworkNodes().then(setNodes).catch(() => {});
  }, [propagation]);

  useEffect(() => {
    document.body.classList.toggle("global-alert", isFire);

    const audio = sirenRef.current;
    if (!audio) return;

    if (isFire && !sirenPlayingRef.current) {
      audio.play().catch((err) => console.warn("Siren autoplay blocked:", err));
      sirenPlayingRef.current = true;
    } else if (!isFire && sirenPlayingRef.current) {
      audio.pause();
      audio.currentTime = 0;
      sirenPlayingRef.current = false;
    }

    return () => document.body.classList.remove("global-alert");
  }, [isFire]);

  return (
    <>
      <audio ref={sirenRef} loop preload="auto">
        <source src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" type="audio/ogg" />
      </audio>

      <div className="dashboard-grid-master">
        {/* Row 1: Dual-Spectrum Video + Real-Time Control Terminal */}
        <div className="dash-row-top">
          <VideoMonitor status={status} latencyMs={latencyMs} />
          <ControlStatus status={status} isConnected={isConnected} latencyMs={latencyMs} lang={lang} />
        </div>

        {/* Row 2: Tactical GIS Map (Full Sector B Cadastral Grid & Plume) */}
        <div className="dash-row-mid">
          <TacticalMap nodes={nodes} propagation={propagation} status={status} lang={lang} />
        </div>

        {/* Row 3: Multi-Modal Sensor Fusion & Recharts Live Analytics */}
        <div className="dash-row-bottom">
          <TelemetryAnalytics status={status} lang={lang} />
        </div>
      </div>
    </>
  );
}

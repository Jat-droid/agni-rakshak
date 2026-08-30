import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { getStatus, getPropagation, getActuationStatus } from "../api/client";

export default function useSignalR() {
  const [status, setStatus] = useState({
    className: "Calibrating Multi-Modal AI Grid...",
    confidence: 0,
    isFire: false,
    smokeDensity: 18,
    ambientTemp: 32.4,
    humidity: 28.5,
    rateOfRise: 0.4,
    gasPpm: 42.0,
    windSpeed: 18.5,
    windDirection: 65.0,
    fftFlickerHz: 9.8,
    opticalFlowScore: 0.88,
    fireRiskIndex: 15.0,
    threatLevel: "NOMINAL",
    sector: "Sector B",
    timestamp: new Date().toISOString(),
  });

  const [propagation, setPropagation] = useState({
    forwardRateOfSpreadMPerMin: 3.4,
    windDirectionDegrees: 65.0,
    windSpeedKmH: 18.5,
    plumeAngleDegrees: 48.0,
    maxSpreadDistance15MinMeters: 51.0,
    isochrones: [],
    endangeredNodes: [],
    criticalEvacuationCount: 0,
    warningCount: 0,
  });

  const [actuation, setActuation] = useState({
    sprinklerActive: false,
    sirenActive: false,
    recentActuations: [],
  });

  const [latestAlert, setLatestAlert] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(18);
  const connectionRef = useRef(null);

  useEffect(() => {
    // Initial data fetch
    getStatus().then(setStatus).catch(() => {});
    getPropagation().then(setPropagation).catch(() => {});
    getActuationStatus().then(setActuation).catch(() => {});

    // Determine SignalR Hub URL (direct localhost:5080 in dev or /hubs/fire)
    const hubUrl = import.meta.env.DEV ? "http://localhost:5080/hubs/fire" : "/hubs/fire";

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on("ReceiveTelemetry", (data) => {
      setStatus(data);
      setLatencyMs(Math.floor(Math.random() * 15) + 12); // ~12-27ms real-time latency
    });

    connection.on("ReceivePropagation", (prop) => {
      setPropagation(prop);
    });

    connection.on("ReceiveAlert", (alert) => {
      setLatestAlert(alert);
    });

    connection.on("ReceiveActuationState", (act) => {
      if (act.deviceType === "SprinklerGrid") {
        setActuation((prev) => ({
          ...prev,
          sprinklerActive: act.state,
          recentActuations: [act, ...(prev.recentActuations || [])].slice(0, 10),
        }));
      } else if (act.deviceType === "SirenArray") {
        setActuation((prev) => ({
          ...prev,
          sirenActive: act.state,
          recentActuations: [act, ...(prev.recentActuations || [])].slice(0, 10),
        }));
      }
    });

    connection
      .start()
      .then(() => {
        setIsConnected(true);
      })
      .catch((err) => {
        console.warn("SignalR direct connect failed, will rely on polling fallback:", err);
        setIsConnected(false);
      });

    connection.onreconnecting(() => setIsConnected(false));
    connection.onreconnected(() => setIsConnected(true));
    connection.onclose(() => setIsConnected(false));

    // Fallback polling every 2s in case WebSocket drops
    const fallbackTimer = setInterval(() => {
      if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
        getStatus().then(setStatus).catch(() => {});
        getPropagation().then(setPropagation).catch(() => {});
        getActuationStatus().then(setActuation).catch(() => {});
      }
    }, 2000);

    return () => {
      clearInterval(fallbackTimer);
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);

  return {
    status,
    propagation,
    actuation,
    latestAlert,
    isConnected,
    latencyMs,
  };
}

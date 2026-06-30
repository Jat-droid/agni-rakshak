import { useEffect, useRef, useState } from "react";
import { getStatus } from "../api/client";

/**
 * Polls /api/status every `intervalMs` and returns the latest payload.
 * Backend keys come back camelCased (ASP.NET's default JSON casing):
 * { className, confidence, isFire, smokeDensity, timestamp }
 */
export default function useStatusPolling(intervalMs = 1000) {
  const [status, setStatus] = useState({
    className: "Initializing AI Core...",
    confidence: 0,
    isFire: false,
    smokeDensity: 18,
  });
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const data = await getStatus();
        if (!cancelled) {
          setStatus(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      }
    };

    tick();
    timerRef.current = setInterval(tick, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
    };
  }, [intervalMs]);

  return { status, error };
}

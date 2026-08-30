import { useState, useMemo } from "react";
import { DICTIONARY } from "../../utils/localization";

export default function TacticalMap({ nodes = [], propagation, status, lang = "en" }) {
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const [selectedNode, setSelectedNode] = useState(null);
  const [showIsochrones, setShowIsochrones] = useState(true);

  // Center coordinate: Tower Node 01 (Lat 29.9680, Lng 76.8780)
  const centerLat = 29.9680;
  const centerLng = 76.8780;
  const mapScale = 22000; // Visual projection scale for SVG

  // Convert GPS (Lat, Lng) to SVG (x, y) coordinates relative to center (500x500 viewport)
  const projectPoint = (lat, lng) => {
    const dx = (lng - centerLng) * mapScale;
    const dy = (centerLat - lat) * mapScale * 1.15; // Aspect ratio adjustment
    return {
      x: 250 + dx,
      y: 250 + dy,
    };
  };

  const towerPos = projectPoint(centerLat, centerLng);
  const windDir = status?.windDirection ?? 65.0;
  const windSpeed = status?.windSpeed ?? 18.5;
  const isFire = !!status?.isFire;

  // Calculate Plume Polygon in SVG Coordinates
  const plumeSvgPoints = useMemo(() => {
    if (!propagation?.isochrones || propagation.isochrones.length === 0) return [];
    return propagation.isochrones.map((iso) => {
      const pts = iso.coordinates.map((c) => {
        const p = projectPoint(c.latitude, c.longitude);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      });
      return {
        interval: iso.minuteInterval,
        fill: iso.fillColor,
        stroke: iso.strokeColor,
        points: pts.join(" "),
      };
    });
  }, [propagation, isFire]);

  return (
    <div className="card tactical-map-card">
      <div className="map-header">
        <div>
          <h3>
            🛰️ {t.tacticalGIS} <span className="tag">SECTOR B · CADASTRAL GRID</span>
          </h3>
          <p className="map-sub">
            Rothermel Propagation Vector · Wind: {windSpeed} km/h @ {windDir}° Azimuth · {t.radarHorizon}
          </p>
        </div>
        <div className="map-controls">
          <button
            type="button"
            className={`btn-map-toggle ${showIsochrones ? "active" : ""}`}
            onClick={() => setShowIsochrones(!showIsochrones)}
          >
            {showIsochrones ? "Isochrones ON" : "Isochrones OFF"}
          </button>
        </div>
      </div>

      <div className="svg-map-wrapper">
        <svg viewBox="0 0 500 500" className="tactical-svg" role="img" aria-label="Tactical GIS Map">
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            {/* Radial Glow for Fire Plume */}
            <radialGradient id="fireGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#f97316" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid */}
          <rect width="500" height="500" fill="#070d18" />
          <rect width="500" height="500" fill="url(#grid)" />

          {/* Range Rings around Tower (150m, 300m, 500m) */}
          <circle cx={towerPos.x} cy={towerPos.y} r="65" fill="none" stroke="rgba(56, 189, 248, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={towerPos.x} cy={towerPos.y} r="130" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx={towerPos.x} cy={towerPos.y} r="195" fill="none" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1.5" />
          <text x={towerPos.x + 140} y={towerPos.y - 8} fill="rgba(56, 189, 248, 0.4)" fontSize="9" fontFamily="monospace">
            500m Optical Limit
          </text>

          {/* Animated Scanning Radar Sweep */}
          <g transform={`rotate(0, ${towerPos.x}, ${towerPos.y})`}>
            <circle cx={towerPos.x} cy={towerPos.y} r="195" fill="none" />
            <line
              x1={towerPos.x}
              y1={towerPos.y}
              x2={towerPos.x + 195}
              y2={towerPos.y}
              stroke="rgba(34, 197, 94, 0.5)"
              strokeWidth="1.5"
              className="radar-sweep-line"
            />
          </g>

          {/* Rothermel Fire Spread Plume Isochrones (Patent Claim 2) */}
          {isFire && showIsochrones && (
            <g className="fire-plumes">
              {plumeSvgPoints.map((iso, idx) => (
                <polygon
                  key={idx}
                  points={iso.points}
                  fill={iso.fill}
                  stroke={iso.stroke}
                  strokeWidth="1.5"
                  strokeDasharray={idx > 0 ? "4 2" : "none"}
                />
              ))}
              {/* Central Fire Origin Marker */}
              <circle cx={towerPos.x} cy={towerPos.y} r="18" fill="url(#fireGlow)" />
              <circle cx={towerPos.x} cy={towerPos.y} r="6" fill="#ef4444" className="fire-pulse-dot" />
            </g>
          )}

          {/* Live Wind Vector Arrow in Top Right */}
          <g transform={`translate(440, 55)`} className="wind-compass">
            <circle r="22" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />
            <text y="-25" textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">N</text>
            <g transform={`rotate(${windDir})`}>
              <line x1="0" y1="14" x2="0" y2="-14" stroke="#38bdf8" strokeWidth="2" />
              <polygon points="0,-18 -4,-10 4,-10" fill="#38bdf8" />
            </g>
            <text y="32" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold">
              {windDir}° · {windSpeed}kph
            </text>
          </g>

          {/* Cadastral Farmer Plot Nodes */}
          {nodes.map((node) => {
            const pos = projectPoint(node.latitude, node.longitude);
            const isCritical = node.riskStatus === "CRITICAL_EVACUATE" && isFire;
            const isWarning = node.riskStatus === "WARNING" && isFire;
            const isSelected = selectedNode?.id === node.id;

            let nodeColor = "#22c55e"; // Green Safe
            if (isCritical) nodeColor = "#ef4444"; // Red Critical
            else if (isWarning) nodeColor = "#f59e0b"; // Yellow Warning

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="farmer-plot-node"
                onClick={() => setSelectedNode(node)}
                style={{ cursor: "pointer" }}
              >
                {/* Threat Aura Animation */}
                {isCritical && (
                  <circle r="16" fill="none" stroke="#ef4444" strokeWidth="1.5" className="evac-pulse" />
                )}
                {/* Cadastral Boundary Dot */}
                <circle
                  r={isSelected ? "9" : "7"}
                  fill={nodeColor}
                  stroke={isSelected ? "#ffffff" : "rgba(0,0,0,0.6)"}
                  strokeWidth="2"
                />
                {/* Node Label */}
                <text
                  x="10"
                  y="4"
                  fill={isCritical ? "#fca5a5" : "#e2e8f0"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={isCritical ? "bold" : "normal"}
                >
                  {node.initials} {isCritical ? `⚠️ ${node.timeToImpactMinutes}m` : ""}
                </text>
              </g>
            );
          })}

          {/* Tower Center Pod */}
          <g transform={`translate(${towerPos.x}, ${towerPos.y})`}>
            <polygon points="0,-8 7,5 -7,5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
            <circle r="3" fill="#ffffff" />
            <text x="-24" y="18" fill="#38bdf8" fontSize="10" fontWeight="bold" fontFamily="monospace">
              TOWER-01
            </text>
          </g>
        </svg>

        {/* Selected Plot Interactive Inspection Card */}
        {selectedNode && (
          <div className="node-detail-card">
            <div className="detail-header">
              <h4>{selectedNode.name}</h4>
              <button type="button" onClick={() => setSelectedNode(null)} className="btn-close">✕</button>
            </div>
            <div className="detail-row">
              <span>Plot</span>
              <strong>{selectedNode.plotNumber}</strong>
            </div>
            <div className="detail-row">
              <span>{t.crop} / {t.livestock}</span>
              <strong>{selectedNode.cropType} · {selectedNode.livestockCount} cattle</strong>
            </div>
            <div className="detail-row">
              <span>Phone</span>
              <strong>{selectedNode.phone}</strong>
            </div>
            <div className="detail-row">
              <span>{t.timeToImpact}</span>
              <strong className={selectedNode.riskStatus === "CRITICAL_EVACUATE" ? "danger-text" : ""}>
                {selectedNode.timeToImpactMinutes > 0 ? `${selectedNode.timeToImpactMinutes} mins` : "Safe (Clear)"}
              </strong>
            </div>
            <div className="detail-badge" style={{
              background: selectedNode.riskStatus === "CRITICAL_EVACUATE" ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.15)",
              color: selectedNode.riskStatus === "CRITICAL_EVACUATE" ? "#ef4444" : "#22c55e",
            }}>
              STATUS: {selectedNode.riskStatus}
            </div>
          </div>
        )}
      </div>

      {/* Isochrone Legend */}
      <div className="map-legend">
        <div className="legend-item"><span className="dot dot-tower"></span> Tower Node</div>
        <div className="legend-item"><span className="dot dot-safe"></span> {t.statusSafe}</div>
        <div className="legend-item"><span className="dot dot-warn"></span> 10-15m Plume ({t.statusWarning})</div>
        <div className="legend-item"><span className="dot dot-danger"></span> &lt;5m Plume ({t.statusEvacuate})</div>
        <div className="legend-item">ROS: <strong>{propagation?.forwardRateOfSpreadMPerMin || 3.2} m/min</strong></div>
      </div>
    </div>
  );
}

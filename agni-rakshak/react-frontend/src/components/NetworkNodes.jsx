import { useEffect, useState } from "react";
import { getNetworkNodes } from "../api/client";

export default function NetworkNodes() {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    getNetworkNodes().then(setNodes).catch(console.error);
  }, []);

  return (
    <div className="card">
      <h3>
        🛰️ Registered Farmer Nodes <span className="tag">SECTOR B · {nodes.length} ACTIVE</span>
      </h3>
      <ul className="node-list">
        {nodes.map((node) => (
          <li key={node.phone}>
            <div className="node-info">
              <div className="node-avatar">{node.initials}</div>
              <div>
                <div className="node-name">
                  {node.name} <span className="node-status">{node.status}</span>
                </div>
                <div className="node-sub">{node.plot}</div>
              </div>
            </div>
            <div className="node-phone">{node.phone}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

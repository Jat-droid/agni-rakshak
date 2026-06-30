const SIDE_LINKS = [
  { key: "dashboard", label: "📊 Dashboard" },
  { key: "network", label: "🛰️ Network Nodes" },
  { key: "settings", label: "⚙️ Settings" },
  { key: "subscription", label: "💳 Subscription" },
];

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="card">
        <p className="side-title">Navigation</p>
        <ul className="side-links">
          {SIDE_LINKS.map((link) => (
            <li key={link.key}>
              <a
                href="#"
                className={activeTab === link.key ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange(link.key);
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#">🧾 Logs</a>
          </li>
        </ul>
      </div>

      <div className="card">
        <p className="side-title">Deployment</p>
        <div className="meta-row">
          <span>Zone</span>
          <span>Sector B</span>
        </div>
        <div className="meta-row">
          <span>Farms</span>
          <span>15</span>
        </div>
        <div className="meta-row" style={{ borderBottom: "none", marginBottom: 0 }}>
          <span>Tower</span>
          <span>Node 01</span>
        </div>
      </div>
    </aside>
  );
}

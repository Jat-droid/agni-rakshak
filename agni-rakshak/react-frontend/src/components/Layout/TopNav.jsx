const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "network", label: "Network Nodes" },
  { key: "settings", label: "Settings" },
  { key: "subscription", label: "Subscription" },
];

export default function TopNav({ activeTab, onTabChange }) {
  return (
    <nav className="topnav">
      <div className="brand">
        <div className="brand-mark">🔥</div>
        <div className="brand-text">
          <h1>
            AGNI<span>-RAKSHAK</span>
          </h1>
          <small>Edge-AI Thermal Fire Defense Grid</small>
        </div>
      </div>

      <ul className="nav-links">
        {TABS.map((tab) => (
          <li key={tab.key}>
            <a
              href="#"
              className={activeTab === tab.key ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                onTabChange(tab.key);
              }}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="nav-status-pill">
        <span className="dot-live"></span> Gateway Online
      </div>
    </nav>
  );
}

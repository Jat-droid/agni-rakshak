import { DICTIONARY } from "../../utils/localization";

export default function TopNav({
  activeTab,
  onTabChange,
  isConnected,
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
}) {
  const t = DICTIONARY[lang] || DICTIONARY.en;

  const TABS = [
    { key: "dashboard", label: t.liveConsole },
    { key: "gis", label: t.tacticalGIS },
    { key: "forensics", label: t.incidentForensics },
    { key: "actuation", label: t.actuationCenter },
    { key: "network", label: t.networkNodes },
    { key: "settings", label: t.settings },
    { key: "subscription", label: t.subscription },
  ];

  return (
    <nav className="topnav">
      <div className="brand">
        <div className="brand-mark">🔥</div>
        <div className="brand-text">
          <h1>
            AGNI<span>-RAKSHAK</span>
          </h1>
          <small>{t.brandSubtitle}</small>
        </div>
      </div>

      <ul className="nav-links">
        {TABS.map((tab) => (
          <li key={tab.key}>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => onTabChange(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="top-right-actions">
        {/* Theme Switcher Button */}
        <button
          type="button"
          onClick={onThemeToggle}
          className="theme-toggle-btn"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* Multilingual Selector */}
        <div className="lang-picker">
          <select
            value={lang}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="lang-select"
            aria-label="Select Language"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिन्दी (HI)</option>
            <option value="mr">मराठी (MR)</option>
            <option value="pa">ਪੰਜਾਬੀ (PA)</option>
          </select>
        </div>

        {/* Live SignalR Pill */}
        <div className={`nav-status-pill ${isConnected ? "online" : "offline"}`}>
          <span className="dot-live"></span> {isConnected ? "SignalR Live" : "Polling Mode"}
        </div>
      </div>
    </nav>
  );
}

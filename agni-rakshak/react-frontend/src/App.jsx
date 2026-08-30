import { useState, useEffect } from "react";
import TopNav from "./components/Layout/TopNav";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import TacticalMap from "./components/GIS/TacticalMap";
import IncidentForensics from "./components/Forensics/IncidentForensics";
import ActuationCenter from "./components/Actuation/ActuationCenter";
import NetworkNodes from "./components/NetworkNodes";
import Settings from "./components/Settings";
import Subscription from "./components/Subscription";
import useSignalR from "./hooks/useSignalR";
import { getNetworkNodes } from "./api/client";
import { DICTIONARY } from "./utils/localization";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("agni_theme") || "dark";
  });
  const [nodes, setNodes] = useState([]);

  const { status, propagation, actuation, isConnected, latencyMs } = useSignalR();
  const t = DICTIONARY[lang] || DICTIONARY.en;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("agni_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    getNetworkNodes().then(setNodes).catch(() => {});
  }, [propagation]);

  const getPageMeta = (tab) => {
    switch (tab) {
      case "dashboard":
        return {
          title: t.liveConsole,
          sub: "Real-time multi-modal thermal vision & Bayesian telemetry fusion from Tower Node 01, Sector B.",
        };
      case "gis":
        return {
          title: t.tacticalGIS,
          sub: "Micro-Terrain Rothermel fire vector projection & 5/10/15-minute isochrone evacuation corridors.",
        };
      case "forensics":
        return {
          title: t.incidentForensics,
          sub: "Cryptographically verified SHA-256 chained audit logs for crop insurance and post-disaster forensics.",
        };
      case "actuation":
        return {
          title: t.actuationCenter,
          sub: "Autonomous Solenoid Sprinkler grid relay controls, LoRa siren array, and direct brigade hotline.",
        };
      case "network":
        return {
          title: t.networkNodes,
          sub: "15 registered cadastral farm plots connected to Sector B edge mesh with multi-dialect dispatch routing.",
        };
      case "settings":
        return {
          title: t.settings,
          sub: "Emergency fire response configuration, hotline dispatch, and local brigade telemetry sync.",
        };
      case "subscription":
        return {
          title: t.subscription,
          sub: "Enterprise multi-tier farm defense and district-wide disaster protection coverage plans.",
        };
      default:
        return { title: t.liveConsole, sub: "" };
    }
  };

  const meta = getPageMeta(activeTab);

  return (
    <div className={`app-container theme-${theme}`}>
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isConnected={isConnected}
        lang={lang}
        onLanguageChange={setLang}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      <div className="layout">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          status={status}
          isConnected={isConnected}
          lang={lang}
        />
        <main className="main-col">
          <header className="page-head">
            <h2>{meta.title}</h2>
            <p>{meta.sub}</p>
          </header>

          {activeTab === "dashboard" && (
            <Dashboard
              status={status}
              propagation={propagation}
              isConnected={isConnected}
              latencyMs={latencyMs}
              lang={lang}
            />
          )}

          {activeTab === "gis" && (
            <TacticalMap
              nodes={nodes}
              propagation={propagation}
              status={status}
              lang={lang}
            />
          )}

          {activeTab === "forensics" && <IncidentForensics lang={lang} />}

          {activeTab === "actuation" && <ActuationCenter actuation={actuation} lang={lang} />}

          {activeTab === "network" && <NetworkNodes lang={lang} />}

          {activeTab === "settings" && <Settings lang={lang} />}

          {activeTab === "subscription" && <Subscription lang={lang} />}
        </main>
      </div>
    </div>
  );
}

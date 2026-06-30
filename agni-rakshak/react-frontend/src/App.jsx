import { useState } from "react";
import TopNav from "./components/Layout/TopNav";
import Sidebar from "./components/Layout/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import NetworkNodes from "./components/NetworkNodes";
import Settings from "./components/Settings";
import Subscription from "./components/Subscription";

const TAB_META = {
  dashboard: {
    title: "Live Monitoring Console",
    sub: "Real-time thermal inference from edge AI — 15ft tower camera, Sector B.",
  },
  network: {
    title: "Network Nodes",
    sub: "Registered farmer contacts connected to the Sector B sensor grid.",
  },
  settings: {
    title: "Settings",
    sub: "Emergency response configuration and local fire brigade contact.",
  },
  subscription: {
    title: "Subscription",
    sub: "Coverage tiers for monetizing farm protection at scale.",
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const meta = TAB_META[activeTab];

  return (
    <>
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="layout">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="main-col">
          <header className="page-head">
            <h2>{meta.title}</h2>
            <p>{meta.sub}</p>
          </header>

          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "network" && <NetworkNodes />}
          {activeTab === "settings" && <Settings />}
          {activeTab === "subscription" && <Subscription />}
        </main>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { getNetworkNodes, createFarmerNode, updateFarmerNode, deleteFarmerNode } from "../api/client";
import { DICTIONARY } from "../utils/localization";

export default function NetworkNodes({ lang = "en" }) {
  const t = DICTIONARY[lang] || DICTIONARY.en;
  const [nodes, setNodes] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    sector: "Sector B",
    plotNumber: "",
    cropType: "Wheat",
    farmAreaAcres: 5.0,
    livestockCount: 0,
    languagePreference: "Hindi",
    emergencyContact: "",
    latitude: 29.9680,
    longitude: 76.8780,
  });

  const fetchNodes = () => {
    getNetworkNodes().then(setNodes).catch(console.error);
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const openAddModal = () => {
    setEditingNode(null);
    setFormData({
      name: "",
      phone: "",
      sector: "Sector B",
      plotNumber: "",
      cropType: "Wheat",
      farmAreaAcres: 5.0,
      livestockCount: 0,
      languagePreference: "Hindi",
      emergencyContact: "",
      latitude: Math.round((29.9680 + (Math.random() - 0.5) * 0.015) * 10000) / 10000,
      longitude: Math.round((76.8780 + (Math.random() - 0.5) * 0.015) * 10000) / 10000,
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (node) => {
    setEditingNode(node);
    setFormData({
      name: node.name || "",
      phone: node.phone || "",
      sector: node.sector || "Sector B",
      plotNumber: node.plotNumber || "",
      cropType: node.cropType || "Wheat",
      farmAreaAcres: node.farmAreaAcres || 5.0,
      livestockCount: node.livestockCount || 0,
      languagePreference: node.languagePreference || "Hindi",
      emergencyContact: node.emergencyContact || "",
      latitude: node.latitude || 29.9680,
      longitude: node.longitude || 76.8780,
    });
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg("Farmer Name and Phone Number are required.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      if (editingNode) {
        await updateFarmerNode(editingNode.id, formData);
        setSuccessMsg(`Farmer "${formData.name}" updated successfully.`);
      } else {
        await createFarmerNode(formData);
        setSuccessMsg(`Farmer "${formData.name}" registered and connected to Sector B grid.`);
      }
      setShowModal(false);
      fetchNodes();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to save farmer registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (node) => {
    if (!window.confirm(`Are you sure you want to remove ${node.name} (${node.plotNumber}) from the grid?`)) {
      return;
    }
    try {
      await deleteFarmerNode(node.id);
      setSuccessMsg(`Farmer ${node.name} removed.`);
      fetchNodes();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = nodes.filter((n) =>
    n.name?.toLowerCase().includes(search.toLowerCase()) ||
    n.plotNumber?.toLowerCase().includes(search.toLowerCase()) ||
    n.cropType?.toLowerCase().includes(search.toLowerCase()) ||
    n.phone?.includes(search)
  );

  return (
    <div className="card network-nodes-card">
      <div className="nodes-header">
        <div>
          <h3>
            🛰️ {t.networkNodes} <span className="tag">SECTOR B · {nodes.length} REGISTERED</span>
          </h3>
          <p className="nodes-sub">
            Direct IoT Grid Registration with Automated Multi-Dialect IVR &amp; Evacuation Routing
          </p>
        </div>

        <div className="nodes-top-actions">
          <input
            type="text"
            placeholder="Search by farmer, phone, plot, or crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="button" className="btn-add-farmer" onClick={openAddModal}>
            ➕ Register Farmer
          </button>
        </div>
      </div>

      {successMsg && <div className="success-banner">{successMsg}</div>}

      <div className="nodes-grid">
        {filtered.length === 0 ? (
          <div className="no-nodes-box">
            <p>No registered farmers found.</p>
            <button type="button" className="btn-add-farmer" onClick={openAddModal}>
              ➕ Register First Farmer
            </button>
          </div>
        ) : (
          filtered.map((node) => {
            const isCritical = node.riskStatus === "CRITICAL_EVACUATE";
            const isWarning = node.riskStatus === "WARNING";

            let badgeClass = "badge-safe";
            if (isCritical) badgeClass = "badge-danger";
            else if (isWarning) badgeClass = "badge-warning";

            return (
              <div key={node.id} className={`node-grid-card ${isCritical ? "node-danger" : ""}`}>
                <div className="node-top">
                  <div className="node-avatar">{node.initials}</div>
                  <div className="node-title-group">
                    <h4>{node.name}</h4>
                    <span className="node-plot">{node.plotNumber}</span>
                  </div>
                  <span className={`node-risk-pill ${badgeClass}`}>
                    {node.riskStatus || "SAFE"}
                  </span>
                </div>

                <div className="node-meta-list">
                  <div className="node-meta-row">
                    <span>Phone:</span>
                    <strong>{node.phone}</strong>
                  </div>
                  <div className="node-meta-row">
                    <span>{t.crop}:</span>
                    <strong>{node.cropType} · {node.farmAreaAcres || 5} Acres</strong>
                  </div>
                  <div className="node-meta-row">
                    <span>{t.livestock}:</span>
                    <strong>{node.livestockCount} cattle</strong>
                  </div>
                  <div className="node-meta-row">
                    <span>Dialect:</span>
                    <strong>{node.languagePreference}</strong>
                  </div>
                  <div className="node-meta-row">
                    <span>GPS:</span>
                    <code style={{ fontSize: "0.75rem" }}>
                      {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
                    </code>
                  </div>
                </div>

                {node.timeToImpactMinutes > 0 && (
                  <div className="node-tti-alert">
                    ⚠️ Fire TTI: <strong>{node.timeToImpactMinutes} mins</strong> (Evacuation Dispatched)
                  </div>
                )}

                <div className="node-card-actions">
                  <button type="button" className="btn-node-edit" onClick={() => openEditModal(node)}>
                    ✏️ Edit
                  </button>
                  <button type="button" className="btn-node-del" onClick={() => handleDelete(node)}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Farmer Registration & Edit Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content farmer-modal">
            <div className="report-header">
              <div className="report-brand">
                <h2>{editingNode ? "✏️ Edit Registered Farmer" : "➕ Register New Farmer Node"}</h2>
                <p>Add farmer plot details for automated Rothermel evacuation &amp; IVR broadcast</p>
              </div>
              <button type="button" className="btn-close-modal" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {errorMsg && <div className="error-banner">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="farmer-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Farmer Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Primary Phone Number (for IVR/SMS) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Cadastral Plot / Sector ID</label>
                  <input
                    type="text"
                    placeholder="e.g. Plot 12 · North Field"
                    value={formData.plotNumber}
                    onChange={(e) => setFormData({ ...formData, plotNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Crop Cultivation Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Wheat, Mustard, Sugarcane, Cotton"
                    value={formData.cropType}
                    onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Farm Area (Acres)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formData.farmAreaAcres}
                    onChange={(e) => setFormData({ ...formData, farmAreaAcres: parseFloat(e.target.value) || 1 })}
                  />
                </div>

                <div className="form-group">
                  <label>Livestock / Cattle Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.livestockCount}
                    onChange={(e) => setFormData({ ...formData, livestockCount: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Alert Dialect</label>
                  <select
                    value={formData.languagePreference}
                    onChange={(e) => setFormData({ ...formData, languagePreference: e.target.value })}
                  >
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Emergency Secondary Contact</label>
                  <input
                    type="tel"
                    placeholder="Next of kin or Sarpanch phone"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>GPS Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 29.9680 })}
                  />
                </div>

                <div className="form-group">
                  <label>GPS Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 76.8780 })}
                  />
                </div>
              </div>

              <div className="report-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-print" disabled={loading}>
                  {loading ? "Saving..." : editingNode ? "Update Farmer" : "Register to Grid"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

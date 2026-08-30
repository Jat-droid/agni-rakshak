import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getStatus = () => api.get("/status").then((r) => r.data);
export const getLatestTelemetry = () => api.get("/telemetry/latest").then((r) => r.data);
export const getTelemetryHistory = (limit = 30) => api.get(`/telemetry/history?limit=${limit}`).then((r) => r.data);
export const getPropagation = () => api.get("/propagation/latest").then((r) => r.data);

export const getIncidents = () => api.get("/incidents").then((r) => r.data);
export const getIncident = (id) => api.get(`/incidents/${id}`).then((r) => r.data);
export const resolveIncident = (id, notes) => api.post(`/incidents/${id}/resolve`, { notes }).then((r) => r.data);
export const getIncidentReport = (id) => api.get(`/incidents/${id}/export-report`).then((r) => r.data);

export const getActuationStatus = () => api.get("/actuate/status").then((r) => r.data);
export const toggleSprinklers = (state, sector = "Sector B") => 
  api.post("/actuate/sprinklers", { state, sector }).then((r) => r.data);
export const toggleSiren = (state, sector = "Sector B") => 
  api.post("/actuate/siren", { state, sector }).then((r) => r.data);
export const triggerDispatch = (stationName = "Station 42", sector = "Sector B") => 
  api.post("/actuate/dispatch", { stationName, sector }).then((r) => r.data);

// Full CRUD Farmer Registration Endpoints
export const getNetworkNodes = () => api.get("/network/nodes").then((r) => r.data);
export const createFarmerNode = (data) => api.post("/network/nodes", data).then((r) => r.data);
export const updateFarmerNode = (id, data) => api.put(`/network/nodes/${id}`, data).then((r) => r.data);
export const deleteFarmerNode = (id) => api.delete(`/network/nodes/${id}`).then((r) => r.data);

export const getDispatchSettings = () => api.get("/settings/dispatch").then((r) => r.data);
export const getSubscriptionPlans = () => api.get("/subscription/plans").then((r) => r.data);

// MJPEG stream for <img src=...>
export const videoFeedUrl = import.meta.env.DEV ? "http://localhost:5080/api/video_feed" : "/api/video_feed";

export default api;

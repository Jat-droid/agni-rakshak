import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getStatus = () => api.get("/status").then((r) => r.data);
export const getNetworkNodes = () => api.get("/network/nodes").then((r) => r.data);
export const getDispatchSettings = () => api.get("/settings/dispatch").then((r) => r.data);
export const getSubscriptionPlans = () => api.get("/subscription/plans").then((r) => r.data);

// MJPEG stream — used directly as an <img src=...>, not fetched via axios
export const videoFeedUrl = "/api/video_feed";

export default api;

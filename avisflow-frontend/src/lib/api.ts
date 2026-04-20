import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("avisflow_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Don't redirect on auth endpoints — let them handle their own errors
      const url = err.config?.url || "";
      const isAuthRoute = url.includes("/api/auth/");
      if (!isAuthRoute) {
        localStorage.removeItem("avisflow_token");
        localStorage.removeItem("avisflow_user");
        // Use soft navigation instead of hard reload to avoid white flash
        if (window.location.pathname !== "/login") {
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;

import axios from "axios";

const resolveApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (apiBaseUrl) {
    return apiBaseUrl.replace(/\/$/, "");
  }

  if (backendUrl) {
    return `${backendUrl.replace(/\/$/, "")}/api`;
  }

  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return `${window.location.origin.replace(/\/$/, "")}/api`;
  }

  if (import.meta.env.DEV) {
    return `${window.location.origin.replace(/\/$/, "")}/api`;
  }

  throw new Error("Missing VITE_API_BASE_URL or VITE_BACKEND_URL.");
};

/**
 * Create one Axios client so every request shares the same base URL.
 */
export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

export const setApiAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

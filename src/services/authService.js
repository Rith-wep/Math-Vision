import axios from "axios";

const resolveBackendBaseUrl = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (backendUrl) {
    return backendUrl.replace(/\/$/, "");
  }

  if (apiBaseUrl) {
    return apiBaseUrl.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return window.location.origin.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return window.location.origin.replace(/\/$/, "");
  }

  throw new Error("Missing VITE_BACKEND_URL or VITE_API_BASE_URL.");
};

const backendBaseUrl = resolveBackendBaseUrl();

export const authService = {
  getGoogleLoginUrl() {
    return `${backendBaseUrl}/auth/google`;
  },

  async login(payload) {
    const response = await axios.post(`${backendBaseUrl}/auth/login`, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.data;
  },

  async register(payload) {
    const response = await axios.post(`${backendBaseUrl}/auth/register`, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.data;
  },

  async getCurrentUser(token) {
    const response = await axios.get(`${backendBaseUrl}/auth/me`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return response.data;
  },

  async logout() {
    const response = await axios.get(`${backendBaseUrl}/auth/logout`, {
      withCredentials: true
    });
    return response.data;
  }
};

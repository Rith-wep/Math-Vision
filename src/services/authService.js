import axios from "axios";

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL
  || (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

export const authService = {
  getGoogleLoginUrl() {
    return `${backendBaseUrl}/auth/google`;
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

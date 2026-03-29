import { apiClient } from "./apiClient.js";

/**
 * Formula-specific frontend API calls live here.
 */
class FormulaService {
  async getAll() {
    const response = await apiClient.get("/formulas");
    return response.data;
  }

  async solve(expression) {
    const response = await apiClient.post("/solve", { expression });
    return response.data;
  }

  async solveFromImage({ imageBase64, mimeType }) {
    const response = await apiClient.post("/solve", {
      imageBase64,
      mimeType
    });
    return response.data;
  }

  async getDashboardStats() {
    const response = await apiClient.get("/user/dashboard-stats");
    return response.data;
  }

  async getSolveAccessStatus() {
    const response = await apiClient.get("/user/solve-access");
    return response.data;
  }

  async getUserHistory() {
    const response = await apiClient.get("/user/history");
    return response.data;
  }

  async deleteHistoryItem(historyItemId) {
    const response = await apiClient.delete(`/user/history/${historyItemId}`);
    return response.data;
  }
}

export const formulaService = new FormulaService();

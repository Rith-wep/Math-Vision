import { apiClient } from "./apiClient.js";

class QuizService {
  async getSubjects() {
    const response = await apiClient.get("/subjects");
    return response.data;
  }

  async getSubjectLevels(subjectId) {
    const response = await apiClient.get(`/subjects/${subjectId}/levels`);
    return response.data;
  }

  async getQuestions(subjectId, levelId) {
    const response = await apiClient.get(`/questions/${subjectId}/${levelId}`);
    return response.data;
  }

  async completeLevel(subjectId, levelId, scorePercent) {
    const response = await apiClient.post(`/questions/${subjectId}/${levelId}/complete`, {
      scorePercent
    });
    return response.data;
  }
}

export const quizService = new QuizService();

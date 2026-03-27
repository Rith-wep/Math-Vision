import { apiClient } from "../../services/apiClient.js";

const AUTH_STORAGE_KEY = "math-vision-auth";

const readStoredToken = () => {
  try {
    const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : null;
    return parsedValue?.token || "";
  } catch (error) {
    return "";
  }
};

const createAuthorizedConfig = (config = {}) => {
  const token = readStoredToken();

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  };
};

const mapQuestionFromApi = (question) => ({
  id: question._id || question.id,
  question_title: question.question_title || question.questionTitle || question.question_text || "",
  question_text: question.question_text || question.questionText || "",
  question_input_type: question.question_input_type || question.questionInputType || "text",
  question_latex: question.question_latex || question.questionLatex || "",
  options: Array.isArray(question.options)
    ? question.options.map((option) => (typeof option === "string" ? option : option.label || option.text || ""))
    : [],
  option_latex: Array.isArray(question.option_latex || question.optionLatex)
    ? (question.option_latex || question.optionLatex).map((option) => (typeof option === "string" ? option : ""))
    : ["", "", "", ""],
  option_input_types: Array.isArray(question.option_input_types || question.optionInputTypes)
    ? (question.option_input_types || question.optionInputTypes).map((item) => (item === "latex" ? "latex" : "text"))
    : ["text", "text", "text", "text"],
  correct_answer: question.correct_answer || question.correctAnswer || "A",
  explanation: question.explanation || "",
  level: Number(question.level) || 1,
  category: question.category || "General",
  updated_at: question.updated_at || question.updatedAt || question.createdAt || new Date().toISOString()
});

const mapDocumentFromApi = (document) => ({
  id: document._id || document.id,
  title: document.title || "",
  description: document.description || "",
  category: document.category || "PDF",
  grade_level: document.grade_level || document.gradeLevel || "",
  visibility: document.visibility || "private",
  file_name: document.file_name || document.fileName || document.filename || "",
  file_url: document.file_url || document.fileUrl || "",
  thumbnail_url: document.thumbnail_url || document.thumbnailUrl || "",
  source_type: document.source_type || document.sourceType || "upload",
  uploaded_at: document.uploaded_at || document.updatedAt || document.createdAt || new Date().toISOString()
});

const mapSolutionLibraryEntryFromApi = (entry) => ({
  id: entry._id || entry.id,
  original_expression: entry.original_expression || entry.originalExpression || "",
  normalized_expression: entry.normalized_expression || entry.normalizedExpression || "",
  search_expression: entry.search_expression || entry.searchExpression || "",
  solution: entry.solution || {},
  question_text: entry.question_text || entry.solution?.question_text || entry.original_expression || "",
  final_answer: entry.final_answer || entry.solution?.final_answer || "",
  complexity: entry.complexity || entry.solution?.complexity || "complex",
  steps_count: Number(entry.steps_count ?? entry.solution?.steps?.length ?? 0) || 0,
  updated_at: entry.updated_at || entry.updatedAt || entry.createdAt || new Date().toISOString()
});

export const adminService = {
  async getQcmSettings() {
    const response = await apiClient.get("/qcm/settings", createAuthorizedConfig());
    const payload = Array.isArray(response.data) ? response.data : [];
    return payload.map((item) => ({
      id: item.id || item._id || item.key || "",
      category: item.category || "General",
      title: item.title || item.category || "QCM",
      description: item.description || `Practice questions for ${item.category || "this category"}.`
    }));
  },

  async updateQcmSettings(payload) {
    const response = await apiClient.put("/qcm/settings", payload, createAuthorizedConfig());
    return {
      id: response.data?.id || response.data?._id || response.data?.key || "",
      category: response.data?.category || payload.category || "General",
      title: response.data?.title || payload.category || "QCM",
      description:
        response.data?.description || `Practice questions for ${payload.category || "this category"}.`
    };
  },

  async getQuestions() {
    const response = await apiClient.get("/qcm", createAuthorizedConfig());
    const payload = Array.isArray(response.data) ? response.data : response.data?.items || response.data?.questions || [];
    return payload.map(mapQuestionFromApi);
  },

  async createQuestion(payload) {
    const response = await apiClient.post("/qcm", payload, createAuthorizedConfig());
    return mapQuestionFromApi(response.data);
  },

  async updateQuestion(questionId, payload) {
    const response = await apiClient.put(`/qcm/${questionId}`, payload, createAuthorizedConfig());
    return mapQuestionFromApi(response.data);
  },

  async deleteQuestion(questionId) {
    await apiClient.delete(`/qcm/${questionId}`, createAuthorizedConfig());
  },

  async getDocuments() {
    const response = await apiClient.get("/documents", createAuthorizedConfig());
    const payload = Array.isArray(response.data) ? response.data : response.data?.items || response.data?.documents || [];
    return payload.map(mapDocumentFromApi);
  },

  async uploadDocument(payload) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("category", payload.category);
    formData.append("grade_level", payload.grade_level);
    if (payload.pdf_link) {
      formData.append("pdf_link", payload.pdf_link);
    }
    if (payload.thumbnail_link) {
      formData.append("thumbnail_link", payload.thumbnail_link);
    }
    if (payload.file) {
      formData.append("file", payload.file);
    }

    const response = await apiClient.post(
      "/documents",
      formData,
      createAuthorizedConfig({
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
    );

    return mapDocumentFromApi(response.data);
  },

  async toggleDocumentVisibility(documentId, visibility) {
    const response = await apiClient.put(
      `/documents/${documentId}`,
      { visibility },
      createAuthorizedConfig()
    );

    return mapDocumentFromApi(response.data);
  },

  async updateDocument(documentId, payload) {
    const response = await apiClient.put(
      `/documents/${documentId}`,
      payload,
      createAuthorizedConfig()
    );

    return mapDocumentFromApi(response.data);
  },

  async deleteDocument(documentId) {
    await apiClient.delete(`/documents/${documentId}`, createAuthorizedConfig());
  },

  async getSolutionLibraryEntries() {
    const response = await apiClient.get("/solution-library", createAuthorizedConfig());
    const payload = Array.isArray(response.data) ? response.data : response.data?.items || response.data?.entries || [];
    return payload.map(mapSolutionLibraryEntryFromApi);
  },

  async deleteSolutionLibraryEntry(entryId) {
    await apiClient.delete(`/solution-library/${entryId}`, createAuthorizedConfig());
  }
};

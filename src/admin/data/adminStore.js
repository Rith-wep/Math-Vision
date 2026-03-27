const ADMIN_QCM_KEY = "math-vision-admin-qcm";
const ADMIN_DOCS_KEY = "math-vision-admin-docs";

const seedQuestions = [
  {
    id: "qcm-1",
    questionText: "If 2x + 5 = 17, what is the value of x?",
    options: ["4", "5", "6", "7"],
    correctAnswer: "A",
    category: "Algebra",
    updatedAt: "2026-03-24T09:10:00.000Z"
  },
  {
    id: "qcm-2",
    questionText: "What is the sum of the interior angles of a triangle?",
    options: ["90°", "120°", "180°", "360°"],
    correctAnswer: "C",
    category: "Geometry",
    updatedAt: "2026-03-23T08:20:00.000Z"
  },
  {
    id: "qcm-3",
    questionText: "What is the derivative of x²?",
    options: ["x", "2x", "x²", "2"],
    correctAnswer: "B",
    category: "Calculus",
    updatedAt: "2026-03-21T12:30:00.000Z"
  }
];

const seedDocuments = [
  {
    id: "doc-1",
    title: "Algebra Foundations Workbook",
    description: "Practice sheets covering linear equations and basic functions.",
    gradeLevel: "Grade 9",
    fileName: "algebra-foundations.pdf",
    visibility: "public",
    uploadedAt: "2026-03-22T07:45:00.000Z"
  },
  {
    id: "doc-2",
    title: "Geometry Revision Notes",
    description: "Teacher notes for shapes, angles, and proofs.",
    gradeLevel: "Grade 10",
    fileName: "geometry-revision.pdf",
    visibility: "private",
    uploadedAt: "2026-03-20T05:10:00.000Z"
  }
];

const readStorage = (key, fallbackValue) => {
  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      return fallbackValue;
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
};

const writeStorage = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const buildId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const ensureSeedData = () => {
  const questions = readStorage(ADMIN_QCM_KEY, []);
  const documents = readStorage(ADMIN_DOCS_KEY, []);

  if (!questions.length) {
    writeStorage(ADMIN_QCM_KEY, seedQuestions);
  }

  if (!documents.length) {
    writeStorage(ADMIN_DOCS_KEY, seedDocuments);
  }
};

export const adminStore = {
  initialize() {
    ensureSeedData();
  },

  getQuestions() {
    ensureSeedData();
    return readStorage(ADMIN_QCM_KEY, seedQuestions);
  },

  saveQuestion(question) {
    const questions = this.getQuestions();
    const nextQuestion = {
      ...question,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = questions.findIndex((item) => item.id === nextQuestion.id);

    if (existingIndex >= 0) {
      const updatedQuestions = [...questions];
      updatedQuestions[existingIndex] = nextQuestion;
      writeStorage(ADMIN_QCM_KEY, updatedQuestions);
      return nextQuestion;
    }

    const createdQuestion = {
      ...nextQuestion,
      id: buildId("qcm")
    };
    const updatedQuestions = [createdQuestion, ...questions];
    writeStorage(ADMIN_QCM_KEY, updatedQuestions);
    return createdQuestion;
  },

  deleteQuestion(questionId) {
    const questions = this.getQuestions().filter((item) => item.id !== questionId);
    writeStorage(ADMIN_QCM_KEY, questions);
    return questions;
  },

  getDocuments() {
    ensureSeedData();
    return readStorage(ADMIN_DOCS_KEY, seedDocuments);
  },

  saveDocument(document) {
    const documents = this.getDocuments();
    const createdDocument = {
      id: buildId("doc"),
      visibility: "private",
      uploadedAt: new Date().toISOString(),
      ...document
    };
    const updatedDocuments = [createdDocument, ...documents];
    writeStorage(ADMIN_DOCS_KEY, updatedDocuments);
    return createdDocument;
  },

  toggleDocumentVisibility(documentId) {
    const documents = this.getDocuments().map((item) =>
      item.id === documentId
        ? {
            ...item,
            visibility: item.visibility === "public" ? "private" : "public"
          }
        : item
    );
    writeStorage(ADMIN_DOCS_KEY, documents);
    return documents;
  }
};

import axios from "axios";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ButtonSpinner } from "../../components/ButtonSpinner.jsx";
import { adminService } from "../services/adminService.js";

const defaultFormState = {
  id: "",
  question_title: "",
  question_input_type: "text",
  question_text: "",
  question_latex: "",
  options: ["", "", "", ""],
  option_input_types: ["text", "text", "text", "text"],
  option_latex: ["", "", "", ""],
  correct_answer: "A",
  explanation: "",
  level: 1,
  category: "Algebra"
};

const answerOptions = ["A", "B", "C", "D"];
const categories = ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry"];
const levels = [1, 2, 3, 4, 5];

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));

const getErrorMessage = (error, fallbackMessage) =>
  axios.isAxiosError(error) ? error.response?.data?.message || fallbackMessage : fallbackMessage;

const inferInputType = (latexValue) => (typeof latexValue === "string" && latexValue.trim() ? "latex" : "text");
const looksLikeLatex = (value = "") => {
  const trimmedValue = typeof value === "string" ? value.trim() : "";

  if (!trimmedValue) {
    return false;
  }

  return /\\[a-zA-Z]+|\\[{}[\]]|(?:^|[^A-Za-z])[A-Za-z]\^\{?[^ ]+/.test(trimmedValue);
};

export const QcmManager = () => {
  const [questions, setQuestions] = useState([]);
  const [qcmSettings, setQcmSettings] = useState([]);
  const [selectedSettingsCategory, setSelectedSettingsCategory] = useState(categories[0]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formState, setFormState] = useState(defaultFormState);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [toast, setToast] = useState({ type: "", message: "" });

  const loadQuestions = async () => {
    setIsLoading(true);

    try {
      const [data, settings] = await Promise.all([
        adminService.getQuestions(),
        adminService.getQcmSettings()
      ]);
      setQuestions(data);
      setQcmSettings(settings);
      setSelectedSettingsCategory((current) => {
        const availableCategories = new Set([
          ...categories,
          ...data.map((question) => question.category),
          ...settings.map((setting) => setting.category)
        ]);
        return availableCategories.has(current) ? current : Array.from(availableCategories)[0] || categories[0];
      });
      setToast({ type: "", message: "" });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to load QCM questions from the server.")
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return questions;
    }

    return questions.filter((question) => {
      const questionTitle = (question.question_title || "").toLowerCase();
      const questionText = question.question_text.toLowerCase();
      const category = question.category.toLowerCase();
      return (
        questionTitle.includes(normalizedSearch) ||
        questionText.includes(normalizedSearch) ||
        category.includes(normalizedSearch)
      );
    });
  }, [questions, searchValue]);

  const availableCategories = useMemo(() => {
    const orderedCategories = [];
    const seenCategories = new Set();

    [...categories, ...questions.map((question) => question.category), ...qcmSettings.map((setting) => setting.category)].forEach(
      (category) => {
        const normalizedCategory = typeof category === "string" ? category.trim() : "";

        if (normalizedCategory && !seenCategories.has(normalizedCategory)) {
          seenCategories.add(normalizedCategory);
          orderedCategories.push(normalizedCategory);
        }
      }
    );

    return orderedCategories;
  }, [questions, qcmSettings]);

  const activeCategorySettings = useMemo(() => {
    const matchedSettings = qcmSettings.find((setting) => setting.category === selectedSettingsCategory);

    return (
      matchedSettings || {
        category: selectedSettingsCategory,
        title: selectedSettingsCategory || "QCM",
        description: `Practice questions for ${selectedSettingsCategory || "this category"}.`
      }
    );
  }, [qcmSettings, selectedSettingsCategory]);

  const openCreateModal = () => {
    setFormState(defaultFormState);
    setIsEditorOpen(true);
  };

  const openEditModal = (question) => {
    const questionInputType = inferInputType(question.question_latex);
    const optionInputTypes = Array.isArray(question.option_latex)
      ? question.option_latex.map((value) => inferInputType(value))
      : ["text", "text", "text", "text"];

    setFormState({
      id: question.id,
      question_title: question.question_title || question.question_text,
      question_input_type: question.question_input_type || questionInputType,
      question_text: question.question_text,
      question_latex: question.question_latex || "",
      options: [...question.options],
      option_input_types: Array.isArray(question.option_input_types) ? [...question.option_input_types] : optionInputTypes,
      option_latex: Array.isArray(question.option_latex) ? [...question.option_latex] : ["", "", "", ""],
      correct_answer: question.correct_answer,
      explanation: question.explanation || "",
      level: question.level || 1,
      category: question.category
    });
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setFormState(defaultFormState);
  };

  const handleFormChange = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleQuestionInputTypeChange = (value) => {
    setFormState((current) => ({
      ...current,
      question_input_type: value,
      question_text: value === "text" ? current.question_text : "",
      question_latex: value === "latex" ? current.question_latex : ""
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormState((current) => {
      const nextOptions = [...current.options];
      nextOptions[index] = value;

      return {
        ...current,
        options: nextOptions,
        option_latex:
          current.option_input_types[index] === "text" ? current.option_latex : current.option_latex
      };
    });
  };

  const handleOptionLatexChange = (index, value) => {
    setFormState((current) => {
      const nextOptionLatex = [...current.option_latex];
      nextOptionLatex[index] = value;

      return {
        ...current,
        option_latex: nextOptionLatex
      };
    });
  };

  const handleOptionInputTypeChange = (index, value) => {
    setFormState((current) => {
      const nextOptionInputTypes = [...current.option_input_types];
      const nextOptions = [...current.options];
      const nextOptionLatex = [...current.option_latex];

      nextOptionInputTypes[index] = value;

      if (value === "text") {
        nextOptionLatex[index] = "";
      } else {
        nextOptions[index] = "";
      }

      return {
        ...current,
        option_input_types: nextOptionInputTypes,
        options: nextOptions,
        option_latex: nextOptionLatex
      };
    });
  };

  const handleSettingsChange = (field, value) => {
    setQcmSettings((current) => {
      const hasExistingSetting = current.some((setting) => setting.category === selectedSettingsCategory);

      if (!hasExistingSetting) {
        return [
          ...current,
          {
            category: selectedSettingsCategory,
            title: field === "title" ? value : activeCategorySettings.title,
            description: field === "description" ? value : activeCategorySettings.description
          }
        ];
      }

      return current.map((setting) =>
        setting.category === selectedSettingsCategory
          ? {
              ...setting,
              [field]: value
            }
          : setting
      );
    });
  };

  const handleSettingsSubmit = async (event) => {
    event.preventDefault();
    setIsSavingSettings(true);

    try {
      const nextSettings = await adminService.updateQcmSettings({
        category: selectedSettingsCategory,
        title: activeCategorySettings.title.trim(),
        description: activeCategorySettings.description.trim()
      });
      setQcmSettings((current) => {
        const hasExistingSetting = current.some((setting) => setting.category === nextSettings.category);

        if (!hasExistingSetting) {
          return [...current, nextSettings];
        }

        return current.map((setting) =>
          setting.category === nextSettings.category ? nextSettings : setting
        );
      });
      setToast({
        type: "success",
        message: `Student card details for ${selectedSettingsCategory} updated successfully.`
      });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to save the category title and description.")
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestionTitle = formState.question_title.trim();
    const trimmedQuestionText = formState.question_text.trim();
    const trimmedQuestionLatex = formState.question_latex.trim();
    const trimmedOptions = formState.options.map((option) => option.trim());
    const trimmedOptionLatex = formState.option_latex.map((option) => option.trim());
    const effectiveQuestionInputType =
      formState.question_input_type === "text" && looksLikeLatex(trimmedQuestionText)
        ? "latex"
        : formState.question_input_type;
    const normalizedQuestionText =
      effectiveQuestionInputType === "text"
        ? trimmedQuestionText
        : trimmedQuestionText || trimmedQuestionLatex || "Math expression";
    const normalizedQuestionLatex =
      effectiveQuestionInputType === "latex"
        ? trimmedQuestionLatex || trimmedQuestionText
        : "";

    const effectiveOptionInputTypes = formState.option_input_types.map((inputType, index) =>
      inputType === "text" && looksLikeLatex(trimmedOptions[index]) ? "latex" : inputType
    );
    const hasMissingOptionValue = effectiveOptionInputTypes.some((inputType, index) =>
      inputType === "latex"
        ? !(trimmedOptionLatex[index] || trimmedOptions[index])
        : !trimmedOptions[index]
    );
    const normalizedOptions = effectiveOptionInputTypes.map((inputType, index) =>
      inputType === "latex"
        ? trimmedOptions[index] || trimmedOptionLatex[index]
        : trimmedOptions[index]
    );
    const normalizedOptionLatex = effectiveOptionInputTypes.map((inputType, index) =>
      inputType === "latex"
        ? trimmedOptionLatex[index] || trimmedOptions[index]
        : ""
    );

    if (
      !trimmedQuestionTitle ||
      (effectiveQuestionInputType === "latex"
        ? !normalizedQuestionLatex
        : !normalizedQuestionText) ||
      hasMissingOptionValue
    ) {
      setToast({
        type: "error",
        message: "Please complete the title, selected question content, and all 4 answer options before saving."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const autoCorrectedQuestionType = effectiveQuestionInputType !== formState.question_input_type;
      const autoCorrectedOptionCount = effectiveOptionInputTypes.filter(
        (inputType, index) => inputType !== formState.option_input_types[index]
      ).length;
      const payload = {
        question_title: trimmedQuestionTitle,
        question_text: normalizedQuestionText,
        question_input_type: effectiveQuestionInputType,
        question_latex: normalizedQuestionLatex,
        options: normalizedOptions,
        option_input_types: effectiveOptionInputTypes,
        option_latex: normalizedOptionLatex,
        correct_answer: formState.correct_answer,
        explanation: formState.explanation.trim(),
        level: formState.level,
        category: formState.category
      };

      if (formState.id) {
        await adminService.updateQuestion(formState.id, payload);
      } else {
        await adminService.createQuestion(payload);
      }

      await loadQuestions();
      closeEditor();
      setToast({
        type: "success",
        message:
          autoCorrectedQuestionType || autoCorrectedOptionCount
            ? `Saved successfully. Auto-corrected ${autoCorrectedQuestionType ? "question content" : ""}${autoCorrectedQuestionType && autoCorrectedOptionCount ? " and " : ""}${autoCorrectedOptionCount ? `${autoCorrectedOptionCount} option${autoCorrectedOptionCount > 1 ? "s" : ""}` : ""} to LaTeX mode.`
            : formState.id
              ? "QCM question updated successfully."
              : "QCM question created successfully."
      });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to save the QCM question.")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!questionToDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await adminService.deleteQuestion(questionToDelete.id);
      await loadQuestions();
      setQuestionToDelete(null);
      setToast({
        type: "success",
        message: "QCM question deleted successfully."
      });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to delete the QCM question.")
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manage QCM Questions</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
              Search, create, edit, and remove QCM questions using live backend data.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            <span>Add Question</span>
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by question or category"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {isLoading ? "Loading..." : `${filteredQuestions.length} Questions`}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student QCM Cards</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the title and description shown to students for each QCM category card.
          </p>
        </div>

        <form onSubmit={handleSettingsSubmit} className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
              <input
                list="qcm-settings-category-options"
                value={selectedSettingsCategory}
                onChange={(event) => setSelectedSettingsCategory(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                placeholder="Choose or type a category"
              />
              <datalist id="qcm-settings-category-options">
                {availableCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
              This card controls how the <span className="font-semibold">{selectedSettingsCategory}</span> category appears on the student quiz page.
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
            <input
              type="text"
              value={activeCategorySettings.title}
              onChange={(event) => handleSettingsChange("title", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              placeholder="Student-facing QCM title"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows="3"
              value={activeCategorySettings.description}
              onChange={(event) => handleSettingsChange("description", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              placeholder="Student-facing QCM description"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-70"
            >
              {isSavingSettings ? <ButtonSpinner className="h-4 w-4" /> : null}
              <span>Save Card Details</span>
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm font-medium text-slate-500">
            <ButtonSpinner className="h-5 w-5" />
            <span>Loading QCM questions...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Question</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Level</th>
                  <th className="px-5 py-4">Correct</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{question.question_title || question.question_text}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {question.question_input_type === "latex" ? (question.question_latex || "LaTeX content") : question.question_text}
                      </p>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {question.options.map((option, index) => (
                          <div
                            key={`${question.id}-${answerOptions[index]}`}
                            className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"
                          >
                            <span className="mr-2 font-bold text-slate-800">{answerOptions[index]}.</span>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {question.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {`Level ${question.level || 1}`}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{question.correct_answer}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(question.updated_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(question)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                          aria-label="Edit question"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuestionToDelete(question)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                          aria-label="Delete question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filteredQuestions.length ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-500">
                      No QCM questions matched your search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isEditorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-6">
          <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 md:px-6 md:py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {formState.id ? "Edit QCM Question" : "Add QCM Question"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">Fill in all fields before saving the question.</p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Question Title</label>
                <input
                  type="text"
                  value={formState.question_title}
                  onChange={(event) => handleFormChange("question_title", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                  placeholder="Enter the question title shown above the content box"
                />
              </div>

              <div>
                <div className="flex items-end justify-between gap-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Question Content</label>
                  <select
                    value={formState.question_input_type}
                    onChange={(event) => handleQuestionInputTypeChange(event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="latex">LaTeX</option>
                  </select>
                </div>

                {formState.question_input_type === "text" ? (
                  <textarea
                    value={formState.question_text}
                    onChange={(event) => handleFormChange("question_text", event.target.value)}
                    rows="4"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                    placeholder="Enter the question content shown inside the green box"
                  />
                ) : (
                  <>
                    <textarea
                      value={formState.question_latex}
                      onChange={(event) => handleFormChange("question_latex", event.target.value)}
                      rows="3"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                      placeholder="Example: x^2 - 5x + 6 = 0"
                    />
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Students will see the rendered math on the quiz UI, not the raw LaTeX code.
                    </p>
                  </>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Explanation</label>
                <textarea
                  value={formState.explanation}
                  onChange={(event) => handleFormChange("explanation", event.target.value)}
                  rows="3"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                  placeholder="Explain why the correct answer is right"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {formState.options.map((option, index) => (
                  <div key={answerOptions[index]} className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-4">
                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          {`Option ${answerOptions[index]}`}
                        </label>
                        <select
                          value={formState.option_input_types[index]}
                          onChange={(event) => handleOptionInputTypeChange(index, event.target.value)}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                        >
                          <option value="text">Text</option>
                          <option value="latex">LaTeX</option>
                        </select>
                      </div>

                      {formState.option_input_types[index] === "text" ? (
                        <input
                          type="text"
                          value={option}
                          onChange={(event) => handleOptionChange(index, event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                          placeholder={`Enter option ${answerOptions[index]}`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={formState.option_latex[index]}
                          onChange={(event) => handleOptionLatexChange(index, event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-700 outline-none transition focus:border-emerald-300"
                          placeholder={`Example: x^{${index + 1}}`}
                        />
                      )}

                      {formState.option_input_types[index] === "latex" ? (
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">
                          This answer will be rendered as math on the student UI.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Correct answer</label>
                  <select
                    value={formState.correct_answer}
                    onChange={(event) => handleFormChange("correct_answer", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                  >
                    {answerOptions.map((answerOption) => (
                      <option key={answerOption} value={answerOption}>
                        {answerOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Level</label>
                  <select
                    value={formState.level}
                    onChange={(event) => handleFormChange("level", Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {`Level ${level}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                  <input
                    list="qcm-question-category-options"
                    value={formState.category}
                    onChange={(event) => handleFormChange("category", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                    placeholder="Choose or type a category"
                  />
                  <datalist id="qcm-question-category-options">
                    {availableCategories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/95 pt-5 backdrop-blur">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-70"
                >
                  {isSubmitting ? <ButtonSpinner className="h-4 w-4" /> : null}
                  <span>Save Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {questionToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
            <h2 className="text-xl font-bold text-slate-900">Confirm Question Deletion</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {questionToDelete.question_text}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-70"
              >
                {isDeleting ? <ButtonSpinner className="h-4 w-4" /> : null}
                <span>Delete Question</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

import axios from "axios";
import { Eye, EyeOff, FileText, Link2, Pencil, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ButtonSpinner } from "../../components/ButtonSpinner.jsx";
import { adminService } from "../services/adminService.js";

const defaultFormState = {
  title: "",
  description: "",
  category: "PDF",
  grade_level: "Grade 9",
  file: null,
  file_name: "",
  pdf_link: "",
  thumbnail_link: ""
};

const getErrorMessage = (error, fallbackMessage) =>
  axios.isAxiosError(error) ? error.response?.data?.message || fallbackMessage : fallbackMessage;

export const DocLibraryManager = () => {
  const [documents, setDocuments] = useState([]);
  const [formState, setFormState] = useState(defaultFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [togglingId, setTogglingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [editingDocumentId, setEditingDocumentId] = useState("");
  const [toast, setToast] = useState({ type: "", message: "" });

  const loadDocuments = async () => {
    setIsLoading(true);

    try {
      const data = await adminService.getDocuments();
      setDocuments(data);
      setToast({ type: "", message: "" });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to load documents from the server.")
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleChange = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const hasFile = Boolean(formState.file);
    const hasPdfLink = Boolean(formState.pdf_link.trim());

    if (!formState.title.trim() || !formState.description.trim() || !formState.category || (!hasFile && !hasPdfLink)) {
      setToast({
        type: "error",
        message: "Please complete the document details, category, and provide a PDF file or PDF link before uploading."
      });
      return;
    }

    if (hasFile && hasPdfLink) {
      setToast({
        type: "error",
        message: "Choose either a PDF file upload or a PDF link."
      });
      return;
    }

    setIsUploading(true);

    try {
      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim(),
        category: formState.category.trim(),
        grade_level: formState.grade_level,
        file: formState.file,
        pdf_link: formState.pdf_link.trim(),
        thumbnail_link: formState.thumbnail_link.trim()
      };

      if (editingDocumentId) {
        await adminService.updateDocument(editingDocumentId, {
          title: payload.title,
          description: payload.description,
          category: payload.category,
          grade_level: payload.grade_level,
          pdf_link: payload.pdf_link,
          thumbnail_link: payload.thumbnail_link
        });
      } else {
        await adminService.uploadDocument(payload);
      }

      await loadDocuments();
      setFormState(defaultFormState);
      setEditingDocumentId("");
      setToast({
        type: "success",
        message: editingDocumentId ? "Document updated successfully." : "Document uploaded successfully."
      });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, editingDocumentId ? "Unable to update the document." : "Unable to upload the document.")
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggleVisibility = async (document) => {
    setTogglingId(document.id);

    try {
      const nextVisibility = document.visibility === "public" ? "private" : "public";
      await adminService.toggleDocumentVisibility(document.id, nextVisibility);
      await loadDocuments();
      setToast({
        type: "success",
        message: "Document visibility updated successfully."
      });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to change document visibility.")
      });
    } finally {
      setTogglingId("");
    }
  };

  const handleEdit = (document) => {
    setEditingDocumentId(document.id);
    setFormState({
      title: document.title || "",
      description: document.description || "",
      category: document.category || "PDF",
      grade_level: document.grade_level || "Grade 9",
      file: null,
      file_name: "",
      pdf_link: document.file_url || "",
      thumbnail_link: document.thumbnail_url || ""
    });
    setToast({ type: "", message: "" });
  };

  const handleCancelEdit = () => {
    setEditingDocumentId("");
    setFormState(defaultFormState);
  };

  const handleDelete = async (document) => {
    if (!window.confirm(`Delete "${document.title}"?`)) {
      return;
    }

    setDeletingId(document.id);

    try {
      await adminService.deleteDocument(document.id);
      if (editingDocumentId === document.id) {
        handleCancelEdit();
      }
      await loadDocuments();
      setToast({
        type: "success",
        message: "Document deleted successfully."
      });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to delete the document.")
      });
    } finally {
      setDeletingId("");
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

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Manage Study Documents</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Add PDF resource links and manage which files are visible in the Math Vision library.
            </p>
            {editingDocumentId ? (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <span>Editing selected document</span>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
              <input
                type="text"
                value={formState.title}
                onChange={(event) => handleChange("title", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                placeholder="Document title"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                rows="4"
                value={formState.description}
                onChange={(event) => handleChange("description", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                placeholder="Short description for teachers and students"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
              <input
                list="document-category-options"
                value={formState.category}
                onChange={(event) => handleChange("category", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                placeholder="Choose or type a category"
              />
              <datalist id="document-category-options">
                {["Algebra", "Geometry", "Calculus", "PDF"].map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              <p className="mt-2 text-xs text-slate-500">Pick a common category or type a new one for the student document tabs.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Grade Level</label>
              <select
                value={formState.grade_level}
                onChange={(event) => handleChange("grade_level", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              >
                {["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">PDF Link</label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-emerald-300 focus-within:bg-white">
                <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="url"
                  value={formState.pdf_link}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      pdf_link: event.target.value,
                      file: null,
                      file_name: ""
                    }))
                  }
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                  placeholder="https://example.com/lesson.pdf"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Paste the hosted PDF URL that students should open from the current library UI.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Thumbnail Link</label>
              <input
                type="url"
                value={formState.thumbnail_link}
                onChange={(event) => handleChange("thumbnail_link", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                placeholder="https://example.com/thumbnail.jpg"
              />
              <p className="mt-2 text-xs text-slate-500">Optional image preview URL stored with the document.</p>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-70"
            >
              {isUploading ? <ButtonSpinner className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
              <span>{editingDocumentId ? "Save Changes" : "Upload Document"}</span>
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Document List</h2>
              <p className="mt-1 text-sm text-slate-500">Toggle whether each file is visible to students.</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {isLoading ? "Loading..." : `${documents.length} Files`}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm font-medium text-slate-500">
              <ButtonSpinner className="h-5 w-5" />
              <span>Loading documents...</span>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {documents.map((document) => (
                <article
                  key={document.id}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800">{document.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">{document.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                            {document.category || "PDF"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                            {document.grade_level}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                            {document.file_name}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                            {document.source_type === "link" ? "PDF Link" : "Uploaded PDF"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              document.visibility === "public"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {document.visibility === "public" ? "Public" : "Private"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(document)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
                        aria-label={`Edit ${document.title}`}
                        title="Edit document"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(document)}
                        disabled={deletingId === document.id}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:opacity-70"
                        aria-label={`Delete ${document.title}`}
                        title="Delete document"
                      >
                        {deletingId === document.id ? <ButtonSpinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(document)}
                        disabled={togglingId === document.id}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold transition disabled:opacity-70 ${
                          document.visibility === "public"
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "bg-emerald-700 text-white hover:bg-emerald-800"
                        }`}
                        aria-label={document.visibility === "public" ? "Make private" : "Make public"}
                        title={document.visibility === "public" ? "Make private" : "Make public"}
                      >
                        {togglingId === document.id ? (
                          <ButtonSpinner className="h-4 w-4" />
                        ) : document.visibility === "public" ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {!documents.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  No documents were returned by the backend.
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

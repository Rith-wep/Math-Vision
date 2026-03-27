import axios from "axios";
import { RefreshCw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ButtonSpinner } from "../../components/ButtonSpinner.jsx";
import { adminService } from "../services/adminService.js";

const PAGE_SIZE = 10;

const getErrorMessage = (error, fallbackMessage) =>
  axios.isAxiosError(error) ? error.response?.data?.message || fallbackMessage : fallbackMessage;

const formatDate = (value) => {
  if (!value) {
    return "Unknown";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleString();
};

export const SolutionLibraryManager = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ type: "", message: "" });

  const loadEntries = async ({ silent = false } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const data = await adminService.getSolutionLibraryEntries();
      setEntries(data);
      setCurrentPage(1);
      setToast({ type: "", message: "" });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to load solution library entries.")
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return entries;
    }

    return entries.filter((entry) =>
      [
        entry.original_expression,
        entry.question_text,
        entry.final_answer,
        entry.complexity
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [entries, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEntries = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredEntries.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredEntries, safeCurrentPage]);

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete this cached solution?\n\n${entry.question_text || entry.original_expression}`)) {
      return;
    }

    setDeletingId(entry.id);

    try {
      await adminService.deleteSolutionLibraryEntry(entry.id);
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      if (expandedId === entry.id) {
        setExpandedId("");
      }
      setCurrentPage((current) => Math.max(1, Math.min(current, Math.ceil((filteredEntries.length - 1) / PAGE_SIZE) || 1)));
      setToast({
        type: "success",
        message: "Solution library entry deleted successfully."
      });
    } catch (error) {
      setToast({
        type: "error",
        message: getErrorMessage(error, "Unable to delete this solution library entry.")
      });
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="min-w-0 space-y-6 overflow-x-hidden">
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

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-slate-900">Solution Library Review</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
              Review cached solver answers from the backend solution library and remove any entry that should not be reused.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
            <label className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:min-w-[18rem]">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search expression or final answer"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <button
              type="button"
              onClick={() => loadEntries({ silent: true })}
              disabled={isRefreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
            >
              {isRefreshing ? <ButtonSpinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900">Cached Solutions</h2>
            <p className="mt-1 text-sm text-slate-500">Deleting an entry only removes it from the library cache. It does not change the student UI directly.</p>
          </div>
          <div className="w-fit rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            {isLoading ? "Loading..." : `${filteredEntries.length} Entries`}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm font-medium text-slate-500">
            <ButtonSpinner className="h-5 w-5" />
            <span>Loading solution library...</span>
          </div>
        ) : filteredEntries.length ? (
          <div className="mt-5 space-y-3">
            {paginatedEntries.map((entry) => {
              const isExpanded = expandedId === entry.id;

              return (
                <article
                  key={entry.id}
                  className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {entry.complexity}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {entry.steps_count} steps
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          Updated {formatDate(entry.updated_at)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Question</p>
                        <p className="mt-1 whitespace-pre-wrap break-all text-sm font-semibold leading-relaxed text-slate-900">
                          {entry.question_text || entry.original_expression}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Final Answer</p>
                        <p className="mt-1 whitespace-pre-wrap break-all text-sm leading-relaxed text-slate-700">
                          {entry.final_answer || "No final answer saved"}
                        </p>
                      </div>

                      {isExpanded ? (
                        <div className="mt-4 min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Original Expression</p>
                            <p className="mt-1 whitespace-pre-wrap break-all text-sm text-slate-700">{entry.original_expression || "Unknown"}</p>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Normalized Expression</p>
                            <p className="mt-1 whitespace-pre-wrap break-all text-sm text-slate-700">{entry.normalized_expression || "Unknown"}</p>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Saved Solution JSON</p>
                            <pre className="mt-2 max-w-full overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                              {JSON.stringify(entry.solution || {}, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? "" : entry.id)}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry)}
                        disabled={deletingId === entry.id}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 disabled:opacity-70"
                        aria-label="Delete solution library entry"
                        title="Delete cached solution"
                      >
                        {deletingId === entry.id ? <ButtonSpinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredEntries.length > PAGE_SIZE ? (
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page {safeCurrentPage} of {totalPages}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeCurrentPage === 1}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .slice(Math.max(0, safeCurrentPage - 3), Math.max(5, safeCurrentPage + 2))
                    .map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                          pageNumber === safeCurrentPage
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={safeCurrentPage === totalPages}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
            No solution library entries were returned by the backend.
          </div>
        )}
      </section>
    </div>
  );
};

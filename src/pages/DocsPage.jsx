import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Download,
  File,
  FileText,
  Lock,
  Search,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ScanHeader } from "../components/ScanHeader.jsx";
import { SkeletonBlock } from "../components/SkeletonBlock.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formulaService } from "../services/formulaService.js";
import { toKhmerErrorMessage } from "../utils/errorMessages.js";

const allCategoryLabel = "ទាំងអស់";
const defaultCategories = [allCategoryLabel, "ពិជគណិត", "ធរណីមាត្រ", "វិភាគ"];

const formatDocumentYear = (formula) => {
  const rawValue = formula.published_year || formula.year || formula.createdAt || formula.updatedAt;

  if (!rawValue) {
    return "2024";
  }

  const parsedDate = new Date(rawValue);

  if (!Number.isNaN(parsedDate.getTime())) {
    return String(parsedDate.getFullYear());
  }

  const yearMatch = String(rawValue).match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : "2024";
};

const estimateFileSize = (formula) => {
  if (Number.isFinite(Number(formula.file_size)) && Number(formula.file_size) > 0) {
    return `${(Number(formula.file_size) / (1024 * 1024)).toFixed(1)} MB`;
  }

  const totalLength = `${formula.title_kh || ""}${formula.description_kh || ""}${formula.latex_content || ""}`.length;
  const estimatedMb = Math.max(0.4, totalLength / 900);
  return `${estimatedMb.toFixed(1)} MB`;
};

const getDocumentCategory = (formula) => {
  const category = formula.category || "";

  if (/algebra/i.test(category)) {
    return "ពិជគណិត";
  }

  if (/geometry/i.test(category)) {
    return "ធរណីមាត្រ";
  }

  if (/calculus/i.test(category)) {
    return "វិភាគ";
  }

  return category || allCategoryLabel;
};

const getDocumentType = (formula, index) => {
  if (/pdf/i.test(formula.category || "") || index % 2 === 0) {
    return "pdf";
  }

  return "doc";
};

const buildDownloadContent = (formula) => `
Title: ${formula.title_kh || ""}
Category: ${formula.category || ""}
Grade: ${formula.grade || ""}

Description:
${formula.description_kh || ""}

LaTeX:
${formula.latex_content || ""}
`.trim();

const buildPreviewUrl = (pdfUrl) => {
  if (!pdfUrl) {
    return "";
  }

  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfUrl)}`;
};

const buildCloudinaryPdfPagePreviewUrl = (pdfUrl, pageNumber = 1) => {
  if (!pdfUrl || !/res\.cloudinary\.com/i.test(pdfUrl) || !/\/image\/upload\//i.test(pdfUrl) || !/\.pdf(?:\?|#|$)/i.test(pdfUrl)) {
    return "";
  }

  return pdfUrl.replace("/image/upload/", `/image/upload/pg_${Math.max(1, Number(pageNumber) || 1)},f_jpg,q_auto,w_1200/`);
};

export const DocsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewPage, setPreviewPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(allCategoryLabel);
  const isFreeUser = (user?.role || "user") !== "admin";

  useEffect(() => {
    setPreviewPage(1);
  }, [previewDocument?.pdf_url]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await formulaService.getAll();
        setDocuments(data);
      } catch (error) {
        setErrorMessage(
          toKhmerErrorMessage(error.response?.data?.message || "Unable to load math resources right now.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const categories = useMemo(() => {
    const categorySet = new Set(defaultCategories);

    documents.forEach((formula) => {
      const category = getDocumentCategory(formula);
      if (category && category !== allCategoryLabel) {
        categorySet.add(category);
      }
    });

    return Array.from(categorySet);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return documents.filter((formula) => {
      const category = getDocumentCategory(formula);
      const matchesCategory = activeCategory === allCategoryLabel || category === activeCategory;
      const matchesSearch =
        !normalizedSearch ||
        `${formula.title_kh} ${formula.description_kh} ${formula.category}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, documents, searchValue]);

  const handleDownload = (formula) => {
    if (formula.pdf_url) {
      window.open(formula.pdf_url, "_blank", "noopener,noreferrer");
      return;
    }

    const blob = new Blob([buildDownloadContent(formula)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(formula.title_kh || "math-resource").replace(/[\\/:*?"<>|]/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handlePreviewOpen = (formula) => {
    if (!formula.pdf_url) {
      if (isFreeUser) {
        setErrorMessage("Preview is not available for this document yet.");
        return;
      }

      handleDownload(formula);
      return;
    }

    setPreviewPage(1);
    setPreviewDocument(formula);
  };

  const totalPreviewPages = Math.max(1, Number(previewDocument?.page_count || 1) || 1);
  const previewImageUrl = buildCloudinaryPdfPagePreviewUrl(previewDocument?.pdf_url, previewPage);
  const canUseImagePreview = Boolean(previewImageUrl || previewDocument?.thumbnail_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white"
      style={{ fontFamily: '"Koh Santepheap", "Kantumruy Pro", sans-serif' }}
    >
      <div className="app-shell-page mx-auto min-h-screen bg-white">
        <ScanHeader />

        <main className="px-4 py-4 md:px-5 lg:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-2 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <section className="rounded-[2rem] border border-green-100 bg-white p-4 shadow-sm">
            <h1 className="text-2xl font-extrabold tracking-tight text-green-900">
              បណ្ណាល័យឯកសារគណិតវិទ្យា
            </h1>

            <label className="mt-4 flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="ស្វែងរកមេរៀន វិញ្ញាសា ឬរូបមន្ត..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="scrollbar-hide mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    activeCategory === category
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </section>

          {isLoading && (
            <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <article
                  key={`docs-skeleton-${index}`}
                  className="rounded-3xl border border-slate-100 bg-white p-3.5 shadow-sm"
                >
                  <SkeletonBlock className="h-16 w-16 rounded-2xl" />
                  <div className="mt-4 space-y-2">
                    <SkeletonBlock className="h-4 w-full rounded-lg" />
                    <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
                    <SkeletonBlock className="h-3 w-1/3 rounded-lg" />
                  </div>
                  <SkeletonBlock className="mt-4 h-10 w-full rounded-xl" />
                </article>
              ))}
            </section>
          )}

          {!isLoading && errorMessage && (
            <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && (
            <section className="mt-4">
              {filteredDocuments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="rounded-3xl border border-dashed border-green-200 bg-green-50 px-5 py-10 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-24 w-24 items-end justify-center rounded-full bg-white shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-green-100" />
                    <div className="-ml-3 h-14 w-14 rounded-full bg-green-200" />
                    <div className="-ml-3 h-8 w-8 rounded-full bg-green-100" />
                  </div>
                  <h2 className="mt-5 font-brand text-xl leading-relaxed text-green-900">
                    មិនទាន់មានឯកសារនៅឡើយទេ
                  </h2>
                  <p className="mt-2 text-sm leading-[1.6] text-slate-500">
                    យើងកំពុងរៀបចំឯកសារថ្មីៗសម្រាប់អ្នក។ សូមរង់ចាំបន្តិច ឬសាកល្បងស្វែងរកមេរៀនផ្សេងទៀត។
                  </p>
                  <button
                    type="button"
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-900 transition hover:bg-green-200"
                  >
                    ស្នើសុំឯកសារថ្មី
                  </button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
                  {filteredDocuments.map((formula, index) => {
                    const documentType = getDocumentType(formula, index);
                    const isPdf = documentType === "pdf";
                    const Icon = isPdf ? FileText : File;
                    const fileSizeLabel = estimateFileSize(formula);
                    const yearLabel = formatDocumentYear(formula);
                    const categoryLabel = getDocumentCategory(formula);

                    return (
                      <motion.article
                        key={formula._id || `${formula.title_kh}-${formula.grade}`}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.985 }}
                        className="overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-white shadow-[0_18px_34px_rgba(15,23,42,0.08)]"
                      >
                        <button
                          type="button"
                          onClick={() => handlePreviewOpen(formula)}
                          className={`relative block h-[15.5rem] w-full overflow-hidden text-left sm:h-[21rem] ${
                            formula.thumbnail_url
                              ? "bg-slate-100"
                              : isPdf
                                ? "bg-[linear-gradient(180deg,#d7e6d4_0%,#f8fafc_52%,#eef2ff_100%)]"
                                : "bg-[linear-gradient(180deg,#dff3ea_0%,#f8fafc_50%,#e0ecff_100%)]"
                          }`}
                        >
                          {formula.thumbnail_url ? (
                            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,#eff6f1_0%,#f8fafc_100%)] p-2 sm:p-3">
                              <img
                                src={formula.thumbnail_url}
                                alt={formula.title_kh || "Document cover"}
                                className="h-full w-full rounded-[1.4rem] border border-white/70 bg-white object-contain shadow-[0_12px_28px_rgba(15,23,42,0.14)]"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.95),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(15,23,42,0.18))]" />
                              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 via-white/10 to-transparent" />
                              <div className="absolute inset-x-4 top-4 sm:inset-x-6 sm:top-6">
                                <div className="max-w-[76%] text-left">
                                  <p className="line-clamp-3 text-[1.05rem] font-black leading-[1.05] tracking-tight text-lime-300 drop-shadow-[0_2px_6px_rgba(15,23,42,0.35)] sm:text-[1.45rem]">
                                    {formula.title_kh || "Math Vision Library"}
                                  </p>
                                </div>
                              </div>
                              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6 sm:gap-4">
                                <div className="min-w-0">
                                  <p className="line-clamp-2 text-xs font-bold leading-snug text-white drop-shadow-[0_2px_6px_rgba(15,23,42,0.5)] sm:text-sm">
                                    {categoryLabel}
                                  </p>
                                  <p className="mt-1.5 line-clamp-3 text-[11px] leading-4 text-white/90 drop-shadow-[0_2px_6px_rgba(15,23,42,0.45)] sm:mt-2 sm:text-xs sm:leading-5">
                                    {formula.description_kh || "Math resource for guided practice and revision."}
                                  </p>
                                </div>
                                <div className="shrink-0 rounded-xl border border-black/10 bg-[#a6ad62] px-2.5 py-1.5 text-right shadow-[0_10px_22px_rgba(15,23,42,0.18)] sm:rounded-2xl sm:px-3 sm:py-2">
                                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#4f4a21] sm:text-[11px]">Math</p>
                                  <p className="text-[11px] font-black leading-none text-[#3f3a16] sm:text-[13px]">Vision</p>
                                </div>
                              </div>
                              <div className="absolute bottom-5 left-4 h-10 w-[3px] bg-black/60 sm:bottom-7 sm:left-5 sm:h-12" />
                              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 to-transparent" />
                              <div className="absolute left-4 top-[71%] text-white/85 sm:left-5 sm:top-[72%]">
                                <Icon className="h-7 w-7 sm:h-10 sm:w-10" />
                              </div>
                            </>
                          )}
                          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700 shadow-[0_10px_24px_rgba(16,185,129,0.14)] sm:right-4 sm:top-4 sm:px-3 sm:text-[11px]">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            Preview
                          </span>
                        </button>

                        <div className="space-y-3 px-3.5 pb-3.5 pt-3.5 sm:px-4 sm:pb-4 sm:pt-4">
                          <div>
                          <h2 className="line-clamp-2 text-[14px] font-black leading-snug text-slate-900 sm:text-[15px]">
                            {formula.title_kh}
                          </h2>
                          <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-slate-500 sm:mt-2 sm:text-[13px] sm:leading-6">
                            {formula.description_kh || "No description available."}
                          </p>
                          <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-slate-400 sm:mt-2 sm:text-[12px] sm:leading-6">
                            {formula.category || categoryLabel}
                          </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400 sm:gap-4 sm:text-xs">
                            <div className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <span>{yearLabel}</span>
                            </div>
                            {isFreeUser ? (
                              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 sm:text-xs">
                                <Lock className="h-3.5 w-3.5" />
                                <span>{fileSizeLabel}</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDownload(formula)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-xs"
                                aria-label={`Download ${formula.title_kh || "document"}`}
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>{fileSizeLabel}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {previewDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 px-4 py-6">
          <div className="flex h-[min(90vh,56rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900">{previewDocument.title_kh}</h2>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{previewDocument.description_kh}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col bg-slate-100">
              {canUseImagePreview && totalPreviewPages > 1 ? (
                <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setPreviewPage((current) => Math.max(1, current - 1))}
                    disabled={previewPage <= 1}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Prev</span>
                  </button>
                  <div className="text-sm font-semibold text-slate-600">
                    Page {previewPage} of {totalPreviewPages}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewPage((current) => Math.min(totalPreviewPages, current + 1))}
                    disabled={previewPage >= totalPreviewPages}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              {canUseImagePreview ? (
                <div className="flex h-full w-full items-center justify-center overflow-auto bg-slate-100 p-3">
                  <img
                    src={previewImageUrl || previewDocument.thumbnail_url}
                    alt={previewDocument.title_kh || "PDF preview"}
                    className="max-h-full w-auto max-w-full rounded-2xl border border-white/70 bg-white object-contain shadow-[0_18px_42px_rgba(15,23,42,0.12)]"
                  />
                </div>
              ) : (
                <iframe
                  src={buildPreviewUrl(previewDocument.pdf_url)}
                  title={previewDocument.title_kh || "PDF preview"}
                  className="h-full w-full border-0"
                />
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 px-5 py-4">
              {isFreeUser ? (
                <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-500">
                  <Lock className="h-4 w-4" />
                  <span>Download locked</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDownload(previewDocument)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Open PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
};

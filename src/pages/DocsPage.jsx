import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  File,
  FileText,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ScanHeader } from "../components/ScanHeader.jsx";
import { SkeletonBlock } from "../components/SkeletonBlock.jsx";
import { formulaService } from "../services/formulaService.js";
import { toKhmerErrorMessage } from "../utils/errorMessages.js";

const defaultCategories = ["ទាំងអស់", "ពិជគណិត", "ធរណីមាត្រ", "វិភាគ"];

const estimateFileSize = (formula) => {
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

  return category || "ទាំងអស់";
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

export const DocsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("ទាំងអស់");

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
      if (category && category !== "All") {
        categorySet.add(category);
      }
    });

    return Array.from(categorySet);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return documents.filter((formula) => {
      const category = getDocumentCategory(formula);
      const matchesCategory = activeCategory === "All" || category === activeCategory;
      const matchesSearch =
        !normalizedSearch ||
        `${formula.title_kh} ${formula.description_kh} ${formula.category}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, documents, searchValue]);

  const handleDownload = (formula) => {
    const blob = new Blob([buildDownloadContent(formula)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(formula.title_kh || "math-resource").replace(/[\\/:*?"<>|]/g, "-")}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

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
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {filteredDocuments.map((formula, index) => {
                    const documentType = getDocumentType(formula, index);
                    const isPdf = documentType === "pdf";
                    const Icon = isPdf ? FileText : File;

                    return (
                      <motion.article
                        key={formula._id || `${formula.title_kh}-${formula.grade}`}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-3xl border border-slate-100 bg-white p-3.5 shadow-sm"
                      >
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                            isPdf ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                          }`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>

                        <div className="mt-4 min-h-[4.25rem]">
                          <h2 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">
                            {formula.title_kh}
                          </h2>
                          <p className="mt-2 text-xs text-slate-400">{estimateFileSize(formula)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownload(formula)}
                          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-800 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </motion.div>
  );
};

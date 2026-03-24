import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Clock3,
  Search,
  Trash2,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BlockMath } from "react-katex";

import { ScanHeader } from "../components/ScanHeader.jsx";
import { SkeletonBlock } from "../components/SkeletonBlock.jsx";
import { formulaService } from "../services/formulaService.js";

const sanitizeLatex = (value) => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/^\$+|\$+$/g, "")
    .replace(/\\\[(.*)\\\]/s, "$1")
    .replace(/\\\((.*)\\\)/s, "$1")
    .trim();
};

const getDateGroupLabel = (value) => {
  const entryDate = new Date(value);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfEntryDate = new Date(
    entryDate.getFullYear(),
    entryDate.getMonth(),
    entryDate.getDate()
  );

  const diffDays = Math.round((startOfToday - startOfEntryDate) / 86400000);

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return entryDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
};

const groupHistoryByDate = (items) => {
  const groups = [];

  items.forEach((item) => {
    const label = getDateGroupLabel(item.solvedAt);
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.label !== label) {
      groups.push({
        label,
        items: [item]
      });
      return;
    }

    lastGroup.items.push(item);
  });

  return groups;
};

const formatSolvedAt = (value) => {
  const date = new Date(value);
  const label = getDateGroupLabel(value);

  return `${label}, ${date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  })}`;
};

const getQuestionText = (item) => item.questionText || item.expression || "";

const getFinalAnswer = (item) =>
  item.finalAnswer || item.parsedSolution?.final_answer || item.solution?.final_answer || "";

const getStoredSolution = (item) => {
  if (item.parsedSolution) {
    return {
      ...item.parsedSolution,
      question_text: item.questionText || item.parsedSolution.question_text || item.expression || "",
      expression: item.questionText || item.parsedSolution.expression || item.expression || ""
    };
  }

  if (item.solutionText) {
    try {
      const parsedSolution = JSON.parse(item.solutionText);
      return {
        ...parsedSolution,
        question_text: item.questionText || parsedSolution.question_text || item.expression || "",
        expression: item.questionText || parsedSolution.expression || item.expression || ""
      };
    } catch (error) {
      return null;
    }
  }

  if (item.finalAnswer) {
    return {
      question_text: item.questionText || item.expression || "",
      expression: item.questionText || item.expression || "",
      final_answer: item.finalAnswer,
      steps: []
    };
  }

  return null;
};

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await formulaService.getUserHistory();
        setHistoryItems(response);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return historyItems;
    }

    return historyItems.filter((item) =>
      `${getQuestionText(item)} ${getFinalAnswer(item)}`.toLowerCase().includes(normalizedSearch)
    );
  }, [historyItems, searchValue]);

  const groupedHistory = useMemo(() => groupHistoryByDate(filteredHistory), [filteredHistory]);

  const handleDelete = async (historyItemId) => {
    const nextHistory = await formulaService.deleteHistoryItem(historyItemId);
    setHistoryItems(nextHistory);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-screen overflow-x-hidden bg-gradient-to-b from-green-50 to-white"
      style={{ fontFamily: '"Koh Santepheap", "Inter", "Kantumruy Pro", sans-serif' }}
    >
      <div className="app-shell-page mx-auto min-h-screen overflow-x-hidden bg-white">
        <ScanHeader />

        <main className="overflow-x-hidden px-4 py-4 md:px-5 lg:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-2 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <section className="rounded-[2rem] border border-green-100 bg-gradient-to-br from-green-50 via-white to-white p-4 shadow-sm">
            <h1 className="font-brand text-2xl leading-relaxed text-green-900">My History</h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              ពិនិត្យឡើងវិញនូវរាល់វិញ្ញាសាដែលបានដោះស្រាយ...
            </p>

            <label className="mt-4 flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-3 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="ស្វែងរកប្រវត្តិលំហាត់..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </section>

          <section className="mt-4 space-y-4">
            {isLoading ? (
              <div className="space-y-3.5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <article
                    key={`history-skeleton-${index}`}
                    className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <SkeletonBlock className="h-7 w-20 rounded-full" />
                      <SkeletonBlock className="h-8 w-8 rounded-full" />
                    </div>

                    <div className="mt-4 space-y-3">
                      <SkeletonBlock className="h-10 w-3/4 rounded-2xl" />
                      <SkeletonBlock className="h-8 w-1/2 rounded-2xl" />
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <SkeletonBlock className="h-3 w-28 rounded-lg" />
                      <div className="flex gap-2">
                        <SkeletonBlock className="h-10 w-24 rounded-xl" />
                        <SkeletonBlock className="h-10 w-20 rounded-xl" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : groupedHistory.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="rounded-[2rem] border border-dashed border-green-200 bg-gradient-to-br from-green-50 to-white p-7 text-center shadow-sm"
              >
                <div className="mx-auto flex w-fit flex-col items-center">
                  <motion.div
                    animate={{ y: [0, -6, 0], rotate: [-8, -4, -8] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    className="relative flex h-24 w-24 items-center justify-center"
                  >
                    <div className="absolute inset-4 rounded-full bg-green-100/80 blur-2xl" />
                    <div className="absolute bottom-4 h-3 w-20 rounded-full bg-green-100/80 blur-md" />
                    <div className="relative flex -rotate-12 items-center">
                      <div className="h-5 w-5 rounded-l-full border border-emerald-200 bg-gradient-to-r from-emerald-300 to-green-400" />
                      <div className="flex h-5 w-20 items-center justify-end rounded-r-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 pr-2 shadow-[0_14px_28px_rgba(34,197,94,0.22)]">
                        <div className="h-2 w-2 rounded-full bg-white/85" />
                      </div>
                      <div className="h-5 w-3 bg-emerald-700" />
                      <div className="h-0 w-0 border-y-[10px] border-l-[14px] border-y-transparent border-l-[#f4d7a1]" />
                      <div className="-ml-[3px] h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-slate-700" />
                    </div>
                  </motion.div>
                </div>

                <h2 className="mt-5 text-lg font-semibold leading-relaxed text-slate-800">
                  មិនទាន់មានប្រវត្តិដោះស្រាយលំហាត់
                </h2>
                <p className="mt-2 text-sm font-light leading-relaxed text-slate-500">
                      ដោះស្រាយវិញ្ញាសាជាមួយ Math Vision ដើម្បីវាស់ស្ទង់វឌ្ឍនភាពរបស់អ្នក!                </p>

                <button
                  type="button"
                  onClick={() => navigate("/solve")}
                  className="group mt-5 inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_10px_22px_rgba(220,252,231,0.95)] transition hover:bg-green-800"
                >
                  <span>Start Solving</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </motion.div>
            ) : (
              groupedHistory.map((group) => (
                <section key={group.label} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-green-100" />
                    <h2 className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                      {group.label}
                    </h2>
                    <div className="h-px flex-1 bg-green-100" />
                  </div>

                  <div className="space-y-3.5">
                    {group.items.map((item) => {
                      const questionText = getQuestionText(item);
                      const finalAnswer = getFinalAnswer(item);
                      const storedSolution = getStoredSolution(item);

                      return (
                        <article
                          key={item.id}
                          className="relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-md"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                              History
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
                              aria-label="Delete history entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-4 min-w-0 text-center">
                            <div className="max-w-full overflow-x-auto overflow-y-hidden text-xl font-semibold text-slate-900">
                              <BlockMath math={sanitizeLatex(questionText)} />
                            </div>

                            <div className="mt-3 max-w-full overflow-x-auto overflow-y-hidden text-base text-blue-500">
                              {finalAnswer ? (
                                <BlockMath math={sanitizeLatex(finalAnswer)} />
                              ) : (
                                <p className="text-sm text-slate-500">Solved with Math Vision</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-5 flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="inline-flex min-w-0 items-center gap-1.5 text-xs text-slate-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              <span className="truncate">{formatSolvedAt(item.solvedAt)}</span>
                            </div>

                            <div className="flex min-w-0 items-center gap-2 self-stretch sm:self-auto">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/solve?expression=${encodeURIComponent(questionText)}`)
                                }
                                className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-white px-3.5 text-sm font-semibold text-green-700 transition hover:bg-green-50 sm:flex-none"
                              >
                                <RotateCcw className="h-4 w-4" />
                                <span>Again</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/solution?expression=${encodeURIComponent(questionText)}`, {
                                    state: storedSolution
                                      ? {
                                          prefetchedSolution: storedSolution
                                        }
                                      : undefined
                                  })
                                }
                                className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-xl bg-green-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 sm:flex-none"
                              >
                                <span>View</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </section>
        </main>
      </div>
    </motion.div>
  );
};

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { SolutionActions } from "../components/solution/SolutionActions.jsx";
import { SolutionGraphCard } from "../components/solution/SolutionGraphCard.jsx";
import { SolutionOverviewCard } from "../components/solution/SolutionOverviewCard.jsx";
import { SolutionQuestionCard } from "../components/solution/SolutionQuestionCard.jsx";
import { SolutionResultCard } from "../components/solution/SolutionResultCard.jsx";
import { SolutionSkeleton } from "../components/solution/SolutionSkeleton.jsx";
import { SolutionStepsTimeline } from "../components/solution/SolutionStepsTimeline.jsx";
import { SubscriptionModal } from "../components/SubscriptionModal.jsx";
import { useSolutionData } from "../hooks/useSolutionData.js";
import {
  buildShareText,
  buildPdfFile,
  downloadPdfFile
} from "../services/solutionExportService.js";
import { buildGraphData } from "../utils/solution/graph.js";
import { sanitizeLatex, stripLatexForPlainResult } from "../utils/solution/latex.js";
import { getSolutionStyle } from "../utils/solution/solutionFormatting.js";

const PDF_DOWNLOAD_FALLBACK_MESSAGE = "ឯកសារ PDF ត្រូវបានរក្សាទុកក្នុង Downloads";
const PDF_EXPORTING_MESSAGE = "កំពុងរៀបចំឯកសារ PDF...";
const PDF_SUCCESS_TITLE = "រក្សាទុកជោគជ័យ!";
const PDF_SUCCESS_DETAIL =
  "លោកអ្នកអាចរកឯកសារនេះបាននៅក្នុងកម្មវិធី Files ឬ Downloads។";

const formatResetCountdown = (timeLeftMs) => {
  const safeMs = Math.max(0, timeLeftMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

const getNextDailyResetMs = () => {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setHours(24, 0, 0, 0);
  return nextReset.getTime() - now.getTime();
};

export const SolutionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pageRef = useRef(null);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(() => formatResetCountdown(getNextDailyResetMs()));
  const [pdfDialog, setPdfDialog] = useState({
    open: false,
    fileUrl: "",
    fileName: ""
  });

  const expression = searchParams.get("expression") || "";
  const prefetchedSolution = location.state?.prefetchedSolution || null;

  const {
    solution,
    isLoading,
    errorMessage,
    setErrorMessage,
    showSubscriptionModal,
    setShowSubscriptionModal
  } = useSolutionData({
    expression,
    prefetchedSolution
  });

  const questionDisplayText = useMemo(
    () => solution?.question_text || solution?.expression || expression,
    [expression, solution?.expression, solution?.question_text]
  );
  const cleanFinalAnswer = useMemo(
    () => sanitizeLatex(solution?.final_answer || ""),
    [solution?.final_answer]
  );
  const plainFinalAnswer = useMemo(
    () => stripLatexForPlainResult(solution?.final_answer || ""),
    [solution?.final_answer]
  );
  const solutionStyle = useMemo(
    () => getSolutionStyle(solution, expression),
    [expression, solution]
  );
  const graphData = useMemo(
    () => buildGraphData(solution?.expression || expression),
    [expression, solution?.expression]
  );
  const finalAnswerText = plainFinalAnswer || cleanFinalAnswer;
  const stepsCount = solution?.steps?.length || 0;
  const isAnswerOnlySolution = Boolean(solution?.isAnswerOnly);

  const closePdfDialog = useCallback(() => {
    setPdfDialog((current) => {
      if (current.fileUrl) {
        URL.revokeObjectURL(current.fileUrl);
      }

      return {
        open: false,
        fileUrl: "",
        fileName: ""
      };
    });
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setResetCountdown(formatResetCountdown(getNextDailyResetMs()));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    return () => {
      if (pdfDialog.fileUrl) {
        URL.revokeObjectURL(pdfDialog.fileUrl);
      }
    };
  }, [pdfDialog.fileUrl]);

  const handleExportPdf = useCallback(async () => {
    try {
      setIsExportingPdf(true);
      setActionFeedback(null);

      const pdfFile = await buildPdfFile(pageRef.current);

      if (!pdfFile) {
        throw new Error("Unable to build PDF.");
      }

      const fileUrl = downloadPdfFile(pdfFile);

      if (navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
        try {
          await navigator.share({
            title: "Math Vision Solution",
            text: buildShareText({
              question: questionDisplayText,
              finalAnswer: finalAnswerText,
              stepsCount
            }),
            files: [pdfFile]
          });
        } catch (error) {
          if (error?.name !== "AbortError") {
            throw error;
          }
        }
      } else {
        setActionFeedback({
          type: "success",
          message: PDF_DOWNLOAD_FALLBACK_MESSAGE
        });
      }

      setPdfDialog({
        open: true,
        fileUrl: fileUrl || "",
        fileName: pdfFile.name
      });
    } catch {
      setActionFeedback({
        type: "error",
        message: "Unable to export the PDF right now. Please try again."
      });
    } finally {
      setIsExportingPdf(false);
    }
  }, [finalAnswerText, questionDisplayText, stepsCount]);

  const handleShare = useCallback(async () => {
    const shareText = buildShareText({
      question: questionDisplayText,
      finalAnswer: finalAnswerText,
      stepsCount
    });

    try {
      if (navigator.share) {
        const pdfFile = await buildPdfFile(pageRef.current);

        if (pdfFile && navigator.canShare?.({ files: [pdfFile] })) {
          await navigator.share({
            title: "Math Vision Solution",
            text: shareText,
            files: [pdfFile]
          });
        } else {
          await navigator.share({
            title: "Math Vision Solution",
            text: shareText,
            url: window.location.href
          });
        }

        setActionFeedback({
          type: "success",
          message: "Solution shared successfully."
        });
        return;
      }

      await navigator.clipboard.writeText(`${shareText}\n\nLink: ${window.location.href}`);
      setActionFeedback({
        type: "success",
        message: "Share text copied to clipboard."
      });
    } catch {
      setActionFeedback({
        type: "error",
        message: "Unable to share the solution right now. Please try again."
      });
    }
  }, [finalAnswerText, questionDisplayText, stepsCount]);

  const handleBack = useCallback(() => {
    navigate("/", { state: { reset: true } });
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white"
    >
      <header className="sticky top-0 z-20 border-b border-green-100 bg-white/90 backdrop-blur-md">
        <div className="app-shell mx-auto grid grid-cols-[48px_1fr_48px] items-center px-4 py-4 md:px-5">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-700 shadow-sm transition hover:bg-green-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <p className="text-lg font-black tracking-tight text-green-700">Math Vision</p>
          </div>

          <div />
        </div>
      </header>

      <main ref={pageRef} className="app-shell-page mx-auto px-4 py-4 md:px-5 lg:px-6">
        <SolutionQuestionCard question={questionDisplayText} />

        {isLoading ? <SolutionSkeleton /> : null}

        {!isLoading && errorMessage ? (
          <motion.div
            data-pdf-ignore="true"
            initial={{ x: 0 }}
            animate={{ x: [0, -10, 10, -8, 8, 0] }}
            transition={{ duration: 0.35 }}
            className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {errorMessage}
          </motion.div>
        ) : null}

        {!isLoading && actionFeedback ? (
          <div
            data-pdf-ignore="true"
            className={`mt-4 rounded-3xl border p-4 text-sm ${
              actionFeedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {actionFeedback.message}
          </div>
        ) : null}

        {isExportingPdf ? (
          <div
            data-pdf-ignore="true"
            className="mt-4 rounded-3xl border border-emerald-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-emerald-100" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-700">{PDF_EXPORTING_MESSAGE}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-50">
                  <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400" />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!isLoading && solution ? (
          <>
            {!isAnswerOnlySolution ? (
              <>
                <SolutionOverviewCard
                  solutionStyle={solutionStyle}
                  stepsCount={solution.steps?.length || 0}
                />
                <SolutionStepsTimeline
                  steps={solution.steps || []}
                  solutionStyle={solutionStyle}
                />
                <SolutionGraphCard data={graphData} />
              </>
            ) : (
              <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p className="leading-relaxed">
                  This free solve was returned in answer-only mode. Upgrade to Pro to see the full explanation.
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-medium text-amber-700">
                    Reset in {resetCountdown}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSubscriptionModal(true)}
                    className="inline-flex shrink-0 items-center rounded-full bg-[#22c55e] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#16a34a]"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            )}
            <SolutionResultCard
              plainFinalAnswer={plainFinalAnswer}
              cleanFinalAnswer={cleanFinalAnswer}
            />
            <SolutionActions
              onExportPdf={handleExportPdf}
              onShare={handleShare}
            />

            <footer data-pdf-ignore="true" className="pb-6 pt-5 text-center text-[11px] text-slate-400">
              Solution generated by Math Vision AI Engine
            </footer>
          </>
        ) : null}
      </main>

      {pdfDialog.open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-sm rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <span className="text-2xl">✓</span>
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-emerald-700">{PDF_SUCCESS_TITLE}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{PDF_SUCCESS_DETAIL}</p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (pdfDialog.fileUrl) {
                    window.open(pdfDialog.fileUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Open PDF
              </button>
              <button
                type="button"
                onClick={closePdfDialog}
                className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </motion.div>
  );
};

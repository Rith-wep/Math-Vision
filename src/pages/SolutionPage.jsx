import { useCallback, useMemo, useRef, useState } from "react";
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
import { useSolutionData } from "../hooks/useSolutionData.js";
import {
  buildShareText,
  buildSolutionCopyText,
  buildPdfFile,
  exportElementToPdf
} from "../services/solutionExportService.js";
import { buildGraphData } from "../utils/solution/graph.js";
import { sanitizeLatex, stripLatexForPlainResult } from "../utils/solution/latex.js";
import { getSolutionStyle } from "../utils/solution/solutionFormatting.js";

export const SolutionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pageRef = useRef(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  const expression = searchParams.get("expression") || "";
  const prefetchedSolution = location.state?.prefetchedSolution || null;

  const { solution, isLoading, errorMessage, setErrorMessage } = useSolutionData({
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

  const handleExportPdf = useCallback(async () => {
    try {
      await exportElementToPdf(pageRef.current);
      setActionFeedback({
        type: "success",
        message: "PDF exported successfully."
      });
    } catch {
      setActionFeedback({
        type: "error",
        message: "Unable to export the PDF right now. Please try again."
      });
    }
  }, []);

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

  const handleCopy = useCallback(async () => {
    if (!solution) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        buildSolutionCopyText({
          question: questionDisplayText,
          finalAnswer: finalAnswerText,
          steps: solution.steps || []
        })
      );
      setErrorMessage("");
      setActionFeedback({
        type: "success",
        message: "Solution copied to clipboard."
      });
    } catch {
      setActionFeedback({
        type: "error",
        message: "Unable to copy the solution. Please try again."
      });
    }
  }, [finalAnswerText, questionDisplayText, setErrorMessage, solution]);

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
            className={`mt-4 rounded-3xl border p-4 text-sm ${
              actionFeedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {actionFeedback.message}
          </div>
        ) : null}

        {!isLoading && solution ? (
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
            <SolutionResultCard
              plainFinalAnswer={plainFinalAnswer}
              cleanFinalAnswer={cleanFinalAnswer}
            />
            <SolutionActions
              onExportPdf={handleExportPdf}
              onShare={handleShare}
              onCopy={handleCopy}
            />

            <footer className="pb-6 pt-5 text-center text-[11px] text-slate-400">
              Solution generated by Math Vision AI Engine
            </footer>
          </>
        ) : null}
      </main>
    </motion.div>
  );
};

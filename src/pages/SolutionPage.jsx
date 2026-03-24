import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCheck, CheckCircle2, Download, Send } from "lucide-react";
import { BlockMath, InlineMath } from "react-katex";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { evaluate } from "mathjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { formulaService } from "../services/formulaService.js";

const timelineVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" }
  }
};

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

const stripLatexForPlainResult = (value) => {
  if (!value) {
    return "";
  }

  const sanitized = sanitizeLatex(value);

  if (/^[\d\s.,\-+/=]+$/.test(sanitized)) {
    return sanitized.replace(/\s+/g, " ").trim();
  }

  return "";
};

const hasKhmerText = (value) => /[\u1780-\u17FF]/.test(value);

const delimitedMathPattern = /\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$\$[\s\S]+?\$\$|\$[^$\n]+\$/g;

const commandMathPattern =
  /\\(?:frac|sqrt|Delta|pi|times|div|sin|cos|tan|log|ln|int|cdot|left|right|theta|alpha|beta|gamma|sum|Sigma)(?:\{[^{}]*\})*(?:\s*[=+\-*/]\s*[a-zA-Z0-9\\{}^().,+-]+)*/g;

const plainMathPattern =
  /[a-zA-Z0-9]+(?:\^\{?[^}\s]+\}?)*(?:\s*[=+\-*/]\s*[a-zA-Z0-9\\{}^().,+-]+)+/g;

const isDelimitedMathOnlyLine = (value) => {
  const trimmed = value.trim();

  return (
    /^\\\[[\s\S]+\\\]$/.test(trimmed)
    || /^\\\([\s\S]+\\\)$/.test(trimmed)
    || /^\$\$[\s\S]+\$\$$/.test(trimmed)
    || /^\$[^$\n]+\$$/.test(trimmed)
  );
};

const splitInlineMathSegments = (text) => {
  if (!text) {
    return [];
  }

  const pattern = new RegExp(
    `(${delimitedMathPattern.source}|${commandMathPattern.source}|${plainMathPattern.source})`,
    "g"
  );

  return text.split(pattern).filter(Boolean).map((segment) => {
    const trimmed = segment.trim();
    const isMath =
      isDelimitedMathOnlyLine(trimmed)
      || trimmed.startsWith("\\")
      || (/^[a-zA-Z0-9\\{}^().+\-*/=,\s]+$/.test(trimmed)
        && /[\\^_=+\-*/]/.test(trimmed)
        && !hasKhmerText(trimmed));

    return {
      type: isMath ? "math" : "text",
      value: segment
    };
  });
};

const isLikelyMathLine = (line) => {
  const trimmed = line.trim();

  if (!trimmed) {
    return false;
  }

  if (isDelimitedMathOnlyLine(trimmed)) {
    return true;
  }

  if (hasKhmerText(trimmed)) {
    return false;
  }

  return /[\\^_=+\-*/()[\]{}]/.test(trimmed) || /[a-zA-Z]\d|\d[a-zA-Z]/.test(trimmed);
};

const renderInlineKhmerMath = (text) => {
  if (!text) {
    return null;
  }

  const parts = text
    .split(/(\$[^$]+\$|\\[A-Za-z]+(?:\{[^{}]*\})*(?:\s*=\s*[^។,\n]+)?|[a-zA-Z0-9]+(?:\^\{?[^}\s]+\}?)*(?:\s*[=+\-*/]\s*[a-zA-Z0-9\\{}^().+-]+)+)/g)
    .filter(Boolean);

  return parts.map((part, index) => {
    const trimmed = part.trim();
    const looksLikeMath =
      (trimmed.startsWith("$") && trimmed.endsWith("$")) ||
      trimmed.startsWith("\\") ||
      (/^[a-zA-Z0-9\\{}^().+\-*/=\s]+$/.test(trimmed) &&
        /[\\^_=+\-*/]/.test(trimmed) &&
        !hasKhmerText(trimmed));

    if (looksLikeMath) {
      return <InlineMath key={`math-${index}`} math={sanitizeLatex(trimmed)} />;
    }

    return <span key={`text-${index}`}>{part}</span>;
  });
};

const renderInlineKhmerMathSafe = (text) => {
  if (!text) {
    return null;
  }

  return splitInlineMathSegments(text).map((segment, index) => {
    if (segment.type === "math") {
      return <InlineMath key={`safe-math-${index}`} math={sanitizeLatex(segment.value)} />;
    }

    return <span key={`safe-text-${index}`}>{segment.value}</span>;
  });
};

const renderKhmerExplanation = (text) => {
  if (!text) {
    return null;
  }

  return text.split("\n").map((line, index) => {
    if (!line.trim()) {
      return <div key={`space-${index}`} className="h-2" />;
    }

    if (isLikelyMathLine(line)) {
      return (
        <div key={`block-${index}`} className="overflow-x-auto py-1">
          <BlockMath math={sanitizeLatex(line)} />
        </div>
      );
    }

    return (
      <p key={`line-${index}`} className="leading-relaxed">
        {renderInlineKhmerMathSafe(line)}
      </p>
    );
  });
};

const getStepFormula = (step) => step?.formula || step?.latex || "";
const getStepExplanation = (step) => step?.explanation || step?.explanation_kh || "";

const detectGeometryStyle = (solution, expression) => {
  const source = `${expression} ${solution?.question_text || ""} ${solution?.steps
    ?.map((step) => `${getStepFormula(step)} ${getStepExplanation(step)}`)
    .join(" ") || ""}`;

  return /\\vec|AB|AC|BC|\(P\)|\(D\)|plane|vector|distance|cross|dot|ប្លង់|វ៉ិចទ័រ|ចម្ងាយ|បន្ទាត់/i.test(
    source
  );
};

const getSolutionStyle = (solution, expression) => {
  if (!solution) {
    return "standard";
  }

  if (detectGeometryStyle(solution, expression)) {
    return "geometry";
  }

  if ((solution.steps?.length || 0) >= 5) {
    return "long";
  }

  return "standard";
};

const getSolutionTags = (solutionStyle, stepsCount) => {
  const tags = [];

  if (solutionStyle === "geometry") {
    tags.push("Geometry");
    tags.push("Multi-part");
  } else if (solutionStyle === "long") {
    tags.push("Long-form");
  } else {
    tags.push("Structured");
  }

  tags.push(`${stepsCount} steps`);
  return tags;
};

const getStepTitle = (step, index, solutionStyle) => {
  const explanation = getStepExplanation(step);
  const formula = getStepFormula(step);

  if (/^(ក|ខ|គ|ឃ|ង|ច|ឆ|ជ|ឈ|ញ|ដ|ឋ|ឌ|ឍ|ណ|ត|ថ|ទ|ធ|ន|ប|ផ|ព|ភ|ម|យ|រ|ល|វ|ស|ហ)\s*[.)៖:-]/u.test(explanation)) {
    return explanation.split("\n")[0].trim();
  }

  if (solutionStyle === "geometry") {
    const geometryTitles = [
      "Setup",
      "Vector Work",
      "Derivation",
      "Equation Build",
      "Conclusion",
      "Final Check"
    ];

    return geometryTitles[index] || `Part ${index + 1}`;
  }

  if (/\\Delta|sqrt|frac|=/.test(formula)) {
    return "Derivation";
  }

  return `Step ${step.step || index + 1}`;
};

const toPlainCopyText = (text) => {
  if (!text) {
    return "";
  }

  return text
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const latexToMathExpression = (latex) => {
  return sanitizeLatex(latex)
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/\\cdot/g, "*")
    .replace(/\\times/g, "*")
    .replace(/\\div/g, "/")
    .replace(/\\pi/g, "pi")
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\\sqrt\{([^{}]+)\}/g, "sqrt($1)")
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "(($1)/($2))")
    .replace(/(\d)([a-zA-Z])/g, "$1*$2")
    .replace(/([a-zA-Z])(\d)/g, "$1*$2")
    .replace(/([xy)])\(/g, "$1*(")
    .replace(/\)([xy\d])/g, ")*$1");
};

const getGraphExpression = (latex) => {
  const normalized = sanitizeLatex(latex);

  if (!/[xy]/i.test(normalized)) {
    return "";
  }

  if (normalized.includes("=")) {
    const [leftSide, rightSide] = normalized.split("=");
    const left = leftSide.trim();
    const right = rightSide.trim();

    if (/^y$/i.test(left)) {
      return right;
    }

    if (/^y$/i.test(right)) {
      return left;
    }

    return `(${left})-(${right})`;
  }

  return normalized;
};

const buildGraphData = (latex) => {
  const graphSource = getGraphExpression(latex);

  if (!graphSource || /y/i.test(graphSource)) {
    return [];
  }

  const compiled = latexToMathExpression(graphSource);
  const points = [];

  for (let x = -10; x <= 10; x += 1) {
    try {
      const y = evaluate(compiled, { x, pi: Math.PI });

      if (Number.isFinite(y)) {
        points.push({
          x,
          y: Number(y.toFixed(3))
        });
      }
    } catch (error) {
      return [];
    }
  }

  return points;
};

const SkeletonBlock = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 ${className}`.trim()}
  />
);

const SolutionSkeleton = () => {
  return (
    <div className="mt-4 space-y-4">
      <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <SkeletonBlock className="h-4 w-28" />
        <div className="mt-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3.5">
          <SkeletonBlock className="mx-auto h-10 w-44" />
        </div>
      </section>

      <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="h-7 w-24 rounded-full" />
        </div>

        <div className="mt-4 space-y-4">
          {[1, 2].map((step) => (
            <div key={step} className="relative pl-14">
              <div className="absolute left-0 top-1 h-10 w-10 rounded-full bg-green-100" />
              <div className="rounded-3xl border border-green-100 bg-white px-4 py-4 shadow-sm">
                <SkeletonBlock className="h-16 w-full bg-green-50" />
                <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 px-4 py-3.5">
                  <SkeletonBlock className="h-4 w-11/12" />
                  <SkeletonBlock className="h-4 w-10/12" />
                  <SkeletonBlock className="h-4 w-8/12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
        <div className="border-l-4 border-green-200 pl-4">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="mt-3 h-10 w-40" />
        </div>
      </section>
    </div>
  );
};

export const SolutionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const expression = searchParams.get("expression") || "";
  const pageRef = useRef(null);
  const lastLoadedKeyRef = useRef("");

  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadSolution = async () => {
      const requestKey = `${expression}::${Boolean(location.state?.prefetchedSolution)}`;

      if (lastLoadedKeyRef.current === requestKey) {
        return;
      }

      lastLoadedKeyRef.current = requestKey;

      if (!expression.trim()) {
        setErrorMessage("សមីការមិនត្រឹមត្រូវ សូមពិនិត្យឡើងវិញ");
        setIsLoading(false);
        return;
      }

      const prefetchedSolution = location.state?.prefetchedSolution;
      if (prefetchedSolution) {
        setSolution(prefetchedSolution);
        setIsLoading(false);
        return;
      }

      try {
        const result = await formulaService.solve(expression);
        setSolution(result);
      } catch (error) {
        lastLoadedKeyRef.current = "";
        setErrorMessage(
          error.response?.data?.message || "សមីការមិនត្រឹមត្រូវ សូមពិនិត្យឡើងវិញ"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSolution();
  }, [expression, location.state]);

  const cleanExpression = useMemo(() => sanitizeLatex(expression), [expression]);
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
  const solutionTags = useMemo(
    () => getSolutionTags(solutionStyle, solution?.steps?.length || 0),
    [solution?.steps?.length, solutionStyle]
  );
  const graphData = useMemo(
    () => buildGraphData(solution?.expression || expression),
    [expression, solution?.expression]
  );

  const exportToPdf = async () => {
    if (!pageRef.current) {
      return;
    }

    const canvas = await html2canvas(pageRef.current, {
      scale: 2,
      backgroundColor: "#ffffff"
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
    pdf.save("math-vision-solution.pdf");
  };

  const shareToTelegram = () => {
    const shareText = [
      "Math Vision Solution",
      `Question: ${cleanExpression}`,
      `Final Answer: ${plainFinalAnswer || cleanFinalAnswer}`
    ].join("\n");

    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
      window.location.href
    )}&text=${encodeURIComponent(shareText)}`;

    window.open(telegramUrl, "_blank", "noopener,noreferrer");
  };

  const copySolution = async () => {
    if (!solution) {
      return;
    }

    const stepsText = solution.steps
      .map(
        (step, index) =>
          `Step ${index + 1}\n${sanitizeLatex(getStepFormula(step))}\n${toPlainCopyText(
            getStepExplanation(step)
          )}`
      )
      .join("\n\n");

    const copyText = [
      "Math Vision Solution",
      `Question: ${cleanExpression}`,
      `Final Answer: ${plainFinalAnswer || cleanFinalAnswer}`,
      "",
      stepsText
    ].join("\n");

    try {
      await navigator.clipboard.writeText(copyText);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("មិនអាចចម្លងដំណោះស្រាយបានទេ។ សូមព្យាយាមម្តងទៀត។");
    }
  };

  const handleBack = () => {
    navigate("/", { state: { reset: true } });
  };

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
        <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold leading-relaxed text-green-900">សំណួររបស់អ្នក</p>
          <div className="mt-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3.5 text-center">
            <div className="overflow-x-auto font-mono text-lg text-slate-900">
              <BlockMath math={cleanExpression} />
            </div>
          </div>
        </section>

        {isLoading && <SolutionSkeleton />}

        {!isLoading && errorMessage && (
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: [0, -10, 10, -8, 8, 0] }}
            transition={{ duration: 0.35 }}
            className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {errorMessage}
          </motion.div>
        )}

        {!isLoading && solution && (
          <>
            <section className="mt-5 rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Solution Overview
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">
                    {solutionStyle === "geometry"
                      ? "Detailed Geometry Breakdown"
                      : solutionStyle === "long"
                        ? "Extended Step-by-Step Walkthrough"
                        : "Clean Structured Solution"}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                    {solutionStyle === "geometry"
                      ? "This answer is arranged for a longer vector or analytic geometry workflow so each derivation stays readable."
                      : solutionStyle === "long"
                        ? "This problem needs a few connected steps, so the solution is grouped for easier reading."
                        : "The answer is organized into concise steps with formulas and explanation together."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {solutionTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-green-100 bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-green-900">Step-by-Step Solution</h2>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white px-3 py-1 text-[11px] font-medium text-green-700 shadow-sm">
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>AI Verified</span>
                </div>
              </div>

              <motion.div
                variants={timelineVariants}
                initial="hidden"
                animate="show"
                className={`space-y-4 ${solutionStyle === "geometry" ? "md:space-y-5" : ""}`}
              >
                {solution.steps.map((step, index) => (
                  <motion.article
                    key={`timeline-${index}`}
                    variants={itemVariants}
                    className={`relative ${solutionStyle === "geometry" ? "pl-0 md:pl-16" : "pl-14"}`}
                  >
                    {index < solution.steps.length - 1 && (
                      <div
                        className={`absolute bottom-[-24px] w-0.5 bg-green-200 ${
                          solutionStyle === "geometry"
                            ? "left-[19px] top-14 hidden md:block"
                            : "left-[19px] top-11"
                        }`}
                      />
                    )}

                    <div
                      className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-sm ${
                        solutionStyle === "geometry" ? "hidden md:flex" : ""
                      }`}
                    >
                      {step.step || index + 1}
                    </div>

                    <div
                      className={`rounded-3xl border border-green-100 bg-white px-4 py-4 shadow-sm ${
                        solutionStyle === "geometry" ? "overflow-hidden" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-green-700 shadow-sm">
                            <span>{step.step || index + 1}</span>
                            <span className="text-slate-300">|</span>
                            <span>{getStepTitle(step, index, solutionStyle)}</span>
                          </div>
                        </div>

                        {solutionStyle === "geometry" ? (
                          <div className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700">
                            Part {index + 1}
                          </div>
                        ) : null}
                      </div>

                      {getStepFormula(step) ? (
                        <div
                          className={`mt-3 overflow-x-auto rounded-2xl px-4 py-3.5 ${
                            solutionStyle === "geometry"
                              ? "border border-green-100 bg-gradient-to-r from-green-50 via-white to-green-50"
                              : "bg-green-50"
                          }`}
                        >
                          <BlockMath math={sanitizeLatex(getStepFormula(step))} />
                        </div>
                      ) : null}

                      <div
                        className={`mt-3 rounded-2xl px-4 py-3.5 ${
                          solutionStyle === "geometry"
                            ? "border border-slate-100 bg-slate-50/85"
                            : "bg-slate-50"
                        }`}
                      >
                        <div className="space-y-2 text-sm leading-relaxed text-slate-700">
                          {renderKhmerExplanation(getStepExplanation(step))}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </section>

            {graphData.length > 0 && (
              <section className="mt-5 rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-green-900">2D Graph</p>
                <div className="mt-3 h-64 rounded-2xl bg-green-50 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphData}>
                      <CartesianGrid stroke="#bbf7d0" strokeDasharray="3 3" />
                      <XAxis dataKey="x" stroke="#166534" />
                      <YAxis stroke="#166534" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <section className="mt-5 rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Result
                </p>
                <div className="mt-3 overflow-x-auto text-3xl font-extrabold text-green-700">
                  {plainFinalAnswer ? (
                    <p>{plainFinalAnswer}</p>
                  ) : (
                    <BlockMath math={cleanFinalAnswer} />
                  )}
                </div>
              </div>
            </section>

            <section className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={exportToPdf}
                className="flex items-center justify-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 transition hover:bg-green-100"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={shareToTelegram}
                className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={copySolution}
                className="rounded-2xl border border-green-100 bg-white px-4 py-3 text-sm font-medium text-green-800 transition hover:bg-green-50"
              >
                Copy
              </button>
            </section>

            <footer className="pb-6 pt-5 text-center text-[11px] text-slate-400">
              Solution generated by Math Vision AI Engine
            </footer>
          </>
        )}
      </main>
    </motion.div>
  );
};

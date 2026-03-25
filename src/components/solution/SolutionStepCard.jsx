import { memo } from "react";
import { ChevronDown } from "lucide-react";

import { ExplanationContent } from "./SolutionMathContent.jsx";
import { SafeMath } from "./SafeMath.jsx";

export const SolutionStepCard = memo(function SolutionStepCard({
  index,
  stepNumber,
  title,
  formula,
  explanation,
  solutionStyle,
  isExpanded,
  onToggle,
  showConnector
}) {
  return (
    <article className={`relative ${solutionStyle === "geometry" ? "pl-0 md:pl-16" : "pl-14"}`}>
      {showConnector ? (
        <div
          className={`absolute bottom-[-24px] w-0.5 bg-green-200 ${
            solutionStyle === "geometry"
              ? "left-[19px] top-14 hidden md:block"
              : "left-[19px] top-11"
          }`}
        />
      ) : null}

      <div
        className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white shadow-sm ${
          solutionStyle === "geometry" ? "hidden md:flex" : ""
        }`}
      >
        {stepNumber}
      </div>

      <div
        className={`rounded-3xl border border-green-100 bg-white px-4 py-4 shadow-sm ${
          solutionStyle === "geometry" ? "overflow-hidden" : ""
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
          aria-expanded={isExpanded}
          aria-controls={`solution-step-panel-${index}`}
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-green-700 shadow-sm">
              <span>{stepNumber}</span>
              <span className="text-slate-300">|</span>
              <span>{title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {solutionStyle === "geometry" ? (
              <div className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700">
                Part {stepNumber}
              </div>
            ) : null}

            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-700">
              <ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} />
            </span>
          </div>
        </button>

        {formula ? (
          <div
            className={`mt-3 overflow-x-auto rounded-2xl px-4 py-3.5 ${
              solutionStyle === "geometry"
                ? "border border-green-100 bg-gradient-to-r from-green-50 via-white to-green-50"
                : "bg-green-50"
            }`}
          >
            <SafeMath math={formula} mode="block" fallbackClassName="whitespace-pre-wrap" />
          </div>
        ) : null}

        {isExpanded ? (
          <div
            id={`solution-step-panel-${index}`}
            className={`mt-3 rounded-2xl px-4 py-3.5 ${
              solutionStyle === "geometry"
                ? "border border-slate-100 bg-slate-50/85"
                : "bg-slate-50"
            }`}
          >
            <div className="space-y-2 text-sm leading-relaxed text-slate-700">
              <ExplanationContent text={explanation} />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
});

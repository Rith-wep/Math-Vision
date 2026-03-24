import { memo, useMemo } from "react";

import { getSolutionTags } from "../../utils/solution/solutionFormatting.js";

export const SolutionOverviewCard = memo(function SolutionOverviewCard({ solutionStyle, stepsCount }) {
  const tags = useMemo(() => getSolutionTags(solutionStyle, stepsCount), [solutionStyle, stepsCount]);

  return (
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
          {tags.map((tag) => (
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
  );
});

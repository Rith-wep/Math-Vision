import { memo, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCheck } from "lucide-react";

import { SolutionStepCard } from "./SolutionStepCard.jsx";
import {
  getStepExplanation,
  getStepFormula,
  getStepTitle
} from "../../utils/solution/solutionFormatting.js";

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

export const SolutionStepsTimeline = memo(function SolutionStepsTimeline({ steps, solutionStyle }) {
  const [expandedSteps, setExpandedSteps] = useState(() => new Set([0]));

  useEffect(() => {
    setExpandedSteps(new Set([0]));
  }, [steps]);

  const normalizedSteps = useMemo(
    () =>
      steps.map((step, index) => ({
        id: `timeline-${index}`,
        index,
        stepNumber: step.step || index + 1,
        title: getStepTitle(step, index, solutionStyle),
        formula: getStepFormula(step),
        explanation: getStepExplanation(step)
      })),
    [solutionStyle, steps]
  );

  const areAllExpanded = expandedSteps.size === normalizedSteps.length && normalizedSteps.length > 0;

  const toggleStep = (index) => {
    setExpandedSteps((current) => {
      const next = new Set(current);

      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }

      return next;
    });
  };

  const toggleAllSteps = () => {
    setExpandedSteps(
      areAllExpanded ? new Set() : new Set(normalizedSteps.map((step) => step.index))
    );
  };

  return (
    <section className="mt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-green-900">Step-by-Step Solution</h2>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-white px-3 py-1 text-[11px] font-medium text-green-700 shadow-sm">
            <CheckCheck className="h-3.5 w-3.5" />
            <span>AI Verified</span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleAllSteps}
          className="rounded-full border border-green-100 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-50"
        >
          {areAllExpanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <motion.div
        variants={timelineVariants}
        initial="hidden"
        animate="show"
        className={`space-y-4 ${solutionStyle === "geometry" ? "md:space-y-5" : ""}`}
      >
        {normalizedSteps.map((step, index) => (
          <motion.div key={step.id} variants={itemVariants}>
            <SolutionStepCard
              index={step.index}
              stepNumber={step.stepNumber}
              title={step.title}
              formula={step.formula}
              explanation={step.explanation}
              solutionStyle={solutionStyle}
              isExpanded={expandedSteps.has(step.index)}
              onToggle={() => toggleStep(step.index)}
              showConnector={index < normalizedSteps.length - 1}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
});

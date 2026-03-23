import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { BlockMath } from "react-katex";

const stepVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25
    }
  }
};

export const SolutionStepCard = ({ step, stepNumber }) => {
  const [isOpen, setIsOpen] = useState(stepNumber === 1);

  return (
    <motion.article
      variants={stepVariants}
      className="overflow-hidden rounded-3xl border border-brand-line bg-white shadow-sm"
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 p-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-2xl bg-green-50 p-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Step {stepNumber}
            </p>
            {step.latex && (
              <div className="mt-2 overflow-x-auto rounded-2xl bg-green-50 px-3 py-2">
                <BlockMath math={step.latex} />
              </div>
            )}
          </div>
        </div>

        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="border-t border-brand-line px-4 pb-4 pt-3">
          <p className="text-sm leading-7 text-slate-700">{step.explanation_kh}</p>
        </div>
      )}
    </motion.article>
  );
};

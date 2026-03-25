import { memo } from "react";

import { SafeMath } from "./SafeMath.jsx";

export const SolutionResultCard = memo(function SolutionResultCard({
  plainFinalAnswer,
  cleanFinalAnswer
}) {
  return (
    <section className="mt-5 rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
      <div className="border-l-4 border-green-500 pl-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Result
        </p>
        <div className="mt-3 overflow-x-auto text-3xl font-extrabold text-green-700">
          {plainFinalAnswer ? (
            <p>{plainFinalAnswer}</p>
          ) : (
            <SafeMath math={cleanFinalAnswer} mode="block" fallbackClassName="whitespace-pre-wrap" />
          )}
        </div>
      </div>
    </section>
  );
});

import { memo } from "react";

import { QuestionContent } from "./SolutionMathContent.jsx";

export const SolutionQuestionCard = memo(function SolutionQuestionCard({ question }) {
  return (
    <section className="rounded-3xl border border-green-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold leading-relaxed text-green-900">សំណួររបស់អ្នក</p>
      <div className="mt-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3.5 text-center">
        <div className="overflow-x-auto text-lg text-slate-900">
          <QuestionContent text={question} />
        </div>
      </div>
    </section>
  );
});

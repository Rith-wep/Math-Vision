import { memo } from "react";

import { SafeMath } from "./SafeMath.jsx";
import {
  splitDelimitedMathSegments,
  shouldPreferBlockMath
} from "../../utils/solution/latex.js";

const InlineMathSegments = memo(function InlineMathSegments({ text }) {
  return splitDelimitedMathSegments(text).map((segment, index) => {
    if (segment.type === "math") {
      return (
        <SafeMath
          key={`inline-math-${index}`}
          math={segment.value}
          mode="inline"
          fallbackClassName="whitespace-pre-wrap"
        />
      );
    }

    return <span key={`inline-text-${index}`}>{segment.value}</span>;
  });
});

export const ExplanationContent = memo(function ExplanationContent({ text }) {
  if (!text) {
    return null;
  }

  return text.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={`space-${index}`} className="h-2" />;
    }

    if (shouldPreferBlockMath(trimmed)) {
      return (
        <div key={`block-${index}`} className="overflow-x-auto py-1">
          <SafeMath math={trimmed} mode="block" fallbackClassName="whitespace-pre-wrap" />
        </div>
      );
    }

    return (
      <p key={`line-${index}`} className="leading-relaxed">
        <InlineMathSegments text={line} />
      </p>
    );
  });
});

export const QuestionContent = memo(function QuestionContent({ text }) {
  if (!text) {
    return null;
  }

  const trimmed = text.trim();

  if (shouldPreferBlockMath(trimmed)) {
    return <SafeMath math={trimmed} mode="block" fallbackClassName="whitespace-pre-wrap" />;
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      <ExplanationContent text={trimmed} />
    </div>
  );
});

import { memo } from "react";
import { BlockMath, InlineMath } from "react-katex";

import {
  hasKhmerText,
  isLikelyMathLine,
  sanitizeLatex,
  splitInlineMathSegments
} from "../../utils/solution/latex.js";

const InlineMathSegments = memo(function InlineMathSegments({ text }) {
  return splitInlineMathSegments(text).map((segment, index) => {
    if (segment.type === "math") {
      return <InlineMath key={`inline-math-${index}`} math={sanitizeLatex(segment.value)} />;
    }

    return <span key={`inline-text-${index}`}>{segment.value}</span>;
  });
});

export const ExplanationContent = memo(function ExplanationContent({ text }) {
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

  if (isLikelyMathLine(trimmed) && !hasKhmerText(trimmed)) {
    return <BlockMath math={sanitizeLatex(trimmed)} />;
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      <ExplanationContent text={trimmed} />
    </div>
  );
});

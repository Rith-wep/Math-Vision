import { memo, useMemo } from "react";

import { SafeMath } from "./SafeMath.jsx";
import {
  latexToReadableText,
  splitDelimitedMathSegments,
  shouldPreferBlockMath
} from "../../utils/solution/latex.js";

// ==============================
// INLINE SEGMENTS
// ==============================
const InlineMathSegments = memo(function InlineMathSegments({ text }) {
  const segments = useMemo(
    () => splitDelimitedMathSegments(text),
    [text]
  );

  return segments.map((segment, index) => {
    if (segment.type === "math") {
      return (
        <SafeMath
          key={`math-${index}`}
          math={segment.value}
          mode="inline"
          fallbackClassName="whitespace-pre-wrap"
        />
      );
    }

    const cleanText = latexToReadableText(segment.value);

    return (
      <span key={`text-${index}`}>
        {cleanText || segment.value}
      </span>
    );
  });
});

// ==============================
// EXPLANATION CONTENT
// ==============================
export const ExplanationContent = memo(function ExplanationContent({ text }) {
  const lines = useMemo(() => text?.split("\n") || [], [text]);

  if (!lines.length) return null;

  return (
    <>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={`space-${index}`} className="h-2" />;
        }

        // 🚨 safer block detection
        const isBlockMath = shouldPreferBlockMath(trimmed);

        if (isBlockMath) {
          return (
            <div
              key={`block-${index}`}
              className="overflow-x-auto py-1"
            >
              <SafeMath
                math={trimmed}
                mode="block"
                fallbackClassName="whitespace-pre-wrap"
              />
            </div>
          );
        }

        return (
          <p key={`line-${index}`} className="leading-relaxed">
            <InlineMathSegments text={line} />
          </p>
        );
      })}
    </>
  );
});

// ==============================
// QUESTION CONTENT
// ==============================
export const QuestionContent = memo(function QuestionContent({ text }) {
  const trimmed = useMemo(() => text?.trim() || "", [text]);

  if (!trimmed) return null;

  const isBlockMath = shouldPreferBlockMath(trimmed);

  // 🚨 important: avoid rendering BOTH math + text version
  if (isBlockMath) {
    return (
      <SafeMath
        math={trimmed}
        mode="block"
        fallbackClassName="whitespace-pre-wrap"
      />
    );
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-700">
      <ExplanationContent text={trimmed} />
    </div>
  );
});
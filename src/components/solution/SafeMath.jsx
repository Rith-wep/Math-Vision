import { memo, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";

import {
  isLikelyMathText,
  latexToReadableText,
  sanitizeLatex
} from "../../utils/solution/latex.js";

const TextFallback = memo(function TextFallback({ text, className = "" }) {
  const clean = useMemo(() => latexToReadableText(text) || text, [text]);

  return <span className={className}>{clean}</span>;
});

export const SafeMath = memo(function SafeMath({
  math,
  mode = "block",
  fallbackClassName = "",
  className = ""
}) {
  const trimmed = useMemo(() => (math || "").trim(), [math]);
  const sanitized = useMemo(() => sanitizeLatex(trimmed), [trimmed]);
  const isMathCandidate = useMemo(() => isLikelyMathText(trimmed), [trimmed]);

  if (!sanitized || !isMathCandidate) {
    return <TextFallback text={trimmed} className={fallbackClassName} />;
  }

  if (mode === "inline") {
    return (
      <InlineMath
        math={sanitized}
        renderError={() => <TextFallback text={trimmed} className={fallbackClassName} />}
      />
    );
  }

  return (
    <div className={className}>
      <BlockMath
        math={sanitized}
        renderError={() => <TextFallback text={trimmed} className={fallbackClassName} />}
      />
    </div>
  );
});

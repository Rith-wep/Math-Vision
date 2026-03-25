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
  const readableText = useMemo(() => latexToReadableText(trimmed) || trimmed, [trimmed]);

  if (!sanitized || !isMathCandidate) {
    return <TextFallback text={trimmed} className={fallbackClassName} />;
  }

  if (mode === "inline") {
    return (
      <span role="img" aria-label={readableText}>
        <span className="sr-only">{readableText}</span>
        <InlineMath
          math={sanitized}
          renderError={() => <TextFallback text={trimmed} className={fallbackClassName} />}
        />
      </span>
    );
  }

  return (
    <div className={className} role="img" aria-label={readableText}>
      <span className="sr-only">{readableText}</span>
      <BlockMath
        math={sanitized}
        renderError={() => <TextFallback text={trimmed} className={fallbackClassName} />}
      />
    </div>
  );
});

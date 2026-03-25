import { memo } from "react";
import { BlockMath, InlineMath } from "react-katex";

import { sanitizeLatex } from "../../utils/solution/latex.js";

const TextFallback = ({ text, className = "" }) => (
  <span className={className}>{sanitizeLatex(text) || text}</span>
);

export const SafeMath = memo(function SafeMath({
  math,
  mode = "block",
  fallbackClassName = "",
  className = ""
}) {
  const sanitizedMath = sanitizeLatex(math);

  if (!sanitizedMath) {
    return <TextFallback text={math} className={fallbackClassName} />;
  }

  if (mode === "inline") {
    return (
      <InlineMath
        math={sanitizedMath}
        renderError={() => <TextFallback text={math} className={fallbackClassName} />}
      />
    );
  }

  return (
    <div className={className}>
      <BlockMath
        math={sanitizedMath}
        renderError={() => <TextFallback text={math} className={fallbackClassName} />}
      />
    </div>
  );
});

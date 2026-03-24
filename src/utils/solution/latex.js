const DELIMITED_MATH_ONLY_PATTERN =
  /^\\\[[\s\S]+\\\]$|^\\\([\s\S]+\\\)$|^\$\$[\s\S]+\$\$$|^\$[^$\n]+\$$/;

const INLINE_MATH_PATTERN = /(\$\$[\s\S]+?\$\$|\$[^$\n]+\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\[a-zA-Z]+(?:\{[^{}]*\})*(?:\s*[=+\-*/]\s*[a-zA-Z0-9\\{}^().,+-]+)*|[a-zA-Z0-9]+(?:\^\{?[^}\s]+\}?)*(?:\s*[=+\-*/]\s*[a-zA-Z0-9\\{}^().,+-]+)+)/g;

export const sanitizeLatex = (value) => {
  if (!value) {
    return "";
  }

  return value
    .trim()
    .replace(/^\$+|\$+$/g, "")
    .replace(/\\\[(.*)\\\]/s, "$1")
    .replace(/\\\((.*)\\\)/s, "$1")
    .trim();
};

export const stripLatexForPlainResult = (value) => {
  if (!value) {
    return "";
  }

  const sanitized = sanitizeLatex(value);

  if (/^[\d\s.,\-+/=]+$/.test(sanitized)) {
    return sanitized.replace(/\s+/g, " ").trim();
  }

  return "";
};

export const hasKhmerText = (value) => /[\u1780-\u17FF]/.test(value || "");

export const isDelimitedMathOnlyLine = (value) => DELIMITED_MATH_ONLY_PATTERN.test((value || "").trim());

export const splitInlineMathSegments = (text) => {
  if (!text) {
    return [];
  }

  return text.split(INLINE_MATH_PATTERN).filter(Boolean).map((segment) => {
    const trimmed = segment.trim();
    const isMath =
      isDelimitedMathOnlyLine(trimmed)
      || trimmed.startsWith("\\")
      || (/^[a-zA-Z0-9\\{}^().+\-*/=,\s]+$/.test(trimmed)
        && /[\\^_=+\-*/]/.test(trimmed)
        && !hasKhmerText(trimmed));

    return {
      type: isMath ? "math" : "text",
      value: segment
    };
  });
};

export const isLikelyMathLine = (line) => {
  const trimmed = (line || "").trim();

  if (!trimmed) {
    return false;
  }

  if (isDelimitedMathOnlyLine(trimmed)) {
    return true;
  }

  if (hasKhmerText(trimmed)) {
    return false;
  }

  return /[\\^_=+\-*/()[\]{}]/.test(trimmed) || /[a-zA-Z]\d|\d[a-zA-Z]/.test(trimmed);
};

export const toPlainCopyText = (text) => {
  if (!text) {
    return "";
  }

  return text
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[{}\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const DELIMITED_MATH_PATTERN = /(\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g;
const DELIMITED_MATH_EXACT_PATTERN =
  /^\\\[[\s\S]+\\\]$|^\\\([\s\S]+\\\)$|^\$\$[\s\S]+\$\$$|^\$[^$\n]+\$$/;

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

export const containsKhmer = (value) => /[\u1780-\u17FF]/.test(value || "");

export const isExplicitMath = (value) => DELIMITED_MATH_EXACT_PATTERN.test((value || "").trim());

export const splitDelimitedMathSegments = (text) => {
  if (!text) {
    return [];
  }

  return text.split(DELIMITED_MATH_PATTERN).filter(Boolean).map((segment) => ({
    type: DELIMITED_MATH_EXACT_PATTERN.test(segment.trim()) ? "math" : "text",
    value: segment
  }));
};

export const shouldPreferBlockMath = (value) => {
  const trimmed = (value || "").trim();

  if (!trimmed) {
    return false;
  }

  if (DELIMITED_MATH_EXACT_PATTERN.test(trimmed)) {
    return true;
  }

  if (containsKhmer(trimmed)) {
    return false;
  }

  return /\\[A-Za-z]+/.test(trimmed) || /[=^_]/.test(trimmed);
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

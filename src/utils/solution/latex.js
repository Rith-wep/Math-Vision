const DELIMITED_MATH_PATTERN =
  /(\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$\$[\s\S]+?\$\$|\$[^$\n]+\$)/g;

const DELIMITED_MATH_EXACT_PATTERN =
  /^\\\[[\s\S]+\\\]$|^\\\([\s\S]+\\\)$|^\$\$[\s\S]+\$\$$|^\$[^$\n]+\$$/;

const INLINE_LATEX_FRAGMENT_PATTERN =
  /(\\frac\{[^{}]*\}\{[^{}]*\}|\\sqrt(?:\[[^\]]*\])?\{[^{}]*\}|\\(?:sin|cos|tan|cot|sec|csc|ln|log|alpha|beta|gamma|theta|Delta|pi|sum|int|infty|pm|mp|geq|leq|neq|cdot|times|div|to|rightarrow|leftarrow|left|right)\b(?:\{[^{}]*\})?|[A-Za-z0-9)\]}]\^\{[^{}]+\}|[A-Za-z0-9)\]}]_[{(]?[A-Za-z0-9+\-*/., ]+[)}]?)/g;

const LATEX_COMMAND_PATTERN =
  /\\(?:frac|sqrt|sin|cos|tan|cot|sec|csc|ln|log|alpha|beta|gamma|theta|Delta|pi|sum|int|infty|pm|mp|geq|leq|neq|cdot|times|div|to|rightarrow|leftarrow|left|right)\b/;

const SIMPLE_MATH_PATTERN = /(?:\d+\s*[-+*/=]\s*\d+|[A-Za-z]\s*=\s*[-+*/\dA-Za-z]+)/;
const ALGEBRAIC_EXPRESSION_PATTERN =
  /^(?=.*[A-Za-z0-9])(?=.*[+\-*/^_=(){}\[\]])[A-Za-z0-9\s+\-*/^_=(){}\[\].,|]+$/;

export const sanitizeLatex = (value = "") =>
  value
    .trim()
    .replace(/^\$+|\$+$/g, "")
    .replace(/^\\\[([\s\S]*?)\\\]$/g, "$1")
    .replace(/^\\\(([\s\S]*?)\\\)$/g, "$1")
    .trim();

const extractBalanced = (input, startIndex) => {
  let depth = 1;
  let cursor = startIndex;

  while (cursor < input.length && depth > 0) {
    if (input[cursor] === "{") {
      depth += 1;
    } else if (input[cursor] === "}") {
      depth -= 1;
    }

    cursor += 1;
  }

  return depth === 0 ? cursor : -1;
};

const replaceBalancedCommand = (input, command, formatter) => {
  const needle = `\\${command}{`;
  let output = "";
  let index = 0;

  while (index < input.length) {
    const start = input.indexOf(needle, index);

    if (start === -1) {
      output += input.slice(index);
      break;
    }

    output += input.slice(index, start);

    const innerStart = start + needle.length;
    const end = extractBalanced(input, innerStart);

    if (end === -1) {
      output += input.slice(start);
      break;
    }

    const inner = input.slice(innerStart, end - 1);
    output += formatter(inner);
    index = end;
  }

  return output;
};

const replaceBalancedFrac = (input) => {
  let output = "";
  let index = 0;

  while (index < input.length) {
    const start = input.indexOf("\\frac{", index);

    if (start === -1) {
      output += input.slice(index);
      break;
    }

    output += input.slice(index, start);

    const numeratorStart = start + "\\frac{".length;
    const numeratorEnd = extractBalanced(input, numeratorStart);

    if (numeratorEnd === -1 || input[numeratorEnd] !== "{") {
      output += input.slice(start);
      break;
    }

    const denominatorStart = numeratorEnd + 1;
    const denominatorEnd = extractBalanced(input, denominatorStart);

    if (denominatorEnd === -1) {
      output += input.slice(start);
      break;
    }

    const numerator = input.slice(numeratorStart, numeratorEnd - 1);
    const denominator = input.slice(denominatorStart, denominatorEnd - 1);

    output += `${latexToReadableText(numerator)} over ${latexToReadableText(denominator)}`;
    index = denominatorEnd;
  }

  return output;
};

const fallbackPlainText = (value = "") =>
  value
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const latexToReadableText = (value = "") => {
  if (!value) {
    return "";
  }

  try {
    let readable = sanitizeLatex(value);

    readable = replaceBalancedFrac(readable);
    readable = replaceBalancedCommand(
      readable,
      "sqrt",
      (inner) => `square root of ${latexToReadableText(inner)}`
    );
    readable = replaceBalancedCommand(readable, "text", (inner) => latexToReadableText(inner));
    readable = replaceBalancedCommand(readable, "mathrm", (inner) => latexToReadableText(inner));
    readable = replaceBalancedCommand(readable, "operatorname", (inner) => latexToReadableText(inner));

    readable = readable
      .replace(/\\left|\\right/g, "")
      .replace(/\\cdot/g, " multiplied by ")
      .replace(/\\times/g, " times ")
      .replace(/\\div/g, " divided by ")
      .replace(/\\pm/g, " plus or minus ")
      .replace(/\\mp/g, " minus or plus ")
      .replace(/\\geq/g, " greater than or equal to ")
      .replace(/\\leq/g, " less than or equal to ")
      .replace(/\\neq/g, " not equal to ")
      .replace(/\\infty/g, " infinity ")
      .replace(/\\pi/g, " pi ")
      .replace(/\\theta/g, " theta ")
      .replace(/\\alpha/g, " alpha ")
      .replace(/\\beta/g, " beta ")
      .replace(/\\gamma/g, " gamma ")
      .replace(/\\Delta/g, " delta ")
      .replace(/\\sum/g, " summation ")
      .replace(/\\int/g, " integral ")
      .replace(/\\to|\\rightarrow/g, " to ")
      .replace(/\\leftarrow/g, " from ")
      .replace(/\\ln/g, "ln")
      .replace(/\\log_/g, "log subscript ")
      .replace(/\\sin/g, "sin")
      .replace(/\\cos/g, "cos")
      .replace(/\\tan/g, "tan")
      .replace(/\\cot/g, "cot")
      .replace(/\\sec/g, "sec")
      .replace(/\\csc/g, "csc")
      .replace(/\^\{([^}]+)\}/g, " to the power of $1 ")
      .replace(/\^([A-Za-z0-9])/g, (_, exponent) => {
        if (exponent === "2") return " squared ";
        if (exponent === "3") return " cubed ";
        return ` to the power of ${exponent} `;
      })
      .replace(/_+\{([^}]+)\}/g, " subscript $1 ")
      .replace(/_([A-Za-z0-9])/g, " subscript $1 ")
      .replace(/\\,/g, " ")
      .replace(/\\!/g, "")
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/[{}]/g, "")
      .replace(/[()[\]]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s*=\s*/g, " equals ")
      .replace(/\s*\+\s*/g, " plus ")
      .replace(/\s*-\s*/g, " minus ")
      .replace(/\s*\*\s*/g, " times ")
      .replace(/\s*\/\s*/g, " over ")
      .trim();

    return readable.includes("\\") ? fallbackPlainText(value) : readable;
  } catch {
    return fallbackPlainText(value);
  }
};

export const stripLatexForPlainResult = (value = "") => {
  const sanitized = sanitizeLatex(value);

  if (/^[\d\s.,\-+/=a-zA-Z]+$/.test(sanitized)) {
    return sanitized.replace(/\s+/g, " ").trim();
  }

  return "";
};

export const containsKhmer = (value) => /[\u1780-\u17FF]/.test(value || "");

export const isExplicitMath = (value) => DELIMITED_MATH_EXACT_PATTERN.test((value || "").trim());

export const isLikelyMathText = (value = "") => {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (isExplicitMath(trimmed)) {
    return true;
  }

  if (LATEX_COMMAND_PATTERN.test(trimmed) || SIMPLE_MATH_PATTERN.test(trimmed)) {
    return true;
  }

  if (containsKhmer(trimmed)) {
    return false;
  }

  return ALGEBRAIC_EXPRESSION_PATTERN.test(trimmed);
};

export const splitDelimitedMathSegments = (text = "") => {
  if (!text) {
    return [];
  }

  const delimitedPieces = text.split(DELIMITED_MATH_PATTERN).filter(Boolean);
  const segments = [];

  delimitedPieces.forEach((piece) => {
    const trimmedPiece = piece.trim();

    if (DELIMITED_MATH_EXACT_PATTERN.test(trimmedPiece)) {
      segments.push({ type: "math", value: piece });
      return;
    }

    let lastIndex = 0;
    let match;

    INLINE_LATEX_FRAGMENT_PATTERN.lastIndex = 0;

    while ((match = INLINE_LATEX_FRAGMENT_PATTERN.exec(piece)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: "text", value: piece.slice(lastIndex, match.index) });
      }

      segments.push({ type: "math", value: match[0] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < piece.length) {
      segments.push({ type: "text", value: piece.slice(lastIndex) });
    }
  });

  return segments.filter((segment) => segment.value);
};

export const shouldPreferBlockMath = (value = "") => {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (DELIMITED_MATH_EXACT_PATTERN.test(trimmed)) {
    return true;
  }

  if (containsKhmer(trimmed)) {
    return false;
  }

  return isLikelyMathText(trimmed) || /[=^_]/.test(trimmed);
};

export const toPlainCopyText = (text = "") => latexToReadableText(text);

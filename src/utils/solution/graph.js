import { evaluate } from "mathjs";

import { sanitizeLatex } from "./latex.js";

const MAX_GRAPH_EXPRESSION_LENGTH = 180;
const SAFE_GRAPH_CHAR_PATTERN = /^[0-9a-zA-Z+\-*/^().,\s]*$/;
const ALLOWED_IDENTIFIERS = new Set(["x", "pi", "sin", "cos", "tan", "sqrt"]);

const normalizeGraphMath = (value) => {
  return sanitizeLatex(value)
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/\\cdot/g, "*")
    .replace(/\\times/g, "*")
    .replace(/\\div/g, "/")
    .replace(/\\pi/g, "pi")
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\\sqrt\{([^{}]+)\}/g, "sqrt($1)")
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "(($1)/($2))")
    .replace(/[{}]/g, "")
    .replace(/(\d)([a-zA-Z(])/g, "$1*$2")
    .replace(/([a-zA-Z)])(\d)/g, "$1*$2")
    .replace(/([xy)])\(/gi, "$1*(")
    .replace(/\)([xy\d])/gi, ")*$1")
    .replace(/\s+/g, " ")
    .trim();
};

const isSafeGraphExpression = (expression) => {
  if (!expression || expression.length > MAX_GRAPH_EXPRESSION_LENGTH) {
    return false;
  }

  if (!SAFE_GRAPH_CHAR_PATTERN.test(expression)) {
    return false;
  }

  const identifiers = expression.match(/[A-Za-z]+/g) || [];
  return identifiers.every((identifier) => ALLOWED_IDENTIFIERS.has(identifier));
};

const safeEvaluateGraphExpression = (expression, x) => {
  if (!isSafeGraphExpression(expression)) {
    return null;
  }

  try {
    const y = evaluate(expression, { x, pi: Math.PI });
    return Number.isFinite(y) ? Number(y.toFixed(3)) : null;
  } catch {
    return null;
  }
};

export const getGraphExpression = (latex) => {
  const normalized = sanitizeLatex(latex);

  if (!/[xy]/i.test(normalized)) {
    return "";
  }

  if (!normalized.includes("=")) {
    return normalized;
  }

  const [leftSide, rightSide] = normalized.split("=");
  const left = leftSide.trim();
  const right = rightSide.trim();

  if (/^y$/i.test(left)) {
    return right;
  }

  if (/^y$/i.test(right)) {
    return left;
  }

  return `(${left})-(${right})`;
};

export const buildGraphData = (latex) => {
  const graphSource = getGraphExpression(latex);

  if (!graphSource || /y/i.test(graphSource)) {
    return [];
  }

  const normalizedExpression = normalizeGraphMath(graphSource);

  if (!isSafeGraphExpression(normalizedExpression)) {
    return [];
  }

  const points = [];

  for (let x = -10; x <= 10; x += 1) {
    const y = safeEvaluateGraphExpression(normalizedExpression, x);

    if (y !== null) {
      points.push({ x, y });
    }
  }

  return points;
};

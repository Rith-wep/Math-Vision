export const getStepFormula = (step) => step?.formula || step?.latex || "";

export const getStepExplanation = (step) => step?.explanation || step?.explanation_kh || "";

const GEOMETRY_STRONG_PATTERNS = [
  /\\vec/i,
  /\\overrightarrow|\\overline/i,
  /\b(?:plane|vector|distance|cross|dot)\b/i,
  /\((?:P|D)\)/i,
  /\(O,\s*i,\s*j,\s*k\)/i,
  /\b(?:AB|AC|BC|OA|OB|OC|AD|BD|CD)\b/
];

const GEOMETRY_SOFT_PATTERNS = [
  /\b(?:triangle|circle|angle|segment|midpoint|perpendicular|parallel)\b/i,
  /áž”áŸ’áž›áž„áŸ‹|ážœáŸ‰áž·áž…áž‘áŸážš|áž…áž˜áŸ’áž„áž¶áž™|áž”áž“áŸ’áž‘áž¶ážáŸ‹/i
];

const KHMER_NUMBERED_STEP_PATTERN =
  /^(áž€|áž|áž‚|ážƒ|áž„|áž…|áž†|áž‡|ážˆ|áž‰|ážŠ|áž‹|ážŒ|áž|ážŽ|áž|áž|áž‘|áž’|áž“|áž”|áž•|áž–|áž—|áž˜|áž™|ážš|áž›|ážœ|ážŸ|áž )\s*[.)áŸ–:-]/u;

export const detectGeometryStyle = (solution, expression) => {
  const questionSource = `${expression} ${solution?.question_text || ""}`.trim();
  const formulaSource = solution?.steps?.map((step) => getStepFormula(step)).join(" ") || "";

  const strongMatches = GEOMETRY_STRONG_PATTERNS.filter(
    (pattern) => pattern.test(questionSource) || pattern.test(formulaSource)
  ).length;

  if (strongMatches >= 1) {
    return true;
  }

  const softMatches = GEOMETRY_SOFT_PATTERNS.filter(
    (pattern) => pattern.test(questionSource) || pattern.test(formulaSource)
  ).length;

  return softMatches >= 2;
};

export const getSolutionStyle = (solution, expression) => {
  if (!solution) {
    return "standard";
  }

  if (detectGeometryStyle(solution, expression)) {
    return "geometry";
  }

  if ((solution.steps?.length || 0) >= 5) {
    return "long";
  }

  return "standard";
};

export const getSolutionTags = (solutionStyle, stepsCount) => {
  const tags = [];

  if (solutionStyle === "geometry") {
    tags.push("Geometry");
    tags.push("Multi-part");
  } else if (solutionStyle === "long") {
    tags.push("Long-form");
  } else {
    tags.push("Structured");
  }

  tags.push(`${stepsCount} steps`);
  return tags;
};

export const getStepTitle = (step, index, solutionStyle) => {
  const explanation = getStepExplanation(step);
  const formula = getStepFormula(step);

  if (KHMER_NUMBERED_STEP_PATTERN.test(explanation)) {
    return explanation.split("\n")[0].trim();
  }

  if (solutionStyle === "geometry") {
    const geometryTitles = [
      "Setup",
      "Vector Work",
      "Derivation",
      "Equation Build",
      "Conclusion",
      "Final Check"
    ];

    return geometryTitles[index] || `Part ${index + 1}`;
  }

  if (/\\Delta|sqrt|frac|=/.test(formula)) {
    return "Derivation";
  }

  return `Step ${step.step || index + 1}`;
};

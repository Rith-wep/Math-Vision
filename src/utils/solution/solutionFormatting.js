export const getStepFormula = (step) => step?.formula || step?.latex || "";

export const getStepExplanation = (step) => step?.explanation || step?.explanation_kh || "";

export const detectGeometryStyle = (solution, expression) => {
  const source = `${expression} ${solution?.question_text || ""} ${solution?.steps
    ?.map((step) => `${getStepFormula(step)} ${getStepExplanation(step)}`)
    .join(" ") || ""}`;

  return /\\vec|AB|AC|BC|\(P\)|\(D\)|plane|vector|distance|cross|dot|áž”áŸ’áž›áž„áŸ‹|ážœáŸ‰áž·áž…áž‘áŸážš|áž…áž˜áŸ’áž„áž¶áž™|áž”áž“áŸ’áž‘áž¶ážáŸ‹/i.test(
    source
  );
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

  if (/^(áž€|áž|áž‚|ážƒ|áž„|áž…|áž†|áž‡|ážˆ|áž‰|ážŠ|áž‹|ážŒ|áž|ážŽ|áž|áž|áž‘|áž’|áž“|áž”|áž•|áž–|áž—|áž˜|áž™|ážš|áž›|ážœ|ážŸ|áž )\s*[.)áŸ–:-]/u.test(explanation)) {
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

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { getStepExplanation, getStepFormula } from "../utils/solution/solutionFormatting.js";
import { sanitizeLatex, toPlainCopyText } from "../utils/solution/latex.js";

const PDF_FILE_NAME = "math-vision-solution.pdf";

const createPdfDocument = async (element) => {
  if (!element) {
    return null;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let heightLeft = imageHeight;
  let position = 0;

  pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
    heightLeft -= pageHeight;
  }

  return pdf;
};

export const exportElementToPdf = async (element, fileName = PDF_FILE_NAME) => {
  const pdf = await createPdfDocument(element);

  if (!pdf) {
    return null;
  }

  pdf.save(fileName);
  return fileName;
};

export const buildPdfFile = async (element, fileName = PDF_FILE_NAME) => {
  const pdf = await createPdfDocument(element);

  if (!pdf) {
    return null;
  }

  const blob = pdf.output("blob");
  return new File([blob], fileName, { type: "application/pdf" });
};

export const buildShareText = ({ question, finalAnswer, stepsCount }) => {
  return [
    "Math Vision Solution",
    "",
    `Question: ${sanitizeLatex(question)}`,
    `Final Answer: ${finalAnswer}`,
    `Steps: ${stepsCount}`,
    "",
    "Generated with Math Vision."
  ].join("\n");
};

export const buildSolutionCopyText = ({ question, finalAnswer, steps = [] }) => {
  const stepsText = steps
    .map((step, index) => {
      const formula = sanitizeLatex(getStepFormula(step));
      const explanation = toPlainCopyText(getStepExplanation(step));

      return [
        `Step ${index + 1}`,
        formula ? `Formula: ${formula}` : null,
        explanation ? `Explanation: ${explanation}` : null
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  return [
    "Math Vision Solution",
    "===================",
    `Question: ${sanitizeLatex(question)}`,
    `Final Answer: ${finalAnswer}`,
    `Total Steps: ${steps.length}`,
    "",
    stepsText
  ]
    .filter(Boolean)
    .join("\n");
};

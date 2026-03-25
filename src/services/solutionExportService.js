import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { getStepExplanation, getStepFormula } from "../utils/solution/solutionFormatting.js";
import { sanitizeLatex, toPlainCopyText } from "../utils/solution/latex.js";

const PDF_FILE_NAME = "math-vision-solution.pdf";
const PDF_EXPORT_WIDTH = 960;
const PDF_MARGIN_MM = 10;

const createExportSnapshot = (element) => {
  const exportHost = document.createElement("div");
  const clonedElement = element.cloneNode(true);

  exportHost.style.position = "fixed";
  exportHost.style.left = "-10000px";
  exportHost.style.top = "0";
  exportHost.style.width = `${PDF_EXPORT_WIDTH}px`;
  exportHost.style.padding = "24px";
  exportHost.style.background = "#ffffff";
  exportHost.style.zIndex = "-1";
  exportHost.style.boxSizing = "border-box";

  clonedElement.style.width = "100%";
  clonedElement.style.maxWidth = "100%";
  clonedElement.style.background = "#ffffff";

  clonedElement.querySelectorAll('[data-pdf-ignore="true"]').forEach((node) => {
    node.remove();
  });

  clonedElement.querySelectorAll("*").forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }

    node.style.animation = "none";
    node.style.transition = "none";
    node.style.transform = "none";

    if (node.style.position === "sticky" || node.style.position === "fixed") {
      node.style.position = "static";
    }

    if (node.classList.contains("overflow-x-auto")) {
      node.style.overflowX = "visible";
    }

    if (node.classList.contains("overflow-hidden")) {
      node.style.overflow = "visible";
    }

    if (node.classList.contains("shadow-sm")) {
      node.style.boxShadow = "none";
    }
  });

  exportHost.appendChild(clonedElement);
  document.body.appendChild(exportHost);

  return {
    exportHost,
    cleanup: () => {
      document.body.removeChild(exportHost);
    }
  };
};

const createPdfDocument = async (element) => {
  if (!element) {
    return null;
  }

  const { exportHost, cleanup } = createExportSnapshot(element);

  try {
    const canvas = await html2canvas(exportHost, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      width: PDF_EXPORT_WIDTH,
      windowWidth: PDF_EXPORT_WIDTH,
      scrollX: 0,
      scrollY: 0
    });

    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PDF_MARGIN_MM * 2;
    const contentHeight = pageHeight - PDF_MARGIN_MM * 2;
    const imageHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imageHeight;
    let position = PDF_MARGIN_MM;

    pdf.addImage(imageData, "PNG", PDF_MARGIN_MM, position, contentWidth, imageHeight);
    heightLeft -= contentHeight;

    while (heightLeft > 0) {
      position = PDF_MARGIN_MM + (heightLeft - imageHeight);
      pdf.addPage();
      pdf.addImage(imageData, "PNG", PDF_MARGIN_MM, position, contentWidth, imageHeight);
      heightLeft -= contentHeight;
    }

    return pdf;
  } finally {
    cleanup();
  }
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

export const downloadPdfFile = (file) => {
  if (!file) {
    return null;
  }

  const fileUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = fileUrl;
  anchor.download = file.name || PDF_FILE_NAME;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  return fileUrl;
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

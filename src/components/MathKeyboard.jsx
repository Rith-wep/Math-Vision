import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Delete, Languages, Pencil, RotateCcw, Trash2 } from "lucide-react";

import { handwritingRecognitionService } from "../services/handwritingRecognitionService.js";

const PLACEHOLDER_SYMBOL = "○";

const buildKey = (config) => {
  if (!config.template) {
    return config;
  }

  const caretOffset = config.template.indexOf("|");
  const value = config.template.replace("|", "");
  const placeholderOffsets = [...value].reduce((positions, character, index) => {
    if (character === PLACEHOLDER_SYMBOL) {
      positions.push(index);
    }

    return positions;
  }, []);

  return {
    ...config,
    value,
    caretOffset: caretOffset >= 0 ? caretOffset : undefined,
    placeholderOffsets
  };
};

const categoryConfig = {
  operators: {
    label: "Basic",
    columns: 6
  },
  functions: {
    label: "Algebra",
    columns: 6
  },
  trig: {
    label: "Trig",
    columns: 6
  },
  advanced: {
    label: "Calculus",
    columns: 6
  }
};

const keyboardLayouts = {
  operators: [
    buildKey({ label: "( )", template: "(|)", tone: "function", typography: "math" }),
    buildKey({ label: ">", value: ">", tone: "function", typography: "math" }),
    buildKey({ label: "7", value: "7", tone: "number" }),
    buildKey({ label: "8", value: "8", tone: "number" }),
    buildKey({ label: "9", value: "9", tone: "number" }),
    buildKey({ label: "\u00f7", value: "\\div ", tone: "operator", typography: "math", textClass: "text-[24px]" }),

    buildKey({ label: "\u25a1/\u25a1", template: `\\frac{|${PLACEHOLDER_SYMBOL}}{${PLACEHOLDER_SYMBOL}}`, tone: "function", typography: "math", textClass: "text-[15px]" }),
    buildKey({ label: "\u221a", template: `\\sqrt{|${PLACEHOLDER_SYMBOL}}`, tone: "function", typography: "math", textClass: "text-[28px]" }),
    buildKey({ label: "4", value: "4", tone: "number" }),
    buildKey({ label: "5", value: "5", tone: "number" }),
    buildKey({ label: "6", value: "6", tone: "number" }),
    buildKey({ label: "\u00d7", value: "\\times ", tone: "operator", typography: "math", textClass: "text-[24px]" }),

    buildKey({ label: "x\u00b2", value: "x^{2}", tone: "function", typography: "math", textClass: "text-[21px]" }),
    buildKey({ label: "x", value: "x", tone: "function", typography: "math", textClass: "text-[24px] italic" }),
    buildKey({ label: "1", value: "1", tone: "number" }),
    buildKey({ label: "2", value: "2", tone: "number" }),
    buildKey({ label: "3", value: "3", tone: "number" }),
    buildKey({ label: "-", value: "-", tone: "operator", typography: "math", textClass: "text-[24px]" }),

    buildKey({ label: "\u03c0", value: "\\pi ", tone: "function", typography: "math", textClass: "text-[28px]" }),
    buildKey({ label: "%", value: "%", tone: "function" }),
    buildKey({ label: "0", value: "0", tone: "number" }),
    buildKey({ label: ".", value: ".", tone: "number" }),
    buildKey({ label: "=", value: "=", tone: "operator", typography: "math", textClass: "text-[24px]" }),
    buildKey({ label: "+", value: "+", tone: "operator", typography: "math", textClass: "text-[24px]" })
  ],
  functions: [
    buildKey({ label: "|x|", template: "\\left| |\\right|", tone: "function", typography: "math" }),
    buildKey({ label: "f(x)", template: "f(|)", tone: "function", typography: "math" }),
    buildKey({ label: "log\u2081\u2080", template: `\\log_{10}(|${PLACEHOLDER_SYMBOL})`, tone: "function", textClass: "text-[16px]" }),
    buildKey({ label: "\u221a", template: `\\sqrt[|]{${PLACEHOLDER_SYMBOL}}`, tone: "function", typography: "math", textClass: "text-[28px]" }),
    buildKey({ label: "i", value: "i", tone: "function", typography: "math", textClass: "text-[24px] italic" }),
    buildKey({ label: "[ ]", template: "\\left[ |\\right]", tone: "function", typography: "math" }),

    buildKey({ label: "x\u2099", template: "x_{|}", tone: "function", typography: "math", textClass: "text-[20px]" }),
    buildKey({ label: "( )", template: "(|)", tone: "function", typography: "math" }),
    buildKey({ label: "log\u2082", template: `\\log_{2}(|${PLACEHOLDER_SYMBOL})`, tone: "function", textClass: "text-[16px]" }),
    buildKey({ label: "P(x)", template: "P(|)", tone: "function", typography: "math" }),
    buildKey({ label: "z", value: "z", tone: "function", typography: "math", textClass: "text-[24px] italic" }),
    buildKey({ label: "!", value: "!", tone: "operator", typography: "math", textClass: "text-[24px]" }),

    buildKey({ label: "e", value: "e", tone: "function", typography: "math", textClass: "text-[24px] italic" }),
    buildKey({ label: "f(x,y)", template: `f(|,${PLACEHOLDER_SYMBOL})`, tone: "function", typography: "math" }),
    buildKey({ label: "log\u2090", template: `\\log_{|}(${PLACEHOLDER_SYMBOL})`, tone: "function", textClass: "text-[16px]" }),
    buildKey({ label: "C(x)", template: "C(|)", tone: "function", typography: "math" }),
    buildKey({ label: "z\u0304", value: "\\bar{z}", tone: "function", typography: "math", textClass: "text-[23px] italic" }),
    buildKey({ label: "{ }", template: "\\left\\{ |\\right\\}", tone: "function", typography: "math" }),

    buildKey({ label: "exp", template: "\\exp(|)", tone: "secondary" }),
    buildKey({ label: "(a,b)", template: `(|,${PLACEHOLDER_SYMBOL})`, tone: "function", typography: "math" }),
    buildKey({ label: "ln", template: "\\ln(|)", tone: "function", textClass: "text-[19px]" }),
    buildKey({ label: "sign", template: "\\operatorname{sign}(|)", tone: "secondary", textClass: "text-[15px]" }),
    buildKey({ label: "\u2016 \u2016", template: "\\left\\| |\\right\\|", tone: "function", typography: "math" }),
    buildKey({ label: "\u03b8", value: "\\theta ", tone: "function", typography: "math", textClass: "text-[26px]" })
  ],
  trig: [
    buildKey({ label: "RAD", value: "\\mathrm{rad}", tone: "secondary", badge: true }),
    buildKey({ label: "sin", template: `\\sin(|${PLACEHOLDER_SYMBOL})`, tone: "function" }),
    buildKey({ label: "cos", template: `\\cos(|${PLACEHOLDER_SYMBOL})`, tone: "function" }),
    buildKey({ label: "tan", template: `\\tan(|${PLACEHOLDER_SYMBOL})`, tone: "function" }),
    buildKey({ label: "cot", template: `\\cot(|${PLACEHOLDER_SYMBOL})`, tone: "function" }),
    buildKey({ label: "sec", template: `\\sec(|${PLACEHOLDER_SYMBOL})`, tone: "secondary" }),

    buildKey({ label: "\u00b0", value: "^{\\circ}", tone: "function", typography: "math", textClass: "text-[26px]" }),
    buildKey({ label: "sin\u207b\u00b9", template: `\\arcsin(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[16px]" }),
    buildKey({ label: "cos\u207b\u00b9", template: `\\arccos(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[16px]" }),
    buildKey({ label: "tan\u207b\u00b9", template: `\\arctan(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[16px]" }),
    buildKey({ label: "cot\u207b\u00b9", template: `\\operatorname{arccot}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[16px]" }),
    buildKey({ label: "sec\u207b\u00b9", template: `\\operatorname{arcsec}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[16px]" }),

    buildKey({ label: "sinh", template: `\\sinh(|${PLACEHOLDER_SYMBOL})`, tone: "secondary" }),
    buildKey({ label: "cosh", template: `\\cosh(|${PLACEHOLDER_SYMBOL})`, tone: "secondary" }),
    buildKey({ label: "tanh", template: `\\tanh(|${PLACEHOLDER_SYMBOL})`, tone: "secondary" }),
    buildKey({ label: "coth", template: `\\coth(|${PLACEHOLDER_SYMBOL})`, tone: "secondary" }),
    buildKey({ label: "sech", template: `\\operatorname{sech}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[15px]" }),
    buildKey({ label: "csch", template: `\\operatorname{csch}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[15px]" }),

    buildKey({ label: "sinh\u207b\u00b9", template: `\\operatorname{arsinh}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[15px]" }),
    buildKey({ label: "cosh\u207b\u00b9", template: `\\operatorname{arcosh}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[15px]" }),
    buildKey({ label: "tanh\u207b\u00b9", template: `\\operatorname{artanh}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[15px]" }),
    buildKey({ label: "coth\u207b\u00b9", template: `\\operatorname{arcoth}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[15px]" }),
    buildKey({ label: "\u03c0", value: "\\pi ", tone: "function", typography: "math", textClass: "text-[28px]" }),
    buildKey({ label: "^", value: "^{}", tone: "operator", typography: "math", textClass: "text-[24px]" })
  ],
  advanced: [
    buildKey({ label: "lim\u2093\u2192\u2080", template: "\\lim_{x \\to |}", tone: "function", textClass: "text-[15px]" }),
    buildKey({ label: "dy/dx", template: `\\frac{d}{dx}(|${PLACEHOLDER_SYMBOL})`, tone: "function", textClass: "text-[16px]" }),
    buildKey({ label: "\u222b", template: "\\int |\\,dx", tone: "function", typography: "math", textClass: "text-[30px]" }),
    buildKey({ label: "f'(x)", template: "\\frac{dy}{dx}", tone: "function", textClass: "text-[16px]" }),
    buildKey({ label: "a\u2099", template: "a_{|}", tone: "function", typography: "math", textClass: "text-[20px]" }),

    buildKey({ label: "lim\u207a", template: "\\lim_{x \\to |^{+}}", tone: "secondary", textClass: "text-[15px]" }),
    buildKey({ label: "d/du", template: `\\frac{d}{d|}(${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[16px]" }),
    buildKey({ label: "\u222b du", template: `\\int (${PLACEHOLDER_SYMBOL})\\,d|`, tone: "secondary", textClass: "text-[16px]" }),
    buildKey({ label: "dx", value: "dx", tone: "secondary" }),
    buildKey({ label: "x\u2081,x\u2082", template: "x_{1},x_{2},\\ldots", tone: "secondary", typography: "math", textClass: "text-[15px]" }),

    buildKey({ label: "lim\u207b", template: "\\lim_{x \\to |^{-}}", tone: "secondary", textClass: "text-[15px]" }),
    buildKey({ label: "d/dy", template: `\\frac{d}{dy}(|${PLACEHOLDER_SYMBOL})`, tone: "secondary", textClass: "text-[16px]" }),
    buildKey({ label: "\u222b\u2090\u1d47", template: "\\int_{|}^{} ", tone: "secondary", typography: "math", textClass: "text-[19px]" }),
    buildKey({ label: "dy", value: "dy", tone: "secondary" }),
    buildKey({ label: "\u2192", value: "\\to ", tone: "function", typography: "math", textClass: "text-[24px]" }),

    buildKey({ label: "\u221e", value: "\\infty ", tone: "function", typography: "math", textClass: "text-[30px]" }),
    buildKey({ label: "\u03a3", template: "\\sum_{n=1}^{|}", tone: "function", typography: "math", textClass: "text-[26px]" }),
    buildKey({ label: "\u03a0", template: "\\prod_{n=1}^{|}", tone: "function", typography: "math", textClass: "text-[26px]" }),
    buildKey({ label: "y'", value: "y'", tone: "function", typography: "math", textClass: "text-[22px]" }),
    buildKey({ label: "\u0394", value: "\\Delta ", tone: "function", typography: "math", textClass: "text-[26px]" }),
    buildKey({ label: "\u2202", value: "\\partial ", tone: "function", typography: "math", textClass: "text-[26px]" }),
    buildKey({ label: "\u2260", value: "\\neq ", tone: "operator", typography: "math", textClass: "text-[22px]" }),
    buildKey({ label: "{", value: "{", tone: "function", typography: "math", textClass: "text-[24px]" }),
    buildKey({ label: "}", value: "}", tone: "function", typography: "math", textClass: "text-[24px]" })
  ]
};

const textKeyboardConfig = {
  columns: 6,
  keys: [
    buildKey({ label: "a", value: "a", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "b", value: "b", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "c", value: "c", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "d", value: "d", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "e", value: "e", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "f", value: "f", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "g", value: "g", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "h", value: "h", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "i", value: "i", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "j", value: "j", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "k", value: "k", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "l", value: "l", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "m", value: "m", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "n", value: "n", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "o", value: "o", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "p", value: "p", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "q", value: "q", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "r", value: "r", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "s", value: "s", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "t", value: "t", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "u", value: "u", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "v", value: "v", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "w", value: "w", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "x", value: "x", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "y", value: "y", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: "z", value: "z", tone: "function", typography: "math", textClass: "italic" }),
    buildKey({ label: ".", value: ".", tone: "number" }),
    buildKey({ label: ",", value: ",", tone: "number" }),
    buildKey({ label: "'", value: "'", tone: "number" }),
    buildKey({ label: "space", value: " ", tone: "secondary", textClass: "text-[13px] uppercase tracking-[0.08em]" })
  ]
};

const utilityButtons = [
  { id: "left", icon: ArrowLeft, type: "move-left" },
  { id: "right", icon: ArrowRight, type: "move-right" },
  { id: "delete", icon: Delete, type: "delete" }
];

const clampScale = (value) => Math.min(3, Math.max(0.5, value));

const getKeyButtonClasses = (key) => {
  if (key.tone === "number") {
    return "border-slate-200 bg-white text-slate-900 shadow-sm active:bg-slate-50";
  }

  if (key.tone === "operator") {
    return "border-slate-200 bg-white text-slate-700 shadow-sm active:bg-slate-50";
  }

  if (key.tone === "secondary") {
    return "border-slate-200 bg-white text-slate-500 shadow-sm active:bg-slate-50";
  }

  return "border-slate-200 bg-white text-slate-900 shadow-sm active:bg-slate-50";
};

const getLabelClasses = (key) => {
  const labelLength = (key.label || "").length;
  const baseSize =
    labelLength >= 8
      ? "text-[11px] font-medium sm:text-[12px]"
      : labelLength >= 5
        ? "text-[13px] font-medium sm:text-[14px]"
        : "text-[16px] font-medium sm:text-[18px]";
  const mathFont = key.typography === "math" ? "[font-family:'Times_New_Roman',serif]" : "font-sans";
  const textColor = "text-slate-800";

  return `flex h-full w-full min-w-0 items-center justify-center px-1 text-center leading-tight ${baseSize} ${mathFont} ${textColor} ${
    key.badge
      ? "mx-auto w-auto rounded-full border border-[#22c55e]/15 bg-[#22c55e]/8 px-3 py-1 text-[12px] font-semibold tracking-[0.08em] text-[#22c55e]"
      : ""
  } ${key.textClass || ""}`.trim();
};

export const MathKeyboard = ({
  onKeyPress,
  onDelete,
  onReset,
  onSolve,
  onMoveLeft,
  onMoveRight,
  onHandwritingRecognized,
  canMoveLeft = false,
  canMoveRight = false,
  disabled = false
}) => {
  const [inputMode, setInputMode] = useState("math");
  const [activeCategory, setActiveCategory] = useState("operators");
  const [isDesktop, setIsDesktop] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [activeStroke, setActiveStroke] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState("");
  const [recognizedValue, setRecognizedValue] = useState("");
  const [hasPendingDrawingChange, setHasPendingDrawingChange] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showZoomControls, setShowZoomControls] = useState(false);
  const canvasRef = useRef(null);
  const recognitionRequestIdRef = useRef(0);
  const activePointerIdRef = useRef(null);
  const pointerPositionsRef = useRef(new Map());
  const activeConfig = inputMode === "text" ? textKeyboardConfig : categoryConfig[activeCategory];
  const keys = inputMode === "text" ? textKeyboardConfig.keys : keyboardLayouts[activeCategory];

  const getWorldPoint = (clientX, clientY, canvas = canvasRef.current) => {
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: (clientX - rect.left - offset.x) / scale,
      y: (clientY - rect.top - offset.y) / scale
    };
  };

  const zoomAroundClientPoint = (nextScale, clientX, clientY, canvas = canvasRef.current) => {
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const clampedScale = clampScale(nextScale);
    const worldPoint = getWorldPoint(clientX, clientY, canvas);

    if (!worldPoint) {
      return;
    }

    setScale(clampedScale);
    setOffset({
      x: clientX - rect.left - worldPoint.x * clampedScale,
      y: clientY - rect.top - worldPoint.y * clampedScale
    });
  };

  const resetCanvasView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const zoomAroundCanvasCenter = (factor) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    zoomAroundClientPoint(scale * factor, rect.left + rect.width / 2, rect.top + rect.height / 2, canvas);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncDesktopState = () => setIsDesktop(mediaQuery.matches);

    syncDesktopState();
    mediaQuery.addEventListener("change", syncDesktopState);

    return () => mediaQuery.removeEventListener("change", syncDesktopState);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || typeof window === "undefined") {
      return undefined;
    }

    const syncCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      const nextWidth = Math.max(1, Math.round(rect.width * devicePixelRatio));
      const nextHeight = Math.max(1, Math.round(rect.height * devicePixelRatio));

      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, rect.width, rect.height);
      context.save();
      context.translate(offset.x, offset.y);
      context.scale(scale, scale);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#059669";
      context.lineWidth = 4 / scale;

      const gridSpacing = 24;
      const startX = Math.floor((-offset.x / scale) / gridSpacing) * gridSpacing - gridSpacing;
      const endX = Math.ceil(((rect.width - offset.x) / scale) / gridSpacing) * gridSpacing + gridSpacing;
      const startY = Math.floor((-offset.y / scale) / gridSpacing) * gridSpacing - gridSpacing;
      const endY = Math.ceil(((rect.height - offset.y) / scale) / gridSpacing) * gridSpacing + gridSpacing;

      context.fillStyle = "#d1fae5";
      for (let x = startX; x <= endX; x += gridSpacing) {
        for (let y = startY; y <= endY; y += gridSpacing) {
          context.beginPath();
          context.arc(x, y, 1 / scale, 0, Math.PI * 2);
          context.fill();
        }
      }

      [...strokes, ...(activeStroke ? [activeStroke] : [])].forEach((stroke) => {
        if (!stroke.points.length) {
          return;
        }

        context.beginPath();
        context.moveTo(stroke.points[0].x, stroke.points[0].y);

        if (stroke.points.length === 1) {
          context.lineTo(stroke.points[0].x + 0.01, stroke.points[0].y + 0.01);
        } else {
          stroke.points.slice(1).forEach((point) => {
            context.lineTo(point.x, point.y);
          });
        }

        context.stroke();
      });

      context.restore();
    };

    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize);

    return () => window.removeEventListener("resize", syncCanvasSize);
  }, [activeStroke, offset.x, offset.y, scale, strokes]);

  const resetRecognitionState = () => {
    setRecognitionError("");
    setRecognizedValue("");
  };

  const getCanvasPoint = (event) => {
    return getWorldPoint(event.clientX, event.clientY);
  };

  const handlePointerDown = (event) => {
    if (disabled || isRecognizing) {
      return;
    }

    const point = getCanvasPoint(event);

    if (!point) {
      return;
    }

    pointerPositionsRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY
    });

    if (pointerPositionsRef.current.size > 1) {
      if (activePointerIdRef.current !== null) {
        commitActiveStroke();
      }

      activePointerIdRef.current = null;
      return;
    }

    activePointerIdRef.current = event.pointerId;
    resetRecognitionState();
    setHasPendingDrawingChange(true);
    canvasRef.current?.setPointerCapture?.(event.pointerId);
    setActiveStroke({ id: `${Date.now()}-${event.pointerId}`, points: [point] });
  };

  const handlePointerMove = (event) => {
    const previousPoint = pointerPositionsRef.current.get(event.pointerId);
    pointerPositionsRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY
    });

    const activePointers = [...pointerPositionsRef.current.entries()];

    if (activePointers.length >= 2) {
      setShowZoomControls(true);
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const [[, firstPointer], [, secondPointer]] = activePointers;
      const previousPointers = activePointers.map(([pointerId, pointer]) => {
        if (pointerId === event.pointerId && previousPoint) {
          return previousPoint;
        }

        return pointer;
      });

      const previousMidpoint = {
        x: (previousPointers[0].clientX + previousPointers[1].clientX) / 2,
        y: (previousPointers[0].clientY + previousPointers[1].clientY) / 2
      };
      const currentMidpoint = {
        x: (firstPointer.clientX + secondPointer.clientX) / 2,
        y: (firstPointer.clientY + secondPointer.clientY) / 2
      };
      const previousDistance = Math.hypot(
        previousPointers[0].clientX - previousPointers[1].clientX,
        previousPointers[0].clientY - previousPointers[1].clientY
      );
      const currentDistance = Math.hypot(
        firstPointer.clientX - secondPointer.clientX,
        firstPointer.clientY - secondPointer.clientY
      );
      const nextScale = previousDistance > 0 ? clampScale(scale * (currentDistance / previousDistance)) : scale;
      const previousWorldPoint = getWorldPoint(previousMidpoint.x, previousMidpoint.y, canvas);

      if (!previousWorldPoint) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      setScale(nextScale);
      setOffset({
        x: currentMidpoint.x - rect.left - previousWorldPoint.x * nextScale,
        y: currentMidpoint.y - rect.top - previousWorldPoint.y * nextScale
      });
      return;
    }

    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    const point = getCanvasPoint(event);

    if (!point) {
      return;
    }

    setActiveStroke((currentStroke) =>
      currentStroke
        ? {
            ...currentStroke,
            points: [...currentStroke.points, point]
          }
        : currentStroke
    );
  };

  const commitActiveStroke = () => {
    setActiveStroke((currentStroke) => {
      if (currentStroke?.points?.length) {
        setStrokes((currentStrokes) => [...currentStrokes, currentStroke]);
        setHasPendingDrawingChange(true);
      }

      return null;
    });
  };

  const handlePointerUp = (event) => {
    pointerPositionsRef.current.delete(event.pointerId);

    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    activePointerIdRef.current = null;
    canvasRef.current?.releasePointerCapture?.(event.pointerId);
    commitActiveStroke();
  };

  const handleCanvasWheel = (event) => {
    event.preventDefault();

    setShowZoomControls(true);
    const zoomDelta = event.deltaY < 0 ? 1.12 : 0.9;
    zoomAroundClientPoint(scale * zoomDelta, event.clientX, event.clientY);
  };

  const handleUndoStroke = () => {
    setActiveStroke(null);
    setStrokes((currentStrokes) => {
      const nextStrokes = currentStrokes.slice(0, -1);
      setHasPendingDrawingChange(nextStrokes.length > 0);
      return nextStrokes;
    });
    resetRecognitionState();
  };

  const handleClearCanvas = () => {
    setActiveStroke(null);
    activePointerIdRef.current = null;
    pointerPositionsRef.current.clear();
    setStrokes([]);
    setIsRecognizing(false);
    setHasPendingDrawingChange(false);
    setShowZoomControls(false);
    resetRecognitionState();
  };

  const handleConvertDrawing = async () => {
    const canvas = canvasRef.current;

    if (!canvas || (strokes.length === 0 && !activeStroke)) {
      return;
    }

    const requestId = recognitionRequestIdRef.current + 1;
    recognitionRequestIdRef.current = requestId;
    setIsRecognizing(true);
    setRecognitionError("");

    try {
      const result = await handwritingRecognitionService.recognize({
        imageData: canvas.toDataURL("image/png"),
        mimeType: "image/png",
        width: canvas.width,
        height: canvas.height,
        strokeCount: strokes.length + (activeStroke ? 1 : 0)
      });

      if (recognitionRequestIdRef.current !== requestId) {
        return;
      }

      const nextValue = (result?.latex || result?.text || "").trim();

      if (nextValue) {
        setRecognizedValue(nextValue);
        setHasPendingDrawingChange(false);
        onHandwritingRecognized?.(nextValue, result);
      } else {
        setRecognitionError("មិនទទួលបានលទ្ធផលពីការបម្លែងទេ។");
      }
    } catch (error) {
      if (recognitionRequestIdRef.current !== requestId) {
        return;
      }

      setRecognitionError(
        error?.message || "មិនអាចបម្លែងការសរសេរដោយដៃបានទេ។ សូមព្យាយាមម្តងទៀត។"
      );
    } finally {
      if (recognitionRequestIdRef.current === requestId) {
        setIsRecognizing(false);
      }
    }
  };

  const utilityState = useMemo(
    () => ({
      "move-left": { disabled: disabled || !canMoveLeft, onClick: onMoveLeft },
      "move-right": { disabled: disabled || !canMoveRight, onClick: onMoveRight },
      solve: { disabled, onClick: onSolve },
      delete: { disabled, onClick: onDelete },
      placeholder: { disabled: false, onClick: undefined }
    }),
    [canMoveLeft, canMoveRight, disabled, onDelete, onMoveLeft, onMoveRight, onSolve]
  );
  const hasDrawing = strokes.length > 0 || Boolean(activeStroke);
  const shouldShowStatus = isRecognizing || Boolean(recognitionError) || Boolean(recognizedValue) || !hasDrawing;

  return (
    <motion.aside
      drag={isDesktop}
      dragMomentum={false}
      dragElastic={0.08}
      className="fixed inset-x-0 bottom-0 z-30 bg-transparent px-0 pb-[max(0.25rem,env(safe-area-inset-bottom))] md:inset-x-auto md:bottom-4 md:left-1/2 md:w-auto md:-translate-x-1/2 md:px-0 md:pb-0"
    >
      <div className="app-shell mx-auto w-full overflow-hidden rounded-t-[2rem] border border-slate-100 bg-white shadow-[0_-10px_28px_rgba(15,23,42,0.06)] md:w-[450px] md:max-w-[450px] md:rounded-[2rem] md:border-slate-200 md:shadow-[0_18px_48px_rgba(15,23,42,0.12)]">
        <div className="border-b border-slate-50 px-3 py-2 md:px-4 md:py-3">
          <div className="flex items-center gap-1.5 md:gap-2">
            {utilityButtons.map((button) => {
              const Icon = button.icon;
              const state = utilityState[button.type];

              return (
                <button
                  key={button.id}
                  type="button"
                  onClick={state?.onClick}
                  disabled={state?.disabled}
                  className={`flex items-center justify-center text-slate-900 transition duration-200 ${
                    button.type === "delete"
                        ? "ml-auto h-10 w-10 rounded-lg border border-slate-100 hover:bg-slate-50 active:bg-slate-100 md:h-11 md:w-11"
                        : "h-9 w-9 rounded-lg hover:bg-slate-50 active:bg-slate-100 md:h-10 md:w-10"
                  } ${state?.disabled ? "opacity-40" : ""}`}
                >
                  {Icon ? <Icon className="h-6 w-6 stroke-[1.8]" /> : null}
                </button>
              );
            })}

            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 text-slate-700 transition hover:bg-slate-50 active:bg-slate-100 md:h-11 md:w-11 ${
                disabled ? "opacity-40" : ""
              }`}
              aria-label="Reset input"
            >
              <RotateCcw className="h-5 w-5 stroke-[1.8]" />
            </button>

            <button
              type="button"
              onClick={onSolve}
              disabled={disabled}
              className={`inline-flex h-10 min-w-[3.25rem] items-center justify-center rounded-lg bg-[#22c55e] px-4 text-xl font-semibold text-white shadow-[0_8px_18px_rgba(34,197,94,0.24)] transition hover:bg-[#16a34a] active:bg-[#15803d] md:h-11 md:min-w-[4rem] ${
                disabled ? "opacity-40" : ""
              }`}
              aria-label="Solve"
            >
              <span>=</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsDrawMode((current) => !current);
                resetRecognitionState();
              }}
              disabled={disabled}
              className={`ml-1 inline-flex h-10 min-w-[7.75rem] items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition md:h-11 ${
                isDrawMode
                  ? "border-[#22c55e] bg-[#22c55e] text-white shadow-[0_8px_18px_rgba(34,197,94,0.25)]"
                  : "border-[#22c55e]/20 bg-[#22c55e]/8 text-[#22c55e] hover:bg-[#22c55e]/12"
              } ${disabled ? "opacity-50" : ""}`}
            >
              <Pencil className="h-4 w-4" />
              <span>គូសលំហាត់</span>
            </button>
          </div>
        </div>

        {isDrawMode ? (
          <div className="flex h-[min(21rem,calc(100vh-11.75rem))] min-h-[19.5rem] flex-col px-3.5 pb-4 pt-3 md:h-[min(24rem,calc(100vh-14.5rem))] md:min-h-[21.5rem] md:px-4 md:pb-5">
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConvertDrawing}
                  disabled={disabled || isRecognizing || (strokes.length === 0 && !activeStroke)}
                  className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[#22c55e] px-3 text-sm font-semibold text-white transition hover:bg-[#16a34a] disabled:opacity-50 ${
                    hasPendingDrawingChange && !isRecognizing ? "animate-pulse shadow-[0_0_0_6px_rgba(34,197,94,0.12)]" : ""
                  }`}
                >
                  <Languages className="h-4 w-4" />
                  <span>Convert</span>
                </button>
                <button
                  type="button"
                  onClick={handleUndoStroke}
                  disabled={disabled || strokes.length === 0}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#22c55e]/8 px-2.5 text-sm font-semibold text-[#22c55e] transition hover:bg-[#22c55e]/12 disabled:opacity-50 md:min-w-[5.25rem] md:px-3"
                  aria-label="Undo stroke"
                >
                  <RotateCcw className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Undo</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  disabled={disabled || (strokes.length === 0 && !activeStroke)}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#22c55e]/8 px-2.5 text-sm font-semibold text-[#22c55e] transition hover:bg-[#22c55e]/12 disabled:opacity-50 md:min-w-[5.25rem] md:px-3"
                  aria-label="Clear canvas"
                >
                  <Trash2 className="h-4 w-4 md:hidden" />
                  <span className="hidden md:inline">Clear</span>
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
              <canvas
                ref={canvasRef}
                onWheel={handleCanvasWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className={`block h-full min-h-[170px] w-full touch-none rounded-[1.2rem] bg-white md:min-h-[190px] ${
                  isRecognizing ? "pointer-events-none blur-[1.5px]" : ""
                }`}
              />
              {isRecognizing ? (
                <div className="absolute inset-2 flex items-center justify-center rounded-[1.2rem] bg-white/60 backdrop-blur-sm">
                  <div className="rounded-full border border-[#22c55e]/20 bg-white/90 px-4 py-2 text-sm font-semibold text-[#22c55e] shadow-sm">
                    Scanning...
                  </div>
                </div>
              ) : null}
              {showZoomControls ? (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-white/50 p-1.5 shadow-sm backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={resetCanvasView}
                    className="flex h-7 items-center justify-center rounded-full bg-white/50 px-2 text-[11px] font-semibold text-[#22c55e] transition hover:bg-white/70"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => zoomAroundCanvasCenter(1 / 1.15)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/50 text-base font-semibold text-[#22c55e] transition hover:bg-white/70"
                    aria-label="Zoom out"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => zoomAroundCanvasCenter(1.15)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/50 text-base font-semibold text-[#22c55e] transition hover:bg-white/70"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                </div>
              ) : null}
            </div>

            {shouldShowStatus ? (
              <div className="mt-2 min-h-[2.25rem] rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-700">
                {isRecognizing ? (
                  "\u1780\u17c6\u1796\u17bb\u1784\u1794\u1798\u17d2\u179b\u17c2\u1784\u1780\u17b6\u179a\u179f\u179a\u179f\u17c1\u179a\u178a\u17c4\u1799\u178a\u17c3..."
                ) : recognitionError ? (
                  <span className="inline-flex items-center gap-2">
                    <span>{recognitionError}</span>
                    {recognitionError.includes("404") ? (
                      <button
                        type="button"
                        onClick={handleConvertDrawing}
                        disabled={disabled || isRecognizing || (strokes.length === 0 && !activeStroke)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#22c55e]/20 bg-white text-[#22c55e] transition hover:bg-[#22c55e]/10 disabled:opacity-50"
                        aria-label="Retry handwriting recognition"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </span>
                ) : recognizedValue ? (
                  `\u1794\u17b6\u1793\u1794\u1789\u17d2\u1785\u17bc\u179b: ${recognizedValue}`
                ) : (
                  "\u179f\u17bc\u1798\u179f\u179a\u179f\u17c1\u179a\u179b\u17c6\u17a0\u17b6\u178f\u17cb \u179a\u17bd\u1785\u1785\u17bb\u1785 Convert \u178a\u17be\u1798\u17d2\u1794\u17b8\u1791\u1791\u17bd\u179b\u1794\u17b6\u1793\u1785\u1798\u17d2\u179b\u17be\u1799"
                )}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="px-3.5 pb-2 pt-2">
            <div
              className="grid gap-2 md:gap-2.5"
              style={{ gridTemplateColumns: inputMode === "math" ? "minmax(0, 0.9fr) repeat(4, minmax(0, 1fr))" : "minmax(0, 1fr)" }}
            >
              <button
                type="button"
                onClick={() => setInputMode((currentMode) => (currentMode === "math" ? "text" : "math"))}
                className={`relative mt-1.5 flex h-9 min-w-0 items-center justify-center overflow-hidden rounded-lg border px-3 text-center font-sans transition duration-200 md:h-11 md:rounded-xl ${
                  inputMode === "text"
                    ? "border-[#22c55e]/20 bg-white text-[#22c55e] shadow-sm"
                    : "border-[#22c55e]/20 bg-white text-[#22c55e] hover:border-[#22c55e]/30 hover:bg-white active:bg-white"
                }`}
              >
                <span className="truncate text-[17px] font-medium sm:text-[17px]">
                  {inputMode === "math" ? "abc" : "123"}
                </span>
                {inputMode === "text" || inputMode === "math" ? (
                  <span className="absolute bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#22c55e]" />
                ) : null}
              </button>

              {inputMode === "math"
                ? Object.entries(categoryConfig).map(([categoryKey, category]) => {
                    const isActive = activeCategory === categoryKey;

                    return (
                      <button
                        key={categoryKey}
                        type="button"
                        onClick={() => setActiveCategory(categoryKey)}
                        className={`relative mt-1.5 flex h-9 min-w-0 items-center justify-center overflow-hidden rounded-lg border px-2 text-center font-sans transition duration-200 md:h-11 md:rounded-xl ${
                          isActive
                            ? "border-[#22c55e]/15 bg-white text-[#22c55e] shadow-[0_8px_18px_rgba(34,197,94,0.10)]"
                            : "border-slate-100 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                        }`}
                      >
                        <span className="truncate text-[11px] font-bold tracking-[0.01em] sm:text-[13px]">
                          {category.label}
                        </span>
                        {isActive ? (
                          <span className="absolute bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#22c55e]" />
                        ) : null}
                      </button>
                    );
                  })
                : null}
            </div>
          </div>
        )}

        {!isDrawMode ? (
          <div
            className="mt-1.5 grid gap-2 px-3.5 pb-4 md:gap-2.5 md:px-4 md:pb-5"
            style={{ gridTemplateColumns: `repeat(${activeConfig.columns}, minmax(0, 1fr))` }}
          >
            {keys.map((key) => {
              return (
                <motion.button
                  key={`${activeCategory}-${key.label}-${key.value || key.template || "solve"}`}
                  type="button"
                  onClick={() => onKeyPress?.(key)}
                  disabled={disabled}
                  whileTap={{ scale: 0.98 }}
                  className={`aspect-square w-full overflow-hidden rounded-[1.2rem] border px-2 py-1.5 text-center transition duration-200 disabled:opacity-50 md:aspect-[1.05/0.82] md:rounded-[1.35rem] md:px-2.5 md:py-2 ${getKeyButtonClasses(
                    key
                  )}`}
                >
                  <span className={getLabelClasses(key)}>{key.label}</span>
                </motion.button>
              );
            })}
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
};

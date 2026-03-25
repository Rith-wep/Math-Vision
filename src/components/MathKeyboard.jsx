import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Delete, Sparkles } from "lucide-react";

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
  { id: "text", label: "abc", type: "label" },
  { id: "left", icon: ArrowLeft, type: "move-left" },
  { id: "right", icon: ArrowRight, type: "move-right" },
  { id: "delete", icon: Delete, type: "delete" },
  { id: "solve", icon: Sparkles, type: "solve" }
];

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
      ? "mx-auto w-auto rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[12px] font-semibold tracking-[0.08em] text-emerald-700"
      : ""
  } ${key.textClass || ""}`.trim();
};

export const MathKeyboard = ({
  onKeyPress,
  onDelete,
  onSolve,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
  disabled = false
}) => {
  const [inputMode, setInputMode] = useState("math");
  const [activeCategory, setActiveCategory] = useState("operators");
  const activeConfig = inputMode === "text" ? textKeyboardConfig : categoryConfig[activeCategory];
  const keys = inputMode === "text" ? textKeyboardConfig.keys : keyboardLayouts[activeCategory];

  const utilityState = useMemo(
    () => ({
      "move-left": { disabled: disabled || !canMoveLeft, onClick: onMoveLeft },
      "move-right": { disabled: disabled || !canMoveRight, onClick: onMoveRight },
      solve: { disabled, onClick: onSolve },
      delete: { disabled, onClick: onDelete },
      label: {
        disabled: false,
        onClick: () => setInputMode((currentMode) => (currentMode === "math" ? "text" : "math"))
      },
      placeholder: { disabled: false, onClick: undefined }
    }),
    [canMoveLeft, canMoveRight, disabled, onDelete, onMoveLeft, onMoveRight, onSolve]
  );

  return (
    <aside className="fixed inset-x-0 bottom-0 z-30 bg-transparent px-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="app-shell mx-auto w-full overflow-hidden rounded-t-[2rem] border border-slate-100 bg-white shadow-[0_-10px_28px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-50 px-3 py-2">
          <div className="flex items-center gap-1.5">
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
                    button.type === "label"
                      ? "min-w-[3.5rem] justify-start rounded-lg border border-emerald-200 bg-white px-3 text-[17px] font-medium text-emerald-700 shadow-sm hover:border-emerald-300 hover:bg-white active:bg-white"
                      : button.type === "solve"
                        ? "ml-2 h-10 min-w-[3.25rem] rounded-lg bg-emerald-500 px-3 text-white shadow-[0_8px_18px_rgba(16,185,129,0.24)] hover:bg-emerald-600 active:bg-emerald-700"
                      : button.type === "delete"
                        ? "ml-auto h-10 w-10 rounded-lg border border-slate-100 hover:bg-slate-50 active:bg-slate-100"
                        : "h-9 w-9 rounded-lg hover:bg-slate-50 active:bg-slate-100"
                  } ${state?.disabled ? "opacity-40" : ""}`}
                >
                  {button.type === "solve" ? (
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      {Icon ? <Icon className="h-4 w-4" /> : null}
                      <span>Solve</span>
                    </span>
                  ) : Icon ? (
                    <Icon className="h-6 w-6 stroke-[1.8]" />
                  ) : (
                    <span>{inputMode === "math" ? button.label : "123"}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {inputMode === "math" ? (
          <div className="px-3.5 pb-2 pt-2">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
            >
              {Object.entries(categoryConfig).map(([categoryKey, category]) => {
                const isActive = activeCategory === categoryKey;

                return (
                  <button
                    key={categoryKey}
                    type="button"
                    onClick={() => setActiveCategory(categoryKey)}
                    className={`relative mt-1.5 flex h-9 min-w-0 items-center justify-center overflow-hidden rounded-lg border px-2 text-center font-sans transition duration-200 ${
                      isActive
                        ? "border-emerald-100 bg-white text-emerald-600 shadow-[0_8px_18px_rgba(16,185,129,0.10)]"
                        : "border-slate-100 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                    }`}
                  >
                    <span className="truncate text-[11px] font-bold tracking-[0.01em] sm:text-[13px]">
                      {category.label}
                    </span>
                    {isActive ? (
                      <span className="absolute bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-emerald-600" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div
          className="mt-1.5 grid gap-2 px-3.5 pb-4"
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
                className={`aspect-square w-full overflow-hidden rounded-[1.2rem] border px-2 py-1.5 text-center transition duration-200 disabled:opacity-50 ${getKeyButtonClasses(
                  key
                )}`}
              >
                <span className={getLabelClasses(key)}>{key.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

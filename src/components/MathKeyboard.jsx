import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  ChevronLeft,
  ChevronRight,
  Delete,
  Equal,
  FlaskConical,
  Sparkles
} from "lucide-react";

const tabConfig = {
  basic: {
    label: "Basic",
    icon: Calculator
  },
  scientific: {
    label: "Scientific",
    icon: FlaskConical
  }
};

const keyboardTabs = {
  basic: [
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "+", value: "+" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "-", value: "-" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "×", value: "\\times ", type: "multiply" },
    { label: "0", value: "0" },
    { label: "x", value: "x" },
    { label: "y", value: "y" },
    { label: "÷", value: "\\div ", type: "divide" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: ".", value: "." },
    { label: "=", value: "=", icon: Equal, featured: true }
  ],
  scientific: [
    { label: "√", value: "\\sqrt{}", type: "sqrt" },
    { label: "x²", value: "x^{2}", textClass: "text-sm" },
    { label: "^", value: "^{}", textClass: "text-lg" },
    { label: "∫", value: "\\int ", type: "integral" },
    { label: "sin", value: "\\sin(", textClass: "text-sm" },
    { label: "cos", value: "\\cos(", textClass: "text-sm" },
    { label: "tan", value: "\\tan(", textClass: "text-sm" },
    { label: "log", value: "\\log(", textClass: "text-sm" },
    { label: "ln", value: "\\ln(", textClass: "text-sm" },
    { label: "d/dx", value: "\\frac{d}{dx}", textClass: "text-xs" },
    { label: "π", value: "\\pi ", type: "pi" },
    { label: "e", value: "e" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "x", value: "x" },
    { label: "y", value: "y" },
    { label: "+", value: "+" },
    { label: "-", value: "-" },
    { label: "×", value: "\\times ", type: "multiply" },
    { label: "=", value: "=", icon: Equal, featured: true }
  ]
};

const SymbolIcon = ({ type }) => {
  if (type === "divide") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="6" r="1.2" />
        <path d="M5 12h14" />
        <circle cx="12" cy="18" r="1.2" />
      </svg>
    );
  }

  if (type === "multiply") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 7l10 10" />
        <path d="M17 7 7 17" />
      </svg>
    );
  }

  if (type === "sqrt") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 13h4l3 6 4-14h7" />
      </svg>
    );
  }

  if (type === "integral") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.5 4c-2.5 0-4 1.5-4 4v8c0 2.5-1.5 4-4 4" />
        <path d="M9.5 20c2.5 0 4-1.5 4-4V8c0-2.5 1.5-4 4-4" />
      </svg>
    );
  }

  if (type === "pi") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 8h14" />
        <path d="M9 8v8c0 1.5-.4 2.7-1.5 4" />
        <path d="M15 8v12" />
      </svg>
    );
  }

  return null;
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
  const [activeTab, setActiveTab] = useState("basic");
  const keys = keyboardTabs[activeTab];
  const isScientificTab = activeTab === "scientific";

  return (
    <aside className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-line/70 bg-white/60 px-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg sm:px-4">
      <div className="app-shell mx-auto flex max-h-[42vh] flex-col overflow-y-auto rounded-t-[1.75rem] border border-white/60 bg-white/65 px-2 pt-2 shadow-[0_-18px_60px_rgba(15,23,42,0.12)] backdrop-blur-lg scrollbar-hide sm:max-h-[44vh] sm:rounded-t-[2rem] sm:px-3">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1 rounded-full bg-white p-1 shadow-sm">
            {Object.entries(tabConfig).map(([tabKey, tab]) => {
              const TabIcon = tab.icon;

              return (
                <button
                  key={tabKey}
                  type="button"
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:py-2 sm:text-sm ${
                    activeTab === tabKey
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "text-slate-600 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onMoveLeft}
              disabled={disabled || !canMoveLeft}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10 sm:rounded-2xl"
              aria-label="Move cursor left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onMoveRight}
              disabled={disabled || !canMoveRight}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10 sm:rounded-2xl"
              aria-label="Move cursor right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-10 sm:rounded-2xl"
              aria-label="Delete symbol"
            >
              <Delete className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 pb-2">
          {keys.map((key) => {
            const Icon = key.icon;

            return (
              <motion.button
                key={`${activeTab}-${key.label}`}
                type="button"
                onClick={() => {
                  if (key.featured) {
                    onSolve?.();
                    return;
                  }

                  onKeyPress?.(key);
                }}
                disabled={disabled}
                whileTap={{ scale: 0.95 }}
                className={`flex h-10 items-center justify-center rounded-xl border py-1.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:rounded-2xl sm:py-2 sm:text-base ${
                  key.featured
                    ? "ai-solve-glow border-green-500 bg-green-600 text-white hover:bg-green-700"
                    : isScientificTab
                      ? "border-green-200 bg-green-50/60 text-green-900 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                      : "border-brand-line bg-white text-brand-ink hover:border-green-100 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                {key.featured ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 stroke-[2] sm:h-4 sm:w-4" />
                    {Icon ? <Icon className="h-4.5 w-4.5 stroke-[1.8] sm:h-5 sm:w-5" /> : null}
                  </span>
                ) : Icon ? (
                  <Icon className="h-4.5 w-4.5 stroke-[1.8] sm:h-5 sm:w-5" />
                ) : key.type ? (
                  <SymbolIcon type={key.type} />
                ) : (
                  <span className={`text-sm font-sans sm:text-base ${key.textClass || ""}`.trim()}>
                    {key.label}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

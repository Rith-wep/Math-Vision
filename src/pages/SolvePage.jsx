import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BlockMath } from "react-katex";
import {
  ArrowLeft,
  Bot,
  Camera,
  PencilLine,
  Search,
  Sparkles,
  Target,
  Waypoints
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { MathKeyboard } from "../components/MathKeyboard.jsx";
import { ScanHeader } from "../components/ScanHeader.jsx";
import { UploadPhoto } from "../components/UploadPhoto.jsx";
import { formulaService } from "../services/formulaService.js";
import { toKhmerErrorMessage } from "../utils/errorMessages.js";

const featureBadges = [
  { id: "ai", label: "AI Smart", icon: Bot },
  { id: "steps", label: "Steps", icon: Waypoints },
  { id: "accurate", label: "Accurate", icon: Target }
];

const sanitizeLatex = (value) => {
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

const isLikelyMathExpression = (value) => /[0-9xyz=+\-*/^()\\]/i.test(value);

export const SolvePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formulaSuggestions, setFormulaSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [expression, setExpression] = useState("");
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [editIndex, setEditIndex] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isInputReady, setIsInputReady] = useState(false);

  const syncSelectionRange = (start, end = start) => {
    const safeStart = Math.max(0, start);
    const safeEnd = Math.max(safeStart, end);
    setSelectionRange({ start: safeStart, end: safeEnd });
  };

  const syncCharacterSelection = (position) => {
    const safePosition = Math.max(0, position);

    if (safePosition >= expression.length) {
      setEditIndex(null);
      syncSelectionRange(safePosition, safePosition);
      return;
    }

    setEditIndex(safePosition);
    syncSelectionRange(safePosition, safePosition);
  };

  const updateExpression = (
    nextValue,
    nextSelectionStart = nextValue.length,
    nextSelectionEnd = nextSelectionStart
  ) => {
    setExpression(nextValue);
    syncSelectionRange(nextSelectionStart, nextSelectionEnd);
  };

  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const data = await formulaService.getAll();
        setFormulaSuggestions(data);
      } catch (error) {
        setErrorMessage(
          toKhmerErrorMessage(error.response?.data?.message || "Unable to load formula suggestions.")
        );
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchFormulas();
  }, []);

  useEffect(() => {
    if (location.state?.reset) {
      setExpression("");
      setSelectionRange({ start: 0, end: 0 });
      setEditIndex(null);
      setErrorMessage("");
      setIsInputReady(false);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextExpression = params.get("expression");

    if (nextExpression) {
      setExpression(nextExpression);
      setEditIndex(null);
      syncSelectionRange(nextExpression.length);
      setIsInputReady(true);
    }
  }, [location.search]);

  const previewExpression = useMemo(() => {
    return sanitizeLatex(expression) || "x^2 + 5x + 6 = 0";
  }, [expression]);

  const cursorPosition = editIndex ?? selectionRange.start;

  const handleKeyboardPress = (key) => {
    const token = key.value || key.label;
    const isSingleCharacterToken = token.length === 1;

    let nextExpression;
    let nextPosition;

    if (editIndex !== null && editIndex < expression.length && isSingleCharacterToken) {
      nextExpression = expression.slice(0, editIndex) + token + expression.slice(editIndex + 1);
      nextPosition = editIndex + 1;
      setEditIndex(null);
    } else {
      const { start, end } = selectionRange;
      nextExpression = expression.slice(0, start) + token + expression.slice(end);
      nextPosition = start + token.length;
      setEditIndex(null);
    }

    updateExpression(nextExpression, nextPosition, nextPosition);
  };

  const handleDelete = () => {
    if (editIndex !== null && editIndex < expression.length) {
      const nextExpression = expression.slice(0, editIndex) + expression.slice(editIndex + 1);
      setEditIndex(null);
      updateExpression(nextExpression, editIndex, editIndex);
      return;
    }

    const { start, end } = selectionRange;

    if (start !== end) {
      const nextExpression = expression.slice(0, start) + expression.slice(end);
      setEditIndex(null);
      updateExpression(nextExpression, start, start);
      return;
    }

    if (start <= 0) {
      return;
    }

    const nextExpression = expression.slice(0, start - 1) + expression.slice(start);
    setEditIndex(null);
    updateExpression(nextExpression, start - 1, start - 1);
  };

  const handleMoveLeft = () => {
    const currentPosition = editIndex ?? selectionRange.start;
    const nextPosition = Math.max(0, currentPosition - 1);
    syncCharacterSelection(nextPosition);
  };

  const handleMoveRight = () => {
    const currentPosition = editIndex ?? selectionRange.start;
    const nextPosition = Math.min(expression.length, currentPosition + 1);
    syncCharacterSelection(nextPosition);
  };

  const handleSolve = () => {
    if (!expression.trim() || !isLikelyMathExpression(expression)) {
      setErrorMessage(toKhmerErrorMessage("The math expression is not valid. Please check it again."));
      return;
    }

    setErrorMessage("");
    navigate(`/solution?expression=${encodeURIComponent(expression)}`);
  };

  const searchPlaceholder = "បញ្ចូលសមីការគណិតវិទ្យា...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-screen bg-brand-white text-brand-ink"
    >
      <div className="app-shell-page mx-auto flex min-h-screen flex-col bg-brand-white">
        <ScanHeader />

        <main
          className={`flex-1 bg-gradient-to-b from-green-50 via-white to-slate-50 px-4 pt-4 md:px-5 lg:px-6 ${
            isInputReady ? "pb-40" : "pb-6"
          }`}
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-3 py-2 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <section className="space-y-3">
            <div className="space-y-1.5">
              <p className="text-base font-bold tracking-[0.04em] text-green-700">Math Vision</p>
              <h1 className="mb-2 font-brand text-xl leading-relaxed text-green-900">
                ដោះស្រាយសមីការ និងលំហាត់
              </h1>
            </div>

            <div className="flex flex-wrap gap-2">
              {featureBadges.map((badge) => {
                const Icon = badge.icon;

                return (
                  <div
                    key={badge.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-green-100 bg-green-50/85 px-3 py-1.5 text-[11px] font-medium text-green-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{badge.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="premium-surface my-3 overflow-hidden rounded-[2rem] border border-green-100/80 bg-white/95">
              <div className="border-b border-green-100/80 bg-gradient-to-br from-green-50 via-white to-white px-4 py-3">
                <div className="premium-card relative overflow-hidden rounded-3xl border border-green-100/80 bg-white px-4 py-3 text-center">
                  <div className="mb-2 flex items-center justify-center gap-2 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-white/95 px-2 py-0.5 text-[9px] font-medium text-green-800 shadow-sm">
                      <Sparkles className="h-3 w-3 text-green-600" />
                      <span>AI Powered</span>
                    </div>
                    <div className="inline-flex items-center rounded-full border border-green-100 bg-white/95 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-slate-500 shadow-sm">
                      Live Preview
                    </div>
                  </div>
                  <div className="max-h-[100px] overflow-x-auto overflow-y-hidden text-lg">
                    <BlockMath math={previewExpression} />
                  </div>
                </div>
              </div>

              <div className="px-3 py-3">
                <div className="green-soft-glow flex items-center gap-2.5 rounded-full border border-slate-100 bg-white/95 px-4 py-3">
                  <Search className="h-4.5 w-4.5 text-slate-400" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsInputReady(true);
                      setEditIndex(null);
                      syncSelectionRange(expression.length, expression.length);
                    }}
                    className="flex min-h-[24px] flex-1 items-center overflow-x-auto bg-transparent text-left text-sm leading-relaxed text-brand-ink"
                  >
                    {expression ? (
                      <span className="inline-flex items-center whitespace-nowrap">
                        {Array.from({ length: expression.length + 1 }).map((_, index) => (
                          <span key={`editor-${index}`} className="flex items-center">
                            {cursorPosition === index ? (
                              <span
                                aria-hidden="true"
                                className="mx-[2px] h-6 w-[2px] rounded-full bg-green-700 shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_0_10px_rgba(22,163,74,0.18)]"
                              />
                            ) : null}

                            {index < expression.length ? (
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setIsInputReady(true);
                                  syncCharacterSelection(index);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    setIsInputReady(true);
                                    syncCharacterSelection(index);
                                  }
                                }}
                                className={`px-[1px] ${
                                  editIndex === index ? "text-red-500" : "text-brand-ink"
                                }`}
                              >
                                {expression[index] === " " ? "\u00A0" : expression[index]}
                              </span>
                            ) : null}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-slate-400">{searchPlaceholder}</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-700 transition hover:bg-green-100 hover:text-green-800"
                    aria-label="Scan with camera"
                  >
                    <Camera className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>

            {!isInputReady && (
              <button
                type="button"
                onClick={() => setIsInputReady(true)}
                className="premium-card flex w-full items-center justify-center gap-2 rounded-3xl border border-green-100 bg-white/95 px-4 py-2.5 text-sm font-medium text-green-700 transition hover:bg-green-50"
              >
                <PencilLine className="h-4 w-4" />
                <span>ចាប់ផ្តើមបញ្ចូលសំណួរ</span>
              </button>
            )}
          </section>

          {isLoadingSuggestions && (
            <div className="premium-card mt-5 rounded-3xl border border-green-100/80 bg-white/90 p-4 text-sm text-slate-600">
              កំពុងផ្ទុកទិន្នន័យ...
            </div>
          )}

          {!isLoadingSuggestions && errorMessage && (
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [0, -10, 10, -8, 8, 0] }}
              transition={{ duration: 0.35 }}
              className="mt-5 rounded-3xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 shadow-[0_10px_24px_rgba(239,68,68,0.08)]"
            >
              {errorMessage}
            </motion.div>
          )}

          {!isLoadingSuggestions && formulaSuggestions.length > 0 && (
            <div className="premium-card mt-5 rounded-3xl border border-green-100/80 bg-green-50/80 p-3.5 text-sm leading-relaxed text-slate-600">
              Example from the formula library:{" "}
              <span className="font-medium text-slate-900">{formulaSuggestions[0].title_kh}</span>
            </div>
          )}
        </main>

        {isInputReady && (
          <MathKeyboard
            onKeyPress={handleKeyboardPress}
            onDelete={handleDelete}
            onSolve={handleSolve}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            canMoveLeft={cursorPosition > 0}
            canMoveRight={cursorPosition < expression.length}
          />
        )}

        <UploadPhoto
          open={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onScanComplete={(result) => {
            navigate(
              `/solution?expression=${encodeURIComponent(result.question_text || result.expression)}`,
              {
                state: {
                  prefetchedSolution: result
                }
              }
            );
          }}
        />
      </div>
    </motion.div>
  );
};

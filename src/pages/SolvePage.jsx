import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import katex from "katex";
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
import { SkeletonBlock } from "../components/SkeletonBlock.jsx";
import { UploadPhoto } from "../components/UploadPhoto.jsx";
import { formulaService } from "../services/formulaService.js";
import { toKhmerErrorMessage } from "../utils/errorMessages.js";

const featureBadges = [
  { id: "ai", label: "AI Smart", icon: Bot },
  { id: "steps", label: "Steps", icon: Waypoints },
  { id: "accurate", label: "Accurate", icon: Target }
];

const DEFAULT_PREVIEW_EXPRESSION = "x^2 + 5x + 6 = 0";
const PLACEHOLDER_SYMBOL = "○";
const COMMAND_DISPLAY_MAP = {
  "\\times": "×",
  "\\div": "÷",
  "\\pi": "π",
  "\\theta": "θ",
  "\\Delta": "Δ",
  "\\partial": "∂",
  "\\neq": "≠",
  "\\to": "→",
  "\\infty": "∞",
  "\\sum": "∑",
  "\\prod": "∏",
  "\\sqrt": "√",
  "\\log": "log",
  "\\ln": "ln",
  "\\sin": "sin",
  "\\cos": "cos",
  "\\tan": "tan",
  "\\cot": "cot",
  "\\sec": "sec",
  "\\csc": "csc",
  "\\sinh": "sinh",
  "\\cosh": "cosh",
  "\\tanh": "tanh",
  "\\coth": "coth",
  "\\exp": "exp",
  "\\lim": "lim",
  "\\frac": "/"
};

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

const makePreviewLatexSafe = (value) => {
  const sanitized = sanitizeLatex(value);

  if (!sanitized) {
    return "";
  }

  let safeLatex = sanitized;
  let openBraceCount = 0;

  for (const character of safeLatex) {
    if (character === "{") {
      openBraceCount += 1;
    } else if (character === "}" && openBraceCount > 0) {
      openBraceCount -= 1;
    }
  }

  if (openBraceCount > 0) {
    safeLatex += "}".repeat(openBraceCount);
  }

  if (safeLatex.endsWith("^") || safeLatex.endsWith("_")) {
    safeLatex += "{}";
  }

  safeLatex = safeLatex
    .replace(/\^\{([^}]*)$/, "^{$1}")
    .replace(/_\{([^}]*)$/, "_{$1}");

  return safeLatex;
};

const toRenderableExpression = (value) => value.replaceAll(PLACEHOLDER_SYMBOL, "\\circ");

const canRenderLatex = (value) => {
  if (!value) {
    return false;
  }

  try {
    katex.renderToString(toRenderableExpression(value), { displayMode: true, throwOnError: true });
    return true;
  } catch {
    return false;
  }
};

const stripIncompleteLatexTail = (value) => {
  let nextValue = value;
  let previousValue = "";

  while (nextValue !== previousValue) {
    previousValue = nextValue;
    nextValue = nextValue
      .replace(/\\[a-zA-Z]*$/, "")
      .replace(/(?:\^|_)\{\}$/, "")
      .replace(/\{\}$/, "")
      .trim();
  }

  return nextValue;
};

const getBestRenderableLatex = (value) => {
  const initialCandidate = makePreviewLatexSafe(stripIncompleteLatexTail(value));

  if (!initialCandidate) {
    return "";
  }

  if (canRenderLatex(initialCandidate)) {
    return initialCandidate;
  }

  for (let index = initialCandidate.length - 1; index > 0; index -= 1) {
    const fallbackCandidate = makePreviewLatexSafe(
      stripIncompleteLatexTail(initialCandidate.slice(0, index))
    );

    if (fallbackCandidate && canRenderLatex(fallbackCandidate)) {
      return fallbackCandidate;
    }
  }

  return "";
};

const getPreviewExpression = (value) => {
  const renderableLatex = getBestRenderableLatex(value);

  if (!renderableLatex) {
    return DEFAULT_PREVIEW_EXPRESSION;
  }

  return renderableLatex;
};

const getInlinePreviewMarkup = (value) => {
  const math = getBestRenderableLatex(value);

  if (!math) {
    return "";
  }

  try {
    return katex.renderToString(toRenderableExpression(math), {
      displayMode: false,
      throwOnError: true,
      strict: "ignore"
    });
  } catch {
    return "";
  }
};

const buildInputDisplayTokens = (value) => {
  const readBraceGroup = (source, openBraceIndex) => {
    if (source[openBraceIndex] !== "{") {
      return null;
    }

    let depth = 0;

    for (let index = openBraceIndex; index < source.length; index += 1) {
      if (source[index] === "{") {
        depth += 1;
      } else if (source[index] === "}") {
        depth -= 1;

        if (depth === 0) {
          return {
            content: source.slice(openBraceIndex + 1, index),
            end: index + 1
          };
        }
      }
    }

    return null;
  };

  const normalizeInlineDisplay = (segment) =>
    segment
      .replaceAll(PLACEHOLDER_SYMBOL, "○")
      .replace(/\\pi/g, "π")
      .replace(/\\theta/g, "θ")
      .replace(/\\Delta/g, "Δ")
      .replace(/\\partial/g, "∂")
      .replace(/\\neq/g, "≠")
      .replace(/\\to/g, "→")
      .replace(/\\infty/g, "∞")
      .replace(/\\sum/g, "∑")
      .replace(/\\prod/g, "∏")
      .replace(/\\sqrt/g, "√")
      .replace(/\\log/g, "log")
      .replace(/\\ln/g, "ln")
      .replace(/\\sin/g, "sin")
      .replace(/\\cos/g, "cos")
      .replace(/\\tan/g, "tan")
      .replace(/\\cot/g, "cot")
      .replace(/\\sec/g, "sec")
      .replace(/\\csc/g, "csc")
      .replace(/\\sinh/g, "sinh")
      .replace(/\\cosh/g, "cosh")
      .replace(/\\tanh/g, "tanh")
      .replace(/\\coth/g, "coth")
      .replace(/\\exp/g, "exp")
      .replace(/[{}]/g, "");

  const tokens = [];
  let index = 0;

  while (index < value.length) {
    if (value.startsWith("\\frac", index)) {
      const numeratorGroup = readBraceGroup(value, index + 5);
      const denominatorGroup = numeratorGroup ? readBraceGroup(value, numeratorGroup.end) : null;

      if (numeratorGroup && denominatorGroup) {
        tokens.push({
          start: index,
          end: denominatorGroup.end,
          display: `${normalizeInlineDisplay(numeratorGroup.content)}/${normalizeInlineDisplay(denominatorGroup.content)}`
        });
        index = denominatorGroup.end;
        continue;
      }
    }

    if (value.startsWith("\\operatorname{", index)) {
      const endIndex = value.indexOf("}", index + "\\operatorname{".length);

      if (endIndex > index) {
        tokens.push({
          start: index,
          end: endIndex + 1,
          display: value.slice(index + "\\operatorname{".length, endIndex)
        });
        index = endIndex + 1;
        continue;
      }
    }

    if (value[index] === "\\") {
      const commandMatch = value.slice(index).match(/^\\[a-zA-Z]+/);

      if (commandMatch) {
        const rawCommand = commandMatch[0];
        tokens.push({
          start: index,
          end: index + rawCommand.length,
          display: COMMAND_DISPLAY_MAP[rawCommand] || rawCommand.replace("\\", "")
        });
        index += rawCommand.length;
        continue;
      }
    }

    const character = value[index];

    if (character === "{" || character === "}") {
      index += 1;
      continue;
    }

    tokens.push({
      start: index,
      end: index + 1,
      display: character === PLACEHOLDER_SYMBOL ? "○" : character
    });
    index += 1;
  }

  return tokens;
};

const getCursorBoundaries = (tokens, rawLength) => {
  const boundaries = new Set([0, rawLength]);

  tokens.forEach((token) => {
    boundaries.add(token.start);
    boundaries.add(token.end);
  });

  return [...boundaries].sort((left, right) => left - right);
};

const getPreviousBoundary = (boundaries, position) => {
  for (let index = boundaries.length - 1; index >= 0; index -= 1) {
    if (boundaries[index] < position) {
      return boundaries[index];
    }
  }

  return 0;
};

const getNextBoundary = (boundaries, position, fallback) => {
  for (let index = 0; index < boundaries.length; index += 1) {
    if (boundaries[index] > position) {
      return boundaries[index];
    }
  }

  return fallback;
};

const isLikelyMathExpression = (value) => /[0-9xyz=+\-*/^()\\]/i.test(value);
const hasInputPlaceholders = (value) => value.includes(PLACEHOLDER_SYMBOL);

const findNextPlaceholder = (value, fromIndex = 0) => value.indexOf(PLACEHOLDER_SYMBOL, fromIndex);
const findPreviousPlaceholder = (value, fromIndex) => value.lastIndexOf(PLACEHOLDER_SYMBOL, fromIndex);

export const SolvePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputSectionRef = useRef(null);
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

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("mathvision:keyboard-visibility", {
        detail: { visible: isInputReady }
      })
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("mathvision:keyboard-visibility", {
          detail: { visible: false }
        })
      );
    };
  }, [isInputReady]);

  useEffect(() => {
    if (!isInputReady || !inputSectionRef.current) {
      return;
    }

    const scrollTargetIntoView = () => {
      inputSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    };

    const animationFrameId = window.requestAnimationFrame(scrollTargetIntoView);
    const timeoutId = window.setTimeout(scrollTargetIntoView, 220);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [isInputReady]);

  const previewExpression = useMemo(() => {
    return getPreviewExpression(expression);
  }, [expression]);
  const inlinePreviewMarkup = useMemo(() => getInlinePreviewMarkup(expression), [expression]);
  const inputDisplayTokens = useMemo(() => buildInputDisplayTokens(expression), [expression]);
  const cursorBoundaries = useMemo(
    () => getCursorBoundaries(inputDisplayTokens, expression.length),
    [expression.length, inputDisplayTokens]
  );

  const cursorPosition = editIndex ?? selectionRange.start;

  const handleKeyboardPress = (key) => {
    const token = key.value || key.label;
    const nextCaretPosition = typeof key.caretOffset === "number" ? key.caretOffset : token.length;
    const placeholderOffsets = key.placeholderOffsets || [];

    let nextExpression;
    let nextPosition;
    let nextEditIndex = null;

    if (editIndex !== null && editIndex < expression.length && expression[editIndex] === PLACEHOLDER_SYMBOL) {
      nextExpression = expression.slice(0, editIndex) + token + expression.slice(editIndex + 1);
      nextPosition = editIndex + token.length;
      const upcomingPlaceholder = findNextPlaceholder(nextExpression, editIndex + token.length - 1);
      nextEditIndex = upcomingPlaceholder >= 0 ? upcomingPlaceholder : null;
    } else {
      const { start, end } = selectionRange;
      nextExpression = expression.slice(0, start) + token + expression.slice(end);
      nextPosition = start + nextCaretPosition;

      if (placeholderOffsets.length > 0) {
        nextEditIndex = start + placeholderOffsets[0];
        nextPosition = nextEditIndex;
      }
    }

    updateExpression(nextExpression, nextPosition, nextPosition);

    if (nextEditIndex !== null) {
      setEditIndex(nextEditIndex);
      syncSelectionRange(nextEditIndex, nextEditIndex);
    } else {
      setEditIndex(null);
    }
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
    const previousPlaceholder = findPreviousPlaceholder(expression, currentPosition - 1);

    if (previousPlaceholder >= 0) {
      syncCharacterSelection(previousPlaceholder);
      return;
    }

    const nextPosition = getPreviousBoundary(cursorBoundaries, currentPosition);
    setEditIndex(null);
    syncSelectionRange(nextPosition, nextPosition);
  };

  const handleMoveRight = () => {
    const currentPosition = editIndex ?? selectionRange.start;
    const nextPlaceholder = findNextPlaceholder(
      expression,
      editIndex !== null ? currentPosition + 1 : currentPosition
    );

    if (nextPlaceholder >= 0) {
      syncCharacterSelection(nextPlaceholder);
      return;
    }

    const nextPosition = getNextBoundary(cursorBoundaries, currentPosition, expression.length);
    setEditIndex(null);
    syncSelectionRange(nextPosition, nextPosition);
  };

  const handleSolve = () => {
    if (!expression.trim() || !isLikelyMathExpression(expression) || hasInputPlaceholders(expression)) {
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
            isInputReady ? "pb-72 sm:pb-80" : "pb-6"
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
              <p className="text-base font-bold tracking-[0.04em] text-green-700">Math-Vision</p>
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

            <div
              ref={inputSectionRef}
              className="premium-surface my-3 scroll-mt-24 overflow-hidden rounded-[2rem] border border-green-100/80 bg-white/95"
            >
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
                      const firstPlaceholder = findNextPlaceholder(expression);

                      if (firstPlaceholder >= 0) {
                        syncCharacterSelection(firstPlaceholder);
                        return;
                      }

                      setEditIndex(null);
                      syncSelectionRange(expression.length, expression.length);
                    }}
                    className="flex min-h-[24px] flex-1 items-center overflow-x-auto bg-transparent text-left text-sm leading-relaxed text-brand-ink"
                  >
                    {expression ? (
                      <span className="inline-flex min-w-0 items-center gap-2 whitespace-nowrap">
                        <span className="inline-flex min-w-0 items-center overflow-x-auto text-base text-slate-900">
                          {inputDisplayTokens.length === 0 && inlinePreviewMarkup ? (
                            <span dangerouslySetInnerHTML={{ __html: inlinePreviewMarkup }} />
                          ) : (
                            <>
                              {cursorPosition === 0 ? (
                                <span
                                  aria-hidden="true"
                                  className="mx-[2px] h-6 w-[2px] shrink-0 rounded-full bg-green-700 shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_0_10px_rgba(22,163,74,0.18)]"
                                />
                              ) : null}

                              {inputDisplayTokens.map((token) => (
                                <span key={`${token.start}-${token.end}`} className="inline-flex items-center">
                                  <span
                                    className={`px-[1px] ${
                                      editIndex === token.start && expression[token.start] === PLACEHOLDER_SYMBOL
                                        ? "rounded-full bg-green-100 text-green-700"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {token.display}
                                  </span>

                                  {cursorPosition === token.end ? (
                                    <span
                                      aria-hidden="true"
                                      className="mx-[2px] h-6 w-[2px] shrink-0 rounded-full bg-green-700 shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_0_10px_rgba(22,163,74,0.18)]"
                                    />
                                  ) : null}
                                </span>
                              ))}
                            </>
                          )}
                        </span>
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
            <div className="premium-card mt-5 rounded-3xl border border-green-100/80 bg-white/90 p-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-4 w-40 rounded-lg" />
                <SkeletonBlock className="h-4 w-full rounded-lg" />
                <SkeletonBlock className="h-4 w-4/5 rounded-lg" />
              </div>
            </div>
          )}

          {isLoadingSuggestions && (
            <div className="hidden premium-card mt-5 rounded-3xl border border-green-100/80 bg-white/90 p-4 text-sm text-slate-600">
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

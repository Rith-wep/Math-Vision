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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isInputReady, setIsInputReady] = useState(false);

  useEffect(() => {
    const fetchFormulas = async () => {
      try {
        const data = await formulaService.getAll();
        setFormulaSuggestions(data);
      } catch (error) {
        setErrorMessage("មិនអាចទាញយកទិន្នន័យរូបមន្តបានទេ។");
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchFormulas();
  }, []);

  useEffect(() => {
    if (location.state?.reset) {
      setExpression("");
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
      setIsInputReady(true);
    }
  }, [location.search]);

  const previewExpression = useMemo(() => {
    return sanitizeLatex(expression) || "x^2 + 5x + 6 = 0";
  }, [expression]);

  const handleKeyboardPress = (key) => {
    const token = key.value || key.label;
    setExpression((current) => `${current}${token}`);
  };

  const handleDelete = () => {
    setExpression((current) => current.slice(0, -1));
  };

  const handleSolve = () => {
    if (!expression.trim() || !isLikelyMathExpression(expression)) {
      setErrorMessage("សមីការមិនត្រឹមត្រូវ សូមពិនិត្យឡើងវិញ");
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
              <div className="border-b border-green-100/80 bg-gradient-to-br from-green-50 via-white to-white px-4 py-4">
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
                <label className="green-soft-glow flex items-center gap-2.5 rounded-full border border-slate-100 bg-white/95 px-4 py-3 transition focus-within:border-green-200 focus-within:shadow-[0_0_0_4px_rgba(220,252,231,0.9)] focus-within:ring-2 focus-within:ring-green-500/20">
                  <Search className="h-4.5 w-4.5 text-slate-400" />
                  <input
                    value={expression}
                    onChange={(event) => setExpression(event.target.value)}
                    onFocus={() => setIsInputReady(true)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-sm leading-relaxed text-brand-ink outline-none placeholder:text-slate-400 focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-green-100 bg-green-50 text-green-700 transition hover:bg-green-100 hover:text-green-800"
                    aria-label="Scan with camera"
                  >
                    <Camera className="h-4.5 w-4.5" />
                  </button>
                </label>
              </div>
            </div>

            {!isInputReady && (
              <button
                type="button"
                onClick={() => setIsInputReady(true)}
                className="premium-card flex w-full items-center justify-center gap-2 rounded-3xl border border-green-100 bg-white/95 px-4 py-3 text-sm font-medium text-green-700 transition hover:bg-green-50"
              >
                <PencilLine className="h-4 w-4" />
                <span>ចាប់ផ្តើមបញ្ចូលសំណួរ</span>
              </button>
            )}
          </section>

          {isLoadingSuggestions && (
            <div className="premium-card mt-6 rounded-3xl border border-green-100/80 bg-white/90 p-5 text-sm text-slate-600">
              កំពុងផ្ទុកទិន្នន័យ...
            </div>
          )}

          {!isLoadingSuggestions && errorMessage && (
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: [0, -10, 10, -8, 8, 0] }}
              transition={{ duration: 0.35 }}
              className="mt-6 rounded-3xl border border-red-200 bg-red-50/90 p-5 text-sm text-red-700 shadow-[0_10px_24px_rgba(239,68,68,0.08)]"
            >
              {errorMessage}
            </motion.div>
          )}

          {!isLoadingSuggestions && formulaSuggestions.length > 0 && (
            <div className="premium-card mt-6 rounded-3xl border border-green-100/80 bg-green-50/80 p-4 text-sm leading-relaxed text-slate-600">
              <>
                ឧទាហរណ៍រូបមន្តពីមូលដ្ឋានទិន្នន័យ៖{" "}
                <span className="font-medium text-slate-900">
                  {formulaSuggestions[0].title_kh}
                </span>
              </>
            </div>
          )}
        </main>

        {isInputReady && (
          <MathKeyboard
            onKeyPress={handleKeyboardPress}
            onDelete={handleDelete}
            onSolve={handleSolve}
          />
        )}

        <UploadPhoto
          open={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onScanComplete={(result) => {
            navigate(`/solution?expression=${encodeURIComponent(result.question_text || result.expression)}`, {
              state: {
                prefetchedSolution: result
              }
            });
          }}
        />
      </div>
    </motion.div>
  );
};

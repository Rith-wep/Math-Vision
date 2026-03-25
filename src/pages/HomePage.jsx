import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, BookOpenText, Calculator, Camera, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ScanHeader } from "../components/ScanHeader.jsx";
import { UploadPhoto } from "../components/UploadPhoto.jsx";

const homeCards = [
  {
    id: "solve",
    title: "Solve Problem",
    subtitle: "ដោះស្រាយសមីការ និងលំហាត់គណិតវិទ្យា",
    icon: Calculator,
    accent: "from-green-500 to-emerald-500",
    actionLabel: "Open Solver",
    to: "/solve"
  },
  {
    id: "docs",
    title: "Document Library",
    subtitle: "ស្វែងរករូបមន្ត មេរៀន និងឯកសារសិក្សា",
    icon: BookOpenText,
    accent: "from-emerald-500 to-lime-500",
    actionLabel: "Browse Docs",
    to: "/docs"
  },
  {
    id: "quiz",
    title: "Quiz Practice",
    subtitle: "ហាត់សំណួរ QCM និងវាស់កម្រិតចំណេះដឹងគណិតវិទ្យា",
    icon: BookOpenCheck,
    accent: "from-emerald-500 to-green-600",
    actionLabel: "Open Quiz",
    to: "/qcm"
  },
  {
    id: "scan",
    title: "Quick Scan",
    subtitle: "ថតរូបលំហាត់ ហើយបញ្ជូនទៅ AI ដើម្បីដោះស្រាយ",
    icon: Camera,
    accent: "from-green-400 to-green-600",
    actionLabel: "Scan Now"
  }
];

const heroSymbols = {
  sigma: "\u2211",
  integral: "\u222b",
  pi: "\u03c0",
  root: "\u221a",
  delta: "\u0394",
  infinity: "\u221e",
  partial: "\u2202",
  approx: "\u2248",
  theta: "\u03b8",
  minus: "\u2212",
  times: "\u00d7",
  divide: "\u00f7",
  xSquared: "x\u00b2"
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleCardClick = (card) => {
    if (card.id === "scan") {
      setIsUploadOpen(true);
      return;
    }

    navigate(card.to);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-green-50 via-white to-slate-50 text-brand-ink"
    >
      <div className="app-shell-page mx-auto flex min-h-screen flex-col bg-white">
        <ScanHeader />

        <main className="flex-1 px-4 py-4 md:px-5 lg:px-6">
          <section className="premium-surface relative overflow-hidden rounded-[2rem] border border-green-100/80 bg-gradient-to-br from-white via-white to-green-50 px-7 py-6">

            {/* GLASS OVERLAY */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-white/50 to-green-50/60 backdrop-blur-[1px]" />

            {/* CONTENT */}
            <div className="relative">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white/90 px-3 py-1 text-[10px] font-medium text-green-700 shadow-[0_0_18px_rgba(34,197,94,0.15)] animate-pulse">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                AI Learning Hub
              </div>

              {/* Title */}
              <h1 className="mt-3 max-w-[14ch] text-2xl sm:text-4xl font-bold leading-relaxed text-[#14532d]">
                រៀនគណិតវិទ្យាកាន់តែងាយស្រួល
              </h1>

              {/* Description */}
              <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-slate-600">
                ស្វែងរកដំណោះស្រាយលំហាត់ និងធនធានសិក្សាសម្បូរបែបជាមួយ{" "}
                <span className="italic underline decoration-green-300 decoration-2 underline-offset-4">
                  Math-Vision
                </span>
                ។
              </p>

            </div>
          </section>

          <section className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {homeCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.08 * index, ease: "easeOut" }}
                  whileTap={{ scale: 0.98 }}
                  className="premium-card w-full rounded-[2rem] border border-green-100/80 bg-white/95 p-3 text-left transition hover:-translate-y-[1px] hover:border-green-200 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`green-soft-glow flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-gradient-to-br ${card.accent} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-[1.05rem] font-semibold text-slate-800">{card.title}</h2>
                          <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">
                            {card.subtitle}
                          </p>
                        </div>

                        <ChevronRight className="mt-0.5 h-4.5 w-4.5 text-slate-300" />
                      </div>

                      <div className="mt-2 inline-flex items-center rounded-full border border-green-100 bg-green-50/80 px-3 py-1 text-[11px] font-medium text-green-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        {card.actionLabel}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </section>
        </main>

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

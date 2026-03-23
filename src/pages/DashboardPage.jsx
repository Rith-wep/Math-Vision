import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Quote, TrendingUp, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ScanHeader } from "../components/ScanHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formulaService } from "../services/formulaService.js";

const motivationQuotes = [
  "Mathematics is the music of reason.",
  "Small progress in math becomes big confidence over time.",
  "Every solved problem trains a stronger mind.",
  "Clarity comes one step at a time.",
  "Practice turns difficult formulas into familiar patterns.",
  "Each equation you solve builds real skill.",
  "Consistency is the secret behind math mastery."
];

const buildWeeklyActivity = (weeklySolved) => {
  const total = Math.max(Number(weeklySolved) || 0, 0);
  const basePattern = [1, 2, 3, 2, 4, 3, 5];
  const sum = basePattern.reduce((value, item) => value + item, 0);
  const scaled = basePattern.map((item) => Math.round((item / sum) * total));
  const currentTotal = scaled.reduce((value, item) => value + item, 0);

  if (total > 0 && currentTotal === 0) {
    scaled[scaled.length - 1] = total;
  } else if (currentTotal !== total) {
    scaled[scaled.length - 1] += total - currentTotal;
  }

  return scaled;
};

const buildLinePath = (values) => {
  const maxValue = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x = 24 + index * 48;
      const y = 120 - (value / maxValue) * 72;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSolved: 0,
    weeklySolved: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await formulaService.getDashboardStats();
        setStats(response);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const quoteOfDay = useMemo(() => {
    const dayIndex = new Date().getDate() % motivationQuotes.length;
    return motivationQuotes[dayIndex];
  }, []);

  const weeklyActivity = useMemo(
    () => buildWeeklyActivity(stats.weeklySolved),
    [stats.weeklySolved]
  );

  const activityPath = useMemo(() => buildLinePath(weeklyActivity), [weeklyActivity]);
  const displayName = user?.displayName || "Hong Sovannarith";
  const avatarUrl =
    user?.avatar ||
    "https://ui-avatars.com/api/?name=Math+Vision&background=dcfce7&color=166534";

  const statCards = [
    {
      id: "total",
      label: "Total Problems",
      value: isLoading ? "--" : stats.totalSolved,
      icon: Trophy,
      subtitle: "All-time solved by Math Vision"
    },
    {
      id: "weekly",
      label: "Weekly Solved",
      value: isLoading ? "--" : stats.weeklySolved,
      icon: TrendingUp,
      subtitle: "Your current 7-day momentum"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(220,252,231,0.9),_transparent_40%),linear-gradient(to_bottom,_#f0fdf4,_#ffffff_38%,_#f8fafc)]"
    >
      <div className="app-shell-page mx-auto min-h-screen bg-white">
        <ScanHeader />

        <main className="px-4 py-5 md:px-5 lg:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-100/90 bg-white/95 px-3 py-2 text-sm font-medium text-green-700 shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>

          <section className="relative overflow-hidden rounded-[2rem] border border-green-100/80 bg-gradient-to-r from-white via-white to-green-50 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-100/40 blur-2xl" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-green-50/70 to-transparent" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">
                  រីករាយដែលបានជួបអ្នកវិញ!
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h1 className="text-[1.72rem] font-black leading-tight tracking-tight text-slate-900">
                    {displayName}
                  </h1>
                  <div className="inline-flex items-center gap-1 rounded-full border border-green-100 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-green-700 shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    <span>Pro</span>
                  </div>
                </div>

                <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-slate-500">
                  ថ្ងៃនេះគឺជាថ្ងៃដ៏ល្អសម្រាប់ពង្រឹងចំណេះដឹងគណិតវិទ្យា។
                </p>
              </div>

              <div className="shrink-0 rounded-full bg-white/90 p-1.5 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <div className="rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 p-[2px]">
                  <div className="rounded-full bg-white p-[2px]">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-14 w-14 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-2 gap-3">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.id}
                  className="relative overflow-hidden rounded-[1.75rem] border border-slate-100/80 bg-white/95 p-4 shadow-[0_18px_35px_rgba(15,23,42,0.05)]"
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-green-50/80 blur-2xl" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                        {card.label}
                      </p>
                      <p className="mt-3 bg-gradient-to-br from-green-500 to-green-700 bg-clip-text text-[2.6rem] font-black leading-none text-transparent">
                        {card.value}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-gradient-to-br from-white to-green-50 shadow-sm backdrop-blur-md">
                      <Icon className="h-5 w-5 text-green-700" />
                    </div>
                  </div>

                  <p className="mt-4 max-w-[12rem] text-xs leading-relaxed text-slate-500">
                    {card.subtitle}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="mt-4 rounded-[1.75rem] border border-slate-100/80 bg-white/95 p-4 shadow-[0_18px_35px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-green-900">Weekly Activity</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Your last 7 days of math solving progress.
                </p>
              </div>
              <div className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                {isLoading ? "--" : `${stats.weeklySolved} solved`}
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-3xl border border-green-100/70 bg-gradient-to-b from-green-50 via-white to-white p-3">
              <svg
                viewBox="0 0 336 140"
                className="h-40 w-full"
                role="img"
                aria-label="Weekly activity chart"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <line
                    key={`grid-${index}`}
                    x1="16"
                    y1={24 + index * 24}
                    x2="320"
                    y2={24 + index * 24}
                    stroke="#dcfce7"
                    strokeWidth="1"
                  />
                ))}

                <path
                  d={`${activityPath} L 312 120 L 24 120 Z`}
                  fill="url(#activityFill)"
                  opacity="0.35"
                />
                <path
                  d={activityPath}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {weeklyActivity.map((value, index) => {
                  const maxValue = Math.max(...weeklyActivity, 1);
                  const x = 24 + index * 48;
                  const y = 120 - (value / maxValue) * 72;

                  return (
                    <g key={`point-${index}`}>
                      <circle cx={x} cy={y} r="5" fill="#22c55e" />
                      <circle cx={x} cy={y} r="10" fill="#22c55e" opacity="0.12" />
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="mt-2 grid grid-cols-7 text-center text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-[1.75rem] border border-slate-100/80 bg-gradient-to-br from-white via-green-50 to-white p-4 shadow-[0_18px_35px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white text-green-700 shadow-sm">
                <Quote className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-green-900">Motivation Quote</h2>
                <p className="text-xs text-slate-400">Changes daily</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">"{quoteOfDay}"</p>
          </section>
        </main>
      </div>
    </motion.div>
  );
};

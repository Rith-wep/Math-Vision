import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ScanSearch, Sigma } from "lucide-react";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { BottomNavigation } from "./components/BottomNavigation.jsx";
import { DocsPage } from "./pages/DocsPage.jsx";
import { AuthCallbackPage } from "./pages/AuthCallbackPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { HistoryPage } from "./pages/HistoryPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { QcmPage } from "./pages/QcmPage.jsx";
import { SolvePage } from "./pages/SolvePage.jsx";
import { SolutionPage } from "./pages/SolutionPage.jsx";

const splashSymbols = [
  { symbol: "π", className: "left-[10%] top-[16%] text-5xl md:text-6xl", duration: 8.5, delay: 0.2 },
  { symbol: "√", className: "right-[12%] top-[20%] text-6xl md:text-7xl", duration: 9.5, delay: 0.8 },
  { symbol: "∑", className: "left-[16%] bottom-[18%] text-5xl md:text-6xl", duration: 8.8, delay: 0.4 },
  { symbol: "∫", className: "right-[16%] bottom-[15%] text-6xl md:text-7xl", duration: 10.2, delay: 1.1 }
];

const splashHighlights = [
  {
    label: "Scan",
    value: "Smart capture",
    icon: ScanSearch,
    iconBoxClassName: "bg-emerald-50 text-emerald-600"
  },
  {
    label: "Solve",
    value: "Step guidance",
    icon: Sigma,
    iconBoxClassName: "bg-blue-50 text-blue-600"
  },
  {
    label: "Learn",
    value: "Clear insight",
    icon: BookOpen,
    iconBoxClassName: "bg-purple-50 text-purple-600"
  }
];

const SplashLogo = () => {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-emerald-50">
      <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.26),_transparent_70%)]" />
      <svg
        viewBox="0 0 96 96"
        className="relative h-16 w-16 drop-shadow-[0_10px_14px_rgba(34,197,94,0.18)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="splash-cube-top" x1="18" y1="18" x2="48" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="splash-cube-left" x1="18" y1="40" x2="48" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="splash-cube-right" x1="48" y1="40" x2="78" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
        </defs>

        <path d="M48 16 76 30 48 44 20 30 48 16Z" fill="url(#splash-cube-top)" />
        <path d="M20 30 48 44V76L20 60V30Z" fill="url(#splash-cube-left)" />
        <path d="M76 30 48 44V76l28-16V30Z" fill="url(#splash-cube-right)" />
        <path
          d="M38 34.5 45.5 42 60 26.5"
          stroke="#ffffff"
          strokeWidth="4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return null;
};

const App = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const shouldShowBottomNav = !["/login", "/auth/callback"].includes(location.pathname);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (showSplash) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-6 sm:px-6"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50 sm:bg-[size:72px_72px]" />
        <div className="absolute left-1/2 top-[-8rem] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-emerald-100/80 blur-3xl sm:top-[-10rem] sm:h-[24rem] sm:w-[24rem]" />
        <div className="absolute bottom-[-7rem] left-[-5rem] h-[14rem] w-[14rem] rounded-full bg-blue-100/60 blur-3xl sm:bottom-[-8rem] sm:left-[-6rem] sm:h-[18rem] sm:w-[18rem]" />
        <div className="absolute right-[-5rem] top-1/3 h-[12rem] w-[12rem] rounded-full bg-purple-100/55 blur-3xl sm:right-[-4rem] sm:h-[16rem] sm:w-[16rem]" />

        {splashSymbols.map(({ symbol, className, duration, delay }) => (
          <motion.div
            key={symbol}
            aria-hidden="true"
            className={`pointer-events-none absolute hidden select-none font-serif font-semibold text-emerald-200/60 sm:block ${className}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0.18, 0.44, 0.18], y: [0, -16, 0], x: [0, 4, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {symbol}
          </motion.div>
        ))}

        <div className="relative z-10 w-full max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white px-4 py-8 shadow-sm sm:rounded-[2rem] sm:px-6 sm:py-10 md:px-14 md:py-16"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent" />
            <div className="absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50/80 blur-3xl sm:h-32 sm:w-32" />

            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              <div className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-600 shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:px-4 sm:text-[11px] sm:tracking-[0.28em]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="truncate">AI Learning Assistant</span>
              </div>

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                <motion.div
                  className="absolute inset-0 rounded-[2rem] border border-emerald-200/80"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: [1, 1.03, 1], opacity: 1 }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <SplashLogo />
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                    Math-<span className="text-[#22c55e]">Vision</span>
                  </p>
                  <p className="mx-auto max-w-lg text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:text-xs sm:tracking-[0.32em]">
                    Intelligent problem solving for modern learners
                  </p>
                </div>

                <p className="khmer-font mx-auto max-w-xl text-sm leading-7 text-slate-700 sm:text-base sm:leading-8 md:text-xl md:leading-loose">
                  ដោះស្រាយវិញ្ញាសា ដោយបញ្ញាសិប្បនិម្មិត
                </p>
              </div>

              <div className="mx-auto mt-2 grid max-w-2xl grid-cols-1 gap-3 text-left sm:mt-4 sm:grid-cols-3 sm:gap-4">
                {splashHighlights.map(({ label, value, icon: Icon, iconBoxClassName }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.2 + index * 0.12, ease: "easeOut" }}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3 shadow-sm sm:gap-4 sm:px-4 sm:py-4"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl font-bold sm:h-12 sm:w-12 ${iconBoxClassName}`}
                    >
                      <Icon size={20} strokeWidth={2.2} className="sm:h-[22px] sm:w-[22px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 sm:text-base">{value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-3 pt-1 sm:space-y-4">
                <div className="mx-auto h-1.5 w-full max-w-[14rem] overflow-hidden rounded-full bg-emerald-50 shadow-inner sm:max-w-[15rem] md:w-64 md:max-w-none">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-emerald-500 to-teal-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300 sm:text-xs sm:tracking-[0.3em]">
                  Preparing your workspace
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />
      <div className={shouldShowBottomNav ? "pb-24" : ""}>
        <Routes location={location} key={location.pathname + location.search}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/qcm" element={<QcmPage />} />
          <Route path="/solve" element={<SolvePage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/solution" element={<SolutionPage />} />
        </Routes>
      </div>
      {shouldShowBottomNav && <BottomNavigation />}
    </AnimatePresence>
  );
};

export default App;

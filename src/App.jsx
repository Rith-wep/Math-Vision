import { AnimatePresence, motion } from "framer-motion";
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
    }, 1300);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (showSplash) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="flex min-h-screen items-center justify-center bg-white px-6"
      >
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-3"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50 text-2xl font-black text-green-600 shadow-sm">
              MV
            </div>
            <p className="text-3xl font-black tracking-tight text-slate-900">Math Vision</p>
            <p className="text-sm leading-relaxed text-slate-500">
              បញ្ញាសិប្បនិម្មិតដោះស្រាយលំហាត់
            </p>
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

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Info, LogIn, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ButtonSpinner } from "./ButtonSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export const MathVisionLogo = () => {
  return (
    <svg
      viewBox="0 0 520 160"
      className="h-[4.25rem] w-auto shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="math-vision-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      <g transform="translate(20,20)">
        <polygon points="60,0 110,30 110,90 60,120 10,90 10,30" fill="url(#math-vision-grad)" />
        <path
          d="M40 65 L55 80 L85 40"
          stroke="#ffffff"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      <text
        x="150"
        y="85"
        fontSize="48"
        fontFamily="Inter, Arial, sans-serif"
        fontWeight="800"
        letterSpacing="-1.2"
      >
        <tspan fill="#0f172a">Math-</tspan>
        <tspan fill="#22c55e">Vision</tspan>
      </text>

      <text x="150" y="118" fontSize="24" fontFamily="Inter, Arial, sans-serif" fill="#475569">
        AI-powered math solving
      </text>
    </svg>
  );
};

export const ScanHeader = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const { isAuthenticated, isAuthLoading, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const hasProfileUpdate = true;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    let previousScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 12) {
        setIsHeaderHidden(false);
        previousScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > previousScrollY + 8) {
        setIsHeaderHidden(true);
      } else if (currentScrollY < previousScrollY - 8) {
        setIsHeaderHidden(false);
      }

      previousScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-[70] border-b border-white/70 bg-white/88 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-transform duration-300 ease-out ${
        isHeaderHidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="app-shell mx-auto flex items-center justify-between px-4 py-2 md:px-5">
        <div className="flex items-center">
          <MathVisionLogo />
        </div>

        {isAuthenticated && user ? (
          <div ref={menuRef} className="relative z-[80]">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-1.5 py-1 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-emerald-200 hover:bg-slate-50"
              aria-label="Open account menu"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="h-9 w-9 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {hasProfileUpdate && (
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border border-white bg-green-500" />
                )}
              </div>

              <motion.span
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex items-center text-slate-500"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 z-[90] mt-3 w-44 overflow-hidden rounded-2xl border border-white/70 border-t-2 border-t-green-500 bg-white/95 p-2 shadow-[0_20px_44px_rgba(15,23,42,0.12)] backdrop-blur-md"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate("/about-us");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Info className="h-4 w-4 text-slate-400" />
                    <span>About Us</span>
                  </button>

                  <div className="my-1 border-b border-slate-100" />

                  <button
                    type="button"
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await logout();
                      navigate("/");
                    }}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            disabled={isAuthLoading}
            className="inline-flex items-center gap-2 rounded-full border border-green-700 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(34,197,94,0.24)] transition active:scale-95 hover:-translate-y-[1px] hover:from-green-700 hover:via-green-600 hover:to-emerald-600 hover:shadow-[0_16px_32px_rgba(34,197,94,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="whitespace-nowrap tracking-[0.01em]">
              Login
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              {isAuthLoading ? (
                <ButtonSpinner className="h-3.5 w-3.5 text-white" />
              ) : (
                <LogIn className="h-4 w-4 text-white" />
              )}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};

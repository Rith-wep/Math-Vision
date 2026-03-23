import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Camera,
  Clock3,
  Home,
  UserRound
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { UploadPhoto } from "./UploadPhoto.jsx";

const navItems = [
  {
    id: "home",
    label: "ទំព័រដើម",
    icon: Home,
    to: "/"
  },
  {
    id: "practice",
    label: "អនុវត្ត",
    icon: BookOpenCheck,
    to: "/qcm"
  },
  {
    id: "history",
    label: "ប្រវត្តិ",
    icon: Clock3,
    to: "/history"
  },
  {
    id: "profile",
    label: "ប្រវត្តិរូប",
    icon: UserRound,
    to: "/dashboard"
  }
];

const isItemActive = (pathname, to) => {
  if (to === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(to);
};

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
        <div className="app-shell w-full pointer-events-auto">
          <div className="relative h-20 rounded-[2rem] border border-slate-200/80 bg-white/80 px-5 backdrop-blur-md shadow-[0_-10px_30px_rgba(15,23,42,0.08)]">
            <div className="flex h-full items-center justify-between">
              <div className="flex flex-1 items-center justify-start gap-1">
                {navItems.slice(0, 2).map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(location.pathname, item.to);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-center"
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? "text-emerald-500" : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-medium leading-none ${
                          isActive ? "text-emerald-500" : "text-slate-400"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex w-[5.5rem] items-center justify-center">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-[-2.2rem] flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_18px_36px_rgba(16,185,129,0.35)] ring-8 ring-white/90"
                  aria-label="Scan math problem"
                >
                  <Camera className="h-7 w-7" />
                </motion.button>
              </div>

              <div className="flex flex-1 items-center justify-end gap-1">
                {navItems.slice(2).map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(location.pathname, item.to);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 text-center"
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? "text-emerald-500" : "text-slate-400"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-medium leading-none ${
                          isActive ? "text-emerald-500" : "text-slate-400"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </>
  );
};

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, FileDown, Infinity, ListChecks, QrCode, Sparkles, X } from "lucide-react";

const khmerFontStyle = {
  fontFamily: '"Koh Santepheap", "Kantumruy Pro", sans-serif'
};

const latinFontStyle = {
  fontFamily: '"Inter", sans-serif'
};

const springTransition = {
  type: "spring",
  stiffness: 360,
  damping: 28
};

const featureHighlights = [
  {
    icon: Infinity,
    title: "ស្កេន និងដោះស្រាយមិនកំណត់",
    subtitle: "Unlimited Solves"
  },
  {
    icon: ListChecks,
    title: "ការពន្យល់លម្អិតគ្រប់ជំហាន",
    subtitle: "Step-by-step Explanations"
  },
  {
    icon: FileDown,
    title: "ទាញយកឯកសារមេរៀនជា PDF",
    subtitle: "PDF Downloads"
  }
];

const planOptions = [
  {
    id: "1_month",
    label: "១ ខែ",
    price: "$2.99 / ខែ",
    note: "បង់ប្រាក់ម្ដង ប្រើបានពេញមួយខែ"
  },
  {
    id: "6_months",
    label: "៦ ខែ",
    price: "$14.99 / ៦ ខែ",
    note: "ស្មើនឹងត្រឹមតែ $2.50 / ខែ",
    offer: "OFFER -15%"
  }
];

export const isSubscriptionLimitError = (error) => {
  const status = error?.response?.status;
  const message = String(error?.response?.data?.message || error?.message || "");

  return status === 403 && message.includes("Limit reached");
};

export const SubscriptionModal = ({ open, onClose }) => {
  const [screen, setScreen] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState("6_months");

  useEffect(() => {
    if (open) {
      setScreen("plans");
      setSelectedPlan("6_months");
    }
  }, [open]);

  const activePlan = planOptions.find((plan) => plan.id === selectedPlan) || planOptions[1];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-3 py-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 14 }}
            transition={springTransition}
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span style={latinFontStyle}>Math Vision Pro</span>
                </div>
                <h2 className="mt-2 text-lg font-black leading-snug text-slate-900 sm:text-xl" style={khmerFontStyle}>
                  {screen === "plans" ? "ដំឡើងទៅកាន់គម្រោង Pro" : "ABA KHQR Payment"}
                </h2>
                <p className={`${screen === "plans" ? "hidden" : "mt-1"} text-[13px] leading-relaxed text-slate-500 sm:text-sm`} style={screen === "plans" ? khmerFontStyle : latinFontStyle}>
                  {screen === "plans"
                    ? "ដោះសោសមត្ថភាព AI ពេញលេញ ដើម្បីជួយអ្នកឱ្យរៀនពូកែជាងគេ!"
                    : "Scan the KHQR, complete the payment, then send the screenshot to admin for activation."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close subscription modal"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {screen === "plans" ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-[1.6rem] border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/70 to-white p-3.5 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_18px_45px_rgba(16,185,129,0.10)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className="inline-flex items-center rounded-full bg-[#22c55e] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                        style={latinFontStyle}
                      >
                        Pro Plan
                      </div>
                      <p className="mt-2 text-lg font-black text-emerald-700 sm:text-xl" style={latinFontStyle}>
                        {activePlan.id === "1_month" ? "$2.99 / mo" : "$14.99 / 6 mo"}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-emerald-800/80 sm:text-sm" style={khmerFontStyle}>
                        {activePlan.id === "6_months"
                          ? "ស្មើនឹងត្រឹមតែ $2.50 / ខែ"
                          : "បង់ប្រាក់ម្ដង ប្រើបានពេញមួយខែ"}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.10)]">
                      <Crown className="h-3.5 w-3.5" />
                      <span style={latinFontStyle}>Popular</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2.5">
                    {planOptions.map((plan) => {
                      const isSelected = selectedPlan === plan.id;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`relative rounded-[1.25rem] border px-3 py-2.5 text-left transition ${
                            isSelected
                              ? "border-[2px] border-emerald-500 bg-emerald-50/90 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.16),0_0_18px_rgba(16,185,129,0.10)]"
                              : "border-emerald-100/80 bg-white/80 hover:border-emerald-200 hover:bg-emerald-50/40"
                          }`}
                        >
                          {plan.offer ? (
                            <span
                              className="absolute right-2.5 top-2.5 rounded-full bg-amber-400 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-white shadow-[0_8px_18px_rgba(251,191,36,0.24)]"
                              style={latinFontStyle}
                            >
                              {plan.offer}
                            </span>
                          ) : null}

                          <p className="text-[13px] font-black text-slate-900 sm:text-sm" style={khmerFontStyle}>
                            {plan.label}
                          </p>
                          <p className="mt-1.5 text-[15px] font-black text-emerald-700 sm:text-base" style={latinFontStyle}>
                            {plan.price}
                          </p>
                          <p className="mt-1  text-[10px] leading-relaxed text-emerald-800/80 sm:pr-20 sm:text-[11px]" style={khmerFontStyle}>
                            {plan.note}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 grid gap-2.5">
                    {featureHighlights.map((feature) => {
                      const Icon = feature.icon;

                      return (
                        <div
                          key={feature.title}
                          className="flex items-start gap-2.5 rounded-[1.15rem] border border-emerald-100/80 bg-white/80 px-3 py-2.5"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold leading-snug text-slate-800 sm:text-sm" style={khmerFontStyle}>
                              {feature.title}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-emerald-700" style={latinFontStyle}>
                              {feature.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.18 }}
                  className="px-1 text-center text-[13px] leading-relaxed text-slate-600"
                  style={khmerFontStyle}
                >
                  ☕ ត្រឹមតែកាហ្វេមួយកែវ ប៉ុណ្ណោះក្នុងមួយខែ ដើម្បីទទួលបានសមត្ថភាពពេញលេញពី{" "}
                  <span className="font-bold text-emerald-600" style={latinFontStyle}>
                    Math Vision Pro
                  </span>
                  ។
                </motion.p>

                <div className="mt-1 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    style={latinFontStyle}
                  >
                    Maybe Later
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen("payment")}
                    className="upgrade-shimmer relative overflow-hidden rounded-2xl bg-[#22c55e] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(34,197,94,0.22)] transition hover:bg-[#16a34a]"
                    style={latinFontStyle}
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-[0_20px_40px_rgba(16,185,129,0.10)]">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <QrCode className="h-8 w-8" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-emerald-800" style={latinFontStyle}>ABA KHQR Placeholder</p>
                    <p className="mt-1 text-xs text-slate-500" style={latinFontStyle}>Replace with your real KHQR image</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm leading-relaxed text-slate-600" style={latinFontStyle}>
                  1. Scan the KHQR with ABA or your banking app.
                  <br />
                  2. Complete the payment.
                  <br />
                  3. Send the payment screenshot to admin to activate Pro.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScreen("plans")}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    style={latinFontStyle}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl bg-[#22c55e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#16a34a]"
                    style={latinFontStyle}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

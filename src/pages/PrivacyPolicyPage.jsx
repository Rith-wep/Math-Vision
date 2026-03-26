import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ScanHeader } from "../components/ScanHeader.jsx";

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100"
    >
      <div className="app-shell-page mx-auto flex min-h-screen flex-col bg-white">
        <ScanHeader />

        <main className="flex-1 px-4 py-5 md:px-5 lg:px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm transition hover:border-green-200 hover:text-green-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <section className="rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Privacy Policy</span>
            </div>

            <h1 className="mt-4 text-xl font-bold text-slate-900">គោលការណ៍ឯកជនភាព</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              យើងរក្សាទុកតែឈ្មោះ និងរូបភាព Profile ពី Google របស់អ្នក ដើម្បីសម្គាល់គណនីប្រើប្រាស់ប៉ុណ្ណោះ។
              រាល់លំហាត់ដែលបានដោះស្រាយ នឹងត្រូវរក្សាទុកក្នុងបណ្ណាល័យសកលដោយអនាមិក
              ដើម្បីជាប្រយោជន៍ដល់ការសិក្សារួម ដោយមិនមានការចែករំលែកទិន្នន័យផ្ទាល់ខ្លួនទៅកាន់ភាគីទីបីឡើយ។
            </p>
          </section>
        </main>
      </div>
    </motion.div>
  );
};

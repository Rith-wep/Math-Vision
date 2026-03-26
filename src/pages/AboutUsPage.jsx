import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpenCheck,
  BrainCircuit,
  Cpu,
  GraduationCap,
  LibraryBig,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { ScanHeader } from "../components/ScanHeader.jsx";

const BrandMark = () => {
  return (
    <svg width="160" height="180" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="55%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>

      
      <polygon points="80,5 145,45 145,125 80,165 15,125 15,45"
              fill="url(#grad)"/>

      
      <path d="M55 95 L75 115 L115 60"
            stroke="#ffffff"
            stroke-width="10"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"/>
    </svg>
  );
};

const featureCards = [
  {
    id: "instant-solutions",
    title: "ដំណោះស្រាយឆ្លាតវៃ (Smart Solutions)",
    icon: Sparkles,
    body:
      "Math-Vision ប្រើប្រាស់បច្ចេកវិទ្យាគណនាជាន់ខ្ពស់ ដើម្បីបកស្រាយលំហាត់គណិតវិទ្យាភ្លាមៗ ជាមួយជំហានពន្យល់ច្បាស់លាស់ និងត្រឹមត្រូវបំផុត។"
  },
  {
    id: "smart-library",
    title: "បណ្ណាល័យចំណេះដឹង (Knowledge Hub)",
    icon: LibraryBig,
    body:
      "ប្រព័ន្ធផ្ទុកទិន្នន័យសកលដែលចងក្រងរាល់ដំណោះស្រាយសំខាន់ៗ ជួយឱ្យលោកអ្នកស្វែងរកចម្លើយនៃវិញ្ញាសាផ្សេងៗបានយ៉ាងឆាប់រហ័ស និងសន្សំពេលវេលា។"
  },
  {
    id: "expert-guidance",
    title: "ការណែនាំតាមស្តង់ដារ (Expert Guidance)",
    icon: BrainCircuit,
    body:
      "រាល់ចម្លើយត្រូវបានរៀបចំឡើងតាមលំដាប់លំដោយ និងតាមបច្ចេកទេសដោះស្រាយដែលងាយយល់បំផុត ស្របតាមស្តង់ដារអប់រំនៅកម្ពុជា។"
  }
];

export const AboutUsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.location.hash) {
      return;
    }

    const targetId = window.location.hash.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      return;
    }

    window.requestAnimationFrame(() => {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#22c55e]"
    >
      <div className="mx-auto min-h-screen max-w-2xl bg-white shadow-xl shadow-slate-200/50">
        <ScanHeader />

        <main className="px-5 py-6">
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="mb-8 inline-flex items-center border border-green-500 shadow-md px-4 rounded-full text-green-500 py-2 gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </motion.button>

          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-400 via-[#22c55e] to-green-500 px-6 py-6 text-white shadow-[0_22px_50px_rgba(34,197,94,0.20)] sm:px-8 sm:py-8">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/14 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-50 backdrop-blur-md">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>អំពី Math-Vision</span>
              </div>

              <h1 className="mt-5 max-w-md text-[1.45rem] font-black leading-tight tracking-tight text-white sm:text-[2.35rem]">
                បង្កើនសមត្ថភាព
                <br />
                គណិតវិទ្យាជាមួយ Math-Vision
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-7 text-emerald-50/90 sm:text-[15px]">
                ជំនួយការឆ្លាតវៃ ដើម្បីភាពជោគជ័យផ្នែកគណិតវិទ្យា។
              </p>
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(110,231,183,0.22),transparent_32%)]" />
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border border-white/10 bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-6 h-20 w-20 rounded-full border border-white/10 bg-white/5" />
          </section>

          <div className="mt-10 space-y-5">
            <h3 className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              មុខងារលេចធ្លោ (Key Features)
            </h3>
            {featureCards.map(({ id, title, icon: Icon, body }, index) => (
              <motion.article
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-[#22c55e]/20 hover:shadow-md hover:shadow-[#22c55e]/10"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#22c55e]/10 text-[#22c55e] transition-colors duration-300 group-hover:bg-[#22c55e] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    {id === "instant-solutions" ? (
                      <h2 className="space-y-0.5">
                        <span className="block text-base font-bold text-slate-900">
                          {title.replace(" (Smart Solutions)", "")}
                        </span>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-mono text-emerald-600 sm:text-sm">
                          <Cpu className="h-3 w-3 opacity-70 sm:h-3.5 sm:w-3.5" />
                          <span>Smart Solutions</span>
                        </span>
                      </h2>
                    ) : id === "smart-library" ? (
                      <h2 className="space-y-0.5">
                        <span className="block text-base font-bold text-slate-900">
                          {title.replace(" (Knowledge Hub)", "")}
                        </span>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-mono text-emerald-600 sm:text-sm">
                          <BookOpenCheck className="h-3 w-3 opacity-70 sm:h-3.5 sm:w-3.5" />
                          <span>Knowledge Hub</span>
                        </span>
                      </h2>
                    ) : id === "expert-guidance" ? (
                      <h2 className="space-y-0.5">
                        <span className="block text-base font-bold text-slate-900">
                          {title.replace(" (Expert Guidance)", "")}
                        </span>
                        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-mono text-emerald-600 sm:text-sm">
                          <BrainCircuit className="h-3 w-3 opacity-70 sm:h-3.5 sm:w-3.5" />
                          <span>Expert Guidance</span>
                        </span>
                      </h2>
                    ) : (
                      <h2 className="text-base font-bold text-slate-900">{title}</h2>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <section className="mt-12 rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
            <div className="mb-6 flex items-center gap-2 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                ការប្តេជ្ញាចិត្តរបស់យើង
              </span>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex pt-1 h-20 w-20 items-center justify-center overflow-hidden rounded-[1.35rem] bg-white shadow-inner ring-1 ring-[#22c55e]/20">
                  <div className="flex h-full w-full items-center justify-center bg-white">
                    <BrandMark />
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900">Math-Vision</h4>
                <p className="text-[11px] text-slate-400">Founder & Lead Developer</p>
                <p className="mt-3 text-[13px] italic leading-relaxed text-slate-600">
                  "យើងប្តេជ្ញាចិត្តជួយសិស្សកម្ពុជាគ្រប់រូប ឱ្យជោគជ័យក្នុងការសិក្សាគណិតវិទ្យា
                  តាមរយៈការផ្តល់នូវឧបករណ៍សិក្សាដ៏មានប្រសិទ្ធភាពបំផុត។"
                </p>
              </div>
            </div>
          </section>

          <section id="privacy" className="mt-8 scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <h4 className="text-xs font-semibold text-slate-700">🛡️ Privacy Policy (គោលការណ៍ឯកជនភាព)</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              "យើងរក្សាទុកតែឈ្មោះ និងរូបភាព Profile ពី Google របស់អ្នក ដើម្បីសម្គាល់គណនីប្រើប្រាស់ប៉ុណ្ណោះ។ រាល់លំហាត់ដែលបានដោះស្រាយ នឹងត្រូវរក្សាទុកក្នុងបណ្ណាល័យសកលដោយអនាមិក ដើម្បីជាប្រយោជន៍ដល់ការសិក្សារួម ដោយមិនមានការចែករំលែកទិន្នន័យផ្ទាល់ខ្លួនទៅកាន់ភាគីទីបីឡើយ។"
            </p>
          </section>

          <section id="terms" className="mt-4 scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <h4 className="text-xs font-semibold text-slate-700">⚖️ Terms of Service (លក្ខខណ្ឌប្រើប្រាស់)</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              "ខ្លឹមសារ និងដំណោះស្រាយក្នុង Math Vision គឺសម្រាប់ជាជំនួយដល់ការសិក្សាអប់រំតែប៉ុណ្ណោះ។ អ្នកប្រើប្រាស់ត្រូវបានលើកទឹកចិត្តឱ្យផ្ទៀងផ្ទាត់ចម្លើយបន្ថែមជាមួយសៀវភៅពុម្ព ឬគ្រូបង្រៀន។ ការប្រើប្រាស់កម្មវិធីនេះ មានន័យថាអ្នកយល់ព្រមតាមលក្ខខណ្ឌអប់រំ និងសុវត្ថិភាពប្រព័ន្ធរបស់យើង។"
            </p>
          </section>

          <footer className="mt-12 text-center">
            <p className="text-[10px] font-medium text-slate-400">
              © 2026 Math-Vision. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
    </motion.div>
  );
};

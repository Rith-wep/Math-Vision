import { useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      d="M21.805 12.23c0-.73-.065-1.433-.186-2.108H12v3.99h5.498a4.704 4.704 0 0 1-2.038 3.086v2.565h3.297c1.93-1.777 3.048-4.398 3.048-7.533Z"
      fill="#4285F4"
    />
    <path
      d="M12 22c2.76 0 5.074-.915 6.765-2.476l-3.297-2.565c-.914.613-2.084.975-3.468.975-2.664 0-4.923-1.798-5.73-4.214H2.86v2.646A10 10 0 0 0 12 22Z"
      fill="#34A853"
    />
    <path
      d="M6.27 13.72A5.996 5.996 0 0 1 5.95 12c0-.598.108-1.177.3-1.72V7.634H2.86A10 10 0 0 0 2 12c0 1.61.385 3.135 1.065 4.366l3.205-2.646Z"
      fill="#FBBC05"
    />
    <path
      d="M12 6.065c1.502 0 2.85.517 3.912 1.534l2.934-2.934C17.07 3.01 14.757 2 12 2A10 10 0 0 0 3.065 7.634L6.27 10.28c.804-2.42 3.063-4.215 5.73-4.215Z"
      fill="#EA4335"
    />
  </svg>
);

const MathVisionCube = () => (
  <svg
    viewBox="0 0 100 100"
    className="h-16 w-16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <filter id="login-cube-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <g filter="url(#login-cube-glow)">
      <path d="M50 20L80 35L50 50L20 35L50 20Z" fill="#4ade80" fillOpacity="0.9" />
      <path d="M80 35V65L50 80V50L80 35Z" fill="#166534" />
      <path d="M20 35V65L50 80V50L20 35Z" fill="#15803d" />
      <path
        d="M50 20L80 35L50 50L20 35L50 20Z"
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />
      <path
        d="M50 80V50M20 35L50 50L80 35"
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
    </g>

    <path
      d="M42 45L47 50L55 35"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

const getPasswordStrength = (value) => {
  if (!value) {
    return { width: "0%", color: "bg-slate-200", label: "" };
  }

  if (value.length < 6) {
    return { width: "33%", color: "bg-red-400", label: "Weak" };
  }

  if (value.length < 10) {
    return { width: "66%", color: "bg-amber-400", label: "Medium" };
  }

  return { width: "100%", color: "bg-emerald-500", label: "Strong" };
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const {
    loginWithGoogle,
    loginWithPassword,
    registerWithPassword,
    isAuthLoading
  } = useAuth();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const isSignup = mode === "signup";
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const cardTitle = isSignup ? "បង្កើតគណនីថ្មី" : "ស្វាគមន៍មកកាន់ Math Vision";
  const helperText = isSignup
    ? "ចាប់ផ្ដើមដំណើរសិក្សាជាមួយ Math Vision ថ្ងៃនេះ"
    : "ចូលប្រើប្រាស់ដើម្បីបន្តការសិក្សា";

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await registerWithPassword({
          displayName: fullName,
          email,
          password
        });
      } else {
        await loginWithPassword({
          email,
          password
        });
      }

      navigate("/");
    } catch (error) {
      const nextError = axios.isAxiosError(error)
        ? error.response?.data?.message || "Authentication failed. Please try again."
        : "Authentication failed. Please try again.";

      setFormError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(187,247,208,0.55),_transparent_38%),linear-gradient(180deg,#f0fdf4_0%,#ffffff_52%,#f8fafc_100%)] px-4 py-6"
      style={{ fontFamily: '"Kantumruy Pro", sans-serif' }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[450px] flex-col justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-green-100 bg-white/90 px-4 py-2 text-sm font-medium text-green-700 shadow-sm backdrop-blur-sm transition hover:bg-green-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-50 to-green-100 shadow-[0_14px_30px_rgba(16,185,129,0.14)]">
            <MathVisionCube />
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold leading-relaxed text-slate-900">{cardTitle}</h1>
            <p className="mb-3 mt-2 text-sm leading-relaxed text-slate-500">{helperText}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
              onSubmit={handleEmailSubmit}
              className="mt-7 space-y-3.5"
            >
              {isSignup ? (
                <label className="flex items-center gap-3 rounded-2xl border border-transparent bg-slate-50 px-4 py-3 transition focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10">
                  <UserRound className="h-4 w-4 stroke-[1.75] text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="ឈ្មោះពេញ"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>
              ) : null}

              <label className="flex items-center gap-3 rounded-2xl border border-transparent bg-slate-50 px-4 py-3 transition focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10">
                <Mail className="h-4 w-4 stroke-[1.75] text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="អ៊ីមែល"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <div>
                <label className="flex items-center gap-3 rounded-2xl border border-transparent bg-slate-50 px-4 py-3 transition focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10">
                  <LockKeyhole className="h-4 w-4 stroke-[1.75] text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="លេខសម្ងាត់"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>

                {isSignup ? (
                  <div className="mt-2 px-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <div className="mt-1 text-right text-[11px] text-slate-400">
                      {passwordStrength.label}
                    </div>
                  </div>
                ) : null}
              </div>

              {formError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || isAuthLoading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isSignup
                    ? "ចុះឈ្មោះឥឡូវនេះ"
                    : "Login"}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className={`${isSignup ? "mt-7 mb-5" : "mt-8 mb-5"} flex items-center gap-3`}>
            <div className="h-px flex-1 bg-slate-100" />
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">
              ឬ
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={isAuthLoading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-green-50 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
              <GoogleIcon />
            </span>
            <span>{isAuthLoading ? "Checking..." : "បន្តជាមួយ Google"}</span>
          </button>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isSignup ? "មានគណនីរួចហើយ?" : "មិនទាន់មានគណនីមែនទេ?"}{" "}
            <button
              type="button"
              onClick={() => setMode((current) => (current === "signup" ? "login" : "signup"))}
              className="font-semibold text-emerald-600 transition hover:text-emerald-700"
            >
              {isSignup ? "ចូលប្រើប្រាស់" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

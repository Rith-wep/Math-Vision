import { useEffect, useState } from "react";
import { Clock3, Crown, Sparkles, Unlock } from "lucide-react";

const latinFontStyle = {
  fontFamily: '"Inter", sans-serif'
};

const hasKhmerCharacters = (value) => /[\u1780-\u17FF]/.test(String(value || ""));

const formatResetCountdown = (timeLeftMs) => {
  const safeMs = Math.max(0, timeLeftMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

const getNextDailyResetMs = () => {
  const now = new Date();
  const nextReset = new Date(now);
  nextReset.setHours(24, 0, 0, 0);
  return nextReset.getTime() - now.getTime();
};

export const QuotaStatusCard = ({
  solveAccess,
  statusText,
  onUpgrade,
  showResetCountdown = true,
  className = ""
}) => {
  const [resetCountdown, setResetCountdown] = useState(() => formatResetCountdown(getNextDailyResetMs()));

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setResetCountdown(formatResetCountdown(getNextDailyResetMs()));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  if (!solveAccess) {
    return null;
  }

  return (
    <section
      className={`premium-surface rounded-[1.7rem] border border-emerald-100/90 bg-gradient-to-br from-white via-emerald-50/55 to-white p-4 shadow-[0_14px_30px_rgba(34,197,94,0.10)] ${className}`.trim()}
      style={{ fontFamily: '"Koh Santepheap", "Kantumruy Pro", sans-serif' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <div
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                solveAccess.remainingExplained === 0
                  ? "bg-amber-50/95 text-amber-700"
                  : "bg-emerald-50/95 text-emerald-700"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span style={latinFontStyle}>{`Explained left: ${solveAccess.remainingExplained}`}</span>
            </div>

            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50/95 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              <Unlock className="h-3 w-3" />
              <span style={latinFontStyle}>{`Answer-only left: ${solveAccess.remainingAnswerOnly}`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-col gap-2.5">
        <p
          className="text-xs leading-relaxed text-slate-600"
          style={hasKhmerCharacters(statusText) ? undefined : latinFontStyle}
        >
          {statusText}
        </p>

        {showResetCountdown || onUpgrade ? (
          <div className="flex items-center justify-between gap-3">
            {showResetCountdown ? (
              <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/95 px-2.5 py-1 text-[10px] font-medium text-[#16a34a]">
                <Clock3 className="h-3 w-3 shrink-0" />
                <span style={latinFontStyle}>{resetCountdown}</span>
              </div>
            ) : (
              <span />
            )}

            {onUpgrade ? (
              <button
                type="button"
                onClick={onUpgrade}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#22c55e] px-2 py-1.5 text-[10px] font-bold text-white shadow-[0_14px_30px_rgba(34,197,94,0.24)] transition hover:bg-[#16a34a]"
                style={latinFontStyle}
              >
                <Crown className="h-3 w-3" />
                <span>Upgrade</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
};

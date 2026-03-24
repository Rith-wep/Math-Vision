export const SkeletonBlock = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 ${className}`.trim()}
    aria-hidden="true"
  />
);

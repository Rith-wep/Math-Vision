export const StatCard = ({ title, value, subtitle, icon: Icon }) => {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="khmer-font text-sm font-semibold text-slate-700">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{subtitle}</p>
    </article>
  );
};

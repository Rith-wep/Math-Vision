import { BookCopy, LayoutDashboard, ListChecks, ShieldCheck, Sigma } from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  {
    to: "/admin",
    end: true,
    label: "Dashboard",
    helper: "Dashboard",
    icon: LayoutDashboard
  },
  {
    to: "/admin/qcm",
    label: "QCM Manager",
    helper: "QCM Manager",
    icon: ListChecks
  },
  {
    to: "/admin/library",
    label: "Library Manager",
    helper: "Library",
    icon: BookCopy
  },
  {
    to: "/admin/solutions",
    label: "Solution Library",
    helper: "Solver Cache",
    icon: Sigma
  }
];

export const AdminSidebar = () => {
  return (
    <aside className="flex h-full w-full flex-col bg-slate-900 text-slate-100">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Math Vision Admin</p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        {navigationItems.map(({ to, end, label, helper, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                isActive
                  ? "bg-emerald-700 text-white shadow-lg shadow-emerald-950/25"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{label}</p>
              <p className="truncate text-xs text-slate-400 group-hover:text-slate-300">{helper}</p>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

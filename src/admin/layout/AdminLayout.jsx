import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { AdminSidebar } from "../components/AdminSidebar.jsx";

const headerTitles = {
  "/admin": {
    title: "Math Vision Admin",
    description: "Review admin activity, monitor content, and manage learner-facing resources."
  },
  "/admin/qcm": {
    title: "QCM Manager",
    description: "Create, review, edit, and remove QCM questions from the admin question bank."
  },
  "/admin/library": {
    title: "Document Library",
    description: "Upload PDF resources and control which files are visible to learners."
  },
  "/admin/solutions": {
    title: "Solution Library",
    description: "Review cached solver answers and remove entries when a saved solution is wrong."
  }
};

export const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const headerContent = headerTitles[location.pathname] || headerTitles["/admin"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <div className="fixed inset-y-0 left-0 z-40 hidden w-80 xl:block">
          <AdminSidebar />
        </div>

        {isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/45 xl:hidden"
            aria-label="Close navigation"
          />
        ) : null}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 transform transition xl:hidden ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar />
        </div>

        <div className="flex min-h-screen flex-1 flex-col xl:ml-80">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm xl:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <p className="text-lg font-bold text-slate-900">{headerContent.title}</p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{headerContent.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-right sm:block">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Admin</p>
                  <p className="text-sm font-semibold text-slate-700">{user?.displayName || "Math Vision Admin"}</p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

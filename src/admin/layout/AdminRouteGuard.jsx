import { ShieldAlert } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

export const AdminRouteGuard = () => {
  const { user, isAuthLoading, isAuthenticated } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-slate-900">Checking Admin Access</h1>
          <p className="mt-2 text-sm text-slate-500">Please wait while Math Vision checks your admin access.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

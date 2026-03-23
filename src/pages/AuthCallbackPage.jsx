import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeGoogleAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token") || "";
    const serializedUser = searchParams.get("user") || "";
    const error = searchParams.get("error");

    if (error || !token || !serializedUser) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const nextUser = JSON.parse(serializedUser);
      completeGoogleAuth({ nextToken: token, nextUser });
      navigate("/", { replace: true });
    } catch (parseError) {
      navigate("/", { replace: true });
    }
  }, [completeGoogleAuth, navigate, searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen items-center justify-center bg-white px-6"
    >
      <div className="rounded-3xl border border-green-100 bg-green-50 px-5 py-4 text-center text-sm text-green-800 shadow-sm">
        Completing Google sign-in...
      </div>
    </motion.div>
  );
};

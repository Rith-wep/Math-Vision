import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { setApiAuthToken } from "../services/apiClient.js";
import { authService } from "../services/authService.js";

const AUTH_STORAGE_KEY = "math-vision-auth";

const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch (error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const persistAuth = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setApiAuthToken(nextToken);

    if (nextToken && nextUser) {
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          token: nextToken,
          user: nextUser
        })
      );
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedAuth = readStoredAuth();

      if (!storedAuth?.token || !storedAuth?.user) {
        setIsAuthLoading(false);
        return;
      }

      try {
        setApiAuthToken(storedAuth.token);
        const response = await authService.getCurrentUser(storedAuth.token);
        persistAuth(response.token || storedAuth.token, response.user);
      } catch (error) {
        persistAuth("", null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const loginWithGoogle = () => {
    window.location.href = authService.getGoogleLoginUrl();
  };

  const completeGoogleAuth = ({ nextToken, nextUser }) => {
    persistAuth(nextToken, nextUser);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      persistAuth("", null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAuthLoading,
      loginWithGoogle,
      completeGoogleAuth,
      logout
    }),
    [isAuthLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
};

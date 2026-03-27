const parseConfiguredAdminHosts = () =>
  (import.meta.env.VITE_ADMIN_HOSTS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

const configuredAdminHosts = parseConfiguredAdminHosts();

export const getCurrentOrigin = () =>
  typeof window !== "undefined" ? window.location.origin.replace(/\/$/, "") : "";

export const isAdminHost = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const currentOrigin = window.location.origin.replace(/\/$/, "").toLowerCase();
  const currentHost = window.location.hostname.toLowerCase();

  return configuredAdminHosts.includes(currentOrigin) || configuredAdminHosts.includes(currentHost);
};

export const resolveFrontendAuthCallbackUrl = () => {
  const currentOrigin = getCurrentOrigin();
  return currentOrigin ? `${currentOrigin}/auth/callback` : "";
};

export const resolvePostLoginPath = (user) => {
  if (user?.role === "admin") {
    return "/admin";
  }

  if (isAdminHost()) {
    return "/login";
  }

  return "/";
};

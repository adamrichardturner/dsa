export const sidebarStateCookie = "sidebar_state";

export const readSidebarOpen = (fallback: boolean): boolean => {
  if (typeof document === "undefined") {
    return fallback;
  }

  const prefix = `${sidebarStateCookie}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const entry = part.trim();
    if (!entry.startsWith(prefix)) {
      continue;
    }
    const value = entry.slice(prefix.length);
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }

  return fallback;
};

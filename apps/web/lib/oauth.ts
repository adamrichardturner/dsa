import type { OauthProvider } from "./types";

const coursePath = "/course";

export const isOauthProvider = (value: string): value is OauthProvider =>
  value === "google" || value === "github";

export const providerLabel = (provider: OauthProvider): string => {
  if (provider === "google") {
    return "Google";
  }
  return "GitHub";
};

export const oauthErrorMessage = (code: string | null, provider: string | null): string => {
  const label = provider === "github" ? "GitHub" : provider === "google" ? "Google" : "That";
  switch (code) {
    case "access_denied": {
      return `${label} sign-in was cancelled.`;
    }
    case "expired": {
      return "That sign-in link expired. Try again.";
    }
    case "email": {
      return `${label} did not share a verified email address. Allow email access and try again.`;
    }
    case "conflict": {
      return "Those email addresses belong to more than one account, so this sign-in was not linked.";
    }
    case "linked": {
      return `This email is already linked to a different ${label} account.`;
    }
    case "unavailable": {
      return `${label} sign-in is not available right now.`;
    }
    default: {
      return `Could not finish ${label} sign-in. Try again.`;
    }
  }
};

const isSafePath = (value: string): boolean => {
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return false;
  }
  if (value.includes("\\") || value.includes("://") || value.includes("@")) {
    return false;
  }
  if (/[\u0000-\u001F\u007F]/.test(value)) {
    return false;
  }
  return true;
};

const decodeOnce = (value: string): string | null => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

export const safeReturnPath = (value: string | null): string => {
  if (value === null) {
    return coursePath;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 512) {
    return coursePath;
  }
  const once = decodeOnce(trimmed);
  if (once === null) {
    return coursePath;
  }
  const decoded = decodeOnce(once) ?? once;
  if (!isSafePath(decoded)) {
    return coursePath;
  }
  return decoded;
};

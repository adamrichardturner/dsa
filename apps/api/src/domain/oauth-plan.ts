import { isRecord } from "../lib/guards.js";
import type { OauthProvider } from "./models.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const coursePath = "/course";

export interface ProviderAccount {
  readonly providerUserId: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly verifiedEmails: readonly string[];
  readonly primaryEmail: string | null;
  readonly emailsKnown: boolean;
}

export interface OauthAccountMatch {
  readonly id: string;
  readonly email: string;
  readonly providerLinked: boolean;
}

export type OauthLinkPlan =
  | { readonly type: "use-identity" }
  | { readonly type: "link"; readonly userId: string }
  | { readonly type: "create"; readonly email: string; readonly name: string }
  | { readonly type: "reject"; readonly code: "email" | "conflict" | "linked" };

export const isOauthProvider = (value: string): value is OauthProvider =>
  value === "google" || value === "github" || value === "apple";

export const mobileOriginSentinel = "app://mobile";

const mobileSchemePattern = /^[a-z][a-z0-9+.-]{0,30}$/;

export const providerLabel = (provider: OauthProvider): string => {
  switch (provider) {
    case "google": {
      return "Google";
    }
    case "github": {
      return "GitHub";
    }
    case "apple": {
      return "Apple";
    }
  }
};

export const oauthResultRedirect = (
  origin: string,
  scheme: string,
  params: Readonly<Record<string, string>>,
): string | null => {
  const apply = (url: URL): string => {
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value === undefined) {
        continue;
      }
      url.searchParams.set(key, value);
    }
    return url.toString();
  };

  if (origin === mobileOriginSentinel) {
    if (!mobileSchemePattern.test(scheme)) {
      return null;
    }
    return apply(new URL(`${scheme}://auth/callback`));
  }

  try {
    return apply(new URL("/auth/callback", origin));
  } catch {
    return null;
  }
};

export const oauthFailureMessage = (code: string, provider: OauthProvider): string => {
  const label = providerLabel(provider);
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

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isEmail = (email: string): boolean => emailPattern.test(email);

const isNoreply = (email: string): boolean => email.endsWith("@users.noreply.github.com");

const collapse = (value: string): string =>
  value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .replace(/\s+/g, " ");

const nameFromEmail = (email: string): string => {
  const at = email.indexOf("@");
  if (at <= 0) {
    return "";
  }
  return email.slice(0, at).replace(/[._+-]+/g, " ");
};

export const displayName = (preferred: string | null, fallback: string): string => {
  const primary = collapse(preferred ?? "");
  if (primary.length > 0) {
    return primary.slice(0, 80);
  }
  const secondary = collapse(fallback);
  if (secondary.length > 0) {
    return secondary.slice(0, 80);
  }
  return "Reader";
};

export const safeAvatarUrl = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) {
    return null;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    if (parsed.username.length > 0 || parsed.password.length > 0) {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
};

const cleanSubject = (value: string): string | null => {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 256) {
    return null;
  }
  if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
    return null;
  }
  return trimmed;
};

export const verifiedEmailList = (
  emails: readonly string[],
  primary: string | null,
): {
  readonly verified: readonly string[];
  readonly primary: string | null;
} => {
  const verified: string[] = [];
  for (const email of emails) {
    const normalized = normalizeEmail(email);
    if (!isEmail(normalized) || verified.includes(normalized)) {
      continue;
    }
    verified.push(normalized);
  }
  if (primary === null) {
    return { verified, primary: null };
  }
  const normalizedPrimary = normalizeEmail(primary);
  if (!verified.includes(normalizedPrimary)) {
    return { verified, primary: null };
  }
  return { verified, primary: normalizedPrimary };
};

const preferredEmail = (verified: readonly string[], primary: string | null): string | null => {
  if (primary !== null && !isNoreply(primary)) {
    return primary;
  }
  for (const email of verified) {
    if (!isNoreply(email)) {
      return email;
    }
  }
  if (primary !== null) {
    return primary;
  }
  return verified[0] ?? null;
};

export const identityEmail = (account: ProviderAccount): string | null => {
  const listed = verifiedEmailList(account.verifiedEmails, account.primaryEmail);
  return preferredEmail(listed.verified, listed.primary);
};

export const oauthSkipsEmailVerification = (account: ProviderAccount): boolean => identityEmail(account) !== null;

const uniqueUsers = (users: readonly OauthAccountMatch[]): OauthAccountMatch[] => {
  const found: OauthAccountMatch[] = [];
  for (const user of users) {
    const already = found.some((item) => item.id === user.id);
    if (already) {
      continue;
    }
    found.push({
      id: user.id,
      email: normalizeEmail(user.email),
      providerLinked: user.providerLinked,
    });
  }
  return found;
};

const usersWithEmail = (users: readonly OauthAccountMatch[], email: string): OauthAccountMatch[] => {
  const found: OauthAccountMatch[] = [];
  for (const user of users) {
    if (normalizeEmail(user.email) === email) {
      found.push(user);
    }
  }
  return uniqueUsers(found);
};

const usersWithAnyEmail = (users: readonly OauthAccountMatch[], emails: readonly string[]): OauthAccountMatch[] => {
  const found: OauthAccountMatch[] = [];
  for (const user of users) {
    if (emails.includes(normalizeEmail(user.email))) {
      found.push(user);
    }
  }
  return uniqueUsers(found);
};

/**
 * Decides whether an OAuth profile signs into an existing provider identity,
 * links to one account with the same verified email, or creates an account.
 *
 * The provider subject wins over email, including when the address at the
 * provider later changes. A verified primary email is the only address used
 * when it matches an account, so a secondary address cannot move the login
 * onto a different user. When the primary matches nobody, other verified
 * emails may link, unless they belong to more than one account. An account
 * that already has this provider linked to a different subject is left as it is.
 * Unverified addresses are ignored. A GitHub noreply address is used only when
 * the profile has no other verified email.
 */
export const planOAuthAccount = (
  account: ProviderAccount,
  identity: { readonly userId: string } | null,
  users: readonly OauthAccountMatch[],
): OauthLinkPlan => {
  if (identity !== null) {
    return { type: "use-identity" };
  }

  const listed = verifiedEmailList(account.verifiedEmails, account.primaryEmail);
  if (listed.verified.length === 0) {
    return { type: "reject", code: "email" };
  }

  const email = preferredEmail(listed.verified, listed.primary);
  if (email === null) {
    return { type: "reject", code: "email" };
  }

  const primaryMatches = listed.primary === null ? [] : usersWithEmail(users, listed.primary);
  const matches = primaryMatches.length > 0 ? primaryMatches : usersWithAnyEmail(users, listed.verified);
  if (matches.length > 1) {
    return { type: "reject", code: "conflict" };
  }

  const match = matches[0];
  if (match === undefined) {
    return {
      type: "create",
      email,
      name: displayName(account.name, nameFromEmail(email)),
    };
  }
  if (match.providerLinked) {
    return { type: "reject", code: "linked" };
  }
  return { type: "link", userId: match.id };
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
  const twice = decodeOnce(once);
  const decoded = twice ?? once;
  if (!isSafePath(decoded)) {
    return coursePath;
  }
  return decoded;
};

export const allowedWebOrigin = (candidate: string | null, allowed: readonly string[]): string | null => {
  const fallback = allowed[0] ?? null;
  if (candidate === null || candidate.length === 0) {
    return fallback;
  }
  if (allowed.includes(candidate)) {
    return candidate;
  }
  return fallback;
};

export const callbackUrl = (apiOrigin: string, provider: OauthProvider): string | null => {
  try {
    const base = apiOrigin.endsWith("/") ? apiOrigin : `${apiOrigin}/`;
    const url = new URL(`auth/${provider}/callback`, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
};

export const readGoogleAccount = (payload: unknown): ProviderAccount | null => {
  if (!isRecord(payload) || typeof payload.sub !== "string") {
    return null;
  }
  const providerUserId = cleanSubject(payload.sub);
  if (providerUserId === null) {
    return null;
  }
  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : "";
  const verifiedFlag = payload.email_verified === true || payload.email_verified === "true";
  const verified = verifiedFlag && isEmail(email) ? [email] : [];
  const name = typeof payload.name === "string" ? payload.name : null;
  const picture = typeof payload.picture === "string" ? safeAvatarUrl(payload.picture) : null;
  const primary = verified[0] ?? null;
  return {
    providerUserId,
    name: displayName(name, primary === null ? "" : nameFromEmail(primary)),
    avatarUrl: picture,
    verifiedEmails: verified,
    primaryEmail: primary,
    emailsKnown: true,
  };
};

const readGitHubEmails = (
  payload: unknown,
): {
  readonly verified: readonly string[];
  readonly primary: string | null;
} | null => {
  if (!Array.isArray(payload)) {
    return null;
  }
  const verified: string[] = [];
  let primary: string | null = null;
  for (const item of payload) {
    if (!isRecord(item) || item.verified !== true || typeof item.email !== "string") {
      continue;
    }
    const email = normalizeEmail(item.email);
    if (!isEmail(email) || verified.includes(email)) {
      continue;
    }
    verified.push(email);
    if (item.primary === true) {
      primary = email;
    }
  }
  return { verified, primary };
};

export const readGitHubAccount = (user: unknown, emails: unknown | null): ProviderAccount | null => {
  if (!isRecord(user) || typeof user.id !== "number") {
    return null;
  }
  if (!Number.isSafeInteger(user.id) || user.id <= 0) {
    return null;
  }
  const providerUserId = cleanSubject(String(user.id));
  if (providerUserId === null) {
    return null;
  }
  const login = typeof user.login === "string" ? user.login : "";
  const name = typeof user.name === "string" ? user.name : null;
  const avatar = typeof user.avatar_url === "string" ? safeAvatarUrl(user.avatar_url) : null;
  const parsed = emails === null ? null : readGitHubEmails(emails);
  const verified = parsed?.verified ?? [];
  const primary = parsed?.primary ?? null;
  return {
    providerUserId,
    name: displayName(name, login),
    avatarUrl: avatar,
    verifiedEmails: verified,
    primaryEmail: primary,
    emailsKnown: parsed !== null,
  };
};

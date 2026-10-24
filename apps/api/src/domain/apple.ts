import { createHash } from "node:crypto";
import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from "jose";
import { isRecord } from "../lib/guards.js";
import { displayName } from "./oauth-plan.js";
import type { ProviderAccount } from "./oauth-plan.js";

const appleIssuer = "https://appleid.apple.com";
const appleKeys = createRemoteJWKSet(new URL(`${appleIssuer}/auth/keys`));

export interface AppleConfig {
  readonly clientId: string;
  readonly servicesId: string;
  readonly teamId: string;
  readonly keyId: string;
  readonly privateKey: string;
}

export const appleAudiences = (config: AppleConfig): readonly string[] => {
  const audiences: string[] = [];
  if (config.clientId.length > 0) {
    audiences.push(config.clientId);
  }
  if (config.servicesId.length > 0 && !audiences.includes(config.servicesId)) {
    audiences.push(config.servicesId);
  }
  return audiences;
};

export const appleWebReady = (config: AppleConfig): boolean => {
  return (
    config.servicesId.length > 0 &&
    config.teamId.length > 0 &&
    config.keyId.length > 0 &&
    config.privateKey.trim().length > 0
  );
};

export const normalizePem = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed.includes("\\n")) {
    return trimmed;
  }
  return trimmed.replaceAll("\\n", "\n");
};

export const appleNonceMatches = (claim: unknown, rawNonce: string): boolean => {
  if (typeof claim !== "string" || rawNonce.length < 8 || rawNonce.length > 128) {
    return false;
  }
  const digest = createHash("sha256").update(rawNonce).digest("hex");
  return claim.toLowerCase() === digest;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const cleanName = (value: string | null): string | null => {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0 || trimmed.length > 80) {
    return null;
  }
  return trimmed;
};

export const appleNameFromUser = (value: string | null): string | null => {
  if (value === null || value.length > 2000) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || !isRecord(parsed.name)) {
    return null;
  }
  const first = typeof parsed.name.firstName === "string" ? parsed.name.firstName : "";
  const last = typeof parsed.name.lastName === "string" ? parsed.name.lastName : "";
  return cleanName(`${first} ${last}`);
};

export const readAppleAccount = (payload: unknown, name: string | null): ProviderAccount | null => {
  if (!isRecord(payload) || typeof payload.sub !== "string") {
    return null;
  }
  const providerUserId = payload.sub.trim();
  if (providerUserId.length === 0 || providerUserId.length > 255) {
    return null;
  }
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const verifiedFlag = payload.email_verified === true || payload.email_verified === "true";
  const verified = verifiedFlag && emailPattern.test(email) ? [email] : [];
  const primary = verified[0] ?? null;
  const fallback = primary === null ? "Learner" : (primary.split("@")[0] ?? "Learner");
  return {
    providerUserId,
    name: displayName(cleanName(name), fallback),
    avatarUrl: null,
    verifiedEmails: verified,
    primaryEmail: primary,
    emailsKnown: true,
  };
};

export const verifyAppleIdentityToken = async (
  token: string,
  audiences: readonly string[],
  rawNonce: string | null,
): Promise<unknown | null> => {
  if (audiences.length === 0 || token.length === 0 || token.length > 12000) {
    return null;
  }
  try {
    const verified = await jwtVerify(token, appleKeys, {
      issuer: appleIssuer,
      audience: [...audiences],
    });
    if (rawNonce !== null && !appleNonceMatches(verified.payload.nonce, rawNonce)) {
      return null;
    }
    return verified.payload;
  } catch {
    return null;
  }
};

export const appleClientSecret = async (config: AppleConfig): Promise<string | null> => {
  if (!appleWebReady(config)) {
    return null;
  }
  try {
    const key = await importPKCS8(normalizePem(config.privateKey), "ES256");
    return await new SignJWT({})
      .setProtectedHeader({ alg: "ES256", kid: config.keyId })
      .setIssuer(config.teamId)
      .setIssuedAt()
      .setExpirationTime("5m")
      .setAudience(appleIssuer)
      .setSubject(config.servicesId)
      .sign(key);
  } catch {
    return null;
  }
};

export const appleAuthorizationUrl = (input: {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly state: string;
}): string => {
  const url = new URL(`${appleIssuer}/auth/authorize`);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("response_mode", "form_post");
  url.searchParams.set("scope", "name email");
  url.searchParams.set("state", input.state);
  return url.toString();
};

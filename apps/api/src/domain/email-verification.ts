import { createHash } from "node:crypto";

export const verificationLifetimeMs = 24 * 60 * 60 * 1000;

export const verificationLandingPath = "/course";

export const unverifiedSignInMessage =
  "Check your inbox to verify your email before using the course. We sent another link.";

export const unverifiedCourseMessage = "Verify your email before using the course.";

export const verificationInvalidMessage = "That verification link is invalid or has expired.";

export const verificationUsedMessage = "That verification link has already been used.";

export interface IssuedVerification {
  readonly userId: string;
  readonly tokenHash: string;
  readonly expiresAtMs: number;
  readonly consumed: boolean;
}

export type VerificationRejectReason = "missing" | "expired" | "used";

export type VerificationDecision =
  | { readonly type: "accept"; readonly userId: string }
  | { readonly type: "reject"; readonly reason: VerificationRejectReason };

export type VerifyLoginPlan =
  | { readonly type: "login"; readonly userId: string }
  | { readonly type: "reject"; readonly reason: VerificationRejectReason };

export const hashVerificationToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const issueVerification = (input: {
  readonly userId: string;
  readonly token: string;
  readonly issuedAtMs: number;
}): IssuedVerification => ({
  userId: input.userId,
  tokenHash: hashVerificationToken(input.token),
  expiresAtMs: input.issuedAtMs + verificationLifetimeMs,
  consumed: false,
});

export const verificationUrl = (origin: string, token: string): string =>
  `${origin}/verify-email?token=${encodeURIComponent(token)}`;

export const decideVerificationToken = (record: IssuedVerification | null, nowMs: number): VerificationDecision => {
  if (record === null) {
    return { type: "reject", reason: "missing" };
  }
  if (record.consumed) {
    return { type: "reject", reason: "used" };
  }
  if (!Number.isFinite(record.expiresAtMs) || record.expiresAtMs <= nowMs) {
    return { type: "reject", reason: "expired" };
  }
  return { type: "accept", userId: record.userId };
};

export const planVerifyLogin = (record: IssuedVerification | null, nowMs: number): VerifyLoginPlan => {
  const decision = decideVerificationToken(record, nowMs);
  if (decision.type === "reject") {
    return decision;
  }
  return { type: "login", userId: decision.userId };
};

export const verificationFailureMessage = (reason: VerificationRejectReason): string => {
  if (reason === "used") {
    return verificationUsedMessage;
  }
  return verificationInvalidMessage;
};

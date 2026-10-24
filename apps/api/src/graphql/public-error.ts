import { GraphQLError } from "graphql";
import type { Plugin } from "graphql-yoga";
import {
  unverifiedCourseMessage,
  unverifiedSignInMessage,
  verificationInvalidMessage,
  verificationUsedMessage,
} from "../domain/email-verification.js";
import { isRecord } from "../lib/guards.js";

const requestFailed = "Request failed.";

export const publicErrorCodes = [
  "BAD_EMAIL",
  "BAD_NAME",
  "BAD_PASSWORD",
  "BAD_AVATAR_LENGTH",
  "BAD_AVATAR_URL",
  "CURRENT_PASSWORD_REQUIRED",
  "DELETE_PASSWORD_REQUIRED",
  "CONFIRM_EMAIL",
  "RESET_INVALID",
  "OAUTH_CODE_INVALID",
  "EMAIL_TAKEN",
  "EMAIL_UNVERIFIED",
  "VERIFY_INVALID",
  "VERIFY_USED",
  "COURSE_UNVERIFIED",
  "PASSWORD_INCORRECT",
  "OAUTH_ACCOUNT",
  "INVALID_CREDENTIALS",
  "UNAUTHORIZED",
  "ADMIN_FORBIDDEN",
  "ACCOUNT_NOT_FOUND",
  "ADMIN_PROTECTED",
  "LESSON_NOT_FOUND",
  "LESSON_LOCKED",
  "EXERCISE_NOT_FOUND",
  "EXERCISE_LOCKED",
  "SOLUTION_EMPTY",
  "SOLUTION_TOO_LONG",
  "WALKTHROUGH_LOCKED",
  "MISSING_CODE",
  "EMAIL_UNAVAILABLE",
  "OAUTH_EMAIL",
  "OAUTH_CONFLICT",
  "OAUTH_LINKED",
  "OAUTH_PROVIDER",
  "OAUTH_EXPIRED",
  "OAUTH_DENIED",
  "OAUTH_UNAVAILABLE",
  "UNEXPECTED",
] as const;

export type PublicErrorCode = (typeof publicErrorCodes)[number];

const publicErrorCodeRecord: Record<string, true> = {};
for (const code of publicErrorCodes) {
  publicErrorCodeRecord[code] = true;
}

export const isPublicErrorCode = (value: string): value is PublicErrorCode => {
  return publicErrorCodeRecord[value] === true;
};

const messageCodes: Record<string, PublicErrorCode> = {
  "Enter a valid email address.": "BAD_EMAIL",
  "Email is required.": "BAD_EMAIL",
  "Enter a name up to 80 characters.": "BAD_NAME",
  "Name is required.": "BAD_NAME",
  "Use a password of at least 8 characters.": "BAD_PASSWORD",
  "Password is required.": "BAD_PASSWORD",
  "Use a shorter picture link.": "BAD_AVATAR_LENGTH",
  "Enter a picture link starting with http or https.": "BAD_AVATAR_URL",
  "Enter your current password.": "CURRENT_PASSWORD_REQUIRED",
  "Enter your password to confirm.": "DELETE_PASSWORD_REQUIRED",
  "Type your email address to confirm.": "CONFIRM_EMAIL",
  "That reset link is invalid or has expired.": "RESET_INVALID",
  "That sign-in link is no longer valid. Try again.": "OAUTH_CODE_INVALID",
  "Missing sign-in code.": "OAUTH_CODE_INVALID",
  "An account with that email already exists.": "EMAIL_TAKEN",
  [unverifiedSignInMessage]: "EMAIL_UNVERIFIED",
  [verificationInvalidMessage]: "VERIFY_INVALID",
  [verificationUsedMessage]: "VERIFY_USED",
  [unverifiedCourseMessage]: "COURSE_UNVERIFIED",
  "Password is incorrect.": "PASSWORD_INCORRECT",
  "This email uses Google, GitHub, or Apple sign-in. Continue with one of those. You can add a password afterward from settings.":
    "OAUTH_ACCOUNT",
  "Email or password is incorrect.": "INVALID_CREDENTIALS",
  "Sign in to continue.": "UNAUTHORIZED",
  "You do not have access to the admin panel.": "ADMIN_FORBIDDEN",
  "That account does not exist.": "ACCOUNT_NOT_FOUND",
  "The admin account cannot be deleted from here.": "ADMIN_PROTECTED",
  "That lesson does not exist.": "LESSON_NOT_FOUND",
  "Missing lesson.": "LESSON_NOT_FOUND",
  "Finish the previous lesson before opening this one.": "LESSON_LOCKED",
  "That exercise does not exist.": "EXERCISE_NOT_FOUND",
  "Missing exercise.": "EXERCISE_NOT_FOUND",
  "Finish the previous lesson before submitting this one.": "EXERCISE_LOCKED",
  "Write a solution before submitting.": "SOLUTION_EMPTY",
  "Missing solution.": "SOLUTION_EMPTY",
  "That solution is too long to save.": "SOLUTION_TOO_LONG",
  "Try the exercise twice before opening the walkthrough.": "WALKTHROUGH_LOCKED",
  "Missing code.": "MISSING_CODE",
  "Email is not configured.": "EMAIL_UNAVAILABLE",
  "Could not send that email.": "EMAIL_UNAVAILABLE",
  "Could not send that email. Try again in a moment.": "EMAIL_UNAVAILABLE",
};

const oauthCodeByFlow: Record<string, PublicErrorCode> = {
  email: "OAUTH_EMAIL",
  conflict: "OAUTH_CONFLICT",
  linked: "OAUTH_LINKED",
  provider: "OAUTH_PROVIDER",
  expired: "OAUTH_EXPIRED",
  access_denied: "OAUTH_DENIED",
  unavailable: "OAUTH_UNAVAILABLE",
};

const oauthPublicCode = (code: unknown): PublicErrorCode | null => {
  if (typeof code !== "string") {
    return null;
  }
  return oauthCodeByFlow[code] ?? null;
};

const extensionCode = (error: unknown): PublicErrorCode | null => {
  if (!(error instanceof GraphQLError)) {
    return null;
  }
  const code = error.extensions.code;
  if (typeof code !== "string" || !isPublicErrorCode(code)) {
    return null;
  }
  return code;
};

const taggedCode = (error: unknown): PublicErrorCode | null => {
  if (!isRecord(error)) {
    return null;
  }
  if (error._tag === "OauthFlowError") {
    return oauthPublicCode(error.code);
  }
  if (typeof error.message !== "string") {
    return null;
  }
  return messageCodes[error.message] ?? null;
};

const thrownCode = (error: unknown): PublicErrorCode | null => {
  const tagged = taggedCode(error);
  if (tagged !== null) {
    return tagged;
  }
  if (!(error instanceof Error)) {
    return null;
  }
  return messageCodes[error.message] ?? null;
};

const nestedCode = (error: unknown): PublicErrorCode | null => {
  if (!isRecord(error) || !("originalError" in error)) {
    return null;
  }
  return extensionCode(error.originalError) ?? thrownCode(error.originalError);
};

/**
 * Maps a thrown API error to a public code.
 * Anything outside the known set becomes UNEXPECTED so internal text stays on the server.
 */
export const classifyError = (error: unknown): PublicErrorCode => {
  return extensionCode(error) ?? thrownCode(error) ?? nestedCode(error) ?? "UNEXPECTED";
};

/** Client-facing GraphQL error. The message is fixed; callers render `extensions.code`. */
export const publicGraphQLError = (code: PublicErrorCode): GraphQLError => {
  return new GraphQLError(requestFailed, {
    extensions: { code },
  });
};

const publishedError = (error: unknown): GraphQLError | null => {
  if (!(error instanceof GraphQLError)) {
    return null;
  }
  if (error.originalError != null) {
    return null;
  }
  if (error.message !== requestFailed) {
    return null;
  }
  const code = error.extensions.code;
  if (typeof code !== "string" || !isPublicErrorCode(code)) {
    return null;
  }
  return error;
};

export const maskPublicError = (error: unknown, _message: string, _isDev?: boolean): GraphQLError => {
  const published = publishedError(error);
  if (published !== null) {
    return published;
  }
  return publicGraphQLError(classifyError(error));
};

export const maskValidationResult = (errors: readonly unknown[]): GraphQLError[] => {
  const masked: GraphQLError[] = [];
  for (const error of errors) {
    masked.push(publicGraphQLError(classifyError(error)));
  }
  return masked;
};

/** Validation errors name schema fields. Replace them before they leave the server. */
export const maskValidationErrors = (): Plugin => {
  return {
    onValidate() {
      return ({ valid, result, setResult }) => {
        if (valid) {
          return;
        }
        setResult(maskValidationResult(result));
      };
    },
  };
};

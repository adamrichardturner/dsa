import type { CombinedError } from "urql";
import { isRecord } from "@/lib/guards";

const unexpectedMessage = "Something went wrong. Try again.";
const offlineMessage = "Could not reach the server. Check your connection and try again.";

/**
 * Display copy for codes issued by the API. Keep this aligned with
 * `publicErrorCodes` in the API. UNEXPECTED is intentionally absent so each
 * screen can use its own fallback.
 */
const graphqlErrorMessages = {
  BAD_EMAIL: "Enter a valid email address.",
  BAD_NAME: "Enter a name up to 80 characters.",
  BAD_PASSWORD: "Use a password of at least 8 characters.",
  BAD_AVATAR_LENGTH: "Use a shorter picture link.",
  BAD_AVATAR_URL: "Enter a picture link starting with http or https.",
  CURRENT_PASSWORD_REQUIRED: "Enter your current password.",
  DELETE_PASSWORD_REQUIRED: "Enter your password to confirm.",
  CONFIRM_EMAIL: "Type your email address to confirm.",
  RESET_INVALID: "That reset link is invalid or has expired.",
  OAUTH_CODE_INVALID: "That sign-in link is no longer valid. Try again.",
  EMAIL_TAKEN: "An account with that email already exists.",
  EMAIL_UNVERIFIED: "Check your inbox to verify your email before using the course. We sent another link.",
  VERIFY_INVALID: "That verification link is invalid or has expired.",
  VERIFY_USED: "That verification link has already been used.",
  COURSE_UNVERIFIED: "Verify your email before using the course.",
  PASSWORD_INCORRECT: "Password is incorrect.",
  OAUTH_ACCOUNT:
    "This email uses Google, GitHub, or Apple sign-in. Continue with one of those. You can add a password afterward from settings.",
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  UNAUTHORIZED: "Sign in to continue.",
  ADMIN_FORBIDDEN: "You do not have access to the admin panel.",
  ACCOUNT_NOT_FOUND: "That account does not exist.",
  ADMIN_PROTECTED: "The admin account cannot be deleted from here.",
  LESSON_NOT_FOUND: "That lesson does not exist.",
  LESSON_LOCKED: "Finish the previous lesson before opening this one.",
  EXERCISE_NOT_FOUND: "That exercise does not exist.",
  EXERCISE_LOCKED: "Finish the previous lesson before submitting this one.",
  SOLUTION_EMPTY: "Write a solution before submitting.",
  SOLUTION_TOO_LONG: "That solution is too long to save.",
  WALKTHROUGH_LOCKED: "Try the exercise twice before opening the walkthrough.",
  MISSING_CODE: "Write some code before running it.",
  EMAIL_UNAVAILABLE: "Could not send that email. Try again in a moment.",
  OAUTH_EMAIL: "The sign-in provider did not share a verified email address. Allow email access and try again.",
  OAUTH_CONFLICT: "Those email addresses belong to more than one account, so this sign-in was not linked.",
  OAUTH_LINKED: "This email is already linked to a different account at that provider.",
  OAUTH_PROVIDER: "Could not finish signing in. Try again.",
  OAUTH_EXPIRED: "That sign-in link expired. Try again.",
  OAUTH_DENIED: "Sign-in was cancelled.",
  OAUTH_UNAVAILABLE: "That sign-in provider is not available right now.",
} as const;

type GraphqlErrorCode = keyof typeof graphqlErrorMessages;

const isGraphqlErrorCode = (code: string): code is GraphqlErrorCode => {
  return Object.hasOwn(graphqlErrorMessages, code);
};

const messageForCode = (code: string): string | null => {
  if (!isGraphqlErrorCode(code)) {
    return null;
  }
  return graphqlErrorMessages[code];
};

const extensionCode = (extensions: unknown): string | null => {
  if (!isRecord(extensions)) {
    return null;
  }
  const code = extensions.code;
  if (typeof code !== "string" || code.length === 0) {
    return null;
  }
  return code;
};

const readCode = (error: CombinedError): string | null => {
  const graphQLError = error.graphQLErrors[0];
  if (graphQLError === undefined) {
    return null;
  }
  return extensionCode(graphQLError.extensions);
};

/**
 * Readable copy for a GraphQL failure.
 * The server message is never shown, so an unexpected error cannot leak internals.
 */
export const graphqlErrorCode = (error: CombinedError | undefined): string | null => {
  if (error === undefined) {
    return null;
  }
  return readCode(error);
};

export const graphqlErrorMessage = (error: CombinedError | undefined, fallback = unexpectedMessage): string => {
  if (error === undefined) {
    return fallback;
  }
  const code = readCode(error);
  const mapped = code === null ? null : messageForCode(code);
  if (mapped !== null) {
    return mapped;
  }
  if (error.graphQLErrors.length === 0) {
    return offlineMessage;
  }
  return fallback;
};

import { graphqlUrl } from "@/api/config";

const messages: Record<string, string> = {
  BAD_EMAIL: "Enter a valid email address.",
  BAD_NAME: "Enter a name up to 80 characters.",
  BAD_PASSWORD: "Use a password of at least 8 characters.",
  EMAIL_TAKEN: "An account with that email already exists.",
  EMAIL_UNVERIFIED:
    "Check your inbox to verify your email before using the course. We sent another link.",
  VERIFY_INVALID: "That verification link is invalid or has expired.",
  VERIFY_USED: "That verification link has already been used.",
  COURSE_UNVERIFIED: "Verify your email before using the course.",
  PASSWORD_INCORRECT: "Password is incorrect.",
  OAUTH_ACCOUNT:
    "This email uses Google, GitHub, or Apple sign-in. Continue with one of those. You can add a password afterward from settings.",
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  UNAUTHORIZED: "Sign in to continue.",
  LESSON_NOT_FOUND: "That lesson does not exist.",
  LESSON_LOCKED: "Finish the previous lesson before opening this one.",
  EXERCISE_NOT_FOUND: "That exercise does not exist.",
  EXERCISE_LOCKED: "Finish the previous lesson before submitting this one.",
  SOLUTION_EMPTY: "Fill the gaps before submitting.",
  OAUTH_CODE_INVALID: "That sign-in link is no longer valid. Try again.",
  OAUTH_EMAIL: "The sign-in provider did not share a verified email address.",
  OAUTH_DENIED: "Sign-in was cancelled.",
  OAUTH_UNAVAILABLE: "That sign-in provider is not available right now.",
  OAUTH_EXPIRED: "That sign-in link expired. Try again.",
  OAUTH_PROVIDER: "Could not finish signing in. Try again.",
  RESET_INVALID: "That reset link is invalid or has expired.",
  WALKTHROUGH_LOCKED: "Try the exercise twice before opening the walkthrough.",
  EMAIL_UNAVAILABLE: "Could not send that email. Try again in a moment.",
  OFFLINE: "Could not reach the server. Check your connection and try again.",
};

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(messages[code] ?? "Something went wrong. Try again.");
    this.code = code;
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const errorCode = (body: unknown): string => {
  if (!isRecord(body) || !Array.isArray(body.errors)) {
    return "UNEXPECTED";
  }
  const first: unknown = body.errors[0];
  if (!isRecord(first) || !isRecord(first.extensions)) {
    return "UNEXPECTED";
  }
  const code = first.extensions.code;
  if (typeof code !== "string" || code.length === 0) {
    return "UNEXPECTED";
  }
  return code;
};

export const request = async <T>(
  query: string,
  variables: Record<string, unknown> | null,
  token: string | null,
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token === null ? {} : { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        query,
        variables: variables ?? {},
      }),
    });
  } catch {
    throw new ApiError("OFFLINE");
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError("UNEXPECTED");
  }

  if (!isRecord(body) || body.errors !== undefined || !("data" in body)) {
    throw new ApiError(errorCode(body));
  }

  return body.data as T;
};

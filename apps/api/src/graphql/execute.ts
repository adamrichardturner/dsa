import { classifyError, publicGraphQLError } from "./public-error.js";
import { runEffect } from "../runtime.js";

export const execute = async <A>(
  token: string | null,
  effect: Parameters<typeof runEffect<A, unknown>>[1],
): Promise<A> => {
  try {
    return await runEffect(token, effect);
  } catch (error) {
    const code = classifyError(error);
    if (code === "UNEXPECTED") {
      console.error(error);
    }
    throw publicGraphQLError(code);
  }
};

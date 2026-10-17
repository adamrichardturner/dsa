import { GraphQLError } from "graphql";
import { errorMessage } from "../lib/guards.js";
import { runEffect } from "../runtime.js";

export const execute = async <A>(
  token: string | null,
  effect: Parameters<typeof runEffect<A, unknown>>[1],
): Promise<A> => {
  try {
    return await runEffect(token, effect);
  } catch (error) {
    const message = errorMessage(error, "");
    if (message.length === 0) {
      console.error(error);
      throw new GraphQLError("Request failed.");
    }
    throw new GraphQLError(message);
  }
};

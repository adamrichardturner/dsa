import cors from "cors";
import express from "express";
import { createYoga } from "graphql-yoga";
import type { AppConfig } from "../config.js";
import { schema, type GraphQLContext } from "../graphql/schema.js";
import { mountOAuth } from "./oauth.js";

const readToken = (request: Request): string | null => {
  const header = request.headers.get("authorization");
  if (header === null || !header.startsWith("Bearer ")) {
    return null;
  }
  const token = header.slice("Bearer ".length).trim();
  if (token.length === 0) {
    return null;
  }
  return token;
};

export const createHttpApp = (config: AppConfig["Service"]) => {
  const yoga = createYoga({
    schema,
    graphqlEndpoint: "/graphql",
    context: ({ request }): GraphQLContext => ({
      token: readToken(request),
    }),
    cors: {
      origin: [...config.webOrigins],
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    maskedErrors: false,
  });

  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({
      origin: [...config.webOrigins],
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  app.get("/health", (_request, response) => {
    response.status(200).json({ ok: true });
  });
  mountOAuth(app);
  app.use(yoga.graphqlEndpoint, yoga);

  return app;
};

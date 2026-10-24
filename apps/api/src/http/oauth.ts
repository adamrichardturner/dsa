import express, { type Express, type Request, type Response } from "express";
import { Effect } from "effect";
import { isRecord } from "../lib/guards.js";
import { OAuth } from "../domain/oauth.js";
import { allowedWebOrigin, isOauthProvider } from "../domain/oauth-plan.js";
import { runEffect } from "../runtime.js";
import { AppConfig } from "../config.js";

const readParam = (value: unknown): string | null => {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (!Array.isArray(value)) {
    return null;
  }
  const first: unknown = value[0];
  if (typeof first === "string" && first.length > 0) {
    return first;
  }
  return null;
};

const readQuery = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) {
    return null;
  }
  return trimmed;
};

const originOf = (value: string | undefined): string | null => {
  if (value === undefined || value.length === 0) {
    return null;
  }
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const sendRedirect = (response: Response, url: string) => {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.redirect(url);
};

const unavailable = (response: Response) => {
  response.setHeader("Cache-Control", "no-store");
  response.status(503).type("text/plain").send("Sign-in is unavailable right now.");
};

const webOriginFor = (request: Request) =>
  Effect.gen(function* () {
    const config = yield* AppConfig;
    const requested = readQuery(request.query.origin) ?? originOf(request.get("referer"));
    return allowedWebOrigin(requested, config.webOrigins);
  });

export const mountOAuth = (app: Express) => {
  app.get("/auth/:provider", (request, response) => {
    const providerParam = readParam(request.params.provider);
    if (providerParam === null || !isOauthProvider(providerParam)) {
      response.status(404).type("text/plain").send("Unknown sign-in provider.");
      return;
    }
    const provider = providerParam;

    void runEffect(
      null,
      Effect.gen(function* () {
        const oauth = yield* OAuth;
        const webOrigin = yield* webOriginFor(request);
        const client = readQuery(request.query.client) === "mobile" ? "mobile" : "web";
        return yield* oauth.begin({
          provider,
          returnTo: readQuery(request.query.returnTo),
          webOrigin,
          client,
        });
      }),
    )
      .then((url) => {
        sendRedirect(response, url);
      })
      .catch(() => {
        unavailable(response);
      });
  });

  app.get("/auth/:provider/callback", (request, response) => {
    const providerParam = readParam(request.params.provider);
    if (providerParam === null || !isOauthProvider(providerParam)) {
      response.status(404).type("text/plain").send("Unknown sign-in provider.");
      return;
    }
    const provider = providerParam;
    const providerError = readQuery(request.query.error);

    void runEffect(
      null,
      OAuth.use((oauth) =>
        oauth.finish({
          provider,
          code: readQuery(request.query.code),
          state: readQuery(request.query.state),
          providerError,
          appleUserJson: null,
        }),
      ),
    )
      .then((url) => {
        sendRedirect(response, url);
      })
      .catch(() => {
        unavailable(response);
      });
  });

  app.post("/auth/apple/callback", express.urlencoded({ extended: false }), (request, response) => {
    const body: unknown = request.body;
    const field = (key: string): string | null => {
      if (!isRecord(body)) {
        return null;
      }
      return readQuery(body[key]);
    };
    const providerError = field("error");
    void runEffect(
      null,
      OAuth.use((oauth) =>
        oauth.finish({
          provider: "apple",
          code: field("code"),
          state: field("state"),
          providerError,
          appleUserJson: field("user"),
        }),
      ),
    )
      .then((url) => {
        sendRedirect(response, url);
      })
      .catch(() => {
        unavailable(response);
      });
  });
};

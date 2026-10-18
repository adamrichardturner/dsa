import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Context, Effect, Layer, Option, Redacted, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { AppConfig } from "../config.js";
import { isRecord } from "../lib/guards.js";
import { isAdminEmail } from "./admin-access.js";
import { BadInput, OauthFlowError, Unexpected } from "./errors.js";
import type { AuthResult, OauthProvider, PublicUser } from "./models.js";
import {
  allowedWebOrigin,
  callbackUrl,
  identityEmail,
  isOauthProvider,
  normalizeEmail,
  oauthFailureMessage,
  planOAuthAccount,
  readGitHubAccount,
  readGoogleAccount,
  safeReturnPath,
  type OauthAccountMatch,
  type ProviderAccount,
} from "./oauth-plan.js";

const sessionDays = 30;
const stateMinutes = 10;
const exchangeMinutes = 2;

export interface BeginOAuthInput {
  readonly provider: OauthProvider;
  readonly returnTo: string | null;
  readonly webOrigin: string | null;
}

export interface FinishOAuthInput {
  readonly provider: OauthProvider;
  readonly code: string | null;
  readonly state: string | null;
  readonly providerError: string | null;
}

const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

const UserRow = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String,
  passwordHash: Schema.NullOr(Schema.String),
  avatarUrl: Schema.NullOr(Schema.String),
  auditMode: Schema.Boolean,
  onboardingCompleted: Schema.Boolean,
});

const IdentityRow = Schema.Struct({
  id: Schema.String,
  userId: Schema.String,
  email: Schema.String,
});

const StateRow = Schema.Struct({
  provider: Schema.String,
  codeVerifier: Schema.String,
  returnTo: Schema.String,
  webOrigin: Schema.String,
});

const ExchangeRow = Schema.Struct({
  token: Schema.String,
  userId: Schema.String,
});

const isUniqueViolation = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null || !("_tag" in error)) {
    return false;
  }
  if (error._tag !== "SqlError" || !("cause" in error)) {
    return false;
  }
  const cause: unknown = error.cause;
  if (typeof cause !== "object" || cause === null || !("_tag" in cause)) {
    return false;
  }
  return cause._tag === "UniqueViolation";
};

const flowCode = (error: unknown): OauthFlowError["code"] | null => {
  if (typeof error !== "object" || error === null || !("_tag" in error)) {
    return null;
  }
  if (error._tag !== "OauthFlowError" || !("code" in error) || typeof error.code !== "string") {
    return null;
  }
  switch (error.code) {
    case "email":
    case "conflict":
    case "linked":
    case "provider":
    case "expired":
    case "access_denied":
    case "unavailable": {
      return error.code;
    }
    default: {
      return null;
    }
  }
};

const failUnexpected = (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapError((error) => Effect.logError(message, error)),
    Effect.mapError(() => new Unexpected({ message })),
  );

const reject = (provider: OauthProvider, code: OauthFlowError["code"]) =>
  new OauthFlowError({ code, message: oauthFailureMessage(code, provider) });

const errorRedirect = (origin: string, provider: OauthProvider, code: string): string => {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("error", code);
  url.searchParams.set("provider", provider);
  return url.toString();
};

const successRedirect = (origin: string, code: string, returnTo: string): string => {
  const url = new URL("/auth/callback", origin);
  url.searchParams.set("code", code);
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
};

const enabledProviders = (config: AppConfig["Service"]): readonly OauthProvider[] => {
  const providers: OauthProvider[] = [];
  if (config.googleClientId.length > 0 && Redacted.value(config.googleClientSecret).length > 0) {
    providers.push("google");
  }
  if (config.githubClientId.length > 0 && Redacted.value(config.githubClientSecret).length > 0) {
    providers.push("github");
  }
  return providers;
};

const credentialsFor = (
  config: AppConfig["Service"],
  provider: OauthProvider,
): { readonly clientId: string; readonly clientSecret: string } | null => {
  if (provider === "google") {
    const clientSecret = Redacted.value(config.googleClientSecret);
    if (config.googleClientId.length === 0 || clientSecret.length === 0) {
      return null;
    }
    return { clientId: config.googleClientId, clientSecret };
  }
  const clientSecret = Redacted.value(config.githubClientSecret);
  if (config.githubClientId.length === 0 || clientSecret.length === 0) {
    return null;
  }
  return { clientId: config.githubClientId, clientSecret };
};

const authorizationUrl = (input: {
  readonly provider: OauthProvider;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly state: string;
  readonly verifier: string;
}): string => {
  const challenge = createHash("sha256").update(input.verifier).digest("base64url");
  const url =
    input.provider === "google"
      ? new URL("https://accounts.google.com/o/oauth2/v2/auth")
      : new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("state", input.state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (input.provider === "google") {
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("prompt", "select_account");
    return url.toString();
  }
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("allow_signup", "true");
  return url.toString();
};

const parseJson = (text: string): unknown => JSON.parse(text);

const readBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (text.length === 0) {
    return null;
  }
  try {
    return parseJson(text);
  } catch {
    return null;
  }
};

const requestJson = (url: string, init: RequestInit): Effect.Effect<unknown, Unexpected> =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(10_000),
      });
      const body = await readBody(response);
      if (!response.ok) {
        throw new Error("upstream");
      }
      return body;
    },
    catch: () => new Unexpected({ message: "Could not reach the sign-in provider." }),
  });

const readAccessToken = (payload: unknown): string | null => {
  if (!isRecord(payload) || typeof payload.access_token !== "string") {
    return null;
  }
  if (typeof payload.error === "string") {
    return null;
  }
  const token = payload.access_token.trim();
  if (token.length === 0 || token.length > 4096) {
    return null;
  }
  return token;
};

const exchangeCode = (input: {
  readonly provider: OauthProvider;
  readonly code: string;
  readonly codeVerifier: string;
  readonly redirectUri: string;
  readonly clientId: string;
  readonly clientSecret: string;
}): Effect.Effect<string, Unexpected> =>
  Effect.gen(function* () {
    const endpoint =
      input.provider === "google"
        ? "https://oauth2.googleapis.com/token"
        : "https://github.com/login/oauth/access_token";
    const payload = yield* requestJson(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "kiln",
      },
      body: new URLSearchParams({
        client_id: input.clientId,
        client_secret: input.clientSecret,
        code: input.code,
        code_verifier: input.codeVerifier,
        redirect_uri: input.redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const token = readAccessToken(payload);
    if (token === null) {
      return yield* new Unexpected({ message: "Could not finish signing in." });
    }
    return token;
  });

const providerHeaders = (accessToken: string, provider: OauthProvider): HeadersInit => {
  if (provider === "google") {
    return {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "kiln",
    };
  }
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": "kiln",
    "X-GitHub-Api-Version": "2022-11-28",
  };
};

const loadAccount = (
  provider: OauthProvider,
  accessToken: string,
): Effect.Effect<ProviderAccount, Unexpected> =>
  Effect.gen(function* () {
    if (provider === "google") {
      const payload = yield* requestJson("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: providerHeaders(accessToken, provider),
      });
      const account = readGoogleAccount(payload);
      if (account === null) {
        return yield* new Unexpected({ message: "Could not read the Google profile." });
      }
      return account;
    }

    const user = yield* requestJson("https://api.github.com/user", {
      headers: providerHeaders(accessToken, provider),
    });
    const emails = yield* requestJson("https://api.github.com/user/emails?per_page=100", {
      headers: providerHeaders(accessToken, provider),
    }).pipe(
      Effect.map((value) => value),
      Effect.catch(() => Effect.succeed(null)),
    );
    const account = readGitHubAccount(user, emails);
    if (account === null) {
      return yield* new Unexpected({ message: "Could not read the GitHub profile." });
    }
    return account;
  });

const firstOrigin = (config: AppConfig["Service"]): string =>
  config.webOrigins[0] ?? "http://localhost:3000";

export class OAuth extends Context.Service<
  OAuth,
  {
    readonly providers: readonly OauthProvider[];
    begin(input: BeginOAuthInput): Effect.Effect<string, BadInput | Unexpected>;
    finish(input: FinishOAuthInput): Effect.Effect<string, Unexpected>;
    redeem(code: string): Effect.Effect<AuthResult, BadInput | Unexpected>;
  }
>()("app/OAuth") {
  static readonly layer = Layer.effect(
    OAuth,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const config = yield* AppConfig;
      const providers = enabledProviders(config);

      const insertState = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          provider: Schema.String,
          stateHash: Schema.String,
          codeVerifier: Schema.String,
          returnTo: Schema.String,
          webOrigin: Schema.String,
          expiresAt: Schema.String,
        }),
        execute: (request) =>
          sql`
            INSERT INTO oauth_states (
              id, provider, state_hash, code_verifier, return_to, web_origin, expires_at
            )
            VALUES (
              ${request.id},
              ${request.provider},
              ${request.stateHash},
              ${request.codeVerifier},
              ${request.returnTo},
              ${request.webOrigin},
              ${request.expiresAt}::timestamptz
            )
          `,
      });

      const consumeState = SqlSchema.findOneOption({
        Request: Schema.Struct({ stateHash: Schema.String }),
        Result: StateRow,
        execute: (request) =>
          sql`
            DELETE FROM oauth_states
            WHERE state_hash = ${request.stateHash}
              AND expires_at > NOW()
            RETURNING
              provider,
              code_verifier AS "codeVerifier",
              return_to AS "returnTo",
              web_origin AS "webOrigin"
          `,
      });

      const insertExchange = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          codeHash: Schema.String,
          token: Schema.String,
          userId: Schema.String,
          expiresAt: Schema.String,
        }),
        execute: (request) =>
          sql`
            INSERT INTO oauth_exchanges (id, code_hash, token, user_id, expires_at)
            VALUES (
              ${request.id},
              ${request.codeHash},
              ${request.token},
              ${request.userId},
              ${request.expiresAt}::timestamptz
            )
          `,
      });

      const consumeExchange = SqlSchema.findOneOption({
        Request: Schema.Struct({ codeHash: Schema.String }),
        Result: ExchangeRow,
        execute: (request) =>
          sql`
            DELETE FROM oauth_exchanges
            WHERE code_hash = ${request.codeHash}
              AND expires_at > NOW()
            RETURNING token, user_id AS "userId"
          `,
      });

      const findIdentity = SqlSchema.findOneOption({
        Request: Schema.Struct({
          provider: Schema.String,
          providerUserId: Schema.String,
        }),
        Result: IdentityRow,
        execute: (request) =>
          sql`
            SELECT id, user_id AS "userId", email
            FROM oauth_identities
            WHERE provider = ${request.provider}
              AND provider_user_id = ${request.providerUserId}
          `,
      });

      const findUserByEmail = SqlSchema.findOneOption({
        Request: Schema.Struct({ email: Schema.String }),
        Result: UserRow,
        execute: (request) =>
          sql`
            SELECT
              id,
              email,
              name,
              password_hash AS "passwordHash",
              avatar_url AS "avatarUrl",
              audit_mode AS "auditMode",
              onboarding_completed AS "onboardingCompleted"
            FROM users
            WHERE email = ${request.email}
          `,
      });

      const findProviderLink = SqlSchema.findOneOption({
        Request: Schema.Struct({
          userId: Schema.String,
          provider: Schema.String,
        }),
        Result: Schema.Struct({ id: Schema.String }),
        execute: (request) =>
          sql`
            SELECT id
            FROM oauth_identities
            WHERE user_id = ${request.userId}
              AND provider = ${request.provider}
          `,
      });

      const findUserById = SqlSchema.findOneOption({
        Request: Schema.Struct({ id: Schema.String }),
        Result: UserRow,
        execute: (request) =>
          sql`
            SELECT
              id,
              email,
              name,
              password_hash AS "passwordHash",
              avatar_url AS "avatarUrl",
              audit_mode AS "auditMode",
              onboarding_completed AS "onboardingCompleted"
            FROM users
            WHERE id = ${request.id}
          `,
      });

      const listProviderRows = SqlSchema.findAll({
        Request: Schema.Struct({ userId: Schema.String }),
        Result: Schema.Struct({ provider: Schema.String }),
        execute: (request) =>
          sql`
            SELECT provider
            FROM oauth_identities
            WHERE user_id = ${request.userId}
            ORDER BY provider
          `,
      });

      const insertUser = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          email: Schema.String,
          name: Schema.String,
          passwordHash: Schema.NullOr(Schema.String),
          avatarUrl: Schema.NullOr(Schema.String),
        }),
        execute: (request) =>
          sql`
            INSERT INTO users (id, email, name, password_hash, avatar_url, onboarding_completed)
            VALUES (
              ${request.id},
              ${request.email},
              ${request.name},
              ${request.passwordHash},
              ${request.avatarUrl},
              FALSE
            )
          `,
      });

      const insertIdentity = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          userId: Schema.String,
          provider: Schema.String,
          providerUserId: Schema.String,
          email: Schema.String,
        }),
        execute: (request) =>
          sql`
            INSERT INTO oauth_identities (id, user_id, provider, provider_user_id, email)
            VALUES (
              ${request.id},
              ${request.userId},
              ${request.provider},
              ${request.providerUserId},
              ${request.email}
            )
          `,
      });

      const updateIdentityEmail = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          email: Schema.String,
        }),
        execute: (request) =>
          sql`
            UPDATE oauth_identities
            SET email = ${request.email}
            WHERE id = ${request.id}
          `,
      });

      const fillAvatar = SqlSchema.void({
        Request: Schema.Struct({
          userId: Schema.String,
          avatarUrl: Schema.String,
        }),
        execute: (request) =>
          sql`
            UPDATE users
            SET avatar_url = ${request.avatarUrl}
            WHERE id = ${request.userId}
              AND avatar_url IS NULL
          `,
      });

      const insertSession = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          userId: Schema.String,
          tokenHash: Schema.String,
          expiresAt: Schema.String,
        }),
        execute: (request) =>
          sql`
            INSERT INTO sessions (id, user_id, token_hash, expires_at)
            VALUES (
              ${request.id},
              ${request.userId},
              ${request.tokenHash},
              ${request.expiresAt}::timestamptz
            )
          `,
      });

      const cleanup = Effect.gen(function* () {
        yield* sql`DELETE FROM oauth_states WHERE expires_at <= NOW()`.pipe(
          Effect.catch(() => Effect.void),
        );
        yield* sql`DELETE FROM oauth_exchanges WHERE expires_at <= NOW()`.pipe(
          Effect.catch(() => Effect.void),
        );
      });

      const readIdentity = (provider: OauthProvider, providerUserId: string) =>
        Effect.gen(function* () {
          const found = yield* findIdentity({ provider, providerUserId }).pipe(
            failUnexpected("Could not finish signing in."),
          );
          return Option.getOrUndefined(found);
        });

      const matchesFor = (provider: OauthProvider, account: ProviderAccount) =>
        Effect.gen(function* () {
          const matches: OauthAccountMatch[] = [];
          for (const rawEmail of account.verifiedEmails) {
            const email = normalizeEmail(rawEmail);
            const found = yield* findUserByEmail({ email }).pipe(
              failUnexpected("Could not finish signing in."),
            );
            const row = Option.getOrUndefined(found);
            if (row === undefined) {
              continue;
            }
            const link = yield* findProviderLink({ userId: row.id, provider }).pipe(
              failUnexpected("Could not finish signing in."),
            );
            matches.push({
              id: row.id,
              email: row.email,
              providerLinked: Option.isSome(link),
            });
          }
          return matches;
        });

      const present = (userId: string) =>
        Effect.gen(function* () {
          const found = yield* findUserById({ id: userId }).pipe(
            failUnexpected("Could not load your account."),
          );
          const row = Option.getOrUndefined(found);
          if (row === undefined) {
            return yield* new Unexpected({ message: "Could not load your account." });
          }
          const linked = yield* listProviderRows({ userId }).pipe(
            failUnexpected("Could not load your account."),
          );
          const linkedProviders: OauthProvider[] = [];
          for (const item of linked) {
            if (isOauthProvider(item.provider)) {
              linkedProviders.push(item.provider);
            }
          }
          const user: PublicUser = {
            id: row.id,
            email: row.email,
            name: row.name,
            avatarUrl: row.avatarUrl,
            hasPassword: row.passwordHash !== null,
            providers: linkedProviders,
            isAdmin: isAdminEmail(row.email),
            auditMode: row.auditMode,
            onboardingCompleted: row.onboardingCompleted,
          };
          return user;
        });

      const openSession = (user: PublicUser) =>
        Effect.gen(function* () {
          const token = randomBytes(32).toString("base64url");
          const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString();
          yield* insertSession({
            id: randomUUID(),
            userId: user.id,
            tokenHash: hashToken(token),
            expiresAt,
          }).pipe(failUnexpected("Could not start a session."));
          return { token, user };
        });

      const writeIdentity = (
        provider: OauthProvider,
        account: ProviderAccount,
        userId: string,
        email: string,
      ) =>
        insertIdentity({
          id: randomUUID(),
          userId,
          provider,
          providerUserId: account.providerUserId,
          email,
        });

      /**
       * Signs in a provider subject that is already linked. Otherwise links one
       * verified email to an existing account, or creates an account. A unique
       * constraint race reads the row that won instead of creating a second user.
       */
      const resolveUser = (provider: OauthProvider, account: ProviderAccount) =>
        Effect.gen(function* () {
          const identity = yield* readIdentity(provider, account.providerUserId);
          if (identity !== undefined) {
            const email = identityEmail(account);
            if (email !== null && email !== identity.email) {
              yield* updateIdentityEmail({ id: identity.id, email }).pipe(
                failUnexpected("Could not finish signing in."),
              );
            }
            if (account.avatarUrl !== null) {
              yield* fillAvatar({ userId: identity.userId, avatarUrl: account.avatarUrl }).pipe(
                failUnexpected("Could not finish signing in."),
              );
            }
            return identity.userId;
          }

          if (!account.emailsKnown) {
            return yield* reject(provider, "provider");
          }

          const matches = yield* matchesFor(provider, account);
          const plan = planOAuthAccount(account, null, matches);
          if (plan.type === "use-identity") {
            return yield* new Unexpected({ message: "Could not finish signing in." });
          }
          if (plan.type === "reject") {
            return yield* reject(provider, plan.code);
          }

          const created = yield* sql
            .withTransaction(
              Effect.gen(function* () {
                if (plan.type === "link") {
                  const email = identityEmail(account);
                  if (email === null) {
                    return yield* new Unexpected({ message: "Could not finish signing in." });
                  }
                  yield* writeIdentity(provider, account, plan.userId, email);
                  return plan.userId;
                }
                const userId = randomUUID();
                yield* insertUser({
                  id: userId,
                  email: plan.email,
                  name: plan.name,
                  passwordHash: null,
                  avatarUrl: account.avatarUrl,
                });
                yield* writeIdentity(provider, account, userId, plan.email);
                return userId;
              }),
            )
            .pipe(
              Effect.catch((error) => {
                if (!isUniqueViolation(error)) {
                  return Effect.fail(error);
                }
                return Effect.gen(function* () {
                  const winner = yield* readIdentity(provider, account.providerUserId);
                  if (winner !== undefined) {
                    return winner.userId;
                  }
                  const again = yield* matchesFor(provider, account);
                  const next = planOAuthAccount(account, null, again);
                  if (next.type === "reject") {
                    return yield* reject(provider, next.code);
                  }
                  if (next.type !== "link") {
                    return yield* new Unexpected({ message: "Could not finish signing in." });
                  }
                  const email = identityEmail(account);
                  if (email === null) {
                    return yield* new Unexpected({ message: "Could not finish signing in." });
                  }
                  const inserted = yield* writeIdentity(provider, account, next.userId, email).pipe(
                    Effect.map(() => true),
                    Effect.catch((insertError) => {
                      if (!isUniqueViolation(insertError)) {
                        return Effect.fail(insertError);
                      }
                      return Effect.succeed(false);
                    }),
                  );
                  if (inserted) {
                    return next.userId;
                  }
                  const linked = yield* readIdentity(provider, account.providerUserId);
                  if (linked !== undefined) {
                    return linked.userId;
                  }
                  return yield* reject(provider, "linked");
                });
              }),
            );

          if (account.avatarUrl !== null) {
            yield* fillAvatar({ userId: created, avatarUrl: account.avatarUrl }).pipe(
              failUnexpected("Could not finish signing in."),
            );
          }
          return created;
        });

      const takeState = (state: string) =>
        Effect.gen(function* () {
          if (state.length === 0 || state.length > 512) {
            return undefined;
          }
          const found = yield* consumeState({ stateHash: hashToken(state) }).pipe(
            failUnexpected("Could not finish signing in."),
          );
          return Option.getOrUndefined(found);
        });

      const begin = Effect.fn("OAuth.begin")(function* (input: BeginOAuthInput) {
        const creds = credentialsFor(config, input.provider);
        const redirectUri = callbackUrl(config.apiOrigin, input.provider);
        const origin = allowedWebOrigin(input.webOrigin, config.webOrigins) ?? firstOrigin(config);
        if (creds === null || redirectUri === null) {
          return errorRedirect(origin, input.provider, "unavailable");
        }

        yield* cleanup;
        const state = randomBytes(32).toString("base64url");
        const verifier = randomBytes(32).toString("base64url");
        yield* insertState({
          id: randomUUID(),
          provider: input.provider,
          stateHash: hashToken(state),
          codeVerifier: verifier,
          returnTo: safeReturnPath(input.returnTo),
          webOrigin: origin,
          expiresAt: new Date(Date.now() + stateMinutes * 60 * 1000).toISOString(),
        }).pipe(failUnexpected("Could not start sign-in."));

        return authorizationUrl({
          provider: input.provider,
          clientId: creds.clientId,
          redirectUri,
          state,
          verifier,
        });
      });

      const finishInner = Effect.fn("OAuth.finish")(function* (input: FinishOAuthInput) {
        const fallback = firstOrigin(config);
        const creds = credentialsFor(config, input.provider);
        const redirectUri = callbackUrl(config.apiOrigin, input.provider);
        if (creds === null || redirectUri === null) {
          return errorRedirect(fallback, input.provider, "unavailable");
        }

        if (input.providerError !== null) {
          const code = input.providerError === "access_denied" ? "access_denied" : "provider";
          const row = input.state === null ? undefined : yield* takeState(input.state);
          const origin =
            row === undefined
              ? fallback
              : (allowedWebOrigin(row.webOrigin, config.webOrigins) ?? fallback);
          return errorRedirect(origin, input.provider, code);
        }

        if (input.code === null || input.state === null || input.code.length > 2048) {
          return errorRedirect(fallback, input.provider, "expired");
        }

        const row = yield* takeState(input.state);
        if (row === undefined || row.provider !== input.provider) {
          return errorRedirect(fallback, input.provider, "expired");
        }

        const origin = allowedWebOrigin(row.webOrigin, config.webOrigins) ?? fallback;
        const returnTo = safeReturnPath(row.returnTo);
        const accessToken = yield* exchangeCode({
          provider: input.provider,
          code: input.code,
          codeVerifier: row.codeVerifier,
          redirectUri,
          clientId: creds.clientId,
          clientSecret: creds.clientSecret,
        }).pipe(
          Effect.tapError((error) => Effect.logError("OAuth token exchange failed", error)),
          Effect.catch(() => Effect.succeed(null)),
        );
        if (accessToken === null) {
          return errorRedirect(origin, input.provider, "provider");
        }

        const account = yield* loadAccount(input.provider, accessToken).pipe(
          Effect.tapError((error) => Effect.logError("OAuth profile request failed", error)),
          Effect.catch(() => Effect.succeed(null)),
        );
        if (account === null) {
          return errorRedirect(origin, input.provider, "provider");
        }

        const resolved = yield* resolveUser(input.provider, account).pipe(
          Effect.map((id) => ({ type: "user" as const, id })),
          Effect.catch((error) => {
            const code = flowCode(error);
            if (code !== null) {
              return Effect.succeed({ type: "reject" as const, code });
            }
            return Effect.fail(error);
          }),
        );
        if (resolved.type === "reject") {
          return errorRedirect(origin, input.provider, resolved.code);
        }

        const user = yield* present(resolved.id);
        const session = yield* openSession(user);
        const code = randomBytes(32).toString("base64url");
        yield* insertExchange({
          id: randomUUID(),
          codeHash: hashToken(code),
          token: session.token,
          userId: user.id,
          expiresAt: new Date(Date.now() + exchangeMinutes * 60 * 1000).toISOString(),
        }).pipe(failUnexpected("Could not finish signing in."));
        return successRedirect(origin, code, returnTo);
      });

      const finish = (input: FinishOAuthInput) =>
        finishInner(input).pipe(
          Effect.catch((error) =>
            Effect.logError("OAuth callback failed", error).pipe(
              Effect.as(errorRedirect(firstOrigin(config), input.provider, "unavailable")),
            ),
          ),
        );

      const redeem = Effect.fn("OAuth.redeem")(function* (code: string) {
        const trimmed = code.trim();
        if (trimmed.length < 20 || trimmed.length > 256) {
          return yield* new BadInput({
            message: "That sign-in link is no longer valid. Try again.",
          });
        }
        const found = yield* consumeExchange({ codeHash: hashToken(trimmed) }).pipe(
          failUnexpected("Could not finish signing in."),
        );
        const row = Option.getOrUndefined(found);
        if (row === undefined) {
          return yield* new BadInput({
            message: "That sign-in link is no longer valid. Try again.",
          });
        }
        const user = yield* present(row.userId);
        return { token: row.token, user };
      });

      return OAuth.of({
        providers,
        begin,
        finish,
        redeem,
      });
    }),
  );
}

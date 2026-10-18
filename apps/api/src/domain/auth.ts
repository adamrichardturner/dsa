import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { Context, Effect, Layer, Option, Result, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { AppConfig } from "../config.js";
import { BadInput, EmailTaken, InvalidCredentials, Unauthorized, Unexpected } from "./errors.js";
import {
  accountCreatedMessage,
  linkOrigin,
  Mail,
  passwordChangedMessage,
  passwordResetMessage,
} from "./mail.js";
import { isAdminEmail } from "./admin-access.js";
import type { AuthResult, OauthProvider, PublicUser } from "./models.js";
import { isOauthProvider } from "./oauth-plan.js";

const sessionDays = 30;
const dummyHash =
  "scrypt$00112233445566778899aabbccddeeff$00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";

export interface SignUpInput {
  readonly email: string;
  readonly name: string;
  readonly password: string;
}

export interface SignInInput {
  readonly email: string;
  readonly password: string;
}

export interface UpdateProfileInput {
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
}

export interface ChangePasswordInput {
  readonly currentPassword: string;
  readonly nextPassword: string;
}

export interface DeleteAccountInput {
  readonly password: string | null;
  readonly confirmation: string | null;
}

export interface ResetPasswordInput {
  readonly token: string;
  readonly password: string;
}

export class RequestAuth extends Context.Service<
  RequestAuth,
  { readonly token: string | null }
>()("app/RequestAuth") {}

const UserRow = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String,
  passwordHash: Schema.NullOr(Schema.String),
  avatarUrl: Schema.NullOr(Schema.String),
  auditMode: Schema.Boolean,
});

const deriveKey = (password: string, salt: string): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, 32, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });

const hashPassword = (password: string): Effect.Effect<string, Unexpected> =>
  Effect.gen(function* () {
    const salt = randomBytes(16).toString("hex");
    const key = yield* Effect.tryPromise({
      try: () => deriveKey(password, salt),
      catch: () => new Unexpected({ message: "Could not store that password." }),
    });
    return `scrypt$${salt}$${key.toString("hex")}`;
  });

const verifyPassword = (password: string, stored: string): Effect.Effect<boolean, Unexpected> =>
  Effect.gen(function* () {
    const [scheme, salt, hash] = stored.split("$");
    if (scheme !== "scrypt" || salt === undefined || hash === undefined) {
      return false;
    }

    const key = yield* Effect.tryPromise({
      try: () => deriveKey(password, salt),
      catch: () => new Unexpected({ message: "Could not check that password." }),
    });
    const expected = Buffer.from(hash, "hex");
    if (expected.length !== key.length) {
      return false;
    }
    return timingSafeEqual(expected, key);
  });

const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const emailProblem = (email: string): BadInput | null => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new BadInput({ message: "Enter a valid email address." });
  }
  return null;
};

const nameProblem = (name: string): BadInput | null => {
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 80) {
    return new BadInput({ message: "Enter a name up to 80 characters." });
  }
  return null;
};

const passwordProblem = (password: string): BadInput | null => {
  if (password.length < 8) {
    return new BadInput({ message: "Use a password of at least 8 characters." });
  }
  return null;
};

const parseUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const readAvatarUrl = (value: string | null): BadInput | string | null => {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.length > 2048) {
    return new BadInput({ message: "Use a shorter picture link." });
  }
  const parsed = parseUrl(trimmed);
  if (parsed === null || (parsed.protocol !== "http:" && parsed.protocol !== "https:")) {
    return new BadInput({ message: "Enter a picture link starting with http or https." });
  }
  return trimmed;
};

const credentialProblem = (email: string, password: string, name?: string): BadInput | null => {
  const emailError = emailProblem(email);
  if (emailError !== null) {
    return emailError;
  }
  const passwordError = passwordProblem(password);
  if (passwordError !== null) {
    return passwordError;
  }
  if (name === undefined) {
    return null;
  }
  return nameProblem(name);
};

const checkPassword = (
  password: string,
  stored: string,
  emptyMessage: string,
): Effect.Effect<void, BadInput | InvalidCredentials | Unexpected> =>
  Effect.gen(function* () {
    if (password.length === 0) {
      return yield* new BadInput({ message: emptyMessage });
    }
    const valid = yield* verifyPassword(password, stored);
    if (!valid) {
      return yield* new InvalidCredentials({ message: "Password is incorrect." });
    }
  });

const failUnexpected = (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapError((error) => Effect.logError(message, error)),
    Effect.mapError(() => new Unexpected({ message })),
  );

export class Auth extends Context.Service<
  Auth,
  {
    signUp(input: SignUpInput): Effect.Effect<AuthResult, BadInput | EmailTaken | Unexpected>;
    signIn(input: SignInInput): Effect.Effect<AuthResult, BadInput | InvalidCredentials | Unexpected>;
    signOut: Effect.Effect<boolean, Unexpected, RequestAuth>;
    readonly currentUser: Effect.Effect<PublicUser, Unauthorized | Unexpected, RequestAuth>;
    updateProfile(
      input: UpdateProfileInput,
    ): Effect.Effect<PublicUser, BadInput | EmailTaken | Unauthorized | Unexpected, RequestAuth>;
    setAuditMode(
      enabled: boolean,
    ): Effect.Effect<PublicUser, Unauthorized | Unexpected, RequestAuth>;
    changePassword(
      input: ChangePasswordInput,
    ): Effect.Effect<boolean, BadInput | InvalidCredentials | Unauthorized | Unexpected, RequestAuth>;
    deleteAccount(
      input: DeleteAccountInput,
    ): Effect.Effect<boolean, BadInput | InvalidCredentials | Unauthorized | Unexpected, RequestAuth>;
    requestPasswordReset(email: string): Effect.Effect<boolean, BadInput | Unexpected>;
    resetPassword(input: ResetPasswordInput): Effect.Effect<boolean, BadInput | Unexpected>;
  }
>()("app/Auth") {
  static readonly layer = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const config = yield* AppConfig;
      const mail = yield* Mail;

      const findByEmail = SqlSchema.findOneOption({
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
              audit_mode AS "auditMode"
            FROM users
            WHERE email = ${request.email}
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
            INSERT INTO users (id, email, name, password_hash, avatar_url)
            VALUES (
              ${request.id},
              ${request.email},
              ${request.name},
              ${request.passwordHash},
              ${request.avatarUrl}
            )
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

      const findCurrent = SqlSchema.findOneOption({
        Request: Schema.Struct({ tokenHash: Schema.String }),
        Result: UserRow,
        execute: (request) =>
          sql`
            SELECT
              u.id,
              u.email,
              u.name,
              u.password_hash AS "passwordHash",
              u.avatar_url AS "avatarUrl",
              u.audit_mode AS "auditMode"
            FROM sessions AS s
            JOIN users AS u ON u.id = s.user_id
            WHERE s.token_hash = ${request.tokenHash}
              AND s.expires_at > NOW()
          `,
      });

      const deleteSession = SqlSchema.void({
        Request: Schema.Struct({ tokenHash: Schema.String }),
        execute: (request) =>
          sql`DELETE FROM sessions WHERE token_hash = ${request.tokenHash}`,
      });

      const findById = SqlSchema.findOneOption({
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
              audit_mode AS "auditMode"
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

      const updateUserRow = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          email: Schema.String,
          name: Schema.String,
          avatarUrl: Schema.NullOr(Schema.String),
        }),
        execute: (request) =>
          sql`
            UPDATE users
            SET email = ${request.email}, name = ${request.name}, avatar_url = ${request.avatarUrl}
            WHERE id = ${request.id}
          `,
      });

      const updatePassword = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          passwordHash: Schema.String,
        }),
        execute: (request) =>
          sql`
            UPDATE users
            SET password_hash = ${request.passwordHash}
            WHERE id = ${request.id}
          `,
      });

      const deleteUser = SqlSchema.void({
        Request: Schema.Struct({ id: Schema.String }),
        execute: (request) => sql`DELETE FROM users WHERE id = ${request.id}`,
      });

      const deleteResets = SqlSchema.void({
        Request: Schema.Struct({ userId: Schema.String }),
        execute: (request) => sql`DELETE FROM password_resets WHERE user_id = ${request.userId}`,
      });

      const deleteSessions = SqlSchema.void({
        Request: Schema.Struct({ userId: Schema.String }),
        execute: (request) => sql`DELETE FROM sessions WHERE user_id = ${request.userId}`,
      });

      const insertReset = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          userId: Schema.String,
          tokenHash: Schema.String,
          expiresAt: Schema.String,
        }),
        execute: (request) =>
          sql`
            INSERT INTO password_resets (id, user_id, token_hash, expires_at)
            VALUES (
              ${request.id},
              ${request.userId},
              ${request.tokenHash},
              ${request.expiresAt}::timestamptz
            )
          `,
      });

      const ResetRow = Schema.Struct({
        userId: Schema.String,
        email: Schema.String,
        name: Schema.String,
      });

      const findReset = SqlSchema.findOneOption({
        Request: Schema.Struct({ tokenHash: Schema.String }),
        Result: ResetRow,
        execute: (request) =>
          sql`
            SELECT
              pr.user_id AS "userId",
              u.email,
              u.name
            FROM password_resets AS pr
            JOIN users AS u ON u.id = pr.user_id
            WHERE pr.token_hash = ${request.tokenHash}
              AND pr.expires_at > NOW()
          `,
      });

      const withProviders = (row: {
        readonly id: string;
        readonly email: string;
        readonly name: string;
        readonly passwordHash: string | null;
        readonly avatarUrl: string | null;
        readonly auditMode: boolean;
      }) =>
        Effect.gen(function* () {
          const linked = yield* listProviderRows({ userId: row.id }).pipe(
            failUnexpected("Could not load your account."),
          );
          const providers: OauthProvider[] = [];
          for (const item of linked) {
            if (isOauthProvider(item.provider)) {
              providers.push(item.provider);
            }
          }
          return {
            id: row.id,
            email: row.email,
            name: row.name,
            avatarUrl: row.avatarUrl,
            hasPassword: row.passwordHash !== null,
            providers,
            isAdmin: isAdminEmail(row.email),
            auditMode: row.auditMode,
          };
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

      const signUp = Effect.fn("Auth.signUp")(function* (input: SignUpInput) {
        const email = normalizeEmail(input.email);
        const name = input.name.trim();
        const problem = credentialProblem(email, input.password, name);
        if (problem !== null) {
          return yield* problem;
        }

        const passwordHash = yield* hashPassword(input.password);
        const user = {
          id: randomUUID(),
          email,
          name,
          avatarUrl: null,
        };

        yield* insertUser({
          id: user.id,
          email: user.email,
          name: user.name,
          passwordHash,
          avatarUrl: null,
        }).pipe(
          Effect.mapError((error) => {
            if (error._tag === "SqlError" && error.cause._tag === "UniqueViolation") {
              return new EmailTaken({
                message: "An account with that email already exists.",
              });
            }
            return new Unexpected({ message: "Could not create the account." });
          }),
        );

        const origin = linkOrigin(config.webOrigins);
        const sent = yield* mail
          .send(
            accountCreatedMessage({
              name: user.name,
              email: user.email,
              courseUrl: `${origin}/course`,
            }),
          )
          .pipe(Effect.result);
        if (Result.isFailure(sent)) {
          yield* deleteUser({ id: user.id }).pipe(
            Effect.catch((error) =>
              Effect.logError("Could not remove the account after the email failed.", error),
            ),
          );
          return yield* sent.failure;
        }

        return yield* openSession(
          yield* withProviders({
            id: user.id,
            email: user.email,
            name: user.name,
            passwordHash,
            avatarUrl: null,
            auditMode: false,
          }),
        );
      });

      const signIn = Effect.fn("Auth.signIn")(function* (input: SignInInput) {
        const email = normalizeEmail(input.email);
        const problem = credentialProblem(email, input.password);
        if (problem !== null) {
          return yield* problem;
        }

        const found = yield* findByEmail({ email }).pipe(
          failUnexpected("Could not look up that account."),
        );
        const user = Option.getOrUndefined(found);
        const storedHash = user?.passwordHash ?? dummyHash;
        const valid = yield* verifyPassword(input.password, storedHash);
        if (user !== undefined && user.passwordHash === null) {
          return yield* new InvalidCredentials({
            message:
              "This email uses Google or GitHub sign-in. Continue with one of those. You can add a password afterward from settings.",
          });
        }
        if (user === undefined || !valid) {
          return yield* new InvalidCredentials({
            message: "Email or password is incorrect.",
          });
        }

        return yield* openSession(yield* withProviders(user));
      });

      const signOut = Effect.gen(function* () {
        const request = yield* RequestAuth;
        if (request.token === null) {
          return true;
        }
        yield* deleteSession({ tokenHash: hashToken(request.token) }).pipe(
          failUnexpected("Could not sign out."),
        );
        return true;
      });

      const currentUser = Effect.gen(function* () {
        const request = yield* RequestAuth;
        if (request.token === null) {
          return yield* new Unauthorized({ message: "Sign in to continue." });
        }
        const found = yield* findCurrent({ tokenHash: hashToken(request.token) }).pipe(
          failUnexpected("Could not load your account."),
        );
        const user = Option.getOrUndefined(found);
        if (user === undefined) {
          return yield* new Unauthorized({ message: "Sign in to continue." });
        }
        return yield* withProviders(user);
      });

      const loadAccount = Effect.fn("Auth.loadAccount")(function* () {
        const user = yield* currentUser;
        const found = yield* findById({ id: user.id }).pipe(
          failUnexpected("Could not load your account."),
        );
        const row = Option.getOrUndefined(found);
        if (row === undefined) {
          return yield* new Unauthorized({ message: "Sign in to continue." });
        }
        return row;
      });

      const updateProfile = Effect.fn("Auth.updateProfile")(function* (input: UpdateProfileInput) {
        const account = yield* loadAccount();
        const email = normalizeEmail(input.email);
        const name = input.name.trim();
        const emailError = emailProblem(email);
        if (emailError !== null) {
          return yield* emailError;
        }
        const nameError = nameProblem(name);
        if (nameError !== null) {
          return yield* nameError;
        }
        const avatarUrl = readAvatarUrl(input.avatarUrl);
        if (avatarUrl instanceof BadInput) {
          return yield* avatarUrl;
        }

        yield* updateUserRow({
          id: account.id,
          email,
          name,
          avatarUrl,
        }).pipe(
          Effect.mapError((error) => {
            if (error._tag === "SqlError" && error.cause._tag === "UniqueViolation") {
              return new EmailTaken({
                message: "An account with that email already exists.",
              });
            }
            return new Unexpected({ message: "Could not update the account." });
          }),
        );

        return yield* withProviders({
          id: account.id,
          email,
          name,
          passwordHash: account.passwordHash,
          avatarUrl,
          auditMode: account.auditMode,
        });
      });

      const updateAuditMode = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          auditMode: Schema.Boolean,
        }),
        execute: (request) =>
          sql`
            UPDATE users
            SET audit_mode = ${request.auditMode}
            WHERE id = ${request.id}
          `,
      });

      const setAuditMode = Effect.fn("Auth.setAuditMode")(function* (enabled: boolean) {
        const account = yield* loadAccount();
        yield* updateAuditMode({ id: account.id, auditMode: enabled }).pipe(
          failUnexpected("Could not update audit mode."),
        );
        return yield* withProviders({
          id: account.id,
          email: account.email,
          name: account.name,
          passwordHash: account.passwordHash,
          avatarUrl: account.avatarUrl,
          auditMode: enabled,
        });
      });

      const changePassword = Effect.fn("Auth.changePassword")(function* (input: ChangePasswordInput) {
        const account = yield* loadAccount();
        if (account.passwordHash !== null) {
          yield* checkPassword(
            input.currentPassword,
            account.passwordHash,
            "Enter your current password.",
          );
        }
        const nextError = passwordProblem(input.nextPassword);
        if (nextError !== null) {
          return yield* nextError;
        }
        const passwordHash = yield* hashPassword(input.nextPassword);
        yield* updatePassword({ id: account.id, passwordHash }).pipe(
          failUnexpected("Could not update the password."),
        );
        return true;
      });

      const deleteAccount = Effect.fn("Auth.deleteAccount")(function* (input: DeleteAccountInput) {
        const account = yield* loadAccount();
        const confirmation = normalizeEmail(input.confirmation ?? "");
        if (account.passwordHash === null && confirmation !== account.email) {
          return yield* new BadInput({ message: "Type your email address to confirm." });
        }
        if (account.passwordHash !== null) {
          yield* checkPassword(
            input.password ?? "",
            account.passwordHash,
            "Enter your password to confirm.",
          );
        }
        yield* deleteUser({ id: account.id }).pipe(failUnexpected("Could not delete the account."));
        return true;
      });

      const requestPasswordReset = Effect.fn("Auth.requestPasswordReset")(function* (emailRaw: string) {
        const email = normalizeEmail(emailRaw);
        const problem = emailProblem(email);
        if (problem !== null) {
          return yield* problem;
        }

        const found = yield* findByEmail({ email }).pipe(
          failUnexpected("Could not look up that account."),
        );
        const user = Option.getOrUndefined(found);
        if (user === undefined || user.passwordHash === null) {
          return true;
        }

        const token = randomBytes(32).toString("base64url");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        yield* deleteResets({ userId: user.id }).pipe(
          failUnexpected("Could not start a password reset."),
        );
        yield* insertReset({
          id: randomUUID(),
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt,
        }).pipe(failUnexpected("Could not start a password reset."));

        const origin = linkOrigin(config.webOrigins);
        yield* mail.send(
          passwordResetMessage({
            name: user.name,
            email: user.email,
            resetUrl: `${origin}/reset-password?token=${encodeURIComponent(token)}`,
          }),
        );
        return true;
      });

      const resetPassword = Effect.fn("Auth.resetPassword")(function* (input: ResetPasswordInput) {
        const token = input.token.trim();
        if (token.length < 20) {
          return yield* new BadInput({ message: "That reset link is invalid or has expired." });
        }
        const nextError = passwordProblem(input.password);
        if (nextError !== null) {
          return yield* nextError;
        }

        const found = yield* findReset({ tokenHash: hashToken(token) }).pipe(
          failUnexpected("Could not check that reset link."),
        );
        const reset = Option.getOrUndefined(found);
        if (reset === undefined) {
          return yield* new BadInput({ message: "That reset link is invalid or has expired." });
        }

        const passwordHash = yield* hashPassword(input.password);
        yield* updatePassword({ id: reset.userId, passwordHash }).pipe(
          failUnexpected("Could not update the password."),
        );
        yield* deleteSessions({ userId: reset.userId }).pipe(
          failUnexpected("Could not update the password."),
        );
        yield* deleteResets({ userId: reset.userId }).pipe(
          failUnexpected("Could not update the password."),
        );
        const origin = linkOrigin(config.webOrigins);
        yield* mail
          .send(
            passwordChangedMessage({
              name: reset.name,
              email: reset.email,
              signInUrl: `${origin}/sign-in`,
            }),
          )
          .pipe(
            Effect.catch((error) =>
              Effect.logError("Could not send the password confirmation.", error),
            ),
          );
        return true;
      });

      return Auth.of({
        signUp,
        signIn,
        signOut,
        currentUser,
        updateProfile,
        setAuditMode,
        changePassword,
        deleteAccount,
        requestPasswordReset,
        resetPassword,
      });
    }),
  );
}

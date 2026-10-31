import { ConfigProvider, Effect, Layer, ManagedRuntime } from "effect";
import { PgClient } from "@effect/sql-pg";
import { AppConfig } from "./config.js";
import { prepareDatabase } from "./db/prepare.js";
import { Auth, RequestAuth } from "./domain/auth.js";
import { Admin } from "./domain/admin.js";
import { Mail } from "./domain/mail.js";
import { OAuth } from "./domain/oauth.js";
import { Catalog } from "./domain/catalog.js";
import { Insights } from "./domain/insights.js";
import { Notifications } from "./domain/notifications.js";
import { Solutions } from "./domain/solutions.js";

const DbLive = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* AppConfig;
    return PgClient.layer({
      host: config.pgHost,
      port: config.pgPort,
      database: config.pgDatabase,
      username: config.pgUser,
      password: config.pgPassword,
      maxConnections: 10,
    });
  }),
);

const AuthLive = Auth.layer.pipe(Layer.provide(Mail.layer));
const AdminLive = Admin.layer.pipe(Layer.provide(AuthLive));

export const AppLayer = Layer.mergeAll(
  AuthLive,
  AdminLive,
  OAuth.layer,
  Catalog.layer,
  Solutions.layer,
  Insights.layer,
  Notifications.layer,
  AppConfig.layer,
).pipe(
  Layer.provideMerge(DbLive),
  Layer.provide(AppConfig.layer),
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromEnv())),
);

export const runtime = ManagedRuntime.make(AppLayer);

type AppRequirements =
  | Auth
  | Admin
  | OAuth
  | Catalog
  | Solutions
  | Insights
  | Notifications
  | AppConfig
  | RequestAuth;

export const runEffect = <A, E>(
  token: string | null,
  effect: Effect.Effect<A, E, AppRequirements>,
): Promise<A> =>
  runtime.runPromise(effect.pipe(Effect.provideService(RequestAuth, { token })));

export const boot = Effect.gen(function* () {
  yield* prepareDatabase;
  return yield* AppConfig;
});

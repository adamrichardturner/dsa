import { Config, Context, Effect, Layer, Redacted } from "effect";

const optionalSecret = (name: string) =>
  Config.Redacted(name).pipe(Config.withDefault(Redacted.make("")));

const optionalString = (name: string) => Config.String(name).pipe(Config.withDefault(""));

const stripTrailingSlash = (value: string): string => value.trim().replace(/\/+$/, "");

export class AppConfig extends Context.Service<
  AppConfig,
  {
    readonly apiPort: number;
    readonly apiOrigin: string;
    readonly webOrigins: readonly string[];
    readonly pgHost: string;
    readonly pgPort: number;
    readonly pgDatabase: string;
    readonly pgUser: string;
    readonly pgPassword: Redacted.Redacted<string>;
    readonly googleClientId: string;
    readonly googleClientSecret: Redacted.Redacted<string>;
    readonly githubClientId: string;
    readonly githubClientSecret: Redacted.Redacted<string>;
    readonly resendApiKey: Redacted.Redacted<string>;
  }
>()("app/AppConfig") {
  static readonly layer = Layer.effect(
    AppConfig,
    Effect.gen(function* () {
      const apiPort = yield* Config.Port("API_PORT").pipe(Config.withDefault(4000));
      const apiOrigin = yield* Config.String("API_ORIGIN").pipe(
        Config.withDefault("http://localhost:4000"),
      );
      const webOrigin = yield* Config.String("WEB_ORIGIN").pipe(
        Config.withDefault("http://localhost:3000"),
      );
      const pgHost = yield* Config.String("POSTGRES_HOST").pipe(
        Config.withDefault("localhost"),
      );
      const pgPort = yield* Config.Port("POSTGRES_PORT").pipe(Config.withDefault(5432));
      const pgDatabase = yield* Config.String("POSTGRES_DB");
      const pgUser = yield* Config.String("POSTGRES_USER");
      const pgPassword = yield* Config.Redacted("POSTGRES_PASSWORD");
      const googleClientId = yield* optionalString("GOOGLE_CLIENT_ID");
      const googleClientSecret = yield* optionalSecret("GOOGLE_CLIENT_SECRET");
      const githubClientId = yield* optionalString("GITHUB_CLIENT_ID");
      const githubClientSecret = yield* optionalSecret("GITHUB_CLIENT_SECRET");
      const resendApiKey = yield* optionalSecret("RESEND_API_KEY");
      const webOrigins = webOrigin
        .split(",")
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0);

      return AppConfig.of({
        apiPort,
        apiOrigin: stripTrailingSlash(apiOrigin),
        webOrigins,
        pgHost,
        pgPort,
        pgDatabase,
        pgUser,
        pgPassword,
        googleClientId: googleClientId.trim(),
        googleClientSecret,
        githubClientId: githubClientId.trim(),
        githubClientSecret,
        resendApiKey,
      });
    }),
  );
}

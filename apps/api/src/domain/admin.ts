import { Context, Effect, Layer, Option, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { BadInput, NotFound, Unauthorized, Unexpected } from "./errors.js";
import { adminDeleteBlock } from "./admin-access.js";
import { buildAdminOverview, type AdminOverviewUser } from "./admin-overview.js";
import { Auth, RequestAuth } from "./auth.js";
import type { AdminOverview, OauthProvider } from "./models.js";
import { isOauthProvider } from "./oauth-plan.js";

const failUnexpected = (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapError((error) => Effect.logError(message, error)),
    Effect.mapError(() => new Unexpected({ message })),
  );

const UserRow = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.String,
  avatarUrl: Schema.NullOr(Schema.String),
  hasPassword: Schema.Boolean,
  createdAt: Schema.String,
});

const ProviderRow = Schema.Struct({
  userId: Schema.String,
  provider: Schema.String,
});

const ProblemRow = Schema.Struct({
  id: Schema.String,
  lessonId: Schema.String,
  topic: Schema.String,
});

const ProblemStatRow = Schema.Struct({
  userId: Schema.String,
  problemId: Schema.String,
  solved: Schema.Boolean,
  attempts: Schema.Number,
});

const ActivityRow = Schema.Struct({
  userId: Schema.String,
  attempts: Schema.Number,
  passes: Schema.Number,
  lastActiveAt: Schema.String,
});

const DayRow = Schema.Struct({
  day: Schema.String,
  submissions: Schema.Number,
  passes: Schema.Number,
});

const AccountRow = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
});

export class Admin extends Context.Service<
  Admin,
  {
    overview(): Effect.Effect<AdminOverview, Unauthorized | Unexpected, Auth | RequestAuth>;
    deleteAccount(
      userId: string,
    ): Effect.Effect<boolean, BadInput | NotFound | Unauthorized | Unexpected, Auth | RequestAuth>;
  }
>()("app/Admin") {
  static readonly layer = Layer.effect(
    Admin,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const listUsers = SqlSchema.findAll({
        Request: Schema.Void,
        Result: UserRow,
        execute: () =>
          sql`
            SELECT
              id,
              email,
              name,
              avatar_url AS "avatarUrl",
              password_hash IS NOT NULL AS "hasPassword",
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
            FROM users
            ORDER BY created_at DESC
          `,
      });

      const listProviders = SqlSchema.findAll({
        Request: Schema.Void,
        Result: ProviderRow,
        execute: () =>
          sql`
            SELECT user_id AS "userId", provider
            FROM oauth_identities
            ORDER BY provider
          `,
      });

      const listProblems = SqlSchema.findAll({
        Request: Schema.Void,
        Result: ProblemRow,
        execute: () =>
          sql`
            SELECT p.id, p.lesson_id AS "lessonId", p.topic
            FROM problems AS p
            JOIN lessons AS l ON l.id = p.lesson_id
            JOIN modules AS m ON m.id = l.module_id
            ORDER BY m.sort_order, l.sort_order, p.sort_order
          `,
      });

      const listProblemStats = SqlSchema.findAll({
        Request: Schema.Void,
        Result: ProblemStatRow,
        execute: () =>
          sql`
            SELECT
              user_id AS "userId",
              problem_id AS "problemId",
              BOOL_OR(passed) AS solved,
              COUNT(*)::int AS attempts
            FROM submissions
            GROUP BY user_id, problem_id
          `,
      });

      const listActivity = SqlSchema.findAll({
        Request: Schema.Void,
        Result: ActivityRow,
        execute: () =>
          sql`
            SELECT
              user_id AS "userId",
              COUNT(*)::int AS attempts,
              COUNT(*) FILTER (WHERE passed)::int AS passes,
              to_char(MAX(created_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "lastActiveAt"
            FROM submissions
            GROUP BY user_id
          `,
      });

      const listDaily = SqlSchema.findAll({
        Request: Schema.Void,
        Result: DayRow,
        execute: () =>
          sql`
            SELECT
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
              COUNT(*)::int AS submissions,
              COUNT(*) FILTER (WHERE passed)::int AS passes
            FROM submissions
            WHERE created_at >= (date_trunc('day', NOW() AT TIME ZONE 'UTC') - INTERVAL '29 days') AT TIME ZONE 'UTC'
            GROUP BY 1
            ORDER BY 1
          `,
      });

      const findAccount = SqlSchema.findOneOption({
        Request: Schema.Struct({ id: Schema.String }),
        Result: AccountRow,
        execute: (request) =>
          sql`
            SELECT id, email
            FROM users
            WHERE id = ${request.id}
          `,
      });

      const deleteUser = SqlSchema.void({
        Request: Schema.Struct({ id: Schema.String }),
        execute: (request) => sql`DELETE FROM users WHERE id = ${request.id}`,
      });

      const requireAdmin = Effect.fn("Admin.requireAdmin")(function* () {
        const auth = yield* Auth;
        const user = yield* auth.currentUser;
        if (!user.isAdmin) {
          return yield* new Unauthorized({
            message: "You do not have access to the admin panel.",
          });
        }
        return user;
      });

      const overview = Effect.fn("Admin.overview")(function* () {
        yield* requireAdmin();
        const rows = yield* listUsers().pipe(failUnexpected("Could not load accounts."));
        const providerRows = yield* listProviders().pipe(failUnexpected("Could not load accounts."));
        const problems = yield* listProblems().pipe(failUnexpected("Could not load accounts."));
        const problemStats = yield* listProblemStats().pipe(
          failUnexpected("Could not load accounts."),
        );
        const activity = yield* listActivity().pipe(failUnexpected("Could not load accounts."));
        const daily = yield* listDaily().pipe(failUnexpected("Could not load accounts."));

        const providersByUser: Record<string, OauthProvider[]> = {};
        for (const row of providerRows) {
          if (!isOauthProvider(row.provider)) {
            continue;
          }
          const providers = providersByUser[row.userId] ?? [];
          providers.push(row.provider);
          providersByUser[row.userId] = providers;
        }

        const users: AdminOverviewUser[] = [];
        for (const row of rows) {
          users.push({
            id: row.id,
            email: row.email,
            name: row.name,
            avatarUrl: row.avatarUrl,
            hasPassword: row.hasPassword,
            providers: providersByUser[row.id] ?? [],
            createdAt: row.createdAt,
          });
        }

        return buildAdminOverview({
          now: new Date(),
          users,
          problems,
          problemStats,
          activity,
          daily,
        });
      });

      const deleteAccount = Effect.fn("Admin.deleteAccount")(function* (userId: string) {
        yield* requireAdmin();
        const id = userId.trim();
        if (id.length === 0) {
          return yield* new NotFound({ message: "That account does not exist." });
        }
        const found = yield* findAccount({ id }).pipe(
          failUnexpected("Could not delete that account."),
        );
        const account = Option.getOrUndefined(found);
        if (account === undefined) {
          return yield* new NotFound({ message: "That account does not exist." });
        }
        const blocked = adminDeleteBlock(account.email);
        if (blocked !== null) {
          return yield* new BadInput({ message: blocked });
        }
        yield* deleteUser({ id: account.id }).pipe(failUnexpected("Could not delete that account."));
        return true;
      });

      return Admin.of({
        overview,
        deleteAccount,
      });
    }),
  );
}

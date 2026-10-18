import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { Unexpected } from "./errors.js";
import { buildInsights } from "./insights-view.js";
import type { AnalyticsView } from "./models.js";

const ProblemRow = Schema.Struct({
  id: Schema.String,
  lessonId: Schema.String,
  topic: Schema.String,
  difficulty: Schema.String,
  slug: Schema.String,
  title: Schema.String,
  weekNumber: Schema.Number,
  moduleTitle: Schema.String,
  moduleOrder: Schema.Number,
  lessonOrder: Schema.Number,
});

const StatRow = Schema.Struct({
  problemId: Schema.String,
  solved: Schema.Boolean,
  attempts: Schema.Number,
});

const AttemptRow = Schema.Struct({
  attempts: Schema.Number,
  passes: Schema.Number,
});

const DayRow = Schema.Struct({
  day: Schema.String,
  submissions: Schema.Number,
  passes: Schema.Number,
});

const failUnexpected = (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapError((error) => Effect.logError(message, error)),
    Effect.mapError(() => new Unexpected({ message })),
  );

export class Insights extends Context.Service<
  Insights,
  {
    forUser(userId: string): Effect.Effect<AnalyticsView, Unexpected>;
  }
>()("app/Insights") {
  static readonly layer = Layer.effect(
    Insights,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const listProblems = SqlSchema.findAll({
        Request: Schema.Void,
        Result: ProblemRow,
        execute: () =>
          sql`
            SELECT
              p.id,
              p.lesson_id AS "lessonId",
              p.topic,
              p.difficulty,
              l.slug,
              l.title,
              m.week_number AS "weekNumber",
              m.title AS "moduleTitle",
              m.sort_order AS "moduleOrder",
              l.sort_order AS "lessonOrder"
            FROM problems AS p
            JOIN lessons AS l ON l.id = p.lesson_id
            JOIN modules AS m ON m.id = l.module_id
            ORDER BY m.sort_order, l.sort_order, p.sort_order
          `,
      });

      const listStats = SqlSchema.findAll({
        Request: Schema.Struct({ userId: Schema.String }),
        Result: StatRow,
        execute: (request) =>
          sql`
            SELECT
              problem_id AS "problemId",
              BOOL_OR(passed) AS "solved",
              COUNT(*)::int AS "attempts"
            FROM submissions
            WHERE user_id = ${request.userId}
            GROUP BY problem_id
          `,
      });

      const listSkips = SqlSchema.findAll({
        Request: Schema.Struct({ userId: Schema.String }),
        Result: Schema.Struct({ lessonId: Schema.String }),
        execute: (request) =>
          sql`
            SELECT lesson_id AS "lessonId"
            FROM lesson_skips
            WHERE user_id = ${request.userId}
          `,
      });

      const countAttempts = SqlSchema.findAll({
        Request: Schema.Struct({ userId: Schema.String }),
        Result: AttemptRow,
        execute: (request) =>
          sql`
            SELECT
              COUNT(*)::int AS "attempts",
              COUNT(*) FILTER (WHERE passed)::int AS "passes"
            FROM submissions
            WHERE user_id = ${request.userId}
          `,
      });

      const listDays = SqlSchema.findAll({
        Request: Schema.Struct({ userId: Schema.String }),
        Result: DayRow,
        execute: (request) =>
          sql`
            SELECT
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
              COUNT(*)::int AS submissions,
              COUNT(*) FILTER (WHERE passed)::int AS passes
            FROM submissions
            WHERE user_id = ${request.userId}
            GROUP BY 1
            ORDER BY 1
          `,
      });

      const forUser = Effect.fn("Insights.forUser")(function* (userId: string) {
        const problems = yield* listProblems().pipe(
          failUnexpected("Could not load your progress."),
        );
        const stats = yield* listStats({ userId }).pipe(
          failUnexpected("Could not load your progress."),
        );
        const totals = yield* countAttempts({ userId }).pipe(
          failUnexpected("Could not load your progress."),
        );
        const skipRows = yield* listSkips({ userId }).pipe(
          failUnexpected("Could not load your progress."),
        );
        const days = yield* listDays({ userId }).pipe(
          failUnexpected("Could not load your progress."),
        );
        const skippedLessonIds: string[] = [];
        for (const row of skipRows) {
          skippedLessonIds.push(row.lessonId);
        }
        const attemptRow = totals[0];

        return buildInsights({
          now: new Date(),
          problems,
          stats,
          skippedLessonIds,
          attempts: attemptRow?.attempts ?? 0,
          passes: attemptRow?.passes ?? 0,
          days,
        });
      });

      return Insights.of({ forUser });
    }),
  );
}

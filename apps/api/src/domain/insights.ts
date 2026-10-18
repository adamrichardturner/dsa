import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { Unexpected } from "./errors.js";
import type { AnalyticsView, SkippedLesson, TopicStat } from "./models.js";

const ProblemRow = Schema.Struct({
  id: Schema.String,
  lessonId: Schema.String,
  topic: Schema.String,
  slug: Schema.String,
  title: Schema.String,
});

const StatRow = Schema.Struct({
  problemId: Schema.String,
  bestStars: Schema.Number,
  solved: Schema.Boolean,
  attempts: Schema.Number,
});

const AttemptRow = Schema.Struct({
  attempts: Schema.Number,
  passes: Schema.Number,
});

const failUnexpected = (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapError((error) => Effect.logError(message, error)),
    Effect.mapError(() => new Unexpected({ message })),
  );

const describe = (
  problemsSolved: number,
  problemsTotal: number,
  attempts: number,
  focusAreas: readonly string[],
): string => {
  if (attempts === 0) {
    return "You have not submitted a solution yet. Start with The cost of a loop. The first exercises are short on purpose.";
  }
  if (problemsSolved === problemsTotal) {
    return "You have solved every exercise. The same patterns show up in longer problems.";
  }
  if (focusAreas.length === 0) {
    return "Everything you have attempted so far has passed. Move on to the next unsolved lesson while the previous pattern is still fresh.";
  }
  return `Spend the next session on ${focusAreas.join(", ")}. Those topics have an attempt that has not passed.`;
};

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
              l.slug,
              l.title
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
              MAX(stars)::int AS "bestStars",
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
        const skippedIds: Record<string, boolean> = {};
        for (const row of skipRows) {
          skippedIds[row.lessonId] = true;
        }
        const byProblem: Record<string, { bestStars: number; solved: boolean; attempts: number }> =
          {};

        for (const stat of stats) {
          byProblem[stat.problemId] = {
            bestStars: stat.bestStars,
            solved: stat.solved,
            attempts: stat.attempts,
          };
        }

        const topics: Record<string, TopicStat> = {};
        const lessons: Record<
          string,
          { total: number; solved: number; slug: string; title: string }
        > = {};

        for (const problem of problems) {
          const stat = byProblem[problem.id];
          const topic = topics[problem.topic] ?? {
            topic: problem.topic,
            solved: 0,
            total: 0,
            attempted: 0,
            stars: 0,
            maxStars: 0,
          };
          const lesson = lessons[problem.lessonId] ?? {
            total: 0,
            solved: 0,
            slug: problem.slug,
            title: problem.title,
          };
          const solved = stat?.solved ?? false;
          const attempted = (stat?.attempts ?? 0) > 0;

          topics[problem.topic] = {
            topic: problem.topic,
            solved: topic.solved + (solved ? 1 : 0),
            total: topic.total + 1,
            attempted: topic.attempted + (attempted ? 1 : 0),
            stars: topic.stars + (stat?.bestStars ?? 0),
            maxStars: topic.maxStars + 3,
          };
          lessons[problem.lessonId] = {
            total: lesson.total + 1,
            solved: lesson.solved + (solved ? 1 : 0),
            slug: lesson.slug,
            title: lesson.title,
          };
        }

        const topicList = Object.values(topics);
        let problemsSolved = 0;
        let stars = 0;
        let lessonsCompleted = 0;
        const skippedLessons: SkippedLesson[] = [];

        for (const topic of topicList) {
          problemsSolved += topic.solved;
          stars += topic.stars;
        }

        for (const lessonId of Object.keys(lessons)) {
          const lesson = lessons[lessonId];
          if (lesson === undefined) {
            continue;
          }
          const completed = lesson.total > 0 && lesson.solved === lesson.total;
          if (completed) {
            lessonsCompleted += 1;
            continue;
          }
          if (skippedIds[lessonId] === true) {
            skippedLessons.push({ slug: lesson.slug, title: lesson.title });
          }
        }

        const focusAreas = topicList
          .filter((topic) => topic.attempted > 0 && topic.solved < topic.total)
          .map((topic) => topic.topic);

        const attemptRow = totals[0];
        const attempts = attemptRow?.attempts ?? 0;
        const passes = attemptRow?.passes ?? 0;
        const passRate = attempts === 0 ? 0 : passes / attempts;

        return {
          lessonsCompleted,
          lessonsTotal: Object.keys(lessons).length,
          problemsSolved,
          problemsTotal: problems.length,
          stars,
          maxStars: problems.length * 3,
          attempts,
          passRate,
          topics: topicList,
          focusAreas,
          summary: describe(problemsSolved, problems.length, attempts, focusAreas),
          lessonsSkipped: skippedLessons.length,
          skippedLessons,
        };
      });

      return Insights.of({ forUser });
    }),
  );
}

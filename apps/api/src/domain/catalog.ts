import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { savedGapFills } from "../content/gaps.js";
import { NotFound, Unexpected } from "./errors.js";
import { openLessonSlugs } from "./gating.js";
import {
  progressClientFrom,
  progressTables,
  ProgressClientSchema,
  type ProgressClient,
} from "./progress-client.js";
import type {
  ExampleView,
  GapFill,
  LessonView,
  ModuleView,
  ProblemView,
  SkipResult,
} from "./models.js";

interface ProblemStat {
  readonly attempts: number;
  readonly failedAttempts: number;
  readonly solved: boolean;
  readonly passingCode: string | null;
  readonly latestCode: string | null;
  readonly gapFills: readonly GapFill[] | null;
}

const OutlineRow = Schema.Struct({
  moduleId: Schema.String,
  moduleTitle: Schema.String,
  moduleSummary: Schema.String,
  weekNumber: Schema.Number,
  lessonId: Schema.String,
  slug: Schema.String,
  lessonTitle: Schema.String,
  lessonSummary: Schema.String,
  estimatedMinutes: Schema.Number,
  problemId: Schema.String,
});

const LessonRow = Schema.Struct({
  id: Schema.String,
  slug: Schema.String,
  title: Schema.String,
  summary: Schema.String,
  contentMd: Schema.String,
  bitesizeMd: Schema.String,
  estimatedMinutes: Schema.Number,
  weekNumber: Schema.Number,
  moduleTitle: Schema.String,
});

const ProblemRow = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  promptMd: Schema.String,
  starterCode: Schema.String,
  functionName: Schema.String,
  testsJson: Schema.String,
  difficulty: Schema.String,
  topic: Schema.String,
});

const StatRow = Schema.Struct({
  problemId: Schema.String,
  attempts: Schema.Number,
  failedAttempts: Schema.Number,
  solved: Schema.Boolean,
  passingCode: Schema.NullOr(Schema.String),
  latestFillsJson: Schema.NullOr(Schema.String),
  passingFillsJson: Schema.NullOr(Schema.String),
});

const CodeRow = Schema.Struct({
  problemId: Schema.String,
  code: Schema.String,
});

const StoredTest = Schema.Struct({
  name: Schema.String,
  args: Schema.Array(Schema.Unknown),
  expected: Schema.Unknown,
  public: Schema.Boolean,
});

const parseJson = (text: string): unknown => JSON.parse(text);

const emptyStat = (): ProblemStat => ({
  attempts: 0,
  failedAttempts: 0,
  solved: false,
  passingCode: null,
  latestCode: null,
  gapFills: null,
});

interface OrderedLesson {
  readonly id: string;
  readonly slug: string;
  readonly problemIds: readonly string[];
}

const isLessonSolved = (
  problemIds: readonly string[],
  stats: Record<string, ProblemStat>,
): boolean => {
  if (problemIds.length === 0) {
    return false;
  }
  for (const problemId of problemIds) {
    const stat = stats[problemId];
    if (stat === undefined || !stat.solved) {
      return false;
    }
  }
  return true;
};

const orderedLessons = (
  rows: readonly { lessonId: string; slug: string; problemId: string }[],
): readonly OrderedLesson[] => {
  const byId: Record<
    string,
    { id: string; slug: string; problemIds: string[] }
  > = {};
  const order: string[] = [];

  for (const row of rows) {
    const current = byId[row.lessonId];
    if (current === undefined) {
      byId[row.lessonId] = {
        id: row.lessonId,
        slug: row.slug,
        problemIds: [row.problemId],
      };
      order.push(row.lessonId);
      continue;
    }
    current.problemIds.push(row.problemId);
  }

  const lessons: OrderedLesson[] = [];
  for (const lessonId of order) {
    const lesson = byId[lessonId];
    if (lesson === undefined) {
      continue;
    }
    lessons.push(lesson);
  }
  return lessons;
};

const solvedByLesson = (
  lessons: readonly OrderedLesson[],
  stats: Record<string, ProblemStat>,
): Record<string, boolean> => {
  const solved: Record<string, boolean> = {};
  for (const lesson of lessons) {
    solved[lesson.id] = isLessonSolved(lesson.problemIds, stats);
  }
  return solved;
};

const openSlugs = (
  lessons: readonly OrderedLesson[],
  stats: Record<string, ProblemStat>,
  skippedByLesson: Record<string, boolean>,
  auditMode: boolean,
): Record<string, boolean> =>
  openLessonSlugs(
    lessons,
    solvedByLesson(lessons, stats),
    skippedByLesson,
    auditMode,
  );

const slugForProblem = (
  lessons: readonly OrderedLesson[],
  problemId: string,
): string | null => {
  for (const lesson of lessons) {
    if (!lesson.problemIds.includes(problemId)) {
      continue;
    }
    return lesson.slug;
  }
  return null;
};

const formatCall = (functionName: string, args: readonly unknown[]): string => {
  const rendered = args
    .map((arg) => JSON.stringify(arg) ?? "undefined")
    .join(", ");
  return `${functionName}(${rendered})`;
};

const failUnexpected =
  (message: string) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(
      Effect.tapError((error) => Effect.logError(message, error)),
      Effect.mapError(() => new Unexpected({ message })),
    );

const readExamples = (
  functionName: string,
  testsJson: string,
): Effect.Effect<readonly ExampleView[], Unexpected> =>
  Effect.gen(function* () {
    const parsed = yield* Effect.try({
      try: () => parseJson(testsJson),
      catch: () => new Unexpected({ message: "Could not read an exercise." }),
    });
    const tests = yield* Schema.decodeUnknownEffect(Schema.Array(StoredTest))(
      parsed,
    ).pipe(
      Effect.mapError(
        () => new Unexpected({ message: "Could not read an exercise." }),
      ),
    );
    const examples: ExampleView[] = [];

    for (const test of tests) {
      if (!test.public) {
        continue;
      }
      examples.push({
        call: formatCall(functionName, test.args),
        output: JSON.stringify(test.expected) ?? "undefined",
      });
    }

    return examples;
  });

export class Catalog extends Context.Service<
  Catalog,
  {
    listModules(
      userId: string,
      client: ProgressClient,
    ): Effect.Effect<readonly ModuleView[], Unexpected>;
    getLesson(
      userId: string,
      slug: string,
      client: ProgressClient,
    ): Effect.Effect<LessonView, NotFound | Unexpected>;
    assertProblemOpen(
      userId: string,
      problemId: string,
      client: ProgressClient,
    ): Effect.Effect<void, NotFound | Unexpected>;
    problemProgress(
      userId: string,
      problemId: string,
      client: ProgressClient,
    ): Effect.Effect<
      { readonly solved: boolean; readonly failedAttempts: number },
      NotFound | Unexpected
    >;
    skipLesson(
      userId: string,
      slug: string,
      client: ProgressClient,
    ): Effect.Effect<SkipResult, NotFound | Unexpected>;
  }
>()("app/Catalog") {
  static readonly layer = Layer.effect(
    Catalog,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const listOutline = SqlSchema.findAll({
        Request: Schema.Void,
        Result: OutlineRow,
        execute: () =>
          sql`
            SELECT
              m.id AS "moduleId",
              m.title AS "moduleTitle",
              m.summary AS "moduleSummary",
              m.week_number AS "weekNumber",
              l.id AS "lessonId",
              l.slug AS "slug",
              l.title AS "lessonTitle",
              l.summary AS "lessonSummary",
              l.estimated_minutes AS "estimatedMinutes",
              p.id AS "problemId"
            FROM modules AS m
            JOIN lessons AS l ON l.module_id = m.id
            JOIN problems AS p ON p.lesson_id = l.id
            ORDER BY m.sort_order, l.sort_order, p.sort_order
          `,
      });

      const listStats = SqlSchema.findAll({
        Request: Schema.Struct({
          userId: Schema.String,
          client: ProgressClientSchema,
        }),
        Result: StatRow,
        execute: (request) => {
          const tables = progressTables(progressClientFrom(request.client));
          return sql`
            SELECT
              problem_id AS "problemId",
              COUNT(*)::int AS "attempts",
              COUNT(*) FILTER (WHERE NOT passed)::int AS "failedAttempts",
              BOOL_OR(passed) AS "solved",
              (ARRAY_AGG(code ORDER BY created_at DESC) FILTER (WHERE passed))[1] AS "passingCode",
              (ARRAY_AGG(fills_json ORDER BY created_at DESC))[1] AS "latestFillsJson",
              (ARRAY_AGG(fills_json ORDER BY created_at DESC) FILTER (WHERE passed))[1] AS "passingFillsJson"
            FROM ${sql(tables.submissions)}
            WHERE user_id = ${request.userId}
            GROUP BY problem_id
          `;
        },
      });

      const listLatest = SqlSchema.findAll({
        Request: Schema.Struct({
          userId: Schema.String,
          client: ProgressClientSchema,
        }),
        Result: CodeRow,
        execute: (request) => {
          const tables = progressTables(progressClientFrom(request.client));
          return sql`
            SELECT DISTINCT ON (saved.problem_id)
              saved.problem_id AS "problemId",
              saved.code
            FROM (
              SELECT problem_id, code, created_at AS saved_at
              FROM ${sql(tables.submissions)}
              WHERE user_id = ${request.userId}
              UNION ALL
              SELECT problem_id, code, updated_at AS saved_at
              FROM ${sql(tables.drafts)}
              WHERE user_id = ${request.userId}
            ) AS saved
            ORDER BY saved.problem_id, saved.saved_at DESC
          `;
        },
      });

      const findLesson = SqlSchema.findAll({
        Request: Schema.Struct({ slug: Schema.String }),
        Result: LessonRow,
        execute: (request) =>
          sql`
            SELECT
              l.id,
              l.slug,
              l.title,
              l.summary,
              l.content_md AS "contentMd",
              l.bitesize_md AS "bitesizeMd",
              l.estimated_minutes AS "estimatedMinutes",
              m.week_number AS "weekNumber",
              m.title AS "moduleTitle"
            FROM lessons AS l
            JOIN modules AS m ON m.id = l.module_id
            WHERE l.slug = ${request.slug}
          `,
      });

      const listProblems = SqlSchema.findAll({
        Request: Schema.Struct({ lessonId: Schema.String }),
        Result: ProblemRow,
        execute: (request) =>
          sql`
            SELECT
              id,
              title,
              prompt_md AS "promptMd",
              starter_code AS "starterCode",
              function_name AS "functionName",
              tests_json AS "testsJson",
              difficulty,
              topic
            FROM problems
            WHERE lesson_id = ${request.lessonId}
            ORDER BY sort_order
          `,
      });

      const listSkips = SqlSchema.findAll({
        Request: Schema.Struct({
          userId: Schema.String,
          client: ProgressClientSchema,
        }),
        Result: Schema.Struct({ lessonId: Schema.String }),
        execute: (request) => {
          const tables = progressTables(progressClientFrom(request.client));
          return sql`
            SELECT lesson_id AS "lessonId"
            FROM ${sql(tables.lessonSkips)}
            WHERE user_id = ${request.userId}
          `;
        },
      });

      const insertSkip = SqlSchema.void({
        Request: Schema.Struct({
          userId: Schema.String,
          lessonId: Schema.String,
          client: ProgressClientSchema,
        }),
        execute: (request) => {
          const tables = progressTables(progressClientFrom(request.client));
          return sql`
            INSERT INTO ${sql(tables.lessonSkips)} (user_id, lesson_id)
            VALUES (${request.userId}, ${request.lessonId})
            ON CONFLICT (user_id, lesson_id) DO NOTHING
          `;
        },
      });

      const findAuditMode = SqlSchema.findAll({
        Request: Schema.Struct({ userId: Schema.String }),
        Result: Schema.Struct({ auditMode: Schema.Boolean }),
        execute: (request) =>
          sql`
            SELECT audit_mode AS "auditMode"
            FROM users
            WHERE id = ${request.userId}
          `,
      });

      const loadAuditMode = (userId: string) =>
        Effect.gen(function* () {
          const rows = yield* findAuditMode({ userId }).pipe(
            failUnexpected("Could not load your account."),
          );
          return rows[0]?.auditMode ?? false;
        });

      const loadSkips = (userId: string, client: ProgressClient) =>
        Effect.gen(function* () {
          const rows = yield* listSkips({ userId, client }).pipe(
            failUnexpected("Could not load your progress."),
          );
          const skipped: Record<string, boolean> = {};
          for (const row of rows) {
            skipped[row.lessonId] = true;
          }
          return skipped;
        });

      const loadStats = (userId: string, client: ProgressClient) =>
        Effect.gen(function* () {
          const stats = yield* listStats({ userId, client }).pipe(
            failUnexpected("Could not load your progress."),
          );
          const latest = yield* listLatest({ userId, client }).pipe(
            failUnexpected("Could not load your saved code."),
          );
          const byProblem: Record<string, ProblemStat> = {};

          for (const stat of stats) {
            byProblem[stat.problemId] = {
              attempts: stat.attempts,
              failedAttempts: stat.failedAttempts,
              solved: stat.solved,
              passingCode: stat.passingCode,
              latestCode: null,
              gapFills: savedGapFills(
                stat.solved,
                stat.latestFillsJson,
                stat.passingFillsJson,
              ),
            };
          }

          for (const row of latest) {
            const current = byProblem[row.problemId] ?? emptyStat();
            byProblem[row.problemId] = { ...current, latestCode: row.code };
          }

          return byProblem;
        });

      const listModules = Effect.fn("Catalog.listModules")(function* (
        userId: string,
        client: ProgressClient,
      ) {
        const rows = yield* listOutline().pipe(
          failUnexpected("Could not load the course."),
        );
        const stats = yield* loadStats(userId, client);
        const skips = yield* loadSkips(userId, client);
        const auditMode = yield* loadAuditMode(userId);
        const open = openSlugs(orderedLessons(rows), stats, skips, auditMode);
        const modules: Record<
          string,
          {
            id: string;
            title: string;
            summary: string;
            weekNumber: number;
            lessons: Record<
              string,
              {
                id: string;
                slug: string;
                title: string;
                summary: string;
                estimatedMinutes: number;
                problemIds: string[];
              }
            >;
            lessonOrder: string[];
          }
        > = {};
        const moduleOrder: string[] = [];

        for (const row of rows) {
          const existingModule = modules[row.moduleId];
          if (existingModule === undefined) {
            modules[row.moduleId] = {
              id: row.moduleId,
              title: row.moduleTitle,
              summary: row.moduleSummary,
              weekNumber: row.weekNumber,
              lessons: {},
              lessonOrder: [],
            };
            moduleOrder.push(row.moduleId);
          }

          const moduleRecord = modules[row.moduleId];
          if (moduleRecord === undefined) {
            continue;
          }

          const existingLesson = moduleRecord.lessons[row.lessonId];
          if (existingLesson === undefined) {
            moduleRecord.lessons[row.lessonId] = {
              id: row.lessonId,
              slug: row.slug,
              title: row.lessonTitle,
              summary: row.lessonSummary,
              estimatedMinutes: row.estimatedMinutes,
              problemIds: [],
            };
            moduleRecord.lessonOrder.push(row.lessonId);
          }

          const lessonRecord = moduleRecord.lessons[row.lessonId];
          if (lessonRecord === undefined) {
            continue;
          }
          lessonRecord.problemIds.push(row.problemId);
        }

        return moduleOrder.flatMap((moduleId) => {
          const moduleRecord = modules[moduleId];
          if (moduleRecord === undefined) {
            return [];
          }

          const lessons = moduleRecord.lessonOrder.flatMap((lessonId) => {
            const lesson = moduleRecord.lessons[lessonId];
            if (lesson === undefined) {
              return [];
            }
            let solved = 0;
            for (const problemId of lesson.problemIds) {
              const stat = stats[problemId] ?? emptyStat();
              if (stat.solved) {
                solved += 1;
              }
            }
            const completed =
              lesson.problemIds.length > 0 &&
              solved === lesson.problemIds.length;
            return [
              {
                id: lesson.id,
                slug: lesson.slug,
                title: lesson.title,
                summary: lesson.summary,
                estimatedMinutes: lesson.estimatedMinutes,
                completed,
                skipped: skips[lesson.id] === true && !completed,
                available: open[lesson.slug] === true,
              },
            ];
          });

          return [
            {
              id: moduleRecord.id,
              title: moduleRecord.title,
              summary: moduleRecord.summary,
              weekNumber: moduleRecord.weekNumber,
              lessons,
            },
          ];
        });
      });

      const getLesson = Effect.fn("Catalog.getLesson")(function* (
        userId: string,
        slug: string,
        client: ProgressClient,
      ) {
        const lessons = yield* findLesson({ slug }).pipe(
          failUnexpected("Could not load that lesson."),
        );
        const lesson = lessons[0];
        if (lesson === undefined) {
          return yield* new NotFound({
            message: "That lesson does not exist.",
          });
        }

        const outline = yield* listOutline().pipe(
          failUnexpected("Could not load the course."),
        );
        const stats = yield* loadStats(userId, client);
        const skips = yield* loadSkips(userId, client);
        const auditMode = yield* loadAuditMode(userId);
        const sequence = orderedLessons(outline);
        const open = openSlugs(sequence, stats, skips, auditMode);
        if (open[slug] !== true) {
          return yield* new NotFound({
            message: "Finish the previous lesson before opening this one.",
          });
        }

        const problems = yield* listProblems({ lessonId: lesson.id }).pipe(
          failUnexpected("Could not load the exercises."),
        );
        const index = sequence.findIndex((item) => item.slug === slug);
        const previous = index > 0 ? sequence[index - 1] : undefined;
        const next = index >= 0 ? sequence[index + 1] : undefined;
        const previousSlug = previous?.slug ?? null;
        const nextSlug = next?.slug ?? null;
        const nextAvailable = nextSlug !== null && open[nextSlug] === true;

        const problemViews: ProblemView[] = [];
        let solvedCount = 0;

        for (const problem of problems) {
          const stat = stats[problem.id] ?? emptyStat();
          if (stat.solved) {
            solvedCount += 1;
          }
          const examples = yield* readExamples(
            problem.functionName,
            problem.testsJson,
          );
          problemViews.push({
            id: problem.id,
            title: problem.title,
            promptMd: problem.promptMd,
            starterCode: problem.starterCode,
            difficulty: problem.difficulty,
            topic: problem.topic,
            examples,
            solved: stat.solved,
            attempts: stat.attempts,
            failedAttempts: stat.failedAttempts,
            passingCode: stat.passingCode,
            latestCode: stat.latestCode,
            gapFills: stat.gapFills,
          });
        }

        return {
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          summary: lesson.summary,
          contentMd: lesson.contentMd,
          bitesizeMd: lesson.bitesizeMd,
          estimatedMinutes: lesson.estimatedMinutes,
          weekNumber: lesson.weekNumber,
          moduleTitle: lesson.moduleTitle,
          completed: problems.length > 0 && solvedCount === problems.length,
          skipped: skips[lesson.id] === true && solvedCount !== problems.length,
          previousSlug,
          nextSlug,
          nextAvailable,
          problems: problemViews,
        };
      });

      const assertProblemOpen = Effect.fn("Catalog.assertProblemOpen")(
        function* (userId: string, problemId: string, client: ProgressClient) {
          const outline = yield* listOutline().pipe(
            failUnexpected("Could not load the course."),
          );
          const stats = yield* loadStats(userId, client);
          const skips = yield* loadSkips(userId, client);
          const auditMode = yield* loadAuditMode(userId);
          const sequence = orderedLessons(outline);
          const slug = slugForProblem(sequence, problemId);
          if (slug === null) {
            return yield* new NotFound({
              message: "That exercise does not exist.",
            });
          }
          const open = openSlugs(sequence, stats, skips, auditMode);
          if (open[slug] === true) {
            return;
          }
          return yield* new NotFound({
            message: "Finish the previous lesson before submitting this one.",
          });
        },
      );

      const problemProgress = Effect.fn("Catalog.problemProgress")(function* (
        userId: string,
        problemId: string,
        client: ProgressClient,
      ) {
        const outline = yield* listOutline().pipe(
          failUnexpected("Could not load the course."),
        );
        const sequence = orderedLessons(outline);
        const slug = slugForProblem(sequence, problemId);
        if (slug === null) {
          return yield* new NotFound({
            message: "That exercise does not exist.",
          });
        }
        const stats = yield* loadStats(userId, client);
        const stat = stats[problemId];
        return {
          solved: stat?.solved ?? false,
          failedAttempts: stat?.failedAttempts ?? 0,
        };
      });

      const skipLesson = Effect.fn("Catalog.skipLesson")(function* (
        userId: string,
        slug: string,
        client: ProgressClient,
      ) {
        const lessons = yield* findLesson({ slug }).pipe(
          failUnexpected("Could not load that lesson."),
        );
        const lesson = lessons[0];
        if (lesson === undefined) {
          return yield* new NotFound({
            message: "That lesson does not exist.",
          });
        }

        const outline = yield* listOutline().pipe(
          failUnexpected("Could not load the course."),
        );
        const stats = yield* loadStats(userId, client);
        const skips = yield* loadSkips(userId, client);
        const auditMode = yield* loadAuditMode(userId);
        const sequence = orderedLessons(outline);
        const open = openSlugs(sequence, stats, skips, auditMode);
        if (open[slug] !== true) {
          return yield* new NotFound({
            message: "Finish the previous lesson before skipping this one.",
          });
        }

        yield* insertSkip({ userId, lessonId: lesson.id, client }).pipe(
          failUnexpected("Could not skip that lesson."),
        );

        const nextSkips: Record<string, boolean> = {
          ...skips,
          [lesson.id]: true,
        };
        const nextOpen = openSlugs(sequence, stats, nextSkips, auditMode);
        const index = sequence.findIndex((item) => item.slug === slug);
        const next = index >= 0 ? sequence[index + 1] : undefined;
        const nextSlug = next?.slug ?? null;

        return {
          slug,
          skipped: true,
          nextSlug,
          nextAvailable: nextSlug !== null && nextOpen[nextSlug] === true,
        };
      });

      return Catalog.of({
        listModules,
        getLesson,
        assertProblemOpen,
        problemProgress,
        skipLesson,
      });
    }),
  );
}

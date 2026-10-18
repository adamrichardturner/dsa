import { Effect, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { course } from "../content/course.js";
import { Unexpected } from "../domain/errors.js";

const statements: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
  `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`,
  `CREATE TABLE IF NOT EXISTS oauth_identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_user_id),
    UNIQUE (user_id, provider)
  )`,
  `CREATE TABLE IF NOT EXISTS oauth_states (
    id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    state_hash TEXT NOT NULL UNIQUE,
    code_verifier TEXT NOT NULL,
    return_to TEXT NOT NULL,
    web_origin TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS oauth_exchanges (
    id TEXT PRIMARY KEY,
    code_hash TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    week_number INTEGER NOT NULL,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL REFERENCES modules(id),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_md TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS problems (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES lessons(id),
    title TEXT NOT NULL,
    prompt_md TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    function_name TEXT NOT NULL,
    tests_json TEXT NOT NULL,
    disallow_json TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    topic TEXT NOT NULL,
    sort_order INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id),
    code TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    stars INTEGER NOT NULL,
    tests_passed INTEGER NOT NULL,
    tests_total INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    results_json TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS submissions_user_problem_idx
    ON submissions (user_id, problem_id, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS lesson_skips (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, lesson_id)
  )`,
  `CREATE TABLE IF NOT EXISTS drafts (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id),
    code TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, problem_id)
  )`,
  `CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
];

const reportDatabaseFailure = (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapError((error) => Effect.logError(message, error)),
    Effect.mapError(() => new Unexpected({ message })),
  );

export const prepareDatabase = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  for (const statement of statements) {
    yield* sql.unsafe(statement).pipe(
      reportDatabaseFailure("Could not prepare the database."),
    );
  }

  const upsertModule = SqlSchema.void({
    Request: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      summary: Schema.String,
      weekNumber: Schema.Number,
      sortOrder: Schema.Number,
    }),
    execute: (request) =>
      sql`
        INSERT INTO modules (id, title, summary, week_number, sort_order)
        VALUES (
          ${request.id},
          ${request.title},
          ${request.summary},
          ${request.weekNumber},
          ${request.sortOrder}
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          week_number = EXCLUDED.week_number,
          sort_order = EXCLUDED.sort_order
      `,
  });

  const upsertLesson = SqlSchema.void({
    Request: Schema.Struct({
      id: Schema.String,
      moduleId: Schema.String,
      slug: Schema.String,
      title: Schema.String,
      summary: Schema.String,
      contentMd: Schema.String,
      estimatedMinutes: Schema.Number,
      sortOrder: Schema.Number,
    }),
    execute: (request) =>
      sql`
        INSERT INTO lessons (
          id, module_id, slug, title, summary, content_md, estimated_minutes, sort_order
        )
        VALUES (
          ${request.id},
          ${request.moduleId},
          ${request.slug},
          ${request.title},
          ${request.summary},
          ${request.contentMd},
          ${request.estimatedMinutes},
          ${request.sortOrder}
        )
        ON CONFLICT (id) DO UPDATE SET
          module_id = EXCLUDED.module_id,
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          content_md = EXCLUDED.content_md,
          estimated_minutes = EXCLUDED.estimated_minutes,
          sort_order = EXCLUDED.sort_order
      `,
  });

  const upsertProblem = SqlSchema.void({
    Request: Schema.Struct({
      id: Schema.String,
      lessonId: Schema.String,
      title: Schema.String,
      promptMd: Schema.String,
      starterCode: Schema.String,
      functionName: Schema.String,
      testsJson: Schema.String,
      disallowJson: Schema.String,
      difficulty: Schema.String,
      topic: Schema.String,
      sortOrder: Schema.Number,
    }),
    execute: (request) =>
      sql`
        INSERT INTO problems (
          id,
          lesson_id,
          title,
          prompt_md,
          starter_code,
          function_name,
          tests_json,
          disallow_json,
          difficulty,
          topic,
          sort_order
        )
        VALUES (
          ${request.id},
          ${request.lessonId},
          ${request.title},
          ${request.promptMd},
          ${request.starterCode},
          ${request.functionName},
          ${request.testsJson},
          ${request.disallowJson},
          ${request.difficulty},
          ${request.topic},
          ${request.sortOrder}
        )
        ON CONFLICT (id) DO UPDATE SET
          lesson_id = EXCLUDED.lesson_id,
          title = EXCLUDED.title,
          prompt_md = EXCLUDED.prompt_md,
          starter_code = EXCLUDED.starter_code,
          function_name = EXCLUDED.function_name,
          tests_json = EXCLUDED.tests_json,
          disallow_json = EXCLUDED.disallow_json,
          difficulty = EXCLUDED.difficulty,
          topic = EXCLUDED.topic,
          sort_order = EXCLUDED.sort_order
      `,
  });

  yield* sql
    .withTransaction(
      Effect.gen(function* () {
        let moduleOrder = 0;

        for (const module of course) {
          moduleOrder += 1;
          yield* upsertModule({
            id: module.id,
            title: module.title,
            summary: module.summary,
            weekNumber: module.weekNumber,
            sortOrder: moduleOrder,
          });

          let lessonOrder = 0;
          for (const lesson of module.lessons) {
            lessonOrder += 1;
            yield* upsertLesson({
              id: lesson.id,
              moduleId: module.id,
              slug: lesson.slug,
              title: lesson.title,
              summary: lesson.summary,
              contentMd: lesson.contentMd,
              estimatedMinutes: lesson.estimatedMinutes,
              sortOrder: lessonOrder,
            });

            let problemOrder = 0;
            for (const problem of lesson.problems) {
              problemOrder += 1;
              yield* upsertProblem({
                id: problem.id,
                lessonId: lesson.id,
                title: problem.title,
                promptMd: problem.promptMd,
                starterCode: problem.starterCode,
                functionName: problem.functionName,
                testsJson: JSON.stringify(problem.tests),
                disallowJson: JSON.stringify(problem.disallow),
                difficulty: problem.difficulty,
                topic: problem.topic,
                sortOrder: problemOrder,
              });
            }
          }
        }
      }),
    )
    .pipe(reportDatabaseFailure("Could not store the course."));
});

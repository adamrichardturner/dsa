import { randomUUID } from "node:crypto";
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { NotFound, Unexpected } from "./errors.js";
import type { SubmissionView } from "./models.js";
import {
  previewSolution,
  runSolution,
  type PreviewCase,
  type PreviewLine,
  type RunTest,
} from "./runner.js";

const ProblemRow = Schema.Struct({
  id: Schema.String,
  functionName: Schema.String,
  testsJson: Schema.String,
  disallowJson: Schema.String,
});

const StoredTest = Schema.Struct({
  name: Schema.String,
  args: Schema.Array(Schema.Unknown),
  expected: Schema.Unknown,
  public: Schema.Boolean,
  compare: Schema.optional(Schema.Literals(["exact", "set"])),
});

const parseJson = (text: string): unknown => JSON.parse(text);

const failUnexpected = (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapError((error) => Effect.logError(message, error)),
    Effect.mapError(() => new Unexpected({ message })),
  );

const maxDraftLength = 100_000;

export class Solutions extends Context.Service<
  Solutions,
  {
    submit(
      userId: string,
      problemId: string,
      code: string,
    ): Effect.Effect<SubmissionView, NotFound | Unexpected>;
    saveDraft(
      userId: string,
      problemId: string,
      code: string,
    ): Effect.Effect<boolean, Unexpected>;
    run(
      problemId: string,
      code: string,
    ): Effect.Effect<{ readonly lines: readonly PreviewLine[] }, NotFound | Unexpected>;
  }
>()("app/Solutions") {
  static readonly layer = Layer.effect(
    Solutions,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const findProblem = SqlSchema.findAll({
        Request: Schema.Struct({ problemId: Schema.String }),
        Result: ProblemRow,
        execute: (request) =>
          sql`
            SELECT
              id,
              function_name AS "functionName",
              tests_json AS "testsJson",
              disallow_json AS "disallowJson"
            FROM problems
            WHERE id = ${request.problemId}
          `,
      });

      const insertSubmission = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          userId: Schema.String,
          problemId: Schema.String,
          code: Schema.String,
          passed: Schema.Boolean,
          testsPassed: Schema.Number,
          testsTotal: Schema.Number,
          feedback: Schema.String,
          resultsJson: Schema.String,
          createdAt: Schema.String,
        }),
        execute: (request) =>
          sql`
            INSERT INTO submissions (
              id,
              user_id,
              problem_id,
              code,
              passed,
              tests_passed,
              tests_total,
              feedback,
              results_json,
              created_at
            )
            VALUES (
              ${request.id},
              ${request.userId},
              ${request.problemId},
              ${request.code},
              ${request.passed},
              ${request.testsPassed},
              ${request.testsTotal},
              ${request.feedback},
              ${request.resultsJson},
              ${request.createdAt}::timestamptz
            )
          `,
      });

      const upsertDraft = SqlSchema.void({
        Request: Schema.Struct({
          userId: Schema.String,
          problemId: Schema.String,
          code: Schema.String,
        }),
        execute: (request) =>
          sql`
            INSERT INTO drafts (user_id, problem_id, code, updated_at)
            VALUES (${request.userId}, ${request.problemId}, ${request.code}, NOW())
            ON CONFLICT (user_id, problem_id) DO UPDATE SET
              code = EXCLUDED.code,
              updated_at = NOW()
          `,
      });

      const loadExercise = (problemId: string) =>
        Effect.gen(function* () {
          const problems = yield* findProblem({ problemId }).pipe(
            failUnexpected("Could not load that exercise."),
          );
          const problem = problems[0];
          if (problem === undefined) {
            return yield* new NotFound({ message: "That exercise does not exist." });
          }

          const parsedTests = yield* Effect.try({
            try: () => parseJson(problem.testsJson),
            catch: () => new Unexpected({ message: "Could not read the tests." }),
          });
          const parsedDisallow = yield* Effect.try({
            try: () => parseJson(problem.disallowJson),
            catch: () => new Unexpected({ message: "Could not read the tests." }),
          });
          const storedTests = yield* Schema.decodeUnknownEffect(Schema.Array(StoredTest))(
            parsedTests,
          ).pipe(Effect.mapError(() => new Unexpected({ message: "Could not read the tests." })));
          const disallow = yield* Schema.decodeUnknownEffect(Schema.Array(Schema.String))(
            parsedDisallow,
          ).pipe(Effect.mapError(() => new Unexpected({ message: "Could not read the tests." })));

          const tests: RunTest[] = [];
          const cases: PreviewCase[] = [];
          for (const test of storedTests) {
            tests.push({
              name: test.name,
              args: test.args,
              expected: test.expected,
              compare: test.compare ?? "exact",
            });
            if (!test.public) {
              continue;
            }
            cases.push({ args: test.args });
          }

          return {
            functionName: problem.functionName,
            tests,
            cases,
            disallow,
          };
        });

      const submit = Effect.fn("Solutions.submit")(function* (
        userId: string,
        problemId: string,
        code: string,
      ) {
        if (code.trim().length === 0) {
          return yield* new Unexpected({ message: "Write a solution before submitting." });
        }

        const exercise = yield* loadExercise(problemId);
        const outcome = runSolution(code, exercise.functionName, exercise.tests, exercise.disallow);
        const createdAt = new Date().toISOString();
        const id = randomUUID();

        yield* insertSubmission({
          id,
          userId,
          problemId,
          code,
          passed: outcome.passed,
          testsPassed: outcome.testsPassed,
          testsTotal: outcome.testsTotal,
          feedback: outcome.feedback,
          resultsJson: JSON.stringify(outcome.results),
          createdAt,
        }).pipe(failUnexpected("Could not save the submission."));

        return {
          id,
          passed: outcome.passed,
          testsPassed: outcome.testsPassed,
          testsTotal: outcome.testsTotal,
          feedback: outcome.feedback,
          results: outcome.results,
          createdAt,
        };
      });

      const saveDraft = Effect.fn("Solutions.saveDraft")(function* (
        userId: string,
        problemId: string,
        code: string,
      ) {
        if (code.length > maxDraftLength) {
          return yield* new Unexpected({ message: "That solution is too long to save." });
        }

        yield* upsertDraft({ userId, problemId, code }).pipe(
          failUnexpected("Could not save your progress."),
        );
        return true;
      });

      const run = Effect.fn("Solutions.run")(function* (problemId: string, code: string) {
        if (code.trim().length === 0) {
          const lines: PreviewLine[] = [
            { kind: "error", text: "Write some code before running it." },
          ];
          return { lines };
        }

        const exercise = yield* loadExercise(problemId);
        const lines = previewSolution(
          code,
          exercise.functionName,
          exercise.cases,
          exercise.disallow,
        );
        return { lines };
      });

      return Solutions.of({ submit, saveDraft, run });
    }),
  );
}

import assert from "node:assert/strict";
import test from "node:test";
import { course } from "./course.js";
import { referenceCode } from "./references.js";
import { runSolution } from "../domain/runner.js";

test("each exercise reference passes that exercise's tests", () => {
  const problemIds: Record<string, true> = {};

  for (const module of course) {
    for (const lesson of module.lessons) {
      assert.ok(
        lesson.problems.length >= 2,
        `${lesson.slug} should have more than one exercise`,
      );

      for (const problem of lesson.problems) {
        assert.equal(
          problemIds[problem.id],
          undefined,
          `Duplicate problem id: ${problem.id}`,
        );
        problemIds[problem.id] = true;
        const code = referenceCode[problem.id];
        assert.ok(typeof code === "string" && code.length > 0, problem.id);

        const outcome = runSolution(
          code ?? "",
          problem.functionName,
          problem.tests.map((item) => ({
            name: item.name,
            args: item.args,
            expected: item.expected,
            compare: item.compare ?? "exact",
          })),
          problem.disallow,
        );
        assert.equal(
          outcome.passed,
          true,
          `${problem.id}: ${outcome.feedback} ${JSON.stringify(outcome.results)}`,
        );
      }
    }
  }

  for (const problemId of Object.keys(referenceCode)) {
    assert.equal(problemIds[problemId], true, problemId);
  }
});

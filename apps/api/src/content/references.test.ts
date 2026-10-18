import assert from "node:assert/strict";
import test from "node:test";
import { course } from "./course.js";
import { referenceCode } from "./references.js";
import { runSolution } from "../domain/runner.js";

test("each lesson reference passes that lesson's tests", () => {
  const slugs: string[] = [];

  for (const module of course) {
    for (const lesson of module.lessons) {
      slugs.push(lesson.slug);
      const code = referenceCode[lesson.slug];
      assert.ok(typeof code === "string" && code.length > 0, lesson.slug);

      for (const problem of lesson.problems) {
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
          `${lesson.slug}: ${outcome.feedback} ${JSON.stringify(outcome.results)}`,
        );
      }
    }
  }

  for (const slug of Object.keys(referenceCode)) {
    assert.equal(slugs.includes(slug), true, slug);
  }
});

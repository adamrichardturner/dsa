import assert from "node:assert/strict";
import test from "node:test";
import { course } from "./course.js";
import { referenceCode } from "./references.js";
import { runSolution } from "../domain/runner.js";
import type { SeedProblem } from "./types.js";

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
            timeoutMs: item.timeoutMs,
            immutableArgs: item.immutableArgs ?? problem.immutableArgs,
            distinctArrayReturnFromArg:
              item.distinctArrayReturnFromArg ??
              problem.distinctArrayReturnFromArg,
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

test("the pair-sum scale case rejects a quadratic scan", () => {
  let pairSum: SeedProblem | undefined;
  for (const module of course) {
    for (const lesson of module.lessons) {
      for (const problem of lesson.problems) {
        if (problem.id === "pair-sum") {
          pairSum = problem;
        }
      }
    }
  }

  assert.ok(pairSum !== undefined);
  const scaleCase = pairSum.tests.find(
    (item) => item.name === "large absent pair stays linear",
  );
  assert.ok(scaleCase !== undefined);
  assert.equal(scaleCase.timeoutMs, 300);

  const outcome = runSolution(
    `export function hasPairSum(nums: number[], target: number): boolean {
      for (let left = 0; left < nums.length; left += 1) {
        for (let right = left + 1; right < nums.length; right += 1) {
          if (nums[left] + nums[right] === target) {
            return true;
          }
        }
      }
      return false;
    }`,
    pairSum.functionName,
    [
      {
        name: scaleCase.name,
        args: scaleCase.args,
        expected: scaleCase.expected,
        compare: scaleCase.compare ?? "exact",
        timeoutMs: scaleCase.timeoutMs,
      },
    ],
    pairSum.disallow,
  );

  assert.equal(outcome.passed, false);
  assert.match(outcome.results[0]?.error ?? "", /timed out/i);
});

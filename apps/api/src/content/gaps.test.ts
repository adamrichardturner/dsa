import assert from "node:assert/strict";
import test from "node:test";
import { course } from "./course.js";
import {
  assembleGap,
  chipText,
  gradeGap,
  puzzleForProblem,
  type GapPuzzle,
} from "./gaps.js";
import { runSolution } from "../domain/runner.js";

const correctFills = (puzzle: GapPuzzle): Record<string, string> => {
  const fills: Record<string, string> = {};
  for (const reveal of puzzle.reveals) {
    for (const chip of puzzle.chips) {
      if (chip.text !== reveal.text) {
        continue;
      }
      if (fills[reveal.gapId] !== undefined) {
        continue;
      }
      fills[reveal.gapId] = chip.id;
    }
  }
  return fills;
};

test("every exercise is a gap puzzle whose solution passes the tests", () => {
  for (const module of course) {
    for (const lesson of module.lessons) {
      assert.ok(
        lesson.problems.length >= 1 && lesson.problems.length <= 4,
        lesson.slug,
      );
      for (const problem of lesson.problems) {
        const puzzle = puzzleForProblem(problem.id);
        assert.ok(puzzle !== null, `${problem.id} needs a gap puzzle`);
        if (puzzle === null) {
          continue;
        }
        assert.ok(
          puzzle.reveals.length >= 1 && puzzle.reveals.length <= 4,
          `${problem.id} has ${puzzle.reveals.length} gaps`,
        );
        assert.ok(
          puzzle.chips.length > puzzle.reveals.length,
          `${problem.id} needs distractors`,
        );

        const seen: Record<string, true> = {};
        for (const chip of puzzle.chips) {
          assert.equal(seen[chip.id], undefined, `${problem.id} duplicate chip ${chip.id}`);
          seen[chip.id] = true;
          assert.equal(chip.text.includes("\n"), false, problem.id);
        }

        const fills = correctFills(puzzle);
        const grades = gradeGap(puzzle, fills);
        for (const grade of grades) {
          assert.equal(grade.correct, true, `${problem.id} ${grade.gapId}`);
        }
        const code = assembleGap(puzzle, fills);
        assert.equal(code, puzzle.source, problem.id);

        const wrong: Record<string, string> = { ...fills };
        const first = puzzle.reveals[0];
        assert.ok(first !== undefined);
        const distractor = puzzle.chips.find((chip) => {
          return chip.text !== first.text;
        });
        assert.ok(distractor !== undefined, problem.id);
        if (distractor !== undefined) {
          wrong[first.gapId] = distractor.id;
        }
        const wrongGrades = gradeGap(puzzle, wrong);
        assert.equal(wrongGrades[0]?.correct, false, problem.id);
        assert.equal(chipText(puzzle, "missing"), null);

        const outcome = runSolution(
          code,
          problem.functionName,
          problem.tests.map((item) => ({
            name: item.name,
            args: item.args,
            expected: item.expected,
            compare: item.compare ?? "exact",
            timeoutMs: item.timeoutMs,
            immutableArgs: item.immutableArgs ?? problem.immutableArgs,
            distinctArrayReturnFromArg:
              item.distinctArrayReturnFromArg ?? problem.distinctArrayReturnFromArg,
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
});

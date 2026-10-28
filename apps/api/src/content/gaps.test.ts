import assert from "node:assert/strict";
import test from "node:test";
import { course } from "./course.js";
import {
  assembleGap,
  chipText,
  gradeGap,
  puzzleForProblem,
  savedGapFills,
  type GapPuzzle,
  type StoredGapFill,
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

const fillsRecord = (
  stored: readonly StoredGapFill[] | null,
): Record<string, string> => {
  const fills: Record<string, string> = {};
  if (stored === null) {
    return fills;
  }
  for (const fill of stored) {
    fills[fill.gapId] = fill.chipId;
  }
  return fills;
};

test("gap fills restore from the attempt the lesson shows", () => {
  const latest = JSON.stringify({ g0: "c-latest" });
  const passing = JSON.stringify({ g1: "c-passing" });
  assert.deepEqual(savedGapFills(false, latest, passing), [
    { gapId: "g0", chipId: "c-latest" },
  ]);
  assert.deepEqual(savedGapFills(true, latest, passing), [
    { gapId: "g1", chipId: "c-passing" },
  ]);
  assert.equal(savedGapFills(true, latest, null), null);
  assert.equal(savedGapFills(false, null, null), null);
  assert.equal(savedGapFills(false, "{", null), null);
  assert.deepEqual(savedGapFills(false, "{}", null), []);
});

test("every exercise can restore the gap fills from its submission", () => {
  let exercises = 0;
  for (const module of course) {
    for (const lesson of module.lessons) {
      for (const problem of lesson.problems) {
        const puzzle = puzzleForProblem(problem.id);
        assert.ok(puzzle !== null, problem.id);
        if (puzzle === null) {
          continue;
        }
        exercises += 1;
        const fills = correctFills(puzzle);
        const open = savedGapFills(false, JSON.stringify(fills), null);
        assert.deepEqual(fillsRecord(open), fills, problem.id);
        const solved = savedGapFills(true, null, JSON.stringify(fills));
        assert.deepEqual(fillsRecord(solved), fills, problem.id);

        const first = puzzle.reveals[0];
        assert.ok(first !== undefined, problem.id);
        if (first === undefined) {
          continue;
        }
        let distractorId: string | null = null;
        for (const chip of puzzle.chips) {
          if (chip.text === first.text) {
            continue;
          }
          distractorId = chip.id;
          break;
        }
        assert.ok(distractorId !== null, problem.id);
        if (distractorId === null) {
          continue;
        }
        const wrong: Record<string, string> = {
          ...fills,
          [first.gapId]: distractorId,
        };
        const restored = savedGapFills(false, JSON.stringify(wrong), null);
        assert.equal(fillsRecord(restored)[first.gapId], distractorId, problem.id);
      }
    }
  }
  assert.ok(exercises > 1);
});

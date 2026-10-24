import assert from "node:assert/strict";
import test from "node:test";
import { course } from "./course.js";
import {
  explanationText,
  solutionForProblem,
} from "./explanations/content.js";

const otherSlug = (slug: string): string => {
  if (slug === "complexity") {
    return "arrays";
  }
  return "complexity";
};

test("every exercise has a unique solution explanation", () => {
  const seen: Record<string, string> = {};
  let exerciseCount = 0;

  for (const module of course) {
    for (const lesson of module.lessons) {
      for (const problem of lesson.problems) {
        exerciseCount += 1;
        const fromLesson = solutionForProblem(lesson.slug, problem.id);
        const fromOtherLesson = solutionForProblem(
          otherSlug(lesson.slug),
          problem.id,
        );
        assert.ok(
          fromLesson !== null,
          `${problem.id} needs a solution explanation`,
        );
        assert.ok(
          fromOtherLesson !== null,
          `${problem.id} explanation must stay with the exercise when the lesson slug changes`,
        );
        if (fromLesson === null || fromOtherLesson === null) {
          continue;
        }

        const text = explanationText(fromLesson);
        assert.equal(
          explanationText(fromOtherLesson),
          text,
          `${problem.id} changed explanation when the lesson slug changed`,
        );
        assert.ok(
          text.length >= 80,
          `${problem.id} solution explanation is empty or too thin`,
        );
        const previous = seen[text];
        assert.equal(
          previous,
          undefined,
          `${problem.id} repeats the solution explanation for ${previous ?? "another exercise"}`,
        );
        seen[text] = problem.id;
      }
    }
  }

  assert.equal(exerciseCount, 84);
});

test("a failed exercise does not inherit a sibling explanation", () => {
  const rangeSum = solutionForProblem("sliding-window", "range-sum");
  const maxWindow = solutionForProblem("sliding-window", "max-window-sum");
  const maxArea = solutionForProblem("two-pointers", "max-area");
  const sortedSquares = solutionForProblem("two-pointers", "sorted-squares");
  const ascending = solutionForProblem("pair-cost", "ascending-pairs");
  const equalPairs = solutionForProblem("pair-cost", "equal-pairs");
  const fibMemo = solutionForProblem("two-calls", "fib-memo");
  const nestedDepth = solutionForProblem("two-calls", "nested-depth");

  assert.ok(rangeSum !== null);
  assert.ok(maxWindow !== null);
  assert.ok(maxArea !== null);
  assert.ok(sortedSquares !== null);
  assert.ok(ascending !== null);
  assert.ok(equalPairs !== null);
  assert.ok(fibMemo !== null);
  assert.ok(nestedDepth !== null);
  if (
    rangeSum === null ||
    maxWindow === null ||
    maxArea === null ||
    sortedSquares === null ||
    ascending === null ||
    equalPairs === null ||
    fibMemo === null ||
    nestedDepth === null
  ) {
    return;
  }

  const rangeSumText = explanationText(rangeSum);
  const maxAreaText = explanationText(maxArea);
  const ascendingText = explanationText(ascending);
  const fibMemoText = explanationText(fibMemo);

  assert.notEqual(rangeSumText, explanationText(maxWindow));
  assert.match(rangeSumText, /prefix\[right \+ 1\] - prefix\[left\]/);
  assert.doesNotMatch(rangeSumText, /maxWindowSum/);

  assert.notEqual(maxAreaText, explanationText(sortedSquares));
  assert.match(maxAreaText, /shorter height/);
  assert.doesNotMatch(maxAreaText, /sortedSquares/);

  assert.notEqual(ascendingText, explanationText(equalPairs));
  assert.match(ascendingText, /countAscendingPairs/);
  assert.doesNotMatch(ascendingText, /countEqualPairs/);

  assert.notEqual(fibMemoText, explanationText(nestedDepth));
  assert.match(fibMemoText, /Store each result/);
  assert.doesNotMatch(fibMemoText, /nestedDepth/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { nextExerciseTarget } from "./next-exercise.ts";

const problems = [{ id: "one" }, { id: "two" }, { id: "three" }];

test("the next exercise is the following problem in the lesson", () => {
  const target = nextExerciseTarget(problems, "one", "next-lesson", true);
  assert.deepEqual(target, { kind: "problem", id: "two" });
});

test("the last problem in a lesson opens the next lesson", () => {
  const target = nextExerciseTarget(problems, "three", "next-lesson", true);
  assert.deepEqual(target, { kind: "lesson", slug: "next-lesson" });
});

test("a locked next lesson is not a navigation target", () => {
  const target = nextExerciseTarget(problems, "three", "next-lesson", false);
  assert.equal(target, null);
});

test("the last exercise in the course has no next target", () => {
  const target = nextExerciseTarget(problems, "three", null, false);
  assert.equal(target, null);
});

test("an unknown exercise does not jump to the first problem", () => {
  const target = nextExerciseTarget(problems, "missing", null, false);
  assert.equal(target, null);
});

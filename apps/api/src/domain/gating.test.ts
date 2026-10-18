import assert from "node:assert/strict";
import test from "node:test";
import { openLessonSlugs, type GateLesson } from "./gating.js";

const lessons: readonly GateLesson[] = [
  { id: "a", slug: "first" },
  { id: "b", slug: "second" },
  { id: "c", slug: "third" },
];

test("the first lesson is open and later lessons stay locked", () => {
  const open = openLessonSlugs(lessons, {}, {}, false);
  assert.equal(open.first, true);
  assert.equal(open.second, false);
  assert.equal(open.third, false);
});

test("a pass opens only the next lesson", () => {
  const open = openLessonSlugs(lessons, { a: true }, {}, false);
  assert.equal(open.second, true);
  assert.equal(open.third, false);
});

test("a skip opens the next lesson without counting as a pass", () => {
  const open = openLessonSlugs(lessons, {}, { a: true }, false);
  assert.equal(open.first, true);
  assert.equal(open.second, true);
  assert.equal(open.third, false);
});

test("a skip later in the path does not unlock past a gap", () => {
  const open = openLessonSlugs(lessons, {}, { c: true }, false);
  assert.equal(open.second, false);
  assert.equal(open.third, false);
});

test("passing and skipping can be mixed along the path", () => {
  const open = openLessonSlugs(lessons, { a: true }, { b: true }, false);
  assert.equal(open.third, true);
});

test("audit mode opens every lesson and does not treat a stray skip as progress", () => {
  const open = openLessonSlugs(lessons, {}, { c: true }, true);
  assert.equal(open.first, true);
  assert.equal(open.second, true);
  assert.equal(open.third, true);

  const restored = openLessonSlugs(lessons, {}, { c: true }, false);
  assert.equal(restored.second, false);
  assert.equal(restored.third, false);
});

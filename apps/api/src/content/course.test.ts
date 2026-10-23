import assert from "node:assert/strict";
import test from "node:test";
import { course } from "./course.js";

test("every lesson has a complete bitesize explanation", () => {
  const slugs: Record<string, true> = {};
  let lessonCount = 0;
  let exerciseCount = 0;

  for (const module of course) {
    for (const lesson of module.lessons) {
      lessonCount += 1;
      exerciseCount += lesson.problems.length;
      assert.equal(
        slugs[lesson.slug],
        undefined,
        `Duplicate lesson slug: ${lesson.slug}`,
      );
      slugs[lesson.slug] = true;
      assert.ok(
        lesson.bitesizeMd.length >= 900,
        `${lesson.slug} needs a fuller bitesize explanation`,
      );
      assert.match(
        lesson.bitesizeMd,
        /```mermaid/,
        `${lesson.slug} needs a Mermaid diagram`,
      );
      assert.match(
        lesson.bitesizeMd,
        /```ts/,
        `${lesson.slug} needs a TypeScript example`,
      );
      assert.match(
        lesson.bitesizeMd,
        /## Common mistakes/,
        `${lesson.slug} needs common mistake coaching`,
      );
    }
  }

  assert.equal(lessonCount, 38);
  assert.equal(exerciseCount, 84);

  const exerciseCounts: Record<string, number> = {
    "sliding-window": 3,
    "two-pointers": 4,
    trees: 3,
    "two-calls": 3,
    "visited-walks": 3,
    "binary-search-trees": 3,
    heaps: 3,
  };
  const thirdExercise: Record<string, string> = {
    "sliding-window": "range-sum",
    "two-pointers": "remove-duplicates-sorted",
    trees: "level-order",
    "two-calls": "fib-memo",
    "visited-walks": "count-components",
    "binary-search-trees": "is-valid-bst",
    heaps: "heap-push",
  };

  for (const module of course) {
    for (const lesson of module.lessons) {
      const expectedCount = exerciseCounts[lesson.slug] ?? 2;
      assert.equal(
        lesson.problems.length,
        expectedCount,
        `${lesson.slug} exercise count`,
      );
      const thirdId = thirdExercise[lesson.slug];
      if (thirdId !== undefined) {
        assert.equal(lesson.problems[2]?.id, thirdId, lesson.slug);
      }
      if (lesson.slug === "two-pointers") {
        assert.equal(lesson.problems[3]?.id, "max-area");
      }
    }
  }

  const preserved = [
    "complexity",
    "arrays",
    "hash-maps",
    "two-pointers",
    "sliding-window",
    "linked-lists",
    "stacks",
    "queues",
    "recursion",
    "binary-search",
    "sorting",
    "trees",
    "binary-search-trees",
    "heaps",
    "graphs",
    "greedy",
    "backtracking",
    "dynamic-programming",
    "tries",
  ];

  for (const slug of preserved) {
    assert.equal(slugs[slug], true, `${slug} should keep its original id`);
  }
});

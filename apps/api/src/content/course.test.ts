import assert from "node:assert/strict";
import test from "node:test";
import { course } from "./course.js";

test("every lesson has a complete bitesize explanation", () => {
  const slugs: Record<string, true> = {};
  let lessonCount = 0;

  for (const module of course) {
    for (const lesson of module.lessons) {
      lessonCount += 1;
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

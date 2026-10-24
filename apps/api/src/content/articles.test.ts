import assert from "node:assert/strict";
import test from "node:test";
import { articleCategories } from "./articles/categories.js";
import { articleGroups, articles } from "./articles/index.js";

test("articles live with the course content", () => {
  assert.ok(articles.length > 0);
  assert.equal(articleGroups().length, articleCategories.length);
  for (const group of articleGroups()) {
    assert.ok(group.articles.length > 0, `${group.topic} needs at least one article`);
  }
});

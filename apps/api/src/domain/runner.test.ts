import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { previewSolution, runSnippet, runSolution } from "./runner.js";

const countBelow = `export function countBelow(nums: number[], limit: number): number {
  let count = 0;
  for (const value of nums) {
    if (value < limit) {
      count += 1;
    }
  }
  return count;
}
`;

describe("previewSolution", () => {
  it("prints each public call and its result", () => {
    const lines = previewSolution(
      countBelow,
      "countBelow",
      [{ args: [[1, 4, 2, 8], 4] }, { args: [[5, 6], 3] }],
      [],
    );

    assert.deepEqual(lines, [
      { kind: "prompt", text: "countBelow([1,4,2,8], 4)" },
      { kind: "result", text: "2" },
      { kind: "prompt", text: "countBelow([5,6], 3)" },
      { kind: "result", text: "0" },
    ]);
  });

  it("includes console output before the result", () => {
    const lines = previewSolution(
      `export function greet(name: string): string {
        console.log("hello", name);
        return name.length;
      }`,
      "greet",
      [{ args: ["ada"] }],
      [],
    );

    assert.deepEqual(lines, [
      { kind: "prompt", text: 'greet("ada")' },
      { kind: "log", text: "hello ada" },
      { kind: "result", text: "3" },
    ]);
  });

  it("reports a missing export", () => {
    const lines = previewSolution("export const value = 1;\n", "countBelow", [], []);
    assert.equal(lines.at(-1)?.kind, "error");
    assert.match(lines.at(-1)?.text ?? "", /countBelow/);
  });

  it("rejects blocked syntax", () => {
    const lines = previewSolution('require("fs")\n', "countBelow", [], []);
    assert.deepEqual(lines, [
      { kind: "error", text: "require is not available in the runner." },
    ]);
  });

  it("reports a syntax error", () => {
    const lines = previewSolution("export function countBelow( {", "countBelow", [], []);
    assert.equal(lines[0]?.kind, "error");
  });
});

describe("runSnippet", () => {
  it("prints console output after stripping types", () => {
    const lines = runSnippet("const value: number = 2;\nconsole.log(value + 1);");
    assert.deepEqual(lines, [{ kind: "log", text: "3" }]);
  });

  it("reports a value stored in a map", () => {
    const lines = runSnippet(`const seen = new Map<number, number>();
seen.set(1, 2);
console.log(seen.get(1));`);
    assert.deepEqual(lines, [{ kind: "log", text: "2" }]);
  });

  it("says when nothing was printed", () => {
    const lines = runSnippet("const value: number = 2;");
    assert.deepEqual(lines, [{ kind: "log", text: "The code ran. Nothing was printed." }]);
  });

  it("rejects an empty snippet", () => {
    const lines = runSnippet("   \n");
    assert.deepEqual(lines, [{ kind: "error", text: "Write some code before running it." }]);
  });

  it("rejects blocked syntax", () => {
    const lines = runSnippet('require("fs");\n');
    assert.deepEqual(lines, [
      { kind: "error", text: "require is not available in the runner." },
    ]);
  });

  it("reports a runtime error after earlier logs", () => {
    const lines = runSnippet('console.log("before");\nthrow new Error("nope");');
    assert.deepEqual(lines, [
      { kind: "log", text: "before" },
      { kind: "error", text: "nope" },
    ]);
  });

  it("reports a syntax error", () => {
    const lines = runSnippet("const {");
    assert.equal(lines[0]?.kind, "error");
  });
});

describe("runSolution", () => {
  it("grades a solution that returns the expected value", () => {
    const outcome = runSolution(
      countBelow,
      "countBelow",
      [{ name: "mixed", args: [[1, 4], 4], expected: 1, compare: "exact" }],
      [],
    );
    assert.equal(outcome.passed, true);
    assert.equal(outcome.results[0]?.received, "1");
  });
});

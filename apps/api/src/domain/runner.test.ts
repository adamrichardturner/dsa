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
    const lines = previewSolution(
      "export const value = 1;\n",
      "countBelow",
      [],
      [],
    );
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
    const lines = previewSolution(
      "export function countBelow( {",
      "countBelow",
      [],
      [],
    );
    assert.equal(lines[0]?.kind, "error");
  });
});

describe("runSnippet", () => {
  it("prints console output after stripping types", () => {
    const lines = runSnippet(
      "const value: number = 2;\nconsole.log(value + 1);",
    );
    assert.deepEqual(lines, [{ kind: "log", text: "3" }]);
  });

  it("reports a value stored in a map", () => {
    const lines = runSnippet(`const seen = new Map<number, number>();
seen.set(1, 2);
console.log(seen.get(1));`);
    assert.deepEqual(lines, [{ kind: "log", text: "2" }]);
  });

  it("runs current JavaScript, including map iteration", () => {
    const lines =
      runSnippet(`const counts = new Map<number, number>([[1, 1], [2, 2]]);
let best = 0;
for (const [value, count] of counts) {
  if (count > (counts.get(best) ?? 0)) {
    best = value;
  }
}
const extra = new Set([best]).union(new Set([3]));
console.log(best, extra.size, [1, 2, 3].values().drop(1).toArray().join(","));`);
    assert.deepEqual(lines, [{ kind: "log", text: "2 2 2,3" }]);
  });

  it("says when nothing was printed", () => {
    const lines = runSnippet("const value: number = 2;");
    assert.deepEqual(lines, [
      { kind: "log", text: "The code ran. Nothing was printed." },
    ]);
  });

  it("rejects an empty snippet", () => {
    const lines = runSnippet("   \n");
    assert.deepEqual(lines, [
      { kind: "error", text: "Write some code before running it." },
    ]);
  });

  it("rejects blocked syntax", () => {
    const lines = runSnippet('require("fs");\n');
    assert.deepEqual(lines, [
      { kind: "error", text: "require is not available in the runner." },
    ]);
  });

  it("reports a runtime error after earlier logs", () => {
    const lines = runSnippet(
      'console.log("before");\nthrow new Error("nope");',
    );
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
    assert.equal(outcome.results[0]?.input, "countBelow([1,4], 4)");
    assert.equal(outcome.results[0]?.received, "1");
  });

  it("includes the call when a solution returns the wrong value", () => {
    const outcome = runSolution(
      `export function countBelow(): number {
        return 0;
      }`,
      "countBelow",
      [{ name: "mixed", args: [[1, 4], 4], expected: 1, compare: "exact" }],
      [],
    );
    assert.equal(outcome.passed, false);
    assert.equal(outcome.results[0]?.input, "countBelow([1,4], 4)");
    assert.equal(outcome.results[0]?.expected, "1");
    assert.equal(outcome.results[0]?.received, "0");
  });

  it("reports the original call when a solution mutates its array", () => {
    const outcome = runSolution(
      `export function insertAt(nums: number[], index: number, value: number): number[] {
        if (index < nums.length) {
          nums.splice(index, 0, value);
          return nums.slice();
        }
        nums.push(value);
        return nums.concat(value);
      }`,
      "insertAt",
      [
        { name: "end", args: [[1], 5, 9], expected: [1, 9], compare: "exact" },
        { name: "empty", args: [[], 0, 4], expected: [4], compare: "exact" },
      ],
      [],
    );

    assert.equal(outcome.results[0]?.input, "insertAt([1], 5, 9)");
    assert.equal(outcome.results[0]?.expected, "[1,9]");
    assert.equal(outcome.results[0]?.received, "[1,9,9]");
    assert.equal(outcome.results[1]?.input, "insertAt([], 0, 4)");
    assert.equal(outcome.results[1]?.expected, "[4]");
    assert.equal(outcome.results[1]?.received, "[4,4]");
  });

  it("rejects mutation even when the returned value is correct", () => {
    const outcome = runSolution(
      `export function solve(values: number[]): number[] {
        const result = values.slice().reverse();
        values[0] = 99;
        return result;
      }`,
      "solve",
      [
        {
          name: "immutable input",
          args: [[1, 2, 3]],
          expected: [3, 2, 1],
          compare: "exact",
          immutableArgs: [0],
        },
      ],
      [],
    );

    assert.equal(outcome.passed, false);
    assert.match(outcome.results[0]?.error ?? "", /must not be mutated/);
  });

  it("requires a distinct array return when requested", () => {
    const outcome = runSolution(
      `export function solve(values: number[]): number[] {
        return values;
      }`,
      "solve",
      [
        {
          name: "new output",
          args: [[1, 2]],
          expected: [1, 2],
          compare: "exact",
          distinctArrayReturnFromArg: 0,
        },
      ],
      [],
    );

    assert.equal(outcome.passed, false);
    assert.match(outcome.results[0]?.error ?? "", /new object/);
  });

  it("rejects forbidden member calls despite whitespace and optional chaining", () => {
    const whitespace = runSolution(
      `export function solve(values: number[]): number[] {
        return values . reverse ();
      }`,
      "solve",
      [],
      [".reverse("],
    );
    const optional = runSolution(
      `export function solve(values: number[]): number[] | undefined {
        return values?.toReversed?.();
      }`,
      "solve",
      [],
      [".toReversed("],
    );

    assert.match(whitespace.feedback, /not to use \.reverse\(/);
    assert.match(optional.feedback, /not to use \.toReversed\(/);
  });

  it("rejects statically named bracket access to forbidden members", () => {
    const outcome = runSolution(
      `export function solve(values: number[]): number[] {
        return values["sort"]();
      }`,
      "solve",
      [],
      [".sort("],
    );
    const alias = runSolution(
      `export function solve(values: number[]): number[] {
        const shortcut = values.sort;
        return shortcut.call(values);
      }`,
      "solve",
      [],
      [".sort("],
    );

    assert.match(outcome.feedback, /not to use \.sort\(/);
    assert.match(alias.feedback, /not to use \.sort\(/);
  });

  it("rejects forbidden constructors and qualified APIs with trivia", () => {
    const constructor = runSolution(
      `export function solve(values: number[]): number {
        return new /* no shortcut */ Set(values).size;
      }`,
      "solve",
      [],
      ["new Set"],
    );
    const qualified = runSolution(
      `export function solve(left: number, right: number): number {
        return Math?.["min"](left, right);
      }`,
      "solve",
      [],
      ["Math.min"],
    );

    assert.match(constructor.feedback, /not to use new Set/);
    assert.match(qualified.feedback, /not to use Math\.min/);
  });

  it("rejects destructured members and constructor aliases", () => {
    const destructured = runSolution(
      `export function solve(values: number[]): number[] {
        const { sort: order } = values;
        return order.call(values);
      }`,
      "solve",
      [],
      [".sort("],
    );
    const constructorAlias = runSolution(
      `const Unique = Set;
      export function solve(values: number[]): number {
        return new Unique(values).size;
      }`,
      "solve",
      [],
      ["new Set"],
    );

    assert.match(destructured.feedback, /not to use \.sort\(/);
    assert.match(constructorAlias.feedback, /not to use new Set/);
  });

  it("does not enforce restrictions inside comments or strings", () => {
    const outcome = runSolution(
      `export function solve(): string {
        // values.reverse()
        return ".sort( and new Set";
      }`,
      "solve",
      [
        {
          name: "text",
          args: [],
          expected: ".sort( and new Set",
          compare: "exact",
        },
      ],
      [".reverse(", ".sort(", "new Set"],
    );

    assert.equal(outcome.passed, true);
  });

  it("applies a bounded per-test timeout", () => {
    const outcome = runSolution(
      `export function solve(): number {
        while (true) {
          continue;
        }
      }`,
      "solve",
      [
        {
          name: "terminates",
          args: [],
          expected: 1,
          compare: "exact",
          timeoutMs: 10,
        },
      ],
      [],
    );

    assert.equal(outcome.passed, false);
    assert.match(outcome.results[0]?.error ?? "", /timed out/i);
  });

  it("materialises compact number-sequence fixtures", () => {
    const outcome = runSolution(
      `export function solve(values: number[]): number {
        return values[values.length - 1] ?? -1;
      }`,
      "solve",
      [
        {
          name: "generated",
          args: [
            {
              fixture: "number-sequence",
              length: 4,
              start: 2,
              step: 3,
            },
          ],
          expected: 11,
          compare: "exact",
        },
      ],
      [],
    );

    assert.equal(outcome.passed, true);
  });
});

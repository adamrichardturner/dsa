import type { SeedTest } from "./types.js";

const range = (length: number, start = 0, step = 1): number[] => {
  const values: number[] = [];
  for (let index = 0; index < length; index += 1) {
    values.push(start + index * step);
  }
  return values;
};

const lineEdges = (vertices: number): number[][] => {
  const edges: number[][] = [];
  for (let vertex = 1; vertex < vertices; vertex += 1) {
    edges.push([vertex - 1, vertex]);
  }
  return edges;
};

const sortedSquaresInput = range(3_000, -1_500);
const sortedSquaresExpected: number[] = [];
for (const value of sortedSquaresInput) {
  sortedSquaresExpected.push(value * value);
}
sortedSquaresExpected.sort((left, right) => left - right);
const mergeInput = range(3_000).reverse();
const mergedExpected = range(6_000);
const alternating = range(5_000);
for (let index = 0; index < alternating.length; index += 1) {
  alternating[index] = index % 2;
}
const touchingIntervals: number[][] = [];
for (let index = 0; index < 2_000; index += 1) {
  touchingIntervals.push([index, index + 1]);
}
const trueQueries: boolean[] = [];
const oneQueries: number[] = [];
const rollingSums: number[] = [];
let rollingSum = 0;
for (let index = 0; index < alternating.length; index += 1) {
  rollingSum += alternating[index] ?? 0;
  if (index >= 2_500) {
    rollingSum -= alternating[index - 2_500] ?? 0;
  }
  rollingSums.push(rollingSum);
}
const trieWords: string[] = [];
const trieQueries: string[] = [];
for (let index = 0; index < 2_000; index += 1) {
  const word = `word-${String(index).padStart(4, "0")}`;
  trieWords.push(word);
  if (index < 500) {
    trieQueries.push(word);
    trueQueries.push(true);
    oneQueries.push(1);
  }
}

const hidden = (
  name: string,
  args: readonly unknown[],
  expected: unknown,
  timeoutMs = 500,
): SeedTest => ({
  name,
  args,
  expected,
  public: false,
  timeoutMs,
});

export const stressTests: Record<string, SeedTest> = {
  "count-below": hidden("scale scan", [range(4_000), 2_000], 2_000),
  "count-equal": hidden("scale scan", [alternating, 1], 2_500),
  "has-duplicate": hidden("scale distinct values", [range(3_000)], false),
  "two-sum": hidden(
    "scale complement near the end",
    [range(4_000), 7_997],
    [3_998, 3_999],
  ),
  "sorted-squares": hidden(
    "scale two-pointer scan",
    [sortedSquaresInput],
    sortedSquaresExpected,
  ),
  "max-window-sum": hidden("scale sliding window", [alternating, 2_500], 1_250),
  "min-window-sum": hidden("scale sliding window", [alternating, 2_500], 1_250),
  "window-sums": hidden(
    "scale rolling queue",
    [alternating, 2_500],
    rollingSums,
  ),
  "is-balanced": hidden(
    "deep balanced input",
    ["(".repeat(10_000) + ")".repeat(10_000)],
    true,
  ),
  "adjacent-duplicates": hidden(
    "scale stack scan",
    ["ab".repeat(5_000)],
    "ab".repeat(5_000),
  ),
  "binary-search": hidden(
    "scale halving",
    [range(20_000), 19_999],
    19_999,
    300,
  ),
  "search-insert": hidden(
    "scale insertion point",
    [range(20_000), 19_999.5],
    20_000,
    300,
  ),
  "merge-sort": hidden("scale divide and merge", [mergeInput], range(3_000)),
  "merge-sorted": hidden(
    "scale merge",
    [range(3_000, 0, 2), range(3_000, 1, 2)],
    mergedExpected,
  ),
  "shortest-path": hidden(
    "scale breadth-first traversal",
    [lineEdges(2_000), 0, 1_999],
    1_999,
  ),
  "can-reach": hidden(
    "scale graph traversal",
    [lineEdges(2_000), 0, 1_999],
    true,
  ),
  "count-components": hidden(
    "scale one component",
    [lineEdges(20_000), 20_000],
    1,
    500,
  ),
  "max-non-overlapping": hidden(
    "scale greedy intervals",
    [touchingIntervals.slice(0, 24)],
    24,
    300,
  ),
  "can-attend-all": hidden("scale interval scan", [touchingIntervals], true),
  "min-cost-climb": hidden(
    "scale dynamic programming",
    [range(35, 1, 0)],
    17,
    300,
  ),
  "count-subsets": hidden("recursive decision tree", [range(18)], 262_144, 500),
  "words-found": hidden(
    "scale trie lookup",
    [trieWords, trieQueries],
    trueQueries,
  ),
  "has-prefix": hidden(
    "scale prefix lookup",
    [trieWords, trieQueries],
    trueQueries,
  ),
  "common-prefix": hidden("scale shared prefix", [trieWords], "word-"),
  "prefix-counts": hidden(
    "scale prefix counts",
    [trieWords, trieQueries],
    oneQueries,
  ),
};

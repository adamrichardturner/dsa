import type { SeedModule } from "./types.js";
import { bitesize } from "./bitesize.js";
import { reading } from "./reading.js";

export const week4: SeedModule = {
  id: "patterns",
  title: "Patterns",
  summary: "Greedy algorithms, backtracking, dynamic programming, and a trie.",
  weekNumber: 4,
  lessons: [
    {
      id: "greedy",
      slug: "greedy",
      title: "Greedy algorithms",
      summary:
        "Take the local option that you can prove does not block a better future.",
      estimatedMinutes: 35,
      bitesizeMd: bitesize.greedy,
      contentMd: reading.greedy,
      problems: [
        {
          id: "max-non-overlapping",
          title: "Non-overlapping intervals",
          topic: "Greedy",
          difficulty: "medium",
          functionName: "maxNonOverlapping",
          disallow: [],
          promptMd: `
Implement \`maxNonOverlapping(intervals)\` to return the maximum number of intervals that can be selected without any two overlapping.

**Input**

- \`intervals\` is an array of pairs \`[start, end]\` where \`start < end\`.
- Each interval is half-open: \`[start, end)\` includes \`start\` but excludes \`end\`.
- Endpoints may be negative, and the intervals may arrive in any order.

**Output**

- Return only the largest possible number of mutually non-overlapping intervals.
- Do not return the selected intervals.

**Required behaviour**

- Touching intervals are compatible: \`[1, 2]\` and \`[2, 4]\` can both be selected.
- An empty input returns \`0\`.
- Duplicate intervals represent separate choices, but at most one of two overlapping duplicates can be selected.

**Algorithm expectation**

Use the greedy interval-scheduling strategy from the lesson: consider intervals by earliest finishing time and accept each compatible interval.

Aim for O(n log n) time for sorting followed by an O(n) scan.

Do not enumerate every subset of intervals or hard-code results for the examples.
          `.trim(),
          starterCode: `export function maxNonOverlapping(intervals: number[][]): number {
  return 0;
}
`,
          tests: [
            {
              name: "one conflict",
              args: [
                [
                  [1, 3],
                  [2, 4],
                  [3, 5],
                ],
              ],
              expected: 2,
              public: true,
            },
            {
              name: "touching",
              args: [
                [
                  [1, 2],
                  [2, 4],
                ],
              ],
              expected: 2,
              public: true,
            },
            {
              name: "long early interval is not optimal",
              args: [
                [
                  [0, 10],
                  [1, 2],
                  [2, 3],
                  [3, 4],
                  [4, 5],
                ],
              ],
              expected: 4,
              public: true,
            },
            {
              name: "none overlap",
              args: [
                [
                  [1, 2],
                  [3, 4],
                  [5, 6],
                ],
              ],
              expected: 3,
              public: false,
            },
            {
              name: "empty",
              args: [[]],
              expected: 0,
              public: false,
            },
            {
              name: "unsorted negative and touching intervals",
              args: [
                [
                  [5, 7],
                  [-3, -1],
                  [1, 5],
                  [-1, 1],
                  [0, 6],
                ],
              ],
              expected: 4,
              public: false,
            },
            {
              name: "duplicate choices still conflict",
              args: [
                [
                  [2, 3],
                  [1, 2],
                  [1, 2],
                  [3, 4],
                  [2, 3],
                ],
              ],
              expected: 3,
              public: false,
            },
            {
              name: "large greedy choice set",
              args: [
                [
                  [0, 100],
                  [1, 2],
                  [2, 3],
                  [3, 4],
                  [4, 5],
                  [5, 6],
                  [6, 7],
                  [7, 8],
                  [8, 9],
                  [9, 10],
                  [10, 11],
                  [11, 12],
                  [12, 13],
                  [13, 14],
                  [14, 15],
                  [15, 16],
                  [16, 17],
                  [17, 18],
                  [18, 19],
                  [19, 20],
                  [20, 21],
                  [21, 22],
                  [22, 23],
                  [23, 24],
                  [24, 25],
                  [25, 26],
                ],
              ],
              expected: 25,
              public: false,
              timeoutMs: 100,
            },
          ],
        },
      ],
    },
    {
      id: "backtracking",
      slug: "backtracking",
      title: "Backtracking",
      summary: "Choose, explore, then undo the choice.",
      estimatedMinutes: 40,
      bitesizeMd: bitesize.backtracking,
      contentMd: reading.backtracking,
      problems: [
        {
          id: "subsets",
          title: "Subsets",
          topic: "Backtracking",
          difficulty: "medium",
          functionName: "subsets",
          disallow: [".flatMap(", ".reduce(", "<<", ">>", "&"],
          promptMd: `
Implement \`subsets(nums)\` to generate the power set: every possible subset of \`nums\`.

**Input**

- \`nums\` contains distinct numbers and may be empty.
- Values may be negative, zero, or positive, and are not necessarily sorted.

**Output**

- Return exactly \`2^n\` subsets for an input of length \`n\`.
- Include the empty subset and the subset containing every input value.
- Include each valid subset exactly once.
- The order of the returned subsets and the order of values inside each subset do not matter.

**Algorithm expectation**

Use recursive backtracking.

At each input index, explore both decisions: exclude the value and include it.

Undo the included choice before returning to the previous decision.

Copy the current path when saving a completed subset so later mutations do not change saved results.

Generating every subset necessarily takes O(n · 2^n) time when copied output is counted, with O(n) recursion/path space besides the returned results.

Do not use \`flatMap\` or \`reduce\` to build the power set, use bitmask enumeration, or call a library power-set helper.

This exercise is specifically practice in choose, explore, and undo.
          `.trim(),
          starterCode: `export function subsets(nums: number[]): number[][] {
  return [];
}
`,
          tests: [
            {
              name: "two values",
              args: [[1, 2]],
              expected: [[], [1], [2], [1, 2]],
              public: true,
              compare: "set",
            },
            {
              name: "one value",
              args: [[4]],
              expected: [[], [4]],
              public: true,
              compare: "set",
            },
            {
              name: "unsorted signed values",
              args: [[3, -1, 0]],
              expected: [
                [],
                [3],
                [-1],
                [0],
                [3, -1],
                [3, 0],
                [-1, 0],
                [3, -1, 0],
              ],
              public: true,
              compare: "set",
            },
            {
              name: "empty",
              args: [[]],
              expected: [[]],
              public: false,
              compare: "set",
            },
            {
              name: "three values",
              args: [[1, 2, 3]],
              expected: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]],
              public: false,
              compare: "set",
            },
            {
              name: "four values produce every combination once",
              args: [[8, -2, 5, 0]],
              expected: [
                [],
                [8],
                [-2],
                [5],
                [0],
                [8, -2],
                [8, 5],
                [8, 0],
                [-2, 5],
                [-2, 0],
                [5, 0],
                [8, -2, 5],
                [8, -2, 0],
                [8, 5, 0],
                [-2, 5, 0],
                [8, -2, 5, 0],
              ],
              public: false,
              compare: "set",
            },
          ],
        },
      ],
    },
    {
      id: "dynamic-programming",
      slug: "dynamic-programming",
      title: "Dynamic programming",
      summary: "Solve the small problems once, and reuse the answers.",
      estimatedMinutes: 45,
      bitesizeMd: bitesize.dynamicProgramming,
      contentMd: reading["dynamic-programming"],
      problems: [
        {
          id: "climb-stairs",
          title: "Climbing stairs",
          topic: "Dynamic programming",
          difficulty: "easy",
          functionName: "climbStairs",
          disallow: [],
          promptMd: `
Implement \`climbStairs(n)\` to count the distinct sequences of moves that reach exactly step \`n\` when each move climbs either 1 or 2 steps.

**Input**

- \`n\` is an integer from 1 through 45.

**Output**

- Return the number of distinct ordered sequences whose steps sum to \`n\`.
- Different orders count separately, so \`1 + 2\` and \`2 + 1\` are different ways.

**Required behaviour**

- \`climbStairs(1)\` is \`1\`.
- \`climbStairs(2)\` is \`2\`.
- \`climbStairs(3)\` is \`3\`: \`1 + 1 + 1\`, \`1 + 2\`, and \`2 + 1\`.

**Algorithm expectation**

Use dynamic programming with the recurrence \`ways(n) = ways(n - 1) + ways(n - 2)\`.

A bottom-up solution takes O(n) time and O(1) extra space; memoised recursion may use O(n) extra space.

Do not enumerate the move sequences, use exponential recursion that recomputes the same state, use a closed-form formula, or return values from a precomputed answer table.
          `.trim(),
          starterCode: `export function climbStairs(n: number): number {
  return 0;
}
`,
          tests: [
            {
              name: "three steps",
              args: [3],
              expected: 3,
              public: true,
            },
            {
              name: "one step",
              args: [1],
              expected: 1,
              public: true,
            },
            {
              name: "six steps",
              args: [6],
              expected: 13,
              public: true,
            },
            {
              name: "two steps",
              args: [2],
              expected: 2,
              public: false,
            },
            {
              name: "five steps",
              args: [5],
              expected: 8,
              public: false,
            },
            {
              name: "ten steps",
              args: [10],
              expected: 89,
              public: false,
            },
            {
              name: "large input requires reused subproblems",
              args: [45],
              expected: 1_836_311_903,
              public: false,
              timeoutMs: 100,
            },
          ],
        },
      ],
    },
    {
      id: "tries",
      slug: "tries",
      title: "Tries",
      summary: "A tree of characters, for looking words up by their spelling.",
      estimatedMinutes: 40,
      bitesizeMd: bitesize.tries,
      contentMd: reading.tries,
      problems: [
        {
          id: "words-found",
          title: "Trie lookup",
          topic: "Tries",
          difficulty: "medium",
          functionName: "wordsFound",
          disallow: [".includes(", ".indexOf(", ".some(", ".find("],
          promptMd: `
Implement \`wordsFound(words, queries)\` by inserting every value from \`words\` into a character trie, then looking up each query in that trie.

**Inputs**

- \`words\` contains the strings to insert. It may be empty and may contain duplicates.
- \`queries\` contains the strings to check. It may also be empty or contain duplicates.
- Matching is exact and case-sensitive.

**Output**

- Return one boolean for each query, in the same order as \`queries\`.
- Return \`true\` only when that complete query was inserted, not merely when it is a prefix of an inserted word.
- The empty string is found only when \`""\` appears in \`words\`.

For example, \`wordsFound(["cat", "car"], ["cat", "cab", "car"])\` returns \`[true, false, true]\`.

**Algorithm expectation**

Build a trie whose nodes store character-keyed child objects and an \`isWord\` flag.

Insertion and lookup should each take O(L) time for a string of length L.

Across all inputs, aim for O(total characters in \`words\` and \`queries\`) time and O(total characters in \`words\`) trie space.

Do not use whole-word linear search helpers such as \`includes\`, \`indexOf\`, \`some\`, or \`find\`, and do not scan the full \`words\` array separately for each query.

A \`Map\` for each node's children is a valid trie representation; the supplied object shape is simpler for this starter.
          `.trim(),
          starterCode: `export function wordsFound(words: string[], queries: string[]): boolean[] {
  return [];
}
`,
          tests: [
            {
              name: "shared prefixes",
              args: [
                ["cat", "car"],
                ["cat", "cab", "car"],
              ],
              expected: [true, false, true],
              public: true,
            },
            {
              name: "empty query list",
              args: [["a"], []],
              expected: [],
              public: true,
            },
            {
              name: "inserted prefix and longer word",
              args: [
                ["app", "apple"],
                ["app", "ap", "apple", "appled"],
              ],
              expected: [true, false, true, false],
              public: true,
            },
            {
              name: "prefix is not a word",
              args: [["carpet"], ["car", "carpet"]],
              expected: [false, true],
              public: false,
            },
            {
              name: "empty word",
              args: [[""], ["", "a"]],
              expected: [true, false],
              public: false,
            },
            {
              name: "empty dictionary",
              args: [[], ["", "a"]],
              expected: [false, false],
              public: false,
            },
            {
              name: "duplicates case and shared branches",
              args: [
                ["tea", "ted", "ten", "tea", "A", "a"],
                ["tea", "te", "ted", "ten", "tent", "A", "a", "tea"],
              ],
              expected: [true, false, true, true, false, true, true, true],
              public: false,
            },
          ],
        },
      ],
    },
  ],
};

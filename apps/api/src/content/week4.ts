import type { SeedModule } from "./types.js";
import { bitesize } from "./bitesize.js";

export const week4: SeedModule = {
  id: "patterns",
  title: "Patterns",
  summary: "Greedy choices, backtracking, dynamic programming, and a trie.",
  weekNumber: 4,
  lessons: [
    {
      id: "greedy",
      slug: "greedy",
      title: "Greedy choices",
      summary:
        "Take the local option that you can prove does not block a better future.",
      estimatedMinutes: 35,
      bitesizeMd: bitesize.greedy,
      contentMd: `
A greedy algorithm makes the choice that looks best right now and does not take it back. It is fast when the local choice is safe. It is wrong when a patient choice would have opened a better path later. The skill is telling those problems apart, not applying "sort and scan" to everything.

Interval scheduling is a case where greedy is safe. You have half-open intervals \`[start, end)\`. Two intervals overlap when one starts before the other has finished. You want as many as possible without a pair overlapping.

Sort by finishing time, earliest first. Take the first interval. Then take the next one that starts at or after that finish time. Repeat. Taking the interval that frees you soonest leaves the most room afterwards, and for this problem that local rule matches the best possible count.

\`[[1, 3], [2, 4], [3, 5]]\` can keep \`[1, 3]\` and \`[3, 5]\`. \`[2, 4]\` overlaps both. The answer is 2.

If you sorted by start time instead, an early interval that runs for a long time would block several short ones. Same data, worse rule. When you invent a greedy rule, try to name a case it gets wrong. If you cannot, you might be done. If you can, it is not the rule.
      `.trim(),
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

Use the greedy interval-scheduling strategy from the lesson: consider intervals by earliest finishing time and accept each compatible interval. Aim for O(n log n) time for sorting followed by an O(n) scan.

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
      contentMd: `
Backtracking searches a tree of decisions. At each step you choose, recurse, then undo so the next choice starts from a clean state. It is depth-first search on decisions you are generating, rather than on a graph you were given.

Subsets are the smallest useful version. For each number, it is either in the subset or it is not.

\`\`\`ts
function walk(index: number, path: number[]): void {
  if (index === nums.length) {
    results.push([...path]);
    return;
  }

  walk(index + 1, path);
  path.push(nums[index]);
  walk(index + 1, path);
  path.pop();
}
\`\`\`

The copy \`[...path]\` matters. If you push \`path\` itself, later pops will empty the subsets you thought you had saved.

The undo is \`path.pop()\`. Forget it and every later subset inherits the previous choice.

\`[1, 2]\` has four subsets: \`[]\`, \`[1]\`, \`[2]\`, and \`[1, 2]\`. Order does not matter for this exercise. The tests compare the collection as a set.

This explodes. n distinct numbers have 2ⁿ subsets. Backtracking is the right tool when the search space is modest or you can prune it ("stop once the partial sum already exceeds the target"). It is the wrong tool when a shorter dynamic-programming table would count the answers without listing them.
      `.trim(),
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

Use recursive backtracking. At each input index, explore both decisions: exclude the value and include it. Undo the included choice before returning to the previous decision. Copy the current path when saving a completed subset so later mutations do not change saved results.

Generating every subset necessarily takes O(n · 2^n) time when copied output is counted, with O(n) recursion/path space besides the returned results.

Do not use \`flatMap\` or \`reduce\` to build the power set, use bitmask enumeration, or call a library power-set helper. This exercise is specifically practice in choose, explore, and undo.
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
      contentMd: `
Dynamic programming applies when a problem is made of smaller problems that **overlap**. Recursion still describes the answer. The difference from backtracking is that you store results instead of exploring the same state twice.

Climbing stairs is the friendly introduction. You can take 1 or 2 steps. How many ways can you climb \`n\` steps?

Let \`ways(n)\` be that count.

- \`ways(1) = 1\` — one single step
- \`ways(2) = 2\` — two singles, or one double
- \`ways(n) = ways(n - 1) + ways(n - 2)\` — the last action was a single step, or a double step

Those subproblems overlap. A naive recursion recomputes \`ways(3)\` many times on the way to \`ways(10)\`. Two repairs:

1. Memoisation. Keep an object from \`n\` to the answer. Before recursing, check it. After computing, store it.
2. A loop. Fill an array from the bottom. \`dp[i] = dp[i - 1] + dp[i - 2]\`. This uses O(n) time and, if you only keep the last two numbers, O(1) extra memory.

Both are dynamic programming. The loop is usually what you write once you trust the recurrence.

The same idea extends to two dimensions. Unique paths across a grid is \`dp[row][col] = dp[row - 1][col] + dp[row][col - 1]\`. Coin change is a 1D table updated once per coin. If you can write the recurrence and the base case, the table is mechanical. This week stops at the stairs so the recurrence stays visible.
      `.trim(),
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

Use dynamic programming with the recurrence \`ways(n) = ways(n - 1) + ways(n - 2)\`. A bottom-up solution takes O(n) time and O(1) extra space; memoised recursion may use O(n) extra space.

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
      contentMd: `
A trie (pronounced "try") is a tree where each edge is a character. Words that share a prefix share the path from the root. \`cat\` and \`car\` share the \`c → a\` path, then split into \`t\` and \`r\`.

Each node holds:

- an object of children, keyed by character
- a flag, \`isWord\`, that is true when some inserted word ends here

Insert walks the characters, creating a child when it is missing, and marks the last node as a word. Search walks the same way and checks the flag. Both are O(length of the word), independent of how many other words you have stored. A hash set of whole words is also O(length) on average and is shorter to write. The trie earns its place when you care about prefixes: "which words start with \`ca\`?" is a walk to that node and then a small traversal of what sits underneath.

The exercise only asks for exact lookup, so a set would pass. Build the trie anyway. The point of the last lesson is to leave with one more structure you can draw.

A node can be a small class or a plain object. Children as \`Record<string, TrieNode>\` is enough. You do not need a 26-slot array unless you know every character is a lowercase letter and you want the practice.

This is the end of the guided path. The structures repeat: arrays, maps, stacks, queues, trees, and a willingness to name the cost. The next problems you meet in the wild are usually one of those, wearing a story.
      `.trim(),
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

Build a trie whose nodes store character-keyed child objects and an end-of-word flag. Insertion and lookup should each take O(L) time for a string of length L. Across all inputs, aim for O(total characters in \`words\` and \`queries\`) time and O(total characters in \`words\`) trie space.

Do not use whole-word linear search helpers such as \`includes\`, \`indexOf\`, \`some\`, or \`find\`, and do not scan the full \`words\` array separately for each query. A \`Map\` for each node's children is a valid trie representation; the supplied object shape is simpler for this starter.
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

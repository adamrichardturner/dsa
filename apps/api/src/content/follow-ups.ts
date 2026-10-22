import type { SeedLesson, SeedProblem } from "./types.js";
import { stepBitesize } from "./step-bitesize.js";
import { listStarter, treeStarter, bstStarter } from "./scaffolds.js";

const contractsFor = (
  id: string,
): Pick<SeedProblem, "immutableArgs" | "distinctArrayReturnFromArg"> => {
  switch (id) {
    case "remove-at":
    case "insert-at":
    case "bubble-sort": {
      return { immutableArgs: [0], distinctArrayReturnFromArg: 0 };
    }
    default: {
      return {};
    }
  }
};

const problem = (
  id: string,
  title: string,
  topic: string,
  difficulty: SeedProblem["difficulty"],
  functionName: string,
  promptMd: string,
  starterCode: string,
  tests: SeedProblem["tests"],
  disallow: readonly string[] = [],
): SeedProblem => ({
  id,
  title,
  topic,
  difficulty,
  functionName,
  promptMd: promptMd.trim(),
  starterCode,
  tests,
  disallow,
  ...contractsFor(id),
});

const lesson = (
  id: string,
  title: string,
  summary: string,
  minutes: number,
  bitesizeMd: string,
  contentMd: string,
  problems: readonly SeedProblem[],
): SeedLesson => ({
  id,
  slug: id,
  title,
  summary,
  estimatedMinutes: minutes,
  bitesizeMd,
  contentMd: contentMd.trim(),
  problems,
});

const pairCost = lesson(
  "pair-cost",
  "The cost of a pair",
  "A loop inside a loop counts pairs, and the work grows much faster than one pass.",
  20,
  stepBitesize.pairCost,
  `
One pass is a line of work. A pair is two indexes, \`i\` and \`j\`, with \`i < j\`.

To look at every pair you write a loop inside a loop. That shape is O(n²). Ten values are a small triangle. A thousand values are on the order of half a million pairs.

Count only the pairs the question asks for:

- Ascending pairs, where the left value is strictly smaller.
- Equal pairs, where the two values match.

Start the inner index at \`i + 1\`. Starting it at 0 counts each pair twice, and it also pairs a value with itself.

The next time a solution feels slow, point at the indentation before you look for a clever formula.
  `,
  [
    problem(
      "ascending-pairs",
      "Count ascending pairs",
      "Complexity",
      "easy",
      "countAscendingPairs",
      `
Return how many index pairs \`i < j\` have \`nums[i] < nums[j]\`.

\`countAscendingPairs([1, 3, 2])\` is 2. An empty array returns 0.
      `,
      `export function countAscendingPairs(nums: number[]): number {
  return 0;
}
`,
      [
        { name: "two pairs", args: [[1, 3, 2]], expected: 2, public: true },
        { name: "sorted", args: [[1, 2, 3]], expected: 3, public: true },
        { name: "empty", args: [[]], expected: 0, public: false },
        { name: "descending", args: [[3, 2, 1]], expected: 0, public: false },
      ],
    ),
    problem(
      "equal-pairs",
      "Count equal pairs",
      "Complexity",
      "easy",
      "countEqualPairs",
      `
Return how many index pairs \`i < j\` have \`nums[i] === nums[j]\`.

\`countEqualPairs([1, 1, 1])\` is 3.
      `,
      `export function countEqualPairs(nums: number[]): number {
  return 0;
}
`,
      [
        { name: "three equals", args: [[1, 1, 1]], expected: 3, public: true },
        { name: "one pair", args: [[1, 2, 1]], expected: 1, public: true },
        { name: "none", args: [[1, 2, 3]], expected: 0, public: false },
        { name: "empty", args: [[]], expected: 0, public: false },
      ],
    ),
  ],
);

const arrayShifts = lesson(
  "array-shifts",
  "Moving the middle",
  "Inserting or deleting before the end slides every later element.",
  20,
  stepBitesize.arrayShifts,
  `
A contiguous list keeps values shoulder to shoulder. \`nums[i]\` is still O(1). A middle edit is not.

Delete the value at index 2 and every later value slides one slot left. Insert at index 0 and the whole tail slides right. Both copies are O(n), because you write a new array and leave the input alone.

In this lesson you practice that slide twice:

- Remove the value at an index.
- Insert a value at an index.

If the index is past the end, remove changes nothing and insert adds at the end. An off-by-one here shows up as a value in the wrong slot, not as a crash.
  `,
  [
    problem(
      "remove-at",
      "Remove at an index",
      "Arrays",
      "easy",
      "removeAt",
      `
Return a new array without the value at \`index\`. Do not mutate \`nums\`.

If \`index\` is outside the array, return a copy of \`nums\`.
      `,
      `export function removeAt(nums: number[], index: number): number[] {
  return [];
}
`,
      [
        {
          name: "middle",
          args: [[1, 2, 3, 4], 1],
          expected: [1, 3, 4],
          public: true,
        },
        { name: "front", args: [[8, 9], 0], expected: [9], public: true },
        {
          name: "past the end",
          args: [[1, 2], 5],
          expected: [1, 2],
          public: false,
        },
        { name: "empty", args: [[], 0], expected: [], public: false },
      ],
    ),
    problem(
      "insert-at",
      "Insert at an index",
      "Arrays",
      "easy",
      "insertAt",
      `
Return a new array with \`value\` inserted at \`index\`. Values that were at that index and after it shift right.

If \`index\` is negative, insert at the front. If it is past the end, add \`value\` at the end. Do not mutate \`nums\`.
      `,
      `export function insertAt(nums: number[], index: number, value: number): number[] {
  return [];
}
`,
      [
        {
          name: "middle",
          args: [[1, 2, 4], 2, 3],
          expected: [1, 2, 3, 4],
          public: true,
        },
        {
          name: "front",
          args: [[2, 3], 0, 1],
          expected: [1, 2, 3],
          public: true,
        },
        { name: "end", args: [[1], 5, 9], expected: [1, 9], public: false },
        {
          name: "negative inserts at front",
          args: [[2, 3], -4, 1],
          expected: [1, 2, 3],
          public: false,
        },
        { name: "empty", args: [[], 0, 4], expected: [4], public: false },
      ],
    ),
  ],
);

const frequencyCounts = lesson(
  "frequency-counts",
  "Counting with a map",
  "A frequency count stores how many times each value has appeared.",
  20,
  stepBitesize.frequencyCounts,
  `
Two Sum asked whether you had seen a complement. A frequency count asks how many times you have seen a value.

Use a hash map from value to count. One pass updates the count. A second question, the most frequent value, reads those counts back.

When several values tie, return the one that appears earliest in the array. Store the first index beside the count, or only replace the winner when the new count is strictly greater and you break ties by that first index.

This is still the space-for-time trade: O(n) extra memory, O(n) time, and no nested scan.
  `,
  [
    problem(
      "frequency-of",
      "Frequency of a value",
      "Hash maps",
      "easy",
      "frequencyOf",
      `
Return how many times \`target\` appears in \`nums\`. A frequency count in one pass is enough. An empty array returns 0.
      `,
      `export function frequencyOf(nums: number[], target: number): number {
  return 0;
}
`,
      [
        { name: "three", args: [[1, 2, 1, 1], 1], expected: 3, public: true },
        { name: "absent", args: [[4, 5], 1], expected: 0, public: true },
        { name: "empty", args: [[], 2], expected: 0, public: false },
        {
          name: "negatives",
          args: [[-1, -1, 0], -1],
          expected: 2,
          public: false,
        },
      ],
    ),
    problem(
      "most-frequent",
      "Most frequent value",
      "Hash maps",
      "easy",
      "mostFrequent",
      `
Return the value that appears most often in \`nums\`. \`nums\` is non-empty.

If several values share that count, return the one that appears first in the array.
      `,
      `export function mostFrequent(nums: number[]): number {
  return 0;
}
`,
      [
        {
          name: "clear winner",
          args: [[1, 2, 2, 3]],
          expected: 2,
          public: true,
        },
        {
          name: "tie keeps the earlier value",
          args: [[1, 2, 2, 1]],
          expected: 1,
          public: true,
        },
        { name: "single", args: [[7]], expected: 7, public: false },
        { name: "later tie", args: [[3, 1, 3, 1]], expected: 3, public: false },
      ],
    ),
  ],
);

const inwardScan = lesson(
  "inward-scan",
  "Pointers that meet",
  "Inward pointers compare the ends and move exactly one of them.",
  20,
  stepBitesize.inwardScan,
  `
Sorted squares moved the pointer whose square was larger. Inward pointers are the same shape with a different rule.

Put one index on the left and one on the right.

- A palindrome compares the ends. If they match, both move inward. If they do not, you stop.
- A sorted pair sum compares the total. Too small means move the left pointer. Too large means move the right pointer.

Each step drops one index, so the walk is O(n). The array has to be ordered for the sum rule. A palindrome does not need sorted values. It needs the ends to be the pair you care about.

You will write both.
  `,
  [
    problem(
      "is-palindrome",
      "Array palindrome",
      "Two pointers",
      "easy",
      "isPalindrome",
      `
Return true when \`nums\` reads the same from both ends.

An empty array and a one-element array are palindromes. Compare the ends and move inward.
      `,
      `export function isPalindrome(nums: number[]): boolean {
  return false;
}
`,
      [
        {
          name: "even length",
          args: [[1, 2, 2, 1]],
          expected: true,
          public: true,
        },
        {
          name: "not a palindrome",
          args: [[1, 2, 3]],
          expected: false,
          public: true,
        },
        { name: "empty", args: [[]], expected: true, public: false },
        { name: "single", args: [[9]], expected: true, public: false },
      ],
    ),
    problem(
      "pair-indices",
      "Indexes of a sorted pair",
      "Two pointers",
      "easy",
      "pairIndices",
      `
\`nums\` is sorted ascending. Return the indexes of two different values that add up to \`target\`, smaller index first. When more than one pair works, return the pair found by starting at both ends and moving only the left pointer for a sum that is too small or only the right pointer for a sum that is too large.

If no pair exists, return \`[-1, -1]\`.
      `,
      `export function pairIndices(nums: number[], target: number): number[] {
  return [];
}
`,
      [
        {
          name: "middle pair",
          args: [[1, 2, 4, 6], 6],
          expected: [1, 2],
          public: true,
        },
        {
          name: "absent",
          args: [[1, 2, 3], 7],
          expected: [-1, -1],
          public: true,
        },
        {
          name: "ends",
          args: [[-2, 0, 3], 1],
          expected: [0, 2],
          public: false,
        },
        {
          name: "duplicates",
          args: [[1, 1, 2], 2],
          expected: [0, 1],
          public: false,
        },
        {
          name: "multiple pairs use the inward scan",
          args: [[1, 2, 3, 4, 5], 6],
          expected: [0, 4],
          public: false,
        },
      ],
    ),
  ],
);

const variableWindow = lesson(
  "variable-window",
  "Grow, then shrink",
  "A variable window moves its left edge only when the sum is already good enough.",
  25,
  stepBitesize.variableWindow,
  `
A fixed window always has \`k\` elements. A variable window grows on the right and shrinks on the left, and its length changes.

These arrays hold numbers that are zero or positive, so growing the right side never makes the sum smaller. That is what keeps the walk honest:

- Add \`nums[right]\`.
- While the window is too large for the question, subtract \`nums[left]\` and move \`left\` forward.
- \`left\` never moves backward. Each index enters once and leaves once, so the scan is O(n).

A prefix sum can answer range sums too. You do not need it here. The window already holds the sum of the current slice.

You will look for the shortest slice that reaches a target, then the longest slice that stays under one.
  `,
  [
    problem(
      "shortest-at-least",
      "Shortest window at least the target",
      "Sliding window",
      "medium",
      "shortestAtLeast",
      `
\`nums\` contains only zeros and positive numbers. Return the length of the shortest contiguous slice whose sum is at least \`target\`.

\`target\` is a positive number. If no slice qualifies, return 0.
      `,
      `export function shortestAtLeast(nums: number[], target: number): number {
  return 0;
}
`,
      [
        {
          name: "the classic window",
          args: [[2, 3, 1, 2, 4, 3], 7],
          expected: 2,
          public: true,
        },
        {
          name: "one element",
          args: [[1, 4, 4], 4],
          expected: 1,
          public: true,
        },
        { name: "impossible", args: [[1, 1], 5], expected: 0, public: false },
        {
          name: "whole array",
          args: [[1, 2, 3], 6],
          expected: 3,
          public: false,
        },
      ],
    ),
    problem(
      "longest-at-most",
      "Longest window at most the target",
      "Sliding window",
      "medium",
      "longestAtMost",
      `
\`nums\` contains only zeros and positive numbers. Return the length of the longest contiguous slice whose sum is at most \`target\`.

If every element is greater than \`target\`, return 0.
      `,
      `export function longestAtMost(nums: number[], target: number): number {
  return 0;
}
`,
      [
        {
          name: "length two",
          args: [[1, 2, 3, 1], 3],
          expected: 2,
          public: true,
        },
        {
          name: "all fit in pairs",
          args: [[1, 1, 1, 1], 2],
          expected: 2,
          public: true,
        },
        { name: "nothing fits", args: [[5], 3], expected: 0, public: false },
        { name: "zeros", args: [[0, 0, 1], 0], expected: 2, public: false },
      ],
    ),
  ],
);

const listWalks = lesson(
  "list-walks",
  "A second pointer",
  "Two pointers on a linked list can find the middle, or the node n places from the end.",
  25,
  stepBitesize.listWalks,
  `
A linked list has no indexes. The way to know a distance is to walk.

Three pointers reversed the list: previous, current, and the saved next. This lesson uses two pointers that move at different speeds, or the same speed after a head start.

- The middle: move one pointer one step and another two steps. When the fast one cannot move, the slow one is at the middle. On an even length, return the second middle.
- The nth from the end: move a fast pointer \`n\` steps first. Then move both. When the fast pointer falls off, the slow one is the answer.

The starter turns an array into nodes. Walk \`next\`. An array index skips the point of the lesson.

If \`n\` is larger than the list, or the list is empty, return \`-1\`.
  `,
  [
    problem(
      "middle-value",
      "Middle of a linked list",
      "Linked lists",
      "easy",
      "middleValue",
      `
Build a linked list from \`values\`. Return the middle value.

On an odd length there is one middle. On an even length return the second middle. An empty list returns \`-1\`.
      `,
      listStarter(
        "export function middleValue(values: number[]): number",
        "  return -1;",
      ),
      [
        { name: "odd", args: [[1, 2, 3, 4, 5]], expected: 3, public: true },
        { name: "even", args: [[1, 2, 3, 4]], expected: 3, public: true },
        { name: "empty", args: [[]], expected: -1, public: false },
        { name: "one node", args: [[8]], expected: 8, public: false },
      ],
    ),
    problem(
      "nth-from-end",
      "Nth from the end",
      "Linked lists",
      "medium",
      "nthFromEnd",
      `
Build a linked list from \`values\`. Return the value \`n\` places from the end. \`n\` is 1-based, so 1 is the last node.

If \`n\` is less than 1 or greater than the length, return \`-1\`. Give one pointer a head start of \`n\` steps.
      `,
      listStarter(
        "export function nthFromEnd(values: number[], n: number): number",
        "  return -1;",
      ),
      [
        {
          name: "second from the end",
          args: [[1, 2, 3, 4, 5], 2],
          expected: 4,
          public: true,
        },
        {
          name: "the last node",
          args: [[1, 2, 3], 1],
          expected: 3,
          public: true,
        },
        { name: "too far", args: [[1, 2], 4], expected: -1, public: false },
        { name: "the head", args: [[8, 1, 4], 3], expected: 8, public: false },
      ],
    ),
  ],
);

const stackMemory = lesson(
  "stack-memory",
  "Remember what is still open",
  "A stack keeps the most recent unfinished fact until a later value closes it.",
  25,
  stepBitesize.stackMemory,
  `
Balanced brackets used a stack because a closer has to meet the most recent opener. The same memory shows up in two more problems.

A backspace \`#\` deletes the character you just kept. The top of the stack is that character. Pop it. A letter pushes.

The next greater value to the right is the first later value that is strictly larger. Walk from the left and keep indexes whose values are still waiting. When the new value is larger than the top, that waiting index has found its answer. Pop it, record the new value, and look at the new top.

Both walks are one pass. Each index is pushed once and popped once, so the stack work is O(n) even though a nested scan would also be correct.
  `,
  [
    problem(
      "apply-backspace",
      "Apply backspaces",
      "Stacks",
      "easy",
      "applyBackspace",
      `
\`#\` deletes the previous character that is still in the result. Return the string after every backspace.

\`applyBackspace("ab#c")\` is \`"ac"\`. Backspaces at the start do nothing. An empty string stays empty.
      `,
      `export function applyBackspace(value: string): string {
  return "";
}
`,
      [
        { name: "one deletion", args: ["ab#c"], expected: "ac", public: true },
        {
          name: "clear the start",
          args: ["a##b"],
          expected: "b",
          public: true,
        },
        { name: "only backspaces", args: ["##"], expected: "", public: false },
        { name: "no backspaces", args: ["ab"], expected: "ab", public: false },
      ],
    ),
    problem(
      "next-greater",
      "Next greater value",
      "Stacks",
      "medium",
      "nextGreater",
      `
For each index, return the next value to its right that is strictly greater. If none exists, use \`-1\`.

\`nextGreater([2, 1, 2, 4, 3])\` is \`[4, 2, 4, -1, -1]\`. A stack of waiting indexes keeps this to one pass.
      `,
      `export function nextGreater(nums: number[]): number[] {
  return [];
}
`,
      [
        {
          name: "the lesson walk",
          args: [[2, 1, 2, 4, 3]],
          expected: [4, 2, 4, -1, -1],
          public: true,
        },
        {
          name: "descending",
          args: [[3, 2, 1]],
          expected: [-1, -1, -1],
          public: true,
        },
        { name: "empty", args: [[]], expected: [], public: false },
        {
          name: "increasing",
          args: [[1, 2, 3]],
          expected: [2, 3, -1],
          public: false,
        },
      ],
    ),
  ],
);

const queueLines = lesson(
  "queue-lines",
  "First in, first served",
  "A sliding window on a queue can count, or it can keep the maximum, if you drop what can never win.",
  25,
  stepBitesize.queueLines,
  `
The previous queue kept the last \`k\` arrivals. Two questions use that same line.

Counting negatives in the window is the sum idea with a different update. When a negative enters, add one. When a negative leaves, subtract one.

The maximum in the window is stricter. A value hidden behind a larger newer value can never be the max, so you drop it from the back. The front of that deque is the current maximum. When the front index falls out of the window, dequeue it.

Breadth-first search, later in the course, is this same queue with vertices instead of numbers. First in, first out is the whole rule.

If \`k\` is less than 1 or greater than the length, return an empty array.
  `,
  [
    problem(
      "negative-counts",
      "Negatives in each window",
      "Queues",
      "easy",
      "negativeCounts",
      `
Return, for every contiguous block of exactly \`k\` elements, how many values are strictly negative.

If \`k\` does not fit, return an empty array.
      `,
      `export function negativeCounts(nums: number[], k: number): number[] {
  return [];
}
`,
      [
        {
          name: "windows of two",
          args: [[-1, 2, -3, 4], 2],
          expected: [1, 1, 1],
          public: true,
        },
        { name: "too wide", args: [[1, -1], 3], expected: [], public: true },
        {
          name: "none negative",
          args: [[1, 2, 3], 2],
          expected: [0, 0],
          public: false,
        },
        {
          name: "all negative",
          args: [[-2, -4], 1],
          expected: [1, 1],
          public: false,
        },
      ],
    ),
    problem(
      "max-in-window",
      "Maximum in each window",
      "Queues",
      "medium",
      "maxInWindow",
      `
Return the maximum of every contiguous block of exactly \`k\` elements, from left to right.

If \`k\` does not fit, return an empty array. A deque of indexes can do this in one pass.
      `,
      `export function maxInWindow(nums: number[], k: number): number[] {
  return [];
}
`,
      [
        {
          name: "the classic windows",
          args: [[1, 3, -1, -3, 5, 3, 6, 7], 3],
          expected: [3, 3, 5, 5, 6, 7],
          public: true,
        },
        {
          name: "window of one",
          args: [[4, 2], 1],
          expected: [4, 2],
          public: true,
        },
        { name: "too wide", args: [[1], 2], expected: [], public: false },
        {
          name: "negatives",
          args: [[-1, -5, -2], 2],
          expected: [-1, -2],
          public: false,
        },
      ],
    ),
  ],
);

const twoCalls = lesson(
  "two-calls",
  "Two recursive calls",
  "Some problems split into two smaller copies. The base case is what stops the split.",
  25,
  stepBitesize.twoCalls,
  `
Flatten and the nested sum made one recursive call per child. Fibonacci makes two calls from the same call: \`fib(n - 1)\` and \`fib(n - 2)\`.

The base case is the stop. Here \`fib(1)\` and \`fib(2)\` are both 1. Without that stop the call stack grows until it overflows.

Those two calls overlap. \`fib(5)\` computes \`fib(3)\` more than once. The function is still correct. It is also exponential. Dynamic programming, in a later week, stores the repeated answers. This lesson only asks you to trust the recurrence.

The second exercise measures nesting. A number has depth 0. An array is one deeper than its deepest child. An empty array has depth 1, because the array itself is a level.
  `,
  [
    problem(
      "fib",
      "Fibonacci",
      "Recursion",
      "easy",
      "fib",
      `
Return the \`n\`th Fibonacci number. \`fib(1)\` and \`fib(2)\` are 1. Every later value is the sum of the two before it.

\`n\` is at least 1. Two recursive calls are the point. A loop also passes, and the next pattern week will ask you to cache the overlap.
      `,
      `export function fib(n: number): number {
  return 0;
}
`,
      [
        { name: "three", args: [3], expected: 2, public: true },
        { name: "one", args: [1], expected: 1, public: true },
        { name: "two", args: [2], expected: 1, public: false },
        { name: "six", args: [6], expected: 8, public: false },
      ],
    ),
    problem(
      "nested-depth",
      "Depth of nesting",
      "Recursion",
      "easy",
      "nestedDepth",
      `
\`value\` is a number or an array of the same shape. A number has depth 0. An array's depth is 1 plus the deepest child.

An empty array has depth 1.
      `,
      `type Nested = number | Nested[];

export function nestedDepth(value: Nested): number {
  return 0;
}
`,
      [
        {
          name: "three levels",
          args: [[1, [2, [3]]]],
          expected: 3,
          public: true,
        },
        { name: "a number", args: [4], expected: 0, public: true },
        { name: "empty array", args: [[]], expected: 1, public: false },
        { name: "siblings", args: [[[], [1]]], expected: 2, public: false },
      ],
    ),
  ],
);

const searchBounds = lesson(
  "search-bounds",
  "The empty range",
  "When duplicates are allowed, binary search keeps moving after it finds a match.",
  25,
  stepBitesize.searchBounds,
  `
The first binary search returned as soon as \`nums[mid]\` matched. With duplicates, a match is not the answer yet. It only tells you the target exists in this half.

Keep the same invariant: if an answer exists, its index is still inside \`lo\` and \`hi\`.

- First equal: when you find the target, remember the index and keep searching left.
- Last equal: when you find the target, remember the index and keep searching right.

When the range is empty, \`lo > hi\`, you stop. If you never remembered an index, return \`-1\`.

The off-by-one is the move after a match. \`hi = mid - 1\` excludes the match you already saved. Leaving \`hi\` on \`mid\` loops forever.

The array is sorted. Duplicates are allowed. Unsorted data still makes the throw-away-half step wrong.
  `,
  [
    problem(
      "first-equal",
      "First equal index",
      "Binary search",
      "medium",
      "firstEqual",
      `
\`nums\` is sorted ascending and may contain duplicates. Return the smallest index whose value is \`target\`, or \`-1\` if it is absent.

Use binary search. After a match, keep looking left.
      `,
      `export function firstEqual(nums: number[], target: number): number {
  return -1;
}
`,
      [
        {
          name: "duplicates",
          args: [[1, 2, 2, 2, 3], 2],
          expected: 1,
          public: true,
        },
        {
          name: "absent",
          args: [[1, 2, 2, 2, 3], 4],
          expected: -1,
          public: true,
        },
        {
          name: "first element",
          args: [[2, 2, 3], 2],
          expected: 0,
          public: false,
        },
        { name: "empty", args: [[], 1], expected: -1, public: false },
      ],
    ),
    problem(
      "last-equal",
      "Last equal index",
      "Binary search",
      "medium",
      "lastEqual",
      `
\`nums\` is sorted ascending and may contain duplicates. Return the largest index whose value is \`target\`, or \`-1\` if it is absent.

Use binary search. After a match, keep looking right.
      `,
      `export function lastEqual(nums: number[], target: number): number {
  return -1;
}
`,
      [
        {
          name: "duplicates",
          args: [[1, 2, 2, 2, 3], 2],
          expected: 3,
          public: true,
        },
        {
          name: "absent",
          args: [[1, 2, 2, 2, 3], 0],
          expected: -1,
          public: true,
        },
        {
          name: "last element",
          args: [[1, 3, 3], 3],
          expected: 2,
          public: false,
        },
        { name: "single", args: [[4], 4], expected: 0, public: false },
      ],
    ),
  ],
);

const sortChoices = lesson(
  "sort-choices",
  "Which sort you meant",
  "Bubble sort is easy to finish by hand. Merge sort is the one to keep.",
  25,
  stepBitesize.sortChoices,
  `
You can check order before you sort. A scan that compares each neighbour with the next is O(n). That is \`isSorted\`.

Bubble sort swaps neighbours until a pass makes no swaps, or until you have done enough passes to be sure. It is easy to draw and O(n²). Implement it once so the swaps feel real. Then leave it.

Merge sort, on the previous lesson, splits, sorts, and merges a sorted run from each half. That stays O(n log n). The extra arrays are the cost of the clear merge.

JavaScript's default sort compares values as strings unless you pass a compare function. These exercises disallow \`.sort()\` so the swaps and the merge stay visible.

Do not mutate the input of bubble sort. Return a new array.
  `,
  [
    problem(
      "is-sorted",
      "Is it already sorted?",
      "Sorting",
      "easy",
      "isSorted",
      `
Return true when \`nums\` is in non-decreasing order. Equal neighbours are allowed.

An empty array is sorted.
      `,
      `export function isSorted(nums: number[]): boolean {
  return false;
}
`,
      [
        {
          name: "equals allowed",
          args: [[1, 2, 2]],
          expected: true,
          public: true,
        },
        {
          name: "out of order",
          args: [[1, 3, 2]],
          expected: false,
          public: true,
        },
        { name: "empty", args: [[]], expected: true, public: false },
        {
          name: "negatives",
          args: [[-2, -1, 0]],
          expected: true,
          public: false,
        },
      ],
    ),
    problem(
      "bubble-sort",
      "Bubble sort",
      "Sorting",
      "easy",
      "bubbleSort",
      `
Return a new array with the numbers sorted ascending. Implement bubble sort by swapping neighbours.

Do not call \`.sort()\`. Do not mutate \`nums\`.
      `,
      `export function bubbleSort(nums: number[]): number[] {
  return [];
}
`,
      [
        {
          name: "unsorted",
          args: [[5, 1, 4, 2]],
          expected: [1, 2, 4, 5],
          public: true,
        },
        {
          name: "duplicates",
          args: [[3, 1, 3]],
          expected: [1, 3, 3],
          public: true,
        },
        { name: "empty", args: [[]], expected: [], public: false },
        {
          name: "negatives",
          args: [[0, -2, 4]],
          expected: [-2, 0, 4],
          public: false,
        },
      ],
      [".sort("],
    ),
  ],
);

const treeCounts = lesson(
  "tree-counts",
  "Leaves and totals",
  "Depth was the longer child plus one. A leaf count and a sum walk every node the same way.",
  20,
  stepBitesize.treeCounts,
  `
The depth of a tree is 1 plus the larger child. A leaf is the base case of a different question: a node with no children.

- A leaf count adds 1 at a leaf and adds the two children otherwise. An empty tree has 0 leaves.
- A sum adds the node's value to both children. An empty tree sums to 0.

Both are depth-first. The call stack still finishes one branch before the other. You do not need a queue unless you want level order.

The input is the same level-order list as the depth lesson, with \`null\` for a missing child. Use \`buildTree\`. Then write the recursive rule.
  `,
  [
    problem(
      "leaf-count",
      "Count the leaves",
      "Trees",
      "easy",
      "leafCount",
      `
\`values\` is a binary tree in level order. Return how many leaves it has.

A leaf has no children. An empty list returns 0. A single node returns 1.
      `,
      treeStarter(
        "export function leafCount(values: Array<number | null>): number",
        "  return 0;",
      ),
      [
        {
          name: "the lesson tree",
          args: [[3, 9, 20, null, null, 15, 7]],
          expected: 3,
          public: true,
        },
        { name: "single node", args: [[1]], expected: 1, public: true },
        { name: "empty", args: [[]], expected: 0, public: false },
        {
          name: "left spine",
          args: [[1, 2, null, 3]],
          expected: 1,
          public: false,
        },
      ],
    ),
    problem(
      "tree-sum",
      "Sum the node values",
      "Trees",
      "easy",
      "treeSum",
      `
\`values\` is a binary tree in level order. Return the sum of every node value.

An empty list returns 0.
      `,
      treeStarter(
        "export function treeSum(values: Array<number | null>): number",
        "  return 0;",
      ),
      [
        {
          name: "the lesson tree",
          args: [[3, 9, 20, null, null, 15, 7]],
          expected: 54,
          public: true,
        },
        { name: "single node", args: [[4]], expected: 4, public: true },
        { name: "empty", args: [[]], expected: 0, public: false },
        { name: "negatives", args: [[1, -2, 3]], expected: 2, public: false },
      ],
    ),
  ],
);

const bstShape = lesson(
  "bst-shape",
  "A tree can be a line",
  "A binary search tree is only fast when the height stays short.",
  25,
  stepBitesize.bstShape,
  `
Search walks left or right, so the cost is the height, not a promise of O(log n).

Insert sorted values in order and every new node hangs on the right. The picture is a linked list drawn down the page. A balanced tree, AVL or red-black, rotates to stop that. You still do not implement a rotation. You do measure the damage.

Height here is the number of nodes on the longest path, the same counting rule as tree depth. An empty tree has height 0. A single node has height 1. \`[1, 2, 3]\` inserted in that order has height 3. \`[2, 1, 3]\` has height 2.

Build the tree by inserting in order. Then compute the height from the root. Do not sort the array and do not call \`Math.max\` on the values themselves. \`Math.max\` of two child heights is the recursive rule, and that call is allowed.
  `,
  [
    problem(
      "bst-height",
      "Height after insertion",
      "Binary search trees",
      "medium",
      "bstHeight",
      `
Insert \`values\` in order into a binary search tree. Return the height as a count of nodes on the longest path.

An empty list returns 0. Do not sort the input.
      `,
      bstStarter(
        "export function bstHeight(values: number[]): number",
        "  return 0;",
      ),
      [
        { name: "a spine", args: [[1, 2, 3]], expected: 3, public: true },
        { name: "balanced", args: [[2, 1, 3]], expected: 2, public: true },
        { name: "empty", args: [[]], expected: 0, public: false },
        { name: "single", args: [[4]], expected: 1, public: false },
      ],
      [".sort("],
    ),
    problem(
      "bst-contains-shaped",
      "Search after a sorted insert",
      "Binary search trees",
      "easy",
      "bstContainsShaped",
      `
Insert \`values\` in order, then return whether \`target\` is in the tree.

The point is the walk, including on a tree that has become a line. An empty tree does not contain the target.
      `,
      bstStarter(
        "export function bstContainsShaped(values: number[], target: number): boolean",
        "  return false;",
      ),
      [
        {
          name: "present on a spine",
          args: [[1, 2, 3], 3],
          expected: true,
          public: true,
        },
        { name: "absent", args: [[2, 1, 3], 4], expected: false, public: true },
        { name: "empty", args: [[], 1], expected: false, public: false },
        { name: "root", args: [[5, 1, 7], 5], expected: true, public: false },
      ],
      [".includes", ".sort("],
    ),
  ],
);

const heapLayout = lesson(
  "heap-layout",
  "Parents and children",
  "A heap is an array. The parent and the children are index arithmetic.",
  20,
  stepBitesize.heapLayout,
  `
The min-heap check compared each value with its parent. This lesson is only the indexes, so the picture is obvious before the swaps.

For a node at index \`i\`, with \`i\` starting at 0:

- The parent is \`Math.floor((i - 1) / 2)\`. Index 0 has no parent.
- The left child is \`2 * i + 1\`.
- The right child is \`2 * i + 2\`.

That is a child index, not a pointer. The array stays contiguous, which is why the root is \`nums[0]\` and why a complete tree does not need \`left\` and \`right\` fields.

You will return the parent index, then the two child indexes. The child indexes may sit past the end of a particular array. This exercise asks for the formula, not for a bounds check.
  `,
  [
    problem(
      "parent-index",
      "Parent index",
      "Heaps",
      "easy",
      "parentIndex",
      `
Return the parent index of \`index\` in a heap stored in an array. Index 0, and any negative index, returns \`-1\`.
      `,
      `export function parentIndex(index: number): number {
  return -1;
}
`,
      [
        { name: "the root", args: [0], expected: -1, public: true },
        { name: "a left child", args: [1], expected: 0, public: true },
        { name: "deeper", args: [4], expected: 1, public: false },
        { name: "right child", args: [2], expected: 0, public: false },
      ],
    ),
    problem(
      "child-indexes",
      "Child indexes",
      "Heaps",
      "easy",
      "childIndexes",
      `
Return \`[left, right]\` for a heap node at \`index\`. Use \`2 * i + 1\` and \`2 * i + 2\`.

Do not check whether those indexes exist in a particular array.
      `,
      `export function childIndexes(index: number): number[] {
  return [];
}
`,
      [
        { name: "the root", args: [0], expected: [1, 2], public: true },
        { name: "index one", args: [1], expected: [3, 4], public: true },
        { name: "index two", args: [2], expected: [5, 6], public: false },
        { name: "deeper", args: [3], expected: [7, 8], public: false },
      ],
    ),
  ],
);

const visitedWalks = lesson(
  "visited-walks",
  "Mark where you have been",
  "A visited set is what stops a graph search from walking a cycle forever.",
  25,
  stepBitesize.visitedWalks,
  `
A tree has no cycles, so a recursive walk cannot return to a node except by going back up the call stack. A graph can have a cycle. If you enqueue a neighbour you have already seen, the queue never ends.

Build an adjacency list from the undirected edges. Then search from the start.

- Mark a vertex when you first enqueue it, not when you dequeue it.
- The component size is how many vertices you mark, including the start.
- Reaching every vertex means that count equals the number of vertices you were told exist, \`0\` through \`count - 1\`.

Breadth-first search and depth-first search both answer these two questions. Breadth-first search was the tool for fewest edges. Here the question is only who you can touch.

A vertex you start on, with no edges, is a component of one.
  `,
  [
    problem(
      "component-size",
      "Size of a component",
      "Graphs",
      "medium",
      "componentSize",
      `
\`edges\` is a list of undirected edges. Return how many vertices are reachable from \`start\`, including \`start\`.

Mark a visited set as you go.
      `,
      `export function componentSize(edges: number[][], start: number): number {
  return 0;
}
`,
      [
        {
          name: "three vertices",
          args: [
            [
              [0, 1],
              [1, 2],
              [3, 4],
            ],
            0,
          ],
          expected: 3,
          public: true,
        },
        {
          name: "the other component",
          args: [
            [
              [0, 1],
              [1, 2],
              [3, 4],
            ],
            3,
          ],
          expected: 2,
          public: true,
        },
        { name: "isolated start", args: [[], 5], expected: 1, public: false },
        {
          name: "a cycle",
          args: [
            [
              [0, 1],
              [1, 0],
            ],
            0,
          ],
          expected: 2,
          public: false,
        },
      ],
    ),
    problem(
      "reaches-all",
      "Does the walk reach everyone?",
      "Graphs",
      "medium",
      "reachesAll",
      `
Vertices are \`0\` through \`count - 1\`. \`edges\` is undirected. Return true when every vertex is reachable from \`start\`.

\`count\` is at least 1. Every edge endpoint and \`start\` are integers from \`0\` through \`count - 1\`.
      `,
      `export function reachesAll(
  edges: number[][],
  count: number,
  start: number,
): boolean {
  return false;
}
`,
      [
        {
          name: "one component",
          args: [
            [
              [0, 1],
              [1, 2],
            ],
            3,
            0,
          ],
          expected: true,
          public: true,
        },
        {
          name: "someone is missing",
          args: [[[0, 1]], 3, 0],
          expected: false,
          public: true,
        },
        {
          name: "a single vertex",
          args: [[], 1, 0],
          expected: true,
          public: false,
        },
        {
          name: "start is not enough",
          args: [[[1, 2]], 3, 0],
          expected: false,
          public: false,
        },
      ],
    ),
  ],
);

const greedyChecks = lesson(
  "greedy-checks",
  "Try to break the rule",
  "A greedy rule is safe only when you cannot name a case it gets wrong.",
  25,
  stepBitesize.greedyChecks,
  `
Interval scheduling sorted half-open intervals by finishing time and took the one that frees you soonest. The first choice in that rule is the interval with the earliest end.

Write that choice on its own. If two intervals finish together, take the one with the smaller start. If the list is empty, return an empty array.

Then try a different greedy rule, on a different problem. Jump game gives you an array of jump lengths. From index \`i\` you may jump at most \`nums[i]\` steps forward. The greedy fact is the farthest index you can reach so far. If the index you are standing on is already beyond that reach, you are stuck.

Sorting by start time was the rule that fails interval scheduling, because a long early meeting blocks several short ones. Jump game keeps a farthest reach, the furthest index you can land on so far. If you can name a counterexample, do not keep the rule.
  `,
  [
    problem(
      "earliest-finish",
      "Earliest finishing interval",
      "Greedy",
      "easy",
      "earliestFinish",
      `
Each interval is \`[start, end)\`. Return the interval that finishes first.

If two share that end, return the one with the smaller start. An empty list returns an empty array.
      `,
      `export function earliestFinish(intervals: number[][]): number[] {
  return [];
}
`,
      [
        {
          name: "the short middle",
          args: [
            [
              [1, 5],
              [2, 3],
              [4, 6],
            ],
          ],
          expected: [2, 3],
          public: true,
        },
        { name: "empty", args: [[]], expected: [], public: true },
        {
          name: "tie on the end",
          args: [
            [
              [2, 4],
              [1, 4],
              [0, 5],
            ],
          ],
          expected: [1, 4],
          public: false,
        },
        {
          name: "one interval",
          args: [[[3, 8]]],
          expected: [3, 8],
          public: false,
        },
      ],
    ),
    problem(
      "can-jump",
      "Can you jump to the end?",
      "Greedy",
      "medium",
      "canJump",
      `
\`nums[i]\` is the farthest jump you may take from index \`i\`. Return true when you can reach the last index.

Jumps are zero or positive. An empty array has no last index and returns false. A one-element array is already at the end.
      `,
      `export function canJump(nums: number[]): boolean {
  return false;
}
`,
      [
        {
          name: "reaches",
          args: [[2, 3, 1, 1, 4]],
          expected: true,
          public: true,
        },
        {
          name: "stuck behind a zero",
          args: [[3, 2, 1, 0, 4]],
          expected: false,
          public: true,
        },
        { name: "already there", args: [[0]], expected: true, public: false },
        { name: "empty", args: [[]], expected: false, public: false },
        {
          name: "zero then a step",
          args: [[0, 1]],
          expected: false,
          public: false,
        },
      ],
    ),
  ],
);

const orderMatters = lesson(
  "order-matters",
  "When order matters",
  "Subsets ignore order. A permutation is the same values in a different order.",
  25,
  stepBitesize.orderMatters,
  `
Subsets asked, for each value, in or out. Order inside a subset did not matter, so \`[1, 2]\` and \`[2, 1]\` were the same subset.

A permutation is an ordering. \`[1, 2]\` and \`[2, 1]\` are different answers. You still choose, explore, then undo. The difference is the choice: which unused value comes next, not whether the next value is included.

Keep a \`used\` flag per index, or swap the value into the current slot and swap it back. Copy the path when you record it. If you push the path array itself, later pops empty the answers you thought you saved.

The second exercise stops at length \`k\`. Those are ordered selections, not full permutations. The same undo applies.

Return the orderings in the order a left-to-right scan of the input produces them. For \`[1, 2]\` that is \`[[1, 2], [2, 1]]\`.
  `,
  [
    problem(
      "permutations",
      "Permutations",
      "Backtracking",
      "medium",
      "permutations",
      `
Return every ordering of \`nums\`. \`nums\` contains distinct numbers.

Use the input order: try indexes from left to right. Include one empty ordering when \`nums\` is empty.
      `,
      `export function permutations(nums: number[]): number[][] {
  return [];
}
`,
      [
        {
          name: "two values",
          args: [[1, 2]],
          expected: [
            [1, 2],
            [2, 1],
          ],
          public: true,
        },
        { name: "one value", args: [[4]], expected: [[4]], public: true },
        { name: "empty", args: [[]], expected: [[]], public: false },
        {
          name: "three values",
          args: [[1, 2, 3]],
          expected: [
            [1, 2, 3],
            [1, 3, 2],
            [2, 1, 3],
            [2, 3, 1],
            [3, 1, 2],
            [3, 2, 1],
          ],
          public: false,
        },
      ],
    ),
    problem(
      "ordered-picks",
      "Ordered picks of length k",
      "Backtracking",
      "medium",
      "orderedPicks",
      `
Return every ordering of length \`k\` chosen from \`nums\`, without reusing an index. \`nums\` contains distinct numbers. \`k\` is at least 1 and at most \`nums.length\`.

Use the same left-to-right order as full permutations.
      `,
      `export function orderedPicks(nums: number[], k: number): number[][] {
  return [];
}
`,
      [
        {
          name: "pairs from three",
          args: [[1, 2, 3], 2],
          expected: [
            [1, 2],
            [1, 3],
            [2, 1],
            [2, 3],
            [3, 1],
            [3, 2],
          ],
          public: true,
        },
        {
          name: "length one",
          args: [[4, 5], 1],
          expected: [[4], [5]],
          public: true,
        },
        {
          name: "full length",
          args: [[1, 2], 2],
          expected: [
            [1, 2],
            [2, 1],
          ],
          public: false,
        },
        {
          name: "three singles",
          args: [[8, 9, 7], 1],
          expected: [[8], [9], [7]],
          public: false,
        },
      ],
    ),
  ],
);

const fillingTable = lesson(
  "filling-a-table",
  "From the base case upward",
  "Tabulation fills a table from the small answers toward the one you were asked for.",
  25,
  stepBitesize.fillingTable,
  `
Climbing stairs had two repairs: memoisation, which caches a recursive call, and a loop that fills answers from the base case up. That loop is tabulation.

Fibonacci is the same recurrence with different base cases. \`fib(0) = 0\`, \`fib(1) = 1\`, and each later value is the sum of the two before it. Keep two numbers, not an array, if you want O(1) extra memory.

House robber is the next recurrence. At each house you either skip it and keep the previous answer, or take it and add it to the answer from two houses ago. Adjacent houses are never both taken.

Write the base case first. Then one loop. The table is mechanical once the recurrence is true.

You do not need a two-dimensional grid yet. If you can say what \`dp[i]\` means in a sentence, the assignment writes itself.
  `,
  [
    problem(
      "fib-loop",
      "Fibonacci from the bottom",
      "Dynamic programming",
      "easy",
      "fibLoop",
      `
Return the \`n\`th Fibonacci number using a loop. \`fibLoop(0)\` is 0 and \`fibLoop(1)\` is 1.

Each later value is the sum of the two before it. Fill from the base case upward.
      `,
      `export function fibLoop(n: number): number {
  return 0;
}
`,
      [
        { name: "zero", args: [0], expected: 0, public: true },
        { name: "one", args: [1], expected: 1, public: true },
        { name: "two", args: [2], expected: 1, public: false },
        { name: "six", args: [6], expected: 8, public: false },
      ],
    ),
    problem(
      "house-robber",
      "Houses in a line",
      "Dynamic programming",
      "medium",
      "rob",
      `
\`nums[i]\` is the non-negative value of house \`i\`. You cannot take two adjacent houses. Return the maximum you can take.

An empty street returns 0. One house returns that house.
      `,
      `export function rob(nums: number[]): number {
  return 0;
}
`,
      [
        { name: "alternate", args: [[1, 2, 3, 1]], expected: 4, public: true },
        {
          name: "the longer street",
          args: [[2, 7, 9, 3, 1]],
          expected: 12,
          public: true,
        },
        { name: "empty", args: [[]], expected: 0, public: false },
        { name: "one house", args: [[5]], expected: 5, public: false },
      ],
    ),
  ],
);

const sharedPrefixes = lesson(
  "shared-prefixes",
  "Words that share a path",
  "A trie stores a shared prefix once, then branches where the spellings split.",
  25,
  stepBitesize.sharedPrefixes,
  `
\`cat\` and \`car\` share the path \`c\`, then \`a\`, then they split. The trie does not store that shared prefix twice.

Each node needs children and a count of how many words pass through it. Insert walks the characters, creates a missing child, and adds one to the count on the way.

- The longest common prefix is the path from the root where every word still passes through. Stop at the first node whose count is not the number of words.
- A prefix count for a query is the count on the node where the query ends. If a character is missing, the count is 0.

An empty word list has an empty common prefix. An empty query matches every inserted word, so its count is the number of words.

Build a trie. Do not use \`Set\` or \`Map\`. A hash set of whole words cannot tell you that \`ca\` is shared.
  `,
  [
    problem(
      "common-prefix",
      "Longest common prefix",
      "Tries",
      "medium",
      "longestCommonPrefix",
      `
Return the longest prefix shared by every string in \`words\`.

If \`words\` is empty, or the strings share nothing, return \`""\`. A trie walk from the root is enough.
      `,
      `export function longestCommonPrefix(words: string[]): string {
  return "";
}
`,
      [
        {
          name: "flower and flight",
          args: [["flower", "flow", "flight"]],
          expected: "fl",
          public: true,
        },
        {
          name: "nothing shared",
          args: [["dog", "racecar", "car"]],
          expected: "",
          public: true,
        },
        { name: "empty", args: [[]], expected: "", public: false },
        { name: "one word", args: [["a"]], expected: "a", public: false },
      ],
    ),
    problem(
      "prefix-counts",
      "How many words share a prefix?",
      "Tries",
      "medium",
      "prefixCounts",
      `
Insert \`words\` into a trie. For each query, return how many inserted words have that query as a prefix.

\`prefixCounts(["cat", "car", "carpet"], ["ca", "car", "dog"])\` is \`[3, 2, 0]\`. An empty query counts every inserted word. A \`Map\` for child edges is a valid trie representation.
      `,
      `export function prefixCounts(words: string[], queries: string[]): number[] {
  return [];
}
`,
      [
        {
          name: "shared and missing",
          args: [
            ["cat", "car", "carpet"],
            ["ca", "car", "dog"],
          ],
          expected: [3, 2, 0],
          public: true,
        },
        {
          name: "empty query",
          args: [["cat", "car"], [""]],
          expected: [2],
          public: true,
        },
        { name: "no words", args: [[], ["a"]], expected: [0], public: false },
        {
          name: "exact word",
          args: [["carpet"], ["car", "carpet"]],
          expected: [1, 1],
          public: false,
        },
      ],
    ),
  ],
);

export const followUps: Record<string, SeedLesson> = {
  complexity: pairCost,
  arrays: arrayShifts,
  "hash-maps": frequencyCounts,
  "two-pointers": inwardScan,
  "sliding-window": variableWindow,
  "linked-lists": listWalks,
  stacks: stackMemory,
  queues: queueLines,
  recursion: twoCalls,
  "binary-search": searchBounds,
  sorting: sortChoices,
  trees: treeCounts,
  "binary-search-trees": bstShape,
  heaps: heapLayout,
  graphs: visitedWalks,
  greedy: greedyChecks,
  backtracking: orderMatters,
  "dynamic-programming": fillingTable,
  tries: sharedPrefixes,
};

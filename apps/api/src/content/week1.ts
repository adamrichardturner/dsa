import type { SeedModule } from "./types.js";
import { bitesize } from "./bitesize.js";
import { reading } from "./reading.js";

export const week1: SeedModule = {
  id: "foundations",
  title: "Foundations",
  summary:
    "Cost, arrays, hash maps, and the two scanning patterns you will reuse all month.",
  weekNumber: 1,
  lessons: [
    {
      id: "complexity",
      slug: "complexity",
      title: "The cost of a loop",
      summary:
        "Big O is a way to talk about how work grows, before you memorise data structures.",
      estimatedMinutes: 30,
      bitesizeMd: bitesize.complexity,
      contentMd: reading.complexity,
      problems: [
        {
          id: "count-below",
          title: "Count values below a limit",
          topic: "Complexity",
          difficulty: "easy",
          functionName: "countBelow",
          disallow: [".filter(", ".reduce("],
          immutableArgs: [0],
          promptMd: `
Implement \`countBelow(nums, limit)\`.

**Input**
- \`nums\` is an array of numbers. It may be empty and may contain negative values, duplicates, or values equal to \`limit\`.
- \`limit\` is the exclusive upper bound.

**Output**
- Return the number of elements whose value is strictly less than \`limit\`.
- Values equal to \`limit\` do not count.

**Requirements**
- Inspect each element exactly once with one explicit loop.
- Keep a running count and return it after the scan.
- Do not mutate \`nums\`.

**Complexity**
- Time: O(n), where n is \`nums.length\`.
- Extra space: O(1).

**Do not use**
- Nested loops.
- \`filter\` or \`reduce\`; this exercise is about seeing the cost of the traversal directly.
          `.trim(),
          starterCode: `export function countBelow(nums: number[], limit: number): number {
  return 0;
}
`,
          tests: [
            {
              name: "mixed values",
              args: [[1, 4, 2, 8], 4],
              expected: 2,
              public: true,
            },
            {
              name: "none qualify",
              args: [[5, 6], 3],
              expected: 0,
              public: true,
            },
            {
              name: "empty",
              args: [[], 10],
              expected: 0,
              public: false,
            },
            {
              name: "all qualify",
              args: [[-2, 0, 1], 2],
              expected: 3,
              public: false,
            },
            {
              name: "values equal to the limit do not count",
              args: [[4, 4, 3, 5, 4], 4],
              expected: 1,
              public: false,
            },
            {
              name: "negative limit with duplicates",
              args: [[-5, -2, -5, 0, -1], -2],
              expected: 2,
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "arrays",
      slug: "arrays",
      title: "Arrays",
      summary: "Index reads are cheap. Shifting elements is not.",
      estimatedMinutes: 35,
      bitesizeMd: bitesize.arrays,
      contentMd: reading.arrays,
      problems: [
        {
          id: "rotate-left",
          title: "Rotate left",
          topic: "Arrays",
          difficulty: "easy",
          functionName: "rotateLeft",
          disallow: [".shift("],
          immutableArgs: [0],
          distinctArrayReturnFromArg: 0,
          promptMd: `
Implement \`rotateLeft(nums, steps)\`.

**Input**
- \`nums\` is an array of numbers and may be empty.
- \`steps\` is a non-negative integer. It may be zero, equal to \`nums.length\`, or larger than \`nums.length\`.

**Output**
- Return a new array containing the same values rotated left by \`steps\` positions.
- A left rotation moves values from the front to the back while preserving their order.
- Example: \`rotateLeft([1, 2, 3, 4], 1)\` returns \`[2, 3, 4, 1]\`.

**Requirements and edge cases**
- Do not mutate \`nums\`.
- Return \`[]\` for an empty input.
- A zero-step rotation and a rotation by a multiple of the length preserve the value order, but must still return a new array.
- Reduce large step counts to the equivalent offset within the array.

**Complexity**
- Time: O(n), where n is \`nums.length\`.
- Extra space: O(n) for the returned array.

**Do not use**
- Repeated \`shift\` operations. Removing from the front repeatedly moves the remaining elements and can make the solution O(n²).
          `.trim(),
          starterCode: `export function rotateLeft(nums: number[], steps: number): number[] {
  return [];
}
`,
          tests: [
            {
              name: "one step",
              args: [[1, 2, 3, 4], 1],
              expected: [2, 3, 4, 1],
              public: true,
            },
            {
              name: "wrap around the length",
              args: [[1, 2, 3], 4],
              expected: [2, 3, 1],
              public: true,
            },
            {
              name: "zero steps",
              args: [[8, 9], 0],
              expected: [8, 9],
              public: false,
            },
            {
              name: "empty",
              args: [[], 3],
              expected: [],
              public: false,
            },
            {
              name: "exactly one full rotation",
              args: [[4, 5, 6], 3],
              expected: [4, 5, 6],
              public: false,
            },
            {
              name: "several full rotations",
              args: [[1, 2, 3, 4, 5], 12],
              expected: [3, 4, 5, 1, 2],
              public: false,
            },
            {
              name: "single value with large steps",
              args: [[7], 1_000],
              expected: [7],
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "hash-maps",
      slug: "hash-maps",
      title: "Hash maps",
      summary: "Spend a little memory so the next lookup does not scan.",
      estimatedMinutes: 40,
      bitesizeMd: bitesize.hashMaps,
      contentMd: reading["hash-maps"],
      problems: [
        {
          id: "two-sum",
          title: "Two sum",
          topic: "Hash maps",
          difficulty: "easy",
          functionName: "twoSum",
          disallow: [
            ".includes(",
            ".indexOf(",
            ".lastIndexOf(",
            ".findIndex(",
            ".sort(",
            ".toSorted(",
          ],
          promptMd: `
Implement \`twoSum(nums, target)\`.

**Input**
- \`nums\` contains at least two numbers and may contain negatives, zeroes, and duplicate values.
- Exactly one pair of different indices has values that add up to \`target\`.

**Output**
- Return the two indices as \`[smallerIndex, largerIndex]\`.
- Return indices, not the values stored at those indices.

**Requirements**
- Scan from left to right.
- Use a hash map (a \`Map\` or plain object) to remember each previously seen value and its index.
- For each value, check whether its complement, \`target - value\`, was seen before storing the current value. This prevents reusing the same index.

**Complexity**
- Expected time: O(n), where n is \`nums.length\`.
- Extra space: O(n).

**Do not use**
- Nested loops or repeated linear searches with \`includes\`, \`indexOf\`, \`lastIndexOf\`, or \`findIndex\`.
- Sorting, because the answer must use indices from the original array and sorting is not the hash-map technique taught here.
          `.trim(),
          starterCode: `export function twoSum(nums: number[], target: number): number[] {
  return [];
}
`,
          tests: [
            {
              name: "classic",
              args: [[2, 7, 11, 15], 9],
              expected: [0, 1],
              public: true,
            },
            {
              name: "later pair",
              args: [[3, 2, 4], 6],
              expected: [1, 2],
              public: true,
            },
            {
              name: "duplicates",
              args: [[3, 3], 6],
              expected: [0, 1],
              public: false,
            },
            {
              name: "negatives",
              args: [[-1, 4, 2], 1],
              expected: [0, 2],
              public: false,
            },
            {
              name: "cannot reuse one matching value",
              args: [[3, 4, 2], 6],
              expected: [1, 2],
              public: false,
            },
            {
              name: "zero pair at different indices",
              args: [[0, 5, -2, 0], 0],
              expected: [0, 3],
              public: false,
            },
            {
              name: "pair spans the array",
              args: [[8, -3, 6, 4, 11], 19],
              expected: [0, 4],
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "two-pointers",
      slug: "two-pointers",
      title: "Two pointers",
      summary:
        "When the data is ordered, the two ends know something the middle does not.",
      estimatedMinutes: 35,
      bitesizeMd: bitesize.twoPointers,
      contentMd: reading["two-pointers"],
      problems: [
        {
          id: "sorted-squares",
          title: "Squares of a sorted array",
          topic: "Two pointers",
          difficulty: "easy",
          functionName: "sortedSquares",
          disallow: [".sort(", ".toSorted("],
          immutableArgs: [0],
          distinctArrayReturnFromArg: 0,
          promptMd: `
Implement \`sortedSquares(nums)\`.

**Input**
- \`nums\` is sorted in non-decreasing order.
- It may be empty and may contain negative values, zeroes, duplicates, or only positive values.

**Output**
- Return a new array containing the square of every input value in non-decreasing order.
- Do not mutate \`nums\`.

**Requirements**
- Use two pointers: one at each end of \`nums\`.
- Compare the two candidate squares, place the larger one at the unfilled end of the result, and move only the pointer that supplied it.
- Process every input value exactly once.

**Complexity**
- Time: O(n), where n is \`nums.length\`.
- Extra space: O(n) for the returned array.

**Do not use**
- \`sort\` or \`toSorted\`.
- A nested-loop sorting algorithm. Squaring first and sorting afterwards misses the linear-time two-pointer goal.
          `.trim(),
          starterCode: `export function sortedSquares(nums: number[]): number[] {
  return [];
}
`,
          tests: [
            {
              name: "negatives and positives",
              args: [[-4, -1, 0, 3, 10]],
              expected: [0, 1, 9, 16, 100],
              public: true,
            },
            {
              name: "all negative",
              args: [[-7, -3, -1]],
              expected: [1, 9, 49],
              public: true,
            },
            {
              name: "single",
              args: [[-2]],
              expected: [4],
              public: false,
            },
            {
              name: "already positive",
              args: [[1, 2, 3]],
              expected: [1, 4, 9],
              public: false,
            },
            {
              name: "empty",
              args: [[]],
              expected: [],
              public: false,
            },
            {
              name: "equal magnitudes and duplicates",
              args: [[-3, -2, -2, 0, 2, 3]],
              expected: [0, 4, 4, 4, 9, 9],
              public: false,
            },
            {
              name: "zeroes",
              args: [[0, 0, 0]],
              expected: [0, 0, 0],
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "sliding-window",
      slug: "sliding-window",
      title: "Sliding window",
      summary: "Reuse the work you did on the previous slice.",
      estimatedMinutes: 35,
      bitesizeMd: bitesize.slidingWindow,
      contentMd: reading["sliding-window"],
      problems: [
        {
          id: "max-window-sum",
          title: "Maximum window sum",
          topic: "Sliding window",
          difficulty: "easy",
          functionName: "maxWindowSum",
          disallow: [".slice(", ".reduce("],
          immutableArgs: [0],
          promptMd: `
Implement \`maxWindowSum(nums, k)\`.

**Input**
- \`nums\` is an array of numbers and may include negative values.
- \`k\` is the required window length.

**Output**
- Return the greatest sum among all contiguous windows of exactly \`k\` elements.
- Return \`0\` when \`k < 1\`, \`k > nums.length\`, or \`nums\` is empty.

**Requirements**
- Sum the first valid window once.
- Slide the window one index at a time by subtracting the value that leaves and adding the value that enters.
- Initialise the best sum from the first window, not from zero; every valid window may have a negative sum.
- Do not mutate \`nums\`.

**Complexity**
- Time: O(n), where n is \`nums.length\`.
- Extra space: O(1).

**Do not use**
- Nested loops.
- \`slice\` or \`reduce\` to rebuild and re-sum each window. That repeats work and can make the solution O(n × k).
          `.trim(),
          starterCode: `export function maxWindowSum(nums: number[], k: number): number {
  return 0;
}
`,
          tests: [
            {
              name: "the lesson example",
              args: [[2, 1, 5, 1, 3, 2], 3],
              expected: 9,
              public: true,
            },
            {
              name: "window too wide",
              args: [[4, 2], 3],
              expected: 0,
              public: true,
            },
            {
              name: "whole array",
              args: [[1, 2, 3], 3],
              expected: 6,
              public: false,
            },
            {
              name: "negatives",
              args: [[-1, 4, -2, 5], 2],
              expected: 3,
              public: false,
            },
            {
              name: "all windows are negative",
              args: [[-8, -3, -6, -2, -5], 2],
              expected: -7,
              public: false,
            },
            {
              name: "single-element windows",
              args: [[-4, 7, 2, 7], 1],
              expected: 7,
              public: false,
            },
            {
              name: "zero-length window is invalid",
              args: [[1, 2, 3], 0],
              expected: 0,
              public: false,
            },
            {
              name: "negative window length is invalid",
              args: [[1, 2, 3], -2],
              expected: 0,
              public: false,
            },
            {
              name: "empty input",
              args: [[], 1],
              expected: 0,
              public: false,
            },
          ],
        },
      ],
    },
  ],
};

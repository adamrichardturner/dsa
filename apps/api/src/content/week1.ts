import type { SeedModule } from "./types.js";
import { bitesize } from "./bitesize.js";

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
      contentMd: `
A data structure is a way of arranging values so the operations you care about stay cheap. Before the structures, you need a shared way to say *cheap*.

**Big O** describes how the number of steps grows as the input grows. It ignores constant factors and the speed of your laptop. An O(n) function that scans a list once will do about twice the work for twice the input. An O(n²) function, often a loop inside a loop, grows much faster.

Three costs cover almost everything in this course:

| Cost | Rough meaning | Example |
| --- | --- | --- |
| O(1) | Does not grow with the input | Read \`nums[0]\` |
| O(n) | One pass over the input | Sum an array |
| O(n²) | A pass for every element | Compare every pair |

You do not need a formal proof. When you write a solution, name the loops. One loop over the input is linear. A loop that, for each index, scans the rest of the array is quadratic. Nested loops multiply.

Memory has a cost too. A hash map uses extra space so later lookups can be fast. That trade, space for time, shows up in week one and again in dynamic programming.

The exercise is deliberately small. Count values strictly below a limit in one pass. Then look at your function and say its cost out loud.
      `.trim(),
      problems: [
        {
          id: "count-below",
          title: "Count values below a limit",
          topic: "Complexity",
          difficulty: "easy",
          functionName: "countBelow",
          disallow: [],
          promptMd: `
Write \`countBelow\`. Return how many numbers in \`nums\` are strictly less than \`limit\`.

Use a single pass. A nested loop also produces the right number, and it is the habit this lesson is trying to retire.
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
      contentMd: `
A TypeScript array is a contiguous list. \`nums[i]\` is O(1) because the runtime can jump straight to that slot. \`nums.push(value)\` is cheap on average: it writes at the end. Inserting or deleting in the middle is O(n), because every later element has to move.

That single fact explains a lot of later choices. If you need fast inserts in the middle, an array is the wrong tool and a linked list might be the right one. If you need fast index access, stay with the array.

**Rotation** is a good way to feel the movement. Rotating left by \`steps\` moves the front of the array to the back.

\`[1, 2, 3, 4]\` rotated left by 1 is \`[2, 3, 4, 1]\`.

\`steps\` can be larger than the length. Rotating by \`length\` puts every element back where it started, so only \`steps % nums.length\` matters. An empty array stays empty.

You can allocate a new array and place each value at its new index, which is a clear O(n) solution. In-place reversal tricks exist; you do not need them yet.
      `.trim(),
      problems: [
        {
          id: "rotate-left",
          title: "Rotate left",
          topic: "Arrays",
          difficulty: "easy",
          functionName: "rotateLeft",
          disallow: [],
          promptMd: `
Return a new array with \`nums\` rotated left by \`steps\` positions.

\`rotateLeft([1, 2, 3, 4], 1)\` is \`[2, 3, 4, 1]\`. \`steps\` may be larger than the array. Do not mutate the input array.
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
      contentMd: `
A hash map (a plain object or a \`Map\`) associates a key with a value. On average, set and get are O(1). The occasional collision means it is not a promise about every single call, and that is good enough for almost every exercise here.

The pattern is: **remember what you have already seen**.

Two Sum is the classic. You are given numbers and a target, and you need the indices of two values that add up to the target. A nested loop checks every pair in O(n²). A map checks, for each number \`n\`, whether you have already seen \`target - n\`.

Walk \`[2, 7, 11, 15]\` looking for target \`9\`:

1. 2 has not been seen. Store \`2 → index 0\`. The complement 7 is missing.
2. 7's complement is 2, which is in the map at index 0. Return \`[0, 1]\`.

Store the index, not just the value. The answer is positions.

In TypeScript, a \`Map<number, number>\` keeps the key as a number. An object would turn it into a string, which still works for this problem and is easier to get wrong. Prefer \`Map\` when the key is not already a string.

This is the space-for-time trade from the first lesson: O(n) extra memory, O(n) time.
      `.trim(),
      problems: [
        {
          id: "two-sum",
          title: "Two sum",
          topic: "Hash maps",
          difficulty: "easy",
          functionName: "twoSum",
          disallow: [],
          promptMd: `
Return the indices of the two values in \`nums\` that add up to \`target\`.

There is exactly one solution, and you may not use the same element twice. Return the indices in ascending order.
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
      contentMd: `
Two pointers means two indices moving through the same array according to a rule. You use it when the array is sorted, or when you are comparing the ends.

Sorted squares is a clean example. \`[-4, -1, 0, 3, 10]\` is sorted, but the squares \`[16, 1, 0, 9, 100]\` are not, because a large negative becomes a large positive. The biggest squares sit at the **ends**, not in the middle.

Put a pointer on the left and one on the right. Square both. Write the larger square into the back of a result array, and move the pointer that produced it inward. Repeat until the pointers meet.

Each step does O(1) work and the pointers together cross the array once, so the whole algorithm is O(n). Sorting the squares afterwards would be O(n log n). The sorted input is what makes the linear solution possible. If the input were unsorted, you would not have this trick.

You will see the same shape again: a left index, a right index, and a reason to move exactly one of them.
      `.trim(),
      problems: [
        {
          id: "sorted-squares",
          title: "Squares of a sorted array",
          topic: "Two pointers",
          difficulty: "easy",
          functionName: "sortedSquares",
          disallow: [],
          promptMd: `
\`nums\` is sorted in non-decreasing order and may contain negatives. Return a new array of the squares, sorted in non-decreasing order.

Try the two-pointer approach from the lesson rather than squaring and sorting.
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
      contentMd: `
A sliding window is a subarray you maintain as you walk forward. The fixed-size version is the one to learn first.

Suppose you want the maximum sum of any \`k\` consecutive elements. Re-summing each block from scratch repeats almost the same additions. Once you know the sum of a window, the next window is:

\`next = current - element that left + element that entered\`

That update is O(1), and you do it once per element, so the scan is O(n). The first window is the only one you sum from scratch.

Example: \`nums = [2, 1, 5, 1, 3, 2]\`, \`k = 3\`.

- \`2 + 1 + 5 = 8\`
- drop 2, add 1 → 7
- drop 1, add 3 → 9
- drop 5, add 2 → 6

The maximum is 9.

There is a second kind of window, the variable one, used for problems like "shortest subarray with sum at least target". One pointer grows the window, the other shrinks it. Same idea, slightly more bookkeeping. This week's exercise stays with a fixed size so the update rule is obvious.

If \`k\` is larger than the array, there is no valid window. Return 0 in that case.
      `.trim(),
      problems: [
        {
          id: "max-window-sum",
          title: "Maximum window sum",
          topic: "Sliding window",
          difficulty: "easy",
          functionName: "maxWindowSum",
          disallow: [],
          promptMd: `
Return the maximum sum of any contiguous block of exactly \`k\` elements.

If \`k\` is less than 1 or greater than \`nums.length\`, return 0. An empty array returns 0.
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
          ],
        },
      ],
    },
  ],
};

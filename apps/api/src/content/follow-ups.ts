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
    case "count-components": {
      return { immutableArgs: [0] };
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
## Prerequisite and connection

A single array scan visits \`n\` positions and costs O(n). These exercises ask about **pairs of indexes**.

This **pair enumeration** uses one loop to choose \`i\` and another to choose a later \`j\`.

## Intuition

For each left index, inspect every index to its right. Starting \`j\` at \`i + 1\` enforces \`i < j\`: an element is never paired with itself, and the same pair is never counted in both orders.

## Invariant or recurrence

Before the outer loop advances past \`i\`, every requested pair whose left index is at most \`i\` has been counted exactly once. The inner loop checks only \`j > i\`.

## Worked reasoning

For \`[1, 3, 2]\`, the legal index pairs are \`(0, 1)\`, \`(0, 2)\`, and \`(1, 2)\`. The first two are ascending because \`1 < 3\` and \`1 < 2\`; the last is not because \`3 < 2\` is false. The answer is 2.

The number of comparisons is

\`(n - 1) + (n - 2) + ... + 1 = n(n - 1) / 2\`.

That exact pair count grows quadratically, so the algorithm is Θ(n²), not merely “two loops therefore slow.”

## Complexity

Both exercises take Θ(n²) time and O(1) auxiliary space. For 1,000 values, there are 499,500 index pairs.

## TypeScript-specific edge cases

Use strict comparisons: \`<\` for ascending pairs and \`===\` for equal pairs. Empty and one-element arrays perform no inner-loop iterations and naturally return 0. Do not sort: sorting would change index relationships and mutate the input unless copied.

## Exercise connection

\`countAscendingPairs\` changes the counter only when the left value is strictly smaller. \`countEqualPairs\` uses the identical traversal but counts strict equality.

## Recap

Generate each \`i < j\` pair once, test the required relationship, and recognize the triangular sum as Θ(n²).
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
## Prerequisite and connection

Array indexing is O(1) because elements occupy contiguous positions. Editing the middle is different: later elements must move.

These exercises also require a new array so the input remains immutable.

## Intuition

Removing index \`k\` copies everything except \`nums[k]\`; values after it shift left. Inserting at \`k\` copies the prefix, writes the new value, then copies the suffix; the suffix shifts right.

~~~mermaid
flowchart LR
  A["prefix: indexes < k"] --> B["insert value / skip removed value"]
  B --> C["suffix: indexes > or >= k"]
~~~

## Invariant or recurrence

While building the result, it always contains exactly the correctly transformed prefix of the input. No input element is modified. For insertion, normalize the destination to \`min(max(index, 0), nums.length)\` before copying.

## Worked reasoning

Removing index 1 from \`[1, 2, 3, 4]\` copies \`1\`, skips \`2\`, then copies \`3, 4\`, producing \`[1, 3, 4]\`. Inserting \`3\` at index 2 in \`[1, 2, 4]\` copies \`1, 2\`, writes \`3\`, and then copies \`4\`.

Out-of-range behaviour differs deliberately. \`removeAt\` returns a copy for every \`index < 0\` or \`index >= nums.length\`. \`insertAt\` clamps negative indexes to the front and indexes beyond the end to the end.

## Complexity

Both operations take O(n) time. Their returned arrays use O(n) space; insertion returns \`n + 1\` values and a valid removal returns \`n - 1\`.

## TypeScript-specific edge cases

JavaScript array methods can interpret negative indexes in surprising ways, so implement the stated bounds rather than borrowing \`splice\` semantics. Return \`[...nums]\` or another genuine copy when removal is invalid. Avoid assigning into \`nums\`.

## Exercise connection

\`removeAt\` practices skipping one valid position and preserving all invalid-index inputs. \`insertAt\` practices a clamped position and a one-time insertion before the suffix.

## Recap

Random access is constant time, but immutable middle edits copy and shift a linear number of values. Treat negative and past-the-end indexes according to each exercise's contract.
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
## Prerequisite and connection

Two Sum used a hash table to remember whether a complement had appeared. A **frequency count** stores richer information: how many times each value appears.

## Intuition

Use each number as a key and its occurrence count as the value. One pass can answer a single target count. A complete frequency table supports “which value occurs most?” without repeatedly rescanning the array.

## Invariant or recurrence

After processing positions \`0\` through \`i\`, the table contains the exact count of every value in that prefix. For the most-frequent value, the current winner must have the greatest completed count seen so far; ties go to the smaller first index.

## Worked reasoning

For \`[1, 2, 2, 1]\`, both values finish with count 2. Their first indexes are 0 and 1, so \`1\` wins. Updating a winner only when a count becomes strictly greater is not always enough during a one-pass count: a later value can temporarily lead before an earlier value catches up. A reliable approach is to build counts, then scan the original array left to right and replace the winner only for a strictly larger final count.

## Complexity

A hash-based solution takes expected O(n) time and O(u) space, where \`u\` is the number of distinct values. Counting one target directly can use O(1) space.

## TypeScript-specific edge cases

When using an object as a numeric-key table, keys are strings at runtime. Read missing counts with nullish coalescing, such as \`counts[key] ?? 0\`. The most-frequent exercise guarantees a non-empty input; \`frequencyOf\` must return 0 for an empty input.

## Exercise connection

\`frequencyOf\` counts one requested value. \`mostFrequent\` builds all final counts and applies the earliest-appearance tie-break exactly.

## Recap

Frequency counting exchanges O(u) memory for an expected linear-time answer. Keep the tie rule separate from the counting rule.
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
## Prerequisite and connection

Sorted squares used **inward pointers** at opposite ends. The same inward-scan shape solves palindromes and pair sums, but only the pair-sum movement relies on sorted order.

## Intuition

Place \`left\` at 0 and \`right\` at \`nums.length - 1\`. A palindrome compares mirrored values and moves both pointers. A sorted pair sum compares \`nums[left] + nums[right]\` with the target and moves exactly the side that cannot participate in a solution at the current boundary.

## Invariant or recurrence

For a palindrome, every position outside \`[left, right]\` has already been matched with its mirror. For pair sum, if a solution remains, one exists inside the inclusive range \`[left, right]\`. Because the array is sorted ascending, a sum that is too small rules out the current left value; a sum that is too large rules out the current right value.

## Worked reasoning

With \`[-2, 0, 3]\` and target 1, the end values sum to 1, so return \`[0, 2]\`. With \`[1, 2, 4, 6]\` and target 6, the end sum is 7, so move \`right\`; then \`1 + 4\` is too small, so move \`left\`; \`2 + 4\` succeeds.

That elimination is invalid on an unsorted array: “too small” would not prove that all later partners for the left value are also unsuitable.

## Complexity

Each pointer moves inward at most \`n\` times, so both exercises take O(n) time and O(1) auxiliary space.

## TypeScript-specific edge cases

Use \`left < right\` for pair sum to require two different indexes. Empty and one-element arrays are palindromes. Equal values are handled normally, and the specified movement order determines which valid pair is returned when several exist.

## Exercise connection

\`isPalindrome\` moves both pointers only after equality. \`pairIndices\` requires a sorted ascending input and moves only one pointer after a nonmatching sum.

## Recap

State what lets a pointer move safely. Mirrored equality supports palindrome scanning; sorted order supports pair-sum elimination.
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
## Prerequisite and connection

A fixed **sliding window** keeps exactly \`k\` elements. A **variable window** still represents one contiguous slice, but its left edge advances whenever the current sum can be improved or must be repaired.

## Intuition

Expand by adding \`nums[right]\`. For the shortest sum of at least a target, shrink while the sum is large enough and record every qualifying length. For the longest sum at most a target, shrink while the sum is too large, then record the valid length.

## Invariant or recurrence

\`sum\` always equals the values in the inclusive window \`[left, right]\`. All values are non-negative, so expanding cannot decrease the sum and removing from the left cannot increase it. This monotonicity is the reason discarded left positions never need to return.

## Worked reasoning

For \`[2, 3, 1, 2, 4, 3]\` with target 7, the window first reaches 8 at \`[2, 3, 1, 2]\`. Shrinking produces a qualifying length 3 at \`[3, 1, 2]\`, then expansion eventually reaches \`[4, 3]\`, giving the optimal length 2.

Negative numbers would break this reasoning: removing a negative value could increase the sum, so the simple window would no longer eliminate choices safely.

## Complexity

\`right\` advances \`n\` times and \`left\` advances at most \`n\` times. Both exercises therefore take O(n) time and O(1) auxiliary space.

## TypeScript-specific edge cases

For the shortest exercise, initialise the best length to a sentinel such as \`Infinity\`, then return 0 if it never changes. For the longest exercise, a valid empty window contributes length 0. Zeros may cause several shrink operations without changing the sum, so pointer movement—not sum change—guarantees termination.

## Exercise connection

\`shortestAtLeast\` records before each valid shrink. \`longestAtMost\` repairs invalid windows first and records after the window is valid.

## Recap

Maintain the exact window sum, use non-negativity to justify forward-only pointers, and place the answer update on the correct side of the shrink loop.
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
## Prerequisite and connection

A linked list exposes \`value\` and \`next\`, not random-access indexes. Reversal used several node references to preserve links.

These exercises use **slow and fast pointers** to measure position without first computing the length.

## Intuition

For the middle, let \`slow\` move one node while \`fast\` moves two. For nth-from-end, give \`fast\` a lead of exactly \`n\` nodes, then move both one node at a time.

~~~mermaid
flowchart LR
  A["slow"] --> B["next"]
  B --> C["next"]
  A -. "fast moves two" .-> C
~~~

## Invariant or recurrence

In the slow/fast walk, after \`t\` rounds, slow has moved \`t\` edges and fast has moved \`2t\`. When fast reaches the end, slow is at the middle; the loop condition must produce the second middle for even lengths.

In the nth-from-end walk, once the lead is established, fast always remains exactly \`n\` nodes ahead of slow. When fast becomes \`null\`, slow is the 1-based nth node from the end.

## Worked reasoning

For \`1 → 2 → 3 → 4\`, slow visits 1, 2, 3 while fast visits 1, 3, then the end, so the second middle is 3. For \`n = 2\` on \`1 → 2 → 3 → 4 → 5\`, advance fast to 3, then move both until fast falls off; slow stops at 4.

## Complexity

Both algorithms take O(n) time and O(1) auxiliary space after the starter builds the list. No second full pass is required.

## TypeScript-specific edge cases

Node references may be \`null\`, so guard before reading \`.next\`. Return \`-1\` for an empty middle walk, and for nth-from-end when \`n < 1\` or fast encounters \`null\` during its initial \`n\`-step lead.

## Exercise connection

\`middleValue\` tests the 1×/2× speed relationship and the second-middle convention. \`nthFromEnd\` tests an exact fixed gap, including \`n\` equal to the list length.

## Recap

Slow/fast pointers measure a fraction of a list; equally paced pointers with a head start preserve a distance from the end.
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
## Prerequisite and connection

Balanced brackets used last-in, first-out memory: the newest unresolved opener is resolved first. Backspaces and next-greater values have the same “most recent unresolved item” structure.

## Intuition

A character stack models the text that survives so far: letters push and \`#\` pops when possible. For next greater, store indexes whose answers are unresolved. A new value resolves every index on top whose value is strictly smaller.

## Invariant or recurrence

After processing index \`i\`, the backspace stack spells the processed text's final form. In next greater, unresolved indexes on the stack have not seen a greater value to their right, and their values are monotonically non-increasing from bottom to top.

## Worked reasoning

For \`[2, 1, 2, 4, 3]\`, the second \`2\` resolves the waiting \`1\`, so its output is the **value** 2. The \`4\` then resolves both waiting 2s, so their outputs are the **value** 4. Index 3 and index 4 never find larger values and remain \`-1\`. The exercise returns values, not indexes.

## Complexity

Each item is pushed once and popped at most once. **Amortized analysis** therefore keeps the total number of stack operations linear, even though one input value can trigger several pops.

Both exercises take O(n) time and O(n) auxiliary space.

## TypeScript-specific edge cases

Check \`stack.length > 0\` before popping or reading the top. Initialize next-greater results with \`-1\`; equality must not pop because the answer must be strictly greater. Joining a character array avoids repeated immutable string rebuilding.

## Exercise connection

\`applyBackspace\` uses a stack as the surviving output. \`nextGreater\` uses a monotonic stack of indexes so results can be written into the correct positions while storing answer values.

## Recap

Keep only unresolved work. A later item repeatedly resolves the stack top, and amortized analysis keeps the whole pass linear.
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
## Prerequisite and connection

A fixed sliding window processes one entering value and one leaving value at each step.

A queue records arrival order; a deque additionally supports removal from both front and back.

## Intuition

Negative counts need only one running number. Window maxima need a **monotonic deque** of indexes: values decrease from front to back, so the front always indexes the maximum.

~~~mermaid
flowchart LR
  F["front: largest"] --> M["smaller"] --> B["back: smallest"]
  N["new value"] -. "removes smaller back values" .-> B
~~~

## Invariant or recurrence

For negative counts, the counter equals the number of values \`< 0\` in the current window. For maxima, deque indexes are inside the current window, increase from front to back, and their corresponding values are non-increasing. A newer value removes smaller or equal values from the back because they can never become maximum first.

## Worked reasoning

For \`[1, 3, -1]\` with \`k = 3\`, index 1 removes index 0 because 3 is newer and larger; index 2 stays behind index 1. The front is index 1, so the maximum is 3. As the window moves, remove the front only when its index is left of \`right - k + 1\`.

## Complexity

Negative counting takes O(n) time and O(1) auxiliary space beyond the output. Each index enters and leaves the monotonic deque at most once, so window maxima take O(n) time and O(k) deque space.

## TypeScript-specific edge cases

Return \`[]\` when \`k < 1\` or \`k > nums.length\`. Store indexes, not just values, so expired entries can be identified. Avoid repeated \`Array.shift()\` on large inputs because it can be O(n); a front cursor preserves linear time.

## Exercise connection

\`negativeCounts\` updates a scalar as values enter and leave. \`maxInWindow\` maintains a decreasing deque and emits its front after the first complete window.

## Recap

Simple aggregate changes use enter/leave updates. Window extrema need a monotonic deque that discards expired indexes and values that can no longer win.
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
## Prerequisite and connection

Earlier recursive walks made a call for each nested child. Fibonacci highlights a binary recurrence: one call asks for \`n - 1\` and another asks for \`n - 2\`.

Each unfinished call occupies a **call stack** frame until its child calls return.

## Intuition

With this lesson's 1-based indexing, \`fib(1) = 1\` and \`fib(2) = 1\`. Every \`n > 2\` splits into two smaller Fibonacci questions. Nested depth instead follows every child and keeps only the deepest answer.

~~~mermaid
flowchart TD
  F5["fib(5)"] --> F4["fib(4)"]
  F5 --> F3a["fib(3)"]
  F4 --> F3b["fib(3)"]
  F4 --> F2["fib(2)"]
~~~

## Invariant or recurrence

\`fib(n) = fib(n - 1) + fib(n - 2)\` for \`n > 2\`, with the two stated base cases. For depth, a number has depth 0, while an array has \`1 + max(child depths)\`; an empty array has depth 1.

## Worked reasoning

\`fib(5)\` becomes \`fib(4) + fib(3) = 3 + 2 = 5\`. The diagram shows overlapping work: \`fib(3)\` is recomputed. For \`[1, [2, [3]]]\`, the deepest number contributes 0, and its three containing arrays raise the result to 3.

## Complexity

Naive Fibonacci recursion takes exponential time, commonly bounded as O(2ⁿ), and O(n) call-stack space. \`fib\` keeps those repeated calls so the recurrence is visible. \`fibMemo\` stores each completed state and reuses it, which is O(n) time and O(n) cache space for the same one-based bases. The later dynamic-programming lesson fills that recurrence from the bottom instead of from the top. See [memoisation](/articles/memoisation).

Nested depth visits each number and array once, taking O(m) time and O(d) stack space for \`m\` values/arrays and maximum depth \`d\`.

## TypeScript-specific edge cases

Use \`Array.isArray(value)\` to narrow the recursive union. An empty array needs an explicit base result of 1 because there is no child maximum. The Fibonacci exercise guarantees \`n >= 1\`, so no \`fib(0)\` case belongs to this indexing scheme.

## Exercise connection

\`fib\` is specifically practice with two recursive calls and overlapping subproblems. \`nestedDepth\` practices a structural recurrence over a recursive TypeScript type. \`fibMemo\` keeps the same bases and caches each \`n\` before the two recursive calls return, so \`n = 40\` finishes inside the time limit.

## Recap

Write base cases before recursive cases, keep Fibonacci's indexing consistent, and distinguish correctness from the repeated work that dynamic programming will later remove.
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

\`n\` is at least 1. Practice the recurrence by making the two recursive calls \`fib(n - 1)\` and \`fib(n - 2)\`; the later dynamic-programming lesson removes their overlapping work.
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
    problem(
      "fib-memo",
      "Fibonacci with memoisation",
      "Recursion",
      "medium",
      "fibMemo",
      `
Implement \`fibMemo(n)\`.

- **Input:** \`n\` is an integer and at least 1. Use the same one-based Fibonacci indexing as \`fib\`: \`fibMemo(1)\` and \`fibMemo(2)\` are 1, and every later value is the sum of the two before it.
- **Output:** return that Fibonacci number.
- **Edge cases:** the two bases return 1 without a recursive call. \`fibMemo(6)\` is 8, the same value as \`fib(6)\`.
- **Required technique:** keep a cache of completed states. Before making the two recursive calls, return the stored value when this \`n\` has already been solved. Store the completed sum before returning it. An array indexed by \`n\`, or a record keyed by \`String(n)\`, is enough. Check the cache with \`!== undefined\`, because a stored 0 would be a valid answer in other recurrences.
- **Complexity:** O(n) time, O(n) cache space, and O(n) call-stack space. The hidden \`n = 40\` case must finish within 100ms.
- **Do not:** leave the calls uncached, use a closed form such as \`Math.pow\`, or hard-code a table of answers. The later lesson fills this recurrence with a loop; this exercise wants the cache in front of the two calls.

The indexing here is not the zero-based \`fib(0) = 0\` form. [Memoisation](/articles/memoisation) shows that other convention and the same cache idea.
      `,
      `export function fibMemo(n: number): number {
  return 0;
}
`,
      [
        { name: "six", args: [6], expected: 8, public: true },
        { name: "one", args: [1], expected: 1, public: true },
        { name: "two", args: [2], expected: 1, public: false },
        { name: "three", args: [3], expected: 2, public: false },
        { name: "seven", args: [7], expected: 13, public: true },
        { name: "ten", args: [10], expected: 55, public: false },
        {
          name: "forty stays memoised",
          args: [40],
          expected: 102_334_155,
          public: false,
          timeoutMs: 100,
        },
      ],
      ["Math.pow", ".round("],
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
## Prerequisite and connection

Ordinary binary search may return immediately on equality. With duplicates, equality proves that a match exists but not that it is the first or last match.

## Intuition

Search for a **boundary** in a sorted array. A clean half-open interval \`[lo, hi)\` includes \`lo\` and excludes \`hi\`; it is empty exactly when \`lo === hi\`.

## Invariant or recurrence

For first equal, every index below \`lo\` holds a value smaller than the target, every index at or above \`hi\` holds a value at least as large, and \`[lo, hi)\` remains unclassified. If \`nums[mid] < target\`, set \`lo = mid + 1\`; otherwise set \`hi = mid\`. The final \`lo\` is the first position whose value is at least the target.

For last equal, maintain the parallel upper-bound invariant: indexes below \`lo\` hold values at most equal to the target, indexes at or above \`hi\` hold greater values, and \`[lo, hi)\` is unclassified. Move \`lo\` right when \`nums[mid] <= target\`; otherwise move \`hi\` to \`mid\`. The preceding index is the last possible match.

## Worked reasoning

For \`[1, 2, 2, 2, 3]\` and target 2, lower-bound search narrows to index 1. Upper-bound search narrows to index 4, so the last equal index is \`4 - 1 = 3\`. In both searches, assigning \`hi = mid\` is safe because \`hi\` is excluded and the interval strictly shrinks.

## Complexity

Each comparison roughly halves the candidate interval, giving O(log n) time and O(1) auxiliary space.

## TypeScript-specific edge cases

Initialize \`hi\` to \`nums.length\`, not the last index, for a half-open search. Compute \`mid\` with \`lo + Math.floor((hi - lo) / 2)\`. After convergence, validate the candidate before indexing; empty arrays and absent targets return \`-1\`.

## Exercise connection

\`firstEqual\` implements a lower bound and checks equality at that index. \`lastEqual\` implements an upper bound and checks equality at the previous index.

## Recap

Use one interval convention consistently. Half-open invariants turn duplicate search into finding the first not-less-than or first-greater-than boundary.
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
  "Comparing sorting algorithms",
  "Bubble sort is easy to finish by hand. Merge sort is the one to keep.",
  25,
  stepBitesize.sortChoices,
  `
## Prerequisite and connection

Before choosing a sorting algorithm, first recognise what sorted means: every neighbouring pair is in non-decreasing order.

Merge sort showed an efficient divide-and-conquer approach; bubble sort serves a different teaching purpose.

## Intuition

\`isSorted\` stops at the first inversion. Bubble sort repeatedly compares neighbours and swaps an inverted pair. Each pass “bubbles” the largest remaining value to the end of the unsorted region.

## Invariant or recurrence

After one complete bubble pass, the final position of that pass contains the largest value from the scanned region. After \`p\` passes, the last \`p\` positions are in final sorted order. If a pass makes no swaps, the whole array is sorted and the algorithm may stop.

## Worked reasoning

Starting with \`[5, 1, 4, 2]\`, the first pass produces \`[1, 4, 2, 5]\`; 5 is final. The next produces \`[1, 2, 4, 5]\`; a later no-swap pass confirms completion. Bubble sort is useful here because adjacent swaps make loop invariants and in-place mechanics visible—not because it is a good production choice.

## Complexity

\`isSorted\` takes O(n) time and O(1) space. Bubble sort takes O(n²) worst-case time; an early-exit flag gives O(n) best-case time for an already sorted array. Copying the input requires O(n) output space.

## TypeScript-specific edge cases

Copy \`nums\` before swapping so the input is not mutated. Empty and one-element arrays are sorted. JavaScript's default \`.sort()\` compares strings unless given a numeric comparator, but it is disallowed here because it hides the target algorithm.

## Exercise connection

\`isSorted\` detects adjacent inversions. \`bubbleSort\` performs adjacent swaps, shortens the unsorted suffix after each pass, and returns a distinct array.

## Recap

Use bubble sort to understand swaps, passes, and invariants. Prefer O(n log n) algorithms for substantial real-world sorting.
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
  "Tree height was the longer child plus one. A leaf count and a sum walk every node the same way.",
  20,
  stepBitesize.treeCounts,
  `
## Prerequisite and connection

Node-counted tree height combined the answers from left and right subtrees. Leaf counting and node summing use the same postorder shape: solve both children, then combine their results at the current node.

## Intuition

An empty subtree contributes the operation's identity: 0 leaves and sum 0. A leaf is a non-null node with neither child, so it contributes exactly one leaf. Any other node receives its leaf count from its children.

## Invariant or recurrence

\`leafCount(null) = 0\`. For a leaf, \`leafCount(node) = 1\`; otherwise it is \`leafCount(left) + leafCount(right)\`.

\`treeSum(null) = 0\`, and \`treeSum(node) = node.value + treeSum(left) + treeSum(right)\`.

## Worked reasoning

In \`[3, 9, 20, null, null, 15, 7]\`, node 9 is a leaf and nodes 15 and 7 are leaves, so the root combines 1 from its left subtree with 2 from its right subtree. The same tree sum is \`3 + 9 + 20 + 15 + 7 = 54\`.

## Complexity

Each node is visited once: O(n) time. Recursive stack space is O(h), where \`h\` is the tree height; it is O(log n) for a balanced tree and O(n) for a chain.

## TypeScript-specific edge cases

The input uses \`null\` as a missing-node marker, so do not use truthiness to test numeric values: 0 is a valid node value. Narrow the node reference with an explicit null check before reading children.

## Exercise connection

Use the provided \`buildTree\` conversion, then write one recursive helper for \`leafCount\` and one for \`treeSum\`. The level-order array format is input representation, not traversal guidance.

## Recap

Choose the empty-subtree identity, state the node recurrence, and let a depth-first traversal combine each subtree exactly once.
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
  "BST height and insertion order",
  "A binary search tree is only fast when the height stays short.",
  25,
  stepBitesize.bstShape,
  `
## Prerequisite and connection

A binary search tree sends smaller values left and larger values right. Search and insertion follow one root-to-leaf path, so their cost is determined by tree height—not automatically by \`log n\`.

## Intuition

Insertion order determines shape. Sorted input creates a one-sided chain; placing middle values first can create a short, balanced shape.

~~~mermaid
flowchart LR
  A["insert 1,2,3<br/>height 3"] --> B["1 → 2 → 3"]
  C["insert 2,1,3<br/>height 2"] --> D["1 ← 2 → 3"]
~~~

## Invariant or recurrence

At every BST node, all values in the left subtree follow the starter's smaller-value rule and all values in the right follow its larger-value rule. This lesson consistently defines height as a **node count**: \`height(null) = 0\` and \`height(node) = 1 + max(height(left), height(right))\`.

## Worked reasoning

Inserting \`[1, 2, 3]\` makes 1 the root, 2 its right child, and 3 the next right child, so height is 3. Searching for 3 inspects all three nodes. Inserting \`[2, 1, 3]\` creates height 2, and any search inspects at most two nodes.

## Complexity

One search is O(h). Building by repeated insertion is O(nh): O(n log n) for a balanced shape but O(n²) for sorted input's worst-case chain. Computing height afterward is O(n) time with O(h) call-stack space.

## TypeScript-specific edge cases

If duplicates occur, choose one insertion side consistently; the provided examples do not depend on duplicates. Check a nullable root before reading it. Do not sort the input: that changes insertion order and, therefore, the tree being measured.

## Exercise connection

\`bstHeight\` builds the exact insertion-order shape and applies the node-count recurrence. \`bstContainsShaped\` follows BST comparisons even when the shape degenerates into a line.

## Recap

BST operations are O(h). Balance keeps \`h\` logarithmic; adversarial insertion order can make \`h = n\` and erase the expected speedup.
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
## Prerequisite and connection

A binary heap is a complete binary tree stored level by level in an array. Completeness fixes every relationship, so each parent and **child index** can be calculated rather than stored.

## Intuition

With zero-based indexing, node \`i\` has left child \`2 * i + 1\`, right child \`2 * i + 2\`, and—when \`i > 0\`—parent \`Math.floor((i - 1) / 2)\`.

~~~mermaid
flowchart TD
  I0["index 0"] --> I1["index 1"]
  I0 --> I2["index 2"]
  I1 --> I3["index 3"]
  I1 --> I4["index 4"]
~~~

## Invariant or recurrence

The children of index \`i\` always occupy consecutive indexes \`2i + 1\` and \`2i + 2\`. Conversely, both children map back to \`i\` under \`floor((child - 1) / 2)\`. Index 0 is the unique root and has no parent.

## Worked reasoning

Index 1 has children 3 and 4. Both return parent 1: \`floor((3 - 1) / 2) = 1\` and \`floor((4 - 1) / 2) = 1\`. Index 2 similarly has children 5 and 6.

## Complexity

Each formula uses a constant number of arithmetic operations, so both exercises take O(1) time and O(1) auxiliary space.

## TypeScript-specific edge cases

JavaScript numbers are floating-point values, so \`Math.floor\` is required for the parent formula. \`parentIndex\` returns \`-1\` for index 0 and every negative index. \`childIndexes\` returns mathematical positions even when no particular heap array contains them.

## Exercise connection

\`parentIndex\` must guard the root and negatives before applying the formula. \`childIndexes\` returns both zero-based child indexes without a bounds check.

## Recap

Heap shape turns tree navigation into index arithmetic: parent \`floor((i - 1) / 2)\`, children \`2i + 1\` and \`2i + 2\`.
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
  "Connected components",
  "A visited set is what stops a graph search from walking a cycle forever.",
  25,
  stepBitesize.visitedWalks,
  `
## Prerequisite and connection

Tree traversals do not need cycle protection because each child has one parent. An undirected graph stores each edge in both directions, so a search can immediately walk back unless it remembers visited vertices in a **visited set**.

## Intuition

Build an **adjacency list**, start a breadth-first or depth-first search at \`start\`, and add a vertex to the visited set the first time it is discovered.

Every newly visited vertex belongs to the same connected component.

## Invariant or recurrence

The visited set contains exactly the discovered vertices, and each is scheduled for processing at most once. Mark when enqueuing or pushing—not when removing—so two neighbours cannot schedule the same vertex repeatedly.

## Worked reasoning

For edges \`[[0, 1], [1, 2], [3, 4]]\` starting at 0, discovery proceeds through 0, 1, and 2; no edge crosses to 3 or 4. The component size is 3. If the declared vertices are 0 through 4, that same visited count proves \`reachesAll\` is false.

A cycle such as \`0—1—0\` terminates because the second attempt to discover 0 finds it already visited.

## Complexity

Building and traversing an adjacency list takes O(V + E) time and O(V + E) space, including the graph representation, visited set, and frontier.

## TypeScript-specific edge cases

An isolated start still counts as one reachable vertex even when it never appears in \`edges\`. When using an object for adjacency lists, initialise a missing neighbour list before appending. Edge endpoints in \`reachesAll\` are guaranteed valid.

## Exercise connection

\`componentSize\` counts visited vertices without a declared graph size. \`reachesAll\` compares visited count with \`count\`, including isolated vertices that do not appear in any edge. \`countComponents\` starts one breadth-first or depth-first walk from every still-unvisited vertex in \`0..count - 1\` and returns how many walks that takes. [Breadth-first search](/articles/breadth-first-search) answers fewest edges; [depth-first search](/articles/depth-first-search) is enough when the question is only which vertices share a component.

## Recap

A visited set is both a termination guard and a record of reachability. Mark on discovery, then process each vertex once.
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
    problem(
      "count-components",
      "Count connected components",
      "Graphs",
      "medium",
      "countComponents",
      `
Implement \`countComponents(edges, count)\`.

- **Input:** vertices are the integers \`0\` through \`count - 1\`. Each item in \`edges\` is an undirected edge \`[from, to]\` whose endpoints lie in that range. \`count\` may be 0.
- **Output:** return how many connected components the graph has. An isolated vertex is its own component, even when it never appears in \`edges\`.
- **Edge cases:** no edges and \`count > 0\` returns \`count\`. \`count === 0\` returns 0. \`count === 1\` returns 1. A cycle, a duplicate edge, or a self-loop does not create an extra component. A single path through every vertex returns 1.
- **Required technique:** build an adjacency record, then start a breadth-first or depth-first search from every still-unvisited vertex in \`0..count - 1\`. Mark a vertex when it is first queued or pushed. Each time you start a fresh walk, add one to the component count.
- **Complexity:** O(V + E) time and O(V + E) space.
- **Do not:** scan the whole edge list once per vertex, or count only vertices that appear in \`edges\`. Isolated vertices are part of the declared range.

\`countComponents([[0, 1], [1, 2], [3, 4]], 5)\` returns \`2\`. [Depth-first search](/articles/depth-first-search) and [breadth-first search](/articles/breadth-first-search) both label a component; shortest distance is not part of this question.
      `,
      `export function countComponents(edges: number[][], count: number): number {
  return 0;
}
`,
      [
        {
          name: "two components",
          args: [
            [
              [0, 1],
              [1, 2],
              [3, 4],
            ],
            5,
          ],
          expected: 2,
          public: true,
        },
        {
          name: "no edges",
          args: [[], 3],
          expected: 3,
          public: true,
        },
        {
          name: "one vertex",
          args: [[], 1],
          expected: 1,
          public: false,
        },
        {
          name: "no vertices",
          args: [[], 0],
          expected: 0,
          public: false,
        },
        {
          name: "a cycle is one component",
          args: [
            [
              [0, 1],
              [1, 2],
              [2, 0],
            ],
            3,
          ],
          expected: 1,
          public: false,
        },
        {
          name: "an isolated vertex between connected ones",
          args: [[[0, 2]], 4],
          expected: 3,
          public: true,
        },
        {
          name: "one path",
          args: [
            [
              [0, 1],
              [1, 2],
              [2, 3],
            ],
            4,
          ],
          expected: 1,
          public: false,
        },
        {
          name: "a self-loop leaves the other vertex isolated",
          args: [[[0, 0]], 2],
          expected: 2,
          public: false,
        },
        {
          name: "duplicate edges",
          args: [
            [
              [0, 1],
              [1, 0],
              [0, 1],
            ],
            2,
          ],
          expected: 1,
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
## Prerequisite and connection

A greedy algorithm commits to a locally best summary without revisiting earlier choices.

Interval scheduling used earliest finish time on each half-open interval; jump game uses the farthest reachable index.

## Intuition

For one interval choice, scan for the smallest end and use the smallest start as the tie-break. For jump game, do not choose one literal jump path. Instead, scan every index currently reachable and extend a frontier with \`max(farthest, i + nums[i])\`.

## Invariant or recurrence

Before processing index \`i\`, every index up to \`farthest\` is reachable through some sequence of legal jumps. If \`i > farthest\`, no earlier reachable index can land on \`i\`, so neither \`i\` nor anything beyond it can help. Otherwise update \`farthest\` with the best reach available from \`i\`.

## Worked reasoning

For \`[2, 3, 1, 1, 4]\`, index 0 reaches 2. Processing index 1 extends the frontier to 4, the final index, so the answer is true. For \`[3, 2, 1, 0, 4]\`, the frontier reaches only 3. Index 4 lies beyond it, proving false.

This argument tracks the union of all reachable choices. A rule such as “always take the largest immediate jump” can discard a better future landing and lacks this invariant.

## Complexity

Both exercises use one scan: O(n) time and O(1) auxiliary space. No sorting is needed for selecting one earliest-finishing interval.

## TypeScript-specific edge cases

Return \`[]\` for no intervals, and return a fresh selected interval if input immutability matters. Jump lengths are non-negative. An empty jump array returns false; a one-element array is already at its last index.

## Exercise connection

\`earliestFinish\` isolates the selection rule and exact tie-break. \`canJump\` maintains a reachability frontier and may return early once it reaches the last index or encounters an unreachable index.

## Recap

Greedy reasoning needs a preserved fact, not just a plausible choice. Earliest finish preserves future room; farthest reach summarizes every jump path needed so far.
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
## Prerequisite and connection

Subset backtracking makes an include/exclude decision at each input position. Permutation backtracking asks a different question at each level: which unused index should occupy the next output position?

## Intuition

Maintain a current \`path\` and a \`used\` marker for every input index. At each depth, try unused indexes from left to right, choose one, recursively explore, then undo both the path and marker.

~~~mermaid
flowchart TD
  R["[]"] --> A["[1]"]
  R --> B["[2]"]
  A --> AB["[1,2]"]
  B --> BA["[2,1]"]
~~~

## Invariant or recurrence

At recursion depth \`d\`, \`path\` has exactly \`d\` values, and an index is marked used exactly when its value appears in the path. Full permutations record at depth \`nums.length\`; ordered picks record at depth \`k\`.

## Worked reasoning

For \`[1, 2, 3]\` and \`k = 2\`, choosing 1 first yields \`[1, 2]\` and \`[1, 3]\`. Undoing returns to the root, where choosing 2 yields \`[2, 1]\` and \`[2, 3]\`. This choose–explore–unchoose order produces the required left-to-right output ordering.

Copy the path when recording it. Storing the same mutable array reference would let later pops alter answers already placed in the result.

## Complexity

Full permutations produce \`n!\` outputs of length \`n\`, so output-sensitive time is Θ(n · n!) and result space is Θ(n · n!). Ordered picks produce \`P(n, k) = n! / (n - k)!\` outputs of length \`k\`.

## TypeScript-specific edge cases

Use a \`boolean[]\` indexed like \`nums\` to distinguish positions. The numbers are distinct, but index-based state is still the clean model. The empty input has one permutation—the empty ordering—because the initial path already satisfies the completion condition.

## Exercise connection

\`permutations\` stops when every index is used. \`orderedPicks\` uses the same traversal and deterministic choice order but stops when \`path.length === k\`.

## Recap

Backtracking order is observable here: try input indexes left to right, copy completed paths, and undo every choice before trying its sibling.
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
## Prerequisite and connection

**Memoisation** evaluates a recurrence top down and caches answers. A **bottom-up table** starts from known base cases and computes larger states in dependency order, avoiding recursive call overhead.

## Intuition

Fibonacci needs the previous two numbers. House robber also needs two earlier states: before house \`i\`, either skip it and keep the best through \`i - 1\`, or take it and add its value to the best through \`i - 2\`.

## Invariant or recurrence

For zero-based Fibonacci, \`fib(0) = 0\`, \`fib(1) = 1\`, and \`fib(i) = fib(i - 1) + fib(i - 2)\`.

Define \`dp[i]\` for house robber as the maximum value obtainable from houses \`0...i\`. Then

\`dp[i] = max(dp[i - 1], nums[i] + dp[i - 2])\`.

The first option skips house \`i\`; the second takes it and therefore excludes \`i - 1\`.

## Worked reasoning

For \`[2, 7, 9, 3, 1]\`, best totals progress as 2, 7, 11, 11, 12. At house 4, skipping keeps 11, while taking gives \`1 + 11 = 12\`, where 11 is the best through house 2.

## Complexity

Both exercises take O(n) time. A full table uses O(n) space, but because each recurrence reads only two earlier states, two variables reduce auxiliary space to O(1).

## TypeScript-specific edge cases

Handle base cases before entering the loop to avoid reading negative indexes, which yield \`undefined\`. House values are non-negative, an empty street returns 0, and one house returns its value. Keep the 0-based \`fibLoop\` indexing distinct from the earlier 1-based recursive Fibonacci exercise.

## Exercise connection

\`fibLoop\` updates two rolling Fibonacci states. \`rob\` updates rolling “two houses back” and “one house back” optima according to the skip-or-take recurrence.

## Recap

Define the state in one sentence, write its base cases and recurrence, then fill in dependency order. Compress storage only after the recurrence is clear.
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
## Prerequisite and connection

A hash table can recognize whole strings, but a trie represents one character per edge. Words with the same prefix share the same nodes until their spellings diverge.

## Intuition

Insert \`cat\`, \`car\`, and \`carpet\`: all three share nodes for \`c → a\`; two continue through \`r\`; only one continues through \`p → e → t\`. Store on each node how many inserted words pass through that node.

~~~mermaid
flowchart LR
  R["root count 3"] --> C["c: 3"]
  C --> A["a: 3"]
  A --> T["t: 1"]
  A --> RR["r: 2"]
  RR --> P["p: 1"]
  P --> E["e: 1"]
  E --> T2["t: 1"]
~~~

## Invariant or recurrence

After all insertions, a node's count equals the number of words having the root-to-node character sequence as a prefix. Count the root once per inserted word so the empty query returns \`words.length\`. Shared prefixes create shared nodes; repeated traversal increments counts rather than duplicating nodes.

## Worked reasoning

The \`ca\` node has count 3, the \`car\` node has count 2, and there is no \`d\` edge for \`dog\`, producing \`[3, 2, 0]\`. For longest common prefix, follow the characters of a candidate word while each reached node's count equals the total number of words; stop before the first lower count or missing edge.

## Complexity

Building the trie takes O(T) time and O(T) worst-case nodes for \`T\` total inserted characters, with fewer nodes when prefixes are shared.

Prefix queries take O(q) time per query length \`q\). Longest common prefix takes O(T) construction plus O(L) traversal.

## TypeScript-specific edge cases

Represent children with either a typed string-keyed object or a \`Map<string, TrieNode>\`, as the exercise permits. Do not confuse a missing child with a child whose count is 0. Empty word lists have common prefix \`""\`; an empty query ends at the root and counts every inserted word.

## Exercise connection

\`longestCommonPrefix\` follows only a path used by every word. \`prefixCounts\` returns the terminal node count for each query and 0 as soon as an edge is missing.

## Recap

Trie node counts summarize how many words share each prefix. Shared paths save nodes, and the root count gives the empty-prefix answer.
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

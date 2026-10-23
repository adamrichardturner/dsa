import type { SeedProblem } from "./types.js";
import { bstStarter, listStarter, treeStarter } from "./scaffolds.js";

export interface LessonExtras {
  readonly before: readonly SeedProblem[];
  readonly after: readonly SeedProblem[];
}

const none: readonly SeedProblem[] = [];

const pairSumStressInput = {
  fixture: "number-sequence",
  length: 40_000,
  start: 0,
  step: 2,
};

const countEqual: SeedProblem = {
  id: "count-equal",
  title: "Count exact matches",
  topic: "Complexity",
  difficulty: "easy",
  functionName: "countEqual",
  disallow: [".filter(", ".reduce("],
  immutableArgs: [0],
  promptMd: `
Implement \`countEqual(nums, target)\`.

- **Input:** \`nums\` is an array of finite numbers and \`target\` is a finite number.
- **Output:** return the number of indexes whose value is exactly equal to \`target\`. Count every occurrence.
- **Edge cases:** return \`0\` for an empty array or when no value matches. Negative values, zero, and repeated values are valid.
- **Required technique:** scan \`nums\` once while maintaining a counter.
- **Complexity:** O(n) time and O(1) extra space.
- **Do not:** mutate \`nums\`, call \`.filter()\`, or call \`.reduce()\`. The loop and counter are the skill being practised.
  `.trim(),
  starterCode: `export function countEqual(nums: number[], target: number): number {
  return 0;
}
`,
  tests: [
    {
      name: "two matches",
      args: [[1, 4, 2, 4], 4],
      expected: 2,
      public: true,
    },
    {
      name: "none",
      args: [[5, 6], 3],
      expected: 0,
      public: true,
    },
    {
      name: "empty",
      args: [[], 1],
      expected: 0,
      public: false,
    },
    {
      name: "all match",
      args: [[-2, -2, -2], -2],
      expected: 3,
      public: false,
    },
    {
      name: "zero is distinct from negatives",
      args: [[0, -1, 0, 1, 0], 0],
      expected: 3,
      public: true,
    },
    {
      name: "counts non-consecutive matches",
      args: [[7, 1, 7, 2, 3, 7], 7],
      expected: 3,
      public: false,
    },
  ],
};

const reverseCopy: SeedProblem = {
  id: "reverse-copy",
  title: "Reverse into a new array",
  topic: "Arrays",
  difficulty: "easy",
  functionName: "reverseCopy",
  disallow: [".reverse(", ".toReversed(", ".sort(", ".toSorted("],
  immutableArgs: [0],
  distinctArrayReturnFromArg: 0,
  promptMd: `
Implement \`reverseCopy(nums)\`.

- **Input:** \`nums\` is an array of finite numbers.
- **Output:** return a new array containing every input value in the opposite order.
- **Edge cases:** an empty input returns \`[]\`; a one-value input returns a different array with that value. Preserve duplicates, negative values, and zero.
- **Required technique:** walk the input from its last index to its first and append each value to a new array.
- **Complexity:** O(n) time and O(n) output space.
- **Do not:** mutate \`nums\`, sort it, or use \`.reverse()\`/\`.toReversed()\`.
  `.trim(),
  starterCode: `export function reverseCopy(nums: number[]): number[] {
  return [];
}
`,
  tests: [
    {
      name: "three values",
      args: [[1, 2, 3]],
      expected: [3, 2, 1],
      public: true,
    },
    {
      name: "one value",
      args: [[8]],
      expected: [8],
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: [],
      public: false,
    },
    {
      name: "negatives",
      args: [[-1, 0, 4]],
      expected: [4, 0, -1],
      public: false,
    },
    {
      name: "preserves duplicates",
      args: [[2, 1, 2, 2]],
      expected: [2, 2, 1, 2],
      public: true,
    },
    {
      name: "does not numerically sort",
      args: [[10, 2, 30]],
      expected: [30, 2, 10],
      public: false,
    },
  ],
};

const hasDuplicate: SeedProblem = {
  id: "has-duplicate",
  title: "Seen before",
  topic: "Hash maps",
  difficulty: "easy",
  functionName: "hasDuplicate",
  disallow: [
    ".includes(",
    ".indexOf(",
    ".lastIndexOf(",
    ".sort(",
    ".toSorted(",
  ],
  promptMd: `
Implement \`hasDuplicate(nums)\`.

- **Input:** \`nums\` is an array of finite numbers.
- **Output:** return \`true\` as soon as one value has appeared at two different indexes; otherwise return \`false\`.
- **Edge cases:** arrays with fewer than two values return \`false\`. Duplicate zeroes and duplicate negative values count.
- **Required technique:** keep a hash-based record of values already seen during one left-to-right pass.
- **Complexity:** O(n) expected time and O(n) extra space.
- **Do not:** sort the input, rescan it with \`.includes()\`/\`.indexOf()\`, or compare every pair of indexes.
  `.trim(),
  starterCode: `export function hasDuplicate(nums: number[]): boolean {
  return false;
}
`,
  tests: [
    {
      name: "repeats",
      args: [[1, 2, 3, 1]],
      expected: true,
      public: true,
    },
    {
      name: "unique",
      args: [[1, 2, 3]],
      expected: false,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: false,
      public: false,
    },
    {
      name: "later pair",
      args: [[4, 5, 6, 5]],
      expected: true,
      public: false,
    },
    {
      name: "duplicate zero",
      args: [[0, -1, 2, 0]],
      expected: true,
      public: true,
    },
    {
      name: "same absolute value is not duplicate",
      args: [[-3, 3, 0]],
      expected: false,
      public: false,
    },
    {
      name: "non-adjacent duplicate among many values",
      args: [[9, 1, 8, 2, 7, 3, 6, 1]],
      expected: true,
      public: false,
    },
  ],
};

const hasPairSum: SeedProblem = {
  id: "pair-sum",
  title: "Pair that sums to a target",
  topic: "Two pointers",
  difficulty: "easy",
  functionName: "hasPairSum",
  disallow: [
    ".includes(",
    ".indexOf(",
    ".some(",
    ".find(",
    "new Set",
    "new Map",
    ".sort(",
    ".toSorted(",
  ],
  promptMd: `
Implement \`hasPairSum(nums, target)\`.

- **Input:** \`nums\` is sorted in non-decreasing order and contains finite numbers; \`target\` is finite. Duplicates and negative values are allowed.
- **Output:** return \`true\` when there are two **different indexes** \`left < right\` whose values sum to \`target\`; otherwise return \`false\`.
- **Edge cases:** fewer than two values returns \`false\`. Two equal values may form a pair only when they occur at two indexes.
- **Required technique:** start one pointer at each end. If the sum is too small, move only the left pointer. If it is too large, move only the right pointer. Stop when the pointers meet.
- **Complexity:** O(n) time and O(1) extra space.
- **Do not:** move both pointers after a failed comparison, reuse one index, use nested loops, build a lookup set/map, search the array repeatedly, or sort the already-sorted input.

The runner rejects \`for\` loops for this exercise so the intended \`while\`-based two-pointer traversal remains visible.
  `.trim(),
  starterCode: `export function hasPairSum(nums: number[], target: number): boolean {
  return false;
}
`,
  tests: [
    {
      name: "ends meet",
      args: [[-1, 0, 2, 4], 3],
      expected: true,
      public: true,
    },
    {
      name: "absent",
      args: [[1, 2, 3], 7],
      expected: false,
      public: true,
    },
    {
      name: "duplicate values",
      args: [[1, 1], 2],
      expected: true,
      public: false,
    },
    {
      name: "too short",
      args: [[5], 5],
      expected: false,
      public: false,
    },
    {
      name: "move only left pointer",
      args: [[1, 2, 3, 4, 9], 11],
      expected: true,
      public: true,
    },
    {
      name: "move only right pointer",
      args: [[1, 2, 8, 9, 10], 10],
      expected: true,
      public: false,
    },
    {
      name: "cannot reuse the middle index",
      args: [[1, 2, 5, 11], 10],
      expected: false,
      public: false,
    },
    {
      name: "negatives and zero",
      args: [[-8, -3, 0, 2, 7, 12], 4],
      expected: true,
      public: false,
    },
    {
      name: "large absent pair stays linear",
      args: [pairSumStressInput, 79_997],
      expected: false,
      public: false,
      timeoutMs: 300,
    },
  ],
};

const minWindowSum: SeedProblem = {
  id: "min-window-sum",
  title: "Minimum window sum",
  topic: "Sliding window",
  difficulty: "easy",
  functionName: "minWindowSum",
  disallow: [".slice(", ".reduce("],
  promptMd: `
Implement \`minWindowSum(nums, k)\`.

- **Input:** \`nums\` is an array of finite numbers. \`k\` is an integer.
- **Output:** return the smallest sum among all contiguous windows containing exactly \`k\` values.
- **Edge cases:** return \`0\` when \`k < 1\`, \`k > nums.length\`, or no valid window exists. If \`k === nums.length\`, return the whole-array sum. Values may be negative.
- **Required technique:** sum the first window once, then slide it by subtracting the outgoing value and adding the incoming value.
- **Complexity:** O(n) time and O(1) extra space.
- **Do not:** create slices or reduce/re-sum every window.
  `.trim(),
  starterCode: `export function minWindowSum(nums: number[], k: number): number {
  return 0;
}
`,
  tests: [
    {
      name: "the fixed windows",
      args: [[2, 1, 5, 1, 3, 2], 3],
      expected: 6,
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
      expected: 2,
      public: false,
    },
    {
      name: "invalid zero window",
      args: [[1, 2, 3], 0],
      expected: 0,
      public: true,
    },
    {
      name: "window of one finds negative minimum",
      args: [[5, -4, 8, -2], 1],
      expected: -4,
      public: false,
    },
    {
      name: "minimum is the final window",
      args: [[9, 8, 7, 1, 1], 2],
      expected: 2,
      public: false,
    },
  ],
};

const listSum: SeedProblem = {
  id: "list-sum",
  title: "Sum a linked list",
  topic: "Linked lists",
  difficulty: "easy",
  functionName: "listSum",
  disallow: [".reduce(", ".filter("],
  promptMd: `
Implement \`listSum(values)\`. The supplied \`fromArray\` helper converts \`values\` into a linked list and gives you its head.

- **Input:** \`values\` is an array of finite numbers used only to construct the list.
- **Output:** return the sum of the \`value\` field on every node.
- **Edge cases:** an empty list sums to \`0\`; a one-node list returns that node's value. Values may be negative or zero.
- **Required technique:** call \`fromArray(values)\`, then advance a node pointer through \`next\` until it becomes \`null\`.
- **Complexity:** O(n) time and O(1) extra space after the provided list construction.
- **Do not:** sum \`values\` directly with array helpers, copy the list into an array, or mutate/relink nodes.
  `.trim(),
  starterCode: listStarter(
    "export function listSum(values: number[]): number",
    "  return 0;",
  ),
  tests: [
    {
      name: "three nodes",
      args: [[1, 2, 3]],
      expected: 6,
      public: true,
    },
    {
      name: "one node",
      args: [[4]],
      expected: 4,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: 0,
      public: false,
    },
    {
      name: "negatives",
      args: [[-2, 5, -1]],
      expected: 2,
      public: false,
    },
    {
      name: "zero total with several nodes",
      args: [[10, -3, -7, 0]],
      expected: 0,
      public: true,
    },
    {
      name: "repeated nodes all count",
      args: [[2, 2, 2, 2]],
      expected: 8,
      public: false,
    },
  ],
};

const removeAdjacent: SeedProblem = {
  id: "adjacent-duplicates",
  title: "Remove adjacent duplicates",
  topic: "Stacks",
  difficulty: "easy",
  functionName: "removeAdjacent",
  disallow: [".replace(", ".replaceAll("],
  promptMd: `
Implement \`removeAdjacent(value)\`.

- **Input:** \`value\` is a string of lowercase English letters.
- **Output:** repeatedly remove adjacent equal pairs until no such pair remains, then return the remaining characters in order.
- **Edge cases:** \`""\` remains \`""\`; a string with no pair is unchanged. Removing a pair may create a new pair across the gap, so \`"abba"\` becomes \`""\`.
- **Required technique:** use an array as a stack. Compare each character with the stack top; pop on a match and push otherwise.
- **Complexity:** O(n) time and O(n) extra space.
- **Do not:** use \`.replace()\`/\`.replaceAll()\`, repeatedly rescan the string, or hard-code known examples.

Example: \`removeAdjacent("abbaca")\` returns \`"ca"\`.
  `.trim(),
  starterCode: `export function removeAdjacent(value: string): string {
  return "";
}
`,
  tests: [
    {
      name: "the lesson pair",
      args: ["abbaca"],
      expected: "ca",
      public: true,
    },
    {
      name: "all cancel",
      args: ["abba"],
      expected: "",
      public: true,
    },
    {
      name: "empty",
      args: [""],
      expected: "",
      public: false,
    },
    {
      name: "no pairs",
      args: ["abc"],
      expected: "abc",
      public: false,
    },
    {
      name: "cascade across removed pair",
      args: ["azxxzy"],
      expected: "ay",
      public: true,
    },
    {
      name: "odd run leaves one",
      args: ["aaabcccb"],
      expected: "abcb",
      public: false,
    },
    {
      name: "case consists of several cascades",
      args: ["aabccba"],
      expected: "a",
      public: false,
    },
  ],
};

const recentValues: SeedProblem = {
  id: "recent-values",
  title: "The last k arrivals",
  topic: "Queues",
  difficulty: "easy",
  functionName: "recentValues",
  disallow: [".splice(", ".reverse(", ".toReversed("],
  immutableArgs: [0],
  promptMd: `
Implement \`recentValues(values, window)\`.

- **Input:** \`values\` is an array of finite numbers in arrival order. \`window\` is a positive integer.
- **Output:** after each arrival, append a snapshot containing at most the most recent \`window\` values. Return one independent snapshot per input value.
- **Edge cases:** an empty input returns \`[]\`; \`window === 1\` keeps only the newest value; a window wider than the input never evicts.
- **Required technique:** enqueue each value, dequeue the oldest value when the queue becomes too long, and copy the current queue into the result.
- **Complexity:** O(n × window) time for the required snapshots and O(n × window) output space, with O(window) working queue space.
- **Do not:** reverse the input, splice the input, mutate \`values\`, or store the same mutable queue object as every snapshot.

\`recentValues([1, 2, 3, 4], 2)\` returns \`[[1], [1, 2], [2, 3], [3, 4]]\`.
  `.trim(),
  starterCode: `export function recentValues(values: number[], window: number): number[][] {
  return [];
}
`,
  tests: [
    {
      name: "window of two",
      args: [[1, 2, 3, 4], 2],
      expected: [[1], [1, 2], [2, 3], [3, 4]],
      public: true,
    },
    {
      name: "window wider than the input",
      args: [[8, 1], 5],
      expected: [[8], [8, 1]],
      public: true,
    },
    {
      name: "empty",
      args: [[], 2],
      expected: [],
      public: false,
    },
    {
      name: "window of one",
      args: [[4, 5, 6], 1],
      expected: [[4], [5], [6]],
      public: false,
    },
    {
      name: "snapshots retain earlier states",
      args: [[1, 1, 2, 3], 3],
      expected: [[1], [1, 1], [1, 1, 2], [1, 2, 3]],
      public: true,
    },
    {
      name: "negative arrivals preserve order",
      args: [[-2, 0, -1], 2],
      expected: [[-2], [-2, 0], [0, -1]],
      public: false,
    },
  ],
};

const sumNested: SeedProblem = {
  id: "sum-nested",
  title: "Sum nested numbers",
  topic: "Recursion",
  difficulty: "easy",
  functionName: "sumNested",
  disallow: [".flat(", ".flatMap(", ".reduce("],
  promptMd: `
Implement \`sumNested(value)\` for the recursive \`Nested\` type supplied in the starter.

- **Input:** \`value\` is either a finite number or an array whose elements are recursively \`Nested\`. Nesting depth and array lengths may vary.
- **Output:** return the sum of every number in the structure.
- **Base cases:** a number returns itself and an empty array returns \`0\`.
- **Edge cases:** include negative values, zero, empty arrays at any depth, and sibling arrays.
- **Required technique:** recursively solve each child and accumulate the returned sums. Every recursive call must receive a smaller nested value.
- **Complexity:** O(n) time for n total numbers/arrays and O(d) call-stack space for maximum nesting depth d.
- **Do not:** flatten the structure, stringify it, or use \`.reduce()\` in place of writing the recursive traversal.
  `.trim(),
  starterCode: `type Nested = number | Nested[];

export function sumNested(value: Nested): number {
  return 0;
}
`,
  tests: [
    {
      name: "nested",
      args: [[1, [2, [3]]]],
      expected: 6,
      public: true,
    },
    {
      name: "a number",
      args: [4],
      expected: 4,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: 0,
      public: false,
    },
    {
      name: "siblings",
      args: [[[1, 2], [3]]],
      expected: 6,
      public: false,
    },
    {
      name: "empty arrays at several depths",
      args: [[[], [[], 4], []]],
      expected: 4,
      public: true,
    },
    {
      name: "negatives and zero",
      args: [[-5, [0, [2, -1]], 4]],
      expected: 0,
      public: false,
    },
    {
      name: "deep single branch",
      args: [[[[[[7]]]]]],
      expected: 7,
      public: false,
    },
  ],
};

const searchInsert: SeedProblem = {
  id: "search-insert",
  title: "Insertion index",
  topic: "Binary search",
  difficulty: "easy",
  functionName: "searchInsert",
  disallow: [".findIndex(", ".indexOf(", ".includes(", ".sort(", ".toSorted("],
  promptMd: `
Implement \`searchInsert(nums, target)\`.

- **Input:** \`nums\` is sorted in strictly increasing order and contains finite numbers; \`target\` is finite.
- **Output:** return the target's index when present. Otherwise return the index where inserting it would preserve ascending order.
- **Edge cases:** an empty array returns \`0\`; the insertion point may be \`0\` or \`nums.length\`. Negative values are valid.
- **Required technique:** binary search a half-open range and keep the first index whose value is not less than \`target\`.
- **Complexity:** O(log n) time and O(1) extra space.
- **Do not:** linearly scan, call search helpers, sort, or mutate \`nums\`.

The runner rejects \`for\` loops for this exercise so a \`while\`-based binary search remains visible.
  `.trim(),
  starterCode: `export function searchInsert(nums: number[], target: number): number {
  return 0;
}
`,
  tests: [
    {
      name: "present",
      args: [[1, 3, 5, 6], 5],
      expected: 2,
      public: true,
    },
    {
      name: "between",
      args: [[1, 3, 5, 6], 2],
      expected: 1,
      public: true,
    },
    {
      name: "after the end",
      args: [[1, 3, 5, 6], 7],
      expected: 4,
      public: false,
    },
    {
      name: "before the start",
      args: [[1, 3, 5, 6], 0],
      expected: 0,
      public: false,
    },
    {
      name: "single present",
      args: [[4], 4],
      expected: 0,
      public: false,
    },
    {
      name: "single absent after",
      args: [[4], 9],
      expected: 1,
      public: false,
    },
    {
      name: "negative insertion point",
      args: [[-10, -3, 2, 8], -4],
      expected: 1,
      public: true,
    },
    {
      name: "between final values",
      args: [[1, 4, 9, 15, 22], 14],
      expected: 3,
      public: false,
    },
  ],
};

const mergeSorted: SeedProblem = {
  id: "merge-sorted",
  title: "Merge two sorted arrays",
  topic: "Sorting",
  difficulty: "easy",
  functionName: "mergeSorted",
  disallow: [".sort(", ".toSorted("],
  immutableArgs: [0, 1],
  distinctArrayReturnFromArg: 0,
  promptMd: `
Implement \`mergeSorted(left, right)\`.

- **Input:** \`left\` and \`right\` are arrays of finite numbers, each sorted in non-decreasing order. Either may be empty and duplicates are allowed.
- **Output:** return a new non-decreasing array containing every value from both inputs, including all duplicate occurrences.
- **Edge cases:** two empty inputs return \`[]\`; when one input is exhausted, append the remaining values from the other.
- **Required technique:** use one pointer per input, repeatedly append the smaller current value, then drain either remainder.
- **Complexity:** O(left.length + right.length) time and O(left.length + right.length) output space.
- **Do not:** mutate either input, concatenate then sort, call \`.sort()\`/\`.toSorted()\`, or omit duplicates.
  `.trim(),
  starterCode: `export function mergeSorted(left: number[], right: number[]): number[] {
  return [];
}
`,
  tests: [
    {
      name: "interleaved",
      args: [
        [1, 3, 5],
        [2, 4],
      ],
      expected: [1, 2, 3, 4, 5],
      public: true,
    },
    {
      name: "one side empty",
      args: [[], [1, 2]],
      expected: [1, 2],
      public: true,
    },
    {
      name: "duplicates",
      args: [
        [1, 2, 2],
        [2, 3],
      ],
      expected: [1, 2, 2, 2, 3],
      public: false,
    },
    {
      name: "both empty",
      args: [[], []],
      expected: [],
      public: false,
    },
    {
      name: "left remainder",
      args: [
        [1, 2, 8, 9],
        [3, 4],
      ],
      expected: [1, 2, 3, 4, 8, 9],
      public: true,
    },
    {
      name: "right remainder with negatives",
      args: [
        [-5, 0],
        [-4, -1, 3, 7],
      ],
      expected: [-5, -4, -1, 0, 3, 7],
      public: false,
    },
    {
      name: "equal values from both sides",
      args: [
        [2, 2],
        [2, 2],
      ],
      expected: [2, 2, 2, 2],
      public: false,
    },
  ],
};

const countNodes: SeedProblem = {
  id: "count-nodes",
  title: "Count the nodes",
  topic: "Trees",
  difficulty: "easy",
  functionName: "countNodes",
  disallow: [".filter(", ".reduce("],
  promptMd: `
Implement \`countNodes(values)\`. The supplied \`buildTree\` helper converts the level-order encoding into linked \`TreeNode\` objects.

- **Input:** \`values\` is a valid level-order binary-tree encoding. Numbers are nodes and \`null\` marks a missing child.
- **Output:** return the number of actual \`TreeNode\` objects in the constructed tree.
- **Edge cases:** \`[]\` returns \`0\`; a root by itself returns \`1\`; missing children and one-sided trees are valid.
- **Required technique:** call \`buildTree(values)\`, then recursively traverse both \`left\` and \`right\` children (or use an explicit traversal stack/queue).
- **Complexity:** O(n) time for n nodes and O(h) recursive stack space, or O(n) explicit traversal space.
- **Do not:** count entries in \`values\` directly with array helpers. Traverse the tree produced by \`buildTree\`.
  `.trim(),
  starterCode: treeStarter(
    "export function countNodes(values: Array<number | null>): number",
    "  return 0;",
  ),
  tests: [
    {
      name: "the lesson tree",
      args: [[3, 9, 20, null, null, 15, 7]],
      expected: 5,
      public: true,
    },
    {
      name: "single node",
      args: [[1]],
      expected: 1,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: 0,
      public: false,
    },
    {
      name: "left spine",
      args: [[1, 2, null, 3]],
      expected: 3,
      public: false,
    },
    {
      name: "right spine",
      args: [[1, null, 2, null, 3]],
      expected: 3,
      public: true,
    },
    {
      name: "missing children inside tree",
      args: [[8, 4, 12, null, 6, 10, null]],
      expected: 5,
      public: false,
    },
    {
      name: "zero and negative node values still count",
      args: [[0, -1, 2, null, null, -3, 4]],
      expected: 5,
      public: false,
    },
  ],
};

const bstMin: SeedProblem = {
  id: "bst-min",
  title: "Minimum in a binary search tree",
  topic: "Binary search trees",
  difficulty: "easy",
  functionName: "bstMin",
  disallow: [
    ".includes(",
    ".indexOf(",
    ".filter(",
    ".reduce(",
    "Math.min",
    ".sort(",
    ".toSorted(",
  ],
  promptMd: `
Implement \`bstMin(values)\` using the supplied \`TreeNode\` class.

- **Input:** \`values\` is an array of finite, distinct numbers. Insert them from left to right into an initially empty binary search tree: smaller values go left and larger values go right.
- **Output:** return the smallest value stored in the completed tree, or \`null\` when no values were inserted.
- **Edge cases:** the root may already be the minimum; values may be negative; a descending input creates a left spine.
- **Required technique:** build the BST with \`TreeNode\` links, then follow \`left\` pointers until no left child remains.
- **Complexity:** O(nh) tree construction in the unbalanced worst case and O(h) minimum lookup, where h is tree height.
- **Do not:** take the minimum directly from \`values\`, sort/search/filter/reduce the array, or call \`Math.min\`.
  `.trim(),
  starterCode: bstStarter(
    "export function bstMin(values: number[]): number | null",
    "  return null;",
  ),
  tests: [
    {
      name: "left child",
      args: [[5, 3, 7, 1]],
      expected: 1,
      public: true,
    },
    {
      name: "already the root",
      args: [[1, 2, 3]],
      expected: 1,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: null,
      public: false,
    },
    {
      name: "negatives",
      args: [[0, -4, 2]],
      expected: -4,
      public: false,
    },
    {
      name: "minimum is deep left descendant",
      args: [[10, 5, 15, 7, 3, 4, 1]],
      expected: 1,
      public: true,
    },
    {
      name: "descending input",
      args: [[9, 7, 5, 3, 1]],
      expected: 1,
      public: false,
    },
    {
      name: "all negative values",
      args: [[-4, -2, -8, -6]],
      expected: -8,
      public: false,
    },
  ],
};

const isMinHeap: SeedProblem = {
  id: "is-min-heap",
  title: "Is this a min-heap?",
  topic: "Heaps",
  difficulty: "easy",
  functionName: "isMinHeap",
  disallow: [".sort(", ".toSorted(", "Math.min"],
  immutableArgs: [0],
  promptMd: `
Implement \`isMinHeap(nums)\`.

- **Input:** \`nums\` is a complete binary tree stored in level order, with finite numbers. For child index \`i > 0\`, its parent is \`Math.floor((i - 1) / 2)\`.
- **Output:** return \`true\` exactly when every parent value is less than or equal to each child value.
- **Edge cases:** empty and one-value arrays are valid min-heaps. Equal parent/child values are allowed. A violation may occur below an otherwise valid root.
- **Required technique:** scan each non-root index once and compare it with its parent, returning early on a violation.
- **Complexity:** O(n) time and O(1) extra space.
- **Do not:** sort the array, compute a global minimum, mutate \`nums\`, or check only the root's children.
  `.trim(),
  starterCode: `export function isMinHeap(nums: number[]): boolean {
  return false;
}
`,
  tests: [
    {
      name: "ordered",
      args: [[1, 3, 2, 7, 4]],
      expected: true,
      public: true,
    },
    {
      name: "a child is smaller",
      args: [[1, 3, 2, 0]],
      expected: false,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: true,
      public: false,
    },
    {
      name: "single",
      args: [[9]],
      expected: true,
      public: false,
    },
    {
      name: "equal parent and child allowed",
      args: [[1, 1, 2, 1, 3]],
      expected: true,
      public: false,
    },
    {
      name: "deep violation outside root children",
      args: [[1, 3, 2, 7, 4, 0]],
      expected: false,
      public: true,
    },
    {
      name: "negative min heap",
      args: [[-10, -8, -9, -3, -2]],
      expected: true,
      public: false,
    },
  ],
};

const canReach: SeedProblem = {
  id: "can-reach",
  title: "Can you reach it?",
  topic: "Graphs",
  difficulty: "easy",
  functionName: "canReach",
  disallow: [".includes(", ".indexOf("],
  promptMd: `
Implement \`canReach(edges, start, end)\`.

- **Input:** each item in \`edges\` is an undirected edge \`[from, to]\` between integer vertex labels. Labels need not be consecutive and isolated \`start\`/\`end\` labels may be absent from the edges.
- **Output:** return whether any path connects \`start\` to \`end\`. A vertex is always reachable from itself.
- **Edge cases:** handle an empty graph, disconnected components, cycles, self-edges, and paths that require traversing an edge in either direction.
- **Required technique:** build an adjacency record, then run BFS or DFS while marking a vertex when it is first queued/visited.
- **Complexity:** O(V + E) time and O(V + E) space.
- **Do not:** repeatedly search the edge list for every path step, enumerate paths, or omit the visited record.
  `.trim(),
  starterCode: `export function canReach(
  edges: number[][],
  start: number,
  end: number,
): boolean {
  return false;
}
`,
  tests: [
    {
      name: "a short path",
      args: [
        [
          [0, 1],
          [1, 2],
        ],
        0,
        2,
      ],
      expected: true,
      public: true,
    },
    {
      name: "disconnected",
      args: [[[0, 1]], 0, 2],
      expected: false,
      public: true,
    },
    {
      name: "same vertex",
      args: [[], 4, 4],
      expected: true,
      public: false,
    },
    {
      name: "cycle still reaches",
      args: [
        [
          [0, 1],
          [1, 2],
          [2, 0],
        ],
        0,
        2,
      ],
      expected: true,
      public: false,
    },
    {
      name: "undirected edge works in reverse",
      args: [
        [
          [1, 2],
          [2, 3],
        ],
        3,
        1,
      ],
      expected: true,
      public: true,
    },
    {
      name: "cycle in disconnected component",
      args: [
        [
          [0, 1],
          [1, 0],
          [3, 4],
        ],
        0,
        4,
      ],
      expected: false,
      public: false,
    },
    {
      name: "non-consecutive labels on longer path",
      args: [
        [
          [10, 20],
          [30, 40],
          [20, 30],
        ],
        10,
        40,
      ],
      expected: true,
      public: false,
    },
    {
      name: "isolated vertices differ",
      args: [[], -1, 1],
      expected: false,
      public: false,
    },
  ],
};

const canAttendAll: SeedProblem = {
  id: "can-attend-all",
  title: "Can one person attend all?",
  topic: "Greedy",
  difficulty: "easy",
  functionName: "canAttendAll",
  disallow: [".some(", ".every(", ".find("],
  immutableArgs: [0],
  promptMd: `
Implement \`canAttendAll(intervals)\`.

- **Input:** each interval is a valid finite pair \`[start, end)\` with \`start < end\`. Intervals may be unsorted.
- **Output:** return \`true\` when no two intervals overlap, so one person can attend all of them.
- **Edge cases:** an empty or one-interval input returns \`true\`. Endpoints are exclusive, so intervals that only touch are compatible. Negative times are valid.
- **Required technique:** copy and sort intervals by start time, then compare each start with the previous interval's end.
- **Complexity:** O(n log n) time and O(n) space for the non-mutating sorted copy.
- **Do not:** mutate \`intervals\`, compare every pair with nested loops, or treat touching endpoints as overlap.
  `.trim(),
  starterCode: `export function canAttendAll(intervals: number[][]): boolean {
  return false;
}
`,
  tests: [
    {
      name: "touching",
      args: [
        [
          [1, 3],
          [3, 5],
        ],
      ],
      expected: true,
      public: true,
    },
    {
      name: "overlap",
      args: [
        [
          [1, 4],
          [2, 3],
        ],
      ],
      expected: false,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: true,
      public: false,
    },
    {
      name: "unsorted input",
      args: [
        [
          [5, 8],
          [1, 3],
        ],
      ],
      expected: true,
      public: false,
    },
    {
      name: "unsorted hidden overlap",
      args: [
        [
          [8, 10],
          [1, 4],
          [3, 6],
        ],
      ],
      expected: false,
      public: true,
    },
    {
      name: "interval contained inside another",
      args: [
        [
          [1, 10],
          [3, 4],
        ],
      ],
      expected: false,
      public: false,
    },
    {
      name: "negative touching chain",
      args: [
        [
          [-5, -2],
          [0, 3],
          [-2, 0],
        ],
      ],
      expected: true,
      public: false,
    },
    {
      name: "single interval",
      args: [[[2, 9]]],
      expected: true,
      public: false,
    },
  ],
};

const countSubsets: SeedProblem = {
  id: "count-subsets",
  title: "How many subsets?",
  topic: "Backtracking",
  difficulty: "easy",
  functionName: "countSubsets",
  disallow: ["**", "Math.pow(", "<<", ">>", ".reduce("],
  promptMd: `
Implement \`countSubsets(nums)\`.

- **Input:** \`nums\` contains distinct finite numbers and has at most 20 values.
- **Output:** return the number of distinct subsets, including both the empty subset and the full input.
- **Edge cases:** \`[]\` has one subset; each additional distinct value doubles the count.
- **Expected technique:** use include/exclude backtracking: at each index, recursively count the branch that skips the value and the branch that takes it. A direct \`2 ** nums.length\` calculation is also a valid constant-time optimization for this count-only variant.
- **Complexity:** O(2^n) recursive calls and O(n) call-stack space for backtracking.
- **Do not:** generate and retain all subset arrays when only the count is required, use exponentiation, bit shifts, or \`.reduce()\`. Static restrictions and output tests encourage the recursive exercise but cannot formally prove how the count was produced.

\`countSubsets([1, 2])\` returns \`4\`.
  `.trim(),
  starterCode: `export function countSubsets(nums: number[]): number {
  return 0;
}
`,
  tests: [
    {
      name: "two values",
      args: [[1, 2]],
      expected: 4,
      public: true,
    },
    {
      name: "one value",
      args: [[4]],
      expected: 2,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: 1,
      public: false,
    },
    {
      name: "three values",
      args: [[1, 2, 3]],
      expected: 8,
      public: false,
    },
    {
      name: "five values",
      args: [[-3, -1, 0, 2, 8]],
      expected: 32,
      public: true,
    },
    {
      name: "ten values",
      args: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
      expected: 1_024,
      public: false,
    },
  ],
};

const minCostClimb: SeedProblem = {
  id: "min-cost-climb",
  title: "Minimum cost to climb",
  topic: "Dynamic programming",
  difficulty: "medium",
  functionName: "minCostClimb",
  disallow: [".sort(", ".toSorted(", ".shift(", ".unshift("],
  immutableArgs: [0],
  promptMd: `
Implement \`minCostClimb(cost)\`.

- **Input:** \`cost\` is an array of non-negative finite numbers. \`cost[i]\` is paid when stepping on stair \`i\`.
- **Output:** return the minimum total cost needed to reach the top, one position past the final stair. You may start on stair 0 or stair 1 and move one or two stairs after each payment.
- **Edge cases:** zero or one stair costs \`0\` because you may start at or beyond the top. Zero-cost stairs and repeated costs are valid.
- **Required technique:** use the recurrence based on the cheapest cost to reach the previous two positions, either bottom-up or with memoization.
- **Complexity:** O(n) time and O(1) extra space for the bottom-up two-state solution (or O(n) memo space).
- **Do not:** greedily choose only the locally cheaper next stair, sort/reorder the costs, or mutate \`cost\`.

\`minCostClimb([10, 15, 20])\` returns \`15\`.
  `.trim(),
  starterCode: `export function minCostClimb(cost: number[]): number {
  return 0;
}
`,
  tests: [
    {
      name: "three stairs",
      args: [[10, 15, 20]],
      expected: 15,
      public: true,
    },
    {
      name: "start on the cheap stair",
      args: [[1, 100]],
      expected: 1,
      public: true,
    },
    {
      name: "the longer staircase",
      args: [[1, 100, 1, 1, 1, 100, 1, 1, 1, 1]],
      expected: 5,
      public: false,
    },
    {
      name: "two cheap ends",
      args: [[2, 5]],
      expected: 2,
      public: false,
    },
    {
      name: "empty staircase",
      args: [[]],
      expected: 0,
      public: true,
    },
    {
      name: "one stair can be skipped",
      args: [[9]],
      expected: 0,
      public: false,
    },
    {
      name: "zero-cost route",
      args: [[0, 5, 0, 5, 0]],
      expected: 0,
      public: false,
    },
    {
      name: "local cheapest choice is misleading",
      args: [[5, 1, 2, 100, 1, 1]],
      expected: 4,
      public: false,
    },
  ],
};

const hasPrefix: SeedProblem = {
  id: "has-prefix",
  title: "Prefix lookup",
  topic: "Tries",
  difficulty: "medium",
  functionName: "hasPrefix",
  disallow: [".startsWith(", ".includes(", ".indexOf(", ".some(", ".find("],
  promptMd: `
Implement \`hasPrefix(words, queries)\`.

- **Input:** \`words\` and \`queries\` contain lowercase English strings. Insert every word into one trie.
- **Output:** return one boolean per query, in query order. The result is \`true\` when the entire query labels a path from the trie root, meaning it is a prefix of at least one inserted word (including an exact word).
- **Edge cases:** an empty query is a prefix only when at least one word was inserted. With no words, every query is false. Queries may be longer than all matching words, and duplicate words do not change the answers.
- **Required technique:** represent trie children with \`Record<string, TrieNode>\`; build the trie once, then traverse characters for each query.
- **Complexity:** O(W + Q) time, where W is the total characters inserted and Q is the total query characters examined, and O(W) trie space.
- **Do not:** scan all words separately for every query or call \`.startsWith()\`/\`.includes()\`. A map used for each node's children is still a trie; a flat collection of whole words does not provide prefix lookup.

\`hasPrefix(["cat", "car"], ["ca", "cab", "cat"])\` returns \`[true, false, true]\`.
  `.trim(),
  starterCode: `export function hasPrefix(words: string[], queries: string[]): boolean[] {
  return [];
}
`,
  tests: [
    {
      name: "shared prefixes",
      args: [
        ["cat", "car"],
        ["ca", "cab", "cat"],
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
      name: "empty query",
      args: [["cat"], [""]],
      expected: [true],
      public: false,
    },
    {
      name: "no words",
      args: [[], [""]],
      expected: [false],
      public: false,
    },
    {
      name: "exact word prefix and longer query",
      args: [
        ["a", "ant"],
        ["a", "an", "ant", "ants"],
      ],
      expected: [true, true, true, false],
      public: true,
    },
    {
      name: "shared first character diverges",
      args: [
        ["dog", "dot", "dove"],
        ["do", "dog", "dor", "dov"],
      ],
      expected: [true, true, false, true],
      public: false,
    },
    {
      name: "duplicate words and mixed queries",
      args: [
        ["cat", "cat"],
        ["", "c", "cat", "cater"],
      ],
      expected: [true, true, true, false],
      public: false,
    },
    {
      name: "no words makes non-empty query false",
      args: [[], ["a", "cat"]],
      expected: [false, false],
      public: false,
    },
  ],
};

const rangeSum: SeedProblem = {
  id: "range-sum",
  title: "Range sum with a prefix array",
  topic: "Sliding window",
  difficulty: "easy",
  functionName: "rangeSum",
  disallow: [".slice(", ".reduce("],
  immutableArgs: [0],
  promptMd: `
Implement \`rangeSum(prefix, left, right)\`.

- **Input:** \`prefix\` is a prefix-sum array. \`prefix[0]\` is \`0\`, and \`prefix[i]\` is the sum of the original values at indexes \`0\` through \`i - 1\`. \`left\` and \`right\` are inclusive indexes into that original array, with \`0 <= left <= right\`. The original values may be negative or zero.
- **Output:** return the sum of the original values from \`left\` through \`right\`, inclusive.
- **Edge cases:** \`left === right\` returns that one value. A span that starts at index \`0\` uses the same formula as any other span. A prefix of \`[0]\` means the original array was empty; \`rangeSum([0], 0, 0)\` returns \`0\`.
- **Required technique:** subtract two prefix entries. The inclusive sum is \`prefix[right + 1] - prefix[left]\`. That is the half-open cancellation \`prefix[end] - prefix[start]\` with \`end = right + 1\`.
- **Complexity:** O(1) time and O(1) extra space. Building the prefix array is separate work and is not part of this function.
- **Do not:** rescan the range, call \`.reduce()\` or \`.slice()\`, or rebuild the prefix array. Do not mutate \`prefix\`.

For \`nums = [2, 1, 5, 3, 4]\`, the prefix is \`[0, 2, 3, 8, 11, 15]\` and \`rangeSum(prefix, 1, 3)\` is \`9\`.
  `.trim(),
  starterCode: `export function rangeSum(
  prefix: number[],
  left: number,
  right: number,
): number {
  return 0;
}
`,
  tests: [
    {
      name: "an interior inclusive span",
      args: [[0, 2, 3, 8, 11, 15], 1, 3],
      expected: 9,
      public: true,
    },
    {
      name: "one stored value",
      args: [[0, 5], 0, 0],
      expected: 5,
      public: true,
    },
    {
      name: "a single middle value",
      args: [[0, 2, 3, 8, 11, 15], 2, 2],
      expected: 5,
      public: false,
    },
    {
      name: "the whole array from the left end",
      args: [[0, 2, 3, 8, 11, 15], 0, 4],
      expected: 15,
      public: false,
    },
    {
      name: "empty original array",
      args: [[0], 0, 0],
      expected: 0,
      public: false,
    },
    {
      name: "negatives cancel inside the span",
      args: [[0, -2, 3, 2], 0, 2],
      expected: 2,
      public: true,
    },
    {
      name: "a negative one-value span",
      args: [[0, -2, 3, 2], 0, 0],
      expected: -2,
      public: false,
    },
    {
      name: "a span that does not start at zero",
      args: [[0, -2, 3, 2], 1, 2],
      expected: 4,
      public: false,
    },
  ],
};

const removeDuplicates: SeedProblem = {
  id: "remove-duplicates-sorted",
  title: "Remove duplicates in a sorted array",
  topic: "Two pointers",
  difficulty: "easy",
  functionName: "removeDuplicates",
  disallow: [".filter(", ".reduce(", ".sort(", ".toSorted(", "new Set"],
  immutableArgs: [0],
  distinctArrayReturnFromArg: 0,
  promptMd: `
Implement \`removeDuplicates(nums)\`.

- **Input:** \`nums\` is sorted in non-decreasing order and contains finite numbers. Equal values are adjacent because of that order. Negatives and zero are allowed.
- **Output:** return a new array containing each distinct value once, in the same order. Its length is the number of unique values.
- **Edge cases:** an empty input returns \`[]\`. A one-value input returns a different array holding that value. An array of identical values returns a one-value array.
- **Required technique:** scan with a read index and write into a new array. Keep the first value. Keep each later value only when it differs from the last value written.
- **Complexity:** O(n) time. The returned array uses O(k) space for \`k\` unique values, and extra memory besides that array is O(1).
- **Do not:** mutate \`nums\`, sort it, or build the answer with \`.filter()\`, \`.reduce()\`, or a set. The write pointer is the skill being practised.

\`removeDuplicates([1, 1, 2, 2, 3])\` returns \`[1, 2, 3]\`.
  `.trim(),
  starterCode: `export function removeDuplicates(nums: number[]): number[] {
  return [];
}
`,
  tests: [
    {
      name: "adjacent duplicates",
      args: [[1, 1, 2]],
      expected: [1, 2],
      public: true,
    },
    {
      name: "already unique",
      args: [[1, 2, 3]],
      expected: [1, 2, 3],
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: [],
      public: false,
    },
    {
      name: "one value",
      args: [[4]],
      expected: [4],
      public: false,
    },
    {
      name: "every value is equal",
      args: [[7, 7, 7]],
      expected: [7],
      public: false,
    },
    {
      name: "negatives zero and a repeated run",
      args: [[-2, -2, -1, 0, 0, 0, 3]],
      expected: [-2, -1, 0, 3],
      public: true,
    },
    {
      name: "several runs",
      args: [[1, 1, 1, 2, 2, 3, 3, 3, 3]],
      expected: [1, 2, 3],
      public: false,
    },
    {
      name: "unique negatives stay in order",
      args: [[-5, -1, 0, 2]],
      expected: [-5, -1, 0, 2],
      public: false,
    },
    {
      name: "many identical values stay linear",
      args: [
        {
          fixture: "number-sequence",
          length: 12_000,
          start: 4,
          step: 0,
        },
      ],
      expected: [4],
      public: false,
      timeoutMs: 300,
    },
  ],
};

const maxArea: SeedProblem = {
  id: "max-area",
  title: "Container with most water",
  topic: "Two pointers",
  difficulty: "medium",
  functionName: "maxArea",
  disallow: [".sort(", ".toSorted("],
  immutableArgs: [0],
  promptMd: `
Implement \`maxArea(heights)\`.

- **Input:** \`heights\` is an array of non-negative finite numbers. Index \`i\` is a vertical line of that height. The width between two indexes is their distance.
- **Output:** return the largest area a container can hold. The container between \`left < right\` has area \`min(heights[left], heights[right]) * (right - left)\`. Return \`0\` when fewer than two lines exist.
- **Edge cases:** two lines have width \`1\`. Equal heights are allowed. A zero height contributes area \`0\`. The widest pair is not always the answer, and the tallest line is not always part of it.
- **Required technique:** start pointers at the two ends. The area is limited by the shorter line, so move that shorter pointer inward by one. When the heights are equal, move the left pointer. The width only shrinks, so the shorter height cannot form a larger area with any index still between the pointers.
- **Complexity:** O(n) time and O(1) extra space.
- **Do not:** mutate \`heights\`, sort it, or check every pair. A nested scan is too slow for the large hidden case.

\`maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])\` returns \`49\`.
  `.trim(),
  starterCode: `export function maxArea(heights: number[]): number {
  return 0;
}
`,
  tests: [
    {
      name: "the classic lines",
      args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]],
      expected: 49,
      public: true,
    },
    {
      name: "two equal lines",
      args: [[1, 1]],
      expected: 1,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: 0,
      public: false,
    },
    {
      name: "one line",
      args: [[5]],
      expected: 0,
      public: false,
    },
    {
      name: "equal heights use the full width",
      args: [[4, 4, 4, 4]],
      expected: 12,
      public: false,
    },
    {
      name: "zeros cannot hold water",
      args: [[0, 2, 0]],
      expected: 0,
      public: false,
    },
    {
      name: "the ends beat the tall middle",
      args: [[1, 100, 1]],
      expected: 2,
      public: true,
    },
    {
      name: "the shorter left end moves",
      args: [[1, 3, 2]],
      expected: 2,
      public: false,
    },
    {
      name: "the shorter right end moves",
      args: [[8, 6, 2, 5]],
      expected: 15,
      public: false,
    },
    {
      name: "a narrow tall pair beats a wide short pair",
      args: [[1, 3, 2, 5, 25, 24, 5]],
      expected: 24,
      public: false,
    },
    {
      name: "wide equal heights stay linear",
      args: [
        {
          fixture: "number-sequence",
          length: 40_000,
          start: 5,
          step: 0,
        },
      ],
      expected: 199_995,
      public: false,
      timeoutMs: 300,
    },
  ],
};

const levelOrder: SeedProblem = {
  id: "level-order",
  title: "Level-order traversal",
  topic: "Trees",
  difficulty: "easy",
  functionName: "levelOrder",
  disallow: [".filter(", ".reduce(", ".flat("],
  immutableArgs: [0],
  distinctArrayReturnFromArg: 0,
  promptMd: `
Implement \`levelOrder(values)\`. The supplied \`buildTree\` helper converts the level-order encoding into linked \`TreeNode\` objects.

- **Input:** \`values\` is a valid level-order binary-tree encoding. Numbers are nodes and \`null\` marks a missing child.
- **Output:** return the node values from a left-to-right breadth-first walk. Skip missing children. Do not include \`null\` in the output.
- **Edge cases:** \`[]\` returns \`[]\`. A root by itself returns \`[value]\`. A left spine and a right spine are both valid, and node values may be negative or zero.
- **Required technique:** call \`buildTree(values)\`, then walk with a queue. Emit a real node when you take it from the queue, and enqueue its left child before its right child. A front index avoids the cost of \`shift()\`.
- **Complexity:** O(n) time and O(n) queue space for n nodes.
- **Do not:** copy the non-null entries of \`values\` with array helpers. The encoding is level order already, and the exercise is the queue walk on the tree \`buildTree\` produces.

\`levelOrder([3, 9, 20, null, null, 15, 7])\` returns \`[3, 9, 20, 15, 7]\`.
  `.trim(),
  starterCode: treeStarter(
    "export function levelOrder(values: Array<number | null>): number[]",
    "  return [];",
  ),
  tests: [
    {
      name: "the lesson tree",
      args: [[3, 9, 20, null, null, 15, 7]],
      expected: [3, 9, 20, 15, 7],
      public: true,
    },
    {
      name: "single node",
      args: [[1]],
      expected: [1],
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: [],
      public: false,
    },
    {
      name: "left spine",
      args: [[1, 2, null, 3]],
      expected: [1, 2, 3],
      public: false,
    },
    {
      name: "right spine",
      args: [[1, null, 2, null, 3]],
      expected: [1, 2, 3],
      public: true,
    },
    {
      name: "zero and negative values",
      args: [[0, -1, 2, null, null, -3, 4]],
      expected: [0, -1, 2, -3, 4],
      public: false,
    },
    {
      name: "a complete tree",
      args: [[4, 2, 6, 1, 3, 5, 7]],
      expected: [4, 2, 6, 1, 3, 5, 7],
      public: false,
    },
  ],
};

const isValidBst: SeedProblem = {
  id: "is-valid-bst",
  title: "Validate a binary search tree",
  topic: "Binary search trees",
  difficulty: "medium",
  functionName: "isValidBst",
  disallow: [".sort(", ".toSorted("],
  immutableArgs: [0],
  promptMd: `
Implement \`isValidBst(values)\`. The supplied \`buildTree\` helper converts the level-order encoding into linked \`TreeNode\` objects.

- **Input:** \`values\` is a level-order binary-tree encoding. Numbers are nodes and \`null\` marks a missing child. This tree was not necessarily built by the course's insertion routine.
- **Output:** return \`true\` exactly when every node obeys the strict BST rule: every value in its left subtree is smaller than the node, and every value in its right subtree is larger.
- **Edge cases:** an empty tree and a single node are valid. Equal values are not valid anywhere in a subtree. A violation may be a grandchild even when every parent and child look ordered.
- **Required technique:** call \`buildTree(values)\`, then carry an exclusive lower bound and upper bound into each subtree. A null child is valid. A node outside \`(low, high)\` is not. Checking only the two children is not enough.
- **Complexity:** O(n) time and O(h) call-stack space.
- **Do not:** sort the encoding. Level order is not sorted order, and sorting would hide the tree shape.

\`isValidBst([2, 1, 3])\` is \`true\`. \`isValidBst([5, 1, 4, null, null, 3, 6])\` is \`false\`.
  `.trim(),
  starterCode: treeStarter(
    "export function isValidBst(values: Array<number | null>): boolean",
    "  return false;",
  ),
  tests: [
    {
      name: "a small valid tree",
      args: [[2, 1, 3]],
      expected: true,
      public: true,
    },
    {
      name: "a right child is too small",
      args: [[5, 1, 4, null, null, 3, 6]],
      expected: false,
      public: true,
    },
    {
      name: "empty",
      args: [[]],
      expected: true,
      public: false,
    },
    {
      name: "single node",
      args: [[1]],
      expected: true,
      public: false,
    },
    {
      name: "a grandchild breaks an ancestor bound",
      args: [[5, 4, 6, null, null, 3, 7]],
      expected: false,
      public: false,
    },
    {
      name: "a value in the right subtree is below the root",
      args: [[10, 5, 15, null, null, 6, 20]],
      expected: false,
      public: true,
    },
    {
      name: "a valid left spine",
      args: [[3, 2, null, 1]],
      expected: true,
      public: false,
    },
    {
      name: "a valid right spine",
      args: [[1, null, 2, null, 3]],
      expected: true,
      public: false,
    },
    {
      name: "equal left child",
      args: [[2, 2, 3]],
      expected: false,
      public: false,
    },
    {
      name: "equal right child",
      args: [[2, 1, 2]],
      expected: false,
      public: false,
    },
    {
      name: "negative values can still be ordered",
      args: [[-10, null, -3]],
      expected: true,
      public: false,
    },
    {
      name: "a deeper valid tree",
      args: [[8, 3, 10, 1, 6, null, 14, null, null, 4, 7]],
      expected: true,
      public: false,
    },
  ],
};

const heapPush: SeedProblem = {
  id: "heap-push",
  title: "Push into a min-heap array",
  topic: "Heaps",
  difficulty: "medium",
  functionName: "pushMinHeap",
  disallow: [".sort(", ".toSorted("],
  immutableArgs: [0],
  distinctArrayReturnFromArg: 0,
  promptMd: `
Implement \`pushMinHeap(heap, value)\`.

- **Input:** \`heap\` is a 0-based min-heap array of finite numbers: every parent is less than or equal to each child. For index \`i > 0\`, the parent is \`Math.floor((i - 1) / 2)\`. \`value\` is a finite number to insert.
- **Output:** return a new min-heap array that contains every original value plus \`value\`.
- **Canonical order:** copy \`heap\`, append \`value\`, then sift that index up. While the index is not the root and its value is **strictly less** than its parent, swap with the parent. Stop when the parent is less than or equal to the value. Equal values do not swap. The tests expect this exact array, not another valid min-heap.
- **Edge cases:** pushing into \`[]\` returns \`[value]\`. A value that is already in heap order stays at the end. A new minimum sifts all the way to index 0. Negatives compare numerically.
- **Complexity:** O(log n) time. The returned array uses O(n) space, and the sift uses O(1) extra memory besides that copy.
- **Do not:** mutate \`heap\`, sort the array, or rebuild the heap from scratch.

\`pushMinHeap([1, 3, 5], 2)\` returns \`[1, 2, 5, 3]\`.
  `.trim(),
  starterCode: `export function pushMinHeap(heap: number[], value: number): number[] {
  return [];
}
`,
  tests: [
    {
      name: "sift up one level",
      args: [[1, 3, 5], 2],
      expected: [1, 2, 5, 3],
      public: true,
    },
    {
      name: "empty heap",
      args: [[], 4],
      expected: [4],
      public: true,
    },
    {
      name: "new minimum becomes the root",
      args: [[1], 0],
      expected: [0, 1],
      public: false,
    },
    {
      name: "already in order",
      args: [[1, 3, 5], 7],
      expected: [1, 3, 5, 7],
      public: true,
    },
    {
      name: "an equal value does not pass its parent",
      args: [[2, 4, 6], 2],
      expected: [2, 2, 6, 4],
      public: false,
    },
    {
      name: "equal values stay where they were appended",
      args: [[1, 1], 1],
      expected: [1, 1, 1],
      public: false,
    },
    {
      name: "sift through the root",
      args: [[1, 3, 5, 7, 4], 0],
      expected: [0, 3, 1, 7, 4, 5],
      public: false,
    },
    {
      name: "negative minimum",
      args: [[-1, 0, 2], -3],
      expected: [-3, -1, 2, 0],
      public: false,
    },
    {
      name: "swap along the right side",
      args: [[5, 8, 6, 9], 4],
      expected: [4, 5, 6, 9, 8],
      public: false,
    },
  ],
};

export const extras: Record<string, LessonExtras> = {
  complexity: { before: none, after: [countEqual] },
  arrays: { before: [reverseCopy], after: none },
  "hash-maps": { before: [hasDuplicate], after: none },
  "two-pointers": {
    before: none,
    after: [hasPairSum, removeDuplicates, maxArea],
  },
  "sliding-window": { before: none, after: [minWindowSum, rangeSum] },
  "linked-lists": { before: [listSum], after: none },
  stacks: { before: none, after: [removeAdjacent] },
  queues: { before: [recentValues], after: none },
  recursion: { before: none, after: [sumNested] },
  "binary-search": { before: none, after: [searchInsert] },
  sorting: { before: [mergeSorted], after: none },
  trees: { before: none, after: [countNodes, levelOrder] },
  "binary-search-trees": { before: none, after: [bstMin, isValidBst] },
  heaps: { before: none, after: [isMinHeap, heapPush] },
  graphs: { before: [canReach], after: none },
  greedy: { before: [canAttendAll], after: none },
  backtracking: { before: [countSubsets], after: none },
  "dynamic-programming": { before: none, after: [minCostClimb] },
  tries: { before: none, after: [hasPrefix] },
};

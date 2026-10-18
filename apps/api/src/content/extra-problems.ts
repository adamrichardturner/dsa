import type { SeedProblem } from "./types.js";
import { bstStarter, listStarter, treeStarter } from "./scaffolds.js";

export interface LessonExtras {
  readonly before: readonly SeedProblem[];
  readonly after: readonly SeedProblem[];
}

const none: readonly SeedProblem[] = [];

const countEqual: SeedProblem = {
  id: "count-equal",
  title: "Count exact matches",
  topic: "Complexity",
  difficulty: "easy",
  functionName: "countEqual",
  disallow: [],
  promptMd: `
Write \`countEqual\`. Return how many numbers in \`nums\` are equal to \`target\`.

Use one pass. An empty array returns 0.
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
  ],
};

const reverseCopy: SeedProblem = {
  id: "reverse-copy",
  title: "Reverse into a new array",
  topic: "Arrays",
  difficulty: "easy",
  functionName: "reverseCopy",
  disallow: [".reverse(", ".toReversed("],
  promptMd: `
Return a new array with the values of \`nums\` in reverse order.

Do not mutate \`nums\`. Do not call \`.reverse()\` or \`.toReversed()\`. An empty array returns an empty array.
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
  ],
};

const hasDuplicate: SeedProblem = {
  id: "has-duplicate",
  title: "Seen before",
  topic: "Hash maps",
  difficulty: "easy",
  functionName: "hasDuplicate",
  disallow: [],
  promptMd: `
Return true when any value in \`nums\` appears more than once.

One pass with a hash map is enough. An empty array returns false.
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
  ],
};

const hasPairSum: SeedProblem = {
  id: "pair-sum",
  title: "Pair that sums to a target",
  topic: "Two pointers",
  difficulty: "easy",
  functionName: "hasPairSum",
  disallow: [],
  promptMd: `
\`nums\` is sorted ascending and may contain negatives. Return true when two different indexes add up to \`target\`.

Move inward pointers. A nested loop also works, and it is the cost this lesson is trying to beat.
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
  ],
};

const minWindowSum: SeedProblem = {
  id: "min-window-sum",
  title: "Minimum window sum",
  topic: "Sliding window",
  difficulty: "easy",
  functionName: "minWindowSum",
  disallow: [],
  promptMd: `
Return the minimum sum of any contiguous block of exactly \`k\` elements.

If \`k\` is less than 1 or greater than \`nums.length\`, return 0. Reuse the previous window instead of re-summing it.
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
  ],
};

const listSum: SeedProblem = {
  id: "list-sum",
  title: "Sum a linked list",
  topic: "Linked lists",
  difficulty: "easy",
  functionName: "listSum",
  disallow: [],
  promptMd: `
\`listSum\` receives numbers. The starter builds a linked list from them. Walk the nodes and return the sum of their values.

An empty list returns 0. Sum the nodes, not a second copy of the array.
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
  ],
};

const removeAdjacent: SeedProblem = {
  id: "adjacent-duplicates",
  title: "Remove adjacent duplicates",
  topic: "Stacks",
  difficulty: "easy",
  functionName: "removeAdjacent",
  disallow: [],
  promptMd: `
Return \`value\` after repeatedly removing pairs of adjacent equal letters.

\`removeAdjacent("abbaca")\` is \`"ca"\`. A stack is a good fit: the top is the letter you just kept. An empty string stays empty.
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
  ],
};

const recentValues: SeedProblem = {
  id: "recent-values",
  title: "The last k arrivals",
  topic: "Queues",
  difficulty: "easy",
  functionName: "recentValues",
  disallow: [],
  promptMd: `
Treat \`values\` as arrivals, in order. After each arrival, keep only the most recent \`window\` values and record that snapshot.

\`recentValues([1, 2, 3, 4], 2)\` is \`[[1], [1, 2], [2, 3], [3, 4]]\`.

Enqueue the new value. When the queue is longer than the window, dequeue the oldest.
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
  ],
};

const sumNested: SeedProblem = {
  id: "sum-nested",
  title: "Sum nested numbers",
  topic: "Recursion",
  difficulty: "easy",
  functionName: "sumNested",
  disallow: [],
  promptMd: `
\`value\` is a number or an array of the same shape, nested to any depth. Return the sum of every number.

A number sums to itself. An empty array sums to 0. Each recursive call must be a smaller piece.
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
  ],
};

const searchInsert: SeedProblem = {
  id: "search-insert",
  title: "Insertion index",
  topic: "Binary search",
  difficulty: "easy",
  functionName: "searchInsert",
  disallow: [],
  promptMd: `
\`nums\` is sorted ascending and has no duplicates. Return the index of \`target\` if it is present. If it is absent, return the index where it would be inserted so the array stays sorted.

An empty array returns 0. Use binary search.
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
  ],
};

const mergeSorted: SeedProblem = {
  id: "merge-sorted",
  title: "Merge two sorted arrays",
  topic: "Sorting",
  difficulty: "easy",
  functionName: "mergeSorted",
  disallow: [".sort("],
  promptMd: `
\`left\` and \`right\` are sorted ascending. Return one sorted array with every value from both.

This is the merge step on its own. Do not call \`.sort()\`. Two pointers are enough.
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
  ],
};

const countNodes: SeedProblem = {
  id: "count-nodes",
  title: "Count the nodes",
  topic: "Trees",
  difficulty: "easy",
  functionName: "countNodes",
  disallow: [],
  promptMd: `
\`values\` is a binary tree in level order. \`null\` means a missing child. Return how many nodes the tree has.

An empty list returns 0. Use \`buildTree\`, then walk every child.
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
  ],
};

const bstMin: SeedProblem = {
  id: "bst-min",
  title: "Minimum in a binary search tree",
  topic: "Binary search trees",
  difficulty: "easy",
  functionName: "bstMin",
  disallow: [".includes", "Math.min", ".sort("],
  promptMd: `
Insert every value of \`values\`, in order, into a binary search tree. Return the minimum value stored in the tree.

An empty list returns \`null\`. Walk left until the left child is missing. Do not scan the array with \`Math.min\`, \`sort\`, or \`includes\`.
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
  ],
};

const isMinHeap: SeedProblem = {
  id: "is-min-heap",
  title: "Is this a min-heap?",
  topic: "Heaps",
  difficulty: "easy",
  functionName: "isMinHeap",
  disallow: [],
  promptMd: `
\`nums\` is a complete binary tree stored in an array. Return true when every parent is less than or equal to its children.

An empty array is a min-heap. Compare each index with its parent, \`Math.floor((i - 1) / 2)\`.
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
  ],
};

const canReach: SeedProblem = {
  id: "can-reach",
  title: "Can you reach it?",
  topic: "Graphs",
  difficulty: "easy",
  functionName: "canReach",
  disallow: [],
  promptMd: `
\`edges\` is a list of undirected edges \`[from, to]\`. Return true when \`end\` is reachable from \`start\`, including the case \`start === end\`.

Mark vertices you have already queued, or a cycle will loop forever.
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
  ],
};

const canAttendAll: SeedProblem = {
  id: "can-attend-all",
  title: "Can one person attend all?",
  topic: "Greedy",
  difficulty: "easy",
  functionName: "canAttendAll",
  disallow: [],
  promptMd: `
Each interval is \`[start, end)\` and does not include \`end\`. Return true when one person can attend every interval.

Touching is allowed: \`[1, 2]\` and \`[2, 4]\` do not overlap. An empty list returns true.
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
  ],
};

const countSubsets: SeedProblem = {
  id: "count-subsets",
  title: "How many subsets?",
  topic: "Backtracking",
  difficulty: "easy",
  functionName: "countSubsets",
  disallow: [],
  promptMd: `
Return how many subsets \`nums\` has, including the empty subset.

\`nums\` contains distinct numbers. \`[1, 2]\` has 4 subsets. An empty list has 1 subset, the empty one.

Choose, explore, then undo. A formula that returns a power of two also passes, and the next exercise asks you to list them.
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
  ],
};

const minCostClimb: SeedProblem = {
  id: "min-cost-climb",
  title: "Minimum cost to climb",
  topic: "Dynamic programming",
  difficulty: "medium",
  functionName: "minCostClimb",
  disallow: [],
  promptMd: `
\`cost[i]\` is the cost of stepping on stair \`i\`. After you pay it, you may climb 1 or 2 stairs. You may start at stair 0 or stair 1. Return the minimum cost to reach the top, which is just past the last stair.

\`minCostClimb([10, 15, 20])\` is 15. Write the recurrence, then fill it from the bottom or cache it.
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
  ],
};

const hasPrefix: SeedProblem = {
  id: "has-prefix",
  title: "Prefix lookup",
  topic: "Tries",
  difficulty: "medium",
  functionName: "hasPrefix",
  disallow: ["new Set", "new Map"],
  promptMd: `
Insert every string in \`words\` into a trie. Then, for each query, return whether that query is a prefix of some inserted word, or an inserted word itself.

\`hasPrefix(["cat", "car"], ["ca", "cab", "cat"])\` is \`[true, false, true]\`.

An empty query is true when at least one word was inserted. Build a trie of characters. Do not use \`Set\` or \`Map\`.
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
  ],
};

export const extras: Record<string, LessonExtras> = {
  complexity: { before: none, after: [countEqual] },
  arrays: { before: [reverseCopy], after: none },
  "hash-maps": { before: [hasDuplicate], after: none },
  "two-pointers": { before: none, after: [hasPairSum] },
  "sliding-window": { before: none, after: [minWindowSum] },
  "linked-lists": { before: [listSum], after: none },
  stacks: { before: none, after: [removeAdjacent] },
  queues: { before: [recentValues], after: none },
  recursion: { before: none, after: [sumNested] },
  "binary-search": { before: none, after: [searchInsert] },
  sorting: { before: [mergeSorted], after: none },
  trees: { before: none, after: [countNodes] },
  "binary-search-trees": { before: none, after: [bstMin] },
  heaps: { before: none, after: [isMinHeap] },
  graphs: { before: [canReach], after: none },
  greedy: { before: [canAttendAll], after: none },
  backtracking: { before: [countSubsets], after: none },
  "dynamic-programming": { before: none, after: [minCostClimb] },
  tries: { before: none, after: [hasPrefix] },
};

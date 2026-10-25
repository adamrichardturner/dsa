import type { SeedModule } from "./types.js";
import { bitesize } from "./bitesize.js";
import { reading } from "./reading.js";

const treeStarter = `class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(
    value: number,
    left: TreeNode | null = null,
    right: TreeNode | null = null,
  ) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function buildTree(values: Array<number | null>): TreeNode | null {
  const first = values[0];
  if (first === undefined || first === null) {
    return null;
  }

  const root = new TreeNode(first);
  const queue: TreeNode[] = [root];
  let index = 1;

  while (queue.length > 0 && index < values.length) {
    const node = queue.shift();
    if (node === undefined) {
      return root;
    }

    const leftValue = values[index];
    index += 1;
    if (leftValue !== undefined && leftValue !== null) {
      node.left = new TreeNode(leftValue);
      queue.push(node.left);
    }

    const rightValue = values[index];
    index += 1;
    if (rightValue !== undefined && rightValue !== null) {
      node.right = new TreeNode(rightValue);
      queue.push(node.right);
    }
  }

  return root;
}

export function maxDepth(values: Array<number | null>): number {
  const root = buildTree(values);
  return 0;
}
`;

const bstStarter = `class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(
    value: number,
    left: TreeNode | null = null,
    right: TreeNode | null = null,
  ) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

export function bstContains(values: number[], target: number): boolean {
  return false;
}
`;

export const week3: SeedModule = {
  id: "trees-and-graphs",
  title: "Trees and graphs",
  summary: "Hierarchical data, a priority queue, and the first graph searches.",
  weekNumber: 3,
  lessons: [
    {
      id: "trees",
      slug: "trees",
      title: "Trees",
      summary: "A root, children, and a depth you can compute by recursion.",
      estimatedMinutes: 40,
      bitesizeMd: bitesize.trees,
      contentMd: reading.trees,
      problems: [
        {
          id: "max-depth",
          title: "Maximum depth",
          topic: "Trees",
          difficulty: "easy",
          functionName: "maxDepth",
          disallow: [],
          promptMd: `
Implement \`maxDepth(values)\` for the binary tree encoded by \`values\`.

**Input**

- \`values\` is a valid level-order representation of a binary tree.
- Each number is a node value. \`null\` marks a missing child.
- Node values may be zero or negative; they do not affect the depth.

**Output and requirements**

1. Call the provided \`buildTree(values)\` helper to obtain the root.
2. Use a recursive depth-first traversal.
3. Return the number of **nodes** on the longest root-to-leaf path.
4. Return \`0\` for an empty tree and \`1\` for a tree containing only its root.

For example, \`[3, 9, 20, null, null, 15, 7]\` has depth \`3\`.

**Complexity**

Visit each node once: \`O(n)\` time and \`O(h)\` call-stack space, where \`h\` is the tree depth.

**Do not** derive an answer from \`values.length\`, count the non-null entries, or use array-index logarithms.

Missing children make those shortcuts incorrect.

Do not rewrite \`buildTree\`.
          `.trim(),
          starterCode: treeStarter,
          tests: [
            {
              name: "the lesson tree",
              args: [[3, 9, 20, null, null, 15, 7]],
              expected: 3,
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
              public: true,
            },
            {
              name: "left spine",
              args: [[1, 2, null, 3]],
              expected: 3,
              public: false,
            },
            {
              name: "right spine with missing left children",
              args: [[1, null, 2, null, 3, null, 4]],
              expected: 4,
              public: false,
            },
            {
              name: "deeper branch is not the fuller branch",
              args: [[1, 2, 3, 4, null, null, 5, 6]],
              expected: 4,
              public: false,
            },
            {
              name: "zero and negative values are nodes",
              args: [[0, -1, 2, null, null, -3, null, -4]],
              expected: 4,
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "binary-search-trees",
      slug: "binary-search-trees",
      title: "Binary search trees",
      summary: "Left is smaller, right is larger, and search becomes a walk.",
      estimatedMinutes: 35,
      bitesizeMd: bitesize.binarySearchTrees,
      contentMd: reading["binary-search-trees"],
      problems: [
        {
          id: "bst-contains",
          title: "Search a binary search tree",
          topic: "Binary search trees",
          difficulty: "easy",
          functionName: "bstContains",
          disallow: [
            ".includes(",
            ".indexOf(",
            ".find(",
            ".findIndex(",
            ".some(",
            ".filter(",
            "new Set",
          ],
          promptMd: `
Implement \`bstContains(values, target)\` by building and searching a binary search tree.

**Inputs**

- \`values\` contains finite numbers in insertion order and may be empty.
- \`target\` is the number to search for.
- Values may be negative, zero, sorted, or repeated. A repeated value does not change whether that value is present.

**Output and requirements**

1. Start with an empty tree and insert every value from left to right.
2. Put smaller values in the left subtree and larger values in the right subtree. You may ignore a value equal to a node already in the tree.
3. Search from the root, choosing only the left or right child after each comparison.
4. Return \`true\` exactly when \`target\` is stored in the tree; return \`false\` for an empty tree.

**Complexity**

Each insertion and the final search take \`O(h)\` time, where \`h\` is the current tree height.

Building is \`O(nh)\` in general: \`O(n log n)\` for a balanced shape and \`O(n²)\` for a sorted input.

The tree uses \`O(n)\` space.

**Forbidden shortcuts**

Do not answer by scanning \`values\` directly or by using \`.includes\`, \`.indexOf\`, \`.find\`, \`.findIndex\`, \`.some\`, \`.filter\`, or \`Set\`.

The purpose is to practise BST insertion and its comparison-guided search.
          `.trim(),
          starterCode: bstStarter,
          tests: [
            {
              name: "present",
              args: [[8, 3, 10, 1, 6], 6],
              expected: true,
              public: true,
            },
            {
              name: "absent",
              args: [[8, 3, 10, 1, 6], 7],
              expected: false,
              public: true,
            },
            {
              name: "root",
              args: [[4, 2, 6], 4],
              expected: true,
              public: false,
            },
            {
              name: "empty tree",
              args: [[], 1],
              expected: false,
              public: false,
            },
            {
              name: "negative target in a mixed tree",
              args: [[0, -5, 8, -9, -2, 4, 12], -2],
              expected: true,
              public: false,
            },
            {
              name: "missing value between two nodes",
              args: [[0, -5, 8, -9, -2, 4, 12], 6],
              expected: false,
              public: false,
            },
            {
              name: "sorted input creates a right spine",
              args: [[-3, -1, 0, 2, 4, 7], 7],
              expected: true,
              public: false,
            },
            {
              name: "duplicates do not hide membership",
              args: [[5, 3, 7, 3, 5, 7], 3],
              expected: true,
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "heaps",
      slug: "heaps",
      title: "Heaps",
      summary:
        "A complete tree in an array, useful when you only need the extreme value.",
      estimatedMinutes: 40,
      bitesizeMd: bitesize.heaps,
      contentMd: reading.heaps,
      problems: [
        {
          id: "kth-largest",
          title: "Kth largest",
          topic: "Heaps",
          difficulty: "medium",
          functionName: "kthLargest",
          disallow: [".sort(", ".toSorted("],
          promptMd: `
Implement \`kthLargest(nums, k)\`.

**Inputs**

- \`nums\` is a non-empty array of finite numbers.
- \`k\` is an integer from \`1\` through \`nums.length\`, inclusive.

**Output and requirements**

1. Return the value that would appear at position \`k\` if the values were ordered from largest to smallest.
2. Count duplicate occurrences separately. For example, the second largest value in \`[4, 4, 1]\` is \`4\`.
3. Handle negative values and multi-digit values correctly.

\`kthLargest([3, 2, 1, 5, 6, 4], 2)\` returns \`5\`.

**Algorithm and complexity**

Use a size-\`k\` min-heap: push each value and remove the minimum whenever the heap grows beyond \`k\`.

This takes \`O(n log k)\` time and \`O(k)\` space.

**Avoid incorrect shortcuts**

Do not remove duplicates with a \`Set\`, and do not sort the input or a copy.

The runner rejects \`.sort()\` and \`.toSorted()\` because this lesson specifically assesses the heap.
          `.trim(),
          starterCode: `export function kthLargest(nums: number[], k: number): number {
  return 0;
}
`,
          tests: [
            {
              name: "second largest",
              args: [[3, 2, 1, 5, 6, 4], 2],
              expected: 5,
              public: true,
            },
            {
              name: "the largest",
              args: [[3, 2, 1], 1],
              expected: 3,
              public: true,
            },
            {
              name: "duplicates",
              args: [[2, 2], 2],
              expected: 2,
              public: false,
            },
            {
              name: "smallest of the set",
              args: [[7, 1, 4], 3],
              expected: 1,
              public: false,
            },
            {
              name: "duplicates straddle kth position",
              args: [[9, 7, 7, 7, 3], 3],
              expected: 7,
              public: false,
            },
            {
              name: "negative values",
              args: [[-10, -3, -7, -1], 2],
              expected: -3,
              public: false,
            },
            {
              name: "numeric rather than lexicographic order",
              args: [[2, 10, 100, 21], 2],
              expected: 21,
              public: false,
            },
            {
              name: "mixed signs and repeated maximum",
              args: [[0, -1, 5, 5, 2, -10], 2],
              expected: 5,
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "graphs",
      slug: "graphs",
      title: "Graphs and breadth-first search",
      summary:
        "Vertices, edges, and breadth-first search for the shortest path.",
      estimatedMinutes: 45,
      bitesizeMd: bitesize.graphs,
      contentMd: reading.graphs,
      problems: [
        {
          id: "shortest-path",
          title: "Shortest path",
          topic: "Graphs",
          difficulty: "medium",
          functionName: "shortestPath",
          disallow: [],
          promptMd: `
Implement \`shortestPath(edges, start, end)\` for an unweighted, undirected graph.

**Inputs**

- Each item in \`edges\` is a pair \`[from, to]\` of integer vertex ids.
- Every edge works in both directions.
- Vertex ids need not be consecutive and may be negative.
- The graph may contain cycles, duplicate edges, self-loops, and disconnected components.

**Output and requirements**

1. Return the minimum number of edges needed to travel from \`start\` to \`end\`.
2. Return \`0\` when \`start === end\`, even when that vertex is not in \`edges\`.
3. Return \`-1\` when \`end\` is unreachable.
4. Build an adjacency list, then use breadth-first search (BFS).
5. Track visited vertices and mark each vertex when it is enqueued so cycles and duplicate edges do not cause repeated work.

**Complexity**

Run in \`O(V + E)\` time and use \`O(V + E)\` space for the adjacency list, queue, and visited state.

**Forbidden shortcuts**

Do not use depth-first search and return the first path it finds; that path is not necessarily shortest.

Do not generate every possible path.

This is an unweighted shortest-path exercise, so BFS is the required technique.
          `.trim(),
          starterCode: `export function shortestPath(
  edges: number[][],
  start: number,
  end: number,
): number {
  return -1;
}
`,
          tests: [
            {
              name: "a shortcut",
              args: [
                [
                  [0, 1],
                  [1, 2],
                  [0, 2],
                ],
                0,
                2,
              ],
              expected: 1,
              public: true,
            },
            {
              name: "disconnected",
              args: [[[0, 1]], 0, 2],
              expected: -1,
              public: true,
            },
            {
              name: "same vertex",
              args: [[[0, 1]], 1, 1],
              expected: 0,
              public: false,
            },
            {
              name: "a line",
              args: [
                [
                  [0, 1],
                  [1, 2],
                  [2, 3],
                ],
                0,
                3,
              ],
              expected: 3,
              public: false,
            },
            {
              name: "chooses a shorter path discovered later in the edge list",
              args: [
                [
                  [0, 1],
                  [1, 2],
                  [2, 5],
                  [0, 3],
                  [3, 5],
                ],
                0,
                5,
              ],
              expected: 2,
              public: false,
            },
            {
              name: "edges can be traversed in reverse",
              args: [
                [
                  [1, 2],
                  [2, 3],
                ],
                3,
                1,
              ],
              expected: 2,
              public: false,
            },
            {
              name: "cycle does not trap the search",
              args: [
                [
                  [0, 1],
                  [1, 2],
                  [2, 0],
                  [2, 3],
                  [3, 4],
                ],
                0,
                4,
              ],
              expected: 3,
              public: false,
            },
            {
              name: "nonconsecutive and negative vertex ids",
              args: [
                [
                  [-10, 4],
                  [4, 99],
                  [99, 500],
                ],
                -10,
                500,
              ],
              expected: 3,
              public: false,
            },
            {
              name: "duplicate edges and self-loops",
              args: [
                [
                  [0, 0],
                  [0, 1],
                  [0, 1],
                  [1, 2],
                  [2, 2],
                ],
                0,
                2,
              ],
              expected: 2,
              public: false,
            },
          ],
        },
      ],
    },
  ],
};

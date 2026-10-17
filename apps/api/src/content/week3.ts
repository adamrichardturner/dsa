import type { SeedModule } from "./types.js";

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
      contentMd: `
A tree is a set of nodes with one **root** and no cycles. Each node has zero or more children. A node with no children is a leaf. A **binary** tree gives each node at most two children, usually called left and right.

Depth of a node is how many edges it sits below the root. The depth of the tree is the depth of its deepest leaf. An empty tree has depth 0. A single node has depth 1. People also say "height" for a closely related count; in this course, depth means the number of nodes on the longest path from the root down.

The recursive definition is the algorithm:

- an empty tree has depth 0
- otherwise the depth is 1 plus the larger of the two children's depths

That is a depth-first walk. The call stack visits a whole branch before the other branch.

Level order, visiting every node at depth 1, then depth 2, and so on, is a queue. The starter's \`buildTree\` already does that. The input is written level by level, with \`null\` where a child is missing.

\`[3, 9, 20, null, null, 15, 7]\` is a root 3, a left child 9, a right child 20, and 20's children 15 and 7. The depth is 3.

You do not need to rewrite the builder. Use the tree it returns.
      `.trim(),
      problems: [
        {
          id: "max-depth",
          title: "Maximum depth",
          topic: "Trees",
          difficulty: "easy",
          functionName: "maxDepth",
          disallow: [],
          promptMd: `
\`values\` is a binary tree written in level order. \`null\` means a missing child. Return the number of nodes on the longest path from the root down.

An empty list has depth 0. A single node has depth 1. Use the \`buildTree\` helper already in the file.
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
              public: false,
            },
            {
              name: "left spine",
              args: [[1, 2, null, 3]],
              expected: 3,
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
      contentMd: `
A binary search tree adds one rule to a binary tree. Every value in the left subtree is smaller than the node, and every value in the right subtree is larger. Duplicates are a policy decision. This lesson does not insert them.

Search starts at the root. If the target is smaller, go left. If it is larger, go right. If you hit \`null\`, it is absent. The walk is O(h), where h is the height. A balanced tree has height about log n. Inserting sorted values in order produces a straight line, and search falls back to O(n). The tree did not save you.

Balanced trees (AVL, red-black) rotate nodes to keep the height small. JavaScript engines and databases use them. You do not need to implement a rotation this month. You do need to notice when a tree has degenerated into a list.

Insert uses the same walk. Empty spot on the correct side is where the new node goes.

The exercise inserts every value, in order, then searches. Building the tree is part of the work. Scanning the original array with \`.includes\` misses the point, and the runner rejects it.
      `.trim(),
      problems: [
        {
          id: "bst-contains",
          title: "Search a binary search tree",
          topic: "Binary search trees",
          difficulty: "easy",
          functionName: "bstContains",
          disallow: [".includes(", ".indexOf(", "new Set"],
          promptMd: `
Insert \`values\` from left to right into an empty binary search tree. Smaller values go left, larger values go right. Then return whether \`target\` is in the tree.

Do not scan the array directly.
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
          ],
        },
      ],
    },
    {
      id: "heaps",
      slug: "heaps",
      title: "Heaps",
      summary: "A complete tree in an array, useful when you only need the extreme value.",
      estimatedMinutes: 40,
      contentMd: `
A heap is a complete binary tree that keeps the smallest value (a min-heap) or the largest (a max-heap) at the root. **Complete** means every level is full except possibly the last, which is filled from the left. That shape lets you store the tree in an array with no pointers.

For a node at index \`i\`:

- the parent is \`Math.floor((i - 1) / 2)\`
- the left child is \`2 * i + 1\`
- the right child is \`2 * i + 2\`

Insert writes the new value at the end, then swaps it upward while it is smaller than its parent. Remove-min saves the root, moves the last value to the root, and swaps it downward with the smaller child until the order is restored. Both are O(log n).

You reach for a heap when you repeatedly need the current minimum or maximum, not the fully sorted list. "The kth largest element" is the textbook case. Keep a min-heap of size k. For each number, push it, and if the heap now holds more than k values, pop the smallest. The root is the kth largest, because k values are at least that large and you threw away the smaller ones.

Sorting the whole array and indexing from the end is also correct, and it is O(n log n). The heap does less ordering. Either solution passes the tests. If you want the practice, write the heap. A binary heap of numbers in an array is about thirty lines.
      `.trim(),
      problems: [
        {
          id: "kth-largest",
          title: "Kth largest",
          topic: "Heaps",
          difficulty: "medium",
          functionName: "kthLargest",
          disallow: [],
          promptMd: `
Return the kth largest value in \`nums\`. \`k\` is at least 1 and at most \`nums.length\`.

\`kthLargest([3, 2, 1, 5, 6, 4], 2)\` is \`5\`. Duplicates count separately: the second largest of \`[2, 2]\` is \`2\`.
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
          ],
        },
      ],
    },
    {
      id: "graphs",
      slug: "graphs",
      title: "Graphs",
      summary: "Vertices, edges, and breadth-first search for the shortest path.",
      estimatedMinutes: 45,
      contentMd: `
A graph is a set of vertices and a set of edges between them. This lesson uses undirected edges: if you can walk from 0 to 1, you can walk from 1 to 0. A tree is a graph with no cycles. A general graph may have cycles, so a search has to remember where it has already been or it will loop forever.

Store an **adjacency list**: an object whose keys are vertex ids and whose values are the neighbouring ids. Building it is one pass over the edge list.

**Breadth-first search** uses the queue from week two. Start at the source, then visit neighbours, then neighbours of neighbours. The first time you reach the target, you got there in the fewest edges. That is only true when every edge has the same cost. Weighted shortest paths need Dijkstra, which is a heap plus this same walk. One step further than this course goes.

Keep a distance for each vertex, or carry the distance in the queue alongside the vertex. Mark a vertex when you first enqueue it, not when you dequeue it, or the same neighbour gets queued many times.

**Depth-first search** uses a stack, or recursion, and dives down one branch. It answers "can I get there?" and "which vertices are in this component?" It does not answer "what is the shortest path?" Use BFS for this exercise.

If the target is never reached, return \`-1\`. The distance from a vertex to itself is 0.
      `.trim(),
      problems: [
        {
          id: "shortest-path",
          title: "Shortest path",
          topic: "Graphs",
          difficulty: "medium",
          functionName: "shortestPath",
          disallow: [],
          promptMd: `
\`edges\` is a list of undirected edges \`[from, to]\` between integer vertices. Return the number of edges on the shortest path from \`start\` to \`end\`.

Return 0 when \`start === end\`. Return \`-1\` when no path exists.
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
          ],
        },
      ],
    },
  ],
};

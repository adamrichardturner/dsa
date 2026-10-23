import { defineArticle, type Article } from "./types";

export const treeTraversalArticles: readonly Article[] = [
  defineArticle(
    "tree-traversals",
    "How Do Preorder, Inorder, and Postorder Traverse a Tree?",
    "Trees and graphs",
    "Depth-first tree traversals differ only in when they visit the current node: preorder before both children, inorder between them, and postorder after them. Inorder lists a binary search tree in sorted order.",
    ["tree traversal", "preorder", "inorder", "postorder"],
    `
A traversal visits every node exactly once in a deliberate order. For a binary node, depth-first traversal has three moments available: before the left subtree, between the two subtrees, and after the right subtree. Visiting at those moments gives preorder, inorder, and postorder. Level order is the breadth-first alternative: it visits by increasing edge-counted node depth from the root.

The course measures a tree's height/depth in nodes: empty is 0 and a leaf is 1. Traversal names do not change that convention. When this article says a node is at distance \`d\`, however, it means \`d\` edges from the root; the root's node depth is 0 and its course level is 1.

\`\`\`mermaid
flowchart TD
  a["A"] --> b["B"]
  a --> c["C"]
  b --> d["D"]
  b --> e["E"]
\`\`\`

For this tree:

- preorder is \`A, B, D, E, C\`;
- inorder is \`D, B, E, A, C\`;
- postorder is \`D, E, B, C, A\`;
- level order is \`A, B, C, D, E\`.

## One recursive skeleton

The recursive calls do not move. Only the visit moves.

\`\`\`mermaid
flowchart LR
  pre["Preorder<br/>visit, left, right"] --> ino["Inorder<br/>left, visit, right"]
  ino --> post["Postorder<br/>left, right, visit"]
\`\`\`

\`\`\`ts
type TreeNode = {
  readonly value: string;
  readonly left: TreeNode | null;
  readonly right: TreeNode | null;
};

const preorder = (node: TreeNode | null, output: string[]): void => {
  if (node === null) {
    return;
  }

  output.push(node.value);
  preorder(node.left, output);
  preorder(node.right, output);
};

const inorder = (node: TreeNode | null, output: string[]): void => {
  if (node === null) {
    return;
  }

  inorder(node.left, output);
  output.push(node.value);
  inorder(node.right, output);
};

const postorder = (node: TreeNode | null, output: string[]): void => {
  if (node === null) {
    return;
  }

  postorder(node.left, output);
  postorder(node.right, output);
  output.push(node.value);
};

const levelOrder = (root: TreeNode | null): string[] => {
  if (root === null) {
    return [];
  }

  const queue: TreeNode[] = [root];
  const output: string[] = [];
  let front = 0;

  while (front < queue.length) {
    const node = queue[front];
    front += 1;
    if (node === undefined) {
      continue;
    }

    output.push(node.value);
    if (node.left !== null) {
      queue.push(node.left);
    }
    if (node.right !== null) {
      queue.push(node.right);
    }
  }

  return output;
};

const tree: TreeNode = {
  value: "A",
  left: {
    value: "B",
    left: { value: "D", left: null, right: null },
    right: { value: "E", left: null, right: null },
  },
  right: { value: "C", left: null, right: null },
};

const pre: string[] = [];
const inside: string[] = [];
const post: string[] = [];
preorder(tree, pre);
inorder(tree, inside);
postorder(tree, post);

console.log(pre.join(" "));
console.log(inside.join(" "));
console.log(post.join(" "));
console.log(levelOrder(tree).join(" "));
\`\`\`

Expected output:

\`\`\`text
A B D E C
D B E A C
D E B C A
A B C D E
\`\`\`

The invariant for each function is: after it returns, \`output\` has gained exactly the nodes in that subtree, in the named order. Null adds nothing. A real node combines one visit with two smaller traversals, which proves that every node appears once.

For level order, the loop invariant is different: entries before \`front\` have been processed, and entries from \`front\` onward are discovered but not processed, in nondecreasing node depth. Children are appended after all vertices already waiting, so one level cannot jump ahead of an earlier one. The moving front index avoids the O(n) element shifting caused by repeated \`Array.shift()\`.

## Why each order exists

Preorder handles a parent before its descendants. It suits copying a tree, serialising a shape with explicit null markers, and producing prefix notation for an expression tree. Inorder places a binary-search-tree node between all smaller and all larger values, so it emits sorted order when the BST invariant holds. Postorder handles children before their parent. It suits deleting a tree, computing directory sizes, and evaluating an expression after both operands.

\`\`\`mermaid
flowchart TD
  need{"When must the parent be handled?"}
  need -->|"Before children"| p["Preorder"]
  need -->|"Between binary subtrees"| i["Inorder"]
  need -->|"After children"| o["Postorder"]
  need -->|"By distance from root"| l["Level order / BFS"]
\`\`\`

Traversal order does not repair an invalid BST. Inorder is sorted *because* every left-subtree value is smaller and every right-subtree value is larger. A sorted inorder result is useful evidence, but duplicate policy and comparison rules still need to be stated.

## Complexity

All four traversals take O(n) time because every node is processed once. Recursive depth-first traversal uses O(h) call-stack space, where h is the tree height: O(log n) for a balanced tree and O(n) for a spine. Level order uses O(w) queue space, where w is the maximum number of nodes on one level; a wide complete tree can make w proportional to n.

| Traversal | Work | Auxiliary space | Typical use |
| --- | --- | --- | --- |
| Preorder | O(n) | O(h) | parent before descendants |
| Inorder | O(n) | O(h) | sorted BST values |
| Postorder | O(n) | O(h) | combine or delete children first |
| Level order | O(n) | O(w) | levels and unweighted depth |

An iterative depth-first traversal replaces call frames with an explicit stack. It avoids call-stack overflow but does not improve the worst-case O(h) memory bound. Here \`h\` is the course's node-counted height; changing to edge-counted height shifts non-empty values by one but does not change the asymptotic bound. Iterative postorder needs extra state—such as a last-visited node or a pair containing a node and an “expanded” flag—because the parent must wait for both children.

## Edge cases and pitfalls

An empty tree produces an empty sequence. A single node produces the same one-item sequence in every order. A one-sided tree can make recursion overflow even though the algorithm is linear. Pushing the right child before the left child is necessary in iterative preorder when the stack pops from the end; otherwise the visible order is reversed.

Do not call a traversal “inorder” on a general node with an arbitrary number of children without defining where the parent visit belongs. Preorder and postorder generalise naturally to many children; binary inorder depends on having a distinguished left and right.

## Related

- [What Is a Tree? Roots, Leaves, and Depth in Nodes](/articles/trees)
- [What Is a Binary Search Tree? Left Smaller, Right Larger](/articles/binary-search-trees)
- [How Does Depth-First Search Explore One Branch First?](/articles/depth-first-search)
    `,
  ),
];

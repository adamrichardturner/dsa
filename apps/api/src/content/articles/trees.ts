import { defineArticle, type Article } from "./types";

export const treeArticles: readonly Article[] = [
  defineArticle(
    "trees",
    "What Is a Tree? Roots, Leaves, and Depth in Nodes",
    "Trees and graphs",
    "A tree is a connected, acyclic hierarchy with one root and one parent per non-root node. This course's maxDepth counts nodes on the longest root-to-leaf path: an empty tree is 0 and a single node is 1.",
    ["tree", "trees", "leaf", "root"],
    `
A tree is a connected hierarchy with one root. Every other node has exactly one parent, and following child links can never lead back to an ancestor. Those properties give exactly one path from the root to each node. A node with no children is a leaf. A binary tree allows at most two children per node, conventionally named left and right.

Terminology varies, so fix the convention before calculating. In many textbooks, a node's **depth** is the number of edges from the root, while a node's **height** is the number of edges on its longest path to a leaf. This course's tree-wide \`maxDepth\` uses a different but common node-count convention: an empty tree has height/depth 0, a leaf has height 1, and the answer is the number of nodes on a longest root-to-leaf path. Under that convention, the drawing has maximum depth 3 because a longest path is 8, 3, 1.

Keep node depth separate when edges matter. Root 8 has edge-counted node depth 0, nodes 3 and 10 have node depth 1, and the leaves below 3 have node depth 2. Their course levels are 1, 2, and 3 respectively. Thus \`level = edge-counted node depth + 1\` for a non-empty tree.

\`\`\`mermaid
flowchart TD
  n8["8"] --> n3["3"]
  n8 --> n10["10"]
  n3 --> n1["1"]
  n3 --> n6["6"]
\`\`\`

\`\`\`mermaid
flowchart LR
  root["8 (level 1)"] --> left["3 (level 2)"]
  root --> right["10 (level 2)"]
  left --> leaf1["1 (level 3)"]
  left --> leaf6["6 (level 3)"]
  longest["Longest root-to-leaf path"] -.-> root
  longest -.-> left
  longest -.-> leaf1
\`\`\`

## How it works

You start at the root. A binary node holds a value, a left link, and a right link, and either link can be null. One path runs from the root to each node. Nothing points back at an ancestor, so the walk cannot cycle the way a graph search can.

The course's maximum depth counts nodes on the longest path down. An empty tree is 0. A single node is 1. A textbook using edge-counted height gives that single node height 0, so its non-empty answers are one lower. Neither convention is universally wrong; mixing conventions inside one implementation is wrong. Here, use the node count.

A missing node returns 0. A real node returns 1 plus the larger of the children's depths. The 1 is the node you are on. You keep the larger child, because depth is one path, not the sum of both sides. Pass 0 for a missing child.

\`\`\`mermaid
flowchart TD
  visit["depth(node)"] --> missing{"Is node null?"}
  missing -->|yes| zero["Return 0"]
  missing -->|no| left["Compute depth(left)"]
  left --> right["Compute depth(right)"]
  right --> combine["Return 1 + max(left, right)"]
\`\`\`

\`\`\`ts
type TreeNode = {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

const maxDepth = (node: TreeNode | null): number => {
  if (node === null) {
    return 0;
  }

  const leftDepth = maxDepth(node.left);
  const rightDepth = maxDepth(node.right);
  return 1 + Math.max(leftDepth, rightDepth);
};

const tree: TreeNode = {
  value: 8,
  left: {
    value: 3,
    left: { value: 1, left: null, right: null },
    right: { value: 6, left: null, right: null },
  },
  right: { value: 10, left: null, right: null },
};

console.log(maxDepth(tree));
console.log(maxDepth(null));
\`\`\`

The example prints \`3\` and then \`0\`. Its return-value invariant is: \`maxDepth(node)\` equals the number of real nodes on the longest path beginning at \`node\`. The null case establishes 0; the recursive case adds the current real node to the larger child result.

That evaluation is depth-first: one branch finishes before the other starts. Visiting every node on one level before the next wants a queue, which is level order and breadth-first search. A leaf has no children. “Binary” only caps the child count; it does not order the values.

## Level-order null encoding

A level-order array describes child slots from left to right. The first entry is the root. Then, for each real node removed from a queue, consume one entry for its left-child slot and one for its right-child slot. A number creates a node and queues it for later children. \`null\` fills a slot without creating or queueing a node.

For \`[1, 2, null, 3]\`, 1 is the root, 2 is its left child, the first \`null\` says that 1 has no right child, and 3 is the left child of 2. The resulting maximum depth is 3 nodes. Null entries are holes, not vertices or levels. Trailing nulls may be omitted because no later real entry depends on them: \`[1, 2]\` and \`[1, 2, null, null, null]\` encode the same tree. An empty array encodes an empty tree; an initial \`null\`, if the input type permits it, also means there is no root.

\`\`\`mermaid
flowchart LR
  values["[1, 2, null, 3]"] --> rootSlot["root slot: 1"]
  rootSlot --> childSlots["children of 1: 2, null"]
  childSlots --> nextSlots["children of 2: 3, omitted"]
  nextSlots --> result["left spine 1 → 2 → 3"]
\`\`\`

\`\`\`mermaid
flowchart LR
  preorder["Depth-first preorder"] --> p8["8"] --> p3["3"] --> p1["1"] --> p6["6"] --> p10["10"]
  level["Breadth-first level order"] --> l8["8"] --> l3["3"] --> l10["10"] --> l1["1"] --> l6["6"]
\`\`\`

## A numeric example

Root 8 has children 3 and 10. Node 3 has children 1 and 6. Leaves 1, 6, and 10 each have depth 1. Node 3 is 1 + 1 = 2. The root takes the larger child and adds itself: 1 + 2 = 3. The longest path is the nodes 8, 3, and 1. The path 8, 3, 6 is just as long. The path 8, 10 has 2 nodes and does not lower the answer.

An empty list returns 0. The list [8] returns 1. A left spine returns the number of nodes on that spine, because each empty right child adds 0. In [3, 9, 20, null, null, 15, 7] the longest path is 3, 20, 15, so the depth is 3. Those nulls are missing children, not extra levels.

## Cost

You touch each node once, with a constant amount of work, so n nodes take O(n) time. Both children must be checked, or you might miss the longer path. Extra memory is the call stack, which tracks the height h. A bushy tree holds about log n frames. A line holds n frames and can overflow the stack even though the time is still linear.

| Shape | Time | Extra space |
| --- | --- | --- |
| n nodes, height h | O(n) | O(h) frames |
| Balanced, h near log n | O(n) | O(log n) |
| A line of n nodes | O(n) | O(n) |

The table is the depth walk. Searching for one value is a later cost, and it depends on the height.

## Practice

1. Trace \`maxDepth\` on a root whose left child is a leaf and whose right child has two more levels. Write the return value beside each node before running code.
2. Add \`minDepth\`, the number of nodes on the shortest root-to-leaf path. A node with one missing child is the important case: the missing side is not a path to a leaf.
3. Rewrite \`maxDepth\` iteratively with a queue of \`{ node, depth }\` records. Check that the recursive and iterative versions agree on empty, single-node, balanced, and skewed trees.

## In the course

\`maxDepth\` takes a level-order list and returns the node count on the longest path. The lesson tree returns 3, one node returns 1, an empty list returns 0, and [1, 2, null, 3] returns 3. Call \`buildTree\`, then use the recursive rule. The lesson list has length 7 and depth 3, so length is the wrong number. Missing returns 0. A real node returns 1 plus the deeper child. \`levelOrder\` uses the same \`buildTree\` call and a queue, emitting real nodes left to right. That walk is breadth-first order, not this depth recurrence.

## Common mistakes

Counting edges returns 0 for a single node and stays one low after that. Adding 1 at the end of an edge count still fails the empty tree, which must stay 0. Add 1 only for a node that exists.

Adding the two child depths together makes a wide tree look deep. Keep the larger one. Counting a null entry as a node counts a hole. A level-order loop can be right if each level counts as nodes and the empty root is 0, and the point of the exercise is still the recursive rule.

## When to use it

Use a tree for one start and branches that do not loop: folders, a nested expression, a reply thread. Use this depth for the longest chain of nodes downward. Use a queue to visit one level before the next. Use a binary search tree when the values are ordered and you need to know if one is present.

## When not to

A general graph with a cycle needs the seen-set from graph search, or this recursive walk may never finish. Maximum depth does not answer the minimum, the kth largest, or a full sort. The count of every node is not the maximum depth. Seven nodes in a perfect three-level tree still produce 3.

## FAQ

### Is depth the same number as height?

People use both words for a closely related count, and some books set a single node to 0. Here the depth is nodes on the longest path from the root. Empty is 0. A single node is 1.

### Why is a leaf depth 1 and a missing child depth 0?

A missing child is empty, so it contributes 0. A leaf is a real node with missing children: 1 + max(0, 0). You add 1 only when the node exists.

### Does finishing the left branch first change the depth?

One branch finishes before the other because the walk is depth-first. You keep the larger child result, so the number stays the same if you swap the order. The call stack changes. The longest path does not.

## Structural facts worth proving

For any non-empty tree with \(n\) nodes, there are exactly \(n - 1\) edges. Every node except the root has one parent edge, so counting those incoming edges proves the formula. A binary tree is **full** when every node has either zero or two children, **complete** when its last level fills from the left, and **perfect** when every internal node has two children and all leaves share a level. These words are not interchangeable: heaps need completeness, while recursive depth works for every shape.

\`\`\`mermaid
flowchart LR
  binary["Binary<br/>at most two children"] --> full["Full<br/>zero or two children"]
  binary --> complete["Complete<br/>last level fills left"]
  full --> perfect["Perfect<br/>full and equal leaf depth"]
  complete --> perfect
\`\`\`

The recursive invariant also gives a proof template for many tree algorithms: define exactly what a call returns for one subtree, establish the empty-tree result, assume the child calls satisfy the definition, then combine them for the parent. Traversal order determines *when* you combine; the invariant determines *what* the answer means.

## Related

Read the ordered tree next, then the search that also finishes one branch before the other.

- [What Is a Binary Search Tree? Left Smaller, Right Larger](/articles/binary-search-trees)
- [How Does Depth-First Search Explore One Branch First?](/articles/depth-first-search)
- [How Do Preorder, Inorder, and Postorder Traverse a Tree?](/articles/tree-traversals)

    `,
  ),
  defineArticle(
    "binary-search-trees",
    "What Is a Binary Search Tree? Left Smaller, Right Larger",
    "Trees and graphs",
    "A binary search tree keeps every value in the left subtree smaller than the node and every value in the right subtree larger. This course leaves duplicates out, and search costs the height, not automatically log n.",
    ["binary search tree"],
    `
A binary search tree (BST) is a binary tree with a global ordering invariant. For every node, every value in its entire left subtree is smaller, and every value in its entire right subtree is larger. Checking only immediate children is not enough. This course leaves duplicates out, so an equal value goes neither left nor right. The drawing is the tree after inserting 4, then 2, then 6, then 1, then 3.

\`\`\`mermaid
flowchart TD
  b4["4"] --> b2["2"]
  b4 --> b6["6"]
  b2 --> b1["1"]
  b2 --> b3["3"]
\`\`\`

\`\`\`mermaid
flowchart LR
  s4{"Compare 3 with 4"} -->|"3 < 4"| s2{"Compare 3 with 2"}
  s2 -->|"3 > 2"| s3["Match 3: true"]
\`\`\`

## How it works

Search starts at the root. A smaller target goes left. A larger target goes right. Null means absent. An equal value means present. You may drop a side only when every value in that subtree obeys the rule, not only the two children.

The time is proportional to the height: the number of nodes on the longest path down. That is about log n on a short tree, and it is not automatic. Sorted inserts send every new node down the same side, the drawing becomes a straight line, and search falls back to O(n). The comparisons stay correct. They stop saving work.

Insert uses the same walk. The empty spot on the correct side is where the new node goes. The first value becomes the root. Duplicates are a policy decision. Some trees push equals left, and some push them right. This course leaves duplicates out, so a value that is already stored is not inserted again.

\`\`\`ts
class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;

  constructor(value: number) {
    this.value = value;
  }
}

const insert = (node: TreeNode | null, value: number): TreeNode => {
  if (node === null) {
    return new TreeNode(value);
  }
  if (value < node.value) {
    node.left = insert(node.left, value);
    return node;
  }
  if (value > node.value) {
    node.right = insert(node.right, value);
  }
  return node;
};

const contains = (node: TreeNode | null, target: number): boolean => {
  if (node === null) {
    return false;
  }
  if (target === node.value) {
    return true;
  }
  if (target < node.value) {
    return contains(node.left, target);
  }
  return contains(node.right, target);
};

const values = [4, 2, 6, 1, 3, 2];
let root: TreeNode | null = null;
for (const value of values) {
  root = insert(root, value);
}

console.log(contains(root, 3), contains(root, 7));
\`\`\`

The example prints \`true false\`. The repeated 2 is ignored, so each distinct value has one node. During insertion, the returned subtree contains the old values plus the new value while preserving the ordering invariant. During search, if the target exists, it remains inside the subtree passed to \`contains\`; ordering proves that the discarded subtree cannot contain it.

The TypeScript types make every missing child explicit as \`TreeNode | null\`. Insertion mutates child links, but it also returns the subtree root, which is why the caller must write \`root = insert(root, value)\`: the first insertion replaces a null root. Search is read-only and returns as soon as it finds equality or null. Neither function uses array indexes; its progress measure is the number of nodes remaining on the chosen downward path.

A scan of the original array misses the point. The links help only when lookup follows them. Without the order rule you still have a root, leaves, and a maximum depth, but you cannot safely discard a side.

## A numeric example

Insert 4 as the root. Insert 2 on its left. Insert 6 on its right. Insert 1, which is smaller than 4 and smaller than 2, so it hangs left of 2. Insert 3, which is smaller than 4 and larger than 2, so it hangs right of 2. That is the drawing. The longest path has 3 nodes, for example 4, 2, 1.

Search for 3 goes left at 4 and right at 2, then matches. Search for 7 goes right to 6 and then into null, so 7 is absent. Absence is that null.

Insert 1, then 2, then 3, then 4 and the shape changes. 2 hangs right of 1, 3 hangs right of 2, and 4 hangs right of 3. Every left link is empty. Search for 4 compares all 4 nodes. The left-and-right rule still holds, and the cost is O(n). If 2 is already stored, leave the next 2 out. Do not place it left, and do not place it right.

\`\`\`mermaid
flowchart LR
  one["1"] --> two["2"]
  two --> three["3"]
  three --> four["4"]
\`\`\`

This skewed BST is valid but not balanced. Validity determines whether search is correct; shape determines how many comparisons it needs.

## Cost

One search or insertion follows one path, so it costs O(h), where h is the current height. Building from n input values performs n insertions: O(n log n) when the evolving shape stays balanced and O(n²) for a sorted input that forms a spine. Say O(log n) for one operation only when height is O(log n). One node per distinct value means O(n) memory in the worst case.

| Shape after n inserts | One search or insert | Build all n values |
| --- | --- | --- |
| Height O(log n) | O(log n) | O(n log n) |
| Straight line, height n | O(n) | O(n²) |
| Empty tree | O(1) | O(1) |

The first row is a balanced tree, or inserts that landed on both sides. The second row is sorted input and no repair. The search code is the same.

## Practice

1. Insert \`[8, 3, 10, 1, 6, 14, 4, 7, 13]\` by hand, then write the comparisons used to find 7 and 12.
2. Write \`smallest(node)\` by following one direction only. State why the BST invariant makes that endpoint the minimum.
3. Write a validator that carries lower and upper bounds into each subtree. Test a tree where every parent-child pair looks valid but a grandchild violates the root's bound.

## In the course

\`bstContains\` inserts \`values\` from left to right, then reports whether \`target\` is present. Smaller goes left, larger goes right, and equals stay out. [8, 3, 10, 1, 6] contains 6 and does not contain 7. [4, 2, 6] contains the root 4. An empty list does not contain 1. \`.includes\`, \`.indexOf\`, and \`new Set\` skip the walk, and the runner rejects them. Sorted input still returns the right boolean, at a cost equal to the length of the list. \`isValidBst\` checks a level-order encoding that may not have come from that insertion. Carry an exclusive lower and upper bound. [5, 4, 6, null, null, 3, 7] fails because 3 sits in the right subtree of 5, even though 3 and 6 look ordered with each other.

## Common mistakes

Pushing an equal value left or right is a different policy. On insert, equal means stop. A search written for duplicates on one side will disagree with a tree that stored one copy.

A check of only the two children can hide a larger grandchild on the left. Search then goes right and misses it. Walk all the way to a null link on insert, and the whole subtree stays ordered. A mismatch at the root means "take a child", and absent means null. Stepping to the next array index is linear search again.

## When to use it

Use a binary search tree when values arrive in mixed order and you will test membership many times. Each test is one path. The path stays short when both sides receive nodes, or when a balanced tree keeps the height honest.

## When not to

One lookup on an array you already hold can be a scan or a hash set. Sorted inserts into a plain tree are linear, not log n. The current minimum and the kth largest belong to a heap. A tree rotation is a later move, and it is not an array slide.

## FAQ

### Where do duplicate values go?

They stay out. This course leaves duplicates out. An equal value is not pushed left and not pushed right. Search returns true on the one stored copy, and insert skips the second.

### Why is search not automatically log n?

Each step drops a side, so the step count is the height. Both sides have to grow before that height is about log n. Insert 1, 2, 3, 4 in order and the height is 4, which is linear.

### What is wrong with scanning the input array?

The boolean can be right while every child link goes unused. The exercise is the walk: start at the root, smaller goes left, larger goes right, and null means absent.

## Deletion completes the data structure

Search and insertion are only two BST operations. Deletion has three structural cases. A leaf can be detached. A node with one child can be replaced by that child. A node with two children can copy the smallest value in its right subtree—the inorder successor—then delete that successor from the right subtree. The successor has no left child, so the second deletion is one of the simpler cases.

\`\`\`mermaid
flowchart TD
  remove["Delete matching node"] --> children{"How many children?"}
  children -->|"0"| leaf["Return null"]
  children -->|"1"| one["Return the only child"]
  children -->|"2"| successor["Find minimum in right subtree"]
  successor --> copy["Copy successor value"]
  copy --> deleteAgain["Delete successor on right"]
\`\`\`

The deletion invariant is the same global ordering rule, not merely valid parent-child comparisons. Finding and repairing one root-to-leaf path costs O(h). In a production tree, duplicate policy, parent links, stored metadata, and balancing repairs must all agree with deletion; that is why deletion is usually the operation that exposes an incomplete implementation.

## Related

Binary search throws away half of a sorted array. A balanced tree keeps this walk near log n when the insert order is poor.

- [What Is Binary Search? Throw Away Half of a Sorted Array](/articles/binary-search)
- [What Is a Balanced Tree? AVL, Red-Black, and Height](/articles/balanced-trees)
- [How Do Preorder, Inorder, and Postorder Traverse a Tree?](/articles/tree-traversals)

    `,
  ),
  defineArticle(
    "balanced-trees",
    "What Is a Balanced Tree? AVL, Red-Black, and Height",
    "Trees and graphs",
    "AVL and red-black trees enforce different invariants with rotations and, for red-black trees, recoloring so height remains O(log n). A skewed BST is a list drawn vertically.",
    ["balanced tree", "AVL", "red-black"],
    `
A balanced tree keeps its height near log n, so a walk from the root stays short as n grows. In this course, tree height is counted in nodes: empty is 0 and a leaf is 1. AVL and red-black trees rotate after an insert or a delete would leave one side too tall. The drawing is 7 nodes with a longest path of 3 nodes, close to log2(7). A tree that never rotates can keep the search rule and still become a line.

\`\`\`mermaid
flowchart TD
  c4["4"] --> c2["2"]
  c4 --> c6["6"]
  c2 --> c1["1"]
  c2 --> c3["3"]
  c6 --> c5["5"]
  c6 --> c7["7"]
\`\`\`

## How it works

The left-and-right rule can be true while search is still O(n). If every insert goes right, the drawing is a linked list stood on end. You compare, and there is only one child to follow, so you visit every node. The order holds. It does not save work.

Balance is not one universal condition; each balanced-tree family defines an invariant that implies O(log n) height. AVL trees require the left and right subtree heights at every node to differ by at most 1, then rotate after an update if that invariant is broken. Red-black trees use color and equal-black-height rules, then rotate and recolor after updates. Their shapes need not look perfectly symmetric, but their invariants keep root-to-leaf paths within a constant factor of log n. You do not implement a rotation this month. You do need to notice a spine.

\`\`\`mermaid
flowchart LR
  subgraph before["Before: right-heavy"]
    a1["1"] --> a2["2"]
    a2 --> a3["3"]
  end
  before -->|"left rotation at 1"| after
  subgraph after["After: same sorted order"]
    b2["2"] --> b1["1"]
    b2 --> b3["3"]
  end
\`\`\`

\`\`\`ts
type AvlNode = {
  value: number;
  left: AvlNode | null;
  right: AvlNode | null;
};

const rotateLeft = (root: AvlNode): AvlNode => {
  const pivot = root.right;
  if (pivot === null) {
    return root;
  }

  root.right = pivot.left;
  pivot.left = root;
  return pivot;
};

const inOrder = (node: AvlNode | null): number[] => {
  if (node === null) {
    return [];
  }

  return [...inOrder(node.left), node.value, ...inOrder(node.right)];
};

const root: AvlNode = {
  value: 1,
  left: null,
  right: {
    value: 2,
    left: null,
    right: { value: 3, left: null, right: null },
  },
};

console.log(inOrder(root));
const balancedRoot = rotateLeft(root);
console.log(balancedRoot.value, inOrder(balancedRoot));
\`\`\`

The example prints \`[1, 2, 3]\` and then \`2 [1, 2, 3]\`. The root changes, but in-order traversal does not: preserving that sorted sequence is the rotation's key correctness invariant. Returning the unchanged root when no right child exists also makes the helper total for every node.

A rotation is a local tree move. A node and its child change parent-child roles while preserving the BST's in-order sequence. It is not the array rotation from week one. Same English word, different operation. An array rotation slides the front of a contiguous block to the back. A tree rotation changes links. When someone says balanced, ask which invariant and update procedure keep the height bounded.

## A numeric example

Insert 1, then 2, then 3, then 4 with no rotation. Each value hangs on the right of the previous one. Search for 4 looks at 4 nodes.

Rotate the top three. Before the move, 1 is the parent of 2 and 2 is the parent of 3. After it, 2 is the parent, 1 is the left child, and 3 is the right child. 1 is still smaller than 2, and 3 is still larger, so search still works. The path drops from 3 nodes to 2.

The drawing is that perfect shape for the values 1 through 7, rooted at 4. The path 4, 2, 1 has 3 nodes, and log2(7) is about 2.8. log2(1,000,000) is about 20 because 2 to the 20th is 1,048,576. A perfectly packed million-node tree needs about 20 levels. AVL and red-black trees guarantee O(log n) height but may use more than 20 levels because their guarantees allow less compact shapes. A line of a million nodes still needs a million steps.

\`\`\`mermaid
flowchart TB
  update["Insert or delete"] --> check["Check balance invariant on ancestor path"]
  check --> ok{"Invariant holds?"}
  ok -->|yes| done["No local repair"]
  ok -->|no| repair["Rotate; red-black may also recolor"]
  repair --> done
\`\`\`

## Cost

Search costs the height. One rotation rewires a constant number of links, so the local move is O(1) once you hold the nodes. An update checks at most O(log n) ancestors; each local check or repair is O(1), so AVL and red-black insertion and deletion remain O(log n). You are not coding them this month.

| Shape of n nodes | Height | One search |
| --- | --- | --- |
| AVL or red-black | about log n | O(log n) |
| n = 1,000,000, perfectly packed | about 20 levels | about 20 steps |
| Right spine | n | O(n) |
| n = 1,000,000, a line | 1,000,000 | 1,000,000 steps |

The nodes occupy O(n) memory. Implementations also store O(1) metadata per node, such as an AVL height or a red-black color, so total memory remains O(n). A recursive update can use O(log n) call-stack space; an implementation with parent links can walk upward iteratively. A sorted array never needs this move. Binary search throws away half by index.

## Practice

1. Draw the result of a left rotation at 2 in the tree \`2 → 4\`, where 4 has children 3 and 5. Verify the in-order sequence before and after.
2. Compute every node's AVL balance factor in the seven-node example. Then append 8 and 9 on the right and identify the first unbalanced ancestor.
3. Explain why a rotation is O(1) even though checking whether an update caused imbalance is O(log n).

## In the course

The binary search tree lesson is where the warning sits. Sorted inserts make a straight line, and search becomes O(n). AVL and red-black are the names of the trees that rotate when an insert or a delete would make one side too tall. You do not implement a rotation this month. The tests ask for a boolean, so a spine can still pass. Week one rotation moves the front of an array to the back. That code does not shorten a tree.

## Common mistakes

Calling every binary search tree balanced skips the repair. The search rule can hold on a vertical list. Balance is what happens on insert and delete.

An array rotation of [1, 2, 3, 4] left by one step yields [2, 3, 4, 1]. A tree rotation of the spine 1, 2, 3 makes 2 the parent of 1 and 3. The values do not wrap off the end of an array. The parent changes. Writing a full red-black tree this month is out of scope. A broken rotation fails searches that a spine would still answer.

## When to use it

Use a balanced tree when you need binary search order and you do not control insert order. Maps and indexes stay near log n because they rotate, or recolor and rotate, after each update. This month, use the idea as a check: a list stood on end is not balanced.

## When not to

Do not code a rotation for this month's exercises. If you only need the minimum or the kth largest, a heap updates that extreme in O(log n) inside an array. Sliding an array is not a balanced tree. One operation changes a parent. The other moves a block.

## FAQ

### Is a tree rotation the same operation as rotating an array?

They share an English word and they are different operations. An array rotation moves the front of a contiguous block to the back. A tree rotation makes a different node the parent, and the search rule still holds.

### Do you implement AVL or red-black trees this month?

You do not implement a rotation this month. Those trees rotate when an insert or a delete would make one side too tall. Without that repair, height follows the insert order, including a straight line.

### Can the left-and-right rule be true and the tree still be slow?

Yes. Sorted inserts put every node on one side. The rule holds, the picture is a linked list stood on end, and search is O(n). The comparison alone does not keep the height near log n.

## AVL and red-black trade-offs

AVL trees enforce a tighter height condition and therefore tend to make fewer comparisons during lookup. They may perform more rotations during update. Red-black trees permit a looser shape, use one color bit per node, and bound the longest root-to-leaf path to at most twice the shortest corresponding black-height path. That looser invariant often means fewer update repairs. Both still guarantee O(log n) search, insertion, and deletion.

A single rotation repairs an outside-heavy shape. An inside-heavy shape needs two rotations: first rotate the child toward the outside, then rotate the unbalanced node. Choosing a rotation from only the sign of one balance factor is therefore insufficient; the child’s balance identifies the single or double case.

\`\`\`mermaid
flowchart TD
  bad["Node has balance magnitude 2"] --> direction["Inspect heavy child"]
  direction --> outside["Outside-heavy: one rotation"]
  direction --> inside["Inside-heavy: rotate child, then node"]
  outside --> restored["BST order and height invariant restored"]
  inside --> restored
\`\`\`

The key invariant during every rotation is inorder preservation. If the sorted inorder sequence changes, the links were rewired incorrectly even when the resulting picture looks balanced.

## Related

A binary search tree is the order a rotation must preserve. A heap is the array tree you want when the question is the extreme value.

- [What Is a Binary Search Tree? Left Smaller, Right Larger](/articles/binary-search-trees)
- [What Is a Binary Heap? Min, Max, and the kth Largest](/articles/heaps)

    `,
  ),
  defineArticle(
    "heaps",
    "What Is a Binary Heap? Min, Max, and the kth Largest",
    "Trees and graphs",
    "A heap is a complete binary tree stored in an array, with the minimum or the maximum at the root. Updating that extreme is O(log n), which is enough to find the kth largest without fully sorting.",
    [
      "heap",
      "heaps",
      "binary heap",
      "min-heap",
      "max-heap",
      "complete binary tree",
    ],
    `
A binary heap combines two invariants. Its **shape invariant** says it is complete: every level is full except possibly the last, which fills from the left. Its **heap-order invariant** says each parent is no greater than its children in a min-heap, or no smaller in a max-heap. These guarantees put one extreme at the root, but they do not fully sort the values. Updating that extreme is O(log n), enough to find the kth largest without a full sort. The drawing is the min-heap holding the 3 largest values from 3, 2, 1, 5, 6, and 4; its root is 4.

\`\`\`mermaid
flowchart TD
  i0["0: 4"] --> i1["1: 6"]
  i0 --> i2["2: 5"]
\`\`\`

\`\`\`mermaid
flowchart LR
  array["Array [4, 6, 5]"] --> zero["index 0: root 4"]
  zero --> one["index 1: left child 6"]
  zero --> two["index 2: right child 5"]
\`\`\`

## How it works

The complete shape has no holes, so the tree lives in an array with no pointers. For index i the parent is floor((i - 1) / 2), the left child is 2i + 1, and the right child is 2i + 2. Index 0 is the root. A child index past the end is missing.

\`\`\`ts
const parentIndex = (index: number): number => {
  return Math.floor((index - 1) / 2);
};

const leftChild = (index: number): number => {
  return 2 * index + 1;
};

const rightChild = (index: number): number => {
  return 2 * index + 2;
};

console.log(parentIndex(2));
console.log(leftChild(0), rightChild(0));
\`\`\`

The example prints \`0\` and then \`1 2\`. Call \`parentIndex\` only for a non-root index; index 0 has no parent. A min-heap keeps the smallest value at the root. A max-heap keeps the largest. Siblings need not be ordered against each other, and neither subtree has the BST ordering rule, so searching for an arbitrary value is O(n).

Insert writes at the next open index, then **bubbles up** while the value belongs above its parent: smaller, in a min-heap, or larger, in a max-heap. Removing the root moves the last value into the hole and **bubbles down** (also called sifting down), swapping with the smaller child in a min-heap or the larger child in a max-heap. Choosing the better child is necessary: swapping with the wrong child can leave the other child above a smaller parent. Both walks follow one root-to-leaf path. Under the course's node-count convention, a non-empty complete heap has height \`floor(log2(n)) + 1\`, so both updates are O(log n). Reading the root is O(1).

For the kth largest, keep a min-heap of size k. Push each value, and if the size passes k, pop the smallest. Anything removed cannot be one of the k largest values seen so far. The root is the smallest survivor, which is the kth largest after the final input. Duplicates count separately.

\`\`\`mermaid
flowchart LR
  next["Read next value"] --> push["Push into min-heap"]
  push --> size{"More than k values?"}
  size -->|yes| pop["Remove minimum"]
  size -->|no| keep["Keep heap"]
  pop --> keep
  keep --> more{"Input remains?"}
  more -->|yes| next
  more -->|no| answer["Root is kth largest"]
\`\`\`

\`\`\`ts
class MinHeap {
  private readonly values: number[] = [];

  get size(): number {
    return this.values.length;
  }

  push(value: number): void {
    this.values.push(value);
    let index = this.values.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      const parentValue = this.values[parent];
      const currentValue = this.values[index];
      if (parentValue === undefined || currentValue === undefined) {
        return;
      }
      if (parentValue <= currentValue) {
        return;
      }

      this.values[parent] = currentValue;
      this.values[index] = parentValue;
      index = parent;
    }
  }

  popMinimum(): number | undefined {
    const minimum = this.values[0];
    const last = this.values.pop();
    if (minimum === undefined || last === undefined) {
      return undefined;
    }
    if (this.values.length === 0) {
      return minimum;
    }

    this.values[0] = last;
    let index = 0;

    while (true) {
      const left = 2 * index + 1;
      const right = left + 1;
      let smallest = index;
      const currentValue = this.values[index];
      if (currentValue === undefined) {
        return minimum;
      }
      let smallestValue = currentValue;

      const leftValue = this.values[left];
      if (leftValue !== undefined && leftValue < smallestValue) {
        smallest = left;
        smallestValue = leftValue;
      }
      const rightValue = this.values[right];
      if (rightValue !== undefined && rightValue < smallestValue) {
        smallest = right;
        smallestValue = rightValue;
      }
      if (smallest === index) {
        return minimum;
      }

      this.values[index] = smallestValue;
      this.values[smallest] = currentValue;
      index = smallest;
    }
  }

  peek(): number | undefined {
    return this.values[0];
  }
}

const kthLargest = (numbers: readonly number[], k: number): number | undefined => {
  if (k < 1 || k > numbers.length) {
    return undefined;
  }

  const candidates = new MinHeap();
  for (const number of numbers) {
    candidates.push(number);
    if (candidates.size > k) {
      candidates.popMinimum();
    }
  }

  return candidates.peek();
};

console.log(kthLargest([3, 2, 1, 5, 6, 4], 3));
console.log(kthLargest([2, 2], 2));
console.log(kthLargest([], 1));
\`\`\`

Expected output is \`4\`, \`2\`, and \`undefined\`. After each input, the invariant is: the heap contains the largest \`min(itemsSeen, k)\` values seen so far, and its root is their minimum. The bounds check gives invalid \`k\` values an explicit result instead of reading a missing root.

With \`noUncheckedIndexedAccess\`, TypeScript treats an array lookup as possibly \`undefined\`; the guards in \`push\` and \`popMinimum\` make that possibility explicit. The numeric indexes are still valid under the heap invariants, but checking them keeps the snippet safe if it is reused independently. \`popMinimum\` returns \`undefined\` only for an empty heap, while \`kthLargest\` rejects \`k = 0\`, negative \`k\`, and \`k > numbers.length\` before building anything.

## A numeric example

Take 3, 2, 1, 5, 6, 4 with k = 3. 3 enters as [3]. 2 swaps up to [2, 3]. 1 swaps up to [1, 3, 2]. Size equals k, so you stop. 5 yields [1, 3, 2, 5], then 1 leaves and the heap is [2, 3, 5]. 6 enters, 2 leaves, and you get [3, 6, 5]. 4 swaps above 6 to [3, 4, 5, 6], then 3 leaves and 6 swaps down with 4. You land on [4, 6, 5].

Index 0 is 4, index 1 is 6, and index 2 is 5. That is the drawing. Parent of 1 and of 2 is floor((i - 1) / 2) = 0. Left of 0 is 1, and right of 0 is 2. Root 4 is at most both children. The three values are the largest three, and 4 is the 3rd largest. Sorting the six numbers also ends at 4, and it orders ranks you did not ask for.

## Cost

Reading the root is O(1). Insert and remove-root are O(log n). The size-k heap spends O(log k) per input, so the kth largest is O(n log k). A full sort is O(n log n).

| Operation | Time | Extra space |
| --- | --- | --- |
| Read the root | O(1) | O(1) |
| Insert or remove the root | O(log n) | O(1) beyond the array |
| kth largest, heap of size k | O(n log k) | O(k) |
| Sort the whole array | O(n log n) | depends on the sort |

The complete shape makes the height \`floor(log2(n)) + 1\` for a non-empty heap, which makes O(log n) updates unconditional. A binary search tree gets that bound only when it stays balanced. A heap swaps values along an index path; it does not rotate links.

## Practice

1. Starting from \`[4, 6, 5]\`, push 2 and record every array after a swap. Check both the complete-shape and min-heap invariants after each step.
2. Change the size-k strategy to find the kth smallest. State which heap order you need and which extreme must leave when the heap grows past k.
3. Add a \`replaceMinimum(value)\` operation that replaces the root and sifts down once. Explain when it can save work in the kth-largest loop.

## In the course

\`kthLargest\` returns the kth largest in \`nums\`, with k from 1 through the length. \`kthLargest([3, 2, 1, 5, 6, 4], 2)\` is 5. Duplicates count separately, so the 2nd largest of [2, 2] is 2. The example above used k = 3 and finished with root 4. Sorting a copy also passes. The heap you would write is the three index formulas, a swap upward, a swap downward, and a pop once the size passes k. A wrong parent stops the root from being the extreme. \`pushMinHeap\` is only the upward swap: copy the array, append the value, and swap with the parent while the child is strictly smaller. Equal values do not swap, so \`pushMinHeap([1, 3, 5], 2)\` is exactly \`[1, 2, 5, 3]\`.

## Common mistakes

A max-heap of size k pops values you meant to keep. The min-heap root is the smallest of the k survivors, which is the kth largest. Use a max-heap when you want the kth smallest instead.

Skip the pop and the root becomes the minimum of the whole array, so this example returns 1 rather than 4. The children 6 and 5 under 4 are not a search tree. Going left for a smaller key does not find 5. floor(i / 2) is the wrong parent: index 2 would point at its sibling. Use floor((i - 1) / 2), with children 2i + 1 and 2i + 2, and stay 0-based.

## When to use it

Use a heap when you repeatedly need the current minimum or maximum, not a fully sorted list. The kth largest, the next scheduled job, and the heads of several sorted streams all fit. A weighted shortest path uses the same idea and always extends the cheapest path so far.

## When not to

Sort when every rank matters. Popping n times is a slow sort. Membership wants a hash set or a binary search tree. The index formulas fail if a level has a hole. One scan finds a single minimum on an array you will not update.

## FAQ

### What does complete mean for the array layout?

Every level is full except possibly the last, filled from the left. Index i has parent floor((i - 1) / 2), left child 2i + 1, and right child 2i + 2. A hole would store a child at the wrong index.

### Why is the root of a size-k min-heap the kth largest?

You kept k values and threw away anything smaller than the root. Those discarded values are smaller than every survivor, so the root is the smallest of the largest k. For 3, 2, 1, 5, 6, 4 and k = 3, the root ends as 4.

### Does sorting the array also count as correct?

Sorting those six values still gives 4 as the 3rd largest. The sort orders more than you asked, at O(n log n). The size-k heap is O(n log k) and keeps only the candidates. Either result can pass.

## Building a heap in linear time

Repeated insertion builds a heap in O(n log n), but bottom-up **heapify** is O(n). Start at the last internal node, \`floor(n / 2) - 1\`, and sift each internal node downward toward index 0. Most nodes are close to the leaves and can move only one or two levels; only a few nodes are high enough to move far. Summing those bounded movements gives O(n), not O(n log n).

\`\`\`mermaid
flowchart RL
  leaves["Leaves<br/>already valid heaps"] --> low["Sift low parents down"]
  low --> high["Continue toward index 0"]
  high --> root["Whole array satisfies heap order"]
\`\`\`

A priority queue is the abstract interface—insert an item and remove the highest-priority item. A binary heap is one implementation. Stable tie order is not guaranteed by the heap invariant; if equal priorities must leave in arrival order, compare a monotonically increasing sequence number after comparing priority.

Heap sort uses bottom-up heapify and then repeatedly moves the root to the shrinking end of the array. It runs in O(n log n) time with O(1) auxiliary array space, but typical heap sort is not stable.

## Related

A binary search tree orders every subtree and stays at log n only while balanced. The heap guarantees that bound for the extreme, which Dijkstra reuses.

- [What Is a Binary Search Tree? Left Smaller, Right Larger](/articles/binary-search-trees)
- [What Is Dijkstra's Algorithm for Weighted Shortest Paths?](/articles/dijkstra)

    `,
  ),
];

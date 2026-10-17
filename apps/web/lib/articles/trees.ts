import { defineArticle, type Article } from "./types";

export const treeArticles: readonly Article[] = [
  defineArticle(
    "trees",
    "What Is a Tree? Roots, Leaves, and Depth in Nodes",
    "Trees and graphs",
    "A tree has one root, no cycles, and children under each node. In this course the depth is the number of nodes on the longest path down: an empty tree is 0 and a single node is 1.",
    [
      "tree",
      "trees",
      "leaf",
      "root",
    ],
    `
A tree has one root, and the links from parent to child never run back into a cycle. A node with no children is a leaf, and a node with at most two children, left and right, sits in a binary tree. Depth in this course is the number of nodes on the longest path from the root down: an empty tree is 0 and a single node is 1. The drawing has depth 3, because the longest path is the nodes 8, 3, and 1.

\`\`\`mermaid
flowchart TD
  n8["8"] --> n3["3"]
  n8 --> n10["10"]
  n3 --> n1["1"]
  n3 --> n6["6"]
\`\`\`

## How it works

You start at the root. A binary node holds a value, a left link, and a right link, and either link can be null. One path runs from the root to each node. Nothing points back at an ancestor, so the walk cannot cycle the way a graph search can.

Depth counts nodes on the longest path down. An empty tree is 0. A single node is 1. People also say height for a closely related count. Count edges and that single node becomes 0, so every answer is off by one against the tests. Use the node count.

A missing node returns 0. A real node returns 1 plus the larger of the children's depths. The 1 is the node you are on. You keep the larger child, because depth is one path, not the sum of both sides. Pass 0 for a missing child.

\`\`\`ts
const deeper = (leftDepth: number, rightDepth: number): number => {
  return 1 + Math.max(leftDepth, rightDepth);
};
\`\`\`

That evaluation is depth-first: one branch finishes before the other starts. Visiting every node on one level before the next wants a queue, which is level order and breadth-first search. \`buildTree\` already uses that queue on a level-order list, with null for a missing child. A leaf has no children. Binary only caps the child count. It does not order the values.

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

## In the course

\`maxDepth\` takes a level-order list and returns the node count on the longest path. The lesson tree returns 3, one node returns 1, an empty list returns 0, and [1, 2, null, 3] returns 3. Call \`buildTree\`, then use the recursive rule. The lesson list has length 7 and depth 3, so length is the wrong number. Missing returns 0. A real node returns 1 plus the deeper child.

## Common mistakes

Counting edges returns 0 for a single node and stays one low after that. Adding 1 at the end of an edge count still fails the empty tree, which must stay 0. Add 1 only for a node that exists.

Adding the two child depths together makes a wide tree look deep. Keep the larger one. Counting a null entry as a node counts a hole. A level-order loop can be right if each level counts as nodes and the empty root is 0, and the point of the exercise is still the recursive rule.

## When to use it

Use a tree for one start and branches that do not loop: folders, a nested expression, a reply thread. Use this depth for the longest chain of nodes downward. Use a queue to visit one level before the next. Use a binary search tree when the values are ordered and you need to know if one is present.

## When not to

A cycle needs the seen-set from graph search, or a tree walk never finishes. Depth does not answer the minimum, the kth largest, or a full sort. The count of every node is not the depth. Seven nodes in a full bush still have depth 3.

## FAQ

### Is depth the same number as height?

People use both words for a closely related count, and some books set a single node to 0. Here the depth is nodes on the longest path from the root. Empty is 0. A single node is 1.

### Why is a leaf depth 1 and a missing child depth 0?

A missing child is empty, so it contributes 0. A leaf is a real node with missing children: 1 + max(0, 0). You add 1 only when the node exists.

### Does finishing the left branch first change the depth?

One branch finishes before the other because the walk is depth-first. You keep the larger child result, so the number stays the same if you swap the order. The call stack changes. The longest path does not.

## Related

Read the ordered tree next, then the search that also finishes one branch before the other.

- [What Is a Binary Search Tree? Left Smaller, Right Larger](/articles/binary-search-trees)
- [How Does Depth-First Search Explore One Branch First?](/articles/depth-first-search)

    `,
  ),
  defineArticle(
    "binary-search-trees",
    "What Is a Binary Search Tree? Left Smaller, Right Larger",
    "Trees and graphs",
    "A binary search tree keeps every value in the left subtree smaller than the node and every value in the right subtree larger. This course leaves duplicates out, and search costs the height, not automatically log n.",
    [
      "binary search tree",
    ],
    `
A binary search tree is a binary tree with an order on the values. Every value in the left subtree is smaller than the node, and every value in the right subtree is larger. This course leaves duplicates out, so an equal value goes neither left nor right. The drawing is the tree after inserting 4, then 2, then 6, then 1, then 3.

\`\`\`mermaid
flowchart TD
  b4["4"] --> b2["2"]
  b4 --> b6["6"]
  b2 --> b1["1"]
  b2 --> b3["3"]
\`\`\`

## How it works

Search starts at the root. A smaller target goes left. A larger target goes right. Null means absent. An equal value means present. You may drop a side only when every value in that subtree obeys the rule, not only the two children.

The time is proportional to the height: the number of nodes on the longest path down. That is about log n on a short tree, and it is not automatic. Sorted inserts send every new node down the same side, the drawing becomes a straight line, and search falls back to O(n). The comparisons stay correct. They stop saving work.

Insert uses the same walk. The empty spot on the correct side is where the new node goes. The first value becomes the root. Duplicates are a policy decision. Some trees push equals left, and some push them right. This course leaves duplicates out, so a value that is already stored is not inserted again.

\`\`\`ts
type TreeNode = {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

const found = (node: TreeNode | null, target: number): boolean => {
  if (node === null) {
    return false;
  }
  if (target < node.value) {
    return found(node.left, target);
  }
  if (target > node.value) {
    return found(node.right, target);
  }
  return true;
};

const root: TreeNode = {
  value: 4,
  left: {
    value: 2,
    left: { value: 1, left: null, right: null },
    right: { value: 3, left: null, right: null },
  },
  right: { value: 6, left: null, right: null },
};

console.log(found(root, 3), found(root, 7));
\`\`\`

A scan of the original array misses the point. The links help only when lookup follows them. Without the order rule you still have a root, leaves, and a depth, and you cannot discard a side.

## A numeric example

Insert 4 as the root. Insert 2 on its left. Insert 6 on its right. Insert 1, which is smaller than 4 and smaller than 2, so it hangs left of 2. Insert 3, which is smaller than 4 and larger than 2, so it hangs right of 2. That is the drawing. The longest path has 3 nodes, for example 4, 2, 1.

Search for 3 goes left at 4 and right at 2, then matches. Search for 7 goes right to 6 and then into null, so 7 is absent. Absence is that null.

Insert 1, then 2, then 3, then 4 and the shape changes. 2 hangs right of 1, 3 hangs right of 2, and 4 hangs right of 3. Every left link is empty. Search for 4 compares all 4 nodes. The left-and-right rule still holds, and the cost is O(n). If 2 is already stored, leave the next 2 out. Do not place it left, and do not place it right.

## Cost

Search and insert each follow one path, so both are O(h). Say O(log n) only when the height is about log n. One node per value means O(n) memory.

| Shape of n nodes | Search and insert | Memory |
| --- | --- | --- |
| Height about log n | O(log n) | O(n) |
| Straight line, height n | O(n) | O(n) |
| Empty tree | O(1), the root is null | O(1) |

The first row is a balanced tree, or inserts that landed on both sides. The second row is sorted input and no repair. The search code is the same.

## In the course

\`bstContains\` inserts \`values\` from left to right, then reports whether \`target\` is present. Smaller goes left, larger goes right, and equals stay out. [8, 3, 10, 1, 6] contains 6 and does not contain 7. [4, 2, 6] contains the root 4. An empty list does not contain 1. \`.includes\`, \`.indexOf\`, and \`new Set\` skip the walk, and the runner rejects them. Sorted input still returns the right boolean, at a cost equal to the length of the list.

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

## Related

Binary search throws away half of a sorted array. A balanced tree keeps this walk near log n when the insert order is poor.

- [What Is Binary Search? Throw Away Half of a Sorted Array](/articles/binary-search)
- [What Is a Balanced Tree? AVL, Red-Black, and Height](/articles/balanced-trees)

    `,
  ),
  defineArticle(
    "balanced-trees",
    "What Is a Balanced Tree? AVL, Red-Black, and Height",
    "Trees and graphs",
    "AVL and red-black trees rotate nodes so the height stays about log n. A skewed tree is a list drawn vertically, and that rotation is a tree move, not the array rotation from week one.",
    [
      "balanced tree",
      "AVL",
      "red-black",
    ],
    `
A balanced tree keeps its height near log n, so a walk from the root stays short as n grows. AVL and red-black trees rotate after an insert or a delete would leave one side too tall. The drawing is 7 nodes with a longest path of 3, close to log2(7). A tree that never rotates can keep the search rule and still become a line.

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

Balance promises a height of about log n for n nodes. AVL trees compare child heights after an insert or a delete and rotate when the two sides differ by more than 1. Red-black trees color each node, then rotate and recolor, so the longest path stays within a small factor of log n. You do not implement a rotation this month. You do need to notice a spine.

\`\`\`ts
const heavierSide = (leftHeight: number, rightHeight: number): string => {
  const balance = rightHeight - leftHeight;
  if (balance > 1) {
    return "right";
  }
  if (balance < -1) {
    return "left";
  }
  return "neither";
};
\`\`\`

A rotation is a tree move. A node and its child change places, so a different node becomes the parent, and the search rule still holds. It is not the array rotation from week one. Same English word, different operation. An array rotation slides the front of a contiguous block to the back. A tree rotation changes the parent. When someone says balanced, ask what it does on insert to keep the height honest.

## A numeric example

Insert 1, then 2, then 3, then 4 with no rotation. Each value hangs on the right of the previous one. Search for 4 looks at 4 nodes.

Rotate the top three. Before the move, 1 is the parent of 2 and 2 is the parent of 3. After it, 2 is the parent, 1 is the left child, and 3 is the right child. 1 is still smaller than 2, and 3 is still larger, so search still works. The path drops from 3 nodes to 2.

The drawing is that shape for the values 1 through 7, rooted at 4. The path 4, 2, 1 has 3 nodes, and log2(7) is about 2.8. log2(1,000,000) is about 20, because 2 to the 20th is 1,048,576. A balanced million nodes is about 20 steps. A line of a million nodes is a million steps.

## Cost

Search costs the height. One rotation rewires a constant number of links, so the local move is O(1) once you hold the nodes. AVL and red-black insert and delete stay O(log n) by doing a bounded amount of that work on one path. You are not coding it this month.

| Shape of n nodes | Height | One search |
| --- | --- | --- |
| AVL or red-black | about log n | O(log n) |
| n = 1,000,000, balanced | about 20 | about 20 steps |
| Right spine | n | O(n) |
| n = 1,000,000, a line | 1,000,000 | 1,000,000 steps |

Memory is O(n), plus a height or a color so the repair can run on the way back up. A sorted array never needs this move. Binary search throws away half by index.

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
      "min-heap",
      "max-heap",
      "complete binary tree",
    ],
    `
A heap is a complete binary tree stored in an array, with the minimum or the maximum at the root. Complete means every level is full except possibly the last, filled from the left. Updating that extreme is O(log n), enough to find the kth largest without a full sort. The drawing is the min-heap of the 3 largest among 3, 2, 1, 5, 6, and 4, and the root is 4.

\`\`\`mermaid
flowchart TD
  i0["0: 4"] --> i1["1: 6"]
  i0 --> i2["2: 5"]
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
\`\`\`

A min-heap keeps the smallest value at the root. A max-heap keeps the largest. The two children need not be ordered against each other, so this is not a binary search tree. You use a heap when you keep asking for the current extreme.

Insert writes at the next open index, then swaps upward while the value belongs above its parent: smaller, in a min-heap, or larger, in a max-heap. Removing the root moves the last value into the hole and swaps downward, with the smaller child or the larger child. Both walks are one path. Height is about log n, so both are O(log n). Reading the root is O(1).

For the kth largest, keep a min-heap of size k. Push each value, and if the size passes k, pop the smallest. Anything smaller than the root cannot be one of the k largest. The root is the smallest survivor, which is the kth largest. Duplicates count separately.

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

The complete shape is what makes log n honest. A binary search tree gets that bound only when it stays balanced. A heap swaps along a path. It does not rotate.

## In the course

\`kthLargest\` returns the kth largest in \`nums\`, with k from 1 through the length. \`kthLargest([3, 2, 1, 5, 6, 4], 2)\` is 5. Duplicates count separately, so the 2nd largest of [2, 2] is 2. The example above used k = 3 and finished with root 4. Sorting a copy also passes. The heap you would write is the three index formulas, a swap upward, a swap downward, and a pop once the size passes k. A wrong parent stops the root from being the extreme.

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

## Related

A binary search tree orders every subtree and stays at log n only while balanced. The heap guarantees that bound for the extreme, which Dijkstra reuses.

- [What Is a Binary Search Tree? Left Smaller, Right Larger](/articles/binary-search-trees)
- [What Is Dijkstra's Algorithm for Weighted Shortest Paths?](/articles/dijkstra)

    `,
  ),
];

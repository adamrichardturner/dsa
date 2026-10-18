export const bitesize = {
  complexity: `
## Before you start

An **input** is the data given to a function. Its size is usually called \`n\`. For an array, \`n\` means the number of elements. **Big O** describes how the amount of work changes when \`n\` grows; it does not measure exact seconds.

## The simple idea

Count how many times the code can repeat. Reading one item is constant work. Walking through every item is linear work. Walking through every item once for every other item is quadratic work.

\`\`\`mermaid
flowchart LR
  input["n values"] --> oneRead["Read one value: O(1)"]
  input --> onePass["Read every value: O(n)"]
  input --> pairPass["Compare every pair: O(n²)"]
\`\`\`

This small function makes one pass, regardless of which values it receives:

\`\`\`ts
export function countEven(values: number[]): number {
  let count = 0;
  for (const value of values) {
    if (value % 2 === 0) {
      count += 1;
    }
  }
  return count;
}
\`\`\`

If the array doubles, the loop does roughly twice as much work, so the time cost is O(n). The variables \`count\` and \`value\` do not grow with the input, so the extra space is O(1).

## How to approach the task

Start a counter at zero. Inspect each number exactly once. Increase the counter only when the comparison succeeds, then return it after the loop. Keep the comparison strict: “below” means \`<\`, not \`<=\`.

## Common mistakes

- Big O keeps the fastest-growing part, so O(2n + 3) becomes O(n).
- Two separate loops are O(n + n), which is still O(n); nested loops are usually O(n²).
- Do not return from inside the loop unless the task asks you to stop at the first match.
  `.trim(),

  arrays: `
## Before you start

An **array** stores values in an order. An **index** is a zero-based position, so the first value is at index 0. Reading \`values[i]\` is fast because the runtime can go directly to that position.

## The simple idea

Rotation does not change the values. It only chooses a new starting point. For a left rotation, everything from that point to the end comes first, followed by the values that were before it.

\`\`\`mermaid
flowchart LR
  original["[A, B, C, D]"] --> cut["Cut after B"]
  cut --> rightPart["[C, D]"]
  cut --> leftPart["[A, B]"]
  rightPart --> result["[C, D, A, B]"]
  leftPart --> result
\`\`\`

The remainder operator keeps a position inside the array:

\`\`\`ts
export function normaliseSteps(steps: number, length: number): number {
  if (length === 0) {
    return 0;
  }
  return steps % length;
}
\`\`\`

For four values, moving by 6 positions is the same as moving by 2, because a full group of 4 returns to the start. A clear solution can copy two slices into a new array. That takes O(n) time and O(n) result space.

## How to approach the task

Handle an empty array before using the remainder operator. Calculate the effective step count. Build a new array from the section after the cut and then the section before it. Leave the input untouched.

## Common mistakes

- Using \`steps\` directly can create a cut beyond the end.
- Mutating the input breaks the requirement even if the returned values look right.
- An array of length zero needs an early return because remainder by zero is not useful.
  `.trim(),

  hashMaps: `
## Before you start

A **hash map** stores a value under a key. A plain object can be used when the keys are strings. The important operation is lookup: ask whether a key has already been stored without scanning all previous values.

## The simple idea

For two values to total a target, the number paired with \`current\` must be \`target - current\`. That missing value is the **complement**. As you scan, remember values already seen and ask whether the current complement is among them.

\`\`\`mermaid
flowchart TD
  read["Read current value"]
  complement["Calculate target - current"]
  found{"Complement stored?"}
  answer["Use the stored position"]
  remember["Store current position"]
  read --> complement --> found
  found -->|yes| answer
  found -->|no| remember --> read
\`\`\`

Here is the same remember-and-look-up pattern for finding a repeated word:

\`\`\`ts
export function firstRepeated(words: string[]): string | null {
  const seen: Record<string, boolean> = {};
  for (const word of words) {
    if (seen[word] === true) {
      return word;
    }
    seen[word] = true;
  }
  return null;
}
\`\`\`

The scan is O(n) on average and the stored keys use O(n) extra space.

## How to approach the task

Walk from left to right. Calculate the complement before storing the current number, otherwise one element could incorrectly pair with itself. Store the index because the exercise asks for positions, not values.

## Common mistakes

- Duplicates are valid when they occur at different indices.
- Store each number only after checking for its complement.
- A nested search works, but costs O(n²) and misses the purpose of the pattern.
  `.trim(),

  twoPointers: `
## Before you start

A **pointer** here is only an array index. Two pointers are useful when order tells you which part of the input can be ignored. In a sorted array, the largest absolute value must be at one of the two ends.

## The simple idea

Compare the left and right values after squaring them. Put the larger square into the last empty position of the result. Move only the pointer that supplied that value.

\`\`\`mermaid
flowchart TD
  compare["Square both ends"]
  larger{"Which square is larger?"}
  placeLeft["Write left square; move left"]
  placeRight["Write right square; move right"]
  next["Fill the next result slot backwards"]
  compare --> larger
  larger -->|left| placeLeft --> next --> compare
  larger -->|right| placeRight --> next
\`\`\`

This helper shows why the ends matter:

\`\`\`ts
export function largerSquare(left: number, right: number): number {
  const leftSquare = left * left;
  const rightSquare = right * right;
  return Math.max(leftSquare, rightSquare);
}
\`\`\`

Filling from the back avoids shifting existing values. Each pointer moves inwards at most \`n\` times altogether, so the algorithm is O(n).

## How to approach the task

Create a result array with the same length. Start \`left\` at 0, \`right\` at the final index, and \`write\` at the final result index. Continue while the pointers have not crossed.

## Common mistakes

- Comparing the original signed values fails for large negative numbers.
- Moving both pointers skips a candidate.
- Appending the largest values produces descending order; fill from the end instead.
  `.trim(),

  slidingWindow: `
## Before you start

A **window** is a contiguous section of an array. A fixed-size sliding window moves one position at a time. The key idea is to reuse the previous total instead of adding the whole section again.

## The simple idea

When a window moves right, exactly one value leaves and one value enters. Subtract the leaving value and add the entering value.

\`\`\`mermaid
flowchart LR
  old["[2, 4, 1]  7"] --> remove["Subtract 2"]
  remove --> add["Add 6"]
  add --> next["[4, 1, 6]  11"]
\`\`\`

\`\`\`ts
export function moveWindow(
  total: number,
  leaving: number,
  entering: number,
): number {
  return total - leaving + entering;
}
\`\`\`

Building the first total costs O(k), where \`k\` is the window size. Every later move costs O(1), so the complete scan is O(n), not O(n × k).

## How to approach the task

Deal with invalid sizes first. Add the first \`size\` values, then store that as the best total. Starting at index \`size\`, update the running total and compare it with the best.

## Common mistakes

- Initialising the best value to zero fails when every window sum is negative.
- The leaving index is \`enteringIndex - size\`.
- A window is contiguous; do not skip values or sort the input.
  `.trim(),

  linkedLists: `
## Before you start

A **node** stores a value and a link to the next node. The first node is the **head**. Unlike an array, a linked list has no direct index lookup; you follow links one at a time.

## The simple idea

Reversing a list means turning every next arrow around. Before changing an arrow, save where it used to lead or the rest of the list becomes unreachable.

\`\`\`mermaid
flowchart LR
  before["1 → 2 → 3 → null"] --> save["Save next"]
  save --> reverse["Point current backwards"]
  reverse --> advance["Advance previous and current"]
  advance --> after["null ← 1 ← 2 ← 3"]
\`\`\`

The three moving references are easier to understand in isolation:

\`\`\`ts
interface Node {
  value: number;
  next: Node | null;
}

export function detach(node: Node): Node | null {
  const next = node.next;
  node.next = null;
  return next;
}
\`\`\`

The complete pattern uses \`previous\`, \`current\`, and saved \`next\`. It visits every node once, so it takes O(n) time and O(1) extra space.

## How to approach the task

Begin with \`previous\` as null and \`current\` as the head. In each step, save \`current.next\`, point \`current.next\` at \`previous\`, then advance both references. When current becomes null, previous is the new head.

## Common mistakes

- Changing \`current.next\` before saving it loses the unvisited list.
- Return \`previous\`, not \`current\`, after the loop.
- The empty list and a one-node list should work without special mutation.
  `.trim(),

  stacks: `
## Before you start

A **stack** is last in, first out. \`push\` adds to the top and \`pop\` removes the most recently added value. Balanced brackets use a stack because the newest opening bracket must be the first one closed.

## The simple idea

Push opening brackets. For a closing bracket, pop the latest opening bracket and check that the pair matches. At the end, the stack must be empty.

\`\`\`mermaid
flowchart TD
  token["Read character"]
  opening{"Opening bracket?"}
  push["Push it"]
  pop["Pop latest opening"]
  match{"Correct pair?"}
  fail["Invalid"]
  token --> opening
  opening -->|yes| push --> token
  opening -->|no| pop --> match
  match -->|yes| token
  match -->|no| fail
\`\`\`

\`\`\`ts
export function matchingOpening(closing: string): string | null {
  const pairs: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };
  return pairs[closing] ?? null;
}
\`\`\`

Every character is pushed or popped at most once: O(n) time and O(n) space in the worst case.

## How to approach the task

Use an array as the stack. Push only opening brackets. On a closing bracket, reject an empty stack and reject a mismatched top. After the scan, return whether no openings remain.

## Common mistakes

- Counting bracket types is not enough; \`([)]\` has matching counts but wrong order.
- An early closing bracket must fail immediately.
- A non-empty stack at the end means some opening brackets were never closed.
  `.trim(),

  queues: `
## Before you start

A **queue** is first in, first out. Values join at the back and leave from the front. A **deque** allows efficient operations at both ends. In JavaScript exercises, an array can demonstrate the behaviour even though removing index 0 shifts later values.

## The simple idea

For a fixed window, keep only the values that currently belong to it. Add the newest value, remove the oldest when the queue grows beyond the required size, and maintain a running total.

\`\`\`mermaid
flowchart LR
  queue1["front [3, 5, 2] back"] --> leave["3 leaves"]
  leave --> enter["7 enters"]
  enter --> queue2["front [5, 2, 7] back"]
\`\`\`

\`\`\`ts
export function enqueue(
  queue: readonly number[],
  value: number,
): number[] {
  return [...queue, value];
}
\`\`\`

The conceptual queue makes ownership clear: the front is the oldest item. With a running sum, each input value is handled a constant number of times.

## How to approach the task

Read values from left to right. Add each value to the queue and total. Once the queue reaches the window size, record the total, then remove the front value from the total before the next step.

## Common mistakes

- Do not record partial windows unless the exercise asks for them.
- Remove the same value from both the queue and the running total.
- Queue order matters; sorting destroys arrival order.
  `.trim(),

  recursion: `
## Before you start

**Recursion** means a function calls itself on a smaller version of the problem. Every recursive function needs a **base case** that returns without another call. Calls waiting to finish are stored on the **call stack**.

## The simple idea

For nested arrays, inspect one item. A number can be added directly. A nested array is the same problem again, so recursively flatten it.

\`\`\`mermaid
flowchart TD
  value["Read a value"]
  nested{"Is it an array?"}
  number["Append the number"]
  recurse["Flatten the nested array"]
  combine["Continue with the next value"]
  value --> nested
  nested -->|no| number --> combine
  nested -->|yes| recurse --> combine
\`\`\`

\`\`\`ts
type NestedNumber = number | NestedNumber[];

export function sumNested(value: NestedNumber): number {
  if (typeof value === "number") {
    return value;
  }
  let total = 0;
  for (const child of value) {
    total += sumNested(child);
  }
  return total;
}
\`\`\`

Each number and array is visited once. Space also depends on the maximum nesting depth because each unfinished call occupies one stack frame.

## How to approach the task

Keep one result array shared by the recursive helper. Loop through the current array. Append numbers; recurse into arrays. The empty array naturally adds nothing.

## Common mistakes

- A recursive call must make progress towards a base case.
- Returning a new result at every level can make combining harder than sharing one accumulator.
- Very deep nesting can exceed the runtime call-stack limit.
  `.trim(),

  binarySearch: `
## Before you start

**Binary search** requires sorted data. It keeps a candidate range bounded by left and right indices. The middle comparison proves that half of the remaining values cannot be the answer.

## The simple idea

If the middle value is too small, discard the middle and everything left of it. If it is too large, discard the middle and everything right of it.

\`\`\`mermaid
flowchart TD
  range["Choose middle of current range"]
  compare{"Compare with target"}
  found["Return middle index"]
  moveLeft["Search right half"]
  moveRight["Search left half"]
  range --> compare
  compare -->|equal| found
  compare -->|too small| moveLeft --> range
  compare -->|too large| moveRight --> range
\`\`\`

\`\`\`ts
export function middleIndex(left: number, right: number): number {
  return left + Math.floor((right - left) / 2);
}
\`\`\`

Halving \`n\` values until one remains takes O(log n) steps. The iterative form uses O(1) extra space.

## How to approach the task

Use inclusive bounds: \`left = 0\` and \`right = values.length - 1\`. Continue while \`left <= right\`. Move past the checked middle with \`middle + 1\` or \`middle - 1\`; otherwise the range may stop shrinking.

## Common mistakes

- Binary search on unsorted data has no valid discard rule.
- Using \`left < right\` can skip the final candidate.
- Return the index when equal and the requested missing-value result after the loop.
  `.trim(),

  sorting: `
## Before you start

**Merge sort** is divide and conquer: split one problem into smaller independent problems, solve them, then combine their answers. A one-item array is already sorted, which is the base case.

## The simple idea

Split near the middle until only tiny arrays remain. Merge two sorted arrays by repeatedly taking the smaller front value.

\`\`\`mermaid
flowchart TD
  input["[4, 1, 3, 2]"]
  halves["[4, 1] and [3, 2]"]
  singles["[4] [1] [3] [2]"]
  sortedHalves["[1, 4] and [2, 3]"]
  result["[1, 2, 3, 4]"]
  input --> halves --> singles --> sortedHalves --> result
\`\`\`

\`\`\`ts
export function takeSmaller(
  left: number,
  right: number,
): "left" | "right" {
  if (left <= right) {
    return "left";
  }
  return "right";
}
\`\`\`

There are O(log n) split levels and O(n) merge work per level, giving O(n log n) time. The result arrays use O(n) extra space.

## How to approach the task

Write and reason about the merge helper first. Keep one index for each half. When one half is exhausted, copy the rest of the other. Then add the recursive split with a base case for length 0 or 1.

## Common mistakes

- Forgetting equal values can drop duplicates; \`<=\` gives a stable left-first merge.
- A base case only for length 1 misses the empty array.
- JavaScript’s default \`.sort()\` compares text unless supplied a numeric comparator.
  `.trim(),

  trees: `
## Before you start

A **tree** has a root and child nodes. A node with no children is a leaf. **Depth** counts how many nodes or edges are on a path; this course’s exercise defines the expected convention through its examples.

## The simple idea

The maximum depth at a node is one for the current node, plus the larger depth of its children. An empty child contributes zero.

\`\`\`mermaid
flowchart TD
  root["8 depth 1"]
  left["3 depth 2"]
  right["10 depth 2"]
  leaf["6 depth 3"]
  root --> left
  root --> right
  left --> leaf
\`\`\`

\`\`\`ts
interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function isLeaf(node: TreeNode): boolean {
  return node.left === null && node.right === null;
}
\`\`\`

Every node is visited once, so the time is O(n). The recursion stack is O(h), where \`h\` is tree height.

## How to approach the task

Return zero for a null node. Recursively find the left and right depths. Return one plus their maximum. Say the rule aloud before coding: current level plus the deeper child.

## Common mistakes

- Do not add left and right depths; that counts nodes rather than path length.
- A skewed tree can have height \`n\`, so recursive stack space is not always logarithmic.
- Keep the null base case first so child access is safe.
  `.trim(),

  binarySearchTrees: `
## Before you start

A **binary search tree** adds an ordering rule to a binary tree: smaller values go left and larger values go right. That rule lets a search discard an entire subtree after one comparison.

## The simple idea

Compare the target with the current node. Equality finishes. A smaller target can only be on the left; a larger target can only be on the right.

\`\`\`mermaid
flowchart TD
  current["Compare target with node"]
  choice{"Result"}
  found["Found"]
  left["Move to left child"]
  right["Move to right child"]
  missing["Null means missing"]
  current --> choice
  choice -->|equal| found
  choice -->|smaller| left --> current
  choice -->|larger| right --> current
  left --> missing
  right --> missing
\`\`\`

\`\`\`ts
export function direction(
  target: number,
  value: number,
): "left" | "right" | "found" {
  if (target === value) {
    return "found";
  }
  if (target < value) {
    return "left";
  }
  return "right";
}
\`\`\`

Search costs O(h). A balanced tree has O(log n) height; a badly skewed tree can degrade to O(n).

## How to approach the task

Keep a current node reference. While it is not null, compare once and move to exactly one child. Return the requested result immediately on equality, and the missing result after reaching null.

## Common mistakes

- The ordering rule is not guaranteed for an ordinary binary tree.
- Searching both children throws away the BST advantage.
- Balance affects performance even though it does not affect correctness.
  `.trim(),

  heaps: `
## Before you start

A **heap** is a complete binary tree usually stored in an array. In a min-heap, each parent is no greater than its children; in a max-heap, each parent is no less. Only the root is guaranteed to be globally smallest or largest.

## The simple idea

To track the \`k\` largest values, keep a min-heap of at most \`k\` candidates. The root is the weakest candidate. Replace it when a larger value arrives.

\`\`\`mermaid
flowchart TD
  value["Read next value"]
  room{"Heap has fewer than k?"}
  add["Add value"]
  better{"Value larger than root?"}
  replace["Replace root and restore heap"]
  skip["Ignore value"]
  value --> room
  room -->|yes| add --> value
  room -->|no| better
  better -->|yes| replace --> value
  better -->|no| skip --> value
\`\`\`

\`\`\`ts
export function parentIndex(index: number): number {
  return Math.floor((index - 1) / 2);
}

export function leftChildIndex(index: number): number {
  return index * 2 + 1;
}
\`\`\`

Keeping only \`k\` values costs O(n log k) time and O(k) space.

## How to approach the task

Separate heap operations from the exercise logic. Ensure insertion bubbles a value upwards and replacement pushes the new root downwards. After all values are processed, the min-heap root is the kth largest.

## Common mistakes

- A heap is partially ordered, not fully sorted.
- Array child indices must be checked against the current heap length.
- Clarify whether duplicate values count as separate positions; the tests define this.
  `.trim(),

  graphs: `
## Before you start

A **graph** contains vertices connected by edges. An **adjacency list** records each vertex’s neighbours. **Breadth-first search** (BFS) explores all vertices one edge away before vertices two edges away.

## The simple idea

For an unweighted graph, BFS finds a shortest path because the queue processes vertices in increasing distance order. Mark a vertex visited when it enters the queue, not when it leaves.

\`\`\`mermaid
flowchart LR
  start["Start distance 0"] --> level1["Neighbours distance 1"]
  level1 --> level2["Their new neighbours distance 2"]
  level2 --> level3["Next layer distance 3"]
\`\`\`

\`\`\`ts
interface QueueItem {
  readonly vertex: string;
  readonly distance: number;
}

export function nextItem(vertex: string, distance: number): QueueItem {
  return { vertex, distance: distance + 1 };
}
\`\`\`

With an adjacency list, BFS takes O(V + E) time and O(V) space for the queue and visited record.

## How to approach the task

Put the start vertex into the queue with distance zero and mark it visited. Repeatedly remove the front item. Return its distance if it is the target. Otherwise add each unvisited neighbour with distance plus one.

## Common mistakes

- Marking visited too late can enqueue the same vertex many times.
- BFS gives shortest edge count only when edges have equal weight.
- A graph may contain cycles and disconnected vertices; never rely on reaching every vertex.
  `.trim(),

  greedy: `
## Before you start

A **greedy algorithm** commits to the best-looking local choice and does not undo it. This is correct only when you can explain why that choice cannot make the final answer worse.

## The simple idea

For interval scheduling, choose the compatible interval that finishes earliest. It leaves as much future time as possible. Use half-open intervals: \`[start, end)\`, where touching endpoints do not overlap.

\`\`\`mermaid
flowchart TD
  sort["Sort by finishing time"]
  first["Accept earliest finish"]
  next{"Next start at or after finish?"}
  accept["Accept and update finish"]
  reject["Skip overlap"]
  sort --> first --> next
  next -->|yes| accept --> next
  next -->|no| reject --> next
\`\`\`

\`\`\`ts
export function compatible(start: number, previousEnd: number): boolean {
  return start >= previousEnd;
}
\`\`\`

Sorting dominates the cost at O(n log n); the selection scan is O(n). The proof idea is an exchange: replacing another first choice with the earliest-finishing one leaves at least as much room.

## How to approach the task

Handle the empty input. Sort a copy by end time so the caller’s array is not unexpectedly changed. Accept the first interval, remember its end, then count every later compatible interval.

## Common mistakes

- Earliest start and shortest duration both have counterexamples.
- Use \`>=\` because intervals that only touch are compatible.
- Greedy is not a guess; if no exchange argument exists, consider dynamic programming or backtracking.
  `.trim(),

  backtracking: `
## Before you start

**Backtracking** explores a decision tree. It chooses an option, explores everything under that option, then undoes the choice before trying another. A **subset** is any selection of input values, including the empty selection.

## The simple idea

For each value there are two branches: leave it out or include it. The current selection is called the path. Copy the path when a complete decision is reached.

\`\`\`mermaid
flowchart TD
  value["Next value"]
  exclude["Exclude it"]
  include["Include it"]
  recurseA["Explore remaining values"]
  recurseB["Explore remaining values"]
  undo["Remove included value"]
  value --> exclude --> recurseA
  value --> include --> recurseB --> undo
\`\`\`

\`\`\`ts
export function savePath(
  path: readonly number[],
  results: number[][],
): void {
  results.push([...path]);
}
\`\`\`

There are 2ⁿ subsets. Copying each path makes the full cost O(n × 2ⁿ) time and output space.

## How to approach the task

Write a helper with an index and mutable path. At each index, recurse without the value, then push it, recurse with it, and pop it. When the index reaches the array length, save a copy.

## Common mistakes

- Saving \`path\` itself stores the same mutable array repeatedly; copy it.
- Forgetting \`pop\` leaks a choice into the next branch.
- The empty input has one subset: the empty subset.
  `.trim(),

  dynamicProgramming: `
## Before you start

**Dynamic programming** solves repeated smaller problems once and stores their answers. A **recurrence** states how a larger answer is built from smaller answers. **Base cases** are the smallest answers known directly.

## The simple idea

To reach stair \`n\` using steps of 1 or 2, the final move came from \`n - 1\` or \`n - 2\`. Therefore the number of ways is the sum of those two smaller counts.

\`\`\`mermaid
flowchart LR
  base1["ways(1)"] --> ways3["ways(3)"]
  base2["ways(2)"] --> ways3
  base2 --> ways4["ways(4)"]
  ways3 --> ways4
\`\`\`

\`\`\`ts
export function nextWays(previous: number, current: number): number {
  return previous + current;
}
\`\`\`

Only the previous two values are needed, so an iterative solution takes O(n) time and O(1) extra space. A table is also correct and uses O(n) space.

## How to approach the task

Write the recurrence and base cases before the loop. Keep two variables representing adjacent answers. For each next stair, add them, then shift both variables forward.

## Common mistakes

- Different definitions for stair zero produce different base cases; follow the exercise examples.
- Plain recursion recalculates the same stairs exponentially many times.
- Update both rolling variables in the correct order, using a temporary next value.
  `.trim(),

  tries: `
## Before you start

A **trie** stores strings one character at a time. Nodes represent prefixes, edges represent characters, and an end marker distinguishes a complete word from a prefix.

## The simple idea

Words with the same prefix share the same path. Searching follows one edge per character. Reaching the final character proves the prefix exists; the end marker proves the whole word was inserted.

\`\`\`mermaid
flowchart TD
  root["root"]
  c["c"]
  ca["a"]
  cat["t •"]
  car["r •"]
  root --> c --> ca
  ca --> cat
  ca --> car
\`\`\`

\`\`\`ts
interface TrieNode {
  children: Record<string, TrieNode>;
  terminal: boolean;
}

export function emptyTrieNode(): TrieNode {
  return { children: {}, terminal: false };
}
\`\`\`

Insert and search cost O(L), where \`L\` is the word length. The memory cost is the number of distinct prefix nodes.

## How to approach the task

Start at the root. For insertion, create a child when the next character is missing, then move into it. Mark the final node terminal. For lookup, fail on a missing child and check the terminal flag after all characters.

## Common mistakes

- The path for “car” also contains the prefix “ca”, but “ca” is not a stored word unless its node is terminal.
- Use a fresh children object for every node.
- An empty string is represented by the root’s terminal flag, if the specification allows it.
  `.trim(),
} as const;

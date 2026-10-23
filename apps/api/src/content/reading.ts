interface LessonReading extends Record<string, string> {
  readonly complexity: string;
  readonly arrays: string;
  readonly "hash-maps": string;
  readonly "two-pointers": string;
  readonly "sliding-window": string;
  readonly "linked-lists": string;
  readonly stacks: string;
  readonly queues: string;
  readonly recursion: string;
  readonly "binary-search": string;
  readonly sorting: string;
  readonly trees: string;
  readonly "binary-search-trees": string;
  readonly heaps: string;
  readonly graphs: string;
  readonly greedy: string;
  readonly backtracking: string;
  readonly "dynamic-programming": string;
  readonly tries: string;
}

export const reading: LessonReading = {
  complexity: `
## Prerequisites

You only need variables, arrays, comparisons, and loops. The goal is not advanced mathematics: it is learning to predict how an algorithm scales before a large input exposes it.

## Growth, not stopwatch time

**Time complexity** counts how work grows with input size \`n\`. **Big O notation** keeps the dominant growth term and ignores machine speed and constant factors. If a loop performs \`3n + 2\` simple operations, its growth is O(n).

Constants can still matter in production. Big O answers the different question of how the work scales.

| Class | Intuition | Typical example |
| --- | --- | --- |
| O(1) | fixed work | read \`nums[index]\` |
| O(log n) | repeatedly halve | binary search |
| O(n) | one full pass | count matching values |
| O(n log n) | logarithmic levels of linear work | merge sort |
| O(n²) | consider pairs | nested pair scan |

\`\`\`mermaid
flowchart LR
  N["Input of n values"] --> A["One pass: O(n)"]
  N --> B["For every value, scan values: O(n²)"]
\`\`\`

## The loop invariant for a counting loop

An **invariant** is a statement that remains true throughout an algorithm. A **loop invariant** states what remains true before or after every iteration.

After processing indexes \`0\` through \`i - 1\`, let \`count\` equal exactly the number of qualifying values in that prefix. Processing index \`i\` preserves the invariant by incrementing only when the predicate is true. At the end, the processed prefix is the whole array.

Two consecutive O(n) loops are O(n + n) = O(n), while a full O(n) loop inside another is O(n × n) = O(n²).

Measure **auxiliary space** too. A few counters use O(1); an additional array proportional to the input uses O(n).

## TypeScript guidance and edge cases

Use a numeric \`for\` loop when the index or exact traversal is part of the lesson. Do not use \`filter\` merely to hide a traversal: it is still O(n) and allocates another array. Empty input should naturally return the counter's initial value, 0. Equality and strict inequality are different predicates, so values equal to an exclusive limit must not count as below it.

## Exercises and follow-up

The core exercises count values below a limit and values equal to a target in one pass. The follow-up deliberately counts index pairs with nested loops so you can compare O(n) and O(n²) on the same kind of data.

## Recap

Name the input size, state a loop invariant, count nested rather than merely visible loops, and report both time and extra space.
  `.trim(),

  arrays: `
## Prerequisites

Be comfortable with zero-based indexes and loops. Recall that O(1) means the amount of work does not grow with the array length.

## Array intuition

A TypeScript \`Array<T>\` behaves like an indexed sequence. Reading or writing \`nums[i]\` is O(1).

Appending with \`push\` is amortized O(1). **Amortized analysis** spreads an occasional expensive resize across the many inexpensive appends around it.

Inserting or deleting near the front is O(n), because later elements must shift.

\`\`\`mermaid
flowchart LR
  A["[1, 2, 3, 4]"] -->|"left rotate by 1"| B["[2, 3, 4, 1]"]
\`\`\`

## Rotation and its invariant

A left rotation by \`steps\` moves each value to an earlier index, wrapping around the end. A complete rotation changes nothing, so for a non-empty array the effective shift is \`steps % nums.length\`.

When building a new result, the useful invariant is: before source index \`i\` is processed, every earlier source value has been written exactly once to its final rotated position. You can also copy the two slices in order, but an explicit index calculation makes the movement visible.

## TypeScript guidance

Return a new \`number[]\`; do not return the original reference even when the effective shift is zero. Handle the empty array before using remainder by \`nums.length\`, because remainder by zero produces \`NaN\`. Numeric array indexes are zero-based, and reading outside the array gives \`undefined\`, so keep calculated indexes in \`0..length - 1\`.

## Edge cases and complexity

Empty, one-element, zero-step, exact-full-turn, and many-full-turn inputs should all preserve order correctly. Rotation and reverse-copy take O(n) time and O(n) output space. Repeatedly calling \`shift\` performs many shifts and can make a rotation O(n²).

## Exercises and follow-up

First reverse into a new array by scanning backward; then rotate left. The follow-up removes and inserts at an index, making the O(n) cost of shifting middle elements explicit.

## Recap

Arrays provide constant-time indexed access, not constant-time middle edits. Normalize cyclic movement and guard empty input before modular arithmetic.
  `.trim(),

  "hash-maps": `
## Prerequisites

You should understand arrays, indexes, and expected versus worst-case cost.

## Remembering prior work

A **hash map** associates a key with a value. Hashing chooses a bucket; collisions are resolved internally. Lookup and insertion are O(1) on average, though a pathological operation can be slower. The important pattern is: store a compact fact about the prefix already processed so you do not rescan it.

For duplicate detection, the fact is membership. For **Two Sum**, it is the original index of each value. At value \`x\`, its complement is \`target - x\`.

\`\`\`mermaid
flowchart TD
  X[Read x] --> C{Complement already seen?}
  C -->|yes| R[Return stored index and current index]
  C -->|no| S[Store x with current index]
  S --> X
\`\`\`

## The Two Sum invariant

Before index \`i\`, the table contains values from indexes strictly less than \`i\` and their usable indexes. Check the complement **before** storing the current value. That guarantees two different indexes and correctly handles \`[3, 3]\` with target 6.

Walking \`[2, 7, 11, 15]\` for 9: at index 0, 7 is absent, so store \`2 → 0\`; at index 1, 2 is present, so return \`[0, 1]\`.

This exchanges O(n) auxiliary space for expected O(n) time instead of O(n²).

## TypeScript guidance and edge cases

\`Map<number, number>\` preserves numeric key types. A \`Record<string, number | undefined>\` can also work, but object keys are strings and a stored index of 0 is falsy. Test against \`undefined\` rather than truthiness.

Negative numbers, zero, and duplicate values need no special cases. Preserve original indexes; sorting changes them and solves a different problem.

## Exercises and follow-up

The first exercise asks whether any value repeats; the core exercise returns Two Sum indexes. The follow-up changes the stored fact from an index to a frequency and then finds the most frequent value with a defined tie rule.

## Recap

Define what the table means, query it at the correct time, and use explicit absence checks. Hash maps often turn repeated linear searches into one expected-linear pass.
  `.trim(),

  "two-pointers": `
## Prerequisites

Know that the input ordering is a usable guarantee. Two pointers are not magic; every pointer movement needs a proof that discarded candidates cannot be answers.

## Sorted squares

In a non-decreasing array, the largest absolute value is at one of the ends. Compare the two endpoint squares, write the larger into the last unfilled result position, and move only the endpoint that supplied it.

\`\`\`mermaid
flowchart LR
  L["left: -4"] --> C{Compare squares}
  R["right: 10"] --> C
  C --> W["write 100 at result end"]
  W --> M["move right inward"]
\`\`\`

The invariant is: positions after the current write index already contain the correct largest squares in sorted order; the unread interval \`[left, right]\` contains every remaining candidate. When the pointers cross, all values have been written. Time is O(n), output space is O(n).

## Inward pointers for pair sum

For a sorted array, **inward pointers** start at both ends. Compute \`sum = nums[left] + nums[right]\`.

- If the sum equals the target, a pair of different indexes exists: return \`true\`.
- If it is too small, moving \`right\` left can only make it smaller, so increment \`left\`.
- If it is too large, moving \`left\` right can only make it larger, so decrement \`right\`.

Stop at \`left >= right\`; one index cannot be reused. This boolean exercise establishes the movement rule. The follow-up then returns \`[left, right]\` and \`[-1, -1]\` when absent.

## TypeScript guidance and edge cases

Preallocate the sorted-squares result with \`new Array<number>(nums.length)\` or fill a typed \`number[]\`. Empty and one-value inputs work naturally. Equal endpoint squares may choose either side as long as exactly one pointer moves. The pair-sum input must already be sorted; sorting is disallowed because it changes indexes and hides the promised O(n) scan.

## Recap

Maintain an unread interval, justify each discarded endpoint using order, and distinguish existence questions from index-returning contracts.
  `.trim(),

  "sliding-window": `
## Prerequisites

You should be able to sum an array and reason about contiguous subarrays. A **window** is a contiguous range, not an arbitrary selection.

## Reuse the overlap

Adjacent fixed-size windows share all but two values. After summing the first \`k\` values, update in constant time:

\`nextSum = currentSum - outgoingValue + incomingValue\`

\`\`\`mermaid
flowchart LR
  A["[2, 1, 5] 1 3 2"] -->|"drop 2, add 1"| B["2 [1, 5, 1] 3 2"]
  B -->|"drop 1, add 3"| C["2 1 [5, 1, 3] 2"]
\`\`\`

\`\`\`visualization
{
  "type": "array",
  "title": "Slide the fixed-size window once",
  "caption": "The old left value leaves before the new right value completes the next size-three window.",
  "activeStep": 2,
  "items": [
    { "value": 2, "state": "muted" },
    { "value": 1, "label": "outgoing", "state": "visited" },
    { "value": 5 },
    { "value": 1 },
    { "value": 3, "label": "incoming", "state": "active" },
    { "value": 2, "state": "muted" }
  ],
  "pointers": [
    { "label": "left moves", "index": 1, "state": "visited", "step": 1 },
    { "label": "right enters", "index": 4, "state": "active", "step": 2 }
  ],
  "window": { "start": 2, "end": 4, "label": "New window" }
}
\`\`\`

For \`[2, 1, 5, 1, 3, 2]\` and \`k = 3\`, the sums are 8, 7, 9, and 6. The maximum is 9 and the minimum is 6.

## Invariant

At each right endpoint, \`windowSum\` equals exactly the sum of the current \`k\` contiguous values, and \`best\` is the best complete window seen so far. Initialize \`best\` from the first valid window, not 0, because every window may have a negative sum.

## TypeScript guidance and edge cases

Return 0 when \`k < 1\`, the input is empty, or \`k > nums.length\`. When \`k === nums.length\`, there is one valid window. Avoid \`slice\` plus \`reduce\` inside a loop: rebuilding every window costs O(nk). The incremental version takes O(n) time and O(1) extra space.

## Fixed versus variable windows

A **variable window** grows and shrinks under a condition. The follow-up uses non-negative values, an essential invariant because removing from the left then changes the sum predictably.

Negative values can invalidate that sliding window strategy.

## Exercises and follow-up

Compute maximum window sum, then minimum window sum with the same update. The follow-up finds shortest-at-least and longest-at-most windows by moving a left pointer that never moves backward.

## Recap

Identify shared work between adjacent ranges, state exactly what the running value represents, and validate the window size before initialization.
  `.trim(),

  "linked-lists": `
## Prerequisites

Understand object references and \`null\`. A singly linked node stores a value and one link to the next node.

## Shape and trade-offs

The **head** is either the first node or \`null\`; the final node's \`next\` is \`null\`. Unlike an array, a linked list has no constant-time random access: reaching the tenth node requires following nine links. Given a node reference, inserting after it or rewiring its next link is O(1).

\`\`\`mermaid
flowchart LR
  H[head] --> A["1"] --> B["2"] --> C["3"] --> N[null]
\`\`\`

\`\`\`visualization
{
  "type": "linked-list",
  "title": "One reversal step",
  "caption": "Node 1 is already reversed. Save node 3 before changing node 2.next, or the untouched suffix is lost.",
  "activeStep": 2,
  "nodes": [
    { "id": "n1", "value": 1, "next": null, "state": "visited" },
    { "id": "n2", "value": 2, "next": "n3", "state": "active", "step": 2 },
    { "id": "n3", "value": 3, "next": null }
  ],
  "pointers": [
    { "label": "previous", "target": "n1", "state": "visited", "step": 1 },
    { "label": "current", "target": "n2", "state": "active", "step": 2 },
    { "label": "saved next", "target": "n3", "step": 1 }
  ]
}
\`\`\`

## Reversal and invariant

Use three references:

- \`previous\` points to the already reversed prefix;
- \`current\` points to the next node to reverse;
- \`next\` temporarily preserves the unreversed suffix before \`current.next\` is overwritten.

The invariant is that every node before \`current\` is reversed and reachable from \`previous\`, while every node from \`current\` onward retains its original forward links. Save, rewire, advance. When \`current === null\`, \`previous\` is the new head.

## TypeScript guidance and edge cases

Declare links as \`ListNode | null\` and narrow with \`while (current !== null)\`. Saving \`current.next\` before assignment is mandatory or the remainder becomes unreachable. Empty and one-node lists require no special mutation. Reverse nodes, not the input array, and do not allocate replacement nodes.

Traversing or reversing takes O(n) time. Iterative reversal uses O(1) auxiliary space; the array used to expose test output is separate output/conversion space.

## Exercises and follow-up

First sum values by advancing through \`next\`; then reverse the links. The follow-up uses **slow and fast pointers** to find the middle and a fixed pointer gap to find the nth node from the end.

## Recap

Linked-list algorithms are reference algorithms. State which part each pointer owns, preserve the unreversed suffix, and treat \`null\` as the end of the structure.
  `.trim(),

  stacks: `
## Prerequisites

Know array \`push\` and \`pop\`. A **stack** is last in, first out (LIFO): only the top is added or removed.

## Why the most recent item matters

TypeScript arrays make good stacks because \`push\` and \`pop\` at the end are amortized O(1). Function calls use a call stack too: each call pushes a frame and each return pops it.

For balanced brackets, an opener creates unfinished work. The next closer must match the most recent unmatched opener.

\`\`\`mermaid
flowchart TD
  C[Read character] --> O{Opening bracket?}
  O -->|yes| P[Push]
  O -->|no| M{Top is matching opener?}
  M -->|no| F[Return false]
  M -->|yes| X[Pop and continue]
\`\`\`

## Invariant

After reading a prefix, the stack contains exactly its unmatched opening brackets in encounter order. A closer with an empty or mismatched top violates the invariant. After the scan, success additionally requires an empty stack; equal counts alone do not prove correct nesting. Thus \`([])\` is valid but \`([)]\` is not.

## TypeScript guidance and edge cases

\`pop()\` returns \`T | undefined\`, so compare explicitly. A small \`Record<string, string>\` can associate closers with openers. The bracket input contains only six bracket characters, and the empty string is balanced. The scan is O(n) time and O(n) worst-case space.

Adjacent duplicate removal uses the same top-of-stack idea: if the next character equals the top, pop; otherwise push. A removal may expose a new pair, which the stack handles without rescanning.

## Exercises and follow-up

Validate balanced brackets, then remove adjacent duplicate letters. The follow-up applies backspaces and introduces a **monotonic stack** for next-greater values; that advanced pattern is enrichment, and each index is still pushed and popped at most once.

## Recap

Use a stack when later input resolves the most recent unfinished item. Define what the stack contains after each processed prefix.
  `.trim(),

  queues: `
## Prerequisites

Know array ends and the fixed sliding-window idea. A **queue** is first in, first out (FIFO).

## Arrival order

Enqueue at the back and dequeue from the front. Printer jobs, task scheduling, and breadth-first search all preserve arrival order.

\`\`\`mermaid
flowchart LR
  E[enqueue] --> Q1["oldest | ... | newest"] --> D[dequeue oldest]
\`\`\`

A TypeScript array can use \`push\` and \`shift\`, but \`shift\` is O(n) because remaining elements move. For these introductory inputs it is accepted. A head index over an array, a deque, or a circular buffer supports efficient front removal.

## Recent values first, then window sums

The exercise order matters. First, \`recentValues\` makes queue state visible:

1. enqueue the new value;
2. if length exceeds \`window\`, dequeue the oldest;
3. append an independent snapshot of the queue.

Only after that, \`windowSums\` augments the same queue with a running sum. Add on enqueue, subtract on dequeue, then append the sum. The invariant is that the queue contains exactly the latest \`min(processedCount, window)\` arrivals and the running sum equals those queued values.

## TypeScript guidance, edge cases, and complexity

\`window\` is positive. Empty input returns an empty result; a window of 1 retains only the current value; an oversized window never evicts. Copy snapshots with \`[...queue]\` so later mutation does not alter earlier results. Snapshot output costs O(n × window); incremental window sums avoid re-summing and target O(n), with O(window) working space.

## Follow-up

The follow-up counts negatives in each complete sliding window, then introduces a monotonic deque for window maxima.

The monotonic deque is advanced enrichment: it discards older values that a larger newer value permanently dominates.

## Recap

Queue order is the algorithm. Make the queue's contents visible first, then maintain aggregates that exactly describe those contents.
  `.trim(),

  recursion: `
## Prerequisites

Understand functions, return values, arrays, and the call stack. Recursive code must solve the same problem on a strictly smaller input.

## Base case and recursive case

A recursive function needs:

1. a **base case** that returns without another recursive call;
2. progress toward that base case;
3. a rule for combining smaller answers.

Nested data has a recursive type: a value is either a number or an array of nested values.

\`\`\`mermaid
flowchart TD
  V{Nested value}
  V -->|number| B[Base case: emit or return number]
  V -->|array| R[Recurse on each child]
  R --> C[Combine child results]
\`\`\`

For flattening, a number contributes one output value and an array recursively visits children from left to right. For summing, a number contributes itself and an empty array contributes 0.

## Invariant and termination

With a shared output accumulator, after processing the first \`i\` children of an array, the accumulator contains exactly the numbers from those children in encounter order. Each call receives a child, a structurally smaller part of the input. Eventually it reaches a number or empty array, so recursion terminates.

## TypeScript guidance and edge cases

Define \`type Nested = number | Nested[]\` and narrow with \`typeof value === "number"\` before treating the other branch as an array.

Inputs may be a single number, empty arrays at any depth, uneven branches, negatives, duplicates, and zero. Visit every nested entry once: O(n) time, O(d) **call stack** space for maximum nesting depth \`d\`, plus output.

## Exercises and follow-up

Flatten with a shared accumulator, then sum with the same structural walk. The follow-up makes two recursive calls for Fibonacci and separately measures nesting depth. Be precise: that Fibonacci exercise uses the 1-indexed convention \`fib(1) = fib(2) = 1\`; later dynamic-programming Fibonacci uses \`fib(0) = 0, fib(1) = 1\`.

## Recap

State the base case before coding, prove each call is smaller, and define how returned subanswers combine.
  `.trim(),

  "binary-search": `
## Prerequisites

The input must be sorted according to the same comparison used by the search. Binary search on unsorted data is incorrect.

## Halving the candidate range

Keep inclusive bounds \`lo\` and \`hi\`. The central invariant is: **if the target exists, at least one valid target index lies in \`[lo, hi]\`**.

\`\`\`mermaid
flowchart TD
  M[Inspect middle] --> E{Equal?}
  E -->|yes| R[Return index]
  E -->|target smaller| L["hi = mid - 1"]
  E -->|target larger| H["lo = mid + 1"]
  L --> M
  H --> M
\`\`\`

Use \`mid = lo + Math.floor((hi - lo) / 2)\`. If the middle value is too small, sorted order proves every index through \`mid\` can be discarded. If too large, discard \`mid\` through the right end. When \`lo > hi\`, the candidate range is empty.

Each comparison halves the remaining range, so time is O(log n). Iteration uses O(1) auxiliary space; recursive binary search uses O(log n) stack space.

## TypeScript guidance and edge cases

Array access yields \`number | undefined\` under stricter indexed-access settings, but the loop bounds establish that \`mid\` is valid; write control flow that keeps those bounds explicit. Empty input starts with \`hi = -1\` and returns \`-1\`. Test first, last, single, absent-below, absent-above, and between-values targets.

## Search insertion and duplicates

The adjacent insertion-index exercise uses a **half-open interval** and returns the first position whose value is not less than the target.

The follow-up allows duplicates: after finding equality, save the index and continue left for first equal or right for last equal. Equality does not always mean stop; the function contract decides.

## Exercises

Implement exact search, then insertion position, then duplicate boundaries. Preserve the candidate-range invariant and always remove \`mid\` from the next range to guarantee progress.

## Recap

Binary search is correct only when sorted order justifies every discarded half. Keep the candidate-range invariant and make strict progress past \`mid\`.
  `.trim(),

  sorting: `
## Prerequisites

Know recursion and the two-pointer merge of sorted sequences. Sorting means returning all input values in non-decreasing order, including duplicates.

## Divide, conquer, merge

Merge sort recursively splits until each run has fewer than two values, then merges sorted runs.

\`\`\`mermaid
flowchart TD
  A["[5, 1, 4, 2]"] --> L["[5, 1]"]
  A --> R["[4, 2]"]
  L --> LS["[1, 5]"]
  R --> RS["[2, 4]"]
  LS --> M["[1, 2, 4, 5]"]
  RS --> M
\`\`\`

During merge, maintain this invariant: the result contains the smallest consumed values in sorted order, while each pointer identifies the smallest unconsumed value in its own run. Append the smaller head; after one run is exhausted, append the other remainder.

## Complexity

Each recursion level processes n values across all merges, and there are O(log n) levels, giving O(n log n) time.

Temporary arrays require O(n) auxiliary space at peak in the intended implementation, with O(log n) call-stack depth. Bubble sort is O(n²); it appears only as a follow-up for comparison.

## TypeScript guidance and edge cases

Return a new array and preserve duplicates. Empty and one-value arrays are base cases. Use explicit numeric comparisons. JavaScript's default \`.sort()\` compares string forms, so \`[10, 2].sort()\` is not numeric order; production numeric sorting needs \`(a, b) => a - b\`, but this exercise forbids built-in sorting.

## Exercises and follow-up

First merge two already sorted arrays, then implement full merge sort. The follow-up checks whether an array is sorted and implements bubble sort once. Bubble sort is instructional, not a recommendation for general use.

## Recap

The proof lives in the merge invariant; the O(n log n) bound comes from linear work across logarithmic levels.
  `.trim(),

  trees: `
## Prerequisites and terminology

A tree has a root and no cycles. A binary-tree node has at most a left and right child; a **leaf** has neither.

This course measures tree **height in nodes**: the empty tree is 0, a leaf is 1, and otherwise the height is 1 plus the larger child height. Exercises named \`maxDepth\` use this same node-counted tree-height convention.

**Node depth** is different: it is the number of edges from the root to one particular node, so the root's node depth is 0. A tree with height 3 therefore has deepest node depth 2.

## Level-order encoding

Input arrays encode trees in **level order** (breadth-first order). Read a real node, then consume the next entries as its left and right child slots; \`null\` means that child is missing and does not enter the queue. Trailing missing children may be omitted.

\`[3, 9, 20, null, null, 15, 7]\` means:

\`\`\`mermaid
flowchart TD
  A["3"] --> B["9"]
  A --> C["20"]
  C --> D["15"]
  C --> E["7"]
\`\`\`

Its node-counted tree height—returned by the course's \`maxDepth\` exercise—is 3, and it contains 5 nodes. Its deepest nodes have node depth 2.

## Recursive invariant

Let \`height(node)\` return the number of nodes on the longest downward path beginning at \`node\`. The base case \`height(null) = 0\`; otherwise return \`1 + max(height(left), height(right))\`. Each call therefore returns the correct measure for its subtree. Every node is visited once: O(n) time and O(h) call-stack space.

## TypeScript guidance and edge cases

Use \`TreeNode | null\` and return early for \`null\`. Node values, including 0 and negatives, do not affect shape. Do not infer height or node count from encoding length because \`null\` slots and omitted trailing children break that shortcut.

## Exercises and follow-up

Use the supplied \`buildTree\`, then compute maximum depth. Next count nodes; the follow-up counts leaves and sums node values with the same depth-first traversal shape.

## Recap

Define the measurement unit, decode level order by child slots, and let each recursive call answer one precise subtree question.
  `.trim(),

  "binary-search-trees": `
## Prerequisites

Know binary trees and the course convention that tree height is counted in nodes: empty 0, leaf 1.

## Ordering invariant

A binary search tree (BST) maintains a global rule for every node: all values in its left subtree are smaller and all values in its right subtree are larger. This lesson ignores duplicate insertions. The rule applies to whole subtrees, not only immediate children.

\`\`\`mermaid
flowchart TD
  A["8"] --> B["3"]
  A --> C["10"]
  B --> D["1"]
  B --> E["6"]
\`\`\`

Search compares at each node. Equality succeeds, a smaller target goes left, a larger target goes right, and \`null\` means absent. The invariant is that if the target exists, it remains in the chosen subtree. The minimum is found by following left links until none remains.

## Shape controls cost

Search and minimum lookup take O(h), where \`h\` is node-counted tree height. A balanced shape has O(log n) height. Sorted insertion can produce a one-sided spine of height n, making search O(n). Building by ordinary insertion is O(n log n) for a balanced shape but O(n²) in the worst case.

## TypeScript guidance and edge cases

Represent children as \`TreeNode | null\`. Begin insertion from a \`TreeNode | null\` root and handle an empty input explicitly. Compare values rather than scanning the original array. Repeated values may be ignored under this lesson's duplicate policy.

## Advanced enrichment

AVL and red-black trees restore balance using rotations and guarantee logarithmic height. They are explicitly enrichment here: understand why they exist, but do not implement rotations.

## Exercises and follow-up

Insert values and search with comparison-guided movement, then insert and find the minimum. The follow-up measures the resulting height and demonstrates how sorted input degenerates into a list-like spine.

## Recap

BST performance comes from both the ordering invariant and the shape. O(log n) is not automatic for an unbalanced BST.
  `.trim(),

  heaps: `
## Prerequisites

Know arrays, complete binary trees, and logarithmic height. A heap is a **partial order**, not a fully sorted array.

## Shape and order invariants

A binary heap is complete: every level is full except possibly the last, filled left to right. A min-heap also satisfies \`parent <= child\` for every edge, placing one minimum at the root.

For zero-based index \`i\`, each **child index** and parent index follows a fixed formula:

- parent: \`Math.floor((i - 1) / 2)\` for \`i > 0\`;
- left child: \`2 * i + 1\`;
- right child: \`2 * i + 2\`.

\`\`\`mermaid
flowchart TD
  A["index 0"] --> B["index 1"]
  A --> C["index 2"]
  B --> D["index 3"]
  B --> E["index 4"]
\`\`\`

Insertion appends, then **sifts up** while parent order is violated. Removing the minimum moves the last value to the root, then **sifts down** through the smaller child. Completeness gives O(log n) height, so both operations are O(log n).

## Kth largest without sorting

Maintain a min-heap containing at most \`k\` values. Push each input; whenever size exceeds \`k\`, remove the minimum. The invariant is that after each prefix, the heap contains the largest \`min(k, processedCount)\` occurrences from that prefix. Duplicates count separately. After all values, the root is the kth largest.

Time is O(n log k), space is O(k). Sorting could solve the mathematical problem in O(n log n), but it is forbidden here because the exercise assesses heap operations; do not describe sorting passes as an accepted route.

## TypeScript guidance and edge cases

Use a \`number[]\` heap and explicit swap assignments or destructuring. Validate child indexes before reads. Inputs guarantee \`1 <= k <= nums.length\`; negative and multi-digit values compare numerically. The adjacent min-heap validation scans every non-root child against its parent in O(n).

## Exercises and follow-up

Implement kth largest with a size-k min-heap, then validate the parent rule. The follow-up isolates parent and child index formulas.

## Recap

Completeness supplies compact indexing; the heap-order invariant supplies fast access to one extreme, not total ordering.
  `.trim(),

  graphs: `
## Prerequisites

Know queues, stacks, and hash-based visited records. A graph has **vertices** and **edges**; unlike a tree, it may contain cycles and disconnected components.

## Representation

This lesson uses unweighted, undirected edges. For each \`[u, v]\`, add \`v\` to \`u\`'s neighbours and \`u\` to \`v\`'s. This **adjacency list** supports O(V + E) traversal.

\`\`\`mermaid
flowchart LR
  A["0: [1, 2]"]
  B["1: [0]"]
  C["2: [0, 3]"]
  D["3: [2]"]
\`\`\`

\`\`\`visualization
{
  "type": "graph",
  "title": "Mark neighbours when they enter the queue",
  "caption": "After processing 0, vertices 1 and 2 are already marked. Another edge cannot enqueue either vertex again.",
  "activeStep": 1,
  "directed": false,
  "nodes": [
    { "id": "0", "label": "0", "x": 10, "y": 50, "state": "visited" },
    { "id": "1", "label": "1", "x": 45, "y": 20, "state": "active", "step": 1 },
    { "id": "2", "label": "2", "x": 45, "y": 80, "state": "active", "step": 1 },
    { "id": "3", "label": "3", "x": 80, "y": 80, "state": "muted", "step": 2 }
  ],
  "edges": [
    { "from": "0", "to": "1", "state": "active", "step": 1 },
    { "from": "0", "to": "2", "state": "active", "step": 1 },
    { "from": "2", "to": "3", "state": "muted", "step": 2 }
  ]
}
\`\`\`

## Reachability before shortest path

First, DFS or BFS can answer whether \`end\` is reachable from \`start\`. Then breadth-first search answers the shortest number of edges in an unweighted graph. BFS explores distance 0, then distance 1, then distance 2, so the first discovery of a vertex has minimum distance.

Mark a vertex visited when it is enqueued, not when dequeued. The invariant is that every queued vertex has been discovered exactly once with its shortest known distance. This prevents cycles, duplicate edges, and self-loops from causing repeated work.

## TypeScript guidance and edge cases

Vertex labels may be negative or non-consecutive, so do not use array length as vertex count. A \`Record<string, number[] | undefined>\` can hold the adjacency list, and a \`Set<number>\` is an appropriate **visited set** in these exercises.

If \`start === end\`, reachability is true and distance is 0 even when no edge mentions that vertex. Return \`-1\` when no path exists.

Traversal and adjacency construction take O(V + E) time and O(V + E) space.

## Advanced enrichment

DFS does not guarantee shortest paths. Weighted shortest paths require algorithms such as Dijkstra's algorithm, usually with a priority queue; that is enrichment, not an implementation requirement here.

## Exercises

Implement reachability, then shortest path, then component-size follow-ups. Build adjacency once, mark on discovery, and choose BFS specifically when equal-cost shortest distance matters.

## Recap

Represent neighbours once, prevent repeated visits, and choose DFS or BFS according to the question rather than habit.
  `.trim(),

  greedy: `
## Prerequisites

Know sorting and half-open intervals. \`[start, end)\` includes its start but excludes its end, so \`[1, 3)\` and \`[3, 5)\` are compatible.

## Local choices need proof

A greedy algorithm commits to a locally attractive choice without revisiting it. Greedy is a proof strategy, not a synonym for “sort and scan.”

For maximum non-overlapping interval scheduling, sort by earliest finishing time and repeatedly accept the next interval whose start is at least the last accepted end.

\`\`\`mermaid
flowchart LR
  A["[1,3)"] --> B["[3,5)"]
  C["[2,4) conflicts"] -.-> A
  C -.-> B
\`\`\`

## Why earliest finish is safe

The invariant is that selected intervals are compatible and, among schedules with the same number selected so far, the greedy schedule finishes no later. In an optimal schedule, replace its first interval with the earliest-finishing interval; this cannot reduce room for later intervals. Repeating that exchange proves optimality.

Sorting by start time is not safe: \`[0, 100)\` starts first but blocks many short intervals. Always try to construct a counterexample to a proposed greedy rule.

## TypeScript guidance and edge cases

Copy before sorting if the input must remain immutable. Sort numeric endpoints with a comparator. Empty input returns 0; touching intervals are allowed; duplicate intervals overlap each other, so at most one duplicate can be selected. Sorting costs O(n log n), the scan O(n), and a sorted copy O(n) space.

## Exercises and follow-up

First determine whether one person can attend all intervals by sorting by start time and detecting overlap. Then maximize the count by sorting by end time. The follow-up isolates earliest finish and applies a different greedy invariant—farthest reachable index—to Jump Game.

## Recap

State the local rule, maintain a precise invariant, and justify optimality with an exchange argument or identify a counterexample.
  `.trim(),

  backtracking: `
## Prerequisites

Know recursion and mutable arrays. Backtracking performs depth-first search over decisions that the algorithm generates.

## Choose, explore, undo

For each distinct input value, a subset decision is binary: exclude it or include it.

\`\`\`mermaid
flowchart TD
  R["[]"] --> E1["exclude 1: []"]
  R --> I1["include 1: [1]"]
  E1 --> A["[], [2]"]
  I1 --> B["[1], [1,2]"]
\`\`\`

Maintain a mutable \`path\`. Push to choose, recurse to explore, and pop to undo. At recursion index \`i\`, the invariant is that \`path\` contains exactly the chosen values from indexes before \`i\`. Copy with \`[...path]\` when saving; storing the same array reference would let later pops rewrite completed answers.

## Complexity and edge cases

There are 2ⁿ subsets of n distinct values. Copying each subset makes output-sensitive time O(n · 2ⁿ), with O(n) recursion/path space besides output. The empty input has one subset, the empty subset. Order does not matter for this subset exercise.

## TypeScript guidance

Keep \`results: number[][]\` separate from \`path: number[]\`. Return immediately at the leaf base case. Always pair each \`push\` with a \`pop\` in the same stack frame. Avoid retaining all generated arrays when an exercise asks only for a count.

## Follow-up and advanced enrichment

The core path counts subsets, then lists them. The follow-up generates permutations, where the choice is “which unused value comes next” and order matters. **Pruning**—stopping a branch that cannot lead to a valid answer—is advanced enrichment; it can reduce explored states but does not change worst-case exponential growth in many problems.

## Recap

Backtracking is disciplined state mutation: define the path invariant, copy completed answers, and undo every choice before trying its sibling.
  `.trim(),

  "dynamic-programming": `
## Prerequisites

You should recognize recursion and repeated subproblems. Dynamic programming (DP) applies when a recurrence has **overlapping subproblems** and larger answers can be composed from smaller ones.

## Define the state before the code

For climbing stairs, let \`ways(n)\` mean the number of ordered sequences of 1-step and 2-step moves that total exactly \`n\`.

- \`ways(1) = 1\`;
- \`ways(2) = 2\`;
- \`ways(n) = ways(n - 1) + ways(n - 2)\`.

The two terms partition answers by their final move. **Memoisation** caches top-down recursion; a **bottom-up table** fills states from the base cases upward.

Keeping only the previous two values reduces auxiliary space from O(n) to O(1).

\`\`\`mermaid
flowchart LR
  A["ways(n-2)"] --> C["ways(n)"]
  B["ways(n-1)"] --> C
\`\`\`

## Do not mix recurrence conventions

Similar formulas can have different state meanings and base indexes:

- Course recursion Fibonacci: 1-indexed, \`fib(1) = fib(2) = 1\`.
- Follow-up iterative Fibonacci: 0-indexed, \`fib(0) = 0\`, \`fib(1) = 1\`.
- Climbing stairs: \`ways(1) = 1\`, \`ways(2) = 2\`; conceptually \`ways(0) = 1\` can represent one empty way, but the core input begins at 1.
- Minimum-cost climbing: \`cost[i]\` is paid when stepping on stair \`i\`; you may start at stair 0 or 1, and the top is one position beyond the array. Its state stores minimum cost, not a count.
- House robber: the state stores maximum value through a prefix, choosing skip versus take.

Always write “\`dp[i]\` means …” before the recurrence.

## Invariant, TypeScript, and edge cases

In bottom-up stairs, before computing \`i\`, the retained values equal \`ways(i - 2)\` and \`ways(i - 1)\`. Each iteration preserves that meaning. Time is O(n), extra space O(1). Use \`number\`; the exercise bound fits exact integer representation. Avoid naive exponential recursion and do not enumerate paths.

## Exercises and follow-up

Count climbing-stair sequences, then minimize climbing cost. The follow-up tabulates 0-indexed Fibonacci and House Robber, emphasizing that recurrence shape alone does not define base cases.

## Recap

DP begins with a precise state, base cases, and recurrence. Memoisation and tabulation are implementations of that model, not substitutes for defining it.
  `.trim(),

  tries: `
## Prerequisites

Know strings, trees, and object records. A **trie** stores strings by characters along root-to-node paths.

## Shared prefixes

\`cat\` and \`car\` share the edges \`c → a\`, then branch. Every node has character-keyed \`children\` and one consistently named boolean, \`isWord\`, which marks that a complete inserted word ends at that node.

\`\`\`mermaid
flowchart TD
  R[root] --> C[c]
  C --> A[a]
  A --> T["t · isWord"]
  A --> R2["r · isWord"]
\`\`\`

Insertion walks each character, creating missing children, then sets \`isWord = true\` on the final node. Exact lookup must both reach the final node and check \`isWord\`. Prefix lookup only requires the path to exist. Therefore inserting \`carpet\` makes \`car\` a prefix but not an exact word.

## Invariants and complexity

After processing the first \`i\` characters, the current node represents exactly that length-\`i\` prefix. A missing child proves failure. Insert or lookup of a string of length L takes O(L) time. Total trie space is O(total inserted characters) in the worst case, often less because prefixes share nodes.

## TypeScript guidance and edge cases

A recursive node type can use \`children: Record<string, TrieNode | undefined>\` and \`isWord: boolean\`. Check missing children explicitly. The root represents the empty prefix; set \`root.isWord\` when the empty string is inserted. Exact matching is case-sensitive in the exercise. Duplicate insertions simply leave \`isWord\` true.

## Exercises and follow-up

Build once and answer exact word queries, then answer prefix queries without scanning all words. The follow-up counts words passing through each prefix and finds a longest common prefix. Whole-word sets cannot answer these prefix questions without extra scanning.

## Recap

Keep exact-word semantics (\`isWord\`) separate from path/prefix existence. Trie cost depends on characters examined, and shared prefixes are represented once.
  `.trim(),
};

export const reading: Record<string, string> = {
  complexity: `
A data structure arranges values so the operations you care about stay cheap. Before the structures, you need a shared word for cheap.

**Big O** describes how the number of steps grows as the input grows. It ignores constant factors and the speed of one laptop.

Three costs cover almost everything here:

- O(1) does not grow with the input. Reading one slot is the example.
- O(n) is one pass, including a linear search that looks at every element.
- O(n²) is a pass for every element. Nested loops usually land here.

Name the loops in front of you.

- One loop over the input is linear.
- Two loops one after another still add up to linear.
- A loop inside a loop multiplies.

Memory has a cost too. A later lesson spends extra space so a lookup can be fast. That trade is space for time.

This lesson stays on one pass. The next one counts pairs, so you can feel the jump.

Write two small functions:

1. Count values strictly below a limit.
2. Count values equal to a target.

Say the cost out loud after each one passes.
  `.trim(),

  arrays: `
A TypeScript array is a contiguous list. Values sit in neighbouring slots.

- \`nums[i]\` is O(1), because the runtime jumps straight to that slot.
- \`nums.push(value)\` writes at the end and is cheap on average.
- Inserting or deleting in the middle is O(n), because every later element slides.

That fact decides later tools. Fast index access stays with the array. Fast inserts in the middle want a linked list.

**Rotating left** moves the front of the array to the back.

- \`[1, 2, 3, 4]\` rotated left by 1 is \`[2, 3, 4, 1]\`.
- A full turn puts every element back, so only \`steps % nums.length\` matters.
- An empty array stays empty.
- Watch the off-by-one when the remainder is 0. That means no move.

Copy into a new array. In-place reversal tricks exist. You do not need them yet.

Practice:

1. Reverse into a new array, without calling reverse.
2. Rotate left by \`steps\`.
  `.trim(),

  "hash-maps": `
A hash map associates a key with a value. On average, set and get are O(1). A collision means two keys land in the same slot, so a single call can be slower. That average is good enough for almost every exercise here.

The pattern is: remember what you have already seen.

Two Sum is the classic. A nested loop checks every pair in O(n²). A map checks, for each number \`n\`, whether you have already stored the complement \`target - n\`.

Walk \`[2, 7, 11, 15]\` looking for 9:

1. 2 is new. Store index 0. The complement 7 is missing.
2. 7's complement is 2, already stored. Return \`[0, 1]\`.

Store the index, not only the value. Prefer \`Map\` when the key is a number. An object turns it into a string, which still works here and is easier to get wrong.

This is space for time: O(n) extra memory, O(n) time. A frequency count, in the next lesson, stores how many times a key appeared instead of where.

Practice:

1. Report whether any value appears twice.
2. Return the two indexes that add up to the target.
  `.trim(),

  "two-pointers": `
Two pointers means two indexes moving through the same array according to a rule. You use them when the array is sorted, or when the ends know something the middle does not.

Sorted squares is the first rule. \`[-4, -1, 0, 3, 10]\` is sorted, but the squares are not, because a large negative becomes a large positive. The biggest squares sit at the ends.

- Put one pointer on the left and one on the right.
- Square both.
- Write the larger square at the back of the result.
- Move the pointer that produced it inward.

Each step is O(1), and the pointers cross the array once, so the walk is O(n). Sorting the squares afterwards would be O(n log n).

The next lesson uses inward pointers on a palindrome and on a pair sum. Same shape, different rule for which end moves.

Practice:

1. Return the squares in sorted order.
2. Say whether a sorted array has two values that add up to a target.
  `.trim(),

  "sliding-window": `
A sliding window is a subarray you keep as you walk forward. Learn the fixed size first.

You want the best sum of any \`k\` consecutive elements. Re-summing each block repeats almost the same additions. Once you know a window, the next one is:

\`next = current - the value that left + the value that entered\`

That update is O(1). One update per element makes the scan O(n). Only the first window is summed from scratch.

\`[2, 1, 5, 1, 3, 2]\` with \`k = 3\`:

- \`2 + 1 + 5 = 8\`
- drop 2, add 1, the sum is 7
- drop 1, add 3, the sum is 9
- drop 5, add 2, the sum is 6

The maximum is 9. The minimum of those same windows is 6, which is the second exercise.

A variable window grows and shrinks. It is the next lesson. A prefix sum can also answer a range. You do not need one while the window already holds the sum.

If \`k\` does not fit, return 0.
  `.trim(),

  "linked-lists": `
An array stores neighbours in neighbouring memory. A linked list stores a node: a value, plus a reference to the next node.

- The list itself is the head, the first node.
- The last node's \`next\` is \`null\`.
- Walking to the 10th node is O(n). You cannot jump.
- Rewiring a node you already hold is O(1).

Reversing the list makes the pointers real. Keep three pointers in your head:

- \`previous\` starts as \`null\`
- \`current\` starts at the head
- \`next\` is saved before you overwrite \`current.next\`

Point \`current.next\` at \`previous\`, then step all three forward. When \`current\` becomes \`null\`, \`previous\` is the new head.

The starter turns an array into nodes and back again. Reverse the nodes. Calling \`.reverse()\` on the array skips the lesson, and the runner rejects it.

Practice:

1. Sum the node values.
2. Reverse the list.
  `.trim(),

  stacks: `
A stack only touches the most recently added item. \`push\` adds. \`pop\` removes. Both are O(1) at the end of an array, so a TypeScript array is a fine stack if you leave the middle alone.

The call stack that runs your functions is the same structure. Each call pushes a frame. A return pops it. Recursion is a stack you do not manage yourself.

The bracket checker scans once:

- An opener \`(\`, \`[\`, or \`{\` is pushed.
- A closer pops. The popped opener must match.
- An empty pop, or a mismatch, means unbalanced.
- At the end the stack must be empty. A leftover opener was never closed.

\`([])\` is balanced. \`([)]\` is not, because the square bracket closes while the parenthesis is still open.

The second exercise removes adjacent equal letters. The top of the stack is the letter you just kept. If the new letter matches it, pop. Otherwise push.

Other characters are not in the bracket input. An empty string is balanced.
  `.trim(),

  queues: `
A queue serves items in arrival order. Enqueue adds at the back. Dequeue removes from the front. A printer line and breadth-first search are the same rule.

A TypeScript array can be a queue. \`push\` enqueues. \`shift\` dequeues, and \`shift\` is O(n) because the tail slides. For these sizes that cost does not matter. Name it anyway. A real deque, or an index you only move forward, keeps both ends O(1).

The fixed window from last week is a queue of the most recent values.

- Enqueue the new value.
- If the queue is longer than the window, dequeue the oldest.
- The sum of what remains is the answer for that step.

You will record the queue itself first, then the sums. The next lesson asks what is negative in that window, and what the maximum is.
  `.trim(),

  recursion: `
A recursive function calls itself on a smaller input. Two things have to be true:

- Each call is smaller than the one that made it.
- A base case stops, and does not call again.

Without the base case the call stack grows until it overflows.

Nested arrays are the practice. A value is either a number or an array of values.

\`[1, [2, [3, 4]], 5]\` flattens to \`[1, 2, 3, 4, 5]\`.

- A number is already flat. Return a one-element array, or add it to a sum.
- An array flattens each child and concatenates, or adds the child sums.

The second exercise is the sum, so you can feel the same walk with a different base case. Two recursive calls from one frame come in the next lesson. That is where the same subproblem starts to repeat.
  `.trim(),

  "binary-search": `
Linear search checks every index. If the array is sorted, you can do better.

Look at the middle.

- If the target is smaller, it cannot be in the right half.
- If it is larger, it cannot be in the left half.

Each comparison throws away half of what remains. That is O(log n). A million elements takes about twenty steps.

The bugs are off-by-one. Keep an invariant you can say out loud: if the target is present, its index is between \`lo\` and \`hi\` inclusive.

- \`lo\` starts at 0 and \`hi\` starts at the last index.
- The safe middle is \`lo + Math.floor((hi - lo) / 2)\`.
- A match returns that index.
- A smaller target sets \`hi\` to \`mid - 1\`.
- A larger target sets \`lo\` to \`mid + 1\`.
- An empty range means the target is absent. Return \`-1\`.

The array must be sorted. Binary search on unsorted data is wrong, not "usually fine".

The second exercise returns the index where a missing target would be inserted. The next lesson keeps searching after a match, because duplicates have a first and a last index.
  `.trim(),

  sorting: `
You can call \`nums.sort()\` and often should. This lesson is about knowing what that call costs, well enough to reimplement one honest O(n log n) sort.

Bubble sort swaps neighbours until the array settles. It is easy to remember and O(n²). The lesson after this one asks you to write it once, then leave it. Merge sort is the one to keep.

Merge sort:

1. Fewer than two elements is the base case. That slice is sorted.
2. Split into two halves.
3. Sort each half by calling merge sort.
4. Merge the two sorted runs.

The merge is two pointers, one on each half. Repeatedly take the smaller head. When one half runs out, append the rest. Merging a total of n elements is O(n). The split is about log n levels deep, and each level merges n elements. The product is O(n log n). The extra arrays are O(n) memory.

Practice the merge on its own first, then the full sort. Do not call \`.sort()\`.

JavaScript's default sort compares values as strings unless you pass a compare function. \`[10, 2].sort()\` stays \`[10, 2]\`. When a later exercise sorts numbers with the built-in sort, pass \`(a, b) => a - b\`.
  `.trim(),

  trees: `
A tree has one root and no cycles. A node with no children is a leaf. A binary tree gives each node at most two children, left and right.

Depth in this course counts nodes on the longest path from the root down.

- An empty tree has depth 0.
- A single node has depth 1.
- Otherwise the depth is 1 plus the larger of the two children.

That is a depth-first walk. The call stack finishes one branch before the other.

Level order visits every node at one depth before the next. That walk is a queue. The input is written that way, with \`null\` where a child is missing.

\`[3, 9, 20, null, null, 15, 7]\` is a root 3, a left child 9, a right child 20, and 20's children 15 and 7. The depth is 3. The node count is 5.

Use \`buildTree\`. The next lesson counts leaves and sums values with the same recursive shape.
  `.trim(),

  "binary-search-trees": `
A binary search tree adds one rule. Every value in the left subtree is smaller than the node, and every value in the right subtree is larger. This lesson does not insert duplicates.

Search starts at the root.

- Smaller goes left.
- Larger goes right.
- \`null\` means absent.

The walk is O(h), where h is the height. A balanced tree, AVL or red-black, keeps that height near log n by rotating. You do not implement a rotation. You do notice when sorted inserts turn the tree into a list, which is the lesson after this one.

The minimum is the node you reach by walking left until the left child is missing.

Build the tree by inserting. Scanning the array with \`includes\` misses the point, and the runner rejects it on the search exercise.

Practice:

1. Insert, then search.
2. Insert, then return the minimum.
  `.trim(),

  heaps: `
A heap is a complete binary tree that keeps the smallest value, a min-heap, or the largest, a max-heap, at the root. Complete means every level is full except possibly the last, which is filled from the left. That shape stores the tree in an array with no pointers.

For a node at index \`i\`:

- the parent is \`Math.floor((i - 1) / 2)\`
- the left child index is \`2 * i + 1\`
- the right child index is \`2 * i + 2\`

Insert writes at the end, then swaps upward while the order is wrong. Remove-min moves the last value to the root and swaps it downward. Both are O(log n).

You reach for a heap when you repeatedly need the current extreme, not a fully sorted list. The kth largest element is the textbook case. Keep a min-heap of size k. Push each number, and if the heap holds more than k values, pop the smallest. The root is the kth largest.

The second exercise only checks the parent rule. The next lesson asks for the indexes on their own, before any swaps.

Sorting the whole array is also correct for the kth largest, and it is O(n log n). The heap does less ordering. Either solution passes. If you want the practice, write the heap.
  `.trim(),

  graphs: `
A graph is vertices plus edges. This lesson uses undirected edges: if you can walk from 0 to 1, you can walk from 1 to 0. A tree is a graph with no cycles. A general graph may have cycles, so a search has to remember where it has been.

Store an adjacency list: an object whose keys are vertex ids and whose values are the neighbouring ids. One pass over the edges builds it.

Breadth-first search uses a queue. Visit neighbours, then neighbours of neighbours. The first time you reach the target is the fewest edges, when every edge costs the same. Weighted paths need Dijkstra, which this course names and does not ask you to build.

Mark a vertex when you first enqueue it. That visited set is what stops a cycle. Marking on dequeue lets the same neighbour sit in the queue many times.

Depth-first search uses a stack, or recursion, and finishes one branch first. It answers reachability. It does not answer the shortest path.

Practice:

1. Say whether \`end\` is reachable from \`start\`.
2. Return the number of edges on the shortest path, or \`-1\`.

The distance from a vertex to itself is 0.
  `.trim(),

  greedy: `
A greedy algorithm takes the option that looks best right now and does not undo it. It is fast when that local choice is safe. It is wrong when a patient choice would have opened a better path. The skill is telling those problems apart.

Interval scheduling is a safe case. Intervals are half-open, written \`[start, end)\`. Two overlap when one starts before the other has finished. Touching does not overlap.

Sort by finishing time, earliest first.

1. Take the first interval.
2. Take the next one that starts at or after that finish.
3. Repeat.

Taking the interval that frees you soonest leaves the most room afterwards. \`[[1, 3], [2, 4], [3, 5]]\` keeps two. \`[2, 4]\` overlaps both.

Sorting by start time instead lets a long early interval block several short ones. If you can name a case a rule gets wrong, it is not the rule. The next lesson asks for the earliest finish on its own, then for a jump reach that you should also try to break.

Practice:

1. Say whether one person can attend every interval.
2. Return how many non-overlapping intervals you can keep.
  `.trim(),

  backtracking: `
Backtracking searches a tree of decisions. At each step you choose, explore, then undo so the next choice starts clean. It is depth-first search on decisions you generate, rather than on a graph you were given.

Subsets are the small version. For each number, it is in the subset or it is not.

- Include the empty subset.
- Copy the path when you save it. If you push the path itself, later pops empty the subsets you saved.
- The undo is \`path.pop()\`. Forget it and every later subset inherits the previous choice.

\`[1, 2]\` has four subsets: \`[]\`, \`[1]\`, \`[2]\`, and \`[1, 2]\`. Order does not matter here. The tests compare the collection as a set.

n distinct numbers have 2ⁿ subsets. The first exercise only counts them. The second lists them. A permutation, in the next lesson, cares about order, so \`[1, 2]\` and \`[2, 1]\` become different answers.

Backtracking fits when the space is modest or you can prune. It is the wrong tool when a dynamic programming table would count the answers without listing them.
  `.trim(),

  "dynamic-programming": `
Dynamic programming applies when a problem is made of smaller problems that overlap. Recursion still describes the answer. The difference from backtracking is that you store results instead of exploring the same state twice.

Climbing stairs is the friendly introduction. You can take 1 or 2 steps. Let \`ways(n)\` be the number of ways to climb \`n\` steps.

- \`ways(1) = 1\`, one single step
- \`ways(2) = 2\`, two singles, or one double
- \`ways(n) = ways(n - 1) + ways(n - 2)\`

That is the recurrence. A naive recursion recomputes the same sizes many times.

Two repairs:

1. Memoisation. Keep an object from \`n\` to the answer. Check it before you recurse. Store the result after.
2. Tabulation. Fill from the base case upward. \`dp[i] = dp[i - 1] + dp[i - 2]\`. If you only keep the last two numbers, the extra memory is O(1).

Both are dynamic programming. The next lesson fills a table for Fibonacci and for a line of houses.

The second exercise here pays a cost when you step, and still climbs 1 or 2. Write the sentence for the cell before you write the assignment.
  `.trim(),

  tries: `
A trie, pronounced "try", is a tree where each edge is a character. Words that share a prefix share the path from the root. \`cat\` and \`car\` share \`c\` then \`a\`, then split into \`t\` and \`r\`.

Each node holds:

- children, keyed by character
- a flag that is true when a word ends on this node

Insert walks the characters, creates a missing child, and marks the last node. Search walks the same way and checks the flag. Both are proportional to the length of the word, not to how many other words you stored.

A hash set of whole words is also fast and shorter to write. The trie earns its place on prefixes: "which words start with \`ca\`?" is a walk to that node.

The first exercise is exact lookup, so a set would pass. Build the trie anyway. The second asks whether a query is a prefix, which a set of whole words gets wrong. The last lesson counts how many words share a path.

Do not use \`Set\` or \`Map\`. A plain object of children is enough.
  `.trim(),
};

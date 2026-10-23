export const bitesize = {
  complexity: `
## Before you start

For an array, the input size \`n\` is its number of elements. **Big O** describes how work or extra storage grows with \`n\`; it is not a stopwatch measurement.

Constants and smaller terms do not change the growth class, so O(2n + 3) is O(n).

## Beginner intuition

Count how often each operation can happen. Reading one known index is O(1). Reading all \`n\` values once is O(n). For every value, reading all \`n\` values again is O(n²).

\`\`\`mermaid
flowchart LR
  input["Array with n values"] --> direct["Read nums[0]<br/>O(1)"]
  input --> scan["One complete scan<br/>O(n)"]
  input --> pairs["Nested complete scans<br/>O(n²)"]
\`\`\`

## Invariant and reasoning

For \`countBelow\`, keep this **loop invariant**: before iteration \`i\`, \`count\` equals the number of qualifying values in indices \`0\` through \`i - 1\`. Inspecting \`nums[i]\` either increases the count once or leaves it unchanged.

After the final iteration, the processed prefix is the whole array, so the count is correct.

## TypeScript approach

\`\`\`ts
export function countBelow(nums: number[], limit: number): number {
  let count = 0;

  for (const value of nums) {
    if (value < limit) {
      count += 1;
    }
  }

  return count;
}
\`\`\`

The comparison is strictly \`<\`, matching the exclusive limit. Return only after the loop so every value is considered.

## Complexity

The loop performs O(n) time. Only the counter and current value are retained, so **auxiliary space** is O(1).

## Edge cases

An empty array returns zero. Negative values and duplicates need no special handling. Values equal to \`limit\` do not count.

## Common mistakes

- Using \`<=\` changes “strictly below” into “below or equal”.
- Returning during the loop reports a partial count.
- Two consecutive scans are O(n + n) = O(n), but nested complete scans are O(n²).
- Allocating a filtered array adds O(n) space when a counter is sufficient.
  `.trim(),

  arrays: `
## Before you start

An **array** stores values in order at zero-based indices. Reading a known index is O(1), while inserting or removing at the front can shift many elements.

The rotation exercise builds one new array instead of repeatedly calling \`shift\`.

## Beginner intuition

A left rotation chooses a new starting point without changing relative order. Rotating \`[A, B, C, D]\` left by 2 makes \`C\` first, then wraps the skipped prefix to the end.

\`\`\`mermaid
flowchart LR
  source["[A, B, C, D]"] --> cut["effectiveSteps = 2"]
  cut --> suffix["suffix [C, D]"]
  cut --> prefix["prefix [A, B]"]
  suffix --> result["result [C, D, A, B]"]
  prefix --> result
\`\`\`

## Invariant and reasoning

After \`effectiveSteps = steps % nums.length\`, complete rotations have been removed. Copy the suffix beginning at that index, then the prefix before it. During each loop, the result contains exactly the visited source values in rotated order. No input position is skipped or copied twice.

## TypeScript approach

\`\`\`ts
export function rotateLeft(nums: number[], steps: number): number[] {
  if (nums.length === 0) {
    return [];
  }

  const effectiveSteps = steps % nums.length;
  const result: number[] = [];

  for (let index = effectiveSteps; index < nums.length; index += 1) {
    const value = nums[index];
    if (value !== undefined) {
      result.push(value);
    }
  }

  for (let index = 0; index < effectiveSteps; index += 1) {
    const value = nums[index];
    if (value !== undefined) {
      result.push(value);
    }
  }

  return result;
}
\`\`\`

The explicit \`undefined\` checks suit strict indexed-access settings. The exercise guarantees non-negative integer steps, so no negative-modulo adjustment is needed.

## Complexity

Every value is copied once: O(n) time and O(n) space for the required new result.

## Edge cases

Handle empty input before taking a remainder by zero. Zero steps, a full rotation, and a one-element input still return a distinct array with unchanged order.

## Common mistakes

- Using \`steps\` directly fails when it exceeds the array length.
- Returning \`nums\` for zero effective steps violates the new-array requirement.
- Repeated \`shift\` operations mutate the input and can make the work O(n²).
- Computing \`steps % nums.length\` for an empty array produces \`NaN\`.
  `.trim(),

  hashMaps: `
## Before you start

A **hash map** associates each key with a value and supports expected O(1) lookup. In Two Sum, the key is a previously seen number and the value is its index.

A \`Map<number, number>\` preserves numeric key types; a plain object converts keys to strings. This example makes that conversion explicit and uses an object.

## Beginner intuition

If \`current + partner = target\`, then \`partner = target - current\`. Rather than searching all earlier values again, remember each earlier value and ask whether its complement has appeared.

\`\`\`mermaid
flowchart TD
  read["Read nums[index]"]
  complement["complement = target - current"]
  found{"stored complement index<br/>is not undefined?"}
  answer["Return [storedIndex, index]"]
  remember["Store current value → index"]
  read --> complement --> found
  found -->|yes| answer
  found -->|no| remember --> read
\`\`\`

## Invariant and reasoning

Before index \`i\`, the record contains values from indices \`0\` through \`i - 1\`. Checking before storing prevents one element from pairing with itself. If the complement exists, its stored index is smaller than \`i\`, so the returned order is already correct.

## TypeScript approach

\`\`\`ts
export function twoSum(nums: number[], target: number): number[] {
  const indexByValue: Record<string, number | undefined> = {};

  for (let index = 0; index < nums.length; index += 1) {
    const current = nums[index];
    if (current === undefined) {
      continue;
    }

    const complementIndex = indexByValue[String(target - current)];
    if (complementIndex !== undefined) {
      return [complementIndex, index];
    }

    indexByValue[String(current)] = index;
  }

  return [];
}
\`\`\`

Use \`!== undefined\`, not truthiness: index \`0\` is valid but falsy. \`String(number)\` documents the object's key conversion. The guaranteed pair means the final empty array is only a defensive fallback.

## Complexity

The scan is expected O(n) time and the record can hold O(n) keys.

## Edge cases

Duplicates can pair when they occupy different indices. Zero, negatives, and a match stored at index zero all work. Store indices because the output asks for positions.

## Common mistakes

- Checking \`if (complementIndex)\` loses a match at index zero.
- Storing before checking can reuse the current index.
- Returning values instead of indices answers a different question.
- Repeated \`includes\` or \`indexOf\` calls hide an O(n²) search.
  `.trim(),

  twoPointers: `
## Before you start

A **pointer** here is an array index. **Inward pointers** help when ordering proves where the next answer must come from.

In a non-decreasing array, the value with the largest absolute magnitude is at one of the two ends.

## Beginner intuition

Negative numbers reverse their apparent size when squared: \`-7\` becomes \`49\`. Compare both ends, place the larger square in the last unfilled result position, and move only the end that supplied it.

\`\`\`mermaid
flowchart TD
  compare["Compare nums[left]² and nums[right]²"]
  larger{"left square > right square?"}
  placeLeft["Write left square<br/>left += 1"]
  placeRight["Write right square<br/>right -= 1"]
  next["write -= 1"]
  compare --> larger
  larger -->|yes| placeLeft --> next --> compare
  larger -->|no| placeRight --> next
\`\`\`

## Invariant and reasoning

Before each iteration, every position after \`write\` contains its final sorted value, and unprocessed candidates are exactly between \`left\` and \`right\`. The largest remaining square must be at one of those ends, so writing it next preserves the invariant.

## TypeScript approach

\`\`\`ts
export function sortedSquares(nums: number[]): number[] {
  const result = new Array<number>(nums.length);
  let left = 0;
  let right = nums.length - 1;
  let write = nums.length - 1;

  while (left <= right) {
    const leftValue = nums[left];
    const rightValue = nums[right];
    if (leftValue === undefined || rightValue === undefined) {
      break;
    }

    const leftSquare = leftValue * leftValue;
    const rightSquare = rightValue * rightValue;
    if (leftSquare > rightSquare) {
      result[write] = leftSquare;
      left += 1;
      write -= 1;
      continue;
    }

    result[write] = rightSquare;
    right -= 1;
    write -= 1;
  }

  return result;
}
\`\`\`

The strict indexed checks suit TypeScript configurations that treat indexed reads as possibly undefined.

## Complexity

Each iteration consumes one value, so time is O(n). The result uses O(n) space; pointer state uses O(1).

## Edge cases

Empty input skips the loop. Equal squares may come from either end. All-negative, all-positive, duplicate, and zero values use the same logic.

## Common mistakes

- Comparing signed values instead of squares mishandles large negatives.
- Moving both pointers after one write skips a value.
- Appending the largest square produces descending order; fill backwards.
- Sorting after squaring costs O(n log n) and misses the ordered-input insight.
  `.trim(),

  slidingWindow: `
## Before you start

A **sliding window** is a contiguous range. A fixed-size window moves right one index at a time.

Consecutive windows share all but two roles: one value leaves and one enters.

## Beginner intuition

After summing the first \`k\` values, do not add the next block from scratch. Update the old sum by subtracting the outgoing value and adding the incoming value.

\`\`\`mermaid
flowchart LR
  old["window [2, 4, 1]<br/>sum = 7"] --> remove["subtract outgoing 2"]
  remove --> add["add incoming 6"]
  add --> next["window [4, 1, 6]<br/>sum = 11"]
\`\`\`

## Invariant and reasoning

After each update, \`windowSum\` equals the sum of exactly \`k\` consecutive values ending at the current index. Removing index \`index - k\` and adding index \`index\` moves that invariant forward by one position.

## TypeScript approach

\`\`\`ts
export function maxWindowSum(nums: number[], k: number): number {
  if (k < 1 || k > nums.length) {
    return 0;
  }

  let windowSum = 0;
  for (let index = 0; index < k; index += 1) {
    windowSum += nums[index] ?? 0;
  }

  let best = windowSum;
  for (let index = k; index < nums.length; index += 1) {
    const entering = nums[index];
    const leaving = nums[index - k];
    if (entering === undefined || leaving === undefined) {
      continue;
    }

    windowSum = windowSum - leaving + entering;
    best = Math.max(best, windowSum);
  }

  return best;
}
\`\`\`

Initialise \`best\` from the first valid sum, not zero. Nullish coalescing does not confuse a legitimate zero with a missing value.

## Complexity

The first sum costs O(k), and later updates total O(n - k), giving O(n) time and O(1) extra space.

## Edge cases

Invalid \`k\`, including zero, a negative value, or a width larger than the input, returns zero. A whole-array window has one candidate. All-negative arrays return their least-negative window sum.

## Common mistakes

- Initialising \`best\` to zero fails when every sum is negative.
- Subtracting \`nums[index - 1]\` removes the wrong value; use \`index - k\`.
- Re-summing each window creates O(n × k) work.
- Sorting destroys the contiguity that defines a window.
  `.trim(),

  linkedLists: `
## Before you start

A singly linked-list node stores a value and a reference to the next node. The **head** is the first node; the final node points to \`null\`.

Unlike an array, reaching position \`i\` requires following \`i\` links.

## Beginner intuition

Reversal turns every arrow around. Before changing \`current.next\`, save its old destination. Otherwise the unvisited suffix becomes unreachable.

\`\`\`mermaid
flowchart LR
  before["previous ← current → next"] --> save["Save next = current.next"]
  save --> turn["current.next = previous"]
  turn --> advance["previous = current<br/>current = next"]
  advance --> repeat["Repeat until current is null"]
\`\`\`

## Invariant and reasoning

At the start of each iteration, \`previous\` is the head of a correctly reversed prefix, while \`current\` is the head of the untouched suffix. Saving \`next\`, reversing one link, and advancing both references moves exactly one node from the suffix to the prefix.

## TypeScript approach

\`\`\`ts
class ListNode {
  value: number;
  next: ListNode | null;

  constructor(value: number, next: ListNode | null = null) {
    this.value = value;
    this.next = next;
  }
}

export function reverse(head: ListNode | null): ListNode | null {
  let previous: ListNode | null = null;
  let current = head;

  while (current !== null) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }

  return previous;
}
\`\`\`

In the exercise starter, call this logic after \`fromArray\`, then pass the returned head to \`toArray\`. Reuse the supplied nodes rather than creating replacements.

## Complexity

Every node is visited once: O(n) time and O(1) auxiliary space. The exercise's output conversion separately allocates O(n) result space.

## Edge cases

For an empty list, both references remain \`null\`. A one-node list performs one safe link assignment and returns the same node. Duplicate and negative values do not affect links.

## Common mistakes

- Overwriting \`current.next\` before saving it loses the suffix.
- Returning \`current\` after the loop returns \`null\); the new head is \`previous\`.
- Reversing the input array bypasses the linked-list operation.
- Allocating new nodes violates the in-place requirement.
  `.trim(),

  stacks: `
## Before you start

A **stack** is last in, first out. Array \`push\` adds at the top and \`pop\` removes the newest item.

Balanced brackets need this order because the most recently opened group must close first.

## Beginner intuition

Opening brackets are unfinished obligations. Push each one. A closing bracket must satisfy the obligation at the top; satisfying an older one first would cross the nesting.

\`\`\`mermaid
flowchart TD
  read["Read next bracket"] --> opening{"Opening bracket?"}
  opening -->|yes| push["Push opener"] --> read
  opening -->|no| pop["Pop latest opener"]
  pop --> match{"Matches closer?"}
  match -->|yes| read
  match -->|no| invalid["Return false"]
\`\`\`

## Invariant and reasoning

After each character, the stack contains exactly the unmatched opening brackets from the processed prefix, oldest at the bottom and newest at the top. A mismatch proves no future character can repair the ordering. After the scan, validity additionally requires an empty stack.

## TypeScript approach

\`\`\`ts
export function isBalanced(value: string): boolean {
  const openingByClosing: Record<string, string | undefined> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };
  const stack: string[] = [];

  for (const bracket of value) {
    const expectedOpening = openingByClosing[bracket];
    if (expectedOpening === undefined) {
      stack.push(bracket);
      continue;
    }

    if (stack.pop() !== expectedOpening) {
      return false;
    }
  }

  return stack.length === 0;
}
\`\`\`

The input contract contains only brackets, so a key absent from \`openingByClosing\` is an opener. Strict \`undefined\` checking also handles popping an empty stack.

## Complexity

Each character is pushed or popped at most once: O(n) time and O(n) worst-case space.

## Edge cases

The empty string is balanced. A closer at the beginning fails immediately. A string of only openers fails at the final stack check.

## Common mistakes

- Equal counts are insufficient: \`([)]\` has the wrong order.
- Peeking without removing leaves matched openers on the stack.
- Forgetting the final emptiness check accepts unfinished groups.
- Repeated string replacement obscures the one-pass stack invariant.
  `.trim(),

  queues: `
## Before you start

A **queue** is first in, first out: values enter at the back and leave at the front.

The exercise reports the running sum of up to the most recent \`window\` values, including partial windows at the beginning.

## Beginner intuition

The oldest value is the first one that must leave when capacity is full. Keep that arrival order and update the sum when an item enters or leaves.

\`\`\`mermaid
flowchart LR
  before["front [3, 5, 2] back<br/>sum = 10"] --> remove["Remove front 3"]
  remove --> add["Add back 7"]
  add --> after["front [5, 2, 7] back<br/>sum = 14"]
\`\`\`

## Invariant and reasoning

After processing index \`i\`, the queue contains exactly the final \`min(window, i + 1)\` input values, and \`sum\` equals their total. If full, remove the oldest before inserting the new value. Append the sum after every input, including before the first full window.

## TypeScript approach

\`\`\`ts
export function windowSums(values: number[], window: number): number[] {
  const queue = new Array<number>(window);
  const result: number[] = [];
  let front = 0;
  let size = 0;
  let sum = 0;

  for (const value of values) {
    if (size === window) {
      const leaving = queue[front];
      if (leaving !== undefined) {
        sum -= leaving;
      }
      front = (front + 1) % window;
      size -= 1;
    }

    const back = (front + size) % window;
    queue[back] = value;
    size += 1;
    sum += value;
    result.push(sum);
  }

  return result;
}
\`\`\`

The contract guarantees a positive \`window\`, so modulo by zero cannot occur. The circular indices make both queue ends O(1).

## Complexity

Each value enters once and leaves at most once: O(n) time. The queue uses O(window) auxiliary space, and the required result uses O(n).

## Edge cases

Empty input returns an empty result. A window of one reports each value. If the window exceeds the input, no value leaves and the outputs are prefix sums.

## Common mistakes

- Recording only full windows contradicts this exercise's prefix-sum outputs.
- Removing from the queue without subtracting from \`sum\` breaks the invariant.
- Recomputing each sum costs O(n × window).
- Treating a queue like a sorted collection destroys arrival order.
  `.trim(),

  recursion: `
## Before you start

**Recursion** lets a function solve smaller instances of the same shape. A nested value is either a number or an array of nested values, so its data definition is already recursive.

Every recursive branch must reach a base case before the **call stack** can unwind.

## Beginner intuition

A number can be appended immediately. An array is a container: open it and apply the same rule to each child from left to right.

\`\`\`mermaid
flowchart TD
  value["Visit Nested value"] --> kind{"number or array?"}
  kind -->|number| append["Append number"]
  kind -->|array| each["Visit each child in order"]
  each --> value
  append --> done["Return to caller"]
\`\`\`

## Invariant and reasoning

Before visiting each child, the accumulator contains the complete flattening of every earlier child in encounter order. A number extends it once; a nested array recursively establishes the same invariant for its children. When a call finishes, its entire subtree has been appended.

## TypeScript approach

\`\`\`ts
type Nested = number | Nested[];

export function flatten(value: Nested): number[] {
  const result: number[] = [];

  function append(current: Nested): void {
    if (typeof current === "number") {
      result.push(current);
      return;
    }

    for (const child of current) {
      append(child);
    }
  }

  append(value);
  return result;
}
\`\`\`

The type guard narrows \`current\` without an assertion. One shared accumulator avoids repeatedly copying partial arrays.

## Complexity

Time is O(n), where \`n\` counts visited numbers and array entries. Stack space is O(d), where nested-array depth \`d\` counts active array levels: a lone number has depth 0, an outer array has depth 1, and each contained array adds one. This convention is unrelated to tree height or recurrence indices.

## Edge cases

A single number returns a one-element array. Empty arrays append nothing. Empty branches, uneven nesting, duplicates, zero, and negatives preserve encounter order.

## Common mistakes

- Omitting the number base case causes endless or invalid recursion.
- Concatenating a new array at every level adds avoidable copying.
- Returning before all siblings are visited loses values.
- Extremely deep input can exceed JavaScript's call-stack limit.
  `.trim(),

  binarySearch: `
## Before you start

**Binary search** requires ascending sorted data. It maintains inclusive bounds around the only indices that could still contain the target.

## Beginner intuition

Compare the target with the middle value. If the middle value is smaller, neither it nor anything to its left can be the target. If it is larger, discard it and everything to its right.

\`\`\`mermaid
flowchart TD
  source["Current candidate range<br/>nums[left..right]"] --> middle["middle = left + floor((right-left)/2)"]
  middle --> compare{"Compare nums[middle] with target"}
  compare -->|"nums[middle] === target"| found["Return middle"]
  compare -->|"nums[middle] < target"| rightHalf["Set left = middle + 1<br/>keep right half"]
  compare -->|"nums[middle] > target"| leftHalf["Set right = middle - 1<br/>keep left half"]
  rightHalf --> source
  leftHalf --> source
\`\`\`

## Invariant and reasoning

At loop start: if the target is present, its index lies in \`[left, right]\`. Each comparison either returns the answer or removes the middle and one impossible half while preserving that statement. When \`left > right\`, the candidate range is empty, proving absence.

## TypeScript approach

\`\`\`ts
export function search(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const middle = left + Math.floor((right - left) / 2);
    const middleValue = nums[middle];
    if (middleValue === undefined) {
      return -1;
    }
    if (middleValue === target) {
      return middle;
    }
    if (middleValue < target) {
      left = middle + 1;
      continue;
    }
    right = middle - 1;
  }

  return -1;
}
\`\`\`

Names distinguish the source range, middle index, middle value, and target. Moving past \`middle\` guarantees progress.

## Complexity

Each step halves the candidate count: O(log n) time and O(1) auxiliary space.

## Edge cases

Empty input starts with crossed bounds. A one-value range is checked because the condition is \`left <= right\`. The exercise contains no duplicates, so any equality is the unique answer.

## Common mistakes

- Searching unsorted data invalidates the discard proof.
- Using \`left < right\` can skip the final candidate.
- Assigning a bound to \`middle\` instead of past it can create an infinite loop.
- Reversing “middle too small” and “search right” discards the answer.
  `.trim(),

  sorting: `
## Before you start

**Merge sort** uses divide and conquer: arrays of length zero or one are already sorted; larger arrays are split, recursively sorted, then merged.

## Beginner intuition

Merging is like combining two sorted queues. Compare their front values, take the smaller one, and repeat. Once one side is empty, all remaining values on the other side are already in order.

\`\`\`mermaid
flowchart TD
  input["[4, 1, 3, 2]"] --> split["[4, 1] and [3, 2]"]
  split --> singles["[4] [1] [3] [2]"]
  singles --> halves["[1, 4] and [2, 3]"]
  halves --> result["[1, 2, 3, 4]"]
\`\`\`

## Invariant and reasoning

During merge, \`result\` is sorted and contains exactly the consumed values from both halves. The smallest unconsumed value must be at one of the two current indices. Taking the smaller front preserves the invariant until both halves are exhausted.

## TypeScript approach

\`\`\`ts
export function mergeSort(nums: number[]): number[] {
  if (nums.length < 2) {
    return [...nums];
  }

  const middle = Math.floor(nums.length / 2);
  const left = mergeSort(nums.slice(0, middle));
  const right = mergeSort(nums.slice(middle));
  const result: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftValue = left[leftIndex];
    const rightValue = right[rightIndex];
    if (leftValue === undefined || rightValue === undefined) {
      break;
    }
    if (leftValue <= rightValue) {
      result.push(leftValue);
      leftIndex += 1;
      continue;
    }
    result.push(rightValue);
    rightIndex += 1;
  }

  return result.concat(left.slice(leftIndex), right.slice(rightIndex));
}
\`\`\`

Returning a copy in the base case preserves the requirement that the result be distinct from the input. \`<=\` takes equal values from the left first.

## Complexity

There are O(log n) split levels and O(n) merge work per level: O(n log n) time.

Temporary arrays use O(n) auxiliary space, plus O(log n) call-stack space.

## Edge cases

The length-less-than-two base case covers both empty and singleton arrays. Duplicates, negatives, zero, and already sorted inputs need no special branch.

## Common mistakes

- A base case only for length one recurses forever on empty input.
- Forgetting leftovers drops values after one half is exhausted.
- Using \`<\` is sorted but loses left-first stability for equal values.
- JavaScript's default numeric \`.sort()\` is lexicographic without a comparator.
  `.trim(),

  trees: `
## Before you start

A binary tree has a root and at most two children per node. In this course, **tree height** is the number of nodes on the longest root-to-leaf path: an empty tree is 0 and a leaf is 1. The \`maxDepth\` exercise returns that same node-counted tree-height measure.

**Node depth is not tree height.** Node depth counts edges from the root to one particular node, so the root has node depth 0 and a leaf in a height-3 tree can have node depth 2.

## Beginner intuition

At each node, ask which child has the deeper subtree. The answer is one node for the current node plus that deeper child result.

\`\`\`mermaid
flowchart TD
  root["8<br/>height 3"] --> left["3<br/>height 2"]
  root --> right["10<br/>height 1"]
  left --> leaf["6<br/>height 1"]
  left --> empty["null<br/>height 0"]
\`\`\`

## Invariant and reasoning

Define \`height(null) = 0\`. For a real node, every downward path starts with that node and then continues through exactly one child, so \`height(node) = 1 + max(height(left), height(right))\`.

The helper below retains the exercise-oriented name \`depth\`, but it computes this node-counted tree height. Structural recursion computes the definition directly.

## TypeScript approach

\`\`\`ts
interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function depth(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }

  const leftDepth = depth(node.left);
  const rightDepth = depth(node.right);
  return 1 + Math.max(leftDepth, rightDepth);
}
\`\`\`

In the exercise's supplied \`maxDepth(values)\`, call \`buildTree(values)\` once and pass its root to this recursive logic. Node values never affect tree height.

## Complexity

Every node is visited once: O(n) time. The call stack is O(h), where \`h\` is the node-counted tree height above; a balanced tree has O(log n) height and a spine has O(n).

## Edge cases

An empty root returns 0, a leaf returns 1, and a one-sided tree follows its existing child. Zero and negative node values still count as nodes.

## Common mistakes

- Confusing node depth with tree height changes the unit and the answers.
- Adding left and right heights measures neither the longest path nor height.
- Inferring height from the level-order array length fails when children are missing.
- Assuming recursion is always O(log n) space ignores skewed trees.
  `.trim(),

  binarySearchTrees: `
## Before you start

A **binary search tree** (BST) orders every subtree: smaller values are left and larger values are right. This exercise ignores duplicate insertions. The ordering—not merely having two children—is what enables directed search.

## Beginner intuition

At a node, one comparison chooses the only possible branch. A smaller target cannot occur in the right subtree; a larger target cannot occur in the left.

\`\`\`mermaid
flowchart TD
  node["Compare target with current.value"] --> choice{"comparison"}
  choice -->|equal| found["Return true"]
  choice -->|smaller| left["current = current.left"]
  choice -->|larger| right["current = current.right"]
  left --> null{"current is null?"}
  right --> null
  null -->|yes| missing["Return false"]
  null -->|no| node
\`\`\`

## Invariant and reasoning

During search, if the target exists, it lies in the subtree rooted at \`current\`. The BST rule proves which opposite subtree can be discarded. During insertion, the same comparisons preserve the ordering when a new node is attached at the first null child.

## TypeScript approach

\`\`\`ts
class TreeNode {
  value: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;

  constructor(value: number) {
    this.value = value;
  }
}

export function bstContains(values: number[], target: number): boolean {
  let root: TreeNode | null = null;

  for (const value of values) {
    if (root === null) {
      root = new TreeNode(value);
      continue;
    }

    let current = root;
    while (value !== current.value) {
      const next = value < current.value ? current.left : current.right;
      if (next !== null) {
        current = next;
        continue;
      }
      if (value < current.value) {
        current.left = new TreeNode(value);
        break;
      }
      current.right = new TreeNode(value);
      break;
    }
  }

  let current = root;
  while (current !== null) {
    if (target === current.value) {
      return true;
    }
    current = target < current.value ? current.left : current.right;
  }
  return false;
}
\`\`\`

Nullable references model absent children without assertions. Equality ends insertion, implementing the duplicate policy.

## Complexity

One operation costs O(h). Building costs O(nh): O(n log n) for balanced shapes but O(n²) for a sorted insertion order. Stored nodes use O(n) space.

## Edge cases

Empty input returns false. The root may be the target. Repeated values do not create nodes. Negative, zero, and sorted values follow ordinary comparisons.

## Common mistakes

- Searching both children discards the BST advantage.
- Applying BST search to an ordinary binary tree is incorrect.
- Scanning the original array answers membership but bypasses the exercise.
- Claiming O(log n) without a balance guarantee ignores degenerate spines.
  `.trim(),

  heaps: `
## Before you start

A binary **min-heap** is a complete tree stored in an array. Index \`0\` is the root; index \`i\` has parent \`floor((i - 1) / 2)\`, left child index \`2i + 1\`, and right child index \`2i + 2\`.

Only the root is guaranteed globally smallest.

## Beginner intuition

For the kth largest value, keep only the best \`k\` candidates seen so far. A min-heap makes the weakest candidate—the smallest of those \`k\`—available at the root. A larger arrival replaces that root; a smaller arrival cannot belong in the final top \`k\`.

\`\`\`mermaid
flowchart TD
  value["Read next value"] --> room{"heap.length < k?"}
  room -->|yes| insert["Append and bubble up"]
  room -->|no| better{"value > heap[0]?"}
  better -->|yes| replace["Replace root and sift down"]
  better -->|no| skip["Ignore value"]
  insert --> invariant["Heap stores best k seen"]
  replace --> invariant
  skip --> invariant
\`\`\`

## Invariant and reasoning

After each input, the heap contains the largest \`min(k, processedCount)\` occurrences seen so far, including duplicates. Its root is their minimum. Once all values are processed, exactly \`k\` candidates remain, so their minimum is the kth value in descending order.

## TypeScript approach

\`\`\`ts
function swap(heap: number[], first: number, second: number): void {
  const firstValue = heap[first];
  const secondValue = heap[second];
  if (firstValue === undefined || secondValue === undefined) {
    return;
  }
  heap[first] = secondValue;
  heap[second] = firstValue;
}

function bubbleUp(heap: number[]): void {
  let index = heap.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    const value = heap[index];
    const parentValue = heap[parent];
    if (value === undefined || parentValue === undefined || value >= parentValue) {
      return;
    }
    swap(heap, index, parent);
    index = parent;
  }
}

function siftDown(heap: number[]): void {
  let index = 0;
  while (true) {
    const left = index * 2 + 1;
    const leftValue = heap[left];
    if (leftValue === undefined) {
      return;
    }
    const right = left + 1;
    const rightValue = heap[right];
    const child = rightValue !== undefined && rightValue < leftValue ? right : left;
    const value = heap[index];
    const childValue = heap[child];
    if (value === undefined || childValue === undefined || value <= childValue) {
      return;
    }
    swap(heap, index, child);
    index = child;
  }
}

export function kthLargest(nums: number[], k: number): number {
  const heap: number[] = [];

  for (const value of nums) {
    if (heap.length < k) {
      heap.push(value);
      bubbleUp(heap);
      continue;
    }
    const root = heap[0];
    if (root === undefined || value <= root) {
      continue;
    }
    heap[0] = value;
    siftDown(heap);
  }

  return heap[0] ?? 0;
}
\`\`\`

Array formulas connect the tree picture to operations: insertion appends at the next complete-tree position, then bubbles up; root replacement sifts down through the smaller child.

## Complexity

The heap never exceeds \`k\`. Each insertion or replacement is O(log k), so total time is O(n log k) and space is O(k).

## Edge cases

\`k = 1\` tracks the maximum; \`k = nums.length\` leaves the minimum at the root. Duplicate occurrences count separately, as required. Negative and multi-digit numbers use numeric comparisons.

## Common mistakes

- Treating the heap array as fully sorted is incorrect.
- Keeping a max-heap of size \`k\` exposes the wrong boundary candidate.
- Removing duplicates changes positional rank.
- Choosing the larger child while sifting down can violate min-heap order.
  `.trim(),

  graphs: `
## Before you start

A graph has vertices connected by edges. This exercise uses unweighted, undirected edges and arbitrary integer vertex ids.

An **adjacency list** stores neighbours. This implementation uses an object whose keys are strings, so numeric ids are converted deliberately with \`String(vertex)\`.

## Beginner intuition

Breadth-first search (BFS) explores concentric layers: distance 0, then 1, then 2. A FIFO queue ensures an item at distance \`d + 1\` cannot be processed before all earlier queued distance-\`d\` items.

\`\`\`mermaid
flowchart LR
  start["Enqueue start<br/>distance 0<br/>mark visited"] --> layer1["Enqueue unvisited neighbours<br/>distance 1"]
  layer1 --> layer2["Enqueue their unvisited neighbours<br/>distance 2"]
  layer2 --> target["First target dequeue<br/>shortest distance"]
\`\`\`

## Invariant and reasoning

Queue items are processed in nondecreasing distance. When discovering a neighbour from distance \`d\`, enqueue it with \`d + 1\` and add it to the **visited set** immediately.

That timing gives each vertex one queue entry at its earliest possible distance. Marking on dequeue would allow duplicate edges and cycles to enqueue it repeatedly.

## TypeScript approach

\`\`\`ts
interface QueueItem {
  vertex: number;
  distance: number;
}

export function shortestPath(
  edges: number[][],
  start: number,
  end: number,
): number {
  if (start === end) {
    return 0;
  }

  const neighbours: Record<string, number[] | undefined> = {};
  for (const edge of edges) {
    const from = edge[0];
    const to = edge[1];
    if (from === undefined || to === undefined) {
      continue;
    }
    const fromKey = String(from);
    const toKey = String(to);
    (neighbours[fromKey] ??= []).push(to);
    (neighbours[toKey] ??= []).push(from);
  }

  const visited: Record<string, true | undefined> = { [String(start)]: true };
  const queue: QueueItem[] = [{ vertex: start, distance: 0 }];
  let front = 0;

  while (front < queue.length) {
    const item = queue[front];
    front += 1;
    if (item === undefined) {
      continue;
    }

    for (const neighbour of neighbours[String(item.vertex)] ?? []) {
      if (visited[String(neighbour)] !== undefined) {
        continue;
      }
      const distance = item.distance + 1;
      if (neighbour === end) {
        return distance;
      }
      visited[String(neighbour)] = true;
      queue.push({ vertex: neighbour, distance });
    }
  }

  return -1;
}
\`\`\`

Nullish coalescing distinguishes a missing adjacency entry from a valid empty list. Strict \`undefined\` checks do not confuse vertex id \`0\` with absence.

## Complexity

Building and searching take O(V + E) time. The adjacency lists use O(V + E) space; queue and visited state use O(V).

## Edge cases

Equal start and end returns zero even if absent from the edge list. Duplicate edges and self-loops are harmless because visited marking occurs at enqueue time. Disconnected targets return \`-1\`; negative and nonconsecutive ids work as keys.

## Common mistakes

- Marking visited on dequeue permits repeated enqueues.
- DFS's first found path need not be shortest.
- BFS proves shortest edge count only for equal-weight edges.
- Adding only one direction incorrectly turns this undirected graph into a directed one.
  `.trim(),

  greedy: `
## Before you start

A **greedy algorithm** commits to a local choice without backtracking. It is correct only when a proof shows that choice cannot reduce the best final result.

Here each **half-open interval** \`[start, end)\` includes its start and excludes its end, so touching endpoints are compatible.

## Beginner intuition

Choose the compatible interval that finishes earliest. It frees the timeline as soon as possible, leaving at least as much room for future intervals as any other first choice.

\`\`\`mermaid
flowchart TD
  sort["Sort a copy by end time"] --> inspect["Inspect next interval"]
  inspect --> compatible{"start >= previousEnd?"}
  compatible -->|yes| accept["Count it<br/>previousEnd = end"]
  compatible -->|no| skip["Skip it"]
  accept --> inspect
  skip --> inspect
\`\`\`

## Invariant and reasoning

After scanning a prefix of finish-time order, the accepted intervals are compatible, and their count can be achieved with the earliest possible finishing boundary. Exchange argument: if an optimal schedule starts with a later-finishing compatible interval, replace it with the earlier-finishing choice; no later interval becomes unavailable.

## TypeScript approach

\`\`\`ts
export function maxNonOverlapping(intervals: number[][]): number {
  const ordered = [...intervals].sort(
    (left, right) =>
      (left[1] ?? Number.POSITIVE_INFINITY) -
      (right[1] ?? Number.POSITIVE_INFINITY),
  );
  let previousEnd = Number.NEGATIVE_INFINITY;
  let count = 0;

  for (const interval of ordered) {
    const start = interval[0];
    const end = interval[1];
    if (start === undefined || end === undefined || start < previousEnd) {
      continue;
    }
    count += 1;
    previousEnd = end;
  }

  return count;
}
\`\`\`

Sort a shallow copy so the caller's outer array is not reordered. Strict indexed checks make the tuple assumptions explicit; the exercise guarantees valid pairs.

## Complexity

Sorting costs O(n log n), the scan costs O(n), and the copied reference array costs O(n) space.

## Edge cases

Empty input returns zero. Negative endpoints work because the initial boundary is negative infinity. Duplicate intervals overlap each other, while \`start === previousEnd\` is accepted.

## Common mistakes

- Earliest start and shortest duration have counterexamples.
- Using \`>\` rejects intervals that merely touch.
- Sorting the original array introduces an unnecessary mutation.
- A greedy rule without an exchange argument is only a guess.
  `.trim(),

  backtracking: `
## Before you start

**Backtracking** performs depth-first search over decisions. For each input value, a subset has two branches: exclude it or include it. After exploring inclusion, undo that choice before returning.

## Beginner intuition

The mutable \`path\` is a whiteboard for the current branch. Write a choice, explore below it, then erase the choice so the sibling branch starts clean.

\`\`\`mermaid
flowchart TD
  state["Decision at index i"] --> exclude["Exclude nums[i]"]
  state --> include["Push nums[i]"]
  exclude --> nextA["Recurse at i + 1"]
  include --> nextB["Recurse at i + 1"]
  nextB --> undo["Pop nums[i]"]
\`\`\`

## Invariant and reasoning

On entry to \`walk(index)\`, \`path\` contains exactly the choices made for indices before \`index\`. The two calls enumerate all subsets without and with the current value. The \`pop\` restores the entry state. At \`index === nums.length\`, every decision is complete, so save a copy.

## TypeScript approach

\`\`\`ts
export function subsets(nums: number[]): number[][] {
  const results: number[][] = [];
  const path: number[] = [];

  function walk(index: number): void {
    if (index === nums.length) {
      results.push([...path]);
      return;
    }

    walk(index + 1);
    const value = nums[index];
    if (value === undefined) {
      return;
    }
    path.push(value);
    walk(index + 1);
    path.pop();
  }

  walk(0);
  return results;
}
\`\`\`

The copied array freezes each completed choice. The exercise guarantees distinct inputs, so no duplicate-skipping policy is needed.

## Complexity

There are 2ⁿ leaves. Copying paths of up to \`n\` values makes output-sensitive time and output space O(n × 2ⁿ). Active recursion and the path use O(n) additional space.

## Edge cases

Empty input has one subset, \`[]\`. One value produces two subsets. Negative, zero, and unsorted values do not change the decision structure.

## Common mistakes

- Saving \`path\` itself stores one mutable array repeatedly.
- Forgetting \`pop\` leaks a choice into sibling branches.
- Saving at every internal node can duplicate or omit subsets.
- Expecting polynomial time is impossible when all 2ⁿ outputs are required.
  `.trim(),

  dynamicProgramming: `
## Before you start

**Dynamic programming** stores answers to overlapping subproblems. **Memoisation** stores them during top-down recursion; a **bottom-up table** fills them from known base cases.

For stairs, define \`ways(n)\` as the number of ordered sequences of 1-step and 2-step moves that total exactly \`n\`.

## Beginner intuition

Every route to stair \`n\` ends with either a 1-step move from \`n - 1\` or a 2-step move from \`n - 2\`. Those cases are disjoint, so add their counts.

\`\`\`mermaid
flowchart LR
  ways1["ways(1) = 1"] --> ways3["ways(3) = 3"]
  ways2["ways(2) = 2"] --> ways3
  ways2 --> ways4["ways(4) = 5"]
  ways3 --> ways4
\`\`\`

## Invariant and reasoning

The recurrence is \`ways(n) = ways(n - 1) + ways(n - 2)\` with exercise bases \`ways(1) = 1\` and \`ways(2) = 2\`. Before each loop iteration, \`previous\` and \`current\` hold the answers for the two preceding stair numbers. Compute \`next\` before shifting them.

This sequence is Fibonacci-shaped but uses a different index convention: with \`F(0) = 0\` and \`F(1) = 1\`, \`ways(n) = F(n + 1)\`. Some combinatorics texts define \`ways(0) = 1\`; this exercise starts at \`n = 1\`, so its stated bases control the implementation.

## TypeScript approach

\`\`\`ts
export function climbStairs(n: number): number {
  if (n === 1) {
    return 1;
  }
  if (n === 2) {
    return 2;
  }

  let previous = 1;
  let current = 2;
  for (let stair = 3; stair <= n; stair += 1) {
    const next = previous + current;
    previous = current;
    current = next;
  }

  return current;
}
\`\`\`

The exercise guarantees \`1 <= n <= 45\`, so no out-of-domain branch or big-integer representation is required.

## Complexity

The loop takes O(n) time. Keeping two prior answers uses O(1) auxiliary space; a memo table would use O(n).

## Edge cases

\`n = 1\` and \`n = 2\` return directly. Order matters, so \`1 + 2\` and \`2 + 1\` are separate ways. The maximum exercise result remains a safe JavaScript integer.

## Common mistakes

- Using Fibonacci's \`F(1) = 1, F(2) = 1\` bases shifts every stair answer.
- Updating \`previous\` before computing \`next\` loses a needed value.
- Plain recursion repeats subproblems exponentially.
- Enumerating paths spends space on sequences when only the count is needed.
  `.trim(),

  tries: `
## Before you start

A **trie** stores strings one character per edge. Nodes hold character-keyed \`children\` and an \`isWord\` flag. The flag distinguishes a complete inserted word from a prefix that merely has descendants.

## Beginner intuition

\`cat\` and \`car\` share the path \`c → a\`, then branch. Following every character proves that a prefix path exists; only \`isWord === true\` proves the complete query was inserted.

\`\`\`mermaid
flowchart TD
  root["root<br/>isWord false"] --> c["c"]
  c --> a["a"]
  a --> t["t<br/>isWord true"]
  a --> r["r<br/>isWord true"]
\`\`\`

## Invariant and reasoning

During insertion or lookup, after processing \`i\` characters, \`current\` is the node representing the prefix ending at index \`i - 1\`. Insertion creates a missing child before moving. Lookup fails immediately on a missing child. After all characters, exact lookup returns \`current.isWord\`.

## TypeScript approach

\`\`\`ts
interface TrieNode {
  children: Record<string, TrieNode | undefined>;
  isWord: boolean;
}

function createNode(): TrieNode {
  return { children: {}, isWord: false };
}

export function wordsFound(words: string[], queries: string[]): boolean[] {
  const root = createNode();

  for (const word of words) {
    let current = root;
    for (const character of word) {
      const child = current.children[character] ?? createNode();
      current.children[character] = child;
      current = child;
    }
    current.isWord = true;
  }

  const results: boolean[] = [];
  for (const query of queries) {
    let current: TrieNode | undefined = root;
    for (const character of query) {
      if (current === undefined) {
        break;
      }
      current = current.children[character];
    }
    results.push(current?.isWord === true);
  }

  return results;
}
\`\`\`

The field name is consistently \`isWord\`, matching the lesson. Character strings are natural object keys, and strict undefined checks distinguish a missing child from an existing node.

## Complexity

Insertion and lookup are O(L) per string of length \`L\`. Across the exercise, time is O(total characters in words and queries), and trie space is O(total distinct inserted-prefix characters).

## Edge cases

The empty string uses the root's \`isWord\` flag. Duplicate words simply set the same flag again. Matching is case-sensitive, and duplicate queries produce duplicate booleans in output order.

## Common mistakes

- Returning true after following a prefix without checking \`isWord\` accepts \`car\` after only \`carpet\` was inserted.
- Sharing one children object among nodes merges unrelated branches.
- Using inconsistent end-marker field names causes mismatched lookup logic; use \`isWord\` throughout.
- Scanning all words for every query misses the trie traversal goal.
  `.trim(),
} as const;

const explain = (
  before: string,
  idea: string,
  chart: string,
  code: string,
  approach: string,
  mistakes: readonly string[],
): string => {
  const lines = [
    "## Before you start",
    "",
    before,
    "",
    "## The simple idea",
    "",
    idea,
    "",
    "```mermaid",
    chart.trim(),
    "```",
    "",
    "## Reusable TypeScript shape",
    "",
    "The example below shows the reusable shape. Trace it once by hand, then adapt the named rule to the exercise.",
    "",
    "```ts",
    code.trim(),
    "```",
    "",
    "## How to approach the task",
    "",
    approach,
    "",
    "## Common mistakes",
    "",
  ];

  for (const mistake of mistakes) {
    lines.push(`- ${mistake}`);
  }

  return lines.join("\n").trim();
};

export const stepBitesize = {
  pairCost: explain(
    "A pair is two different indexes `i < j`. The order matters only to say which index is left; `(i, j)` and `(j, i)` must not both be visited.\n\nThis **pair enumeration** has `n(n - 1) / 2` pairs for `n` values, so any algorithm that deliberately examines every pair takes O(n²) time.",
    "**Invariant:** before an inner-loop iteration, every pair ending before `j` for the current `i` has been checked exactly once. Start `j` at `i + 1`; this excludes self-pairs and reversed duplicates. For each pair, apply the exercise predicate: `nums[i] < nums[j]` for ascending pairs or `nums[i] === nums[j]` for equal pairs.",
    `flowchart LR
  values["n values"] --> outer["Outer index i"]
  outer --> inner["Inner index j, starting at i + 1"]
  inner --> pair["One pair, then the next"]`,
    `export function countAscendingPairs(nums: number[]): number {
  let count = 0;
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = i + 1; j < nums.length; j += 1) {
      const left = nums[i];
      const right = nums[j];
      if (left !== undefined && right !== undefined && left < right) {
        count += 1;
      }
    }
  }
  return count;
}`,
    "**Plan:** initialise `count` to 0, enumerate all `i < j`, and increment only when the requested comparison is true. To solve equal pairs, change only `<` to `===`.\n\n**Complexity:** the triangle contains O(n²) comparisons and uses O(1) extra space. Empty and one-element arrays perform no inner iterations and return 0. Under `noUncheckedIndexedAccess`, indexed values can be typed as possibly `undefined`; here both indexes are guarded by the loop bounds, although a local value check may be needed in standalone strict TypeScript.",
    [
      "Starting the inner loop at 0 counts each pair twice and also pairs a value with itself.",
      "A closed formula can match the tests and hide the loops this lesson wants you to see.",
      "Two loops written one after another are still linear. The quadratic cost is the nesting.",
    ],
  ),
  arrayShifts: explain(
    "Array lookup is O(1), but a middle edit moves the suffix. These exercises require a distinct result, so treat `nums` as read-only: visit each original value and write a new array.\n\nNormalise insertion indexes with `Math.max(0, Math.min(index, nums.length))`; removal indexes outside `0..length - 1` remove nothing.",
    "**Invariant:** after processing original indexes before `i`, `result` contains exactly their final order. Removal skips one valid index. Insertion writes the new value immediately before the first original value at the clamped index, or after the loop when inserting at `nums.length`.",
    `flowchart LR
  source["[A, B, C, D]"] --> skip["Skip B"]
  skip --> copy["[A, C, D]"]`,
    `export function insertAt(
  nums: number[],
  index: number,
  value: number,
): number[] {
  const insertionIndex = Math.max(0, Math.min(index, nums.length));
  const result: number[] = [];
  for (let i = 0; i <= nums.length; i += 1) {
    if (i === insertionIndex) {
      result.push(value);
    }
    const current = nums[i];
    if (current !== undefined) {
      result.push(current);
    }
  }
  return result;
}`,
    "**Insertion:** clamp once, loop through `i === nums.length`, and insert before copying `nums[i]`; the extra iteration handles append and an empty array. **Removal:** loop only through existing indexes and copy when `i !== index`. An invalid removal index therefore copies every value.\n\nBoth operations take O(n) time and O(n) output space. `slice()` is suitable for copying but `splice()` mutates. Checking an indexed value against `undefined` keeps the insertion example safe under strict indexed access.",
    [
      "Mutating the input with splice changes the caller's array. These exercises want a new array.",
      "An off-by-one writes the new value one slot early or drops the value that should have stayed.",
      "Forgetting the tail after the edit point returns only the head.",
    ],
  ),
  frequencyCounts: explain(
    "A **frequency count** stores `value -> occurrences`. JavaScript object keys are strings, so convert numeric values consistently with `String(value)`.\n\nA direct counter is enough for one target; a table is useful when all values compete for most frequent.",
    "**Invariant:** after index `i`, the table contains exact counts for the processed prefix. For `mostFrequent`, scanning left to right gives a simple tie rule: replace the winner only when the current value's updated count is strictly greater than the best count. Equal counts leave the earlier winner unchanged.",
    `flowchart LR
  scan["Read the next value"] --> bump["Add one to its count"]
  bump --> best["Replace the winner only on a stricter rule"]`,
    `export function mostFrequent(nums: number[]): number {
  const counts: Record<string, number> = {};
  for (const value of nums) {
    const key = String(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  let bestValue = nums[0] ?? 0;
  let bestCount = -1;
  for (const value of nums) {
    const count = counts[String(value)] ?? 0;
    if (count > bestCount) {
      bestValue = value;
      bestCount = count;
    }
  }
  return bestValue;
}`,
    "For `frequencyOf`, initialise one counter and increment when `value === target`; it returns 0 for an empty array. For `mostFrequent`, first finish every final count, then scan the original array left to right and replace the winner only on a strictly larger final count. This second pass is what handles `[1, 2, 2, 1]`: both final counts are 2, so the first value, 1, wins.\n\nBoth are O(n) time. The target counter uses O(1) space; the full table uses O(u), where `u` is the number of distinct values.",
    [
      "Replacing the winner on an equal count picks the later value and fails the tie rule.",
      "Reading `counts[key] + 1` before a key exists produces `NaN`; use `(counts[key] ?? 0) + 1`.",
      "A nested loop that recounts from scratch is correct but hides the linear-time frequency-table pattern.",
    ],
  ),
  inwardScan: explain(
    "Set `left = 0` and `right = nums.length - 1`. These **inward pointers** bound the inclusive active range from `left` to `right`.\n\nContinue while `left < right`, because the exercises need two distinct indexes for a pair and a centre value already matches itself in a palindrome.",
    "**Palindrome invariant:** everything outside the pointers has matched; compare the ends and either return false or move both. **Sorted-sum invariant:** if a solution remains, it lies inside the current range. A sum below target lets you discard the smallest value by moving `left`; a sum above target lets you discard the largest by moving `right`.",
    `flowchart LR
  left["Left index"] --> compare["Compare the ends"]
  right["Right index"] --> compare
  compare --> move["Move exactly one pointer, or both on a match"]`,
    `export function endsMatch(nums: number[]): boolean {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    if (nums[left] !== nums[right]) {
      return false;
    }
    left += 1;
    right -= 1;
  }
  return true;
}`,
    "For `pairIndices`, compute `const sum = (nums[left] ?? 0) + (nums[right] ?? 0)`. Return `[left, right]` immediately on equality; otherwise move exactly the pointer justified by sorted order. This also preserves the test's required first pair from the inward scan.\n\nEach algorithm is O(n) time and O(1) extra space. Empty and one-value arrays skip the loop. Palindrome returns true; pair search returns `[-1, -1]`.",
    [
      "Moving both pointers on a sum that is only too small skips the pair that would have worked.",
      "Using the same element twice, when left === right, is not a pair of different indexes.",
      "The sum rule is wrong on unsorted data. Sort first or do not use this walk.",
    ],
  ),
  variableWindow: explain(
    "A **variable window** is the contiguous inclusive range `[left, right]`. Its length is `right - left + 1`.\n\nBecause every value is non-negative, extending right cannot lower the sum and removing the left value cannot raise it. That monotonic fact makes this sliding window safe to shrink.",
    "**Invariant:** `sum` equals the values currently between `left` and `right`. Add the entering right value first. For the shortest sum at least target, record a candidate while it qualifies, then shrink to seek a shorter one. For the longest sum at most target, shrink while it is too large, then record the valid length.",
    `flowchart LR
  grow["Add nums at right"] --> check{"Sum still inside the rule?"}
  check -->|no| shrink["Subtract nums at left and move left"]
  check -->|yes| record["Record the length"]
  shrink --> check`,
    `export function shortestAtLeast(nums: number[], target: number): number {
  let left = 0;
  let sum = 0;
  let shortest = Number.POSITIVE_INFINITY;
  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right] ?? 0;
    while (sum >= target) {
      shortest = Math.min(shortest, right - left + 1);
      sum -= nums[left] ?? 0;
      left += 1;
    }
  }
  return Number.isFinite(shortest) ? shortest : 0;
}`,
    "For `longestAtMost`, use the same variables but shrink with `while (sum > target)`, then set `longest = Math.max(longest, right - left + 1)`. Initialise `longest` to 0. The shortest version uses infinity as a clear “not found” sentinel and converts it to 0.\n\nEach index enters once and leaves at most once: O(n) time and O(1) space. This proof and algorithm fail for negative values because removing the left edge may increase the sum relative to future choices.",
    [
      "Moving the left pointer backward revisits values and can turn the scan into quadratic work.",
      "Recording a length before the sum qualifies reports a slice that fails the test.",
      "Negative numbers break the 'shrink fixes the sum' story. These exercises do not include them.",
    ],
  ),
  listWalks: explain(
    "Build the linked list first, then work only through `next`; indexing the original array avoids the intended skill. Both **slow and fast pointers** start at `head`.\n\nReturn `-1` immediately when `head === null`. For nth-from-end, also reject `n < 1` before moving either pointer.",
    "**Middle invariant:** after `t` iterations, slow has moved `t` nodes and fast has moved `2t`; loop while `fast !== null && fast.next !== null`. This stops slow on the second middle for even lengths. **Nth invariant:** advance fast exactly `n` steps, then move both one step until fast is null. Their gap stays `n`, so slow is the nth node from the end.",
    `flowchart LR
  fast["Fast pointer, head start"] --> step["Both move one node"]
  slow["Slow pointer"] --> step
  step --> answer["Slow pointer is the node you want"]`,
    `interface ListNode {
  value: number;
  next: ListNode | null;
}

function middleNode(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow?.next ?? null;
    fast = fast.next.next;
  }
  return slow;
}`,
    "For `middleValue`, return `middleNode(head)?.value ?? -1`. For `nthFromEnd`, perform the head start in a `for` loop. If fast becomes null before all `n` steps are completed, `n` exceeds the length; after a valid head start, move both until fast is null and return `slow?.value ?? -1`.\n\nEach method is O(n) time and O(1) extra space. Optional chaining is useful for a nullable slow pointer, but never read `.next` until a null guard has narrowed the node.",
    [
      "Reading values[length - n] uses the array and skips the pointers.",
      "A head start of n - 1 or n + 1 returns the neighbour of the node you wanted.",
      "On an even length, stopping on the first middle fails the second-middle rule.",
    ],
  ),
  stackMemory: explain(
    "A stack uses the array's end: `push` adds and `pop` removes the most recent item. Backspace stores kept characters.\n\nNext greater uses a **monotonic stack** of indexes, not values, because each answer must be written back to its original position.",
    "**Monotonic-stack invariant:** waiting indexes are ordered so their values are non-increasing from bottom to top. At a new value, repeatedly inspect the top. While the new value is strictly greater, pop that index and set its answer to the new value. Stop at an equal or larger top, then push the new index.",
    `flowchart LR
  next["Next value"] --> top{"Greater than the stack top?"}
  top -->|yes| pop["Pop and record the answer"]
  top -->|no| push["Push this index"]
  pop --> top`,
    `export function nextGreater(nums: number[]): number[] {
  const answers = new Array<number>(nums.length).fill(-1);
  const waiting: number[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index] ?? 0;
    while (waiting.length > 0) {
      const topIndex = waiting[waiting.length - 1];
      if (topIndex === undefined || (nums[topIndex] ?? 0) >= value) {
        break;
      }
      answers[topIndex] = value;
      waiting.pop();
    }
    waiting.push(index);
  }
  return answers;
}`,
    'The first greater value resolves an index when encountered; popping it ensures a later, possibly larger value cannot replace the required first one. Equal values stay waiting because “greater” is strict. Unresolved indexes correctly keep `-1`.\n\nFor backspaces, push ordinary characters; on `#`, call `pop()` only when the stack is non-empty, then `join("")`.\n\nEach item enters and leaves at most once, so **amortized analysis** gives O(n) time. Both algorithms use O(n) auxiliary space. Guard the top index because strict TypeScript types array indexing as possibly undefined.',
    [
      "Storing only values loses the original index where the answer belongs.",
      "Using >= instead of > treats an equal neighbour as the next greater value.",
      "Recording the index instead of the value answers a different question.",
    ],
  ),
  queueLines: explain(
    "Validate `k` first: return `[]` when `k < 1` or `k > nums.length`. Negative counts need one counter. Sliding-window maximum needs a monotonic deque of indexes.\n\nThe example stores deque positions in an object with front and back counters so both-end removal stays O(1).",
    "**Deque mechanics for each index `i`:** (1) expire the front while its index is `<= i - k`; (2) pop from the back while its value is less than or equal to the entering value, because the newer index lasts longer and is at least as useful; (3) push `i`; (4) once `i >= k - 1`, the value at the front index is the window maximum. The deque's indexes increase front-to-back while their values decrease.",
    `flowchart LR
  enter["New index enters"] --> dropBack["Drop smaller indexes from the back"]
  dropBack --> front["Front index is the current max"]
  front --> leave["Drop the front when it leaves the window"]`,
    `export function maxInWindow(nums: number[], k: number): number[] {
  if (k < 1 || k > nums.length) {
    return [];
  }
  const deque: Record<string, number> = {};
  const result: number[] = [];
  let front = 0;
  let back = 0;
  for (let index = 0; index < nums.length; index += 1) {
    while (front < back) {
      const frontIndex = deque[String(front)];
      if (frontIndex !== undefined && frontIndex > index - k) {
        break;
      }
      delete deque[String(front)];
      front += 1;
    }
    while (front < back) {
      const position = back - 1;
      const backIndex = deque[String(position)];
      if (
        backIndex !== undefined &&
        (nums[backIndex] ?? 0) > (nums[index] ?? 0)
      ) {
        break;
      }
      delete deque[String(position)];
      back -= 1;
    }
    deque[String(back)] = index;
    back += 1;
    if (index >= k - 1) {
      const frontIndex = deque[String(front)];
      result.push(nums[frontIndex ?? index] ?? 0);
    }
  }
  return result;
}`,
    "For `negativeCounts`, add whether the entering value is negative, subtract the leaving value once `index >= k`, and record after the first complete window at `index >= k - 1`. For maxima, indexes are essential: values alone cannot tell whether the front has expired.\n\nEach index enters and leaves the deque at most once, so the maximum algorithm is O(n) time and O(k) live auxiliary space. Avoid `shift()` on every window because reindexing an array front can make the implementation O(nk).",
    [
      "Forgetting to drop the front index keeps a maximum that has already left the window.",
      "Removing only one smaller back value breaks the decreasing invariant; keep popping in a while loop.",
      "Recording before the window reaches k elements emits extra partial-window answers.",
    ],
  ),
  twoCalls: explain(
    "Recursion needs a smaller subproblem and a base case. Each unfinished recursive call occupies a **call stack** frame.\n\nThis lesson contains two different structures. Fibonacci recurses over integer sizes with `fib(1) = fib(2) = 1`. Nested arrays recurse over contained values with numbers at depth 0.",
    "**Do not confuse nested-array depth with binary-tree height.** Nested depth counts array containers: `depth(number) = 0` and `depth(array) = 1 + max(depth(child))`, with an empty maximum treated as 0, so `depth([]) = 1`. Tree height counts tree nodes along a root-to-leaf path and uses null as height 0. They resemble each other but have different inputs and base cases.",
    `flowchart TD
  fib5["fib of 5"] --> fib4["fib of 4"]
  fib5 --> fib3["fib of 3"]
  fib4 --> again["fib of 3, computed again"]`,
    `type Nested = number | Nested[];

export function nestedDepth(value: Nested): number {
  if (typeof value === "number") {
    return 0;
  }
  let deepestChild = 0;
  for (const child of value) {
    deepestChild = Math.max(deepestChild, nestedDepth(child));
  }
  return 1 + deepestChild;
}`,
    'For Fibonacci, return 1 when `n <= 2`; otherwise return `fib(n - 1) + fib(n - 2)`. For nesting, narrow with `typeof value === "number"` before iteration; TypeScript then knows the remaining value is `Nested[]`. Sibling depths use `Math.max`, not addition.\n\nNested depth visits each nested value once: O(N) time and O(d) call-stack space for nesting depth `d`. Naive Fibonacci repeats states, taking O(2ⁿ) time and O(n) stack space; that inefficiency is intentional here. Later, **memoisation** removes the repeated states.',
    [
      "Forgetting the base case overflows the call stack.",
      "Treating an empty array as depth 0 misses the array level the tests count.",
      "Using binary-tree terms such as left/right or null for nested arrays applies the wrong structure.",
    ],
  ),
  searchBounds: explain(
    "This explanation uses an inclusive range: `lo = 0`, `hi = nums.length - 1`, and continues while `lo <= hi`. The lesson reading also presents the equivalent **half-open interval** convention.\n\nDuplicates mean a found target is a candidate, not necessarily the boundary answer. Keep `answer = -1` until a match is seen.",
    "**Invariant:** if the requested first or last target exists and has not already been saved, it remains in `[lo, hi]`; `answer` is the best matching boundary seen so far. Read `mid = lo + Math.floor((hi - lo) / 2)`. Too small discards through `mid`; too large discards from `mid`; equality saves `mid` and deliberately searches one side.",
    `flowchart TD
  range["lo to hi still inclusive"] --> mid["Read the middle"]
  mid --> match{"Equal to the target?"}
  match -->|yes, want the first| left["Save mid and set hi to mid - 1"]
  match -->|yes, want the last| right["Save mid and set lo to mid + 1"]
  match -->|no| discard["Discard the half that cannot hold it"]`,
    `export function firstEqual(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  let answer = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = nums[mid];
    if (value === target) {
      answer = mid;
      hi = mid - 1;
      continue;
    }
    if (value !== undefined && value < target) {
      lo = mid + 1;
      continue;
    }
    hi = mid - 1;
  }
  return answer;
}`,
    "For `lastEqual`, equality changes `lo = mid + 1`; all other comparisons stay the same. Every branch excludes `mid`, so the interval strictly shrinks. Empty input begins with `hi = -1` and returns `-1`.\n\nTime is O(log n), space O(1). The bounds prove `nums[mid]` exists at runtime, but strict indexed access still includes `undefined`; explicitly guard it as shown.",
    [
      "Setting hi to mid, instead of mid - 1, can leave the range unchanged and loop.",
      "Searching the wrong direction after a match returns the other end of the duplicate run.",
      "Binary search on unsorted data is not almost right. The discarded half may hold the target.",
    ],
  ),
  sortChoices: explain(
    "Non-decreasing order means `nums[i - 1] <= nums[i]` for every valid `i`. Checking that property is O(n). Bubble sort creates it by repeatedly swapping adjacent inversions on a copy; the exercises disallow `.sort()` so those mechanics remain visible.",
    "**Bubble-pass invariant:** after pass `p`, the `p` largest values are in their final positions at the right. During a pass, comparing through `copy.length - 1 - p` moves the largest remaining value rightward. If a whole pass makes no swap, every adjacent pair is ordered and the algorithm can stop.",
    `flowchart LR
  pair["Two neighbours"] --> wrong{"Left greater than right?"}
  wrong -->|yes| swap["Swap them"]
  wrong -->|no| next["Look at the next pair"]
  swap --> next`,
    `export function bubbleSort(nums: number[]): number[] {
  const copy = nums.slice();
  for (let pass = 0; pass < copy.length - 1; pass += 1) {
    let swapped = false;
    for (let index = 0; index < copy.length - 1 - pass; index += 1) {
      const left = copy[index];
      const right = copy[index + 1];
      if (left === undefined || right === undefined || left <= right) {
        continue;
      }
      copy[index] = right;
      copy[index + 1] = left;
      swapped = true;
    }
    if (!swapped) {
      break;
    }
  }
  return copy;
}`,
    "For `isSorted`, scan from index 1 and return false on the first `nums[i - 1] > nums[i]`; if no descent exists, return true. Empty and one-value arrays are therefore sorted.\n\nChecking is O(n) time and O(1) space. Bubble sort is O(n²) worst-case, O(n) best-case with the no-swap exit, and O(n) output space for the required copy. Strict TypeScript needs guards for indexed neighbours even though the loop bounds establish them.",
    [
      "Calling the built-in sort skips the swaps and fails the exercise that disallows it.",
      "Sorting the input in place surprises a caller who still holds the original array.",
      "A string comparison orders 10 before 2. These exercises want numeric order.",
    ],
  ),
  treeCounts: explain(
    "Use the supplied `buildTree(values)` once, then recurse over nodes rather than level-order indexes. `null` represents no node and contributes 0. A leaf is an existing node whose `left` and `right` are both null.",
    "**Recurrences:** `leafCount(null) = 0`; `leafCount(leaf) = 1`; otherwise it is `leftCount + rightCount`. For sums, `treeSum(null) = 0` and `treeSum(node) = node.value + treeSum(left) + treeSum(right)`. These are totals across both branches, unlike height, which chooses only the larger child.",
    `flowchart TD
  node["Current node"] --> leaf{"Any children?"}
  leaf -->|no| one["Count 1, or add the value"]
  leaf -->|yes| both["Add the left result and the right result"]`,
    `interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

function leafCountFrom(root: TreeNode | null): number {
  if (root === null) {
    return 0;
  }
  if (root.left === null && root.right === null) {
    return 1;
  }
  return leafCountFrom(root.left) + leafCountFrom(root.right);
}`,
    "The exported exercise function is a small wrapper around `buildTree` and its recursive helper. For `treeSum`, keep the null base case but replace the leaf special case with `root.value +` both recursive sums; negative values require no special handling.\n\nBoth visit each of `n` nodes once: O(n) time. The call stack is O(h), where `h` is tree height: O(log n) for a balanced tree and O(n) for a spine.",
    [
      "Counting null children as leaves inflates the answer.",
      "Returning the node value from the leaf count mixes the two exercises.",
      "Forgetting one child drops a whole branch from the total.",
    ],
  ),
  bstShape: explain(
    "A binary search tree's shape is determined by insertion order; it is not automatically balanced. For each value, begin at the root, move left when smaller and right when larger, and attach at the first null link.\n\nThus `[1, 2, 3]` forms `1 -> right 2 -> right 3`, while `[2, 1, 3]` gives a root with two children.",
    "**Height recurrence:** `height(null) = 0`; `height(node) = 1 + max(height(left), height(right))`. Height counts nodes here, so a leaf is 1 and the three-node spine is 3. **Search invariant:** after each comparison, only the chosen subtree can contain the target under the BST ordering.",
    `flowchart LR
  subgraph Balanced["Insert 2, 1, 3: height 2"]
    b2["2"] --> b1["1"]
    b2 --> b3["3"]
  end
  subgraph Spine["Insert 1, 2, 3: height 3"]
    s1["1"] -->|right| s2["2"]
    s2 -->|right| s3["3"]
  end`,
    `interface BstNode {
  value: number;
  left: BstNode | null;
  right: BstNode | null;
}

function heightOf(root: BstNode | null): number {
  if (root === null) {
    return 0;
  }
  return 1 + Math.max(heightOf(root.left), heightOf(root.right));
}`,
    "Build by calling your insert helper for every input value in order. `bstHeight` then applies the recurrence. `bstContainsShaped` starts at the root, returns true on equality, otherwise reassigns `current` to one child until it becomes null.\n\nBuilding costs O(nh) in the worst case for final height `h`, and one search costs O(h). Here `h` is O(log n) when balanced but O(n) for sorted insertion. If duplicates are allowed, insertion needs one consistent policy; the provided examples do not rely on duplicates.",
    [
      "Sorting before insert balances the values and reports the wrong height.",
      "Counting edges instead of nodes makes a single node look like height 0.",
      "Scanning the array with includes builds no tree.",
    ],
  ),
  heapLayout: explain(
    "A heap's **shape** is a complete binary tree: levels fill top-to-bottom and left-to-right. Its **order** property, such as parent <= children in a min-heap, is separate and is not tested here.\n\nCompleteness lets each parent and **child index** map directly to contiguous zero-based array positions without pointers.",
    "At index `i`, left and right children occupy the next level at `2 * i + 1` and `2 * i + 2`. Solving either child formula backward gives the shared parent `Math.floor((i - 1) / 2)` for every `i > 0`. Root index 0 and negative indexes have no parent in the exercise.",
    `flowchart TD
  i0["0: root"] -->|"2(0)+1"| i1["1: left"]
  i0 -->|"2(0)+2"| i2["2: right"]
  i1 -->|"2(1)+1"| i3["3: left"]
  i1 -->|"2(1)+2"| i4["4: right"]
  i2 --> i5["5"]
  i2 --> i6["6"]`,
    `export function parentIndex(index: number): number {
  if (index <= 0) {
    return -1;
  }
  return Math.floor((index - 1) / 2);
}

export function childIndexes(index: number): number[] {
  return [2 * index + 1, 2 * index + 2];
}`,
    "Apply the formulas to indexes, not stored values. For index 1, parent is 0 and children are `[3, 4]`; for index 2, children are `[5, 6]`. The child exercise intentionally has no array length, so return formula results even if no particular heap currently contains those positions.\n\nEach operation is O(1) time. `childIndexes` allocates only its required two-element output. Parent validation must happen before flooring, because `Math.floor((-1) / 2)` would misleadingly produce -1 only for root and says nothing about other invalid negatives.",
    [
      "Using 2 * i without the + 1 points at the parent again.",
      "Returning the child value instead of the child index answers a different question.",
      "Rejecting an index past the array length hides the formula the tests call on its own.",
    ],
  ),
  visitedWalks: explain(
    "Build an **adjacency list** before searching. Every undirected edge `[a, b]` adds `b` to `a`'s list and `a` to `b`'s list.\n\nA plain object can hold both neighbour arrays and the **visited set** flags. Missing adjacency means the vertex is isolated.",
    "**Search invariant:** every queued vertex is already marked, and every marked vertex is reachable from `start`. Mark on enqueue, not dequeue, so a cycle cannot enqueue the same vertex repeatedly. Initialise with the start marked and queued; therefore an isolated start correctly has component size 1.",
    `flowchart LR
  start["Start vertex"] --> mark["Mark it visited"]
  mark --> neighbours["Enqueue unmarked neighbours"]
  neighbours --> mark`,
    `export function componentSize(edges: number[][], start: number): number {
  const graph: Record<string, number[]> = {};
  for (const edge of edges) {
    const from = edge[0];
    const to = edge[1];
    if (from === undefined || to === undefined) {
      continue;
    }
    (graph[String(from)] ??= []).push(to);
    (graph[String(to)] ??= []).push(from);
  }
  const visited: Record<string, true> = { [String(start)]: true };
  const queue = [start];
  for (let front = 0; front < queue.length; front += 1) {
    const vertex = queue[front];
    if (vertex === undefined) {
      continue;
    }
    for (const neighbour of graph[String(vertex)] ?? []) {
      if (visited[String(neighbour)] === true) {
        continue;
      }
      visited[String(neighbour)] = true;
      queue.push(neighbour);
    }
  }
  return queue.length;
}`,
    "`componentSize` can return the number of enqueued vertices because each is enqueued exactly once. For `reachesAll`, perform the same walk and compare that size with `count`; the problem guarantees vertices and start are in `0..count - 1`.\n\nBuilding and walking are O(V + E) time and O(V + E) space. A front cursor avoids the reindexing cost of repeated `shift()`. Guard the two edge entries and queued lookup for strict indexed access.",
    [
      "Marking on dequeue lets the same neighbour sit in the queue many times.",
      "Storing the edge in only one direction makes an undirected graph look one-way.",
      "Forgetting to count the start reports 0 for an isolated vertex.",
    ],
  ),
  greedyChecks: explain(
    "A greedy algorithm commits to a locally justified fact. These exercises use two unrelated facts.\n\nEarliest finish compares each **half-open interval** by its end, breaking equal ends by the smaller start. Jump game tracks the farthest reachable index rather than choosing a particular jump path.",
    "**Earliest-finish invariant:** `best` is the required interval among those scanned. **Jump invariant:** before processing index `i`, `farthest` is the largest index reachable using positions before `i`. If `i > farthest`, index `i` is unreachable and no later position can repair the gap. Otherwise extend with `Math.max(farthest, i + nums[i])`.",
    `flowchart LR
  far["Farthest reach so far"] --> here["Current index"]
  here --> stuck{"Index past the reach?"}
  stuck -->|yes| noPath["Cannot reach the end"]
  stuck -->|no| extend["Extend the reach by the jump length"]`,
    `export function canJump(nums: number[]): boolean {
  if (nums.length === 0) {
    return false;
  }
  let farthest = 0;
  for (let index = 0; index < nums.length; index += 1) {
    if (index > farthest) {
      return false;
    }
    farthest = Math.max(farthest, index + (nums[index] ?? 0));
    if (farthest >= nums.length - 1) {
      return true;
    }
  }
  return true;
}`,
    "For `earliestFinish`, return `[]` for no intervals. Otherwise start from the first pair and replace it only when `end < bestEnd` or when ends match and `start < bestStart`; return a new two-value array if callers should not share input storage. The tests provide valid pairs.\n\nBoth scans are O(n) time and O(1) auxiliary space. A one-value jump array succeeds immediately; an empty one is false. Check reachability before using the current jump.",
    [
      "Treating touching intervals as overlaps rejects a schedule the half-open rule allows.",
      "Updating the reach before you notice you are already stuck can skip past a zero.",
      "Sorting intervals by start time is the rule a long early meeting breaks.",
    ],
  ),
  orderMatters: explain(
    "Backtracking explores a decision tree. A state consists of `path` plus a `used` flag for each input index. At every level, try unused indexes from left to right; this produces the exact order expected by the tests. Distinct input values mean index-based flags produce no duplicate answers.",
    "**Invariant:** `path` contains exactly the values whose indexes are marked used, with no index repeated. Choose by marking and pushing, recurse, then undo in reverse order by popping and unmarking. Record `path.slice()` at the target length so later undo cannot mutate a saved result.",
    `flowchart TD
  choice["Pick an unused value"] --> explore["Recurse"]
  explore --> undo["Unmark it and pop the path"]
  undo --> nextChoice["Try the next unused value"]`,
    `export function orderedPicks(nums: number[], k: number): number[][] {
  const result: number[][] = [];
  const path: number[] = [];
  const used = new Array<boolean>(nums.length).fill(false);
  const visit = (): void => {
    if (path.length === k) {
      result.push(path.slice());
      return;
    }
    for (let index = 0; index < nums.length; index += 1) {
      const value = nums[index];
      if (used[index] === true || value === undefined) {
        continue;
      }
      used[index] = true;
      path.push(value);
      visit();
      path.pop();
      used[index] = false;
    }
  };
  visit();
  return result;
}`,
    "`permutations` is the same algorithm with target length `nums.length`. That makes empty input reach the base case immediately and return `[[]]`. For ordered picks, the contract guarantees `1 <= k <= nums.length`.\n\nFull permutations produce `n!` rows and take O(n · n!) time including copies. Length-`k` picks produce `n! / (n-k)!` rows and require O(n + k) working space besides output. Guard indexed values under strict TypeScript.",
    [
      "Pushing the path without copying makes every saved row change together.",
      "Forgetting the undo leaves the used flag set and drops later orderings.",
      "Sorting each row hides the order the exercise is asking for.",
    ],
  ),
  fillingTable: explain(
    "Dynamic programming starts by defining a state precisely. A **bottom-up table** computes states from known bases; **memoisation** computes them on demand and caches the answers.\n\nFor loop Fibonacci, `F(i)` is the ith Fibonacci number. For house robber, `best(i)` is the maximum value obtainable from houses at indexes 0 through `i`, with `best(-1) = best(-2) = 0`. Once those meanings are fixed, base cases and transitions follow.",
    "**Fibonacci is not climbing stairs.** Here `F(0) = 0`, `F(1) = 1`, and `F(i) = F(i - 1) + F(i - 2)`. Climbing stairs often uses `ways(0) = 1`, or presents first values 1 and 2, because it counts sequences of steps. The recurrence looks alike, but copying those base cases makes `fibLoop(0)` wrong.",
    `flowchart LR
  base["Base cases"] --> next["Next cell is a combination of earlier cells"]
  next --> answer["The last cell is the answer"]`,
    `export function rob(nums: number[]): number {
  let twoBack = 0;
  let oneBack = 0;
  for (const value of nums) {
    const skip = oneBack;
    const take = twoBack + value;
    const current = Math.max(skip, take);
    twoBack = oneBack;
    oneBack = current;
  }
  return oneBack;
}`,
    "**Deriving house robber:** at house `i`, every valid optimal solution does exactly one of two things. `skip = best(i - 1)` keeps the optimum before this house. `take = nums[i] + best(i - 2)` takes this house, so adjacency forbids `i - 1`. These cases are exhaustive and disjoint, hence `best(i) = max(skip, take)`. After computing current, shift the two stored states in the shown order.\n\nFor `fibLoop`, return `n` when `n <= 1`; then roll `previous = 0` and `current = 1` from index 2 through `n`. Both algorithms take O(n) time and O(1) extra space. House values are non-negative, and an empty street leaves both states at 0.",
    [
      "Using the climbing-stairs base case, where the first two values are 1 and 2, fails fib(0).",
      "Taking every other house from the start misses a better pattern that begins on the second house.",
      "A recursive Fibonacci without a cache is correct and much slower. This lesson wants the loop.",
    ],
  ),
  sharedPrefixes: explain(
    "A trie node has `children`, `prefixCount`, and the familiar terminal flag `isWord`. `isWord` answers exact-word lookup; `prefixCount` answers these prefix questions. Increment `root.prefixCount` once per inserted word, then increment each character node reached. Shared prefixes reuse the same nodes rather than creating one path per word.",
    "**Node-count invariant:** after insertion, a node's `prefixCount` equals the number of inserted words whose prefix reaches that node. For `cat`, `car`, and `carpet`, root, `c`, and `a` each have 3; `r` has 2; the `p` node has 1. Mark `isWord = true` only at word ends, but do not use it to stop a prefix query.",
    `flowchart LR
  root["root, every word"] --> c["c, three words"]
  c --> a["a, three words"]
  a --> t["t, one word"]
  a --> r["r, two words"]`,
    `interface TrieNode {
  children: Record<string, TrieNode>;
  prefixCount: number;
  isWord: boolean;
}

function createNode(): TrieNode {
  return { children: {}, prefixCount: 0, isWord: false };
}

function insert(root: TrieNode, word: string): void {
  let node = root;
  node.prefixCount += 1;
  for (const character of word) {
    const child = node.children[character] ?? createNode();
    node.children[character] = child;
    node = child;
    node.prefixCount += 1;
  }
  node.isWord = true;
}`,
    'For `prefixCounts`, walk each query from root. A missing child gives 0; otherwise the ending node\'s `prefixCount` is the answer. An empty query never leaves root, so it returns `root.prefixCount`, the word count. For longest common prefix, return `""` for no words; otherwise walk characters of the first word while the next node exists and `next.prefixCount === words.length`.\n\nBuilding takes O(W) time and space for `W` total inserted characters in the worst case. Queries take O(Q) total examined characters. Each node must receive a fresh children object. Keep the established names `isWord` and `prefixCount`; renaming them locally obscures consistency with the earlier trie lesson and articles.',
    [
      "Sharing one children object between nodes mixes unrelated branches.",
      "Stopping on `isWord` misses prefixes that continue through a complete shorter word.",
      "Counting the root for a non-empty query reports every word instead of the branch.",
    ],
  ),
} as const;

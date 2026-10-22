import { defineArticle, type Article } from "./types";

export const practiceArticles: readonly Article[] = [
  defineArticle(
    "frequency-counts",
    "What Is a Frequency Count? Tallying Values in One Pass",
    "Hash maps",
    "A frequency count stores how many times each value has appeared. One pass updates the tally, and a tie keeps the value that showed up first.",
    ["frequency count"],
    `
A frequency count is a hash map from a value to how many times you have seen it. The key is the value. The stored number is the count. You meet it after Two Sum, which stored an index instead of a tally.

\`\`\`mermaid
flowchart LR
  value["Next value"] --> key["Look up its count"]
  key --> add["Add one"]
  add --> winner["Keep the value with the larger count"]
\`\`\`

## How it works

Start with an empty map. For each value, read the current count, add one, and write it back. A missing key starts at zero. After one pass the map holds every tally, and the time is O(n) if each update is O(1) on average. The extra space is O(n) when every value is unique.

The most frequent value is the key with the largest count. Walk the array once and remember the winner as you update. If two values share that count, keep the one that appears earlier. Store the first index beside the count, and replace the winner only when the new count is strictly greater, or when the counts match and the new value starts earlier.

A counter for one target does not need a map. The map is the tool when you do not know which value will win, or when several targets share the same pass.

\`\`\`ts
function mostFrequent(nums: readonly number[]): number | null {
  const counts: Record<string, number> = {};

  for (const value of nums) {
    const key = String(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  let winner: number | null = null;
  let winnerCount = 0;

  for (const value of nums) {
    const count = counts[String(value)] ?? 0;
    if (count <= winnerCount) {
      continue;
    }
    winner = value;
    winnerCount = count;
  }

  return winner;
}

console.log(mostFrequent([4, 2, 4, 2, 2]));
console.log(mostFrequent([]));
\`\`\`

Expected output: \`2\`, then \`null\`. The second pass visits 4 before 2, but 2 has the larger final count. If their final counts were equal, the strict \`>\` update would preserve the value encountered first.

## Worked example

For \`[4, 2, 4, 2, 2]\`, the first pass builds \`{ "2": 3, "4": 2 }\`. The second pass first makes 4 the winner with count 2, then replaces it with 2 because 3 is larger. Later copies do not change the result.

## In the course

Hash maps introduce the complement. The next lesson, Counting with a map, asks for the tally of one target and then for the most frequent value, with the earliest value winning a tie. See also [How a Hash Map Remembers What You Have Already Seen](/articles/hash-maps).

## Common mistakes

Replacing the winner when the counts are equal picks the later value. The tie rule wants the earlier one.

Number keys and string keys are different stores. Pick one and stay with it. \`String(value)\` is a safe object key.

A nested loop that recounts from scratch returns the right number and hides the map. The point of the pass is that each value is touched once.

## When to use it

Use a frequency count when the question is "how many" or "which value appears most", and the values are the keys. It is the same space-for-time trade as Two Sum.

## When not to

Do not build the map when you only need a sum or a single comparison. A counter is enough, and the map adds a structure you then have to read back.

## Problem-solving checklist

State what each key and value mean. Decide the empty-input result and tie rule before coding. Test one unique winner, one tie, one repeated value, and the empty array. Finally, check that no loop restarts a count from scratch.
  `,
  ),
  defineArticle(
    "off-by-one",
    "What Is an Off-by-One Error? Ranges, Remainders, and Indexes",
    "Search and sort",
    "An off-by-one error is a boundary that is one step away from the index you meant. Empty ranges, a zero remainder, and a match you fail to exclude are the usual places it shows up.",
    ["off-by-one"],
    `
An off-by-one error uses a boundary that is one step away from the slot you meant. The value is often almost right, which is why the tests that sit on the edge are the ones that catch it.

\`\`\`mermaid
flowchart TD
  range["lo and hi, inclusive"] --> empty{"Is lo greater than hi?"}
  empty -->|yes| stop["The answer is not in this range"]
  empty -->|no| mid["Read the middle and move one side past it"]
\`\`\`

## How it works

Arrays start at index 0 and the last index is \`length - 1\`. A loop that runs while \`index <= length\` reads one past the end. A slice that ends at \`length - 1\` when you meant \`length\` drops the last value.

Rotation uses a remainder. \`steps % length\` is 0 when the move is a full turn. Treating 0 as "move one" rotates an array that should have stayed put. An empty array has length 0, and the remainder is not defined in the way you want. Handle that length before you divide.

Binary search keeps an inclusive range. When the middle matches and you still need the first or last copy, set \`hi\` to \`mid - 1\` or \`lo\` to \`mid + 1\`. Leaving the bound on \`mid\` can repeat the same middle forever.

\`\`\`ts
function rotateLeft(nums: readonly number[], steps: number): number[] {
  if (nums.length === 0) {
    return [];
  }

  const remainder = steps % nums.length;
  return nums.slice(remainder).concat(nums.slice(0, remainder));
}

console.log(rotateLeft([1, 2, 3, 4], 4));
console.log(rotateLeft([1, 2, 3, 4], 5));
console.log(rotateLeft([], 3));
\`\`\`

Expected output: \`[1, 2, 3, 4]\`, then \`[2, 3, 4, 1]\`, then \`[]\`. The examples exercise the full-turn, one-past-a-full-turn, and empty-input boundaries.

## Worked example

With length 4 and 5 steps, \`5 % 4\` is 1. The half-open slices are \`nums.slice(1) = [2, 3, 4]\` and \`nums.slice(0, 1) = [1]\`; joining them gives \`[2, 3, 4, 1]\`.

## In the course

Arrays warn you when a left rotation's remainder is 0. Binary search states the inclusive range out loud, and the following lesson keeps searching after a match. The empty range, \`lo > hi\`, is the stop, not a special case you bolt on at the end.

## Common mistakes

Using \`<\` when the last index should be visited, or \`<=\` when it should not.

Forgetting that a full turn is a remainder of 0, not a remainder of 1.

Updating a binary-search bound to \`mid\` instead of \`mid - 1\` or \`mid + 1\`, so the range never shrinks.

## When to use it

Check the empty input, the single element, the first index, and the last index before you trust a loop. Those four cases are where an off-by-one lives.

## When not to

Do not "fix" a wrong answer by adding or subtracting one until a single example passes. Name the range, then move the bound so the range still means what you said.

## Problem-solving checklist

Write whether each boundary is inclusive or exclusive. Trace the empty and one-element cases on paper. For a shrinking search range, prove that every update removes at least one index. Test the first valid index, the last valid index, and the first invalid index.
  `,
  ),
  defineArticle(
    "inward-pointers",
    "How Do Inward Pointers Move? Ends, Palindromes, and Pair Sums",
    "Arrays",
    "Inward pointers start at the two ends of an array and move toward the middle. A rule decides which end moves, and each step drops one index.",
    ["inward pointers"],
    `
Inward pointers are two indexes. One starts at the first element and one at the last. A rule moves exactly one of them, or both when the ends match. They stop when they meet.

\`\`\`mermaid
flowchart LR
  left["Left end"] --> rule{"What did the ends just tell you?"}
  right["Right end"] --> rule
  rule --> one["Move the end the rule names"]
\`\`\`

## How it works

A palindrome compares the ends. Equal values mean both indexes move inward. A mismatch means the array is not a palindrome. An empty array and a one-element array never find a mismatch, so they count as palindromes.

A sorted pair sum compares the total of the ends. Too small means the left value cannot be part of a pair with anything still to its right that is even smaller, so you move the left pointer. Too large means you move the right pointer. The sorted order is what makes that discard safe. Unsorted data can hide the pair you just stepped over.

Each step retires one index, so the walk is O(n). You return indexes in ascending order, or \`[-1, -1]\` when the pointers cross.

\`\`\`ts
function pairSum(
  nums: readonly number[],
  target: number,
): readonly [number, number] {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const leftValue = nums[left];
    const rightValue = nums[right];
    if (leftValue === undefined || rightValue === undefined) {
      return [-1, -1];
    }

    const sum = leftValue + rightValue;
    if (sum === target) {
      return [left, right];
    }
    if (sum < target) {
      left += 1;
      continue;
    }
    right -= 1;
  }

  return [-1, -1];
}

console.log(pairSum([1, 3, 4, 6, 8], 10));
console.log(pairSum([1, 3, 4, 6, 8], 20));
\`\`\`

Expected output: \`[1, 3]\`, then \`[-1, -1]\`. For target 10, the first total is 9, so the left pointer moves; 3 + 8 is 11, so the right pointer moves; 3 + 6 then matches.

## In the course

Sorted squares move the end whose square is larger. The next lesson uses the same inward shape for a palindrome and for the indexes of a pair. The earlier pair-sum exercise on the sorted-squares page only asks for a boolean. The follow-up asks for the indexes.

## Common mistakes

Moving both pointers when the sum is only too small skips a pair that would have worked one step later.

Letting the indexes meet and using that single element twice. A pair needs two positions.

Applying the sum rule before the array is sorted. Sort first, or use a hash map instead.

## When to use it

Use inward pointers when the ends of a sorted array, or the ends of a sequence you can compare directly, decide the next move.

## When not to

Do not use them to find a pair in an unsorted array of arbitrary numbers. The discard step is only valid when order tells you which side is useless.

## Problem-solving checklist

Name the fact that makes a discard safe; here it is ascending order. Decide whether pointers may meet. Trace which candidate pairs disappear after each move. Test a match at the ends, a match inside, no match, and fewer than two values.
  `,
  ),
  defineArticle(
    "variable-windows",
    "What Is a Variable Window? Growing and Shrinking a Subarray",
    "Arrays",
    "A variable window grows on the right and shrinks on the left. With zeros and positive numbers, the left edge only moves forward, so the scan stays linear.",
    ["variable window"],
    `
A fixed window always holds k elements. A variable window changes length. The right edge advances one step at a time. The left edge moves forward only while the slice is too large for the question.

\`\`\`mermaid
flowchart LR
  right["Add the value at right"] --> rule{"Does the sum still fit?"}
  rule -->|no| left["Subtract the value at left"]
  left --> rule
  rule -->|yes| keep["Record the length"]
\`\`\`

## How it works

Keep a running sum. Add \`nums[right]\`. While the sum breaks the rule, subtract \`nums[left]\` and increment \`left\`. Because the numbers are zero or positive, shrinking never needs to be undone. Each index enters once and leaves once, so the whole scan is O(n).

The shortest slice whose sum is at least a target records a length whenever the sum qualifies, then shrinks to see if a shorter slice still qualifies. The longest slice whose sum is at most a target shrinks until the sum fits, then records that length. If nothing qualifies, the answer stays 0.

A negative number can make a longer slice smaller, and the "shrink until it fits" story stops being safe. These exercises leave negatives out on purpose.

\`\`\`ts
function shortestAtLeast(
  nums: readonly number[],
  target: number,
): number {
  let left = 0;
  let sum = 0;
  let best = nums.length + 1;

  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right] ?? 0;

    while (sum >= target && left <= right) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left] ?? 0;
      left += 1;
    }
  }

  if (best === nums.length + 1) {
    return 0;
  }
  return best;
}

console.log(shortestAtLeast([2, 3, 1, 2, 4, 3], 7));
console.log(shortestAtLeast([1, 1, 1], 5));
\`\`\`

Expected output: \`2\`, then \`0\`. In the first call, the window \`[4, 3]\` is the shortest qualifying slice.

## Worked example

At right index 4, the window \`[3, 1, 2, 4]\` totals 10. Repeated shrinking records lengths 4 and 3 before the sum falls below 7. Adding the final 3 creates \`[2, 4, 3]\`; shrinking once more discovers \`[4, 3]\` with length 2.

## In the course

The sliding-window lesson keeps k fixed so the update is obvious. Grow, then shrink is the next lesson. A [prefix sum](/articles/prefix-sums) can answer a range too. You do not need one while the window already holds the sum.

## Common mistakes

Moving the left pointer backward revisits values and can make the scan quadratic.

Recording a length before the sum qualifies reports a slice the tests reject.

Using this shrink rule on negatives. A later, smaller sum might need a wider window you already discarded.

## When to use it

Use a variable window for a contiguous slice whose length is part of the answer, when the values only move the sum in one direction.

## When not to

Do not use it when the slice does not have to be contiguous. A subset of any indexes is a different search.

## Problem-solving checklist

Write the window invariant, including whether it is valid before or after shrinking. Confirm that every value is non-negative before relying on monotonic sums. Record the answer at the exact moment the invariant says it is valid. Test no solution, one-element success, and success at each end.
  `,
  ),
  defineArticle(
    "prefix-sums",
    "What Is a Prefix Sum? Range Totals from a Running Total",
    "Arrays",
    "A prefix sum at index i is the total of every value up to i. The sum of a later range is the difference of two prefixes, after one pass that built them.",
    ["prefix sum"],
    `
A prefix sum at index i is the sum of the array from the start through i. After one O(n) pass, the sum of any later range is a subtraction.

\`\`\`mermaid
flowchart LR
  build["One pass writes prefix at i"] --> ask["Sum from left to right"]
  ask --> diff["prefix at right, minus prefix just before left"]
\`\`\`

## How it works

Let \`prefix[0]\` be the first value, and \`prefix[i]\` be \`prefix[i - 1] + nums[i]\`. The sum from index \`left\` to index \`right\`, inclusive, is \`prefix[right] - prefix[left - 1]\`. When \`left\` is 0 there is no earlier prefix, so the sum is just \`prefix[right]\`.

That difference is O(1) per question. If you answer many ranges, the build cost is paid once. A sliding window that only cares about the current slice does not need the whole table. It already adds the value that enters and subtracts the value that leaves, which is a prefix difference of length one.

\`\`\`ts
function buildPrefix(nums: readonly number[]): number[] {
  const prefix = [0];
  for (const value of nums) {
    prefix.push((prefix[prefix.length - 1] ?? 0) + value);
  }
  return prefix;
}

function rangeSum(
  prefix: readonly number[],
  left: number,
  right: number,
): number {
  return (prefix[right + 1] ?? 0) - (prefix[left] ?? 0);
}

const prefix = buildPrefix([2, 1, 5, 3]);
console.log(prefix);
console.log(rangeSum(prefix, 1, 2));
\`\`\`

Expected output: \`[0, 2, 3, 8, 11]\`, then \`6\`. The leading zero makes every inclusive range use the same formula: subtract the prefix before \`left\` from the prefix after \`right\`.

## Worked example

For indexes 1 through 2, \`prefix[3]\` totals the first three values and \`prefix[1]\` totals the values before index 1. Their difference is \`8 - 2 = 6\`, which equals \`1 + 5\`.

## In the course

Sliding window mentions a prefix sum as another way to total a range, then stays with the window because the exercises only need the current slice. Reach for the table when you will ask many ranges, or when the left edge jumps instead of walking forward.

## Common mistakes

Forgetting the empty prefix before index 0, and subtracting \`prefix[left]\` instead of \`prefix[left - 1]\`. That drops \`nums[left]\` from the range.

Building the prefixes and then still scanning the range. The subtraction was the point.

Using a prefix of counts when you needed a prefix of values, or the other way around. The stored number has to be the thing you will subtract.

## When to use it

Use a prefix sum when range totals are the question and you can afford an O(n) table. It pairs well with a later binary search on the prefixes when the array is made of non-negative numbers.

## When not to

Do not build it for a single left-to-right window. The running sum already is the difference you need.

## Problem-solving checklist

Define whether \`prefix[i]\` includes index \`i\`; a leading-zero table avoids a special case. Translate one range by hand before coding. Test a range at index 0, a one-value range, the whole array, and an empty input.
  `,
  ),
  defineArticle(
    "three-pointers",
    "What Are the Three Pointers in a Linked-List Reversal?",
    "Linear structures",
    "Reversing a linked list keeps previous, current, and the next node you are about to lose. You save next before you overwrite current.next.",
    ["three pointers"],
    `
A linked list node holds a value and \`next\`. Reversing it rewires those links. You keep three names because one of them exists only to remember a node you are about to disconnect.

\`\`\`mermaid
flowchart LR
  previous["previous"] --> current["current"]
  current --> saved["next, saved before the rewire"]
\`\`\`

## How it works

\`previous\` starts as null. \`current\` starts at the head. Before you change \`current.next\`, copy it into \`next\`. Then point \`current.next\` at \`previous\`. Step forward: \`previous\` becomes \`current\`, and \`current\` becomes the saved \`next\`.

When \`current\` is null, \`previous\` is the new head. The old head's \`next\` is null, which is what you wanted. The walk is O(n) and uses O(1) extra memory beyond the list you were given.

Losing the saved next is the bug. Once you overwrite \`current.next\`, the rest of the list is unreachable unless you kept that reference.

\`\`\`ts
interface ListNode {
  value: number;
  next: ListNode | null;
}

function reverse(head: ListNode | null): ListNode | null {
  let previous: ListNode | null = null;
  let current = head;

  while (current !== null) {
    const saved = current.next;
    current.next = previous;
    previous = current;
    current = saved;
  }

  return previous;
}

function values(head: ListNode | null): number[] {
  const result: number[] = [];
  let current = head;
  while (current !== null) {
    result.push(current.value);
    current = current.next;
  }
  return result;
}

const head: ListNode = {
  value: 1,
  next: { value: 2, next: { value: 3, next: null } },
};
console.log(values(reverse(head)));
\`\`\`

Expected output: \`[3, 2, 1]\`. On each iteration, \`saved\` still points to the unreversed suffix while \`previous\` points to the reversed prefix.

## Worked example

Initially the split is \`null | 1 -> 2 -> 3\`. After one rewire it is \`1 -> null | 2 -> 3\`; after two it is \`2 -> 1 -> null | 3\`. The final rewire leaves \`3 -> 2 -> 1 -> null\`, and \`previous\` points to 3.

## In the course

Linked lists introduce the three names and then ask you to reverse. The following lesson uses two pointers instead: one with a head start for the nth node from the end, and a slow pointer with a fast pointer for the middle. Same list, different jobs.

## Common mistakes

Overwriting \`next\` before you have saved it, and then walking off into null.

Returning \`current\` at the end. \`current\` is null. \`previous\` is the new head.

Reversing the array the tests used to build the list. The starter already turned that array into nodes. The rewire is the exercise.

## When to use it

Use the three names whenever you rewire a singly linked list in one pass and still need the remainder of the list.

## When not to

Do not reach for three pointers when a second pointer with a head start answers the question. The middle and the nth-from-the-end walks are that simpler pair.

## Problem-solving checklist

Draw the reversed prefix and unreversed suffix separated by a bar. Save the suffix before changing a link. Test null, one node, and two nodes. Confirm that the old head ends with \`next: null\` and that you return \`previous\`, not \`current\`.
  `,
  ),
  defineArticle(
    "sorted-runs",
    "What Is a Sorted Run? The Merge Step Between Two Halves",
    "Search and sort",
    "A sorted run is a slice that is already in order. Merge sort's merge step takes two runs and writes one, using a pointer on each.",
    ["sorted run"],
    `
A sorted run is a contiguous slice whose values are already in order. Merge sort creates runs by sorting halves, then merges them. The merge is worth practicing on its own, before the recursion.

\`\`\`mermaid
flowchart LR
  left["Sorted left run"] --> pick["Take the smaller head"]
  right["Sorted right run"] --> pick
  pick --> out["Write it to the result"]
\`\`\`

## How it works

Put a pointer on each run. Compare the two heads. Write the smaller one to the result and advance that pointer. When one run is empty, append the rest of the other. Each element is written once, so merging n elements is O(n). The result is a new array. The inputs stay as they were.

Merge sort does this after each pair of recursive calls. The split is about log n levels deep, and each level merges n elements in total, so the sort is O(n log n). The extra arrays are O(n) memory. Bubble sort never builds a run on purpose. It swaps neighbours until order appears, and that is O(n²).

\`\`\`ts
function merge(
  left: readonly number[],
  right: readonly number[],
): number[] {
  const merged: number[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    const leftValue = left[i];
    const rightValue = right[j];
    if (leftValue === undefined || rightValue === undefined) {
      break;
    }
    if (leftValue <= rightValue) {
      merged.push(leftValue);
      i += 1;
      continue;
    }
    merged.push(rightValue);
    j += 1;
  }

  return merged.concat(left.slice(i), right.slice(j));
}

console.log(merge([1, 4, 8], [2, 3, 9]));
\`\`\`

Expected output: \`[1, 2, 3, 4, 8, 9]\`. Once the left run is exhausted, the remaining 9 can be copied without another comparison.

## Worked example

The head comparisons are 1 versus 2, 4 versus 2, 4 versus 3, 4 versus 9, and 8 versus 9. They contribute \`[1, 2, 3, 4, 8]\`; the untouched right tail contributes \`[9]\`.

## In the course

Merge sort asks you to merge two sorted runs before you write the full sort. The next lesson contrasts that with bubble sort and with a scan that only checks whether a run is already sorted. A [compare function](/articles/merge-sort) still matters if you later call the built-in sort on numbers.

## Common mistakes

Calling the built-in sort on a half, which skips the merge the lesson is teaching.

Forgetting to append the leftover run. The result then drops every value that was sitting behind the pointer that finished first.

Comparing the heads as strings. Numeric order is \`<=\` on the numbers, not the default string sort.

## When to use it

Use a merge of two runs when both sides are already sorted and you need one sorted array. It is also the inner step of sorting a linked list, where random access is expensive and runs are natural.

## When not to

Do not merge unsorted slices and expect a sorted result. The smaller-head rule is only true when each side is a run.

## Problem-solving checklist

Verify both inputs are already sorted. State what each pointer means and why everything before it is finished. Test one empty run, unequal lengths, duplicates, and values that all come from one side first. Check that the leftovers are copied.
  `,
  ),
  defineArticle(
    "heap-indexes",
    "How Do Heap Indexes Work? Parent and Child Arithmetic",
    "Trees and graphs",
    "A binary heap stores a complete tree in an array. The parent and the children of index i are arithmetic, not pointers.",
    ["child index"],
    `
A binary heap is a complete tree kept in an array. Complete means every level is full except possibly the last, which fills from the left. That shape is why a child index is a formula.

\`\`\`mermaid
flowchart TD
  root["index 0"] --> left["index 1"]
  root --> right["index 2"]
  left --> deepLeft["index 3"]
  left --> deepRight["index 4"]
\`\`\`

## How it works

Index 0 is the root. It has no parent. For a later index \`i\`:

- the parent is \`Math.floor((i - 1) / 2)\`
- the left child index is \`2 * i + 1\`
- the right child index is \`2 * i + 2\`

Those child indexes can sit past the end of a short array. The formula does not check the length. The heap operations do, when they decide whether a child exists.

A min-heap keeps each parent less than or equal to its children, so the smallest value sits at index 0. Inserting at the end and swapping upward, or moving the last value to the root and swapping downward, both follow these indexes. Each swap walks one level, and the height is about log n.

\`\`\`ts
interface HeapIndexes {
  readonly parent: number | null;
  readonly left: number;
  readonly right: number;
}

function heapIndexes(index: number): HeapIndexes {
  const parent = index === 0 ? null : Math.floor((index - 1) / 2);
  return {
    parent,
    left: 2 * index + 1,
    right: 2 * index + 2,
  };
}

console.log(heapIndexes(0));
console.log(heapIndexes(4));
\`\`\`

Expected output: \`{ parent: null, left: 1, right: 2 }\`, then \`{ parent: 1, left: 9, right: 10 }\`. Child indexes describe positions; callers must still compare them with the heap length.

## Worked example

Index 4 is the right child of index 1 because \`Math.floor((4 - 1) / 2) = 1\`. Its own children would occupy indexes 9 and 10. In a heap of length 7 those children do not exist, even though the formulas still produce their positions.

## In the course

Heaps introduce the formulas and then ask you to check the parent rule. The next lesson asks for the parent index and the two child indexes on their own, before any swaps. The kth-largest exercise is where the swaps earn their keep.

## Common mistakes

Using \`2 * i\` as the left child. That index is an even slot, not the left child of \`i\`. The left child is \`2 * i + 1\`.

Returning the value at the child index when the question asked for the index.

Treating a missing child as a broken heap. A short last level is what "complete" allows. You only compare a child that exists.

## When to use it

Use the formulas whenever you store a heap, or any complete binary tree, in an array and need the parent or a child without pointers.

## When not to

Do not use heap indexes for a binary search tree that can be sparse. A missing left child in a BST is not "the next array slot". That tree wants real links.

## Problem-solving checklist

Separate an index from the value stored there. Handle the root's missing parent explicitly. Before reading a child, compare its index with \`heap.length\`. Test the root, a left child, a right child, and a leaf on an incomplete last level.
  `,
  ),
  defineArticle(
    "visited-sets",
    "What Is a Visited Set? Stopping a Graph Search from Looping",
    "Trees and graphs",
    "A visited set remembers vertices a search has already queued. Without it, a cycle in an undirected graph makes the walk repeat forever.",
    ["visited set"],
    `
A visited set is the memory a graph search keeps so it does not walk the same vertex twice. A tree does not need one for a child walk, because the only way back to a node is up the call stack. A graph can contain a cycle.

\`\`\`mermaid
flowchart LR
  see["See a neighbour"] --> marked{"Already marked?"}
  marked -->|yes| skip["Leave it"]
  marked -->|no| queue["Mark it and enqueue it"]
\`\`\`

## How it works

Build an adjacency list so each vertex can name its neighbours. Start from the source and mark it when you enqueue it, not when you dequeue it. Marking later lets the same neighbour sit in the queue once for every edge that finds it.

The size of the component is the number of marks, including the start. A start vertex with no edges is a component of one. Reaching every vertex means that count equals the number of vertices you were told exist.

Breadth-first search uses the set beside a queue and answers fewest edges when every edge costs the same. Depth-first search uses the same set beside a stack or recursion and answers reachability. Neither is safe on a cyclic graph if the set is missing.

\`\`\`ts
function reachable(
  graph: Readonly<Record<string, readonly number[]>>,
  start: number,
): number[] {
  const seen: Record<string, true> = { [String(start)]: true };
  const queue = [start];
  const order: number[] = [];
  let front = 0;

  while (front < queue.length) {
    const vertex = queue[front];
    front += 1;
    if (vertex === undefined) {
      continue;
    }
    order.push(vertex);

    const neighbours = graph[String(vertex)] ?? [];
    for (const neighbour of neighbours) {
      const key = String(neighbour);
      if (seen[key] === true) {
        continue;
      }
      seen[key] = true;
      queue.push(neighbour);
    }
  }

  return order;
}

const graph = { "0": [1, 2], "1": [0, 2], "2": [0, 1] };
console.log(reachable(graph, 0));
\`\`\`

Expected output: \`[0, 1, 2]\`. Vertex 2 is marked when vertex 0 enqueues it, so the later edge from vertex 1 cannot enqueue a duplicate.

## Worked example

Start with queue \`[0]\` and mark 0. Processing 0 marks and queues 1 and 2. Processing 1 sees 0 and 2 already marked. Processing 2 sees only marked neighbours. The queue empties after exactly three vertex visits despite the cycle.

## In the course

Graphs introduce the mark-on-enqueue rule, then ask whether you can reach a vertex and what the shortest path is. The next lesson asks for the component size and whether the walk reaches every vertex from 0 through count - 1. See [breadth-first search](/articles/breadth-first-search) for the queue that carries the marks.

## Common mistakes

Marking a vertex only when you dequeue it. The queue can then hold many copies, and a sloppy loop can look stuck.

Storing an undirected edge in only one direction. The walk reaches one end and not the other.

Forgetting to mark the start. An isolated vertex then looks like a component of zero.

## When to use it

Use a visited set on any graph search, and on any walk that might return to a vertex through a different edge.

## When not to

Do not use a visited set to block a tree recursion that is supposed to see both children. A child is not a repeat of the parent. The null child is the stop.

## Problem-solving checklist

Decide what a vertex identifier is and use one representation consistently. Mark when scheduling work, not when finishing it. Include the start in the visited structure. Test a cycle, an isolated vertex, disconnected components, and two paths to the same neighbour.
  `,
  ),
  defineArticle(
    "half-open-intervals",
    "What Is a Half-Open Interval? Why Touching Meetings Do Not Overlap",
    "Patterns",
    "A half-open interval includes the start and excludes the end. Two meetings that touch at that endpoint do not overlap, which is the rule interval scheduling relies on.",
    ["farthest reach"],
    `
A half-open interval \`[start, end)\` contains every time from the start up to, but not including, the end. A meeting that ends at 3 and a meeting that starts at 3 do not overlap. One person can attend both.

\`\`\`mermaid
flowchart LR
  first["[1, 3)"] --> touch["3 is the end of one and the start of the next"]
  second["[3, 5)"] --> touch
  touch --> ok["No overlap"]
\`\`\`

## How it works

Two intervals overlap when one starts before the other has finished. In numbers, after you sort by start, they overlap when the next start is strictly less than the previous end. Equal starts and ends touch, and touching is allowed.

Interval scheduling sorts by finishing time and repeatedly takes the interval that frees you soonest. The half-open rule is why \`[1, 3]\` and \`[3, 5]\` can both be kept. Sorting by start time instead lets a long early interval block several short ones. That is a rule you can break with one example, so it is not the rule.

\`\`\`ts
type Interval = readonly [start: number, end: number];

function maximumNonOverlapping(intervals: readonly Interval[]): Interval[] {
  const ordered = intervals
    .slice()
    .sort((left, right) => left[1] - right[1] || left[0] - right[0]);
  const chosen: Interval[] = [];
  let availableFrom = Number.NEGATIVE_INFINITY;

  for (const interval of ordered) {
    if (interval[0] < availableFrom) {
      continue;
    }
    chosen.push(interval);
    availableFrom = interval[1];
  }

  return chosen;
}

console.log(maximumNonOverlapping([[1, 3], [3, 5], [2, 6]]));
\`\`\`

Expected output: \`[[1, 3], [3, 5]]\`. The first two intervals touch at 3 but do not overlap; choosing \`[2, 6)\` would finish later and leave less room.

## Worked example

Sorting by finish gives \`[1, 3)\`, \`[3, 5)\`, then \`[2, 6)\`. Choose the first and set \`availableFrom\` to 3. The second starts at 3, so it is compatible and moves the boundary to 5. The last starts at 2, before 5, so skip it.

## In the course

Greedy choices use half-open intervals for the largest set you can keep, and for whether one person can attend every meeting. The next lesson asks for the single interval that finishes first, with a tie broken by the smaller start.

## Common mistakes

Treating a shared endpoint as an overlap. The tests allow touching.

Sorting by start and assuming the count is optimal. A long early interval is the counterexample.

Comparing ends with \`<=\` when the intervals are half-open. \`nextStart < previousEnd\` is the overlap test. \`<=\` rejects a meeting that starts when the previous one ends.

## When to use it

Use half-open intervals for time ranges and for array slices, where the end index is the first position not included. The same convention shows up in \`slice(start, end)\`.

## When not to

Do not use a half-open overlap test on closed intervals that include both ends. A shared endpoint then really is a conflict, and the comparison changes.

## Problem-solving checklist

Write the interval convention before choosing a comparison. Build a counterexample for each proposed greedy sorting rule. Test touching intervals, nested intervals, equal finishes, and an empty list. Preserve the input if mutation is not part of the contract.
  `,
  ),
  defineArticle(
    "permutations",
    "What Is a Permutation? Orderings from Choose, Explore, Undo",
    "Patterns",
    "A permutation is an ordering of values. Backtracking builds it by choosing an unused value, exploring, then undoing, and a copy of the path is what you save.",
    ["permutation"],
    `
A permutation is one ordering of a set of values. \`[1, 2]\` and \`[2, 1]\` are different permutations and the same subset. Subsets ignore order. Permutations are the order.

\`\`\`mermaid
flowchart TD
  pick["Choose an unused value"] --> explore["Recurse"]
  explore --> undo["Pop the path and unmark the value"]
  undo --> next["Try the next unused value"]
\`\`\`

## How it works

Keep a path and a used flag for each index. When the path is as long as the input, copy it into the results. The copy matters. If you store the path array itself, a later pop changes every result that pointed at that same array.

Then undo: pop the value and clear the used flag, so the next choice can use it in a different position. Loop the indexes from left to right if the tests want that order. An empty input has one empty permutation.

Ordered picks of length k stop when the path reaches k instead of the full length. The undo is the same. n distinct values have n! full permutations, which is why you only list them when n is small.

\`\`\`ts
function permutations(nums: readonly number[]): number[][] {
  const results: number[][] = [];
  const path: number[] = [];
  const used = nums.map(() => false);

  const search = () => {
    if (path.length === nums.length) {
      results.push(path.slice());
      return;
    }

    for (let i = 0; i < nums.length; i += 1) {
      if (used[i] === true) {
        continue;
      }
      const value = nums[i];
      if (value === undefined) {
        continue;
      }
      used[i] = true;
      path.push(value);
      search();
      path.pop();
      used[i] = false;
    }
  };

  search();
  return results;
}

console.log(permutations([1, 2]));
console.log(permutations([]));
\`\`\`

Expected output: \`[[1, 2], [2, 1]]\`, then \`[[]]\`. The empty permutation is one completed ordering with zero choices, not zero orderings.

## Worked example

Choose 1, then 2, and save \`[1, 2]\`. Undo 2 and then 1. Choose 2, then 1, and save \`[2, 1]\`. Every recursive return restores both \`path\` and \`used\` to the state the caller had.

## In the course

Backtracking lists subsets, where order does not matter and the tests compare a set. The next lesson lists permutations and then ordered picks of length k. The choose, explore, undo rhythm is the same. The choice is different: which unused value comes next, not whether the next value is included.

## Common mistakes

Pushing the path without copying, so every saved row changes together.

Forgetting to clear the used flag. Later orderings then skip a value that should have been free.

Sorting each row before you return it. That erases the order the exercise asked for.

## When to use it

Use this search when you must list orderings, or ordered selections, and the input is small enough that n! is acceptable.

## When not to

Do not list permutations when you only need a count, or when order does not matter. A subset count is 2ⁿ, and listing n! rows is the slower question.

## Problem-solving checklist

Define one search state in words: the path plus which indexes are used. Identify the completion condition. Pair every mutation with its undo. Test empty and one-value inputs, then verify that \`n\` distinct values produce \`n!\` rows without changing the input.
  `,
  ),
  defineArticle(
    "tabulation",
    "What Is Tabulation? Filling a Dynamic-Programming Table Upward",
    "Patterns",
    "Tabulation writes answers from the base case toward the size you were asked for. Each cell is one sentence: the answer for this size, built from smaller cells.",
    ["tabulation"],
    `
Tabulation is the loop form of dynamic programming. You fill a table from the smallest sizes to the one the question asked for. Memoisation is the other repair: a recursive call checks a cache before it repeats work. Both store overlapping answers. The loop makes the order obvious.

\`\`\`mermaid
flowchart LR
  base["Write the base cases"] --> cell["The next cell uses earlier cells"]
  cell --> last["The last cell is the answer"]
\`\`\`

## How it works

Write a sentence for the cell before you write the assignment. For Fibonacci, the cell is the sum of the two previous cells, with 0 and 1 as the base cases in the table-filling lesson. Two variables are enough if you never need the whole table again. That is O(n) time and O(1) extra memory.

House robber is the same shape with a choice. At each house you skip it and keep the previous answer, or you take it and add it to the answer from two houses ago. The cell is the better of those two. Adjacent houses are never both taken. An empty street is 0.

Climbing stairs used a close recurrence, with different base cases. Mixing those base cases is how a correct loop returns the wrong number.

\`\`\`ts
function maximumLoot(houses: readonly number[]): number {
  let twoBack = 0;
  let oneBack = 0;

  for (const money of houses) {
    const take = twoBack + money;
    const skip = oneBack;
    const current = Math.max(take, skip);
    twoBack = oneBack;
    oneBack = current;
  }

  return oneBack;
}

console.log(maximumLoot([2, 7, 9, 3, 1]));
console.log(maximumLoot([]));
\`\`\`

Expected output: \`12\`, then \`0\`. The best choice takes houses worth 2, 9, and 1; no two are adjacent.

## Worked example

The best totals after each house are 2, 7, 11, 11, and 12. At the house worth 9, taking gives \`2 + 9 = 11\` and skipping gives 7. At the house worth 3, taking gives \`7 + 3 = 10\`, so skipping preserves 11.

## In the course

Dynamic programming introduces the recurrence, memoisation, and the upward loop on the stairs. The next lesson fills Fibonacci from the bottom and then the line of houses. If you can say what the cell means, the assignment is mechanical.

## Common mistakes

Using the stair base cases, where the first two answers are 1 and 2, for a Fibonacci that wants 0 and 1.

Taking every other house from the first house only. The better total sometimes starts on the second house. The recurrence already considers both.

Leaving the recursion uncached and calling it tabulation. The cache and the loop are both dynamic programming. This lesson wants the loop.

## When to use it

Use tabulation when the recurrence is clear and the states have a natural order, from small to large. It is usually the version you keep once you trust the sentence for the cell.

## When not to

Do not build a table for a problem whose subproblems do not overlap. A plain recursion, or a single pass, is then the shorter program.

## Problem-solving checklist

Write exactly what one state means before writing its recurrence. List base cases from that meaning, not from a similar problem. For each transition, name every legal choice and the smaller state it uses. Test empty, one-state, and two-state inputs before a longer example.
  `,
  ),
];

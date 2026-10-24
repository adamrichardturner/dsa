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

The most frequent value is the key with the largest final count. A second walk over the original array considers candidates in first-appearance order. Replace the winner only when a count is strictly larger. Equal counts therefore leave the earlier candidate in place without storing first indexes separately.

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

## Why it is correct

After the first loop has processed a prefix, \`counts[String(value)]\` equals the number of copies of that value in the prefix. Updating exactly the next value preserves that invariant, so the completed table has every final frequency. The second loop keeps the highest-frequency value seen so far. Because it updates only for a strictly larger count, equal-frequency values cannot displace the one encountered first.

## Cost

The two sequential passes take O(n) time, not O(2n): constants disappear in asymptotic notation. With \`u\` distinct values, the count object uses O(u) extra space, at most O(n). Empty input returns \`null\`.

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

## Optional enrichment

Return both the winning value and its count without a second counting pass. Preserve the earliest value on a tie, and explain which state must be updated together.
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
  if (!Number.isInteger(steps)) {
    throw new RangeError("steps must be an integer");
  }
  if (nums.length === 0) {
    return [];
  }

  const remainder = ((steps % nums.length) + nums.length) % nums.length;
  return nums.slice(remainder).concat(nums.slice(0, remainder));
}

console.log(rotateLeft([1, 2, 3, 4], 4));
console.log(rotateLeft([1, 2, 3, 4], 5));
console.log(rotateLeft([1, 2, 3, 4], -1));
console.log(rotateLeft([], 3));
\`\`\`

Expected output: \`[1, 2, 3, 4]\`, then \`[2, 3, 4, 1]\`, then \`[4, 1, 2, 3]\`, then \`[]\`. The examples exercise the full-turn, one-past-a-full-turn, negative-step, and empty-input boundaries.

## Worked example

With length 4 and 5 steps, \`5 % 4\` is 1. The half-open slices are \`nums.slice(1) = [2, 3, 4]\` and \`nums.slice(0, 1) = [1]\`; joining them gives \`[2, 3, 4, 1]\`.

## Why it is correct

The normalized remainder \`r\` is always in \`[0, length)\`. Every original index from \`r\` onward appears first, in order, and every index before \`r\` appears afterward, also in order. The two half-open slices are disjoint and together contain every input index exactly once, so the result is precisely a left rotation by \`r\`.

## Cost

Computing the boundary is O(1). Slicing and concatenating copy n values, so the operation is O(n) time and O(n) extra space. The early return avoids taking a remainder by zero for an empty array.

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

## Optional enrichment

Implement \`sliceInclusive(values, start, end)\` without mutating the input. Reject invalid bounds explicitly, and test the difference between an empty half-open range and a one-element inclusive range.
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

## Why it is correct

Suppose the current sum is too small. Pairing the current left value with any index left of \`right\` cannot produce a larger sum, so that left index cannot belong to a solution still under consideration. Moving \`left\` discards only impossible pairs. If the sum is too large, the symmetric argument makes \`right\` safe to discard. A returned pair was checked directly, and crossing pointers means every legal pair has been ruled out.

## Cost

Each iteration moves at least one pointer inward, and neither pointer moves backward. There are at most n - 1 moves, so time is O(n) and extra space is O(1). This is better than checking all O(n²) pairs, but only because the input is sorted.

## In the course

Sorted squares move the end whose square is larger. The next lesson uses the same inward shape for a palindrome and for the indexes of a pair. The earlier pair-sum exercise on the sorted-squares page only asks for a boolean. The follow-up asks for the indexes. That same lesson also compacts a sorted array with a write pointer, returning a new array of the unique values, and then measures the container between two line heights. Move the shorter height inward: the width shrinks, so that shorter line cannot form a larger area with any index still between the pointers. When the heights are equal, move the left index.

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

## Optional enrichment

Return every unique value pair that reaches the target in a sorted array with duplicates. After a match, skip repeated values on both sides and explain why that cannot discard a new value pair.
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
  if (target <= 0) {
    throw new RangeError("target must be positive");
  }
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

## Why it is correct

Before each right-edge advance, every window ending earlier has already been considered. Once the sum reaches the target, the current window qualifies. Removing values from the left tests every shorter window with the same right edge until the sum no longer qualifies. Non-negative values guarantee that further shrinking cannot restore a too-small sum, so no qualifying candidate is skipped. The smallest recorded length is therefore optimal.

## Cost

The right pointer advances n times. The left pointer also advances at most n times across the entire run, even though it sits inside a nested \`while\` loop. Total time is O(n), and the scalar state uses O(1) extra space. With negative values, this monotonic argument fails.

## In the course

The sliding-window lesson keeps k fixed so the update is obvious. Grow, then shrink is the next lesson. A [prefix sum](/articles/prefix-sums) can answer a range too. You do not need one while the window already holds the sum. \`rangeSum\` is the case that does: with \`prefix[0] === 0\`, the inclusive span from \`left\` through \`right\` is \`prefix[right + 1] - prefix[left]\`, in O(1) after the prefix exists.

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

## Optional enrichment

Write the longest-window variant for a sum at most a positive limit. State exactly when the window is valid, and test zeros because they can extend a valid window without changing its sum.
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

## Why it is correct

At the top of each iteration, \`previous\` heads a correctly reversed prefix and \`current\` heads the untouched suffix. Saving \`current.next\` preserves access to that suffix; redirecting the link adds exactly one node to the reversed prefix. Advancing both names restores the invariant. When the suffix is empty, the reversed prefix contains every original node, so \`previous\` is the new head.

## Cost

Each of n nodes is visited and rewired once, giving O(n) time. The three references use O(1) extra space. This mutates the list; building a separate reversed list would preserve the input but require O(n) new nodes.

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

## Optional enrichment

Reverse only the first \`k\` nodes and reconnect the untouched suffix. Define the behaviour for \`k = 0\), \`k\` larger than the list, and an empty list before coding.
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
      throw new Error("Both runs must be dense number arrays");
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

## Why it is correct

Before every comparison, \`merged\` is sorted and contains exactly the consumed prefixes of both runs. Because each run is sorted, the smaller head is the smallest remaining value anywhere, so copying it preserves the invariant. Once a run is empty, the other tail is already sorted and no smaller unwritten value exists. Appending it completes a sorted result containing every input value once.

## Cost

Each pointer advances only forward, at most once per value. Merging lengths \`a\` and \`b\` therefore takes O(a + b) time and O(a + b) result space. The input runs are not mutated. Stability comes from taking the left head when values are equal.

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

## Optional enrichment

Merge records with a typed comparison function. Preserve left-before-right order for equal keys, then demonstrate stability with two records that have the same score but different names.
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
  if (!Number.isInteger(index) || index < 0) {
    throw new RangeError("index must be a non-negative integer");
  }
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

## Why it is correct

Level-order storage places the two children of index \`i\` immediately after all children of earlier indexes, at \`2i + 1\` and \`2i + 2\`. For any non-root child \`c\`, both members of its sibling pair reduce to the same parent under \`Math.floor((c - 1) / 2)\`. These formulas describe positions; existence still requires an array-length check.

## Cost

Every formula uses a constant number of arithmetic operations, so parent and child calculations are O(1) time and O(1) space. Heap insertion or removal is O(log n) because it may repeat a parent-or-child step once per tree level.

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

## Optional enrichment

Given a min-heap array, verify the parent rule for every existing child. Return the first violating pair of indexes, or \`null\`; do not attempt to repair the heap.
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

## Why it is correct

Every queued vertex is reachable: the start is reachable from itself, and each newly queued neighbour extends an existing path by one edge. Conversely, when a reachable vertex is processed, every unmarked neighbour is queued, so induction on path length shows that every vertex reachable from the start is eventually discovered. Mark-on-enqueue ensures each vertex enters the queue at most once, even in a cycle.

## Cost

With adjacency lists, each reached vertex is processed once and each outgoing adjacency entry is inspected once. A full traversal is O(V + E) time and O(V) extra space for marks, the queue, and the returned order. An adjacency matrix would require O(V²) inspection instead.

## In the course

Graphs and breadth-first search introduce the mark-on-enqueue rule, then ask whether you can reach a vertex and what the shortest path is. The Connected components lesson asks for the component size, whether the walk reaches every vertex from 0 through count - 1, and then how many components that whole range contains, including vertices that never appear in an edge. See [breadth-first search](/articles/breadth-first-search) for the queue that carries the marks, and [depth-first search](/articles/depth-first-search) when the question is only which vertices share a piece.

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

## Optional enrichment

Return all connected components of an undirected graph. Start a new search from each unvisited vertex and prove that every vertex appears in exactly one returned component.
  `,
  ),
  defineArticle(
    "half-open-intervals",
    "What Is a Half-Open Interval? Why Touching Meetings Do Not Overlap",
    "Patterns",
    "A half-open interval includes the start and excludes the end. Two meetings that touch at that endpoint do not overlap, which is the rule interval scheduling relies on.",
    ["half-open interval", "interval overlap"],
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
  const compareByFinish = (left: Interval, right: Interval): number => {
    const finishDifference = left[1] - right[1];
    if (finishDifference !== 0) {
      return finishDifference;
    }
    return left[0] - right[0];
  };
  const ordered = intervals.slice().sort(compareByFinish);
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

## Why it is correct

Consider an optimal schedule's first interval. The greedy interval finishes no later because it has the earliest finish overall. Replacing the optimal first interval with the greedy one cannot make any later interval unavailable. The remaining problem is the same scheduling problem after that finish time, so repeating this exchange argument proves that every greedy choice can belong to an optimal schedule.

## Cost

Sorting n intervals takes O(n log n) time; the selection scan takes O(n). The copied ordering and chosen result use O(n) space, while the caller's input remains unchanged. If intervals were already sorted by finish time, selection alone would be linear.

## In the course

Greedy algorithms use half-open intervals for the largest set you can keep, and for whether one person can attend every meeting. The next lesson asks for the single interval that finishes first, with a tie broken by the smaller start.

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

## Optional enrichment

Write separate overlap predicates for half-open and closed intervals. Use the same endpoint-touching example to show why the two predicates must disagree.
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

  const search = (): void => {
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

## Why it is correct

At depth \`d\`, the path contains \`d\` distinct input indexes. The loop tries every index not yet used, so every legal next choice is explored. A path of length n is one complete ordering and is copied exactly once. Any permutation determines one unique sequence of index choices, so all permutations appear and none repeat when the input values are distinct.

## Cost

There are n! results, each of length n, so producing the output takes O(n · n!) time and O(n · n!) result space. The active path, flags, and recursion use O(n) auxiliary space. Duplicate input values require an additional skip rule if value-distinct output is desired; this version treats positions as distinct.

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

## Optional enrichment

Support duplicate input values without returning duplicate permutations. Sort a copy, skip equal unused choices at the same depth, and explain why indexes still need separate used flags.
  `,
  ),
  defineArticle(
    "tabulation",
    "What Is Tabulation? Filling a Dynamic-Programming Table Upward",
    "Patterns",
    "Tabulation writes answers from the base case toward the size you were asked for. Each cell is one sentence: the answer for this size, built from smaller cells.",
    ["bottom-up table"],
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

Use prefix lengths to keep indexes precise. Let \`best(i)\` mean the maximum loot among the first \`i\` houses:

- \`best(0) = 0\`
- \`best(1) = houses[0]\`
- \`best(i) = max(best(i - 1), best(i - 2) + houses[i - 1])\`

State \`i\` is a count, so the current array index is \`i - 1\`. The first recurrence branch skips that house. The second takes it, so the previous house must be excluded and the compatible prefix ends two states back.

Climbing stairs used a close recurrence, with different base cases. Mixing those base cases is how a correct loop returns the wrong number.

\`\`\`ts
function maximumLoot(houses: readonly number[]): number {
  let twoBack = 0;
  let oneBack = 0;

  for (const money of houses) {
    if (money < 0) {
      throw new RangeError("house values must be non-negative");
    }
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

\`\`\`mermaid
flowchart LR
  B0["best(0) = 0"] --> B2["best(2) = max(2, 7) = 7"]
  B1["best(1) = 2"] --> B2
  B1 --> B3["best(3) = max(7, 2 + 9) = 11"]
  B2 --> B3
  B2 --> B4["best(4) = max(11, 7 + 3) = 11"]
  B3 --> B4
\`\`\`

## Why it is correct

After processing each house, \`oneBack\` is the best legal total for the prefix ending there, and \`twoBack\` is the best total for the prefix before the previous house. An optimal solution either skips the current house and keeps \`oneBack\`, or takes it and must add its value to \`twoBack\`. Those cases are exhaustive and disjoint, so their maximum is the optimal value for the new prefix.

## Cost

The loop processes each house once, for O(n) time. Two accumulated states replace an O(n) table, so auxiliary space is O(1). If the actual chosen house indexes are required, keep the table and reconstruct the decisions, trading O(n) space for that information.

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

## Optional enrichment

Return both the maximum loot and the chosen house indexes. A scalar recurrence is no longer enough for reconstruction, so decide what additional decision information each state must retain.
  `,
  ),
  defineArticle(
    "pair-enumeration",
    "How Do You Enumerate Every Index Pair Exactly Once?",
    "Cost",
    "Pair enumeration uses i < j to exclude self-pairs and reversed duplicates. Its triangular iteration count explains the quadratic cost.",
    ["pair enumeration", "ascending pairs", "equal pairs"],
    `
Two indexes form an unordered pair when \`i < j\`. That inequality does three jobs: it prevents pairing an index with itself, prevents counting both \`(i, j)\` and \`(j, i)\`, and gives the inner loop an exact starting point.

\`\`\`mermaid
flowchart TD
  I["Choose i from 0 to n - 2"] --> J["Choose j from i + 1 to n - 1"]
  J --> Test{"Does this pair satisfy the predicate?"}
  Test -->|yes| Count["Increment the count"]
  Test -->|no| Next["Try the next j"]
  Count --> Next
\`\`\`

## Implementation

\`\`\`ts
function countEqualPairs(values: readonly number[]): number {
  let count = 0;

  for (let left = 0; left < values.length; left += 1) {
    const leftValue = values[left];
    if (leftValue === undefined) {
      continue;
    }

    for (let right = left + 1; right < values.length; right += 1) {
      if (leftValue === values[right]) {
        count += 1;
      }
    }
  }

  return count;
}

console.log(countEqualPairs([1, 1, 1])); // 3
console.log(countEqualPairs([])); // 0
\`\`\`

The invariant at the start of an outer-loop iteration is that \`count\` includes exactly the qualifying pairs whose left index is smaller than \`left\`. The inner loop then checks every legal right partner for this left index exactly once.

## Worked example and cost

For three values, the legal index pairs are \`(0, 1)\`, \`(0, 2)\`, and \`(1, 2)\`. In general the number of checks is
\`(n - 1) + (n - 2) + ... + 1 = n(n - 1) / 2\`, so time is O(n²) and scalar extra space is O(1).

TypeScript does not prove that a numeric array is dense. The explicit \`undefined\` check gives sparse-array behaviour a clear meaning. For ordinary dense inputs, it never triggers.

## Edge cases and counterexamples

- Empty and one-value arrays contain zero pairs.
- Equal values at different indexes are a legal pair; one index used twice is not.
- Starting \`right\` at 0 counts reversed pairs and self-pairs.
- Starting \`right\` at \`left\` still counts self-pairs.
- For ascending pairs, change only the predicate to \`leftValue < rightValue\`; do not change the index rule.

Use a nested scan when the exercise is explicitly about all pairs. If the predicate is equality and only the count matters, a frequency table can often reduce the work.

## Optional enrichment

Derive the number of equal pairs from frequencies using \`count * (count - 1) / 2\` for each distinct value, and compare its O(n) expected-time tradeoff with the direct O(n²) enumeration.

## Related

- [What Does O(n²) Mean? Nested Loops and Pair Comparisons](/articles/quadratic-time)
- [What Is a Frequency Count? Tallying Values in One Pass](/articles/frequency-counts)
  `,
  ),
  defineArticle(
    "shifting-array-elements",
    "Why Does an Array Middle Edit Shift Elements?",
    "Arrays",
    "A contiguous array keeps indexes adjacent, so insertion or deletion in the middle must copy the tail while direct indexed access remains constant-time.",
    ["array shift", "middle edit", "insert at an index"],
    `
An array stores values in index order with no gaps. Reading \`values[index]\` is O(1), but changing the middle while preserving that order moves every later value. A non-mutating implementation makes those writes visible.

\`\`\`mermaid
flowchart LR
  A["[1, 2, 4]"] --> B["Copy indexes before 2"]
  B --> C["Write 3 at index 2"]
  C --> D["Copy old tail one slot right"]
  D --> E["[1, 2, 3, 4]"]
\`\`\`

## Implementation and index convention

\`\`\`ts
function insertAt(
  values: readonly number[],
  index: number,
  value: number,
): number[] {
  if (!Number.isInteger(index)) {
    throw new RangeError("index must be an integer");
  }

  const insertionIndex = Math.min(Math.max(index, 0), values.length);
  const result: number[] = [];

  for (let source = 0; source < values.length; source += 1) {
    if (source === insertionIndex) {
      result.push(value);
    }
    const current = values[source];
    if (current !== undefined) {
      result.push(current);
    }
  }

  if (insertionIndex === values.length) {
    result.push(value);
  }

  return result;
}

console.log(insertAt([1, 2, 4], 2, 3));
// [1, 2, 3, 4]
\`\`\`

Before source index \`s\`, \`result\` contains the new value if its insertion boundary has been reached, plus every original value before \`s\` in order. The loop preserves that invariant and the final branch handles the half-open boundary at \`values.length\`.

For \`insertAt([1, 2, 4], 2, 3)\`, copy 1 and 2, write 3 when the source reaches 2, then copy 4. A negative index is clamped to 0; an index past the end is clamped to \`length\`.

## Complexity and edge cases

Insertion and deletion each copy O(n) values into O(n) result space. A middle mutation with \`splice\` also shifts O(n) values even though it is one method call.

- Empty insertion produces a one-value array.
- Removing an out-of-range index should return a copy when that is the contract.
- Decide whether negative indexes are rejected, clamped, or interpreted from the end.
- Preserve the input when the signature accepts a \`readonly\` array.
- Do not confuse the O(1) index calculation with the O(n) data movement.

## Optional enrichment

Implement removal into a preallocated array of length \`n - 1\`. Explain why preallocation changes constants but not the O(n) bound.

## Related

- [What Is a Contiguous Array? Index Jumps and Shifts](/articles/contiguous-arrays)
- [What Is an Off-by-One Error? Ranges, Remainders, and Indexes](/articles/off-by-one)
  `,
  ),
  defineArticle(
    "linked-list-runner-pointers",
    "How Do Slow and Fast Pointers Measure a Linked List?",
    "Linear structures",
    "Runner pointers turn relative movement into distance: one-and-two-step speeds find a middle, while a fixed head start finds a node from the end.",
    ["slow and fast pointers", "fast pointer", "nth from the end"],
    `
A linked list has no constant-time index jump. Two references can still encode distance by how they move. For the middle, \`slow\` moves one edge while \`fast\` moves two. For the nth node from the end, \`fast\` first opens a gap of exactly \`n\` edges.

\`\`\`mermaid
flowchart LR
  H["1"] --> N2["2"] --> N3["3"] --> N4["4"] --> N5["5"]
  S["slow: one edge"] -.-> N3
  F["fast: two edges"] -.-> N5
\`\`\`

## Finding the second middle

\`\`\`ts
interface RunnerNode {
  readonly value: number;
  readonly next: RunnerNode | null;
}

function middleValue(head: RunnerNode | null): number | null {
  if (head === null) {
    return null;
  }

  let slow: RunnerNode = head;
  let fast: RunnerNode | null = head;

  while (fast !== null && fast.next !== null) {
    slow = slow.next ?? slow;
    fast = fast.next.next;
  }

  return slow.value;
}

const list: RunnerNode = {
  value: 1,
  next: {
    value: 2,
    next: { value: 3, next: { value: 4, next: null } },
  },
};

console.log(middleValue(list));
// 3
\`\`\`

After \`k\` iterations, slow has advanced \`k\` edges and fast has advanced \`2k\` edges. When fast reaches the end, slow is halfway through. The loop condition makes an even-length list return the second middle: \`[1, 2, 3, 4]\` returns 3.

For nth from the end, reject \`n < 1\`, advance fast exactly \`n\` times, then move both references until fast is null. The invariant is that fast stays \`n\` edges ahead, so slow is the requested node when that gap reaches the end.

## Complexity, TypeScript, and edges

Both walks take O(n) time and O(1) extra space. The node references—not the input array used to construct a teaching list—must drive the answer.

- Empty input has no middle.
- One node is its own middle.
- Define first or second middle for even lengths before coding.
- If fast becomes null during the head start, \`n\` exceeds the length.
- Optional chaining can hide an invalid transition; keep the loop guard explicit.

## Optional enrichment

Use slow and fast pointers for cycle detection. That problem needs a different proof: if a cycle exists, the faster pointer eventually gains one position per iteration modulo the cycle length.

## Related

- [What Is a Linked List? Nodes, Links, and the Head](/articles/linked-lists)
- [What Are the Three Pointers in a Linked-List Reversal?](/articles/three-pointers)
  `,
  ),
  defineArticle(
    "next-greater-values",
    "How Does a Monotonic Stack Find the Next Greater Value?",
    "Linear structures",
    "A monotonic stack keeps unresolved indexes in decreasing-value order. Each later value resolves every smaller value on top.",
    ["next greater", "monotonic stack", "waiting indexes"],
    `
For each position, the **next greater** value is the first later value that is strictly larger. A stack stores indexes whose answers are still unresolved. Values at those indexes are non-increasing from bottom to top.

\`\`\`mermaid
flowchart TD
  Read["Read nums[i]"] --> Compare{"Greater than value at stack top?"}
  Compare -->|yes| Resolve["Pop index; write nums[i] as its answer"]
  Resolve --> Compare
  Compare -->|no or empty| Push["Push i"]
\`\`\`

## Implementation

\`\`\`ts
function nextGreater(values: readonly number[]): number[] {
  const answers = values.map(() => -1);
  const waiting: number[] = [];

  for (let index = 0; index < values.length; index += 1) {
    const current = values[index];
    if (current === undefined) {
      continue;
    }

    while (waiting.length > 0) {
      const previousIndex = waiting[waiting.length - 1];
      if (previousIndex === undefined) {
        break;
      }
      const previous = values[previousIndex];
      if (previous === undefined || previous >= current) {
        break;
      }
      answers[previousIndex] = current;
      waiting.pop();
    }

    waiting.push(index);
  }

  return answers;
}

console.log(nextGreater([2, 1, 2, 4, 3]));
// [4, 2, 4, -1, -1]
\`\`\`

For \`[2, 1, 2, 4, 3]\`, index 1 resolves at the later 2. The first 2 does not resolve there because greater is strict; both 2s resolve at 4. The final stack indexes keep the initialised answer \`-1\`.

## Correctness and cost

Before each input index, the stack contains exactly unresolved earlier indexes, in increasing index order and non-increasing value order. When \`current\` pops an index, every value between that index and \`current\` was no larger, or the index would already have been popped. Therefore \`current\` is its first strictly greater value.

Each index is pushed once and popped at most once. Total time is O(n), despite the inner \`while\`, and the answers plus stack use O(n) space.

## Edge cases and mistakes

- Equal values do not resolve one another; use \`<\`, not \`<=\`.
- Store indexes, not only values, because answers belong to positions.
- An empty input returns an empty output.
- A decreasing input leaves every answer at \`-1\`.
- \`pop()\` returns \`undefined\` on an empty TypeScript array, so guard the stack length.

## Optional enrichment

Change the comparison and traversal direction to derive next smaller, previous greater, and previous smaller variants. State the new monotonic invariant each time.

## Related

- [What Is a Stack? Last In, First Out](/articles/stacks)
- [What Is Linear Time? One Pass Through the Input](/articles/linear-time)
  `,
  ),
  defineArticle(
    "recursive-branching",
    "What Changes When Recursion Makes Two Calls?",
    "Search and sort",
    "Two recursive calls create a branching call tree. Correct indexing establishes the base values; overlapping branches explain exponential recomputation.",
    ["two recursive calls", "recursive branching", "nested depth"],
    `
One recursive call usually forms a chain. Two calls form a tree. Fibonacci is the smallest example: each non-base state asks for the two preceding states.

\`\`\`mermaid
flowchart TD
  F5["fib(5)"] --> F4["fib(4)"]
  F5 --> F3a["fib(3)"]
  F4 --> F3b["fib(3) again"]
  F4 --> F2["fib(2)"]
\`\`\`

## State and indexing convention

This version is one-based: \`fib(1) = 1\` and \`fib(2) = 1\`. That differs from a zero-based API where \`fib(0) = 0\`. State the convention before copying a recurrence.

\`\`\`ts
function fibonacciOneBased(n: number): number {
  if (!Number.isInteger(n) || n < 1) {
    throw new RangeError("n must be a positive integer");
  }
  if (n <= 2) {
    return 1;
  }
  return fibonacciOneBased(n - 1) + fibonacciOneBased(n - 2);
}

console.log(fibonacciOneBased(5));
// 5
\`\`\`

The correctness recurrence is \`F(n) = F(n - 1) + F(n - 2)\`, with both bases equal to 1. The termination measure is \`n\`: every branch lowers it and eventually reaches a base.

## Branching cost and a second combine rule

The running-time recurrence is \`T(n) = T(n - 1) + T(n - 2) + O(1)\`, which is exponential. The maximum live stack is only O(n), because depth—not the total number of calls—controls stack space.

Nested depth has a different combine rule: a number returns 0; an array returns \`1 + max(child depths)\`; and an empty array returns 1. Two siblings cause two calls but do not add their depths. The parent keeps the larger branch.

## Worked example and edges

\`fib(5)\` returns 5, but it computes \`fib(3)\` in both major branches. That repetition is the signal for memoisation. For nesting, \`[1, [2, [3]]]\` has depth 3, while \`[[], [1]]\` has depth 2.

- A base case must be correct and reachable on every branch.
- Addition combines Fibonacci counts; maximum combines alternative nesting branches.
- JavaScript engines do not guarantee tail-call optimisation, and two-call Fibonacci is not tail recursive.
- Do not “fix” exponential work by changing the recurrence; cache states without changing their meaning.

## Optional enrichment

\`fibMemo\` is that exercise. Keep \`fib(1) = fib(2) = 1\`, store each completed \`n\` before the two calls return, and check the cache with \`!== undefined\`. \`n = 40\` is the hidden time limit. The zero-based \`fib(0) = 0\` form in the memoisation article is a different base case.

## Related

- [What Is Recursion? Smaller Copies and a Base Case](/articles/recursion)
- [What Is Memoisation? Caching an Overlapping Answer](/articles/memoisation)
  `,
  ),
  defineArticle(
    "binary-search-boundaries",
    "How Does Binary Search Find the First or Last Equal Index?",
    "Search and sort",
    "Boundary binary search records a match and continues on one side. Inclusive bounds must move past mid so the candidate range strictly shrinks.",
    ["search boundary", "first equal", "last equal"],
    `
With duplicates, finding any match is not enough. Save a matching index, then continue left for the first match or right for the last. The invariant remains: if a better answer exists, it lies in the inclusive range \`[low, high]\`.

\`\`\`mermaid
flowchart TD
  Mid["Compare nums[mid]"] --> Match{"Equal?"}
  Match -->|no| Side["Discard the impossible half"]
  Match -->|yes, first| Left["Save mid; high = mid - 1"]
  Match -->|yes, last| Right["Save mid; low = mid + 1"]
\`\`\`

## First equal

\`\`\`ts
function firstEqual(values: readonly number[], target: number): number {
  let low = 0;
  let high = values.length - 1;
  let answer = -1;

  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    const value = values[middle];
    if (value === undefined) {
      return -1;
    }
    if (value < target) {
      low = middle + 1;
      continue;
    }
    if (value > target) {
      high = middle - 1;
      continue;
    }
    answer = middle;
    high = middle - 1;
  }

  return answer;
}

console.log(firstEqual([1, 2, 2, 2, 3], 2));
// 1
\`\`\`

For \`[1, 2, 2, 2, 3]\`, the first middle is index 2. Save it and search \`[0, 1]\`; index 1 also matches, so save 1 and search left once more. The final answer is 1.

## Correctness, cost, and conventions

After a match at \`middle\`, no index to its right can be a better first occurrence. Excluding the saved middle is safe because its index is retained in \`answer\`. Each update removes at least one index, proving termination. Time is O(log n) and extra space is O(1).

- Empty input starts with \`high = -1\` and returns \`-1\`.
- A last-equal search changes the match update to \`low = middle + 1\`.
- Inclusive search stops at \`low > high\`; half-open lower-bound search uses different initial bounds and a different stop.
- Leaving a bound at \`middle\` can repeat the same range forever.
- Sorted order is the fact that makes half-discarding safe.

## Optional enrichment

Implement a half-open lower bound on \`[low, high)\` with \`high = values.length\`. It can return \`values.length\` as an insertion position; explain why that is not an out-of-bounds read.

## Related

- [How Does Binary Search Throw Away Half the Work?](/articles/binary-search)
- [What Is an Off-by-One Error? Ranges, Remainders, and Indexes](/articles/off-by-one)
  `,
  ),
  defineArticle(
    "choosing-a-sort",
    "How Do You Choose Between Checking, Bubble Sort, and Merge Sort?",
    "Search and sort",
    "Checking order is linear, bubble sort is quadratic, and merge sort is linearithmic. The task contract determines which operation is needed.",
    ["sort selection", "non-decreasing order", "already sorted"],
    `
“Is this ordered?” and “put this in order” are different problems. A sortedness check stops at the first descent. Bubble sort demonstrates local swaps. Merge sort is the scalable general-purpose algorithm taught in this course.

\`\`\`mermaid
flowchart TD
  Goal{"What is required?"}
  Goal -->|check only| Scan["Neighbour scan: O(n)"]
  Goal -->|practice swaps| Bubble["Bubble sort: O(n²)"]
  Goal -->|scalable stable sort| Merge["Merge sort: O(n log n)"]
\`\`\`

## Three contracts

A non-decreasing array permits equal neighbours. The invariant for a check is that the prefix through the current index is ordered; one descent proves the whole array is not.

Bubble sort copies the input, repeatedly swaps adjacent inversions, and may stop after a pass with no swaps. After each full pass, the largest unsettled value is in its final suffix position. Its worst-case time is O(n²), with O(n) space here because the input is preserved.

Merge sort recursively sorts two halves and linearly merges their sorted runs. Its recurrence is \`T(n) = 2T(n / 2) + O(n)\`, yielding O(n log n) time and O(n) auxiliary array space.

## Worked choice

For \`[1, 2, 2]\`, an order check performs two comparisons and returns true. Sorting it again does unnecessary work. For \`[3, 2, 1]\`, bubble sort exposes three inversions through swaps; merge sort reaches the same result with the stronger asymptotic guarantee.

## TypeScript and edge cases

- \`values.slice()\` makes a shallow copy before an in-place teaching sort.
- JavaScript's default \`.sort()\` compares string forms; numeric sorting needs \`(a, b) => a - b\`.
- Empty and one-value arrays are already sorted.
- Stability means equal-key records retain input order. Merge from the left on equality to preserve it.
- An early-exit bubble sort has O(n) best-case time but remains O(n²) worst-case.
- Do not call the built-in sort when the exercise is assessing the algorithm.

## Optional enrichment

Compare merge sort with quicksort on stability, worst-case time, and auxiliary storage. No one comparison sort is best on every axis.

## Related

- [What Is Bubble Sort? Repeated Neighbour Swaps](/articles/bubble-sort)
- [What Is Merge Sort? Split, Sort, and Merge](/articles/merge-sort)
- [What Is a Sorted Run? The Merge Step Between Two Halves](/articles/sorted-runs)
  `,
  ),
  defineArticle(
    "bst-insertion-shape",
    "How Does Insertion Order Determine BST Shape?",
    "Trees and graphs",
    "A binary search tree preserves key order but not balance. Insertion order can produce a short tree or a linear spine.",
    ["bst insertion order", "tree that has become a line", "sorted inserts"],
    `
A binary search tree invariant says that every left-subtree key is smaller and every right-subtree key is larger. It does not promise a balanced shape. Shape depends on insertion order.

\`\`\`mermaid
flowchart LR
  Balanced["Insert 2, 1, 3<br/>height 2"] --> Rule["Same BST ordering rule"]
  Spine["Insert 1, 2, 3<br/>height 3"] --> Rule
\`\`\`

## Height recurrence

Let \`height(node)\` count real nodes on the longest downward path:

- \`height(null) = 0\`
- \`height(node) = 1 + max(height(node.left), height(node.right))\`

This is a structural recurrence, not a calculation on key values. A leaf has height 1. A three-node right spine has height 3.

\`\`\`ts
interface ShapeNode {
  readonly value: number;
  left: ShapeNode | null;
  right: ShapeNode | null;
}

function height(node: ShapeNode | null): number {
  if (node === null) {
    return 0;
  }
  return 1 + Math.max(height(node.left), height(node.right));
}

const spine: ShapeNode = {
  value: 1,
  left: null,
  right: {
    value: 2,
    left: null,
    right: { value: 3, left: null, right: null },
  },
};

console.log(height(spine));
// 3
\`\`\`

The return invariant is that each call returns the height of exactly its subtree. The null base establishes zero; the recursive case adds the current node to the taller child path.

## Search cost follows height

Search compares once per visited level, so it takes O(h) time. A balanced n-node BST has \`h = O(log n)\`; sorted insertion into an ordinary BST can create \`h = n\`, making search O(n). Building by ordinary insertion can likewise range from O(n log n) to O(n²).

## Edge cases and conventions

- Empty height is 0 when height counts nodes; an edge-counting convention would use -1.
- Do not sort the input before insertion: that changes the structure being measured.
- Decide where duplicate keys go, or reject them. The rule must stay consistent.
- Recursive height uses O(h) call-stack space and can overflow on a very long spine.
- Searching the original array bypasses the data structure and its shape.

## Optional enrichment

Insert every permutation of \`[1, 2, 3]\` and group the resulting trees by height. Then compare with an AVL or red-black tree, which repairs height after updates.

## Related

- [What Is a Binary Search Tree? Ordered Left and Right Branches](/articles/binary-search-trees)
- [Why Balance a Search Tree? Keeping Height Logarithmic](/articles/balanced-trees)
  `,
  ),
  defineArticle(
    "shared-prefix-counts",
    "How Do Trie Node Counts Measure Shared Prefixes?",
    "Patterns",
    "A count on each trie node records how many inserted words pass through it. Prefix queries and longest common prefixes then become path walks.",
    ["shared prefix counts", "longest common prefix", "prefix counts"],
    `
Words share a trie path until their characters differ. Store on each node the number of inserted words that pass through it. The root count is the total number of words; after one character, the child count is the number sharing that one-character prefix.

\`\`\`mermaid
flowchart TD
  Root["root: 3 words"] --> C["c: 3"]
  C --> A["a: 3"]
  A --> T["t: 1"]
  A --> R["r: 2"]
  R --> P["p: 1"]
\`\`\`

## Node meaning and insertion

\`\`\`ts
interface CountedTrieNode {
  readonly children: Record<string, CountedTrieNode | undefined>;
  prefixCount: number;
  isWord: boolean;
}

function countedNode(): CountedTrieNode {
  return { children: {}, prefixCount: 0, isWord: false };
}

function insertWord(root: CountedTrieNode, word: string): void {
  let node = root;
  node.prefixCount += 1;

  for (const character of word) {
    let child = node.children[character];
    if (child === undefined) {
      child = countedNode();
      node.children[character] = child;
    }
    child.prefixCount += 1;
    node = child;
  }

  node.isWord = true;
}

const root = countedNode();
insertWord(root, "cat");
insertWord(root, "car");
insertWord(root, "carp");

console.log(root.children.c?.children.a?.prefixCount);
// 3
\`\`\`

The invariant after inserting any number of words is that a node's \`prefixCount\` equals the number of insertions whose spelling includes the root-to-node path as a prefix. \`isWord\` answers a different question: whether a word ends exactly there.

## Two queries

To count a queried prefix, walk its characters. A missing edge returns 0; otherwise return the final node's count. The empty query ends at the root and therefore counts every inserted word.

For the longest common prefix of \`W\` words, continue from the root while there is exactly one next character whose node count is \`W\`. Stop at a branch or a lower count. For \`flower\`, \`flow\`, and \`flight\`, counts remain 3 through \`f\` and \`l\`, then split, so the answer is \`"fl"\`.

Building takes O(C) time and space for C inserted characters before sharing. A query of length L takes O(L) time. Finding the common prefix takes O(P · A) with plain object child scans, where P is the returned prefix length and A is the number of outgoing edges inspected per node.

## Edge cases and TypeScript details

- Every node must receive a fresh \`children\` object.
- An empty word marks the root's \`isWord\`; it also contributes to the root count.
- Duplicate insertions increase counts repeatedly unless the contract deduplicates words first.
- \`Record<string, Node | undefined>\` makes a missing edge explicit without a type assertion.
- Normalize Unicode first if canonically equivalent spellings should share a path.

## Optional enrichment

Add deletion by decrementing each node on the exact word path. An end counter is needed if duplicate insertions must be deleted independently.

## Related

- [What Is a Trie? A Prefix Tree for Shared Word Paths](/articles/tries)
- [How Does Depth-First Search Explore One Branch First?](/articles/depth-first-search)
  `,
  ),
];

import { defineArticle, type Article } from "./types";

export const arrayArticles: readonly Article[] = [
  defineArticle(
    "contiguous-arrays",
    "How Arrays Support Fast Indexing",
    "Arrays",
    "An array gives each element an integer index, so reading a known position is O(1). Dense arrays scan efficiently, while insertions near the front are O(n) because later elements must move.",
    ["contiguous list"],
    `
An array stores an ordered sequence and gives each element an integer index from 0 through \`length - 1\`. Given a valid index, \`values[index]\` takes O(1) time. Inserting or deleting near the front takes O(n) time because the later elements change positions.

\`\`\`mermaid
flowchart LR
  A["index 0<br/>4"] --- B["index 1<br/>8"] --- C["index 2<br/>15"] --- D["index 3<br/>16"]
  Q{"Operation"} --> R["Read index 2<br/>O(1)"]
  Q --> I["Insert at index 1<br/>shift the suffix: O(n)"]
\`\`\`

## The model and TypeScript reality

In the standard array model, equal-width elements occupy adjacent slots. If the first slot has address b and each element uses w bytes, index i is found at \`b + i * w\`. The number of arithmetic operations does not grow with the array, so indexed access is O(1).

TypeScript's \`Array<T>\` provides the same indexed abstraction, but JavaScript does **not** guarantee that every array is one literal contiguous block of fixed-width values. Engines may change their internal representation, especially for sparse arrays or mixed value types. The useful algorithmic model is therefore:

- indexed reads and writes are O(1) in ordinary use;
- \`push\` and \`pop\` are amortized O(1);
- \`shift\`, \`unshift\`, and middle \`splice\` operations are O(n);
- a full traversal is O(n).

“Amortized O(1)” means that an occasional resize may copy many elements, but the total cost of many end insertions averages to constant time per insertion.

## A complete example

This function inserts into a copy so the input is not mutated. The first loop copies the prefix, the new value fills the gap, and the second loop copies the suffix.

\`\`\`ts
function insertAt(
  values: readonly number[],
  index: number,
  value: number,
): number[] {
  if (!Number.isInteger(index) || index < 0 || index > values.length) {
    throw new RangeError("index must be between 0 and values.length");
  }

  const result: number[] = [];

  for (let i = 0; i < index; i += 1) {
    const current = values[i];
    if (current !== undefined) {
      result.push(current);
    }
  }

  result.push(value);

  for (let i = index; i < values.length; i += 1) {
    const current = values[i];
    if (current !== undefined) {
      result.push(current);
    }
  }

  return result;
}

const original = [4, 8, 15, 16];
console.log(insertAt(original, 1, 7));
console.log(original);
// Output:
// [4, 7, 8, 15, 16]
// [4, 8, 15, 16]
\`\`\`

Expected output is \`[4, 7, 8, 15, 16]\`, followed by the unchanged input \`[4, 8, 15, 16]\`.

## Dense and sparse arrays

\`[10, 20, 30]\` is dense: every index below its length has a value. Setting \`values[1_000_000] = 5\` creates a sparse array with a large gap. Its \`length\` becomes 1,000,001 even though almost all positions are empty. Sparse arrays can have surprising iteration behavior and different engine representations. For DSA work, prefer dense arrays and represent a genuinely sparse relationship with a more suitable structure.

## Cost

| Operation | Time | Extra space |
| --- | --- | --- |
| Read or write a known index | O(1) | O(1) |
| Traverse every element | O(n) | O(1) |
| \`push\` or \`pop\` at the end | O(1) amortized | O(1) amortized |
| Insert or delete near the front | O(n) | O(1) in place |
| Make a full copy | O(n) | O(n) |

The example is O(n) time and O(n) extra space because it deliberately returns a copy. An in-place insertion still takes O(n) time but does not allocate another n-element array.

## Common mistakes

Do not say that every array operation is O(1). The index lookup is constant time; shifting a suffix is not.

Do not call \`push\` worst-case O(1). A resize can be O(n), so the precise bound is amortized O(1).

Do not use \`delete values[i]\` to remove an element. It leaves a hole and does not reduce \`length\`. Use \`splice\` when mutation is intended, or construct a new dense array.

Do not read outside 0 through \`length - 1\`. JavaScript returns \`undefined\`; it does not report an index error.

## When arrays fit

Use an array for indexed access, left-to-right traversal, compact ordered data, and end insertion. Consider a linked structure when repeated insertions or deletions occur at nodes you already hold. Consider a queue implementation with a moving head index instead of repeatedly calling \`shift\`.

## FAQ

### Why is index 10 not ten times slower than index 1?

Both accesses use a constant amount of index calculation. Big O counts how work grows with input size, not the numeric distance of an index.

### Does TypeScript check an index at runtime?

No. TypeScript types are erased before execution, and JavaScript returns \`undefined\` for an absent array property. Validate indexes when absence would be an error.

### Is a TypeScript array really contiguous?

The language specification does not promise that physical layout. Contiguous storage is the teaching model behind classic fixed-width arrays; JavaScript engines preserve fast indexed behavior while choosing their own representations.

## Related

[How Do You Rotate an Array Left? Remainder and Cost](/articles/rotating-an-array) and [What Is a Linked List? Pointers Instead of Indexes](/articles/linked-lists)
    `,
  ),
  defineArticle(
    "rotating-an-array",
    "How Do You Rotate an Array Left?",
    "Arrays",
    "A left rotation moves a prefix to the back without changing relative order. Reducing the step count modulo the length avoids repeated shifts and gives an O(n) solution.",
    ["Rotating left", "rotated left"],
    `
A left rotation by k moves the first k values to the back while preserving order. For example, rotating \`[1, 2, 3, 4]\` left by 1 produces \`[2, 3, 4, 1]\`.

\`\`\`mermaid
flowchart LR
  A["[1, 2, 3, 4]"] --> B["split after k = 1"]
  B --> C["prefix [1]"]
  B --> D["suffix [2, 3, 4]"]
  C --> E["join suffix + prefix"]
  D --> E
  E --> F["[2, 3, 4, 1]"]
\`\`\`

## How it works

A full turn of n steps restores an n-element array. Therefore only \`steps % n\` matters. Rotating four elements by 5 steps is the same as rotating by 1.

Handle the empty array before taking a remainder: remainder by zero produces \`NaN\`. A rotation count must be an integer because “half an array position” has no meaning. The implementation below also accepts negative steps. A negative left rotation is a right rotation, and the normalization \`((steps % n) + n) % n\` always produces an offset from 0 through \`n - 1\`.

The suffix from the offset becomes the front, and the prefix before the offset becomes the back.

\`\`\`ts
function rotateLeft(values: readonly number[], steps: number): number[] {
  if (!Number.isInteger(steps)) {
    throw new RangeError("steps must be an integer");
  }

  if (values.length === 0) {
    return [];
  }

  const offset = ((steps % values.length) + values.length) % values.length;
  return values.slice(offset).concat(values.slice(0, offset));
}

const values = [1, 2, 3, 4];
console.log(rotateLeft(values, 1));
console.log(rotateLeft(values, 5));
console.log(rotateLeft(values, -1));
console.log(values);
// Output:
// [2, 3, 4, 1]
// [2, 3, 4, 1]
// [4, 1, 2, 3]
// [1, 2, 3, 4]
\`\`\`

Expected output is \`[2, 3, 4, 1]\`, \`[2, 3, 4, 1]\`, \`[4, 1, 2, 3]\`, and finally the unchanged input \`[1, 2, 3, 4]\`.

## Trace the indexes

For a positive left offset k, an old index i moves to:

\`(i - k + n) % n\`

With n = 4 and k = 1, old index 0 moves to 3, index 1 moves to 0, index 2 moves to 1, and index 3 moves to 2. Adding n prevents a negative remainder. JavaScript's \`-1 % 4\` is \`-1\`, not \`3\`.

The slice implementation expresses the same movement without manually assigning destinations. Both slices together copy n values.

## Cost

The implementation takes O(n) time and O(n) extra space. It leaves the input unchanged. Even when the normalized offset is zero, it returns a copy and therefore still takes O(n) time and space.

An in-place three-reversal algorithm can rotate in O(n) time and O(1) extra space, but it mutates the input and is less direct. Repeatedly calling \`shift\` and \`push\` k times can take O(nk) time because each \`shift\` moves the remaining elements.

## Common mistakes

Do not perform one shift per requested step. Reduce large step counts with remainder first.

Do not calculate a remainder before handling an empty array.

Do not use \`(i - offset) % n\` as a destination without normalization; JavaScript can produce a negative result.

Do not claim a function is non-mutating if it returns and modifies the original array. The implementation above returns a new array.

## When to use it

Rotation fits cyclic schedules, ring-like orderings, and problems where a prefix wraps to the back. It is not sorting, reversal, or arbitrary permutation: all elements retain the same cyclic order.

## FAQ

### Why does modulo remove full turns?

Every group of n left moves returns all n elements to their starting indexes. The quotient counts irrelevant full turns; the remainder is the unfinished turn.

### Why support negative steps?

It gives the operation a useful symmetric meaning: rotating left by -1 is rotating right by 1. If an exercise promises non-negative steps, the extra normalization is harmless.

### Can rotation be O(1) time?

Not when an ordinary returned array must contain n values in their new positions. A logical view could store only an offset, but reading that view would then translate indexes.

## Related

[How Arrays Support Fast Indexing](/articles/contiguous-arrays) and [What Is the Two-Pointer Technique on a Sorted Array?](/articles/two-pointers)
    `,
  ),
  defineArticle(
    "two-pointers",
    "What Is the Two-Pointer Technique on a Sorted Array?",
    "Arrays",
    "Two pointers maintain two meaningful indexes and move them according to an invariant. For sorted squares, the largest remaining square must be at one of the two ends.",
    ["two pointers", "two-pointer"],
    `
The two-pointer technique keeps two indexes whose positions summarize the unprocessed data. In the sorted-squares problem, one pointer starts at each end of a non-decreasing array. The largest remaining absolute value must be at one of those ends.

\`\`\`mermaid
flowchart TD
  A["Compare abs(values[left]) and abs(values[right])"] --> B{"Which square is larger?"}
  B -->|"left"| C["write left square<br/>move left rightward"]
  B -->|"right"| D["write right square<br/>move right leftward"]
  C --> E["fill the result from back to front"]
  D --> E
  E --> A
\`\`\`

## The invariant

An invariant is a statement that remains true before and after every iteration. Here it is:

> All result positions after \`write\` already contain the correct largest squares, and every unprocessed input value lies between \`left\` and \`right\`.

Squaring can disrupt input order because a large negative becomes a large positive. In \`[-4, -1, 0, 3, 10]\`, the direct squares are \`[16, 1, 0, 9, 100]\`. However, the largest remaining square is always produced by the leftmost or rightmost remaining value. Write that square at the back and move only the pointer that supplied it.

\`\`\`ts
function sortedSquares(values: readonly number[]): number[] {
  const result = new Array<number>(values.length);
  let left = 0;
  let right = values.length - 1;
  let write = values.length - 1;

  while (left <= right) {
    const leftValue = values[left];
    const rightValue = values[right];
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

console.log(sortedSquares([-4, -1, 0, 3, 10]));
console.log(sortedSquares([-7, -3, -1]));
// Output:
// [0, 1, 9, 16, 100]
// [1, 9, 49]
\`\`\`

Expected output is \`[0, 1, 9, 16, 100]\` and \`[1, 9, 49]\`.

## Trace one run

For \`[-4, -1, 0, 3, 10]\`:

1. Compare 16 and 100; write 100 at index 4 and move \`right\`.
2. Compare 16 and 9; write 16 at index 3 and move \`left\`.
3. Compare 1 and 9; write 9 at index 2 and move \`right\`.
4. Compare 1 and 0; write 1 at index 1 and move \`left\`.
5. Write 0 at index 0.

Every iteration finalizes one output position. No input position is revisited.

## Cost

The pointers each move only inward, so there are exactly n iterations: O(n) time. The returned array requires O(n) extra space. The pointer variables use O(1) space.

Squaring and then comparison-sorting takes O(n log n) time. The linear method depends on the input already being sorted. On unsorted input, the largest square may be in the middle, so the end invariant is false.

## Common mistakes

Do not move both pointers after one comparison. The losing end is still unprocessed and may win next.

Do not fill from the front. The comparison identifies the largest remaining square, so fill from the back.

Do not compare signed values. Compare their squares or absolute values.

Do not apply the proof to unsorted input. Two indexes alone do not summarize an arbitrary middle.

## When to use it

Use inward pointers when sorted order or end structure lets one comparison discard an end safely. Use same-direction pointers for tasks such as removing duplicates in place. In every case, state what each pointer means and why moving it cannot remove a needed candidate.

## FAQ

### Why is the method linear if there is a while loop?

Loop syntax does not determine complexity. Each iteration moves one pointer inward, and no pointer reverses direction. At most n values are processed.

### What happens when the squares tie?

Either end can be written first. The implementation chooses the right end on a tie; the equal values are indistinguishable in the sorted result.

### Is the result array counted as extra space?

Yes. If the required output has n values, it occupies O(n) space. Sometimes analyses distinguish required output space from auxiliary working space; state which convention you use.

## Related

[What Is a Sliding Window? Fixed and Variable Subarrays](/articles/sliding-windows) and [What Is Binary Search? Throw Away Half of a Sorted Array](/articles/binary-search)
    `,
  ),
  defineArticle(
    "sliding-windows",
    "What Is a Sliding Window?",
    "Arrays",
    "A sliding window represents one contiguous range with two boundaries. Reusing the previous range turns fixed-width sums into O(n), while variable windows require a condition that moves boundaries monotonically.",
    ["sliding window", "subarray"],
    `
A sliding window tracks a contiguous subarray while its boundaries move forward. Instead of rebuilding each overlapping range, update the information that changed: remove the value that left and add the value that entered.

\`\`\`mermaid
flowchart LR
  A["[2, 1, 5]<br/>sum 8"] -->|"remove 2<br/>add 1"| B["[1, 5, 1]<br/>sum 7"]
  B -->|"remove 1<br/>add 3"| C["[5, 1, 3]<br/>sum 9"]
  C -->|"remove 5<br/>add 2"| D["[1, 3, 2]<br/>sum 6"]
\`\`\`

## Fixed-width windows

For the maximum sum of k consecutive values, sum the first k values once. Each later window differs by exactly two values. This makes each slide O(1).

\`\`\`ts
function maxWindowSum(values: readonly number[], width: number): number | null {
  if (!Number.isInteger(width) || width < 1 || width > values.length) {
    return null;
  }

  let sum = 0;
  for (let index = 0; index < width; index += 1) {
    sum += values[index] ?? 0;
  }

  let best = sum;

  for (let right = width; right < values.length; right += 1) {
    const entering = values[right] ?? 0;
    const leaving = values[right - width] ?? 0;
    sum += entering - leaving;

    if (sum > best) {
      best = sum;
    }
  }

  return best;
}

console.log(maxWindowSum([2, 1, 5, 1, 3, 2], 3));
console.log(maxWindowSum([4, 2], 3));
// Output:
// 9
// null
\`\`\`

Expected output is \`9\` and \`null\`. Returning \`null\` distinguishes “no valid window” from a valid maximum sum of 0 or a negative number.

## Variable-width windows

A variable window can solve “find the shortest subarray with sum at least a target” in O(n) **when all values are non-negative**. Adding a value cannot decrease the sum, and removing a value cannot increase it. That monotonic behavior tells us when to grow and when to shrink.

\`\`\`ts
function shortestAtLeast(
  values: readonly number[],
  target: number,
): number | null {
  if (target <= 0) {
    return 0;
  }

  let left = 0;
  let sum = 0;
  let best = Number.POSITIVE_INFINITY;

  for (let right = 0; right < values.length; right += 1) {
    const entering = values[right] ?? 0;
    if (entering < 0) {
      throw new RangeError("values must be non-negative");
    }

    sum += entering;

    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= values[left] ?? 0;
      left += 1;
    }
  }

  if (best === Number.POSITIVE_INFINITY) {
    return null;
  }

  return best;
}

console.log(shortestAtLeast([1, 2, 3, 4], 6));
console.log(shortestAtLeast([1, 1], 5));
// Output:
// 2
// null
\`\`\`

Expected output is \`2\` and \`null\`.

## Why both versions are O(n)

The fixed window visits each input position a constant number of times. In the variable window, \`right\` moves forward n times and \`left\` also moves forward at most n times. The inner \`while\` does not make the algorithm O(n²), because its total iterations across the whole run are at most n.

Both implementations use O(1) auxiliary space, excluding their inputs.

## The negative-number limitation

For \`[5, -10, 6]\`, growing a window can lower its sum and shrinking it can raise its sum. The simple grow-or-shrink rule no longer has a monotonic guarantee. Problems with negative values may require prefix sums plus a different data structure; do not quote the O(n) variable-window solution without its precondition.

## Common mistakes

Do not re-sum all k values at every starting index. That takes O(nk) time.

Do not initialize a maximum to 0 when valid window sums may all be negative. Initialize it from the first valid window.

Do not confuse a subarray with a subsequence. A subarray is contiguous; a subsequence may contain gaps.

Do not claim every variable-window problem is linear. The boundary rule must be correct, and the boundaries must move monotonically.

## When to use it

Use a fixed window when the width is known and adjacent ranges overlap. Use a variable window when extending and shrinking changes the condition predictably. If values can be negative, prove monotonicity or choose another method.

## FAQ

### Why return null for an invalid width?

There is no k-element subarray when k is below 1 or above the input length. \`null\` represents absence without colliding with a legitimate numeric answer.

### Is the inner while loop quadratic?

No. Although it is nested syntactically, \`left\` never moves backward. Across all outer iterations, it advances at most n positions.

### What state can a window maintain?

Common choices include a sum, a count, or a frequency record. The update must be cheaper than recomputing that state for the whole range.

## Related

[What Is the Two-Pointer Technique on a Sorted Array?](/articles/two-pointers), [How Prefix Sums Answer Range Queries](/articles/prefix-sums), and [What Is a Queue? FIFO Order, Enqueue, and Dequeue](/articles/queues)
    `,
  ),
  defineArticle(
    "prefix-sums",
    "How Prefix Sums Answer Range Queries",
    "Arrays",
    "A prefix-sum array precomputes totals from the start. After O(n) preprocessing, any half-open range sum can be answered in O(1) by subtracting two prefixes.",
    ["prefix sum", "prefix sums"],
    `
A prefix-sum array stores cumulative totals so repeated range-sum questions do not rescan the same values. Define \`prefix[i]\` as the sum of elements before index i. Then the sum of the half-open range \`[start, end)\` is:

\`prefix[end] - prefix[start]\`

\`\`\`mermaid
flowchart LR
  A["values<br/>3, 1, 4, 2"] --> B["prefix<br/>0, 3, 4, 8, 10"]
  B --> C["sum [1, 4)<br/>prefix[4] - prefix[1]"]
  C --> D["10 - 3 = 7"]
\`\`\`

## Why the subtraction works

\`prefix[end]\` contains everything before \`end\): the values before \`start\` plus the requested range. \`prefix[start]\` contains exactly the unwanted values before \`start\`. Subtracting cancels that shared prefix.

The initial zero is deliberate. It makes ranges beginning at index 0 use the same formula, and it gives an n-element input an n + 1-element prefix array.

\`\`\`ts
function buildPrefixSums(values: readonly number[]): number[] {
  const prefix = [0];

  for (const value of values) {
    const previous = prefix[prefix.length - 1] ?? 0;
    prefix.push(previous + value);
  }

  return prefix;
}

function rangeSum(
  prefix: readonly number[],
  start: number,
  end: number,
): number {
  const valueCount = prefix.length - 1;
  const validRange =
    Number.isInteger(start) &&
    Number.isInteger(end) &&
    start >= 0 &&
    start <= end &&
    end <= valueCount;

  if (!validRange) {
    throw new RangeError("expected 0 <= start <= end <= values.length");
  }

  return (prefix[end] ?? 0) - (prefix[start] ?? 0);
}

const values = [3, 1, 4, 2];
const prefix = buildPrefixSums(values);

console.log(prefix);
console.log(rangeSum(prefix, 1, 4));
console.log(rangeSum(prefix, 0, 2));
console.log(rangeSum(prefix, 2, 2));
// Output:
// [0, 3, 4, 8, 10]
// 7
// 4
// 0
\`\`\`

Expected output is \`[0, 3, 4, 8, 10]\`, then \`7\`, \`4\`, and \`0\`.

## Trace the construction

Start with \`prefix = [0]\`.

1. Add 3 to 0, producing 3.
2. Add 1 to 3, producing 4.
3. Add 4 to 4, producing 8.
4. Add 2 to 8, producing 10.

For \`[1, 4)\`, subtract the total before index 1 from the total before index 4: \`10 - 3 = 7\`. The included values are 1, 4, and 2.

Half-open ranges match \`slice(start, end)\`: start is included and end is excluded. The empty range \`[2, 2)\` correctly has sum 0.

## Cost and trade-off

Building the prefix array takes O(n) time and O(n) extra space. Each range query then takes O(1) time and O(1) extra space.

For q queries, rescanning each range can cost O(qn) in the worst case. Prefix preprocessing makes the total O(n + q). The trade-off is worthwhile when the data is unchanged and there are many queries.

Changing one original value invalidates every later prefix total, so a simple prefix array is poor for frequent updates. More advanced structures such as Fenwick trees or segment trees balance updates and queries in O(log n).

## Common mistakes

Do not omit the leading zero. Without it, ranges starting at index 0 need a special case.

Do not mix inclusive and exclusive end conventions. Write \`[start, end)\` next to the formula.

Do not rebuild the prefix array for every query. Build it once, then reuse it.

Do not use prefix sums blindly when totals can exceed JavaScript's safe integer range. \`number\` represents integers exactly only through \`Number.MAX_SAFE_INTEGER\`; integer-only applications with larger totals may need \`bigint\`.

## When to use it

Use prefix sums for many aggregate queries over mostly immutable data. Besides sums, the same cancellation idea supports counts, such as “how many even values occur in this range?” by prefixing 1 for even and 0 for odd.

## FAQ

### Why is the prefix array one element longer?

The leading zero represents the sum before any values. It removes a boundary special case and makes \`prefix[end] - prefix[start]\` valid for every legal half-open range.

### Are negative values allowed?

Yes. Prefix subtraction remains correct with negative values because it is an algebraic identity. Unlike the simple variable sliding window, it does not rely on sums changing monotonically.

### When is preprocessing worth it?

Usually when multiple range queries reuse the same data. For one query, a direct scan is simpler and already O(n).

## Related

[What Is a Sliding Window?](/articles/sliding-windows) and [How Arrays Support Fast Indexing](/articles/contiguous-arrays)
    `,
  ),
];

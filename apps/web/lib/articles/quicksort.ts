import { defineArticle, type Article } from "./types";

export const quicksortArticles: readonly Article[] = [
  defineArticle(
    "quicksort",
    "How Does Quicksort Partition Around a Pivot? (Optional Enrichment)",
    "Search and sort",
    "Optional enrichment: quicksort partitions values around a pivot, then recursively sorts the two sides. Balanced partitions give O(n log n) time, while repeated extreme pivots give O(n²).",
    ["quicksort", "partition", "pivot"],
    `
Quicksort chooses a **pivot**, partitions values into groups smaller than,
equal to, and greater than it, then sorts the outer two groups by the same
rule. This article is optional enrichment after merge sort. Unlike merge sort,
which always splits by position and does work while merging, quicksort
discovers its split by comparing values with the pivot.

\`\`\`mermaid
flowchart TD
  input["[7, 2, 5, 1, 4]"] --> pivot["Choose middle pivot 5"]
  pivot --> lower["Less than 5: [2, 1, 4]"]
  pivot --> equal["Equal to 5: [5]"]
  pivot --> higher["Greater than 5: [7]"]
  lower --> sortLower["Sort recursively: [1, 2, 4]"]
  higher --> sortHigher["Sort recursively: [7]"]
  sortLower --> joined["[1, 2, 4, 5, 7]"]
  equal --> joined
  sortHigher --> joined
\`\`\`

## Partition before recursion

The partition establishes an invariant:

> Every value in \`lower\` is less than the pivot, every value in \`equal\`
> equals it, and every value in \`higher\` is greater than it.

Once that statement is true, neither recursive call needs to compare a value
from one side with a value from the other. Sorting the outer sides is enough;
placing the equal group between them produces one sorted result.

The base case is an array with fewer than two values. It is already sorted.
The equal group contains at least the chosen pivot, so neither recursive call
can receive all \`n\` values. Recursion therefore makes progress even when the
partition is badly unbalanced. An all-equal input finishes after one partition.

This teaching implementation returns a new array and uses three temporary
arrays. Choosing the middle position avoids the obvious worst case on an
already sorted array, but it does not guarantee balanced partitions for every
input. It validates once at the public boundary so sparse arrays and \`NaN\`
cannot silently violate the ordering contract.

\`\`\`ts
function quicksort(values: readonly number[]): number[] {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === undefined || Number.isNaN(value)) {
      throw new Error("values must contain dense, non-NaN numbers");
    }
  }

  const sortRun = (run: readonly number[]): number[] => {
    if (run.length < 2) {
      return [...run];
    }

    const pivotIndex = Math.floor(run.length / 2);
    const pivot = run[pivotIndex];
    if (pivot === undefined) {
      throw new Error("a non-empty dense run must have a pivot");
    }

    const lower: number[] = [];
    const equal: number[] = [];
    const higher: number[] = [];

    for (let index = 0; index < run.length; index += 1) {
      const value = run[index];
      if (value === undefined) {
        throw new Error("a validated run must be dense");
      }
      if (value < pivot) {
        lower.push(value);
        continue;
      }
      if (value > pivot) {
        higher.push(value);
        continue;
      }
      equal.push(value);
    }

    return [...sortRun(lower), ...equal, ...sortRun(higher)];
  };

  return sortRun(values);
}

const input = [7, 2, 5, 1, 4, 4, -3];
console.log(quicksort(input));
console.log(input);
\`\`\`

Expected output is \`[-3, 1, 2, 4, 4, 5, 7]\`, followed by the unchanged input
\`[7, 2, 5, 1, 4, 4, -3]\`.

## Trace one partition

For \`[7, 2, 5, 1, 4]\`, the middle-position pivot is 5. Scanning the other
values puts 2, 1, and 4 in \`lower\`, and 7 in \`higher\`. The recursive call
on \`[2, 1, 4]\` chooses 1, producing an empty lower side and \`[2, 4]\` on the
higher side. Eventually every call reaches zero or one value.

Duplicates need an explicit policy. This implementation collects every value
equal to the pivot in \`equal\`. Those values are neither recursed on nor lost.
For \`[4, 4, 4, 4]\`, one scan fills \`equal\`, both recursive sides are empty,
and the sort returns. A two-way partition that removes only one equal pivot per
call can degrade to quadratic work on that input.

## Why the cost depends on the pivot

Partitioning one call scans its n values, so that level costs O(n). If the pivot
splits the values roughly in half, there are about log n levels and each level
processes n values in total. The time is O(n log n).

If every pivot is the smallest or largest value, one side has \`n - 1\` values
and the other is empty. The work becomes
\`n + (n - 1) + ... + 1\`, which is O(n²), and the recursion depth becomes
O(n).

| Partition shape | Time | Recursion depth |
| --- | --- | --- |
| Roughly equal sides | O(n log n) | O(log n) |
| Typical randomized pivots | O(n log n) expected | O(log n) expected |
| One empty side at every step | O(n²) | O(n) |

The returning implementation above also allocates arrays across recursive
calls. Its peak auxiliary space is O(n) with balanced partitions. With repeated
one-sided partitions, retained temporary arrays and total allocation can grow
to O(n²). An in-place partition avoids the three group arrays, but it still
needs stack space and mutates the input.

## Quicksort and merge sort

Both are divide-and-conquer sorts. Merge sort divides by position, guarantees
O(n log n) time, and uses O(n) auxiliary storage in the usual array
implementation. Quicksort partitions by value, is often cache-friendly in
place, and has an O(n²) worst case unless pivot selection is protected.

Quicksort is not stable by default: equal records can cross during a typical
in-place partition. This out-of-place three-way number implementation preserves
encounter order inside its equal groups, but that is not a general quicksort
guarantee. Merge sort can remain stable by taking the left value when merge
keys tie. Stability matters when records were already ordered by another key.

## Common mistakes

Do not include the entire equal group in a recursive side. If the recursive
input is unchanged, the base case is never reached. Each recursive side must
be strictly smaller than its caller.

Do not drop values equal to the pivot. A comparison that sends only smaller
values left and only larger values right loses duplicates unless equal values
are collected separately. Silently skipping \`undefined\` has the same data-loss
bug; validate the input or reject it.

Do not claim worst-case O(n log n). Balanced or randomized partitions justify
that expected shape; repeated extreme pivots produce O(n²).

Do not call a sort stable merely because duplicate numbers look identical.
Stability concerns records with equal keys and distinct original positions.

## Exercises

1. Trace every three-way partition of \`[3, 1, 4, 1, 5]\` and verify that both
   recursive calls are smaller than their caller.
2. Trace \`[2, 2, 2, 2]\` and explain why it finishes after one partition.
3. Write an in-place partition and state its loop invariant before coding.
4. Construct an input that makes a first-element pivot produce recursion depth
   n, then explain how a random pivot changes the guarantee.

## Related

- [How Does Merge Sort Stay O(n log n) in Every Case?](/articles/merge-sort)
- [What Is Recursion? Smaller Copies and a Base Case](/articles/recursion)
- [What Is O(n²) Quadratic Time? Nested Loops and Pairs](/articles/quadratic-time)
    `,
  ),
];

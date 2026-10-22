import { defineArticle, type Article } from "./types";

export const quicksortArticles: readonly Article[] = [
  defineArticle(
    "quicksort",
    "How Does Quicksort Partition Around a Pivot?",
    "Search and sort",
    "Quicksort partitions values around a pivot, then recursively sorts the two sides. Balanced partitions give O(n log n) time, while repeatedly choosing an extreme pivot gives O(n²).",
    ["quicksort", "partition", "pivot"],
    `
Quicksort chooses a **pivot**, partitions the remaining values into those no
greater than the pivot and those greater than it, then sorts those two smaller
groups by the same rule. Unlike merge sort, which always splits by position and
does work while merging, quicksort discovers its split by comparing values with
the pivot.

\`\`\`mermaid
flowchart TD
  input["[7, 2, 5, 1, 4]"] --> pivot["Choose pivot 4"]
  pivot --> lower["At most 4: [2, 1]"]
  pivot --> higher["Greater than 4: [7, 5]"]
  lower --> sortLower["Sort recursively: [1, 2]"]
  higher --> sortHigher["Sort recursively: [5, 7]"]
  sortLower --> joined["[1, 2, 4, 5, 7]"]
  sortHigher --> joined
\`\`\`

## Partition before recursion

The partition establishes an invariant:

> Every value in \`lower\` is no greater than the pivot, and every value in
> \`higher\` is greater than the pivot.

Once that statement is true, neither recursive call needs to compare a value
from one side with a value from the other. Sorting each side is enough; placing
the pivot between them produces one sorted result.

The base case is an array with fewer than two values. It is already sorted.
Every recursive call receives at most \`n - 1\` values because the pivot is
removed, so the recursion makes progress even when the partition is badly
unbalanced.

This teaching implementation returns a new array and uses three temporary
arrays. Choosing the middle position avoids the obvious worst case on an
already sorted array, but it does not guarantee balanced partitions for every
input.

\`\`\`ts
function quicksort(values: readonly number[]): number[] {
  if (values.length < 2) {
    return [...values];
  }

  const pivotIndex = Math.floor(values.length / 2);
  const pivot = values[pivotIndex];
  if (pivot === undefined) {
    return [];
  }

  const lower: number[] = [];
  const higher: number[] = [];

  for (let index = 0; index < values.length; index += 1) {
    if (index === pivotIndex) {
      continue;
    }

    const value = values[index];
    if (value === undefined) {
      continue;
    }
    if (value <= pivot) {
      lower.push(value);
      continue;
    }

    higher.push(value);
  }

  return [...quicksort(lower), pivot, ...quicksort(higher)];
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

Duplicates need an explicit policy. This implementation sends values equal to
the pivot into \`lower\`. Exactly one pivot is removed per call, so duplicates
are neither lost nor copied accidentally. A three-way partition—less than,
equal to, and greater than—handles many duplicate keys more efficiently.

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
calls. Its peak auxiliary space is O(n) with balanced partitions and can grow
to O(n²) total allocation over a worst-case run. An in-place partition avoids
the lower and higher arrays, but it still needs stack space and it mutates the
input.

## Quicksort and merge sort

Both are divide-and-conquer sorts. Merge sort divides by position, guarantees
O(n log n) time, and uses O(n) auxiliary storage in the usual array
implementation. Quicksort partitions by value, is often cache-friendly in
place, and has an O(n²) worst case unless pivot selection is protected.

Quicksort is not stable by default: equal records can cross during an in-place
partition. Merge sort can remain stable by taking the left value when merge
keys tie. Stability matters when records were already ordered by another key.

## Common mistakes

Do not include the pivot in a recursive side without removing one occurrence.
If the pivot is the largest and the recursive input is unchanged, the base case
is never reached.

Do not drop values equal to the pivot. A comparison that sends only smaller
values left and only larger values right loses duplicates unless equal values
are collected separately.

Do not claim worst-case O(n log n). Balanced or randomized partitions justify
that expected shape; repeated extreme pivots produce O(n²).

Do not call a sort stable merely because duplicate numbers look identical.
Stability concerns records with equal keys and distinct original positions.

## Exercises

1. Trace every partition of \`[3, 1, 4, 1, 5]\` and verify that every call is
   smaller than its caller.
2. Change the partition to three groups: less than, equal to, and greater than
   the pivot. Explain why an all-equal input then finishes after one partition.
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

import { defineArticle, type Article } from "./types";

export const costScaleArticles: readonly Article[] = [
  defineArticle(
    "logarithmic-time",
    "What Is O(log n)? Logarithmic Time and Binary Search",
    "Cost",
    "O(log n) means each step throws away a fraction of what remains. Binary search on a million sorted values is about twenty comparisons, and a balanced tree has about that many levels.",
    ["O(log n)", "log n"],
    `
O(log n) means each step throws away a fraction of what remains, so the step count grows much more slowly than the input. Binary search reads the middle of a sorted array and discards the half that cannot hold the target. 2^20 is 1,048,576, so a million sorted values costs about twenty comparisons. That count is also a height: a balanced tree has about log n levels, and a straight line of nodes has height n, so the same walk becomes linear.

\`\`\`mermaid
flowchart TD
  A["1,048,576 sorted values"] --> B["Read the middle"]
  B --> C["Throw away one half"]
  C --> D["About 20 comparisons"]
  D --> E["Balanced height is about 20"]
  E --> F["A straight line has height n"]
\`\`\`

## How it works

You keep a range that is still allowed to hold the answer. On an array the range is \`lo\` and \`hi\`, and at the start they cover every index. You read the middle. When it is the target, you stop. When the target is smaller, it cannot sit at the middle or to the right, and \`hi\` becomes the index just before the middle. When the target is larger, \`lo\` becomes the index just after the middle.

Keep this sentence true after every edit: if the target is present, its index is still between \`lo\` and \`hi\`, inclusive. When \`lo\` moves past \`hi\`, the range is empty and the target is absent. Each step leaves about half as many indices. log2 of n is how many times you can divide n by 2 before you reach 1.

The same count is a tree height. A balanced tree has about log n nodes from the root to a leaf. AVL and red-black trees rotate so the height stays there. You do not write those rotations here. A straight line of inserts has height n, and the same walk is linear.

The bugs are usually off by one. Compute the middle as \`lo\` plus half the distance to \`hi\`. The complete search below moves a bound beyond \`mid\` on every unsuccessful comparison, so the candidate interval strictly shrinks.

\`\`\`ts
function binarySearch(
  values: readonly number[],
  target: number,
): number {
  let low = 0;
  let high = values.length - 1;

  while (low <= high) {
    const middle = low + Math.floor((high - low) / 2);
    const value = values[middle];

    if (value === target) {
      return middle;
    }

    if (value === undefined) {
      throw new Error("binarySearch expects a dense array");
    }

    if (value > target) {
      high = middle - 1;
      continue;
    }

    low = middle + 1;
  }

  return -1;
}

const values = [2, 4, 6, 8, 10, 12, 14, 16];
console.log(binarySearch(values, 14));
console.log(binarySearch(values, 15));
console.log(binarySearch([], 3));
// Output:
// 6
// -1
// -1
\`\`\`

## A numeric example

Take 2, 4, 6, 8, 10, 12, 14, 16 and the target 14. There are 8 values, and log2 of 8 is 3.

\`lo\` is 0 and \`hi\` is 7. The middle index is 3 and the value is 8. 14 is larger, so the answer is at least index 4 and \`lo\` becomes 4. The next middle is index 5, value 12, so \`lo\` becomes 6. The middle of what remains is index 6, value 14. You found it on the third read. If the target were 15, the next step would push \`lo\` past \`hi\`. The range would be empty, and the target would be absent.

Start again from 1,048,576 sorted numbers. One comparison leaves 524,288, ten leave 1,024, and twenty leave 1. 2^21 is 2,097,152, so doubling the input adds about one comparison. A balanced tree of 1,048,576 nodes has a root-to-leaf path of about 20 nodes. Those same nodes in a straight line take 1,048,576 steps.

## Cost

Binary search uses O(log n) comparisons in the worst case and on average. A missing target still halves the range until it is empty. An early hit stops sooner and does not change the shape.

The loop uses O(1) extra space for \`lo\`, \`hi\`, and the middle. Recursion keeps one frame per halving, so the call stack is O(log n). The array is input, not extra search memory.

A balanced-tree lookup is O(log n) on average and in the worst case the balance rule allows. A skewed tree is O(n) in the worst case, because the height is n.

| n | Halving steps until one value remains | Extra space in the loop | Steps down a straight line of n nodes |
| --- | --- | --- | --- |
| 16 | 4 | O(1) | 16 |
| 1,024 | 10 | O(1) | 1,024 |
| 1,048,576 | 20 | O(1) | 1,048,576 |

## In the course

Binary search is the exercise where you keep the range sentence and move \`lo\` and \`hi\`. Balanced trees are where the same logarithm is a height. You do not implement an AVL rotation. You do notice when a binary search tree has become a list, because the lookup is then a scan drawn vertically. Let \`lo\` and \`hi\` cross. That empty range means the target is absent. Two elements, one element, and the empty array are where an off-by-one shows up.

## Common mistakes

Searching unsorted data with this method is wrong. The half you throw away might have held the value.

Moving the bound onto the middle, instead of one past it or one before it, can leave the same index in the range forever. When the middle is too small, the answer is at least one past the middle. When it is too large, the answer is at most one before the middle.

Quoting O(log n) for every tree skips the height. A chain of n nodes is O(n). Write the middle as \`lo + floor((hi - lo) / 2)\` so the index stays in range.

## When to use it

Use it when the array is sorted and you need one target, or the first index where a predicate changes from false to true. Use it for a root-to-leaf walk on a balanced tree. Discarding a third of the range, rather than a half, is still logarithmic. A different base changes a constant, and Big O drops that constant.

## When not to

Skip it on unsorted data, where a linear scan is the honest cost. Skip it when you need every element. Skip a tree lookup when the tree is a line. For a few dozen values a scan is also reasonable.

## FAQ

### How many comparisons does binary search use on a million sorted values?

About twenty. 2^20 is 1,048,576. An early hit can take fewer reads. A missing target still takes about twenty.

### Is O(log n) an average or a worst case?

For binary search on a sorted array it describes both, about log n comparisons either way. For a tree, O(log n) requires height near log n. A straight line has height n, and that worst case is linear.

### What sentence should you keep while you move the bounds?

If the target is present, its index is still between \`lo\` and \`hi\`, inclusive. Move \`lo\` one past a too-small middle, and \`hi\` one before a too-large middle. When \`lo\` passes \`hi\`, the target is absent.

## Related

- [What Is Binary Search? Throw Away Half of a Sorted Array](/articles/binary-search)
- [What Is a Balanced Tree? AVL, Red-Black, and Height](/articles/balanced-trees)
`,
  ),
  defineArticle(
    "linearithmic-time",
    "What Is O(n log n)? Linearithmic Time and Sorting",
    "Cost",
    "O(n log n) is linear work repeated about log n times, which is the usual cost of a good sort. You can sometimes beat it when the input is already ordered, as with sorted squares.",
    ["O(n log n)"],
    `
O(n log n) is linear work repeated about log n times, and it is the usual cost of a good sort. Merge sort does O(n) merging at each of about log n levels, so the product is linearithmic. You can sometimes beat that cost when the input is already ordered. Sorted squares of a sorted array can be written in linear time with two pointers, and sorting the squares afterwards is slower than the data allows.

\`\`\`mermaid
flowchart TD
  A["n values to order"] --> B["About log n levels"]
  B --> C["O(n) work on each level"]
  C --> D["Product is O(n log n)"]
  D --> E["Input already ordered"]
  E --> F["Two pointers can stay O(n)"]
\`\`\`

## How it works

Split the list, sort each half, then merge. The merge takes the smaller head from two sorted runs, and each element is written once, so merging n elements is O(n). There are about log n levels, and every level still touches about n elements. The product is n log n.

Good general-purpose sorts live in this band. A full order of arbitrary input costs on the order of n log n comparisons. Do not treat a sort as free because it is one function call. The work is inside the call.

You leave the band when you need less order, or when the input is already ordered. A heap keeps the extreme value at the root, so the k largest items cost about n log k, which is less ordering than a full sort. A hash map avoids ordering: membership is a lookup.

Sorted squares are the case where the existing order is the whole trick. A sorted array of negatives and positives does not have sorted squares, because a large negative becomes a large positive. The biggest squares sit at the two ends. Square both ends, write the larger square at the back of the result, and move the pointer that produced it. The pointers cross the array once, so the walk is O(n).

JavaScript's default \`sort\` is lexicographic unless you pass a compare function. The array 10, 2, 1 becomes 1, 10, 2. For numbers, pass a function that subtracts. Also remember that \`sort\` mutates its array; use \`values.toSorted((left, right) => left - right)\` when you need a sorted copy. The neighbour-swap sort and the default comparison are discussed in [Why Is Bubble Sort O(n²)? Neighbour Swaps Until It Settles](/articles/bubble-sort).

\`\`\`ts
function merge(
  left: readonly number[],
  right: readonly number[],
): number[] {
  const result: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftValue = left[leftIndex];
    const rightValue = right[rightIndex];

    if (leftValue === undefined || rightValue === undefined) {
      throw new Error("merge expects dense arrays");
    }

    if (leftValue <= rightValue) {
      result.push(leftValue);
      leftIndex += 1;
      continue;
    }

    result.push(rightValue);
    rightIndex += 1;
  }

  while (leftIndex < left.length) {
    const value = left[leftIndex];
    if (value === undefined) {
      throw new Error("merge expects dense arrays");
    }

    result.push(value);
    leftIndex += 1;
  }

  while (rightIndex < right.length) {
    const value = right[rightIndex];
    if (value === undefined) {
      throw new Error("merge expects dense arrays");
    }

    result.push(value);
    rightIndex += 1;
  }

  return result;
}

function mergeSort(values: readonly number[]): number[] {
  if (values.length < 2) {
    return values.slice();
  }

  const middle = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, middle));
  const right = mergeSort(values.slice(middle));
  return merge(left, right);
}

const values = [10, 2, 1, 7, 3];
console.log(mergeSort(values));
console.log(values);
// Output:
// [1, 2, 3, 7, 10]
// [10, 2, 1, 7, 3]
\`\`\`

The base case returns a copy of a zero- or one-element run. Larger calls sort two halves and merge them. Choosing from the left on a tie makes this merge **stable**: equal keys keep their original relative order. The original input remains unchanged.

## A numeric example

Take n = 1,048,576. log2 of n is 20, so n log2 n is about 21 million. Merge sort does that many element moves across about twenty levels. Nested loops on the same input are about 10^12 comparisons.

The sorted array -4, -1, 0, 3, 10 has squares 16, 1, 0, 9, and 100. The largest square is at the right end, then the left end. Two pointers fill 0, 1, 9, 16, 100 from the back, one step per element. Sorting those squares also works, and at a million elements it does tens of millions of steps against one million for the pointers. Unsorted input would not put the largest squares at the ends.

## Cost

Merge sort is O(n log n) time in the worst case, the average case, and the already-sorted case, because every level still merges n elements. The extra arrays are O(n) memory. Quote that space with the time.

Sorting the squares is O(n log n) time. Two pointers are O(n) time, with O(n) for the output and O(1) extra indices beyond it. A heap of the k largest items is O(n log k) time and O(k) extra space. A membership hash map is O(n) time on average and O(n) extra space, with no ordering.

| Method | Time | Extra space | What you get |
| --- | --- | --- | --- |
| Merge sort | O(n log n) worst case | O(n) | Full order |
| Sort the squares | O(n log n) | Depends on the sort | More work than the input required |
| Two pointers on sorted squares | O(n) | O(n) for the output | Full order from existing order |
| Heap of size k | O(n log k) | O(k) | Less than a full sort |
| Hash map of seen keys | O(n) average | O(n) | No order |

## In the course

Merge sort is the drawing of n times log n. Sorted squares are the linear method on an already ordered array. When a later exercise sorts first, write O(n log n) beside that call. Pass a numeric compare function for numbers, or 10 and 2 are ordered as strings.

## Common mistakes

Treating \`sort\` as O(1) because it is one line. The work is inside the call. On a million elements it dominates a later linear scan.

Sorting squares that came from a sorted array. The answer is correct and the cost is O(n log n). The two-pointer walk is O(n).

Forgetting the compare function. \`[10, 2, 1].sort()\` orders by strings, so 10 comes before 2. Subtracting the numbers returns a negative value when the left number should come first.

Using a full sort for the kth largest value, or for "have I seen this key". The heap and the map exist so you do not pay for order you will throw away.

## When to use it

Use an O(n log n) sort when the output has to be fully ordered and the input gives you no stronger structure. Use it as a first step when a later pass needs sorted order, and add that cost to whatever follows. Merge sort is the version whose worst case you can defend from the drawing: every level is O(n), and there are about log n levels.

## When not to

Skip the sort when the input is already ordered in the way the problem needs, as with sorted squares. Skip it when a heap's partial order is enough, or when a hash map answers with no order at all. A correct sort can still be the wrong cost.

## FAQ

### Why is a good sort O(n log n) and not O(n)?

Each merge-sort level does linear work, and there are about log n levels. Already ordered input, such as sorted squares, can make a linear method legal.

### Does merge sort get faster when the array is already sorted?

The merge sort you draw here does not. It still merges n elements on each level, so the cost stays O(n log n) even when the input is sorted.

### Why can sorted squares beat O(n log n)?

The array is already sorted, and the largest squares are at the ends. Two pointers take the larger end and move inward, which is O(n). Sorting the squares afterwards is O(n log n), slower than the data allows.

## Related

- [How Does Merge Sort Stay O(n log n) in Every Case?](/articles/merge-sort)
- [What Is the Two-Pointer Technique on a Sorted Array?](/articles/two-pointers)
`,
  ),
  defineArticle(
    "space-for-time",
    "What Is the Space-for-Time Tradeoff in Algorithms?",
    "Cost",
    "Spending extra memory can turn a scan into a lookup. The extra space is part of the cost: say O(n) time and O(n) extra space, not the time on its own.",
    ["space for time", "space-for-time"],
    `
Spending extra memory can turn a scan into a lookup. A hash map for the Two Sum complement uses O(n) extra memory and drops a nested scan from quadratic to linear. Say both numbers: O(n) time and O(n) extra space, not the time on its own. A fixed handful of variables is a different claim, and that claim is O(1) extra space.

\`\`\`mermaid
flowchart LR
  A["Nested scan"] --> B["Store what you saw"]
  B --> C["O(n) extra memory"]
  C --> D["Later step is a lookup"]
  D --> E["Say time and space"]
\`\`\`

## How it works

A nested loop can use a few local variables, O(1) extra space, and still be slow because each element starts another pass. Storing a fact you would otherwise recompute is the trade. That store is part of the cost.

A hash table makes a later lookup O(1) on average. In TypeScript, a \`Map\` or a plain object can provide that table. For Two Sum the key is a number you already passed and the value is its index. You ask whether \`target - number\` is stored. A hit is the pair. A miss means you store the index you just passed. The nested scan walked the rest of the array for that question. The table costs O(n) extra memory.

Memoisation stores an answer so recursion does not recompute it. Before you recurse, look up this state. On a hit, return the stored answer. On a miss, compute it, store it, and return it. The key has to be the whole state. A partial key reuses the wrong answer.

A sliding window stores a running total so the next slice does not start from zero. The next window is the old sum, minus the value that left, plus the value that entered. One number, an O(1) update, O(1) extra space. A handful of variables is O(1) extra space. A map entry per element, or a memo entry per state, is O(n).

\`\`\`ts
function twoSum(
  values: readonly number[],
  target: number,
): [number, number] | null {
  const seen: Record<string, number> = {};

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === undefined) {
      throw new Error("twoSum expects a dense array");
    }

    const complementKey = String(target - value);
    const earlierIndex = seen[complementKey];
    if (earlierIndex !== undefined) {
      return [earlierIndex, index];
    }

    seen[String(value)] = index;
  }

  return null;
}

console.log(twoSum([2, 7, 11, 15], 9));
console.log(twoSum([3, 3], 6));
console.log(twoSum([1, 2, 3], 10));
// Output:
// [0, 1]
// [0, 1]
// null
\`\`\`

The lookup happens before the current value is stored, so one array position cannot pair with itself. Checking \`earlierIndex !== undefined\` is important because index 0 is a valid match.

## A numeric example

Take 2, 7, 11, 15 and target 9. A nested scan checks six pairs. One thousand elements produce about 500,000 pairs, quadratic time, and only a few integers of extra memory.

The map does one pass. You see 2, complement 7 is absent, and you store index 0. You see 7, complement 2 is at index 0, and the positions are 0 and 1. That is O(n) time on average and O(n) extra space. Say both numbers.

A window on the same values stores one total. 2 + 7 is 9. The next block is 9 - 2 + 11, which is 18. Then 18 - 7 + 15 is 26. Time is O(n). Extra space is O(1).

Climbing n stairs by 1 or 2 steps repeats smaller staircases if you do not store them. A table of those answers is O(n) extra space, and the repeated calls become lookups.

## Cost

The nested Two Sum scan is O(n²) time and O(1) extra space. The map is O(n) time on average and O(n) extra space. If every key lands in one slot the chain can degrade. You still report the average, and you still report the memory.

A memo table is O(n) extra space when the states are 0 through n, and the time follows the states you fill. Keeping only the last two stair answers is O(1) extra space for the same recurrence. A window total is O(n) time and O(1) extra space. Re-summing each window from scratch is also O(1) extra space, and the time goes back up.

| Approach | Time | Extra space |
| --- | --- | --- |
| Nested pair scan | O(n²) worst case | O(1) |
| Hash map of values already seen | O(n) average | O(n) |
| Memo table of distinct states | Proportional to the states you fill | Grows with those states |
| Sliding window running total | O(n) | O(1) |
| A few loop variables | Whatever the loop is | O(1) |

## In the course

A \`Map\`, an answer array, or an object keyed by state is extra space that grows with the input. A sum and two indices are O(1) extra space. Two Sum, memoisation, and the sliding window are the three places you will say the pair of costs out loud.

## Common mistakes

Reporting only the time. The complete sentence for the map is O(n) time and O(n) extra space.

Allocating a map when a running total was enough. Keying a memo table by part of the state, so two different calls share one answer. Calling O(1) extra space on a second array of length n. The caller's result may be required. Another table beyond it is the extra space you name.

## When to use it

Use extra memory when a stored fact replaces a scan or a repeated call. Use the smallest store that works: one number for a window, a map for complements, a memo table for overlapping subproblems.

## When not to

Skip the extra memory when a handful of variables already keeps the answer, as with a running window sum. Skip a map when the data is sorted and two pointers answer in linear time with O(1) extra space. Skip a giant table when most states never occur. A linear-time algorithm that allocates more than you have is not an improvement you can run.

## FAQ

### What does it mean to say both numbers?

Time and extra space are separate. A Two Sum map is O(n) time on average and O(n) extra space. A nested scan is O(n²) time and O(1) extra space. Either sentence alone hides half of the trade.

### Is a sliding window also space for time?

Yes, in a small form. You store the previous window sum so the next window does not add its values from zero. The stored fact is one number, so the extra space stays O(1), and the time stays O(n).

### When is extra space only O(1)?

When the extra memory does not grow with the input. A few indices, a sum, and a best answer are O(1) extra space. A map entry per element, or a memo entry per distinct state, grows, and you count that growth.

## Related

- [How a Hash Map Remembers What You Have Already Seen](/articles/hash-maps)
- [What Is Memoisation? Caching an Overlapping Answer](/articles/memoisation)
`,
  ),
];

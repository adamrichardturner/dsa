import { defineArticle, type Article } from "./types";

export const searchSortArticles: readonly Article[] = [
  defineArticle(
    "recursion",
    "What Is Recursion? Smaller Copies and a Base Case",
    "Search and sort",
    "Recursion solves a smaller copy of the same problem and combines what comes back. One call, the base case, has to stop without calling again, or the call stack grows until it overflows.",
    ["recursive", "recursion", "base case"],
    `
Recursion solves a problem by calling the same function on a smaller copy, then combining what comes back. Each call must be smaller than the call that made it. One call, the base case, has to stop without calling again. A missing base case overflows the call stack rather than spinning like a while loop that never ends.

\`\`\`mermaid
flowchart TD
  problem["Call on this problem"] --> check{"Is this the base case"}
  check -->|yes| stop["Stop here (base case)"]
  check -->|no| smaller["Call a smaller copy (must shrink)"]
  smaller --> combine["Combine what comes back"]
\`\`\`

## How it works

You can point at 2 parts of a recursive function. The base case is the input you answer with no further call. The other part names a smaller input, calls the function, and combines the returned value with the part you kept. If you can say the base case in a sentence before you write the function, the rest usually follows.

The data is often defined the same way. A nested list is either a number or a list of nested lists. A tree is either empty or a node with smaller trees under it. A number needs no call. An empty tree needs no call. A larger value is solved by handling those smaller pieces and joining the answers.

You could write the same walk with an explicit stack. Push the current piece, pop it, and push the smaller pieces it contains. Recursion is that stack hidden in the calls. A call pushes a frame, and a return pops it. Waiting frames combine results only after a base case returns.

A termination argument has two parts: choose a measure that cannot decrease forever, and prove every recursive call makes it smaller. For factorial the measure is \`n\`; it decreases by 1 and stops at 1 or 0. A base case that exists but cannot be reached is no better than no base case.

\`\`\`ts
const factorial = (n: number): number => {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("n must be a non-negative integer");
  }
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
};

console.log(factorial(0)); // 1
console.log(factorial(4)); // 24
\`\`\`

Expected output: \`1\`, then \`24\`.

## A numeric example

Factorial of 4 is 4 * factorial(3). That call is 3 * factorial(2), which is 2 * factorial(1). Factorial of 1 is 1, and that call stops. factorial(0) is also 1, so the code stops for either value. Reject negative and non-integer inputs: without that precondition, subtracting 1 does not model the mathematical factorial problem and may never reach a base case.

The multiplications happen on the way back. factorial(1) returns 1. factorial(2) computes 2 * 1 = 2. factorial(3) computes 3 * 2 = 6. factorial(4) computes 4 * 6 = 24. The products are 1, then 2, then 6, then 24. At the deepest point, 4 frames are live, holding 4, 3, 2, and 1. Each return pops 1 frame.

A nested sum uses the same shape. [1, [2, [3], 4], 5] is a list, so you sum the pieces. 1 contributes 1. The smaller list [2, [3], 4] is 2, plus the list [3], plus 4. The call on [3] sees a number, returns 3, and stops. The inner list is 2 + 3 + 4 = 9. The outer list is 1 + 9 + 5 = 15.

## Why it is correct

Use induction on \`n\`. The base cases \`n = 0\` and \`n = 1\` return 1, which is the definition of factorial at those values. For \`n > 1\`, assume \`factorial(n - 1)\` correctly returns \`(n - 1)!\`. The function returns \`n * factorial(n - 1)\`, so it returns \`n * (n - 1)! = n!\`. The argument decreases by 1 and the input is a non-negative integer, so every call eventually reaches a base case.

## Cost

The cost is the calls you make. Factorial of n is 1 chain of n calls and a constant amount of work on each return, so the recurrence is T(n) = T(n - 1) + O(1), which solves to O(n). The extra space is the frames alive at the deepest point, also O(n). JavaScript engines do not generally guarantee tail-call optimisation, and this factorial is not tail recursive anyway because each frame still has a multiplication to perform.

Visiting each node of a tree once is O(n) time, and the stack follows the depth, not the node count. Average and worst agree for factorial, because the chain length is always n. They split when the same smaller problem is solved many times: time can grow much faster than n while the depth stays modest. A missing base case does not finish. It overflows the call stack.

| Case | Time | Extra space |
| --- | --- | --- |
| Factorial of n | O(n) | O(n) frames |
| Visit n nodes at depth d | O(n) | O(d) frames |
| Missing base case | Does not finish | Stack overflow |

## In the course

The recursion lesson asks you to flatten a nested value. A Nested value is a number or an array of Nested values. Flattening [1, [2, [3], 4], 5] returns [1, 2, 3, 4, 5]. The number 7 returns [7]. An empty array returns an empty array. [[[1]], [2]] returns [1, 2].

A number and an empty array are both base cases. An array flattens each element and concatenates what comes back, from left to right. The call stack from the previous lesson stores those waiting frames. Trees later in the course use the same sentence: an empty tree stops, otherwise you handle the node and the smaller trees under it.

## Common mistakes

A call that does not shrink never reaches the base case. Name a non-negative measure that strictly decreases on every recursive edge: n for factorial, remaining elements for a list, or subtree height for a tree. Passing the same list again, or calling factorial with the same n, pushes frames until the runtime refuses another one. The overflow is the symptom. The bug is a stop you cannot reach.

A base case that is too narrow fails in the same family. If you only stop on a number, an empty list still needs a rule. For factorial, both 0 and 1 should mean 1. Flattening [1, [2]] has to produce [1, 2]. Placing the current number on the wrong side reverses the list.

## When to use it

Use recursion when the input is already a smaller copy of itself. Nested lists, trees, and a sort that splits an array into halves all have that shape. Stop on the small case, otherwise solve the pieces and combine them. Prefer it when a stack of your own would only copy the call stack, and when the depth stays small enough that the frames fit.

## When not to

Summing a flat array is a loop. A recursive version spends 1 frame per element and does not make the problem clearer. A chain as deep as a large input can overflow a correct function, because a few thousand frames are enough. Use a loop, or a stack you allocate yourself. When the same smaller problem repeats, fill a table later instead of recomputing it.

## Try it

Write the \`Nested\` type and a recursive \`flatten\` function. Trace the maximum live stack depth for \`[1, [2, [3]]]\`. Test a number, an empty array, and an input deep enough to motivate an explicit stack.

## FAQ

### What happens if the base case is missing?
Each call pushes another frame, and the run ends when the call stack overflows. A while loop whose condition never changes stays in 1 frame and spins. A missing base case does not fail that way.

### Can you replace the calls with a stack?
Yes. Push the current piece, pop it, and push the smaller pieces it contains. Recursion is that stack hidden in the calls. Choose an explicit stack when you need to see the frames or bound the memory. Choose recursion when the definition is already the smaller copy and the depth is safe.

### What do you write before the function?
Write 1 sentence that names the base case. factorial(0) or factorial(1) is 1. A number flattens to a 1-element array, and an empty array flattens to an empty array. If you cannot say that sentence, do not start the function.

## Related

- [What Is the Call Stack? Frames, Returns, and Recursion](/articles/call-stack)
- [What Is a Tree? Roots, Leaves, and Depth in Nodes](/articles/trees)
    `,
  ),
  defineArticle(
    "binary-search",
    "What Is Binary Search? Throw Away Half of a Sorted Array",
    "Search and sort",
    "Binary search compares the target with the middle of a sorted array and throws away half. Keep an invariant for where the target can still sit, and return -1 when that range is empty.",
    ["binary search", "invariant"],
    `
Binary search finds a target in a sorted array by comparing it with the middle and throwing away half of what remains. Keep an invariant you can say out loud: if the target is present, its index is between lo and hi inclusive. When that range is empty, the target is absent, and you return -1. The array must be sorted, or the half you discard can hold the value you needed.

\`\`\`mermaid
flowchart TD
  range["Keep lo and hi (inclusive)"] --> empty{"Is the range empty"}
  empty -->|yes| absent["Return -1 (absent)"]
  empty -->|no| mid["Read the middle value"]
  mid --> choice{"Compare it with the target"}
  choice -->|equal| found["Return the middle index"]
  choice -->|"too small"| raise["Set lo one past the middle"]
  choice -->|"too large"| lower["Set hi one before the middle"]
  raise --> empty
  lower --> empty
\`\`\`

## How it works

Start with lo at 0 and hi at the last index. Compute the middle as lo plus half the distance to hi: lo + Math.floor((hi - lo) / 2). That index stays inside the range you still trust, and it avoids the overflow-style bug of adding lo and hi in languages where that sum can exceed a fixed-width integer. JavaScript numbers will not overflow on this sum.

If the middle value equals the target, return that index, not the value. When the middle value is too small, the answer is at least one past the middle, so lo becomes mid + 1. When it is too large, the answer is at most one before the middle, so hi becomes mid - 1.

When lo moves past hi, the range is empty. The target is absent. Return -1. An empty array starts with lo at 0 and hi at -1, so you return -1 before the first read. The array must be sorted. Binary search on unsorted data is wrong, not "usually fine", because the half you throw away might have held the value.

\`\`\`ts
const binarySearch = (
  values: readonly number[],
  target: number,
): number => {
  let lo = 0;
  let hi = values.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = values[mid];
    if (value === undefined) {
      return -1;
    }
    if (value === target) {
      return mid;
    }
    if (value < target) {
      lo = mid + 1;
      continue;
    }
    hi = mid - 1;
  }
  return -1;
};

const numbers: readonly number[] = [1, 3, 5, 7, 9];
console.log(binarySearch(numbers, 7)); // 3
console.log(binarySearch(numbers, 4)); // -1
console.log(binarySearch([], 4)); // -1
\`\`\`

Expected output: \`3\`, then \`-1\`, then \`-1\`.

## A numeric example

Search for 7 in [1, 3, 5, 7, 9].

lo is 0 and hi is 4. The middle is 0 + Math.floor((4 - 0) / 2) = 2, and the value is 5. 5 is too small, so the answer is at least one past the middle. lo becomes 3. Indexes 3 and 4 remain, the values 7 and 9.

lo is 3 and hi is 4. The middle is 3 + Math.floor((4 - 3) / 2) = 3, and the value is 7. That equals the target. Return 3.

Search for 4 in the same array. lo is 0 and hi is 4. The middle value is 5, which is too large, so the answer is at most one before the middle. hi becomes 1. lo is 0 and hi is 1. The middle is 0, and the value 1 is too small, so lo becomes 1. The only remaining value is 3, still too small, so lo becomes 2. lo is 2 and hi is 1. The range is empty. Return -1. A million sorted entries takes about 20 comparisons, because 2^20 is 1,048,576.

## Why it is correct

At the start of every iteration, the invariant says that any matching index is in \`[lo, hi]\`. If the middle value is smaller than the target, sorted order proves that every index through \`mid\` is too small, so setting \`lo = mid + 1\` discards no answer. The larger case is symmetric. A match is returned immediately. If \`lo > hi\`, the invariant's candidate range is empty, so returning \`-1\` is correct. Both updates remove the middle index, which also proves termination.

## Cost

Each step throws away about half of the indexes that remain, so the number of iterations is O(log n). The best case is 1 iteration, when the first middle is the target. For a non-empty array, the worst case is at most floor(log2(n)) + 1 iterations; an empty array takes 0. The average is O(log n). Extra space is O(1): you store lo, hi, and the middle, and you do not copy the array.

| Case | Time | Extra space |
| --- | --- | --- |
| First middle is the target | O(1) | O(1) |
| Average | O(log n) | O(1) |
| Worst, including a missing target | O(log n) | O(1) |

## In the course

The binary search lesson asks for the index of a target in an array sorted ascending, with no duplicates. Searching [1, 3, 5, 7, 9] for 7 returns 3. Searching that array for 4 returns -1. The first element counts: searching [2, 4, 6] for 2 returns 0. An empty array returns -1. The lesson states the inclusive invariant and the safe middle, lo + Math.floor((hi - lo) / 2).

## Common mistakes

Off-by-one bugs break the invariant. At the top of every iteration, every possible matching index is in the inclusive range [lo, hi]. When the middle value is too small and you set lo to mid, the range can stop shrinking. With lo at 3 and hi at 4, the middle is 3. Leaving lo at 3 repeats the same range, and a loop never ends. The answer is at least one past the middle, so lo becomes mid + 1. When the middle value is too large, hi becomes mid - 1, not mid.

A loop written as lo < hi skips the moment when lo and hi name the same index. On [7], both ends are 0, and you must read that slot. Continue while lo <= hi, and return -1 when the range is empty. In [9, 1, 7, 3, 5] the middle might be 7, and throwing away the left half can discard 1. That search is wrong because the array is not sorted.

## When to use it

Use binary search when the array is sorted, you can read every index in O(1) time, and you want the index of a target or a clear answer that it is absent. It fits when the array stays put and you search it many times. A million sorted entries is about 20 comparisons.

If duplicates are allowed, this version returns whichever matching middle it encounters first, not necessarily the first or last duplicate. To find the first occurrence, record a match and continue searching to its left; to find the last, continue to its right. The course exercise avoids that extra contract by using distinct values.

## When not to

Do not use it on unsorted data. Do not sort a large array only to answer 1 membership question, because the sort costs more than 1 linear scan. A linked list is a poor fit, because reaching the middle is not O(1). If the array holds only a handful of values, a scan is easier to get right.

## Try it

Return the first index of a target in an array that may contain duplicates. Save a matching index, continue to the left, and prove that the saved index remains valid when the search range becomes empty. Test duplicates at both ends.

## FAQ

### What if the array is not sorted?
The procedure is wrong, not "usually fine". Each comparison throws a half away because the order says the target cannot live there. Without that order, the discarded half might have held the value. Sort first, or scan from index 0.

### Why add half the gap instead of adding the two ends?
lo + Math.floor((hi - lo) / 2) stays between lo and hi. Adding lo and hi and then dividing by 2 can overflow in languages with fixed-width integers. JavaScript will not overflow on this sum. Write the half-gap form anyway.

### What do you return when the target is missing?
Return -1 once lo has moved past hi and the inclusive range is empty. Do not return the closest value, and do not return lo as if it were a found index. For target 4, the walk ends with lo at 2 and hi at 1.

## Related

- [What Is O(log n)? Logarithmic Time and Binary Search](/articles/logarithmic-time)
- [What Is a Binary Search Tree? Left Smaller, Right Larger](/articles/binary-search-trees)
    `,
  ),
  defineArticle(
    "bubble-sort",
    "Why Is Bubble Sort O(n²)? Neighbour Swaps Until It Settles",
    "Search and sort",
    "Bubble sort swaps neighbours until a pass makes no swaps. It is easy to get right and quadratic, so it is a contrast, not the sort to reach for.",
    ["bubble sort"],
    `
Bubble sort walks an array and swaps neighbours that are out of order, then repeats until a pass makes no swaps. Larger values drift to the end. It is easy to get right, and it is O(n²), so you keep it as a contrast, not the sort you defend. Merge sort stays O(n log n) in every case you implement here.

\`\`\`mermaid
flowchart TD
  pass["Start a pass from the left"] --> pair{"Are the neighbours out of order"}
  pair -->|yes| swap["Swap those neighbours"]
  pair -->|no| step["Move to the next pair"]
  swap --> step
  step --> passOver{"Is the pass finished"}
  passOver -->|no| pair
  passOver -->|yes| clean{"Did this pass swap"}
  clean -->|yes| pass
  clean -->|no| settled["The array has settled (no swaps)"]
\`\`\`

## How it works

A pass looks at each pair of neighbours, from the left. When the left value is greater than the right value, swap them. When they are already in order, leave them. Then step 1 index to the right. After the last pair, the pass is over. The implementation below copies its input so callers do not see a mutation; the sorting work itself needs only 1 temporary number. A conventional in-place version skips that copy and has O(1) auxiliary space.

One pass is not the whole sort. The largest value in the region you scanned has drifted to the end of that region. That settled suffix is the loop invariant: after each pass, everything beyond unsortedEnd is in its final position. The values in front can still be out of order, so you pass again. You stop only when a full pass makes no swaps. That clean pass means every neighbour pair is in order, so the array is sorted.

\`\`\`ts
const bubbleSort = (input: readonly number[]): number[] => {
  const values = [...input];
  let unsortedEnd = values.length - 1;

  while (unsortedEnd > 0) {
    let swapped = false;
    for (let i = 0; i < unsortedEnd; i += 1) {
      const left = values[i];
      const right = values[i + 1];
      if (left === undefined || right === undefined) {
        throw new Error("The input must be a dense number array");
      }
      if (left <= right) {
        continue;
      }
      values[i] = right;
      values[i + 1] = left;
      swapped = true;
    }
    if (!swapped) {
      return values;
    }
    unsortedEnd -= 1;
  }
  return values;
};

const input = [4, 2, 7, 1];
console.log(bubbleSort(input)); // [1, 2, 4, 7]
console.log(input); // [4, 2, 7, 1]
\`\`\`

Expected output: \`[1, 2, 4, 7]\`, then \`[4, 2, 7, 1]\`.

## A numeric example

Take 1 pass over [4, 2, 7, 1]. Four values give you 3 neighbour pairs.

Compare 4 and 2. They are out of order, so swap. The array is [2, 4, 7, 1]. Compare 4 and 7. They are in order, so leave them. The array is still [2, 4, 7, 1]. Compare 7 and 1. They are out of order, so swap. The array is [2, 4, 1, 7].

The pass made 2 swaps. The largest value, 7, sits at the end. The prefix [2, 4, 1] is not sorted, because 4 is still before 1. A later pass has to swap that pair. You are finished only when a pass swaps nothing.

JavaScript's default sort compares values as strings unless you pass a compare function. [10, 2, 1].sort() can yield [1, 10, 2] because "10" < "2" as strings. The first character decides: "1" comes before "2", so "10" comes before "2", and the shorter string "1" comes before "10". For numbers, pass (a, b) => a - b. Then [10, 2, 1] becomes [1, 2, 10]. The name sort does not mean the numeric order you assumed.

## Why it is correct

During a pass, the largest value seen so far is moved to the right whenever it meets a smaller neighbour. It therefore reaches \`unsortedEnd\` by the end of the pass. That establishes the settled-suffix invariant: every index after the new \`unsortedEnd\` is final. Repeating the argument settles one more position per pass. A pass with no swaps proves every adjacent pair is ordered; by transitivity, the whole array is ordered.

## Cost

A direct version does about n passes, and a pass does about n comparisons, so the product is O(n²). The usual exact count is n * (n - 1) / 2 comparisons when every pair is checked. For 4 values that is 6. For 1,000 values it is 499,500. For 10,000 values it is 49,995,000, about 50 million. Merge sort on those 10,000 values is on the order of 140,000 element writes. That gap is why bubble sort is the contrast.

If you stop when a pass makes no swaps, an array that is already sorted costs 1 pass of n - 1 comparisons, which is O(n). Average inputs do not look like that. Average and worst stay O(n²). An in-place implementation uses O(1) auxiliary space. The non-mutating implementation above uses O(n) extra space for its copy, an intentional API tradeoff.

| Case | Time | Extra space |
| --- | --- | --- |
| Already sorted, stop after a clean pass | O(n) | O(n) for the returned copy |
| Average | O(n²) | O(n) for the returned copy |
| Worst, reverse order | O(n²) | O(n) for the returned copy |

## In the course

The sorting lesson shows bubble sort so you can finish a sort by hand, then tells you not to keep it. The exercise on that page is merge sort: return a new array, leave the input alone, and place duplicates and negative numbers in numeric order. A solution that calls the built-in sort is rejected. In that lesson, [10, 2].sort() stays [10, 2], because "10" is smaller than "2" as text. [10, 2, 1].sort() can yield [1, 10, 2]. When a later exercise sorts numbers with the built-in sort, pass (a, b) => a - b.

## Common mistakes

Stopping after 1 pass leaves the array unfinished. [4, 2, 7, 1] becomes [2, 4, 1, 7]. The 7 has drifted to the end, and 4 is still before 1. The stop condition is a pass with no swaps, not a pass that moved 1 large value.

A swap without a temporary loses a number. Hold 1 neighbour, write the other into its place, then write the held value back. On [4, 2], copying in the wrong order can produce [2, 2]. Trusting the name sort is the mistake that remains after you drop neighbour swaps. Without (a, b) => a - b, [10, 2, 1].sort() can yield [1, 10, 2], and you sorted strings.

Swapping equal keys with a greater-than-or-equal test also throws away bubble sort's stability. Use a strict greater-than test. Then equal records never cross, so their original relative order is preserved.

## When to use it

Use bubble sort when you want to watch neighbour pairs, or when you are showing why a quadratic sort hurts as n grows. A tiny array, or one you know is almost sorted, can make the early stop cheap. Even then, the sort you keep is merge sort, which stays O(n log n) in every case you implement here. Bubble sort is the contrast, not the routine you defend.

## When not to

Do not reach for bubble sort when the input can grow. About 50 million comparisons for 10,000 values is a bad trade next to a linearithmic sort. Do not use a hand-written bubble sort to dodge a compare function. If you call the built-in sort on numbers, pass (a, b) => a - b. Otherwise the name sort does not mean the numeric order you assumed.

## Try it

Instrument the function to count comparisons and swaps. Compare sorted, reversed, and nearly sorted arrays of the same length. Predict each count before running the code, then explain why the early stop changes the best case but not the worst case.

## FAQ

### Why is 1 pass not enough?
One pass moves the largest scanned value to the end. It does not fix every pair in front of that value. [4, 2, 7, 1] becomes [2, 4, 1, 7], and 4 is still before 1. You repeat until a pass makes no swaps.

### Why can [10, 2, 1].sort() return [1, 10, 2]?
JavaScript's default sort compares values as strings unless you pass a compare function. "10" < "2" is true as text, because "1" comes before "2". The array can become [1, 10, 2]. For numbers, pass (a, b) => a - b. The name sort does not mean the numeric order you assumed.

### Does a clean pass mean the array is sorted?
Yes, when every adjacent pair was compared with the order you want. If no neighbour was out of order, the whole array is in order. If the comparison is backwards, or a pass skips a pair, a clean pass no longer proves that.

## Related

- [How Does Merge Sort Stay O(n log n) in Every Case?](/articles/merge-sort)
- [What Is O(n²) Quadratic Time? Nested Loops and Pairs](/articles/quadratic-time)
    `,
  ),
  defineArticle(
    "merge-sort",
    "How Does Merge Sort Stay O(n log n) in Every Case?",
    "Search and sort",
    "Merge sort splits the array, sorts the halves, and merges two sorted runs with two pointers. That is O(n log n) time and O(n) extra memory in every case you implement here.",
    ["merge sort", "numeric comparator", "compare function"],
    `
Merge sort splits an array, sorts the halves by the same rule, and merges 2 sorted runs with 2 pointers. Fewer than 2 elements is already sorted, and that is the base case. Each element is written once, so merging n elements is O(n), and the sort is O(n log n) time with O(n) extra memory in every case you implement here.

\`\`\`mermaid
flowchart TD
  size{"Fewer than 2 elements"} -->|yes| ready["Already sorted (base case)"]
  size -->|no| split["Split into 2 halves"]
  split --> sortLeft["Sort the left half"]
  split --> sortRight["Sort the right half"]
  sortLeft --> merge["Merge with 2 pointers"]
  sortRight --> merge
\`\`\`

\`\`\`mermaid
flowchart LR
  heads["Compare the two run heads"] --> choose{"Which head is smaller?"}
  choose -->|left or equal| takeLeft["Copy left head; advance left"]
  choose -->|right| takeRight["Copy right head; advance right"]
  takeLeft --> remaining{"Is either run empty?"}
  takeRight --> remaining
  remaining -->|no| heads
  remaining -->|yes| tail["Append the untouched tail"]
\`\`\`

## How it works

If the array has fewer than 2 elements, it is already sorted. An empty array and a 1-element array are the base case. Otherwise split into 2 halves, as evenly as you can. Sort the left half by the same rule. Sort the right half by the same rule. Then merge the 2 sorted runs.

The merge is 2 pointers, one on each half. Repeatedly take the smaller head. When the heads are equal, take the left one, so equal values keep their earlier order. When one half runs out, append the rest. Those leftover values are already sorted. Each element is written once, so merging n elements is O(n).

About log n levels of splits take every piece down to the base case. Each level writes about n elements. The product is O(n log n). At any one time, the live temporary arrays contain O(n) elements, although this slice-based teaching version allocates O(n log n) elements over the whole run. The recursion adds O(log n) live frames. Quicksort can use less auxiliary memory, but naive pivot choices have an O(n²) worst case. While learning merge sort, do not call the built-in sort and skip the merge.

\`\`\`ts
const merge = (
  left: readonly number[],
  right: readonly number[],
): number[] => {
  const result: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    const leftValue = left[leftIndex];
    const rightValue = right[rightIndex];
    if (leftValue === undefined || rightValue === undefined) {
      throw new Error("Both runs must be dense number arrays");
    }
    if (leftValue <= rightValue) {
      result.push(leftValue);
      leftIndex += 1;
      continue;
    }
    result.push(rightValue);
    rightIndex += 1;
  }
  return [
    ...result,
    ...left.slice(leftIndex),
    ...right.slice(rightIndex),
  ];
};

const mergeSort = (values: readonly number[]): number[] => {
  if (values.length < 2) {
    return [...values];
  }
  const middle = Math.floor(values.length / 2);
  const left = mergeSort(values.slice(0, middle));
  const right = mergeSort(values.slice(middle));
  return merge(left, right);
};

const numbers = [5, 1, 4, 2, 2, -3];
console.log(mergeSort(numbers)); // [-3, 1, 2, 2, 4, 5]
console.log(numbers); // [5, 1, 4, 2, 2, -3]
\`\`\`

Expected output: \`[-3, 1, 2, 2, 4, 5]\`, then \`[5, 1, 4, 2, 2, -3]\`.

## A numeric example

Merge the sorted runs [1, 4, 8] and [2, 3, 9]. Start one pointer on 1 and the other on 2.

Compare 1 and 2. Take 1. The result is [1], and the left pointer sits on 4. Compare 4 and 2. Take 2. The result is [1, 2], and the right pointer sits on 3. Compare 4 and 3. Take 3. The result is [1, 2, 3], and the right pointer sits on 9. Compare 4 and 9. Take 4. The result is [1, 2, 3, 4], and the left pointer sits on 8. Compare 8 and 9. Take 8. The result is [1, 2, 3, 4, 8]. The left run is empty.

When one half runs out, append the rest. The right run still holds 9, so the merged array is [1, 2, 3, 4, 8, 9]. Six values were written, once each. The pointers only moved forward. You never rescanned a half, because each head was the smallest value still on that side.

Those runs come from the same rule on smaller arrays. [8] has fewer than 2 elements, so that call stops. You merge only after both sides come back sorted.

## Why it is correct

The recursive claim is: \`mergeSort\` returns a sorted permutation of its input. Arrays shorter than 2 are already sorted. For a larger array, assume the recursive calls return sorted permutations of the two halves. During \`merge\`, \`result\` is sorted and contains exactly the consumed prefixes. The smaller remaining head is the smallest value not yet written, so appending it preserves that invariant. Copying the final tail completes a sorted permutation of both halves, and therefore of the original input.

## Cost

An array of 8 elements is halved 3 times before every piece has fewer than 2 elements: 8, then 4, then 2, then 1. Each level writes 8 elements, so the total is 24 writes. That is n * log2(n) = 8 * 3 = 24. An array of 10,000 elements needs 14 levels, because 2^13 is 8,192 and 2^14 is 16,384. About 14 * 10,000 = 140,000 writes. Bubble sort on the same 10,000 values does about 50 million neighbour comparisons in the worst case.

Best, average, and worst asymptotic time match, because you always split to the base case and merge, even when the input was sorted. This implementation's live extra arrays cost O(n) memory. The call stack adds O(log n) frames, which does not change the O(n) bound. An implementation can avoid some copying by reusing one auxiliary buffer, but it is more complicated.

| Case | Time | Extra space |
| --- | --- | --- |
| Already sorted | O(n log n) | O(n) |
| Average | O(n log n) | O(n) |
| Worst | O(n log n) | O(n) |

## In the course

The sorting lesson asks you to return a new array of the numbers in ascending order. The input is not mutated. Do not call the built-in sort. [5, 1, 4, 2, 8] becomes [1, 2, 4, 5, 8]. Duplicates stay: [3, 1, 3, 2] becomes [1, 2, 3, 3]. [1, 2, 3] stays [1, 2, 3]. An empty array stays empty. Negatives sort as numbers: [0, -2, 4, -2] becomes [-2, -2, 0, 4]. While learning this one, do not call the built-in sort and skip the merge.

## Common mistakes

Merging before both halves are sorted breaks the pointer rule, because each head has to be the smallest remaining value on that side. Sort each half by the same rule, down to fewer than 2 elements, and only then merge.

The merge invariant is: result is sorted and contains exactly the consumed prefixes of left and right. The two pointer positions therefore identify the smallest values not yet copied. Advance exactly the pointer whose head you take.

Dropping the leftover tail loses values. When the result is [1, 2, 3, 4, 8] and the right run still holds 9, you must append 9. When one half runs out, append the rest. Those values are already in order.

Calling the built-in sort on a half, or on the whole array, skips the merge and fails the exercise. The base case is fewer than 2 elements, not a library call on a short slice.

## When to use it

Use merge sort when you need O(n log n) time in every case, including sorted and reversed input, and when you can spend O(n) extra memory. It is the sort you can draw: 2 halves, 2 pointers, 1 write per element, about log n levels. When the heads are equal, take the left head if equal values should keep their earlier order.

## When not to

Do not use this version when you refuse the extra arrays and a library sort is acceptable. Quicksort uses less extra memory, and many libraries reach for it. Its worst case is worse, and the explanation is longer. One sort you can draw is enough. While learning this one, do not call the built-in sort and skip the merge.

## Try it

Generalize \`mergeSort\` to accept a typed compare function, then sort records by score while preserving the original order of equal scores. Explain why choosing the left item on equality provides stability.

## FAQ

### Why is the extra memory O(n) if the function also recurses?
The extra arrays hold the merged runs. Across 1 level they store about n elements, so the heap cost is O(n). The call stack is about log n frames on top. The arrays dominate.

### What do you do when the two heads are equal?
Take the left head. Both values are legal next outputs, and the left one keeps the earlier copy first. The test is less than or equal. Then advance only the left pointer, and leave the right pointer where it is.

### Why not call the built-in sort on each half?
The half would come back sorted, and you would skip the merge. The exercise rejects that call. While learning this one, do not call the built-in sort and skip the merge.

## Related

- [What Is O(n log n)? Linearithmic Time and Sorting](/articles/linearithmic-time)
- [What Is the Two-Pointer Technique on a Sorted Array?](/articles/two-pointers)
    `,
  ),
];

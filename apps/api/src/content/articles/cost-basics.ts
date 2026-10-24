import { defineArticle, type Article } from "./types";

export const costBasicArticles: readonly Article[] = [
  defineArticle(
    "big-o",
    "What Is Big O? How Algorithm Cost Grows as Input Grows",
    "Cost",
    "Big O describes how the number of steps grows as the input grows, ignoring constant factors and one machine's speed. An O(n) scan doubles when the input doubles; an O(n²) pair of loops grows much faster.",
    ["Big O"],
    `
Big O describes how the number of steps grows as the input grows. You ignore one machine's speed, and you ignore constant factors, so two implementations that differ by a fixed multiplier still share a label. An O(n) scan doubles when the input doubles. An O(n²) pair of loops grows much faster, because the inner loop runs once for every step of the outer loop.

\`\`\`mermaid
flowchart TD
  grow["Input of size n"] --> scan["O(n) scan"]
  grow --> nest["Loop inside a loop"]
  scan --> twice["Work doubles"]
  nest --> square["O(n²) growth"]
\`\`\`

## Before you begin

You only need arrays, \`for\` loops, and multiplication. In this article, **n** means the number of values in the input array. An **elementary operation** is one small, fixed piece of work, such as reading an index, comparing two numbers, or incrementing a counter.

Big O is an upper bound on growth: \`O(f(n))\` says that, beyond some input size, the work grows no faster than a constant multiple of \`f(n)\`. In everyday algorithm discussion, people often use “O(n)” to mean a tight linear growth rate. The formal tight-bound notation is **Theta**, written \`Θ(n)\`. The examples here have tight bounds, so the familiar O labels describe their actual growth shapes.

## How it works

You count steps, not wall-clock seconds. A step is a comparison, an index read, or an addition. A faster machine finishes each of those sooner. Big O stays the same, because the speed of the machine is one of the constants the notation tells you to set aside.

A constant factor is a multiplier that does not depend on the length of the input. Three checks on every element is still a single pass. Double the input and that work still roughly doubles, which is why the label is O(n) after the three is dropped. The three is still worth knowing when you compare two linear functions on realistic inputs. Big O predicts long-run growth; it does not by itself predict which implementation is faster for a particular small input.

Naming the loops is enough. You do not need a formal proof. One loop from the first index through the last is linear. A second loop started for each index is quadratic, because nested loops multiply: n times n. Add a later pass and the label can stay O(n²), since Big O keeps the dominant term and drops lower-order ones.

\`\`\`ts
const n = 10;
let steps = 0;
for (let i = 0; i < n; i++) {
  steps = steps + 1;
}

let pairs = 0;
for (let i = 0; i < n; i++) {
  for (let j = 0; j < n; j++) {
    pairs = pairs + 1;
  }
}
console.log(steps, pairs);
// Expected output: 10 100
\`\`\`

The first loop adds one step per element. The second loop multiplies, because the inner loop runs a full pass for every value of i. You can see the product in the indentation.

## Combining costs

Analyze one block at a time, then combine the blocks. Consecutive blocks add their costs; nested work multiplies them. Finally, keep the fastest-growing term.

\`\`\`mermaid
flowchart TD
  start["Read the code in blocks"] --> sequence{"Blocks sequential or nested?"}
  sequence -->|"Sequential"| add["Add costs"]
  sequence -->|"Nested"| multiply["Multiply costs"]
  add --> simplify["Keep the dominant term"]
  multiply --> simplify
  simplify --> examples["O(n + n²) = O(n²)"]
\`\`\`

For example, one scan followed by a nested pair of loops costs \`O(n + n²)\`, which simplifies to \`O(n²)\`. Two consecutive scans cost \`O(n + n) = O(2n) = O(n)\`.

## A numeric example

Start with 10 elements. A single scan does about 10 steps. A pair of loops that each run to 10 does about 100 steps. Both numbers are small enough to write down.

Double the input to 20. The scan moves to about 20 steps, which is double. The nested loops move to about 400 steps, which is four times the previous nested cost. Double again, to 40. The scan does about 40 steps. The nested loops do about 1,600. The scan is following n. The nested loops are following n times n.

At 1,000 elements the scan does about 1,000 steps. The nested loops do about 1,000,000. From the 10-element case the input grew by a factor of 100. The scan grew by that same factor. The nested work grew by a factor of about 10,000. You can see the gap on paper, before anyone runs the code.

## Cost

Time is how the step count grows with n. Extra space is memory you allocate beyond the input you were handed. A scan that keeps a counter is O(n) time and O(1) extra space. A loop inside a loop over the same array is O(n²) time, and it can still be O(1) extra space if all it keeps is a counter. The slow shape and the allocating shape are separate facts.

For these plain loops the average case and the worst case match. Every index is visited the same way no matter what the values are. A structure you meet later, such as a hash map, can split those two cases. A loop you wrote does not. Read the rows as the shapes you can point at in the code.

Unless a course question says otherwise, report the worst-case time. Also name every independent input size. Comparing every value in an array of length \`n\` with every value in a different array of length \`m\` is \`O(nm)\`, not automatically \`O(n²)\`.

| Operation | Time | Extra space |
| --- | --- | --- |
| Read one index | O(1) | O(1) |
| One loop over the array | O(n) | O(1) |
| A loop inside a loop | O(n²) | O(1) |
| One pass that fills a new array | O(n) | O(n) |

## In the course

The exercise asks you to count values strictly below a limit. Equality does not count. On the array 1, 4, 2, 8 with limit 4, the values 1 and 2 qualify and 4 does not, so the count is 2. An empty array counts as 0.

One pass visits each index once, compares the value with the limit, and adds one to a counter when the value is smaller. That is O(n) time and O(1) extra space. A nested loop can return 2 as well. The inner loop repeats work the outer loop already made available, and that shape is the habit to retire. One loop is linear. A loop inside it is quadratic, even when the tests pass.

The core course goal is to derive a bound from the code and state time and extra space separately. Formal proofs with constants, limits, \`Ω\`, and \`Θ\` are enrichment: useful for precision, but not required before you can compare one pass with pair-shaped work.

## Common mistakes

A faster laptop does not improve the Big O label. It shortens seconds. The growth stays what the loops already imply.

O(3n) keeps a constant the notation drops. Three passes are O(n). Say the three beside the code when you compare two linear options.

Loops one after another add, so two scans are still O(n). Nested loops multiply. Read the indentation before you decide.

A helper can hide a loop. A call that walks the array is not one step. Name the loops inside it.

Using one letter for two independent inputs can hide useful information. Preserve \`n\` and \`m\` when the input lengths can differ.

## When to use it

Use Big O when you choose a shape, before you tune constants. This week that choice is one pass or a loop inside a loop. The label shows which shape pulls away as the input grows. Point at each loop and say what it multiplies by. If you can say it, you can decide whether the solution stays.

## When not to

On ten elements a nested loop is about 100 steps, and a clear double loop can be the version you can read. Keep it until the size makes the product hurt.

An O(n) function can still return the wrong count, and an O(n²) function can return the right one. Tests check the number. The label checks growth. You want both.

## FAQ

### Does Big O measure time on a clock?

No. It measures how the number of steps grows as the input grows. A faster machine shortens every step and leaves the label where it was.

### Should I keep constant factors in the label?

No. Three passes over an array are O(n), and a sentence next to the code can still mention the three. The factor matters when two solutions share a label. It does not rescue a nested loop once n is large, because n² outgrows any fixed multiplier on n.

### Do I need a proof before I name a cost?

No. Name the loops. One loop over the input is O(n), and a loop inside that loop is O(n²). The course wants the sentence you can check against the code you just wrote.

### Is O(n) exactly n operations?

No. It describes a growth class. A linear algorithm might do \`3n + 7\` elementary operations. Constants and lower-order terms affect real runtime, but they do not change the linear growth label.

## Related

- [What Is Linear Time O(n)? One Pass and Linear Search](/articles/linear-time)
- [What Is O(n²) Quadratic Time? Nested Loops and Pairs](/articles/quadratic-time)
    `,
  ),
  defineArticle(
    "constant-time",
    "What Does O(1) Mean? Constant-Time Work That Stays Flat",
    "Cost",
    "O(1) means work stays flat as input grows. Reading a known array slot is constant time; dynamic-array append is O(1) amortized across a sequence of pushes.",
    ["O(1)"],
    `
O(1) means the work stays flat as the input grows. Reading a known array slot is constant time. Appending to a dynamic array is usually constant work but can trigger a costly resize, so its stronger description is O(1) amortized across many pushes. Constant does not mean instant or tiny; it means the amount of work does not grow with n.

\`\`\`mermaid
flowchart LR
  slot["Read slot 0"] --> jump["One jump"]
  push["Sequence of end pushes"] --> avg["O(1) amortized each"]
  jump --> flat["Work stays flat"]
  avg --> flat
  helper["Helper that scans"] --> line["O(n) work"]
\`\`\`

## Before you begin

You should know how to read an array by index and how \`push\` adds an element at the end. Here, **n** is the current number of elements. O(1) does not mean “one source-code line” or “one CPU instruction.” It means the number of operations is bounded by a constant that does not depend on n.

## How it works

In the standard array model, reading \`nums[0]\` is a jump, not a walk from the head. It does not visit later elements on the way, and a longer array does not add steps to that read. JavaScript engines choose their own internal array representations, but indexed access on an ordinary dense array still has the O(1) behaviour the model describes.

Flat is the whole claim. A constant-time step can still be heavy: a hash, a bounds check, a write. Constant does not mean instant, and it does not mean tiny. It means the step count holds still while n changes. If doubling the array doubles the steps, you have left O(1).

In the standard dynamic-array model, pushing at the end is O(1) **amortized**. The new value is usually written after the last used index, and nothing in front of it slides. When storage is full, one push may copy the elements into a larger block and cost O(n). Amortized analysis spreads those occasional resize costs across the whole sequence of pushes. It is a guarantee about a sequence of operations, not a probability about an average input.

A hash map get is O(1) expected time under the usual assumptions about hashing and resizing. The key is hashed, the map jumps towards a bucket, and a typical lookup does work that does not track n. Many colliding keys can make a lookup O(n) in the worst case. “Expected” depends on the hash behaviour; “amortised” describes cost across an operation sequence. They are different ideas.

A helper that looks like one step can still scan. If the body walks from the first index to the last, the cost is the walk. A loop over the input is not constant time, however short the call looks.

\`\`\`ts
const nums = [4, 1, 7, 9, 2, 8, 3, 6, 5, 0];
const first = nums[0];
let visits = 0;
for (let i = 0; i < nums.length; i++) {
  visits = visits + 1;
}
console.log(first, visits);
// Expected output: 4 10
\`\`\`

The assignment to first is the jump. The loop visits every index, so a helper built like that loop is not O(1).

## Why append can be amortized O(1)

Suppose capacity doubles whenever it fills. Most pushes write one value. Rare resize pushes copy the current values first, but doubling ensures that another resize cannot happen immediately.

\`\`\`mermaid
flowchart LR
  p1["Push: one write"] --> p2["Push: one write"]
  p2 --> resize["Full: copy and write"]
  resize --> spare["New spare capacity"]
  spare --> more["Many one-write pushes"]
  more --> result["O(1) amortized per push"]
\`\`\`

For eight pushes, resize copies might move 1, then 2, then 4 existing elements. The total copying is 7, less than the 8 pushes themselves. Over a long sequence, the geometric sum of copies stays proportional to the number of pushes.

## A numeric example

Read slot 0 on 10 numbers: one jump. Read slot 0 on 10,000 numbers: still one jump. The second array is 1,000 times longer, and the read did not pick up extra steps.

Push 8 values while storage doubles whenever it fills. Copies can move 1, then 2, then 4 elements: 7 copies across 8 pushes, about one extra copied element per push. At 1,024 pushes the copies still add up to less than the final length. Including the 1,024 writes, the whole sequence remains O(n), so its amortized cost is O(1) per push. The push that hits a full buffer is the slow one.

A helper that scans does about 10 visits on 10 elements and about 10,000 visits on 10,000 elements. The call site stayed one line. The cost followed n.

## Cost

A true O(1) operation takes the same number of steps at n = 10 and at n = 10,000. Extra space for that operation is O(1) when you touch one slot or one map entry. The array you already hold may occupy O(n) memory. The read does not copy it.

Amortized and worst case split for push; expected and worst case split for a hash map lookup. Reading \`nums[0]\` does not split: every read is O(1). A push is O(1) amortized and O(n) when storage grows. A hash map lookup is O(1) expected and O(n) in a collision-heavy worst case. A helper that always scans is O(n) in every case.

| Operation | Typical guarantee | Worst time | Extra space |
| --- | --- | --- | --- |
| Read slot 0 | O(1) | O(1) | O(1) |
| Dynamic-array push | O(1) amortized | O(n) on resize | O(n) during a resizing copy |
| Hash map lookup | O(1) expected | O(n) | O(1) for the lookup |
| Helper that scans | O(n) | O(n) | O(1) if it only counts |

## In the course

Counting values strictly below a limit is not constant-time work. Each value can change the count. On 1, 4, 2, 8 with limit 4, \`nums[0]\` is 1, which is below 4, and that jump says nothing about 4, 2, or 8. The count is 2 only after those later values are seen.

Inside a one-pass count, reading the current slot, comparing it with the limit, and adding one to a counter are each O(1). You do that bundle once per element, so the function is linear. A helper that looks like one step and scans the array is not constant. Calling that O(n) helper from each of n loop iterations makes the total O(n²). That repeated scan is the habit to retire.

For TypeScript code, remember that a type signature does not make a runtime operation constant. A getter, callback, or library call can hide a traversal. Complexity follows the implementation that executes, not the number of source lines or the apparent simplicity of its type.

## Common mistakes

A single line is not automatically O(1). If it calls a scan, the cost is the scan.

Constant does not mean instant or tiny. A heavy step can be O(1) when the step count stays flat while n changes.

Push at the end is O(1) amortized in the dynamic-array model. The push that copies into new storage costs O(n).

Hash map lookup is O(1) expected under standard assumptions. A collision-heavy worst case can take O(n).

On a contiguous array, a known index is a jump. The loop that produced the index may be O(n). The read is not.

## When to use it

Use O(1) for a read by an index you already have and for a fixed number of arithmetic or comparison operations. Use O(1) amortized for dynamic-array append, and O(1) expected for a hash map lookup under the standard hashing assumptions. A single pass that does a fixed bundle of O(1) work per element is O(n), because n times a constant is still linear.

## When not to

Do not label a sum, a count below a limit, or a search for a missing target as O(1). Those answers depend on every element. Do not defend a helper you have not opened. A loop inside it is the cost, whatever the call site looks like.

## FAQ

### Does O(1) mean the operation is instant?

No. It means the work stays flat while n changes. The step can be a heavy calculation or a slow write. A longer input must not add more of those steps.

### Is a push at the end always one write?

No. Usually the write lands at the end and existing elements stay put. When the backing storage is full, that push may copy into a larger block and cost O(n). Across a long series of pushes, the amortized cost per push is O(1).

### Is a hash map get always O(1)?

No. It is O(1) expected under the usual hashing assumptions, but a collision-heavy worst case can be O(n). State which guarantee you mean.

### Can an O(1) operation use O(n) input space?

Yes. Reading one element from an existing n-element array is O(1) time and O(1) extra space. The input array itself occupies O(n) space, but the read does not allocate another array.

## Related

- [Contiguous arrays](/articles/contiguous-arrays)
- [Hash maps](/articles/hash-maps)
    `,
  ),
  defineArticle(
    "linear-time",
    "What Is Linear Time O(n)? One Pass and Linear Search",
    "Cost",
    "O(n) means one pass over the input: twice the data, about twice the work. Linear search is that scan, and it looks at every element when the target is missing.",
    ["O(n)", "linear search"],
    `
O(n) means one pass over the input: twice the data, about twice the work. Summing the values, counting how many sit strictly below a limit, and scanning for a target are all that one trip. Linear search is the scan that checks index 0, then 1, then 2. It looks at every element when the target is missing.

\`\`\`mermaid
flowchart LR
  i0["Index 0"] --> i1["Index 1"]
  i1 --> i2["Index 2"]
  i2 --> hit["Stop only if found"]
  i2 --> miss["Target missing"]
  miss --> all["Every element checked"]
\`\`\`

## Before you begin

You should be comfortable with array indexes, loops, and \`break\`. Here, **n** is the array length. A **linear scan** visits elements in order, and a **linear search** is a scan that stops when it finds a target. Use \`-1\` as the result when no index contains the target.

## How it works

Linear means the step count tracks the length. You do a fixed amount of work on an element, you do it once, and the total follows n. Twice the elements, about twice the steps. Ten times the elements, about ten times the steps. The work per element might be a comparison and an addition. Big O drops that constant and the label stays O(n).

Linear search is that pass pointed at a target. You check index 0. If it matches, you stop. If it does not, you check index 1, then index 2, and you keep going. You stop early only when you are lucky and the match sits before the last index. There is no jump to the middle. Each check settles only the slot you are on.

If the value is missing, the early stop never comes. You look at every element. That full scan is the worst case. The best case is a match at index 0, one check.

The useful loop invariant is: before checking index \`i\`, the target does not occur at any earlier index. A mismatch preserves that statement; a match returns the first occurrence. If the loop ends, every valid index has been ruled out. This mental model explains why \`return -1\` belongs after the loop.

You leave linear time when each element starts another scan of the rest of the array. The inner loop multiplies the outer pass into quadratic work. Two scans in sequence still add up to O(n). Sequence adds. Nesting multiplies.

\`\`\`ts
const linearSearch = (values: readonly number[], target: number): number => {
  for (let index = 0; index < values.length; index++) {
    if (values[index] === target) {
      return index;
    }
  }

  return -1;
};

const nums = [4, 1, 7, 9];
console.log(linearSearch(nums, 7));
console.log(linearSearch(nums, 8));
// Expected output:
// 2
// -1
\`\`\`

The early \`return\` fires only on a hit. If the target never appears, the loop reaches the end and returns \`-1\`. The function is self-contained, so you can run it and change either target.

With \`noUncheckedIndexedAccess\`, TypeScript may type \`values[index]\` as \`number | undefined\` even though the loop bounds prove the index is valid. Equality with a numeric target is still safe: \`undefined === target\` is false. When \`undefined\` is a valid stored value, use an explicit presence test instead of this shortcut.

## Best, average, and worst cases

Input length alone does not determine how many elements a search reads. The target's position matters too.

\`\`\`mermaid
flowchart TD
  search["Linear search in n values"] --> first["Target first"]
  search --> middle["Target in a typical position"]
  search --> absent["Target last or absent"]
  first --> best["Best: 1 check, O(1)"]
  middle --> average["Average: proportional to n, O(n)"]
  absent --> worst["Worst: n checks, O(n)"]
\`\`\`

Even though the best case is O(1), the standard headline for linear search is its O(n) worst-case time. Worst-case analysis gives a bound that remains valid for every target and every array of length n.

## A numeric example

Search for 7 in 4, 1, 7, 9. Index 0 holds 4, a miss. Index 1 holds 1, a miss. Index 2 holds 7, a hit, and you stop. Three checks on an array of four, because the target sat before the end.

Search for 7 in 4, 1, 8, 9. You check 4, then 1, then 8, then 9. Four checks, the whole array, and the answer is absent. Double that array to eight elements with 7 still missing and you do about eight checks. Double again, to 16, and you do about 16. The missing target is the case that draws the linear slope cleanly.

A count has no lucky stop. Count values strictly below 4 in 1, 4, 2, 8 and you still visit all four. 1 qualifies, 4 does not, 2 qualifies, 8 does not, so the count is 2. On 1,000 elements you do about 1,000 comparisons, because a count is a total, not a search hit.

## Cost

One pass is O(n) time. Extra space is O(1) when you keep a counter, a running sum, or the index you found. Extra space is O(n) when that pass also fills a new array with one slot per input element. The iterative linear search above is O(n) time and O(1) extra space.

Worst-case time for linear search is O(n), when the target is missing or last. Best-case time is O(1) when it sits at index 0. If the target is equally likely in any slot, you look at about half the array on average, and one half is a constant, so that average stays O(n). A sum or a count is O(n) every time, average and worst case, because every value can change the answer.

| Operation | Time | Extra space |
| --- | --- | --- |
| Sum the array | O(n) every time | O(1) |
| Count values below a limit | O(n) every time | O(1) |
| Linear search, target missing | O(n) | O(1) |
| Linear search, target at index 0 | O(1) | O(1) |

## In the course

The exercise is the count, done in one pass. Strictly below means a value equal to the limit stays out of the count. You walk from the first index toward the last a single time. Each element gets one comparison and, when it is smaller, one increment of a counter. On 1, 4, 2, 8 with limit 4, that walk sees two qualifying values, 1 and 2.

That is O(n) time and O(1) extra space when the counter is the only extra memory. A second loop nested under the walk can return the same count. If each element starts another scan of the rest, you have left linear time, even though the number you return can still be right. The nested version is the habit to retire. Say the cost from the loops that are actually on the page.

## Common mistakes

A search may break on the first hit. A count of every qualifying value has to keep walking, or you will miss later hits.

Returning \`-1\` inside the first nonmatching iteration is a correctness bug. One mismatch proves only that the current index is not the answer. Return \`-1\` after the loop has exhausted every candidate.

Two loops one after another add, so two scans stay O(n). A loop inside a loop multiplies. Starting a scan of the remaining values for each outer element makes the total quadratic.

The lucky early stop is not the cost to quote for linear search. If the value is missing, you looked at everything.

## When to use it

Use one linear pass when each element can affect the answer and you have no sorted order to exploit. Sums, counts, and a search on unsorted input all sit here. The linear scan is the baseline you beat only when a sorted array or a map removes the need to look at everything.

## When not to

Do not start a fresh scan of the rest of the array when the current element already answers the question. That repeated scan turns linear work into quadratic work. Do not plan on linear search once the array is sorted and you are testing membership. Binary search throws away half of what remains on each comparison. A count of values below a limit also does not stop at the first qualifier.

## FAQ

### Does twice the data mean exactly twice the work?

About twice. A fixed bit of setup, and a constant factor on the loop body, sit beside the growth Big O is measuring. The step count still tracks n.

### When does linear search stop early?

Only when the current element is the target. You check index 0, then 1, then 2, and you stop at the first hit. If the value is missing, that stop never arrives. You looked at every element.

### Is a nested count of values below a limit still linear?

The count can be right, and the cost is no longer linear when one loop sits inside the other. An inner scan of the remaining elements multiplies the work. One loop that visits each index once, and does a fixed check there, stays O(n).

### Does an early return make linear search O(1)?

Only in the best case, when the first element matches. A target at the final index or a missing target still requires n checks, so the worst-case time is O(n).

## Related

- [What Is Big O? How Algorithm Cost Grows as Input Grows](/articles/big-o)
- [Binary search](/articles/binary-search)
    `,
  ),
  defineArticle(
    "quadratic-time",
    "What Is O(n²) Quadratic Time? Nested Loops and Pairs",
    "Cost",
    "O(n²) is the cost of looking at the other elements for each element, usually a loop inside a loop. Ten items are a small triangle of comparisons; a thousand items are on the order of a million.",
    ["O(n²)"],
    `
O(n²) is the cost of looking at the other elements for each element, usually a loop inside a loop. Ten items are a small triangle of comparisons. A thousand items are on the order of a million, because growing the input by a factor of 100 grows the pair-work by about a factor of 10,000.

\`\`\`mermaid
flowchart TD
  each["Each element"] --> rest["Look at the others"]
  rest --> ten["10 items, small triangle"]
  rest --> thou["1000 items, about a million"]
  rest --> half["Still O(n²) if the inner loop shrinks"]
\`\`\`

## Before you begin

You should know how nested loops work and how Big O drops constant factors and lower-order terms. Here, **n** is the number of input elements. An **ordered pair** distinguishes \`(i, j)\` from \`(j, i)\`; an **unordered pair** treats them as the same pair.

## How it works

Quadratic time appears when the work for one element grows with the number of elements. The usual code is an outer loop and an inner loop. If the outer loop runs n times and the inner loop runs n times, the body runs n times n. Nested loops multiply. That product is the label.

Often the inner loop only walks the rest of the array. The inner index starts one past the outer index and runs to the last element. You then count each unordered pair once, and you skip comparing an element with itself. The exact number of those pairs is n(n-1)/2. Big O drops the factor of one half and drops the lower-order term, so this tighter loop is still O(n²). A shorter inner trip changes the constant. It does not change the class.

A full \`for i\` / \`for j\` grid visits n² ordered index pairs, including self-pairs. Starting \`j\` at \`i + 1\` visits each unordered pair exactly once. Starting \`j\` at \`i\` includes self-pairs once. These loops answer different questions even though all three can have the same O(n²) growth label.

The triangle is that same count drawn as columns. The first element is compared with n - 1 others, the next with n - 2, down to one last comparison. Those heights sum to n(n-1)/2. Ten elements are a small triangle. A thousand elements are not.

A quadratic pass plus a later linear pass is still quadratic, because Big O keeps the dominant term. Two separate scans add. They do not square.

\`\`\`ts
const countUnorderedPairs = (size: number): number => {
  if (!Number.isInteger(size) || size < 0) {
    throw new RangeError("size must be a non-negative integer");
  }

  let pairs = 0;
  for (let first = 0; first < size; first++) {
    for (let second = first + 1; second < size; second++) {
      pairs = pairs + 1;
    }
  }
  return pairs;
};

console.log(countUnorderedPairs(4));
console.log(countUnorderedPairs(10));
// Expected output:
// 6
// 45
\`\`\`

The inner loop walks only the rest of the array. The body still runs n(n-1)/2 times, which is quadratic.

## Seeing the triangular work

With four indexes, the first index pairs with three later indexes, the second with two, and the third with one. The final index has no later partner.

\`\`\`mermaid
flowchart LR
  i0["Index 0: 3 pairs"] --> i1["Index 1: 2 pairs"]
  i1 --> i2["Index 2: 1 pair"]
  i2 --> i3["Index 3: 0 pairs"]
  i3 --> total["3 + 2 + 1 = 6"]
\`\`\`

For n indexes, the sum is \`(n - 1) + (n - 2) + ... + 1 = n(n - 1) / 2\`. Expanding gives \`(n² - n) / 2\`; dropping the factor \`1/2\` and the lower-order \`n\` leaves O(n²).

## A numeric example

Ten elements give a small triangle. Unordered pairs are 10 times 9 divided by 2, which is 45. A full inner loop of length 10 on each of 10 outer steps is 100. You can list 45 pairs on paper. Nothing about that size feels like a warning.

Move from 10 elements to 1,000. The input grew by a factor of 100. Pair-work grows with the square of that factor, and 100 times 100 is 10,000, so the comparisons grow about 10,000 times. At n = 1000, n² is 1,000,000. Unordered pairs are 1000 times 999 divided by 2, which is 499,500. Half a million is smaller than a million, and both are on the order of a million. The one-half did not create a new class.

One scan of those 1,000 elements is about 1,000 steps. The pair version does hundreds of times more work. At n = 10 the gap was 45 against 10. At n = 1000 that gap is why you name O(n²) before you keep the nested loops.

## Cost

Looking at every pair is O(n²) time. The inner loop that starts partway through the array is also O(n²) time. Average and worst case match for these loops, because you walk the pairs either way. The values do not cancel iterations. Extra space is O(1) when you keep a counter. Extra space becomes O(n²) if you store every pair you visit.

An early return can improve the best case without changing the O(n²) worst case. For example, a duplicate search may stop on its first equal pair, but an all-distinct input still forces it to examine every candidate pair.

Nested loops are not automatically quadratic. Multiply their actual bounds. If an outer loop runs n times and an inner loop always runs 10 times, the total is O(10n) = O(n). If one loop covers n values and the other covers an independent input of length m, the total is O(nm).

| Operation | Time | Extra space |
| --- | --- | --- |
| Both loops run n times | O(n²) | O(1) if you only count |
| Inner loop walks the rest | O(n²) | O(1) if you only count |
| One pass over the array | O(n) | O(1) |
| Store every unordered pair | O(n²) | O(n²) |

## In the course

Counting values strictly below a limit with two loops can return the right number. You can walk other indexes for each index and still add one only when a value qualifies. On 1, 4, 2, 8 with limit 4, a careful nested version can still land on 2, and the tests can pass. The inner loop was never required. One comparison per element answers the question. Paying pair-shaped work for a one-pass question is the habit to retire.

Read the cost off the indentation. Two nested loops over the array are O(n²) time. One loop and a counter are O(n) time and O(1) extra space. A right count is not permission to keep the inner loop.

The core course requirement is to recognize and count pair-shaped work. Deriving \`n(n - 1) / 2\` is the useful bridge from code to algebra; proving asymptotic bounds from first principles is enrichment.

## Common mistakes

Treating the shrinking inner loop as linear misses the algebra that still squares. It does not run n times on every outer step. n(n-1)/2 is still quadratic once the constants and the lower term are dropped.

Treating 499,500 as a different class from 1,000,000 keeps a factor Big O drops. Those counts differ by about a factor of two. Both are O(n²) at n = 1000.

Keeping the nested count because the tests pass separates correctness from cost. A right count and a quadratic habit can live in the same function. The lesson asks you to retire the habit.

Calling two sequential scans quadratic confuses addition with multiplication. Loops that follow each other add. You square the cost when one loop runs inside the other.

Calling every nested loop quadratic ignores its bounds. A constant-size inner loop keeps the total linear, and loops over two independent inputs should preserve both variables as O(nm).

## When to use it

Use a nested pair loop when the question really is about pairs, or when n is so small that n² is still a size you can list and the double loop is the clearest correct code. Naming O(n²) is what makes that choice a choice. Ten items and 45 comparisons can be a fine place to stop, as long as you know what happens at a thousand.

## When not to

Do not use a pair of loops to count values below a limit. The inner loop does not inspect a relationship between two indexes. It repeats a question the current element can answer alone.

Do not use a pair of loops to ask whether you have already seen a partner value. A hash map answers that with an average O(1) get, and the surrounding pass is linear. The quadratic version can still return a right answer on small tests. It will not stay pleasant when the input grows by a factor of 100.

## FAQ

### Is an inner loop over the rest of the array still O(n²)?

Yes. You visit n(n-1)/2 pairs, and Big O drops the constant and the lower-order term. The label stays O(n²). A shorter inner bound changes the exact count and leaves the class alone.

### How many pairs is 1,000 elements?

n² is 1,000,000 when both loops run across every index. Unordered pairs, the triangle that skips an element paired with itself, come to 499,500. Both are on the order of a million. Ten elements were only 45 unordered pairs, which is why the small case feels cheap.

### Can two loops return the right count and still be the wrong habit?

Yes. A nested loop can count values strictly below a limit and match the tests. The inner loop is the habit to retire. One pass does the same count in O(n) time and O(1) extra space.

### Are all nested loops O(n²)?

No. Multiply the number of iterations of each loop. An n-iteration outer loop with a 10-iteration inner loop is O(n). Loops over inputs of lengths n and m are O(nm). The result is O(n²) only when both dimensions grow with the same n.

## Related

- [What Is Big O? How Algorithm Cost Grows as Input Grows](/articles/big-o)
- [Hash maps](/articles/hash-maps)
- [What Is the Space-for-Time Tradeoff in Algorithms?](/articles/space-for-time)
    `,
  ),
  defineArticle(
    "loop-invariants",
    "What Is a Loop Invariant? Proving Each Iteration Is Correct",
    "Cost",
    "A loop invariant is a statement that is true before or after every iteration. Establish it before the loop, preserve it through each update, and use it at termination to explain why the result is correct.",
    ["loop invariant"],
    `
A **loop invariant** is a precise statement that remains true at a chosen point in every loop iteration. It connects the variables in the code to the meaning the algorithm is meant to preserve.

For a counting loop, the invariant can say that \`count\` equals the number of qualifying values in the prefix already processed. For binary search, it can say that if the target exists, it remains inside the current candidate interval. For two pointers, it can describe which values have already reached their final positions.

\`\`\`mermaid
flowchart LR
  establish["Establish before the loop"] --> check["Invariant is true"]
  check --> step["Run one iteration"]
  step --> preserve["Show the update preserves it"]
  preserve --> check
  check -->|loop ends| conclude["Combine invariant with termination"]
\`\`\`

## The three proof steps

First, **establish** the invariant. Show that it is true before the first iteration. A processed prefix is often empty at that point, so a counter initialised to zero has the required meaning.

Second, **preserve** the invariant. Assume it is true at the start of one iteration, then explain why the loop body makes it true for the next iteration. This step is where an off-by-one error or an update in the wrong order usually appears.

Third, use **termination**. When the loop condition becomes false, combine that fact with the invariant. If the processed prefix is now the whole array, the prefix count is the full answer. If a binary-search interval is empty, no candidate remains.

These steps prove correctness; they do not by themselves prove that the loop ends. Also identify a quantity that moves toward termination, such as an index that increases, a range that shrinks, or a pointer that never moves backward.

## A counting example

The function below counts values strictly below a limit. At the start of iteration \`index\`, the invariant is:

> \`count\` equals the number of values below \`limit\` at indexes from 0 through \`index - 1\`.

\`\`\`ts
function countBelow(values: readonly number[], limit: number): number {
  let count = 0;

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value !== undefined && value < limit) {
      count += 1;
    }
  }

  return count;
}

console.log(countBelow([1, 4, 2, 8], 4));
// Expected output: 2
\`\`\`

Before the first iteration, no indexes have been processed and \`count\` is zero, so the invariant is established. During an iteration, the current value either qualifies and increases the count once, or does not qualify and leaves it unchanged. The statement is therefore preserved for the longer prefix.

When the loop ends, \`index === values.length\`. The processed prefix is the whole array, so the invariant says that \`count\` is the required total.

## Invariants for ranges and data structures

An invariant should name the exact region or structure it describes. “The answer is correct so far” is too vague to test.

For binary search, say: if the target exists, an occurrence remains in the candidate interval. Every comparison must discard only indexes that cannot contain it.

For merge sort, say: the output contains the smallest consumed values in sorted order, and each pointer identifies the smallest unconsumed value on its side.

For a monotonic stack, say which indexes are unresolved and how their values are ordered from bottom to top. A later value can then pop exactly the entries it resolves.

## Cost

Writing an invariant does not add runtime work. It is a reasoning tool for the loop already present. The loop's time still follows its iteration count, and its auxiliary space still follows the state it stores.

The invariant can make that cost easier to justify. If two pointers only move forward and each moves at most \`n\` times, the total is O(n), even when one pointer moves inside a nested \`while\` loop.

## In the course

The course uses loop invariants in counting, binary search, sliding windows, merging, heaps, graph traversal, greedy scans, and dynamic programming. You do not need formal symbolic logic. State what the variables mean before an iteration, show that one update preserves that meaning, and explain what the statement gives you when the loop ends.

## Common mistakes

An invariant is not a description of the next line. It must remain true across every iteration.

Do not omit the region: “the values are sorted” is weaker than “the consumed prefix of the result is sorted and contains exactly the consumed input values.”

Do not use the final answer as an assumption. The invariant should describe partial progress that the code can establish and preserve.

Termination needs its own argument. A true invariant does not prevent a loop whose pointers never advance.

## Related

- [What Is Big O? How Algorithm Cost Grows as Input Grows](/articles/big-o)
- [What Is Linear Time O(n)? One Pass and Linear Search](/articles/linear-time)
- [What Is Binary Search? Throw Away Half of a Sorted Array](/articles/binary-search)
    `,
  ),
  defineArticle(
    "amortized-analysis",
    "What Is Amortized Analysis? Cost Across a Sequence of Operations",
    "Cost",
    "Amortized analysis bounds the total cost of a sequence and divides that cost across its operations. It explains why an occasional O(n) dynamic-array resize can coexist with O(1) amortized append.",
    ["amortized analysis", "amortized"],
    `
**Amortized analysis** studies the total cost of a sequence of operations. One operation may be expensive, but if expensive operations are rare and create room for many cheap operations, the cost per operation can still have a small guaranteed bound across the sequence.

This is not average-case analysis. Average-case analysis depends on a distribution of possible inputs. An amortized bound covers every operation sequence allowed by the model, without assuming that inputs are random.

\`\`\`mermaid
flowchart LR
  cheap1["Push: one write"] --> cheap2["Push: one write"]
  cheap2 --> resize["Resize: copy existing values"]
  resize --> spare["Larger capacity"]
  spare --> cheap3["Many cheap pushes"]
  cheap3 --> total["Total work remains linear"]
\`\`\`

## Dynamic-array append

Imagine an array whose capacity doubles whenever it becomes full. Most appends write one value into unused storage, which costs O(1). A resize append allocates a larger block and copies every existing value, so that individual operation costs O(n).

The copies do not happen on every append. If capacities grow through 1, 2, 4, 8, and 16, the resize copies move 1, then 2, then 4, then 8 values. Before 16 values have been appended, fewer than 16 old values were copied in total.

The geometric sum stays below a constant multiple of the number of appends. Therefore \`n\` appends take O(n) total time, and each append costs O(1) amortized time.

## A runnable model

The small class below counts writes while capacity doubles. It models the cost argument without depending on a JavaScript engine's internal array representation.

\`\`\`ts
class GrowingArray {
  private storage: Array<number | undefined> = new Array(1);
  private length = 0;
  private writes = 0;

  push(value: number): void {
    if (this.length === this.storage.length) {
      const grown = new Array<number | undefined>(this.storage.length * 2);

      for (let index = 0; index < this.length; index += 1) {
        grown[index] = this.storage[index];
        this.writes += 1;
      }

      this.storage = grown;
    }

    this.storage[this.length] = value;
    this.length += 1;
    this.writes += 1;
  }

  writeCount(): number {
    return this.writes;
  }
}

const values = new GrowingArray();
for (let value = 0; value < 16; value += 1) {
  values.push(value);
}
console.log(values.writeCount());
// Expected output: 31
\`\`\`

Sixteen appends perform sixteen writes for the new values and fifteen copy writes during growth. One append was expensive, but the complete sequence used fewer than two writes per append on average. The bound follows the growth policy, not luck.

## Aggregate and charging views

The **aggregate method** adds the costs of all operations, then divides by the number of operations. For doubling storage, total writes across \`n\` appends are O(n), so the amortized cost is O(1).

The **accounting method** assigns a slightly larger constant charge to each cheap append. The unused part of that charge pays for copying the value during a future resize. This is a proof device; the program does not store actual credits.

Both views establish the same sequence-wide guarantee.

## Monotonic structures

Amortized analysis also explains why a monotonic stack or deque can be linear. One incoming value may trigger many pops, so one iteration can look expensive. Across the whole run, however, each index is pushed once and popped at most once.

The total number of stack or deque operations is O(n). The nested \`while\` loop does not make the complete algorithm O(n²).

## Cost

For dynamic-array append, one operation is O(n) in the resize worst case, while a sequence of \`n\` appends is O(n) total and O(1) amortized per append. The backing storage is O(n).

For a monotonic stack, one iteration can pop O(n) entries, but all iterations together perform O(n) pushes and pops. Auxiliary space is O(n) in the worst case.

Always state which guarantee you mean: worst-case per operation, expected, or amortized. They answer different questions.

## In the course

Arrays use amortized append. Monotonic stacks and deques use the “each item enters and leaves at most once” argument. These cases teach the same habit: count an operation across the whole sequence instead of multiplying the most expensive single iteration by the number of iterations.

## Common mistakes

Do not call amortized cost an average over random inputs. No probability is required.

Do not claim that every append is O(1). A resize append can be linear even though the amortized cost is constant.

Do not inspect only the most expensive iteration of a monotonic-stack loop. Count how many times each index can be pushed and popped over the complete run.

## Related

- [What Does O(1) Mean? Constant-Time Work That Stays Flat](/articles/constant-time)
- [What Is Big O? How Algorithm Cost Grows as Input Grows](/articles/big-o)
- [What Is a Sliding Window?](/articles/sliding-windows)
    `,
  ),
];

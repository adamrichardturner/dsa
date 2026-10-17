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

## How it works

You count steps, not wall-clock seconds. A step is a comparison, an index read, or an addition. A faster machine finishes each of those sooner. Big O stays the same, because the speed of the machine is one of the constants the notation tells you to set aside.

A constant factor is a multiplier that does not depend on the length of the input. Three checks on every element is still a single pass. Double the input and that work still roughly doubles, which is why the label is O(n) after the three is dropped. The three is worth knowing when you compare two linear functions on a short array. It does not pick the winner once one function is a single pass and the other is a loop inside a loop, and the input has grown large.

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
\`\`\`

The first loop adds one step per element. The second loop multiplies, because the inner loop runs a full pass for every value of i. You can see the product in the indentation.

## A numeric example

Start with 10 elements. A single scan does about 10 steps. A pair of loops that each run to 10 does about 100 steps. Both numbers are small enough to write down.

Double the input to 20. The scan moves to about 20 steps, which is double. The nested loops move to about 400 steps, which is four times the previous nested cost. Double again, to 40. The scan does about 40 steps. The nested loops do about 1,600. The scan is following n. The nested loops are following n times n.

At 1,000 elements the scan does about 1,000 steps. The nested loops do about 1,000,000. From the 10-element case the input grew by a factor of 100. The scan grew by that same factor. The nested work grew by a factor of about 10,000. You can see the gap on paper, before anyone runs the code.

## Cost

Time is how the step count grows with n. Extra space is memory you allocate beyond the input you were handed. A scan that keeps a counter is O(n) time and O(1) extra space. A loop inside a loop over the same array is O(n²) time, and it can still be O(1) extra space if all it keeps is a counter. The slow shape and the allocating shape are separate facts.

For these plain loops the average case and the worst case match. Every index is visited the same way no matter what the values are. A structure you meet later, such as a hash map, can split those two cases. A loop you wrote does not. Read the rows as the shapes you can point at in the code.

| Operation | Time | Extra space |
| --- | --- | --- |
| Read one index | O(1) | O(1) |
| One loop over the array | O(n) | O(1) |
| A loop inside a loop | O(n²) | O(1) |
| One pass that fills a new array | O(n) | O(n) |

## In the course

The exercise asks you to count values strictly below a limit. Equality does not count. On the array 1, 4, 2, 8 with limit 4, the values 1 and 2 qualify and 4 does not, so the count is 2. An empty array counts as 0.

One pass visits each index once, compares the value with the limit, and adds one to a counter when the value is smaller. That is O(n) time and O(1) extra space. A nested loop can return 2 as well. The inner loop repeats work the outer loop already made available, and that shape is the habit to retire. One loop is linear. A loop inside it is quadratic, even when the tests pass.

## Common mistakes

A faster laptop does not improve the Big O label. It shortens seconds. The growth stays what the loops already imply.

O(3n) keeps a constant the notation drops. Three passes are O(n). Say the three beside the code when you compare two linear options.

Loops one after another add, so two scans are still O(n). Nested loops multiply. Read the indentation before you decide.

A helper can hide a loop. A call that walks the array is not one step. Name the loops inside it.

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

## Related

- [What Is Linear Time O(n)? One Pass and Linear Search](/articles/linear-time)
- [What Is O(n²) Quadratic Time? Nested Loops and Pairs](/articles/quadratic-time)
    `,
  ),
  defineArticle(
    "constant-time",
    "What Does O(1) Mean? Constant-Time Work That Stays Flat",
    "Cost",
    "O(1) means the work stays flat as the input grows. Reading one array slot or pushing onto the end does not get slower just because the array is longer.",
    ["O(1)"],
    `
O(1) means the work stays flat as the input grows. Reading one array slot, or pushing a value onto the end, does not get slower just because the array is longer. Constant does not mean the step is instant, and it does not mean the work is tiny. It means the amount of work holds still while n changes.

\`\`\`mermaid
flowchart LR
  slot["Read slot 0"] --> jump["One jump"]
  push["Push at the end"] --> avg["O(1) on average"]
  jump --> flat["Work stays flat"]
  avg --> flat
  helper["Helper that scans"] --> line["O(n) work"]
\`\`\`

## How it works

Reading \`nums[0]\` is a jump, not a walk from the head. The runtime takes the address of the first slot and reads it. It does not visit later elements on the way, and a longer array does not add steps to that read.

Flat is the whole claim. A constant-time step can still be heavy: a hash, a bounds check, a write. Constant does not mean instant, and it does not mean tiny. It means the step count holds still while n changes. If doubling the array doubles the steps, you have left O(1).

Pushing at the end is O(1) on average. The new value is written past the last used index, and nothing in front of it slides. When storage is full, that one push copies into a larger block and costs O(n). Across many pushes the copy is rare, so the average per push stays constant.

A hash map get is O(1) on average. The key is hashed, the map jumps toward a slot, and a typical key is found with work that does not track n. One unlucky key can land in a crowded slot and take longer. The average is the number to quote. The unlucky key is not a guarantee.

A helper that looks like one step can still scan. If the body walks from the first index to the last, the cost is the walk. A loop over the input is not constant time, however short the call looks.

\`\`\`ts
const nums = [4, 1, 7, 9, 2, 8, 3, 6, 5, 0];
const first = nums[0];
let visits = 0;
for (let i = 0; i < nums.length; i++) {
  visits = visits + 1;
}
console.log(first, visits);
\`\`\`

The assignment to first is the jump. The loop visits every index, so a helper built like that loop is not O(1).

## A numeric example

Read slot 0 on 10 numbers: one jump. Read slot 0 on 10,000 numbers: still one jump. The second array is 1,000 times longer, and the read did not pick up extra steps.

Push 8 values while storage doubles whenever it fills. Copies can move 1, then 2, then 4 elements: 7 copies across 8 pushes, about one extra copied element per push. At 1,024 pushes the copies still add up to less than two passes of the final length, so the average stays a small constant. The push that hits a full buffer is the slow one.

A helper that scans does about 10 visits on 10 elements and about 10,000 visits on 10,000 elements. The call site stayed one line. The cost followed n.

## Cost

A true O(1) operation takes the same number of steps at n = 10 and at n = 10,000. Extra space for that operation is O(1) when you touch one slot or one map entry. The array you already hold may occupy O(n) memory. The read does not copy it.

Average and worst case split for push and for hash map get. Reading \`nums[0]\` does not split: every read is O(1). A push is O(1) on average and O(n) when storage grows. A hash map get is O(1) on average, and one unlucky key can take longer. A helper that always scans is O(n) on average and in the worst case.

| Operation | Average time | Worst time | Extra space |
| --- | --- | --- | --- |
| Read slot 0 | O(1) | O(1) | O(1) |
| Push at the end | O(1) | O(n) on resize | O(1) per typical push |
| Hash map get | O(1) | Longer for one unlucky key | O(1) for the lookup |
| Helper that scans | O(n) | O(n) | O(1) if it only counts |

## In the course

Counting values strictly below a limit is not constant-time work. Each value can change the count. On 1, 4, 2, 8 with limit 4, \`nums[0]\` is 1, which is below 4, and that jump says nothing about 4, 2, or 8. The count is 2 only after those later values are seen.

Inside a one-pass count, reading the current slot, comparing it with the limit, and adding one to a counter are each O(1). You do that bundle once per element, so the function is linear. A helper that looks like one step and scans the array is not constant. Calling it from the loop leaves linear time as well. That extra scan is the habit to retire.

## Common mistakes

A single line is not automatically O(1). If it calls a scan, the cost is the scan.

Constant does not mean instant or tiny. A heavy step can be O(1) when the step count stays flat while n changes.

Push at the end is O(1) on average. The push that copies into new storage costs more than that average.

Hash map get is O(1) on average. One unlucky key can take longer.

On a contiguous array, a known index is a jump. The loop that produced the index may be O(n). The read is not.

## When to use it

Use O(1) for a read by an index you already have, a write at the end of an array, and a push or pop that touches only that end. Use it for a hash map get or set when you mean the average. A single pass that does a fixed bundle of O(1) work per element is O(n), because n times a constant is still linear.

## When not to

Do not label a sum, a count below a limit, or a search for a missing target as O(1). Those answers depend on every element. Do not defend a helper you have not opened. A loop inside it is the cost, whatever the call site looks like.

## FAQ

### Does O(1) mean the operation is instant?

No. It means the work stays flat while n changes. The step can be a heavy calculation or a slow write. A longer input must not add more of those steps.

### Is a push at the end always one write?

On average, yes. The write lands at the end, and elements already in the array stay put. When the backing storage is full, that one push copies into a larger block and costs O(n). Across a long series of pushes the average per push is still O(1).

### Is a hash map get always O(1)?

On average, yes. A typical key is found after work that does not grow with the number of keys. One unlucky key can share a crowded slot and take longer. Quote the average, and keep the unlucky key in the same sentence.

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

## How it works

Linear means the step count tracks the length. You do a fixed amount of work on an element, you do it once, and the total follows n. Twice the elements, about twice the steps. Ten times the elements, about ten times the steps. The work per element might be a comparison and an addition. Big O drops that constant and the label stays O(n).

Linear search is that pass pointed at a target. You check index 0. If it matches, you stop. If it does not, you check index 1, then index 2, and you keep going. You stop early only when you are lucky and the match sits before the last index. There is no jump to the middle. Each check settles only the slot you are on.

If the value is missing, the early stop never comes. You look at every element. That full scan is the worst case. The best case is a match at index 0, one check.

You leave linear time when each element starts another scan of the rest of the array. The inner loop multiplies the outer pass into quadratic work. Two scans in sequence still add up to O(n). Sequence adds. Nesting multiplies.

\`\`\`ts
const nums = [4, 1, 7, 9];
const target = 7;
let found = -1;
for (let i = 0; i < nums.length; i++) {
  if (nums[i] === target) {
    found = i;
    break;
  }
}
console.log(found);
\`\`\`

That loop is linear search. The break fires only on a hit. If target never appears, the loop runs to the last index, and found stays -1.

## A numeric example

Search for 7 in 4, 1, 7, 9. Index 0 holds 4, a miss. Index 1 holds 1, a miss. Index 2 holds 7, a hit, and you stop. Three checks on an array of four, because the target sat before the end.

Search for 7 in 4, 1, 8, 9. You check 4, then 1, then 8, then 9. Four checks, the whole array, and the answer is absent. Double that array to eight elements with 7 still missing and you do about eight checks. Double again, to 16, and you do about 16. The missing target is the case that draws the linear slope cleanly.

A count has no lucky stop. Count values strictly below 4 in 1, 4, 2, 8 and you still visit all four. 1 qualifies, 4 does not, 2 qualifies, 8 does not, so the count is 2. On 1,000 elements you do about 1,000 comparisons, because a count is a total, not a search hit.

## Cost

One pass is O(n) time. Extra space is O(1) when you keep a counter, a running sum, or the index you found. Extra space is O(n) when that pass also fills a new array with one slot per input element. Linear search that remembers an index is O(n) time and O(1) extra space.

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

Two loops one after another add, so two scans stay O(n). A loop inside a loop multiplies. An inner scan of the rest leaves linear time.

The lucky early stop is not the cost to quote for linear search. If the value is missing, you looked at everything.

## When to use it

Use one linear pass when each element can affect the answer and you have no sorted order to exploit. Sums, counts, and a search on unsorted input all sit here. The linear scan is the baseline you beat only when a sorted array or a map removes the need to look at everything.

## When not to

Do not start a fresh scan of the rest of the array when the current element already answers the question. That move leaves linear time. Do not plan on linear search once the array is sorted and you are testing membership. Binary search throws away half of what remains on each comparison. A count of values below a limit also does not stop at the first qualifier.

## FAQ

### Does twice the data mean exactly twice the work?

About twice. A fixed bit of setup, and a constant factor on the loop body, sit beside the growth Big O is measuring. The step count still tracks n.

### When does linear search stop early?

Only when the current element is the target. You check index 0, then 1, then 2, and you stop at the first hit. If the value is missing, that stop never arrives. You looked at every element.

### Is a nested count of values below a limit still linear?

The count can be right, and the cost is no longer linear when one loop sits inside the other. An inner scan of the remaining elements multiplies the work. One loop that visits each index once, and does a fixed check there, stays O(n).

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

## How it works

Quadratic time appears when the work for one element grows with the number of elements. The usual code is an outer loop and an inner loop. If the outer loop runs n times and the inner loop runs n times, the body runs n times n. Nested loops multiply. That product is the label.

Often the inner loop only walks the rest of the array. The inner index starts one past the outer index and runs to the last element. You then count each unordered pair once, and you skip comparing an element with itself. The exact number of those pairs is n(n-1)/2. Big O drops the factor of one half and drops the lower-order term, so this tighter loop is still O(n²). A shorter inner trip changes the constant. It does not change the class.

The triangle is that same count drawn as columns. The first element is compared with n - 1 others, the next with n - 2, down to one last comparison. Those heights sum to n(n-1)/2. Ten elements are a small triangle. A thousand elements are not.

A quadratic pass plus a later linear pass is still quadratic, because Big O keeps the dominant term. Two separate scans add. They do not square.

\`\`\`ts
const n = 10;
let pairs = 0;
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    pairs = pairs + 1;
  }
}
console.log(pairs);
\`\`\`

The inner loop walks only the rest of the array. The body still runs n(n-1)/2 times, which is quadratic.

## A numeric example

Ten elements give a small triangle. Unordered pairs are 10 times 9 divided by 2, which is 45. A full inner loop of length 10 on each of 10 outer steps is 100. You can list 45 pairs on paper. Nothing about that size feels like a warning.

Move from 10 elements to 1,000. The input grew by a factor of 100. Pair-work grows with the square of that factor, and 100 times 100 is 10,000, so the comparisons grow about 10,000 times. At n = 1000, n² is 1,000,000. Unordered pairs are 1000 times 999 divided by 2, which is 499,500. Half a million is smaller than a million, and both are on the order of a million. The one-half did not create a new class.

One scan of those 1,000 elements is about 1,000 steps. The pair version does hundreds of times more work. At n = 10 the gap was 45 against 10. At n = 1000 that gap is why you name O(n²) before you keep the nested loops.

## Cost

Looking at every pair is O(n²) time. The inner loop that starts partway through the array is also O(n²) time. Average and worst case match for these loops, because you walk the pairs either way. The values do not cancel iterations. Extra space is O(1) when you keep a counter. Extra space becomes O(n²) if you store every pair you visit.

| Operation | Time | Extra space |
| --- | --- | --- |
| Both loops run n times | O(n²) | O(1) if you only count |
| Inner loop walks the rest | O(n²) | O(1) if you only count |
| One pass over the array | O(n) | O(1) |
| Store every unordered pair | O(n²) | O(n²) |

## In the course

Counting values strictly below a limit with two loops can return the right number. You can walk other indexes for each index and still add one only when a value qualifies. On 1, 4, 2, 8 with limit 4, a careful nested version can still land on 2, and the tests can pass. The inner loop was never required. One comparison per element answers the question. Paying pair-shaped work for a one-pass question is the habit to retire.

Read the cost off the indentation. Two nested loops over the array are O(n²) time. One loop and a counter are O(n) time and O(1) extra space. A right count is not permission to keep the inner loop.

## Common mistakes

Treating the shrinking inner loop as linear misses the algebra that still squares. It does not run n times on every outer step. n(n-1)/2 is still quadratic once the constants and the lower term are dropped.

Treating 499,500 as a different class from 1,000,000 keeps a factor Big O drops. Those counts differ by about a factor of two. Both are O(n²) at n = 1000.

Keeping the nested count because the tests pass separates correctness from cost. A right count and a quadratic habit can live in the same function. The lesson asks you to retire the habit.

Calling two sequential scans quadratic confuses addition with multiplication. Loops that follow each other add. You square the cost when one loop runs inside the other.

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

## Related

- [What Is Big O? How Algorithm Cost Grows as Input Grows](/articles/big-o)
- [Hash maps](/articles/hash-maps)
    `,
  ),
];

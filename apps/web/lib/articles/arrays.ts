import { defineArticle, type Article } from "./types";

export const arrayArticles: readonly Article[] = [
  defineArticle(
    "contiguous-arrays",
    "What Is a Contiguous Array? Index Jumps and Shifts",
    "Arrays",
    "A contiguous array stores values in neighbouring memory, so an index is a jump and a middle insert has to slide the tail. That layout is why index reads are O(1) and middle edits are O(n).",
    ["contiguous list"],
    `
A contiguous array stores its values in neighbouring slots, so element i sits a fixed distance from element 0. That distance is a jump, which means reading element 10 costs the same as reading element 0, and both reads are O(1). Insert or delete anywhere but the end and every later element has to slide, which is why a middle edit is O(n).

\`\`\`mermaid
flowchart TD
  choice{"Which operation do you repeat?"}
  choice --> read["Read nums at index i"]
  read --> jump["Jump a fixed distance from the start, O(1)"]
  choice --> mid["Insert or delete before the end"]
  mid --> slide["Slide every later element, O(n)"]
  choice --> push["Push at the end"]
  push --> tail["Nothing in front of the new value slides"]
\`\`\`

## How it works

A TypeScript array is one contiguous block. The runtime keeps the address of element 0, and element i lives at that address plus i times the width of one element. If a number occupies 8 bytes, element 10 is 80 bytes past the start. \`nums[i]\` is that fixed distance. The read adds the distance and loads the value.

Element 10 costs the same to read as element 0. A longer distance is still one addition, so the read stays O(1) as the length grows.

Insert or delete anywhere but the end shifts every later element. Values sit shoulder to shoulder, so a new value at index 2 pushes the old occupant and the whole tail one slot right. A delete pulls that tail one slot left. Near the front the tail is about n elements long, so the edit is O(n).

Push at the end is cheap on average because nothing in front slides. The new value takes the next free slot. When the block is full, that push copies every element into a larger block. Across many pushes those copies are rare, and the average cost per push stays constant.

This loop slides every old element one slot right so a new value can sit at index 0.

\`\`\`ts
const nums = [4, 8, 15, 16, 23, 42];
const index = 0;
const incoming = 7;
const value = nums[index];
const shifted: number[] = [];

for (let i = 0; i < nums.length; i = i + 1) {
  shifted[i + 1] = nums[i];
}

shifted[0] = incoming;
console.log(value, shifted);
\`\`\`

Fast index access argues for the array. You already know the slot, at index 0 or index 10,000. Fast rewiring once you already hold a spot argues for a linked list. You already hold a node, and you change a pointer while the other nodes stay put. A contiguous list is this packed block.

## A numeric example

Take \`[4, 8, 15, 16, 23, 42]\`, length 6. Index 0 loads 4, index 4 loads 23, and index 5 loads 42. Each read is one jump. Leave 23 at index 4 inside an array of 6,000 numbers and that read is still one jump.

Insert 7 at index 2 and the array you want is \`[4, 8, 7, 15, 16, 23, 42]\`. The values 15, 16, 23, and 42 move, which is 4 writes, then 7 fills the opened slot. Insert 7 at index 0 and all 6 existing values move. Push 7 at index 6, the current end, and nothing already stored moves. The tail length is the whole difference.

## Cost

An index read is O(1) time and O(1) extra space. Insert or delete before the end is O(n) time. An in-place shift uses O(1) extra space, and a fresh copy uses O(n) extra space. Push at the end is O(1) time on average. One growth copy is O(n) time for that call. A scan that keeps a running total is O(n) time and O(1) extra space.

| Operation | Time | Extra space |
| --- | --- | --- |
| Read \`nums[i]\` | O(1) | O(1) |
| Push at the end | O(1) on average | O(1) aside from a rare growth copy |
| Insert or delete before the end | O(n) | O(1) if you shift in place |
| Copy into a new array | O(n) | O(n) |

## In the course

The Arrays lesson in Foundations starts from this layout. A TypeScript array is a contiguous list, \`nums[i]\` is a jump, and a middle edit slides the tail. The exercise is a left rotation into a new array: the same values change indexes, so the block is rewritten. Linked lists come later. Walking to the 10th node is O(n). Rewiring a node you already hold is O(1). Indexes stay on the array. A splice at a node you hold matches the list.

## Common mistakes

You treat every array edit as O(1). The fast operation is the index read, and push at the end on average. \`unshift\` and a middle \`splice\` move the tail. A loop of front inserts on a long array is a loop of linear slides, which is quadratic overall.

You call every push a guaranteed single write. Most pushes write one spare slot. The push that finds a full block copies. Cheap on average is the phrase that matches the runtime.

You switch to a linked list because some insert exists, then you walk from the head for every lookup. Match the layout to the operation you repeat. You also expect element 10 to cost more than element 0 because it sits further along. The distance is larger. The work is still one address calculation.

## When to use it

Use a contiguous array when you read and write by index, when you scan left to right, and when you add or remove at the end. A rotation, a pair of ends, or a window of neighbours all buy the jump.

## When not to

Use a linked list when you repeat an insert or delete at a spot you already hold and the sequence is long. Pointer rewiring is a constant amount of writing. Removing index 0 on every step slides everybody else, which is why a queue gets its own structure later and why \`shift\` on an array is a tail move.

## FAQ

### Why does element 10 cost the same to read as element 0?

Both reads add a fixed distance to the address of element 0 and load one value. The distance for element 10 is larger, and the addition is still one calculation. A longer array makes larger indexes legal. It leaves the read at O(1).

### Why is a middle insert O(n) when you only wrote one new value?

The new value is one write. Every later value also moves, or two values would claim one slot. On an array of length 1,000, an insert at index 0 moves 1,000 existing values. Those moves are the O(n) cost.

### Is push at the end always a single write?

On average, yes. Most pushes write one new slot, and nothing in front slides. A push into a full block copies the current values first, and that copy is linear. Over a long run of pushes the copies average out to a constant amount of work per push.

## Related

[How Do You Rotate an Array Left? Remainder and Cost](/articles/rotating-an-array) and [What Is a Linked List? Pointers Instead of Indexes](/articles/linked-lists)
    `,
  ),
  defineArticle(
    "rotating-an-array",
    "How Do You Rotate an Array Left? Remainder and Cost",
    "Arrays",
    "Rotating an array left moves the front to the back. A full turn does nothing, so only the remainder after dividing the steps by the length matters, and the clear solution is one O(n) pass into a new array.",
    ["Rotating left", "rotated left"],
    `
Rotating an array left moves the front to the back, so \`[1, 2, 3, 4]\` rotated left by 1 is \`[2, 3, 4, 1]\`. A full turn whose size equals the length puts every value back, so only the remainder after you divide the steps by the length changes an index. The clear solution writes each value into a new array at its new index, in one O(n) pass, and leaves the input unchanged.

\`\`\`mermaid
flowchart TD
  steps["steps can exceed the length"]
  steps --> remain["Keep steps modulo length"]
  remain --> check{"Is the remainder 0?"}
  check -->|"Yes"| same["Each value stays at its own index"]
  check -->|"No"| place["Write each value at its new index"]
  place --> built["One O(n) pass into a new array"]
\`\`\`

## How it works

One left step takes the value at index 0 and gives it the last slot. Every other value moves one slot toward the front. In \`[1, 2, 3, 4]\` the 1 falls off the front and returns on the right.

Steps can exceed the length. Rotating by the length itself restores the array, because every value completes a lap and lands on its old index. Only the remainder matters: steps modulo length, called \`stepsMod\`. Five steps on a length of 4 match one step, because 5 modulo 4 is 1. Four or zero steps leave every value in place, because those amounts modulo 4 are 0.

An empty array stays empty. The length is 0, so you return an empty array before any division. There is no value to move.

For a non-empty array the new index of i is \`(i - stepsMod + length) % length\`. Equivalently, take the tail starting at \`stepsMod\` and then the head. The tail becomes the new front. The head belongs at the back.

The clear solution allocates a new array and writes each value at its new index. One walk from 0 through length - 1 is one O(n) pass, and it does not mutate the input. In-place reversal tricks exist. You do not need them to understand the movement. The movement is the destination the formula names.

The loop is that placement for \`[1, 2, 3, 4]\` with \`stepsMod\` already 1.

\`\`\`ts
const nums = [1, 2, 3, 4];
const stepsMod = 1;
const rotated: number[] = [];

for (let i = 0; i < nums.length; i = i + 1) {
  const destination = (i - stepsMod + nums.length) % nums.length;
  rotated[destination] = nums[i];
}
\`\`\`

Reducing steps, and returning early when the length is 0, sit beside this loop in the exercise.

## A numeric example

\`[1, 2, 3, 4]\` has length 4 and one left step, so \`stepsMod\` is 1. Index 0 holds 1 and moves to \`(0 - 1 + 4) % 4\`, which is 3. Index 1 holds 2 and moves to \`(1 - 1 + 4) % 4\`, which is 0. Index 2 holds 3 and moves to 1. Index 3 holds 4 and moves to 2. The new array is \`[2, 3, 4, 1]\`. The tail starting at index 1 is \`[2, 3, 4]\`, then the head \`[1]\`.

Five steps use 5 modulo 4, which is 1, so the destinations stay the same. Four steps use remainder 0, each value stays at i, and the array is restored.

\`[1, 2, 3]\` rotated left by 4 uses 4 modulo 3, which is 1. Value 1 goes to index 2, value 2 goes to index 0, and value 3 goes to index 1. The new array is \`[2, 3, 1]\`. Zero steps on \`[8, 9]\` has remainder 0, so the new array is \`[8, 9]\` and the input was never written. An empty input with 3 steps stays empty.

JavaScript evaluates \`(0 - 1) % 4\` as -1. \`(0 - 1 + 4) % 4\` is 3, the last slot. The added length keeps every destination inside 0 through length - 1.

## Cost

The clear solution is O(n) time and O(n) extra space: one visit per index, and a new array of n values. The input stays untouched. Remainder 0 is the same O(n) copy. An empty array is O(1) time and O(1) extra space. In-place reversal tricks are O(n) time and O(1) extra space, and they change the input.

| Case | Time | Extra space |
| --- | --- | --- |
| New array, one pass | O(n) | O(n) |
| Remainder 0, still copying | O(n) | O(n) |
| Empty input | O(1) | O(1) |
| In-place reversal | O(n) | O(1), and the input changes |

## In the course

The Arrays lesson uses rotation so a contiguous block feels like movement. \`rotateLeft([1, 2, 3, 4], 1)\` returns \`[2, 3, 4, 1]\`. Steps may be larger than the array. You return a new array and you do not mutate the input. You reduce steps, skip division when the length is 0, and write each value once.

## Common mistakes

You loop a single step \`steps\` times and skip the remainder. Ten thousand steps on a length of 4 is ten thousand slides. After the modulo, one pass still touches each element once.

You mutate \`nums\` and return it. Write into a new array so the caller's row stays as it was passed.

You use \`(i - stepsMod) % length\` and keep a negative index. In JavaScript that remainder can be -1. Add the length first. On the four-element example, index 0 must land at index 3 with the value 1. Placing the head before the tail keeps 1 in front. The left rotation wants the tail first: \`[2, 3, 4, 1]\`.

## When to use it

Use a left rotation when the front moves to the back, relative order otherwise stays, and a new array is allowed. Take the remainder whenever steps can exceed the length. One pass with \`(i - stepsMod + length) % length\` is the clear solution.

## When not to

Use another rule when the new order is a sort, a filter, or a full reversal. Avoid a loop of single-step slides when steps is large. Leave in-place reversals until each destination is already clear. The extra array keeps the index arithmetic visible.

## FAQ

### What do you do when steps is larger than the length?

You replace steps with steps modulo length, once the length is positive. Rotating by the length restores the array, so extra full turns drop out. \`[1, 2, 3, 4]\` rotated left by 5 uses remainder 1 and becomes \`[2, 3, 4, 1]\`.

### Why does the new-index formula add the length?

Subtracting \`stepsMod\` from i can go negative. JavaScript keeps that sign, so \`(0 - 1) % 4\` is -1. Adding the length first maps index 0 to index 3 on a length of 4, and the value 1 sits at the back.

### Do you need an in-place rotation to understand this?

A new array of length n, filled in one pass, shows each destination, and full turns cancel. In-place reversal tricks exist. You do not need them to understand the movement, and the exercise leaves the input unmutated.

## Related

[What Is a Contiguous Array? Index Jumps and Shifts](/articles/contiguous-arrays) and [What Is the Two-Pointer Technique on a Sorted Array?](/articles/two-pointers)
    `,
  ),
  defineArticle(
    "two-pointers",
    "What Is the Two-Pointer Technique on a Sorted Array?",
    "Arrays",
    "Two pointers are two indices on one array, and a rule that moves exactly one of them. On sorted data the walk is linear, which is how sorted squares stay O(n) instead of sorting again.",
    ["two pointers", "two-pointer"],
    `
Two pointers are two indices on one array, and a rule that moves exactly one of them on each step. On sorted data the ends know something the middle has not told you, so each move discards a value you are finished with and the walk stays linear. Sorted squares use that walk: the next largest square is written from the back in O(n), where squaring and then sorting costs O(n log n).

\`\`\`mermaid
flowchart TD
  ends["Square the value at each end"]
  ends --> compare{"Which square is larger?"}
  compare -->|"Right"| writeRight["Write the right square and move right"]
  compare -->|"Left"| writeLeft["Write the left square and move left"]
  writeRight --> once["Move exactly one pointer"]
  writeLeft --> once
\`\`\`

## How it works

A left index and a right index start at the two ends. The rule looks at those two values and moves exactly one pointer inward. The other stays. The pointers together cross the array once. Constant work per step makes the walk O(n).

The pattern shows up when the array is sorted, or when the two ends know something the middle does not. On unsorted data the ends are only two positions.

Sorted squares start from a sorted array that may contain negatives. A sorted array of negatives and positives does not have sorted squares, because a large negative becomes a large positive. The square of -4 is 16 and the square of 3 is 9, so -4 belongs left of 3 in the input and 16 belongs right of 9 in the output. The biggest squares sit at the ends.

Square the ends and write the larger square at the back of the result. Move the pointer that produced it. Leave the other pointer, because that end can win the next comparison. Move exactly one pointer.

The snippet squares the two ends, 16 and 100, and stops.

\`\`\`ts
const nums = [-4, -1, 0, 3, 10];
const ends = [0, nums.length - 1];
const squares: number[] = [];

for (let i = 0; i < ends.length; i = i + 1) {
  const index = ends[i];
  squares[i] = nums[index] * nums[index];
}
\`\`\`

The result array is O(n) extra space. If the input were unsorted you would not have this trick, because a large square could sit in the middle. The sorted input is what makes the linear walk possible.

## A numeric example

Use \`[-4, -1, 0, 3, 10]\`. Left starts at index 0 and right at index 4. Square the ends: 16 and 100. Write 100 at the back and move the right pointer. Next compare 16 and 9, write 16, and move the left pointer. Then compare 1 and 9, write 9, and move the right pointer. Then compare 1 and 0, write 1, and move the left pointer. The last value is 0, and its square is 0. The result is \`[0, 1, 9, 16, 100]\`.

Each step is O(1). The pointers cross once, so the walk is O(n) time, with O(n) extra space for the result. \`[-7, -3, -1]\` writes 49, then 9, then 1. \`[1, 2, 3]\` finishes as \`[1, 4, 9]\`. Each step still moves exactly one pointer.

## Cost

One comparison and one pointer move are O(1) time and O(1) extra space. n such steps are O(n) time. The result holds n squares, so extra space is O(n). You can write into a result array and leave the input unchanged apart from reading it.

Sorting the squares is O(n log n) time. Unsorted input does not support the end comparison, so that cost includes the sort.

| Approach | Time | Extra space |
| --- | --- | --- |
| Two pointers, write from the back | O(n) | O(n) for the result |
| Square every value, then sort | O(n log n) | O(n) for the result, plus the sort |
| One comparison and one pointer move | O(1) | O(1) |

## In the course

The Two pointers lesson puts both indexes on one array. \`sortedSquares\` takes a non-decreasing \`nums\`, possibly with negatives, and returns the squares in non-decreasing order. Public examples are \`[-4, -1, 0, 3, 10]\` and \`[-7, -3, -1]\`. A single value and an already positive array are hidden checks. Squaring and sorting returns the right numbers at O(n log n). The lesson wants the linear walk from the ends.

## Common mistakes

You move both pointers after one comparison. After 16 loses to 100, 16 still has to beat 9. Move the winner only.

You fill the result from the front. The ends offer the largest remaining square, so you write at index n - 1 first. After the first step the last slot holds 100.

You compare -4 with 10 and treat the left side as the small side. Compare the squares, 16 and 100. On unsorted input such as \`[10, -4, 0]\` the ends no longer hold the large squares. Sort first, or square and sort. The linear walk needs the sorted array.

## When to use it

Use two pointers when the array is sorted, or when the two ends are enough to decide which end to discard. Sorted squares are the Foundations case. A pair with a target sum on a sorted array moves one side for the same reason: that index is finished.

## When not to

Leave the technique when the array is unsorted and the ends do not summarise the middle. Leave it for a sum over every contiguous block, which is a sliding window. Leave it when one step would move both indexes, because that drop skips a value you have not written.

## FAQ

### Why are the squares of a sorted array unsorted?

Large negatives sit on the left and large positives sit on the right. Squaring turns a large negative into a large positive. \`[-4, -1, 0, 3, 10]\` squares in that order to \`[16, 1, 0, 9, 100]\`. The biggest squares sit at the ends, so the pointers start there.

### Why do you move exactly one pointer?

The comparison has one winner. You write it and advance that pointer. The other end can still be the next largest square. In the example, 16 loses to 100 and then beats 9. Moving both pointers would drop 16 before you wrote it.

### What does sorting the squares cost?

Squaring n values is O(n), and sorting them is O(n log n). The two-pointer walk is O(n) time and O(n) extra space for the result. If the input were unsorted you would not have this trick, and the sort would be the straightforward cost.

## Related

[What Is a Sliding Window? Fixed and Variable Subarrays](/articles/sliding-windows) and [What Is Binary Search? Throw Away Half of a Sorted Array](/articles/binary-search)
    `,
  ),
  defineArticle(
    "sliding-windows",
    "What Is a Sliding Window? Fixed and Variable Subarrays",
    "Arrays",
    "A sliding window is a subarray you keep as you walk forward, updating the previous slice instead of rebuilding it. A fixed window of k elements becomes an O(n) scan once the first sum exists.",
    ["sliding window", "subarray"],
    `
A sliding window is a subarray you keep as you walk forward, so the next slice reuses the previous one. You subtract the element that left and add the element that entered. A fixed window of k elements needs one full sum at the start, and after that each move is O(1), so the scan for the best window is O(n).

\`\`\`mermaid
flowchart TD
  first["Sum the first k elements"]
  first --> step["Step one index forward"]
  step --> drop["Subtract the element that left"]
  drop --> add["Add the element that entered"]
  add --> best["Keep the largest sum"]
\`\`\`

## How it works

A subarray is a contiguous slice: neighbours, with no gaps. A fixed window always holds k elements. A variable window grows and shrinks, and the length is part of the answer.

Start with the maximum sum of any k consecutive elements. Re-summing each block repeats additions, because neighbouring windows share k - 1 values. Once the first sum exists, the next window is the old sum, minus the element that left, plus the element that entered. That update is O(1), once per later element, so the scan is O(n). The width stays k.

If k is larger than the array, there is no valid fixed window. Fewer than k elements cannot supply k consecutive ones.

A variable window finds the shortest subarray whose sum is at least a target. One pointer grows by taking the next element on the right. The other shrinks by dropping the left element while the sum still meets the target. You keep the smallest width that qualified. Both pointers move forward only, so each index enters once and leaves once. The scan stays O(n).

\`\`\`ts
const nums = [2, 1, 5, 1, 3, 2];
const k = 3;
let window = 0;

for (let i = 0; i < k; i = i + 1) {
  window = window + nums[i];
}

const next = window - nums[0] + nums[k];
\`\`\`

\`window\` is 8 and \`next\` is 7.

## A numeric example

Take \`[2, 1, 5, 1, 3, 2]\` with k = 3. Indexes 0 through 2 sum to \`2 + 1 + 5 = 8\`. Drop 2 and add 1: \`8 - 2 + 1 = 7\`. Drop 1 and add 3: \`7 - 1 + 3 = 9\`. Drop 5 and add 2: \`9 - 5 + 2 = 6\`. The maximum is 9.

Rebuilding every block adds 12 numbers on this input. For n = 1,000 and k = 100, rebuilding is on the order of 90,000 additions, which is O(n * k). The update is about 1,000 steps, which is O(n) time and O(1) extra space.

If k is 7, only 6 elements exist. There is no valid fixed window, and you return 0.

On \`[1, 2, 3, 4]\` with target 6, the window grows to \`[1, 2, 3]\`, sum 6, width 3. Add 4 and the sum is 10. Drop 1 and \`[2, 3, 4]\` is 9. Drop 2 and \`[3, 4]\` is 7, width 2. Drop 3 and the sum is 4, which misses the target, so you stop. The shortest width is 2.

## Cost

The fixed window is O(n) time and O(1) extra space. Re-summing each block is O(n * k) time and O(1) extra space.

A variable window whose pointers only move forward is O(n) time and O(1) extra space. When k is larger than the array, you stop in O(1) time and O(1) extra space, because there is no first window.

| Approach | Time | Extra space |
| --- | --- | --- |
| First sum, then O(1) updates | O(n) | O(1) |
| Re-sum each block of k | O(n * k) | O(1) |
| Variable window, both ends move forward | O(n) | O(1) |
| k larger than the array | O(1) | O(1) |

## In the course

The Sliding window lesson starts with the fixed window. \`maxWindowSum\` returns the maximum sum of k consecutive elements. \`[2, 1, 5, 1, 3, 2]\` with k = 3 returns 9. If k is less than 1, or k is greater than the length, you return 0. An empty array returns 0. The lesson names the variable window and keeps the exercise on a fixed k. A queue, the first-in first-out line, drops its oldest element from the same end. On an array that drop is an index plus a subtraction, in O(1) extra space.

## Common mistakes

You re-sum every window and still find 9, at O(n * k). Once the first sum exists, the next sum is an edit. After \`[2, 1, 5]\` the element that leaves is 2. Subtract 5 and the running total misses 7, the real second window.

The last valid start index is length - k. On length 6 and k = 3, that start is 3. A later start reads off the end. When k is larger than the array there is no valid fixed window, and the exercise wants 0. A variable window stays linear only while the left pointer moves forward. Moving it backward revisits elements.

## When to use it

Use a fixed window for the best contiguous block of a known width k. Build the first sum, then update it in O(1). Use a variable window when the width is the unknown and you want the shortest subarray whose sum is at least a target. Grow on the right, shrink on the left, and move both pointers only forward.

## When not to

Leave the window when gaps are allowed. A subsequence has no single element that left the slice. Leave it when k is larger than the array: there is no valid fixed window, and reading the first k indexes walks off the end. Leave the fixed-width update when the width changes during the search. That search wants the variable pair of pointers on one contiguous slice.

## FAQ

### Why is the update O(1) after the first window?

The next window shares k - 1 elements with the current one, and that shared part is already in the sum. You subtract the element that left and add the element that entered. On the lesson numbers, 8 becomes 7 by subtracting 2 and adding 1. Those two operations stay two operations when k grows.

### What do you do when k is larger than the array?

You stop. k consecutive elements cannot fit. For \`[4, 2]\` and k = 3 there is no valid fixed window. The exercise returns 0, including an empty array or a k below 1. Check that before the first sum.

### How is a variable window different from a fixed one?

A fixed window keeps width k and only slides. A variable window changes width: one pointer grows it until the sum reaches the target, and the other shrinks it while the sum still qualifies. You record the shortest legal slice. Both pointers move forward only, so the scan is O(n) and the extra space is O(1).

## Related

[What Is the Two-Pointer Technique on a Sorted Array?](/articles/two-pointers) and [What Is a Queue? FIFO Order, Enqueue, and Dequeue](/articles/queues)
    `,
  ),
];

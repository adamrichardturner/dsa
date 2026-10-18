const explain = (
  before: string,
  idea: string,
  chart: string,
  code: string,
  approach: string,
  mistakes: readonly string[],
): string => {
  const lines = [
    "## Before you start",
    "",
    before,
    "",
    "## The simple idea",
    "",
    idea,
    "",
    "```mermaid",
    chart.trim(),
    "```",
    "",
    "This small function is the shape of the lesson. Read it once, then change the comparison so it matches the exercise in front of you.",
    "",
    "```ts",
    code.trim(),
    "```",
    "",
    "## How to approach the task",
    "",
    approach,
    "",
    "## Common mistakes",
    "",
  ];

  for (const mistake of mistakes) {
    lines.push(`- ${mistake}`);
  }

  return lines.join("\n").trim();
};

export const stepBitesize = {
  pairCost: explain(
    "A pair is two positions in the same array, with the left position strictly before the right one. The input size is still n, the number of values. Quadratic means the work grows like n times n, because each value is compared with the values that follow it.",
    "One loop draws a line. A loop inside a loop draws a triangle of pairs. You do not need a formula to see it. Point at the indentation. If the inner loop starts at the outer index plus one, each pair is visited once.",
    `flowchart LR
  values["n values"] --> outer["Outer index i"]
  outer --> inner["Inner index j, starting at i + 1"]
  inner --> pair["One pair, then the next"]`,
    `export function countLater(nums: number[]): number {
  let count = 0;
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = i + 1; j < nums.length; j += 1) {
      count += 1;
    }
  }
  return count;
}`,
    "Write the outer index from the left. Start the inner index one step to its right. Count the pair only when the comparison in the prompt is true. Say O(n²) out loud when the tests pass. An empty array never enters the outer loop, so the count stays 0.",
    [
      "Starting the inner loop at 0 counts each pair twice and also pairs a value with itself.",
      "A closed formula can match the tests and hide the loops this lesson wants you to see.",
      "Two loops written one after another are still linear. The quadratic cost is the nesting.",
    ],
  ),
  arrayShifts: explain(
    "An array stores values in neighbouring slots. An index is a jump, so reading one slot stays cheap as the array grows. Inserting or deleting before the end has to slide the tail, and that slide is the work.",
    "Build a new array. Copy the values that stay, and skip or add the one value the prompt names. The input array stays as it was. The new array is the whole answer, so the copy is O(n) time and O(n) extra space.",
    `flowchart LR
  source["[A, B, C, D]"] --> skip["Skip B"]
  skip --> copy["[A, C, D]"]`,
    `export function withoutFirst(nums: number[]): number[] {
  const next: number[] = [];
  for (let index = 1; index < nums.length; index += 1) {
    const value = nums[index];
    if (value === undefined) {
      continue;
    }
    next.push(value);
  }
  return next;
}`,
    "Walk the indexes once. When the index matches the edit point, either skip that value or write the new value before copying the old one. If the index is past the end, a removal copies everything and an insertion writes the new value after the loop.",
    [
      "Mutating the input with splice changes the caller's array. These exercises want a new array.",
      "An off-by-one writes the new value one slot early or drops the value that should have stayed.",
      "Forgetting the tail after the edit point returns only the head.",
    ],
  ),
  frequencyCounts: explain(
    "A frequency count maps each value to how many times it has been seen. The key is the value. The stored number is the count. Updating that number is the whole pass.",
    "Start the counts empty. For each value, add one to its count. The most frequent value is the key whose count is largest. On a tie, keep the value whose first index is smaller, which is the one that appears earlier in the array.",
    `flowchart LR
  scan["Read the next value"] --> bump["Add one to its count"]
  bump --> best["Replace the winner only on a stricter rule"]`,
    `export function tally(nums: number[], target: number): number {
  let count = 0;
  for (const value of nums) {
    if (value === target) {
      count += 1;
    }
  }
  return count;
}`,
    "Use a plain object or a Map. If you only need one target, a counter is enough and a map is still a fair way to practice the shape. For the winner, remember both the best count and the first index of that value. Replace the winner when the new count is greater, or when the counts match and the new value starts earlier.",
    [
      "Replacing the winner on an equal count picks the later value and fails the tie rule.",
      "String keys and number keys are different. Be consistent when you store the value.",
      "A nested loop that recounts from scratch is correct and hides the map.",
    ],
  ),
  inwardScan: explain(
    "Inward pointers are two indexes on one array. One starts at the left, the other at the right, and a rule moves exactly one of them toward the middle.",
    "A palindrome asks whether the ends match. Move both when they do. A sorted pair sum asks whether the ends add up to the target. Move the left pointer when the sum is too small, and the right pointer when the sum is too large. The sorted order is what makes that move safe.",
    `flowchart LR
  left["Left index"] --> compare["Compare the ends"]
  right["Right index"] --> compare
  compare --> move["Move exactly one pointer, or both on a match"]`,
    `export function endsMatch(nums: number[]): boolean {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    if (nums[left] !== nums[right]) {
      return false;
    }
    left += 1;
    right -= 1;
  }
  return true;
}`,
    "Stop when the pointers meet or cross. A one-element array and an empty array are palindromes because the loop never finds a mismatch. For indexes, return them in ascending order, and return [-1, -1] when the pointers cross without a match.",
    [
      "Moving both pointers on a sum that is only too small skips the pair that would have worked.",
      "Using the same element twice, when left === right, is not a pair of different indexes.",
      "The sum rule is wrong on unsorted data. Sort first or do not use this walk.",
    ],
  ),
  variableWindow: explain(
    "A variable window is a contiguous slice whose length changes. The right edge grows one step at a time. The left edge moves forward only while the slice is too big for the question. These exercises use zeros and positive numbers, so a larger slice has a larger or equal sum.",
    "Keep a running sum. Add the value that enters on the right. While the sum breaks the rule, subtract the value on the left and move the left edge. The left edge never moves backward, so each index enters once and leaves once.",
    `flowchart LR
  grow["Add nums at right"] --> check{"Sum still inside the rule?"}
  check -->|no| shrink["Subtract nums at left and move left"]
  check -->|yes| record["Record the length"]
  shrink --> check`,
    `export function windowSum(nums: number[], start: number, end: number): number {
  let sum = 0;
  for (let index = start; index <= end; index += 1) {
    sum += nums[index] ?? 0;
  }
  return sum;
}`,
    "For the shortest slice at or above the target, record the length whenever the sum qualifies, then shrink. For the longest slice at or below the target, shrink until the sum fits, then record. If nothing qualifies, the answer stays 0.",
    [
      "Moving the left pointer backward revisits values and can turn the scan into quadratic work.",
      "Recording a length before the sum qualifies reports a slice that fails the test.",
      "Negative numbers break the 'shrink fixes the sum' story. These exercises do not include them.",
    ],
  ),
  listWalks: explain(
    "A linked list stores a value and a next node. You cannot jump to an index. A second pointer is how you measure a distance without a length field. The starter builds the nodes from an array so the tests can stay small.",
    "For the middle, move a slow pointer one step and a fast pointer two steps. When the fast pointer cannot take another full step, the slow pointer is on the middle you want. For the nth from the end, give the fast pointer a head start of n steps, then move both one step at a time.",
    `flowchart LR
  fast["Fast pointer, head start"] --> step["Both move one node"]
  slow["Slow pointer"] --> step
  step --> answer["Slow pointer is the node you want"]`,
    `export function lengthOf(head: { next: { next: null } | null } | null): number {
  let count = 0;
  let current = head;
  while (current !== null) {
    count += 1;
    current = current.next;
  }
  return count;
}`,
    "Build the list with the helper already in the file. Walk next. If the fast pointer falls off before it finishes the head start, n is too large and the answer is -1. An empty list has no middle.",
    [
      "Reading values[length - n] uses the array and skips the pointers.",
      "A head start of n - 1 or n + 1 returns the neighbour of the node you wanted.",
      "On an even length, stopping on the first middle fails the second-middle rule.",
    ],
  ),
  stackMemory: explain(
    "A stack only touches the most recently added item. Push stores a fact you are not done with. Pop closes that fact when a later character or value resolves it. An array used only at its end is a stack.",
    "A backspace pops the last kept character, and does nothing when the stack is empty. The next greater value keeps indexes whose answers are still unknown. When the new value is strictly greater than the value at the top index, that waiting index is resolved. Pop it and record the new value.",
    `flowchart LR
  next["Next value"] --> top{"Greater than the stack top?"}
  top -->|yes| pop["Pop and record the answer"]
  top -->|no| push["Push this index"]
  pop --> top`,
    `export function keptLetters(value: string): string {
  const stack: string[] = [];
  for (const character of value) {
    if (character === "#") {
      stack.pop();
      continue;
    }
    stack.push(character);
  }
  return stack.join("");
}`,
    "Fill the answer array with -1 first for the next-greater exercise, then overwrite the indexes you resolve. After the scan, anything still on the stack has no greater value to its right. Join the stack at the end of the backspace exercise. Do not pop an empty stack and then read it.",
    [
      "Popping before you check the empty stack makes the next push read undefined.",
      "Using >= instead of > treats an equal neighbour as the next greater value.",
      "Recording the index instead of the value answers a different question.",
    ],
  ),
  queueLines: explain(
    "A queue is first in, first out. Values join at the back and leave from the front. A deque allows you to drop from the back as well, which is what the sliding maximum needs. In these exercises an array can show the behaviour.",
    "The negative count is a fixed window with a counter. Add one when a negative enters and subtract one when a negative leaves. The sliding maximum keeps indexes in decreasing order of their values. Drop the back while it is smaller than the new value. The front is the max. Drop the front when its index falls out of the window.",
    `flowchart LR
  enter["New index enters"] --> dropBack["Drop smaller indexes from the back"]
  dropBack --> front["Front index is the current max"]
  front --> leave["Drop the front when it leaves the window"]`,
    `export function firstWindowMax(nums: number[], k: number): number {
  let best = nums[0] ?? 0;
  const last = Math.min(k, nums.length);
  for (let index = 1; index < last; index += 1) {
    const value = nums[index] ?? best;
    if (value > best) {
      best = value;
    }
  }
  return best;
}`,
    "If k does not fit in the array, return an empty list before you scan. For the counts, update the counter before you record a finished window. For the maximum, record the front only once the window has k elements.",
    [
      "Forgetting to drop the front index keeps a maximum that has already left the window.",
      "Leaving smaller values behind the new maximum makes the front stale.",
      "Array.shift on every step is allowed here and is O(n) per drop. Name that cost if you use it.",
    ],
  ),
  twoCalls: explain(
    "A recursive call has to be a smaller copy of the same problem, and one call has to stop without calling again. That stop is the base case. Two calls from the same frame are how a problem splits in half, or into the two previous sizes.",
    "Fibonacci of n is the sum of the two smaller Fibonacci numbers, and the first two values are both 1 in this lesson's version. Nested depth is 0 for a number and 1 plus the deeper child for an array. The empty array is a real level, so its depth is 1.",
    `flowchart TD
  fib5["fib of 5"] --> fib4["fib of 4"]
  fib5 --> fib3["fib of 3"]
  fib4 --> again["fib of 3, computed again"]`,
    `export function smaller(n: number): number {
  if (n <= 2) {
    return 1;
  }
  return smaller(n - 1) + smaller(n - 2);
}`,
    "Write the base case before the recursive line. For depth, handle a number before you loop over children. The overlap in Fibonacci is real. Leave it for the dynamic programming week. A correct exponential function is enough here.",
    [
      "Forgetting the base case overflows the call stack.",
      "Treating an empty array as depth 0 misses the array level the tests count.",
      "Adding the two child depths together measures width, not depth.",
    ],
  ),
  searchBounds: explain(
    "Binary search throws away half of a sorted array on each comparison. With duplicates, finding one match is not the same as finding the first or the last match. The range lo to hi, inclusive, is the invariant: if an answer exists, it is still inside that range.",
    "When the middle value is too small, move lo to mid + 1. When it is too large, move hi to mid - 1. When it matches, save the index, then keep searching. Left for the first match. Right for the last match. An empty range, lo greater than hi, means you are done.",
    `flowchart TD
  range["lo to hi still inclusive"] --> mid["Read the middle"]
  mid --> match{"Equal to the target?"}
  match -->|yes, want the first| left["Save mid and set hi to mid - 1"]
  match -->|yes, want the last| right["Save mid and set lo to mid + 1"]
  match -->|no| discard["Discard the half that cannot hold it"]`,
    `export function stillInside(lo: number, hi: number): boolean {
  return lo <= hi;
}`,
    "Initialise the saved index to -1. Only replace it when you see the target. Use the safe middle, lo plus half the distance to hi. Return the saved index after the loop. Do not return mid immediately, or you stop on a middle duplicate.",
    [
      "Setting hi to mid, instead of mid - 1, can leave the range unchanged and loop.",
      "Searching the wrong direction after a match returns the other end of the duplicate run.",
      "Binary search on unsorted data is not almost right. The discarded half may hold the target.",
    ],
  ),
  sortChoices: explain(
    "A sorted array has each value less than or equal to the next one. Checking that is one pass. Producing that order is a different cost. Bubble sort swaps neighbours. Merge sort, from the previous lesson, merges a sorted run from each half.",
    "Bubble sort walks the array and swaps when a left neighbour is greater than the right one. After enough passes, or after a pass with no swaps, the copy is sorted. It is O(n²). Implement it so the swaps are visible, then prefer the O(n log n) merge when you have a choice.",
    `flowchart LR
  pair["Two neighbours"] --> wrong{"Left greater than right?"}
  wrong -->|yes| swap["Swap them"]
  wrong -->|no| next["Look at the next pair"]
  swap --> next`,
    `export function neighbourSwap(nums: number[]): number[] {
  const copy = nums.slice();
  const left = copy[0];
  const right = copy[1];
  if (left !== undefined && right !== undefined && left > right) {
    copy[0] = right;
    copy[1] = left;
  }
  return copy;
}`,
    "Copy the input first. Compare numbers with a numeric comparison, not string order. The is-sorted scan returns false at the first descent. An empty array is sorted because there is no descent to find.",
    [
      "Calling the built-in sort skips the swaps and fails the exercise that disallows it.",
      "Sorting the input in place surprises a caller who still holds the original array.",
      "A string comparison orders 10 before 2. These exercises want numeric order.",
    ],
  ),
  treeCounts: explain(
    "A tree has one root and no cycles. A leaf is a node with no children. The input list is level order, and null means a missing child. buildTree turns that list into nodes with left and right.",
    "An empty tree has no leaves and sums to 0. A leaf contributes 1 to the count and its value to the sum. Any other node adds what its children return. Add the node value only in the sum. Do not add the two depths. This question is a total, not a longest path.",
    `flowchart TD
  node["Current node"] --> leaf{"Any children?"}
  leaf -->|no| one["Count 1, or add the value"]
  leaf -->|yes| both["Add the left result and the right result"]`,
    `export function emptySum(root: { value: number; left: null; right: null } | null): number {
  if (root === null) {
    return 0;
  }
  return root.value;
}`,
    "Call buildTree first. Write a helper that accepts a node or null. The null case returns 0. The leaf case is the node whose left and right are both null. Then trust the two recursive calls.",
    [
      "Counting null children as leaves inflates the answer.",
      "Returning the node value from the leaf count mixes the two exercises.",
      "Forgetting one child drops a whole branch from the total.",
    ],
  ),
  bstShape: explain(
    "A binary search tree keeps smaller values on the left and larger values on the right. Search cost follows the height. Height here counts nodes on the longest path, the same rule as tree depth. A balanced tree stays near log n. Inserting sorted values makes a line.",
    "Insert walks left or right and hangs the new node on the first empty side. Then the height is 0 for null and 1 plus the taller child otherwise. A sorted insert of three values has height 3. An insert that places the middle value first has height 2.",
    `flowchart TD
  root["2"] --> left["1"]
  root --> right["3"]
  spine["1"] --> only["2"]
  only --> endNode["3"]`,
    `export function heightOf(root: { left: null; right: null } | null): number {
  if (root === null) {
    return 0;
  }
  return 1;
}`,
    "Insert in the given order. Do not sort first, or you hide the spine the lesson wants you to measure. Search is the same walk: left when the target is smaller, right when it is larger, and false at null. Duplicates are not in these tests.",
    [
      "Sorting before insert balances the values and reports the wrong height.",
      "Counting edges instead of nodes makes a single node look like height 0.",
      "Scanning the array with includes builds no tree.",
    ],
  ),
  heapLayout: explain(
    "A binary heap is a complete tree stored in an array. Complete means every level is full except possibly the last, which is filled from the left. Because of that shape, a child index is arithmetic. There is no left pointer.",
    "Index 0 is the root and has no parent. For any later index i, the parent is the floor of (i - 1) / 2. The left child is 2 * i + 1. The right child is 2 * i + 2. Those child indexes can fall past the end of a short array. This lesson asks for the formula anyway.",
    `flowchart TD
  i0["index 0"] --> i1["index 1, left"]
  i0 --> i2["index 2, right"]
  i1 --> i3["index 3"]
  i1 --> i4["index 4"]`,
    `export function leftChild(index: number): number {
  return 2 * index + 1;
}`,
    "Handle the root before the division. Return -1 for a parent of 0. Return a two-element array for the children, left then right. Check a drawing for index 1: parent 0, children 3 and 4.",
    [
      "Using 2 * i without the + 1 points at the parent again.",
      "Returning the child value instead of the child index answers a different question.",
      "Rejecting an index past the array length hides the formula the tests call on its own.",
    ],
  ),
  visitedWalks: explain(
    "A graph is vertices plus edges. This course uses undirected edges, so each pair is stored in both directions. A cycle means a search can return to a vertex. A visited set is the memory that stops that loop. Mark a vertex when you first enqueue it.",
    "Build an adjacency list, then walk from the start. The component size is the number of marks, including the start. Reaching everyone means that count equals the number of vertices you were given, from 0 up to but not including count. A start vertex with no edges is a component of one.",
    `flowchart LR
  start["Start vertex"] --> mark["Mark it visited"]
  mark --> neighbours["Enqueue unmarked neighbours"]
  neighbours --> mark`,
    `export function seenStart(start: number): Record<string, true> {
  return { [String(start)]: true };
}`,
    "One pass over the edges fills the lists. Use a queue or recursion. Count a vertex when you mark it, not when you see it as a neighbour for the second time. If count is 1 and there are no edges, the single vertex is already everyone.",
    [
      "Marking on dequeue lets the same neighbour sit in the queue many times.",
      "Storing the edge in only one direction makes an undirected graph look one-way.",
      "Forgetting to count the start reports 0 for an isolated vertex.",
    ],
  ),
  greedyChecks: explain(
    "A greedy algorithm takes a local option and does not undo it. It is safe when you cannot name a case where a patient choice would have done better. Interval scheduling is safe if you sort half-open intervals by finishing time. A half-open interval includes the start and excludes the end, so touching intervals do not overlap.",
    "The earliest finish is that first choice on its own. Scan the intervals and keep the one with the smallest end. Break a tie by the smaller start. Jump game is a different rule: track the farthest index you can reach. If your current index is beyond that reach, you cannot get there.",
    `flowchart LR
  far["Farthest reach so far"] --> here["Current index"]
  here --> stuck{"Index past the reach?"}
  stuck -->|yes| noPath["Cannot reach the end"]
  stuck -->|no| extend["Extend the reach by the jump length"]`,
    `export function reachFrom(index: number, jump: number): number {
  return index + jump;
}`,
    "For the earliest finish, start with no candidate and replace it when the end is smaller, or when the ends match and the start is smaller. For jumps, a single element is already at the end. A zero that you cannot jump over blocks the rest.",
    [
      "Treating touching intervals as overlaps rejects a schedule the half-open rule allows.",
      "Updating the reach before you notice you are already stuck can skip past a zero.",
      "Sorting intervals by start time is the rule a long early meeting breaks.",
    ],
  ),
  orderMatters: explain(
    "Backtracking chooses, explores, then undoes. Subsets chose in or out, and order did not matter. A permutation chooses which unused value comes next, so [1, 2] and [2, 1] are different answers. The undo puts the value back into the pool for the next choice.",
    "Keep a path and a used flag for each index. When the path is long enough, copy it into the results. Copying matters. If you store the path array itself, the later pop empties every result that pointed at it. Ordered picks stop at length k instead of the full length.",
    `flowchart TD
  choice["Pick an unused value"] --> explore["Recurse"]
  explore --> undo["Unmark it and pop the path"]
  undo --> nextChoice["Try the next unused value"]`,
    `export function copyPath(path: number[]): number[] {
  return path.slice();
}`,
    "Loop the indexes from left to right so your order matches the tests. Skip a used index. Mark it, push the value, recurse, then pop and unmark. An empty input has one empty permutation. k stays within the length in these tests.",
    [
      "Pushing the path without copying makes every saved row change together.",
      "Forgetting the undo leaves the used flag set and drops later orderings.",
      "Sorting each row hides the order the exercise is asking for.",
    ],
  ),
  fillingTable: explain(
    "Tabulation writes answers from the base case upward. Memoisation caches a recursive call when the same state appears again. Both are dynamic programming. The loop is usually what you write once you trust the recurrence. Each cell should have a sentence: this number is the answer for this size.",
    "Fibonacci here uses fib(0) = 0 and fib(1) = 1. Each later value is the sum of the two before it. Two variables are enough. House robber either skips a house or takes it and skips the neighbour. The better of those two choices is the cell.",
    `flowchart LR
  base["Base cases"] --> next["Next cell is a combination of earlier cells"]
  next --> answer["The last cell is the answer"]`,
    `export function nextFib(previous: number, current: number): number {
  return previous + current;
}`,
    "Handle 0 and 1 before the loop. For houses, start from an empty street of 0. At each house, the next answer is the max of skipping it or taking it plus the answer from two houses back. Do not take two neighbours. An empty list returns 0.",
    [
      "Using the climbing-stairs base case, where the first two values are 1 and 2, fails fib(0).",
      "Taking every other house from the start misses a better pattern that begins on the second house.",
      "A recursive Fibonacci without a cache is correct and much slower. This lesson wants the loop.",
    ],
  ),
  sharedPrefixes: explain(
    "A trie is a tree of characters. Words that share a prefix share a path from the root. A count on each node says how many inserted words pass through that character. Lookup of a whole word was the previous lesson. This lesson asks what the shared path can tell you.",
    "Insert walks each character, creates a child when it is missing, and adds one to the node's count. The longest common prefix is the path where the count still equals the number of words. A prefix count for a query is the count where the query ends. A missing character means 0.",
    `flowchart LR
  root["root, every word"] --> c["c, three words"]
  c --> a["a, three words"]
  a --> t["t, one word"]
  a --> r["r, two words"]`,
    `export function emptyNode(): { children: Record<string, never>; count: number } {
  return { children: {}, count: 0 };
}`,
    "Give every node its own children object. An empty word list returns an empty prefix. An empty query counts every inserted word. Do not use Set or Map. A set of whole words cannot answer a prefix that was never inserted as its own word.",
    [
      "Sharing one children object between nodes mixes unrelated branches.",
      "Stopping only on a terminal flag misses a prefix that is not itself a stored word.",
      "Counting the root for a non-empty query reports every word instead of the branch.",
    ],
  ),
} as const;

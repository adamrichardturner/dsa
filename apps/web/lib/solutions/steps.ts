import type { LessonSolution, SolutionBlock } from "@/lib/solutions/types";

const blocks = (slug: string, text: string): LessonSolution => {
  const body: readonly SolutionBlock[] = [
    { kind: "heading", text: "How to solve this exercise" },
    { kind: "paragraph", text },
    {
      kind: "paragraph",
      text: "The code below is the reference for the exercise you have open. Read the walk once, then compare it with what you wrote.",
    },
    { kind: "code" },
  ];
  return { slug, blocks: body };
};

export const stepSolutions: readonly LessonSolution[] = [
  blocks(
    "pair-cost",
    "Count pairs with i strictly before j. Start the inner loop at i + 1 so a value is not paired with itself and each pair is seen once. Ascending pairs need a strictly smaller left value. Equal pairs need the same value. Both walks are quadratic. Say that out loud after they pass.",
  ),
  blocks(
    "array-shifts",
    "Build a new array and leave the input alone. Removal copies every index except the one you were asked to drop. Insertion writes the new value when the cursor reaches the index, then copies the old value. An index past the end removes nothing and inserts at the end.",
  ),
  blocks(
    "frequency-counts",
    "One pass stores a count for each value. The frequency of a target is that count, or zero when the key is missing. The most frequent value replaces your winner only when the new count is greater, or when the counts match and the new value appears earlier in the array.",
  ),
  blocks(
    "inward-scan",
    "Start at the two ends. A palindrome moves both ends inward while they match, and returns false at the first mismatch. A sorted pair sum moves the left end when the total is too small and the right end when it is too large. Return the indexes in ascending order, or [-1, -1] when the ends cross.",
  ),
  blocks(
    "variable-window",
    "These arrays are zeros and positive numbers. Grow the right edge, and move the left edge forward only while the sum is too large for the question. The shortest window records a length whenever the sum reaches the target, then shrinks. The longest window shrinks until the sum fits, then records. The left edge never moves backward.",
  ),
  blocks(
    "list-walks",
    "Use the list the starter builds. For the middle, move one pointer one step and another two steps until the fast pointer cannot continue. On an even length that leaves the second middle. For the nth from the end, give the fast pointer a head start of n steps, then move both. If the head start falls off the list, return -1.",
  ),
  blocks(
    "stack-memory",
    "A backspace pops the last kept character and does nothing on an empty stack. The next greater value keeps indexes that are still waiting. When the new value is strictly greater than the value at the top index, record it and pop. Fill the answer with -1 first so unresolved indexes stay -1.",
  ),
  blocks(
    "queue-lines",
    "A negative count adds one when a negative enters the window and subtracts one when a negative leaves. The sliding maximum keeps indexes in decreasing order of value, drops the front when it falls out of the window, and reads the front as the max. If k does not fit, return an empty array.",
  ),
  blocks(
    "two-calls",
    "Fibonacci here stops at 1 for the first two values, then adds the two smaller calls. Nested depth is 0 for a number and 1 plus the deeper child for an array. An empty array is a level, so its depth is 1. Write the base case before the recursive call.",
  ),
  blocks(
    "search-bounds",
    "Keep an inclusive range. When the middle matches, save the index and keep going: left for the first match, right for the last. Move the bound past the middle so the range shrinks. Return -1 if you never saved an index.",
  ),
  blocks(
    "sort-choices",
    "A sorted array has no descent between neighbours, and an empty array is sorted. Bubble sort copies the input and swaps a left neighbour with the right one when the left is greater. Do not call the built-in sort. The merge you wrote in the previous lesson is the sort to keep.",
  ),
  blocks(
    "tree-counts",
    "buildTree turns the level-order list into nodes. A leaf has no children and counts as 1. Any other node adds the leaf counts of its children. The sum adds the node value to both children. Null returns 0 in both helpers.",
  ),
  blocks(
    "bst-shape",
    "Insert values in the given order. Smaller goes left, larger goes right. Height counts nodes on the longest path: 0 for an empty tree, 1 plus the taller child otherwise. Search uses the same walk and returns false at null. Do not sort the array first, or a spine disappears.",
  ),
  blocks(
    "heap-layout",
    "Index 0 has no parent. Every later parent is the floor of (i - 1) / 2. The children are 2 * i + 1 and 2 * i + 2, left then right. Return those indexes even when they would sit past the end of a particular array. This exercise is the formula, not a bounds check.",
  ),
  blocks(
    "visited-walks",
    "Store each undirected edge in both directions. Mark a vertex when you enqueue it, including the start. The component size is the number of marks. Reaching everyone means that count equals the number of vertices from 0 through count - 1. An isolated start is a component of one.",
  ),
  blocks(
    "greedy-checks",
    "The earliest finish is the interval with the smallest end. Break a tie with the smaller start. An empty list returns an empty array. Jump game tracks the farthest index you can reach. If the index you are on is already beyond that reach, you are stuck. A one-element array is already at the end.",
  ),
  blocks(
    "order-matters",
    "Choose an unused index from left to right, push the value, recurse, then pop and unmark it. Copy the path when you save it. Full permutations stop when the path is as long as the input. Ordered picks stop at length k. An empty input has one empty permutation.",
  ),
  blocks(
    "filling-a-table",
    "fibLoop(0) is 0 and fibLoop(1) is 1. Each later value is the sum of the two before it. Keep two numbers. House robber takes the better of skipping the current house or taking it plus the answer from two houses back. An empty street is 0. One house is that house.",
  ),
  blocks(
    "shared-prefixes",
    "Give every trie node its own children object and a count of words that pass through it. The longest common prefix walks while that count still equals the number of words. A prefix count is the count on the node where the query ends. An empty query counts every inserted word. A missing character counts as 0.",
  ),
];

export const extraSolutions: readonly LessonSolution[] = [
  blocks(
    "count-equal",
    "Walk the array once and add one when the value equals the target. Equality is the whole test. An empty array stays at 0. One loop is linear.",
  ),
  blocks(
    "reverse-copy",
    "Write a new array from the last index down to the first. Do not call reverse, and do not write back into the input. An empty array returns an empty array.",
  ),
  blocks(
    "has-duplicate",
    "Store each value as you see it. If the value is already stored, return true. Finish the pass and return false. An empty array has no duplicate.",
  ),
  blocks(
    "pair-sum",
    "The array is sorted. Start at the ends. Move the left pointer when the sum is too small and the right pointer when it is too large. Return true on a match. The pointers must stay on different indexes.",
  ),
  blocks(
    "min-window-sum",
    "Sum the first k values. Then, for each later index, subtract the value that left and add the value that entered. Keep the smaller sum. If k does not fit, return 0.",
  ),
  blocks(
    "list-sum",
    "Build the list with the helper and walk next, adding each value. An empty list returns 0. The array the tests passed in is only there so the starter can build nodes.",
  ),
  blocks(
    "adjacent-duplicates",
    "Push a letter when it differs from the top of the stack. When it matches the top, pop instead of pushing. Join the stack at the end. An empty string stays empty.",
  ),
  blocks(
    "recent-values",
    "Enqueue each arrival. When the queue is longer than the window, dequeue the oldest. Record a copy of the queue after every arrival. The copy matters, because the queue keeps changing.",
  ),
  blocks(
    "sum-nested",
    "A number returns itself. An array returns the sum of the recursive results of its children. An empty array returns 0. Each call receives a smaller piece than the call that made it.",
  ),
  blocks(
    "search-insert",
    "Binary search for the first index whose value is not smaller than the target. That index is where the target sits, or where it should be inserted. An empty array returns 0. The right bound starts at the length, not the last index, so the insertion point can be the end.",
  ),
  blocks(
    "merge-sorted",
    "Pointer on each sorted array. Write the smaller head and advance that pointer. When one side runs out, append the rest of the other. Do not call sort.",
  ),
  blocks(
    "count-nodes",
    "Null is 0. Any other node is 1 plus the counts of its children. Call buildTree first, then the helper. An empty list builds a null root.",
  ),
  blocks(
    "bst-min",
    "Insert in order, then walk left until the left child is missing. That node's value is the minimum. An empty list returns null. Do not scan the array with Math.min.",
  ),
  blocks(
    "is-min-heap",
    "Every index after 0 must be greater than or equal to its parent. The parent index is the floor of (i - 1) / 2. An empty array and a single value are heaps because there is no broken edge.",
  ),
  blocks(
    "can-reach",
    "If start and end are the same vertex, return true before you search. Otherwise walk neighbours and mark vertices when you enqueue them. Return true when the walk reaches end, and false when the queue empties.",
  ),
  blocks(
    "can-attend-all",
    "Sort by start. Walk the intervals and reject the schedule when the next start is strictly before the previous end. Touching is allowed. An empty list returns true.",
  ),
  blocks(
    "count-subsets",
    "Each value is in or out, so n distinct values have 2 to the power n subsets, including the empty one. An empty list has one subset. The next exercise asks you to list them, which is where the undo matters.",
  ),
  blocks(
    "min-cost-climb",
    "You may begin on stair 0 or stair 1. The cost to reach the top is the cheaper of paying the previous stair or the one before it, then climbing. Keep two running answers and return the cheaper one at the end. [10, 15, 20] returns 15.",
  ),
  blocks(
    "has-prefix",
    "Insert every word into a trie of plain objects and count how many words pass through each node. A query is a prefix when you can walk every character and the node you land on was used. An empty query is true only when at least one word was inserted. Do not use Set or Map.",
  ),
];

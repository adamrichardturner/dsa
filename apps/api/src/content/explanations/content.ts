import type { LessonSolution, SolutionBlock } from "./types";
import { extraSolutions, stepSolutions } from "./steps";

const lesson = (
  slug: string,
  blocks: readonly SolutionBlock[],
): LessonSolution => ({
  slug,
  blocks,
});

export const lessonSolutions: readonly LessonSolution[] = [
  lesson("complexity", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "countBelow should return how many values in nums are strictly less than limit. Equal to the limit does not count. An empty array counts as zero, because there is nothing to compare.",
    },
    {
      kind: "paragraph",
      text: "The lesson is about cost, not about finding a clever formula. One pass over the array is O(n). A loop inside a loop also produces the right number, and it is the habit this lesson is trying to retire.",
    },
    {
      kind: "heading",
      text: "Walk the public example",
    },
    {
      kind: "paragraph",
      text: "nums is [1, 4, 2, 8] and limit is 4. Start a counter at 0. 1 is below 4, so the counter becomes 1. 4 is not strictly below 4, so leave the counter. 2 is below 4, so the counter becomes 2. 8 is not. The answer is 2.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  a["1 < 4, count 1"] --> b["4 is not < 4"]
  b --> c["2 < 4, count 2"]
  c --> d["8 is not < 4"]`,
    },
    {
      kind: "paragraph",
      text: "The same walk handles the other cases. [5, 6] against 3 never increments. An empty array never enters the loop. [-2, 0, 1] against 2 increments three times.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "Keep one number, the count, and look at each value once. That is the whole function. Name the cost out loud after it passes: one loop, linear time, and no extra array.",
    },
    { kind: "code" },
  ]),
  lesson("arrays", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "rotateLeft returns a new array. The first steps elements move to the back, and the rest shift forward. The input array must stay as it was. An empty array stays empty.",
    },
    {
      kind: "paragraph",
      text: "steps can be larger than the length. Rotating by the length puts every element back where it started, so only the remainder matters: steps % nums.length.",
    },
    {
      kind: "heading",
      text: "Place each value once",
    },
    {
      kind: "paragraph",
      text: "[1, 2, 3, 4] rotated left by 1 is [2, 3, 4, 1]. The front slice is [1] and the rest is [2, 3, 4]. Join the rest first, then the front.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  a["1"] --> b["2"] --> c["3"] --> d["4"]
  e["2"] --> f["3"] --> g["4"] --> h["1"]`,
    },
    {
      kind: "paragraph",
      text: "The second row is the result. For [1, 2, 3] and 4 steps, 4 % 3 is 1, so it is the same move as a single step: [2, 3, 1]. Zero steps has remainder 0, so the copy is the original order. You never write back into nums.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "Guard the empty array before the remainder, because a remainder by zero is not defined. Then slice twice and concatenate. Both slices are new arrays, so the input is left alone. The work is one pass over the length, which is O(n).",
    },
    { kind: "code" },
  ]),
  lesson("hash-maps", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "twoSum returns the indices of the two values that add up to target. There is exactly one pair. You may not use the same index twice. Return the indices in ascending order, smaller index first.",
    },
    {
      kind: "paragraph",
      text: "A nested loop checks every pair and is O(n²). The lesson's trade is a map: remember the index of each value you have already seen, so the complement is a lookup instead of another scan.",
    },
    {
      kind: "heading",
      text: "One pass, storing indices",
    },
    {
      kind: "paragraph",
      text: "Walk [2, 7, 11, 15] looking for 9. At 2, the complement 7 is not in the map yet. Store 2 at index 0. At 7, the complement is 2, which is stored at index 0. Return [0, 1].",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  s["seen: 2 at index 0"] --> h["7 needs 2"]
  h --> r["return 0 and 1"]`,
    },
    {
      kind: "list",
      items: [
        "For [3, 2, 4] and target 6, 3 is stored, 2 is stored, and 4 finds 2 at index 1. The answer is [1, 2], not [0, something].",
        "For [3, 3] and target 6, the first 3 is stored at index 0. The second 3 finds that index. Store after the lookup, or the same element would match itself.",
        "Negatives use the same arithmetic. [-1, 4, 2] looking for 1 stores -1, skips 4, and 2 finds -1.",
      ],
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "A Map keeps the key as a number. Look up target - value before you store the current index. When the lookup hits, the stored index is already smaller than the current one, so the pair is in ascending order. Extra memory is O(n). Time is one pass.",
    },
    { kind: "code" },
  ]),
  lesson("two-pointers", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "nums is sorted and may contain negatives. sortedSquares returns a new array of the squares, also sorted ascending. Squaring and then sorting works, and it costs an extra O(n log n) sort. The sorted input lets two pointers do the job in one pass.",
    },
    {
      kind: "heading",
      text: "The largest squares sit at the ends",
    },
    {
      kind: "paragraph",
      text: "[-4, -1, 0, 3, 10] squares to 16, 1, 0, 9, and 100 before sorting. 100 and 16 are at the ends, not in the middle. Put one pointer on the left and one on the right. Square both. Write the larger square, and move the pointer that produced it inward.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  l["left -4, square 16"] --- r["right 10, square 100"]
  r --> w["write 100, move right inward"]`,
    },
    {
      kind: "paragraph",
      text: "Next the ends are -4 and 3. 16 is larger than 9, so write 16 and move the left pointer. Continue until the pointers cross. The squares come out largest first. Reverse that list, or write each square into the back of a result array, and the order is ascending: [0, 1, 9, 16, 100].",
    },
    {
      kind: "paragraph",
      text: "All-negative input still works, because the leftmost value has the largest magnitude. A single element is one comparison with itself. An already positive array always takes the right-hand square.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "The snippet writes the larger square and then reads that list from the back, so it does not depend on reversing in place. Each pointer moves at most n times. The cost is O(n) time and O(n) for the result.",
    },
    { kind: "code" },
  ]),
  lesson("sliding-window", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "maxWindowSum returns the largest sum of any contiguous block of exactly k elements. If k is less than 1, or larger than the array, there is no such block, so return 0. An empty array returns 0.",
    },
    {
      kind: "heading",
      text: "Reuse the previous sum",
    },
    {
      kind: "paragraph",
      text: "For [2, 1, 5, 1, 3, 2] and k = 3, the first window is 2 + 1 + 5 = 8. The next window drops 2 and adds 1, so 8 - 2 + 1 = 7. Then 7 - 1 + 3 = 9. Then 9 - 5 + 2 = 6. The maximum of those sums is 9.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  a["2 1 5 = 8"] --> b["1 5 1 = 7"]
  b --> c["5 1 3 = 9"]
  c --> d["1 3 2 = 6"]`,
    },
    {
      kind: "paragraph",
      text: "Each step is current - the value that left + the value that entered. You only sum from scratch once. Negatives are allowed: [-1, 4, -2, 5] with k = 2 has windows 3, 2, and 3, so the answer is 3. A window the size of the whole array is just the total.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "Reject an impossible k before you index the array. Seed the sum with the first window, remember it as the best, then slide. The scan after that first window is O(n).",
    },
    { kind: "code" },
  ]),
  lesson("linked-lists", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "reverseValues receives an array only so the tests can stay simple. The starter turns that array into nodes. You reverse the nodes by rewiring next, then return the values from the new head to the tail. Reversing the array itself is rejected.",
    },
    {
      kind: "heading",
      text: "Three names, and save next before you lose it",
    },
    {
      kind: "paragraph",
      text: "previous starts as null. current starts at the head. Before you change current.next, copy it into a local called next. Point current.next at previous. Then step forward: previous becomes current, and current becomes the saved next.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  p["previous null"] --> c["current 1"]
  c --> n["next 2"]
  n --> t["3"]`,
    },
    {
      kind: "paragraph",
      text: "After the first step, 1 points at null, previous is 1, and current is 2. After the second, 2 points at 1. After the third, 3 points at 2 and current is null. previous is the new head. Read it with the starter's toArray and you get [3, 2, 1].",
    },
    {
      kind: "list",
      items: [
        "One node: the loop runs once, that node points at null, and the same node is returned.",
        "An empty list: fromArray returns null, the loop never runs, and toArray of null is [].",
        "If you overwrite next before saving it, the rest of the list is gone and a longer input fails.",
      ],
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "The snippet includes the node helpers so it can run on its own. In the editor, keep those helpers and replace the body of reverseValues. Stop when current itself is null, not when current.next is null, or the last node never gets rewired.",
    },
    { kind: "code" },
  ]),
  lesson("stacks", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "isBalanced returns true when every bracket in the string is closed in the right order. The pairs are (), [], and {}. Other characters are not in the input. An empty string is balanced, because nothing was left open.",
    },
    {
      kind: "heading",
      text: "The stack remembers the order of the openings",
    },
    {
      kind: "paragraph",
      text: "Push (, [, and {. On a closer, pop and check that it is the matching opener. If the stack is empty, or the opener does not match, the string is unbalanced. At the end the stack must be empty. A leftover opener was never closed.",
    },
    {
      kind: "diagram",
      chart: `flowchart TB
  a["( pushed"] --> b["[ pushed"]
  b --> c["] matches ["]
  c --> d[") matches ("]
  d --> e["stack empty, balanced"]`,
    },
    {
      kind: "paragraph",
      text: "([]) follows that picture and returns true. ([)] pushes ( and [, then ) wants ( but the top is [. That is false. {[] closes the square bracket and leaves the brace, so the end check fails. )( tries to pop an empty stack.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "An array is a stack if you only push and pop at the end. A small object maps each closer to its opener. Characters that are not closers are openers, and they go on the stack. The function is one scan, O(n), with O(n) extra space in the worst case.",
    },
    { kind: "code" },
  ]),
  lesson("queues", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "windowSums walks values from left to right. After each element, the result holds the sum of the last window values. If fewer than window values have arrived, sum everything so far. windowSums([1, 2, 3, 4], 2) is [1, 3, 5, 7].",
    },
    {
      kind: "heading",
      text: "Enqueue the new value, dequeue the one that aged out",
    },
    {
      kind: "paragraph",
      text: "Keep a queue of the values inside the window, and a running sum so you do not add them from scratch. Push the new value and add it to the sum. If the queue is now longer than the window, shift the oldest value off and subtract it. Record the sum.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  a["queue 1, sum 1"] --> b["1 2, sum 3"]
  b --> c["2 3, sum 5"]
  c --> d["3 4, sum 7"]`,
    },
    {
      kind: "paragraph",
      text: "A window of 1 never holds more than the latest value, so the sums are the values themselves. A window wider than the input never dequeues, so the sums are the growing prefix: [2, 2, 2] with window 10 is [2, 4, 6]. An empty input never loops and returns [].",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "push adds at the back and shift removes from the front. shift is O(n) on an array. For these sizes that is the queue the lesson describes. The same shape, with vertices instead of numbers, is the breadth-first search you will write for graphs.",
    },
    { kind: "code" },
  ]),
  lesson("recursion", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "A Nested value is either a number or an array of Nested values. flatten returns the numbers from left to right. flatten([1, [2, [3], 4], 5]) is [1, 2, 3, 4, 5]. A bare number is a one-element array. An empty array flattens to an empty array.",
    },
    {
      kind: "heading",
      text: "Say the base case before the recursive case",
    },
    {
      kind: "paragraph",
      text: "If the value is a number, that number is the whole result. If it is an array, flatten each element and concatenate those results in order. The empty array has no elements, so it contributes nothing. Every recursive call receives a smaller piece: one element of the current array, not the same array again.",
    },
    {
      kind: "diagram",
      chart: `flowchart TB
  root["[1, [2, [3], 4], 5]"] --> n1["1"]
  root --> mid["[2, [3], 4]"]
  root --> n5["5"]
  mid --> n2["2"]
  mid --> deep["[3]"]
  mid --> n4["4"]
  deep --> n3["3"]`,
    },
    {
      kind: "paragraph",
      text: "Reading the leaves left to right gives 1, 2, 3, 4, 5. [[[1]], [2]] is the same rule with more empty wrappers around 1 and then 2. Without the number base case, a number would be treated as something you can loop, and the call would not make sense.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: 'The snippet checks typeof value === "number" first and returns. The array branch concatenates by pushing, which keeps the left-to-right order. The call stack is doing the bookkeeping a manual stack would do.',
    },
    { kind: "code" },
  ]),
  lesson("binary-search", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "nums is sorted ascending and has no duplicates. search returns the index of target, or -1 when it is absent. The lesson asks for binary search. A linear scan can return the same index and misses the point of the halving.",
    },
    {
      kind: "heading",
      text: "Keep an inclusive range",
    },
    {
      kind: "paragraph",
      text: "If the target is present, its index is between lo and hi inclusive. Start with lo = 0 and hi = nums.length - 1. While lo <= hi, look at the middle. A match returns that index. A smaller target means the answer is at most mid - 1. A larger target means the answer is at least mid + 1. When the range is empty, return -1.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  full["1 3 5 7 9"] --> mid["mid is 5"]
  mid --> right["7 9, mid is 7"]
  right --> found["7 matches index 3"]`,
    },
    {
      kind: "paragraph",
      text: "Searching for 4 in that array never hits a match: the range collapses and the function returns -1. The first element is found when mid lands on index 0 and the comparison matches. An empty array starts with hi = -1, so the loop never runs.",
    },
    {
      kind: "paragraph",
      text: "Use lo + Math.floor((hi - lo) / 2) for the middle. It stays inside the range. Moving to mid instead of mid - 1 or mid + 1 can leave the same index in the range forever.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "Each step throws away half of the remaining indices, so a long sorted array takes about log n comparisons. The array has to be sorted. The same walk on unsorted data is simply wrong.",
    },
    { kind: "code" },
  ]),
  lesson("sorting", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "mergeSort returns a new array of the numbers in ascending order. Implement merge sort. Calling .sort() is rejected. The input array is not mutated, so build new arrays as you split and merge.",
    },
    {
      kind: "heading",
      text: "Split, sort the halves, then merge",
    },
    {
      kind: "paragraph",
      text: "Fewer than two elements is already sorted. That is the base case, and it covers empty and single-element arrays. Otherwise split at the middle, sort each half by calling merge sort, and merge the two sorted halves.",
    },
    {
      kind: "diagram",
      chart: `flowchart TB
  all["5 1 4 2 8"] --> left["5 1 4"]
  all --> right["2 8"]
  left --> l1["1 4 5"]
  right --> r1["2 8"]
  l1 --> done["1 2 4 5 8"]
  r1 --> done`,
    },
    {
      kind: "paragraph",
      text: "Merging is two pointers. Repeatedly take the smaller head. When one half runs out, append the rest of the other. Duplicates stay: when the heads are equal, taking the left one first is enough, because the tests only care about the sorted values. Negatives compare with the same <=.",
    },
    {
      kind: "paragraph",
      text: "Each level of the split writes n elements, and there are log n levels, so the cost is O(n log n) time and O(n) extra memory for the new arrays.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "slice copies a half without changing nums. The merge function never sorts. It only compares the two heads. An already sorted input still goes through the same splits and comes back unchanged in value.",
    },
    { kind: "code" },
  ]),
  lesson("trees", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "values is a binary tree written in level order. null means a missing child. maxDepth returns the number of nodes on the longest path from the root down. An empty list has depth 0. A single node has depth 1. Use the buildTree helper already in the file. You do not need to rewrite it.",
    },
    {
      kind: "heading",
      text: "Depth is 1 plus the deeper child",
    },
    {
      kind: "paragraph",
      text: "An empty link has depth 0. Otherwise the depth is 1 plus the larger of the left depth and the right depth. That is a depth-first walk: finish one branch before the other.",
    },
    {
      kind: "diagram",
      chart: `flowchart TB
  r["3"] --> a["9"]
  r --> b["20"]
  b --> c["15"]
  b --> d["7"]`,
    },
    {
      kind: "paragraph",
      text: "[3, 9, 20, null, null, 15, 7] is that picture. 9 is a leaf, depth 1 from itself. 20's children are leaves, so 20 has depth 2. The root adds one more, and the answer is 3. A left spine [1, 2, null, 3] is three nodes in a line, so the depth is also 3. The null in the middle means 1 has no right child, and 3 hangs under 2.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "The snippet includes buildTree so it can run here. In the editor, add a depth function and return depth(buildTree(values)) from maxDepth. Compare the two child depths and add 1 to the larger one. Do not add the depths together. That would count both branches, and this exercise wants the longer path only.",
    },
    { kind: "code" },
  ]),
  lesson("binary-search-trees", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "Insert values from left to right into an empty binary search tree. Smaller values go left. Larger values go right. Then return whether target is in the tree. Scanning the array with includes, indexOf, or a Set is rejected.",
    },
    {
      kind: "heading",
      text: "Insert with the same walk you will search with",
    },
    {
      kind: "paragraph",
      text: "An empty spot is where the new node goes. If the value is smaller than the current node, insert on the left. If it is larger, insert on the right. Search starts at the root and uses that same comparison. Hitting null means the target is absent.",
    },
    {
      kind: "diagram",
      chart: `flowchart TB
  r["8"] --> a["3"]
  r --> b["10"]
  a --> c["1"]
  a --> d["6"]`,
    },
    {
      kind: "paragraph",
      text: "[8, 3, 10, 1, 6] builds that tree. Searching for 6 goes left from 8 to 3, then right to 6, and returns true. Searching for 7 follows the same start, reaches the right of 6, finds null, and returns false. The root matches immediately. An empty value list never inserts, so every target is false.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "Build the tree in the order the array is given. A later search that ignores the tree and reads the array will fail the disallow check even when the boolean happens to be right. The walk is O(h), and h is the height. Sorted inserts make a straight line. The rule is still correct. It is just no longer faster than a scan.",
    },
    { kind: "code" },
  ]),
  lesson("heaps", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "kthLargest returns the kth largest value in nums. k is at least 1 and at most the length. kthLargest([3, 2, 1, 5, 6, 4], 2) is 5. Duplicates count separately, so the second largest of [2, 2] is 2. The largest of a list is k = 1. The smallest of three values is k = 3.",
    },
    {
      kind: "heading",
      text: "Keep a min-heap of the k largest values seen so far",
    },
    {
      kind: "paragraph",
      text: "A min-heap keeps the smallest of those k values at the root. Push each number. When the heap holds more than k values, pop the smallest. You have thrown away something that cannot be in the top k. When the array is finished, the root is the kth largest: k values are at least that large, and every smaller one was removed.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  a["heap of size k"] --> b["push the next value"]
  b --> c{"longer than k?"}
  c -->|yes| d["pop the smallest"]
  c -->|no| e["root is a candidate"]
  d --> e`,
    },
    {
      kind: "paragraph",
      text: "In an array heap, the parent of index i is Math.floor((i - 1) / 2), the left child is 2 * i + 1, and the right child is 2 * i + 2. Insert writes at the end and swaps upward while the value is smaller than its parent. Remove-min moves the last value to the root and swaps it downward with the smaller child.",
    },
    {
      kind: "paragraph",
      text: "Sorting a copy and indexing from the end also returns the right number, and the tests allow it. The heap is the practice this lesson is for. Either way, do not assume the values are unique.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "The snippet is a binary min-heap stored in an array. After the scan, heap[0] is the answer. Each push and pop is O(log k), and you do it once per element, so the cost is O(n log k).",
    },
    { kind: "code" },
  ]),
  lesson("graphs", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "edges is a list of undirected pairs [from, to]. shortestPath returns the number of edges on the shortest path from start to end. start === end is 0, even when that vertex has no edges. If no path exists, return -1.",
    },
    {
      kind: "heading",
      text: "Breadth-first search, marking a vertex when you enqueue it",
    },
    {
      kind: "paragraph",
      text: "Build an adjacency list first. Because the edges are undirected, store each pair in both directions. Then search with a queue. The first time you reach the target, you got there in the fewest edges. That is true here because every edge costs the same.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  a["0"] --- b["1"]
  a --- c["2"]
  b --- c`,
    },
    {
      kind: "paragraph",
      text: "From 0 to 2 there is a direct edge, so the distance is 1, even though 0-1-2 is longer. A line 0-1-2-3 has distance 3. [[0, 1]] with end 2 never reaches 2, so the answer is -1. Mark a vertex when you first put it on the queue. Marking only when you dequeue lets the same neighbour get queued many times, and a cycle will not finish promptly.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "Carry the distance in the queue next to the vertex. The neighbours of the current vertex are one edge further. Depth-first search answers whether a path exists. It does not answer which path is shortest. Use the queue.",
    },
    { kind: "code" },
  ]),
  lesson("greedy", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "Each interval is half-open: [start, end) includes start and excludes end. maxNonOverlapping returns how many intervals you can keep with no overlaps. Touching is allowed, so [1, 2] and [2, 4] can both be chosen. An empty list returns 0.",
    },
    {
      kind: "heading",
      text: "Sort by finishing time, then take the next interval that fits",
    },
    {
      kind: "paragraph",
      text: "The safe local choice is the interval that frees you soonest. Sort by end, earliest first. Take the first. Then take the next interval whose start is greater than or equal to that finish. Skip the ones that start earlier. Repeat.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  a["[1, 3) taken"] --> b["[2, 4) starts too soon"]
  b --> c["[3, 5) starts at 3, taken"]`,
    },
    {
      kind: "paragraph",
      text: "That picture keeps 2 intervals. [2, 4) overlaps [1, 3) because 2 is before 3. [3, 5) starts exactly when [1, 3) ends, and half-open intervals may touch. Three intervals that do not overlap at all all get taken. Sorting by start instead can keep a long early interval and block several short ones. That is the rule this problem is not using.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "Copy the list before sorting so you do not rearrange the caller's array. Track the finish of the last interval you kept. A start strictly before that finish is an overlap. Count the ones you keep. The sort dominates the cost, O(n log n), and the scan after it is linear.",
    },
    { kind: "code" },
  ]),
  lesson("backtracking", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "subsets returns every subset of nums. The numbers are distinct. Include the empty subset. The order of the subsets, and the order inside each subset, does not matter. The tests compare the collection as a set. [1, 2] has [], [1], [2], and [1, 2]. An empty input has one subset, the empty one. Three values have eight subsets.",
    },
    {
      kind: "heading",
      text: "Choose, explore, then undo",
    },
    {
      kind: "paragraph",
      text: "At each index the number is either left out or included. Recurse for the left-out choice first. Then push the number, recurse, and pop it so the next choice starts clean. When the index reaches the length, copy the path into the results. Copying matters. If you save the path array itself, later pops empty the subsets you thought you had kept.",
    },
    {
      kind: "diagram",
      chart: `flowchart TB
  start["path empty"] --> skip1["skip 1"]
  start --> take1["take 1"]
  skip1 --> skip2["[]"]
  skip1 --> take2["[2]"]
  take1 --> only1["[1]"]
  take1 --> both["[1, 2]"]`,
    },
    {
      kind: "paragraph",
      text: "That tree is the four subsets of [1, 2]. Forget the pop and the branch that should have been [2] still contains 1. n distinct numbers have 2ⁿ subsets, so this is the right tool while n is small.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "The snippet uses path.slice() at the leaves and path.pop() after the call that included the current number. Run it and you should see all four subsets. The printed order may differ from the lesson's list. That is fine.",
    },
    { kind: "code" },
  ]),
  lesson("dynamic-programming", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: "You can climb 1 or 2 steps. climbStairs returns how many distinct ways there are to climb exactly n steps. n is at least 1. climbStairs(1) is 1. climbStairs(2) is 2: two single steps, or one double step. climbStairs(3) is 3: 1+1+1, 1+2, and 2+1. climbStairs(5) is 8.",
    },
    {
      kind: "heading",
      text: "The last step was either 1 or 2",
    },
    {
      kind: "paragraph",
      text: "ways(n) = ways(n - 1) + ways(n - 2). Every climb of n ends in a single step, after a climb of n - 1, or a double step, after a climb of n - 2. Those smaller answers overlap. A naive recursion recomputes them. A loop stores them as it goes.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  w1["1 way for 1"] --> w3["3 ways for 3"]
  w2["2 ways for 2"] --> w3
  w3 --> w4["5 ways for 4"]
  w2 --> w4`,
    },
    {
      kind: "paragraph",
      text: "You only need the last two answers to produce the next one. Start with 1 and 2. Each new step replaces that pair: next = previous + current, then slide the window forward. After you have filled up to n, current is the answer. For n of 1 or 2, return n and do not enter the loop.",
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: "The loop is O(n) time and O(1) extra memory. A full array of answers is the same idea and also fine. Both are dynamic programming: the recurrence, the base cases, and a place to reuse the smaller results.",
    },
    { kind: "code" },
  ]),
  lesson("tries", [
    {
      kind: "heading",
      text: "What the exercise is asking",
    },
    {
      kind: "paragraph",
      text: 'Insert every string in words into a trie. Then, for each query, return whether that exact word was inserted. wordsFound(["cat", "car"], ["cat", "cab", "car"]) is [true, false, true]. A prefix is not a word: "car" was not inserted when the only word is "carpet". An empty word can be inserted, and it matches only the empty query. Set and Map are rejected. Build the trie from objects.',
    },
    {
      kind: "heading",
      text: "Each edge is a character, and a flag marks a finished word",
    },
    {
      kind: "paragraph",
      text: "A node holds children, keyed by character, and isWord. Insert walks the characters and creates a child when it is missing. Mark isWord on the node where the word ends, not on every node you pass. Search walks the same path. If a character is missing, the word is absent. If the walk finishes, return the flag. The flag is what stops a prefix from counting as a word.",
    },
    {
      kind: "diagram",
      chart: `flowchart LR
  root["root"] --> c["c"]
  c --> a["a"]
  a --> t["t word"]
  a --> r["r word"]`,
    },
    {
      kind: "paragraph",
      text: 'cat and car share c and a, then split. cab dies at b, which was never created. carpet marks only the final t. The node for r along that path has isWord false, so the query "car" is false and "carpet" is true. The empty word marks the root itself.',
    },
    {
      kind: "heading",
      text: "A solution you can run",
    },
    {
      kind: "paragraph",
      text: 'Children are a plain object. An empty query walks no characters and returns the root flag, which is why inserting "" makes the empty query true and leaves "a" false. Lookup is proportional to the length of the query, not to the number of other words, once the trie is built.',
    },
    { kind: "code" },
  ]),
];

const primaryProblemId: Record<string, string> = {
  complexity: "count-below",
  arrays: "rotate-left",
  "hash-maps": "two-sum",
  "two-pointers": "sorted-squares",
  "sliding-window": "max-window-sum",
  "linked-lists": "reverse-values",
  stacks: "is-balanced",
  queues: "window-sums",
  recursion: "flatten",
  "binary-search": "binary-search",
  sorting: "merge-sort",
  trees: "max-depth",
  "binary-search-trees": "bst-contains",
  heaps: "kth-largest",
  graphs: "shortest-path",
  greedy: "max-non-overlapping",
  backtracking: "subsets",
  "dynamic-programming": "climb-stairs",
  tries: "words-found",
};

const byLesson: Record<string, LessonSolution> = {};
const byProblem: Record<string, LessonSolution> = {};

for (const solution of lessonSolutions) {
  byLesson[solution.slug] = solution;
  const problemId = primaryProblemId[solution.slug];
  if (problemId === undefined) {
    continue;
  }
  byProblem[problemId] = solution;
}

for (const solution of stepSolutions) {
  byProblem[solution.slug] = solution;
}

for (const solution of extraSolutions) {
  byProblem[solution.slug] = solution;
}

export const explanationText = (solution: LessonSolution): string => {
  const parts: string[] = [];
  for (const block of solution.blocks) {
    if (block.kind === "code") {
      continue;
    }
    if (block.kind === "list") {
      for (const item of block.items) {
        parts.push(item);
      }
      continue;
    }
    if (block.kind === "diagram") {
      parts.push(block.chart);
      continue;
    }
    parts.push(block.text);
  }
  return parts.join("\n").trim();
};

export const solutionFor = (slug: string): LessonSolution | null => {
  return byLesson[slug] ?? null;
};

export const solutionForProblem = (
  _slug: string,
  problemId: string,
): LessonSolution | null => {
  return byProblem[problemId] ?? null;
};

import type { LessonSolution, SolutionBlock } from "./types";

const blocks = (
  problemId: string,
  ...paragraphs: readonly string[]
): LessonSolution => {
  const body: SolutionBlock[] = [
    { kind: "heading", text: "How to solve this exercise" },
  ];
  for (const text of paragraphs) {
    body.push({ kind: "paragraph", text });
  }
  body.push({ kind: "code" });
  return { slug: problemId, blocks: body };
};

export const stepSolutions: readonly LessonSolution[] = [
  blocks(
    "ascending-pairs",
    "countAscendingPairs returns how many index pairs i < j have a strictly smaller value on the left. Start the inner loop at i + 1 so a value is never paired with itself and each pair is counted once. The nested loops do triangular work, which is quadratic. Say that cost out loud after the tests pass.",
    "On [1, 3, 2] the pairs are (1, 3), (1, 2), and (3, 2). The first two ascend and the last does not, so the answer is 2. [1, 2, 3] has all three pairs. An empty array, a one-element array, and a descending array such as [3, 2, 1] return 0.",
  ),
  blocks(
    "equal-pairs",
    "countEqualPairs counts index pairs i < j whose values are equal. The walk is the same shape as an ascending-pair count, but the test is strict equality. A smaller or larger neighbour does not count. Do not sort the array: sorting would change which indexes are being compared.",
    "On [1, 1, 1] every pair matches, and there are three of them. On [1, 2, 1] only the two 1s match, so the answer is 1. An empty array or a one-element array has no pair and returns 0.",
  ),
  blocks(
    "remove-at",
    "removeAt returns a new array that skips the value at index and copies every other value in order. Do not write back into nums. If index is outside the array, nothing is dropped, so the result is a copy. An empty input stays empty.",
    "[1, 2, 3, 4] with index 1 drops 2 and returns [1, 3, 4]. Index 0 on [8, 9] returns [9]. Index 5 on [1, 2] is past the end and returns [1, 2].",
  ),
  blocks(
    "insert-at",
    "insertAt returns a new array with value placed at index. The old values from that index onward shift right. A negative index inserts at the front. An index past the end appends. The input array stays as it was.",
    "[1, 2, 4] with index 2 and value 3 returns [1, 2, 3, 4]. [2, 3] with index 0 and value 1 returns [1, 2, 3]. [1] with index 5 and value 9 returns [1, 9].",
  ),
  blocks(
    "frequency-of",
    "frequencyOf returns how many times target appears. One pass stores a count for each value, using the number's string form as the object key. The answer is that stored count, or 0 when the key was never written. An empty array returns 0.",
    "[1, 2, 1, 1] looking for 1 returns 3. [4, 5] looking for 1 returns 0. Negatives are ordinary keys: [-1, -1, 0] looking for -1 returns 2.",
  ),
  blocks(
    "most-frequent",
    "mostFrequent returns the value that appears most often. Count every value in one pass, and remember the index where each value was first seen. Replace the winner only when the new count is greater, or when the counts are equal and the new value appeared earlier. The input is non-empty, so there is always a winner.",
    "[1, 2, 2, 3] returns 2. [1, 2, 2, 1] is a tie at two appearances each, and 1 appears first, so the answer is 1. The tie uses the earlier index, not the smaller number.",
  ),
  blocks(
    "is-palindrome",
    "isPalindrome returns true when nums reads the same from both ends. Put one pointer on the left and one on the right. While they have not met, return false at the first mismatch, then move both pointers inward.",
    "[1, 2, 2, 1] matches at both ends and returns true. [1, 2, 3] compares 1 with 3 and returns false. An empty array and a one-element array never enter the loop, so both are palindromes.",
  ),
  blocks(
    "pair-indices",
    "pairIndices receives a sorted array and returns the indexes of two different values that add up to target, smaller index first. Start at the ends. Move the left pointer when the sum is too small and the right pointer when the sum is too large. If the pointers meet, return [-1, -1].",
    "[1, 2, 4, 6] looking for 6 starts at 1 + 6. That is too big, so the right pointer moves to 4. Then 2 + 4 is 6, and the indexes are [1, 2]. [1, 2, 3] looking for 7 returns [-1, -1]. When several pairs work, this inward scan is the pair the tests expect: [1, 2, 3, 4, 5] looking for 6 returns [0, 4].",
  ),
  blocks(
    "shortest-at-least",
    "shortestAtLeast returns the length of the shortest contiguous slice whose sum is at least target. The values are zeros and positive numbers, so the window only grows on the right and shrinks from the left. Each time the sum is large enough, record the length if it is the shortest so far, then subtract the left value and advance the left pointer. If no slice qualifies, return 0.",
    "[2, 3, 1, 2, 4, 3] with target 7 first becomes long enough at [2, 3, 1, 2], then shrinks, and later the slice [4, 3] has length 2. That is the answer. [1, 4, 4] with target 4 returns 1. [1, 1] with target 5 returns 0.",
  ),
  blocks(
    "longest-at-most",
    "longestAtMost returns the length of the longest contiguous slice whose sum is at most target. Grow the right edge, and move the left edge forward only while the sum is too large. After the window fits, record its length if it is longer. The left edge never moves backward. If every element is greater than the target, return 0.",
    "[1, 2, 3, 1] with target 3 returns 2. The window grows to [1, 2], then shrinks when 3 arrives, and never finds a longer valid slice. [1, 1, 1, 1] with target 2 also returns 2. [5] with target 3 returns 0. [0, 0, 1] with target 0 returns 2, the two zeros.",
  ),
  blocks(
    "middle-value",
    "middleValue builds the linked list with the starter and returns the middle node's value. Move one pointer one step and another pointer two steps until the fast pointer cannot take another step. On an even length that stop leaves the slow pointer on the second middle. An empty list returns -1.",
    "[1, 2, 3, 4, 5] stops with the slow pointer on 3. [1, 2, 3, 4] also stops on 3, the second of the two middle nodes. A single node returns that node's value.",
  ),
  blocks(
    "nth-from-end",
    "nthFromEnd returns the value n places from the end of the linked list the starter builds. n is 1-based, so 1 means the last node. Give the fast pointer a head start of n steps. If that head start falls off the list, or n is less than 1, return -1. Otherwise move both pointers one step at a time until the fast pointer is null. The slow pointer is then the answer.",
    "On [1, 2, 3, 4, 5] with n = 2, the fast pointer walks two nodes ahead, then both pointers move until the fast pointer runs out, and the slow pointer is on 4. n = 1 on [1, 2, 3] returns 3. n = 4 on [1, 2] returns -1.",
  ),
  blocks(
    "apply-backspace",
    "applyBackspace treats # as a backspace. Push every other character onto a stack. A # pops the last kept character, and a pop on an empty stack does nothing. Join the stack when the string is finished. An empty string stays empty.",
    "The input ab#c pushes a, pushes b, pops b, and pushes c, so the result is ac. The input a##b pops the a, ignores the extra #, and then pushes b. A string of only backspaces returns an empty string.",
  ),
  blocks(
    "next-greater",
    "nextGreater returns, for each index, the nearest later value that is strictly greater, or -1 when none exists. Fill the answer with -1 first. Keep a stack of indexes that are still waiting. When the new value is strictly greater than the value at the top index, write it into that slot and pop. Repeat while the top is smaller, then push the new index.",
    "[2, 1, 2, 4, 3] returns [4, 2, 4, -1, -1]. The 4 settles the 2 at index 0 and the 2 at index 2. The final 3 never finds a greater value to its right, and neither does 4. A descending array such as [3, 2, 1] stays [-1, -1, -1].",
  ),
  blocks(
    "negative-counts",
    "negativeCounts returns how many strictly negative values sit in each contiguous block of exactly k elements. Add one when a negative value enters on the right, and subtract one when a negative value leaves on the left. If k is less than 1, or longer than the array, return an empty array.",
    "[-1, 2, -3, 4] with k = 2 produces [1, 1, 1], because each window of two holds one negative. [1, -1] with k = 3 does not fit, so the result is [].",
  ),
  blocks(
    "max-in-window",
    "maxInWindow returns the maximum of each contiguous block of exactly k elements. Keep a deque of indexes whose values are non-increasing from front to back. Drop the front index when it falls out of the window. Before pushing the new index, pop indexes from the back while their values are smaller than the new value. The front index holds the window maximum. If k does not fit, return an empty array.",
    "[1, 3, -1, -3, 5, 3, 6, 7] with k = 3 returns [3, 3, 5, 5, 6, 7]. A window of one is the array itself: [4, 2] with k = 1 returns [4, 2].",
  ),
  blocks(
    "fib",
    "fib returns the nth Fibonacci number with fib(1) and fib(2) both equal to 1. Every later value is the sum of the two smaller calls, fib(n - 1) + fib(n - 2). Write those base cases before the recursive calls. n is at least 1. This exercise wants the two calls, even though they repeat work.",
    "fib(1) is 1 and fib(3) is 2. fib(6) is 8. Keep this one-based rule. The later loop exercise uses a different base, where the value at 0 is 0.",
  ),
  blocks(
    "nested-depth",
    "nestedDepth measures how deeply arrays are nested. A number has depth 0. An array's depth is 1 plus the deepest child. An empty array has no child, so its depth is 1. Recurse on each element and keep the larger depth.",
    "The value [1, [2, [3]]] wraps three arrays around the innermost number, so the depth is 3. A bare 4 returns 0. An empty array returns 1. The siblings [[], [1]] return 2.",
  ),
  blocks(
    "fib-memo",
    "fibMemo uses the same one-based Fibonacci rule as fib: 1 and 2 both return 1, and every later value is the sum of the two before it. Store each result the first time you compute it. A later call for that same n returns the stored number instead of branching again. The cache is what lets a large n finish inside the time limit.",
    "fibMemo(1) is 1, fibMemo(6) is 8, and fibMemo(7) is 13. The stored answers match the uncached recurrence. They are computed once per n, from the base cases upward through the calls that are actually made.",
  ),
  blocks(
    "first-equal",
    "firstEqual returns the smallest index of target in a sorted array, or -1 when target is absent. Keep an inclusive range. When the middle value matches, save that index and keep searching to the left by setting the high bound to mid - 1. When the middle is too small, move the low bound past it. When the middle is too large, move the high bound past it. Return the saved index.",
    "[1, 2, 2, 2, 3] looking for 2 saves index 2, then index 1, and the leftward search stops there, so the answer is 1. Looking for 4 never saves an index and returns -1.",
  ),
  blocks(
    "last-equal",
    "lastEqual returns the largest index of target in a sorted array, or -1 when target is absent. Keep an inclusive range. When the middle value matches, save that index and keep searching to the right by setting the low bound to mid + 1. A miss moves the opposite bound past the middle so the range shrinks. Return the saved index, which is the rightmost match.",
    "On [1, 2, 2, 2, 3] looking for 2, the saved index moves to 3 and stays there. Looking for 0 returns -1. The same array and target produce 1 from the first-index search and 3 from this one.",
  ),
  blocks(
    "is-sorted",
    "isSorted returns true when every value is less than or equal to the next one. An equal neighbour is still sorted. Walk from the second index and return false at the first descent. An empty array and a one-element array have no pair to compare, so both return true.",
    "[1, 2, 2] is sorted and returns true. [1, 3, 2] fails because 3 is greater than 2. Compare neighbours in the order they already have. Sorting the array would hide the answer.",
  ),
  blocks(
    "bubble-sort",
    "bubbleSort returns a new array in ascending order. Copy the input first so nums is not mutated. On each pass, swap a left neighbour with the right one when the left value is greater. Equal values stay where they are. Do not call the built-in sort.",
    "[5, 1, 4, 2] becomes [1, 2, 4, 5]. [3, 1, 3] becomes [1, 3, 3]. The returned array is a different array from the input, even when the values were already in order.",
  ),
  blocks(
    "leaf-count",
    "leafCount turns the level-order list into a tree with buildTree, then counts nodes that have no children. A null child contributes 0. A node whose left and right children are both null contributes 1. Any other node adds the leaf counts of its two children.",
    "The tree [3, 9, 20, null, null, 15, 7] has leaves 9, 15, and 7, so the answer is 3. A single node is a leaf, so [1] returns 1. An empty list builds a null root and returns 0.",
  ),
  blocks(
    "tree-sum",
    "treeSum turns the level-order list into a tree with buildTree, then adds every node value. A null child contributes 0. Any other node returns its own value plus the sums of the left and right children. Internal nodes contribute their values. This is a different total from the leaf count of the same tree.",
    "[3, 9, 20, null, null, 15, 7] is 3 + 9 + 20 + 15 + 7, which is 54. A single node [4] returns 4. An empty list returns 0.",
  ),
  blocks(
    "bst-height",
    "bstHeight inserts the values in the given order. A smaller value goes left and a larger value goes right. Height then counts nodes on the longest path: an empty tree is 0, and any other node is 1 plus the taller child. Do not sort the array before inserting. Sorting would turn a right spine into a different shape and change the height.",
    "Inserting [1, 2, 3] in that order builds a spine of three nodes, so the height is 3. Inserting [2, 1, 3] builds a root with two children, so the height is 2.",
  ),
  blocks(
    "bst-contains-shaped",
    "bstContainsShaped inserts the values in the given order, smaller to the left and larger to the right, then searches that tree. A target equal to the current node returns true. A smaller target walks left and a larger target walks right. Reaching null returns false. Do not scan the array, and do not sort it before inserting. The links are the search.",
    "[1, 2, 3] looking for 3 walks right from 1 to 2 and then to 3, and returns true. [2, 1, 3] looking for 4 walks right from 2 to 3 and then off the tree, so it returns false.",
  ),
  blocks(
    "parent-index",
    "parentIndex is the parent slot of a 0-based heap index. Index 0 is the root and returns -1. Every later parent is Math.floor((index - 1) / 2). There is no heap array in this exercise, so the only special case is the root.",
    "parentIndex(0) is -1. parentIndex(1) and parentIndex(2) are both 0. parentIndex(3) is 1, the left child of the root.",
  ),
  blocks(
    "child-indexes",
    "childIndexes returns the two child slots of a 0-based heap index, left then right. The left child is 2 * index + 1 and the right child is 2 * index + 2. Return those indexes even when they would sit past the end of a particular heap. This exercise is the formula, not a bounds check.",
    "childIndexes(0) is [1, 2]. childIndexes(1) is [3, 4]. The root's children are the next two slots, and index 1's children skip the root's right child at index 2.",
  ),
  blocks(
    "component-size",
    "componentSize counts the vertices reachable from start in an undirected graph, including start. Store each edge in both directions. Mark a vertex when you enqueue it, then count the marks. A repeated neighbour must not be enqueued again. An isolated start is a component of one.",
    "The edges [0, 1], [1, 2], and [3, 4] give a component of 3 from 0 and a component of 2 from 3. An empty edge list starting at 5 still returns 1, because start itself is reachable.",
  ),
  blocks(
    "reaches-all",
    "reachesAll returns true when every vertex from 0 through count - 1 is reachable from start. Walk the undirected edges, mark each vertex when you enqueue it, and compare the number of marks with count. A single vertex with no edges is reachable from itself, so that case returns true.",
    "The edges [0, 1] and [1, 2], with count 3 and start 0, reach everyone and return true. The single edge [0, 1], with count 3 and start 0, leaves vertex 2 out and returns false. Start 0 with only the edge [1, 2] and count 3 also returns false.",
  ),
  blocks(
    "count-components",
    "countComponents counts the connected components among vertices 0 through count - 1. Build an adjacency record for the undirected edges, then start a fresh search from every vertex that is still unmarked. Mark a vertex when you first enqueue it. Each fresh start adds one to the count. An isolated vertex is its own component, even when it never appears in the edge list.",
    "The edges [0, 1], [1, 2], and [3, 4] with count 5 form two components. No edges and count 3 returns 3. The edge [0, 2] with count 4 returns 3, because 1 and 3 are isolated. count 0 returns 0.",
  ),
  blocks(
    "earliest-finish",
    "earliestFinish returns the half-open interval [start, end) with the smallest end. If two intervals share that end, return the one with the smaller start. Walk the list once and keep the best pair. An empty list returns an empty array.",
    "The intervals [1, 5], [2, 3], and [4, 6] finish earliest at [2, 3]. The comparison looks at the end first. An empty list returns [].",
  ),
  blocks(
    "can-jump",
    "canJump returns true when the last index can be reached. nums[i] is the farthest jump allowed from index i. Track the farthest index reachable so far. If the index you are standing on is already beyond that reach, you are stuck and the answer is false. An empty array returns false. A one-element array is already at the end and returns true.",
    "[2, 3, 1, 1, 4] can reach the last index. [3, 2, 1, 0, 4] cannot: the farthest reach stops at the 0, and the final 4 is beyond it.",
  ),
  blocks(
    "permutations",
    "permutations returns every ordering of distinct numbers. Try unused indexes from left to right. Mark the index, push the value, recurse, then pop the value and unmark the index. Copy the path when it is as long as the input. An empty input has one result, the empty ordering.",
    "[1, 2] returns [1, 2] and then [2, 1]. [4] returns a single ordering of [4]. [] returns one empty ordering. The left-to-right index order is the order of the results.",
  ),
  blocks(
    "ordered-picks",
    "orderedPicks returns every ordering of length k chosen from distinct numbers, without reusing an index. Try unused indexes from left to right, push the value, recurse, then pop and unmark it. Copy the path when its length is k, not when it uses every input value. k is at least 1 and at most the length of nums.",
    "[1, 2, 3] with k = 2 returns [1, 2], [1, 3], [2, 1], [2, 3], [3, 1], and [3, 2], in that order. [4, 5] with k = 1 returns [4] and then [5]. Stopping at k is what keeps these shorter than the full permutations of the same values.",
  ),
  blocks(
    "fib-loop",
    "fibLoop returns the nth Fibonacci number from the bottom up. fibLoop(0) is 0 and fibLoop(1) is 1. Each later value is the sum of the two before it. Keep those two numbers and replace them as the loop steps from 1 up to n. This base is different from the one-based recursive exercise, where both 1 and 2 return 1.",
    "fibLoop(0) is 0 and fibLoop(1) is 1. fibLoop(2) is 1 and fibLoop(6) is 8. Each value is computed once, from the base cases forward.",
  ),
  blocks(
    "house-robber",
    "rob returns the most you can take from a line of houses when two adjacent houses cannot both be taken. Keep the best total using the previous house and the best total from the house before that. The next total is the better of skipping the current house, or taking it plus the older total. An empty street returns 0. One house returns that house.",
    "[1, 2, 3, 1] returns 4, from the first house and the third. [2, 7, 9, 3, 1] returns 12. The running totals, not the larger neighbour by itself, decide the answer.",
  ),
  blocks(
    "common-prefix",
    "longestCommonPrefix inserts every word into a trie. Each node counts how many words pass through it, and every node has its own children object. Walk from the root along the first word, and append a character only while that child's count still equals the number of words. Stop at the first character that is not shared by every word. An empty word list returns an empty string.",
    "flower, flow, and flight share fl and then split, so the answer is fl. dog, racecar, and car share no first character, so the answer is an empty string. A node counts as shared only when every word passed through it.",
  ),
  blocks(
    "prefix-counts",
    "prefixCounts inserts every word into a trie and counts how many words pass through each node, including the root. For a non-empty query, walk every character and return the count on the node where the walk ends. A missing character returns 0. An empty query does not walk. It returns the root count, which is the number of inserted words.",
    "The words cat, car, and carpet with the queries ca, car, and dog return [3, 2, 0]. ca lies on all three words, car lies on two, and dog is missing. The words cat and car with one empty query return [2].",
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
  blocks(
    "range-sum",
    "rangeSum returns the inclusive sum of an original array from left through right, using a prefix array that was already built. prefix[0] is 0, and prefix[i] is the sum of the original values before index i. The inclusive sum is prefix[right + 1] - prefix[left]. That subtraction is constant time. Do not rescan the range, and do not mutate prefix.",
    "For the values [2, 1, 5, 3, 4] the prefix is [0, 2, 3, 8, 11, 15], and indexes 1 through 3 are 11 - 2, which is 9. A one-value span uses the same formula: prefix [0, 5] from 0 through 0 is 5. A prefix of [0], the empty original array, returns 0. Negatives stay in the subtraction: [0, -2, 3, 2] from 0 through 2 is 2.",
  ),
  blocks(
    "remove-duplicates-sorted",
    "removeDuplicates returns a new array of the distinct values in a sorted array, in the same order. Keep the first value. Keep each later value only when it differs from the last value written. Equal values are adjacent because the input is sorted, so one comparison with the previous write is enough. Do not mutate nums, sort it, or use a set.",
    "[1, 1, 2] returns [1, 2]. [1, 2, 3] is already unique and returns a new array of those three values. An empty input returns []. A run of equal values collapses to one entry: [-2, -2, -1, 0, 0, 0, 3] returns [-2, -1, 0, 3].",
  ),
  blocks(
    "max-area",
    "maxArea returns the largest area between two vertical lines. The area between a left index and a right index is the shorter height times the distance right - left. Start the pointers at the two ends. The shorter line cannot do better inside a smaller width, so move that pointer inward by one. When the heights are equal, move the left pointer. Fewer than two lines returns 0. Do not check every pair.",
    "[1, 8, 6, 2, 5, 4, 8, 3, 7] returns 49. [1, 1] has width 1 and returns 1. [1, 100, 1] returns 2, from the two short ends. An empty array or a single line returns 0.",
  ),
  blocks(
    "level-order",
    "levelOrder builds the tree with buildTree, then walks it from the root with a queue. When you take a node, record its value, then enqueue its left child before its right child. Skip a missing child. An empty encoding returns an empty array. A front index keeps the walk linear. Do not copy the non-null entries out of the input array. The exercise is the queue walk on the tree buildTree produces.",
    "[3, 9, 20, null, null, 15, 7] returns [3, 9, 20, 15, 7]. A root by itself returns that one value. A right spine [1, null, 2, null, 3] returns [1, 2, 3], because the missing left children are never enqueued.",
  ),
  blocks(
    "is-valid-bst",
    "isValidBst builds the tree with buildTree and returns true only when every node obeys the strict binary-search-tree rule. Carry an exclusive lower bound and an exclusive upper bound. A null child is valid. A node that is not strictly inside those bounds is not. The left subtree receives the node's value as its upper bound, and the right subtree receives it as its lower bound. Checking only the two children misses a grandchild that breaks an ancestor. Equal values are invalid. An empty tree and a single node are valid.",
    "[2, 1, 3] is valid. [5, 1, 4, null, null, 3, 6] is not, because 4 sits in the right subtree of 5 and is smaller than 5. [10, 5, 15, null, null, 6, 20] also fails: 6 is smaller than its parent 15, so the parent link looks fine, but 6 is not greater than the root 10.",
  ),
  blocks(
    "heap-push",
    "pushMinHeap copies the min-heap array, appends value, and sifts that index up. The parent of an index i greater than 0 is Math.floor((i - 1) / 2). Swap while the index is not the root and its value is strictly less than its parent. Stop when the parent is less than or equal to the value. Equal values do not swap. Do not mutate the input heap, and do not sort the copy.",
    "[1, 3, 5] with 2 returns [1, 2, 5, 3]: 2 swaps with 3 and then stops under 1. An empty heap returns an array of just the new value. Pushing 0 onto [1] returns [0, 1]. Pushing 7 onto [1, 3, 5] is already in order and returns [1, 3, 5, 7].",
  ),
];

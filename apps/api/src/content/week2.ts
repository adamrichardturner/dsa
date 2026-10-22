import type { SeedModule } from "./types.js";
import { bitesize } from "./bitesize.js";

const reverseStarter = `class ListNode {
  value: number;
  next: ListNode | null;

  constructor(value: number, next: ListNode | null = null) {
    this.value = value;
    this.next = next;
  }
}

function fromArray(values: number[]): ListNode | null {
  let head: ListNode | null = null;

  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (value === undefined) {
      continue;
    }
    head = new ListNode(value, head);
  }

  return head;
}

function toArray(head: ListNode | null): number[] {
  const values: number[] = [];
  let current = head;

  while (current !== null) {
    values.push(current.value);
    current = current.next;
  }

  return values;
}

export function reverseValues(values: number[]): number[] {
  const head = fromArray(values);
  return toArray(head);
}
`;

export const week2: SeedModule = {
  id: "core-structures",
  title: "Core structures",
  summary:
    "Lists, stacks, queues, recursion, search, and a sort you can explain.",
  weekNumber: 2,
  lessons: [
    {
      id: "linked-lists",
      slug: "linked-lists",
      title: "Linked lists",
      summary: "Nodes, a next pointer, and no random access.",
      estimatedMinutes: 40,
      bitesizeMd: bitesize.linkedLists,
      contentMd: `
An array stores neighbours in neighbouring memory. A linked list stores a **node**: a value, plus a reference to the next node. The list itself is just the reference to the first node, called the head. The last node's \`next\` is \`null\`.

You cannot jump to the 10th node. You walk from the head, which is O(n). Inserting after a node you already hold is O(1), because you only rewire two pointers. That is the whole trade against arrays.

Reversing a list is the exercise that makes the pointers feel real. Keep three names in your head:

- \`previous\` starts as \`null\`
- \`current\` starts at the head
- \`next\` is saved before you overwrite \`current.next\`

For each node, point \`current.next\` at \`previous\`, then step all three forward. When \`current\` becomes \`null\`, \`previous\` is the new head.

The starter code turns an array into nodes and back again, so the tests can stay simple. Reverse the nodes. Calling \`.reverse()\` on the array skips the lesson, and the runner rejects it.
      `.trim(),
      problems: [
        {
          id: "reverse-values",
          title: "Reverse a linked list",
          topic: "Linked lists",
          difficulty: "easy",
          functionName: "reverseValues",
          disallow: [".reverse(", ".toReversed("],
          immutableArgs: [0],
          distinctArrayReturnFromArg: 0,
          promptMd: `
\`reverseValues(values)\` receives an array of numbers. The starter code converts it to a singly linked list, then converts the returned list back to an array.

**Requirements**

1. Reverse the linked list in place by changing each node's \`next\` reference.
2. Use the iterative three-pointer technique: track the previous node, current node, and saved next node.
3. Return the reversed list's values by passing its new head to \`toArray\`.
4. Do not mutate \`values\` or create replacement nodes.

**Inputs and output**

- \`values\` may be empty and may contain duplicate or negative numbers.
- Return a new \`number[]\` in the exact reverse order.
- An empty input returns \`[]\`; a one-element input returns the same single value.

**Complexity**

- Visit each node once: O(n) time.
- Use O(1) auxiliary space apart from the output produced by \`toArray\`.

**Forbidden shortcuts**

- Do not reverse or rebuild the input array.
- Do not call \`Array.prototype.reverse\` or \`toReversed\`; the runner rejects both.
          `.trim(),
          starterCode: reverseStarter,
          tests: [
            {
              name: "three nodes",
              args: [[1, 2, 3]],
              expected: [3, 2, 1],
              public: true,
            },
            {
              name: "one node",
              args: [[4]],
              expected: [4],
              public: true,
            },
            {
              name: "empty",
              args: [[]],
              expected: [],
              public: false,
            },
            {
              name: "longer",
              args: [[8, 1, 4, 2]],
              expected: [2, 4, 1, 8],
              public: false,
            },
            {
              name: "duplicates and negatives",
              args: [[-3, 0, -3, 9, 9]],
              expected: [9, 9, -3, 0, -3],
              public: false,
            },
            {
              name: "two nodes",
              args: [[10, -1]],
              expected: [-1, 10],
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "stacks",
      slug: "stacks",
      title: "Stacks",
      summary: "Last in, first out. The call stack is one.",
      estimatedMinutes: 30,
      bitesizeMd: bitesize.stacks,
      contentMd: `
A stack is a list where you only touch the most recently added item. \`push\` adds, \`pop\` removes. Both are O(1) at the end of an array, so a TypeScript array is a perfectly good stack. You just agree not to touch the middle.

The call stack that runs your functions is the same structure. Each call pushes a frame. A return pops it. Recursion in the next lesson is a stack you do not manage yourself.

The bracket checker is the standard practice problem. Scan the string once.

- An opening bracket \`(\`, \`[\`, or \`{\` is pushed.
- A closing bracket pops the stack. The popped opener must be the match. \`)\` matches \`(\`, and so on.
- If you need to pop an empty stack, or the opener does not match, the string is unbalanced.
- At the end the stack must be empty. A leftover opener means something was never closed.

\`([])\` is balanced. \`([)]\` is not, because the square bracket is closed while the parenthesis is still open. The stack remembers the order the openings arrived.
      `.trim(),
      problems: [
        {
          id: "is-balanced",
          title: "Balanced brackets",
          topic: "Stacks",
          difficulty: "easy",
          functionName: "isBalanced",
          disallow: [],
          promptMd: `
\`isBalanced(value)\` determines whether a string of brackets is correctly nested.

**Requirements**

1. Scan \`value\` once from left to right.
2. Push each opening bracket onto a stack.
3. For each closing bracket, return \`false\` if the stack is empty or its top is not the matching opener.
4. Return \`true\` only when the stack is empty after the scan.

**Inputs and output**

- \`value\` contains only \`(\`, \`)\`, \`[\`, \`]\`, \`{\`, and \`}\`.
- Return a boolean.
- The empty string is balanced.
- Every opener must be closed in last-in, first-out order; equal counts alone are not sufficient.

**Complexity**

- O(n) time and O(n) space in the worst case.

**Forbidden shortcuts**

- Do not repeatedly replace or remove bracket pairs. Use one stack and one pass, as taught in the lesson.
- No built-in is banned; ordinary array \`push\` and \`pop\` are the intended stack operations.
          `.trim(),
          starterCode: `export function isBalanced(value: string): boolean {
  return false;
}
`,
          tests: [
            {
              name: "nested",
              args: ["([])"],
              expected: true,
              public: true,
            },
            {
              name: "crossed",
              args: ["([)]"],
              expected: false,
              public: true,
            },
            {
              name: "empty",
              args: [""],
              expected: true,
              public: false,
            },
            {
              name: "leftover opener",
              args: ["{[]"],
              expected: false,
              public: false,
            },
            {
              name: "closes too soon",
              args: [")("],
              expected: false,
              public: false,
            },
            {
              name: "adjacent pairs",
              args: ["()[]{}"],
              expected: true,
              public: false,
            },
            {
              name: "deeply nested",
              args: ["{[(()[])]}"],
              expected: true,
              public: false,
            },
            {
              name: "correct counts wrong order",
              args: ["{[(])}"],
              expected: false,
              public: false,
            },
            {
              name: "single opener",
              args: ["["],
              expected: false,
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "queues",
      slug: "queues",
      title: "Queues",
      summary: "First in, first out. Breadth-first search is waiting on this.",
      estimatedMinutes: 30,
      bitesizeMd: bitesize.queues,
      contentMd: `
A queue serves items in arrival order. \`enqueue\` adds at the back, \`dequeue\` removes from the front. A printer queue, a checkout line, and breadth-first search are the same rule.

A TypeScript array can do this with \`push\` and \`shift\`. Be honest about the cost: \`shift\` moves every later element, so it is O(n). For the sizes in this course that is fine. A real deque, or two stacks used as a queue, makes both ends O(1). Know the gap, and do not reach for a clever queue until \`shift\` shows up in a hot loop.

This exercise is the fixed window from last week, seen from the queue's side. Keep the most recent values. When a new value arrives, enqueue it. If the queue is now longer than the window, dequeue the oldest. The sum of what remains is the answer for that step.

You will use a queue again, unchanged, when graphs ask for the shortest path. The structure is the same. Only the payload changes.
      `.trim(),
      problems: [
        {
          id: "window-sums",
          title: "Window sums",
          topic: "Queues",
          difficulty: "easy",
          functionName: "windowSums",
          disallow: [".reduce(", ".slice("],
          immutableArgs: [0],
          distinctArrayReturnFromArg: 0,
          promptMd: `
\`windowSums(values, window)\` reports the running sum of the most recent values.

**Requirements**

1. Process \`values\` once from left to right.
2. Enqueue each new value and add it to a running sum.
3. When the queue contains more than \`window\` items, dequeue the oldest value and subtract it.
4. Append the current sum after processing each input value.

\`windowSums([1, 2, 3, 4], 2)\` is \`[1, 3, 5, 7]\`.

**Inputs and output**

- \`window\` is always a positive integer.
- \`values\` may be empty and may contain negative numbers, zero, and duplicates.
- Return one sum per input element. Before \`window\` values have arrived, sum all values seen so far.
- If \`window\` exceeds the input length, the result is the sequence of prefix sums.
- Do not mutate \`values\`.

**Complexity**

- Use one pass and maintain the sum incrementally; do not recompute a window's sum.
- Target O(n) time with a queue implementation that removes from the front efficiently. Using array \`shift\` is accepted for this introductory queue exercise.
- Use O(window) auxiliary space, excluding the returned array.

**Forbidden shortcuts**

- Do not build each window with \`slice\` or recompute it with \`reduce\`; the runner rejects both.
          `.trim(),
          starterCode: `export function windowSums(values: number[], window: number): number[] {
  return [];
}
`,
          tests: [
            {
              name: "window of two",
              args: [[1, 2, 3, 4], 2],
              expected: [1, 3, 5, 7],
              public: true,
            },
            {
              name: "window of one",
              args: [[4, 5], 1],
              expected: [4, 5],
              public: true,
            },
            {
              name: "window wider than input",
              args: [[2, 2, 2], 10],
              expected: [2, 4, 6],
              public: false,
            },
            {
              name: "empty",
              args: [[], 3],
              expected: [],
              public: false,
            },
            {
              name: "negative values",
              args: [[5, -2, -7, 4, 3], 3],
              expected: [5, 3, -4, -5, 0],
              public: false,
            },
            {
              name: "zeros and duplicates",
              args: [[0, 0, 2, 2, 0], 2],
              expected: [0, 0, 2, 4, 2],
              public: false,
            },
            {
              name: "exactly input length",
              args: [[3, -1, 4, -2], 4],
              expected: [3, 2, 6, 4],
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "recursion",
      slug: "recursion",
      title: "Recursion",
      summary: "A function that solves a smaller version of the same problem.",
      estimatedMinutes: 35,
      bitesizeMd: bitesize.recursion,
      contentMd: `
A recursive function calls itself. Each call must be **smaller**, and there must be a **base case** that stops. Without the base case the call stack grows until it overflows. The stack from the previous lesson is doing the bookkeeping.

Flattening a nested array is a good fit because the shape of the data is already recursive. A value is either a number, or an array of values with the same rule.

\`[1, [2, [3], 4], 5]\` becomes \`[1, 2, 3, 4, 5]\`.

The function:

- if the value is a number, that number is the whole result
- if the value is an array, flatten each element and concatenate

The empty array is a base case too. It flattens to an empty array.

You could write the same walk with an explicit stack. Recursion is that stack, hidden inside the calls. Trees later in the course are awkward to walk without it, so it is worth becoming comfortable now. If you can say the base case in a sentence before you write the function, the rest usually follows.
      `.trim(),
      problems: [
        {
          id: "flatten",
          title: "Flatten nested numbers",
          topic: "Recursion",
          difficulty: "easy",
          functionName: "flatten",
          disallow: [".flat(", ".flatMap("],
          immutableArgs: [0],
          distinctArrayReturnFromArg: 0,
          promptMd: `
\`Nested\` is recursive: each value is either a number or an array containing more \`Nested\` values. Implement \`flatten(value)\` recursively.

**Requirements**

1. If \`value\` is a number, return an array containing that number.
2. Create one result array in \`flatten\`, then pass it to a recursive helper as a shared accumulator.
3. If \`value\` is an array, recursively append each element from left to right without creating and repeatedly copying partial result arrays.
4. Preserve every number, including duplicates, zero, and negative values, in encounter order.

\`flatten([1, [2, [3], 4], 5])\` is \`[1, 2, 3, 4, 5]\`.

**Inputs and output**

- The input can be a single number, an empty array, or arrays nested to different depths.
- Return a flat \`number[]\`. Empty arrays contribute no values.

**Complexity**

- Visit each nested array entry once: O(n) time, where n counts numbers and array entries.
- Recursion uses O(d) call-stack space for nesting depth d, plus the returned array.

**Forbidden shortcuts**

- Do not call \`flat\` or \`flatMap\`; the runner rejects both.
- Use recursion rather than JSON/string conversion or an explicit replacement stack.
          `.trim(),
          starterCode: `type Nested = number | Nested[];

export function flatten(value: Nested): number[] {
  return [];
}
`,
          tests: [
            {
              name: "mixed nesting",
              args: [[1, [2, [3], 4], 5]],
              expected: [1, 2, 3, 4, 5],
              public: true,
            },
            {
              name: "a single number",
              args: [7],
              expected: [7],
              public: true,
            },
            {
              name: "empty",
              args: [[]],
              expected: [],
              public: false,
            },
            {
              name: "only nesting",
              args: [[[[1]], [2]]],
              expected: [1, 2],
              public: false,
            },
            {
              name: "empty branches",
              args: [[[], [1, [], [2]], [], 3]],
              expected: [1, 2, 3],
              public: false,
            },
            {
              name: "duplicates negatives and zero",
              args: [[0, [-1, [-1]], 0]],
              expected: [0, -1, -1, 0],
              public: false,
            },
            {
              name: "uneven depth",
              args: [[[[[[5]]]], 4, [3, [[2]]], 1]],
              expected: [5, 4, 3, 2, 1],
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "binary-search",
      slug: "binary-search",
      title: "Binary search",
      summary: "Halve a sorted range until the value has nowhere to hide.",
      estimatedMinutes: 35,
      bitesizeMd: bitesize.binarySearch,
      contentMd: `
Linear search checks every index. If the array is sorted, you can do better. Look at the middle. If the target is smaller, it cannot be in the right half. If it is larger, it cannot be in the left half. Each comparison throws away half of what remains, which is O(log n) comparisons. A million elements takes about twenty steps.

The bugs are all off-by-one. Keep an invariant you can say out loud: **if the target is present, its index is between \`lo\` and \`hi\` inclusive**.

\`\`\`ts
let lo = 0;
let hi = nums.length - 1;

while (lo <= hi) {
  const mid = lo + Math.floor((hi - lo) / 2);
  const value = nums[mid];
  // move lo or hi, and keep the invariant
}
\`\`\`

\`lo + Math.floor((hi - lo) / 2)\` is the safe middle. \`(lo + hi) / 2\` can overflow in languages with fixed-width integers. JavaScript will not overflow here, and the first form is still the one to learn.

If \`nums[mid]\` is the target, return \`mid\`. If the target is smaller, the answer is at most \`mid - 1\`. If it is larger, the answer is at least \`mid + 1\`. When the loop ends, the target is absent. Return \`-1\`.

The array must be sorted. Binary search on unsorted data is not "usually fine". It is wrong.
      `.trim(),
      problems: [
        {
          id: "binary-search",
          title: "Binary search",
          topic: "Binary search",
          difficulty: "easy",
          functionName: "search",
          disallow: [".includes(", ".indexOf(", ".findIndex(", ".find("],
          immutableArgs: [0],
          promptMd: `
\`search(nums, target)\` finds a number in a sorted array.

**Requirements**

1. Keep inclusive lower and upper bounds for the remaining search range.
2. Inspect the middle element on each iteration.
3. Return its index immediately when it equals \`target\`.
4. Otherwise discard the half that cannot contain \`target\`.
5. Return \`-1\` when the bounds cross.

**Inputs and output**

- \`nums\` is sorted in ascending numeric order and contains no duplicates.
- It may be empty and may contain negative numbers.
- Return the zero-based index of \`target\`, or \`-1\` when absent.

**Complexity**

- Use iterative or recursive binary search in O(log n) time.
- Use O(1) auxiliary space for the iterative approach, or O(log n) call-stack space for recursion.

**Forbidden shortcuts**

- Do not use \`includes\`, \`indexOf\`, \`find\`, or \`findIndex\`; the runner rejects them.
- Do not sort the input or scan every element linearly.
          `.trim(),
          starterCode: `export function search(nums: number[], target: number): number {
  return -1;
}
`,
          tests: [
            {
              name: "present",
              args: [[1, 3, 5, 7, 9], 7],
              expected: 3,
              public: true,
            },
            {
              name: "absent",
              args: [[1, 3, 5, 7, 9], 4],
              expected: -1,
              public: true,
            },
            {
              name: "first element",
              args: [[2, 4, 6], 2],
              expected: 0,
              public: false,
            },
            {
              name: "empty",
              args: [[], 1],
              expected: -1,
              public: false,
            },
            {
              name: "last element",
              args: [[-8, -3, 0, 4, 11, 20], 20],
              expected: 5,
              public: false,
            },
            {
              name: "single present",
              args: [[6], 6],
              expected: 0,
              public: false,
            },
            {
              name: "single absent",
              args: [[6], -6],
              expected: -1,
              public: false,
            },
            {
              name: "below range",
              args: [[2, 5, 8, 13, 21], -1],
              expected: -1,
              public: false,
            },
            {
              name: "between adjacent values",
              args: [[-10, -2, 3, 9, 15, 22, 31, 45], 16],
              expected: -1,
              public: false,
            },
          ],
        },
      ],
    },
    {
      id: "sorting",
      slug: "sorting",
      title: "Merge sort",
      summary: "Split, sort the halves, then merge them in order.",
      estimatedMinutes: 40,
      bitesizeMd: bitesize.sorting,
      contentMd: `
You can call \`nums.sort()\` and often should. This lesson is about knowing what that call is doing, well enough to reimplement one honest O(n log n) sort.

Bubble sort swaps neighbours until the array settles. It is easy to remember and O(n²). Merge sort is the one to keep.

1. If the array has fewer than two elements, it is already sorted. That is the base case.
2. Split it into two halves.
3. Sort each half by calling merge sort.
4. Merge the two sorted halves into one sorted array.

The merge is two pointers, one on each half. Repeatedly take the smaller head. When one half runs out, append the rest of the other. Each element is written once, so merging two halves of total length n is O(n).

The split goes \`log n\` levels deep, and each level merges n elements in total. The product is O(n log n). The cost of the extra arrays is O(n) memory. Quicksort uses less memory and is what many standard libraries reach for; its worst case is worse, and its best explanation is longer. One sort you can draw is enough.

JavaScript's default \`sort\` compares values as strings unless you pass a compare function. \`[10, 2].sort()\` becomes \`[10, 2]\`. If you sort numbers in later exercises, pass \`(a, b) => a - b\`.
      `.trim(),
      problems: [
        {
          id: "merge-sort",
          title: "Merge sort",
          topic: "Sorting",
          difficulty: "medium",
          functionName: "mergeSort",
          disallow: [".sort(", ".toSorted("],
          immutableArgs: [0],
          distinctArrayReturnFromArg: 0,
          promptMd: `
\`mergeSort(nums)\` returns the numbers in ascending numeric order using merge sort.

**Requirements**

1. Treat arrays with fewer than two values as the recursive base case.
2. Split larger arrays into left and right halves.
3. Recursively sort both halves.
4. Merge the sorted halves with two indexes, always taking the smaller next value.
5. Append all remaining values when either half is exhausted.
6. Return a new array and do not mutate \`nums\`.

**Inputs and output**

- \`nums\` may be empty and may contain duplicates, negative numbers, and zero.
- Return every input number exactly once in ascending numeric order.

**Complexity**

- O(n log n) time.
- O(n) auxiliary array space, plus O(log n) recursive call-stack space.

**Forbidden shortcuts**

- Do not call \`sort\` or \`toSorted\`; the runner rejects both.
- Do not implement a quadratic sorting algorithm such as bubble sort or insertion sort.
          `.trim(),
          starterCode: `export function mergeSort(nums: number[]): number[] {
  return [];
}
`,
          tests: [
            {
              name: "unsorted",
              args: [[5, 1, 4, 2, 8]],
              expected: [1, 2, 4, 5, 8],
              public: true,
            },
            {
              name: "duplicates",
              args: [[3, 1, 3, 2]],
              expected: [1, 2, 3, 3],
              public: true,
            },
            {
              name: "already sorted",
              args: [[1, 2, 3]],
              expected: [1, 2, 3],
              public: false,
            },
            {
              name: "empty",
              args: [[]],
              expected: [],
              public: false,
            },
            {
              name: "negatives",
              args: [[0, -2, 4, -2]],
              expected: [-2, -2, 0, 4],
              public: false,
            },
            {
              name: "two reversed",
              args: [[2, 1]],
              expected: [1, 2],
              public: false,
            },
            {
              name: "all equal",
              args: [[7, 7, 7, 7, 7]],
              expected: [7, 7, 7, 7, 7],
              public: false,
            },
            {
              name: "mixed signs and duplicates",
              args: [[12, -5, 0, 12, 3, -100, 3, 8, -5]],
              expected: [-100, -5, -5, 0, 3, 3, 8, 12, 12],
              public: false,
            },
            {
              name: "reverse sorted odd length",
              args: [[9, 7, 5, 3, 1, -1, -3]],
              expected: [-3, -1, 1, 3, 5, 7, 9],
              public: false,
            },
          ],
        },
      ],
    },
  ],
};

import { extraReferenceCode } from "./references-extra";

const lessonReferenceCode: Record<string, string> = {
  complexity: `export function countBelow(nums: number[], limit: number): number {
  let count = 0;

  for (const value of nums) {
    if (value < limit) {
      count += 1;
    }
  }

  return count;
}

console.log(countBelow([1, 4, 2, 8], 4));
console.log(countBelow([5, 6], 3));
`,

  arrays: `export function rotateLeft(nums: number[], steps: number): number[] {
  if (nums.length === 0) {
    return [];
  }

  const offset = steps % nums.length;
  const rotated = nums.slice(offset).concat(nums.slice(0, offset));
  return rotated;
}

console.log(rotateLeft([1, 2, 3, 4], 1));
console.log(rotateLeft([1, 2, 3], 4));
`,

  "hash-maps": `export function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();

  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    if (value === undefined) {
      continue;
    }

    const previous = seen.get(target - value);
    if (previous !== undefined) {
      return [previous, index];
    }

    seen.set(value, index);
  }

  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));
console.log(twoSum([3, 2, 4], 6));
`,

  "two-pointers": `export function sortedSquares(nums: number[]): number[] {
  const squares: number[] = [];
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const low = nums[left];
    const high = nums[right];
    if (low === undefined || high === undefined) {
      break;
    }

    const leftSquare = low * low;
    const rightSquare = high * high;
    if (leftSquare > rightSquare) {
      squares.push(leftSquare);
      left += 1;
      continue;
    }

    squares.push(rightSquare);
    right -= 1;
  }

  const ordered: number[] = [];
  for (let index = squares.length - 1; index >= 0; index -= 1) {
    const value = squares[index];
    if (value === undefined) {
      continue;
    }
    ordered.push(value);
  }

  return ordered;
}

console.log(sortedSquares([-4, -1, 0, 3, 10]));
console.log(sortedSquares([-7, -3, -1]));
`,

  "sliding-window": `export function maxWindowSum(nums: number[], k: number): number {
  if (k < 1 || k > nums.length) {
    return 0;
  }

  let sum = 0;
  for (let index = 0; index < k; index += 1) {
    sum += nums[index] ?? 0;
  }

  let best = sum;
  for (let index = k; index < nums.length; index += 1) {
    const entering = nums[index] ?? 0;
    const leaving = nums[index - k] ?? 0;
    sum += entering - leaving;
    if (sum > best) {
      best = sum;
    }
  }

  return best;
}

console.log(maxWindowSum([2, 1, 5, 1, 3, 2], 3));
console.log(maxWindowSum([4, 2], 3));
`,

  "linked-lists": `class ListNode {
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
  let previous: ListNode | null = null;
  let current = fromArray(values);

  while (current !== null) {
    const next = current.next;
    current.next = previous;
    previous = current;
    current = next;
  }

  return toArray(previous);
}

console.log(reverseValues([1, 2, 3]));
console.log(reverseValues([4]));
`,

  stacks: `export function isBalanced(value: string): boolean {
  const match: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };
  const stack: string[] = [];

  for (const character of value) {
    const opener = match[character];
    if (opener === undefined) {
      stack.push(character);
      continue;
    }

    const last = stack.pop();
    if (last !== opener) {
      return false;
    }
  }

  return stack.length === 0;
}

console.log(isBalanced("([])"));
console.log(isBalanced("([)]"));
`,

  queues: `export function windowSums(values: number[], window: number): number[] {
  const queue: number[] = [];
  const sums: number[] = [];
  let sum = 0;

  for (const value of values) {
    queue.push(value);
    sum += value;

    if (queue.length > window) {
      const removed = queue.shift();
      sum -= removed ?? 0;
    }

    sums.push(sum);
  }

  return sums;
}

console.log(windowSums([1, 2, 3, 4], 2));
console.log(windowSums([4, 5], 1));
`,

  recursion: `type Nested = number | Nested[];

function appendNumbers(value: Nested, numbers: number[]): void {
  if (typeof value === "number") {
    numbers.push(value);
    return;
  }

  for (const item of value) {
    appendNumbers(item, numbers);
  }
}

export function flatten(value: Nested): number[] {
  const numbers: number[] = [];
  appendNumbers(value, numbers);
  return numbers;
}

console.log(flatten([1, [2, [3], 4], 5]));
console.log(flatten(7));
`,

  "binary-search": `export function search(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = nums[mid];
    if (value === undefined) {
      return -1;
    }
    if (value === target) {
      return mid;
    }
    if (target < value) {
      hi = mid - 1;
      continue;
    }
    lo = mid + 1;
  }

  return -1;
}

console.log(search([1, 3, 5, 7, 9], 7));
console.log(search([1, 3, 5, 7, 9], 4));
`,

  sorting: `function merge(left: readonly number[], right: readonly number[]): number[] {
  const merged: number[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    const a = left[i];
    const b = right[j];
    if (a === undefined || b === undefined) {
      break;
    }
    if (a <= b) {
      merged.push(a);
      i += 1;
      continue;
    }
    merged.push(b);
    j += 1;
  }

  while (i < left.length) {
    const value = left[i];
    i += 1;
    if (value !== undefined) {
      merged.push(value);
    }
  }

  while (j < right.length) {
    const value = right[j];
    j += 1;
    if (value !== undefined) {
      merged.push(value);
    }
  }

  return merged;
}

export function mergeSort(nums: number[]): number[] {
  if (nums.length < 2) {
    return nums.slice();
  }

  const mid = Math.floor(nums.length / 2);
  const left = mergeSort(nums.slice(0, mid));
  const right = mergeSort(nums.slice(mid));
  return merge(left, right);
}

console.log(mergeSort([5, 1, 4, 2, 8]));
console.log(mergeSort([0, -2, 4, -2]));
`,

  trees: `class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(
    value: number,
    left: TreeNode | null = null,
    right: TreeNode | null = null,
  ) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function buildTree(values: Array<number | null>): TreeNode | null {
  const first = values[0];
  if (first === undefined || first === null) {
    return null;
  }

  const root = new TreeNode(first);
  const queue: TreeNode[] = [root];
  let index = 1;

  while (queue.length > 0 && index < values.length) {
    const node = queue.shift();
    if (node === undefined) {
      return root;
    }

    const leftValue = values[index];
    index += 1;
    if (leftValue !== undefined && leftValue !== null) {
      node.left = new TreeNode(leftValue);
      queue.push(node.left);
    }

    const rightValue = values[index];
    index += 1;
    if (rightValue !== undefined && rightValue !== null) {
      node.right = new TreeNode(rightValue);
      queue.push(node.right);
    }
  }

  return root;
}

function depth(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }

  const left = depth(node.left);
  const right = depth(node.right);
  if (left > right) {
    return left + 1;
  }
  return right + 1;
}

export function maxDepth(values: Array<number | null>): number {
  return depth(buildTree(values));
}

console.log(maxDepth([3, 9, 20, null, null, 15, 7]));
console.log(maxDepth([1]));
`,

  "binary-search-trees": `class TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(
    value: number,
    left: TreeNode | null = null,
    right: TreeNode | null = null,
  ) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function insert(node: TreeNode | null, value: number): TreeNode {
  if (node === null) {
    return new TreeNode(value);
  }
  if (value < node.value) {
    node.left = insert(node.left, value);
    return node;
  }
  node.right = insert(node.right, value);
  return node;
}

function contains(node: TreeNode | null, target: number): boolean {
  if (node === null) {
    return false;
  }
  if (node.value === target) {
    return true;
  }
  if (target < node.value) {
    return contains(node.left, target);
  }
  return contains(node.right, target);
}

export function bstContains(values: number[], target: number): boolean {
  let root: TreeNode | null = null;

  for (const value of values) {
    root = insert(root, value);
  }

  return contains(root, target);
}

console.log(bstContains([8, 3, 10, 1, 6], 6));
console.log(bstContains([8, 3, 10, 1, 6], 7));
`,

  heaps: `export function kthLargest(nums: number[], k: number): number {
  const heap: number[] = [];

  const swap = (left: number, right: number): void => {
    const saved = heap[left];
    const next = heap[right];
    if (saved === undefined || next === undefined) {
      return;
    }
    heap[left] = next;
    heap[right] = saved;
  };

  const bubbleUp = (start: number): void => {
    let index = start;

    while (index > 0) {
      const above = Math.floor((index - 1) / 2);
      const child = heap[index];
      const parent = heap[above];
      if (child === undefined || parent === undefined || child >= parent) {
        return;
      }
      swap(index, above);
      index = above;
    }
  };

  const bubbleDown = (start: number): void => {
    let index = start;

    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;
      const current = heap[smallest];
      const leftValue = heap[left];
      if (
        leftValue !== undefined &&
        current !== undefined &&
        leftValue < current
      ) {
        smallest = left;
      }
      const smallestValue = heap[smallest];
      const rightValue = heap[right];
      if (
        rightValue !== undefined &&
        smallestValue !== undefined &&
        rightValue < smallestValue
      ) {
        smallest = right;
      }
      if (smallest === index) {
        return;
      }
      swap(index, smallest);
      index = smallest;
    }
  };

  const push = (value: number): void => {
    heap.push(value);
    bubbleUp(heap.length - 1);
  };

  const pop = (): void => {
    const last = heap.pop();
    if (heap.length === 0 || last === undefined) {
      return;
    }
    heap[0] = last;
    bubbleDown(0);
  };

  for (const value of nums) {
    push(value);
    if (heap.length > k) {
      pop();
    }
  }

  return heap[0] ?? 0;
}

console.log(kthLargest([3, 2, 1, 5, 6, 4], 2));
console.log(kthLargest([2, 2], 2));
`,

  graphs: `export function shortestPath(
  edges: number[][],
  start: number,
  end: number,
): number {
  if (start === end) {
    return 0;
  }

  const neighbours: Record<string, number[]> = {};

  const add = (from: number, to: number): void => {
    const key = String(from);
    const list = neighbours[key] ?? [];
    list.push(to);
    neighbours[key] = list;
  };

  for (const edge of edges) {
    const from = edge[0];
    const to = edge[1];
    if (from === undefined || to === undefined) {
      continue;
    }
    add(from, to);
    add(to, from);
  }

  const seen: Record<string, boolean> = {};
  const queue: { readonly vertex: number; readonly distance: number }[] = [
    { vertex: start, distance: 0 },
  ];
  seen[String(start)] = true;
  let head = 0;

  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    if (current === undefined) {
      continue;
    }

    const next = neighbours[String(current.vertex)] ?? [];
    for (const vertex of next) {
      if (seen[String(vertex)] === true) {
        continue;
      }
      if (vertex === end) {
        return current.distance + 1;
      }
      seen[String(vertex)] = true;
      queue.push({ vertex, distance: current.distance + 1 });
    }
  }

  return -1;
}

console.log(
  shortestPath(
    [
      [0, 1],
      [1, 2],
      [0, 2],
    ],
    0,
    2,
  ),
);
console.log(shortestPath([[0, 1]], 0, 2));
`,

  greedy: `export function maxNonOverlapping(intervals: number[][]): number {
  const ordered = intervals.slice();
  ordered.sort((left, right) => {
    const leftEnd = left[1] ?? 0;
    const rightEnd = right[1] ?? 0;
    return leftEnd - rightEnd;
  });

  let count = 0;
  let finish = Number.NEGATIVE_INFINITY;

  for (const interval of ordered) {
    const start = interval[0];
    const end = interval[1];
    if (start === undefined || end === undefined) {
      continue;
    }
    if (start < finish) {
      continue;
    }
    count += 1;
    finish = end;
  }

  return count;
}

console.log(
  maxNonOverlapping([
    [1, 3],
    [2, 4],
    [3, 5],
  ]),
);
console.log(
  maxNonOverlapping([
    [1, 2],
    [2, 4],
  ]),
);
`,

  backtracking: `export function subsets(nums: number[]): number[][] {
  const results: number[][] = [];
  const path: number[] = [];

  const walk = (index: number): void => {
    if (index === nums.length) {
      results.push(path.slice());
      return;
    }

    walk(index + 1);
    const value = nums[index];
    if (value === undefined) {
      return;
    }
    path.push(value);
    walk(index + 1);
    path.pop();
  };

  walk(0);
  return results;
}

console.log(subsets([1, 2]));
`,

  "dynamic-programming": `export function climbStairs(n: number): number {
  if (n <= 2) {
    return n;
  }

  let previous = 1;
  let current = 2;

  for (let step = 3; step <= n; step += 1) {
    const next = previous + current;
    previous = current;
    current = next;
  }

  return current;
}

console.log(climbStairs(3));
console.log(climbStairs(5));
`,

  tries: `interface TrieNode {
  readonly children: Record<string, TrieNode>;
  isWord: boolean;
}

function createNode(): TrieNode {
  return { children: {}, isWord: false };
}

export function wordsFound(words: string[], queries: string[]): boolean[] {
  const root = createNode();

  const insert = (word: string): void => {
    let node = root;

    for (const character of word) {
      const existing = node.children[character];
      if (existing === undefined) {
        const created = createNode();
        node.children[character] = created;
        node = created;
        continue;
      }
      node = existing;
    }

    node.isWord = true;
  };

  const has = (word: string): boolean => {
    let node = root;

    for (const character of word) {
      const next = node.children[character];
      if (next === undefined) {
        return false;
      }
      node = next;
    }

    return node.isWord;
  };

  for (const word of words) {
    insert(word);
  }

  const found: boolean[] = [];
  for (const query of queries) {
    found.push(has(query));
  }
  return found;
}

console.log(wordsFound(["cat", "car"], ["cat", "cab", "car"]));
console.log(wordsFound(["carpet"], ["car", "carpet"]));
`,
};

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

const keyed: Record<string, string> = {};

for (const slug of Object.keys(lessonReferenceCode)) {
  const problemId = primaryProblemId[slug];
  const code = lessonReferenceCode[slug];
  if (problemId === undefined || code === undefined) {
    continue;
  }
  keyed[problemId] = code;
}

for (const problemId of Object.keys(extraReferenceCode)) {
  const code = extraReferenceCode[problemId];
  if (code === undefined) {
    continue;
  }
  keyed[problemId] = code;
}

export const referenceCode: Record<string, string> = keyed;

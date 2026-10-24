const listHelpers = `class ListNode {
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
`;

const treeHelpers = `class TreeNode {
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
`;

const bstHelpers = `class TreeNode {
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

function insert(root: TreeNode | null, value: number): TreeNode {
  if (root === null) {
    return new TreeNode(value);
  }
  if (value < root.value) {
    root.left = insert(root.left, value);
    return root;
  }
  if (value > root.value) {
    root.right = insert(root.right, value);
  }
  return root;
}

function fromValues(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  for (const value of values) {
    root = insert(root, value);
  }
  return root;
}
`;

const graphHelpers = `function neighboursOf(edges: number[][]): Record<string, number[]> {
  const neighbours: Record<string, number[]> = {};
  const add = (from: number, to: number) => {
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
  return neighbours;
}

function walk(edges: number[][], start: number): number {
  const neighbours = neighboursOf(edges);
  const seen: Record<string, true> = {};
  const queue = [start];
  seen[String(start)] = true;
  let count = 0;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current === undefined) {
      continue;
    }
    count += 1;
    const list = neighbours[String(current)] ?? [];
    for (let cursor = 0; cursor < list.length; cursor += 1) {
      const next = list[cursor];
      if (next === undefined) {
        continue;
      }
      const key = String(next);
      if (seen[key] === true) {
        continue;
      }
      seen[key] = true;
      queue.push(next);
    }
  }
  return count;
}
`;

export const extraReferenceCode: Record<string, string> = {
  "count-equal": `export function countEqual(nums: number[], target: number): number {
  let count = 0;
  for (const value of nums) {
    if (value === target) {
      count += 1;
    }
  }
  return count;
}
`,
  "reverse-copy": `export function reverseCopy(nums: number[]): number[] {
  const copy: number[] = [];
  for (let index = nums.length - 1; index >= 0; index -= 1) {
    const value = nums[index];
    if (value === undefined) {
      continue;
    }
    copy.push(value);
  }
  return copy;
}
`,
  "has-duplicate": `export function hasDuplicate(nums: number[]): boolean {
  const seen: Record<string, true> = {};
  for (const value of nums) {
    const key = String(value);
    if (seen[key] === true) {
      return true;
    }
    seen[key] = true;
  }
  return false;
}
`,
  "pair-sum": `export function hasPairSum(nums: number[], target: number): boolean {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const low = nums[left];
    const high = nums[right];
    if (low === undefined || high === undefined) {
      break;
    }
    const sum = low + high;
    if (sum === target) {
      return true;
    }
    if (sum < target) {
      left += 1;
      continue;
    }
    right -= 1;
  }
  return false;
}
`,
  "min-window-sum": `export function minWindowSum(nums: number[], k: number): number {
  if (k < 1 || k > nums.length) {
    return 0;
  }
  let sum = 0;
  for (let index = 0; index < k; index += 1) {
    sum += nums[index] ?? 0;
  }
  let best = sum;
  for (let index = k; index < nums.length; index += 1) {
    sum += (nums[index] ?? 0) - (nums[index - k] ?? 0);
    if (sum < best) {
      best = sum;
    }
  }
  return best;
}
`,
  "list-sum": `${listHelpers}
export function listSum(values: number[]): number {
  let total = 0;
  let current = fromArray(values);
  while (current !== null) {
    total += current.value;
    current = current.next;
  }
  return total;
}
`,
  "adjacent-duplicates": `export function removeAdjacent(value: string): string {
  const stack: string[] = [];
  for (const character of value) {
    const top = stack[stack.length - 1];
    if (top === character) {
      stack.pop();
      continue;
    }
    stack.push(character);
  }
  return stack.join("");
}
`,
  "recent-values": `export function recentValues(values: number[], window: number): number[][] {
  const queue: number[] = [];
  const snapshots: number[][] = [];
  for (const value of values) {
    queue.push(value);
    if (queue.length > window) {
      queue.shift();
    }
    snapshots.push(queue.slice());
  }
  return snapshots;
}
`,
  "sum-nested": `type Nested = number | Nested[];

export function sumNested(value: Nested): number {
  if (typeof value === "number") {
    return value;
  }
  let total = 0;
  for (const child of value) {
    total += sumNested(child);
  }
  return total;
}
`,
  "search-insert": `export function searchInsert(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = nums[mid];
    if (value === undefined || value < target) {
      lo = mid + 1;
      continue;
    }
    hi = mid;
  }
  return lo;
}
`,
  "merge-sorted": `export function mergeSorted(left: number[], right: number[]): number[] {
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
    if (value !== undefined) {
      merged.push(value);
    }
    i += 1;
  }
  while (j < right.length) {
    const value = right[j];
    if (value !== undefined) {
      merged.push(value);
    }
    j += 1;
  }
  return merged;
}
`,
  "count-nodes": `${treeHelpers}
function count(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  return 1 + count(node.left) + count(node.right);
}

export function countNodes(values: Array<number | null>): number {
  return count(buildTree(values));
}
`,
  "bst-min": `${bstHelpers}
export function bstMin(values: number[]): number | null {
  let current = fromValues(values);
  if (current === null) {
    return null;
  }
  while (current.left !== null) {
    current = current.left;
  }
  return current.value;
}
`,
  "is-min-heap": `export function isMinHeap(nums: number[]): boolean {
  for (let index = 1; index < nums.length; index += 1) {
    const parent = Math.floor((index - 1) / 2);
    const value = nums[index];
    const parentValue = nums[parent];
    if (value === undefined || parentValue === undefined) {
      continue;
    }
    if (parentValue > value) {
      return false;
    }
  }
  return true;
}
`,
  "can-reach": `${graphHelpers}
export function canReach(
  edges: number[][],
  start: number,
  end: number,
): boolean {
  if (start === end) {
    return true;
  }
  const neighbours = neighboursOf(edges);
  const seen: Record<string, true> = {};
  const queue = [start];
  seen[String(start)] = true;
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current === undefined) {
      continue;
    }
    if (current === end) {
      return true;
    }
    const list = neighbours[String(current)] ?? [];
    for (let cursor = 0; cursor < list.length; cursor += 1) {
      const next = list[cursor];
      if (next === undefined) {
        continue;
      }
      const key = String(next);
      if (seen[key] === true) {
        continue;
      }
      seen[key] = true;
      queue.push(next);
    }
  }
  return false;
}
`,
  "can-attend-all": `export function canAttendAll(intervals: number[][]): boolean {
  const ordered = intervals.slice().sort((left, right) => {
    return (left[0] ?? 0) - (right[0] ?? 0);
  });
  let previousEnd = Number.NEGATIVE_INFINITY;
  for (const interval of ordered) {
    const start = interval[0];
    const end = interval[1];
    if (start === undefined || end === undefined) {
      continue;
    }
    if (start < previousEnd) {
      return false;
    }
    previousEnd = end;
  }
  return true;
}
`,
  "count-subsets": `export function countSubsets(nums: number[]): number {
  const countFrom = (index: number): number => {
    if (index === nums.length) {
      return 1;
    }
    return countFrom(index + 1) + countFrom(index + 1);
  };
  return countFrom(0);
}
`,
  "min-cost-climb": `export function minCostClimb(cost: number[]): number {
  let prev2 = 0;
  let prev1 = 0;
  for (const step of cost) {
    const next = step + Math.min(prev2, prev1);
    prev2 = prev1;
    prev1 = next;
  }
  return Math.min(prev2, prev1);
}
`,
  "has-prefix": `interface PrefixNode {
  children: Record<string, PrefixNode>;
  passes: number;
}

function prefixNode(): PrefixNode {
  return { children: {}, passes: 0 };
}

export function hasPrefix(words: string[], queries: string[]): boolean[] {
  const root = prefixNode();
  for (const word of words) {
    let node = root;
    node.passes += 1;
    for (const character of word) {
      const next = node.children[character] ?? prefixNode();
      node.children[character] = next;
      node = next;
      node.passes += 1;
    }
  }
  const found: boolean[] = [];
  for (const query of queries) {
    let node = root;
    let missing = false;
    for (const character of query) {
      const next = node.children[character];
      if (next === undefined) {
        missing = true;
        break;
      }
      node = next;
    }
    if (missing) {
      found.push(false);
      continue;
    }
    if (query.length === 0) {
      found.push(words.length > 0);
      continue;
    }
    found.push(node.passes > 0);
  }
  return found;
}
`,
  "ascending-pairs": `export function countAscendingPairs(nums: number[]): number {
  let count = 0;
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = i + 1; j < nums.length; j += 1) {
      const left = nums[i];
      const right = nums[j];
      if (left === undefined || right === undefined) {
        continue;
      }
      if (left < right) {
        count += 1;
      }
    }
  }
  return count;
}
`,
  "equal-pairs": `export function countEqualPairs(nums: number[]): number {
  let count = 0;
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = i + 1; j < nums.length; j += 1) {
      if (nums[i] === nums[j]) {
        count += 1;
      }
    }
  }
  return count;
}
`,
  "remove-at": `export function removeAt(nums: number[], index: number): number[] {
  const next: number[] = [];
  for (let cursor = 0; cursor < nums.length; cursor += 1) {
    if (cursor === index) {
      continue;
    }
    const value = nums[cursor];
    if (value === undefined) {
      continue;
    }
    next.push(value);
  }
  return next;
}
`,
  "insert-at": `export function insertAt(
  nums: number[],
  index: number,
  value: number,
): number[] {
  const next: number[] = [];
  let placed = index < 0;
  if (placed) {
    next.push(value);
  }
  for (let cursor = 0; cursor < nums.length; cursor += 1) {
    if (!placed && cursor === index) {
      next.push(value);
      placed = true;
    }
    const current = nums[cursor];
    if (current === undefined) {
      continue;
    }
    next.push(current);
  }
  if (!placed) {
    next.push(value);
  }
  return next;
}
`,
  "frequency-of": `export function frequencyOf(nums: number[], target: number): number {
  const counts: Record<string, number> = {};
  for (const value of nums) {
    const key = String(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts[String(target)] ?? 0;
}
`,
  "most-frequent": `export function mostFrequent(nums: number[]): number {
  const counts: Record<string, number> = {};
  const firstAt: Record<string, number> = {};
  let best = nums[0] ?? 0;
  let bestCount = 0;
  let bestFirst = 0;
  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    if (value === undefined) {
      continue;
    }
    const key = String(value);
    if (firstAt[key] === undefined) {
      firstAt[key] = index;
    }
    const next = (counts[key] ?? 0) + 1;
    counts[key] = next;
    const start = firstAt[key] ?? index;
    if (next > bestCount || (next === bestCount && start < bestFirst)) {
      best = value;
      bestCount = next;
      bestFirst = start;
    }
  }
  return best;
}
`,
  "is-palindrome": `export function isPalindrome(nums: number[]): boolean {
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
}
`,
  "pair-indices": `export function pairIndices(nums: number[], target: number): number[] {
  let left = 0;
  let right = nums.length - 1;
  while (left < right) {
    const low = nums[left];
    const high = nums[right];
    if (low === undefined || high === undefined) {
      break;
    }
    const sum = low + high;
    if (sum === target) {
      return [left, right];
    }
    if (sum < target) {
      left += 1;
      continue;
    }
    right -= 1;
  }
  return [-1, -1];
}
`,
  "shortest-at-least": `export function shortestAtLeast(nums: number[], target: number): number {
  let best = 0;
  let sum = 0;
  let left = 0;
  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right] ?? 0;
    while (sum >= target && left <= right) {
      const length = right - left + 1;
      if (best === 0 || length < best) {
        best = length;
      }
      sum -= nums[left] ?? 0;
      left += 1;
    }
  }
  return best;
}
`,
  "longest-at-most": `export function longestAtMost(nums: number[], target: number): number {
  let best = 0;
  let sum = 0;
  let left = 0;
  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right] ?? 0;
    while (sum > target && left <= right) {
      sum -= nums[left] ?? 0;
      left += 1;
    }
    const length = right - left + 1;
    if (left <= right && sum <= target && length > best) {
      best = length;
    }
  }
  return best;
}
`,
  "middle-value": `${listHelpers}
export function middleValue(values: number[]): number {
  let slow = fromArray(values);
  let fast = slow;
  if (slow === null) {
    return -1;
  }
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }
  if (slow === null) {
    return -1;
  }
  return slow.value;
}
`,
  "nth-from-end": `${listHelpers}
export function nthFromEnd(values: number[], n: number): number {
  if (n < 1) {
    return -1;
  }
  let fast = fromArray(values);
  for (let step = 0; step < n; step += 1) {
    if (fast === null) {
      return -1;
    }
    fast = fast.next;
  }
  let slow = fromArray(values);
  while (fast !== null) {
    if (slow === null) {
      return -1;
    }
    slow = slow.next;
    fast = fast.next;
  }
  if (slow === null) {
    return -1;
  }
  return slow.value;
}
`,
  "apply-backspace": `export function applyBackspace(value: string): string {
  const stack: string[] = [];
  for (const character of value) {
    if (character === "#") {
      stack.pop();
      continue;
    }
    stack.push(character);
  }
  return stack.join("");
}
`,
  "next-greater": `export function nextGreater(nums: number[]): number[] {
  const answer = nums.map(() => -1);
  const stack: number[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    if (value === undefined) {
      continue;
    }
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      if (top === undefined) {
        break;
      }
      const previous = nums[top];
      if (previous === undefined || previous >= value) {
        break;
      }
      answer[top] = value;
      stack.pop();
    }
    stack.push(index);
  }
  return answer;
}
`,
  "negative-counts": `export function negativeCounts(nums: number[], k: number): number[] {
  if (k < 1 || k > nums.length) {
    return [];
  }
  const result: number[] = [];
  let count = 0;
  for (let index = 0; index < nums.length; index += 1) {
    if ((nums[index] ?? 0) < 0) {
      count += 1;
    }
    if (index >= k && (nums[index - k] ?? 0) < 0) {
      count -= 1;
    }
    if (index >= k - 1) {
      result.push(count);
    }
  }
  return result;
}
`,
  "max-in-window": `export function maxInWindow(nums: number[], k: number): number[] {
  if (k < 1 || k > nums.length) {
    return [];
  }
  const result: number[] = [];
  const deque: number[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    if (deque[0] === index - k) {
      deque.shift();
    }
    const value = nums[index] ?? 0;
    while (deque.length > 0) {
      const last = deque[deque.length - 1];
      if (last === undefined || (nums[last] ?? 0) >= value) {
        break;
      }
      deque.pop();
    }
    deque.push(index);
    if (index >= k - 1) {
      const front = deque[0];
      result.push(nums[front ?? 0] ?? 0);
    }
  }
  return result;
}
`,
  fib: `export function fib(n: number): number {
  if (n <= 2) {
    return 1;
  }
  return fib(n - 1) + fib(n - 2);
}
`,
  "nested-depth": `type Nested = number | Nested[];

export function nestedDepth(value: Nested): number {
  if (typeof value === "number") {
    return 0;
  }
  let best = 0;
  for (const child of value) {
    const depth = nestedDepth(child);
    if (depth > best) {
      best = depth;
    }
  }
  return best + 1;
}
`,
  "first-equal": `export function firstEqual(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  let answer = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = nums[mid];
    if (value === undefined) {
      break;
    }
    if (value === target) {
      answer = mid;
      hi = mid - 1;
      continue;
    }
    if (value < target) {
      lo = mid + 1;
      continue;
    }
    hi = mid - 1;
  }
  return answer;
}
`,
  "last-equal": `export function lastEqual(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  let answer = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = nums[mid];
    if (value === undefined) {
      break;
    }
    if (value === target) {
      answer = mid;
      lo = mid + 1;
      continue;
    }
    if (value < target) {
      lo = mid + 1;
      continue;
    }
    hi = mid - 1;
  }
  return answer;
}
`,
  "is-sorted": `export function isSorted(nums: number[]): boolean {
  for (let index = 1; index < nums.length; index += 1) {
    const previous = nums[index - 1];
    const value = nums[index];
    if (previous === undefined || value === undefined) {
      continue;
    }
    if (previous > value) {
      return false;
    }
  }
  return true;
}
`,
  "bubble-sort": `export function bubbleSort(nums: number[]): number[] {
  const copy = nums.slice();
  for (let pass = 0; pass < copy.length; pass += 1) {
    for (let index = 0; index < copy.length - 1 - pass; index += 1) {
      const left = copy[index];
      const right = copy[index + 1];
      if (left === undefined || right === undefined) {
        continue;
      }
      if (left > right) {
        copy[index] = right;
        copy[index + 1] = left;
      }
    }
  }
  return copy;
}
`,
  "leaf-count": `${treeHelpers}
function leaves(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  if (node.left === null && node.right === null) {
    return 1;
  }
  return leaves(node.left) + leaves(node.right);
}

export function leafCount(values: Array<number | null>): number {
  return leaves(buildTree(values));
}
`,
  "tree-sum": `${treeHelpers}
function total(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  return node.value + total(node.left) + total(node.right);
}

export function treeSum(values: Array<number | null>): number {
  return total(buildTree(values));
}
`,
  "bst-height": `${bstHelpers}
function height(node: TreeNode | null): number {
  if (node === null) {
    return 0;
  }
  return 1 + Math.max(height(node.left), height(node.right));
}

export function bstHeight(values: number[]): number {
  return height(fromValues(values));
}
`,
  "bst-contains-shaped": `${bstHelpers}
export function bstContainsShaped(values: number[], target: number): boolean {
  let current = fromValues(values);
  while (current !== null) {
    if (target === current.value) {
      return true;
    }
    if (target < current.value) {
      current = current.left;
      continue;
    }
    current = current.right;
  }
  return false;
}
`,
  "parent-index": `export function parentIndex(index: number): number {
  if (index <= 0) {
    return -1;
  }
  return Math.floor((index - 1) / 2);
}
`,
  "child-indexes": `export function childIndexes(index: number): number[] {
  return [2 * index + 1, 2 * index + 2];
}
`,
  "component-size": `${graphHelpers}
export function componentSize(edges: number[][], start: number): number {
  return walk(edges, start);
}
`,
  "reaches-all": `${graphHelpers}
export function reachesAll(
  edges: number[][],
  count: number,
  start: number,
): boolean {
  return walk(edges, start) === count;
}
`,
  "earliest-finish": `export function earliestFinish(intervals: number[][]): number[] {
  let best: number[] | null = null;
  for (const interval of intervals) {
    const start = interval[0];
    const end = interval[1];
    if (start === undefined || end === undefined) {
      continue;
    }
    if (best === null) {
      best = [start, end];
      continue;
    }
    const bestEnd = best[1] ?? 0;
    const bestStart = best[0] ?? 0;
    if (end < bestEnd || (end === bestEnd && start < bestStart)) {
      best = [start, end];
    }
  }
  if (best === null) {
    return [];
  }
  return best;
}
`,
  "can-jump": `export function canJump(nums: number[]): boolean {
  if (nums.length === 0) {
    return false;
  }
  let reach = 0;
  for (let index = 0; index < nums.length; index += 1) {
    if (index > reach) {
      return false;
    }
    reach = Math.max(reach, index + (nums[index] ?? 0));
  }
  return true;
}
`,
  permutations: `export function permutations(nums: number[]): number[][] {
  const results: number[][] = [];
  const path: number[] = [];
  const used: boolean[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    used.push(false);
  }
  const walk = (): void => {
    if (path.length === nums.length) {
      results.push(path.slice());
      return;
    }
    for (let index = 0; index < nums.length; index += 1) {
      if (used[index] === true) {
        continue;
      }
      const value = nums[index];
      if (value === undefined) {
        continue;
      }
      used[index] = true;
      path.push(value);
      walk();
      path.pop();
      used[index] = false;
    }
  };
  walk();
  return results;
}
`,
  "ordered-picks": `export function orderedPicks(nums: number[], k: number): number[][] {
  const results: number[][] = [];
  const path: number[] = [];
  const used: boolean[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    used.push(false);
  }
  const walk = (): void => {
    if (path.length === k) {
      results.push(path.slice());
      return;
    }
    for (let index = 0; index < nums.length; index += 1) {
      if (used[index] === true) {
        continue;
      }
      const value = nums[index];
      if (value === undefined) {
        continue;
      }
      used[index] = true;
      path.push(value);
      walk();
      path.pop();
      used[index] = false;
    }
  };
  walk();
  return results;
}
`,
  "fib-loop": `export function fibLoop(n: number): number {
  if (n <= 0) {
    return 0;
  }
  let previous = 0;
  let current = 1;
  for (let step = 1; step < n; step += 1) {
    const next = previous + current;
    previous = current;
    current = next;
  }
  return current;
}
`,
  "house-robber": `export function rob(nums: number[]): number {
  let previous = 0;
  let current = 0;
  for (const value of nums) {
    const next = Math.max(current, previous + value);
    previous = current;
    current = next;
  }
  return current;
}
`,
  "common-prefix": `interface TrieCount {
  children: Record<string, TrieCount>;
  passes: number;
}

function trieCount(): TrieCount {
  return { children: {}, passes: 0 };
}

export function longestCommonPrefix(words: string[]): string {
  if (words.length === 0) {
    return "";
  }
  const root = trieCount();
  for (const word of words) {
    let node = root;
    node.passes += 1;
    for (const character of word) {
      const next = node.children[character] ?? trieCount();
      node.children[character] = next;
      node = next;
      node.passes += 1;
    }
  }
  let prefix = "";
  let node = root;
  const first = words[0] ?? "";
  for (const character of first) {
    const next = node.children[character];
    if (next === undefined || next.passes !== words.length) {
      break;
    }
    prefix += character;
    node = next;
  }
  return prefix;
}
`,
  "prefix-counts": `interface CountNode {
  children: Record<string, CountNode>;
  passes: number;
}

function countNode(): CountNode {
  return { children: {}, passes: 0 };
}

export function prefixCounts(words: string[], queries: string[]): number[] {
  const root = countNode();
  for (const word of words) {
    let node = root;
    node.passes += 1;
    for (const character of word) {
      const next = node.children[character] ?? countNode();
      node.children[character] = next;
      node = next;
      node.passes += 1;
    }
  }
  const counts: number[] = [];
  for (const query of queries) {
    if (query.length === 0) {
      counts.push(root.passes);
      continue;
    }
    let node = root;
    let missing = false;
    for (const character of query) {
      const next = node.children[character];
      if (next === undefined) {
        missing = true;
        break;
      }
      node = next;
    }
    if (missing) {
      counts.push(0);
      continue;
    }
    counts.push(node.passes);
  }
  return counts;
}
`,
  "range-sum": `export function rangeSum(
  prefix: number[],
  left: number,
  right: number,
): number {
  const end = prefix[right + 1];
  const start = prefix[left];
  if (end === undefined || start === undefined) {
    return 0;
  }
  return end - start;
}
`,
  "remove-duplicates-sorted": `export function removeDuplicates(nums: number[]): number[] {
  const unique: number[] = [];
  for (let index = 0; index < nums.length; index += 1) {
    const value = nums[index];
    if (value === undefined) {
      continue;
    }
    const previous = unique[unique.length - 1];
    if (previous === value) {
      continue;
    }
    unique.push(value);
  }
  return unique;
}
`,
  "max-area": `export function maxArea(heights: number[]): number {
  let left = 0;
  let right = heights.length - 1;
  let best = 0;
  while (left < right) {
    const leftHeight = heights[left];
    const rightHeight = heights[right];
    if (leftHeight === undefined || rightHeight === undefined) {
      break;
    }
    const width = right - left;
    const height = leftHeight < rightHeight ? leftHeight : rightHeight;
    const area = height * width;
    if (area > best) {
      best = area;
    }
    if (leftHeight <= rightHeight) {
      left += 1;
      continue;
    }
    right -= 1;
  }
  return best;
}
`,
  "level-order": `${treeHelpers}
export function levelOrder(values: Array<number | null>): number[] {
  const root = buildTree(values);
  if (root === null) {
    return [];
  }
  const order: number[] = [];
  const queue: TreeNode[] = [root];
  for (let index = 0; index < queue.length; index += 1) {
    const node = queue[index];
    if (node === undefined) {
      continue;
    }
    order.push(node.value);
    if (node.left !== null) {
      queue.push(node.left);
    }
    if (node.right !== null) {
      queue.push(node.right);
    }
  }
  return order;
}
`,
  "is-valid-bst": `${treeHelpers}
function valid(
  node: TreeNode | null,
  low: number | null,
  high: number | null,
): boolean {
  if (node === null) {
    return true;
  }
  if (low !== null && node.value <= low) {
    return false;
  }
  if (high !== null && node.value >= high) {
    return false;
  }
  if (!valid(node.left, low, node.value)) {
    return false;
  }
  return valid(node.right, node.value, high);
}

export function isValidBst(values: Array<number | null>): boolean {
  return valid(buildTree(values), null, null);
}
`,
  "heap-push": `export function pushMinHeap(heap: number[], value: number): number[] {
  const next = heap.slice();
  next.push(value);
  let index = next.length - 1;
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    const childValue = next[index];
    const parentValue = next[parent];
    if (
      childValue === undefined ||
      parentValue === undefined ||
      childValue >= parentValue
    ) {
      return next;
    }
    next[index] = parentValue;
    next[parent] = childValue;
    index = parent;
  }
  return next;
}
`,
  "fib-memo": `export function fibMemo(n: number): number {
  const cache: Array<number | undefined> = [];
  const solve = (value: number): number => {
    if (value <= 2) {
      return 1;
    }
    const saved = cache[value];
    if (saved !== undefined) {
      return saved;
    }
    const result = solve(value - 1) + solve(value - 2);
    cache[value] = result;
    return result;
  };
  return solve(n);
}
`,
  "count-components": `export function countComponents(edges: number[][], count: number): number {
  const neighbours: Record<string, number[]> = {};
  for (let vertex = 0; vertex < count; vertex += 1) {
    neighbours[String(vertex)] = [];
  }
  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
    const edge = edges[edgeIndex];
    const from = edge?.[0];
    const to = edge?.[1];
    if (from === undefined || to === undefined) {
      continue;
    }
    const fromList = neighbours[String(from)];
    const toList = neighbours[String(to)];
    if (fromList === undefined || toList === undefined) {
      continue;
    }
    fromList.push(to);
    toList.push(from);
  }
  const seen: Record<string, true> = {};
  let components = 0;
  for (let vertex = 0; vertex < count; vertex += 1) {
    const key = String(vertex);
    if (seen[key] === true) {
      continue;
    }
    components += 1;
    const queue = [vertex];
    seen[key] = true;
    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      if (current === undefined) {
        continue;
      }
      const list = neighbours[String(current)] ?? [];
      for (let cursor = 0; cursor < list.length; cursor += 1) {
        const next = list[cursor];
        if (next === undefined) {
          continue;
        }
        const nextKey = String(next);
        if (seen[nextKey] === true) {
          continue;
        }
        seen[nextKey] = true;
        queue.push(next);
      }
    }
  }
  return components;
}
`,
};

import { defineArticle, type Article } from "./types";

export const patternArticles: readonly Article[] = [
  defineArticle(
    "greedy-choices",
    "When Is a Greedy Choice Safe? Interval Scheduling",
    "Patterns",
    "A greedy algorithm commits to a local choice only when a proof shows that choice cannot make the final answer worse. Interval scheduling demonstrates the exchange argument.",
    [
      "greedy",
      "greedy algorithm",
      "interval scheduling",
      "half-open intervals",
      "jump game",
    ],
    `
A **greedy algorithm** commits to one locally attractive choice and never revisits it. That is useful only when the choice is *safe*: some optimal solution contains it. Interval scheduling gives us both an algorithm and a short proof of safety.

The task is to select the largest number of non-overlapping intervals. We use half-open intervals \`[start, end)\`, so \`[1, 3)\` and \`[3, 5)\` may touch without overlapping.

\`\`\`mermaid
flowchart TD
  A["Sort by increasing finish time"] --> B["availableFrom = -Infinity"]
  B --> C{"More intervals?"}
  C -->|no| D["Return chosen intervals"]
  C -->|yes| E{"start >= availableFrom?"}
  E -->|no: overlaps| C
  E -->|yes: compatible| F["Choose it; update availableFrom"]
  F --> C
\`\`\`

## The greedy rule

Choose the compatible interval that finishes earliest. An earlier finish leaves at least as much room for every later interval as any later finish would.

\`\`\`ts
type Interval = readonly [start: number, end: number];

function maximumNonOverlapping(
  intervals: readonly Interval[],
): readonly Interval[] {
  const ordered = intervals.slice().sort((left, right) => {
    const finishDifference = left[1] - right[1];
    if (finishDifference !== 0) {
      return finishDifference;
    }
    return left[0] - right[0];
  });
  const chosen: Interval[] = [];
  let availableFrom = Number.NEGATIVE_INFINITY;

  for (const interval of ordered) {
    const [start, end] = interval;
    if (start >= end) {
      throw new RangeError("Each interval must have start < end.");
    }
    if (start < availableFrom) {
      continue;
    }

    chosen.push(interval);
    availableFrom = end;
  }

  return chosen;
}

console.log(maximumNonOverlapping([[1, 10], [1, 3], [3, 5], [5, 7]]));
// [[1, 3], [3, 5], [5, 7]]
console.log(maximumNonOverlapping([]));
// []
\`\`\`

The function copies before sorting, so it does not mutate its input. Its loop invariant is:

> Before each iteration, \`chosen\` is compatible, and \`availableFrom\` is the finish of its last interval.

The compatibility test preserves that invariant. At termination, every interval has been considered.

## Why earliest finish is safe

Let an optimal schedule's first interval be \`o\), and let the algorithm choose \`g\). Because \`g\) has the earliest finish, \`finish(g) <= finish(o)\). Replace \`o\) with \`g\). Every interval that could follow \`o\) can still follow \`g\), so the replacement does not reduce the schedule's size. Repeating this **exchange argument** proves the greedy schedule is optimal.

Sorting by earliest start is not safe. On \`[1, 10)\`, \`[1, 3)\`, \`[3, 5)\`, and \`[5, 7)\`, choosing the long interval first gives one interval instead of three. Shortest duration also fails: \`[0, 4)\` and \`[5, 9)\` are compatible, but the shorter \`[3, 6)\` blocks both.

## A second proof shape: the reach invariant

Not every greedy proof is an exchange argument. In **jump game**, \`nums[i]\` is the maximum forward jump from index \`i\`. Keep \`farthest\`, the greatest index reachable using only positions already scanned:

\`\`\`ts
function canJump(nums: readonly number[]): boolean {
  if (nums.length === 0) {
    return false;
  }

  let farthest = 0;

  for (let index = 0; index < nums.length; index += 1) {
    if (index > farthest) {
      return false;
    }

    const jump = nums[index];
    if (jump === undefined || !Number.isInteger(jump) || jump < 0) {
      throw new RangeError("Jump lengths must be non-negative integers.");
    }

    farthest = Math.max(farthest, index + jump);
    if (farthest >= nums.length - 1) {
      return true;
    }
  }

  return true;
}

console.log(canJump([2, 3, 1, 1, 4]));
// true
console.log(canJump([3, 2, 1, 0, 4]));
// false
\`\`\`

Before index \`i\` is processed, every index at most \`farthest\` is reachable from the start through processed positions. If \`i > farthest\`, no legal path can reach \`i\), so no later position can help. Otherwise, \`i + nums[i]\` is reachable and safely extends the frontier. This yields O(n) time and O(1) space.

A tempting rule, “always jump the maximum distance now,” is false. For \`[2, 2, 0, 1]\`, jumping two spaces lands on 0 and gets stuck, while jumping one space reaches index 1 and then the end. The safe greedy state is the best frontier over *all reachable positions*, not one irrevocable landing.

## Complexity

Sorting costs O(n log n); the scan costs O(n). Because the implementation copies the input, it uses O(n) auxiliary space. The result itself can also contain O(n) intervals.

## Edge cases and mistakes

- An empty input returns an empty schedule.
- Equal endpoints are compatible under the half-open convention; use \`>=\), not \`>\).
- Equal finish times may be broken by start time without changing optimality.
- Validate or clearly specify malformed intervals such as \`[4, 2)\`.
- A plausible local rule is not enough. Supply an exchange argument or find a counterexample.
- In jump game, test empty input, one position, a zero barrier, and a frontier extended by several earlier positions.

Use this pattern when a local choice can be exchanged into an optimal solution. If choices must be reconsidered, use backtracking; if optimal answers combine overlapping subproblems, consider dynamic programming.

## Related

- [What Is Backtracking? Choose, Explore, Then Undo](/articles/backtracking)
- [What Is Dynamic Programming? Overlapping Subproblems](/articles/dynamic-programming)
  `,
  ),
  defineArticle(
    "backtracking",
    "What Is Backtracking? Choose, Explore, Then Undo",
    "Patterns",
    "Backtracking performs depth-first search over decisions. It chooses, explores, and restores state before trying the next choice.",
    ["backtracking", "subset", "subsets"],
    `
**Backtracking** is depth-first search over a decision tree that the algorithm generates. Each recursive call represents a partial candidate. It makes a choice, explores that branch, and undoes the choice before trying another branch.

For subsets, every input value creates two branches: exclude it or include it.

\`\`\`mermaid
flowchart TD
  R["index 0: path []"] --> E1["exclude 1: []"]
  R --> I1["include 1: [1]"]
  E1 --> E2["exclude 2: []"]
  E1 --> I2["include 2: [2]"]
  I1 --> E3["exclude 2: [1]"]
  I1 --> I3["include 2: [1, 2]"]
\`\`\`

\`\`\`ts
function subsets(values: readonly number[]): number[][] {
  const results: number[][] = [];
  const path: number[] = [];

  const search = (index: number): void => {
    if (index === values.length) {
      results.push([...path]);
      return;
    }

    search(index + 1);

    const value = values[index];
    if (value === undefined) {
      return;
    }

    path.push(value);
    search(index + 1);
    path.pop();
  };

  search(0);
  return results;
}

console.log(subsets([1, 2]));
// [[], [2], [1], [1, 2]]
console.log(subsets([]));
// [[]]
\`\`\`

The empty input has one subset: the empty subset. At a leaf, copy \`path\`; storing \`path\` itself would save several references to the same mutable array.

## State, choices, and output order

The state is \`(index, path)\`. At \`search(index)\`, the only legal choices are “exclude \`values[index]\`” and “include it.” Both recursive calls use \`index + 1\`, so the number of undecided positions strictly decreases. The base convention is explicit: \`index === values.length\` means every position has been decided and the current path is one output.

Choice order affects deterministic output order, not which subsets exist. This implementation explores exclusion before inclusion, producing \`[]\`, \`[2]\`, \`[1]\`, \`[1, 2]\` for \`[1, 2]\`. Reversing the branches produces a different valid order. When tests compare arrays directly, choose and document one order.

The call-count recurrence is \`T(r) = 2T(r - 1) + O(1)\` for \`r\` remaining positions, with \`T(0) = O(n)\` when copying a path. There are \`2^n\` leaves, which explains the output-sensitive bound.

## The restoration invariant

On entry to \`search(index)\`, \`path\` contains exactly the included values before \`index\). On return, \`path\` must have exactly the same contents it had on entry. The \`push\` and matching \`pop\` preserve this invariant. This is the central discipline of backtracking.

For \`n\` distinct values, the tree has \`2^n\` leaves. Copying paths makes the time O(n · 2^n), and storing all output also takes O(n · 2^n) space. Excluding output, the path and recursion stack each use O(n).

## Pruning

A **prune** stops exploring a partial candidate that cannot lead to a valid answer. For example, when choosing positive numbers for a target sum, a running sum above the target can return immediately. Pruning improves many inputs but does not change the worst case unless the problem guarantees effective pruning.

Prune only from a proved condition. “The current sum is too large” is safe when all remaining values are non-negative; with negative values, a later choice could lower it. A heuristic that merely looks promising may delete valid answers.

## Edge cases and mistakes

- Copy a completed path with \`[...path]\`.
- Undo every mutation on every returning branch.
- Define whether duplicate input values should produce duplicate subsets. This version treats positions as distinct.
- Do not use backtracking merely to count exponentially many objects when a recurrence can count them faster.
- Test the restoration invariant with empty, one-value, and two-value inputs.
- If output order is contractual, keep loop and branch order explicit rather than sorting the answers afterward.

## Optional enrichment: duplicate values

To return value-distinct subsets, sort a copy, use loop-based choices, and skip equal candidates at the same decision depth. Do not skip equal values globally: two copies may both belong to one valid subset.

Use backtracking when you must enumerate candidates or can prune most branches. Use dynamic programming when repeated states need one stored answer rather than many concrete objects.

## Related

- [How Does Depth-First Search Explore One Branch First?](/articles/depth-first-search)
- [What Is Dynamic Programming? Overlapping Subproblems](/articles/dynamic-programming)
  `,
  ),
  defineArticle(
    "dynamic-programming",
    "What Is Dynamic Programming? Overlapping Subproblems",
    "Patterns",
    "Dynamic programming defines states, a recurrence, and base cases, then evaluates each overlapping subproblem once.",
    ["dynamic programming", "recurrence", "tabulation"],
    `
**Dynamic programming (DP)** solves a problem by combining answers to smaller subproblems and storing each state once. It is appropriate when two properties hold:

1. **Optimal substructure:** a larger answer can be built from smaller answers.
2. **Overlapping subproblems:** the same smaller states are requested repeatedly.

Climbing stairs is a compact example. If each move climbs one or two steps, every route to step \`n\` ends with either a one-step move from \`n - 1\` or a two-step move from \`n - 2\`.

\`\`\`mermaid
flowchart LR
  W0["ways(0) = 1"] --> W2["ways(2) = ways(1) + ways(0)"]
  W1["ways(1) = 1"] --> W2
  W1 --> W3["ways(3) = ways(2) + ways(1)"]
  W2 --> W3
  W2 --> W4["ways(4) = ways(3) + ways(2)"]
  W3 --> W4
\`\`\`

The recurrence is \`ways(n) = ways(n - 1) + ways(n - 2)\`. The base case \`ways(0) = 1\` represents one way to make no more moves. It also makes \`ways(1) = 1\` fit the recurrence.

\`\`\`ts
function climbStairs(stepCount: number): number {
  if (!Number.isInteger(stepCount) || stepCount < 0) {
    throw new RangeError("stepCount must be a non-negative integer.");
  }
  if (stepCount < 2) {
    return 1;
  }

  let twoBack = 1;
  let oneBack = 1;

  for (let step = 2; step <= stepCount; step += 1) {
    const current = oneBack + twoBack;
    twoBack = oneBack;
    oneBack = current;
  }

  return oneBack;
}

console.log(climbStairs(0)); // 1
console.log(climbStairs(3)); // 3
console.log(climbStairs(5)); // 8
\`\`\`

## Derive before coding

State precisely what one value means: \`ways(n)\` is the number of move sequences whose total is \`n\). Partition those sequences by their final move. The two groups are disjoint and exhaustive, which justifies addition. Then write base cases directly from the state definition.

During the loop, the invariant is that \`twoBack = ways(step - 2)\` and \`oneBack = ways(step - 1)\`. The update computes \`ways(step)\` before shifting the pair.

Indexes are part of the definition. Here \`n\` means a *step count*, not an array index, and the loop computes states 2 through \`stepCount\`, inclusive. A table would therefore have length \`stepCount + 1\`, with the answer at \`table[stepCount]\`.

## Top-down and bottom-up

Memoisation evaluates states on demand through recursion. Tabulation evaluates them from base cases upward. Both take O(n) time for stairs. A memoised solution uses O(n) cache and O(n) call-stack space; the loop above uses O(1) auxiliary space because only two earlier states are needed.

Naive recursion is exponential because it rebuilds states such as \`ways(3)\` many times.

For a memoised version, define \`solve(step)\` with the same meaning as \`ways(step)\`, check \`step === 0\` and \`step === 1\`, then cache \`solve(step - 1) + solve(step - 2)\`. For tabulation, write those two bases first and fill increasing indexes. The recurrence does not change; only the evaluation order and storage do.

House robber uses a different state and must not borrow the stairs bases. Let \`best(i)\` be the maximum loot from the first \`i\` houses. Then

\`best(0) = 0\`, \`best(1) = houses[0]\`, and
\`best(i) = max(best(i - 1), best(i - 2) + houses[i - 1])\`.

The \`i - 1\` in the array access is deliberate: state \`i\` describes a prefix length, while arrays are zero-indexed. The two cases—skip the last house or take it and skip its neighbour—are exhaustive.

## Edge cases and mistakes

- Define \`ways(0)\`; do not let an accidental loop default choose its meaning.
- Do not copy base cases from a similar recurrence such as Fibonacci without checking the state definition.
- Update both previous values in the correct order.
- Number values eventually exceed JavaScript's safe integer range. Use \`bigint\` when exact large answers are required.
- DP is unnecessary when subproblems do not overlap or a proven greedy rule solves the problem.
- Distinguish a state count from an input index; write the conversion such as \`houses[i - 1]\` explicitly.

## Related

- [What Is Memoisation? Caching an Overlapping Answer](/articles/memoisation)
- [What Is Recursion? Smaller Copies and a Base Case](/articles/recursion)
  `,
  ),
  defineArticle(
    "memoisation",
    "What Is Memoisation? Caching an Overlapping Answer",
    "Patterns",
    "Memoisation is top-down dynamic programming: cache a function's result by its complete state so repeated recursive calls become lookups.",
    ["memoisation", "cache", "top-down dynamic programming"],
    `
**Memoisation** stores the result of a function call under a key that represents its complete state. A repeated call returns the stored result instead of rebuilding the same recursion tree.

\`\`\`mermaid
flowchart TD
  A["Solve state n"] --> B{"Cached?"}
  B -->|yes| C["Return cached value"]
  B -->|no| D{"Base state?"}
  D -->|yes| E["Use base value"]
  D -->|no| F["Solve smaller states"]
  E --> G["Store and return"]
  F --> G
\`\`\`

Fibonacci exposes the repeated states clearly: \`fib(n) = fib(n - 1) + fib(n - 2)\`.

\`\`\`ts
function fibonacci(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError("n must be a non-negative integer.");
  }

  const cache: Record<string, number | undefined> = {
    "0": 0,
    "1": 1,
  };

  const solve = (value: number): number => {
    const cached = cache[value];
    if (cached !== undefined) {
      return cached;
    }

    const result = solve(value - 1) + solve(value - 2);
    cache[value] = result;
    return result;
  };

  return solve(n);
}

console.log(fibonacci(0)); // 0
console.log(fibonacci(7)); // 13
\`\`\`

The lookup must happen before recursion, and the completed result must be stored before returning. Each state from 0 through \`n\` is computed once.

The recurrence and bases are part of the contract:

- \`fib(0) = 0\`
- \`fib(1) = 1\`
- \`fib(n) = fib(n - 1) + fib(n - 2)\` for \`n >= 2\`

This is zero-based Fibonacci. \`fib\` and \`fibMemo\`, on Two recursive calls, use one-based bases: \`fib(1) = fib(2) = 1\`. \`fibMemo\` stores each completed state before returning, so \`n = 40\` does not rebuild the call tree. Do not copy the \`fib(0) = 0\` base into that exercise.

## The key is the state

A memoisation key must include every input that can change the answer. For a grid path function \`paths(row, column)\`, keying only by \`row\` is incorrect because two columns on the same row may have different answers. A key such as \`row,column\` represents both dimensions.

The useful invariant is:

> Every cache entry is the correct final answer for exactly the state named by its key.

Do not cache a temporary value before its recursive dependencies are complete. Cyclic state graphs need separate “visiting” detection; ordinary memoisation alone does not resolve cycles.

## Complexity

There are \`n + 1\` Fibonacci states. Each performs O(1) work besides its cached dependencies, so time is O(n). The cache is O(n), and recursion reaches O(n) stack depth. Bottom-up tabulation can reduce auxiliary space to O(1).

## Edge cases and mistakes

- A partial key gives fast but incorrect cache hits.
- Forgetting to store preserves correctness but loses the speedup.
- Testing truthiness is unsafe when 0 is a valid cached value; compare with \`undefined\`.
- A cache scoped outside the public function may retain unwanted data between independent calls.
- Deep top-down recursion can overflow the call stack even when its time complexity is good.

Prefer memoisation when recursion naturally visits only a sparse subset of possible states. Prefer tabulation when all states are needed in a simple order.

## Worked call tree

\`fib(5)\` asks for \`fib(4)\` and \`fib(3)\`. While solving \`fib(4)\`, it already computes and stores \`fib(3)\`. The second request for \`fib(3)\` is therefore one lookup. The naive recursion has 15 calls for \`fib(5)\`; memoisation computes only states 0 through 5.

## Optional enrichment: cache lifetime

A cache local to the public function is isolated and easy to reason about. A shared cache can accelerate repeated calls, but it retains memory and becomes part of the function's observable lifetime. Choose that trade deliberately.

## Related

- [What Is Dynamic Programming? Overlapping Subproblems](/articles/dynamic-programming)
- [What Is the Space-for-Time Tradeoff in Algorithms?](/articles/space-for-time)
  `,
  ),
  defineArticle(
    "tries",
    "What Is a Trie? A Prefix Tree for Shared Word Paths",
    "Patterns",
    "A trie stores one character per edge. Shared prefixes share paths, making exact-word and prefix lookup proportional to query length.",
    ["trie", "string prefix", "prefix tree"],
    `
A **trie** (pronounced “try”) is a tree for strings. Each edge represents one character, and words with the same prefix share the same path. A terminal flag distinguishes a complete word from a prefix.

\`\`\`mermaid
flowchart TD
  ROOT["root"] --> C["c"]
  C --> A["a (prefix only)"]
  A --> T["t: cat"]
  A --> R["r: car"]
  R --> P["p"]
  P --> E["e"]
  E --> T2["t: carpet"]
\`\`\`

\`\`\`ts
type TrieNode = {
  children: Record<string, TrieNode | undefined>;
  isWord: boolean;
  prefixCount: number;
};

function createNode(): TrieNode {
  return { children: {}, isWord: false, prefixCount: 0 };
}

class Trie {
  private readonly root = createNode();

  insert(word: string): void {
    let node = this.root;
    node.prefixCount += 1;

    for (const character of word) {
      const existing = node.children[character];
      if (existing !== undefined) {
        node = existing;
        node.prefixCount += 1;
        continue;
      }

      const child = createNode();
      node.children[character] = child;
      node = child;
      node.prefixCount += 1;
    }

    node.isWord = true;
  }

  contains(word: string): boolean {
    const node = this.findNode(word);
    return node?.isWord ?? false;
  }

  hasPrefix(prefix: string): boolean {
    const node = this.findNode(prefix);
    return node !== undefined && node.prefixCount > 0;
  }

  countPrefix(prefix: string): number {
    return this.findNode(prefix)?.prefixCount ?? 0;
  }

  private findNode(text: string): TrieNode | undefined {
    let node = this.root;

    for (const character of text) {
      const child = node.children[character];
      if (child === undefined) {
        return undefined;
      }
      node = child;
    }

    return node;
  }
}

const trie = new Trie();
trie.insert("cat");
trie.insert("car");
trie.insert("carpet");

console.log(trie.contains("cat")); // true
console.log(trie.contains("ca")); // false
console.log(trie.hasPrefix("ca")); // true
console.log(trie.contains("cab")); // false
console.log(trie.countPrefix("car")); // 2
\`\`\`

## Operations and invariants

Insertion follows existing edges and creates only missing nodes. It increments \`prefixCount\` on the root and every visited character node, but marks \`isWord\` only on the final node. Search fails immediately on a missing edge. Reaching a node with a positive count proves a prefix exists; \`isWord\` proves a complete word was inserted.

The structural invariant is that each node has at most one outgoing edge for a given character. The semantic invariants are that \`isWord\` is true exactly at inserted word endings, and \`prefixCount\` equals the number of insert operations whose words pass through that node. The root count is therefore the number of inserted words, so an empty prefix has a useful count.

For a string of length \`L\`, insertion, exact lookup, and prefix lookup take O(L) time. Insertion creates at most L nodes. Across all inserted words, space is O(C), where C is the number of stored characters before prefix sharing; object overhead can be substantial in practice.

## Edge cases and mistakes

- Inserting the empty string marks the root; then \`contains("")\` is true.
- A prefix is not automatically a word: \`ca\` remains false after inserting \`cat\`.
- Each node needs its own \`children\` object.
- Decide whether duplicate insertions count once or repeatedly. This implementation counts insert operations repeatedly while \`isWord\` remains boolean.
- Unicode \`for...of\` iterates code points, which is usually preferable to indexing UTF-16 code units. User-visible text may still require normalization.
- A plain hash-backed set is simpler for exact membership only. A trie is valuable for prefix queries, autocomplete, and lexicographic traversal.

To find a longest common prefix among \`W\` inserted words, walk from the root while exactly one child has \`prefixCount === W\`. To list completions, first find the prefix node, then run a depth-first traversal below it. That costs O(L + output), because producing the matches cannot be faster than the output itself.

## Optional enrichment: deletion

Deletion needs more than clearing \`isWord\`: decrement counts along the exact word path, and remove a child only when its count reaches zero. If duplicate insertions must be deleted one at a time, store an end count in addition to the boolean terminal flag.

## Related

- [What Is a Tree? Roots, Leaves, and Depth in Nodes](/articles/trees)
- [How a Hash Map Remembers What You Have Already Seen](/articles/hash-maps)
  `,
  ),
];

import { defineArticle, type Article } from "./types";

export const patternArticles: readonly Article[] = [
  defineArticle(
    "greedy-choices",
    "When Is a Greedy Choice Safe? Interval Scheduling",
    "Patterns",
    "A greedy algorithm takes the local option you can prove does not block a better future. Interval scheduling is safe if you sort half-open intervals by finishing time; a rule you can break with one counterexample is not the rule.",
    ["greedy", "interval scheduling"],
    `
A greedy choice is safe when you can prove the local option does not block a better future. Interval scheduling is the problem that makes that proof concrete: you want as many half-open intervals as possible, and no pair may overlap. Sort by finishing time, earliest first, take the first interval, then take the next one that starts at or after that finish. A rule you can break with one counterexample is not the rule.

\`\`\`mermaid
flowchart TD
  sortFinish["Sort by finish, earliest first"]
  takeFirst["Take the first interval"]
  fitsNext{"Next start at or after finish?"}
  skipOne["Skip the overlap"]
  keepOne["Keep it and update the finish"]
  sortFinish --> takeFirst
  takeFirst --> fitsNext
  fitsNext -->|yes| keepOne
  fitsNext -->|no| skipOne
\`\`\`

## How it works

Write each interval as \`[start, end)\`. The start is included and the end is not. Two intervals overlap when one starts strictly before the other finishes. They do not overlap when they only touch, because the shared endpoint belongs to one of them. \`[1, 3)\` and \`[3, 5)\` are a legal pair. \`[1, 3)\` and \`[2, 4)\` are not, because 2 is before 3.

Sort by finishing time and walk once. Keep a count and the finish of the last interval you accepted. The first row is legal. If the next start is earlier than that finish, skip it. If the start is equal or later, keep it, add 1, and store this end. You never undo a keep. Finishing earlier frees the line sooner, which is why that choice is the one you lock in.

Where an optimal set first disagrees with you, your interval finishes no later, so you can swap it in and later intervals stay legal. Repeat and the sizes match. One input that beats a rule means that rule is not safe. The helpers below are the sort key and the touch test, not a scheduler.

\`\`\`ts
const finishesFirst = (left: readonly number[], right: readonly number[]): number => {
  const leftFinish = left[1] ?? 0;
  const rightFinish = right[1] ?? 0;
  return leftFinish - rightFinish;
};

const startsAtOrAfter = (start: number, finish: number): boolean => {
  return start >= finish;
};
\`\`\`

## A numeric example

Take \`[1, 10)\`, \`[1, 3)\`, \`[3, 5)\`, and \`[5, 7)\`.

A start-time sort may place \`[1, 10)\` first, because it ties \`[1, 3)\` at start 1. Take it. The finish is 10, and the other starts, 1, 3, and 5, are all earlier, so you keep 1 interval. The three short ones only touch, so a legal set of size 3 was available. Sorting by start time is not the rule.

Sort the same four by finishing time. The ends are 10, 3, 5, and 7, so the order is \`[1, 3)\`, \`[3, 5)\`, \`[5, 7)\`, \`[1, 10)\`. Take \`[1, 3)\` and set the finish to 3. \`[3, 5)\` starts at 3, so the touch is legal and you keep it. The finish is now 5. \`[5, 7)\` starts at 5, so you keep it. The finish is now 7. \`[1, 10)\` starts at 1, before 7, so you skip it. You kept 3. Size 4 is impossible, because the long interval overlaps every shorter one.

\`[1, 3)\`, \`[2, 4)\`, \`[3, 5)\` is the smaller check. Take \`[1, 3)\`. Skip \`[2, 4)\` because 2 is before 3. Keep \`[3, 5)\`. The answer is 2.

## Cost

| Step | Time | Space |
| --- | --- | --- |
| Sort by finishing time | O(n log n) | O(1) extra if you sort in place |
| Scan once, keep or skip | O(n) | O(1) |
| Whole selection | O(n log n) | O(1) extra beside the input |

n is the number of intervals. The scan is linear and the sort dominates. You store a count and a finish. A sort that copies the array adds O(n) extra space. The scan replaces a 2^n subset search only because the swap says the local choice is safe.

## In the course

Week 4 opens Patterns with Greedy choices, about 35 minutes. You write \`maxNonOverlapping\` for half-open pairs, and you return the size of the largest set with no overlaps. Touching is allowed: \`[1, 2]\` and \`[2, 4]\` expect 2, and so do \`[1, 3]\`, \`[2, 4]\`, \`[3, 5]\`. An empty list returns 0. The habit the lesson wants is naming a case your rule gets wrong.

## Common mistakes

Earliest start is the mistake with a ready counterexample: it reports 1 on those four intervals when 3 is possible. Shortest duration fails on a different input. Take \`[0, 4)\`, \`[3, 6)\`, and \`[5, 9)\`. The shortest is \`[3, 6)\`, and it overlaps both others, so you keep 1. The two longer intervals only touch at 5, so the best count is 2. Earliest finish keeps those two and skips the middle.

A strict inequality rejects \`[3, 5)\` after \`[1, 3)\`. Use start greater than or equal to finish. If you never move the finish forward, later rows are judged against the first end and legal intervals get skipped.

## When to use it

Use a greedy scan when the local choice swaps into an optimal answer without shrinking it. Here the earliest finish can take the first slot, and later compatible intervals stay compatible. The resource that choice frees is the open time after the finish.

## When not to

Do not ship a rule one input can break. Earliest start on \`[1, 10)\`, \`[1, 3)\`, \`[3, 5)\`, and \`[5, 7)\` returns 1 when 3 is possible. Do not force a local choice when smaller answers have to be stored and combined. That is dynamic programming. If you cannot write the swap, change the method.

## FAQ

### Do [1, 3) and [3, 5) overlap?
No. They are half-open, so the first ends at 3 and the second starts at 3. A start strictly before the previous finish is the overlap. \`[1, 3)\` and \`[2, 4)\` overlap because 2 is before 3.

### What does a start-time sort return on [1, 10), [1, 3), [3, 5), and [5, 7)?
1, if \`[1, 10)\` is taken first. Nothing else starts at or after 10. Sorting by finishing time keeps \`[1, 3)\`, \`[3, 5)\`, and \`[5, 7)\`, which is 3.

### What should you do after you invent a greedy rule?
Name a case it gets wrong. If you can name one, the rule is not safe. If you cannot, write the swap: the local choice replaces another choice in an optimal answer, and no later choice is lost.

## Related

- [What Is Dynamic Programming? Overlapping Subproblems](/articles/dynamic-programming)
- [What Is a Binary Heap? Min, Max, and the kth Largest](/articles/heaps)
  `,
  ),
  defineArticle(
    "backtracking",
    "What Is Backtracking? Choose, Explore, Then Undo",
    "Patterns",
    "Backtracking chooses, explores, then undoes. It is depth-first search on decisions you are generating, and it explodes unless the space is small or you can prune.",
    ["backtracking"],
    `
Backtracking chooses, explores that choice, then undoes it so the next choice starts from a clean path. It is depth-first search on decisions you are generating, rather than on a graph you were given. You use it to list the answers. You stop when the lists get too many, or when a table could count them without writing them down.

\`\`\`mermaid
flowchart TD
  chooseBit["Choose in or out"]
  exploreBranch["Explore that branch"]
  allDecided{"All numbers decided?"}
  copyPath["Copy the path into the results"]
  undoPop["Pop to undo the choice"]
  chooseBit --> exploreBranch
  exploreBranch --> allDecided
  allDecided -->|yes| copyPath
  copyPath --> undoPop
  allDecided -->|no| undoPop
\`\`\`

## How it works

You keep a partial decision in an array, the path. At each step you choose one legal option, recurse so the search can extend that path, then undo the choice before the next option. The undo is a pop. Without it, the next branch inherits whatever the previous branch left behind.

Subsets are the smallest useful version. For each number, it is in the subset or it is not. Walk by index so each subset appears once. When the index passes the last number, the path is one answer. n distinct numbers have 2^n subsets. n = 3 gives 8 subsets of \`[1, 2, 3]\`.

Two details about that path are easy to skip. The copy comes first. When the path is complete you save a new array with the same numbers. If you save the path itself, every result points at the one array you are still mutating, and later pops empty the subsets you thought you had kept. The pop comes second. After the call that included a number returns, you remove it. Forget the pop and every later subset inherits the previous choice.

The helpers below are those two moves. They do not walk the indexes, they do not try both branches, and they do not return the collection.

\`\`\`ts
const save = (path: readonly number[], results: number[][]): void => {
  results.push([...path]);
};

const chooseThenUndo = (
  path: number[],
  value: number,
  explore: (path: number[]) => void,
): void => {
  path.push(value);
  explore(path);
  path.pop();
};
\`\`\`

## A numeric example

Take \`[1, 2]\` and try "out" before "in". Leave both out and copy \`[]\`. Include 2, copy \`[2]\`, pop 2. Include 1, leave 2 out, copy \`[1]\`. Include 2, copy \`[1, 2]\`, then pop both. The four subsets are \`[]\`, \`[2]\`, \`[1]\`, and \`[1, 2]\`.

\`[1, 2, 3]\` has 8 subsets: \`[]\`, \`[1]\`, \`[2]\`, \`[3]\`, \`[1, 2]\`, \`[1, 3]\`, \`[2, 3]\`, and \`[1, 2, 3]\`. Each number in or out is 2 * 2 * 2 = 8, and the empty subset is one of them.

Push the path array itself 8 times and all 8 slots are that same array. After the pops it is \`[]\`, so every saved subset is empty.

A prune uses the same undo with an earlier stop. If the path is \`[3, 4]\` and the target sum is 5, the partial sum is already 7. You do not add another number under that prefix. You pop 4 and try a different choice.

## Cost

| Work | Time | Space |
| --- | --- | --- |
| All subsets of n distinct numbers | O(n * 2^n) | O(n * 2^n) to store them |
| One path, root to leaf | O(n) stack frames | O(n) extra for the path |
| A branch you prune | That branch is not visited | No output from it |

Copying 2^n paths, each of length at most n, is O(n * 2^n) time, and storing them is the same order of space. The stack is only n frames. A prune skips branches, but an input with no early failure still walks the whole tree.

## In the course

Backtracking is a week 4 Patterns lesson, about 40 minutes. You write \`subsets\` for distinct numbers, including the empty subset. Order does not matter. \`[1, 2]\` expects \`[]\`, \`[1]\`, \`[2]\`, and \`[1, 2]\`, compared as a set. \`[4]\` expects \`[]\` and \`[4]\`. \`[1, 2, 3]\` expects the 8 subsets above. An empty input returns one empty subset. Each call invents the next decision, and the pop climbs back to the other one.

## Common mistakes

Saving the path without copying it looks fine at the moment you record \`[1, 2, 3]\`. After the pops, that array is \`[]\`, and so is every result that points at it. You report empty rows and lose the other subsets.

Forgetting the pop after an included number leaks that number into later branches. Include 1, forget to pop it, and the branch that should produce \`[2]\` produces \`[1, 2]\`. The empty subset never appears. The second call has to see the path as it was before the first call. The pop after explore is what restores it.

## When to use it

Use backtracking when the space is modest, or when you can prune. Eight subsets is a fine thing to list. Stop a branch when a partial decision has already failed, such as a running sum past the target, a placement that attacks an earlier queen, or a prefix that cannot be a word. You want the objects themselves, not only a count.

## When not to

Do not list 2^n objects when the question asked for a count. A dynamic-programming table counts stair sequences without writing them down. Twenty numbers is about a million subsets. If you cannot prune and you do not need the lists, this is the wrong tool. So is a problem where earliest finish already gives the best count in one pass.

## FAQ

### How many subsets does [1, 2, 3] have?
8. They are \`[]\`, \`[1]\`, \`[2]\`, \`[3]\`, \`[1, 2]\`, \`[1, 3]\`, \`[2, 3]\`, and \`[1, 2, 3]\`. Each number is in or out, and 2^3 is 8, including the empty subset.

### What happens if you store the path array without copying it?
Later undos empty every subset you stored, because each result is that same array. After the search returns to \`[]\`, the saved rows are empty. Copy the numbers into a new array when the path is complete.

### When should you abandon a branch?
Stop when the partial decision already cannot succeed. A partial sum past the target is the usual picture: pop the last choice and try a different one, and do not explore under that prefix.

## Related

- [How Does Depth-First Search Explore One Branch First?](/articles/depth-first-search)
- [What Is Dynamic Programming? Overlapping Subproblems](/articles/dynamic-programming)
  `,
  ),
  defineArticle(
    "dynamic-programming",
    "What Is Dynamic Programming? Overlapping Subproblems",
    "Patterns",
    "Dynamic programming applies when a problem is made of smaller problems that overlap. Write the recurrence, then store the answers or fill a table from the base case up, as with climbing stairs.",
    ["dynamic programming", "recurrence"],
    `
Dynamic programming applies when a problem is made of smaller problems that overlap. You write that relationship as a recurrence, name the base cases you can count by hand, then store each answer or fill a table from the base case upward. Climbing stairs is the small version: you may take 1 or 2 steps, and the ways to climb n equal the ways to climb n - 1 plus the ways to climb n - 2.

\`\`\`mermaid
flowchart TD
  handCount["Count 1 step and 2 steps by hand"]
  lastStep["Last step was 1 or 2"]
  addPair["Add those two smaller answers"]
  sameSub["The same smaller staircase repeats"]
  storeAnswer["Store the answer for this n"]
  handCount --> lastStep
  lastStep --> addPair
  addPair --> sameSub
  sameSub --> storeAnswer
\`\`\`

## How it works

Let ways(n) be the number of ways to climb n steps, taking 1 or 2 at a time. The last step was one of those two, so ways(n) = ways(n - 1) + ways(n - 2). That is the recurrence. The groups do not share a sequence, because the last step differs.

Count the base cases by hand. One step has 1 way. Two steps have 2 ways: two singles, or one double. ways(1) = 1 and ways(2) = 2. Then ways(3) = 3, ways(4) = 5, and ways(5) = 8.

Naive recursion recomputes the same smaller staircase. ways(5) asks for ways(4) and ways(3), and ways(4) asks for ways(3) again. The answer has not changed. That repeat is the overlap.

Two repairs share the name. Memoisation looks up n before recursing and returns the stored number on a hit. A loop fills from the bottom, each cell the sum of the two before it. Keep only the last two numbers and the extra memory is constant. Both are dynamic programming. The loop is what you write once you trust the recurrence.

The same shape extends briefly. A grid cell reached from the left or from above adds those two neighbours, with one way along the first row and the first column. Coin change writes each amount from the coins that fit: fewest coins is 1 plus the minimum earlier amount, and combinations add the ways to make amount minus each coin. Neither is solved here. Recurrence plus base case makes the table mechanical.

The fragment below is one step of the constant-space loop, turning ways(1) and ways(2) into ways(3). It is not a full function. There is no loop up to n.

\`\`\`ts
const fromLastStep = (oneStepBack: number, twoStepsBack: number): number => {
  return oneStepBack + twoStepsBack;
};

let twoBack = 1;
let oneBack = 2;
const waysForThree = fromLastStep(oneBack, twoBack);
twoBack = oneBack;
oneBack = waysForThree;
\`\`\`

## A numeric example

n = 1 is \`1\`. n = 2 is \`1+1\` and \`2\`. n = 3 is \`1+1+1\`, \`1+2\`, and \`2+1\`. n = 5 has 8 sequences: \`1+1+1+1+1\`, \`1+1+1+2\`, \`1+1+2+1\`, \`1+2+1+1\`, \`2+1+1+1\`, \`2+2+1\`, \`2+1+2\`, and \`1+2+2\`. Five end in a single step and three end in a double step, which is ways(4) + ways(3) = 5 + 3.

Naive recursion builds ways(3) twice on the way to 5. A stored version computes each of ways(1) through ways(5) once. A bottom-up pair starts at 1 and 2, then becomes 2 and 3, then 3 and 5, then 5 and 8.

## Cost

| Method | Time | Space |
| --- | --- | --- |
| Naive recursion on stairs | Exponential in n | O(n) call stack |
| Memoised recursion | O(n) | O(n) cache plus O(n) stack |
| Loop keeping the last 2 numbers | O(n) | O(1) extra |

The uncached tree is exponential: fine at n = 5, not at n = 40. Both repairs are O(n) time. The two-number loop is the one with O(1) extra space. Stairs never needs a cell further than two steps back.

## In the course

Dynamic programming is a week 4 Patterns lesson, about 45 minutes. You write \`climbStairs\`. n is at least 1. \`climbStairs(1)\` is 1, \`climbStairs(2)\` is 2, \`climbStairs(3)\` is 3 (\`1+1+1\`, \`1+2\`, \`2+1\`), and \`climbStairs(5)\` is 8. The week stops at stairs so the recurrence stays visible. Grids and coins are named, not assigned.

## Common mistakes

A wrong base case poisons every later sum. Set ways(2) to 1, forgetting \`1+1\`, and ways(3) becomes 2, ways(4) becomes 3, and ways(5) becomes 5. The tests on 3 and 5 both fail. List n = 1 and n = 2 before you write the loop.

ways(n) is not twice ways(n - 1). The second parent is n - 2. Unstored recursion can still be correct, and it is the slow version. Store the answer, or keep the last two numbers.

## When to use it

Use dynamic programming when a smaller copy of the same question repeats. Stairs repeats. A grid cell repeats its left and upper neighbours across many paths. An amount in coin change repeats across coins. Write the recurrence first. If the same arguments show up from more than one call, storing the answer is justified.

## When not to

Do not build a table when a greedy swap already works. Interval scheduling is a sort and a scan. Do not build one when you must list every object: the 8 subsets of \`[1, 2, 3]\` are backtracking, and the stair number is a count. If subproblems never repeat, the cache stores values you will not read again.

## FAQ

### How many ways can you climb 5 steps, taking 1 or 2 at a time?
8. ways(5) = ways(4) + ways(3) = 5 + 3. The base cases are ways(1) = 1 and ways(2) = 2, and the sequence runs 1, 2, 3, 5, 8.

### Are a cache and a bottom-up loop both dynamic programming?
Yes. Memoisation stores answers on the way down, and the loop fills the same answers from the base case up. Keeping only the last 2 numbers makes the extra memory constant. You usually write the loop once you trust the recurrence.

### What has to be true before the table is mechanical?
You can write the recurrence and the base case. For stairs that is ways(n) = ways(n - 1) + ways(n - 2), with ways(1) = 1 and ways(2) = 2. Each later cell is a sum of cells you already filled.

## Related

- [What Is Memoisation? Caching an Overlapping Answer](/articles/memoisation)
- [What Is Recursion? Smaller Copies and a Base Case](/articles/recursion)
  `,
  ),
  defineArticle(
    "memoisation",
    "What Is Memoisation? Caching an Overlapping Answer",
    "Patterns",
    "Memoisation checks whether a state already has an answer before recursing, then stores the result so the overlapping call is free. The key has to be the whole state the answer depends on.",
    ["memoisation"],
    `
Memoisation checks whether a state already has an answer before you recurse, then stores the result so the overlapping call is free. You still write the recursive function. The key has to be the whole state the answer depends on, or you will reuse a number that belonged to a different call.

\`\`\`mermaid
flowchart TD
  storedAsk{"Is this exact state already stored?"}
  returnHit["Return the stored answer"]
  computeMiss["Compute the answer from smaller states"]
  storeReturn["Store it, then return it"]
  storedAsk -->|yes| returnHit
  storedAsk -->|no| computeMiss
  computeMiss --> storeReturn
\`\`\`

## How it works

Memoisation is top-down dynamic programming. You still recurse. Before that, you look in a table, often a plain object from the state to the answer. For stairs the state is how many steps are left.

Look up this exact state. If a number is stored, return it. If not, compute it, store it under the same key, and return it. Store the base cases too, so a later call can read ways(2) without listing the two sequences again.

The key is the whole state. If two calls share only part of what the answer depends on, one slot reuses a number from a different call. A miss is only slow. A partial key is fast and wrong.

You spend memory so an overlapping call does not do the work again. A bottom-up loop fills the same states in an order that makes the lookup feel unnecessary, because the smaller answers are already sitting there. The helpers below are the lookup and the store, not a full solution.

\`\`\`ts
const cache: Record<string, number> = {};

const readWays = (stepsLeft: number): number | undefined => {
  return cache[String(stepsLeft)];
};

const storeWays = (stepsLeft: number, answer: number): number => {
  cache[String(stepsLeft)] = answer;
  return answer;
};
\`\`\`

## A numeric example

Let ways(1) = 1 and ways(2) = 2 return immediately. For a larger n, the function calls ways(n - 1) and ways(n - 2). With no cache, ways(5) enters 9 times: ways(5) once, ways(4) once, ways(3) twice, ways(2) three times, and ways(1) twice. 1 + 1 + 2 + 3 + 2 = 9. ways(3) and ways(2) are the repeated work. ways(4) calls ways(3), and ways(5) calls ways(3) again, which is why those states rebuild.

With a cache, the first descent computes and stores ways(5), ways(4), ways(3), ways(2), and ways(1). The later ways(2) from ways(4), and the later ways(3) from ways(5), return the stored numbers and do not branch. Each of the 5 states is computed once.

Uncached fib(5) has the same shape and recomputes fib(3) and fib(2). A cache computes each fib state once. A constant key fails the other way: every n would read the first number you stored.

## Cost

| Version | Time | Space |
| --- | --- | --- |
| No cache, n = 5 | 9 calls, all of them do work | O(n) stack |
| Cache, n = 5 | 5 states computed once, plus the hits | O(n) cache and O(n) stack |
| No cache, general n | Exponential in n | O(n) stack |
| Cache, general n | O(n), one computation per state | O(n) cache plus O(n) stack |

One computation per step count is O(n) time. The object holds n answers, and the first descent is still n frames, so the extra space is O(n). A bottom-up loop can drop that stack and keep two numbers. Memoisation keeps the recursion and pays for the object so ways(3) is not rebuilt.

## In the course

There is no separate memoisation lesson. Week 4 teaches it inside Dynamic programming, as the first repair for climbing stairs. You keep an object from n to the answer, check it before recursing, and store the result after computing. The exercise is still \`climbStairs\`: 1 step has 1 way, 2 steps have 2, 3 steps have 3, and 5 steps have 8. The lesson then shows a loop where each value is the sum of the two before it, O(n) time and O(1) extra memory if you only keep the last two numbers. Both are dynamic programming. The spelling in the lesson is memoisation.

## Common mistakes

Keying only part of the state reuses the wrong answer, and the lookup succeeds, so the bug is quiet. Put every argument the result depends on into the key. For plain stairs the only argument is the step count, and you should still be able to say that.

Forgetting to store leaves the table empty, so n = 5 still makes 9 working calls. Store the finished answer, not a placeholder you write before the recursive calls return. A recurrence that can revisit the state in progress would return that placeholder.

## When to use it

Use memoisation when a correct recursive function meets the same state twice. Stairs at n = 5 is large enough to see it: ways(3) and ways(2) repeat, and each repeat should be a lookup. Top-down also fits when you only need a sparse subset of a large table, because you fill the states the recursion actually touches.

## When not to

Do not cache stairs once you trust the recurrence. Two running numbers are shorter and use constant extra memory. Do not cache states that never repeat, and do not cache when you need the subset lists rather than the count 2^n.

## FAQ

### What is the state for climbing stairs?
How many steps are left. That integer is the whole key, because the answer depends on nothing else. The table maps it to a number of ways.

### How many calls does ways(5) make with no cache?
9, if ways(1) and ways(2) return immediately. ways(3) runs twice and ways(2) runs three times. With a cache, each of the 5 states is computed once, and the repeated arrivals return the stored number.

### What goes wrong if the key is only part of the state?
You reuse an answer that belonged to a different call. The lookup succeeds, so the bug is silent and fast. The key has to include every argument the answer depends on.

## Related

- [What Is Dynamic Programming? Overlapping Subproblems](/articles/dynamic-programming)
- [What Is the Space-for-Time Tradeoff in Algorithms?](/articles/space-for-time)
  `,
  ),
  defineArticle(
    "tries",
    "What Is a Trie? A Prefix Tree for Shared Word Paths",
    "Patterns",
    "A trie is a tree of characters. Words that share a prefix share a path from the root, and lookup costs the length of the word, not the number of other words.",
    ["trie", "prefix"],
    `
A trie is a tree of characters. Words that share a prefix share a path from the root, so cat and car share the edges for c and a, then split into t and r. Lookup costs the length of the word you asked about, not the number of other words in the tree. It is pronounced try.

\`\`\`mermaid
flowchart TD
  root["root"]
  cNode["c"]
  aNode["a, not a word"]
  tNode["t, word cat"]
  rNode["r, word car"]
  root --> cNode
  cNode --> aNode
  aNode --> tNode
  aNode --> rNode
\`\`\`

## How it works

Each edge is one character. Each node holds children keyed by character, and a flag that is true when a word ends there. A missing child was never inserted. The root holds first letters, not a character of its own.

Insert walks from the root, creating a child when the character is missing, and marks only the last node. Search walks the same path. A missing child means the word is absent. Landing on a node is not enough: a prefix is not a word unless the flag says so. After cat and car, ca follows c and a and returns false. cat follows c, a, t and returns true. Both walks cost the length of the word, not the number of other words.

A hash set of whole words is also fast on average and shorter to write. Exact lookup does not force a trie. The trie earns its place for prefixes: words starting with ca are a walk to that node, then the subtree under it, which is t and r in the picture. The helper below creates one missing child. It is not a trie class.

\`\`\`ts
type TrieNode = {
  children: Record<string, TrieNode>;
  isWord: boolean;
};

const ensureChild = (node: TrieNode, letter: string): TrieNode => {
  const existing = node.children[letter];
  if (existing !== undefined) {
    return existing;
  }
  const created: TrieNode = { children: {}, isWord: false, };
  node.children[letter] = created;
  return created;
};
\`\`\`

## A numeric example

Insert cat: create c, a, and t, and mark t. That is 3 character nodes, and search for car is still false because r is missing. Insert car: reuse c and a, create r, mark r. You have 4 character nodes for 6 letters, and a stays unmarked. Search cat is true. Search car is true. Search ca is false. Search cab fails because b was never created. Search c is false.

Words starting with ca are the marked nodes under a: t gives cat, r gives car. Insert carpet later and those letters hang off r, so the same walk reports carpet too, while exact search for car stays true because r is still marked. The empty string is the root: inserting it sets the root flag and creates no child.

## Cost

| Operation | Time | Space |
| --- | --- | --- |
| Insert a word of length L | O(L) | O(L) new nodes if nothing is shared |
| Search a word of length L | O(L) | O(1) extra |
| Build W words, N characters total | O(N) | O(N) nodes, fewer when prefixes share |
| Words under a prefix of length L | O(L) to arrive, then the subtree | The nodes you walk |

Search follows at most L edges and does not scan other words. Space is one node per character when nothing is shared, and less when prefixes overlap: cat and car hold 6 letters in 4 character nodes. A hash set answers exact membership without handing you the subtree under ca.

## In the course

Tries closes week 4, Patterns, in about 40 minutes. You write \`wordsFound\`. \`wordsFound(["cat", "car"], ["cat", "cab", "car"])\` is \`[true, false, true]\`. An empty query list is empty. carpet against car and carpet is \`[false, true]\`, because a prefix is not a word. The empty string is a word if you inserted it. The exercise disallows a set and a map, so children are an object keyed by character. A set would pass exact lookup. You build the trie anyway.

## Common mistakes

Treating arrival as membership makes ca a word as soon as cat exists. Search needs the path and a true flag. Marking every node on the way in marks c and a as well, so those prefixes come back true. Forgetting the flag on the last node makes every search false. Sharing one children object across nodes merges t and r, and later letters clobber each other. Each new node needs its own empty object.

## When to use it

Use a trie when the question is a prefix. Words that start with ca are a walk to that node and the subtree under it. cat and car should not pay twice for c and a.

## When not to

Do not build a trie for exact lookup alone. A hash set of whole words is fast on average and shorter to write. When strings share nothing, you still pay a node per character and gain none of the sharing that justified the tree.

## FAQ

### How do you pronounce trie?
Try. The spelling looks like tree, and the spoken word does not collide with it. The structure is still a tree: a root, edges, and leaves.

### Is ca a word after you insert cat and car?
No. The node for a exists, because both words share that prefix, and the flag on a is false unless ca itself was inserted. cab is false for a different reason: the child for b was never created.

### When is a hash set enough?
When you only need exact lookup. A set of whole words answers whether a string was inserted, and it is shorter to write. The trie earns its place on prefixes: words that start with ca are a walk to that node, then a traversal underneath.

## Related

- [What Is a Tree? Roots, Leaves, and Depth in Nodes](/articles/trees)
- [How a Hash Map Remembers What You Have Already Seen](/articles/hash-maps)
  `,
  ),
];

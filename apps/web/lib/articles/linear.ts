import { defineArticle, type Article } from "./types";

export const linearArticles: readonly Article[] = [
  defineArticle(
    "linked-lists",
    "What Is a Linked List? Pointers Instead of Indexes",
    "Linear structures",
    "A linked list stores each value in a node with a pointer to the next node. You cannot jump to an index, but rewiring a pointer you already hold is O(1).",
    ["linked list"],
    `
A linked list stores each value in a node, and that node holds a pointer to the next node. You hold the head, and the last node points at nothing. You cannot jump to the 10th node, but rewiring a pointer you already hold is O(1), and nothing slides.

\`\`\`mermaid
flowchart LR
  head["Head you hold"] --> one["Node 1"]
  one --> two["Node 2"]
  two --> three["Node 3"]
  three --> tail["Points at nothing"]
\`\`\`

## How it works

A node holds a value and next. next is another node, or nothing. You start with the head, and there is no index at a fixed distance from it, so you cannot jump to the 10th node. You follow next from the head. When that node can be the last of n nodes, the walk is O(n).

Rewiring is O(1) only when you already hold the node. To insert after current, point the new node's next at the old current.next, then point current.next at the new node. That is 2 writes. Later nodes stay where they are. Nothing slides. Finding current from the head is a separate O(n) walk. The constant-time claim is the pointer writes, not the search.

Reversing turns every next around. Keep previous, current, and the next you are about to lose. previous starts as nothing. current starts as the head. Copy current.next into a local before you change it, or the rest of the list is gone. Point current back at previous. Then step all 3 forward: previous becomes current, and current becomes the saved next. When current runs out, previous is the new head, and the old head points at nothing.

Here is the complete iterative reversal. The helper that converts the list to an
array makes both the starting state and the result visible.

\`\`\`ts
interface ListNode {
  value: number;
  next: ListNode | null;
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

function reverse(head: ListNode | null): ListNode | null {
  let previous: ListNode | null = null;
  let current = head;

  while (current !== null) {
    const savedNext = current.next;
    current.next = previous;
    previous = current;
    current = savedNext;
  }

  return previous;
}

const head: ListNode = {
  value: 1,
  next: { value: 2, next: { value: 3, next: null } },
};

console.log("before:", toArray(head).join(" -> "));
const reversed = reverse(head);
console.log("after:", toArray(reversed).join(" -> "));
\`\`\`

The output is \`before: 1 -> 2 -> 3\` followed by
\`after: 3 -> 2 -> 1\`. When the loop ends, \`current\` is null and
\`previous\` is the new head. Skip \`savedNext\` and the rest of the list is
lost on the first write.

## A numeric example

Take the list 1 -> 2 -> 3. The head is the node holding 1. That node points at 2, 2 points at 3, and 3 points at nothing.

previous starts as nothing and current is 1. Save 2, point 1 at nothing, and now previous is 1 and current is 2. Save 3, point 2 at 1, and now previous is 2 and current is 3. Save nothing, point 3 at 2, and now previous is 3 and current is nothing.

Current has run out, so previous is the new head. 1 -> 2 -> 3 has become 3 -> 2 -> 1.

Point 1 at nothing before you save 2 and the rest of the list is gone. 2 and 3 are unreachable, and there is no index to get them back.

## Cost

Time and space split once you separate the walk from the pointer writes.

| Operation | Time | Extra space |
| --- | --- | --- |
| Read the head | O(1) | O(1) |
| Walk to the 10th node or the last node | O(n) | O(1) |
| Rewire next on a node you already hold | O(1) | O(1) |
| Reverse the whole list with 3 pointers | O(n) | O(1) |

The nodes themselves are O(n) space. Extra space for the reverse is O(1): previous, current, and the saved next. Time is O(n) because every next changes. The splice is O(1) only after you hold the node. From the head, inserting after the 10th node is the O(n) walk plus those writes.

## Singly, doubly, and circular lists

A **singly linked list** stores only \`next\`. It uses less pointer storage, but
cannot walk backward. Deleting a known node still usually requires its
predecessor so that the predecessor's \`next\` can bypass it.

A **doubly linked list** stores both \`next\` and \`previous\`. Given the node,
you can remove it in O(1) time by reconnecting both neighbours. The trade-off is
an extra pointer per node and twice as many links to keep consistent. This is a
natural representation for a deque or an LRU ordering.

In a **circular linked list**, the tail points back to the head instead of null.
It is useful for round-robin processing. A traversal must stop when it returns
to its starting node; waiting for null would loop forever. Empty and one-node
lists deserve explicit tests in every variant.

## In the course

You reverse a short chain such as 1 -> 2 -> 3 and return the new head. The old tail is that head. Every next points the other way. The old head, now the tail, points at nothing. Dropping next before you save it fails the check.

An array gives you the index jump and charges a slide in the middle. The list gives you the splice and charges a walk to an index. Given the head, you do not have indexes. Given the node, the edit is the O(1) rewiring.

## Common mistakes

Overwriting next before you save it drops the rest of the list. On 1 -> 2 -> 3, pointing 1 at nothing before you save 2 loses 2 and 3.

When the walk stops, current is nothing. previous is the new head. Returning current hands back an empty list.

Quitting when current.next is nothing never rewires the last node, because the last node points at nothing. Stop when current itself runs out.

A new tail that points at the new head is a cycle, and a later walk never finishes. After a correct reverse the old head points at nothing.

A middle insert is O(1) only at a node you already hold. From the head, the search is O(n).

## When to use it

Use a linked list when you rewire a node you already hold: splice, delete a successor, or reverse. O(1) insert at the head is the same move, and it is how a stack of nodes pushes.

## When not to

Skip the list when you need the 10th value on a hot path. That jump is O(1) in an array and O(n) here. Skip it when push at the end of an array is the operation you need, and when you must walk backward through a chain that only stores next.

## FAQ

### Why can you not jump to the 10th node?

Each node stores a value and a pointer to the next node. The 10th value is not a fixed offset from the head. You follow next from the head, and a node that can sit at the end of n nodes costs an O(n) walk.

### When is a rewiring actually O(1)?

It is O(1) after a node you already hold, and nothing slides. If you still have to find that node from the head, the edit is O(n).

### What happens if you overwrite next before you save it?

On 1 -> 2 -> 3, pointing 1 at nothing before you save 2 drops 2 and 3. The rest of the list is gone. Copy next into a local first, then point current back at previous.

## Related

- [What Is a Stack? Last-In First-Out and Bracket Matching](/articles/stacks)
- [What Is a Contiguous Array? Index Jumps and Shifts](/articles/contiguous-arrays)
    `,
  ),
  defineArticle(
    "stacks",
    "What Is a Stack? Last-In First-Out and Bracket Matching",
    "Linear structures",
    "A stack is last in, first out: push and pop touch only the most recent item, both O(1) at the end of an array. Bracket matching uses that order, because a counter cannot remember which opener is still waiting.",
    ["stack", "stacks"],
    `
A stack is last in, first out. Push and pop touch only the most recent item, and both are O(1) at the end of a TypeScript array if you leave the middle alone. Bracket matching uses that order, because a counter cannot remember which opener is still waiting.

\`\`\`mermaid
flowchart TD
  read["Read the next character"] --> kind{"Opener or closer"}
  kind -->|opener| push["Push it on the stack"]
  push --> read
  kind -->|closer| pop["Pop the latest opener"]
  pop --> check{"Does it match"}
  check -->|yes| read
  check -->|no| bad["Unbalanced"]
\`\`\`

## How it works

On a TypeScript array the top is the last index. push writes there. pop removes it. Leave the middle alone, and never shift the front, and both stay O(1). An occasional resize is spread across many pushes, so one push is still treated as O(1).

Bracket matching scans once. An opener is pushed. A closer pops, and it must
match the opener that just came off. A mismatch means unbalanced. Popping an
empty stack means a closer arrived with no opener waiting. Anything left at the
end was never closed.

A counter stores quantities, so it can match counts and still accept a crossed
string. The stack stores which opener is still waiting. This complete checker
also ignores non-bracket characters, which makes it useful on expressions:

\`\`\`ts
type Opener = "(" | "[" | "{";
type Closer = ")" | "]" | "}";

const expectedOpener: Record<Closer, Opener> = {
  ")": "(",
  "]": "[",
  "}": "{",
};

function isOpener(char: string): char is Opener {
  return char === "(" || char === "[" || char === "{";
}

function isCloser(char: string): char is Closer {
  return char === ")" || char === "]" || char === "}";
}

function bracketsAreBalanced(text: string): boolean {
  const stack: Opener[] = [];

  for (const char of text) {
    if (isOpener(char)) {
      stack.push(char);
      continue;
    }
    if (!isCloser(char)) {
      continue;
    }

    const opener = stack.pop();
    if (opener !== expectedOpener[char]) {
      return false;
    }
  }

  return stack.length === 0;
}

console.log(bracketsAreBalanced("total * ([2 + 3])")); // true
console.log(bracketsAreBalanced("([)]")); // false
console.log(bracketsAreBalanced("(((")); // false
console.log(bracketsAreBalanced("]")); // false
\`\`\`

\`pop\` returns \`undefined\` for an empty array. That value cannot equal any
expected opener, so an unmatched closer fails immediately. The final length
check catches unmatched openers.

## A numeric example

Walk "([])" and write the stack after each character. Start empty, [].

Read (. Push it. The stack is ["("].
Read [. Push it. The stack is ["(", "["]. The most recent opener is [.
Read ]. Pop. The opener that just came off is [, and ] matches it. The stack is ["("].
Read ). Pop. The opener that just came off is (, and ) matches it. The stack is [].

Nothing is left, so every opener was closed. "([])" succeeds.

Walk "([)]" with the same rule.

Read (. The stack is ["("].
Read [. The stack is ["(", "["].
Read ). Pop. The opener on top is [, and the closer is ). They do not match. "([)]" is unbalanced. Stop.

( is still underneath. If you popped anyway, the next closer is ], and the closer is ] while ( is still on top. ] does not match (. The real stop is one character earlier, at ).

"([])" and "([)]" each contain one of each bracket. A counter accepts both. The stack accepts only "([])". "(((" ends as ["(", "(", "("], so those openers were never closed. A lone ")" pops an empty stack.

## Cost

Time and space for a stack used this way stay easy to say if you keep the top at the end of the array.

| Operation | Time | Extra space |
| --- | --- | --- |
| Push at the end | O(1) | O(1) per stored item |
| Pop at the end | O(1) | O(1) |
| Scan n brackets | O(n) | O(n) in the worst case |
| Shift or unshift at the front | O(n) | O(1) beyond the array |

Time for the scan is O(n). Extra space is the unmatched openers: O(n) when every character is an opener. push and pop stay O(1) at the end if you leave the middle alone. shift on every pop makes the scan O(n²).

## In the course

You push each opener. A closer pops and must match the opener that just came off. An empty pop, a mismatch, or openers left at the end all mean unbalanced. "([])" is accepted. "([)]" is rejected. "(((" is rejected because those openers were never closed.

The call stack uses the same order: a call pushes a frame and a return pops it. Depth-first search does too, with vertices instead of punctuation. A TypeScript array with push and pop is the structure, as long as nothing shifts the front.

## Common mistakes

A counter accepts "([)]" because the totals match. The closer has to match the opener that just came off.

pop on an empty array returns nothing. Test that case and call the string unbalanced, instead of comparing nothing with an opener.

"(((" never mismatches during the scan. Openers left at the end were never closed. Check the stack after the last character.

Push the opener you read. On a closer, pop and compare. Mixing in the expected closer makes [ look like a match for ).

unshift and shift slide the array. The end is the top. Leave the middle alone, or push and pop stop being O(1).

## When to use it

Use a stack when the next item you need is the one you stored most recently. Nested brackets, undo, depth-first search, and function calls are that shape. push and pop on an array are enough.

## When not to

Do not use a stack when the oldest item should leave first. That is a queue. Do not use one when you need an index in the middle, or when counts match and order cannot change the answer. Do not shift from the front and still call the operation O(1).

## FAQ

### Why does "([)]" fail when the counts match?

"([])" and "([)]" each contain one of each bracket, so a counter accepts both. After ( and [, the next character is ). The top is [, which does not match. If you continued, ] would arrive while ( is still on top.

### Are push and pop always O(1) on an array?

They are O(1) at the end if you leave the middle alone. shift and unshift move every later element, so those are O(n). A rare resize is spread across many pushes. A shift on every pop is not.

### What does an empty pop, or items left at the end, mean?

An empty pop means a closer arrived with no opener waiting. Items left at the end were never closed. Either one means unbalanced, as does a mismatch. "([])" finishes empty. "(((" finishes with openers still waiting.

## Related

- [What Is the Call Stack? Frames, Returns, and Recursion](/articles/call-stack)
- [What Is a Queue? FIFO Order, Enqueue, and Dequeue](/articles/queues)
    `,
  ),
  defineArticle(
    "call-stack",
    "What Is the Call Stack? Frames, Returns, and Recursion",
    "Linear structures",
    "The call stack is the stack the runtime uses for calls. Each call pushes a frame and each return pops it, which is why recursion without a base case overflows instead of spinning in one loop.",
    ["call stack"],
    `
The call stack is the stack the runtime uses for calls. Each call pushes a frame, and each return pops it. A frame holds the arguments, the return address, and the locals. Recursion without a base case keeps pushing until the runtime refuses another frame, so the call overflows instead of spinning in one loop.

\`\`\`mermaid
sequenceDiagram
  participant Caller
  participant Fact3
  participant Fact2
  participant Base
  Caller->>Fact3: factorial of 3
  Fact3->>Fact2: factorial of 2
  Fact2->>Base: factorial of 1
  Base-->>Fact2: return 1
  Fact2-->>Fact3: return 2
  Fact3-->>Caller: return 6
\`\`\`

## How it works

A call pushes a frame. The frame holds the arguments, the return address, and the locals. A return pops that frame and continues at the return address. The locals go with the frame.

Recursion pushes your own function. factorial of 3 and factorial of 2 are two frames, each with its own n. The deeper frame was pushed last, so it finishes first. The runtime owns that stack.

The base case is the call that stops. It returns without pushing another frame. In the diagram, that call is factorial of 1. What must be true when a frame pops is that the smaller call has already returned. The current frame combines that answer with its own argument, then pops.

A missing base case never starts the pops. Each call pushes another frame until
the runtime refuses another one. That is overflow. It is not one frame spinning
the way a broken while loop spins. This complete recursive function logs both
phases: calls appear while frames are pushed, and returns appear while frames
are popped.

\`\`\`ts
function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error("n must be a non-negative integer");
  }
  console.log(\`call factorial(\${n})\`);

  if (n <= 1) {
    console.log(\`return 1 from factorial(\${n})\`);
    return 1;
  }

  const smallerResult = factorial(n - 1);
  const result = n * smallerResult;
  console.log(\`return \${result} from factorial(\${n})\`);
  return result;
}

console.log("answer:", factorial(3));
\`\`\`

The calls print in the order 3, 2, 1. The returns print in the reverse order:
1, 2, 6. The final line is \`answer: 6\`. That reversal is the stack's
last-in, first-out rule.

## A numeric example

Define factorial of 1 as 1, and factorial of n as n times factorial of n minus 1. Compute factorial of 3.

What gets pushed: frame A with n equal to 3 and a return address in the caller, then frame B with n equal to 2, then frame C with n equal to 1. Frame C is the call that stops. It does not call again.

What must be true when a frame pops: the smaller call has returned. Frame C returns 1, frame B returns 2 times 1, frame A returns 3 times 2, and the caller receives 6. Each arrow to the right in the diagram is a push. Each arrow back is a pop.

Remove the base case and nothing returns. Frames keep pushing until the runtime refuses another one. That is overflow, not one frame spinning. factorial of 3, then 2, then 1 reaches the stop. factorial of 3 calling itself with 3 does not.

## Cost

Time and stack space follow the depth of the calls, not the number of variables you declared.

| Situation | Time | Stack space |
| --- | --- | --- |
| One call and its return | O(1) inside that frame | O(1) for the frame |
| Factorial of n with a base case | O(n) | O(n) frames |
| Recursion that halves the argument each call | O(log n) frames of depth | O(log n) |
| No base case | Runs until overflow | Hits the runtime limit |

Factorial does constant work in each of n frames, so time is O(n) and stack space is O(n). The frames are memory even though you allocated no array. A split that finishes one half before the other keeps about log n frames on that path. Factorial's depth is n. Past the runtime's limit, the pops never start.

## In the course

Name the smaller copy and the base case before you write the call. A missing base case overflows. A base case you cannot reach overflows too. Each push has to be a smaller problem, and one call has to return without pushing.

Tree depth, depth-first search, and backtracking push frames as they dive and pop them as they return. An explicit stack shows the same frames: arguments, return address, and locals. When the calls are hard to hold, draw what gets pushed, what must be true when it pops, and which call stops.

## Common mistakes

No base case. Every call pushes a frame until the runtime overflows. It does not spin inside one frame.

A base case you never reach. If n does not shrink, the stop at 1 is written down and still unreachable.

Shared locals in your head. Each frame has its own n. A deeper assignment to that parameter does not change the caller's n.

A dropped return. The caller keeps only what the return expression captured. The deeper frames still run, and the answer is wrong.

Forgotten stack space. A chain of n calls is O(n) memory even with no array allocated, and a long chain can overflow. An explicit stack lets you see that length.

## When to use it

Use recursion when the problem is a smaller copy of itself and you can name the call that stops. Trees and nested lists fit. Use an explicit stack when you want to see the frames.

## When not to

Do not recurse down a chain of length n when a loop would walk it with a handful of locals. The call stack holds n frames and can overflow. Do not recurse when you cannot name the call that stops. A left-to-right scan needs one frame and an index.

## FAQ

### What does a frame hold?

A frame holds the arguments, the return address, and the locals for that call. The next call pushes a new frame. A return pops it, and those locals go with it.

### Why does a missing base case overflow instead of looping?

Each call pushes another frame. Without a return that does not push, the runtime refuses another frame. A broken while loop would spin in the frame you already have. Recursion overflows.

### Can an explicit stack replace the calls?

Yes. Push an object for the arguments and the other frame data, then loop and pop when that work is done. You can see the frames. The last one pushed is the first one finished. You still need a call that stops, or the array grows without a limit.

## Related

- [What Is Recursion? Smaller Copies and a Base Case](/articles/recursion)
- [What Is a Stack? Last-In First-Out and Bracket Matching](/articles/stacks)
    `,
  ),
  defineArticle(
    "queues",
    "What Is a Queue? FIFO Order, Enqueue, and Dequeue",
    "Linear structures",
    "A queue is first in, first out: enqueue joins the back and dequeue leaves from the front. Breadth-first search is that rule with vertices as the payload, and Array.shift on the front is O(n).",
    ["queue", "queues", "enqueue", "dequeue"],
    `
A queue is first in, first out. Enqueue joins the back, and dequeue leaves from the front. Breadth-first search is that rule with a vertex and a distance as the payload, and Array.shift on the front is O(n).

\`\`\`mermaid
flowchart LR
  enq["Enqueue at the back"] --> waiting["1 then 2 then 3"]
  waiting --> deq["Dequeue from the front"]
  deq --> first["1 leaves first"]
  first --> slide["Later items slide left"]
\`\`\`

## How it works

Enqueue joins the back. Dequeue leaves from the front. You do not take the newest item. That would be a stack.

A TypeScript array can push at the back and shift from the front. shift does not only drop index 0. It moves every later element one slot left, so an array of n elements moves n minus 1 of them. One dequeue is O(n).

For tiny teaching examples, that shift can be acceptable. In production, a
head index, a circular buffer, a linked deque, or two stacks avoids repeated
slides. With a head index, dequeue advances a number instead of moving the
remaining values. Reset the storage when the queue becomes empty so consumed
references can be reclaimed.

You use this queue unchanged when a graph asks for the shortest unweighted path. The payload changes from a number to a vertex and a distance. Enqueue still joins the back. Dequeue still leaves from the front. The first time you dequeue the target, you have used the fewest edges, because every edge costs the same.

## A numeric example

Enqueue 1, then 2, then 3. The line is [1], then [1, 2], then [1, 2, 3], with the front at the left.

Dequeue yields 1, and the line is [2, 3]. Dequeue yields 2, and the line is [3]. Dequeue yields 3, and the line is empty. The leave order is 1, then 2, then 3. pop on the same pushes would yield 3 first.

shift on a 4-element array shows the linear slide. Start with [10, 20, 30, 40]. 20 moves from index 1 to index 0. 30 moves from index 2 to index 1. 40 moves from index 3 to index 2. Drop the duplicate last slot and the array is [20, 30, 40]. 3 items moved so 1 item could leave. On n items, one shift moves n minus 1 items.

This reusable queue keeps the items in place and advances \`head\`:

\`\`\`ts
class Queue<T> {
  private items: T[] = [];
  private head = 0;

  enqueue(value: T): void {
    this.items.push(value);
  }

  dequeue(): T | undefined {
    if (this.head >= this.items.length) {
      return undefined;
    }

    const value = this.items[this.head];
    this.head += 1;

    if (this.head === this.items.length) {
      this.items = [];
      this.head = 0;
    }

    return value;
  }

  get length(): number {
    return this.items.length - this.head;
  }
}

const line = new Queue<number>();
line.enqueue(10);
line.enqueue(20);
line.enqueue(30);

console.log(line.dequeue()); // 10
console.log(line.dequeue()); // 20
console.log(line.length); // 1
console.log(line.dequeue()); // 30
console.log(line.dequeue()); // undefined
\`\`\`

The values leave in insertion order. No dequeue shifts another value. This
simple representation can retain consumed slots until the queue empties; a
circular buffer can reuse those slots when a long-lived queue needs bounded
storage.

## Cost

Time and space for a queue depend on which end you remove from.

| Operation | Time | Extra space |
| --- | --- | --- |
| Enqueue with push at the back | O(1) | O(1) per stored item |
| Dequeue with shift at the front | O(n) | O(1) beyond the items |
| Dequeue with a head index | O(1) | O(1) beyond the backing array |
| Either end on a deque | O(1) | O(1) per stored item |
| Two-stack queue | O(1) amortized | O(1) per stored item |
| n enqueues and n dequeues using shift | O(n²) | O(n) for the line |

Space for the waiting items is O(n). One \`shift\` dequeue adds O(1) extra
space, but its time is O(n) because of the slide. Repeating it n times is
O(n²). A head-index or deque implementation gives O(1) dequeue. A two-stack
queue gives O(1) amortized dequeue: one transfer may cost O(n), but each item
crosses from the input stack to the output stack at most once.

## In the course

Enqueue 1, 2, and 3, and check that dequeue yields 1, then 2, then 3. A small
example may use push plus shift to expose FIFO order. For repeated dequeues,
prefer a head index or a deque so an innocent-looking loop does not become
quadratic.

A graph asks for the shortest unweighted path and you use the queue unchanged. The payload changes from a number to a vertex and a distance. Neighbours join the back with distance plus 1. The first time the target leaves the front, that distance is the fewest edges. Reach for a deque when shift shows up in that hot loop.

## Common mistakes

Using pop for dequeue. The order becomes 3, then 2, then 1. You have a stack, and the first time a search reaches the target is no longer the fewest edges.

Treating shift as O(1) because it is one call. On a 4-element array, 3 values slide left. n such dequeues are O(n²).

Assuming every queue implementation has the same cost. FIFO describes
behaviour, not representation: an array with shift, a head-indexed array, a
circular buffer, and a linked deque have different constants and worst cases.

shift on an empty array returns nothing. Test for an empty queue before you use the front.

Sorting the line, or popping the newest vertex, leaves the queue. A vertex and a distance still join at the back and leave from the front.

## When to use it

Use a queue when the oldest item should leave next. Breadth-first search is that
rule. Store a vertex and a distance when you want the fewest edges, and use a
head index or deque when the search can process many vertices.

## When not to

Do not use a queue when the newest item should leave first. That is a stack. Do not use one for an index in the middle, or for weighted shortest paths, where a heap replaces the plain line. Do not build a two-stack queue until shift is on the hot path.

## FAQ

### Why is shift O(n) if you only remove one item?

Index 0 is the front of a contiguous array. Removing it makes every later element slide left. On [10, 20, 30, 40], 3 values move. On n values, n minus 1 values move, so Array.shift is O(n).

### When should you build a deque or a two-stack queue?

Build one when repeated front removals can be large enough to matter. A deque
makes both ends O(1). Two stacks provide O(1) amortized queue operations. A
head-indexed array is often the smallest TypeScript implementation when only
FIFO operations are needed.

### What changes when the queue drives a graph search?

Enqueue still joins the back, and dequeue still leaves from the front. The payload changes from a number to a vertex and a distance. On the shortest unweighted path, the distance stored with the target is the fewest edges.

## Related

- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
- [What Is a Stack? Last-In First-Out and Bracket Matching](/articles/stacks)
    `,
  ),
  defineArticle(
    "deques",
    "What Is a Deque? Constant-Time Access at Both Ends",
    "Linear structures",
    "A deque is a double-ended queue: values can enter or leave at either end. A doubly linked implementation makes all four end operations O(1), supporting sliding windows and both queue and stack behaviour.",
    ["deque", "double-ended queue", "double ended queue"],
    `
A **deque** (pronounced "deck") is a double-ended queue. It supports four core
operations: add to the front, add to the back, remove from the front, and remove
from the back. A queue uses one end for insertion and the other for removal. A
stack uses one end for both. A deque can do either.

\`\`\`mermaid
flowchart LR
  addFront["Add at front"] --> front["Front node"]
  front <--> middle["Middle nodes"]
  middle <--> back["Back node"]
  addBack["Add at back"] --> back
  front --> removeFront["Remove front"]
  back --> removeBack["Remove back"]
\`\`\`

## How it works

A doubly linked deque stores a front pointer, a back pointer, and a size. Every
node has \`previous\` and \`next\` links. An end operation reconnects at most
two nodes; it never walks through the deque, so all four end operations are
O(1).

The empty and one-node cases are the important boundaries. In an empty deque,
both pointers are null. In a one-node deque, both pointers name the same node.
Removing that node must clear both pointers.

\`\`\`ts
class DequeNode<T> {
  previous: DequeNode<T> | null = null;
  next: DequeNode<T> | null = null;

  constructor(readonly value: T) {}
}

class Deque<T> {
  private front: DequeNode<T> | null = null;
  private back: DequeNode<T> | null = null;
  private count = 0;

  get length(): number {
    return this.count;
  }

  pushFront(value: T): void {
    const node = new DequeNode(value);
    const oldFront = this.front;

    if (oldFront === null) {
      this.front = node;
      this.back = node;
      this.count += 1;
      return;
    }

    node.next = oldFront;
    oldFront.previous = node;
    this.front = node;
    this.count += 1;
  }

  pushBack(value: T): void {
    const node = new DequeNode(value);
    const oldBack = this.back;

    if (oldBack === null) {
      this.front = node;
      this.back = node;
      this.count += 1;
      return;
    }

    node.previous = oldBack;
    oldBack.next = node;
    this.back = node;
    this.count += 1;
  }

  popFront(): T | undefined {
    const node = this.front;
    if (node === null) {
      return undefined;
    }

    const next = node.next;
    this.count -= 1;
    if (next === null) {
      this.front = null;
      this.back = null;
      return node.value;
    }

    next.previous = null;
    this.front = next;
    return node.value;
  }

  popBack(): T | undefined {
    const node = this.back;
    if (node === null) {
      return undefined;
    }

    const previous = node.previous;
    this.count -= 1;
    if (previous === null) {
      this.front = null;
      this.back = null;
      return node.value;
    }

    previous.next = null;
    this.back = previous;
    return node.value;
  }
}

const deque = new Deque<number>();
deque.pushBack(2);
deque.pushFront(1);
deque.pushBack(3);

console.log(deque.popFront()); // 1
console.log(deque.popBack()); // 3
console.log(deque.popFront()); // 2
console.log(deque.length); // 0
\`\`\`

The output is 1, 3, 2, then 0. Both ends are available, and removing one end
does not move the middle values.

## A numeric example

Start empty. \`pushBack(2)\` makes 2 both the front and back.
\`pushFront(1)\` creates 1 <-> 2. \`pushBack(3)\` creates 1 <-> 2 <-> 3.
Removing the front returns 1 and clears 2's previous link. Removing the back
returns 3 and clears 2's next link. Node 2 is again both ends.

## Cost

| Operation | Doubly linked deque | Plain TypeScript array |
| --- | --- | --- |
| Push front | O(1) | O(n) with \`unshift\` |
| Push back | O(1) | O(1) amortized with \`push\` |
| Pop front | O(1) | O(n) with \`shift\` |
| Pop back | O(1) | O(1) with \`pop\` |
| Read by index | O(n) | O(1) |

The linked deque uses O(n) nodes and two links per node. A circular-buffer deque
also gives O(1) amortized end operations in an array by using modular indices
and occasionally resizing. The linked representation offers simple pointer
updates; the circular buffer generally has better memory locality.

## In the course

A deque is useful for a monotonic sliding window: remove expired indices from
the front and dominated values from the back. It also supports 0-1
breadth-first search, where zero-cost edges go to the front and one-cost edges
go to the back. Ordinary unweighted breadth-first search needs only the queue
subset.

## Common mistakes

Calling \`shift\` and \`unshift\` constant-time because each is one method call.
They still move array elements.

Updating only one link in a doubly linked node. If \`next.previous\` and
\`previous.next\` disagree, traversals in opposite directions see different
structures.

Forgetting to clear both pointers when the last node leaves. The empty invariant
is \`front === null\` and \`back === null\`.

Using a deque when random indexing is the repeated operation. A linked deque
must walk to an index.

## When to use it

Use a deque when work enters or leaves at both ends: sliding-window algorithms,
task scheduling, palindrome checks, or algorithms that sometimes prioritise
new work at the front. It can also implement an ordinary queue or stack.

## When not to

Use an array when random index access is central. Use a plain stack when only
the newest value leaves, or a plain queue when only FIFO operations are needed
and a head-indexed array is simpler.

## FAQ

### Is a deque the same as a queue?

A queue is FIFO: add at the back and remove from the front. A deque exposes both
ends, so a queue is one restricted way to use a deque.

### Why use two links per node?

The previous link lets the back move to its predecessor in O(1). With only
\`next\`, removing the back requires an O(n) walk to find that predecessor.

### Is every deque operation O(1)?

The four end operations are O(1) in a doubly linked deque. Searching and reading
an arbitrary index remain O(n). In a circular buffer, an occasional resize is
O(n), so end operations are O(1) amortized.

## Related

- [What Is a Queue? FIFO Order, Enqueue, and Dequeue](/articles/queues)
- [What Is a Stack? Last-In First-Out and Bracket Matching](/articles/stacks)
- [What Is a Linked List? Pointers Instead of Indexes](/articles/linked-lists)
    `,
  ),
];

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

This is one step on a node you already hold, not a finished reverse of every case:

\`\`\`ts
type Node = { value: number; next: Node | null };
const head: Node = { value: 1, next: { value: 2, next: null } };
let previous: Node | null = null;
let current: Node | null = head;
if (current !== null) {
  const saved = current.next;
  current.next = previous;
  previous = current;
  current = saved;
}
\`\`\`

After this step, previous holds 1 and current holds 2. Repeat until current runs out, then previous is the new head. Skip the saved next and the rest of the list is gone on the first write.

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

Bracket matching scans once. An opener, ( or [, is pushed. A closer, ) or ], pops, and it must match the opener that just came off. A mismatch means unbalanced. Popping an empty stack means a closer arrived with no opener waiting. Anything left at the end was never closed.

A counter stores quantities, so it can match counts and still accept a crossed string. The stack stores which opener is still waiting. The loop below pushes and pops, and it does not yet compare the pair or test the empty stack:

\`\`\`ts
const stack: string[] = [];
const chars = ["(", "[", "]", ")"];
for (let index = 0; index < chars.length; index += 1) {
  const char = chars[index];
  if (char === "(" || char === "[") {
    stack.push(char);
    continue;
  }
  const opener = stack.pop();
}
\`\`\`

opener is the value that just came off. You still test the empty stack, test that opener matches the closer, and look at what remains. The states below are that check.

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

A missing base case never starts the pops. Each call pushes another frame until the runtime refuses another one. That is overflow. It is not one frame spinning the way a broken while loop spins. An explicit stack can do the same walk, and you can see the frames because you stored them. The loop below only pushes the smaller calls. It does not multiply on the way back:

\`\`\`ts
type Frame = { n: number };
const frames: Frame[] = [{ n: 3 }];
for (let guard = 0; guard < 4; guard += 1) {
  const top = frames[frames.length - 1];
  if (top === undefined || top.n <= 1) {
    break;
  }
  frames.push({ n: top.n - 1 });
}
\`\`\`

When the loop stops, the frames hold 3, then 2, then 1. The top frame is the call that stops. Printing the array shows what the runtime keeps hidden.

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

For the sizes in this course, that shift is fine. A real deque, or two stacks used as a queue, makes both ends O(1). Pour an input stack onto an output stack so the oldest item sits on top, and each value moves a constant number of times. Do not reach for that until shift shows up in a hot loop.

You use this queue unchanged when a graph asks for the shortest unweighted path. The payload changes from a number to a vertex and a distance. Enqueue still joins the back. Dequeue still leaves from the front. The first time you dequeue the target, you have used the fewest edges, because every edge costs the same.

## A numeric example

Enqueue 1, then 2, then 3. The line is [1], then [1, 2], then [1, 2, 3], with the front at the left.

Dequeue yields 1, and the line is [2, 3]. Dequeue yields 2, and the line is [3]. Dequeue yields 3, and the line is empty. The leave order is 1, then 2, then 3. pop on the same pushes would yield 3 first.

shift on a 4-element array shows the linear slide. Start with [10, 20, 30, 40]. 20 moves from index 1 to index 0. 30 moves from index 2 to index 1. 40 moves from index 3 to index 2. Drop the duplicate last slot and the array is [20, 30, 40]. 3 items moved so 1 item could leave. On n items, one shift moves n minus 1 items, so dequeue is O(n). The loop is that slide, not a queue class:

\`\`\`ts
const line = [10, 20, 30, 40];
const removed = line[0];
for (let index = 0; index < line.length - 1; index += 1) {
  const next = line[index + 1];
  if (next !== undefined) {
    line[index] = next;
  }
}
line.pop();
\`\`\`

removed is 10. After the assignments and the pop, line is [20, 30, 40]. Each assignment is one step of the slide inside shift.

## Cost

Time and space for a queue depend on which end you remove from.

| Operation | Time | Extra space |
| --- | --- | --- |
| Enqueue with push at the back | O(1) | O(1) per stored item |
| Dequeue with shift at the front | O(n) | O(1) beyond the items |
| Either end on a deque, or two stacks | O(1) | O(1) per stored item |
| n enqueues and n dequeues using shift | O(n²) | O(n) for the line |

Space for the waiting items is O(n). One dequeue adds O(1) extra space, and its time is O(n) because of the slide. n dequeues by shift are O(n²). push at the back does not slide, so enqueues alone are O(n). A deque, or two stacks used as a queue, makes both ends O(1) across the series. Pay for that when shift is in a hot loop.

## In the course

Enqueue 1, 2, and 3, and check that dequeue yields 1, then 2, then 3. push plus shift is enough. For the sizes in this course, the slide is acceptable. Do not build a two-stack queue for a dozen numbers.

A graph asks for the shortest unweighted path and you use the queue unchanged. The payload changes from a number to a vertex and a distance. Neighbours join the back with distance plus 1. The first time the target leaves the front, that distance is the fewest edges. Reach for a deque when shift shows up in that hot loop.

## Common mistakes

Using pop for dequeue. The order becomes 3, then 2, then 1. You have a stack, and the first time a search reaches the target is no longer the fewest edges.

Treating shift as O(1) because it is one call. On a 4-element array, 3 values slide left. n such dequeues are O(n²).

Building a deque, or two stacks, before shift shows up in a hot loop. The clever queue hides the line you are trying to see.

shift on an empty array returns nothing. Test for an empty queue before you use the front.

Sorting the line, or popping the newest vertex, leaves the queue. A vertex and a distance still join at the back and leave from the front.

## When to use it

Use a queue when the oldest item should leave next. Breadth-first search is that rule. Keep push and shift while the input is lesson-sized, and store a vertex and a distance when you want the fewest edges.

## When not to

Do not use a queue when the newest item should leave first. That is a stack. Do not use one for an index in the middle, or for weighted shortest paths, where a heap replaces the plain line. Do not build a two-stack queue until shift is on the hot path.

## FAQ

### Why is shift O(n) if you only remove one item?

Index 0 is the front of a contiguous array. Removing it makes every later element slide left. On [10, 20, 30, 40], 3 values move. On n values, n minus 1 values move, so Array.shift is O(n).

### When should you build a deque or a two-stack queue?

Build one when shift shows up in a hot loop. A real deque makes both ends O(1). Two stacks used as a queue do the same across a series of operations. For the sizes in this course, push and shift are enough.

### What changes when the queue drives a graph search?

Enqueue still joins the back, and dequeue still leaves from the front. The payload changes from a number to a vertex and a distance. On the shortest unweighted path, the distance stored with the target is the fewest edges.

## Related

- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
- [What Is a Stack? Last-In First-Out and Bracket Matching](/articles/stacks)
    `,
  ),
];

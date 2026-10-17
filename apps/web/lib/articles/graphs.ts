import { defineArticle, type Article } from "./types";

export const graphArticles: readonly Article[] = [
  defineArticle(
    "graphs",
    "What Is a Graph? Vertices, Undirected Edges, and Cycles",
    "Trees and graphs",
    "A graph is vertices plus edges. A tree is a graph with no cycles; a general graph can loop, so a search has to remember where it has been. This course uses undirected edges.",
    ["graph", "graphs", "vertices", "undirected", "cycles"],
    `
A graph is a set of vertices plus a set of edges that join them. A vertex is a place you can stand, and an edge is one step between two of those places. A tree is a graph with no cycles, so connected nodes have a single path. A general graph can loop back on itself, and a search has to remember where it has been or it will walk that loop forever.

\`\`\`mermaid
graph TD
  v0["0"] --- v1["1"]
  v1 --- v2["2"]
  v2 --- v0
  v1 --- v3["3"]
\`\`\`

## How it works

You read an undirected edge in both directions. 0 joined to 1 means a step from 0 to 1 and a step from 1 to 0. A directed edge would not promise the return. This course uses undirected edges, so store both directions. Leave one out and the walk is one-way.

A tree has no cycles and one path between connected nodes. A general graph may have cycles. The drawing is the cycle 0–1–2–0 plus the edge 1–3. A search that does not remember where it has been loops on 0, 1, 2 forever. Nothing in the edge list tells it to stop.

Mark a vertex when you first decide to visit it. That is the moment it goes on the queue or the stack, not the moment it comes off. If you wait, every incoming edge can enqueue another copy. You repeat work, and the queue can blow up. A set of ids is enough memory. You do not need a class.

Breadth-first search answers fewest edges when every edge costs the same. Neighbours come first, then neighbours of neighbours, and the first arrival is the hop count. Depth-first search answers whether you can get there and what else is in this piece. Its first arrival is only the branch it tried first, which can be long. Level order on a tree is breadth-first. Finishing one child before the other is depth-first.

## A numeric example

The edges are 0–1, 1–2, 2–0, and 1–3. Four vertices, four edges. From 0 you reach 1 and 2 in one step. You reach 3 in two steps, and the only door is the edge from 1. There is no edge from 0 to 3 or from 2 to 3.

With no memory the walk 0, 1, 2, 0 repeats, then repeats again. Mark 0 before you leave. The return along 2–0 sees the mark and does not step onto 0. The same mark blocks a second discovery of 1. You still reach 3. You just refuse to orbit.

From 0 to 2 the direct edge is 1 step and the route through 1 is 2 steps, so fewest edges is 1. From 0 to 3 the routes 0–1–3 and 0–2–1–3 both take 2 edges. Fewest edges can be a tie. Delete 1–3 and 3 is still listed as a vertex, but a finished search that never marks it has no path. That answer is not 0. 0 would mean you started on 3.

## Cost

| Work | Cost |
| --- | --- |
| Read one undirected edge both ways | O(1) |
| Search that marks each vertex once | O(V + E) |
| Search that never marks vertices | Unbounded on a cycle |
| Memory for the visited marks | O(V) |

V is vertices and E is edges. One slot per vertex stores the mark. A search that marks each vertex once is O(V + E). Skip the marks and the cycle 0–1–2 has no bound. The same three edges can be lapped for as long as the machine runs.

## In the course

The graphs lesson gives you undirected integer pairs, a start, and a target. Return the number of edges on a shortest path. Distance from a vertex to itself is 0, before you walk. A target you never reach is -1, which means no path, not distance 0.

Build the neighbour lists, then search, and mark a vertex when you first decide to visit it. Breadth-first search matches the question, because every edge costs one hop. Depth-first search can say a path exists and still hand you a longer one. The queue rule does not change: whoever has waited longest comes out next. The payload is a vertex, often with a distance beside it.

## Common mistakes

Storing an undirected edge one way only, so a walk from the forgotten end never returns. Marking a vertex only after you finish it, which lets neighbours enqueue it many times and can blow up the queue. Using depth-first search because recursion is short, then treating the first sighting as the fewest edges. Treating a cycle as bad input. The cycle is allowed. Returning 0 when the target is missing. 0 means you were already there. Missing means -1.

## When to use it

Use a graph when a step joins two things and a neighbour can lead you back, as with roads, friendships, or corridors. Search with memory as soon as a cycle is possible. Use breadth-first search for the hop count when every edge costs the same. Use depth-first search for reachability, or for the vertices in one piece.

## When not to

Stay with a tree when you already have a root and no cycle. The depth lessons do not need extra marks to stop a loop that cannot exist. Do not store an undirected edge when the relationship is one way. A directed edge would not promise the return, and inventing it invents paths. Do not report a hop count when costs differ. That is a weighted search this course names and does not ask you to build.

## FAQ

### Is a tree a graph?

Yes. No cycles, and one path between connected nodes. Add one edge and that path is no longer the only one. You then mark where you have been, or the new cycle runs forever.

### Why mark a vertex before you take it off the queue?

Deciding to visit happens before the visit. Wait until dequeue and neighbours push extra copies. Mark at the decision and those copies are never created. A stack uses the same rule.

### Does the edge from 0 to 1 let me walk back?

In this course, yes. Undirected means 0 to 1 is also 1 to 0. A directed edge would not promise the return. Store one direction and paths that should exist look missing.

## Related

The neighbour store is what a search asks, and the layer walk is how you count equal-cost edges.

- [What Is an Adjacency List? Neighbours of Each Vertex](/articles/adjacency-lists)
- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
    `,
  ),
  defineArticle(
    "adjacency-lists",
    "What Is an Adjacency List? Neighbours of Each Vertex",
    "Trees and graphs",
    "An adjacency list stores, for each vertex, the vertices one edge away. One pass over the edge list builds it, and a search asks it for neighbours.",
    ["adjacency list"],
    `
An adjacency list stores, for each vertex, the vertices that sit one edge away. You build it with one pass over the edge list, and after that a search never scans the pairs again. It asks a smaller question: given this vertex, who are the neighbours? That question is the whole interface breadth-first and depth-first search need.

\`\`\`mermaid
flowchart TD
  edgeList["edges"] --> onePass["one pass"]
  onePass --> row0["0: 1, 2"]
  onePass --> row1["1: 0, 2"]
  onePass --> row2["2: 1, 0"]
\`\`\`

## How it works

An object whose keys are vertex ids and whose values are arrays of neighbour ids is enough. You do not need a graph class. Lookup gives you the array. Walking the array gives you who is one step away.

Build it in one pass over the edges. For an undirected edge, append each end to the other's list. Append only one way and you can walk 0 to 1 but not 1 to 0. The input promised both directions.

A vertex that appears in no edge can still be the start. Create an empty array for it, or treat a missing key as no neighbours. Distance from a vertex to itself is still 0. An empty array means no steps, not "this vertex is absent".

After the pass, breadth-first and depth-first search never scan the pairs again. Given a vertex, they read its neighbours. That is the whole interface. Order inside an array may vary, and a breadth-first distance does not care. A depth-first walk might enter a different branch first. Reachability stays the same if you mark visited.

A matrix of every pair answers "is this one edge present?" in O(1) and spends space on missing edges. Sparse graphs in these exercises want the list. Space is O(V + E): one array per vertex, plus one slot for each stored end of an edge.

## A numeric example

Take \`[0, 1]\`, \`[1, 2]\`, and \`[0, 2]\`.

Start empty. After 0–1 you have 0: \`[1]\` and 1: \`[0]\`. After 1–2 you have 1: \`[0, 2]\` and 2: \`[1]\`. After 0–2 you have 0: \`[1, 2]\` and 2: \`[1, 0]\`. The finished lists are 0: \`[1, 2]\`, 1: \`[0, 2]\`, 2: \`[1, 0]\`. Another push order might show 2: \`[0, 1]\`. The sets match.

Listing neighbours of 0 reads two ids. The time is proportional to how many neighbours there are. A vertex with 40 neighbours costs about 40 steps. A vertex with 1 neighbour costs about 1. You do not scan cells for edges that are not there.

Vertex 3 with no edges is missing until you give it \`[]\`. A path from 3 to 3 is 0. A path from 3 to 0 enqueues nothing and does not exist.

\`\`\`ts
const neighbours: Record<number, number[]> = {
  0: [1, 2],
  1: [0, 2],
  2: [1, 0],
};
\`\`\`

## Cost

| Piece | Cost |
| --- | --- |
| One pass that stores both ends of each edge | O(E) |
| List the neighbours of one vertex | Proportional to how many it has |
| Ask a matrix whether one pair is an edge | O(1), and O(V²) space |
| Store the list | O(V + E) |

V is vertices and E is edges. Each undirected edge adds two entries, and that factor of 2 disappears in the big-O. Five vertices and three edges would still be 25 matrix cells, mostly absences. Mark each vertex once during the search and the neighbour walks add up to O(V + E) again.

## In the course

The shortest-path exercise gives you \`edges\` as \`[from, to]\` pairs. One loop builds this object: each end is appended to the other's array. After that, the queue or the stack only asks for neighbours.

If \`start\` never appears in \`edges\`, still handle it. Distance to itself is 0. Distance to anyone else means no path. Keys you saw only in the pairs will miss that start unless you add the empty array.

## Common mistakes

Appending only one direction, so the graph falls apart when you start at the end you forgot. Write both pushes in the same place. Scanning \`edges\` again from inside the search, which ignores the list you just built. Treating \`[1, 0]\` and \`[0, 1]\` as different neighbour sets. Distances do not care about order. Building a class around the object. The arrays are the structure. A class does not change the cost.

## When to use it

Use an adjacency list when a search keeps asking who is one step from here: breadth-first, depth-first, or the weighted walk this course only names. Use it on the sparse graphs in these exercises, where E is far below V times V. A plain object keyed by the integer ids is enough.

## When not to

Do not copy a tree into arrays when the nodes already hold child pointers. Those pointers are the neighbours, and depth does not need a second store. Do not use the list to probe "is this exact pair present?" on a dense graph. A matrix answers that in O(1) and pays for the square. These exercises ask you to walk outwards.

## FAQ

### What does one entry look like?

A key is a vertex id. The value is the ids one edge away. For the triangle, 0 holds \`[1, 2]\`, 1 holds \`[0, 2]\`, and 2 holds \`[1, 0]\`, order aside. No weights. Every edge costs one hop.

### Why push both ends?

The edge is undirected. 0 to 1 means 1 to 0. One push is one direction. Skip the return and you can only walk one way.

### Why not a table of every pair?

A table answers "is this edge present?" in O(1) and stores missing edges too. These searches ask for the neighbours of one vertex, in time proportional to how many there are, in O(V + E) space.

## Related

The list is how you store the graph, and the layer walk is the first search that reads it.

- [What Is a Graph? Vertices, Undirected Edges, and Cycles](/articles/graphs)
- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
    `,
  ),
  defineArticle(
    "breadth-first-search",
    "How Does Breadth-First Search Find the Fewest Edges?",
    "Trees and graphs",
    "Breadth-first search uses a queue to walk neighbours, then neighbours of neighbours. When every edge costs the same, the first time you reach a vertex is the fewest edges.",
    ["breadth-first search", "breadth-first", "level order"],
    `
Breadth-first search walks a graph in layers. You handle the neighbours of the start, then the neighbours of those neighbours, and a queue keeps that order. When every edge costs the same, the first time you reach a vertex you got there by the fewest edges. If the edges have different costs, that claim is false, and a hop count picks the wrong route.

\`\`\`mermaid
graph TD
  b0["0"] --- b1["1"]
  b1 --- b2["2"]
  b0 --- b2
\`\`\`

## How it works

Put the start on a queue at distance 0 and mark it in that moment. Then take the vertex that has waited longest. Mark each unmarked neighbour, store a distance one larger, and enqueue it. Skip a neighbour you have already marked. You already reached it in as few equal-cost edges as this walk will find.

The fewest-edges claim is only true when every edge has the same cost. Each layer is one hop, so the first arrival is the smallest layer. A heavy edge in layer 1 can lose to several cheap edges discovered later. Weighted edges need Dijkstra. This course names that algorithm and does not ask you to build it.

Level order on a tree is the same walk: root, then children, then grandchildren. Marks are optional on a tree. On a graph they are required, or a cycle puts vertices back on the queue forever.

Mark when you first enqueue, not when you dequeue. While a vertex sits unmarked in the queue, every neighbour that can see it enqueues another copy. Those copies waste work and can blow up the queue. Carry the distance with the vertex, or store it when you enqueue. If the queue empties and the target was never marked, there is no path. The distance from a vertex to itself is 0, before you have walked anywhere.

## A numeric example

Vertices 0, 1, and 2 sit in a line, and there is also a direct edge from 0 to 2. The edges are \`[0, 1]\`, \`[1, 2]\`, and \`[0, 2]\`. Neighbour lists, up to order, are 0: \`[1, 2]\`, 1: \`[0, 2]\`, 2: \`[1, 0]\`. Search from 0 for 2.

Enqueue 0 at distance 0 and mark 0. The queue is \`[0]\`. Dequeue 0. Neighbour 1 is unmarked, so mark 1, store distance 1, and enqueue 1. Neighbour 2 is unmarked, so mark 2, store distance 1, and enqueue 2. The queue is \`[1, 2]\`. You have already recorded that 2 was reached in 1 edge, along the direct edge, not in 2 edges along the line through 1.

Dequeue 1. Its neighbours are 0 and 2. Both are marked, so you enqueue nothing. The queue is \`[2]\`. The route 0–1–2 is 2 edges, and you refuse it because 2 was marked when the direct edge discovered it. Dequeue 2. The stored distance is 1. That is the answer.

Mark on dequeue instead and 2 is enqueued twice. Dequeue 0, enqueue 1 and 2, then dequeue 1 while 2 is still unmarked, so 1 enqueues 2 again. The queue holds 2 twice. Dozens of incoming edges means dozens of copies.

From 0 to 0 the distance is 0, before 1 or 2 are touched. From 0 to a missing 3 the queue drains, 3 was never marked, and there is no path.

## Cost

| Piece | Cost |
| --- | --- |
| Walk, marking each vertex on enqueue | O(V + E) |
| One \`Array.shift\` dequeue on an array of length k | O(k) |
| Memory for marks, distances, and the queue | O(V) |
| Same walk with unequal edge weights | Wrong tool |

Enqueue each vertex once and the neighbour scans sum to a constant times E, so the walk is O(V + E). \`Array.shift\` as dequeue is O(n) per call: every later entry slides down. The queue article owns that cost. Keep first-in, first-out order here. Do not drop the queue to dodge the slide.

## In the course

Return the edge count from \`start\` to \`end\`. Return 0 when they are the same vertex. Return -1 when no path exists. Every edge costs the same, so build the lists, enqueue the start at distance 0, mark on enqueue, and carry the distance. The public triangle answers 1. A disconnected pair answers -1. The line 0–1–2–3 answers 3, one hop at a time, with no shortcut. Level order on a tree is this queue: grandchildren wait behind children, just as distance 2 waits behind distance 1.

## Common mistakes

Marking on dequeue, so one vertex is queued once per incoming edge. Using this walk because the title says shortest, when the edges have different costs. Equal weights: queue. Unequal non-negative weights: a heap and relaxation, which you are not asked to code. Returning -1 when start and target match, or 0 when the target is missing. 0 is "already there". An empty queue with the target unmarked is no path. Calling \`Array.shift\` and also scanning every edge for neighbours. Read the adjacency array. The queue article owns the shift cost.

## When to use it

Use it for fewest edges, or for the layer of each vertex, when every edge costs the same. That includes level order on a tree. Mark on enqueue and keep the distance from the moment you discover the vertex.

## When not to

Do not use it when weights differ. The one-hop route can be the expensive one, and a cheaper path can still be sitting in a later layer. Do not use it when you only need reachability. A depth-first walk answers that with a stack and does not track layers.

## FAQ

### Why is the first visit the fewest edges?

You finish layer 0, then layer 1, then layer 2, and you enqueue each vertex once. The first enqueue came from the previous layer, so no earlier layer could see it. That needs equal edge costs.

### What do I return if the target never shows up?

No path. In the exercise that is -1. 0 is only the distance from a vertex to itself, known before the queue runs.

### Does level order on a tree count?

Yes. One edge from the root, then two, and so on. Same queue. The payload is a tree node instead of an integer id.

## Related

The queue is the order this walk depends on, and the weighted case is the algorithm this course only names.

- [What Is a Queue? FIFO Order, Enqueue, and Dequeue](/articles/queues)
- [What Is Dijkstra's Algorithm for Weighted Shortest Paths?](/articles/dijkstra)
    `,
  ),
  defineArticle(
    "depth-first-search",
    "How Does Depth-First Search Explore One Branch First?",
    "Trees and graphs",
    "Depth-first search uses a stack or recursion to finish one branch before the others. It answers reachability, not fewest edges.",
    ["depth-first search", "depth-first"],
    `
Depth-first search finishes one branch before it starts the next. You step to a neighbour, then deeper, and a call stack or an explicit stack brings you back to try the neighbour you skipped. The walk answers whether you can reach a vertex and which other vertices sit in the same connected piece. It does not answer fewest edges, because the first branch that finds the target can be a long one.

\`\`\`mermaid
graph TD
  d0["0"] --- d1["1"]
  d1 --- d2["2"]
  d2 --- d3["3"]
  d3 --- d4["4"]
  d0 --- d4
\`\`\`

## How it works

Mark the start and dive down the first unmarked neighbour, then the next, until that vertex has nowhere new to go. Come back and try the neighbour you skipped. Coming back is a function return, which pops the call stack, or a pop from a stack you allocated. Both are the same kind of order: finish one branch, then resume the one that was waiting.

An explicit stack stores those waiting vertices as data. Push the start. While the stack is not empty, pop a vertex and push its unmarked neighbours. Push them last-to-first and the first neighbour sits on top, matching recursion. You do not need both mechanisms at once.

You can report reachability and membership. A marked target means you can get there. An unmarked target at the end means you cannot. The vertices you marked are this connected piece. You cannot report fewest edges. The first arrival is just the first branch that found the target. A one-edge neighbour of the start can still be waiting while you are many steps down another chain. Use breadth-first search when the question is distance and every edge costs the same.

On a tree, finishing one child before the other is depth-first too. There is no cycle, so marks are optional. The shape is still dive, finish, then the sibling. Backtracking is the same shape on choices you generate: choose, dive, undo, try the next. A graph search leaves the vertex marked. Backtracking clears the choice so a later branch can reuse it.

## A numeric example

Vertex 0 connects to 1 and to 4. The long branch is 0–1–2–3–4. The short branch is the edge 0–4. If 0's neighbours are \`[1, 4]\`, the first dive takes 1.

Mark 0, then 1, then 2, then 3, then 4. You reach 4 along four edges. The direct edge 0–4 is still unused, because it was the second neighbour and you went deep on the first branch first. Reachability is a correct yes, and the marked set is one connected piece. Fewest edges is 1, which breadth-first search reports by enqueueing 4 in the first layer. Returning 4 fails that question.

Swap the array to \`[4, 1]\` and the first dive hits 4 in one edge. You got lucky. Neighbour order hid the long branch. A correct distance cannot depend on that swap.

A straight line of V vertices uses V stack frames before anyone returns. That is O(V) stack space in the worst case, call stack or array. With marks, time stays O(V + E). Drop the marks and add one edge back to an earlier vertex, and the dive never returns.

## Cost

| Piece | Cost |
| --- | --- |
| Time, with each vertex marked once | O(V + E) |
| Stack space on a straight line | O(V) |
| Stack space on a balanced tree | About O(log V) in the height |
| First arrival, read as a distance | Not a hop count |

The time bound matches breadth-first search: vertices plus the neighbour entries you scan. A straight line is the expensive stack, O(V). A bushy graph stays shallower and can still report a long path first. Stack space and path quality are different facts.

## In the course

The graphs exercise wants fewest edges, so you submit a breadth-first search. This walk is for reachability, a connected piece, or the tree-depth recursion you already wrote. It answers whether you can get there and which vertices are in this component. It does not answer the shortest path. You meet the same dive in backtracking, on choices you generate, and you mark on the way in if you sketch it. Reachability must match between a stack and recursion. The printed order need not.

## Common mistakes

Returning the first branch length as a distance. On this drawing that length is 4 or 1 depending on neighbour order, and a fewest-edges test fails one of them. Skipping marks because a tree did not need them. One edge back to an earlier vertex and the dive loops. Popping a stack from the opposite end, which is a queue. A stack takes from the end you just pushed. Backtracking is the same dive with an undo. Undo a graph mark too early and you walk a cycle. Forget the undo on a puzzle and you block a later legal choice.

## When to use it

Use it for reachability, for one connected piece, and for tree recursion that finishes one child before the other. Use the call stack, or an explicit stack if you want the same order without recursion. Keep marks on any graph that might contain a cycle.

## When not to

Do not use it for fewest edges. Neighbour order picks the branch. Do not use it for weighted costs. It never compares totals. Do not use it for level order. A layer walk wants a queue. Depth of a tree wants this dive.

## FAQ

### Stack or recursion?

Either. Recursion uses the call stack. An array you push and pop from the same end stores the same waiting vertices. Reachability matches.

### Why did I reach the target by a long path?

That branch was first in the neighbour list. The short edge waits until the long branch returns, and by then the target is already marked. Use breadth-first search when every edge costs the same and you need the fewest of them.

### Is the depth of a tree this search?

Yes. One child finishes before the other. A tree has no cycle, so you can skip a visited set. The order is still dive, then the sibling.

## Related

The same dive shows up when the neighbours are choices you can undo, and the layer walk is what you switch to for hop count.

- [What Is Backtracking? Choose, Explore, Then Undo](/articles/backtracking)
- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
    `,
  ),
  defineArticle(
    "dijkstra",
    "What Is Dijkstra's Algorithm for Weighted Shortest Paths?",
    "Trees and graphs",
    "Dijkstra finds shortest paths when edges have different costs. It is the breadth-first walk with a heap that always extends the cheapest path so far. This course names it without asking you to build it.",
    ["Dijkstra"],
    `
Dijkstra finds shortest paths when edges have different costs. It is the breadth-first walk with a heap in place of a plain queue, so you always extend the cheapest path so far. Several cheap edges can beat one expensive edge, which means a hop count would pick the wrong route. This course names the algorithm and does not ask you to build it.

\`\`\`mermaid
graph TD
  w0["0"] -->|1| w1["1"]
  w1 -->|2| w2["2"]
  w0 -->|10| w2
\`\`\`

## How it works

Breadth-first search finds fewest edges only when every edge costs the same. One direct edge of weight 10 can lose to two edges of weight 1 and 2. Counting hops picks the expensive route. You order vertices by total cost instead.

A min-heap replaces the queue. The queue hands you whoever waited longest. The heap hands you the vertex you can reach for the smallest total cost so far. The source starts at 0. Every other vertex starts at a "not reached" cost larger than any real path. Taking a vertex off the heap settles it. With non-negative weights, that recorded cost is the cheapest way to stand there.

Relax each outgoing edge. Add its weight to the cost of the vertex you just settled. If that sum is cheaper than the best cost stored for the neighbour, update the neighbour and push it. If not, leave it. The comparison is the whole idea, and it is not a program you can submit. There is no heap loop and no function a test could call.

\`\`\`ts
const best = [0, 1, 10];
const current = 1;
const neighbour = 2;
const weight = 2;
const via = best[current] + weight;
if (via < best[neighbour]) {
  best[neighbour] = via;
}
console.log(via, best);
\`\`\`

The first time you settle the target, that cost is the cheapest. Later heap entries are at least that large. Equal weights collapse back to breadth-first search. Unequal non-negative weights are the heap plus this relaxation. Negative weights break the simple version: a later negative edge can undercut a vertex you already settled and refused to reopen. This course does not ask you to handle them, and it does not ask you to build the algorithm.

## A numeric example

Edge 0 to 2 has weight 10. Edge 0 to 1 has weight 1. Edge 1 to 2 has weight 2.

Counting edges says the direct edge is shorter: 1 hop against 2. Breadth-first search would answer 1. Dijkstra says cost 3 via 1 beats cost 10.

Settle 0 at cost 0. Relax its edges. Vertex 1 becomes 1. Vertex 2 becomes 10. The heap holds those two. Take 1 next, because 1 is smaller than 10. Relax 1 to 2: 1 + 2 is 3, and 3 beats 10, so store 3 and push 2 again. The old entry of 10 is stale. When it pops, 10 is not better than 3, so you ignore it.

The first time you settle 2, the cost is 3, along 0–1–2. The direct edge is still in the graph. It lost. If every weight is 1, hop count and total cost agree, and the queue was enough.

## Cost

| Situation | What you use |
| --- | --- |
| Every edge costs the same | Breadth-first search, O(V + E) |
| Non-negative weights differ | A heap, plus relaxation |
| Negative weights | The simple version is wrong |
| Building it in this course | Not required |

A heap push or pop follows the height of the heap, so the next vertex costs more to choose than the front of a queue. You do not need the formula. The next vertex is the smallest total, not the oldest arrival. Building that loop is not the exercise.

## In the course

The graphs lesson names Dijkstra and stops. Weighted shortest paths are a heap plus this walk, one step further than the course goes. Your function counts unweighted edges. It returns 0 when start and target match, and -1 when the target is never reached. The pairs are \`[from, to]\` with no weight to read.

Same cost on every edge: queue, mark on enqueue, first arrival wins. Different non-negative costs: the heap yields the smallest total, and you relax only when the new total wins. Negative costs: the simple rule fails, and you are not asked to replace it. The heap is the one from the heaps lesson, keyed by path cost rather than by a raw input value. Knowing that is the point. Wiring a solver is not.

## Common mistakes

Writing a full solver because the name appeared. A settle loop someone could submit is an implementation, and the unweighted exercise does not need a heap. Trusting breadth-first search on the drawing: it answers 1 edge and cost 10, while cost 3 uses 2 edges. Both vertices were discovered from 0, so the queue cannot prefer the cheap one. Overwriting cost 3 with the stale 10. Relaxation writes only when the new total is strictly cheaper. Treating a negative weight as safe after you have settled a vertex. The first settlement is final only for non-negative weights. This course does not ask you to repair that.

## When to use it

Use the idea for different non-negative costs, when you want the cheapest total rather than the fewest hops. The heap picks the smallest total so far, and you relax an edge only when the new total wins. When every edge costs the same, use breadth-first search.

## When not to

Do not build it for the shortest-path exercise. Those edges have no weights, and a queue already returns the hop count or -1. Do not use the simple version on a negative weight. The first settlement is no longer safe, and you are not asked to swap algorithms. Do not use it for a bare reachability question. Depth-first search answers that without a heap.

## FAQ

### Why can two cheap edges beat one expensive edge?

The score is the sum of the weights. 1 + 2 is 3. The direct edge is 10. More edges, less cost. Breadth-first search never adds the weights, so it keeps the direct edge.

### What does the heap change?

A queue pops the oldest vertex. A min-heap pops the smallest total so far, so cost 1 on vertex 1 comes off before cost 10 on vertex 2. That is how 2 improves from 10 to 3 before it is settled. The structure is the binary heap from the heaps lesson. The key is a path cost.

### Do I need to handle a negative weight?

No. A negative weight can undercut a vertex you already settled. This course does not ask you to handle that. You count edges, and you know the name of the weighted algorithm you are not building.

## Related

The heap is the structure that orders the costs, and breadth-first search is the equal-weight walk you actually write.

- [What Is a Binary Heap? Min, Max, and the kth Largest](/articles/heaps)
- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
    `,
  ),
];

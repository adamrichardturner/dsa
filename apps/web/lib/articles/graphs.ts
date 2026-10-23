import { defineArticle, type Article } from "./types";

export const graphArticles: readonly Article[] = [
  defineArticle(
    "graphs",
    "What Is a Graph? Vertices, Undirected Edges, and Cycles",
    "Trees and graphs",
    "A graph is vertices plus edges. A tree is a graph with no cycles; a general graph can loop, so a search has to remember where it has been. This course uses undirected edges.",
    [
      "graph",
      "graphs",
      "vertices",
      "graph edge",
      "graph edges",
      "undirected graph",
      "directed graph",
      "weighted graph",
      "graph cycle",
    ],
    `
A graph is a set of vertices plus a set of edges that join them. A vertex is a place you can stand, and an edge is one step between two of those places. A tree is a connected graph with no cycles, so every pair of vertices has exactly one simple path between them. A graph can be disconnected or loop back on itself, and a search has to remember where it has been or it can walk a cycle forever.

\`\`\`mermaid
graph TD
  v0["0"] --- v1["1"]
  v1 --- v2["2"]
  v2 --- v0
  v1 --- v3["3"]
\`\`\`

## How it works

You read an undirected edge in both directions. 0 joined to 1 means a step from 0 to 1 and a step from 1 to 0. A directed edge would not promise the return. This course uses undirected edges, so store both directions. Leave one out and the walk is one-way.

A tree is connected, has no cycles, and has one path between every pair of vertices. A graph with no cycles but several components is a forest, not one tree. A general graph may have cycles. The drawing is the cycle 0–1–2–0 plus the edge 1–3. A search that does not remember where it has been can loop on 0, 1, 2 forever. Nothing in the edge list tells it to stop.

Three representations are worth distinguishing. An **edge list** stores pairs such as \`[0, 1]\`; it takes O(E) space and is compact input, but finding one vertex's neighbours requires scanning every edge. An **adjacency list** stores a neighbour array per vertex, takes O(V + E) space for an undirected graph, and lists one vertex's neighbours in O(degree) time. It is usually best for sparse graphs and traversal. An **adjacency matrix** stores one cell for every possible pair. It uses O(V²) space, lists neighbours in O(V), but answers “is this exact edge present?” in O(1). The representation changes storage and lookup costs, not the mathematical graph.

Mark a vertex when you first decide to visit it. That is the moment it goes on the queue or the stack, not the moment it comes off. If you wait, every incoming edge can enqueue another copy. You repeat work, and the queue can blow up. A set of ids is enough memory. You do not need a class.

Breadth-first search answers fewest edges when every edge costs the same. Neighbours come first, then neighbours of neighbours, and the first arrival is the hop count. Depth-first search answers whether you can get there and what else is in this piece. Its first arrival is only the branch it tried first, which can be long. Level order on a tree is breadth-first. Finishing one child before the other is depth-first.

This complete example stores the drawing as an edge list, converts it to an adjacency list, and prints every vertex reachable from 0. The \`vertexCount\` parameter preserves isolated vertices, which do not appear in any edge.

\`\`\`ts
type Edge = readonly [number, number];

const buildUndirectedGraph = (
  vertexCount: number,
  edges: readonly Edge[],
): number[][] => {
  const neighbours = Array.from(
    { length: vertexCount },
    (): number[] => [],
  );

  for (const [from, to] of edges) {
    const fromNeighbours = neighbours[from];
    const toNeighbours = neighbours[to];
    if (fromNeighbours === undefined || toNeighbours === undefined) {
      continue;
    }

    fromNeighbours.push(to);
    toNeighbours.push(from);
  }

  return neighbours;
};

const reachableFrom = (
  neighbours: readonly (readonly number[])[],
  start: number,
): number[] => {
  if (neighbours[start] === undefined) {
    return [];
  }

  const visited = Array.from({ length: neighbours.length }, () => false);
  const stack = [start];
  const reached: number[] = [];
  visited[start] = true;

  while (stack.length > 0) {
    const vertex = stack.pop();
    if (vertex === undefined) {
      continue;
    }

    reached.push(vertex);
    const adjacent = neighbours[vertex] ?? [];
    for (const neighbour of adjacent) {
      if (visited[neighbour]) {
        continue;
      }

      visited[neighbour] = true;
      stack.push(neighbour);
    }
  }

  return reached;
};

const edges: readonly Edge[] = [
  [0, 1],
  [1, 2],
  [2, 0],
  [1, 3],
];
const graph = buildUndirectedGraph(5, edges);

console.log(graph);
console.log(reachableFrom(graph, 0));
\`\`\`

Expected output: the adjacency lists \`[[1, 2], [0, 2, 3], [1, 0], [1], []]\`, followed by a traversal containing \`0, 1, 2, 3\`. Vertex 4 remains isolated. The exact DFS order depends on the order in which neighbours are pushed.

The builder's endpoint guard skips malformed edges. That is one explicit API policy, not a graph rule; a production boundary might throw a \`RangeError\` instead. The traversal uses an array of booleans because vertex ids are dense integers from 0 through \`vertexCount - 1\`. With arbitrary string labels, a plain object keyed by label can store the same marks.

\`\`\`mermaid
stateDiagram-v2
  [*] --> Undiscovered
  Undiscovered --> Scheduled: mark and push/enqueue
  Scheduled --> Processed: remove and scan neighbours
  Processed --> Processed: later edges are ignored
\`\`\`

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

## Practice

1. Add isolated vertex 5 to the example and predict searches from 0 and from 5 before running them.
2. Convert the undirected builder into a directed builder. Find a pair of vertices where reachability works in one direction but not the other.
3. Write \`componentCount\`: start one traversal from every still-unvisited vertex. State an invariant for the outer loop and test a graph with a cycle plus two isolated vertices.

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

Yes. A tree is a connected, acyclic graph, so exactly one path joins every pair of vertices. A disconnected acyclic graph is a forest. Add one edge between two existing tree vertices and you create a cycle.

### Why mark a vertex before you take it off the queue?

Deciding to visit happens before the visit. Wait until dequeue and neighbours push extra copies. Mark at the decision and those copies are never created. A stack uses the same rule.

### Does the edge from 0 to 1 let me walk back?

In this course, yes. Undirected means 0 to 1 is also 1 to 0. A directed edge would not promise the return. Store one direction and paths that should exist look missing.

## Degree, paths, and components

The **degree** of an undirected vertex is its number of incident edge ends. Summing all degrees counts every edge twice, once at each endpoint, so the result is \(2E\). This handshake lemma is a useful representation check: after building a simple undirected adjacency list, the sum of row lengths should be twice the edge-list length.

A **walk** may repeat vertices and edges. A **trail** does not repeat edges. A **simple path** does not repeat vertices. A connected component is a maximal set in which every pair is joined by a path. Running BFS or DFS from every still-unvisited vertex labels all components in O(V + E).

\`\`\`mermaid
flowchart LR
  scan["Scan every vertex"] --> seen{"Already visited?"}
  seen -->|yes| scan
  seen -->|no| search["Run BFS or DFS"]
  search --> label["Label one whole component"]
  label --> scan
\`\`\`

Self-loops, parallel edges, and directed edges are valid in some graph models, but algorithms must state whether they allow them. A self-loop immediately forms a cycle. Parallel edges affect edge counts and weighted choices. This course’s examples are simple unless a lesson explicitly says otherwise.

## Related

The neighbour store is what a search asks, and the layer walk is how you count equal-cost edges.

- [What Is an Adjacency List? Neighbours of Each Vertex](/articles/adjacency-lists)
- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
- [How Do Directed Cycles and Topological Order Work?](/articles/directed-acyclic-graphs)
    `,
  ),
  defineArticle(
    "adjacency-lists",
    "What Is an Adjacency List? Neighbours of Each Vertex",
    "Trees and graphs",
    "An adjacency list stores, for each vertex, the vertices one edge away. One pass over the edge list builds it, and a search asks it for neighbours.",
    ["adjacency list"],
    `
An adjacency list stores, for each vertex, the vertices that sit one edge away. You build it with one pass over the edge list, and after that a search never scans the pairs again. It asks a smaller question: given this vertex, who are the neighbours? That question is the whole interface breadth-first and depth-first search need. The representation invariant for this course is that every row exists, every endpoint is in range, and every undirected edge appears once in each endpoint's row.

\`\`\`mermaid
flowchart TD
  edgeList["edges"] --> onePass["one pass"]
  onePass --> row0["0: 1, 2"]
  onePass --> row1["1: 0, 2"]
  onePass --> row2["2: 1, 0"]
\`\`\`

\`\`\`mermaid
flowchart LR
  e01["read 0—1"] --> s1["0: [1]<br/>1: [0]<br/>2: []"]
  s1 -->|"read 1—2"| s2["0: [1]<br/>1: [0, 2]<br/>2: [1]"]
  s2 -->|"read 0—2"| s3["0: [1, 2]<br/>1: [0, 2]<br/>2: [1, 0]"]
\`\`\`

## How it works

When vertices are the integers 0 through V − 1, an array of neighbour arrays is the simplest representation: the outer index is the vertex and the inner array lists its neighbours. For arbitrary labels, an object whose keys are labels serves the same purpose. You do not need a graph class. A lookup gives you one neighbour list, and walking that list gives you everyone one step away.

Build it in one pass over the edges. For an undirected edge, append each end to the other's list. Append only one way and you can walk 0 to 1 but not 1 to 0. The input promised both directions.

A vertex that appears in no edge can still be the start. Create an empty array for it, or treat a missing key as no neighbours. Distance from a vertex to itself is still 0. An empty array means no steps, not "this vertex is absent".

After the pass, breadth-first and depth-first search never scan the pairs again. Given a vertex, they read its neighbours. That is the whole interface. Order inside an array may vary, and a breadth-first distance does not care. A depth-first walk might enter a different branch first. Reachability stays the same if you mark visited.

A matrix of every pair answers "is this one edge present?" in O(1) and spends space on missing edges. Sparse graphs in these exercises want the list. Space is O(V + E): one array per vertex, plus one slot for each stored end of an edge.

## A numeric example

Take \`[0, 1]\`, \`[1, 2]\`, and \`[0, 2]\`.

Start empty. After 0–1 you have 0: \`[1]\` and 1: \`[0]\`. After 1–2 you have 1: \`[0, 2]\` and 2: \`[1]\`. After 0–2 you have 0: \`[1, 2]\` and 2: \`[1, 0]\`. The finished lists are 0: \`[1, 2]\`, 1: \`[0, 2]\`, 2: \`[1, 0]\`. Another push order might show 2: \`[0, 1]\`. The sets match.

Listing neighbours of 0 reads two ids. The time is proportional to how many neighbours there are. A vertex with 40 neighbours costs about 40 steps. A vertex with 1 neighbour costs about 1. You do not scan cells for edges that are not there.

Vertex 3 with no edges is missing until you give it \`[]\`. A path from 3 to 3 is 0. A path from 3 to 0 enqueues nothing and does not exist.

The builder below is complete and keeps isolated vertex 3 by allocating all four rows before reading an edge.

\`\`\`ts
type Edge = readonly [number, number];

const buildAdjacencyList = (
  vertexCount: number,
  edges: readonly Edge[],
): number[][] => {
  const neighbours = Array.from(
    { length: vertexCount },
    (): number[] => [],
  );

  for (const [from, to] of edges) {
    const fromNeighbours = neighbours[from];
    const toNeighbours = neighbours[to];
    if (fromNeighbours === undefined || toNeighbours === undefined) {
      continue;
    }

    fromNeighbours.push(to);
    toNeighbours.push(from);
  }

  return neighbours;
};

const edges: readonly Edge[] = [
  [0, 1],
  [1, 2],
  [0, 2],
];
const neighbours = buildAdjacencyList(4, edges);

console.log(neighbours);
console.log(neighbours[0]);
console.log(neighbours[3]);
\`\`\`

Expected output is \`[[1, 2], [0, 2], [1, 0], []]\`, then \`[1, 2]\`, then \`[]\`.

The tuple type \`readonly [number, number]\` fixes each edge at exactly two numeric endpoints and prevents the builder from rewriting caller-owned pairs. The outer \`readonly Edge[]\` prevents replacing or appending input edges inside the function. The returned \`number[][]\` is mutable because construction appends neighbours; callers that should only read it can expose it as \`readonly (readonly number[])[]\`.

This snippet silently skips an out-of-range endpoint. If malformed input is a programming error, replace \`continue\` with a \`RangeError\`; whichever policy you choose, document and test it. Silently manufacturing a row for an invalid id would violate the fixed \`0..vertexCount - 1\` vertex model.

## Cost

| Piece | Cost |
| --- | --- |
| One pass that stores both ends of each edge | O(E) |
| List the neighbours of one vertex | Proportional to how many it has |
| Ask a matrix whether one pair is an edge | O(1), and O(V²) space |
| Store the list | O(V + E) |

V is vertices and E is edges. Each undirected edge adds two entries, and that factor of 2 disappears in the big-O. Five vertices and three edges would still be 25 matrix cells, mostly absences. Mark each vertex once during the search and the neighbour walks add up to O(V + E) again.

## Practice

1. Build the lists for \`[0, 2]\`, \`[2, 3]\`, and \`[2, 4]\`, including an empty row for vertex 1.
2. Add input validation that reports an edge endpoint outside \`0..vertexCount - 1\` instead of skipping it. Decide whether returning a result or throwing best fits your caller.
3. For a graph with V = 10,000 and E = 20,000, compare how many edge slots an undirected list stores with how many cells a matrix allocates.

## In the course

The shortest-path exercise gives you \`edges\` as \`[from, to]\` pairs. One loop builds the adjacency list: each end is appended to the other's array. After that, the queue or the stack only asks for neighbours.

If \`start\` never appears in \`edges\`, still handle it. Distance to itself is 0. Distance to anyone else means no path. Keys you saw only in the pairs will miss that start unless you add the empty array.

## Common mistakes

Appending only one direction, so the graph falls apart when you start at the end you forgot. Write both pushes in the same place. Scanning \`edges\` again from inside the search, which ignores the list you just built. Treating \`[1, 0]\` and \`[0, 1]\` as different neighbour sets. Distances do not care about order. Building a class around the object. The arrays are the structure. A class does not change the cost.

## When to use it

Use an adjacency list when a search keeps asking who is one step from here: breadth-first, depth-first, or the weighted walk this course only names. Use it on sparse graphs, where E is far below V². An array is ideal for consecutive integer ids; an object works for arbitrary labels.

## When not to

Do not copy a tree into arrays when the nodes already hold child pointers. Those pointers are the neighbours, and depth does not need a second store. Do not use the list to probe "is this exact pair present?" on a dense graph. A matrix answers that in O(1) and pays for the square. These exercises ask you to walk outwards.

## FAQ

### What does one entry look like?

A key is a vertex id. The value is the ids one edge away. For the triangle, 0 holds \`[1, 2]\`, 1 holds \`[0, 2]\`, and 2 holds \`[1, 0]\`, order aside. No weights. Every edge costs one hop.

### Why push both ends?

The edge is undirected. 0 to 1 means 1 to 0. One push is one direction. Skip the return and you can only walk one way.

### Why not a table of every pair?

A table answers "is this edge present?" in O(1) and stores missing edges too. These searches ask for the neighbours of one vertex, in time proportional to how many there are, in O(V + E) space.

## Representation invariants

For a simple undirected graph, every stored \`u → v\` entry must have one matching \`v → u\` entry, every endpoint must be in range, and no row should contain the same neighbour twice. For a directed graph, symmetry is intentionally absent. For a weighted graph, each neighbour entry carries both an endpoint and a weight. State the model before validating the representation.

\`\`\`mermaid
flowchart TD
  model{"Graph model"} -->|undirected| symmetric["Store both directions"]
  model -->|directed| outgoing["Store outgoing direction only"]
  model -->|weighted| payload["Store neighbour plus weight"]
  symmetric --> validate["Validate endpoint range"]
  outgoing --> validate
  payload --> validate
\`\`\`

Adding a vertex to an adjacency list is O(1) amortized when ids are appended consecutively. Adding an edge is O(1) amortized if duplicates are allowed or already ruled out by the input. Removing an edge or testing whether a particular edge exists costs O(degree) with unsorted neighbour arrays because the row must be searched.

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
    ["breadth-first search", "breadth-first", "bfs", "level order"],
    `
Breadth-first search walks a graph in layers. You handle the neighbours of the start, then the neighbours of those neighbours, and a queue keeps that order. When every edge costs the same, the first time you reach a vertex you got there by the fewest edges. If the edges have different costs, that claim is false, and a hop count picks the wrong route.

\`\`\`mermaid
flowchart LR
  b0["0<br/>distance 0"] --- b1["1<br/>distance 1"]
  b0 --- b2["2<br/>distance 1"]
  b1 --- b3["3<br/>distance 2"]
  b2 --- b3
  b3 --- b4["4<br/>distance 3"]
\`\`\`

## How it works

Put the start on a queue at distance 0 and mark it in that moment. Then take the vertex that has waited longest. Mark each unmarked neighbour, store a distance one larger, and enqueue it. Skip a neighbour you have already marked. You already reached it in as few equal-cost edges as this walk will find.

The fewest-edges claim is only true when every edge has the same cost. Each layer is one hop, so the first arrival is the smallest layer. A heavy edge in layer 1 can lose to several cheap edges discovered later. Weighted edges need Dijkstra, which is an enrichment topic beyond these exercises.

Level order on a tree is the same walk: root, then children, then grandchildren. Marks are optional on a tree. On a graph they are required, or a cycle puts vertices back on the queue forever.

Mark when you first enqueue, not when you dequeue. While a vertex sits unmarked in the queue, every neighbour that can see it enqueues another copy. Those copies waste work and can blow up the queue. Carry the distance with the vertex, or store it when you enqueue. If the queue empties and the target was never marked, there is no path. The distance from a vertex to itself is 0, before you have walked anywhere.

\`\`\`mermaid
flowchart LR
  q0["queue: [0]<br/>d(0)=0"] --> q1["process 0<br/>queue: [1, 2]<br/>d=1"]
  q1 --> q2["process 1<br/>queue: [2, 3]<br/>d(3)=2"]
  q2 --> q3["process 2<br/>queue: [3]"]
  q3 --> q4["process 3<br/>queue: [4]<br/>d(4)=3"]
\`\`\`

The queue below uses a moving front index instead of \`Array.shift()\`, so dequeue is O(1). A distance of −1 also serves as the visited mark: any non-negative value means the vertex has already been discovered.

\`\`\`ts
const shortestDistance = (
  neighbours: readonly (readonly number[])[],
  start: number,
  target: number,
): number => {
  if (neighbours[start] === undefined || neighbours[target] === undefined) {
    return -1;
  }

  const distance = Array.from({ length: neighbours.length }, () => -1);
  const queue = [start];
  let front = 0;
  distance[start] = 0;

  while (front < queue.length) {
    const vertex = queue[front];
    front += 1;
    if (vertex === undefined) {
      continue;
    }

    if (vertex === target) {
      return distance[vertex] ?? -1;
    }

    const currentDistance = distance[vertex];
    const adjacent = neighbours[vertex];
    if (currentDistance === undefined || adjacent === undefined) {
      continue;
    }

    for (const neighbour of adjacent) {
      if (distance[neighbour] !== -1) {
        continue;
      }

      distance[neighbour] = currentDistance + 1;
      queue.push(neighbour);
    }
  }

  return -1;
};

const neighbours: readonly (readonly number[])[] = [
  [1, 2],
  [0, 3],
  [0, 3],
  [1, 2, 4],
  [3],
  [],
];

console.log(shortestDistance(neighbours, 0, 4));
console.log(shortestDistance(neighbours, 0, 0));
console.log(shortestDistance(neighbours, 0, 5));
\`\`\`

Expected output is \`3\`, \`0\`, and \`-1\`. To recover the actual path rather than only its length, store a predecessor when each neighbour is first discovered, then walk backward from the target and reverse that sequence.

The key invariant is: whenever a vertex is first enqueued, its stored distance is the shortest number of edges from the start. The queue holds discovered vertices in nondecreasing distance order. Therefore checking for the target on dequeue is safe; checking immediately after first discovery would also be safe in an unweighted graph. An unreachable vertex keeps distance \`-1\`.

Self-loops and parallel edges do not change a shortest distance because the visited test rejects rediscovery. They can add neighbour entries and therefore still count toward E. Invalid endpoint ids are a representation error and should be rejected or filtered before BFS rather than allowed to index outside the distance array.

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
| One dequeue with a moving front index | O(1) |
| Memory for marks, distances, and the queue | O(V) |
| Same walk with unequal edge weights | Wrong tool |

Enqueue each vertex once and the neighbour scans sum to a constant times E, so the walk is O(V + E). Avoid \`Array.shift()\`: it is O(n) per call because every later entry slides down. A moving front index preserves first-in, first-out order without those repeated shifts.

## Practice

1. Trace the queue and distance array after every dequeue in the example. Circle the moment the shortest distance to 4 becomes final.
2. Store a predecessor for every discovered vertex and return the path \`[0, 1, 3, 4]\` (or the equally short path through 2), not only distance 3.
3. Test an invalid start, an isolated start, a self-path, two tied shortest paths, and a disconnected target. Explain each return value.

## In the course

Return the edge count from \`start\` to \`end\`. Return 0 when they are the same vertex. Return -1 when no path exists. Every edge costs the same, so build the lists, enqueue the start at distance 0, mark on enqueue, and carry the distance. The public triangle answers 1. A disconnected pair answers -1. The line 0–1–2–3 answers 3, one hop at a time, with no shortcut. Level order on a tree is this queue: grandchildren wait behind children, just as distance 2 waits behind distance 1.

## Common mistakes

Marking on dequeue, so one vertex is queued once per incoming edge. Using this walk because the title says shortest, when the edges have different costs. Equal weights: queue. Unequal non-negative weights: a heap and relaxation. Returning -1 when start and target match, or 0 when the target is missing. 0 is "already there". An empty queue with the target unmarked is no path. Calling \`Array.shift()\` or scanning every edge for neighbours. Use a front index and read the adjacency array.

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

## Multi-source BFS

Sometimes distance means “how far from the nearest source?” Put every source in the queue at distance 0 before the loop, mark all of them, then run the ordinary algorithm. This is not several BFS runs: one shared frontier lets the earliest layer claim each vertex, preserving O(V + E) time.

\`\`\`mermaid
flowchart LR
  a["Source A<br/>0"] --> layer1["Nearest layer<br/>1"]
  b["Source B<br/>0"] --> layer1
  layer1 --> layer2["Next layer<br/>2"]
\`\`\`

The queue invariant is precise: before each dequeue, queued vertices appear in nondecreasing distance order, and every discovered vertex has its final unweighted distance. This invariant proves both early exit on the target and predecessor-based path reconstruction. If neighbour order changes, one chosen shortest path may change, but its length cannot.

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
    ["depth-first search", "depth-first", "dfs"],
    `
Depth-first search finishes one branch before it starts the next. You step to a neighbour, then deeper, and a call stack or an explicit stack brings you back to try the neighbour you skipped. The walk answers whether you can reach a vertex and which other vertices sit in the same connected piece. It does not answer fewest edges, because the first branch that finds the target can be a long one.

\`\`\`mermaid
flowchart LR
  d0["0: visit 1st"] --- d1["1: visit 2nd"]
  d1 --- d2["2: visit 3rd"]
  d2 --- d3["3: visit 4th"]
  d3 --- d4["4: visit 5th"]
  d0 ---|"short edge waits"| d4
\`\`\`

\`\`\`mermaid
flowchart TD
  enter0["enter 0"] --> enter1["enter 1"]
  enter1 --> enter2["enter 2"]
  enter2 --> enter3["enter 3"]
  enter3 --> enter4["enter 4"]
  enter4 --> leave4["finish 4"]
  leave4 --> leave3["finish 3"]
  leave3 --> leave2["finish 2"]
  leave2 --> leave1["finish 1"]
  leave1 --> leave0["finish 0"]
\`\`\`

## How it works

Mark the start and dive down the first unmarked neighbour, then the next, until that vertex has nowhere new to go. Come back and try the neighbour you skipped. Coming back is a function return, which pops the call stack, or a pop from a stack you allocated. Both are the same kind of order: finish one branch, then resume the one that was waiting.

An explicit stack stores those waiting vertices as data. Push the start. While the stack is not empty, pop a vertex and push its unmarked neighbours. Push them last-to-first and the first neighbour sits on top, matching recursion. You do not need both mechanisms at once.

For iterative DFS, mark when pushing so a vertex can be scheduled only once. For recursive DFS, mark immediately on function entry, before recursing into any neighbour. These are the same discovery moment expressed through different control flow. Marking only when a stack item is popped can preserve reachability if duplicates are skipped later, but it loses the useful “scheduled exactly once” invariant and may use much more memory.

You can report reachability and membership. A marked target means you can get there. An unmarked target at the end means you cannot. The vertices you marked are this connected piece. You cannot report fewest edges. The first arrival is just the first branch that found the target. A one-edge neighbour of the start can still be waiting while you are many steps down another chain. Use breadth-first search when the question is distance and every edge costs the same.

This iterative version pushes neighbours in reverse order so that the first neighbour in each list is popped next, matching a conventional recursive traversal. Marking on push prevents two vertices from scheduling the same neighbour.

\`\`\`ts
const depthFirstOrder = (
  neighbours: readonly (readonly number[])[],
  start: number,
): number[] => {
  if (neighbours[start] === undefined) {
    return [];
  }

  const visited = Array.from({ length: neighbours.length }, () => false);
  const stack = [start];
  const order: number[] = [];
  visited[start] = true;

  while (stack.length > 0) {
    const vertex = stack.pop();
    if (vertex === undefined) {
      continue;
    }

    order.push(vertex);
    const adjacent = neighbours[vertex] ?? [];

    for (let i = adjacent.length - 1; i >= 0; i -= 1) {
      const neighbour = adjacent[i];
      if (neighbour === undefined) {
        continue;
      }
      if (visited[neighbour]) {
        continue;
      }

      visited[neighbour] = true;
      stack.push(neighbour);
    }
  }

  return order;
};

const neighbours: readonly (readonly number[])[] = [
  [1, 4],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 0],
  [],
];

console.log(depthFirstOrder(neighbours, 0));
console.log(depthFirstOrder(neighbours, 5));
\`\`\`

Expected output is \`[0, 1, 2, 3, 4]\`, then \`[5]\`. The second traversal shows that an isolated start vertex still belongs to its own connected component.

The snippet accepts neighbour arrays as read-only and returns a fresh mutable result. Its reverse index loop is deliberate TypeScript code, not an algorithmic requirement: because an array stack is last-in, first-out, pushing the final neighbour first makes the first listed neighbour pop first. If only the reached set matters, neighbour order and output order are unspecified.

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

## Practice

1. Reverse only vertex 0's neighbour list and predict the new DFS order. Verify that the reached set does not change.
2. Write a recursive version and make its order match the iterative version. Identify where the call stack stores the work represented by the explicit stack.
3. Extend the traversal to detect a cycle in an undirected graph by carrying each vertex's parent. Explain why seeing the parent edge is not a cycle.

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

## Entry and exit times

A recursive DFS has two meaningful events for each vertex: discovery before exploring neighbours and finish after every neighbour returns. Recording increasing entry and exit times reveals nesting. In a DFS forest, one vertex is an ancestor of another exactly when its time interval contains the other interval.

\`\`\`mermaid
flowchart LR
  enterParent["Enter parent"] --> edge["Explore child edge"]
  edge --> enterChild["Enter child"]
  enterChild --> exploreChild["Explore child's neighbours"]
  exploreChild --> exitChild["Exit child"]
  exitChild --> resumeParent["Return to and exit parent"]
\`\`\`

That finish order supports topological sorting in directed acyclic graphs, while a directed edge to a currently active ancestor proves a cycle. An undirected cycle check is different: the edge back to the immediate parent is expected and must be ignored. “Visited” alone is therefore enough for reachability but not enough to classify every kind of cycle.

## Related

The same dive shows up when the neighbours are choices you can undo, and the layer walk is what you switch to for hop count.

- [What Is Backtracking? Choose, Explore, Then Undo](/articles/backtracking)
- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
- [How Do Directed Cycles and Topological Order Work?](/articles/directed-acyclic-graphs)
    `,
  ),
  defineArticle(
    "dijkstra",
    "What Is Dijkstra's Algorithm for Weighted Shortest Paths?",
    "Trees and graphs",
    "Enrichment: Dijkstra finds shortest paths when edges have different non-negative costs. A heap always extends the cheapest path so far. The current exercises do not require an implementation.",
    ["Dijkstra"],
    `
## Enrichment: beyond the current exercises

Dijkstra finds shortest paths when edges have different non-negative costs. It is a greedy algorithm: repeatedly settle the unsettled vertex with the smallest known total, then try to improve its neighbours. A min-heap makes that choice efficient on sparse graphs. Several cheap edges can beat one expensive edge, so a hop count can choose the wrong route. This article builds the conceptual bridge from BFS and heaps, but the current exercises do not require you to implement it.

\`\`\`mermaid
flowchart LR
  w0["0: cost 0"] ---|"weight 1"| w1["1: cost 1"]
  w1 ---|"weight 2"| w2["2: cost 3"]
  w0 ---|"weight 10"| w2
\`\`\`

\`\`\`mermaid
flowchart LR
  start["best: [0, ∞, ∞]"] --> settle0["settle 0<br/>best: [0, 1, 10]"]
  settle0 --> settle1["settle 1<br/>relax 1→2<br/>best: [0, 1, 3]"]
  settle1 --> settle2["settle 2<br/>final: [0, 1, 3]"]
\`\`\`

## How it works

Breadth-first search finds fewest edges only when every edge costs the same. One direct edge of weight 10 can lose to two edges of weight 1 and 2. Counting hops picks the expensive route. You order vertices by total cost instead.

A min-heap can replace the queue. A queue hands you whoever waited longest; the heap hands you the unsettled candidate with the smallest total cost so far. The source starts at 0. Every other vertex starts at infinity. Taking the cheapest current entry settles its vertex. With non-negative weights, no later route through an unsettled vertex can make that settled cost smaller.

Relax each outgoing edge. Add its weight to the cost of the vertex you just settled. If that sum is cheaper than the best cost stored for the neighbour, update the neighbour and push it. If not, leave it. A heap implementation can contain stale entries when a vertex improves; skip an entry whose cost no longer equals the stored best cost.

\`\`\`ts
type WeightedEdge = {
  readonly to: number;
  readonly weight: number;
};

const dijkstra = (
  graph: readonly (readonly WeightedEdge[])[],
  start: number,
): number[] => {
  const distance = Array.from(
    { length: graph.length },
    () => Number.POSITIVE_INFINITY,
  );
  const settled = Array.from({ length: graph.length }, () => false);
  if (graph[start] === undefined) {
    return distance;
  }
  distance[start] = 0;

  for (let count = 0; count < graph.length; count += 1) {
    let vertex = -1;

    for (let candidate = 0; candidate < graph.length; candidate += 1) {
      if (settled[candidate]) {
        continue;
      }
      const candidateDistance =
        distance[candidate] ?? Number.POSITIVE_INFINITY;
      const chosenDistance =
        vertex === -1
          ? Number.POSITIVE_INFINITY
          : (distance[vertex] ?? Number.POSITIVE_INFINITY);
      if (candidateDistance >= chosenDistance) {
        continue;
      }

      vertex = candidate;
    }

    const currentDistance = distance[vertex];
    if (
      vertex === -1 ||
      currentDistance === undefined ||
      currentDistance === Number.POSITIVE_INFINITY
    ) {
      break;
    }

    settled[vertex] = true;

    const adjacent = graph[vertex] ?? [];
    for (const edge of adjacent) {
      const via = currentDistance + edge.weight;
      const previousDistance =
        distance[edge.to] ?? Number.POSITIVE_INFINITY;
      if (via >= previousDistance) {
        continue;
      }

      distance[edge.to] = via;
    }
  }

  return distance;
};

const graph: readonly (readonly WeightedEdge[])[] = [
  [
    { to: 1, weight: 1 },
    { to: 2, weight: 10 },
  ],
  [
    { to: 0, weight: 1 },
    { to: 2, weight: 2 },
  ],
  [
    { to: 0, weight: 10 },
    { to: 1, weight: 2 },
  ],
];

console.log(dijkstra(graph, 0));
\`\`\`

Expected output is \`[0, 1, 3]\`. For clarity, this runnable version scans all vertices to choose the next one, so it is O(V²). A production implementation usually makes the same choices with a min-heap. The first time you settle the target, that cost is the cheapest. Equal weights collapse back to breadth-first search. Negative weights break Dijkstra's settled-vertex argument; use an algorithm designed for them, such as Bellman–Ford.

## A numeric example

Edge 0 to 2 has weight 10. Edge 0 to 1 has weight 1. Edge 1 to 2 has weight 2.

Counting edges says the direct edge is shorter: 1 hop against 2. Breadth-first search would answer 1. Dijkstra says cost 3 via 1 beats cost 10.

Settle 0 at cost 0. Relax its edges. Vertex 1 becomes 1. Vertex 2 becomes 10. The heap holds those two. Take 1 next, because 1 is smaller than 10. Relax 1 to 2: 1 + 2 is 3, and 3 beats 10, so store 3 and push 2 again. The old entry of 10 is stale. When it pops, 10 is not better than 3, so you ignore it.

The first time you settle 2, the cost is 3, along 0–1–2. The direct edge is still in the graph. It lost. If every weight is 1, hop count and total cost agree, and the queue was enough.

## Cost

| Situation | What you use |
| --- | --- |
| Every edge costs the same | Breadth-first search, O(V + E) |
| Non-negative weights, array scan | Dijkstra, O(V²) |
| Non-negative weights, adjacency list and binary heap | Dijkstra, O((V + E) log V) |
| Negative weights | Dijkstra is not valid |
| Building it in this course | Not required |

A heap push or pop follows the height of the heap. With lazy duplicate entries, each successful relaxation may add an entry, giving O((V + E) log V) time and O(V + E) auxiliary space in the worst case. The scanning version is easier to study but costs O(V²). In either version, the next vertex is the smallest total, not the oldest arrival.

## Practice

1. Add vertex 3 with edges 0–3 of weight 8 and 2–3 of weight 1. Trace every successful relaxation and the final distances.
2. Store predecessors and reconstruct the cheapest path to each reachable vertex. Keep \`Infinity\` and no predecessor for an unreachable vertex.
3. Create a three-vertex negative-edge example where settling a vertex early becomes unsafe. Use it to explain precisely which proof step requires non-negative weights.

## In the course

The graphs lesson names Dijkstra and stops. Weighted shortest paths are a heap plus this walk, one step further than the course goes. Your function counts unweighted edges. It returns 0 when start and target match, and -1 when the target is never reached. The pairs are \`[from, to]\` with no weight to read.

Same cost on every edge: queue, mark on enqueue, first arrival wins. Different non-negative costs: the heap yields the smallest total, and you relax only when the new total wins. Negative costs: the simple rule fails, and you are not asked to replace it. The heap is the one from the heaps lesson, keyed by path cost rather than by a raw input value. Knowing that is the point. Wiring a solver is not.

## Common mistakes

Using a weighted solver for the course's unweighted exercise adds machinery without changing the answer. Trusting breadth-first search on the drawing is also wrong: it sees 1 edge of cost 10, while the 2-edge route costs 3. Overwriting cost 3 with a stale heap entry is another common bug. Relaxation writes only when the new total is strictly cheaper, and stale entries must be skipped. Finally, Dijkstra cannot safely settle vertices when negative edges exist.

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

No. A negative weight can undercut a vertex you already settled, so Dijkstra's proof no longer applies. This course does not ask you to handle that case. Bellman–Ford is the standard next algorithm to study; it can also detect a reachable negative cycle.

## Proof invariant and edge cases

At the start of each iteration, every settled vertex has its true shortest distance, and every finite unsettled distance is the cost of a concrete discovered path. Selecting the smallest unsettled distance is safe because extending any other unsettled path adds a non-negative weight and cannot undercut it. Relaxation preserves the second claim by storing only costs of real paths.

Zero-weight edges are valid; “non-negative” does not mean “positive.” Unreachable vertices remain at infinity. A directed weighted edge must be stored only in its stated direction. Parallel edges are harmless because relaxation keeps the cheaper resulting total. Reject \`NaN\`, negative, and non-finite weights at the input boundary, since comparisons with invalid numeric values can silently break the invariant.

\`\`\`mermaid
flowchart LR
  finite["Finite tentative distance<br/>a real discovered path"] --> choose["Choose smallest"]
  choose --> settled["Settle permanently"]
  settled --> relax["Relax outgoing edges"]
  relax --> finite
\`\`\`

To reconstruct a path, store \`previous[neighbour] = vertex\` whenever relaxation improves the neighbour. After settling the target, follow predecessors backward and reverse the result. Distance and predecessor must update together or the reported route may not have the reported cost.

## Related

The heap is the structure that orders the costs, and breadth-first search is the equal-weight walk you actually write.

- [What Is a Binary Heap? Min, Max, and the kth Largest](/articles/heaps)
- [How Does Breadth-First Search Find the Fewest Edges?](/articles/breadth-first-search)
    `,
  ),
];

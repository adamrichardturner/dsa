import { defineArticle, type Article } from "./types";

export const directedGraphArticles: readonly Article[] = [
  defineArticle(
    "directed-acyclic-graphs",
    "How Do Directed Cycles and Topological Order Work?",
    "Trees and graphs",
    "A directed acyclic graph has a topological order in which every edge points forward. Kahn's algorithm repeatedly removes zero-indegree vertices; leftover vertices prove that a directed cycle exists.",
    ["directed acyclic graph", "DAG", "topological sort", "indegree"],
    `
A directed edge \`u → v\` permits travel from \`u\` to \`v\`, not automatically back again. Direction models prerequisites, build dependencies, and data pipelines. A **directed acyclic graph** (DAG) contains no directed cycle. Every DAG has at least one **topological order**: a sequence in which each edge's source appears before its destination.

\`\`\`mermaid
flowchart LR
  a["A: foundations"] --> b["B: trees"]
  a --> c["C: graphs"]
  b --> d["D: advanced"]
  c --> d
\`\`\`

Both \`A, B, C, D\` and \`A, C, B, D\` are valid. A topological order is usually not unique. Adding \`D → A\` creates a directed cycle, and no linear order can put every source before its destination.

## Kahn's algorithm

The indegree of a vertex is the number of directed edges entering it. A zero-indegree vertex has no unmet prerequisite, so it may appear next. Kahn's algorithm places every current zero-indegree vertex in a queue, removes one, and decreases the indegree of each outgoing neighbour. A neighbour joins the queue exactly when its last prerequisite is removed.

\`\`\`mermaid
flowchart TD
  count["Count every indegree"] --> seed["Queue all zero-indegree vertices"]
  seed --> pop["Remove one and append it"]
  pop --> lower["Decrease outgoing neighbours"]
  lower --> zero{"Did an indegree become zero?"}
  zero -->|yes| enqueue["Enqueue that neighbour"]
  zero -->|no| done{"Queue empty?"}
  enqueue --> done
  done -->|no| pop
  done -->|yes| compare{"Output contains every vertex?"}
  compare -->|yes| order["Topological order"]
  compare -->|no| cycle["Directed cycle exists"]
\`\`\`

\`\`\`ts
type DirectedEdge = readonly [number, number];

const topologicalOrder = (
  labels: readonly string[],
  edges: readonly DirectedEdge[],
): string[] | null => {
  const outgoing = Array.from(
    { length: labels.length },
    (): number[] => [],
  );
  const indegree = Array.from({ length: labels.length }, () => 0);

  for (const [from, to] of edges) {
    const neighbours = outgoing[from];
    const currentIndegree = indegree[to];
    if (neighbours === undefined || currentIndegree === undefined) {
      throw new RangeError("edge endpoint is outside the graph");
    }

    neighbours.push(to);
    indegree[to] = currentIndegree + 1;
  }

  const queue: number[] = [];
  for (let vertex = 0; vertex < labels.length; vertex += 1) {
    if (indegree[vertex] === 0) {
      queue.push(vertex);
    }
  }

  const order: string[] = [];
  let front = 0;

  while (front < queue.length) {
    const vertex = queue[front];
    front += 1;
    if (vertex === undefined) {
      continue;
    }

    const label = labels[vertex];
    const neighbours = outgoing[vertex];
    if (label === undefined || neighbours === undefined) {
      throw new RangeError("vertex is outside the graph");
    }

    order.push(label);

    for (const neighbour of neighbours) {
      const currentIndegree = indegree[neighbour];
      if (currentIndegree === undefined) {
        throw new RangeError("vertex is outside the graph");
      }

      const nextIndegree = currentIndegree - 1;
      indegree[neighbour] = nextIndegree;
      if (nextIndegree === 0) {
        queue.push(neighbour);
      }
    }
  }

  if (order.length !== labels.length) {
    return null;
  }

  return order;
};

const labels = ["A", "B", "C", "D"];
const dagEdges: readonly DirectedEdge[] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
];
const cyclicEdges: readonly DirectedEdge[] = [...dagEdges, [3, 0]];

console.log(topologicalOrder(labels, dagEdges));
console.log(topologicalOrder(labels, cyclicEdges));
\`\`\`

Expected output:

\`\`\`text
[ 'A', 'B', 'C', 'D' ]
null
\`\`\`

The exact first order depends on how zero-indegree vertices are queued. Returning \`null\` is unambiguous here: it means no topological order exists, not that the graph has no vertices. An empty graph validly returns an empty order.

## Why the cycle test works

The loop invariant is: \`indegree[v]\` counts incoming edges from vertices not yet output. Removing a vertex deletes exactly its outgoing edges from that remaining graph. Therefore a queued vertex really has no remaining prerequisite.

Every non-empty DAG has a zero-indegree vertex. If every vertex had an incoming edge, repeatedly following incoming edges in a finite graph would eventually revisit a vertex and form a directed cycle. Consequently, if the queue empties while vertices remain, those remaining vertices contain a cycle. Conversely, a cycle never supplies its own first zero-indegree vertex because each cycle vertex still has an incoming cycle edge.

\`\`\`mermaid
flowchart LR
  x["X<br/>indegree at least 1"] --> y["Y<br/>indegree at least 1"]
  y --> z["Z<br/>indegree at least 1"]
  z --> x
\`\`\`

## DFS alternative

Depth-first search can also find a topological order. Give each vertex three states: unvisited, active on the current recursion path, and finished. An edge to an active vertex is a back edge and proves a directed cycle. Append a vertex only when it finishes, then reverse the finish sequence.

Do not use only a boolean visited mark for directed cycle detection. An edge to a finished vertex is harmless, while an edge to an active ancestor is a cycle; one boolean cannot distinguish them. In an undirected graph, the immediate parent edge must instead be ignored, because every stored edge appears in both directions.

## Complexity and invariants

Building adjacency lists and indegrees takes O(V + E) time and space. Each vertex enters the queue once, and each directed edge causes one decrement, so the algorithm remains O(V + E). The queue, indegree array, output, and adjacency lists together use O(V + E) memory.

| Question | Correct result |
| --- | --- |
| Is there any legal prerequisite order? | output length equals V |
| Which order is the only valid one? | not generally defined |
| Does a self-loop form a cycle? | yes |
| Do parallel edges break the algorithm? | no, if both are counted and decremented |
| Is an empty graph acyclic? | yes |

The central invariant is not “all prerequisites are globally complete.” It is “the next queued vertex has no incoming edge from the remaining graph.” Vertices already output are deliberately absent from that remaining graph.

## Common pitfalls

Storing only indegrees without outgoing neighbours leaves no efficient way to perform decrements. Decrementing on discovery rather than removal can make a prerequisite disappear too early. Starting from one zero-indegree vertex misses disconnected DAG components; seed the queue with all of them. Returning the partial output when a cycle remains presents an invalid schedule as a complete answer.

Topological sorting answers precedence, not shortest path. Multiple valid orders are expected, so tests should verify that every vertex appears once and every edge points forward rather than demanding one arbitrary sequence—unless the problem specifies a tie-breaker. A min-heap can impose the lexicographically smallest available label when such a tie-breaker is required.

## Related

- [What Is a Graph? Vertices, Undirected Edges, and Cycles](/articles/graphs)
- [What Is an Adjacency List? Neighbours of Each Vertex](/articles/adjacency-lists)
- [How Does Depth-First Search Explore One Branch First?](/articles/depth-first-search)
    `,
  ),
];

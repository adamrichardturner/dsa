import { defineArticle, type Article } from "./types";

export const disjointSetArticles: readonly Article[] = [
  defineArticle(
    "disjoint-set-union",
    "What Is Disjoint-Set Union? Tracking Connected Components",
    "Trees and graphs",
    "Disjoint-set union maintains non-overlapping groups under repeated merges. Path compression and union by size make connectivity checks effectively constant-time across a long operation sequence.",
    ["disjoint set", "union-find", "path compression", "union by size"],
    `
A **disjoint-set union** structure, also called **union-find**, maintains a
collection of non-overlapping groups. It answers two questions:

- \`find(value)\`: which group representative contains this value?
- \`union(left, right)\`: merge two groups if they are different.

This is useful when edges arrive over time and the repeated question is whether
two vertices are already connected. A graph traversal can answer one
connectivity question. Disjoint-set union preprocesses the growing groups so
many later questions are cheap.

\`\`\`mermaid
flowchart TD
  a["0"] --> rootA["1, representative"]
  b["2"] --> rootA
  c["3"] --> rootB["4, representative"]
  merge["union(2, 4)"] -.-> rootA
  merge -.-> rootB
\`\`\`

## A forest of parent links

Each set is represented by a rooted tree. Every index stores a parent index.
A root is its own parent. Following parent links reaches the representative,
and two values are connected exactly when their representatives match.

The central invariant is:

> Every parent link stays inside one set, every chain reaches a root, and a root
> points to itself.

Initially every value is alone, so every index is its own root. Union finds the
two roots and makes one root the child of the other. Linking arbitrary input
vertices instead of roots can detach part of a tree or create a cycle.

\`\`\`mermaid
flowchart LR
  findA["Find root of left"] --> same{"Same root?"}
  findB["Find root of right"] --> same
  same -->|yes| unchanged["Already connected"]
  same -->|no| compare["Compare component sizes"]
  compare --> attach["Attach smaller root below larger root"]
  attach --> update["Update the surviving root's size"]
\`\`\`

Two optimisations keep the trees shallow:

1. **Union by size** attaches the smaller tree below the larger root.
2. **Path compression** changes every parent followed by \`find\` to point
   directly at the root.

The following implementation validates indexes, uses an iterative \`find\` to
avoid call-stack growth, and reports whether \`union\` actually merged two
components.

\`\`\`ts
class DisjointSet {
  private readonly parent: number[];
  private readonly size: number[];
  private componentTotal: number;

  constructor(count: number) {
    if (!Number.isInteger(count) || count < 0) {
      throw new RangeError("count must be a non-negative integer");
    }

    this.parent = Array.from({ length: count }, (_, index) => index);
    this.size = Array.from({ length: count }, () => 1);
    this.componentTotal = count;
  }

  get components(): number {
    return this.componentTotal;
  }

  find(value: number): number {
    this.validate(value);

    let root = value;
    while (this.parent[root] !== root) {
      root = this.parent[root] ?? root;
    }

    let current = value;
    while (current !== root) {
      const next = this.parent[current] ?? root;
      this.parent[current] = root;
      current = next;
    }

    return root;
  }

  union(left: number, right: number): boolean {
    let leftRoot = this.find(left);
    let rightRoot = this.find(right);

    if (leftRoot === rightRoot) {
      return false;
    }

    if ((this.size[leftRoot] ?? 0) < (this.size[rightRoot] ?? 0)) {
      const held = leftRoot;
      leftRoot = rightRoot;
      rightRoot = held;
    }

    this.parent[rightRoot] = leftRoot;
    this.size[leftRoot] =
      (this.size[leftRoot] ?? 0) + (this.size[rightRoot] ?? 0);
    this.componentTotal -= 1;
    return true;
  }

  connected(left: number, right: number): boolean {
    return this.find(left) === this.find(right);
  }

  private validate(value: number): void {
    const inRange =
      Number.isInteger(value) && value >= 0 && value < this.parent.length;
    if (!inRange) {
      throw new RangeError("value is outside the disjoint set");
    }
  }
}

const groups = new DisjointSet(5);
console.log(groups.union(0, 1));
console.log(groups.union(1, 2));
console.log(groups.connected(0, 2));
console.log(groups.connected(0, 4));
console.log(groups.union(0, 2));
console.log(groups.components);
\`\`\`

Expected output is \`true\`, \`true\`, \`true\`, \`false\`, \`false\`, and
\`3\`. The last union returns false because 0 and 2 already have the same
representative. Five singleton components minus two successful merges leaves
three components.

## Trace the parent links

Start with parents \`[0, 1, 2, 3, 4]\`. After \`union(0, 1)\`, root 1 points
to root 0. After \`union(1, 2)\`, finding 1 reaches 0, and root 2 also points to
0. Values 0, 1, and 2 now share representative 0.

Calling \`find(2)\` follows 2 to 0. On a taller tree, path compression rewrites
every link on the route. It never changes set membership; it only gives future
finds a shorter path.

Representatives are implementation details. After unions, the representative
might be 0 or another value depending on tie choices. Client code should compare
representatives, not require a particular one.

## Cost

Without balancing, unions can form a chain and \`find\` can take O(n). Union by
size alone keeps height O(log n). Union by size together with path compression
has **amortized O(α(n))** time per operation, where α is the inverse Ackermann
function. It grows so slowly that it is below 5 for all practical input sizes,
but it is not formally O(1).

| Version | Find cost | Space |
| --- | --- | --- |
| Arbitrary parent links | O(n) worst case | O(n) |
| Union by size only | O(log n) worst case | O(n) |
| Size plus path compression | O(α(n)) amortized | O(n) |

“Amortized” describes the total cost across a sequence. One \`find\` may follow
several links, but its compression makes later operations cheaper.

## Where it fits

Disjoint-set union is ideal for incremental undirected connectivity, cycle
detection while adding edges, and Kruskal's minimum-spanning-tree algorithm.
Before adding an undirected edge \`u–v\`, compare their roots. Equal roots mean
the edge closes a cycle. Different roots mean the edge joins two components,
so union them.

It does not store a route between vertices, support directed reachability, or
efficiently undo deleted edges. Use breadth-first or depth-first search when
you need the actual path or all vertices in one traversal.

## Common mistakes

Do not attach one arbitrary vertex to another. Find both roots first, then link
one root to the other.

Do not update a size on a node that stopped being a root. Only the surviving
root's size describes the whole component.

Do not decrement the component count when union returns false. No groups were
merged.

Do not describe path compression as changing connectivity. It changes the
shape of parent links while preserving every group.

## Exercises

1. Process edges \`0–1\`, \`2–3\`, \`1–2\`, and \`0–3\`. State which edge
   first closes a cycle.
2. Add a \`componentSize(value)\` method that returns the size stored at the
   value's root.
3. Remove path compression and construct a sequence that demonstrates why
   union by size still limits tree height.
4. Compare answering 10,000 connectivity queries with repeated graph searches
   and with one disjoint-set structure.

## Related

- [What Is a Graph? Vertices, Undirected Edges, and Cycles](/articles/graphs)
- [How Does Depth-First Search Explore One Branch First?](/articles/depth-first-search)
- [What Is the Space-for-Time Tradeoff in Algorithms?](/articles/space-for-time)
    `,
  ),
];

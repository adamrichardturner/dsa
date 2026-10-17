export type ArticleTopic =
  | "Cost"
  | "Arrays"
  | "Hash maps"
  | "Linear structures"
  | "Search and sort"
  | "Trees and graphs"
  | "Patterns";

export interface Article {
  readonly slug: string;
  readonly title: string;
  readonly topic: ArticleTopic;
  readonly summary: string;
  readonly keywords: readonly string[];
  readonly body: string;
}

const article = (
  slug: string,
  title: string,
  topic: ArticleTopic,
  summary: string,
  keywords: readonly string[],
  body: string,
): Article => ({
  slug,
  title,
  topic,
  summary,
  keywords,
  body: body.trim(),
});

export const articles: readonly Article[] = [
  article(
    "big-o",
    "Big O",
    "Cost",
    "A way to talk about how the work grows as the input grows, ignoring constant factors and one laptop's speed.",
    ["Big O"],
    `
Big O is a shared way to say cheap before you argue about a structure. It answers one question: if the input gets larger, how does the number of steps grow?

You ignore the speed of a particular machine, and the small bookkeeping every language adds. An O(n) scan that touches each value once does about twice the work for twice the input. An O(n²) solution, often a loop inside a loop, grows much faster than that. Constant factors still matter when you ship the code. They do not change which of those two shapes wins once the input is large.

You do not need a formal proof to use this. Name the loops. One pass over the input is linear. A pass that, for each index, scans the rest of the array is quadratic. Nested loops multiply. When you can say the cost out loud, you can decide whether the solution is allowed to stay.
    `,
  ),
  article(
    "constant-time",
    "Constant time",
    "Cost",
    "Work that stays flat as the input grows, such as reading one array slot or pushing onto the end.",
    ["O(1)"],
    `
O(1) means the work does not grow when the input grows. Reading \`nums[0]\` is the picture: the runtime jumps to that slot from the start of the array. It does not walk from the head, so a longer array does not make that one read slower.

Constant does not mean instant, and it does not mean the work is tiny. It means the work stays flat while n changes. Pushing onto the end of an array is in the same family on average: one write, and nothing in front of it has to slide. A hash map get is treated as O(1) on average for the same reason, even though one unlucky key can take longer.

When you reach for an index, a stack push, or a map lookup, say O(1) and then check that you did not hide a loop inside the helper. A function that looks like one step and scans the whole array is not constant time.
    `,
  ),
  article(
    "linear-time",
    "Linear time",
    "Cost",
    "One pass over the input. Twice the data means about twice the work, including a linear search.",
    ["O(n)", "linear search"],
    `
Linear time means the work tracks the length of the input. Summing an array, counting values below a limit, or scanning until you find a target are all one trip from the start toward the end. Twice as many elements, about twice as many steps.

Linear search is the plain version of that scan. You check index 0, then 1, then 2, and you stop early only when you are lucky. If the value is missing, you have looked at everything. That is the honest cost, and it is often the right one. Not every problem has a faster shape hiding inside it.

The habit to retire is doing that pass more times than the problem needs. If each element is handled with a constant amount of work, you are in O(n). If each element starts another scan of the rest of the array, you have left linear time behind.
    `,
  ),
  article(
    "quadratic-time",
    "Quadratic time",
    "Cost",
    "A pass for every element, usually a loop inside a loop. The work grows much faster than one scan.",
    ["O(n²)"],
    `
Quadratic time shows up when, for each element, you look at the others. Comparing every pair is the classic picture. Ten elements is a small triangle of comparisons. A thousand elements is a triangle on the order of a million. The input grew by a factor of 100. The work grew by a factor of about 10,000.

Nested loops are the usual way to write this, and they multiply. One loop over n and an inner loop over n is n times n. Sometimes the inner loop shrinks, walking only the rest of the array rather than the whole array. That is still quadratic. The exact count is lower, and Big O drops the constants and the lower-order terms.

A nested loop can still produce the right answer. Counting values below a limit with a pair of loops returns the right number, and it is the habit worth retiring. Naming O(n²) is how you notice that the inner loop was never required.
    `,
  ),
  article(
    "logarithmic-time",
    "Logarithmic time",
    "Cost",
    "Each step throws away a fraction of what remains, so a million sorted elements is only about twenty comparisons.",
    ["O(log n)", "log n"],
    `
Logarithmic time means each step shrinks the problem by a fraction, not by one element. Binary search is the picture you can draw: look in the middle, throw away half, repeat. A million sorted numbers takes on the order of twenty comparisons. Adding another million does not add another million steps.

You will also meet log n as a height. A balanced tree has height about log n, so a walk from the root to a leaf is logarithmic. A tree that has collapsed into a straight line has height n, and the same walk becomes linear. The algorithm did not change. The shape of the data did.

The bugs in logarithmic code are usually off by one, not "the idea was too slow". Keep a sentence that says where the answer is still allowed to be, and move the bounds so that sentence stays true.
    `,
  ),
  article(
    "linearithmic-time",
    "Linearithmic time",
    "Cost",
    "n times log n. The usual cost of a good sort, and the cost you can sometimes beat when the input is already ordered.",
    ["O(n log n)"],
    `
O(n log n) is the cost of doing a logarithmic amount of work for every element, or of doing linear work at each of about log n levels. Merge sort is the picture: each level merges n elements, and there are about log n levels. The product is linearithmic.

Good general-purpose sorts live here. If you sort and then scan, say O(n log n) out loud and ask whether the sort was required. Sorted squares can be produced in linear time because the input is already ordered. Sorting the squares afterwards works, and it is slower than the shape of the data allows.

When a heap does less ordering than a full sort, or a hash map avoids ordering entirely, you are often leaving O(n log n) for something flatter. Name that trade. Do not treat a sort as free just because it is one function call.
    `,
  ),
  article(
    "space-for-time",
    "Space for time",
    "Cost",
    "Spend extra memory so a later lookup does not scan. The extra space is part of the cost, not a side effect.",
    ["space for time", "space-for-time"],
    `
Time is not the only cost. A hash map uses extra memory so that a later question, such as whether you have already seen the complement of this number, is a lookup instead of a scan. That is the space-for-time trade: O(n) extra memory, and the nested scan drops from quadratic to linear.

You will meet the same trade again. Memoisation stores answers so a recursive call does not recompute them. A sliding window stores a running total so the next slice does not start from zero. The memory is the reason the faster algorithm exists.

Say both numbers. "O(n) time and O(n) extra space" is a complete sentence. "O(n) time" on its own hides the array or the map you allocated. If the extra memory is a fixed handful of variables, say O(1) extra space and be glad of it.
    `,
  ),
  article(
    "contiguous-arrays",
    "Contiguous arrays",
    "Arrays",
    "Values stored in neighbouring memory, so an index is a jump and an insert in the middle has to move the tail.",
    ["contiguous list"],
    `
A TypeScript array is a contiguous list. Neighbours in the array are neighbours in memory, which is why an index can be computed from the start address plus the offset. That jump is O(1). You do not walk from the front to reach element 10.

The same layout makes the middle expensive. Insert or delete anywhere but the end, and every later element has to shift along. That shift is O(n). Pushing at the end is cheap on average because nothing in front of the new value has to move.

This one fact explains a lot of later choices. Fast index access is an argument for staying with the array. Fast rewiring once you already hold a spot is an argument for a linked list. Pick the layout that matches the operation you actually repeat, not the one that is familiar.
    `,
  ),
  article(
    "rotating-an-array",
    "Rotating an array",
    "Arrays",
    "Move the front of a contiguous array to the back. A full turn does nothing, so only the remainder matters.",
    ["Rotating left", "rotated left"],
    `
Rotating left by some number of steps moves the front of the array to the back. The list 1, 2, 3, 4 rotated left by one step is 2, 3, 4, 1. Each element slides, and the piece that falls off the front comes back on the end.

Steps can be larger than the length. Rotating by the length itself puts every element back where it started, so whole turns do nothing. Only the remainder matters: steps modulo the length. An empty array stays empty, because there is nowhere to move.

The clear solution allocates a new array and writes each value at its new index. That is a single O(n) pass, and it does not mutate the input. In-place reversal tricks exist. You do not need them to understand the movement. The point is to feel that a contiguous block has to be rewritten when the order changes.
    `,
  ),
  article(
    "two-pointers",
    "Two pointers",
    "Arrays",
    "Two indices on one array, and a rule that moves exactly one of them. Ordered data is what makes the walk linear.",
    ["Two pointers means", "two-pointer", "two pointers, one"],
    `
Two pointers means two indices moving through the same array according to a rule. You use them when the array is sorted, or when the two ends know something the middle does not.

Sorted squares are the clean picture. A sorted array of negatives and positives does not have sorted squares, because a large negative becomes a large positive. The biggest squares sit at the ends. Square the left value and the right value, write the larger one into the back of the result, and move the pointer that produced it inward. Each step is O(1). Together the pointers cross the array once, so the whole walk is O(n).

Sorting the squares afterwards would work and would cost O(n log n). The sorted input is what makes the linear solution possible. If the input were unsorted, you would not have this trick. The shape to remember is a left index, a right index, and a reason to move exactly one of them.
    `,
  ),
  article(
    "sliding-windows",
    "Sliding windows",
    "Arrays",
    "A subarray you keep as you walk forward, updating the previous slice instead of summing it from scratch.",
    ["sliding window", "subarray"],
    `
A sliding window is a subarray you maintain as you walk forward. The fixed-size version is the one to learn first: the maximum sum of any k consecutive elements, for example.

Re-summing each block from scratch repeats almost the same additions. Once you know the sum of a window, the next window is the old sum, minus the element that left, plus the element that entered. That update is O(1), and you do it once per element, so the scan is O(n). The first window is the only one you build from nothing.

There is a second kind, the variable window, used when the size is part of the answer, such as the shortest subarray whose sum is at least a target. One pointer grows the window and the other shrinks it. Same idea, more bookkeeping. If k is larger than the array, there is no valid fixed window.
    `,
  ),
  article(
    "hash-maps",
    "Hash maps",
    "Hash maps",
    "A key stored with a value so set and get are O(1) on average. The pattern is to remember what you have already seen.",
    ["hash map", "hash maps"],
    `
A hash map associates a key with a value. On average, set and get are O(1). You spend memory so the next question does not scan the whole input. The pattern in the exercises is simple: remember what you have already seen.

Two Sum is the classic use. A nested loop checks every pair in quadratic time. A map checks, for each number, whether the complement that would reach the target is already stored, and then stores the index you just passed. The answer is positions, so store the index, not only the value.

In TypeScript, a Map keeps a numeric key as a number. A plain object turns that key into a string, which can still work and is easier to get wrong. Prefer Map when the key is not already a string. Then say the cost properly: O(n) time and O(n) extra memory.
    `,
  ),
  article(
    "collisions",
    "Collisions",
    "Hash maps",
    "Two keys landing in the same slot. A hash map is O(1) on average, not a promise about every single call.",
    ["collision"],
    `
A hash function turns a key into a slot. A collision is two keys that land in the same slot. The map then has to keep more than one entry there, often as a small chain, and a lookup may look at more than one value before it finds the right key.

That is why "O(1) get" is an average, not a promise about every call. One unlucky key can take longer. For the sizes and the hash functions you meet in these exercises, the occasional collision does not change the decision. The map is still the right tool when the alternative is a scan.

You do not implement the hash function in this course. You do need the sentence: average constant time, extra memory, and a collision is the reason the constant is not a guarantee.
    `,
  ),
  article(
    "linked-lists",
    "Linked lists",
    "Linear structures",
    "A node holding a value and a next pointer. No random access. Rewiring a pointer you already hold is O(1).",
    ["linked list"],
    `
An array stores neighbours in neighbouring memory. A linked list stores a node: a value, plus a reference to the next node. The list itself is the reference to the first node, called the head. The last node's next is null.

You cannot jump to the 10th node. You walk from the head, which is O(n). Inserting or rewiring after a node you already hold is O(1), because you change a couple of pointers and nothing else has to slide. That is the whole trade against arrays.

Reversing a list is the exercise that makes the pointers feel real. Keep the previous node, the current node, and the next node you are about to lose. Point current back at previous, then step all three forward. When current runs out, previous is the new head. If you overwrite next before you have saved it, the rest of the list is gone.
    `,
  ),
  article(
    "stacks",
    "Stacks",
    "Linear structures",
    "Last in, first out. Push and pop touch only the most recent item, both O(1) at the end of an array.",
    ["stack", "stacks"],
    `
A stack is a list where you only touch the most recently added item. Push adds. Pop removes. Both are O(1) at the end of an array, so a TypeScript array is a perfectly good stack if you agree not to touch the middle.

The useful part is the order. The last thing you put down is the first thing you pick up. Bracket matching is the standard practice. An opener is pushed. A closer pops, and it has to match the opener that just came off. If you need to pop an empty stack, or the opener does not match, the string is unbalanced. If anything is left at the end, something was never closed.

That memory of what is still open is the reason to reach for a stack. A counter can tell you that the counts match. It cannot tell you that a square bracket closed while a parenthesis was still open. The stack remembers the order the openings arrived.
    `,
  ),
  article(
    "call-stack",
    "The call stack",
    "Linear structures",
    "The stack the runtime uses for calls. Each call pushes a frame. A return pops it. Recursion is this structure.",
    ["call stack"],
    `
The call stack is the stack you do not manage yourself. Each function call pushes a frame: the arguments, where to return, and the local variables. A return pops that frame. Recursion is the same structure, with your own function as the thing being pushed.

This is why a missing base case does not fail in quite the same way as a while loop that never ends. It pushes frames until the runtime refuses to push another one. The overflow is a stack running out of room. An explicit stack in your own code can do the same walk, and you can see the frames because you stored them.

When a recursive solution is hard to hold in your head, draw the frames. What gets pushed, what must be true when it pops, and which call is the one that stops. The call stack is doing that bookkeeping whether you draw it or not.
    `,
  ),
  article(
    "queues",
    "Queues",
    "Linear structures",
    "First in, first out. Enqueue at the back, dequeue from the front. Breadth-first search is this rule with vertices as the payload.",
    ["queue", "queues", "enqueue", "dequeue"],
    `
A queue serves items in arrival order. Enqueue adds at the back. Dequeue removes from the front. A printer queue, a checkout line, and breadth-first search are the same rule: the thing that has been waiting longest goes next.

A TypeScript array can do this with push and shift. Be honest about the cost. Shift moves every later element, so it is O(n). For the sizes in this course that is fine. A real deque, or two stacks used as a queue, makes both ends O(1). Know the gap, and do not reach for a clever queue until shift shows up in a hot loop.

You will use a queue again, unchanged, when a graph asks for the shortest unweighted path. The structure is the same. Only the payload changes, from a number in a window to a vertex and a distance.
    `,
  ),
  article(
    "recursion",
    "Recursion",
    "Search and sort",
    "A function that solves a smaller copy of the same problem, plus a base case that stops the calls.",
    ["recursive", "recursion", "base case"],
    `
A recursive function calls itself. Each call must be smaller than the one that made it, and there must be a base case that stops. Without the base case the call stack grows until it overflows.

The shape fits data that is already defined the same way. A nested list is either a number or a list of nested lists. A tree is either empty or a node with smaller trees under it. The function says what to do for the small case, then combines the answers from the smaller pieces.

You could write the same walk with an explicit stack. Recursion is that stack, hidden inside the calls. If you can say the base case in a sentence before you write the function, the rest usually follows. If you cannot say it, you are not ready to recurse yet.
    `,
  ),
  article(
    "binary-search",
    "Binary search",
    "Search and sort",
    "On sorted data, compare with the middle and throw away half. Keep an invariant for where the target can still sit.",
    ["binary search", "invariant"],
    `
If an array is sorted, you do not have to look at every index. Compare the target with the middle value. If the target is smaller, it cannot live in the right half. If it is larger, it cannot live in the left half. Each comparison throws away half of what remains. That is O(log n) comparisons.

The bugs are off by one. Keep an invariant you can say out loud: if the target is present, its index is between lo and hi inclusive. When the middle value is too small, the answer is at least one past the middle. When it is too large, the answer is at most one before the middle. When the range is empty, the target is absent. Return -1.

The array must be sorted. Binary search on unsorted data is not "usually fine". It is wrong, because the half you throw away might have held the value. Compute the middle as lo plus half the distance to hi, so the index stays inside the range you still trust.
    `,
  ),
  article(
    "bubble-sort",
    "Bubble sort",
    "Search and sort",
    "Swap neighbours until the array settles. Easy to remember, and quadratic. A contrast, not the sort to reach for.",
    ["bubble sort"],
    `
Bubble sort walks the array and swaps neighbours that are out of order, then does it again, until a pass makes no swaps. Larger values drift toward the end. It is easy to remember and easy to get right, which is why it shows up in a first explanation of sorting.

It is also O(n²). Each pass can look at every remaining pair. You keep it as a contrast, not as the sort you defend in an interview or in a hot loop. When you need a sort whose cost you can draw, merge sort stays O(n log n) in every case you will implement here.

If you call the language's sort instead of writing one, know what you are calling. JavaScript's default sort compares values as strings unless you pass a compare function. For numbers, pass a function that subtracts. The name sort does not mean the numeric order you assumed.
    `,
  ),
  article(
    "merge-sort",
    "Merge sort",
    "Search and sort",
    "Split, sort the halves, then merge two sorted runs with two pointers. O(n log n) time and O(n) extra memory.",
    ["merge sort"],
    `
Merge sort is the sort to keep because you can draw every step. If the array has fewer than two elements, it is already sorted. That is the base case. Otherwise split it into two halves, sort each half by the same rule, and merge the two sorted halves into one sorted array.

The merge is two pointers, one on each half. Repeatedly take the smaller head. When one half runs out, append the rest of the other. Each element is written once, so merging a total of n elements is O(n). The split goes about log n levels deep, and each level does O(n) work. The product is O(n log n). The extra arrays cost O(n) memory.

Quicksort uses less extra memory and is what many standard libraries reach for. Its worst case is worse, and the explanation is longer. One sort you can draw is enough. While you are learning this one, do not call the built-in sort and skip the merge.
    `,
  ),
  article(
    "trees",
    "Trees",
    "Trees and graphs",
    "One root, no cycles, and children under each node. Depth here is the number of nodes on the longest path down.",
    ["tree", "trees", "leaf", "root"],
    `
A tree is a set of nodes with one root and no cycles. Each node has zero or more children. A node with no children is a leaf. A binary tree gives each node at most two children, usually called left and right.

Depth of a node is how far it sits below the root. In this course, the depth of the tree means the number of nodes on the longest path from the root down. An empty tree has depth 0. A single node has depth 1. People also say height for a closely related count. Use the definition in front of you when you write the return value, or you will be off by one against the tests.

The recursive rule is the algorithm. An empty tree has depth 0. Otherwise the depth is 1 plus the larger of the children's depths. That walk is depth-first: one branch finishes before the other. Visiting every node on one level before the next level is a different walk, and it wants a queue.
    `,
  ),
  article(
    "binary-search-trees",
    "Binary search trees",
    "Trees and graphs",
    "Everything in the left subtree is smaller, everything in the right is larger. Search is a walk whose cost is the height.",
    ["binary search tree"],
    `
A binary search tree adds one rule to a binary tree. Every value in the left subtree is smaller than the node, and every value in the right subtree is larger. Duplicates are a policy decision. This course does not insert them.

Search starts at the root. A smaller target goes left. A larger target goes right. Null means the value is absent. The walk takes time proportional to the height, not automatically to log n. A balanced tree has height about log n. Inserting already-sorted values in order produces a straight line, and search falls back to O(n). The tree did not save you.

Insert uses the same walk. The empty spot on the correct side is where the new node goes. Scanning the original array with a linear search misses the point of building the tree. The structure only helps if the lookup follows the left-and-right rule.
    `,
  ),
  article(
    "balanced-trees",
    "Balanced trees",
    "Trees and graphs",
    "AVL and red-black trees rotate nodes so the height stays about log n. A skewed tree is just a list drawn vertically.",
    ["balanced tree", "AVL", "red-black"],
    `
A balanced tree keeps its height small, about log n for n nodes. AVL trees and red-black trees do this by rotating nodes after an insert or a delete would make one side too tall. JavaScript engines and databases use these shapes. You do not implement a rotation this month.

You do need to notice when a tree has degenerated into a list. If every insert went to the right, the drawing is a linked list stood on end, and every search is O(n). The left-and-right rule can still be true. It is just no longer saving work.

Rotation here means a tree move: a node and its child change places so a different node becomes the parent, and the search rule still holds. It is not the array rotation from the first week. Same English word, different operation. When someone says a structure is balanced, ask what it does on insert to keep the height honest.
    `,
  ),
  article(
    "heaps",
    "Heaps",
    "Trees and graphs",
    "A complete binary tree stored in an array. The minimum or the maximum sits at the root, and updating it is O(log n).",
    ["heap", "heaps", "min-heap", "max-heap", "complete binary tree"],
    `
A heap is a complete binary tree that keeps the smallest value, a min-heap, or the largest, a max-heap, at the root. Complete means every level is full except possibly the last, which is filled from the left. That shape lets you store the tree in an array with no pointers.

For a node at index i, the parent sits at floor((i - 1) / 2), the left child at 2i + 1, and the right child at 2i + 2. Insert writes the new value at the end, then swaps it upward while it belongs above its parent. Removing the root moves the last value into that hole and swaps it downward until the order holds. Both are O(log n).

You reach for a heap when you repeatedly need the current extreme, not a fully sorted list. The kth largest value is the textbook case: keep a min-heap of size k, throw away anything smaller, and the root is the answer. Sorting the whole array also works. It orders more than you asked for.
    `,
  ),
  article(
    "graphs",
    "Graphs",
    "Trees and graphs",
    "Vertices and edges. A tree is a graph with no cycles. A general graph can loop, so a search has to remember where it has been.",
    ["graph", "graphs", "vertices", "undirected", "cycles"],
    `
A graph is a set of vertices and a set of edges between them. An undirected edge can be walked both ways: if you can go from 0 to 1, you can go from 1 to 0. A directed edge would not promise the return trip. This course uses undirected edges.

A tree is a graph with no cycles and one path between the nodes that are connected. A general graph may have cycles, so a search that does not remember where it has been will loop forever. Mark a vertex when you first decide to visit it. Waiting until you have already queued it many times wastes work and can blow up the queue.

The walks you learn next answer different questions on the same picture. Breadth-first search answers "fewest edges" when every edge costs the same. Depth-first search answers "can I get there?" and "what else is in this piece?". The drawing underneath is still vertices, edges, and a record of where you have been.
    `,
  ),
  article(
    "adjacency-lists",
    "Adjacency lists",
    "Trees and graphs",
    "Each vertex stores the vertices one edge away. One pass over the edge list builds it, and a search asks it for neighbours.",
    ["adjacency list"],
    `
An adjacency list stores, for each vertex, the vertices you can reach in one step. An object whose keys are vertex ids and whose values are the neighbouring ids is enough. Building it is one pass over the edges. For an undirected edge, add each end to the other's list, or you will only be able to walk one direction.

The list answers "who are my neighbours?" in time proportional to how many there are, which is what a search actually asks on each pop. A matrix of every pair would answer "is this one edge present?" in constant time, and it would spend space on every possible edge, including the ones that do not exist. For the sparse graphs in these exercises, the list is the honest layout.

Once the list exists, breadth-first and depth-first search do not care how you built it. They only need, given a vertex, the neighbours to consider next.
    `,
  ),
  article(
    "breadth-first-search",
    "Breadth-first search",
    "Trees and graphs",
    "A queue walks neighbours, then neighbours of neighbours. On equal edge costs, the first time you arrive is the fewest edges.",
    ["breadth-first search", "breadth-first", "level order"],
    `
Breadth-first search uses a queue. Start at the source, then visit neighbours, then neighbours of neighbours. The first time you reach the target, you got there in the fewest edges. That claim is only true when every edge has the same cost. Weighted edges need a different rule.

Level order on a tree is the same walk with a different story. Visit every node on one depth, then the next depth. The queue is what keeps this layer ahead of the next layer. The starter that builds a tree from a level-order list is doing that walk in reverse, reading the layer you would have visited.

Mark a vertex when you first enqueue it, not when you dequeue it, or the same neighbour gets queued many times. Carry the distance with the vertex, or store it at the moment you enqueue. If the target is never reached, there is no path. The distance from a vertex to itself is 0, before you have walked anywhere.
    `,
  ),
  article(
    "depth-first-search",
    "Depth-first search",
    "Trees and graphs",
    "A stack, or recursion, finishes one branch before the others. It answers reachability, not fewest edges.",
    ["depth-first search", "depth-first"],
    `
Depth-first search dives. From the current vertex you walk one neighbour all the way down, then you come back and try the next neighbour. The call stack can hold that dive, or you can push vertices onto an explicit stack. Both produce the same kind of order.

It answers "can I get there?" and "which vertices are in this connected piece?". It does not answer "what is the shortest path?". The first time you arrive is just the first branch that happened to find the target, not the branch with the fewest edges. Use breadth-first search when the question is about distance and every edge costs the same.

On a tree, the recursive walk that finishes one child before the other is depth-first too. Backtracking is the same shape again, on decisions you are generating rather than on edges you were given. Choose, dive, undo, try the next choice.
    `,
  ),
  article(
    "dijkstra",
    "Dijkstra",
    "Trees and graphs",
    "Shortest paths when edges have different costs: the breadth-first walk, plus a heap that always extends the cheapest path so far.",
    ["Dijkstra"],
    `
Breadth-first search finds the fewest edges only when every edge costs the same. When edges have weights, a path of many cheap edges can beat a path of one expensive edge. Counting edges would give the wrong answer. Dijkstra's algorithm is the repair, and this course names it without asking you to build it.

It is the same walk, with a heap instead of a plain queue. The heap always hands you the vertex you can reach for the smallest total cost so far. From there you relax the outgoing edges: if arriving via this vertex is cheaper than the best cost you had stored for a neighbour, you update that neighbour and push it. The first time you settle the target, the cost you have is the cheapest.

The reason to know the name is so that "shortest path" does not automatically mean a queue. Equal weights: breadth-first search. Unequal weights: a heap plus this relaxation. The heap lesson is the piece you would reuse.
    `,
  ),
  article(
    "greedy-choices",
    "Greedy choices",
    "Patterns",
    "Take the local option you can prove does not block a better future. A rule you can break with one counterexample is not the rule.",
    ["greedy", "interval scheduling"],
    `
A greedy algorithm makes the choice that looks best right now and does not take it back. It is fast when that local choice is safe. It is wrong when waiting would have opened a better path later. The skill is telling those problems apart, not applying "sort and scan" to everything you see.

Interval scheduling is a case where greedy is safe. You want as many half-open intervals as possible with no pair overlapping. Sort by finishing time, earliest first. Take the first interval, then the next one that starts at or after that finish. Taking the interval that frees you soonest leaves the most room afterwards, and for this problem that local rule matches the best possible count. Touching endpoints is allowed when the intervals are half-open: one ends where the next starts.

Sorting by start time instead can fail. An early interval that runs for a long time blocks several short ones that would have fit. Same data, worse rule. When you invent a greedy rule, try to name a case it gets wrong. If you cannot, you might be done. If you can, it is not the rule.
    `,
  ),
  article(
    "backtracking",
    "Backtracking",
    "Patterns",
    "Choose, explore, then undo. Depth-first search on decisions you are generating. It explodes unless the space is small or you can prune.",
    ["backtracking"],
    `
Backtracking searches a tree of decisions. At each step you choose, recurse, then undo so the next choice starts from a clean state. It is depth-first search on decisions you are generating, rather than on a graph you were handed.

Subsets are the smallest useful version. For each number, it is either in the subset or it is not, so you walk both branches. The copy of the current path matters. If you save the same array you are still mutating, later undos empty the subsets you thought you had kept. The undo is the pop. Forget it and every later subset inherits the previous choice.

This explodes. n distinct numbers have 2ⁿ subsets, and you list all of them. Backtracking is the right tool when the search space is modest, or when you can prune, for example stopping once a partial sum already exceeds the target. It is the wrong tool when a shorter dynamic-programming table would count the answers without listing them.
    `,
  ),
  article(
    "dynamic-programming",
    "Dynamic programming",
    "Patterns",
    "The problem is made of smaller problems that overlap. Write the recurrence, then store the answers or fill a table from the base case up.",
    ["dynamic programming", "recurrence"],
    `
Dynamic programming applies when a problem is made of smaller problems that overlap. Recursion still describes the answer. The difference from backtracking is that you store results instead of exploring the same state twice.

Climbing stairs is the friendly introduction. You may take 1 or 2 steps. The number of ways to climb n steps is the ways to climb n − 1 plus the ways to climb n − 2, because the last action was one of those two. That sentence is the recurrence. The base cases are the small staircases you can count by hand: one way up a single step, two ways up two steps.

A naive recursion recomputes the same smaller staircases many times on the way to a larger n. Two repairs share the name. Memoisation caches each answer on the way down. A loop fills a table from the bottom, and if you only keep the last two numbers the extra memory is constant. Both are dynamic programming. The loop is usually what you write once you trust the recurrence. The same shape extends to grids and to coin change. If you can write the recurrence and the base case, the table is mechanical.
    `,
  ),
  article(
    "memoisation",
    "Memoisation",
    "Patterns",
    "Before recursing, check whether this state already has an answer. After you compute it, store it so the overlapping call is free.",
    ["memoisation"],
    `
Memoisation is the top-down form of dynamic programming. You still write the recursive function. Before you recurse, you look in a table to see whether this exact state was already solved. If it was, you return the stored answer. If it was not, you compute it, store it, and then return it.

The table is often a plain object from the state to the answer. For the stairs, the state is how many steps are left. The keys have to be the whole state that the answer depends on. If two calls are the same subproblem and you only keyed part of it, you will reuse an answer that belonged to a different call.

The space is the point. You are spending memory so that overlapping calls do not do the work again. A bottom-up loop fills the same ideas in an order that makes the lookup feel unnecessary, because the smaller answers are already sitting there when you need them. When you trust that order, the loop is shorter. Until you do, the cache on the recursive function is a correct way to see the overlap.
    `,
  ),
  article(
    "tries",
    "Tries",
    "Patterns",
    "A tree of characters. Words that share a prefix share a path from the root, and lookup costs the length of the word.",
    ["trie", "prefix"],
    `
A trie, pronounced "try", is a tree where each edge is a character. Words that share a prefix share the path from the root. The words cat and car share the edges for c and a, then split into t and r.

Each node holds its children, keyed by character, and a flag that is true when some inserted word ends on that node. A missing child means that continuation has never been inserted. Insert walks the characters, creating a child when it is missing, and marks the last node as a word. Search walks the same path and checks the flag. Ending on a node is not enough: a prefix of a stored word is not itself a word unless the flag says so. Both walks are proportional to the length of the word, not to how many other words you stored.

A hash set of whole words is also fast on average and is shorter to write. Exact lookup alone does not force a trie, and a set would pass a test that only asks "is this word present?". The trie earns its place when you care about prefixes. "Which words start with ca?" is a walk to that node, then a small traversal of whatever sits underneath. Build the trie when the point of the exercise is to leave with one more structure you can draw.
    `,
  ),
];

const bySlug: Record<string, Article> = {};

for (const item of articles) {
  bySlug[item.slug] = item;
}

export const articleBySlug = (slug: string): Article | null => {
  return bySlug[slug] ?? null;
};

export interface ArticleGroup {
  readonly topic: ArticleTopic;
  readonly articles: readonly Article[];
}

export const articleGroups = (): readonly ArticleGroup[] => {
  const groups: ArticleGroup[] = [];
  const indexByTopic: Record<string, number> = {};

  for (const item of articles) {
    const existing = indexByTopic[item.topic];
    if (existing === undefined) {
      indexByTopic[item.topic] = groups.length;
      groups.push({ topic: item.topic, articles: [item] });
      continue;
    }
    const group = groups[existing];
    if (group === undefined) {
      continue;
    }
    groups[existing] = {
      topic: group.topic,
      articles: [...group.articles, item],
    };
  }

  return groups;
};

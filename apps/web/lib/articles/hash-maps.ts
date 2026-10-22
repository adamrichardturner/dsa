import { defineArticle, type Article } from "./types";

export const hashMapArticles: readonly Article[] = [
  defineArticle(
    "hash-maps",
    "How a Hash Map Remembers What You Have Already Seen",
    "Hash maps",
    "A hash map associates unique keys with values and supports lookup, insertion, and update in O(1) expected time. Remembering earlier values turns Two Sum from a quadratic pair search into one linear pass.",
    ["hash map", "hash maps"],
    `
A hash map associates each **unique key** with a value. Given a key, it uses a hash function to choose where to look instead of scanning every entry. Lookup, insertion, and update therefore take O(1) **expected** time, while k distinct entries occupy O(k) space.

This is a space-for-time tradeoff. Store useful facts from the input already visited, and later questions become lookups. Two Sum is the classic example: a nested search examines O(n²) pairs, while a hash table records earlier numbers and finishes in O(n) expected time.

\`\`\`mermaid
flowchart LR
  key["Key: 18"] --> hash["hash(18)"]
  hash --> slot["Bucket or slot"]
  slot --> entry["Entry: 18 → value"]
\`\`\`

## How it works

A hash function deterministically converts a key into an integer hash. The table reduces that hash to an array position. A correct table also stores the key because distinct keys can select the same position. It compares keys after reaching that position to distinguish collisions.

For Two Sum, the key is a number already visited and the value is an index where it occurred. Store the index, not only membership, because the answer requires positions.

For each number, check whether \`target\` minus the number is already stored. When it is, the positions are the stored index and the current index. When it is not, store the index you just passed. Check before you store, so the current index is not a partner for itself. On 2, 2 with target 4, the second 2 finds the first 2 already stored.

A nested loop scans the rest of the array at every index. One thousand elements is about half a million pair checks. The map does a \`get\` and, on a miss, a \`set\`. That is O(n) time on average and O(n) extra memory.

\`Map\` keeps a numeric key as a number. A plain object turns it into a string, so \`record[2]\` and \`record["2"]\` name the same property. This example uses that conversion intentionally. Index 0 is a real hit, so absence must be tested with \`undefined\`, not truthiness.

\`\`\`ts
function twoSum(
  values: readonly number[],
  target: number,
): readonly [number, number] | null {
  const indexByValue: Record<string, number | undefined> = {};

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === undefined) {
      continue;
    }

    const earlierIndex = indexByValue[target - value];
    if (earlierIndex !== undefined) {
      return [earlierIndex, index];
    }

    indexByValue[value] = index;
  }

  return null;
}

console.log(twoSum([2, 7, 11, 15], 9));
console.log(twoSum([2, 2], 4));
console.log(twoSum([1, 2, 3], 10));
\`\`\`

Output: \`[0, 1]\`, \`[0, 1]\`, then \`null\`.

## A numeric example

Take the array 2, 7, 11, 15 and target 9.

At index 0 the number is 2. The complement 7 is absent, so you store index 0 under the key 2. At index 1 the number is 7. The complement 2 is at index 0. The positions are 0 and 1.

| Index | Value | Complement | Table before lookup | Action |
| --- | --- | --- | --- | --- |
| 0 | 2 | 7 | empty | Store 2 → 0 |
| 1 | 7 | 2 | 2 → 0 | Return [0, 1] |

The algorithm stops as soon as it finds one pair. A different specification—return every pair, every unique value pair, or the number of pairs—needs different duplicate handling. Always establish the required result before choosing what the table stores.

## Cost

The one-pass algorithm is O(n) expected time and O(k) auxiliary space, where k is the number of distinct values stored before it stops; k is at most n. Each iteration performs at most one lookup and one insertion. Those operations are O(1) expected, so n iterations are O(n) expected.

Resizing a backing array occasionally costs O(k), but geometric resizing spreads that work across many insertions. Insertion is O(1) amortized as well as expected under ordinary hashing assumptions. “Expected” describes collision behavior; “amortized” describes occasional resizing.

| Approach | Time | Extra space | What you store |
| --- | --- | --- | --- |
| Nested loops over pairs | O(n²) worst case | O(1) | A few integers |
| Hash table in one pass | O(n) expected | O(k), at most O(n) | Index under the number you saw |
| Chained map, every key in one slot | Can degrade toward O(n) per lookup | O(n) | The same entries, one long chain |
| Plain object with numeric keys | O(n) average | O(n) | The key becomes a string |

## In the course

Two Sum reads left to right, asks for the complement, then stores the index just passed. The reusable design questions are: What fact is the key? What information must the value recover? What represents absence? Should a duplicate preserve the first value, overwrite with the latest value, or increment a count?

## Common mistakes

Storing the value and forgetting the index. The complement test can succeed and you still cannot return positions.

Storing the current number before you look up the complement. A value that is half the target can then match its own index. Check first. Store after the miss.

Treating a \`get\` result of 0 as a miss. Index 0 is a legal position. Absence is \`undefined\`.

Using an object for numeric keys and then comparing a key to a number with \`===\`. The object stored the string \`"2"\`. \`Map\` keeps the number you passed to \`set\`.

Claiming guaranteed O(1). Hash-table operations are expected O(1), not a worst-case promise. State whether a bound is expected, amortized, or worst-case.

## When to use it

Use a hash map when the question is about a key you have already seen, and a scan to answer it would nest. Complements, counts, first indices, and duplicate checks are the usual forms. Use \`Map\` when the key is a number or another value that should not become a property name. Use it when O(n) extra memory is acceptable and O(n) average time is the bound you want.

## When not to

Skip the table when the array is sorted and two pointers can answer with O(1) auxiliary space. It is also a poor fit for range queries, sorted traversal, strict worst-case operation bounds, or a memory limit that forbids O(n) auxiliary space. A balanced search tree supports ordered operations in O(log n).

## FAQ

### Why does Two Sum store the index?

The answer is positions. The key is the number you saw. The value is the index. The number alone tells you the complement occurred and does not tell you where.

### Why prefer Map over a plain object for numeric keys?

\`Map\` keeps the key as a number. A plain object turns it into a string, so 2 and \`"2"\` share one property. \`Map\` also accepts object keys, exposes \`size\`, and does not mix entries with inherited object properties.

### What happens when a key is inserted twice?

Its value is updated; keys are unique. Whether an algorithm should preserve the first index, overwrite with the latest index, or increment a count depends on the problem.

### What time and space should you quote?

O(n) expected time and O(n) auxiliary space in the worst case. Individual lookups and insertions are O(1) expected.

## Related

- [What Is a Hash Collision? Why O(1) Is Only an Average](/articles/collisions)
- [What Is the Space-for-Time Tradeoff in Algorithms?](/articles/space-for-time)
`,
  ),
  defineArticle(
    "collisions",
    "What Is a Hash Collision? Why O(1) Is Only an Average",
    "Hash maps",
    "A collision is two keys landing in the same slot, so a lookup may inspect more than one entry. That is why a hash map is O(1) on average, not a promise about every call.",
    ["collision"],
    `
A collision is two keys landing in the same slot, so a lookup may inspect more than one entry. A hash function turns a key into a slot, and the two keys often sit in a small chain on that slot. That is why a hash map is O(1) on average, not a promise about every call. You plan for the average, and for the sizes in this course the map is still the right tool versus a scan.

\`\`\`mermaid
flowchart TD
  A["Hash key 2"] --> B["Slot 2"]
  C["Hash key 18"] --> B
  B --> D["One slot, two entries"]
  D --> E["Lookup walks the chain"]
  E --> F["Average stays O(1)"]
\`\`\`

## How it works

The map hashes a key into a slot. An empty slot is one step for \`set\` and \`get\`. Two keys in one slot stay together, often as a small chain, and a lookup walks that chain until the key matches. You do not implement the hash function. \`Map\` already has one.

The sentence to keep: average constant time, extra memory, and a collision is why the constant is not a guarantee. If every key lands in one slot, the chain has length n and a lookup degrades toward O(n). A pass of those lookups can degrade toward quadratic work. That worst case is real. Average chain length stays short when keys spread out, and the average is what you plan for. A hash \`get\` is constant time only on average. An array index does not have this chain.

\`\`\`ts
const indexByValue = new Map<number, number>();
indexByValue.set(2, 0);
indexByValue.set(18, 3);

const atTwo = indexByValue.get(2);
const atEighteen = indexByValue.get(18);
\`\`\`

## A numeric example

With 8 slots, a teaching hash can use the remainder modulo 8. Key 2 goes to slot 2. Key 18 also goes to slot 2, because 18 divided by 8 leaves remainder 2. The slot holds key 2 at index 0, then key 18 at index 3. Lookup of 2 returns on the first entry. Lookup of 18 checks 2, then 18, and returns 3. Two steps, and the stored index is still correct.

If 1,000 keys all landed in that slot, a lookup of the last key would walk 1,000 entries. That is the O(n) worst case, not the average. A scan of 1,000 values pays that kind of cost every time. One short chain does not make the scan cheaper, so for the sizes in this course the map stays the right tool versus a scan.

## Cost

On average, \`get\` and \`set\` are O(1), and extra space is O(n) for the entries. One collision is a few comparisons, which is already more than a single jump, so O(1) is not a promise about every call. If every key lands in one slot, a chained lookup is O(n) and a loop of lookups can become O(n²). You plan for the average. You mention the worst case so that word stays honest.

| Situation | Lookup cost | What happened |
| --- | --- | --- |
| Short chains, the average | O(1) | The hash spread the keys |
| Two keys in one slot | A few comparisons | One collision, one short chain |
| Every key in one slot | O(n) worst case | The chain is a list |
| No map, scan the array | O(n) every time | You planned for the scan |

## In the course

You will not write a hash function. \`Map\` already places the key. The O(1) beside \`get\` is an average, and the map costs extra memory. Keep the sentence: average constant time, extra memory, and a collision is why the constant is not a guarantee. For the sizes here, a short chain does not send you back to a nested scan.

## Common mistakes

Dropping the word average. The accurate sentence is O(1) on average. One call can walk a chain.

Throwing the map away because a collision is possible. For the sizes here, the map still beats a scan. The worst-case chain is a reason to speak carefully.

Writing your own hash in the exercise. The bug then lives in the slot math, and the lesson was the key and the value. Call \`get\` and \`set\`.

Assuming a collision makes the result wrong. A correct map still returns the value for the key you asked for. The chain separates the two keys. The cost changes. The stored answer stays.

## When to use it

Use the map, collisions included, when you need average constant lookups and you can spend O(n) extra memory. Two Sum style memory, counts, and duplicate checks at the sizes in this course all sit here. Say average when you state the cost. The collision explains that word.

## When not to

Skip the map when you need a worst-case bound for every key, including a cluster in one slot. A balanced tree is O(log n) under its balance rule and it keeps order. Also skip the map for a tiny array you can scan by hand, or when you needed sorted keys.

## FAQ

### Does one collision make the map the wrong tool?

No. A short chain is a few extra comparisons. For the sizes in this course, keep the map when the alternative is a scan.

### What is the worst case of a chained hash map?

If every key lands in one slot, the chain has length n and a lookup can take O(n). A loop of those lookups can degrade toward O(n²). You plan for the average, where chains stay short.

### Do you implement the hash function here?

You do not. \`Map\` turns a key into a slot. You call \`get\` and \`set\`, and you keep the sentence: average constant time, extra memory, and a collision is why the constant is not a guarantee.

## Related

- [How a Hash Map Remembers What You Have Already Seen](/articles/hash-maps)
- [What Does O(1) Mean? Constant-Time Work That Stays Flat](/articles/constant-time)
`,
  ),
];

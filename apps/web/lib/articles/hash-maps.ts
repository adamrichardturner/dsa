import { defineArticle, type Article } from "./types";

export const hashMapArticles: readonly Article[] = [
  defineArticle(
    "hash-maps",
    "How a Hash Map Remembers What You Have Already Seen",
    "Hash maps",
    "A hash map stores a value under a key so get and set are O(1) on average. The pattern is to remember what you have already seen, which turns Two Sum from a nested scan into one pass.",
    ["hash map", "hash maps"],
    `
A hash map stores a value under a key so \`get\` and \`set\` are O(1) on average. You spend memory so the next question does not walk the whole input. The pattern is to remember what you have already seen. Two Sum is the classic use: a nested scan of every pair is quadratic, and one pass that stores earlier indices is linear on average.

\`\`\`mermaid
flowchart TD
  A["Read 2"] --> B["Store index 0"]
  B --> C["Read 7"]
  C --> D["Complement 2 is stored"]
  D --> E["Positions 0 and 1"]
\`\`\`

## How it works

A map entry is a key plus the fact you want back. For Two Sum the key is a number you have seen and the value is its index. Store the index, not only the value, because the answer is positions.

For each number, check whether \`target\` minus the number is already stored. When it is, the positions are the stored index and the current index. When it is not, store the index you just passed. Check before you store, so the current index is not a partner for itself. On 2, 2 with target 4, the second 2 finds the first 2 already stored.

A nested loop scans the rest of the array at every index. One thousand elements is about half a million pair checks. The map does a \`get\` and, on a miss, a \`set\`. That is O(n) time on average and O(n) extra memory.

\`Map\` keeps a numeric key as a number. A plain object turns that key into a string, so \`record[2]\` and \`record["2"]\` are the same property. That can still work, and it is easier to get wrong when you later compare the key to a number with \`===\`. Prefer \`Map\` when the key is not already a string. \`get\` returns \`undefined\` when the key is absent. Index 0 is a real hit, so do not treat 0 as missing.

\`\`\`ts
const seen = new Map<number, number>();
seen.set(2, 0);

const asText: Record<string, number> = {};
asText["2"] = 0;

const earlier = seen.get(9 - 7);
\`\`\`

## A numeric example

Take the array 2, 7, 11, 15 and target 9.

At index 0 the number is 2. The complement 7 is absent, so you store index 0 under the key 2. At index 1 the number is 7. The complement 2 is at index 0. The positions are 0 and 1.

The nested checks on this input are the six pairs starting at (2, 7). Six checks find one pair. On 10,000 elements that style does on the order of 50 million pair checks, and the map does about 10,000 lookups. The key is the number you saw. The stored value is the index.

## Cost

The one-pass map is O(n) time on average and O(n) extra space. \`get\` and \`set\` are O(1) on average. A collision can make one lookup inspect more than one entry. If every key lands in one slot, a chained lookup can degrade toward O(n), and the pass is no longer linear. You plan for the average. The nested scan is O(n²) time and O(1) extra space. A plain object has the same average time and O(n) extra memory, with string keys. Prefer \`Map\` for numbers, and still quote both costs.

| Approach | Time | Extra space | What you store |
| --- | --- | --- | --- |
| Nested loops over pairs | O(n²) worst case | O(1) | A few integers |
| \`Map\` in one pass | O(n) average | O(n) | Index under the number you saw |
| Chained map, every key in one slot | Can degrade toward O(n) per lookup | O(n) | The same entries, one long chain |
| Plain object with numeric keys | O(n) average | O(n) | The key becomes a string |

## In the course

Two Sum reads left to right, asks for the complement, then stores the index you just passed. A miss is an absent key. Index 0 is a stored hit. Later lessons reuse the shape for a count or a previous index. Say O(n) time and O(n) extra memory on average. You choose the key, the value, and \`Map\` when the key is a number. You do not write the hash function.

## Common mistakes

Storing the value and forgetting the index. The complement test can succeed and you still cannot return positions.

Storing the current number before you look up the complement. A value that is half the target can then match its own index. Check first. Store after the miss.

Treating a \`get\` result of 0 as a miss. Index 0 is a legal position. Absence is \`undefined\`.

Using an object for numeric keys and then comparing a key to a number with \`===\`. The object stored the string \`"2"\`. \`Map\` keeps the number you passed to \`set\`.

## When to use it

Use a hash map when the question is about a key you have already seen, and a scan to answer it would nest. Complements, counts, first indices, and duplicate checks are the usual forms. Use \`Map\` when the key is a number or another value that should not become a property name. Use it when O(n) extra memory is acceptable and O(n) average time is the bound you want.

## When not to

Skip the map when the array is sorted and two pointers can answer with O(1) extra space. Skip it when you need the keys in sorted order. A map does not keep that order. A balanced tree keeps order with logarithmic updates. Skip it when the input is tiny and the nested scan is the version you can check by hand, or when you cannot afford O(n) extra memory.

## FAQ

### Why does Two Sum store the index?

The answer is positions. The key is the number you saw. The value is the index. The number alone tells you the complement occurred and does not tell you where.

### Why prefer Map over a plain object for numeric keys?

\`Map\` keeps the key as a number. A plain object turns it into a string, so 2 and \`"2"\` share one property. That can still work, and it is easier to get wrong. Prefer \`Map\` when the key is not already a string.

### What time and space should you quote?

O(n) time and O(n) extra memory, on average. The map holds an entry per key. A collision can make one lookup longer, which is why the average belongs in the sentence.

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

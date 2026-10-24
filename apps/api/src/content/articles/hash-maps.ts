import { defineArticle, type Article } from "./types";

export const hashMapArticles: readonly Article[] = [
  defineArticle(
    "hash-maps",
    "How a Hash Map Remembers What You Have Already Seen",
    "Hash maps",
    "A hash map associates unique keys with values. Expected O(1) lookup can replace a repeated scan, as the one-pass Two Sum algorithm demonstrates.",
    ["hash map", "hash maps", "two sum"],
    `
A **hash map** stores a value under a unique key. A hash function turns the key into a bucket location, so lookup, insertion, and update take O(1) expected time rather than scanning all entries.

The key design question is not “where can I use a table?” It is:

> What fact from the processed input will a later step need, and what must the value recover?

In Two Sum, the key is a number already seen and the value is its index. The stored index lets us return positions, not merely prove that a complement exists.

\`\`\`mermaid
flowchart TD
  A["Read value at current index"] --> B["complement = target - value"]
  B --> C{"Complement stored?"}
  C -->|yes| D["Return stored index and current index"]
  C -->|no| E["Store value -> current index"]
  E --> F{"More values?"}
  F -->|yes| A
  F -->|no| G["Return null"]
\`\`\`

## Before you begin

You should know linear scans, index-based arrays, and the difference between a key and a stored value. A hash map is an abstract key-to-value interface; a \`Record\`, JavaScript \`Map\`, or custom hash table is one possible implementation choice with its own key semantics.

\`\`\`ts
function twoSum(
  values: readonly number[],
  target: number,
): readonly [number, number] | null {
  const firstIndexByValue: Record<string, number | undefined> = {};

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === undefined) {
      throw new Error("twoSum expects a dense array");
    }

    const complement = target - value;
    const complementKey = String(complement);
    const earlierIndex = firstIndexByValue[complementKey];
    if (earlierIndex !== undefined) {
      return [earlierIndex, index];
    }

    const valueKey = String(value);
    firstIndexByValue[valueKey] ??= index;
  }

  return null;
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([2, 2], 4)); // [0, 1]
console.log(twoSum([1, 2, 3], 10)); // null
\`\`\`

This version intentionally uses a plain object and makes the conversion visible with \`String\`. Key \`2\` is stored as \`"2"\`. That conversion is harmless here because every key originates from a number and the values are only looked up by the same conversion.

## Record versus Map

\`Record<string, V>\` is a TypeScript description of an ordinary object; it does not create a special runtime container. Object property keys are strings or symbols, so numeric keys are coerced. A JavaScript \`Map<K, V>\` is a runtime collection that retains key identity, supports arbitrary key types, and exposes methods such as \`get\`, \`set\`, and \`has\`.

For this course's controlled string keys and number-derived keys, use a \`Record\` so examples share one convention. Use \`Map\` in broader application code when keys are objects, key coercion would be incorrect, or its API materially improves the design. This representation choice does not make hashing worst-case O(1): both are discussed with expected lookup under the standard hash-table model.

\`Record<string, V>\` also does not prove that every possible string is present at runtime. Under strict indexed-access settings, model absence explicitly as \`V | undefined\` and test against \`undefined\`. If stored \`undefined\` must be distinguishable from a missing key, use an explicit presence operation or store a tagged value.

## Why lookup comes before insertion

At the start of iteration \`i\), the table contains values only from indexes smaller than \`i\). This loop invariant guarantees that a match uses two distinct positions. If the current value were inserted first, \`[3]\` with target 6 could incorrectly match index 0 with itself.

Duplicates still work: for \`[2, 2]\` and target 4, the first 2 is stored; the second 2 finds it. The nullish assignment preserves the first index, though returning one valid pair would also permit overwriting after a miss.

## Worked trace

For \`[2, 7, 11, 15]\` and target 9:

| Index | Value | Complement | Table before lookup | Action |
| --- | --- | --- | --- | --- |
| 0 | 2 | 7 | empty | store 2 → 0 |
| 1 | 7 | 2 | 2 → 0 | return [0, 1] |

The specification asks for one pair, so returning immediately is correct. Returning every pair would require a different table value, such as a list of earlier indexes, and careful duplicate semantics.

## Complexity

The loop performs at most one expected-O(1) lookup and one expected-O(1) insertion per element. Total time is O(n) expected and auxiliary space is O(k), where \`k <= n\` is the number of distinct stored values. In contrast, checking every pair takes O(n²) time and O(1) auxiliary space.

“Expected” concerns how well hashing distributes keys. “Amortized” concerns occasional expensive operations, such as growing the backing array, spread over many insertions. Hash-table insertion is commonly both expected O(1) and amortized O(1), but not worst-case O(1).

## Edge cases and mistakes

- Index 0 is a valid answer. Check against \`undefined\), not truthiness.
- Store the index because the result requires positions.
- Check before storing to prevent self-matching.
- Decide whether duplicate keys preserve the first value, replace it, or accumulate a count.
- Plain object keys are strings or symbols and can have prototype concerns. For controlled numeric keys, the object above is sufficient; \`Object.create(null)\` is another option when prototype-free storage is required.
- If the input is already sorted, two pointers can solve the value-pair version in O(n) time and O(1) auxiliary space.

## In the course

Choosing what a key means, checking before insertion, handling index 0, and reporting expected O(n) time with O(n) auxiliary space are core. Implementing hashing and resizing is enrichment; collision resolution is included so “expected O(1)” has an honest model.

## Related

- [What Is a Hash Collision? Why O(1) Is Only Expected](/articles/collisions)
- [What Is the Space-for-Time Tradeoff in Algorithms?](/articles/space-for-time)
- [What Is O(n²) Quadratic Time? Nested Loops and Pairs](/articles/quadratic-time)
- [What Is the Two-Pointer Technique on a Sorted Array?](/articles/two-pointers)
  `,
  ),
  defineArticle(
    "collisions",
    "What Is a Hash Collision? Why O(1) Is Only Expected",
    "Hash maps",
    "A collision occurs when distinct keys select the same bucket. Correct collision resolution preserves results but can increase lookup time.",
    ["collision", "separate chaining", "hash function"],
    `
A **hash collision** occurs when distinct keys select the same bucket. Collisions are unavoidable when a large key space is compressed into a finite table. They do not make a correct hash table return the wrong value; they make it inspect more candidates.

\`\`\`mermaid
flowchart LR
  A["key: ab"] --> H1["hash"]
  B["key: ba"] --> H2["hash"]
  H1 --> S["bucket 3"]
  H2 --> S
  S --> C["ab -> 10"]
  C --> D["ba -> 20"]
\`\`\`

## Before you begin

You should understand key equality and remainder. A **bucket** is one table position, the **load factor** is entries divided by buckets, and a **probe sequence** is the order of alternative slots examined by open addressing.

Two common resolution strategies are:

- **Separate chaining:** each bucket stores a collection of entries.
- **Open addressing:** entries stay in the array and probing searches alternative slots.

The complete teaching implementation below uses separate chaining. Its simple hash sums character codes, so \`"ab"\` and \`"ba"\` deliberately collide.

\`\`\`ts
type Entry = {
  key: string;
  value: number;
};

class ChainedHashTable {
  private readonly buckets: Entry[][];

  constructor(bucketCount: number) {
    if (!Number.isInteger(bucketCount) || bucketCount <= 0) {
      throw new RangeError("bucketCount must be a positive integer.");
    }

    this.buckets = Array.from({ length: bucketCount }, () => []);
  }

  set(key: string, value: number): void {
    const bucket = this.bucketFor(key);

    for (const entry of bucket) {
      if (entry.key !== key) {
        continue;
      }
      entry.value = value;
      return;
    }

    bucket.push({ key, value });
  }

  get(key: string): number | undefined {
    const bucket = this.bucketFor(key);

    for (const entry of bucket) {
      if (entry.key === key) {
        return entry.value;
      }
    }

    return undefined;
  }

  private bucketFor(key: string): Entry[] {
    let hash = 0;

    for (const character of key) {
      hash += character.codePointAt(0) ?? 0;
    }

    const bucket = this.buckets[hash % this.buckets.length];
    if (bucket === undefined) {
      throw new Error("validated bucket count produced no bucket");
    }

    return bucket;
  }
}

const table = new ChainedHashTable(4);
table.set("ab", 10);
table.set("ba", 20);
table.set("ab", 30);

console.log(table.get("ab")); // 30
console.log(table.get("ba")); // 20
console.log(table.get("missing")); // undefined
\`\`\`

## What the chain preserves

Every entry stores its original key as well as its value. Lookup first reaches the bucket, then compares keys inside that bucket. Updating \`"ab"\` changes only the entry whose key equals \`"ab"\`; the colliding \`"ba"\` entry remains intact.

The bucket invariant is:

> Each logical key appears at most once, in the bucket selected by its hash.

The explicit missing-bucket check satisfies strict indexed-access settings without a type assertion. Constructor validation and remainder arithmetic make the error unreachable for a correctly constructed table.

Production tables resize to control their load factor. When the table grows, entries must be rehashed because the bucket count changed; copying an entry to the same numeric index would generally be wrong. One resize can cost O(n), while growth across a long insertion sequence can still be O(1) amortized per insertion under the usual geometric-resizing strategy.

## Complexity

Let \`n\` be the number of entries and \`b\` the number of buckets. With a good hash function and controlled load factor, expected chain length is O(n / b), treated as O(1) when the table grows with the data. Thus \`get\` and \`set\` are expected O(1).

If all \`n\` keys collide, one chain has length \`n\). Lookup and update become O(n) worst case, and \`n\` such operations can total O(n²). Space remains O(n + b).

## Edge cases and mistakes

- Never identify an entry by hash alone; distinct keys can have the same hash.
- Inserting an existing key should update it, not create a duplicate logical key.
- A poor hash function or too many entries for too few buckets creates long chains.
- Taking a remainder requires a positive bucket count.
- Mutable object keys are dangerous in schemes whose hash can change after insertion.
- Do not conclude that one collision defeats hashing. Short chains are compatible with expected constant-time operations.

Use a hash table for fast expected lookup when extra memory is acceptable. Use a balanced search tree when sorted traversal or O(log n) worst-case operations matter.

## In the course

The core goal is to explain why equal bucket indexes still require full key comparison and why long chains produce a linear worst case. Designing secure hash functions, deletion rules for open addressing, and production resize thresholds is enrichment.

## Related

- [How a Hash Map Remembers What You Have Already Seen](/articles/hash-maps)
- [What Does O(1) Mean? Constant-Time Work That Stays Flat](/articles/constant-time)
- [What Is a Balanced Tree? AVL, Red-Black, and Height](/articles/balanced-trees)
  `,
  ),
];

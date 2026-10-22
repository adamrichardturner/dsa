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

\`\`\`ts
function twoSum(
  values: readonly number[],
  target: number,
): readonly [number, number] | null {
  const firstIndexByValue: Record<string, number | undefined> = {};

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === undefined) {
      continue;
    }

    const complement = target - value;
    const earlierIndex = firstIndexByValue[complement];
    if (earlierIndex !== undefined) {
      return [earlierIndex, index];
    }

    firstIndexByValue[value] ??= index;
  }

  return null;
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([2, 2], 4)); // [0, 1]
console.log(twoSum([1, 2, 3], 10)); // null
\`\`\`

This version intentionally uses a plain object. JavaScript converts numeric property keys to strings, so key \`2\` is stored as \`"2"\`. That conversion is harmless here because every key originates from a number and the values are only looked up the same way.

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

## Related

- [What Is a Hash Collision? Why O(1) Is Only Expected](/articles/collisions)
- [What Is the Space-for-Time Tradeoff in Algorithms?](/articles/space-for-time)
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

    return this.buckets[hash % this.buckets.length] ?? [];
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

The implementation's fallback empty array is unreachable after constructor validation, but it keeps indexed access safe under strict TypeScript settings. Production tables also resize to control their **load factor**, usually defined as entries divided by buckets.

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

## Related

- [How a Hash Map Remembers What You Have Already Seen](/articles/hash-maps)
- [What Does O(1) Mean? Constant-Time Work That Stays Flat](/articles/constant-time)
  `,
  ),
];

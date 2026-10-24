import { articleTopics, type ArticleTopic } from "./types";

export interface ArticleCategory {
  readonly slug: string;
  readonly topic: ArticleTopic;
  readonly title: string;
  readonly description: string;
  readonly summary: string;
}

const categoryByTopicRecord: Record<ArticleTopic, ArticleCategory> = {
  Cost: {
    slug: "cost",
    topic: "Cost",
    title: "Cost",
    description:
      "How the work of an algorithm, and its extra memory, grow with the input: Big O, common rates, invariants, and amortized cost.",
    summary:
      "These articles name how the number of steps changes as the input grows, and how much extra memory an algorithm needs. They cover Big O, constant, logarithmic, linear, linearithmic, and quadratic time, loop invariants, amortized cost, and trading space for time. A lesson that writes O(n) or O(n²) is pointing at one of these.",
  },
  Arrays: {
    slug: "arrays",
    topic: "Arrays",
    title: "Arrays",
    description:
      "How an array stores values in order, and the scans built on that layout: two pointers, windows, prefix sums, and rotation.",
    summary:
      "An array keeps values in index order, so a known index is a direct read. These articles start from that layout, then explain the scans the lessons build on it: two pointers moving inward, a window that grows and shrinks, a prefix sum, and rotating values without losing their order.",
  },
  "Hash maps": {
    slug: "hash-maps",
    topic: "Hash maps",
    title: "Hash maps",
    description:
      "How a hash map turns a key into a bucket, what a collision is, and how a frequency count uses one.",
    summary:
      "A hash map stores a value under a key and finds it without scanning the whole collection. These articles explain the hash that chooses a bucket, what happens when two keys land in the same bucket, and the frequency count the lessons use to answer how many times a value appears.",
  },
  "Linear structures": {
    slug: "linear-structures",
    topic: "Linear structures",
    title: "Linear structures",
    description:
      "Lists, stacks, queues, and deques: the order values enter and leave, and the pointers that walk a list.",
    summary:
      "These articles are about values kept in a line, where the useful end matters more than a random index. A linked list is walked by following pointers. A stack, and the call stack, give back the latest value first. A queue gives back the earliest. A deque uses both ends.",
  },
  "Search and sort": {
    slug: "search-and-sort",
    topic: "Search and sort",
    title: "Search and sort",
    description:
      "Finding a value in a sorted range, and the sorts the course compares: bubble sort, merge sort, and quicksort.",
    summary:
      "Search finds one value. Sort puts every value in order so a later search can discard half the range. These articles cover recursion, binary search and its boundaries, bubble sort, merge sort, and quicksort, including how to choose among them and the off-by-one errors a half-open range invites.",
  },
  "Trees and graphs": {
    slug: "trees-and-graphs",
    topic: "Trees and graphs",
    title: "Trees and graphs",
    description:
      "Trees, heaps, and graphs: how nodes connect, how a walk visits them, and how a shortest path is chosen.",
    summary:
      "A tree is a graph with one path between any two nodes. These articles cover that shape, binary search trees, balance, heaps, and the walks that visit every node. They also cover general graphs: adjacency lists, breadth-first and depth-first search, Dijkstra, directed acyclic graphs, and disjoint-set union.",
  },
  Patterns: {
    slug: "patterns",
    topic: "Patterns",
    title: "Patterns",
    description:
      "Ways of choosing the next step: greedy choices, backtracking, dynamic programming, memoisation, and tries.",
    summary:
      "A pattern is a way of deciding the next step when the structure alone does not settle it. These articles cover taking the best local choice, searching by trying a branch and undoing it, storing an answer you will need again, filling a table from smaller subproblems, and a trie that shares prefixes.",
  },
};

const listedCategories: ArticleCategory[] = [];

for (const topic of articleTopics) {
  listedCategories.push(categoryByTopicRecord[topic]);
}

export const articleCategories: readonly ArticleCategory[] = listedCategories;

const categorySlugOwners: Record<string, ArticleTopic> = {};

for (const category of articleCategories) {
  const owner = categorySlugOwners[category.slug];
  if (owner !== undefined) {
    throw new Error(
      `Duplicate category slug "${category.slug}" on ${owner} and ${category.topic}`,
    );
  }
  categorySlugOwners[category.slug] = category.topic;
}

export const categoryByTopic = (topic: ArticleTopic): ArticleCategory => {
  return categoryByTopicRecord[topic];
};

export const categoryBySlug = (slug: string): ArticleCategory | null => {
  for (const category of articleCategories) {
    if (category.slug === slug) {
      return category;
    }
  }
  return null;
};

export const articleCategoryPath = (category: ArticleCategory): string => {
  return `/articles/categories/${category.slug}`;
};

export const articleCountLabel = (count: number): string => {
  if (count === 1) {
    return "1 article";
  }
  return `${count} articles`;
};

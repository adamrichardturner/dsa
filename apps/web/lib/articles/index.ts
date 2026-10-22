import { arrayArticles } from "./arrays";
import { costBasicArticles } from "./cost-basics";
import { costScaleArticles } from "./cost-scales";
import { directedGraphArticles } from "./directed-graphs";
import { disjointSetArticles } from "./disjoint-sets";
import { graphArticles } from "./graphs";
import { hashMapArticles } from "./hash-maps";
import { linearArticles } from "./linear";
import { patternArticles } from "./patterns";
import { practiceArticles } from "./practice";
import { quicksortArticles } from "./quicksort";
import { searchSortArticles } from "./search-sort";
import { treeTraversalArticles } from "./tree-traversals";
import { treeArticles } from "./trees";
import type { Article, ArticleTopic } from "./types";

export type { Article, ArticleTopic };
export { articleTopicId, articleTopics } from "./types";

const coreArticles: readonly Article[] = [
  ...costBasicArticles,
  ...costScaleArticles,
  ...arrayArticles,
  ...hashMapArticles,
  ...linearArticles,
  ...searchSortArticles,
  ...quicksortArticles,
  ...treeArticles,
  ...treeTraversalArticles,
  ...graphArticles,
  ...directedGraphArticles,
  ...disjointSetArticles,
  ...patternArticles,
  ...practiceArticles,
];

export const articles: readonly Article[] = coreArticles;

const bySlug: Record<string, Article> = {};
const keywordOwners: Record<string, string> = {};

for (const item of articles) {
  if (bySlug[item.slug] !== undefined) {
    throw new Error(`Duplicate article slug: ${item.slug}`);
  }
  bySlug[item.slug] = item;

  for (const keyword of item.keywords) {
    const normalised = keyword.toLowerCase();
    const owner = keywordOwners[normalised];
    if (owner !== undefined) {
      throw new Error(
        `Duplicate article keyword "${keyword}" in ${owner} and ${item.slug}`,
      );
    }
    keywordOwners[normalised] = item.slug;
  }
}

const articleLink = /\/articles\/([a-z0-9-]+)/g;

for (const item of articles) {
  for (const match of item.body.matchAll(articleLink)) {
    const slug = match[1];
    if (slug === undefined || bySlug[slug] !== undefined) {
      continue;
    }
    throw new Error(`Broken article link from ${item.slug} to ${slug}`);
  }
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

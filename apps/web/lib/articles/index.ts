import { arrayArticles } from "./arrays";
import { costBasicArticles } from "./cost-basics";
import { costScaleArticles } from "./cost-scales";
import { graphArticles } from "./graphs";
import { hashMapArticles } from "./hash-maps";
import { linearArticles } from "./linear";
import { patternArticles } from "./patterns";
import { searchSortArticles } from "./search-sort";
import { treeArticles } from "./trees";
import type { Article, ArticleTopic } from "./types";

export type { Article, ArticleTopic };

export const articles: readonly Article[] = [
  ...costBasicArticles,
  ...costScaleArticles,
  ...arrayArticles,
  ...hashMapArticles,
  ...linearArticles,
  ...searchSortArticles,
  ...treeArticles,
  ...graphArticles,
  ...patternArticles,
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

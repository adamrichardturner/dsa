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

export const defineArticle = (
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

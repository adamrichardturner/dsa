import { articleCategoryPath, type ArticleCategory } from "./categories";
import type { Article } from "./types";
import { creatorName, creatorUrl, siteName, siteUrl } from "@/lib/site";

interface ArticleListItem {
  readonly "@type": "ListItem";
  readonly position: number;
  readonly name: string;
  readonly description: string;
  readonly url: string;
}

interface ItemListNode {
  readonly "@type": "ItemList";
  readonly "@id": string;
  readonly name: string;
  readonly numberOfItems: number;
  readonly itemListOrder: "https://schema.org/ItemListOrderAscending";
  readonly itemListElement: readonly ArticleListItem[];
}

interface CollectionPageNode {
  readonly "@type": "CollectionPage";
  readonly "@id": string;
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly inLanguage: "en";
  readonly isPartOf: {
    readonly "@type": "WebSite";
    readonly name: string;
    readonly url: string;
  };
  readonly mainEntity: { readonly "@id": string };
  readonly hasPart?: readonly {
    readonly "@type": "CollectionPage";
    readonly name: string;
    readonly url: string;
  }[];
}

interface BreadcrumbListNode {
  readonly "@type": "BreadcrumbList";
  readonly "@id": string;
  readonly itemListElement: readonly {
    readonly "@type": "ListItem";
    readonly position: number;
    readonly name: string;
    readonly item: string;
  }[];
}

interface TechArticleNode {
  readonly "@type": "TechArticle";
  readonly "@id": string;
  readonly headline: string;
  readonly description: string;
  readonly keywords: string;
  readonly inLanguage: "en";
  readonly url: string;
  readonly mainEntityOfPage: string;
  readonly articleSection: string;
  readonly author: {
    readonly "@type": "Person";
    readonly name: string;
    readonly url: string;
  };
  readonly publisher: {
    readonly "@type": "Organization";
    readonly name: string;
    readonly url: string;
  };
  readonly isPartOf: {
    readonly "@type": "CollectionPage";
    readonly name: string;
    readonly url: string;
  };
}

export type JsonLdNode =
  CollectionPageNode | ItemListNode | BreadcrumbListNode | TechArticleNode;

export interface JsonLdGraph {
  readonly "@context": "https://schema.org";
  readonly "@graph": readonly JsonLdNode[];
}

export interface ArticleSection {
  readonly category: ArticleCategory;
  readonly articles: readonly Article[];
}

interface Crumb {
  readonly name: string;
  readonly url: string;
}

const website = {
  "@type": "WebSite" as const,
  name: siteName,
  url: siteUrl,
};

const absolute = (path: string): string => {
  return `${siteUrl}${path}`;
};

const articleUrl = (slug: string): string => {
  return absolute(`/articles/${slug}`);
};

const listItems = (items: readonly Article[]): readonly ArticleListItem[] => {
  const elements: ArticleListItem[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (item === undefined) {
      continue;
    }
    elements.push({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      description: item.summary,
      url: articleUrl(item.slug),
    });
  }
  return elements;
};

const breadcrumb = (
  id: string,
  crumbs: readonly Crumb[],
): BreadcrumbListNode => {
  const itemListElement: BreadcrumbListNode["itemListElement"][number][] = [];
  for (let index = 0; index < crumbs.length; index += 1) {
    const crumb = crumbs[index];
    if (crumb === undefined) {
      continue;
    }
    itemListElement.push({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.url),
    });
  }
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement,
  };
};

export const articlesIndexJsonLd = (
  sections: readonly ArticleSection[],
  description: string,
): JsonLdGraph => {
  const items: Article[] = [];
  const parts: NonNullable<CollectionPageNode["hasPart"]>[number][] = [];
  for (const section of sections) {
    parts.push({
      "@type": "CollectionPage",
      name: section.category.title,
      url: absolute(articleCategoryPath(section.category)),
    });
    for (const item of section.articles) {
      items.push(item);
    }
  }
  const listId = `${siteUrl}/articles#articles`;
  const list: ItemListNode = {
    "@type": "ItemList",
    "@id": listId,
    name: "All articles",
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: listItems(items),
  };
  const page: CollectionPageNode = {
    "@type": "CollectionPage",
    "@id": `${siteUrl}/articles`,
    name: "Articles",
    description,
    url: `${siteUrl}/articles`,
    inLanguage: "en",
    isPartOf: website,
    mainEntity: { "@id": listId },
    hasPart: parts,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      page,
      list,
      breadcrumb(`${siteUrl}/articles#breadcrumb`, [
        { name: "Articles", url: "/articles" },
      ]),
    ],
  };
};

export const categoryJsonLd = (
  category: ArticleCategory,
  items: readonly Article[],
): JsonLdGraph => {
  const path = articleCategoryPath(category);
  const pageUrl = absolute(path);
  const listId = `${pageUrl}#articles`;
  const page: CollectionPageNode = {
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: category.title,
    description: category.summary,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: website,
    mainEntity: { "@id": listId },
  };
  const list: ItemListNode = {
    "@type": "ItemList",
    "@id": listId,
    name: `${category.title} articles`,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: listItems(items),
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      page,
      list,
      breadcrumb(`${pageUrl}#breadcrumb`, [
        { name: "Articles", url: "/articles" },
        { name: category.title, url: path },
      ]),
    ],
  };
};

export const articleJsonLd = (
  entry: Article,
  category: ArticleCategory,
): JsonLdGraph => {
  const path = `/articles/${entry.slug}`;
  const pageUrl = absolute(path);
  const categoryPath = articleCategoryPath(category);
  const article: TechArticleNode = {
    "@type": "TechArticle",
    "@id": pageUrl,
    headline: entry.title,
    description: entry.summary,
    keywords: entry.keywords.join(", "),
    inLanguage: "en",
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    articleSection: category.title,
    author: {
      "@type": "Person",
      name: creatorName,
      url: creatorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    isPartOf: {
      "@type": "CollectionPage",
      name: category.title,
      url: absolute(categoryPath),
    },
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      article,
      breadcrumb(`${pageUrl}#breadcrumb`, [
        { name: "Articles", url: "/articles" },
        { name: category.title, url: categoryPath },
        { name: entry.title, url: path },
      ]),
    ],
  };
};

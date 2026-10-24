import type { MetadataRoute } from "next";
import { articles } from "@/lib/articles";
import {
  articleCategories,
  articleCategoryPath,
} from "@/lib/articles/categories";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryPages: MetadataRoute.Sitemap = articleCategories.map(
    (category) => ({
      url: `${siteUrl}${articleCategoryPath(category)}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  );
  const articlePages: MetadataRoute.Sitemap = articles.map((entry) => ({
    url: `${siteUrl}/articles/${entry.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/articles`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...categoryPages,
    ...articlePages,
    {
      url: `${siteUrl}/llms.txt`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}

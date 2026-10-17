import type { MetadataRoute } from "next";
import { articles } from "@/lib/articles";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
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
      priority: 0.6,
    },
    ...articlePages,
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

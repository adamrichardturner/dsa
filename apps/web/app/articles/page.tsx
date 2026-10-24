import type { Metadata } from "next";
import Link from "next/link";
import { ArticleList, CategoryCard } from "@/components/article-catalog";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { articlesForTopic } from "@/lib/articles";
import {
  articleCategories,
  articleCategoryPath,
} from "@/lib/articles/categories";
import { articlesIndexJsonLd } from "@/lib/articles/structured-data";
import { articleTopicId } from "@/lib/articles/types";
import { siteName, socialImage } from "@/lib/site";

const description = `Explainers from ${siteName}, grouped into cost, arrays, hash maps, linear structures, search and sort, trees and graphs, and patterns.`;

const indexKeywords = [
  "data structures and algorithms",
  "algorithm articles",
  ...articleCategories.map((category) => category.title),
];

const sections = articleCategories.map((category) => ({
  category,
  articles: articlesForTopic(category.topic),
}));

export const metadata: Metadata = {
  title: "Articles",
  description,
  keywords: indexKeywords,
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "Articles",
    description,
    url: "/articles",
    type: "website",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles",
    description,
    images: [socialImage],
  },
};

export default function ArticlesPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-6 py-12">
      <JsonLd data={articlesIndexJsonLd(sections, description)} />
      <header className="max-w-2xl space-y-3">
        <Badge variant="secondary">Reference</Badge>
        <h1 className="font-serif text-4xl tracking-tight">Articles</h1>
        <p className="leading-relaxed text-muted-foreground">
          Longer explainers for the terms the lessons use, grouped by category.
          Each article answers a specific question, with a diagram, the cost,
          and a worked example from the course.
        </p>
      </header>
      <section className="space-y-4" aria-labelledby="article-categories">
        <h2
          id="article-categories"
          className="font-serif text-2xl tracking-tight"
        >
          Categories
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <li key={section.category.slug} className="h-full">
              <CategoryCard
                category={section.category}
                count={section.articles.length}
              />
            </li>
          ))}
        </ul>
      </section>
      <Separator />
      <section className="space-y-8" aria-labelledby="all-articles">
        <div className="max-w-2xl space-y-2">
          <h2 id="all-articles" className="font-serif text-2xl tracking-tight">
            All articles
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every explainer, in category order. Open a category for the short
            account of what that group is about.
          </p>
        </div>
        {sections.map((section) => (
          <section
            key={section.category.slug}
            className="space-y-3"
            aria-labelledby={articleTopicId(section.category.topic)}
          >
            <h3
              id={articleTopicId(section.category.topic)}
              className="font-serif text-xl tracking-tight max-md:scroll-mt-20"
            >
              <Link
                href={articleCategoryPath(section.category)}
                className="underline-offset-4 hover:underline"
              >
                {section.category.title}
              </Link>
            </h3>
            <ArticleList articles={section.articles} />
          </section>
        ))}
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/article-catalog";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { articlesForTopic, categoryKeywords } from "@/lib/articles";
import { articleCategories, categoryBySlug } from "@/lib/articles/categories";
import { categoryJsonLd } from "@/lib/articles/structured-data";
import { socialImage } from "@/lib/site";

interface CategoryPageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  const params: { slug: string }[] = [];
  for (const category of articleCategories) {
    params.push({ slug: category.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (category === null) {
    return { title: "Category" };
  }
  const path = `/articles/categories/${category.slug}`;
  const items = articlesForTopic(category.topic);

  return {
    title: category.title,
    description: category.description,
    keywords: [...categoryKeywords(category, items)],
    alternates: { canonical: path },
    openGraph: {
      title: category.title,
      description: category.description,
      url: path,
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: category.title,
      description: category.description,
      images: [socialImage],
    },
  };
}

export default async function ArticleCategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = categoryBySlug(slug);
  if (category === null) {
    notFound();
  }
  const items = articlesForTopic(category.topic);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <JsonLd data={categoryJsonLd(category, items)} />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <li>
            <Link
              href="/articles"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Articles
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {category.title}
          </li>
        </ol>
      </nav>
      <header className="space-y-3">
        <Badge variant="secondary">Category</Badge>
        <h1 className="font-serif text-4xl tracking-tight">{category.title}</h1>
        <p className="max-w-xl leading-relaxed text-muted-foreground">
          {category.summary}
        </p>
      </header>
      <ArticleList articles={items} />
    </main>
  );
}

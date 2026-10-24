import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { PageMain } from "@/components/page-frame";
import { LessonMarkdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { articleBySlug, articles } from "@/lib/articles";
import {
  articleCategoryPath,
  categoryByTopic,
} from "@/lib/articles/categories";
import { articleJsonLd } from "@/lib/articles/structured-data";
import { lessonReturnPath } from "@/lib/lesson-return";
import { socialImage } from "@/lib/site";
import { cn } from "cn";

interface ArticlePageProps {
  readonly params: Promise<{ readonly slug: string }>;
  readonly searchParams: Promise<{
    readonly from?: string | string[];
  }>;
}

export function generateStaticParams(): { slug: string }[] {
  const params: { slug: string }[] = [];
  for (const item of articles) {
    params.push({ slug: item.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = articleBySlug(slug);
  if (entry === null) {
    return { title: "Article" };
  }

  const path = `/articles/${entry.slug}`;
  return {
    title: entry.title,
    description: entry.summary,
    keywords: [...entry.keywords],
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.summary,
      url: path,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.summary,
      images: [socialImage],
    },
  };
}

const fromParam = (
  value: string | string[] | undefined,
): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  return value;
};

export default async function ArticlePage({
  params,
  searchParams,
}: ArticlePageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const entry = articleBySlug(slug);
  if (entry === null) {
    notFound();
  }
  const backHref = lessonReturnPath(fromParam(query.from));
  const category = categoryByTopic(entry.topic);
  const categoryPath = articleCategoryPath(category);

  return (
    <PageMain className="py-12">
      <JsonLd data={articleJsonLd(entry, category)} />
      {backHref !== null ? (
        <Link
          href={backHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mb-8 h-12 gap-2 px-5 font-serif text-base",
          )}
        >
          <ArrowLeft aria-hidden="true" />
          Back to lesson
        </Link>
      ) : null}
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
          <li>
            <Link
              href={categoryPath}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {category.title}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {entry.title}
          </li>
        </ol>
      </nav>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary" render={<Link href={categoryPath} />}>
          {category.title}
        </Badge>
      </div>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{entry.title}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{entry.summary}</p>
      <div className="mt-8">
        <LessonMarkdown content={entry.body} />
      </div>
    </PageMain>
  );
}

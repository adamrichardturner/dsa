import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageMain } from "@/components/page-frame";
import { LessonMarkdown } from "@/components/markdown";
import { articleBySlug, articles } from "@/lib/articles";
import { categoryByTopic } from "@/lib/articles/categories";

interface EmbedArticlePageProps {
  readonly params: Promise<{ readonly slug: string }>;
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
}: EmbedArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = articleBySlug(slug);
  if (entry === null) {
    return { title: "Article", robots: { index: false, follow: false } };
  }
  return {
    title: entry.title,
    description: entry.summary,
    robots: { index: false, follow: false },
  };
}

export default async function EmbedArticlePage({ params }: EmbedArticlePageProps) {
  const { slug } = await params;
  const entry = articleBySlug(slug);
  if (entry === null) {
    notFound();
  }
  const category = categoryByTopic(entry.topic);

  return (
    <PageMain className="py-8">
      <p className="text-sm text-muted-foreground">{category.title}</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{entry.title}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{entry.summary}</p>
      <div className="mt-8">
        <LessonMarkdown content={entry.body} />
      </div>
    </PageMain>
  );
}

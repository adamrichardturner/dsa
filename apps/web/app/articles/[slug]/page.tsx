import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LessonMarkdown } from "@/components/markdown";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { articleBySlug, articles } from "@/lib/articles";
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

  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/articles/${entry.slug}` },
    openGraph: {
      title: entry.title,
      description: entry.summary,
      url: `/articles/${entry.slug}`,
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
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
      <p className="text-sm text-muted-foreground">
        <Link
          href="/articles"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          Articles
        </Link>
        <span aria-hidden="true"> · </span>
        {entry.topic}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary">{entry.topic}</Badge>
      </div>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{entry.title}</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">{entry.summary}</p>
      <div className="mt-8">
        <LessonMarkdown content={entry.body} />
      </div>
    </main>
  );
}

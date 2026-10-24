import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { articleGroups, articleTopicId } from "@/lib/articles";
import { siteName, socialImage } from "@/lib/site";

const description = `Explainers from ${siteName} on cost, arrays, hash maps, trees, graphs, and the patterns the lessons use.`;

export const metadata: Metadata = {
  title: "Articles",
  description,
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "Articles",
    description,
    url: "/articles",
    images: [socialImage],
  },
};

export default function ArticlesPage() {
  const groups = articleGroups();

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <div className="space-y-3">
        <Badge variant="secondary">Reference</Badge>
        <h1 className="font-serif text-4xl tracking-tight">Articles</h1>
        <p className="max-w-xl text-muted-foreground">
          Longer explainers for the terms the lessons use. Each one answers a
          specific question, with a diagram, the cost, and a worked example
          from the course.
        </p>
      </div>
      {groups.map((group) => (
        <section
          key={group.topic}
          className="space-y-3"
          aria-labelledby={articleTopicId(group.topic)}
        >
          <h2
            id={articleTopicId(group.topic)}
            className="font-serif text-2xl tracking-tight max-md:scroll-mt-20"
          >
            {group.topic}
          </h2>
          <Card>
            <CardContent className="divide-y px-0">
              {group.articles.map((item) => (
                <Link
                  key={item.slug}
                  href={`/articles/${item.slug}`}
                  className="block px-4 py-4 transition-colors hover:bg-muted/60"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      ))}
    </main>
  );
}

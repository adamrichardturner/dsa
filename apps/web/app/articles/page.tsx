import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { articleGroups } from "@/lib/articles";
import { siteDescription, siteName, socialImage } from "@/lib/site";

const description = `Short articles on the ideas in ${siteName}: cost, arrays, trees, graphs, and the patterns the lessons use.`;

const topicId = (topic: string): string => {
  return `topic-${topic.toLowerCase().replaceAll(" ", "-")}`;
};

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
          Standalone notes on the words the lessons use. Each one is the longer version of a term you
          can hover inside a lesson.
        </p>
      </div>
      {groups.map((group) => (
        <section key={group.topic} className="space-y-3" aria-labelledby={topicId(group.topic)}>
          <h2 id={topicId(group.topic)} className="font-serif text-2xl tracking-tight">
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
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      ))}
    </main>
  );
}

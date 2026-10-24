import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  articleCategoryPath,
  articleCountLabel,
  type ArticleCategory,
} from "@/lib/articles/categories";
import type { Article } from "@/lib/articles/types";

export function CategoryCard({
  category,
  count,
}: {
  readonly category: ArticleCategory;
  readonly count: number;
}) {
  return (
    <Link
      href={articleCategoryPath(category)}
      className="block h-full rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-colors hover:bg-muted/60">
        <CardHeader>
          <Badge variant="secondary">{articleCountLabel(count)}</Badge>
          <h3 className="font-serif text-2xl tracking-tight">
            {category.title}
          </h3>
          <CardDescription className="leading-relaxed">
            {category.description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}

export function ArticleList({
  articles,
}: {
  readonly articles: readonly Article[];
}) {
  if (articles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No articles in this category yet.
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="px-0">
        <ol className="divide-y">
          {articles.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/articles/${item.slug}`}
                className="block px-4 py-4 transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60"
              >
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.summary}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

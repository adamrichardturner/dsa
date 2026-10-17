import Link from "next/link";
import { articleBySlug, type Article } from "@/lib/articles";

export function SuggestedReading({
  slugs,
}: {
  readonly slugs: readonly string[];
}) {
  const items: Article[] = [];

  for (const slug of slugs) {
    const entry = articleBySlug(slug);
    if (entry === null) {
      continue;
    }
    items.push(entry);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="space-y-3 border-t pt-6"
      aria-labelledby="suggested-reading"
    >
      <h2 id="suggested-reading" className="font-serif text-2xl tracking-tight">
        Suggested reading
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/articles/${item.slug}`}
              className="font-medium underline-offset-4 hover:underline"
            >
              {item.title}
            </Link>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {item.summary}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

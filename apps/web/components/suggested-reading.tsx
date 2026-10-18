import Link from "next/link";
import { SquareArrowOutUpRight } from "lucide-react";
import { cn } from "cn";
import { articleBySlug, type Article } from "@/lib/articles";
import { withLessonFrom } from "@/lib/lesson-return";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SuggestedReading({
  slugs,
  from,
  headingId = "suggested-reading",
}: {
  readonly slugs: readonly string[];
  readonly from?: string;
  readonly headingId?: string;
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
    <section className="space-y-3 border-t pt-6" aria-labelledby={headingId}>
      <h2 id={headingId} className="font-serif text-2xl tracking-tight">
        Suggested reading
      </h2>
      <ScrollArea className="**:data-[slot=scroll-area-viewport]:max-h-80 **:data-[slot=scroll-area-viewport]:overscroll-contain">
        <ul className="space-y-3 py-1 pl-1 pr-3">
          {items.map((item) => {
            const href = withLessonFrom(`/articles/${item.slug}`, from);

            return (
              <li key={item.slug}>
                <Card
                  size="sm"
                  className="relative overflow-visible transition-colors hover:bg-muted/60"
                >
                  <Link
                    href={href}
                    aria-labelledby={`suggested-${item.slug}`}
                    className="absolute inset-0 z-0 rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                  <CardHeader className="pointer-events-none relative z-10">
                    <CardAction className="pointer-events-auto">
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${item.title} in a new tab`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        )}
                      >
                        <SquareArrowOutUpRight />
                      </Link>
                    </CardAction>
                    <Badge variant="outline">{item.topic}</Badge>
                    <CardTitle
                      id={`suggested-${item.slug}`}
                      className="font-serif"
                    >
                      {item.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {item.summary}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </section>
  );
}

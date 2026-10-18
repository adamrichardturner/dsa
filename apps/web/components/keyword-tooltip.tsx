"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { SquareArrowOutUpRight } from "lucide-react";
import { PreviewCard } from "@base-ui/react/preview-card";
import { cn } from "cn";
import { buttonVariants } from "@/components/ui/button";
import { articleBySlug } from "@/lib/articles";
import { withLessonFrom } from "@/lib/lesson-return";

const viewportBoundary = (): Element | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }
  return document.documentElement;
};

const slugFromHref = (href: string): string | null => {
  const marker = "/articles/";
  if (!href.startsWith(marker)) {
    return null;
  }
  const slug = href.slice(marker.length);
  if (slug.length === 0) {
    return null;
  }
  if (slug.includes("/") || slug.includes("#") || slug.includes("?")) {
    return null;
  }
  return slug;
};

export function KeywordTooltip({
  href,
  from,
  children,
}: {
  readonly href: string;
  readonly from?: string;
  readonly children: ReactNode;
}) {
  const slug = slugFromHref(href);
  const entry = slug === null ? null : articleBySlug(slug);
  const destination = withLessonFrom(href, from);
  if (entry === null) {
    return <Link href={destination}>{children}</Link>;
  }

  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger
        delay={0}
        render={<Link href={destination} className="keyword-term" />}
      >
        {children}
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner
          align="start"
          className="keyword-panel-positioner"
          collisionBoundary={viewportBoundary()}
          positionMethod="fixed"
          side="bottom"
          sideOffset={6}
        >
          <PreviewCard.Popup className="keyword-panel">
            <span className="keyword-card">
              <Link
                href={destination}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${entry.title} in a new tab`}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "keyword-open",
                )}
              >
                <SquareArrowOutUpRight />
              </Link>
              <span className="keyword-kicker">{entry.topic}</span>
              <span className="keyword-title">{entry.title}</span>
              <span className="keyword-summary">{entry.summary}</span>
              <Link href={destination} className="keyword-more">
                Read the article
              </Link>
            </span>
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}

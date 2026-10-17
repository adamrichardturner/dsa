import Link from "next/link";
import type { ReactNode } from "react";
import { articleBySlug } from "@/lib/articles";
import { withLessonFrom } from "@/lib/lesson-return";

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

  const tipId = `keyword-${entry.slug}`;

  return (
    <span className="keyword-tip">
      <Link
        href={destination}
        className="keyword-term"
        aria-describedby={tipId}
      >
        {children}
      </Link>
      <span id={tipId} role="tooltip" className="keyword-panel">
        <span className="keyword-card">
          <span className="keyword-kicker">{entry.topic}</span>
          <span className="keyword-title">{entry.title}</span>
          <span className="keyword-summary">{entry.summary}</span>
          <Link href={destination} className="keyword-more">
            Read the article
          </Link>
        </span>
      </span>
    </span>
  );
}

"use client";

import type { ReactNode } from "react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { KeywordTooltip } from "@/components/keyword-tooltip";

function MarkdownAnchor({
  href,
  title,
  children,
}: {
  readonly href?: string;
  readonly title?: string;
  readonly children?: ReactNode;
  readonly node?: ExtraProps["node"];
}) {
  if (title === "article" && typeof href === "string") {
    return <KeywordTooltip href={href}>{children}</KeywordTooltip>;
  }
  if (typeof href !== "string") {
    return <span>{children}</span>;
  }
  return <a href={href}>{children}</a>;
}

export function LessonMarkdown({ content }: { readonly content: string }) {
  return (
    <div className="lesson-copy">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ a: MarkdownAnchor }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

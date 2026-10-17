"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LessonMarkdown({ content }: { readonly content: string }) {
  return (
    <div className="lesson-copy">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

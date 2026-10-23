"use client";

import { isValidElement, type ReactNode } from "react";
import ReactMarkdown, { type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeRunner } from "@/components/code-runner";
import { KeywordTooltip } from "@/components/keyword-tooltip";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { VisualizationFence } from "@/components/visualizations/visualization";

const nodeText = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (!Array.isArray(node)) {
    return "";
  }
  let text = "";
  for (const child of node) {
    text += nodeText(child);
  }
  return text;
};

const runnableLanguage = (language: string | null): boolean => {
  return language === "ts" || language === "typescript";
};

const languageOf = (className: string | undefined): string | null => {
  if (className === undefined) {
    return null;
  }
  const parts = className.split(" ");
  for (const part of parts) {
    if (part.startsWith("language-")) {
      return part.slice("language-".length);
    }
  }
  return null;
};

const onlyChild = (children: ReactNode): ReactNode | null => {
  const list = Array.isArray(children) ? children : [children];
  let found: ReactNode | null = null;
  for (const child of list) {
    if (typeof child === "string" && child.trim().length === 0) {
      continue;
    }
    if (found !== null) {
      return null;
    }
    found = child;
  }
  return found;
};

const codeClassName = (node: ReactNode): string | null => {
  if (!isValidElement(node) || node.type !== MarkdownCode) {
    return null;
  }
  const props: unknown = node.props;
  if (typeof props !== "object" || props === null || !("className" in props)) {
    return null;
  }
  if (typeof props.className !== "string") {
    return null;
  }
  return props.className;
};

function MarkdownAnchor({
  href,
  title,
  children,
  articleFrom,
}: {
  readonly href?: string;
  readonly title?: string;
  readonly children?: ReactNode;
  readonly articleFrom?: string;
  readonly node?: ExtraProps["node"];
}) {
  if (title === "article" && typeof href === "string") {
    return (
      <KeywordTooltip href={href} from={articleFrom}>
        {children}
      </KeywordTooltip>
    );
  }
  if (typeof href !== "string") {
    return <span>{children}</span>;
  }
  return <a href={href}>{children}</a>;
}

function MarkdownPre({ children }: { readonly children?: ReactNode }) {
  const only = onlyChild(children);
  const language = languageOf(codeClassName(only) ?? undefined);
  if (
    language === "mermaid" ||
    language === "visualization" ||
    runnableLanguage(language)
  ) {
    return only;
  }
  return <pre>{children}</pre>;
}

function MarkdownCode({
  className,
  children,
}: {
  readonly className?: string;
  readonly children?: ReactNode;
  readonly node?: ExtraProps["node"];
}) {
  const language = languageOf(className);
  if (runnableLanguage(language)) {
    return <CodeRunner code={nodeText(children).replace(/\n$/, "")} />;
  }
  if (language === "visualization") {
    return (
      <VisualizationFence source={nodeText(children).replace(/\n$/, "")} />
    );
  }
  if (language !== "mermaid") {
    return <code className={className}>{children}</code>;
  }
  const chart = nodeText(children).replace(/\n$/, "");
  return <MermaidDiagram chart={chart} />;
}

export function LessonMarkdown({
  content,
  articleFrom,
}: {
  readonly content: string;
  readonly articleFrom?: string;
}) {
  return (
    <div className="lesson-copy">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, title, children }) => (
            <MarkdownAnchor href={href} title={title} articleFrom={articleFrom}>
              {children}
            </MarkdownAnchor>
          ),
          pre: MarkdownPre,
          code: MarkdownCode,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

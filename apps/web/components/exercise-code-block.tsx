"use client";

import { cn } from "cn";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { useHighlightedCode } from "@/hooks/use-highlighted-code";

export type ExerciseCodeLanguage = "text" | "typescript";

export function ExerciseCodeBlock({
  title,
  value,
  language,
  wrap = false,
  size = "default",
  className,
}: {
  readonly title: string;
  readonly value: string;
  readonly language: ExerciseCodeLanguage;
  readonly wrap?: boolean;
  readonly size?: "default" | "sm";
  readonly className?: string;
}) {
  const lines = useHighlightedCode(value, language);

  return (
    <CodeBlock
      size={size}
      className={cn("bg-background", className)}
      aria-label={title}
    >
      <CodeBlockHeader>
        <CodeBlockTitle>{title}</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={value} />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent wrap={wrap}>
        {lines.map((line, index) => (
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  );
}

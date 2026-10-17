"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "cn";
import { Spinner } from "@/components/ui/spinner";
import type { RunLineKind, RunLineView } from "@/lib/types";

export type CodeTerminalState =
  | { readonly kind: "idle" }
  | { readonly kind: "running" }
  | { readonly kind: "failed"; readonly message: string }
  | { readonly kind: "ready"; readonly lines: readonly RunLineView[] };

const isRunLineKind = (kind: string): kind is Exclude<RunLineKind, "log"> => {
  return kind === "prompt" || kind === "result" || kind === "error";
};

export const readRunLines = (
  lines: readonly { readonly kind: string; readonly text: string }[],
): readonly RunLineView[] => {
  const next: RunLineView[] = [];
  for (const line of lines) {
    if (isRunLineKind(line.kind)) {
      next.push({ kind: line.kind, text: line.text });
      continue;
    }
    next.push({ kind: "log", text: line.text });
  }
  return next;
};

export function CodeTerminal({
  state,
  light,
  foreground,
  borderColor,
  idleMessage = "Press Run to execute your code.",
}: {
  readonly state: CodeTerminalState;
  readonly light: boolean;
  readonly foreground: string;
  readonly borderColor: string;
  readonly idleMessage?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const errorClass = light ? "text-red-700" : "text-red-300";

  useEffect(() => {
    const node = scroller.current;
    if (node === null) {
      return;
    }
    node.scrollTop = node.scrollHeight;
  }, [state]);

  return (
    <div
      className="flex h-40 shrink-0 flex-col border-t"
      style={{
        color: foreground,
        borderTopColor: borderColor,
        backgroundColor: light ? "rgba(0, 0, 0, 0.04)" : "rgba(0, 0, 0, 0.35)",
      }}
    >
      <div className="flex h-8 shrink-0 items-center px-4 text-[11px] tracking-wide uppercase opacity-60">
        Terminal
      </div>
      <div
        ref={scroller}
        className="min-h-0 flex-1 overflow-auto px-4 pb-3 font-mono text-xs leading-relaxed"
        role="log"
        aria-live="polite"
        aria-label="Terminal"
        aria-busy={state.kind === "running"}
      >
        <TerminalBody state={state} errorClass={errorClass} idleMessage={idleMessage} />
      </div>
    </div>
  );
}

function TerminalBody({
  state,
  errorClass,
  idleMessage,
}: {
  readonly state: CodeTerminalState;
  readonly errorClass: string;
  readonly idleMessage: string;
}) {
  if (state.kind === "idle") {
    return <p className="opacity-60">{idleMessage}</p>;
  }

  if (state.kind === "running") {
    return (
      <p className="flex items-center gap-2">
        <Spinner className="text-current" />
        Running…
      </p>
    );
  }

  if (state.kind === "failed") {
    return <p className={errorClass}>{state.message}</p>;
  }

  const rows: ReactNode[] = [];
  let prompts = 0;
  for (let index = 0; index < state.lines.length; index += 1) {
    const line = state.lines[index];
    if (line === undefined) {
      continue;
    }
    const promptGap = line.kind === "prompt" && prompts > 0;
    if (line.kind === "prompt") {
      prompts += 1;
    }
    rows.push(
      <TerminalLine key={index} line={line} promptGap={promptGap} errorClass={errorClass} />,
    );
  }
  return rows;
}

function TerminalLine({
  line,
  promptGap,
  errorClass,
}: {
  readonly line: RunLineView;
  readonly promptGap: boolean;
  readonly errorClass: string;
}) {
  if (line.kind === "prompt") {
    return (
      <p className={cn("opacity-60", promptGap && "terminal-gap mt-3")}>
        <span className="select-none">$ </span>
        {line.text}
      </p>
    );
  }

  if (line.kind === "error") {
    return <p className={cn("whitespace-pre-wrap", errorClass)}>{line.text}</p>;
  }

  return <p className="whitespace-pre-wrap">{line.text}</p>;
}

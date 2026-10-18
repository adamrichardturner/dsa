"use client";

import { useLayoutEffect, useRef, useState, type UIEvent } from "react";
import { useMutation } from "urql";
import { CodeRunner } from "@/components/code-runner";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { SKIP_LESSON } from "@/lib/operations";
import { referenceCode } from "@/lib/solutions/code";
import { solutionForProblem } from "@/lib/solutions/content";
import type { LessonSolution, SolutionBlock } from "@/lib/solutions/types";
import type { SkipResult } from "@/lib/types";

const submitButtonClass = "h-10 px-5";

const nearEnd = (node: HTMLElement): boolean =>
  node.clientHeight > 0 &&
  node.scrollHeight - node.scrollTop - node.clientHeight < 32;

const dialogShell = (scroller: HTMLElement | null): HTMLElement | true => {
  if (scroller === null) {
    return true;
  }
  const popup = scroller.closest("[data-slot='dialog-content']");
  if (!(popup instanceof HTMLElement)) {
    return true;
  }
  return popup;
};

function SolutionBody({
  solution,
  problemId,
}: {
  readonly solution: LessonSolution;
  readonly problemId: string;
}) {
  return (
    <div className="space-y-5">
      {solution.blocks.map((block, index) => (
        <SolutionPiece
          key={`${block.kind}-${index}`}
          problemId={problemId}
          block={block}
        />
      ))}
    </div>
  );
}

function SolutionPiece({
  problemId,
  block,
}: {
  readonly problemId: string;
  readonly block: SolutionBlock;
}) {
  if (block.kind === "heading") {
    return <h3 className="font-serif text-xl tracking-tight">{block.text}</h3>;
  }

  if (block.kind === "paragraph") {
    return <p className="text-sm leading-7 text-foreground/90">{block.text}</p>;
  }

  if (block.kind === "list") {
    return (
      <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-foreground/90">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.kind === "diagram") {
    return (
      <div className="overflow-x-auto rounded-lg border bg-background p-3">
        <MermaidDiagram chart={block.chart} />
      </div>
    );
  }

  const code = referenceCode[problemId];
  if (code === undefined) {
    return null;
  }
  return <CodeRunner code={code} />;
}

function SolutionPanel({
  slug,
  problemId,
  title,
  onClose,
  onSkipped,
}: {
  readonly slug: string;
  readonly problemId: string;
  readonly title: string;
  readonly onClose: () => void;
  readonly onSkipped: (result: SkipResult) => void;
}) {
  const solution = solutionForProblem(slug, problemId);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [reached, setReached] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipState, skipLesson] = useMutation<{ skipLesson: SkipResult }>(
    SKIP_LESSON,
  );

  useLayoutEffect(() => {
    const node = scrollerRef.current;
    if (node === null) {
      return;
    }
    node.scrollTop = 0;
    if (nearEnd(node)) {
      setReached(true);
    }
  }, []);

  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (reached) {
      return;
    }
    if (nearEnd(event.currentTarget)) {
      setReached(true);
    }
  };

  const revealActions = (node: HTMLDivElement | null) => {
    const scroller = scrollerRef.current;
    if (node === null || scroller === null || scroller.scrollTop === 0) {
      return;
    }
    node.scrollIntoView({ block: "end" });
  };

  const onSkip = async () => {
    setError(null);
    const response = await skipLesson({ slug });
    const result = response.data?.skipLesson;
    if (result === undefined) {
      setError(
        graphqlErrorMessage(response.error, "Could not skip that lesson."),
      );
      return;
    }
    onSkipped(result);
  };

  return (
    <DialogContent
      initialFocus={() => dialogShell(scrollerRef.current)}
      className="h-[min(85vh,880px)] max-h-[min(85vh,880px)] gap-0 overflow-hidden p-0 sm:max-w-3xl"
    >
      <div className="space-y-1 border-b px-6 py-5">
        <DialogTitle>Solution explanation</DialogTitle>
        <DialogDescription>{title}</DialogDescription>
      </div>
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-y-auto px-6 py-6"
        onScroll={onScroll}
      >
        {solution === null ? (
          <p className="text-sm leading-7">
            This lesson does not have a written explanation yet.
          </p>
        ) : (
          <SolutionBody solution={solution} problemId={problemId} />
        )}
        <div className="h-6" />
        {reached ? (
          <div
            ref={revealActions}
            className="animate-in fade-in-0 slide-in-from-bottom-2 space-y-4 duration-300"
          >
            <p className="text-sm leading-7 text-muted-foreground">
              Close keeps this lesson open so you can keep trying. Skip lesson
              records a skip. It is not a pass, and it does not earn points. The
              next lesson opens, and you can come back to finish this one.
            </p>
            {error !== null ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className={submitButtonClass}
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                type="button"
                size="lg"
                className={submitButtonClass}
                disabled={skipState.fetching}
                onClick={() => {
                  void onSkip();
                }}
              >
                {skipState.fetching ? (
                  <Spinner data-icon="inline-start" />
                ) : null}
                Skip lesson
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Scroll through the explanation to close it or skip the lesson.
          </p>
        )}
      </div>
    </DialogContent>
  );
}

export function SolutionDialog({
  slug,
  problemId,
  title,
  open,
  onOpenChange,
  onSkipped,
}: {
  readonly slug: string;
  readonly problemId: string;
  readonly title: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSkipped: (result: SkipResult) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SolutionPanel
          slug={slug}
          problemId={problemId}
          title={title}
          onClose={() => {
            onOpenChange(false);
          }}
          onSkipped={onSkipped}
        />
      ) : null}
    </Dialog>
  );
}

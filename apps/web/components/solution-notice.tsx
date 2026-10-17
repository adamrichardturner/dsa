"use client";

import type { ReactNode } from "react";
import { Stars } from "@/components/stars";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { SubmissionView, TestResultView } from "@/lib/types";

export type SolutionNoticeState =
  | { readonly kind: "checking" }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "result"; readonly outcome: SubmissionView };

const capitalize = (value: string): string => {
  if (value.length === 0) {
    return value;
  }
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
};

const failureText = (test: TestResultView): string => {
  const pieces: string[] = [];
  if (test.error !== null && test.error.length > 0) {
    pieces.push(test.error);
  }
  if (test.expected.length > 0) {
    pieces.push(`Expected ${test.expected}`);
  }
  if (test.received.length > 0) {
    pieces.push(`Received ${test.received}`);
  }
  return pieces.join(" · ");
};

const collectHints = (results: readonly TestResultView[]): readonly string[] => {
  const failures: { readonly name: string; readonly detail: string }[] = [];
  for (const test of results) {
    if (test.passed) {
      continue;
    }
    failures.push({ name: capitalize(test.name), detail: failureText(test) });
  }

  const first = failures[0];
  if (first === undefined) {
    return [];
  }

  let same = true;
  for (const failure of failures) {
    if (failure.detail !== first.detail) {
      same = false;
    }
  }

  if (same && first.detail.length > 0) {
    return [first.detail];
  }

  const hints: string[] = [];
  for (const failure of failures) {
    if (failure.detail.length === 0) {
      hints.push(failure.name);
      continue;
    }
    hints.push(`${failure.name}: ${failure.detail}`);
  }
  return hints;
};

export function SolutionNotice({
  notice,
  onDismiss,
}: {
  readonly notice: SolutionNoticeState;
  readonly onDismiss: () => void;
}) {
  if (notice.kind === "checking") {
    return (
      <NoticeFrame>
        <Bubble variant="default" align="end" className="w-full max-w-none">
          <BubbleContent className="flex w-full items-center gap-2">
            <Spinner className="text-current" />
            <span>Checking your solution…</span>
          </BubbleContent>
        </Bubble>
      </NoticeFrame>
    );
  }

  if (notice.kind === "error") {
    return (
      <NoticeFrame>
        <Bubble variant="destructive" align="end" className="w-full max-w-none">
          <BubbleContent className="w-full space-y-3">
            <p className="font-medium">Could not check that</p>
            <p>{notice.message}</p>
            <Dismiss onDismiss={onDismiss} />
          </BubbleContent>
        </Bubble>
      </NoticeFrame>
    );
  }

  const outcome = notice.outcome;
  if (outcome.passed) {
    return (
      <NoticeFrame>
        <Bubble variant="default" align="end" className="w-full max-w-none">
          <BubbleContent className="w-full space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">Correct</p>
                <p className="mt-1 opacity-80">{outcome.feedback}</p>
              </div>
              <Stars value={outcome.stars} />
            </div>
            <Dismiss onDismiss={onDismiss} />
          </BubbleContent>
        </Bubble>
      </NoticeFrame>
    );
  }

  const hints = collectHints(outcome.results);

  return (
    <NoticeFrame>
      <Bubble variant="destructive" align="end" className="w-full max-w-none">
        <BubbleContent className="w-full space-y-3">
          <div>
            <p className="font-medium">Not quite</p>
            <p className="mt-1">{outcome.feedback}</p>
          </div>
          {hints.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-wide uppercase opacity-80">Hints</p>
              <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                {hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <Dismiss onDismiss={onDismiss} />
        </BubbleContent>
      </Bubble>
    </NoticeFrame>
  );
}

function NoticeFrame({ children }: { readonly children: ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-16 z-20 flex justify-end">
      <div
        className="pointer-events-auto w-full max-w-sm animate-in fade-in-0 slide-in-from-bottom-3 shadow-xl duration-200"
        role="status"
        aria-live="polite"
      >
        {children}
      </div>
    </div>
  );
}

function Dismiss({ onDismiss }: { readonly onDismiss: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-current hover:bg-current/10 hover:text-current"
      onClick={onDismiss}
    >
      Dismiss
    </Button>
  );
}

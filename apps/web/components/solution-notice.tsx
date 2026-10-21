"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CircleAlert } from "lucide-react";
import { CompletionTick } from "@/components/completion-tick";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { PassCompletion } from "@/lib/exercise-order";
import type { SubmissionView, TestResultView } from "@/lib/types";

export interface SolutionContinuation {
  readonly completion: PassCompletion;
  readonly lessonTitle: string;
  readonly nextExerciseHref: string | null;
  readonly nextLessonHref: string | null;
}

export type SolutionNoticeState =
  | { readonly kind: "checking" }
  | { readonly kind: "error"; readonly message: string }
  | {
      readonly kind: "result";
      readonly outcome: SubmissionView;
      readonly continuation: SolutionContinuation | null;
    };

interface FailureCase {
  readonly id: string;
  readonly name: string;
  readonly input: string;
  readonly expected: string;
  readonly received: string;
  readonly error: string | null;
}

const capitalize = (value: string): string => {
  if (value.length === 0) {
    return value;
  }
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
};

const resultLine = (
  item: FailureCase,
): { readonly label: string; readonly value: string } => {
  if (item.received.length > 0) {
    return { label: "Received", value: item.received };
  }
  if (item.error !== null && item.error.length > 0) {
    return { label: "Error", value: item.error };
  }
  return { label: "Received", value: "—" };
};

const collectFailures = (
  results: readonly TestResultView[],
): readonly FailureCase[] => {
  const failures: FailureCase[] = [];
  for (let index = 0; index < results.length; index += 1) {
    const test = results[index];
    if (test === undefined || test.passed) {
      continue;
    }
    failures.push({
      id: `${test.name}-${index}`,
      name: capitalize(test.name),
      input: test.input,
      expected: test.expected,
      received: test.received,
      error: test.error,
    });
  }
  return failures;
};

const noticeKey = (notice: SolutionNoticeState): string => {
  if (notice.kind === "result") {
    return notice.outcome.id;
  }
  if (notice.kind === "error") {
    return `error:${notice.message}`;
  }
  return "checking";
};

const exerciseCopy = (hasNextExercise: boolean): string => {
  if (hasNextExercise) {
    return "This exercise is done.";
  }
  return "This exercise is done. Other exercises in this lesson are still open.";
};

const lessonCopy = (lessonTitle: string): string => {
  const title = lessonTitle.trim();
  if (title.length === 0) {
    return "Every exercise in this lesson is done.";
  }
  return `Every exercise in ${title} is done.`;
};

export function SolutionNotice({
  notice,
  onDismiss,
  onNavigate,
}: {
  readonly notice: SolutionNoticeState | null;
  readonly onDismiss: () => void;
  readonly onNavigate: (href: string) => void;
}) {
  const reduceMotion = useReducedMotion() === true;

  return (
    <AnimatePresence>
      {notice === null ? null : (
        <motion.div
          key={noticeKey(notice)}
          className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex justify-end"
          role="status"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 32, mass: 0.8 }
          }
        >
          <div className="pointer-events-auto w-full max-w-md">
            <NoticeBody
              notice={notice}
              onDismiss={onDismiss}
              onNavigate={onNavigate}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NoticeBody({
  notice,
  onDismiss,
  onNavigate,
}: {
  readonly notice: SolutionNoticeState;
  readonly onDismiss: () => void;
  readonly onNavigate: (href: string) => void;
}) {
  if (notice.kind === "checking") {
    return (
      <Bubble variant="default" align="end" className="w-full max-w-none">
        <BubbleContent className="flex w-full items-center gap-2">
          <Spinner className="text-current" />
          <span>Checking your solution…</span>
        </BubbleContent>
      </Bubble>
    );
  }

  if (notice.kind === "error") {
    return (
      <FailurePanel
        title="Could not check that"
        message={notice.message}
        cases={[]}
        onDismiss={onDismiss}
      />
    );
  }

  const outcome = notice.outcome;
  if (!outcome.passed) {
    return (
      <FailurePanel
        title="Not quite"
        message={outcome.feedback}
        cases={collectFailures(outcome.results)}
        onDismiss={onDismiss}
      />
    );
  }

  const continuation = notice.continuation;
  if (continuation === null || continuation.completion === "exercise") {
    return (
      <ExerciseCompletePanel
        message={exerciseCopy(
          (continuation?.nextExerciseHref ?? null) !== null,
        )}
        feedback={outcome.feedback}
        nextExerciseHref={continuation?.nextExerciseHref ?? null}
        onDismiss={onDismiss}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <LessonCompletePanel
      message={lessonCopy(continuation.lessonTitle)}
      feedback={outcome.feedback}
      nextLessonHref={continuation.nextLessonHref}
      onDismiss={onDismiss}
      onNavigate={onNavigate}
    />
  );
}

function ExerciseCompletePanel({
  message,
  feedback,
  nextExerciseHref,
  onDismiss,
  onNavigate,
}: {
  readonly message: string;
  readonly feedback: string;
  readonly nextExerciseHref: string | null;
  readonly onDismiss: () => void;
  readonly onNavigate: (href: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xl ring-1 ring-emerald-500/30">
      <div className="flex gap-3 px-4 py-3">
        <CompletionTick
          animate
          label="Exercise complete"
          className="mt-0.5 size-6"
        />
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">Exercise complete</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {feedback}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
        <Dismiss onDismiss={onDismiss} tone="on-card" />
        {nextExerciseHref === null ? null : (
          <Button
            type="button"
            size="sm"
            className="h-7 px-2.5"
            onClick={() => {
              onNavigate(nextExerciseHref);
            }}
          >
            Next exercise
            <ArrowRight data-icon="inline-end" />
          </Button>
        )}
      </div>
    </div>
  );
}

function LessonCompletePanel({
  message,
  feedback,
  nextLessonHref,
  onDismiss,
  onNavigate,
}: {
  readonly message: string;
  readonly feedback: string;
  readonly nextLessonHref: string | null;
  readonly onDismiss: () => void;
  readonly onNavigate: (href: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xl ring-1 ring-emerald-500/50">
      <div className="flex flex-col items-center gap-3 bg-emerald-500/10 px-5 pt-5 pb-4 text-center">
        <CompletionTick animate label="Lesson complete" className="size-10" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">Lesson complete</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {feedback}
          </p>
        </div>
      </div>
      <div className="space-y-2 border-t border-border px-4 py-3">
        <LessonNext href={nextLessonHref} onNavigate={onNavigate} />
        <div className="flex justify-end">
          <Dismiss onDismiss={onDismiss} tone="on-card" />
        </div>
      </div>
    </div>
  );
}

function LessonNext({
  href,
  onNavigate,
}: {
  readonly href: string | null;
  readonly onNavigate: (href: string) => void;
}) {
  if (href === null) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        This is the last lesson.
      </p>
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      className="h-10 w-full"
      onClick={() => {
        onNavigate(href);
      }}
    >
      Next lesson
      <ArrowRight data-icon="inline-end" />
    </Button>
  );
}

function FailurePanel({
  title,
  message,
  cases,
  onDismiss,
}: {
  readonly title: string;
  readonly message: string;
  readonly cases: readonly FailureCase[];
  readonly onDismiss: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xl ring-1 ring-foreground/10">
      <div className="flex gap-3 px-4 py-3">
        <CircleAlert
          className="mt-0.5 size-4 shrink-0 text-destructive"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {message}
          </p>
        </div>
      </div>
      {cases.length > 0 ? (
        <div className="space-y-2 border-t border-border px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Failed cases
          </p>
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {cases.map((item) => {
              const result = resultLine(item);
              return (
                <li key={item.id} className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <dl className="mt-1 grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-2 gap-y-0.5 font-mono text-xs leading-relaxed">
                    <dt className="text-muted-foreground">Input</dt>
                    <dd className="min-w-0 break-all text-foreground">
                      {item.input}
                    </dd>
                    <dt className="text-muted-foreground">Expected</dt>
                    <dd className="min-w-0 break-all text-foreground">
                      {item.expected}
                    </dd>
                    <dt className="text-muted-foreground">{result.label}</dt>
                    <dd className="min-w-0 break-all text-foreground">
                      {result.value}
                    </dd>
                  </dl>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <div className="flex justify-end border-t border-border px-3 py-2">
        <Dismiss onDismiss={onDismiss} tone="on-card" />
      </div>
    </div>
  );
}

function Dismiss({
  onDismiss,
  tone,
}: {
  readonly onDismiss: () => void;
  readonly tone: "on-primary" | "on-card";
}) {
  if (tone === "on-card") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 px-2"
        onClick={onDismiss}
      >
        Dismiss
      </Button>
    );
  }

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

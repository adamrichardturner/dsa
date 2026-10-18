"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useQuery } from "urql";
import { PageSpinner } from "@/components/page-spinner";
import { CompletionTick } from "@/components/completion-tick";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useRequireUser } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { MODULES_QUERY } from "@/lib/operations";
import type { LessonSummary, ModuleView } from "@/lib/types";

const countCompleted = (lessons: readonly LessonSummary[]): number => {
  let count = 0;
  for (const lesson of lessons) {
    if (lesson.completed) {
      count += 1;
    }
  }
  return count;
};

function LockedLesson({
  lesson,
  number,
}: {
  readonly lesson: LessonSummary;
  readonly number: string;
}) {
  return (
    <li
      aria-disabled="true"
      className="flex items-start gap-3 rounded-xl border border-dashed border-muted-foreground/40 bg-muted px-4 py-4 text-muted-foreground opacity-55 saturate-50"
    >
      <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs tracking-wide">
          {number} · Locked · {lesson.estimatedMinutes} min
        </p>
        <p className="mt-1 font-medium">{lesson.title}</p>
        <p className="mt-1 text-sm leading-relaxed">{lesson.summary}</p>
        <p className="mt-2 text-xs">
          Finish the previous lesson to open this one.
        </p>
      </div>
    </li>
  );
}

function OpenLesson({
  lesson,
  number,
}: {
  readonly lesson: LessonSummary;
  readonly number: string;
}) {
  if (lesson.completed) {
    return (
      <li>
        <Link
          href={`/course/${lesson.slug}`}
          className="flex items-start gap-3 rounded-xl bg-card px-4 py-4 ring-1 ring-emerald-600/40 transition-colors hover:bg-emerald-500/5"
        >
          <CompletionTick
            label={`${lesson.title} complete`}
            className="mt-0.5"
          />
          <div className="min-w-0">
            <p className="text-xs tracking-wide text-emerald-700 dark:text-emerald-400">
              {number} · Complete · {lesson.estimatedMinutes} min
            </p>
            <p className="mt-1 font-medium">{lesson.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {lesson.summary}
            </p>
          </div>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={`/course/${lesson.slug}`}
        className="flex items-start gap-3 rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/15 transition-colors hover:bg-muted/60"
      >
        <span
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-foreground/70"
        />
        <div className="min-w-0">
          <p className="text-xs tracking-wide text-foreground/80">
            {number} · Ready · {lesson.estimatedMinutes} min
          </p>
          <p className="mt-1 font-medium">{lesson.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {lesson.summary}
          </p>
        </div>
      </Link>
    </li>
  );
}

function LessonRow({
  lesson,
  index,
}: {
  readonly lesson: LessonSummary;
  readonly index: number;
}) {
  const number = String(index + 1).padStart(2, "0");
  if (!lesson.available) {
    return <LockedLesson lesson={lesson} number={number} />;
  }
  return <OpenLesson lesson={lesson} number={number} />;
}

function WeekSection({ module }: { readonly module: ModuleView }) {
  const done = countCompleted(module.lessons);

  return (
    <section className="space-y-4" aria-labelledby={`week-${module.id}`}>
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs tracking-wide text-muted-foreground uppercase">
            Week {module.weekNumber}
          </p>
          <h2
            id={`week-${module.id}`}
            className="font-serif text-2xl tracking-tight"
          >
            {module.title}
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">
            {module.summary}
          </p>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground">
          {done} / {module.lessons.length}
        </p>
      </div>
      <ol className="space-y-2">
        {module.lessons.map((lesson, index) => (
          <LessonRow key={lesson.id} lesson={lesson} index={index} />
        ))}
      </ol>
    </section>
  );
}

export default function CoursePage() {
  const auth = useRequireUser();
  const [result] = useQuery<{ modules: ModuleView[] }>({
    query: MODULES_QUERY,
    pause: auth.user === null,
    requestPolicy: "cache-and-network",
  });

  if (auth.user === null) {
    return <PageSpinner />;
  }

  if (result.error !== undefined) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Alert variant="destructive">
          <AlertDescription>
            {graphqlErrorMessage(result.error, "Could not load the course.")}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  if (result.data === undefined) {
    return <PageSpinner />;
  }

  const modules = result.data.modules ?? [];

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <div className="space-y-3">
        <Badge variant="secondary">The path</Badge>
        <h1 className="font-serif text-4xl tracking-tight">
          Four weeks, one desk.
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Work in order. A dashed grey row is locked until the lesson before it
          passes. An open row is ready. A green tick stays once it does.
        </p>
      </div>
      {modules.map((module) => (
        <WeekSection key={module.id} module={module} />
      ))}
    </main>
  );
}

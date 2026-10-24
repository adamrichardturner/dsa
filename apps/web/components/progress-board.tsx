"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";
import { CompletionTick } from "@/components/completion-tick";
import { PageMain } from "@/components/page-frame";
import { ProgressCharts } from "@/components/progress-charts";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AnalyticsView, LessonStat } from "@/lib/types";

interface WeekGroup {
  readonly weekNumber: number;
  readonly moduleTitle: string;
  readonly lessons: LessonStat[];
}

const share = (part: number, total: number): number => {
  if (total === 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
};

const kindLabel = (kind: string): string => {
  switch (kind) {
    case "start": {
      return "Start here";
    }
    case "stuck": {
      return "Needs a pass";
    }
    case "skipped": {
      return "Skipped";
    }
    case "continue": {
      return "Up next";
    }
    default: {
      return kind;
    }
  }
};

const weeksOf = (lessons: readonly LessonStat[]): WeekGroup[] => {
  const weeks: WeekGroup[] = [];
  for (const lesson of lessons) {
    const current = weeks[weeks.length - 1];
    if (current === undefined || current.weekNumber !== lesson.weekNumber) {
      weeks.push({
        weekNumber: lesson.weekNumber,
        moduleTitle: lesson.moduleTitle,
        lessons: [lesson],
      });
      continue;
    }
    current.lessons.push(lesson);
  }
  return weeks;
};

const lessonsSolved = (lessons: readonly LessonStat[]): number => {
  let solved = 0;
  for (const lesson of lessons) {
    if (lesson.total > 0 && lesson.solved === lesson.total) {
      solved += 1;
    }
  }
  return solved;
};

const quietCopy = (analytics: AnalyticsView): string => {
  if (
    analytics.problemsTotal > 0 &&
    analytics.problemsSolved === analytics.problemsTotal
  ) {
    return "Every exercise has a pass.";
  }
  return "Nothing standing out. The next lesson on the course page is the useful one.";
};

function Stat({
  label,
  value,
  detail,
  percent,
}: {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly percent: number;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-serif text-3xl">{value}</CardTitle>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardHeader>
      <CardContent>
        <Progress value={percent} />
      </CardContent>
    </Card>
  );
}

function Improvements({ analytics }: { readonly analytics: AnalyticsView }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Where the next hour goes</CardDescription>
        <CardTitle>Areas to improve</CardTitle>
      </CardHeader>
      <CardContent>
        {analytics.improvements.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {quietCopy(analytics)}
          </p>
        ) : (
          <ul className="space-y-2">
            {analytics.improvements.map((item) => (
              <li key={`${item.kind}-${item.href}`}>
                <Link
                  href={item.href}
                  className="group flex items-start justify-between gap-4 rounded-lg px-3 py-3 ring-1 ring-foreground/10 transition-colors hover:bg-muted/60"
                >
                  <span className="space-y-1.5">
                    <Badge variant="outline">{kindLabel(item.kind)}</Badge>
                    <span className="block font-medium">{item.title}</span>
                    <span className="block text-sm leading-relaxed text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Lessons({ lessons }: { readonly lessons: readonly LessonStat[] }) {
  const weeks = weeksOf(lessons);
  if (weeks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl tracking-tight">Lessons</h2>
        <p className="text-sm text-muted-foreground">
          Every lesson, in the order of the course.
        </p>
      </div>
      <div className="grid gap-4">
        {weeks.map((week) => {
          const solved = lessonsSolved(week.lessons);
          const complete =
            solved === week.lessons.length && week.lessons.length > 0;
          return (
            <Card key={week.weekNumber}>
              <CardHeader>
                <CardDescription>
                  Week {week.weekNumber}
                  <span className="text-muted-foreground">
                    {" "}
                    · {solved}/{week.lessons.length}
                  </span>
                </CardDescription>
                <CardTitle className="flex items-center gap-2">
                  {complete ? (
                    <CompletionTick label={`${week.moduleTitle} complete`} />
                  ) : null}
                  {week.moduleTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {week.lessons.map((lesson) => {
                  const done =
                    lesson.total > 0 && lesson.solved === lesson.total;
                  return (
                    <div key={lesson.slug} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <Link
                          href={`/course/${lesson.slug}`}
                          className="flex min-w-0 items-center gap-2 underline-offset-4 hover:underline"
                        >
                          {done ? (
                            <CompletionTick
                              label={`${lesson.title} complete`}
                              className="size-4"
                            />
                          ) : null}
                          <span className="truncate">{lesson.title}</span>
                        </Link>
                        <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
                          {lesson.skipped ? (
                            <Badge variant="outline">Skipped</Badge>
                          ) : null}
                          <span className="tabular-nums">
                            {lesson.solved}/{lesson.total}
                          </span>
                        </span>
                      </div>
                      <Progress value={share(lesson.solved, lesson.total)} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function ProgressBoard({
  analytics,
}: {
  readonly analytics: AnalyticsView;
}) {
  const lessonPercent = share(
    analytics.lessonsCompleted,
    analytics.lessonsTotal,
  );
  const problemPercent = share(
    analytics.problemsSolved,
    analytics.problemsTotal,
  );
  const passPercent = Math.round(analytics.passRate * 100);
  const submissions =
    analytics.attempts === 1
      ? "1 submission"
      : `${analytics.attempts} submissions`;

  return (
    <PageMain className="space-y-8 py-12">
      <div className="space-y-3">
        <Badge variant="secondary">Progress</Badge>
        <h1 className="font-serif text-4xl tracking-tight">
          How the work is going.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {analytics.summary}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat
          label="Lessons"
          value={`${analytics.lessonsCompleted}/${analytics.lessonsTotal}`}
          detail={`${lessonPercent}% of the course`}
          percent={lessonPercent}
        />
        <Stat
          label="Exercises"
          value={`${analytics.problemsSolved}/${analytics.problemsTotal}`}
          detail={`${problemPercent}% passed`}
          percent={problemPercent}
        />
        <Stat
          label="Pass rate"
          value={`${passPercent}%`}
          detail={submissions}
          percent={passPercent}
        />
      </section>

      <Improvements analytics={analytics} />
      <ProgressCharts analytics={analytics} />
      <Lessons lessons={analytics.lessons} />

      <Link
        href="/course"
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Back to the course
      </Link>
    </PageMain>
  );
}

"use client";

import Link from "next/link";
import { useQuery } from "urql";
import { cn } from "cn";
import { PageSpinner } from "@/components/page-spinner";
import { CompletionTick } from "@/components/completion-tick";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRequireUser } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { ANALYTICS_QUERY } from "@/lib/operations";
import type { AnalyticsView } from "@/lib/types";

export default function ProgressPage() {
  const auth = useRequireUser();
  const [result] = useQuery<{ analytics: AnalyticsView }>({
    query: ANALYTICS_QUERY,
    pause: auth.user === null,
  });

  if (auth.user === null || (result.fetching && result.data === undefined)) {
    return <PageSpinner />;
  }

  if (result.error !== undefined || result.data === undefined) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Alert variant="destructive">
          <AlertDescription>
            {graphqlErrorMessage(result.error, "Could not load progress.")}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const analytics = result.data.analytics;
  const lessonPercent =
    analytics.lessonsTotal === 0
      ? 0
      : Math.round((analytics.lessonsCompleted / analytics.lessonsTotal) * 100);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div className="space-y-3">
        <Badge variant="secondary">Progress</Badge>
        <h1 className="font-serif text-4xl tracking-tight">How the work is going.</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{analytics.summary}</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Lessons</CardDescription>
            <CardTitle className="font-serif text-3xl">
              {analytics.lessonsCompleted}
              <span className="text-muted-foreground">/{analytics.lessonsTotal}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={lessonPercent} />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Pass rate</CardDescription>
            <CardTitle className="font-serif text-3xl">{Math.round(analytics.passRate * 100)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {analytics.attempts} {analytics.attempts === 1 ? "submission" : "submissions"}
            </p>
          </CardContent>
        </Card>
      </section>

      {analytics.lessonsSkipped > 0 ? (
        <Card>
          <CardHeader>
            <CardDescription>Skipped</CardDescription>
            <CardTitle>
              {analytics.lessonsSkipped}{" "}
              {analytics.lessonsSkipped === 1 ? "lesson" : "lessons"} with no points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              A skipped lesson is not a pass. Come back and submit a solution when you want the
              points.
            </p>
            <ul className="space-y-2">
              {analytics.skippedLessons.map((lesson) => (
                <li key={lesson.slug}>
                  <Link href={`/course/${lesson.slug}`} className="text-sm underline-offset-4 hover:underline">
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {analytics.focusAreas.length > 0 ? (
        <Card>
          <CardHeader>
            <CardDescription>Work on next</CardDescription>
            <CardTitle>Topics that still need a pass</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {analytics.focusAreas.map((area) => (
              <Badge key={area} variant="outline">
                {area}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <h2 className="font-serif text-2xl">By topic</h2>
        <ul className="space-y-4">
          {analytics.topics.map((topic) => {
            const percent = topic.total === 0 ? 0 : Math.round((topic.solved / topic.total) * 100);
            return (
              <li key={topic.topic} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    {topic.solved === topic.total && topic.total > 0 ? (
                      <CompletionTick label={`${topic.topic} complete`} className="size-4" />
                    ) : null}
                    {topic.topic}
                  </span>
                  <span className="text-muted-foreground">
                    {topic.solved}/{topic.total}
                  </span>
                </div>
                <Progress value={percent} />
              </li>
            );
          })}
        </ul>
      </section>

      <Link href="/course" className={cn(buttonVariants({ variant: "outline" }))}>
        Back to the course
      </Link>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useQuery } from "urql";
import { cn } from "cn";
import { PageSkeleton } from "@/components/page-skeleton";
import { Stars } from "@/components/stars";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRequireUser } from "@/lib/auth";
import { ANALYTICS_QUERY } from "@/lib/operations";
import type { AnalyticsView } from "@/lib/types";

export default function ProgressPage() {
  const auth = useRequireUser();
  const [result] = useQuery<{ analytics: AnalyticsView }>({
    query: ANALYTICS_QUERY,
    pause: auth.user === null,
  });

  if (auth.user === null || result.fetching) {
    return <PageSkeleton />;
  }

  if (result.error !== undefined || result.data === undefined) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Alert variant="destructive">
          <AlertDescription>{result.error?.message ?? "Could not load progress."}</AlertDescription>
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

      <section className="grid gap-4 sm:grid-cols-3">
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
            <CardDescription>Stars</CardDescription>
            <CardTitle className="font-serif text-3xl">
              {analytics.stars}
              <span className="text-muted-foreground">/{analytics.maxStars}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Stars
              value={
                analytics.maxStars === 0
                  ? 0
                  : Math.round((analytics.stars / analytics.maxStars) * 3)
              }
            />
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
                <div className="flex items-baseline justify-between text-sm">
                  <span>{topic.topic}</span>
                  <span className="text-muted-foreground">
                    {topic.stars}/{topic.maxStars} stars
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

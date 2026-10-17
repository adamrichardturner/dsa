"use client";

import Link from "next/link";
import { useQuery } from "urql";
import { PageSkeleton } from "@/components/page-skeleton";
import { Stars } from "@/components/stars";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRequireUser } from "@/lib/auth";
import { MODULES_QUERY } from "@/lib/operations";
import type { ModuleView } from "@/lib/types";

export default function CoursePage() {
  const auth = useRequireUser();
  const [result] = useQuery<{ modules: ModuleView[] }>({
    query: MODULES_QUERY,
    pause: auth.user === null,
    requestPolicy: "cache-and-network",
  });

  if (auth.user === null || result.fetching) {
    return <PageSkeleton />;
  }

  if (result.error !== undefined) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Alert variant="destructive">
          <AlertDescription>{result.error.message}</AlertDescription>
        </Alert>
      </main>
    );
  }

  const modules = result.data?.modules ?? [];

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div className="space-y-3">
        <Badge variant="secondary">The path</Badge>
        <h1 className="font-serif text-4xl tracking-tight">Four weeks, one desk.</h1>
        <p className="max-w-xl text-muted-foreground">
          Work in order. The next lesson opens when this one passes. Stars reward a solution that
          lands early.
        </p>
      </div>
      {modules.map((module) => (
        <section key={module.id} className="space-y-3">
          <div>
            <h2 className="font-serif text-2xl">
              Week {module.weekNumber}
              <span className="text-muted-foreground"> · {module.title}</span>
            </h2>
            <p className="text-sm text-muted-foreground">{module.summary}</p>
          </div>
          <Card>
            <CardContent className="divide-y px-0">
              {module.lessons.map((lesson, index) => {
                const label = `${String(index + 1).padStart(2, "0")}${lesson.completed ? " · Done" : ""}${lesson.available ? "" : " · Locked"} · ${lesson.estimatedMinutes} min`;
                const stars = (
                  <Stars
                    value={
                      lesson.maxStars === 0 ? 0 : Math.round((lesson.stars / lesson.maxStars) * 3)
                    }
                  />
                );
                if (!lesson.available) {
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-muted-foreground"
                      aria-disabled="true"
                    >
                      <div>
                        <p className="text-xs">{label}</p>
                        <p className="mt-1 font-medium">{lesson.title}</p>
                      </div>
                      {stars}
                    </div>
                  );
                }
                return (
                  <Link
                    key={lesson.id}
                    href={`/course/${lesson.slug}`}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/60"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="mt-1 font-medium">{lesson.title}</p>
                    </div>
                    {stars}
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>
      ))}
    </main>
  );
}

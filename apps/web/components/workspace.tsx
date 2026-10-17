"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "urql";
import { cn } from "cn";
import { CodeEditor } from "@/components/editor";
import { EditorThemeSelect, useEditorTheme } from "@/components/editor-theme-select";
import { LessonMarkdown } from "@/components/markdown";
import { PageSkeleton } from "@/components/page-skeleton";
import { Stars } from "@/components/stars";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SplitToggle, useSplitOrientation } from "@/components/split-toggle";
import { getEditorTheme } from "@/lib/editor-themes";
import { useRequireUser } from "@/lib/auth";
import { LESSON_QUERY, SUBMIT_SOLUTION } from "@/lib/operations";
import type { LessonView, SubmissionView } from "@/lib/types";

const capitalize = (value: string): string => {
  if (value.length === 0) {
    return value;
  }
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
};

export function Workspace({ slug }: { readonly slug: string }) {
  const auth = useRequireUser();
  const [result, reexecute] = useQuery<{ lesson: LessonView | null }>({
    query: LESSON_QUERY,
    variables: { slug },
    pause: auth.user === null || slug.length === 0,
  });
  const [submitState, submit] = useMutation<{ submitSolution: SubmissionView }>(SUBMIT_SOLUTION);
  const lesson = result.data?.lesson ?? null;
  const problem = lesson?.problems[0];
  const [code, setCode] = useState("");
  const [outcome, setOutcome] = useState<SubmissionView | null>(null);
  const [orientation, setOrientation] = useSplitOrientation();
  const [themeId, setThemeId] = useEditorTheme();
  const loadedProblemId = useRef<string | null>(null);

  useEffect(() => {
    if (problem === undefined) {
      return;
    }
    if (loadedProblemId.current === problem.id) {
      return;
    }
    loadedProblemId.current = problem.id;
    setCode(problem.latestCode ?? problem.starterCode);
    setOutcome(null);
  }, [problem]);

  if (auth.user === null || result.fetching) {
    return <PageSkeleton />;
  }

  if (result.error !== undefined) {
    return (
      <div className="space-y-4 p-6">
        <Alert>
          <AlertDescription>{result.error.message}</AlertDescription>
        </Alert>
        <Link href="/course" className={cn(buttonVariants({ variant: "outline", size: "lg", className: "h-10 px-4" }))}>
          Back to the course
        </Link>
      </div>
    );
  }

  if (lesson === null || problem === undefined) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>That lesson is not on the path.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const onSubmit = async () => {
    const response = await submit({ problemId: problem.id, code });
    const next = response.data?.submitSolution;
    if (next === undefined) {
      return;
    }
    setOutcome(next);
    reexecute({ requestPolicy: "network-only" });
  };

  const stars = outcome?.passed ? outcome.stars : problem.bestStars;
  const stacked = orientation === "horizontal";
  const theme = getEditorTheme(themeId);
  const chrome = theme.light
    ? {
        reset: "text-zinc-700 hover:bg-black/5 hover:text-zinc-950",
        submit: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800",
        rule: "rgba(0, 0, 0, 0.12)",
      }
    : {
        reset: "text-zinc-300 hover:bg-white/10 hover:text-white",
        submit: "bg-zinc-100 text-zinc-950 hover:bg-white",
        rule: "rgba(255, 255, 255, 0.12)",
      };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b px-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Theme</span>
          <EditorThemeSelect themeId={themeId} onChange={setThemeId} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Split</span>
          <SplitToggle orientation={orientation} onChange={setOrientation} />
        </div>
      </div>
      <div
        className={cn(
          "grid min-h-0 flex-1",
          stacked
            ? "grid-rows-[minmax(0,1fr)_minmax(0,1fr)]"
            : "grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
        )}
      >
        <ScrollArea
          className={cn("h-full min-h-0 min-w-0 bg-background", stacked ? "border-b" : "border-r")}
        >
          <div className="mx-auto max-w-xl space-y-6 px-6 py-8">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  Week {lesson.weekNumber} · {lesson.moduleTitle}
                </Badge>
                <Badge variant="outline">{capitalize(problem.difficulty)}</Badge>
                <Badge variant="outline">{problem.topic}</Badge>
              </div>
              <h1 className="font-serif text-4xl tracking-tight">{lesson.title}</h1>
              <p className="text-sm text-muted-foreground">{lesson.estimatedMinutes} minutes</p>
            </div>
            <LessonMarkdown content={lesson.contentMd} />
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-serif text-2xl">{problem.title}</CardTitle>
                  <Stars value={stars} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <LessonMarkdown content={problem.promptMd} />
                <div className="space-y-2">
                  {problem.examples.map((example) => (
                    <pre
                      key={example.call}
                      className="overflow-x-auto rounded-lg bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-100"
                    >
                      {example.call}
                      {"\n"}
                      {example.output}
                    </pre>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {problem.attempts} attempt{problem.attempts === 1 ? "" : "s"} so far.
                </p>
                {submitState.error !== undefined ? (
                  <Alert variant="destructive">
                    <AlertDescription>{submitState.error.message}</AlertDescription>
                  </Alert>
                ) : null}
                {outcome !== null ? (
                  <div className="space-y-2">
                    <Alert variant={outcome.passed ? "default" : "destructive"}>
                      <AlertDescription>{outcome.feedback}</AlertDescription>
                    </Alert>
                    <ul className="space-y-2">
                      {outcome.results.map((test) => (
                        <li key={test.name} className="rounded-lg border px-3 py-2 text-sm">
                          <p>
                            {test.passed ? "Passed" : "Failed"} · {capitalize(test.name)}
                          </p>
                          {test.error !== null ? (
                            <p className="mt-1 text-muted-foreground">{test.error}</p>
                          ) : null}
                          {test.passed ? null : (
                            <p className="mt-1 font-mono text-xs text-muted-foreground">
                              Expected {test.expected || "—"}
                              {test.received.length > 0 ? ` · Received ${test.received}` : ""}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
            <div className="flex gap-3">
              {lesson.previousSlug !== null ? (
                <Link
                  href={`/course/${lesson.previousSlug}`}
                  className={cn(buttonVariants({ variant: "outline", size: "lg", className: "h-10 px-4" }))}
                >
                  Previous
                </Link>
              ) : null}
              {lesson.nextSlug !== null && lesson.nextAvailable ? (
                <Link
                  href={`/course/${lesson.nextSlug}`}
                  className={cn(buttonVariants({ variant: "secondary", size: "lg", className: "h-10 px-4" }))}
                >
                  Next lesson
                </Link>
              ) : null}
              {lesson.nextSlug !== null && !lesson.nextAvailable ? (
                <p className="self-center text-xs text-muted-foreground">
                  Pass this exercise to open the next lesson.
                </p>
              ) : null}
            </div>
          </div>
        </ScrollArea>
        <section
          className="flex h-full min-h-0 min-w-0 flex-col"
          style={{ backgroundColor: theme.background, color: theme.foreground }}
        >
          <div className="flex items-center justify-between px-4 py-2 text-xs">
            <span className="font-mono opacity-70">solution.ts</span>
            <Badge
              variant="outline"
              className="border-current/25 bg-transparent"
              style={{ color: theme.foreground }}
            >
              {problem.solved ? "Solved" : "Draft"}
            </Badge>
          </div>
          <Separator style={{ backgroundColor: chrome.rule }} />
          <div className="min-h-0 flex-1">
            <CodeEditor value={code} onChange={setCode} themeId={themeId} />
          </div>
          <Separator style={{ backgroundColor: chrome.rule }} />
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="lg"
              className={cn("h-10 px-4", chrome.reset)}
              onClick={() => {
                setCode(problem.starterCode);
                setOutcome(null);
              }}
            >
              Reset starter
            </Button>
            <Button
              size="lg"
              disabled={submitState.fetching}
              className={cn("h-10 px-5", chrome.submit)}
              onClick={() => {
                void onSubmit();
              }}
            >
              {submitState.fetching ? "Running tests…" : "Submit"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "urql";
import { cn } from "cn";
import { CodeEditor, type CodeEditorInstance } from "@/components/editor";
import { FormatCodeButton } from "@/components/format-code-button";
import { LessonSplit } from "@/components/lesson-split";
import {
  CodeTerminal,
  readRunLines,
  type CodeTerminalState,
} from "@/components/code-terminal";
import {
  EditorThemeSelect,
  useEditorTheme,
} from "@/components/editor-theme-select";
import { LessonMarkdown } from "@/components/markdown";
import { SuggestedReading } from "@/components/suggested-reading";
import { SolutionDialog } from "@/components/solution-dialog";
import {
  SolutionNotice,
  type SolutionNoticeState,
} from "@/components/solution-notice";
import { StuckPrompt } from "@/components/stuck-prompt";
import { CompletionTick } from "@/components/completion-tick";
import { ProgressSaved } from "@/components/progress-saved";
import { SyllabusTrigger, useRefreshSyllabus } from "@/components/lesson-sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SplitToggle,
  useSplitOrientation,
  type SplitOrientation,
} from "@/components/split-toggle";
import { getEditorTheme, type EditorThemeId } from "@/lib/editor-themes";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { annotateLesson } from "@/lib/lesson-keywords";
import { currentLessonFrom } from "@/lib/lesson-return";
import { useLessonDraft } from "@/hooks/use-lesson-draft";
import { useRequireUser } from "@/lib/auth";
import { LESSON_QUERY, RUN_CODE, SUBMIT_SOLUTION } from "@/lib/operations";
import type { LessonView, SkipResult, SubmissionView } from "@/lib/types";

interface PassedSolution {
  readonly problemId: string;
  readonly code: string;
}

const capitalize = (value: string): string => {
  if (value.length === 0) {
    return value;
  }
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
};

const editorRuleColor = (light: boolean): string => {
  if (light) {
    return "rgba(0, 0, 0, 0.12)";
  }
  return "rgba(255, 255, 255, 0.12)";
};

function WorkspaceBar({
  themeId,
  onThemeChange,
  orientation,
  onOrientationChange,
  savedTick,
}: {
  readonly themeId: EditorThemeId;
  readonly onThemeChange: (themeId: EditorThemeId) => void;
  readonly orientation: SplitOrientation;
  readonly onOrientationChange: (orientation: SplitOrientation) => void;
  readonly savedTick: number;
}) {
  return (
    <div className="flex h-11 w-full shrink-0 items-center justify-between gap-3 border-b px-3">
      <SyllabusTrigger />
      <div className="flex items-center">
        <ProgressSaved tick={savedTick} />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Theme</span>
            <EditorThemeSelect themeId={themeId} onChange={onThemeChange} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Split</span>
            <SplitToggle
              orientation={orientation}
              onChange={onOrientationChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Workspace({ slug }: { readonly slug: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleFrom = currentLessonFrom(pathname, searchParams.toString());
  const auth = useRequireUser();
  const auditMode = auth.user?.auditMode ?? false;
  const auditModeRef = useRef(auditMode);
  const [result, reexecute] = useQuery<{ lesson: LessonView | null }>({
    query: LESSON_QUERY,
    variables: { slug },
    pause: auth.user === null || slug.length === 0,
    requestPolicy: "cache-and-network",
  });
  const [submitState, submit] = useMutation<{ submitSolution: SubmissionView }>(
    SUBMIT_SOLUTION,
  );
  const [runState, runCode] = useMutation<{
    runCode: { readonly lines: readonly { readonly kind: string; readonly text: string }[] };
  }>(RUN_CODE);
  useEffect(() => {
    if (auditModeRef.current === auditMode) {
      return;
    }
    auditModeRef.current = auditMode;
    reexecute({ requestPolicy: "network-only" });
  }, [auditMode, reexecute]);

  useEffect(() => {
    if (result.error === undefined) {
      return;
    }
    const message = graphqlErrorMessage(result.error, "");
    if (message !== "Finish the previous lesson before opening this one.") {
      return;
    }
    router.replace("/course");
  }, [result.error, router]);

  const lesson = result.data?.lesson ?? null;
  const problem = lesson?.problems[0];
  const [code, setCode] = useState("");
  const [outcome, setOutcome] = useState<SubmissionView | null>(null);
  const [notice, setNotice] = useState<SolutionNoticeState | null>(null);
  const [terminal, setTerminal] = useState<CodeTerminalState>({ kind: "idle" });
  const [resetOpen, setResetOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [passedCode, setPassedCode] = useState<PassedSolution | null>(null);
  const [orientation, setOrientation] = useSplitOrientation();
  const [themeId, setThemeId] = useEditorTheme();
  const refreshSyllabus = useRefreshSyllabus();
  const loadedProblemId = useRef<string | null>(null);
  const editorRef = useRef<CodeEditorInstance | null>(null);
  const { tick, remember, track, isClean, readCode } = useLessonDraft({
    problemId: problem?.id ?? null,
    code,
    armed: problem !== undefined && loadedProblemId.current === problem.id,
  });

  useEffect(() => {
    if (problem === undefined) {
      return;
    }

    const initial = problem.latestCode ?? problem.starterCode;
    const switching = loadedProblemId.current !== problem.id;

    if (!switching && result.stale) {
      return;
    }
    if (!switching && !isClean(problem.id)) {
      return;
    }
    if (!switching && readCode(problem.id) === initial) {
      return;
    }
    if (!switching) {
      remember(problem.id, initial);
      setCode(initial);
      if (problem.solved && problem.passingCode !== null) {
        setPassedCode({ problemId: problem.id, code: problem.passingCode });
      }
      return;
    }

    loadedProblemId.current = problem.id;
    remember(problem.id, initial);
    setCode(initial);
    setOutcome(null);
    setNotice(null);
    setSolutionOpen(false);
    setTerminal({ kind: "idle" });
    if (problem.solved && problem.passingCode !== null) {
      setPassedCode({ problemId: problem.id, code: problem.passingCode });
      return;
    }
    setPassedCode(null);
  }, [isClean, problem, readCode, remember, result.stale]);

  const lessonReady = lesson !== null && lesson.slug === slug;
  const theme = getEditorTheme(themeId);
  const bar = (
    <WorkspaceBar
      themeId={themeId}
      onThemeChange={setThemeId}
      orientation={orientation}
      onOrientationChange={setOrientation}
      savedTick={tick}
    />
  );

  if (auth.user === null || (!lessonReady && result.fetching)) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        {bar}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Spinner className="size-8 text-foreground" />
        </div>
      </div>
    );
  }

  if (result.error !== undefined && !lessonReady) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        {bar}
        <div className="space-y-4 p-6">
          <Alert>
            <AlertDescription>
              {graphqlErrorMessage(result.error, "Could not load that lesson.")}
            </AlertDescription>
          </Alert>
          <Link
            href="/course"
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-10 px-4",
              }),
            )}
          >
            Back to the course
          </Link>
        </div>
      </div>
    );
  }

  if (!lessonReady || problem === undefined || lesson === null) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col">
        {bar}
        <div className="p-6">
          <Alert>
            <AlertDescription>That lesson is not on the path.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const onSubmit = async () => {
    const problemId = problem.id;
    setNotice({ kind: "checking" });
    const response = await submit({ problemId, code });
    if (loadedProblemId.current !== problemId) {
      return;
    }
    const next = response.data?.submitSolution;
    if (next === undefined) {
      setNotice({
        kind: "error",
        message: graphqlErrorMessage(response.error, "Could not check that solution."),
      });
      return;
    }
    setOutcome(next);
    setNotice({ kind: "result", outcome: next });
    if (next.passed) {
      setPassedCode({ problemId, code });
    }
    reexecute({ requestPolicy: "network-only" });
    refreshSyllabus();
  };

  const onRun = async () => {
    const problemId = problem.id;
    setTerminal({ kind: "running" });
    const response = await runCode({ problemId, code });
    if (loadedProblemId.current !== problemId) {
      return;
    }
    const next = response.data?.runCode;
    if (next === undefined) {
      setTerminal({
        kind: "failed",
        message: graphqlErrorMessage(response.error, "Could not run that code."),
      });
      return;
    }
    setTerminal({ kind: "ready", lines: readRunLines(next.lines) });
  };

  const onReset = () => {
    track(problem.starterCode);
    setCode(problem.starterCode);
    setOutcome(null);
    setNotice(null);
    setTerminal({ kind: "idle" });
    setResetOpen(false);
  };

  const chrome = theme.light
    ? {
        reset: "text-zinc-700 hover:bg-black/5 hover:text-zinc-950",
        submit: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800",
        rule: editorRuleColor(true),
      }
    : {
        reset: "text-zinc-300 hover:bg-white/10 hover:text-white",
        submit: "bg-zinc-100 text-zinc-950 hover:bg-white",
        rule: editorRuleColor(false),
      };
  const checking = submitState.fetching;
  const running = runState.fetching;
  const busy = checking || running;
  const editorReady = loadedProblemId.current === problem.id;
  const rememberedPass =
    passedCode !== null && passedCode.problemId === problem.id
      ? passedCode.code
      : null;
  const passingCode =
    rememberedPass ?? (problem.solved ? problem.passingCode : null);
  const codeMatchesPass =
    editorReady && passingCode !== null && code === passingCode;
  const hasPassed =
    editorReady &&
    (problem.solved || (outcome?.passed ?? false) || rememberedPass !== null);
  const nextHref =
    lesson.nextSlug !== null && lesson.nextAvailable
      ? `/course/${lesson.nextSlug}`
      : null;
  const nextIsPrimary = !checking && codeMatchesPass && nextHref !== null;
  const nextIsSecondary =
    !checking && hasPassed && !nextIsPrimary && nextHref !== null;
  const showLastLessonNote = !checking && hasPassed && lesson.nextSlug === null;
  const failedThisSession = outcome !== null && outcome.passed === false;
  const showStuck = !hasPassed && (problem.failedAttempts > 0 || failedThisSession);
  const onSkipped = (result: SkipResult) => {
    setSolutionOpen(false);
    reexecute({ requestPolicy: "network-only" });
    refreshSyllabus();
    if (!result.nextAvailable || result.nextSlug === null) {
      return;
    }
    router.push(`/course/${result.nextSlug}`);
  };
  const annotated = annotateLesson(lesson.contentMd, problem.promptMd);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {bar}
      <LessonSplit
        orientation={orientation}
        lesson={
        <ScrollArea className="h-full min-h-0 min-w-0 bg-background">
          <div className="mx-auto max-w-xl space-y-6 px-6 py-8">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  Week {lesson.weekNumber} · {lesson.moduleTitle}
                </Badge>
                <Badge variant="outline">
                  {capitalize(problem.difficulty)}
                </Badge>
                <Badge variant="outline">{problem.topic}</Badge>
                {lesson.skipped ? <Badge variant="outline">Skipped</Badge> : null}
              </div>
              <h1 className="font-serif text-4xl tracking-tight">
                {lesson.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {lesson.estimatedMinutes} minutes
              </p>
            </div>
            <LessonMarkdown
              content={annotated.contentMd}
              articleFrom={articleFrom}
            />
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-serif text-2xl">
                    {problem.title}
                  </CardTitle>
                  {hasPassed ? (
                    <CompletionTick
                      animate={outcome?.passed === true}
                      label="Lesson complete"
                      className="mt-1 size-6"
                    />
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <LessonMarkdown
                  content={annotated.promptMd}
                  articleFrom={articleFrom}
                />
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
                  {problem.attempts} attempt{problem.attempts === 1 ? "" : "s"}{" "}
                  so far.
                </p>
              </CardContent>
            </Card>
            <SuggestedReading
              slugs={annotated.articleSlugs}
              from={articleFrom}
            />
            <div className="flex gap-3">
              {lesson.previousSlug !== null ? (
                <Link
                  href={`/course/${lesson.previousSlug}`}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: "h-10 px-4",
                    }),
                  )}
                >
                  Previous
                </Link>
              ) : null}
              {lesson.nextSlug !== null && lesson.nextAvailable ? (
                <Link
                  href={`/course/${lesson.nextSlug}`}
                  className={cn(
                    buttonVariants({
                      variant: "secondary",
                      size: "lg",
                      className: "h-10 px-4",
                    }),
                  )}
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
        }
        editor={
        <section
          className="relative flex h-full min-h-0 min-w-0 flex-col"
          style={{ backgroundColor: theme.background, color: theme.foreground }}
        >
          <div className="flex items-center justify-end gap-1 px-4 py-2 text-xs">
            <FormatCodeButton editorRef={editorRef} />
            <Badge
              variant="outline"
              className="border-current/25 bg-transparent"
              style={{ color: theme.foreground }}
            >
              {problem.solved ? "Solved" : "Draft"}
            </Badge>
          </div>
          <Separator style={{ backgroundColor: chrome.rule }} />
          <div className="relative min-h-0 flex-1">
            <CodeEditor
              value={code}
              onChange={(next) => {
                track(next);
                setCode(next);
              }}
              themeId={themeId}
              editorRef={editorRef}
            />
            {notice !== null ? (
              <SolutionNotice notice={notice} onDismiss={() => setNotice(null)} />
            ) : null}
          </div>
          <CodeTerminal
            state={terminal}
            light={theme.light}
            foreground={theme.foreground}
            borderColor={chrome.rule}
          />
          {showStuck ? (
            <div className="px-4 pt-3" style={{ color: theme.foreground }}>
              <StuckPrompt
                onOpen={() => {
                  setSolutionOpen(true);
                }}
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={busy}
              className="h-10 px-4 text-foreground"
              onClick={() => {
                setResetOpen(true);
              }}
            >
              Reset
            </Button>
            <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
              <AlertDialogContent>
                <AlertDialogTitle>Reset the workspace?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset the workspace to the original starter code. The solution in the
                  editor will be replaced.
                </AlertDialogDescription>
                <AlertDialogFooter>
                  <AlertDialogClose className={cn(buttonVariants({ variant: "outline" }))}>
                    Cancel
                  </AlertDialogClose>
                  <Button type="button" variant="destructive" onClick={onReset}>
                    Reset workspace
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex items-center gap-2">
              {showLastLessonNote ? (
                <span className="text-xs opacity-70">
                  This is the last lesson.
                </span>
              ) : null}
              {nextIsPrimary ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={running}
                  className={cn("h-10 px-4", chrome.reset)}
                  onClick={() => {
                    void onSubmit();
                  }}
                >
                  Submit
                </Button>
              ) : null}
              {nextIsSecondary && nextHref !== null ? (
                <Link
                  href={nextHref}
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                      size: "lg",
                      className: "h-10 px-4",
                    }),
                    chrome.reset,
                  )}
                >
                  Next lesson
                </Link>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={busy}
                className="h-10 px-4 text-foreground"
                onClick={() => {
                  void onRun();
                }}
              >
                {running ? <Spinner data-icon="inline-start" /> : null}
                {running ? "Running" : "Run"}
              </Button>
              {checking ? (
                <Button
                  size="lg"
                  disabled
                  className={cn("h-10 px-5", chrome.submit)}
                >
                  <Spinner data-icon="inline-start" />
                  Checking
                </Button>
              ) : null}
              {!checking && nextIsPrimary && nextHref !== null ? (
                <Link
                  href={nextHref}
                  className={cn(
                    buttonVariants({ size: "lg", className: "h-10 px-5" }),
                    chrome.submit,
                  )}
                >
                  Next lesson
                </Link>
              ) : null}
              {!checking && !nextIsPrimary ? (
                <Button
                  type="button"
                  size="lg"
                  disabled={running}
                  className={cn("h-10 px-5", chrome.submit)}
                  onClick={() => {
                    void onSubmit();
                  }}
                >
                  Submit
                </Button>
              ) : null}
            </div>
          </div>
        </section>
        }
      />
      <SolutionDialog
        slug={lesson.slug}
        title={lesson.title}
        open={solutionOpen}
        onOpenChange={setSolutionOpen}
        onSkipped={onSkipped}
      />
    </div>
  );
}

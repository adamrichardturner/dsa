"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useMutation } from "urql";
import { cn } from "cn";
import {
  CodeTerminal,
  readRunLines,
  type CodeTerminalState,
} from "@/components/code-terminal";
import { CodeEditor } from "@/components/editor";
import {
  EditorThemeSelect,
  editorThemeEvent,
  editorThemeStorageKey,
} from "@/components/editor-theme-select";
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
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getEditorTheme, readEditorThemeId, type EditorThemeId } from "@/lib/editor-themes";
import { RUN_SNIPPET } from "@/lib/operations";

const editorHeight = (source: string): number => {
  const lines = source.split("\n").length;
  const height = lines * 22 + 28;
  if (height < 132) {
    return 132;
  }
  if (height > 420) {
    return 420;
  }
  return height;
};

const ruleColor = (light: boolean): string => {
  if (light) {
    return "rgba(0, 0, 0, 0.12)";
  }
  return "rgba(255, 255, 255, 0.12)";
};

const subscribeToRunnerTheme = (onStoreChange: () => void) => {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  window.addEventListener(editorThemeEvent, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    observer.disconnect();
    window.removeEventListener(editorThemeEvent, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
};

const readRunnerTheme = (): EditorThemeId => {
  const stored = window.localStorage.getItem(editorThemeStorageKey);
  if (stored !== null) {
    return readEditorThemeId(stored);
  }
  if (document.documentElement.classList.contains("dark")) {
    return "kiln";
  }
  return "light-plus";
};

const serverRunnerTheme = (): EditorThemeId => {
  return "kiln";
};

const setRunnerTheme = (themeId: EditorThemeId) => {
  window.localStorage.setItem(editorThemeStorageKey, themeId);
  window.dispatchEvent(new Event(editorThemeEvent));
};

function useRunnerTheme(): readonly [EditorThemeId, (themeId: EditorThemeId) => void] {
  const themeId = useSyncExternalStore(
    subscribeToRunnerTheme,
    readRunnerTheme,
    serverRunnerTheme,
  );
  return [themeId, setRunnerTheme];
}

export function CodeRunner({ code }: { readonly code: string }) {
  const initial = code.endsWith("\n") ? code.slice(0, -1) : code;
  const [source, setSource] = useState(initial);
  const [terminal, setTerminal] = useState<CodeTerminalState>({ kind: "idle" });
  const [resetOpen, setResetOpen] = useState(false);
  const [themeId, setThemeId] = useRunnerTheme();
  const request = useRef(0);
  const [runState, runSnippet] = useMutation<{
    runSnippet: {
      readonly lines: readonly { readonly kind: string; readonly text: string }[];
    };
  }>(RUN_SNIPPET);
  const theme = getEditorTheme(themeId);
  const running = runState.fetching;
  const unchanged = source === initial;
  const runClass = theme.light
    ? "bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
    : "bg-zinc-100 text-zinc-950 hover:bg-white";
  const border = ruleColor(theme.light);

  const onRun = async () => {
    request.current += 1;
    const requestId = request.current;
    setTerminal({ kind: "running" });
    const response = await runSnippet({ code: source });
    if (request.current !== requestId) {
      return;
    }
    const next = response.data?.runSnippet;
    if (next === undefined) {
      setTerminal({
        kind: "failed",
        message: response.error?.message ?? "Could not run that code.",
      });
      return;
    }
    setTerminal({ kind: "ready", lines: readRunLines(next.lines) });
  };

  const onReset = () => {
    request.current += 1;
    setSource(initial);
    setTerminal({ kind: "idle" });
    setResetOpen(false);
  };

  return (
    <section
      className="code-runner overflow-hidden rounded-xl border"
      style={{
        backgroundColor: theme.background,
        color: theme.foreground,
        borderColor: border,
      }}
      aria-label="TypeScript example"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs">
        <span className="font-mono opacity-70">example.ts</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="opacity-70">Theme</span>
          <EditorThemeSelect themeId={themeId} onChange={setThemeId} />
          <Badge
            variant="outline"
            className="border-current/25 bg-transparent"
            style={{ color: theme.foreground }}
          >
            TypeScript
          </Badge>
        </div>
      </div>
      <Separator style={{ backgroundColor: border }} />
      <div style={{ height: editorHeight(source) }}>
        <CodeEditor value={source} onChange={setSource} themeId={themeId} autoFocus={false} />
      </div>
      <CodeTerminal
        state={terminal}
        light={theme.light}
        foreground={theme.foreground}
        borderColor={border}
        idleMessage="Press Run to execute this example. Use console.log to print a value."
      />
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={running || unchanged}
          className="h-10 px-4 text-foreground"
          onClick={() => {
            setResetOpen(true);
          }}
        >
          Reset
        </Button>
        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogContent>
            <AlertDialogTitle>Reset this example?</AlertDialogTitle>
            <AlertDialogDescription>
              This restores the example from the article and replaces the code in the editor.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogClose className={cn(buttonVariants({ variant: "outline" }))}>
                Cancel
              </AlertDialogClose>
              <Button type="button" variant="destructive" onClick={onReset}>
                Reset example
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          type="button"
          size="lg"
          disabled={running}
          className={cn("h-10 px-5", runClass)}
          onClick={() => {
            void onRun();
          }}
        >
          {running ? <Spinner data-icon="inline-start" /> : null}
          {running ? "Running" : "Run"}
        </Button>
      </div>
    </section>
  );
}

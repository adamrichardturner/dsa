"use client";

import { type RefObject } from "react";
import Editor, { type BeforeMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";
import {
  defineEditorThemes,
  getEditorTheme,
  type EditorThemeId,
} from "@/lib/editor-themes";

const editorLineWidths = [
  "w-2/3",
  "w-4/5",
  "w-1/2",
  "w-3/4",
  "w-11/12",
  "w-2/5",
  "w-3/5",
  "w-1/3",
] as const;

export function EditorSkeleton() {
  return (
    <div
      className="flex h-full w-full flex-col gap-3 px-6 py-5"
      role="status"
      aria-label="Loading editor"
    >
      {editorLineWidths.map((width) => (
        <Skeleton key={width} className={cn("h-3 bg-current/15", width)} />
      ))}
    </div>
  );
}

export type CodeEditorInstance = editor.IStandaloneCodeEditor;

const prepareEditor: BeforeMount = (monaco) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ES2022,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    esModuleInterop: true,
    noEmit: true,
    allowNonTsExtensions: true,
    lib: ["es2022"],
  });
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    "declare const console: { log(...data: readonly unknown[]): void };",
    "ts:console.d.ts",
  );
  defineEditorThemes(monaco);
};

export function CodeEditor({
  value,
  onChange,
  themeId,
  autoFocus = true,
  editorRef,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly themeId: EditorThemeId;
  readonly autoFocus?: boolean;
  readonly editorRef?: RefObject<CodeEditorInstance | null>;
}) {
  const theme = getEditorTheme(themeId);

  return (
    <Editor
      height="100%"
      language="typescript"
      theme={theme.monacoId}
      value={value}
      onChange={(next) => {
        onChange(next ?? "");
      }}
      loading={<EditorSkeleton />}
      beforeMount={prepareEditor}
      onMount={(instance) => {
        if (editorRef !== undefined) {
          editorRef.current = instance;
        }
        if (!autoFocus) {
          return;
        }
        instance.focus();
      }}
      options={{
        fontSize: 14,
        fontFamily: "JetBrains Mono, ui-monospace, monospace",
        fontLigatures: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 2,
        padding: { top: 16, bottom: 16 },
        automaticLayout: true,
        wordWrap: "on",
        smoothScrolling: true,
        renderLineHighlight: "line",
      }}
    />
  );
}

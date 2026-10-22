"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
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

const mountOverflowHost = (): HTMLDivElement => {
  const node = document.createElement("div");
  node.className = "monaco-editor monaco-overflow-widgets";
  document.body.appendChild(node);
  return node;
};

const useMonacoOverflowHost = (): HTMLDivElement | null => {
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const node = mountOverflowHost();
    setHost(node);
    return () => {
      node.remove();
    };
  }, []);

  return host;
};

const prepareEditor: BeforeMount = (monaco) => {
  const typescript = monaco.languages.typescript;
  typescript.typescriptDefaults.setCompilerOptions({
    strict: true,
    // Yearly targets after ES2020 are missing from Monaco's public enum.
    // Latest is the newest target the bundled TypeScript worker understands.
    target: typescript.ScriptTarget.Latest,
    module: typescript.ModuleKind.ESNext,
    esModuleInterop: true,
    noEmit: true,
    allowNonTsExtensions: true,
    lib: ["esnext"],
  });
  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    "declare const console: { log(...data: readonly unknown[]): void };",
    "ts:console.d.ts",
  );
  defineEditorThemes(monaco);
};

type EditorLineNumbers = "on" | "off";
type EditorWordWrap = "on" | "off";

const editorOptions = (
  overflowHost: HTMLDivElement,
  lineNumbers: EditorLineNumbers,
  wordWrap: EditorWordWrap,
): editor.IStandaloneEditorConstructionOptions => {
  const options: editor.IStandaloneEditorConstructionOptions = {
    fontSize: 14,
    fontFamily: "JetBrains Mono, ui-monospace, monospace",
    fontLigatures: false,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    tabSize: 2,
    padding: { top: 16, bottom: 16 },
    automaticLayout: true,
    wordWrap,
    lineNumbers,
    smoothScrolling: true,
    renderLineHighlight: "line",
    fixedOverflowWidgets: true,
    overflowWidgetsDomNode: overflowHost,
  };
  if (lineNumbers === "on" && wordWrap === "on") {
    return options;
  }
  const withoutLineNumbers =
    lineNumbers === "off"
      ? {
          lineNumbersMinChars: 0,
          folding: false,
          glyphMargin: false,
          lineDecorationsWidth: 0,
        }
      : {};
  const horizontalScroll =
    wordWrap === "off"
      ? {
          scrollBeyondLastColumn: 2,
          scrollbar: {
            horizontal: "auto" as const,
            vertical: "auto" as const,
            horizontalScrollbarSize: 10,
            alwaysConsumeMouseWheel: false,
          },
        }
      : {};
  return {
    ...options,
    ...withoutLineNumbers,
    ...horizontalScroll,
  };
};

export function CodeEditor({
  value,
  onChange,
  themeId,
  autoFocus = true,
  editorRef,
  lineNumbers = "on",
  wordWrap = "on",
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly themeId: EditorThemeId;
  readonly autoFocus?: boolean;
  readonly editorRef?: RefObject<CodeEditorInstance | null>;
  readonly lineNumbers?: EditorLineNumbers;
  readonly wordWrap?: EditorWordWrap;
}) {
  const theme = getEditorTheme(themeId);
  const overflowHost = useMonacoOverflowHost();
  const instanceRef = useRef<CodeEditorInstance | null>(null);
  const emittedValue = useRef(value);
  const valueRef = useRef(value);
  const applyingExternal = useRef(false);
  valueRef.current = value;
  const options = useMemo(() => {
    if (overflowHost === null) {
      return null;
    }
    return editorOptions(overflowHost, lineNumbers, wordWrap);
  }, [lineNumbers, overflowHost, wordWrap]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance === null) {
      return;
    }
    if (value === emittedValue.current) {
      return;
    }
    const model = instance.getModel();
    if (model === null || model.getValue() === value) {
      emittedValue.current = value;
      return;
    }
    applyingExternal.current = true;
    emittedValue.current = value;
    instance.setValue(value);
    applyingExternal.current = false;
  }, [value]);

  if (overflowHost === null || options === null) {
    return <EditorSkeleton />;
  }

  return (
    <Editor
      height="100%"
      language="typescript"
      theme={theme.monacoId}
      defaultValue={value}
      onChange={(next) => {
        if (applyingExternal.current) {
          return;
        }
        const text = next ?? "";
        emittedValue.current = text;
        onChange(text);
      }}
      loading={<EditorSkeleton />}
      beforeMount={prepareEditor}
      onMount={(instance) => {
        instanceRef.current = instance;
        if (editorRef !== undefined) {
          editorRef.current = instance;
        }
        const model = instance.getModel();
        if (model !== null && model.getValue() !== valueRef.current) {
          applyingExternal.current = true;
          emittedValue.current = valueRef.current;
          instance.setValue(valueRef.current);
          applyingExternal.current = false;
        }
        if (!autoFocus) {
          return;
        }
        instance.focus();
      }}
      options={options}
    />
  );
}

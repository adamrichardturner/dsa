"use client";

import {
  useCallback,
  useEffect,
  useId,
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
import { planEditorSync } from "@/lib/editor-sync";

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

let editorPrepared = false;

const prepareEditor: BeforeMount = (monaco) => {
  if (editorPrepared) {
    return;
  }
  editorPrepared = true;
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

const modelPathFor = (reactId: string): string => {
  const suffix = reactId.replace(/[^a-zA-Z0-9]/g, "");
  if (suffix.length > 0) {
    return `dsa/${suffix}.ts`;
  }
  return "dsa/editor.ts";
};

const replaceEditorText = (
  instance: CodeEditorInstance,
  next: string,
): void => {
  const model = instance.getModel();
  if (model === null || model.getValue() === next) {
    return;
  }
  const viewState = instance.saveViewState();
  const hadFocus = instance.hasTextFocus() || instance.hasWidgetFocus();
  instance.setValue(next);
  if (viewState !== null) {
    instance.restoreViewState(viewState);
  }
  if (!hadFocus) {
    return;
  }
  instance.focus();
};

export function CodeEditor({
  value,
  onChange,
  themeId,
  autoFocus = true,
  editorRef,
  lineNumbers = "on",
  wordWrap = "on",
  revision = 0,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly themeId: EditorThemeId;
  readonly autoFocus?: boolean;
  readonly editorRef?: RefObject<CodeEditorInstance | null>;
  readonly lineNumbers?: EditorLineNumbers;
  readonly wordWrap?: EditorWordWrap;
  readonly revision?: number;
}) {
  const theme = getEditorTheme(themeId);
  const overflowHost = useMonacoOverflowHost();
  const reactId = useId();
  const modelPath = modelPathFor(reactId);
  const instanceRef = useRef<CodeEditorInstance | null>(null);
  const emittedValue = useRef(value);
  const appliedRevision = useRef(revision);
  const applyingExternal = useRef(false);
  const onChangeRef = useRef(onChange);
  const autoFocusRef = useRef(autoFocus);
  const editorRefProp = useRef(editorRef);
  const seededValue = useRef(value);
  const seededRevision = useRef(revision);
  const [mounted, setMounted] = useState(false);
  onChangeRef.current = onChange;
  autoFocusRef.current = autoFocus;
  editorRefProp.current = editorRef;
  if (seededRevision.current !== revision) {
    seededRevision.current = revision;
    seededValue.current = value;
  }
  const options = useMemo(() => {
    if (overflowHost === null) {
      return null;
    }
    return editorOptions(overflowHost, lineNumbers, wordWrap);
  }, [lineNumbers, overflowHost, wordWrap]);

  const handleChange = useCallback((next: string | undefined) => {
    if (applyingExternal.current) {
      return;
    }
    const text = next ?? "";
    emittedValue.current = text;
    onChangeRef.current(text);
  }, []);

  const handleMount = useCallback((instance: CodeEditorInstance) => {
    instanceRef.current = instance;
    const external = editorRefProp.current;
    if (external !== undefined) {
      external.current = instance;
    }
    setMounted(true);
    if (!autoFocusRef.current) {
      return;
    }
    instance.focus();
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance === null) {
      return;
    }
    const model = instance.getModel();
    if (model === null) {
      return;
    }
    const current = model.getValue();
    const plan = planEditorSync({
      modelValue: current,
      propValue: value,
      emittedValue: emittedValue.current,
      revision,
      appliedRevision: appliedRevision.current,
    });
    if (plan === "keep") {
      emittedValue.current = value;
      appliedRevision.current = revision;
      return;
    }
    if (plan === "echo") {
      onChangeRef.current(current);
      return;
    }
    applyingExternal.current = true;
    emittedValue.current = value;
    appliedRevision.current = revision;
    replaceEditorText(instance, value);
    applyingExternal.current = false;
  }, [mounted, revision, value]);

  if (overflowHost === null || options === null) {
    return <EditorSkeleton />;
  }

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <Editor
        height="100%"
        language="typescript"
        path={modelPath}
        theme={theme.monacoId}
        defaultValue={seededValue.current}
        onChange={handleChange}
        loading={<EditorSkeleton />}
        beforeMount={prepareEditor}
        onMount={handleMount}
        options={options}
      />
    </div>
  );
}

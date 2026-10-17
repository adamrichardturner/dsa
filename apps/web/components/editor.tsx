"use client";

import Editor, { type BeforeMount } from "@monaco-editor/react";
import { defineEditorThemes, getEditorTheme, type EditorThemeId } from "@/lib/editor-themes";

const prepareEditor: BeforeMount = (monaco) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    strict: true,
    target: monaco.languages.typescript.ScriptTarget.ES2022,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    esModuleInterop: true,
    noEmit: true,
    allowNonTsExtensions: true,
  });
  defineEditorThemes(monaco);
};

export function CodeEditor({
  value,
  onChange,
  themeId,
}: {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly themeId: EditorThemeId;
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
      beforeMount={prepareEditor}
      onMount={(editor) => {
        editor.focus();
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

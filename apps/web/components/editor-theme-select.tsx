"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { editorThemes, readEditorThemeId, type EditorThemeId } from "@/lib/editor-themes";

export const editorThemeStorageKey = "dsa.editor-theme";
export const editorThemeEvent = "dsa-editor-theme";

export function useEditorTheme(): readonly [EditorThemeId, (themeId: EditorThemeId) => void] {
  const [themeId, setThemeId] = useState<EditorThemeId>("kiln");

  useLayoutEffect(() => {
    setThemeId(readEditorThemeId(window.localStorage.getItem(editorThemeStorageKey)));
  }, []);

  useEffect(() => {
    const sync = () => {
      setThemeId(readEditorThemeId(window.localStorage.getItem(editorThemeStorageKey)));
    };
    window.addEventListener(editorThemeEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(editorThemeEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = (next: EditorThemeId) => {
    setThemeId(next);
    window.localStorage.setItem(editorThemeStorageKey, next);
    window.dispatchEvent(new Event(editorThemeEvent));
  };

  return [themeId, update];
}

export function EditorThemeSelect({
  themeId,
  onChange,
}: {
  readonly themeId: EditorThemeId;
  readonly onChange: (themeId: EditorThemeId) => void;
}) {
  return (
    <NativeSelect
      size="sm"
      className="w-40"
      aria-label="Editor theme"
      value={themeId}
      onChange={(event) => {
        onChange(readEditorThemeId(event.currentTarget.value));
      }}
    >
      {editorThemes.map((theme) => (
        <NativeSelectOption key={theme.id} value={theme.id}>
          {theme.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

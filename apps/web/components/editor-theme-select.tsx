"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  editorThemeItems,
  editorThemes,
  readEditorThemeId,
  type EditorThemeId,
} from "@/lib/editor-themes";

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
    <Select
      items={editorThemeItems}
      value={themeId}
      onValueChange={(value) => {
        if (typeof value !== "string") {
          return;
        }
        onChange(readEditorThemeId(value));
      }}
    >
      <SelectTrigger size="sm" className="w-40" aria-label="Editor theme">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        {editorThemes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            {theme.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import { useEffect, useState } from "react";
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

const storageKey = "dsa.editor-theme";

export function useEditorTheme(): readonly [EditorThemeId, (themeId: EditorThemeId) => void] {
  const [themeId, setThemeId] = useState<EditorThemeId>("kiln");

  useEffect(() => {
    setThemeId(readEditorThemeId(window.localStorage.getItem(storageKey)));
  }, []);

  const update = (next: EditorThemeId) => {
    setThemeId(next);
    window.localStorage.setItem(storageKey, next);
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

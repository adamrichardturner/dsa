"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  editorThemes,
  readEditorThemeId,
  type EditorThemeId,
} from "@/lib/editor-themes";

export const editorThemeStorageKey = "dsa.editor-theme";
export const editorThemeEvent = "dsa-editor-theme";

export function useEditorTheme(): readonly [
  EditorThemeId,
  (themeId: EditorThemeId) => void,
] {
  const [themeId, setThemeId] = useState<EditorThemeId>("kiln");

  useLayoutEffect(() => {
    setThemeId(
      readEditorThemeId(window.localStorage.getItem(editorThemeStorageKey)),
    );
  }, []);

  useEffect(() => {
    const sync = () => {
      setThemeId(
        readEditorThemeId(window.localStorage.getItem(editorThemeStorageKey)),
      );
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

const themeItems: readonly {
  readonly label: string;
  readonly value: EditorThemeId;
}[] = editorThemes.map((theme) => ({
  label: theme.label,
  value: theme.id,
}));

export function EditorThemeSelect({
  themeId,
  onChange,
}: {
  readonly themeId: EditorThemeId;
  readonly onChange: (themeId: EditorThemeId) => void;
}) {
  return (
    <Select
      items={themeItems}
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
      <SelectContent
        side="bottom"
        align="start"
        alignItemWithTrigger={false}
        collisionAvoidance={{
          side: "none",
          align: "none",
          fallbackAxisSide: "none",
        }}
        className="max-h-none"
      >
        <SelectGroup>
          {themeItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

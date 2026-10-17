"use client";

import { useEffect, useState } from "react";
import { Columns2, Rows2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type SplitOrientation = "vertical" | "horizontal";

const storageKey = "dsa.split";

const readOrientation = (value: string | null): SplitOrientation => {
  if (value === "horizontal") {
    return "horizontal";
  }
  return "vertical";
};

export function useSplitOrientation(): readonly [
  SplitOrientation,
  (orientation: SplitOrientation) => void,
] {
  const [orientation, setOrientation] = useState<SplitOrientation>("vertical");

  useEffect(() => {
    setOrientation(readOrientation(window.localStorage.getItem(storageKey)));
  }, []);

  const update = (next: SplitOrientation) => {
    setOrientation(next);
    window.localStorage.setItem(storageKey, next);
  };

  return [orientation, update];
}

export function SplitToggle({
  orientation,
  onChange,
}: {
  readonly orientation: SplitOrientation;
  readonly onChange: (orientation: SplitOrientation) => void;
}) {
  return (
    <ToggleGroup
      aria-label="Split the lesson and the editor"
      variant="outline"
      size="sm"
      spacing={0}
      value={[orientation]}
      onValueChange={(next) => {
        const selected = next[0];
        if (selected !== "vertical" && selected !== "horizontal") {
          return;
        }
        onChange(selected);
      }}
    >
      <ToggleGroupItem value="vertical" aria-label="Vertical split, lesson and editor side by side">
        <Columns2 />
        Vertical
      </ToggleGroupItem>
      <ToggleGroupItem value="horizontal" aria-label="Horizontal split, lesson above the editor">
        <Rows2 />
        Horizontal
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useGroupRef, type Layout } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { SplitOrientation } from "@/components/split-toggle";
import { isRecord } from "@/lib/guards";

const lessonPanelId = "lesson";
const editorPanelId = "editor";

const storageKey = (orientation: SplitOrientation): string => {
  if (orientation === "horizontal") {
    return "dsa.split-layout.stacked";
  }
  return "dsa.split-layout.columns";
};

interface PanelLayout {
  readonly lesson: number;
  readonly editor: number;
}

const readPercent = (value: unknown): number | undefined => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }
  return value;
};

const readStoredLayout = (orientation: SplitOrientation): PanelLayout | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  const raw = window.localStorage.getItem(storageKey(orientation));
  if (raw === null) {
    return undefined;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!isRecord(parsed)) {
    return undefined;
  }
  const lesson = readPercent(parsed.lesson);
  const editor = readPercent(parsed.editor);
  if (lesson === undefined || editor === undefined) {
    return undefined;
  }
  return { lesson, editor };
};

const evenLayout = (): PanelLayout => {
  return { lesson: 50, editor: 50 };
};

const toGroupLayout = (layout: PanelLayout): Layout => {
  return {
    [lessonPanelId]: layout.lesson,
    [editorPanelId]: layout.editor,
  };
};

export function LessonSplit({
  orientation,
  lesson,
  editor,
}: {
  readonly orientation: SplitOrientation;
  readonly lesson: ReactNode;
  readonly editor: ReactNode;
}) {
  const stacked = orientation === "horizontal";
  const groupRef = useGroupRef();
  const [initialLayout] = useState(() => readStoredLayout(orientation) ?? evenLayout());
  const skipInitialApply = useRef(true);
  const orientationRef = useRef(orientation);
  const acceptSaves = useRef(true);

  if (orientationRef.current !== orientation) {
    orientationRef.current = orientation;
    acceptSaves.current = false;
  }

  useLayoutEffect(() => {
    if (skipInitialApply.current) {
      skipInitialApply.current = false;
      acceptSaves.current = true;
      return;
    }
    const group = groupRef.current;
    if (group !== null) {
      group.setLayout(toGroupLayout(readStoredLayout(orientation) ?? evenLayout()));
    }
    acceptSaves.current = true;
  }, [orientation, groupRef]);

  return (
    <div className="min-h-0 flex-1">
      <ResizablePanelGroup
        groupRef={groupRef}
        orientation={stacked ? "vertical" : "horizontal"}
        defaultLayout={toGroupLayout(initialLayout)}
        resizeTargetMinimumSize={{ coarse: 28, fine: 16 }}
        onLayoutChanged={(layout, meta) => {
          if (!acceptSaves.current || !meta.isUserInteraction) {
            return;
          }
          const requested = meta.requestedLayout ?? layout;
          const lessonSize = requested[lessonPanelId];
          const editorSize = requested[editorPanelId];
          if (lessonSize === undefined || editorSize === undefined) {
            return;
          }
          window.localStorage.setItem(
            storageKey(orientation),
            JSON.stringify({ lesson: lessonSize, editor: editorSize }),
          );
        }}
      >
        <ResizablePanel
          id={lessonPanelId}
          defaultSize="50%"
          minSize={stacked ? "18%" : 240}
          className="h-full"
          style={{ overflow: "hidden" }}
        >
          {lesson}
        </ResizablePanel>
        <ResizableHandle
          withHandle
          aria-label="Resize the lesson and the editor"
          className={
            stacked
              ? "z-20 cursor-row-resize transition-colors hover:bg-foreground/30 data-[separator=active]:bg-foreground/45 aria-[orientation=horizontal]:h-1.5"
              : "z-20 w-1.5 cursor-col-resize transition-colors hover:bg-foreground/30 data-[separator=active]:bg-foreground/45"
          }
        />
        <ResizablePanel
          id={editorPanelId}
          defaultSize="50%"
          minSize={stacked ? "24%" : 320}
          className="h-full"
          style={{ overflow: "hidden" }}
        >
          {editor}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

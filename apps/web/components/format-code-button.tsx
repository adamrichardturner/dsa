"use client";

import { useState, type RefObject } from "react";
import { Broom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CodeEditorInstance } from "@/components/editor";
import { formatTypeScript } from "@/lib/format-typescript";

const formatEditor = async (instance: CodeEditorInstance): Promise<boolean> => {
  const model = instance.getModel();
  if (model === null) {
    return false;
  }
  const position = instance.getPosition();
  const cursorOffset = position === null ? 0 : model.getOffsetAt(position);
  const source = model.getValue();
  const result = await formatTypeScript(source, cursorOffset);
  const current = instance.getModel();
  if (current !== model || model.getValue() !== source) {
    return true;
  }
  if (result.formatted === source) {
    instance.focus();
    return true;
  }
  instance.executeEdits("format", [
    {
      range: model.getFullModelRange(),
      text: result.formatted,
      forceMoveMarkers: true,
    },
  ]);
  instance.pushUndoStop();
  const length = model.getValue().length;
  const offset = Math.min(Math.max(result.cursorOffset, 0), length);
  instance.setPosition(model.getPositionAt(offset));
  instance.focus();
  return true;
};

const buttonLabel = (formatting: boolean, failed: boolean): string => {
  if (formatting) {
    return "Formatting code";
  }
  if (failed) {
    return "Could not format this code";
  }
  return "Format code";
};

export function FormatCodeButton({
  editorRef,
}: {
  readonly editorRef: RefObject<CodeEditorInstance | null>;
}) {
  const [formatting, setFormatting] = useState(false);
  const [failed, setFailed] = useState(false);
  const label = buttonLabel(formatting, failed);

  const onFormat = async () => {
    const instance = editorRef.current;
    if (instance === null) {
      return;
    }
    setFormatting(true);
    setFailed(false);
    try {
      const formatted = await formatEditor(instance);
      if (!formatted) {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setFormatting(false);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={formatting}
              aria-label={label}
              className="text-current hover:bg-current/10 hover:text-current focus-visible:text-current active:text-current aria-expanded:bg-current/10 aria-expanded:text-current"
              onClick={() => {
                void onFormat();
              }}
            />
          }
        >
          {formatting ? <Spinner className="size-3.5" /> : <Broom />}
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
      <span className="sr-only" aria-live="polite">
        {failed ? "Could not format this code" : ""}
      </span>
    </>
  );
}

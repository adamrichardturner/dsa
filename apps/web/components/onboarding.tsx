"use client";

import { useState } from "react";
import { useMutation } from "urql";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { COMPLETE_ONBOARDING, SET_AUDIT_MODE } from "@/lib/operations";
import type { User } from "@/lib/types";

interface OnboardingStep {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly figure: string;
}

const steps: readonly OnboardingStep[] = [
  {
    title: "A path of short lessons",
    figure: "Screenshot of a lesson beside the editor",
    paragraphs: [
      "Each lesson is a short reading and one exercise. You write a function in the editor, then submit it. The tests say straight away whether it passed.",
      "A pass earns points and opens the next lesson. The green tick stays, so you can see what is finished.",
    ],
  },
  {
    title: "When an attempt does not pass",
    figure: "Screenshot of the solution explanation",
    paragraphs: [
      "After the first submission that fails, a prompt appears on the lesson. Open the solution explanation and read it through. Diagrams and a runnable example show how the answer is built.",
      "Close it when you want to keep trying. The prompt stays until the lesson passes.",
    ],
  },
  {
    title: "Skip a lesson, then come back",
    figure: "Screenshot of a skipped lesson on the syllabus",
    paragraphs: [
      "At the end of the explanation you can skip the lesson. Skipping opens the next one so you are not stuck.",
      "A skip is not a pass. It earns no points. The lesson stays on your record, and you can return to it whenever you want the points.",
    ],
  },
  {
    title: "Your progress stays with the account",
    figure: "Screenshot of the progress page",
    paragraphs: [
      "The progress page shows the lessons you have passed, the lessons you skipped, and the topics that still need a pass.",
      "Use it to choose the next session. A skipped lesson is listed there until you complete it.",
    ],
  },
  {
    title: "Follow the path, or open any lesson",
    figure: "Screenshot of audit mode on the syllabus",
    paragraphs: [
      "Audit mode lets you open any lesson without finishing the ones before it. Leave it off to work in order.",
      "You can change this later at the top of the syllabus. Skipped lessons still earn no points either way.",
    ],
  },
];

function OnboardingFigure({ caption }: { readonly caption: string }) {
  return (
    <div
      role="img"
      aria-label={caption}
      className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/40 bg-muted px-6 text-center"
    >
      <p className="text-sm font-medium">{caption}</p>
      <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
        Placeholder. Replace this panel with a cropped screenshot of the app.
      </p>
    </div>
  );
}

export function Onboarding() {
  const { settled, user, updateUser } = useAuth();
  const [index, setIndex] = useState(0);
  const [auditMode, setAuditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [, completeOnboarding] = useMutation<{ completeOnboarding: User }>(
    COMPLETE_ONBOARDING,
  );
  const [, setAudit] = useMutation<{ setAuditMode: User }>(SET_AUDIT_MODE);

  if (!settled || user === null || user.onboardingCompleted) {
    return null;
  }

  const step = steps[index];
  if (step === undefined) {
    return null;
  }

  const last = index === steps.length - 1;

  const applyAudit = async (): Promise<boolean> => {
    if (!auditMode) {
      return true;
    }
    const audit = await setAudit({ enabled: true });
    const saved = audit.data?.setAuditMode;
    if (audit.error !== undefined || saved === undefined) {
      setError(graphqlErrorMessage(audit.error, "Could not turn on audit mode."));
      return false;
    }
    updateUser(saved);
    return true;
  };

  const finish = async () => {
    setPending(true);
    setError(null);
    const ready = await applyAudit();
    if (!ready) {
      setPending(false);
      return;
    }
    const response = await completeOnboarding({});
    const next = response.data?.completeOnboarding;
    setPending(false);
    if (response.error !== undefined || next === undefined) {
      setError(graphqlErrorMessage(response.error, "Could not finish the introduction."));
      return;
    }
    updateUser(next);
  };

  return (
    <Dialog open>
      <DialogContent className="max-h-[min(90vh,760px)] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <div className="space-y-5 p-6">
          <p className="text-xs tracking-wide text-muted-foreground">
            {index + 1} of {steps.length}
          </p>
          <OnboardingFigure caption={step.figure} />
          <div className="space-y-3">
            <DialogTitle>{step.title}</DialogTitle>
            <DialogDescription className="sr-only">{step.paragraphs[0]}</DialogDescription>
            {step.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
          {last ? (
            <label className="flex items-center justify-between gap-4 rounded-xl bg-muted px-4 py-3">
              <span className="text-sm font-medium">Turn on audit mode</span>
              <Switch
                checked={auditMode}
                disabled={pending}
                aria-label="Turn on audit mode"
                onCheckedChange={setAuditMode}
              />
            </label>
          ) : null}
          {error !== null ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-10 px-5"
              disabled={index === 0 || pending}
              onClick={() => {
                setError(null);
                setIndex(index - 1);
              }}
            >
              Back
            </Button>
            {last ? (
              <Button
                type="button"
                size="lg"
                className="h-10 px-5"
                disabled={pending}
                onClick={() => {
                  void finish();
                }}
              >
                {pending ? "Saving…" : "Start the course"}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                className="h-10 px-5"
                onClick={() => {
                  setError(null);
                  setIndex(index + 1);
                }}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

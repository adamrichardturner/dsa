"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "urql";
import { SAVE_PROGRESS } from "@/lib/operations";

const saveDelayMs = 1500;
const retryDelayMs = 4000;
const maxAttempts = 3;

export function useLessonDraft({
  problemId,
  code,
  armed,
}: {
  readonly problemId: string | null;
  readonly code: string;
  readonly armed: boolean;
}) {
  const [, saveProgress] = useMutation<{ saveProgress: boolean }>(SAVE_PROGRESS);
  const saveProgressRef = useRef(saveProgress);
  const latest = useRef<Record<string, string>>({});
  const saved = useRef<Record<string, string>>({});
  const problemIdRef = useRef<string | null>(null);
  const codeRef = useRef(code);
  const sending = useRef(false);
  const queued = useRef<string | null>(null);
  const [tick, setTick] = useState(0);

  saveProgressRef.current = saveProgress;

  const persistRef = useRef<(id: string, attempt?: number) => Promise<void>>(
    async () => {},
  );

  persistRef.current = async (id: string, attempt = 0) => {
    const snapshot = latest.current[id];
    if (snapshot === undefined || saved.current[id] === snapshot) {
      return;
    }

    queued.current = id;
    if (sending.current) {
      return;
    }

    sending.current = true;

    while (queued.current !== null) {
      const nextId: string = queued.current;
      queued.current = null;
      const nextCode = latest.current[nextId];
      if (nextCode === undefined || saved.current[nextId] === nextCode) {
        continue;
      }

      const response = await saveProgressRef.current({
        problemId: nextId,
        code: nextCode,
      });

      if (response.error != null) {
        if (attempt < maxAttempts - 1) {
          window.setTimeout(() => {
            void persistRef.current(nextId, attempt + 1);
          }, retryDelayMs);
        }
        break;
      }

      saved.current[nextId] = nextCode;
      const caughtUp = latest.current[nextId] === nextCode;
      if (caughtUp && problemIdRef.current === nextId) {
        setTick((value) => value + 1);
      }
      if (!caughtUp && queued.current === nextId) {
        continue;
      }
      if (!caughtUp) {
        break;
      }
    }

    sending.current = false;
  };

  const remember = useCallback((id: string, baseline: string) => {
    problemIdRef.current = id;
    codeRef.current = baseline;
    latest.current[id] = baseline;
    saved.current[id] = baseline;
  }, []);

  const track = useCallback((next: string) => {
    codeRef.current = next;
    const id = problemIdRef.current;
    if (id === null) {
      return;
    }
    latest.current[id] = next;
  }, []);

  const isClean = useCallback((id: string) => {
    const current = latest.current[id];
    if (current === undefined) {
      return true;
    }
    return saved.current[id] === current;
  }, []);

  const readCode = useCallback((id: string) => latest.current[id] ?? null, []);

  useEffect(() => {
    if (!armed || problemId === null) {
      return;
    }

    latest.current[problemId] = code;
    codeRef.current = code;
    if (saved.current[problemId] === code) {
      return;
    }

    const timer = window.setTimeout(() => {
      void persistRef.current(problemId);
    }, saveDelayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [armed, code, problemId]);

  useEffect(() => {
    return () => {
      const id = problemIdRef.current;
      if (id === null) {
        return;
      }
      void persistRef.current(id);
    };
  }, [problemId]);

  useEffect(() => {
    const onLeave = () => {
      const id = problemIdRef.current;
      if (id === null) {
        return;
      }
      void persistRef.current(id);
    };

    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
    };
  }, []);

  return { tick, remember, track, isClean, readCode };
}

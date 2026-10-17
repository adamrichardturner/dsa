"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const visibleMs = 2400;

export function ProgressSaved({ tick }: { readonly tick: number }) {
  const reduceMotion = useReducedMotion() === true;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (tick === 0) {
      return;
    }

    setOpen(true);
    const timer = window.setTimeout(() => {
      setOpen(false);
    }, visibleMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [tick]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key={tick}
          role="status"
          aria-live="polite"
          className="mr-6 flex items-center gap-2 text-xs text-muted-foreground"
          initial={reduceMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 30, mass: 0.7 }
          }
        >
          <span className="relative flex size-2.5 shrink-0 items-center justify-center">
            <motion.span
              aria-hidden="true"
              className="absolute size-2.5 rounded-full bg-emerald-400/70"
              initial={reduceMotion ? false : { scale: 0.5, opacity: 0.9 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }
              }
            />
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_1px] shadow-emerald-500/80"
            />
          </span>
          Progress Saved
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

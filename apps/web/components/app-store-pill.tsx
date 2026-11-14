"use client";

import { animate, motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import type { MouseEvent } from "react";
import { iosApp } from "@/lib/site";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SECTION_ID = "app";
const HEADING_ID = "app-heading";

/** Glides the window to the app section, landing where `scroll-mt-20` would. */
function glideToApp(reduceMotion: boolean): void {
  const section = document.getElementById(SECTION_ID);
  if (!section) return;

  const offset = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
  const target = section.getBoundingClientRect().top + window.scrollY - offset;
  const start = window.scrollY;
  const distance = Math.abs(target - start);

  const settle = () => {
    history.replaceState(null, "", `#${SECTION_ID}`);
    document.getElementById(HEADING_ID)?.focus({ preventScroll: true });
  };

  if (reduceMotion || distance < 2) {
    window.scrollTo({ top: target, behavior: "auto" });
    settle();
    return;
  }

  // Native smooth scrolling would fight a JS-driven one, so pause it.
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  // Longer trips get a little more time, but never feel sluggish.
  const duration = Math.min(1.4, Math.max(0.7, distance / 2200));

  const controls = animate(start, target, {
    duration,
    ease: [0.65, 0, 0.35, 1],
    onUpdate: (y) => window.scrollTo(0, y),
    onComplete: () => {
      root.style.scrollBehavior = previous;
      settle();
    },
  });

  // Let the reader take over: any wheel, touch or key stops the glide.
  const cancel = () => {
    controls.stop();
    root.style.scrollBehavior = previous;
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
  };
  window.addEventListener("wheel", cancel, { passive: true, once: true });
  window.addEventListener("touchstart", cancel, { passive: true, once: true });
  window.addEventListener("keydown", cancel, { once: true });
  controls.then(() => {
    window.removeEventListener("wheel", cancel);
    window.removeEventListener("touchstart", cancel);
    window.removeEventListener("keydown", cancel);
  });
}

function AppleMark() {
  return (
    <svg viewBox="0 0 384 512" className="size-3.5 fill-current" aria-hidden>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

/**
 * The hero's App Store pill. It slides in after the headline, a light sweeps
 * across it now and then, and a click glides the page down to the app section.
 */
export function AppStorePill() {
  const reduceMotion = useReducedMotion() ?? false;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!document.getElementById(SECTION_ID)) return;
    event.preventDefault();
    glideToApp(reduceMotion);
  };

  return (
    <motion.a
      href={`#${SECTION_ID}`}
      onClick={onClick}
      aria-label={`${iosApp.name} is free on the App Store for iPhone and iPad. Jump to the app section`}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.6, ease }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97, y: 0 }}
      className="group relative inline-flex max-w-full items-center gap-3 overflow-hidden rounded-full border bg-card/80 py-1.5 pr-3 pl-1.5 text-sm shadow-sm backdrop-blur transition-[border-color,box-shadow] duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {/* The sweep of light. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent dark:via-emerald-300/15"
        initial={{ x: "0%" }}
        animate={reduceMotion ? undefined : { x: ["0%", "450%"] }}
        transition={{
          delay: 1.1,
          duration: 1.6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 2.8,
        }}
      />

      <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-foreground py-1 pr-2.5 pl-2 text-xs font-semibold text-background">
        <AppleMark />
        Free
      </span>

      <span className="relative flex min-w-0 items-center gap-2">
        <span className="relative flex size-2 shrink-0" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span className="truncate font-medium">
          App Store{" "}
          <span className="text-muted-foreground">
            · <span className="sm:hidden">iOS</span>
            <span className="hidden sm:inline">iPhone &amp; iPad</span>
          </span>
        </span>
      </span>

      <motion.span
        aria-hidden
        className="relative flex shrink-0"
        animate={reduceMotion ? undefined : { y: [0, 3, 0] }}
        transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.6 }}
      >
        <ArrowDown className="size-4 text-muted-foreground transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
      </motion.span>
    </motion.a>
  );
}

"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Check, Smartphone, Tablet } from "lucide-react";
import { iosApp } from "@/lib/site";

const SLIDE_MS = 3800;
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Shot = (typeof iosApp.screenshots)[number];

/**
 * Code glyphs drifting around the phone. Each has its own depth, so they move
 * at different speeds as the page scrolls.
 */
const glyphs = [
  { text: "O(n)", x: "2%", y: "8%", size: "text-3xl sm:text-4xl", depth: 60, duration: 7, tone: "text-emerald-600/45 dark:text-emerald-400/40" },
  { text: "{ }", x: "84%", y: "3%", size: "text-4xl sm:text-5xl", depth: -40, duration: 8, tone: "text-sky-600/40 dark:text-sky-400/40" },
  { text: "log n", x: "86%", y: "44%", size: "text-2xl sm:text-3xl", depth: 80, duration: 9, tone: "text-foreground/25" },
  { text: "=>", x: "0%", y: "50%", size: "text-4xl sm:text-5xl", depth: -70, duration: 6.5, tone: "text-amber-600/45 dark:text-amber-400/40" },
  { text: "[i]", x: "8%", y: "86%", size: "text-3xl sm:text-4xl", depth: 50, duration: 7.5, tone: "text-sky-600/40 dark:text-sky-400/35" },
  { text: "∞", x: "82%", y: "86%", size: "text-5xl sm:text-6xl", depth: -50, duration: 8.5, tone: "text-foreground/25" },
  { text: "n²", x: "46%", y: "-3%", size: "text-2xl sm:text-3xl", depth: 30, duration: 6, tone: "text-emerald-600/40 dark:text-emerald-400/35" },
] as const;

const points = [
  {
    title: "Fill the gap, not a keyboard",
    detail:
      "Each exercise is the TypeScript function with a few blanks. Drag a snippet in, or tap the blank and then the snippet.",
  },
  {
    title: "The same tests as the desk",
    detail:
      "Submit, and the API runs the hidden tests. A right blank turns green, a wrong one red, and the solution opens after two misses.",
  },
  {
    title: "Reading and articles included",
    detail:
      "The lesson reading, its diagrams, and all the articles, in light or dark mode.",
  },
  {
    title: "Sign in your way",
    detail:
      "Apple, Google, GitHub, or email and password. The phone keeps its own progress, so gap exercises never mix with the desk.",
  },
];

const devices = [
  { icon: Smartphone, label: "iPhone" },
  { icon: Tablet, label: "iPad" },
  { icon: Smartphone, label: "iPhone Duo" },
];

export function AppShowcase() {
  return (
    <section
      id="app"
      aria-labelledby="app-heading"
      className="relative mt-20 scroll-mt-20 overflow-hidden rounded-3xl border bg-muted/30"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:32px_32px] opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_50%,black,transparent)]"
      />
      <div className="relative grid items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-8 lg:px-14 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.5, ease }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            On the App Store · free
          </span>
          <h2
            id="app-heading"
            className="mt-4 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl"
          >
            The course,{" "}
            <em className="bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text pr-1 text-transparent dark:from-emerald-400 dark:to-sky-400">
              in your pocket
            </em>
          </h2>
          <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">
            {iosApp.name} for iPhone and iPad follows the same four weeks as
            this site. The phone swaps the editor for gap exercises, so a
            ten-minute wait is enough for a lesson.
          </p>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {points.map((point, index) => (
              <motion.li
                key={point.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 + index * 0.07, duration: 0.45, ease }}
                className="flex gap-3"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-foreground text-background">
                  <Check className="size-3.5" aria-hidden />
                </span>
                <span>
                  <span className="block font-medium">{point.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {point.detail}
                  </span>
                </span>
              </motion.li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Made for</span>
            {devices.map((device) => {
              const Icon = device.icon;
              return (
                <span
                  key={device.label}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 font-medium text-foreground"
                >
                  <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                  {device.label}
                </span>
              );
            })}
          </div>
          <div className="mt-8">
            <AppStoreBadge />
          </div>
        </motion.div>
        <PhoneShowcase />
      </div>
    </section>
  );
}

/**
 * The app's screens in a phone that cycles through them on its own. It pauses
 * on hover, on focus, off screen, and for readers who prefer less motion. The
 * screens either side peek out behind it.
 */
function PhoneShowcase() {
  const shots = iosApp.screenshots;
  const count = shots.length;
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const playing = !reduce && !paused && inView;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    if (!playing) {
      return;
    }
    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, SLIDE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [playing, index, count]);

  const shotAt = (offset: number): Shot => shots[(index + offset + count) % count] ?? shots[0];
  const current = shotAt(0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.6, ease }}
      className="relative mx-auto w-full max-w-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-16 bottom-28 rounded-full bg-gradient-to-tr from-emerald-500/25 via-sky-500/15 to-amber-400/20 blur-3xl"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
        {glyphs.map((glyph) => (
          <Glyph key={glyph.text} glyph={glyph} progress={scrollYProgress} still={reduce} />
        ))}
      </div>

      <div className="relative flex h-[34rem] items-center justify-center sm:h-[40rem]">
        <SidePhone shot={shotAt(-1)} side="left" />
        <SidePhone shot={shotAt(1)} side="right" />

        <motion.div
          className="relative z-10 w-[15rem] sm:w-[17.5rem]"
          animate={reduce ? undefined : { y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="rounded-[2.6rem] border border-black/10 bg-neutral-900 p-2 shadow-2xl shadow-black/30 ring-1 ring-white/10 dark:border-white/15">
            <div className="relative aspect-[1320/2868] overflow-hidden rounded-[2.1rem] bg-muted">
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.src}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, filter: "blur(4px)" }}
                  transition={{ duration: 0.7, ease }}
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="(min-width: 640px) 280px, 240px"
                    priority={index === 0}
                    className="object-cover object-top"
                  />
                </motion.div>
              </AnimatePresence>
              <span className="absolute top-2.5 left-1/2 h-[1.15rem] w-[4.6rem] -translate-x-1/2 rounded-full bg-black" />
            </div>
          </div>

          <FloatingCard className="top-20 -left-20" drift={-8} duration={4.5}>
            <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Check className="size-4" aria-hidden />
            </span>
            <span>
              <span className="block text-xs text-muted-foreground">Submitted</span>
              <span className="font-medium">5 of 5 tests pass</span>
            </span>
          </FloatingCard>
          <FloatingCard className="-right-24 bottom-28" drift={8} duration={5.5}>
            <code className="font-mono text-xs">
              <span className="text-sky-600 dark:text-sky-400">while</span> (
              <span className="rounded-md border border-emerald-500 bg-emerald-500/10 px-1.5 py-0.5">
                left &lt; right
              </span>
              )
            </code>
          </FloatingCard>
        </motion.div>
      </div>

      <div className="relative mt-2 text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.src}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="font-serif text-2xl">{current.label}</div>
            <div className="text-sm text-muted-foreground">{current.caption}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div role="tablist" aria-label="App screens" className="relative mt-4 flex justify-center gap-1.5">
        {shots.map((shot, shotIndex) => {
          const selected = shotIndex === index;
          return (
            <button
              key={shot.src}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={shot.label}
              onClick={() => setIndex(shotIndex)}
              className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                selected ? "w-10 bg-foreground/20" : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
              }`}
            >
              {selected ? (
                <motion.span
                  key={`${index}-${playing}`}
                  className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                  initial={{ width: playing ? "0%" : "100%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: playing ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

function FloatingCard({
  children,
  className,
  drift,
  duration,
}: {
  readonly children: React.ReactNode;
  readonly className: string;
  readonly drift: number;
  readonly duration: number;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <motion.div
      aria-hidden
      animate={reduce ? undefined : { y: [0, drift, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute hidden items-center gap-2 rounded-2xl border bg-card/95 px-3 py-2 text-sm shadow-xl backdrop-blur sm:flex ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SidePhone({ shot, side }: { readonly shot: Shot; readonly side: "left" | "right" }) {
  const left = side === "left";
  return (
    <div
      aria-hidden
      className={`absolute top-1/2 hidden w-[11.5rem] -translate-y-1/2 sm:block ${left ? "left-0 -rotate-[8deg]" : "right-0 rotate-[8deg]"}`}
    >
      <div className="rounded-[2rem] border border-black/10 bg-neutral-900 p-1.5 opacity-80 shadow-xl dark:border-white/15">
        <div className="relative aspect-[1320/2868] overflow-hidden rounded-[1.6rem] bg-muted">
          <AnimatePresence initial={false}>
            <motion.div
              key={shot.src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Image src={shot.src} alt="" fill sizes="190px" className="object-cover object-top" />
            </motion.div>
          </AnimatePresence>
          <div
            className={`absolute inset-0 from-background/50 to-transparent ${left ? "bg-gradient-to-r" : "bg-gradient-to-l"}`}
          />
        </div>
      </div>
    </div>
  );
}

function Glyph({
  glyph,
  progress,
  still,
}: {
  readonly glyph: (typeof glyphs)[number];
  readonly progress: MotionValue<number>;
  readonly still: boolean;
}) {
  const y = useTransform(progress, [0, 1], [glyph.depth, -glyph.depth]);
  return (
    <motion.span className="absolute" style={{ left: glyph.x, top: glyph.y, y: still ? 0 : y }}>
      <motion.span
        className={`block font-mono ${glyph.size} ${glyph.tone}`}
        animate={still ? undefined : { y: [0, -12, 0], rotate: [0, 6, 0] }}
        transition={{ duration: glyph.duration, repeat: Infinity, ease: "easeInOut" }}
      >
        {glyph.text}
      </motion.span>
    </motion.span>
  );
}

/** Apple's badge, drawn inline so it follows the theme. */
function AppStoreBadge() {
  return (
    <a
      href={iosApp.appStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Download ${iosApp.name} on the App Store`}
      className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-foreground px-4 text-background transition-opacity outline-none hover:opacity-85 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <svg viewBox="0 0 384 512" className="size-6 fill-current" aria-hidden>
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
      </svg>
      <span className="text-left leading-none">
        <span className="block text-[10px] font-medium opacity-80">Download on the</span>
        <span className="block text-lg font-semibold tracking-tight">App Store</span>
      </span>
    </a>
  );
}

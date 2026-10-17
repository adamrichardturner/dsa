"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const group: Variants = {
  hidden: {},
  shown: {
    transition: { staggerChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { y: 12 },
  shown: {
    y: 0,
    transition: { duration: 0.45, ease },
  },
};

const viewport = { once: true, margin: "0px 0px 12% 0px" };

export function LandingMotion({ children }: { readonly children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <motion.div className={className} variants={item} initial="hidden" whileInView="shown" viewport={viewport}>
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <motion.div className={className} variants={group} initial="hidden" whileInView="shown" viewport={viewport}>
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

import type { ReactNode } from "react";
import { LessonSidebarFrame } from "@/components/lesson-sidebar";

export default function LessonLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <LessonSidebarFrame>{children}</LessonSidebarFrame>;
}

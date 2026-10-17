import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { LessonSidebarFrame } from "@/components/lesson-sidebar";
import { sidebarStateCookie } from "@/lib/sidebar-state";

export default async function LessonLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(sidebarStateCookie)?.value === "true";

  return (
    <LessonSidebarFrame defaultOpen={defaultOpen}>{children}</LessonSidebarFrame>
  );
}

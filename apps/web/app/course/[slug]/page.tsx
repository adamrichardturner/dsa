"use client";

import { useParams } from "next/navigation";
import { Workspace } from "@/components/workspace";

export default function LessonPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params.slug === "string" ? params.slug : "";

  return <Workspace slug={slug} />;
}

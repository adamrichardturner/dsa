"use client";

import {
  SiteFooter,
  courseFooterLinks,
  legalColumn,
  type FooterColumn,
} from "@/components/site-footer";
import { useAuth } from "@/lib/auth";

export function LandingFooter() {
  const { ready, user } = useAuth();
  const columns: readonly FooterColumn[] = [
    {
      title: "Course",
      links: courseFooterLinks(user !== null),
      pending: !ready,
    },
    {
      title: "On this page",
      links: [
        { href: "#features", label: "What you get" },
        { href: "#syllabus", label: "Four weeks" },
        { href: "#articles", label: "Articles" },
        { href: "#desk", label: "How a lesson goes" },
        { href: "#faq", label: "Questions" },
      ],
    },
    legalColumn,
  ];

  return <SiteFooter columns={columns} />;
}

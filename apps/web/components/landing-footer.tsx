"use client";

import {
  SiteFooter,
  courseColumn,
  legalColumn,
  type FooterColumn,
} from "@/components/site-footer";

const columns: readonly FooterColumn[] = [
  courseColumn,
  {
    title: "On this page",
    links: [
      { href: "#features", label: "What you get" },
      { href: "#syllabus", label: "Four weeks" },
      { href: "#desk", label: "How a lesson goes" },
      { href: "#faq", label: "Questions" },
    ],
  },
  legalColumn,
];

export function LandingFooter() {
  return <SiteFooter columns={columns} />;
}

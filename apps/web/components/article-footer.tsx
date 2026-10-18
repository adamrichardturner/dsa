"use client";

import {
  SiteFooter,
  legalColumn,
  type FooterColumn,
  type FooterLink,
} from "@/components/site-footer";
import { articleTopicId, articleTopics } from "@/lib/articles/types";
import { useAuth } from "@/lib/auth";

const topicLinks: readonly FooterLink[] = [
  { href: "/articles", label: "All articles" },
  ...articleTopics.map((topic) => ({
    href: `/articles#${articleTopicId(topic)}`,
    label: topic,
  })),
];

const signedOutCourseLinks: readonly FooterLink[] = [
  { href: "/course", label: "Open the course" },
  { href: "/progress", label: "Progress" },
  { href: "/sign-up", label: "Create an account" },
  { href: "/sign-in", label: "Sign in" },
];

const signedInCourseLinks: readonly FooterLink[] = [
  { href: "/course", label: "Go to Course" },
  { href: "/progress", label: "Progress" },
];

const pendingCourseLinks: readonly FooterLink[] = [
  { href: "/course", label: "Open the course" },
  { href: "/progress", label: "Progress" },
];

const courseLinks = (
  ready: boolean,
  signedIn: boolean,
): readonly FooterLink[] => {
  if (!ready) {
    return pendingCourseLinks;
  }
  if (signedIn) {
    return signedInCourseLinks;
  }
  return signedOutCourseLinks;
};

export function ArticleFooter() {
  const { ready, user } = useAuth();
  const columns: readonly FooterColumn[] = [
    {
      title: "Course",
      links: courseLinks(ready, user !== null),
    },
    {
      title: "Topics",
      links: topicLinks,
    },
    legalColumn,
  ];

  return <SiteFooter columns={columns} />;
}

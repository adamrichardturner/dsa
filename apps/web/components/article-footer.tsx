"use client";

import {
  SiteFooter,
  courseFooterLinks,
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

export function ArticleFooter() {
  const { ready, user } = useAuth();
  const columns: readonly FooterColumn[] = [
    {
      title: "Course",
      links: courseFooterLinks(user !== null),
      pending: !ready,
    },
    {
      title: "Topics",
      links: topicLinks,
    },
    legalColumn,
  ];

  return <SiteFooter columns={columns} />;
}

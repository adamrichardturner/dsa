"use client";

import {
  SiteFooter,
  courseFooterLinks,
  legalColumn,
  type FooterColumn,
  type FooterLink,
} from "@/components/site-footer";
import {
  articleCategories,
  articleCategoryPath,
} from "@/lib/articles/categories";
import { useAuth } from "@/lib/auth";

const topicLinks: readonly FooterLink[] = [
  { href: "/articles", label: "All articles" },
  ...articleCategories.map((category) => ({
    href: articleCategoryPath(category),
    label: category.title,
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
      title: "Categories",
      links: topicLinks,
    },
    legalColumn,
  ];

  return <SiteFooter columns={columns} />;
}

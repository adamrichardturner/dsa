"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";
import { Skeleton } from "@/components/ui/skeleton";
import {
  contactEmail,
  creatorName,
  creatorUrl,
  siteDescription,
  siteDomain,
  siteName,
} from "@/lib/site";

const linkClass =
  "text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline";

export type FooterLink = {
  readonly href: string;
  readonly label: string;
};

export type FooterColumn = {
  readonly title: string;
  readonly links: readonly FooterLink[];
  readonly pending?: boolean;
};

const courseSkeletonWidths = ["w-28", "w-16", "w-36", "w-14"] as const;

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

export function courseFooterLinks(signedIn: boolean): readonly FooterLink[] {
  if (signedIn) {
    return signedInCourseLinks;
  }

  return signedOutCourseLinks;
}

export const legalColumn: FooterColumn = {
  title: "Legal",
  links: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

function londonYear(now: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    timeZone: "Europe/London",
  }).format(now);
}

let currentYear: string | null = null;

const subscribeYear = (): (() => void) => {
  return () => {};
};

const readYear = (): string => {
  if (currentYear !== null) {
    return currentYear;
  }
  currentYear = londonYear(new Date());
  return currentYear;
};

const readServerYear = (): string => {
  return "";
};

function FooterAnchor({ href, label }: FooterLink) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={linkClass}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass}>
      {label}
    </Link>
  );
}

function FooterLinkItems({
  links,
  pending,
}: {
  readonly links: readonly FooterLink[];
  readonly pending: boolean;
}) {
  if (pending) {
    return courseSkeletonWidths.map((width) => (
      <li key={width}>
        <Skeleton className={cn("h-4", width)} />
      </li>
    ));
  }

  return links.map((link) => (
    <li key={link.href}>
      <FooterAnchor href={link.href} label={link.label} />
    </li>
  ));
}

function FooterLinks({ title, links, pending = false }: FooterColumn) {
  return (
    <nav aria-label={title} aria-busy={pending}>
      <p className="font-mono text-xs tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        <FooterLinkItems links={links} pending={pending} />
      </ul>
    </nav>
  );
}

export function SiteFooter({
  columns,
}: {
  readonly columns: readonly FooterColumn[];
}) {
  const year = useSyncExternalStore(subscribeYear, readYear, readServerYear);
  const yearLabel = year.length > 0 ? ` ${year}` : "";

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 lg:col-span-5">
            <p className="font-serif text-3xl tracking-tight">{siteName}</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteDescription}
            </p>
            <p className="text-sm text-muted-foreground">{siteDomain}</p>
            <a
              href={creatorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 font-serif text-lg tracking-tight text-foreground underline-offset-4 hover:underline"
            >
              Made by {creatorName}
              <ArrowUpRight
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
            <p>
              <a href={`mailto:${contactEmail}`} className={linkClass}>
                {contactEmail}
              </a>
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            {columns.map((column) => (
              <FooterLinks
                key={column.title}
                title={column.title}
                links={column.links}
                pending={column.pending}
              />
            ))}
          </div>
        </div>
        <p className="mt-14 border-t pt-6 text-sm text-muted-foreground">
          Copyright ©{yearLabel} {creatorName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

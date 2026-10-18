"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowUpRight } from "lucide-react";
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

type FooterLink = {
  readonly href: string;
  readonly label: string;
};

type FooterColumn = {
  readonly title: string;
  readonly links: readonly FooterLink[];
};

const columns: readonly FooterColumn[] = [
  {
    title: "Course",
    links: [
      { href: "/course", label: "Open the course" },
      { href: "/progress", label: "Progress" },
      { href: "/sign-up", label: "Create an account" },
      { href: "/sign-in", label: "Sign in" },
    ],
  },
  {
    title: "On this page",
    links: [
      { href: "#features", label: "What you get" },
      { href: "#syllabus", label: "Four weeks" },
      { href: "#desk", label: "How a lesson goes" },
      { href: "#faq", label: "Questions" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

type LondonStamp = {
  readonly year: string;
  readonly label: string;
  readonly iso: string;
};

function londonStamp(now: Date): LondonStamp {
  const timeZone = "Europe/London";
  const year = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    timeZone,
  }).format(now);
  const label = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(now);
  const iso = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).format(now);

  return { year, label, iso };
}

const emptyStamp: LondonStamp = {
  year: "",
  label: "",
  iso: "",
};

const subscribeLondonStamp = (): (() => void) => {
  return () => {};
};

let currentStamp: LondonStamp | null = null;

const readLondonStamp = (): LondonStamp => {
  if (currentStamp !== null) {
    return currentStamp;
  }
  currentStamp = londonStamp(new Date());
  return currentStamp;
};

const readServerLondonStamp = (): LondonStamp => {
  return emptyStamp;
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

function FooterLinks({ title, links }: FooterColumn) {
  return (
    <nav aria-label={title}>
      <p className="font-mono text-xs tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <FooterAnchor href={link.href} label={link.label} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function LandingFooter() {
  const stamp = useSyncExternalStore(
    subscribeLondonStamp,
    readLondonStamp,
    readServerLondonStamp,
  );
  const year = stamp.year.length > 0 ? ` ${stamp.year}` : "";

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
              />
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright ©{year} {creatorName}. All rights reserved.
          </p>
          {stamp.label.length === 0 ? null : (
            <time dateTime={stamp.iso}>{stamp.label}</time>
          )}
        </div>
      </div>
    </footer>
  );
}

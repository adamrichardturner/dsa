"use client";

import Link from "next/link";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageMain } from "@/components/page-frame";
import type { NotificationCentre } from "@/lib/types";

const formatWhen = (iso: string, now: Date): string => {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return "";
  }
  const delta = now.getTime() - parsed;
  const hour = 3_600_000;
  const day = 86_400_000;
  if (delta < hour) {
    return "Just now";
  }
  if (delta < day) {
    const hours = Math.floor(delta / hour);
    if (hours <= 1) {
      return "1 hour ago";
    }
    return `${hours} hours ago`;
  }
  const days = Math.floor(delta / day);
  if (days <= 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  return new Date(parsed).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const kindLabel = (kind: string): string => {
  if (kind === "habit") {
    return "Study habit";
  }
  return "Achievement";
};

const hrefLabel = (href: string): string => {
  if (href.startsWith("/course/")) {
    return "Continue";
  }
  if (href === "/progress") {
    return "See progress";
  }
  if (href === "/articles") {
    return "Read articles";
  }
  return "Open";
};

export function NotificationBoard({
  centre,
  freshIds,
  pending,
  actionError,
  onDismiss,
  onClear,
}: {
  readonly centre: NotificationCentre;
  readonly freshIds: Record<string, true>;
  readonly pending: boolean;
  readonly actionError: string | null;
  readonly onDismiss: (id: string) => void;
  readonly onClear: () => void;
}) {
  const now = new Date();

  return (
    <PageMain className="space-y-8 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <Badge variant="secondary">Notifications</Badge>
          <h1 className="font-serif text-4xl tracking-tight">Notes from the course.</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            A finished lesson, a short streak, or a week away. They stay until you dismiss them.
          </p>
        </div>
        {centre.items.length === 0 ? null : (
          <Button variant="outline" size="sm" disabled={pending} onClick={onClear}>
            Clear all
          </Button>
        )}
      </div>
      {actionError === null ? null : (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      )}
      {centre.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing waiting.</p>
      ) : (
        <ul className="space-y-3">
          {centre.items.map((item) => {
            const fresh = freshIds[item.id] === true;
            const when = formatWhen(item.createdAt, now);
            return (
              <li key={item.id}>
                <Card size="sm">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardDescription>{kindLabel(item.kind)}</CardDescription>
                      <div className="flex items-center gap-2">
                        {fresh ? <Badge>New</Badge> : null}
                        {when.length === 0 ? null : (
                          <span className="text-xs text-muted-foreground">{when}</span>
                        )}
                      </div>
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                    <div
                      className={cn(
                        "flex items-center gap-3",
                        item.href === null ? "justify-end" : "justify-between",
                      )}
                    >
                      {item.href === null ? null : (
                        <Link
                          href={item.href}
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                        >
                          {hrefLabel(item.href)}
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        aria-label={`Dismiss ${item.title}`}
                        onClick={() => onDismiss(item.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </PageMain>
  );
}

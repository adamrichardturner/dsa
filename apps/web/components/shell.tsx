"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "cn";
import { AccountMenu } from "@/components/account-menu";
import { DesktopNotice } from "@/components/desktop-notice";
import { ArticleFooter } from "@/components/article-footer";
import { InfinityIcon } from "@/components/infinity-icon";
import { Onboarding } from "@/components/onboarding";
import { LandingFooter } from "@/components/landing-footer";
import { MobileMenu } from "@/components/landing-menu";
import { ThemeSwitch } from "@/components/theme-switch";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { siteName, siteShortName } from "@/lib/site";

interface NavLink {
  readonly href: string;
  readonly label: string;
  readonly signedInOnly: boolean;
}

const navLinks: readonly NavLink[] = [
  { href: "/course", label: "Course", signedInOnly: true },
  { href: "/progress", label: "Progress", signedInOnly: true },
  { href: "/articles", label: "Articles", signedInOnly: false },
];

function PageFooter({ pathname }: { readonly pathname: string }) {
  if (pathname === "/") {
    return <LandingFooter />;
  }

  if (pathname === "/articles" || pathname.startsWith("/articles/")) {
    return <ArticleFooter />;
  }

  return (
    <footer className="mt-auto border-t px-6 py-6">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>{siteName}</p>
        <nav className="flex gap-4" aria-label="Legal">
          <Link
            href="/privacy"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function Shell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const { ready, user } = useAuth();
  const workspace = pathname.startsWith("/course/");
  const coursePage = pathname === "/course" || workspace;
  const visibleLinks = navLinks.filter((link) => {
    if (!link.signedInOnly) {
      return true;
    }
    return ready && user !== null;
  });

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        workspace && "min-[1024px]:h-screen min-[1024px]:overflow-hidden",
      )}
    >
      <header className="sticky top-0 z-40 flex h-14 shrink-0 flex-nowrap items-center justify-between gap-x-3 border-b bg-background px-3 md:static md:z-auto md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            title={siteName}
            className="flex min-w-0 items-center gap-2 px-2 font-serif text-base leading-tight tracking-tight sm:text-lg"
          >
            <span className="sm:hidden">{siteShortName}</span>
            <span className="hidden truncate sm:inline">{siteName}</span>
            <InfinityIcon animate />
          </Link>
          {ready ? (
            <nav className="hidden items-center md:flex">
              {visibleLinks.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      buttonVariants({
                        variant: active ? "secondary" : "ghost",
                        size: "sm",
                      }),
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <ThemeSwitch />
            <AccountMenu />
          </div>
          <MobileMenu />
        </div>
      </header>
      {coursePage ? <DesktopNotice /> : null}
      <div
        className={cn(
          coursePage && "max-[1023px]:hidden",
          workspace && "flex min-h-0 flex-1 flex-col",
        )}
      >
        {children}
      </div>
      {workspace ? null : <PageFooter pathname={pathname} />}
      <Onboarding />
    </div>
  );
}

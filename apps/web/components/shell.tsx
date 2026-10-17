"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "cn";
import { AccountMenu } from "@/components/account-menu";
import { DesktopNotice } from "@/components/desktop-notice";
import { LandingFooter } from "@/components/landing-footer";
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

function PageFooter({ home }: { readonly home: boolean }) {
  if (home) {
    return <LandingFooter />;
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
  const { user } = useAuth();
  const workspace = pathname.startsWith("/course/");
  const coursePage = pathname === "/course" || workspace;
  const visibleLinks = navLinks.filter(
    (link) => !link.signedInOnly || user !== null,
  );

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        workspace && "min-[1024px]:h-screen min-[1024px]:overflow-hidden",
      )}
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b bg-background px-3 py-2 sm:h-14 sm:flex-nowrap sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            title={siteName}
            className="flex min-w-0 items-center gap-2 px-2 font-serif text-base leading-tight tracking-tight sm:text-lg"
          >
            <span className="sm:hidden">{siteShortName}</span>
            <span className="hidden truncate sm:inline">{siteName}</span>
            <span
              aria-hidden="true"
              className="inline-block size-9 shrink-0 bg-foreground"
              style={{
                maskImage: "url(/icon.svg)",
                WebkitMaskImage: "url(/icon.svg)",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                maskSize: "contain",
                WebkitMaskSize: "contain",
              }}
            />
          </Link>
          <nav className="flex items-center">
            {visibleLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
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
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeSwitch />
          <AccountMenu />
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
      {workspace ? null : <PageFooter home={pathname === "/"} />}
    </div>
  );
}

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
import { pageFrameClassName } from "@/components/page-frame";
import { buttonVariants } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/lib/auth";
import { courseAccessOpen } from "@/lib/verification";
import { isEmbedPath } from "@/lib/embed";
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

const authRoutes: Record<string, true> = {
  "/sign-in": true,
  "/sign-up": true,
  "/forgot-password": true,
  "/reset-password": true,
  "/verify-email": true,
};

function NotificationWatcher() {
  const { ready, user } = useAuth();
  const open = ready && user !== null && courseAccessOpen(user);
  useNotifications(open, { watchNavigation: true });
  return null;
}

const isAuthRoute = (pathname: string): boolean => {
  if (authRoutes[pathname] === true) {
    return true;
  }
  return pathname.startsWith("/auth/");
};

const lessonHeaderRowClassName = "lesson-header-row w-full pl-3 pr-3";

function HeaderActions({ authPage }: { readonly authPage: boolean }) {
  if (authPage) {
    return <ThemeSwitch />;
  }

  return (
    <>
      <div className="hidden items-center gap-2 md:flex">
        <ThemeSwitch />
        <AccountMenu />
      </div>
      <MobileMenu />
    </>
  );
}

function PageFooter({ pathname }: { readonly pathname: string }) {
  if (pathname === "/") {
    return <LandingFooter />;
  }

  if (pathname === "/articles" || pathname.startsWith("/articles/")) {
    return <ArticleFooter />;
  }

  return (
    <footer className="mt-auto border-t py-6">
      <div
        className={cn(
          pageFrameClassName,
          "flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground",
        )}
      >
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
  if (isEmbedPath(pathname)) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-foreground" data-chrome="none">
        {children}
      </div>
    );
  }
  const lessonPage = pathname.startsWith("/course/");
  const coursePage = pathname === "/course" || lessonPage;
  const authPage = isAuthRoute(pathname);
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
        lessonPage && "lesson-shell",
        lessonPage && "min-[1024px]:h-screen min-[1024px]:overflow-hidden",
      )}
    >
      <header className="sticky top-0 z-40 shrink-0 border-b bg-background md:static md:z-auto">
        <div
          className={cn(
            "flex h-14 flex-nowrap items-center justify-between gap-x-3",
            lessonPage ? lessonHeaderRowClassName : pageFrameClassName,
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/"
              title={siteName}
              className="-ml-2 flex min-w-0 items-center gap-2 px-2 font-serif text-base leading-tight tracking-tight sm:text-lg"
            >
              <span className="sm:hidden">{siteShortName}</span>
              <span className="hidden truncate sm:inline">{siteName}</span>
              <InfinityIcon animate />
            </Link>
            {ready && !authPage ? (
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
            <HeaderActions authPage={authPage} />
          </div>
        </div>
      </header>
      {coursePage ? <DesktopNotice /> : null}
      <div
        className={cn(
          coursePage && "max-[1023px]:hidden",
          lessonPage && "flex min-h-0 flex-1 flex-col",
        )}
      >
        {children}
      </div>
      {lessonPage ? null : <PageFooter pathname={pathname} />}
      <NotificationWatcher />
      <Onboarding />
    </div>
  );
}

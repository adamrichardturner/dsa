"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { useMutation } from "urql";
import { cn } from "cn";
import {
  BookOpen,
  ChartColumn,
  CircleQuestionMark,
  Columns2,
  Gauge,
  GraduationCap,
  Hash,
  House,
  Layers,
  Library,
  List,
  LogOut,
  Menu,
  Network,
  Rows3,
  Search,
  Settings,
  Shapes,
  Shield,
  X,
  type LucideIcon,
} from "lucide-react";
import { LandingActions } from "@/components/landing-actions";
import { InfinityIcon } from "@/components/infinity-icon";
import { ThemeSwitch } from "@/components/theme-switch";
import { UserAvatar } from "@/components/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { articleTopicId, type ArticleTopic } from "@/lib/articles/types";
import { SIGN_OUT } from "@/lib/operations";
import { siteName } from "@/lib/site";

interface MenuLink {
  readonly href: string;
  readonly label: string;
  readonly detail: string;
  readonly icon: LucideIcon;
}

const pageLinks: readonly MenuLink[] = [
  {
    href: "#features",
    label: "What you get",
    detail: "The editor, the tests, the ticks",
    icon: BookOpen,
  },
  {
    href: "#syllabus",
    label: "Four weeks",
    detail: "Foundations through patterns",
    icon: Layers,
  },
  {
    href: "#articles",
    label: "Articles",
    detail: "The terms, with a diagram",
    icon: Library,
  },
  {
    href: "#desk",
    label: "How a lesson goes",
    detail: "Read, write, submit",
    icon: Columns2,
  },
  {
    href: "#faq",
    label: "Questions",
    detail: "Short answers, in the open",
    icon: CircleQuestionMark,
  },
];

const homeLink: MenuLink = {
  href: "/",
  label: "Home",
  detail: "The course, in four weeks",
  icon: House,
};

const articlesLink: MenuLink = {
  href: "/articles",
  label: "Articles",
  detail: "Explainers for the terms",
  icon: Library,
};

const accountLinks: readonly MenuLink[] = [
  {
    href: "/course",
    label: "Course",
    detail: "The lesson you left",
    icon: GraduationCap,
  },
  {
    href: "/progress",
    label: "Progress",
    detail: "What still needs a pass",
    icon: ChartColumn,
  },
  {
    href: "/settings",
    label: "Settings",
    detail: "Name, email, and password",
    icon: Settings,
  },
];

const adminLink: MenuLink = {
  href: "/admin",
  label: "Admin",
  detail: "Accounts and the course",
  icon: Shield,
};

const subscribeHash = (onStoreChange: () => void): (() => void) => {
  window.addEventListener("hashchange", onStoreChange);
  return () => {
    window.removeEventListener("hashchange", onStoreChange);
  };
};

const readHash = (): string => {
  return window.location.hash.replace(/^#/, "");
};

const readServerHash = (): string => {
  return "";
};

const itemClass = (current: boolean): string => {
  return cn(
    "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px",
    current
      ? "bg-foreground text-background"
      : "hover:bg-muted active:bg-muted",
  );
};

const articleSectionMeta: readonly {
  readonly topic: ArticleTopic;
  readonly detail: string;
  readonly icon: LucideIcon;
}[] = [
  { topic: "Cost", detail: "Time, space, and Big O", icon: Gauge },
  { topic: "Arrays", detail: "Indexed sequences", icon: Rows3 },
  { topic: "Hash maps", detail: "Keys and the buckets behind them", icon: Hash },
  { topic: "Linear structures", detail: "Lists, stacks, and queues", icon: List },
  {
    topic: "Search and sort",
    detail: "Finding a value, and ordering them",
    icon: Search,
  },
  { topic: "Trees and graphs", detail: "Nodes, edges, and walks", icon: Network },
  { topic: "Patterns", detail: "Greedy, search, and memory", icon: Shapes },
];

const articleSections: readonly MenuLink[] = articleSectionMeta.map((item) => ({
  href: `#${articleTopicId(item.topic)}`,
  label: item.topic,
  detail: item.detail,
  icon: item.icon,
}));

const sectionsForPath = (pathname: string): readonly MenuLink[] => {
  if (pathname === "/") {
    return pageLinks;
  }
  if (pathname === "/articles") {
    return articleSections;
  }
  return [];
};

const exploreLinks = (
  onHome: boolean,
  signedIn: boolean,
  isAdmin: boolean,
): readonly MenuLink[] => {
  const start = onHome ? [articlesLink] : [homeLink, articlesLink];
  if (!signedIn) {
    return start;
  }
  const withAccount = [...start, ...accountLinks];
  if (!isAdmin) {
    return withAccount;
  }
  return [...withAccount, adminLink];
};

const routeCurrent = (href: string, pathname: string): boolean => {
  return pathname === href || pathname.startsWith(`${href}/`);
};

const publishHash = (id: string): void => {
  const nextHash = `#${id}`;
  if (window.location.hash === nextHash) {
    return;
  }
  window.history.replaceState(null, "", nextHash);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
};

const scrollToSection = (id: string): void => {
  const target = document.getElementById(id);
  if (target === null) {
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector("header");
  const offset = header === null ? 0 : header.getBoundingClientRect().height + 16;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: reduce ? "auto" : "smooth",
  });
};

function MenuLabel({
  id,
  children,
}: {
  readonly id: string;
  readonly children: string;
}) {
  return (
    <p
      id={id}
      className="px-3 font-mono text-xs tracking-wide text-muted-foreground"
    >
      {children}
    </p>
  );
}

function PageLinkButton({
  link,
  index,
  current,
  onSelect,
}: {
  readonly link: MenuLink;
  readonly index: number;
  readonly current: boolean;
  readonly onSelect: (href: string) => void;
}) {
  const Icon = link.icon;
  const number = `${index + 1}`.padStart(2, "0");

  return (
    <li>
      <button
        type="button"
        className={itemClass(current)}
        aria-current={current ? "location" : undefined}
        onClick={() => {
          onSelect(link.href);
        }}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            current ? "bg-background/15" : "bg-muted text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span
              className={cn(
                "font-mono text-[11px]",
                current ? "text-background/60" : "text-muted-foreground",
              )}
            >
              {number}
            </span>
            <span className="font-serif text-lg leading-none tracking-tight">
              {link.label}
            </span>
          </span>
          <span
            className={cn(
              "mt-1 block text-xs leading-relaxed",
              current ? "text-background/70" : "text-muted-foreground",
            )}
          >
            {link.detail}
          </span>
        </span>
      </button>
    </li>
  );
}

function ExploreLinkItem({
  link,
  current,
  onSelect,
}: {
  readonly link: MenuLink;
  readonly current: boolean;
  readonly onSelect: () => void;
}) {
  const Icon = link.icon;

  return (
    <li>
      <Link
        href={link.href}
        className={itemClass(current)}
        aria-current={current ? "page" : undefined}
        onClick={onSelect}
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            current ? "bg-background/15" : "bg-muted text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-serif text-lg leading-none tracking-tight">
            {link.label}
          </span>
          <span
            className={cn(
              "mt-1 block text-xs leading-relaxed",
              current ? "text-background/70" : "text-muted-foreground",
            )}
          >
            {link.detail}
          </span>
        </span>
      </Link>
    </li>
  );
}

function MenuAccount({ onDone }: { readonly onDone: () => void }) {
  const router = useRouter();
  const { ready, user, signOut } = useAuth();
  const [, runSignOut] = useMutation(SIGN_OUT);

  const onSignOut = (): void => {
    onDone();
    void runSignOut({}).finally(() => {
      signOut();
      router.push("/");
    });
  };

  if (!ready) {
    return (
      <div className="flex flex-col gap-2" aria-hidden>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div
        className="flex flex-col gap-2 [&_a]:min-w-0 [&_a]:w-full"
        onClick={onDone}
      >
        <LandingActions />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 px-1">
        <UserAvatar
          name={user.name}
          avatarUrl={user.avatarUrl}
          className="size-10"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Button variant="outline" className="h-10 w-full" onClick={onSignOut}>
        <LogOut />
        Sign out
      </Button>
    </div>
  );
}

export function MobileMenu() {
  const pathname = usePathname();
  const { ready, user } = useAuth();
  const hash = useSyncExternalStore(subscribeHash, readHash, readServerHash);
  const pendingSection = useRef<string | null>(null);
  const [open, setOpen] = useState(false);

  const closeMenu = (): void => {
    pendingSection.current = null;
    setOpen(false);
  };

  const selectSection = (href: string): void => {
    pendingSection.current = href.replace(/^#/, "");
    setOpen(false);
  };

  const onOpenChange = (nextOpen: boolean): void => {
    if (nextOpen) {
      pendingSection.current = null;
    }
    setOpen(nextOpen);
  };

  const onOpenChangeComplete = (nextOpen: boolean): void => {
    if (nextOpen) {
      return;
    }
    const id = pendingSection.current;
    pendingSection.current = null;
    if (id === null) {
      return;
    }
    publishHash(id);
    scrollToSection(id);
  };

  const signedIn = ready && user !== null;
  const onHome = pathname === "/";
  const sections = sectionsForPath(pathname);
  const links = exploreLinks(onHome, signedIn, user !== null && user.isAdmin);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-11 shrink-0 md:hidden",
        )}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        finalFocus={() => {
          if (pendingSection.current !== null) {
            return false;
          }
          return true;
        }}
        className={cn(
          "grid h-full max-h-dvh min-h-0 w-[min(88vw,22.5rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden bg-background p-0 text-foreground shadow-2xl duration-300 ease-out sm:max-w-none",
          "data-[side=left]:data-ending-style:translate-x-[-100%]! data-[side=left]:data-starting-style:translate-x-[-100%]!",
        )}
      >
        <SheetHeader className="gap-3 border-b px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-3">
              <InfinityIcon className="size-8" />
              <SheetTitle className="text-balance font-serif text-2xl leading-tight tracking-tight text-foreground">
                {siteName}
              </SheetTitle>
            </div>
            <SheetClose
              aria-label="Close menu"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "-mt-1 -mr-1 shrink-0",
              )}
            >
              <X />
            </SheetClose>
          </div>
          <SheetDescription className="text-sm leading-relaxed">
            100% free. Four weeks of TypeScript, with an editor, tests, and
            articles.
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain px-3 py-4">
          {sections.length > 0 ? (
            <nav aria-labelledby="mobile-menu-page">
              <MenuLabel id="mobile-menu-page">On this page</MenuLabel>
              <ul className="mt-2 space-y-1">
                {sections.map((link, index) => (
                  <PageLinkButton
                    key={link.href}
                    link={link}
                    index={index}
                    current={hash === link.href.slice(1)}
                    onSelect={selectSection}
                  />
                ))}
              </ul>
            </nav>
          ) : null}
          <nav aria-labelledby="mobile-menu-explore">
            <MenuLabel id="mobile-menu-explore">Explore</MenuLabel>
            <ul className="mt-2 space-y-1">
              {links.map((link) => (
                <ExploreLinkItem
                  key={link.href}
                  link={link}
                  current={routeCurrent(link.href, pathname)}
                  onSelect={closeMenu}
                />
              ))}
            </ul>
          </nav>
        </div>
        <SheetFooter className="mt-0 gap-3 border-t p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="text-sm text-muted-foreground">Appearance</p>
            <ThemeSwitch />
          </div>
          <MenuAccount onDone={closeMenu} />
          <nav
            aria-label="Legal"
            className="flex gap-4 px-1 text-sm text-muted-foreground"
          >
            <Link
              href="/privacy"
              onClick={closeMenu}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              onClick={closeMenu}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Terms
            </Link>
          </nav>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

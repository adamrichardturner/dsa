"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { BookOpen, Lock, PanelLeft, PanelLeftClose } from "lucide-react";
import { useQuery } from "urql";
import { CompletionTick } from "@/components/completion-tick";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { MODULES_QUERY } from "@/lib/operations";
import { readSidebarOpen } from "@/lib/sidebar-state";
import type { LessonSummary, ModuleView } from "@/lib/types";

const SyllabusRefreshContext = createContext<(() => void) | null>(null);

const noop = (): void => undefined;

export function useRefreshSyllabus(): () => void {
  const refresh = useContext(SyllabusRefreshContext);
  if (refresh === null) {
    return noop;
  }
  return refresh;
}

const countCompleted = (lessons: readonly LessonSummary[]): number => {
  let count = 0;
  for (const lesson of lessons) {
    if (lesson.completed) {
      count += 1;
    }
  }
  return count;
};

const countAll = (modules: readonly ModuleView[]): number => {
  let count = 0;
  for (const courseModule of modules) {
    count += courseModule.lessons.length;
  }
  return count;
};

const countAllCompleted = (modules: readonly ModuleView[]): number => {
  let count = 0;
  for (const courseModule of modules) {
    count += countCompleted(courseModule.lessons);
  }
  return count;
};

const lessonNumber = (index: number): string =>
  String(index + 1).padStart(2, "0");

const currentSlugFrom = (pathname: string): string => {
  const parts = pathname.split("/");
  if (parts[1] !== "course") {
    return "";
  }
  return parts[2] ?? "";
};

const scrollLessonIntoView = (node: HTMLElement): void => {
  const container = node.closest("[data-sidebar='content']");
  if (!(container instanceof HTMLElement)) {
    return;
  }
  const nodeRect = node.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const above = nodeRect.top < containerRect.top;
  const below = nodeRect.bottom > containerRect.bottom;
  if (!above && !below) {
    return;
  }
  const delta =
    nodeRect.top -
    containerRect.top -
    container.clientHeight / 2 +
    nodeRect.height / 2;
  container.scrollTop += delta;
};

export function SyllabusTrigger() {
  const { open, toggleSidebar } = useSidebar();
  const Icon = open ? PanelLeftClose : PanelLeft;

  return (
    <Button
      type="button"
      variant={open ? "secondary" : "outline"}
      size="sm"
      aria-expanded={open}
      aria-controls="lesson-syllabus"
      aria-keyshortcuts="Meta+b Control+b"
      onClick={toggleSidebar}
    >
      <Icon />
      Syllabus
    </Button>
  );
}

function CloseSyllabusButton() {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  const onClose = () => {
    if (isMobile) {
      setOpenMobile(false);
      return;
    }
    setOpen(false);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Close syllabus"
      onClick={onClose}
    >
      <PanelLeftClose />
    </Button>
  );
}

function LessonMark({
  lesson,
  current,
}: {
  readonly lesson: LessonSummary;
  readonly current: boolean;
}) {
  if (lesson.completed) {
    return (
      <CompletionTick
        label={`${lesson.title} complete`}
        className="size-4"
      />
    );
  }
  if (current) {
    return (
      <span
        aria-hidden="true"
        className="size-4 shrink-0 rounded-full border-2 border-sidebar-foreground"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="size-4 shrink-0 rounded-full border-2 border-sidebar-foreground/35"
    />
  );
}

function LockedLesson({
  lesson,
  number,
}: {
  readonly lesson: LessonSummary;
  readonly number: string;
}) {
  return (
    <SidebarMenuItem>
      <Tooltip>
        <TooltipTrigger
          delay={400}
          render={<span className="block w-full" />}
        >
          <SidebarMenuButton
            type="button"
            aria-disabled={true}
            aria-label={`${lesson.title}. Locked until the previous lesson is complete.`}
          >
            <Lock />
            <span className="w-5 shrink-0 font-mono text-[11px] text-sidebar-foreground/50">
              {number}
            </span>
            <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent side="right">
          Finish the previous lesson to open this one.
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  );
}

function OpenLesson({
  lesson,
  number,
  current,
  onOpen,
  scrollCurrent,
}: {
  readonly lesson: LessonSummary;
  readonly number: string;
  readonly current: boolean;
  readonly onOpen: () => void;
  readonly scrollCurrent: (node: HTMLLIElement | null) => void;
}) {
  if (current) {
    return (
      <SidebarMenuItem ref={scrollCurrent}>
        <SidebarMenuButton
          type="button"
          isActive
          aria-current="page"
          className="bg-sidebar-accent font-medium shadow-[inset_2px_0_0_0_var(--sidebar-foreground)]"
        >
          <LessonMark lesson={lesson} current />
          <span className="w-5 shrink-0 font-mono text-[11px] text-sidebar-foreground/50">
            {number}
          </span>
          <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={false}
        render={
          <Link href={`/course/${lesson.slug}`} onClick={onOpen} />
        }
      >
        <LessonMark lesson={lesson} current={false} />
        <span className="w-5 shrink-0 font-mono text-[11px] text-sidebar-foreground/50">
          {number}
        </span>
        <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SyllabusLesson({
  lesson,
  index,
  currentSlug,
  onOpen,
  scrollCurrent,
}: {
  readonly lesson: LessonSummary;
  readonly index: number;
  readonly currentSlug: string;
  readonly onOpen: () => void;
  readonly scrollCurrent: (node: HTMLLIElement | null) => void;
}) {
  const number = lessonNumber(index);
  if (!lesson.available) {
    return <LockedLesson lesson={lesson} number={number} />;
  }
  return (
    <OpenLesson
      lesson={lesson}
      number={number}
      current={lesson.slug === currentSlug}
      onOpen={onOpen}
      scrollCurrent={scrollCurrent}
    />
  );
}

function WeekGroup({
  courseModule,
  currentSlug,
  onOpen,
  scrollCurrent,
}: {
  readonly courseModule: ModuleView;
  readonly currentSlug: string;
  readonly onOpen: () => void;
  readonly scrollCurrent: (node: HTMLLIElement | null) => void;
}) {
  const done = countCompleted(courseModule.lessons);

  return (
    <SidebarGroup className="py-1">
      <SidebarGroupLabel className="h-auto px-2 py-2 text-sidebar-foreground">
        <span className="flex w-full items-baseline justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[10px] font-medium tracking-wide text-sidebar-foreground/55 uppercase">
              Week {courseModule.weekNumber}
            </span>
            <span className="block truncate text-sm font-medium">
              {courseModule.title}
            </span>
          </span>
          <span className="shrink-0 text-xs font-normal text-sidebar-foreground/55 tabular-nums">
            {done}/{courseModule.lessons.length}
          </span>
        </span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {courseModule.lessons.map((lesson, index) => (
            <SyllabusLesson
              key={lesson.id}
              lesson={lesson}
              index={index}
              currentSlug={currentSlug}
              onOpen={onOpen}
              scrollCurrent={scrollCurrent}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SyllabusList({
  modules,
  status,
  currentSlug,
  onOpen,
}: {
  readonly modules: readonly ModuleView[];
  readonly status: "loading" | "error" | "ready";
  readonly currentSlug: string;
  readonly onOpen: () => void;
}) {
  const scrollCurrent = useCallback((node: HTMLLIElement | null) => {
    if (node === null) {
      return;
    }
    scrollLessonIntoView(node);
  }, []);

  if (status === "error") {
    return (
      <p className="px-4 py-6 text-sm text-sidebar-foreground/70">
        The syllabus could not be loaded.
      </p>
    );
  }

  if (status === "loading") {
    return (
      <div className="space-y-2 px-4 py-3" aria-hidden="true">
        {["72%", "64%", "80%", "58%", "70%", "66%"].map((width) => (
          <Skeleton key={width} className="h-8" style={{ width }} />
        ))}
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-sidebar-foreground/70">
        No lessons on the path yet.
      </p>
    );
  }

  return (
    <nav aria-label="Course syllabus">
      {modules.map((courseModule) => (
        <WeekGroup
          key={courseModule.id}
          courseModule={courseModule}
          currentSlug={currentSlug}
          onOpen={onOpen}
          scrollCurrent={scrollCurrent}
        />
      ))}
    </nav>
  );
}

function LessonSidebar({
  modules,
  status,
}: {
  readonly modules: readonly ModuleView[];
  readonly status: "loading" | "error" | "ready";
}) {
  const pathname = usePathname();
  const currentSlug = currentSlugFrom(pathname);
  const { isMobile, setOpenMobile } = useSidebar();
  const total = countAll(modules);
  const completed = countAllCompleted(modules);
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const onOpen = () => {
    if (!isMobile) {
      return;
    }
    setOpenMobile(false);
  };

  return (
    <Sidebar
      id="lesson-syllabus"
      collapsible="offcanvas"
      className="absolute h-full"
    >
      <SidebarHeader className="gap-3 border-b border-sidebar-border px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-serif text-xl tracking-tight">Syllabus</p>
            {total > 0 ? (
              <p className="text-xs text-sidebar-foreground/65">
                {completed} of {total} lessons
              </p>
            ) : (
              <p className="text-xs text-sidebar-foreground/65">
                Every lesson on the path
              </p>
            )}
          </div>
          <CloseSyllabusButton />
        </div>
        {total > 0 ? (
          <Progress
            value={percent}
            aria-label="Lessons completed"
            className="gap-0"
          />
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        <SyllabusList
          modules={modules}
          status={status}
          currentSlug={currentSlug}
          onOpen={onOpen}
        />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/course" onClick={onOpen} />}
            >
              <BookOpen />
              <span>Course overview</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="px-2 pb-1 text-[11px] leading-relaxed text-sidebar-foreground/60">
          A lesson stays locked until the one before it passes.
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function LessonSidebarFrame({
  defaultOpen,
  children,
}: {
  readonly defaultOpen: boolean;
  readonly children: ReactNode;
}) {
  const [open, setOpen] = useState(() => readSidebarOpen(defaultOpen));
  const { user } = useAuth();
  const [result, reexecute] = useQuery<{ modules: readonly ModuleView[] }>({
    query: MODULES_QUERY,
    pause: user === null,
    requestPolicy: "cache-and-network",
  });
  const refresh = useCallback(() => {
    reexecute({ requestPolicy: "network-only" });
  }, [reexecute]);

  const modules = result.data?.modules ?? [];
  const status = syllabusStatus(result.data, result.error);

  return (
    <SyllabusRefreshContext.Provider value={refresh}>
      <SidebarProvider
        open={open}
        onOpenChange={setOpen}
        className="relative h-full min-h-0 flex-1 overflow-hidden"
      >
        <LessonSidebar modules={modules} status={status} />
        <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
          {children}
        </SidebarInset>
      </SidebarProvider>
    </SyllabusRefreshContext.Provider>
  );
}

const syllabusStatus = (
  data: { readonly modules: readonly ModuleView[] } | undefined,
  error: unknown,
): "loading" | "error" | "ready" => {
  if (data !== undefined) {
    return "ready";
  }
  if (error !== undefined) {
    return "error";
  }
  return "loading";
};

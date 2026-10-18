import Link from "next/link";
import { cn } from "cn";
import type { ProblemView } from "@/lib/types";

export function ExerciseNav({
  problems,
  activeId,
  activePassed,
  hrefFor,
}: {
  readonly problems: readonly ProblemView[];
  readonly activeId: string;
  readonly activePassed: boolean;
  readonly hrefFor: (id: string) => string;
}) {
  if (problems.length < 2) {
    return null;
  }

  return (
    <ol className="space-y-2" aria-label="Exercises">
      {problems.map((item, index) => {
        const active = item.id === activeId;
        const solved = item.solved || (active && activePassed);
        return (
          <li key={item.id}>
            <Link
              href={hrefFor(item.id)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                active ? "border-foreground bg-muted" : "hover:bg-muted/60",
              )}
            >
              <span>
                <span className="mr-2 text-muted-foreground">{index + 1}</span>
                {item.title}
              </span>
              {solved ? (
                <span className="text-xs text-muted-foreground">Solved</span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

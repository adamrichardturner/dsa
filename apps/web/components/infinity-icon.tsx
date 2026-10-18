import { cn } from "cn";
import { infinityPath, infinityPathLength } from "@/components/infinity-path";

export function InfinityIcon({
  animate = false,
  className,
}: {
  readonly animate?: boolean;
  readonly className?: string;
}) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      aria-hidden="true"
      className={cn("size-9 shrink-0 text-foreground", className)}
    >
      <path
        d={infinityPath}
        pathLength={infinityPathLength}
        stroke="currentColor"
        strokeWidth={54}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? "infinity-draw" : undefined}
      />
    </svg>
  );
}

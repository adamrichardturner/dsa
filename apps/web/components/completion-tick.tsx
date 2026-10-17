import { cn } from "cn";

export function CompletionTick({
  animate = false,
  className,
  label = "Completed",
}: {
  readonly animate?: boolean;
  readonly className?: string;
  readonly label?: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex size-5 shrink-0 text-emerald-500",
        animate && "completion-tick-pop",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-full overflow-visible" aria-hidden="true">
        <circle cx="12" cy="12" r="10" className="fill-current" />
        <path
          d="M6.2 12.6 10.2 16.6 17.8 7.6"
          fill="none"
          stroke="white"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animate ? "completion-tick-draw" : undefined}
        />
      </svg>
    </span>
  );
}

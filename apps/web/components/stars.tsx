import { useId } from "react";

const starPath =
  "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z";

function StarMark({
  filled,
  gradientId,
}: {
  readonly filled: boolean;
  readonly gradientId: string;
}) {
  if (!filled) {
    return (
      <svg viewBox="0 0 24 24" className="size-6 shrink-0 text-muted-foreground/40" aria-hidden="true">
        <path d={starPath} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="size-6 shrink-0 drop-shadow-[0_1px_1px_rgb(176_112_16_/_0.35)]" aria-hidden="true">
      <path
        d={starPath}
        fill={`url(#${gradientId})`}
        stroke="#C8891A"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stars({
  value,
  max = 3,
}: {
  readonly value: number;
  readonly max?: number;
}) {
  const gradientId = `star-gold-${useId().replaceAll(":", "")}`;
  const marks: boolean[] = [];
  for (let index = 0; index < max; index += 1) {
    marks.push(index < value);
  }

  return (
    <span
      className="relative inline-flex items-center gap-1"
      aria-label={`${value} of ${max} stars`}
    >
      <svg className="pointer-events-none absolute size-0" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE7A3" />
            <stop offset="48%" stopColor="#F5C451" />
            <stop offset="100%" stopColor="#E09A16" />
          </linearGradient>
        </defs>
      </svg>
      {marks.map((filled, index) => (
        <StarMark key={index} filled={filled} gradientId={gradientId} />
      ))}
    </span>
  );
}

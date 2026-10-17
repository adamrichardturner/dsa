"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initials = (name: string): string => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  const first = parts[0];
  if (first === undefined) {
    return "?";
  }
  if (parts.length === 1) {
    return first.slice(0, 1).toUpperCase();
  }
  const last = parts[parts.length - 1] ?? first;
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
};

export function UserAvatar({
  name,
  avatarUrl,
  className,
}: {
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly className?: string;
}) {
  const source = avatarUrl ?? "";

  return (
    <Avatar aria-hidden="true" className={className}>
      {source.length > 0 ? (
        <AvatarImage src={source} alt="" referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}

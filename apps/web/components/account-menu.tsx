"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import { cn } from "cn";
import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { unreadLabel, useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/lib/auth";
import { SIGN_OUT } from "@/lib/operations";
import { courseAccessOpen } from "@/lib/verification";

export function AccountMenu() {
  const router = useRouter();
  const { ready, user, signOut } = useAuth();
  const { centre } = useNotifications(ready && user !== null && courseAccessOpen(user));
  const [, runSignOut] = useMutation(SIGN_OUT);
  const unread = unreadLabel(centre?.unreadCount ?? 0);

  if (!ready) {
    return <Skeleton className="size-8 rounded-full" aria-hidden />;
  }

  if (user === null) {
    return (
      <Link
        href="/sign-in"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Sign in
      </Link>
    );
  }

  const onSignOut = () => {
    void runSignOut({}).finally(() => {
      signOut();
      router.push("/");
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={unread === null ? "Account" : `Account, ${unread} notifications`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "rounded-full",
        )}
      >
        <span className="relative">
          <UserAvatar
            name={user.name}
            avatarUrl={user.avatarUrl}
            className="size-7 text-[11px]"
          />
          {unread === null ? null : (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-foreground ring-2 ring-background"
            />
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-1.5 py-1.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        {user.isAdmin ? (
          <DropdownMenuItem render={<Link href="/admin" />}>Admin</DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className="justify-between" render={<Link href="/notifications" />}>
          Notifications
          {unread === null ? null : (
            <span className="text-xs text-muted-foreground">{unread}</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

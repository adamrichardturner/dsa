"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "urql";
import { cn } from "cn";
import { UserAvatar } from "@/components/user-avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { SIGN_OUT } from "@/lib/operations";

export function AccountMenu() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [, runSignOut] = useMutation(SIGN_OUT);

  if (user === null) {
    return (
      <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
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
        aria-label="Account"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "rounded-full")}
      >
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="size-7 text-[11px]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-1.5 py-1.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={onSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

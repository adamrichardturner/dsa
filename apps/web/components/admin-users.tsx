"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "urql";
import { cn } from "cn";
import { UserAvatar } from "@/components/user-avatar";
import { formatPercent, formatTimestamp } from "@/components/admin-format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { ADMIN_DELETE_ACCOUNT } from "@/lib/operations";
import { isOauthProvider, providerLabel } from "@/lib/oauth";
import type { AdminUser } from "@/lib/types";

const signInLabels = (user: AdminUser): readonly string[] => {
  const labels: string[] = [];
  if (user.hasPassword) {
    labels.push("Password");
  }
  for (const provider of user.providers) {
    if (!isOauthProvider(provider)) {
      continue;
    }
    labels.push(providerLabel(provider));
  }
  if (labels.length === 0) {
    return ["Unknown"];
  }
  return labels;
};

function DeleteAccountDialog({
  user,
  onDeleted,
}: {
  readonly user: AdminUser;
  readonly onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, remove] = useMutation<{ adminDeleteAccount: boolean }>(
    ADMIN_DELETE_ACCOUNT,
  );
  const confirmed =
    confirmation.trim().toLowerCase() === user.email.toLowerCase();

  const onOpenChange = (next: boolean) => {
    if (result.fetching) {
      return;
    }
    setOpen(next);
    if (next) {
      return;
    }
    setConfirmation("");
    setError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirmed || result.fetching) {
      return;
    }
    setError(null);
    const response = await remove({ userId: user.id });
    if (response.error !== undefined) {
      setError(
        graphqlErrorMessage(response.error, "Could not delete that account."),
      );
      return;
    }
    if (response.data?.adminDeleteAccount !== true) {
      return;
    }
    setOpen(false);
    setConfirmation("");
    onDeleted();
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      disablePointerDismissal={result.fetching}
    >
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => {
          setOpen(true);
        }}
      >
        Delete
      </Button>
      <AlertDialogContent>
        <Alert variant="destructive" role="presentation">
          <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes {user.email}, their sessions, and all
            course progress. Type the email address to confirm.
          </AlertDialogDescription>
        </Alert>
        <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor={`delete-${user.id}`}>Email address</Label>
            <Input
              id={`delete-${user.id}`}
              type="email"
              value={confirmation}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setError(null);
              }}
              autoComplete="off"
              placeholder={user.email}
              required
            />
          </div>
          {error !== null ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogClose
              className={cn(buttonVariants({ variant: "outline" }))}
              disabled={result.fetching}
            >
              Cancel
            </AlertDialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={!confirmed || result.fetching}
            >
              {result.fetching ? "Deleting…" : "Delete account"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AdminUsers({
  users,
  onDeleted,
}: {
  readonly users: readonly AdminUser[];
  readonly onDeleted: () => void;
}) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const needle = query.trim().toLowerCase();
  const visible =
    needle.length === 0
      ? users
      : users.filter((user) => {
          return (
            user.name.toLowerCase().includes(needle) ||
            user.email.toLowerCase().includes(needle)
          );
        });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl">Accounts</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "account" : "accounts"}
            {needle.length > 0 ? `, ${visible.length} matching` : ""}
          </p>
        </div>
        <div className="w-full max-w-xs">
          <Label htmlFor="admin-account-search" className="sr-only">
            Search accounts
          </Label>
          <Input
            id="admin-account-search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search name or email"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No accounts match that search.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Account</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Joined</th>
                <th className="px-3 py-2 font-medium">Last submission</th>
                <th className="px-3 py-2 font-medium">Lessons</th>
                <th className="px-3 py-2 font-medium">Problems</th>
                <th className="px-3 py-2 font-medium">Pass rate</th>
                <th className="px-3 py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => {
                const open = openId === user.id;
                return (
                  <tr
                    key={user.id}
                    className="border-b align-top last:border-b-0"
                  >
                    <td className="px-3 py-3" colSpan={open ? 8 : undefined}>
                      {open ? (
                        <UserDetail
                          user={user}
                          onClose={() => {
                            setOpenId(null);
                          }}
                          onDeleted={onDeleted}
                        />
                      ) : (
                        <AccountCell
                          user={user}
                          onOpen={() => {
                            setOpenId(user.id);
                          }}
                        />
                      )}
                    </td>
                    {open ? null : (
                      <>
                        <td className="px-3 py-3 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                          {formatTimestamp(user.createdAt)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">
                          {formatTimestamp(user.lastActiveAt)}
                        </td>
                        <td className="px-3 py-3 tabular-nums">
                          {user.lessonsCompleted}/{user.lessonsTotal}
                        </td>
                        <td className="px-3 py-3 tabular-nums">
                          {user.problemsSolved}/{user.problemsTotal}
                        </td>
                        <td className="px-3 py-3 tabular-nums">
                          {formatPercent(user.passRate)}
                          <span className="block text-xs text-muted-foreground">
                            {user.passes}/{user.attempts}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          {user.deletable ? (
                            <DeleteAccountDialog
                              user={user}
                              onDeleted={onDeleted}
                            />
                          ) : (
                            <Badge variant="outline">Protected</Badge>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AccountCell({
  user,
  onOpen,
}: {
  readonly user: AdminUser;
  readonly onOpen: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar
        name={user.name}
        avatarUrl={user.avatarUrl}
        className="size-8 text-xs"
      />
      <div className="min-w-0">
        <button
          type="button"
          className="truncate font-medium hover:underline"
          onClick={onOpen}
        >
          {user.name}
        </button>
        <div className="mt-1 flex flex-wrap gap-1">
          {signInLabels(user).map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserDetail({
  user,
  onClose,
  onDeleted,
}: {
  readonly user: AdminUser;
  readonly onClose: () => void;
  readonly onDeleted: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={user.name}
            avatarUrl={user.avatarUrl}
            className="size-10"
          />
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.deletable ? (
            <DeleteAccountDialog user={user} onDeleted={onDeleted} />
          ) : (
            <Badge variant="outline">Protected</Badge>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Joined</dt>
          <dd>{formatTimestamp(user.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last submission</dt>
          <dd>{formatTimestamp(user.lastActiveAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Lessons</dt>
          <dd className="tabular-nums">
            {user.lessonsCompleted}/{user.lessonsTotal}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Problems</dt>
          <dd className="tabular-nums">
            {user.problemsSolved}/{user.problemsTotal} ·{" "}
            {formatPercent(user.passRate)} pass rate
          </dd>
        </div>
      </dl>
      <ul className="grid gap-3 sm:grid-cols-2">
        {user.topics.map((topic) => {
          const value =
            topic.total === 0
              ? 0
              : Math.round((topic.solved / topic.total) * 100);
          return (
            <li key={topic.topic} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span>{topic.topic}</span>
                <span className="text-muted-foreground tabular-nums">
                  {topic.solved}/{topic.total}
                </span>
              </div>
              <Progress value={value} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

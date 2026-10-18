"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation } from "urql";
import { cn } from "cn";
import { UserAvatar } from "@/components/user-avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { providerLabel } from "@/lib/oauth";
import { CHANGE_PASSWORD, DELETE_ACCOUNT, UPDATE_PROFILE } from "@/lib/operations";
import type { User } from "@/lib/types";

interface UpdateProfileData {
  readonly updateProfile: User;
}

interface ChangePasswordData {
  readonly changePassword: boolean;
}

interface DeleteAccountData {
  readonly deleteAccount: boolean;
}

function ProfileForm({
  user,
  updateUser,
}: {
  readonly user: User;
  readonly updateUser: (user: User) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, update] = useMutation<UpdateProfileData>(UPDATE_PROFILE);
  const preview = avatarUrl.trim();
  const shownName = name.trim().length === 0 ? "Your name" : name.trim();
  const shownEmail = email.trim().length === 0 ? user.email : email.trim();

  useEffect(() => {
    if (dirty) {
      return;
    }
    setName(user.name);
    setEmail(user.email);
    setAvatarUrl(user.avatarUrl ?? "");
  }, [dirty, user.avatarUrl, user.email, user.name]);

  const edit = (apply: () => void) => {
    apply();
    setDirty(true);
    setSaved(false);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    const trimmedAvatar = avatarUrl.trim();
    const response = await update({
      name: name.trim(),
      email: email.trim(),
      avatarUrl: trimmedAvatar.length === 0 ? null : trimmedAvatar,
    });
    const next = response.data?.updateProfile;
    if (next === undefined) {
      return;
    }
    setDirty(false);
    updateUser(next);
    setSaved(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>The name and picture shown in the header.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
          <div className="flex items-center gap-4">
            <UserAvatar
              name={shownName}
              avatarUrl={preview.length === 0 ? null : preview}
              className="size-16 text-lg"
            />
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium">{shownName}</p>
              <p className="truncate text-sm text-muted-foreground">{shownEmail}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => edit(() => setName(event.target.value))}
              autoComplete="name"
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => edit(() => setEmail(event.target.value))}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-avatar">Picture link</Label>
            <Input
              id="profile-avatar"
              type="url"
              value={avatarUrl}
              onChange={(event) => edit(() => setAvatarUrl(event.target.value))}
              placeholder="https://"
              spellCheck={false}
            />
            <p className="text-sm text-muted-foreground">Leave blank to use your initials.</p>
          </div>
          {result.error !== undefined ? (
            <Alert variant="destructive">
              <AlertDescription>
                {graphqlErrorMessage(result.error, "Could not save your profile.")}
              </AlertDescription>
            </Alert>
          ) : null}
          {saved ? (
            <Alert>
              <AlertDescription>Profile saved.</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={result.fetching}>
            {result.fetching ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm({
  user,
  updateUser,
}: {
  readonly user: User;
  readonly updateUser: (user: User) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [result, change] = useMutation<ChangePasswordData>(CHANGE_PASSWORD);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    const response = await change({
      currentPassword: user.hasPassword ? currentPassword : "",
      nextPassword,
    });
    if (response.data?.changePassword !== true) {
      return;
    }
    setCurrentPassword("");
    setNextPassword("");
    updateUser({ ...user, hasPassword: true });
    setSaved(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.hasPassword ? "Password" : "Add a password"}</CardTitle>
        <CardDescription>
          {user.hasPassword
            ? "Use at least 8 characters."
            : "Optional. Then you can also sign in with email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
          {user.hasPassword ? (
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setSaved(false);
                }}
                autoComplete="current-password"
                required
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="next-password">New password</Label>
            <Input
              id="next-password"
              type="password"
              value={nextPassword}
              onChange={(event) => {
                setNextPassword(event.target.value);
                setSaved(false);
              }}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {result.error !== undefined ? (
            <Alert variant="destructive">
              <AlertDescription>
                {graphqlErrorMessage(result.error, "Could not update the password.")}
              </AlertDescription>
            </Alert>
          ) : null}
          {saved ? (
            <Alert>
              <AlertDescription>Password updated.</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={result.fetching}>
            {result.fetching ? "Saving…" : user.hasPassword ? "Change password" : "Set password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteAccount({
  user,
  signOut,
}: {
  readonly user: User;
  readonly signOut: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, remove] = useMutation<DeleteAccountData>(DELETE_ACCOUNT);
  const confirmationReady = confirmation.trim().toLowerCase() === user.email;
  const canConfirm =
    (user.hasPassword ? password.length > 0 : confirmationReady) && !result.fetching;

  const onOpenChange = (next: boolean) => {
    if (result.fetching) {
      return;
    }
    setOpen(next);
    if (next) {
      return;
    }
    setPassword("");
    setConfirmation("");
    setError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canConfirm) {
      return;
    }
    setError(null);
    const response = await remove(
      user.hasPassword ? { password, confirmation: null } : { password: null, confirmation },
    );
    if (response.error !== undefined) {
      setError(graphqlErrorMessage(response.error, "Could not delete the account."));
      return;
    }
    if (response.data?.deleteAccount !== true) {
      return;
    }
    signOut();
    router.push("/");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} disablePointerDismissal={result.fetching}>
      <AlertDialogTrigger className={cn(buttonVariants({ variant: "destructive" }))}>
        Delete account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Alert variant="destructive" role="presentation">
          <AlertDialogTitle>This cannot be undone</AlertDialogTitle>
          <AlertDialogDescription>
            {user.hasPassword
              ? "Deleting your account permanently removes your profile, sessions, and all course progress. Type your password to confirm."
              : "Deleting your account permanently removes your profile, sessions, and all course progress. Type your email address to confirm."}
          </AlertDialogDescription>
        </Alert>
        <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
          {user.hasPassword ? (
            <div className="space-y-2">
              <Label htmlFor="delete-password">Password</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
                autoComplete="current-password"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">Email address</Label>
              <Input
                id="delete-confirmation"
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
          )}
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
            <Button type="submit" variant="destructive" disabled={!canConfirm}>
              {result.fetching ? "Deleting…" : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ProfileSettings({
  user,
  updateUser,
  signOut,
}: {
  readonly user: User;
  readonly updateUser: (user: User) => void;
  readonly signOut: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div className="space-y-3">
        <Badge variant="secondary">Profile</Badge>
        <h1 className="font-serif text-4xl tracking-tight">Your account.</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Name, email, and the picture shown beside the course.
        </p>
      </div>
      <ProfileForm user={user} updateUser={updateUser} />
      <Card>
        <CardHeader>
          <CardTitle>Sign-in methods</CardTitle>
          <CardDescription>
            Google and GitHub attach to this account when the verified email matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {user.hasPassword ? <Badge variant="secondary">Email and password</Badge> : null}
          {user.providers.map((provider) => (
            <Badge key={provider} variant="secondary">
              {providerLabel(provider)}
            </Badge>
          ))}
          {!user.hasPassword && user.providers.length === 0 ? (
            <Badge variant="secondary">Email</Badge>
          ) : null}
        </CardContent>
      </Card>
      <PasswordForm user={user} updateUser={updateUser} />
      <DeleteAccount user={user} signOut={signOut} />
    </main>
  );
}

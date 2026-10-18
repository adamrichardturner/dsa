"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMutation } from "urql";
import { PageSpinner } from "@/components/page-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthButtons } from "@/components/oauth-buttons";
import { useAuth } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { SIGN_IN, SIGN_UP } from "@/lib/operations";
import type { AuthPayload } from "@/lib/types";

export function AuthForm({
  mode,
  notice = null,
}: {
  readonly mode: "sign-in" | "sign-up";
  readonly notice?: string | null;
}) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpResult, signUp] = useMutation<{ signUp: AuthPayload }>(SIGN_UP);
  const [signInResult, signInMutation] = useMutation<{ signIn: AuthPayload }>(SIGN_IN);
  const pending = signUpResult.fetching || signInResult.fetching;
  const failure = signUpResult.error ?? signInResult.error;
  const error =
    failure === undefined
      ? null
      : graphqlErrorMessage(
          failure,
          mode === "sign-up" ? "Could not create the account." : "Could not sign in.",
        );
  const title = mode === "sign-up" ? "Create your account" : "Welcome back";

  if (pending) {
    return <PageSpinner />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result =
      mode === "sign-up"
        ? await signUp({ email, name, password })
        : await signInMutation({ email, password });
    const data = result.data;
    if (data == null) {
      return;
    }
    const payload = "signUp" in data ? data.signUp : data.signIn;
    if (payload == null) {
      return;
    }
    signIn(payload.token, payload.user);
    router.push("/course");
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">{title}</CardTitle>
          <CardDescription>
            {mode === "sign-up"
              ? "Create an account with Google, GitHub, or an email and password."
              : "Use Google, GitHub, or the email and password for this account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <OAuthButtons />
          <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
            {mode === "sign-up" ? (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                minLength={8}
                required
              />
              {mode === "sign-in" ? (
                <p className="text-right text-sm">
                  <Link href="/forgot-password" className="text-foreground underline underline-offset-4">
                    Forgot password?
                  </Link>
                </p>
              ) : null}
            </div>
            {notice !== null ? (
              <Alert>
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            ) : null}
            {error !== null ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {mode === "sign-up" ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                The course is free. Creating an account means you agree to the{" "}
                <Link href="/terms" className="text-foreground underline underline-offset-4">
                  Terms
                </Link>{" "}
                and have read the{" "}
                <Link href="/privacy" className="text-foreground underline underline-offset-4">
                  Privacy policy
                </Link>
                . You need to be 16 or older.
              </p>
            ) : null}
            <Button type="submit" className="h-10 w-full">
              {mode === "sign-up" ? "Create account" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            {mode === "sign-up" ? (
              <>
                Already registered?{" "}
                <Link href="/sign-in" className="text-foreground underline underline-offset-4">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href="/sign-up" className="text-foreground underline underline-offset-4">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

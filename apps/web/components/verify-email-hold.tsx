"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMutation } from "urql";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { RESEND_VERIFICATION } from "@/lib/operations";

export function VerifyEmailHold({
  email,
  detail = "Use the button in the email. That signs you in and starts the introduction. The link works once.",
  onSignIn,
}: {
  readonly email: string;
  readonly detail?: string;
  readonly onSignIn?: () => void;
}) {
  const [result, resend] = useMutation<{ resendVerificationEmail: boolean }>(RESEND_VERIFICATION);
  const [sentAgain, setSentAgain] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await resend({ email });
    if (response.data?.resendVerificationEmail !== true) {
      return;
    }
    setSentAgain(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Check your inbox</CardTitle>
        <CardDescription>
          We sent a verification link to {email}. {detail}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sentAgain ? (
          <Alert>
            <AlertDescription>Sent another link. It replaces the previous one.</AlertDescription>
          </Alert>
        ) : null}
        {result.error !== undefined ? (
          <Alert variant="destructive">
            <AlertDescription>
              {graphqlErrorMessage(result.error, "Could not send the verification email.")}
            </AlertDescription>
          </Alert>
        ) : null}
        <form onSubmit={(event) => void onSubmit(event)}>
          <Button type="submit" variant="outline" className="h-10 w-full" disabled={result.fetching}>
            {result.fetching ? "Sending…" : "Resend the email"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">
          {onSignIn !== undefined ? (
            <button type="button" className="text-foreground underline underline-offset-4" onClick={onSignIn}>
              Back to sign in
            </button>
          ) : null}
          {onSignIn === undefined ? (
            <Link href="/sign-in" className="text-foreground underline underline-offset-4">
              Back to sign in
            </Link>
          ) : null}
        </p>
      </CardContent>
    </Card>
  );
}

export function VerifyEmailScreen({
  email,
  detail,
  onSignIn,
}: {
  readonly email: string;
  readonly detail?: string;
  readonly onSignIn?: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-6 py-16">
      <VerifyEmailHold email={email} detail={detail} onSignIn={onSignIn} />
    </main>
  );
}

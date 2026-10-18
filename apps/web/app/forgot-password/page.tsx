"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useMutation } from "urql";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { REQUEST_PASSWORD_RESET } from "@/lib/operations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [result, requestReset] = useMutation<{ requestPasswordReset: boolean }>(
    REQUEST_PASSWORD_RESET,
  );
  const sent = result.data?.requestPasswordReset === true;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await requestReset({ email });
  };

  if (sent) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-6 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">Reset your password</CardTitle>
            <CardDescription>The link lasts one hour.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Check that inbox. If the account has a password, the link is there.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              <Link href="/sign-in" className="text-foreground underline underline-offset-4">
                Back to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">Reset your password</CardTitle>
          <CardDescription>
            Enter the email on the account. If it has a password, we will send a link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
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
            {result.error !== undefined ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {graphqlErrorMessage(result.error, "Could not send a reset link. Try again.")}
                </AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="h-10 w-full" disabled={result.fetching}>
              {result.fetching ? "Sending…" : "Send the link"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            <Link href="/sign-in" className="text-foreground underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

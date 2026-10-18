"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useMutation } from "urql";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { RESET_PASSWORD } from "@/lib/operations";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [result, resetPassword] = useMutation<{ resetPassword: boolean }>(RESET_PASSWORD);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await resetPassword({ token, password });
    if (response.data?.resetPassword !== true) {
      return;
    }
    router.push("/sign-in?reset=done");
  };

  if (token.length < 20) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">That link does not work</CardTitle>
          <CardDescription>Ask for a new one from the sign-in page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/forgot-password" className="text-sm text-foreground underline underline-offset-4">
            Request a new link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Choose a new password</CardTitle>
        <CardDescription>Use at least 8 characters. This replaces the current password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
          <Button type="submit" className="h-10 w-full" disabled={result.fetching}>
            {result.fetching ? "Saving…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-6 py-16">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

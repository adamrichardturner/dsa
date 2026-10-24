"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useMutation } from "urql";
import { PageSpinner } from "@/components/page-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { safeReturnPath } from "@/lib/oauth";
import { VERIFY_EMAIL } from "@/lib/operations";
import type { AuthPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

let inflightToken: string | null = null;

function VerifyEmail() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();
  const token = params.get("token") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [, verifyEmail] = useMutation<{ verifyEmail: AuthPayload }>(VERIFY_EMAIL);

  useEffect(() => {
    if (token.length < 20) {
      setMessage("That verification link is invalid or has expired.");
      return;
    }
    if (inflightToken === token) {
      return;
    }
    inflightToken = token;
    void verifyEmail({ token }).then((result) => {
      const payload = result.data?.verifyEmail;
      if (payload === undefined) {
        setMessage(graphqlErrorMessage(result.error, "That verification link is invalid or has expired."));
        return;
      }
      signIn(payload.token, payload.user);
      router.replace(safeReturnPath("/course"));
    });
  }, [router, signIn, token, verifyEmail]);

  if (message === null) {
    return <PageSpinner />;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">That link does not work</CardTitle>
          <CardDescription>Request a new one from the sign-in page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline" }), "h-10 w-full")}>
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}

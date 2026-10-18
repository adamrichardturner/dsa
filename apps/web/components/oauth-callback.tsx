"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation } from "urql";
import { PageSpinner } from "@/components/page-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { oauthErrorMessage, safeReturnPath } from "@/lib/oauth";
import { REDEEM_OAUTH_CODE } from "@/lib/operations";
import type { AuthPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

let inflightCode: string | null = null;
let handledKey: string | null = null;

export function OAuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [, redeem] = useMutation<{ readonly redeemOAuthCode: AuthPayload }>(REDEEM_OAUTH_CODE);
  const code = params.get("code");
  const errorCode = params.get("error");
  const provider = params.get("provider");
  const returnTo = safeReturnPath(params.get("returnTo"));

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.length > 0) {
      window.history.replaceState(window.history.state, "", "/auth/callback");
    }

    if (errorCode !== null) {
      const key = `error:${errorCode}`;
      if (handledKey === key) {
        return;
      }
      handledKey = key;
      setMessage(oauthErrorMessage(errorCode, provider));
      return;
    }

    if (code === null || code.length === 0) {
      if (inflightCode !== null || handledKey !== null) {
        return;
      }
      handledKey = "empty";
      setMessage(oauthErrorMessage("expired", provider));
      return;
    }

    if (inflightCode === code) {
      return;
    }
    inflightCode = code;
    handledKey = `code:${code}`;
    void redeem({ code }).then((result) => {
      const payload = result.data?.redeemOAuthCode;
      if (payload === undefined) {
        setMessage(
          graphqlErrorMessage(result.error, oauthErrorMessage("provider", provider)),
        );
        return;
      }
      signIn(payload.token, payload.user);
      router.replace(returnTo);
    });
  }, [code, errorCode, provider, redeem, returnTo, router, signIn]);

  if (message === null) {
    return <PageSpinner />;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">Could not sign in</CardTitle>
          <CardDescription>You can try again from the sign-in page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

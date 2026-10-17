import type { Metadata } from "next";
import { Suspense } from "react";
import { OAuthCallback } from "@/components/oauth-callback";
import { PageSpinner } from "@/components/page-spinner";

export const metadata: Metadata = {
  title: "Signing in",
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer",
};

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <OAuthCallback />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { OAuthCallback } from "@/components/oauth-callback";
import { PageSkeleton } from "@/components/page-skeleton";

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
    <Suspense fallback={<PageSkeleton />}>
      <OAuthCallback />
    </Suspense>
  );
}

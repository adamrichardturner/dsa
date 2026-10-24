"use client";

import { useQuery } from "urql";
import { PageSpinner } from "@/components/page-spinner";
import { VerifyEmailScreen } from "@/components/verify-email-hold";
import { PageMain } from "@/components/page-frame";
import { ProgressBoard } from "@/components/progress-board";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRequireUser } from "@/lib/auth";
import { courseAccessOpen } from "@/lib/verification";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { ANALYTICS_QUERY } from "@/lib/operations";
import type { AnalyticsView } from "@/lib/types";

export default function ProgressPage() {
  const auth = useRequireUser();
  const open = auth.user !== null && courseAccessOpen(auth.user);
  const [result] = useQuery<{ analytics: AnalyticsView }>({
    query: ANALYTICS_QUERY,
    pause: !open,
  });

  if (auth.user === null) {
    return <PageSpinner />;
  }

  if (!courseAccessOpen(auth.user)) {
    return <VerifyEmailScreen email={auth.user.email} />;
  }

  if (result.fetching && result.data === undefined) {
    return <PageSpinner />;
  }

  if (result.error !== undefined || result.data === undefined) {
    return (
      <PageMain className="py-12">
        <Alert variant="destructive">
          <AlertDescription>{graphqlErrorMessage(result.error, "Could not load progress.")}</AlertDescription>
        </Alert>
      </PageMain>
    );
  }

  return <ProgressBoard analytics={result.data.analytics} />;
}

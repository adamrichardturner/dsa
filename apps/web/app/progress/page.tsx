"use client";

import { useQuery } from "urql";
import { PageSpinner } from "@/components/page-spinner";
import { ProgressBoard } from "@/components/progress-board";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRequireUser } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { ANALYTICS_QUERY } from "@/lib/operations";
import type { AnalyticsView } from "@/lib/types";

export default function ProgressPage() {
  const auth = useRequireUser();
  const [result] = useQuery<{ analytics: AnalyticsView }>({
    query: ANALYTICS_QUERY,
    pause: auth.user === null,
  });

  if (auth.user === null || (result.fetching && result.data === undefined)) {
    return <PageSpinner />;
  }

  if (result.error !== undefined || result.data === undefined) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Alert variant="destructive">
          <AlertDescription>
            {graphqlErrorMessage(result.error, "Could not load progress.")}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return <ProgressBoard analytics={result.data.analytics} />;
}

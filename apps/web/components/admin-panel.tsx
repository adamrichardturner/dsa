"use client";

import { useQuery } from "urql";
import { AdminCharts } from "@/components/admin-charts";
import { formatAverage, formatPercent } from "@/components/admin-format";
import { AdminUsers } from "@/components/admin-users";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSpinner } from "@/components/page-spinner";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { ADMIN_OVERVIEW } from "@/lib/operations";
import type { AdminOverview } from "@/lib/types";

function Stat({
  label,
  value,
  detail,
}: {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-serif text-3xl">{value}</CardTitle>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardHeader>
    </Card>
  );
}

export function AdminPanel() {
  const [result, reexecute] = useQuery<{ adminOverview: AdminOverview }>({
    query: ADMIN_OVERVIEW,
  });

  if (result.fetching && result.data === undefined) {
    return <PageSpinner />;
  }

  if (result.error !== undefined || result.data === undefined) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Alert variant="destructive">
          <AlertDescription>
            {graphqlErrorMessage(result.error, "Could not load the admin panel.")}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const overview = result.data.adminOverview;
  const refresh = () => {
    reexecute({ requestPolicy: "network-only" });
  };

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <div className="space-y-3">
        <Badge variant="secondary">Admin</Badge>
        <h1 className="font-serif text-4xl tracking-tight">Who is using the course.</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {overview.usersTotal} {overview.usersTotal === 1 ? "account" : "accounts"}.{" "}
          {overview.activeLast7Days} submitted work in the last 7 days, and{" "}
          {formatPercent(overview.passRate)} of {overview.submissionsTotal} submissions passed.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Accounts"
          value={overview.usersTotal.toLocaleString()}
          detail={`${overview.signupsLast7Days} new in 7 days · ${overview.signupsLast30Days} in 30 days`}
        />
        <Stat
          label="Active"
          value={overview.activeLast7Days.toLocaleString()}
          detail={`${overview.activeLast30Days} with a submission in 30 days`}
        />
        <Stat
          label="Pass rate"
          value={formatPercent(overview.passRate)}
          detail={`${overview.passesTotal.toLocaleString()} passes of ${overview.submissionsTotal.toLocaleString()}`}
        />
        <Stat
          label="Average progress"
          value={formatAverage(overview.problemsSolvedAverage)}
          detail={`${formatAverage(overview.lessonsCompletedAverage)} lessons completed per account`}
        />
      </section>

      <AdminCharts overview={overview} />
      <AdminUsers users={overview.users} onDeleted={refresh} />
    </main>
  );
}

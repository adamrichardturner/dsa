"use client";

import { useEffect, useRef, useState } from "react";
import { NotificationBoard } from "@/components/notification-board";
import { PageSpinner } from "@/components/page-spinner";
import { VerifyEmailScreen } from "@/components/verify-email-hold";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageMain } from "@/components/page-frame";
import { useNotifications } from "@/hooks/use-notifications";
import { useRequireUser } from "@/lib/auth";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import { courseAccessOpen } from "@/lib/verification";

export default function NotificationsPage() {
  const auth = useRequireUser();
  const open = auth.user !== null && courseAccessOpen(auth.user);
  const notes = useNotifications(open);
  const captured = useRef(false);
  const [freshIds, setFreshIds] = useState<Record<string, true>>({});
  const { centre, markRead } = notes;

  useEffect(() => {
    if (centre === null || captured.current) {
      return;
    }
    captured.current = true;
    const ids: Record<string, true> = {};
    for (const item of centre.items) {
      if (!item.read) {
        ids[item.id] = true;
      }
    }
    setFreshIds(ids);
    if (centre.unreadCount === 0) {
      return;
    }
    void markRead();
  }, [centre, markRead]);

  if (auth.user === null) {
    return <PageSpinner />;
  }

  if (!courseAccessOpen(auth.user)) {
    return <VerifyEmailScreen email={auth.user.email} />;
  }

  if (notes.fetching && notes.centre === null) {
    return <PageSpinner />;
  }

  if (notes.error !== undefined && notes.centre === null) {
    return (
      <PageMain className="py-12">
        <Alert variant="destructive">
          <AlertDescription>
            {graphqlErrorMessage(notes.error, "Could not load your notifications.")}
          </AlertDescription>
        </Alert>
      </PageMain>
    );
  }

  if (notes.centre === null) {
    return <PageSpinner />;
  }

  return (
    <NotificationBoard
      centre={notes.centre}
      freshIds={freshIds}
      pending={notes.pending}
      actionError={notes.actionError}
      onDismiss={(id) => {
        void notes.dismiss(id);
      }}
      onClear={() => {
        void notes.clear();
      }}
    />
  );
}

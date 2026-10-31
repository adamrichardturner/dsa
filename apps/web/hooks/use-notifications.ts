"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useMutation, useQuery } from "urql";
import { graphqlErrorMessage } from "@/lib/graphql-error";
import {
  CLEAR_NOTIFICATIONS,
  DISMISS_NOTIFICATION,
  MARK_NOTIFICATIONS_READ,
  NOTIFICATIONS_QUERY,
} from "@/lib/operations";
import type { NotificationCentre } from "@/lib/types";

interface NotificationData {
  readonly notifications: NotificationCentre;
}

interface DismissData {
  readonly dismissNotification: NotificationCentre;
}

interface ClearData {
  readonly clearNotifications: NotificationCentre;
}

interface ReadData {
  readonly markNotificationsRead: NotificationCentre;
}

export const unreadLabel = (count: number): string | null => {
  if (count <= 0) {
    return null;
  }
  if (count > 9) {
    return "9+";
  }
  return String(count);
};

export function useNotifications(
  enabled: boolean,
  options?: { readonly watchNavigation?: boolean },
) {
  const watchNavigation = options?.watchNavigation ?? false;
  const pathname = usePathname();
  const [result, reexecute] = useQuery<NotificationData>({
    query: NOTIFICATIONS_QUERY,
    pause: !enabled,
    requestPolicy: "cache-and-network",
  });
  const [, dismissNotification] = useMutation<DismissData>(DISMISS_NOTIFICATION);
  const [, clearNotifications] = useMutation<ClearData>(CLEAR_NOTIFICATIONS);
  const [, markNotificationsRead] = useMutation<ReadData>(MARK_NOTIFICATIONS_READ);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const reexecuteRef = useRef(reexecute);
  const skipPath = useRef(true);
  reexecuteRef.current = reexecute;

  const reload = useCallback(() => {
    reexecuteRef.current({ requestPolicy: "network-only" });
  }, []);

  useEffect(() => {
    if (!enabled || !watchNavigation) {
      return;
    }
    if (skipPath.current) {
      skipPath.current = false;
      return;
    }
    reload();
  }, [enabled, pathname, reload, watchNavigation]);

  useEffect(() => {
    if (!enabled || !watchNavigation) {
      return;
    }
    const onVisible = (): void => {
      if (document.visibilityState !== "visible") {
        return;
      }
      reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled, reload, watchNavigation]);

  const dismiss = useCallback(
    async (id: string) => {
      setActionError(null);
      setPending(true);
      const response = await dismissNotification({ id });
      setPending(false);
      if (response.error !== undefined) {
        setActionError(graphqlErrorMessage(response.error, "Could not dismiss that notification."));
        return;
      }
      reload();
    },
    [dismissNotification, reload],
  );

  const clear = useCallback(async () => {
    setActionError(null);
    setPending(true);
    const response = await clearNotifications({});
    setPending(false);
    if (response.error !== undefined) {
      setActionError(graphqlErrorMessage(response.error, "Could not clear your notifications."));
      return;
    }
    reload();
  }, [clearNotifications, reload]);

  const markRead = useCallback(async () => {
    const response = await markNotificationsRead({});
    if (response.error !== undefined) {
      setActionError(graphqlErrorMessage(response.error, "Could not update your notifications."));
      return;
    }
    reload();
  }, [markNotificationsRead, reload]);

  return {
    centre: result.data?.notifications ?? null,
    fetching: result.fetching,
    error: result.error,
    pending,
    actionError,
    dismiss,
    clear,
    markRead,
    reload,
  };
}

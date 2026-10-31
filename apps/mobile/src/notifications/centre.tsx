import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { ApiError, request } from "@/api/client";
import {
  CLEAR_NOTIFICATIONS,
  DISMISS_NOTIFICATION,
  MARK_NOTIFICATIONS_READ,
  NOTIFICATIONS_QUERY,
} from "@/api/operations";
import type { NotificationCentre, StudyNotification } from "@/api/types";
import { useSession } from "@/auth/session";

interface NotificationState {
  readonly centre: NotificationCentre | null;
  readonly error: string | null;
  readonly refresh: () => Promise<NotificationCentre | null>;
  readonly dismiss: (id: string) => Promise<void>;
  readonly clear: () => Promise<void>;
  readonly markRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationState | null>(null);

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const readNotification = (value: unknown): StudyNotification | null => {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.id !== "string" || typeof value.title !== "string" || typeof value.body !== "string") {
    return null;
  }
  if (typeof value.kind !== "string" || typeof value.createdAt !== "string") {
    return null;
  }
  const href = typeof value.href === "string" ? value.href : "";
  return {
    id: value.id,
    kind: value.kind,
    title: value.title,
    body: value.body,
    href: href.length === 0 ? null : href,
    createdAt: value.createdAt,
    read: value.read === true,
  };
};

const readCentre = (value: unknown): NotificationCentre | null => {
  if (!isRecord(value) || typeof value.unreadCount !== "number" || !Array.isArray(value.items)) {
    return null;
  }
  const items: StudyNotification[] = [];
  for (const item of value.items) {
    const note = readNotification(item);
    if (note === null) {
      return null;
    }
    items.push(note);
  }
  return { unreadCount: value.unreadCount, items };
};

export const badgeLabel = (count: number): string | null => {
  if (count <= 0) {
    return null;
  }
  if (count > 9) {
    return "9+";
  }
  return String(count);
};

const messageFrom = (caught: unknown, fallback: string): string => {
  if (caught instanceof ApiError) {
    return caught.message;
  }
  return fallback;
};

export function NotificationProvider({ children }: { readonly children: ReactNode }) {
  const { token } = useSession();
  const [centre, setCentre] = useState<NotificationCentre | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);

  const apply = useCallback((next: NotificationCentre) => {
    generation.current += 1;
    setCentre(next);
    setError(null);
  }, []);

  const refresh = useCallback(async (): Promise<NotificationCentre | null> => {
    if (token === null) {
      generation.current += 1;
      setCentre(null);
      setError(null);
      return null;
    }
    generation.current += 1;
    const current = generation.current;
    try {
      const data = await request<{ notifications: unknown }>(NOTIFICATIONS_QUERY, null, token);
      if (current !== generation.current) {
        return null;
      }
      const next = readCentre(data.notifications);
      if (next === null) {
        setError("Could not load your notifications.");
        return null;
      }
      setCentre(next);
      setError(null);
      return next;
    } catch (caught) {
      if (current !== generation.current) {
        return null;
      }
      setError(messageFrom(caught, "Could not load your notifications."));
      return null;
    }
  }, [token]);

  const mutate = useCallback(
    async (query: string, variables: Record<string, unknown> | null, field: string, fallback: string) => {
      if (token === null) {
        return;
      }
      try {
        const data = await request<Record<string, unknown>>(query, variables, token);
        const next = readCentre(data[field]);
        if (next === null) {
          setError(fallback);
          return;
        }
        apply(next);
      } catch (caught) {
        setError(messageFrom(caught, fallback));
      }
    },
    [apply, token],
  );

  const dismiss = useCallback(
    async (id: string) => {
      await mutate(DISMISS_NOTIFICATION, { id }, "dismissNotification", "Could not dismiss that notification.");
    },
    [mutate],
  );

  const clear = useCallback(async () => {
    await mutate(CLEAR_NOTIFICATIONS, null, "clearNotifications", "Could not clear your notifications.");
  }, [mutate]);

  const markRead = useCallback(async () => {
    await mutate(
      MARK_NOTIFICATIONS_READ,
      null,
      "markNotificationsRead",
      "Could not update your notifications.",
    );
  }, [mutate]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        return;
      }
      void refresh();
    });
    return () => {
      subscription.remove();
    };
  }, [refresh]);

  const value = useMemo<NotificationState>(
    () => ({
      centre,
      error,
      refresh,
      dismiss,
      clear,
      markRead,
    }),
    [centre, clear, dismiss, error, markRead, refresh],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = (): NotificationState => {
  const value = useContext(NotificationContext);
  if (value === null) {
    throw new Error("NotificationProvider is missing.");
  }
  return value;
};

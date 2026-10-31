import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NotificationCentre, StudyNotification } from "@/api/types";
import { useNotifications } from "@/notifications/centre";
import { useTheme } from "@/theme/theme";
import { Body, Button, Notice, Title } from "@/ui/primitives";

const formatWhen = (iso: string, now: Date): string => {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return "";
  }
  const delta = now.getTime() - parsed;
  const hour = 3_600_000;
  const day = 86_400_000;
  if (delta < hour) {
    return "Just now";
  }
  if (delta < day) {
    const hours = Math.floor(delta / hour);
    if (hours <= 1) {
      return "1 hour ago";
    }
    return `${hours} hours ago`;
  }
  const days = Math.floor(delta / day);
  if (days <= 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  return new Date(parsed).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const kindLabel = (kind: string): string => {
  if (kind === "habit") {
    return "Study habit";
  }
  return "Achievement";
};

const hrefLabel = (href: string): string => {
  if (href.startsWith("/course/")) {
    return "Continue";
  }
  if (href === "/progress") {
    return "See progress";
  }
  if (href === "/articles") {
    return "Read articles";
  }
  return "Open";
};

const openHref = (href: string): void => {
  if (href === "/progress") {
    router.navigate("/progress");
    return;
  }
  if (href === "/articles") {
    router.navigate("/articles");
    return;
  }
  if (href === "/course") {
    router.navigate("/course");
    return;
  }
  const prefix = "/course/";
  if (!href.startsWith(prefix)) {
    return;
  }
  const slug = href.slice(prefix.length);
  if (slug.length === 0 || slug.includes("/")) {
    return;
  }
  router.navigate({ pathname: "/course/[slug]", params: { slug } });
};

function NotificationRow({
  item,
  fresh,
  pending,
  onDismiss,
}: {
  readonly item: StudyNotification;
  readonly fresh: boolean;
  readonly pending: boolean;
  readonly onDismiss: (id: string) => void;
}) {
  const { colors } = useTheme();
  const when = formatWhen(item.createdAt, new Date());
  const href = item.href;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.meta}>
        <Text style={[styles.kind, { color: colors.mutedForeground }]}>{kindLabel(item.kind)}</Text>
        <Text style={[styles.when, { color: colors.mutedForeground }]}>
          {fresh ? "New" : ""}
          {fresh && when.length > 0 ? " · " : ""}
          {when}
        </Text>
      </View>
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
      <Body muted>{item.body}</Body>
      <View style={styles.actions}>
        {href === null ? <View /> : (
          <Pressable accessibilityRole="button" onPress={() => openHref(href)}>
            <Text style={[styles.action, { color: colors.foreground }]}>{hrefLabel(href)}</Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Dismiss ${item.title}`}
          disabled={pending}
          onPress={() => onDismiss(item.id)}
        >
          <Text style={[styles.action, { color: colors.mutedForeground, opacity: pending ? 0.45 : 1 }]}>
            Dismiss
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { centre, error, refresh, dismiss, clear, markRead } = useNotifications();
  const [freshIds, setFreshIds] = useState<Record<string, true>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const syncOpen = useCallback(
    async (next: NotificationCentre | null) => {
      if (next === null) {
        return;
      }
      const ids: Record<string, true> = {};
      for (const item of next.items) {
        if (!item.read) {
          ids[item.id] = true;
        }
      }
      setFreshIds(ids);
      if (next.unreadCount === 0) {
        return;
      }
      await markRead();
    },
    [markRead],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void refresh().then((next) => {
        if (!active) {
          return;
        }
        return syncOpen(next);
      });
      return () => {
        active = false;
      };
    }, [refresh, syncOpen]),
  );

  const onDismiss = (id: string) => {
    setPendingId(id);
    void dismiss(id).finally(() => setPendingId(null));
  };

  const onClear = () => {
    setClearing(true);
    void clear().finally(() => setClearing(false));
  };

  const items = centre?.items ?? [];

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={colors.foreground}
          onRefresh={() => {
            setRefreshing(true);
            void refresh()
              .then((next) => syncOpen(next))
              .finally(() => setRefreshing(false));
          }}
        />
      }
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Title>Notifications</Title>
          <Body muted>A finished lesson, a short streak, or a week away. They stay until you dismiss them.</Body>
        </View>
        {items.length === 0 ? null : (
          <Button
            disabled={clearing || pendingId !== null}
            label="Clear all"
            onPress={onClear}
            pending={clearing}
            variant="secondary"
          />
        )}
      </View>
      {error === null ? null : <Notice>{error}</Notice>}
      {centre !== null && items.length === 0 ? <Body muted>Nothing waiting.</Body> : null}
      {items.map((item) => (
        <NotificationRow
          key={item.id}
          fresh={freshIds[item.id] === true}
          item={item}
          onDismiss={onDismiss}
          pending={pendingId === item.id || clearing}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingHorizontal: 24,
  },
  header: {
    gap: 16,
  },
  headerCopy: {
    gap: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  kind: {
    fontFamily: "Geist_500Medium",
    fontSize: 13,
  },
  when: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
  },
  cardTitle: {
    fontFamily: "Geist_500Medium",
    fontSize: 18,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  action: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
  },
});

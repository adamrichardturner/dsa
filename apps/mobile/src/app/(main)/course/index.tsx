import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { MODULES_QUERY } from "@/api/operations";
import type { ModuleView } from "@/api/types";
import { useSession } from "@/auth/session";
import { Onboarding } from "@/components/onboarding";
import { useTheme } from "@/theme/theme";
import { Badge, Body, Notice, Title } from "@/ui/primitives";

export default function CourseScreen() {
  const { token, user } = useSession();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [modules, setModules] = useState<readonly ModuleView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (token === null) {
      return;
    }
    try {
      const data = await request<{ modules: ModuleView[] }>(MODULES_QUERY, null, token);
      setModules(data.modules);
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load the course.");
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          tintColor={colors.foreground}
          onRefresh={() => {
            setRefreshing(true);
            void load().finally(() => setRefreshing(false));
          }}
        />
      }
      style={{ backgroundColor: colors.background }}
    >
      <Text style={[styles.wordmark, { color: colors.foreground }]}>DSA</Text>
      <Title>The course</Title>
      <Body muted>
        {user === null ? "" : `Hello, ${user.name}. Four weeks, taken in order, unless audit mode is on.`}
      </Body>
      {error === null ? null : <Notice>{error}</Notice>}
      {modules.map((module) => (
        <View key={module.id} style={styles.week}>
          <Text style={[styles.weekTitle, { color: colors.foreground }]}>
            Week {module.weekNumber}. {module.title}
          </Text>
          <Body muted>{module.summary}</Body>
          {module.lessons.map((lesson) => {
            const status = lesson.completed ? "Done" : lesson.skipped ? "Skipped" : lesson.available ? "Open" : "Locked";
            return (
              <Pressable
                key={lesson.id}
                accessibilityRole="button"
                disabled={!lesson.available}
                onPress={() => router.push({ pathname: "/course/[slug]", params: { slug: lesson.slug } })}
                style={[
                  styles.lesson,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    opacity: lesson.available ? 1 : 0.45,
                  },
                ]}
              >
                <View style={styles.lessonCopy}>
                  <Text style={[styles.lessonTitle, { color: colors.foreground }]}>{lesson.title}</Text>
                  <Text style={[styles.lessonSummary, { color: colors.mutedForeground }]}>{lesson.summary}</Text>
                </View>
                <Badge label={status} tone={lesson.completed ? "success" : "muted"} />
              </Pressable>
            );
          })}
        </View>
      ))}
      <Onboarding />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24,
  },
  wordmark: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 18,
  },
  week: {
    gap: 10,
    marginTop: 8,
  },
  weekTitle: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 22,
    letterSpacing: -0.3,
  },
  lesson: {
    alignItems: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 14,
  },
  lessonCopy: {
    flex: 1,
    gap: 4,
  },
  lessonTitle: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 16,
  },
  lessonSummary: {
    fontFamily: "Geist_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
});

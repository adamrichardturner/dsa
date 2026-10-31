import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { MODULES_QUERY } from "@/api/operations";
import type { LessonSummary, ModuleView } from "@/api/types";
import { useSession } from "@/auth/session";
import { Onboarding } from "@/components/onboarding";
import { lessonStatus, StatusMark, statusLabel } from "@/course/status-mark";
import { useTheme } from "@/theme/theme";
import { Body, Notice, Title } from "@/ui/primitives";

const completedCount = (lessons: readonly LessonSummary[]): number => {
  let count = 0;
  for (const lesson of lessons) {
    if (lesson.completed) {
      count += 1;
    }
  }
  return count;
};

const lessonNumber = (index: number): string => {
  const number = index + 1;
  if (number < 10) {
    return `0${number}`;
  }
  return String(number);
};

export default function CourseScreen() {
  const { token, user } = useSession();
  const auditMode = user?.auditMode ?? false;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [modules, setModules] = useState<readonly ModuleView[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loadGeneration = useRef(0);

  const load = useCallback(async () => {
    if (token === null) {
      return;
    }
    // Audit mode is read so a toggle refreshes this screen while it stays focused.
    void auditMode;
    loadGeneration.current += 1;
    const generation = loadGeneration.current;
    try {
      const data = await request<{ modules: ModuleView[] }>(MODULES_QUERY, null, token);
      if (generation !== loadGeneration.current) {
        return;
      }
      setModules(data.modules);
      setError(null);
    } catch (caught) {
      if (generation !== loadGeneration.current) {
        return;
      }
      setError(caught instanceof ApiError ? caught.message : "Could not load the course.");
    }
  }, [auditMode, token]);

  // Reload when this screen is shown, including after audit mode changes while it stays focused.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
      <Text style={[styles.wordmark, { color: colors.foreground }]}>DSA in TypeScript</Text>
      <Title>The course</Title>
      <Body muted>
        {user === null ? "" : `Hello, ${user.name}. Four weeks, taken in order, unless audit mode is on.`}
      </Body>
      {error === null ? null : <Notice>{error}</Notice>}
      {modules.map((module) => (
        <View key={module.id} style={styles.week}>
          <View style={styles.weekHeading}>
            <View style={styles.weekCopy}>
              <Text style={[styles.weekKicker, { color: colors.mutedForeground }]}>
                Week {module.weekNumber}
              </Text>
              <Text style={[styles.weekTitle, { color: colors.foreground }]}>{module.title}</Text>
            </View>
            <Text style={[styles.weekCount, { color: colors.mutedForeground }]}>
              {completedCount(module.lessons)}/{module.lessons.length}
            </Text>
          </View>
          <Body muted>{module.summary}</Body>
          {module.lessons.map((lesson, index) => {
            const status = lessonStatus(lesson);
            const label = statusLabel(status);
            return (
              <Pressable
                key={lesson.id}
                accessibilityLabel={`${lesson.title}. ${label}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: !lesson.available }}
                disabled={!lesson.available}
                onPress={() => router.push({ pathname: "/course/[slug]", params: { slug: lesson.slug } })}
                style={[
                  styles.lesson,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    opacity: lesson.available ? 1 : 0.55,
                  },
                ]}
              >
                <StatusMark label={label} status={status} />
                <Text style={[styles.lessonIndex, { color: colors.mutedForeground }]}>{lessonNumber(index)}</Text>
                <View style={styles.lessonCopy}>
                  <Text style={[styles.lessonTitle, { color: colors.foreground }]}>{lesson.title}</Text>
                  <Text style={[styles.lessonSummary, { color: colors.mutedForeground }]}>{lesson.summary}</Text>
                </View>
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
  weekHeading: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  weekCopy: {
    flex: 1,
    gap: 2,
  },
  weekKicker: {
    fontFamily: "Geist_500Medium",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  weekTitle: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 22,
    letterSpacing: -0.3,
  },
  weekCount: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  lesson: {
    alignItems: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  lessonIndex: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 12,
    lineHeight: 18,
    width: 20,
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

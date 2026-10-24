import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { LESSON_QUERY } from "@/api/operations";
import type { LessonView, ProblemView, SkipResult } from "@/api/types";
import { useSession } from "@/auth/session";
import { exerciseStatus, StatusMark, statusLabel } from "@/course/status-mark";
import { GapExercise } from "@/lesson/gap-exercise";
import { GuideSheet } from "@/lesson/guide-sheet";
import { Reading } from "@/lesson/reading";
import { useTheme } from "@/theme/theme";
import { Badge, Body, Button, Notice, Title } from "@/ui/primitives";

const readSlug = (value: string | string[] | undefined): string => {
  if (typeof value === "string") {
    return value;
  }
  return value?.[0] ?? "";
};

export default function LessonScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = readSlug(params.slug);
  const { token } = useSession();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollToEnd = useRef<() => void>(() => undefined);
  const [lesson, setLesson] = useState<LessonView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [problemId, setProblemId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const load = useCallback(async () => {
    if (token === null || slug.length === 0) {
      return;
    }
    try {
      const data = await request<{ lesson: LessonView | null }>(LESSON_QUERY, { slug }, token);
      setLesson(data.lesson);
      setError(null);
      setProblemId((current) => {
        if (current !== null && data.lesson?.problems.some((problem) => problem.id === current)) {
          return current;
        }
        return data.lesson?.problems[0]?.id ?? null;
      });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not open that lesson.");
    }
  }, [slug, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const problem: ProblemView | null =
    lesson?.problems.find((item) => item.id === problemId) ?? lesson?.problems[0] ?? null;

  const onSkipped = (result: SkipResult) => {
    setGuideOpen(false);
    if (result.nextSlug !== null && result.nextAvailable) {
      router.replace({ pathname: "/course/[slug]", params: { slug: result.nextSlug } });
      return;
    }
    router.replace("/(main)/course");
  };

  return (
    <ScrollView
      ref={(node) => {
        scrollToEnd.current = () => {
          node?.scrollToEnd({ animated: true });
        };
      }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 }]}
      style={{ backgroundColor: colors.background }}
    >
      <Pressable accessibilityRole="button" onPress={() => router.back()}>
        <Text style={[styles.back, { color: colors.mutedForeground }]}>Course</Text>
      </Pressable>
      {error === null ? null : <Notice>{error}</Notice>}
      {lesson === null || problem === null || token === null ? null : (
        <>
          <View style={styles.badges}>
            <Badge label={`Week ${lesson.weekNumber}`} />
            <Badge label={problem.topic} />
            <Badge label={problem.difficulty} />
            {lesson.skipped ? <Badge label="Skipped" /> : null}
          </View>
          <Title>{lesson.title}</Title>
          <Body muted>{lesson.summary}</Body>
          <Reading markdown={lesson.contentMd} />
          {lesson.problems.length < 2 ? null : (
            <View accessibilityRole="tablist" style={styles.switcher}>
              {lesson.problems.map((item, index) => {
                const selected = item.id === problem.id;
                const status = exerciseStatus(item, lesson.skipped);
                const label = statusLabel(status);
                return (
                  <Pressable
                    key={item.id}
                    accessibilityLabel={`${item.title}. ${label}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => setProblemId(item.id)}
                    style={[
                      styles.switch,
                      {
                        backgroundColor: selected ? colors.secondary : colors.card,
                        borderColor: selected ? colors.foreground : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.switchIndex, { color: colors.mutedForeground }]}>{index + 1}</Text>
                    <Text style={[styles.switchTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.switchStatus, { color: colors.mutedForeground }]}>{label}</Text>
                    <StatusMark label={label} status={status} />
                  </Pressable>
                );
              })}
            </View>
          )}
          <GapExercise
            key={problem.id}
            lessonSkipped={lesson.skipped}
            onOpenGuide={() => setGuideOpen(true)}
            onPassed={() => void load()}
            problem={problem}
            scrollToEnd={() => scrollToEnd.current()}
            token={token}
          />
          {problem.solved && lesson.nextSlug !== null && lesson.nextAvailable ? (
            <Button
              label="Next lesson"
              onPress={() => {
                if (lesson.nextSlug === null) {
                  return;
                }
                router.replace({ pathname: "/course/[slug]", params: { slug: lesson.nextSlug } });
              }}
            />
          ) : null}
          <GuideSheet
            lessonSlug={lesson.slug}
            onClose={() => setGuideOpen(false)}
            onSkipped={onSkipped}
            problemId={problem.id}
            token={token}
            visible={guideOpen}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingHorizontal: 24,
  },
  back: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  switcher: {
    gap: 8,
    marginTop: 8,
  },
  switch: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  switchIndex: {
    fontFamily: "Geist_500Medium",
    fontSize: 13,
    width: 16,
  },
  switchTitle: {
    flex: 1,
    fontFamily: "Geist_500Medium",
    fontSize: 14,
  },
  switchStatus: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
  },
});

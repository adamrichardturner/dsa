import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { ANALYTICS_QUERY } from "@/api/operations";
import type { AnalyticsView } from "@/api/types";
import { useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";
import { Body, Card, Notice, Title } from "@/ui/primitives";

export default function ProgressScreen() {
  const { token } = useSession();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [analytics, setAnalytics] = useState<AnalyticsView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (token === null) {
      return;
    }
    try {
      const data = await request<{ analytics: AnalyticsView }>(ANALYTICS_QUERY, null, token);
      setAnalytics(data.analytics);
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not load your progress.");
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
      <Title>Progress</Title>
      {error === null ? null : <Notice>{error}</Notice>}
      {analytics === null ? null : (
        <>
          <Body muted>{analytics.summary}</Body>
          <View style={styles.stats}>
            <Card>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {analytics.lessonsCompleted}/{analytics.lessonsTotal}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Lessons passed</Text>
            </Card>
            <Card>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {Math.round(analytics.passRate * 100)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pass rate</Text>
            </Card>
          </View>
          <Card>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {analytics.problemsSolved} of {analytics.problemsTotal} exercises passed
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {analytics.lessonsSkipped} lessons skipped
            </Text>
          </Card>
          {analytics.topics.map((topic) => {
            const width = topic.total === 0 ? 0 : topic.solved / topic.total;
            return (
              <View key={topic.topic} style={styles.topic}>
                <Text style={[styles.topicLabel, { color: colors.foreground }]}>
                  {topic.topic} · {topic.solved}/{topic.total}
                </Text>
                <View style={[styles.track, { backgroundColor: colors.secondary }]}>
                  <View style={[styles.fill, { backgroundColor: colors.primary, width: `${Math.round(width * 100)}%` }]} />
                </View>
              </View>
            );
          })}
          {analytics.skippedLessons.length === 0 ? null : (
            <View style={styles.topic}>
              <Text style={[styles.topicLabel, { color: colors.foreground }]}>Skipped</Text>
              {analytics.skippedLessons.map((lesson) => (
                <Text key={lesson.slug} style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  {lesson.title}
                </Text>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
  },
  statValue: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 28,
  },
  statLabel: {
    fontFamily: "Geist_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  topic: {
    gap: 6,
  },
  topicLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
  },
  track: {
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  fill: {
    height: 8,
  },
});

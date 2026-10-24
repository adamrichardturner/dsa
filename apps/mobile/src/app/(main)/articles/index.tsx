import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { articleGroups } from "../../../../../web/lib/articles/index";
import { useTheme } from "@/theme/theme";
import { Body, Title } from "@/ui/primitives";

export default function ArticlesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const groups = articleGroups();

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 }]}
      style={{ backgroundColor: colors.background }}
    >
      <Title>Articles</Title>
      <Body muted>The same explainers as the website. Open one to read it, diagrams included.</Body>
      {groups.map((group) => (
        <View key={group.topic} style={styles.group}>
          <Text style={[styles.topic, { color: colors.foreground }]}>{group.topic}</Text>
          {group.articles.map((article) => (
            <Pressable
              key={article.slug}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/articles/[slug]", params: { slug: article.slug } })}
              style={[styles.row, { borderColor: colors.border }]}
            >
              <Text style={[styles.articleTitle, { color: colors.foreground }]}>{article.title}</Text>
              <Text style={[styles.summary, { color: colors.mutedForeground }]}>{article.summary}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24,
  },
  group: {
    gap: 4,
    marginTop: 8,
  },
  topic: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 22,
    marginBottom: 4,
  },
  row: {
    borderTopWidth: 1,
    gap: 4,
    paddingVertical: 14,
  },
  articleTitle: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 16,
  },
  summary: {
    fontFamily: "Geist_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
});

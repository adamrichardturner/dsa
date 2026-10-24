import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { webUrl } from "@/api/config";
import { ContentWebView } from "@/content/content-webview";
import { useTheme } from "@/theme/theme";

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = typeof params.slug === "string" ? params.slug : (params.slug?.[0] ?? "");
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <Text style={[styles.backLabel, { color: colors.mutedForeground }]}>Articles</Text>
      </Pressable>
      {slug.length === 0 ? (
        <Text style={[styles.missing, { color: colors.mutedForeground }]}>That article is missing.</Text>
      ) : (
        <ContentWebView uri={`${webUrl}/embed/articles/${slug}`} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  back: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
  },
  missing: {
    fontFamily: "Geist_400Regular",
    fontSize: 16,
    paddingHorizontal: 24,
  },
});

import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { webUrl } from "@/api/config";
import { useTheme } from "@/theme/theme";

const hideChrome = `
  const style = document.createElement("style");
  style.textContent = "header, footer { display: none !important; }";
  document.documentElement.appendChild(style);
  true;
`;

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = typeof params.slug === "string" ? params.slug : (params.slug?.[0] ?? "");
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const url = `${webUrl}/articles/${slug}`;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <Text style={[styles.backLabel, { color: colors.mutedForeground }]}>Articles</Text>
      </Pressable>
      <WebView
        injectedJavaScript={hideChrome}
        source={{ uri: url }}
        style={{ backgroundColor: scheme === "dark" ? "#0a0a0a" : "#ffffff" }}
      />
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
});

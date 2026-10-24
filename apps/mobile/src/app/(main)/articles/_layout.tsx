import { Stack } from "expo-router";
import { useTheme } from "@/theme/theme";

export default function ArticleStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

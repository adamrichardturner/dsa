import { Stack } from "expo-router";
import { useTheme } from "@/theme/theme";

export default function CourseStack() {
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

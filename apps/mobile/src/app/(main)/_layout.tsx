import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";

export default function MainLayout() {
  const { user } = useSession();
  const { colors } = useTheme();
  if (user === null) {
    return <Redirect href="/sign-in" />;
  }
  return (
    <NativeTabs
      backgroundColor={colors.background}
      iconColor={colors.mutedForeground}
      indicatorColor={colors.secondary}
      labelStyle={{ selected: { color: colors.foreground } }}
      tintColor={colors.foreground}
    >
      <NativeTabs.Trigger name="course">
        <NativeTabs.Trigger.Label>Course</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="menu_book" sf="book" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="articles">
        <NativeTabs.Trigger.Label>Articles</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="article" sf="doc.text" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="insights" sf="chart.bar" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="settings" sf="gearshape" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

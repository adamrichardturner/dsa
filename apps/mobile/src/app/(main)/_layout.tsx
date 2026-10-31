import { Redirect, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { NativeTabs } from "expo-router/native-tabs";
import { DynamicColorIOS, Platform, type ColorValue } from "react-native";
import { useSession } from "@/auth/session";
import { badgeLabel, NotificationProvider, useNotifications } from "@/notifications/centre";
import { darkPalette, lightPalette, type ColorScheme } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

const adaptiveColor = (
  scheme: ColorScheme,
  light: string,
  dark: string,
  highContrastLight = light,
  highContrastDark = dark,
): ColorValue => {
  if (Platform.OS === "ios") {
    return DynamicColorIOS({
      light,
      dark,
      highContrastLight,
      highContrastDark,
    });
  }
  if (scheme === "dark") {
    return dark;
  }
  return light;
};

function MainTabs() {
  const { colors, scheme } = useTheme();
  const { centre, refresh } = useNotifications();
  const badge = badgeLabel(centre?.unreadCount ?? 0);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );
  const activeColor = adaptiveColor(scheme, lightPalette.foreground, darkPalette.foreground);
  const inactiveColor = adaptiveColor(scheme, "#525252", "#d4d4d4", "#000000", "#ffffff");
  return (
    <NativeTabs
      backgroundColor={Platform.OS === "ios" ? undefined : colors.card}
      disableTransparentOnScrollEdge
      iconColor={{ default: inactiveColor, selected: activeColor }}
      indicatorColor={scheme === "dark" ? "rgba(255, 255, 255, 0.18)" : "rgba(10, 10, 10, 0.08)"}
      labelStyle={{
        default: { color: inactiveColor },
        selected: { color: activeColor },
      }}
      rippleColor={scheme === "dark" ? "rgba(255, 255, 255, 0.14)" : "rgba(10, 10, 10, 0.08)"}
      tintColor={activeColor}
      unstable_nativeProps={{ colorScheme: scheme }}
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
      <NativeTabs.Trigger name="notifications">
        <NativeTabs.Trigger.Label>Alerts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="notifications" sf="bell" />
        {badge === null ? null : <NativeTabs.Trigger.Badge>{badge}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="settings" sf="gearshape" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

export default function MainLayout() {
  const { user } = useSession();
  if (user === null) {
    return <Redirect href="/sign-in" />;
  }
  return (
    <NotificationProvider>
      <MainTabs />
    </NotificationProvider>
  );
}

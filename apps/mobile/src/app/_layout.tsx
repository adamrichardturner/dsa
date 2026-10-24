import { Fraunces_500Medium } from "@expo-google-fonts/fraunces/500Medium";
import { Geist_400Regular } from "@expo-google-fonts/geist/400Regular";
import { Geist_500Medium } from "@expo-google-fonts/geist/500Medium";
import { Geist_600SemiBold } from "@expo-google-fonts/geist/600SemiBold";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono/400Regular";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SessionProvider, useSession } from "@/auth/session";
import { BrandSplash } from "@/splash/brand-splash";
import { ThemeProvider, useTheme } from "@/theme/theme";

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { ready } = useSession();
  const { colors, scheme } = useTheme();
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    JetBrainsMono_400Regular,
  });
  const [splashVisible, setSplashVisible] = useState(true);
  const hideSplash = useCallback(() => {
    setSplashVisible(false);
  }, []);

  useEffect(() => {
    if (!fontsLoaded) {
      return;
    }
    void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {ready ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      ) : null}
      {splashVisible ? <BrandSplash onFinished={hideSplash} sessionReady={ready} /> : null}
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <SessionProvider>
          <RootStack />
        </SessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

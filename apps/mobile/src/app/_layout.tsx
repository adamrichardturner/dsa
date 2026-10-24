import { Fraunces_500Medium } from "@expo-google-fonts/fraunces";
import { Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from "@expo-google-fonts/geist";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "@/auth/session";
import { useTheme, ThemeProvider } from "@/theme/theme";

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

  useEffect(() => {
    if (ready && fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, ready]);

  if (!ready || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SessionProvider>
          <RootStack />
        </SessionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

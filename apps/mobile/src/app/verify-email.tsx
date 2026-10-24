import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { VERIFY_EMAIL } from "@/api/operations";
import { readAuthPayload, useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";
import { Body, Button, Notice, Title } from "@/ui/primitives";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : "";
  const { accept } = useSession();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token.length < 20) {
      return;
    }
    let active = true;
    void request<{ verifyEmail: unknown }>(VERIFY_EMAIL, { token }, null)
      .then(async (data) => {
        const payload = readAuthPayload(data.verifyEmail);
        if (!active || payload === null) {
          return;
        }
        await accept(payload);
        router.replace("/(main)/course");
      })
      .catch((caught: unknown) => {
        if (!active) {
          return;
        }
        setError(caught instanceof ApiError ? caught.message : "That verification link is invalid or has expired.");
      });
    return () => {
      active = false;
    };
  }, [accept, token]);

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
      style={{ backgroundColor: colors.background }}
    >
      <Title>Verify your email</Title>
      <Body muted>
        {token.length < 20
          ? "Open the link in the email, then sign in here."
          : "Checking that link…"}
      </Body>
      {error === null ? null : <Notice>{error}</Notice>}
      <Button label="Sign in" onPress={() => router.replace("/sign-in")} variant="secondary" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24,
  },
});

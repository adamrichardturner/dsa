import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ApiError, request } from "@/api/client";
import { REDEEM_OAUTH_CODE } from "@/api/operations";
import { oauthErrorCopy } from "@/auth/providers";
import { readAuthPayload, useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";
import { Body, Button, Notice, Title } from "@/ui/primitives";

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const code = typeof params.code === "string" ? params.code : "";
  const error = typeof params.error === "string" ? params.error : "";
  const { accept } = useSession();
  const { colors } = useTheme();
  const [message, setMessage] = useState<string | null>(error.length === 0 ? null : oauthErrorCopy(error));

  useEffect(() => {
    if (code.length < 20 || error.length > 0) {
      return;
    }
    let active = true;
    void request<{ redeemOAuthCode: unknown }>(REDEEM_OAUTH_CODE, { code }, null)
      .then(async (data) => {
        const payload = readAuthPayload(data.redeemOAuthCode);
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
        setMessage(caught instanceof ApiError ? caught.message : "Could not finish signing in. Try again.");
      });
    return () => {
      active = false;
    };
  }, [accept, code, error]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Title>Signing in</Title>
      {message === null ? <ActivityIndicator color={colors.foreground} /> : <Notice>{message}</Notice>}
      {message === null ? <Body muted>One moment.</Body> : <Button label="Back to sign in" onPress={() => router.replace("/sign-in")} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
});

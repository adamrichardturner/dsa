import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { REQUEST_PASSWORD_RESET } from "@/api/operations";
import { useTheme } from "@/theme/theme";
import { Body, Button, Field, Notice, Title } from "@/ui/primitives";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await request(REQUEST_PASSWORD_RESET, { email }, null);
      setSent(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not send the reset email.");
    }
    setPending(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}
      style={{ backgroundColor: colors.background }}
    >
      <Pressable accessibilityRole="button" onPress={() => router.back()}>
        <Text style={[styles.back, { color: colors.mutedForeground }]}>Back</Text>
      </Pressable>
      <Title>Reset your password</Title>
      {sent ? (
        <Body muted>If an account uses that email, a reset link is on its way. Open it in the browser, then sign in here.</Body>
      ) : (
        <>
          <Body muted>We will email a link that opens on the website. After you choose a new password, sign in here.</Body>
          <Field
            autoCapitalize="none"
            keyboard="email-address"
            label="Email"
            onChangeText={setEmail}
            value={email}
          />
          {error === null ? null : <Notice>{error}</Notice>}
          <Button label="Send reset link" onPress={() => void submit()} pending={pending} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24,
  },
  back: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
  },
});

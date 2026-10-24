import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { RESET_PASSWORD } from "@/api/operations";
import { useTheme } from "@/theme/theme";
import { Body, Button, Field, Notice, Title } from "@/ui/primitives";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const token = typeof params.token === "string" ? params.token : "";
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await request(RESET_PASSWORD, { token, password }, null);
      setDone(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not reset the password.");
    }
    setPending(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
      style={{ backgroundColor: colors.background }}
    >
      <Title>Choose a new password</Title>
      {done ? (
        <>
          <Body muted>Your password is updated. Sign in with it on this phone.</Body>
          <Button label="Sign in" onPress={() => router.replace("/sign-in")} />
        </>
      ) : (
        <>
          <Body muted>Use at least 8 characters.</Body>
          <Field label="New password" onChangeText={setPassword} secure value={password} />
          {error === null ? null : <Notice>{error}</Notice>}
          <Button disabled={token.length < 20} label="Update password" onPress={() => void submit()} pending={pending} />
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
});

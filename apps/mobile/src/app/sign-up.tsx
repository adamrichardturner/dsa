import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { SIGN_UP } from "@/api/operations";
import { useTheme } from "@/theme/theme";
import { Body, Button, Field, Notice, Title } from "@/ui/primitives";

export default function SignUpScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      const data = await request<{ signUp: { email: string } }>(SIGN_UP, { email, name, password }, null);
      setSent(data.signUp.email);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not create the account.");
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
      <Title>{sent === null ? "Create your account" : "Check your email"}</Title>
      {sent === null ? (
        <>
          <Body muted>Use the same email you would use on the website. The course opens once the address is verified.</Body>
          <Field autoCapitalize="words" label="Name" onChangeText={setName} value={name} />
          <Field
            autoCapitalize="none"
            keyboard="email-address"
            label="Email"
            onChangeText={setEmail}
            value={email}
          />
          <Field label="Password" onChangeText={setPassword} secure value={password} />
          {error === null ? null : <Notice>{error}</Notice>}
          <Button label="Create account" onPress={() => void submit()} pending={pending} />
        </>
      ) : (
        <>
          <Body muted>
            We sent a verification link to {sent}. Open it, then come back and sign in. The link works once.
          </Body>
          <Button label="Go to sign in" onPress={() => router.replace("/sign-in")} />
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

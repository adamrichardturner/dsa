import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { request } from "@/api/client";
import { SIGN_UP } from "@/api/operations";
import { AuthFrame, AuthTextButton, useAuthSubmit, type BrowserProvider } from "@/auth/auth-frame";
import { redeemBrowserSignIn } from "@/auth/providers";
import { useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";
import { Button, Field, Notice } from "@/ui/primitives";

export default function SignUpScreen() {
  const { user, token, accept } = useSession();
  const { colors } = useTheme();
  const { busy, error, locked, run } = useAuthSubmit();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  if (user !== null && token !== null) {
    return <Redirect href="/(main)/course" />;
  }

  const onProvider = (provider: BrowserProvider) => {
    void run(
      provider,
      async () => {
        await accept(await redeemBrowserSignIn(provider));
        router.replace("/(main)/course");
      },
      "Could not create the account.",
    );
  };

  const submit = () => {
    void run(
      "email",
      async () => {
        const data = await request<{ signUp: { email: string } }>(SIGN_UP, { email, name, password }, null);
        setSent(data.signUp.email);
      },
      "Could not create the account.",
    );
  };

  if (sent !== null) {
    return (
      <AuthFrame
        detail={`We sent a verification link to ${sent}. Open it, then come back and sign in. The link works once.`}
        locked={locked}
        onProvider={onProvider}
        title="Check your email"
      >
        {error === null ? null : <Notice>{error}</Notice>}
        <Button disabled={locked} label="Go to sign in" onPress={() => router.replace("/sign-in")} />
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      detail="One account for the website and the phone. Exercises on the phone stay separate from the website."
      footer={
        <AuthTextButton emphasis="Sign in" label="Already have an account?" onPress={() => router.replace("/sign-in")} />
      }
      header={
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.mutedForeground }]}>Back</Text>
        </Pressable>
      }
      locked={locked}
      onProvider={onProvider}
      title="Create your account"
    >
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
      <Button disabled={locked} label="Create account" onPress={submit} pending={busy === "email"} />
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  back: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
  },
});

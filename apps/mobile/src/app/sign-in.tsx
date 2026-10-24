import { Link, Redirect, router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { request } from "@/api/client";
import { SIGN_IN } from "@/api/operations";
import { AuthFrame, AuthTextButton, useAuthSubmit, type BrowserProvider } from "@/auth/auth-frame";
import { redeemBrowserSignIn } from "@/auth/providers";
import { readAuthPayload, useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";
import { Button, Field, Notice } from "@/ui/primitives";

export default function SignInScreen() {
  const { user, token, accept } = useSession();
  const { colors } = useTheme();
  const { busy, error, locked, run } = useAuthSubmit();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      "Could not sign in.",
    );
  };

  const signInWithEmail = () => {
    void run(
      "email",
      async () => {
        const data = await request<{ signIn: unknown }>(SIGN_IN, { email, password }, null);
        const payload = readAuthPayload(data.signIn);
        if (payload === null) {
          throw new Error("Could not sign in.");
        }
        await accept(payload);
        router.replace("/(main)/course");
      },
      "Could not sign in.",
    );
  };

  return (
    <AuthFrame
      detail="Use Google, GitHub, or the email and password for your account. Exercises on the phone stay separate from the website."
      footer={
        <View style={styles.links}>
          <Link href="/forgot-password" style={[styles.link, { color: colors.foreground }]}>
            Forgot your password?
          </Link>
          <AuthTextButton
            emphasis="Create an account"
            label="New here?"
            onPress={() => router.push("/sign-up")}
          />
        </View>
      }
      locked={locked}
      onProvider={onProvider}
      title="Welcome back"
    >
      <Field
        autoCapitalize="none"
        keyboard="email-address"
        label="Email"
        onChangeText={setEmail}
        value={email}
      />
      <Field label="Password" onChangeText={setPassword} secure value={password} />
      {error === null ? null : <Notice>{error}</Notice>}
      <Button disabled={locked} label="Sign in" onPress={signInWithEmail} pending={busy === "email"} />
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  links: {
    gap: 12,
  },
  link: {
    fontFamily: "Geist_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
});

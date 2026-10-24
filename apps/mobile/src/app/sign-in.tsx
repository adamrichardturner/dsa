import * as AppleAuthentication from "expo-apple-authentication";
import { Link, Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, request } from "@/api/client";
import { OAUTH_PROVIDERS, SIGN_IN } from "@/api/operations";
import type { OauthProvider } from "@/api/types";
import { appleUsesNative, redeemBrowserSignIn, signInWithAppleNative } from "@/auth/providers";
import { readAuthPayload, useSession } from "@/auth/session";
import { useTheme } from "@/theme/theme";
import { Body, Button, Field, Notice, Title } from "@/ui/primitives";

const providerLabel = (provider: OauthProvider): string => {
  if (provider === "google") {
    return "Google";
  }
  if (provider === "github") {
    return "GitHub";
  }
  return "Apple";
};

export default function SignInScreen() {
  const { user, token, accept } = useSession();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [providers, setProviders] = useState<readonly OauthProvider[]>([]);
  const [nativeApple, setNativeApple] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    void request<{ oauthProviders: string[] }>(OAUTH_PROVIDERS, null, null)
      .then((data) => {
        if (!active) {
          return;
        }
        const next: OauthProvider[] = [];
        for (const item of data.oauthProviders) {
          if (item === "google" || item === "github" || item === "apple") {
            next.push(item);
          }
        }
        setProviders(next);
      })
      .catch(() => undefined);
    void appleUsesNative().then((available) => {
      if (active) {
        setNativeApple(available);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (user !== null && token !== null) {
    return <Redirect href="/(main)/course" />;
  }

  const finish = async (task: () => Promise<void>) => {
    setPending(true);
    setError(null);
    try {
      await task();
      router.replace("/(main)/course");
    } catch (caught) {
      if (caught instanceof ApiError) {
        setError(caught.message);
      } else if (caught instanceof Error) {
        setError(caught.message);
      } else {
        setError("Could not sign in.");
      }
    }
    setPending(false);
  };

  const signInWithEmail = () =>
    finish(async () => {
      const data = await request<{ signIn: unknown }>(SIGN_IN, { email, password }, null);
      const payload = readAuthPayload(data.signIn);
      if (payload === null) {
        throw new Error("Could not sign in.");
      }
      await accept(payload);
    });

  const signInWithProvider = (provider: OauthProvider) =>
    finish(async () => {
      if (provider === "apple" && nativeApple) {
        await accept(await signInWithAppleNative());
        return;
      }
      await accept(await redeemBrowserSignIn(provider));
    });

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
      style={{ backgroundColor: colors.background }}
    >
      <Text style={[styles.wordmark, { color: colors.foreground }]}>DSA</Text>
      <Title>Welcome back</Title>
      <Body muted>The same account as the course on the web. Lessons, progress, and articles stay together.</Body>
      <View style={styles.form}>
        {providers.map((provider) => {
          if (provider === "apple" && nativeApple) {
            return (
              <AppleAuthentication.AppleAuthenticationButton
                key={provider}
                buttonStyle={
                  scheme === "dark"
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                cornerRadius={10}
                onPress={() => void signInWithProvider(provider)}
                style={styles.apple}
              />
            );
          }
          return (
            <Button
              key={provider}
              disabled={pending}
              label={`Continue with ${providerLabel(provider)}`}
              onPress={() => void signInWithProvider(provider)}
              variant="secondary"
            />
          );
        })}
        {providers.length === 0 ? null : <Body muted>or</Body>}
        <Field
          autoCapitalize="none"
          keyboard="email-address"
          label="Email"
          onChangeText={setEmail}
          value={email}
        />
        <Field label="Password" onChangeText={setPassword} secure value={password} />
        {error === null ? null : <Notice>{error}</Notice>}
        <Button label="Sign in" onPress={() => void signInWithEmail()} pending={pending} />
        <Link href="/forgot-password" style={[styles.link, { color: colors.foreground }]}>
          Forgot your password?
        </Link>
        <Pressable accessibilityRole="button" onPress={() => router.push("/sign-up")}>
          <Text style={[styles.link, { color: colors.mutedForeground }]}>
            New here? <Text style={{ color: colors.foreground }}>Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24,
  },
  wordmark: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 18,
    letterSpacing: -0.3,
  },
  form: {
    gap: 12,
    marginTop: 8,
  },
  link: {
    fontFamily: "Geist_400Regular",
    fontSize: 15,
  },
  apple: {
    height: 48,
    width: "100%",
  },
});

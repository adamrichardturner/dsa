import { useCallback, useState, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError } from "@/api/client";
import { AppleMark, GitHubMark, GoogleMark } from "@/auth/provider-marks";
import { appleSignInOffered } from "@/auth/providers";
import { InfinityMark } from "@/splash/infinity-mark";
import { useTheme } from "@/theme/theme";
import { Body, Title } from "@/ui/primitives";

export type AuthProvider = "apple" | "google" | "github";

type AuthBusy = AuthProvider | "email" | null;

const opacityFor = (locked: boolean, pressed: boolean): number => {
  if (locked) {
    return 0.45;
  }
  if (pressed) {
    return 0.82;
  }
  return 1;
};

export const authFailure = (caught: unknown, fallback: string): string => {
  if (caught instanceof ApiError) {
    return caught.message;
  }
  if (caught instanceof Error && caught.message.length > 0) {
    return caught.message;
  }
  return fallback;
};

export function useAuthSubmit() {
  const [busy, setBusy] = useState<AuthBusy>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (kind: Exclude<AuthBusy, null>, task: () => Promise<void>, fallback: string) => {
      setBusy(kind);
      setError(null);
      try {
        await task();
      } catch (caught) {
        setError(authFailure(caught, fallback));
        setBusy(null);
        return;
      }
      setBusy(null);
    },
    [],
  );

  return {
    busy,
    error,
    locked: busy !== null,
    run,
  };
}

function ProviderButton({
  label,
  locked,
  mark,
  onPress,
}: {
  readonly label: string;
  readonly locked: boolean;
  readonly mark: ReactNode;
  readonly onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={locked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.oauth,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: opacityFor(locked, pressed),
        },
      ]}
    >
      <View style={styles.markSlot}>{mark}</View>
      <Text style={[styles.oauthLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function AuthTextButton({
  label,
  emphasis,
  onPress,
  tone = "muted",
}: {
  readonly label: string;
  readonly emphasis?: string;
  readonly onPress: () => void;
  readonly tone?: "muted" | "strong";
}) {
  const { colors } = useTheme();
  const color = tone === "strong" ? colors.foreground : colors.mutedForeground;
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}>
      <Text style={[styles.footer, { color }]}>
        {label}
        {emphasis === undefined ? null : <Text style={{ color: colors.foreground }}>{` ${emphasis}`}</Text>}
      </Text>
    </Pressable>
  );
}

export function AuthFrame({
  title,
  detail,
  locked,
  onProvider,
  header,
  children,
  footer,
}: {
  readonly title: string;
  readonly detail: string;
  readonly locked: boolean;
  readonly onProvider: (provider: AuthProvider) => void;
  readonly header?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 28, paddingTop: insets.top + 24 },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        style={styles.screen}
      >
        <Animated.View
          entering={FadeIn.duration(280).reduceMotion(ReduceMotion.System)}
          key={title}
          style={styles.column}
        >
          {header}
          <InfinityMark color={colors.foreground} size={40} />
          <Title>{title}</Title>
          <Body muted>{detail}</Body>
          <View style={styles.providers}>
            {appleSignInOffered ? (
              <ProviderButton
                label="Continue with Apple"
                locked={locked}
                mark={<AppleMark color={colors.foreground} />}
                onPress={() => onProvider("apple")}
              />
            ) : null}
            <ProviderButton
              label="Continue with Google"
              locked={locked}
              mark={<GoogleMark />}
              onPress={() => onProvider("google")}
            />
            <ProviderButton
              label="Continue with GitHub"
              locked={locked}
              mark={<GitHubMark color={colors.foreground} />}
              onPress={() => onProvider("github")}
            />
          </View>
          <View style={styles.divider}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.or, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
          </View>
          <View style={styles.form}>{children}</View>
          {footer === undefined ? null : <View style={styles.form}>{footer}</View>}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  column: {
    alignSelf: "center",
    gap: 16,
    maxWidth: 440,
    width: "100%",
  },
  providers: {
    gap: 8,
  },
  oauth: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  markSlot: {
    left: 14,
    position: "absolute",
  },
  oauthLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 16,
  },
  divider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  or: {
    fontFamily: "Geist_400Regular",
    fontSize: 12,
  },
  form: {
    gap: 12,
  },
  footer: {
    fontFamily: "Geist_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
});

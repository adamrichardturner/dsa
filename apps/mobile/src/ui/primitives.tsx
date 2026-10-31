import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import type { ColorScheme, Palette } from "@/theme/palette";
import { useTheme } from "@/theme/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const buttonTone = (
  variant: ButtonVariant,
  colors: Palette,
  scheme: ColorScheme,
): { readonly background: string; readonly color: string; readonly borderColor: string } => {
  if (variant === "primary") {
    return {
      background: colors.primary,
      color: colors.primaryForeground,
      borderColor: colors.border,
    };
  }
  if (variant === "secondary") {
    return {
      background: colors.secondary,
      color: colors.foreground,
      borderColor: colors.border,
    };
  }
  if (variant === "destructive") {
    return {
      background: colors.destructive,
      color: scheme === "dark" ? "#171717" : "#ffffff",
      borderColor: colors.destructive,
    };
  }
  return {
    background: "transparent",
    color: colors.foreground,
    borderColor: "transparent",
  };
};

export function Title({ children }: { readonly children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.title, { color: colors.foreground }]}>{children}</Text>;
}

export function Body({
  children,
  muted = false,
  style,
}: {
  readonly children: ReactNode;
  readonly muted?: boolean;
  readonly style?: StyleProp<TextStyle>;
}) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.body, { color: muted ? colors.mutedForeground : colors.foreground }, style]}>
      {children}
    </Text>
  );
}

export function Button({
  label,
  onPress,
  disabled = false,
  pending = false,
  variant = "primary",
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly pending?: boolean;
  readonly variant?: ButtonVariant;
}) {
  const { colors, scheme } = useTheme();
  const tone = buttonTone(variant, colors, scheme);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || pending}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: tone.background,
          borderColor: tone.borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
      ]}
    >
      {pending ? (
        <ActivityIndicator color={tone.color} />
      ) : (
        <Text style={[styles.buttonLabel, { color: tone.color }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  secure = false,
  keyboard = "default",
  autoCapitalize = "sentences",
  placeholder,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly secure?: boolean;
  readonly keyboard?: "default" | "email-address";
  readonly autoCapitalize?: "none" | "words" | "sentences";
  readonly placeholder?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        keyboardType={keyboard}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry={secure}
        style={[
          styles.input,
          {
            color: colors.foreground,
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
        value={value}
      />
    </View>
  );
}

export function Badge({
  label,
  tone = "muted",
}: {
  readonly label: string;
  readonly tone?: "muted" | "success" | "warning";
}) {
  const { colors } = useTheme();
  const background = tone === "success" ? colors.success : colors.secondary;
  const color = tone === "success" ? "#ffffff" : colors.foreground;
  return (
    <View style={[styles.badge, { backgroundColor: background, borderColor: colors.border }]}>
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  readonly children: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function Notice({ children }: { readonly children: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.notice, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
      <Text style={[styles.noticeText, { color: colors.foreground }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 32,
    letterSpacing: -0.6,
    lineHeight: 38,
  },
  body: {
    fontFamily: "Geist_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 16,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 14,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontFamily: "Geist_400Regular",
    fontSize: 16,
    height: 48,
    paddingHorizontal: 14,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  notice: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  noticeText: {
    fontFamily: "Geist_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
});

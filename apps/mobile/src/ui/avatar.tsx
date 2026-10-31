import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/theme";

const initials = (name: string): string => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  const first = parts[0];
  if (first === undefined) {
    return "?";
  }
  if (parts.length === 1) {
    return first.slice(0, 1).toUpperCase();
  }
  const last = parts[parts.length - 1] ?? first;
  return `${first.slice(0, 1)}${last.slice(0, 1)}`.toUpperCase();
};

export function UserAvatar({
  name,
  avatarUrl,
  size = 40,
}: {
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly size?: number;
}) {
  const { colors } = useTheme();
  const [failed, setFailed] = useState(false);
  const source = avatarUrl ?? "";
  const radius = size / 2;

  if (source.length === 0 || failed) {
    return (
      <View
        accessible={false}
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: colors.secondary,
          },
        ]}
      >
        <Text style={[styles.letter, { color: colors.foreground, fontSize: size * 0.36 }]}>
          {initials(name)}
        </Text>
      </View>
    );
  }

  return (
    <Image
      accessible={false}
      onError={() => setFailed(true)}
      source={{ uri: source }}
      style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.secondary }}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    fontFamily: "Geist_500Medium",
  },
});

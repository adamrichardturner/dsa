import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useTheme } from "@/theme/theme";

export type LessonStatus = "complete" | "skipped" | "incomplete" | "locked";
export type ExerciseStatus = "complete" | "skipped" | "incomplete" | "not-started";

const tick = "#10b981";

export const lessonStatus = (lesson: {
  readonly completed: boolean;
  readonly skipped: boolean;
  readonly available: boolean;
}): LessonStatus => {
  if (lesson.completed) {
    return "complete";
  }
  if (lesson.skipped) {
    return "skipped";
  }
  if (!lesson.available) {
    return "locked";
  }
  return "incomplete";
};

export const exerciseStatus = (
  problem: { readonly solved: boolean; readonly attempts: number },
  lessonSkipped: boolean,
): ExerciseStatus => {
  if (problem.solved) {
    return "complete";
  }
  if (lessonSkipped) {
    return "skipped";
  }
  if (problem.attempts > 0) {
    return "incomplete";
  }
  return "not-started";
};

export const statusLabel = (status: LessonStatus | ExerciseStatus): string => {
  switch (status) {
    case "complete": {
      return "Complete";
    }
    case "skipped": {
      return "Skipped";
    }
    case "locked": {
      return "Locked";
    }
    case "incomplete": {
      return "Incomplete";
    }
    case "not-started": {
      return "Not started";
    }
  }
};

export function StatusMark({
  status,
  label,
}: {
  readonly status: LessonStatus | ExerciseStatus;
  readonly label: string;
}) {
  const { colors } = useTheme();
  if (status === "complete") {
    return (
      <View accessibilityLabel={label} accessibilityRole="image" style={styles.slot}>
        <Svg height={16} viewBox="0 0 24 24" width={16}>
          <Circle cx="12" cy="12" fill={tick} r="10" />
          <Path
            d="M6.2 12.6 10.2 16.6 17.8 7.6"
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.25}
          />
        </Svg>
      </View>
    );
  }
  if (status === "skipped") {
    return (
      <View
        accessibilityLabel={label}
        accessibilityRole="image"
        style={[styles.ring, { borderColor: colors.foreground }]}
      >
        <Text style={[styles.dash, { color: colors.mutedForeground }]}>–</Text>
      </View>
    );
  }
  if (status === "locked") {
    return (
      <View accessibilityLabel={label} accessibilityRole="image" style={styles.slot}>
        <Svg height={16} viewBox="0 0 24 24" width={16}>
          <Rect
            fill="none"
            height="10"
            rx="2"
            stroke={colors.mutedForeground}
            strokeWidth={2}
            width="14"
            x="5"
            y="11"
          />
          <Path
            d="M8 11V8a4 4 0 0 1 8 0v3"
            fill="none"
            stroke={colors.mutedForeground}
            strokeLinecap="round"
            strokeWidth={2}
          />
        </Svg>
      </View>
    );
  }
  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="image"
      style={[styles.ring, { borderColor: colors.border }]}
    />
  );
}

const styles = StyleSheet.create({
  slot: {
    alignItems: "center",
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  ring: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    height: 16,
    justifyContent: "center",
    width: 16,
  },
  dash: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    lineHeight: 14,
  },
});

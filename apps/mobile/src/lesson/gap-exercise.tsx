import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Draggable, Droppable, DropProvider } from "react-native-reanimated-dnd";
import { ApiError, request } from "@/api/client";
import { SUBMIT_GAP } from "@/api/operations";
import type { GapChip, GapGrade, GapPart, GapSubmission, ProblemView } from "@/api/types";
import { Reading } from "@/lesson/reading";
import { useTheme } from "@/theme/theme";
import { Button, Card } from "@/ui/primitives";

interface ChipData {
  readonly id: string;
  readonly text: string;
}

interface LinePiece {
  readonly kind: "text" | "gap";
  readonly text: string;
  readonly gapId: string | null;
}

const linesFrom = (parts: readonly GapPart[]): LinePiece[][] => {
  const lines: LinePiece[][] = [[]];
  const push = (piece: LinePiece) => {
    const line = lines[lines.length - 1];
    if (line === undefined) {
      return;
    }
    line.push(piece);
  };

  for (const part of parts) {
    if (part.kind === "gap") {
      push({ kind: "gap", text: "", gapId: part.gapId });
      continue;
    }
    const chunks = part.text.split("\n");
    for (let index = 0; index < chunks.length; index += 1) {
      if (index > 0) {
        lines.push([]);
      }
      const chunk = chunks[index] ?? "";
      if (chunk.length > 0) {
        push({ kind: "text", text: chunk, gapId: null });
      }
    }
  }
  return lines;
};

function GapSlot({
  gapId,
  chip,
  active,
  correct,
  onFocus,
  onClear,
  onDrop,
}: {
  readonly gapId: string;
  readonly chip: GapChip | null;
  readonly active: boolean;
  readonly correct: boolean | null;
  readonly onFocus: () => void;
  readonly onClear: () => void;
  readonly onDrop: (data: ChipData) => void;
}) {
  const { colors } = useTheme();
  const tone = useSharedValue(0);
  const hot = useSharedValue(colors.primary);
  const good = useSharedValue(colors.success);
  const bad = useSharedValue(colors.destructive);
  hot.value = active ? colors.primary : colors.border;
  good.value = colors.success;
  bad.value = colors.destructive;

  useEffect(() => {
    const next = correct === null ? 0 : correct ? 1 : 2;
    tone.value = withTiming(next, { duration: 320 });
  }, [correct, tone]);

  const border = useAnimatedStyle(() => ({
    borderColor: interpolateColor(tone.value, [0, 1, 2], [hot.value, good.value, bad.value]),
  }));

  return (
    <Droppable<ChipData>
      activeStyle={{ borderColor: colors.primary }}
      capacity={4}
      droppableId={gapId}
      onDrop={onDrop}
    >
      <Pressable accessibilityRole="button" onPress={chip === null ? onFocus : onClear}>
        <Animated.View
          style={[
            styles.gap,
            border,
            {
              backgroundColor: chip === null ? "transparent" : colors.secondary,
            },
          ]}
        >
          <Text style={[styles.gapText, { color: chip === null ? colors.mutedForeground : colors.foreground }]}>
            {chip === null ? "gap" : chip.text}
          </Text>
        </Animated.View>
      </Pressable>
    </Droppable>
  );
}

export function GapExercise({
  problem,
  token,
  onPassed,
  onOpenGuide,
  scrollToEnd,
}: {
  readonly problem: ProblemView;
  readonly token: string;
  readonly onPassed: () => void;
  readonly onOpenGuide: () => void;
  readonly scrollToEnd: () => void;
}) {
  const { colors } = useTheme();
  const puzzle = problem.gap;
  const [fills, setFills] = useState<Record<string, string>>({});
  const [activeGap, setActiveGap] = useState<string | null>(null);
  const [grades, setGrades] = useState<Readonly<Record<string, boolean>> | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passed, setPassed] = useState(problem.solved);
  const [fails, setFails] = useState(problem.failedAttempts);

  if (puzzle === null) {
    return <Text style={{ color: colors.mutedForeground }}>This exercise is not available on the phone yet.</Text>;
  }

  const chipById = (id: string | undefined): GapChip | null => {
    if (id === undefined) {
      return null;
    }
    for (const chip of puzzle.chips) {
      if (chip.id === id) {
        return chip;
      }
    }
    return null;
  };

  const used: Record<string, true> = {};
  for (const gapId of Object.keys(fills)) {
    const chipId = fills[gapId];
    if (chipId !== undefined) {
      used[chipId] = true;
    }
  }

  const place = (gapId: string, chip: ChipData) => {
    setFills((current) => {
      const next: Record<string, string> = {};
      for (const key of Object.keys(current)) {
        if (current[key] === chip.id) {
          continue;
        }
        const value = current[key];
        if (value === undefined) {
          continue;
        }
        next[key] = value;
      }
      next[gapId] = chip.id;
      return next;
    });
    setGrades(null);
    setActiveGap(null);
    setMessage(null);
    void Haptics.selectionAsync();
  };

  const clearGap = (gapId: string) => {
    setFills((current) => {
      const next: Record<string, string> = {};
      for (const key of Object.keys(current)) {
        if (key === gapId) {
          continue;
        }
        const value = current[key];
        if (value === undefined) {
          continue;
        }
        next[key] = value;
      }
      return next;
    });
    setGrades(null);
  };

  const focusGap = (gapId: string) => {
    setActiveGap(gapId);
    scrollToEnd();
  };

  const submit = async () => {
    setPending(true);
    setMessage(null);
    try {
      const data = await request<{ submitGap: GapSubmission }>(
        SUBMIT_GAP,
        { problemId: problem.id, fillsJson: JSON.stringify(fills) },
        token,
      );
      const next: Record<string, boolean> = {};
      for (const grade of data.submitGap.gaps) {
        next[grade.gapId] = data.submitGap.passed ? true : grade.correct;
      }
      setGrades(next);
      setPassed(data.submitGap.passed);
      if (data.submitGap.passed) {
        setMessage("That passes.");
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPassed();
      } else {
        setMessage(
          data.submitGap.gaps.every((grade: GapGrade) => grade.correct)
            ? data.submitGap.submission.feedback
            : "Some gaps are not the solution this exercise is looking for.",
        );
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setFails((current) => current + 1);
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not submit that attempt.");
    }
    setPending(false);
  };

  const lines = linesFrom(puzzle.parts);

  return (
    <DropProvider>
      <View style={styles.block}>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>Exercise</Text>
        <Text style={[styles.exerciseTitle, { color: colors.foreground }]}>{problem.title}</Text>
        <Reading markdown={problem.promptMd} />
        {problem.examples.length === 0 ? null : (
          <Card>
            {problem.examples.map((example) => (
              <View key={example.call} style={styles.example}>
                <Text style={[styles.exampleCall, { color: colors.foreground }]}>{example.call}</Text>
                <Text style={[styles.exampleOut, { color: colors.mutedForeground }]}>{example.output}</Text>
              </View>
            ))}
          </Card>
        )}
        <View style={[styles.code, { backgroundColor: colors.code, borderColor: colors.border }]}>
          {lines.map((line, lineIndex) => (
            <View key={`line-${lineIndex}`} style={styles.line}>
              {line.map((piece, pieceIndex) => {
                if (piece.kind === "text") {
                  return (
                    <Text key={`t-${lineIndex}-${pieceIndex}`} style={[styles.codeText, { color: colors.foreground }]}>
                      {piece.text}
                    </Text>
                  );
                }
                const gapId = piece.gapId ?? "";
                return (
                  <GapSlot
                    key={gapId}
                    active={activeGap === gapId}
                    chip={chipById(fills[gapId])}
                    correct={grades === null ? null : (grades[gapId] ?? false)}
                    gapId={gapId}
                    onClear={() => clearGap(gapId)}
                    onDrop={(data) => place(gapId, data)}
                    onFocus={() => focusGap(gapId)}
                  />
                );
              })}
            </View>
          ))}
        </View>
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          {activeGap === null
            ? "Drag a snippet into a gap, or tap a gap and then tap a snippet."
            : "Tap a snippet to fill the gap you selected."}
        </Text>
        <View style={styles.chips}>
          {puzzle.chips.map((chip) => {
            if (used[chip.id] === true) {
              return null;
            }
            return (
              <Draggable<ChipData>
                key={chip.id}
                collisionAlgorithm="center"
                data={{ id: chip.id, text: chip.text }}
                preDragDelay={140}
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (activeGap === null) {
                      return;
                    }
                    place(activeGap, chip);
                  }}
                >
                  <View style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <Text style={[styles.chipText, { color: colors.foreground }]}>{chip.text}</Text>
                  </View>
                </Pressable>
              </Draggable>
            );
          })}
        </View>
        {message === null ? null : (
          <Text style={[styles.message, { color: passed ? colors.success : colors.destructive }]}>{message}</Text>
        )}
        {fails >= 2 && !passed ? (
          <Animated.View entering={FadeInDown.duration(360)}>
            <Pressable accessibilityRole="button" onPress={onOpenGuide}>
              <Text style={[styles.stuck, { color: colors.foreground }]}>Stuck? Open the solution explanation</Text>
            </Pressable>
          </Animated.View>
        ) : null}
        <Button
          disabled={passed}
          label={passed ? "Passed" : "Submit"}
          onPress={() => void submit()}
          pending={pending}
        />
      </View>
    </DropProvider>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 14,
    marginTop: 28,
  },
  kicker: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  exerciseTitle: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  example: {
    gap: 2,
  },
  exampleCall: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
  },
  exampleOut: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
  },
  code: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  line: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  codeText: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
    lineHeight: 22,
  },
  gap: {
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: "center",
    minHeight: 32,
    minWidth: 72,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gapText: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
  },
  hint: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
  },
  message: {
    fontFamily: "Geist_500Medium",
    fontSize: 15,
    lineHeight: 22,
  },
  stuck: {
    fontFamily: "Geist_400Regular",
    fontSize: 15,
    textDecorationLine: "underline",
  },
});

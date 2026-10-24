import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
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
import { CodeLine, CodeWindow } from "@/lesson/code-window";
import { useCodeTheme } from "@/lesson/code-theme";
import { GapOutline } from "@/lesson/completion";
import { exerciseStatus, StatusMark, statusLabel } from "@/course/status-mark";
import { exerciseHighlightLanguage } from "@/lesson/highlight";
import { HighlightedCode } from "@/lesson/highlighted-code";
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

const toneTarget = (correct: boolean | null): number => {
  if (correct === null) {
    return 0;
  }
  if (correct) {
    return 1;
  }
  return 2;
};

const lineHasGap = (line: readonly LinePiece[]): boolean => {
  for (const piece of line) {
    if (piece.kind === "gap") {
      return true;
    }
  }
  return false;
};

const languageLabel = (starterCode: string): string => {
  if (exerciseHighlightLanguage(starterCode) === "javascript") {
    return "JavaScript";
  }
  return "TypeScript";
};

function GapSlot({
  active,
  celebrate,
  chip,
  correct,
  delay,
  gapId,
  language,
  onClear,
  onDrop,
  onFocus,
}: {
  readonly active: boolean;
  readonly celebrate: boolean;
  readonly chip: GapChip | null;
  readonly correct: boolean | null;
  readonly delay: number;
  readonly gapId: string;
  readonly language: ReturnType<typeof exerciseHighlightLanguage>;
  readonly onClear: () => void;
  readonly onDrop: (data: ChipData) => void;
  readonly onFocus: () => void;
}) {
  const { palette } = useCodeTheme();
  const target = toneTarget(correct);
  const tone = useSharedValue(target);
  const seen = useRef(correct);
  const idleBorder = useSharedValue(active ? palette.gapActive : palette.gapBorder);
  const goodBorder = useSharedValue(palette.success);
  const badBorder = useSharedValue(palette.danger);
  const idleFill = useSharedValue(palette.gapBackground);
  const goodFill = useSharedValue(palette.successFill);
  const badFill = useSharedValue(palette.dangerFill);
  idleBorder.value = active ? palette.gapActive : palette.gapBorder;
  goodBorder.value = palette.success;
  badBorder.value = palette.danger;
  idleFill.value = palette.gapBackground;
  goodFill.value = palette.successFill;
  badFill.value = palette.dangerFill;

  if (seen.current !== correct) {
    seen.current = correct;
    tone.value = withTiming(target, { duration: 480, easing: Easing.out(Easing.cubic) });
  }

  const frame = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(tone.value, [0, 1, 2], [idleFill.value, goodFill.value, badFill.value]),
    borderColor: interpolateColor(tone.value, [0, 1, 2], [idleBorder.value, goodBorder.value, badBorder.value]),
  }));

  return (
    <Droppable<ChipData>
      activeStyle={{ borderColor: palette.gapActive }}
      capacity={4}
      droppableId={gapId}
      onDrop={onDrop}
      style={styles.droppable}
    >
      <Pressable
        accessibilityLabel={chip === null ? "Empty gap" : chip.text}
        accessibilityRole="button"
        accessibilityState={{ checked: correct === true }}
        onPress={chip === null ? onFocus : onClear}
      >
        <Animated.View style={[styles.gap, frame]}>
          {correct === true ? <GapOutline animate={celebrate} color={palette.success} delay={delay} /> : null}
          {chip === null ? (
            <Text style={[styles.placeholder, { color: palette.muted }]}>gap</Text>
          ) : (
            <HighlightedCode code={chip.text} language={language} />
          )}
        </Animated.View>
      </Pressable>
    </Droppable>
  );
}

export function GapExercise({
  lessonSkipped,
  onNextExercise,
  onOpenGuide,
  onPassed,
  problem,
  scrollToEnd,
  token,
}: {
  readonly lessonSkipped: boolean;
  readonly onNextExercise: (() => void) | null;
  readonly onOpenGuide: () => void;
  readonly onPassed: () => void;
  readonly problem: ProblemView;
  readonly scrollToEnd: () => void;
  readonly token: string;
}) {
  const { colors } = useTheme();
  const puzzle = problem.gap;
  const [fills, setFills] = useState<Record<string, string>>({});
  const [activeGap, setActiveGap] = useState<string | null>(null);
  const [grades, setGrades] = useState<Readonly<Record<string, boolean>> | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passed, setPassed] = useState(problem.solved);
  const [celebrate, setCelebrate] = useState(false);
  const [fails, setFails] = useState(problem.failedAttempts);
  const language = exerciseHighlightLanguage(problem.starterCode);

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

  const gapCorrect = (gapId: string): boolean | null => {
    if (passed) {
      return true;
    }
    if (grades === null) {
      return null;
    }
    return grades[gapId] ?? false;
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
        setCelebrate(true);
        setMessage("That passes.");
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPassed();
        return;
      }
      setMessage(
        data.submitGap.gaps.every((grade: GapGrade) => grade.correct)
          ? data.submitGap.submission.feedback
          : "Some gaps are not the solution this exercise is looking for.",
      );
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFails((current) => current + 1);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Could not submit that attempt.");
    } finally {
      setPending(false);
    }
  };

  const lines = linesFrom(puzzle.parts);
  const status = exerciseStatus({ solved: passed, attempts: problem.attempts }, lessonSkipped);
  const label = statusLabel(status);

  return (
    <DropProvider>
      <View style={styles.block}>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>{label}</Text>
        <View style={styles.titleRow}>
          <Text style={[styles.exerciseTitle, { color: colors.foreground }]}>{problem.title}</Text>
          <StatusMark label={label} status={status} />
        </View>
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
        <CodeWindow celebrate={celebrate} languageLabel={languageLabel(problem.starterCode)} passed={passed}>
          {lines.map((line, lineIndex) => {
            const emphasize = passed && lineHasGap(line);
            return (
              <CodeLine key={`line-${lineIndex}`} animate={celebrate} delay={lineIndex * 90} emphasize={emphasize}>
                {line.map((piece, pieceIndex) => {
                  if (piece.kind === "text") {
                    return <HighlightedCode key={`t-${lineIndex}-${pieceIndex}`} code={piece.text} language={language} />;
                  }
                  const gapId = piece.gapId ?? "";
                  return (
                    <GapSlot
                      key={gapId}
                      active={activeGap === gapId}
                      celebrate={celebrate}
                      chip={chipById(fills[gapId])}
                      correct={gapCorrect(gapId)}
                      delay={lineIndex * 90}
                      gapId={gapId}
                      language={language}
                      onClear={() => clearGap(gapId)}
                      onDrop={(data) => place(gapId, data)}
                      onFocus={() => focusGap(gapId)}
                    />
                  );
                })}
              </CodeLine>
            );
          })}
        </CodeWindow>
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
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.message, { color: passed ? colors.success : colors.destructive }]}
          >
            {message}
          </Text>
        )}
        {fails >= 2 && !passed ? (
          <Animated.View entering={FadeInDown.duration(360)}>
            <Pressable accessibilityRole="button" onPress={onOpenGuide}>
              <Text style={[styles.stuck, { color: colors.foreground }]}>Stuck? Open the solution explanation</Text>
            </Pressable>
          </Animated.View>
        ) : null}
        <Button disabled={passed} label={passed ? "Passed" : "Submit"} onPress={() => void submit()} pending={pending} />
        {passed && onNextExercise !== null ? (
          <View
            onLayout={() => {
              if (!celebrate) {
                return;
              }
              scrollToEnd();
            }}
          >
            <Button label="Next Exercise" onPress={onNextExercise} />
          </View>
        ) : null}
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
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  exerciseTitle: {
    flex: 1,
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
  droppable: {
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  gap: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "nowrap",
    justifyContent: "center",
    minHeight: 32,
    minWidth: 72,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  placeholder: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
    lineHeight: 21,
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

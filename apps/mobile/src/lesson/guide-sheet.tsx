import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { ApiError, request } from "@/api/client";
import { SKIP_LESSON, SOLUTION_GUIDE } from "@/api/operations";
import type { SkipResult, SolutionGuide } from "@/api/types";
import { CodeWindow, PlainCodeLines } from "@/lesson/code-window";
import { exerciseHighlightLanguage } from "@/lesson/highlight";
import { HighlightedCode } from "@/lesson/highlighted-code";
import { MermaidBlock } from "@/lesson/visuals";
import { useTheme } from "@/theme/theme";
import { Button } from "@/ui/primitives";

export function GuideSheet({
  visible,
  problemId,
  lessonSlug,
  token,
  onClose,
  onSkipped,
}: {
  readonly visible: boolean;
  readonly problemId: string;
  readonly lessonSlug: string;
  readonly token: string;
  readonly onClose: () => void;
  readonly onSkipped: (result: SkipResult) => void;
}) {
  const { colors } = useTheme();
  const [guide, setGuide] = useState<SolutionGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    let active = true;
    void request<{ solutionGuide: SolutionGuide }>(SOLUTION_GUIDE, { problemId }, token)
      .then((data) => {
        if (active) {
          setGuide(data.solutionGuide);
          setError(null);
        }
      })
      .catch((caught: unknown) => {
        if (!active) {
          return;
        }
        setError(caught instanceof ApiError ? caught.message : "Could not open the explanation.");
      });
    return () => {
      active = false;
    };
  }, [problemId, token, visible]);

  const skip = async () => {
    setPending(true);
    try {
      const data = await request<{ skipLesson: SkipResult }>(SKIP_LESSON, { slug: lessonSlug }, token);
      onSkipped(data.skipLesson);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Could not skip that lesson.");
    }
    setPending(false);
  };

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <Pressable accessibilityRole="button" onPress={onClose} style={StyleSheet.absoluteFill} />
        <Animated.View entering={SlideInDown.duration(320)} style={styles.sheetWrap}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.title, { color: colors.foreground }]}>How to solve this exercise</Text>
            <ScrollView contentContainerStyle={styles.body}>
              {error === null ? null : <Text style={[styles.copy, { color: colors.destructive }]}>{error}</Text>}
              {guide === null
                ? null
                : guide.blocks.map((block, index) => {
                    if (block.kind === "heading") {
                      return (
                        <Text key={`h-${index}`} style={[styles.heading, { color: colors.foreground }]}>
                          {block.text}
                        </Text>
                      );
                    }
                    if (block.kind === "list" && block.items !== null) {
                      return (
                        <View key={`l-${index}`} style={styles.list}>
                          {block.items.map((item) => (
                            <Text key={item} style={[styles.copy, { color: colors.foreground }]}>
                              {"•  "}
                              {item}
                            </Text>
                          ))}
                        </View>
                      );
                    }
                    if (block.kind === "diagram" && block.chart !== null) {
                      return <MermaidBlock key={`d-${index}`} chart={block.chart} />;
                    }
                    if (block.kind === "code") {
                      const language = exerciseHighlightLanguage(guide.code);
                      const label = language === "javascript" ? "JavaScript" : "TypeScript";
                      return (
                        <Animated.View entering={FadeIn.duration(240)} key={`c-${index}`}>
                          <CodeWindow languageLabel={label}>
                            <PlainCodeLines code={guide.code} language={language} />
                          </CodeWindow>
                        </Animated.View>
                      );
                    }
                    return (
                      <Text key={`p-${index}`} style={[styles.copy, { color: colors.foreground }]}>
                        {block.text}
                      </Text>
                    );
                  })}
              {guide === null ? null : (
                <View style={styles.reveals}>
                  <Text style={[styles.heading, { color: colors.foreground }]}>The gaps</Text>
                  {guide.reveals.map((reveal, index) => (
                    <View key={reveal.gapId} style={styles.reveal}>
                      <Text style={[styles.codeLine, { color: colors.foreground }]}>{index + 1}.</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.revealScroll}
                      >
                        <HighlightedCode code={reveal.text} language="typescript" />
                      </ScrollView>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            <View style={styles.actions}>
              <Button label="I'll implement it" onPress={onClose} variant="secondary" />
              <Button label="Skip lesson" onPress={() => void skip()} pending={pending} />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetWrap: {
    maxHeight: "88%",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "100%",
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    borderRadius: 999,
    height: 4,
    marginBottom: 12,
    width: 40,
  },
  title: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  body: {
    gap: 12,
    paddingVertical: 16,
  },
  heading: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 20,
    lineHeight: 26,
  },
  copy: {
    fontFamily: "Geist_400Regular",
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 6,
  },
  reveals: {
    gap: 8,
  },
  reveal: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  revealScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  codeLine: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
    lineHeight: 20,
    minWidth: 22,
  },
  actions: {
    gap: 10,
  },
});

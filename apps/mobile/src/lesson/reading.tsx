import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { request } from "@/api/client";
import { RUN_SNIPPET } from "@/api/operations";
import type { RunLine } from "@/api/types";
import { parseBlocks, parseInline, type InlinePiece } from "@/lesson/blocks";
import { MermaidBlock, VisualizationBlock } from "@/lesson/visuals";
import { useTheme } from "@/theme/theme";

function Inline({ pieces }: { readonly pieces: readonly InlinePiece[] }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.paragraph, { color: colors.foreground }]}>
      {pieces.map((piece, index) => {
        if (piece.kind === "code") {
          return (
            <Text key={`${piece.text}-${index}`} style={[styles.inlineCode, { backgroundColor: colors.secondary }]}>
              {piece.text}
            </Text>
          );
        }
        if (piece.kind === "strong") {
          return (
            <Text key={`${piece.text}-${index}`} style={styles.strong}>
              {piece.text}
            </Text>
          );
        }
        return <Text key={`${piece.text}-${index}`}>{piece.text}</Text>;
      })}
    </Text>
  );
}

function CodeSample({ code }: { readonly code: string }) {
  const { colors } = useTheme();
  const [lines, setLines] = useState<readonly RunLine[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setPending(true);
    setError(null);
    try {
      const data = await request<{ runSnippet: { lines: RunLine[] } }>(RUN_SNIPPET, { code }, null);
      setLines(data.runSnippet.lines);
    } catch {
      setError("Could not run that example.");
    }
    setPending(false);
  };

  return (
    <View style={[styles.codeCard, { borderColor: colors.border, backgroundColor: colors.code }]}>
      <Text style={[styles.code, { color: colors.foreground }]}>{code}</Text>
      <Pressable accessibilityRole="button" onPress={() => void run()} style={styles.run}>
        <Text style={[styles.runLabel, { color: colors.foreground }]}>{pending ? "Running…" : "Run"}</Text>
      </Pressable>
      {error === null ? null : <Text style={[styles.runOutput, { color: colors.destructive }]}>{error}</Text>}
      {lines === null
        ? null
        : lines.map((line, index) => (
            <Text
              key={`${line.text}-${index}`}
              style={[styles.runOutput, { color: line.kind === "error" ? colors.destructive : colors.mutedForeground }]}
            >
              {line.text}
            </Text>
          ))}
    </View>
  );
}

export function Reading({ markdown }: { readonly markdown: string }) {
  const { colors } = useTheme();
  const blocks = parseBlocks(markdown);
  return (
    <View style={styles.reading}>
      {blocks.map((block, index) => {
        if (block.kind === "heading") {
          return (
            <Text
              key={`h-${index}`}
              style={[
                block.level === 1 ? styles.h1 : styles.h2,
                { color: colors.foreground },
              ]}
            >
              {block.text}
            </Text>
          );
        }
        if (block.kind === "paragraph") {
          return <Inline key={`p-${index}`} pieces={parseInline(block.text)} />;
        }
        if (block.kind === "list") {
          return (
            <View key={`l-${index}`} style={styles.list}>
              {block.items.map((item) => (
                <Text key={item} style={[styles.paragraph, { color: colors.foreground }]}>
                  {"•  "}
                  {item}
                </Text>
              ))}
            </View>
          );
        }
        if (block.kind === "mermaid") {
          return <MermaidBlock key={`m-${index}`} chart={block.code} />;
        }
        if (block.kind === "visualization") {
          return <VisualizationBlock key={`v-${index}`} source={block.source} />;
        }
        return <CodeSample key={`c-${index}`} code={block.code} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  reading: {
    gap: 14,
  },
  h1: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 28,
    letterSpacing: -0.4,
    lineHeight: 34,
    marginTop: 8,
  },
  h2: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 22,
    letterSpacing: -0.3,
    lineHeight: 28,
    marginTop: 8,
  },
  paragraph: {
    fontFamily: "Geist_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    fontFamily: "Geist_600SemiBold",
  },
  inlineCode: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 14,
  },
  list: {
    gap: 6,
  },
  codeCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  code: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  run: {
    alignSelf: "flex-start",
  },
  runLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  runOutput: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
});

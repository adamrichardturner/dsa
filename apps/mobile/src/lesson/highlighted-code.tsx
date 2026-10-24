import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCodeTheme } from "@/lesson/code-theme";
import { highlightCode, tokenColor, type HighlightLanguage } from "@/lesson/highlight";

const mono = "JetBrainsMono_400Regular";
const monoItalic = "JetBrainsMono_400Regular_Italic";

export function HighlightedCode({
  code,
  language,
  fontSize = 13,
}: {
  readonly code: string;
  readonly language: HighlightLanguage;
  readonly fontSize?: number;
}) {
  const { themeId } = useCodeTheme();
  const pieces = highlightCode(code, language);
  const nodes: ReactNode[] = [];
  for (let index = 0; index < pieces.length; index += 1) {
    const piece = pieces[index];
    if (piece === undefined) {
      continue;
    }
    nodes.push(
      <Text
        key={`${piece.kind}-${index}`}
        style={{
          color: tokenColor(piece.kind, themeId),
          flexShrink: 0,
          fontFamily: piece.italic ? monoItalic : mono,
          fontSize,
          lineHeight: fontSize + 8,
        }}
      >
        {piece.text}
      </Text>,
    );
  }
  return <View style={styles.row}>{nodes}</View>;
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "nowrap",
  },
});

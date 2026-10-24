import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useCodeTheme } from "@/lesson/code-theme";
import {
  highlightCode,
  tokenColor,
  type HighlightLanguage,
} from "@/lesson/highlight";

const mono = "JetBrainsMono_400Regular";
const monoItalic = "JetBrainsMono_400Regular_Italic";

// JetBrains Mono is a 0.6em monospace. A run of ordinary spaces can measure as
// zero width once Prism splits the indent into its own text node.
const monoAdvance = 0.6;

const leadingColumns = (
  code: string,
): { readonly columns: number; readonly body: string } => {
  let columns = 0;
  let index = 0;
  while (index < code.length) {
    const character = code[index];
    if (character === " ") {
      columns += 1;
      index += 1;
      continue;
    }
    if (character === "\t") {
      columns += 2;
      index += 1;
      continue;
    }
    break;
  }
  return { columns, body: code.slice(index) };
};

const keepSpaces = (text: string): string => {
  let next = "";
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === undefined) {
      continue;
    }
    if (character === " ") {
      next += "\u00A0";
      continue;
    }
    if (character === "\t") {
      next += "\u00A0\u00A0";
      continue;
    }
    next += character;
  }
  return next;
};

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
  const indent = leadingColumns(code);
  const pieces =
    indent.body.length === 0 ? [] : highlightCode(indent.body, language);
  const nodes: ReactNode[] = [];
  for (let index = 0; index < pieces.length; index += 1) {
    const piece = pieces[index];
    if (piece === undefined) {
      continue;
    }
    const text = keepSpaces(piece.text);
    if (text.length === 0) {
      continue;
    }
    nodes.push(
      <Text
        key={`${piece.kind}-${index}`}
        style={{
          color: tokenColor(piece.kind, themeId),
          fontFamily: piece.italic ? monoItalic : mono,
          fontSize,
          lineHeight: fontSize + 8,
        }}
      >
        {text}
      </Text>,
    );
  }

  const lineHeight = fontSize + 8;
  return (
    <View style={styles.row}>
      {indent.columns === 0 ? null : (
        <Text
          style={{
            flexShrink: 0,
            fontFamily: mono,
            fontSize,
            lineHeight,
            minWidth: indent.columns * fontSize * monoAdvance,
          }}
        >
          {"\u00A0".repeat(indent.columns)}
        </Text>
      )}
      {nodes.length === 0 ? null : (
        <Text style={{ flexShrink: 0, fontFamily: mono, fontSize, lineHeight }}>
          {nodes}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "nowrap",
  },
});

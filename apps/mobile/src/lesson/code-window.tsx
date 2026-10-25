import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CompleteTick } from "@/lesson/completion";
import { useCodeTheme, type CodePalette, type CodeThemeId } from "@/lesson/code-theme";
import { HighlightedCode } from "@/lesson/highlighted-code";
import type { HighlightLanguage } from "@/lesson/highlight";

function ThemeOption({
  current,
  id,
  label,
  onPress,
  palette,
}: {
  readonly current: CodeThemeId;
  readonly id: CodeThemeId;
  readonly label: string;
  readonly onPress: (id: CodeThemeId) => void;
  readonly palette: CodePalette;
}) {
  const selected = current === id;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onPress(id)}
      style={[styles.option, { backgroundColor: selected ? palette.background : "transparent" }]}
    >
      <Text style={[styles.optionLabel, { color: palette.foreground }]}>{label}</Text>
      {selected ? <Text style={[styles.optionMark, { color: palette.success }]}>✓</Text> : null}
    </Pressable>
  );
}

function ThemeMenu() {
  const { palette, setThemeId, themeId } = useCodeTheme();
  const [open, setOpen] = useState(false);
  const choose = (next: CodeThemeId) => {
    setThemeId(next);
    setOpen(false);
  };

  return (
    <View style={styles.menuAnchor}>
      <Pressable
        accessibilityLabel="Code theme"
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        hitSlop={6}
        onPress={() => setOpen((current) => !current)}
        style={[styles.menuButton, { backgroundColor: palette.background, borderColor: palette.border }]}
      >
        <Text style={[styles.menuLabel, { color: palette.foreground }]}>{palette.label}</Text>
        <Text style={[styles.chevron, { color: palette.muted }]}>{open ? "▴" : "▾"}</Text>
      </Pressable>
      {open ? (
        <View style={[styles.menu, { backgroundColor: palette.menu, borderColor: palette.border }]}>
          <ThemeOption current={themeId} id="monokai" label="Dark mode" onPress={choose} palette={palette} />
          <ThemeOption current={themeId} id="light" label="Light mode" onPress={choose} palette={palette} />
        </View>
      ) : null}
    </View>
  );
}

export function CodeLine({ children }: { readonly children: ReactNode }) {
  return <View style={styles.line}>{children}</View>;
}

export function PlainCodeLines({
  code,
  language,
}: {
  readonly code: string;
  readonly language: HighlightLanguage;
}) {
  const lines = code.replaceAll("\r\n", "\n").split("\n");
  const nodes: ReactNode[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    nodes.push(
      <CodeLine key={`line-${index}`}>
        {line.length === 0 ? <Text style={styles.blank}> </Text> : <HighlightedCode code={line} language={language} />}
      </CodeLine>,
    );
  }
  return <>{nodes}</>;
}

export function CodeWindow({
  celebrate = false,
  children,
  languageLabel,
  passed = false,
}: {
  readonly celebrate?: boolean;
  readonly children: ReactNode;
  readonly languageLabel: string;
  readonly passed?: boolean;
}) {
  const { palette } = useCodeTheme();
  return (
    <View style={[styles.window, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <View style={[styles.header, { backgroundColor: palette.header, borderBottomColor: palette.border }]}>
        <Text numberOfLines={1} style={[styles.language, { color: palette.muted }]}>
          {languageLabel}
        </Text>
        <View style={styles.headerActions}>
          {passed ? <CompleteTick animate={celebrate} color={palette.success} /> : null}
          <ThemeMenu />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
        style={styles.scroller}
      >
        <View style={styles.lines}>{children}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 4,
  },
  language: {
    flexShrink: 1,
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.4,
    paddingTop: 8,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: 8,
  },
  menuAnchor: {
    alignItems: "flex-end",
  },
  menuButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 10,
  },
  menuLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 13,
  },
  chevron: {
    fontSize: 11,
  },
  menu: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    minWidth: 180,
  },
  option: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 40,
    paddingHorizontal: 12,
  },
  optionLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 14,
  },
  optionMark: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 14,
  },
  scroller: {
    flexGrow: 0,
    flexShrink: 0,
  },
  scrollContent: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  lines: {
    alignItems: "flex-start",
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  line: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "nowrap",
    minHeight: 24,
  },
  blank: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 13,
    lineHeight: 21,
  },
});

import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type {
  AlignType,
  Blockquote,
  Code,
  Delete,
  Emphasis,
  FootnoteDefinition,
  Heading,
  Image as ImageNode,
  Link,
  List,
  ListItem,
  Paragraph,
  PhrasingContent,
  RootContent,
  Strong,
  Table,
  TableCell,
} from "mdast";
import { request } from "@/api/client";
import { RUN_SNIPPET } from "@/api/operations";
import type { RunLine } from "@/api/types";
import { PlainCodeLines } from "@/lesson/code-window";
import { useCodeTheme } from "@/lesson/code-theme";
import { languageFromLabel, type HighlightLanguage } from "@/lesson/highlight";
import { parseLesson } from "@/lesson/markdown";
import { useTheme } from "@/theme/theme";
import { MermaidBlock, VisualizationBlock } from "@/lesson/visuals";

interface MarkdownColors {
  readonly foreground: string;
  readonly muted: string;
  readonly border: string;
  readonly secondary: string;
}

const pathOnly = (url: string): string => {
  const hash = url.indexOf("#");
  const query = url.indexOf("?");
  let end = url.length;
  if (hash !== -1 && hash < end) {
    end = hash;
  }
  if (query !== -1 && query < end) {
    end = query;
  }
  return url.slice(0, end);
};

const articleSlug = (url: string): string | null => {
  const path = pathOnly(url);
  const marker = "/articles/";
  const index = path.indexOf(marker);
  if (index === -1) {
    return null;
  }
  const slug = path.slice(index + marker.length);
  if (slug.length === 0 || slug.includes("/")) {
    return null;
  }
  try {
    return decodeURIComponent(slug);
  } catch {
    return null;
  }
};

const openUrl = (url: string): void => {
  const slug = articleSlug(url);
  if (slug !== null) {
    router.push({ pathname: "/articles/[slug]", params: { slug } });
    return;
  }
  if (url.startsWith("/")) {
    return;
  }
  void Linking.openURL(url);
};

const unused = (node: never): null => {
  void node;
  return null;
};

const headingStyle = (depth: Heading["depth"]) => {
  if (depth <= 1) {
    return styles.h1;
  }
  if (depth === 2) {
    return styles.h2;
  }
  return styles.h3;
};

const cellAlign = (align: AlignType | null | undefined): "left" | "center" | "right" => {
  if (align === "center" || align === "right") {
    return align;
  }
  return "left";
};

const fenceLanguage = (lang: string | null | undefined): "mermaid" | "visualization" | HighlightLanguage => {
  const value = (lang ?? "").trim().toLowerCase();
  if (value === "mermaid") {
    return "mermaid";
  }
  if (value === "visualization") {
    return "visualization";
  }
  return languageFromLabel(value);
};

const runnable = (language: HighlightLanguage): boolean => {
  return language === "typescript" || language === "javascript";
};

function Phrases({
  colors,
  nodes,
}: {
  readonly colors: MarkdownColors;
  readonly nodes: readonly PhrasingContent[];
}) {
  const rendered: ReactNode[] = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node === undefined) {
      continue;
    }
    rendered.push(<Phrase key={index} colors={colors} node={node} />);
  }
  return <>{rendered}</>;
}

function Phrase({
  colors,
  node,
}: {
  readonly colors: MarkdownColors;
  readonly node: PhrasingContent;
}) {
  switch (node.type) {
    case "text": {
      return node.value;
    }
    case "strong": {
      return <StrongText colors={colors} node={node} />;
    }
    case "emphasis": {
      return <EmphasisText colors={colors} node={node} />;
    }
    case "delete": {
      return <DeleteText colors={colors} node={node} />;
    }
    case "inlineCode": {
      return (
        <Text style={[styles.inlineCode, { backgroundColor: colors.secondary, color: colors.foreground }]}>
          {node.value}
        </Text>
      );
    }
    case "break": {
      return "\n";
    }
    case "link": {
      return <LinkText colors={colors} node={node} />;
    }
    case "linkReference": {
      return <Phrases colors={colors} nodes={node.children} />;
    }
    case "image": {
      return <MarkdownImage node={node} />;
    }
    case "imageReference": {
      return node.alt ?? "";
    }
    case "footnoteReference": {
      return <Text style={styles.footnote}>{node.identifier}</Text>;
    }
    case "html": {
      return null;
    }
    default: {
      return unused(node);
    }
  }
}

function StrongText({ colors, node }: { readonly colors: MarkdownColors; readonly node: Strong }) {
  return (
    <Text style={styles.strong}>
      <Phrases colors={colors} nodes={node.children} />
    </Text>
  );
}

function EmphasisText({ colors, node }: { readonly colors: MarkdownColors; readonly node: Emphasis }) {
  return (
    <Text style={styles.emphasis}>
      <Phrases colors={colors} nodes={node.children} />
    </Text>
  );
}

function DeleteText({ colors, node }: { readonly colors: MarkdownColors; readonly node: Delete }) {
  return (
    <Text style={styles.delete}>
      <Phrases colors={colors} nodes={node.children} />
    </Text>
  );
}

function LinkText({ colors, node }: { readonly colors: MarkdownColors; readonly node: Link }) {
  return (
    <Text
      accessibilityRole="link"
      onPress={() => openUrl(node.url)}
      style={[styles.link, { color: colors.foreground }]}
    >
      <Phrases colors={colors} nodes={node.children} />
    </Text>
  );
}

function MarkdownImage({ node }: { readonly node: ImageNode }) {
  const alt = node.alt ?? "";
  return <Image accessibilityLabel={alt} source={{ uri: node.url }} style={styles.image} />;
}

function HeadingView({ colors, node }: { readonly colors: MarkdownColors; readonly node: Heading }) {
  return (
    <Text accessibilityRole="header" style={[headingStyle(node.depth), { color: colors.foreground }]}>
      <Phrases colors={colors} nodes={node.children} />
    </Text>
  );
}

function ParagraphView({
  colors,
  compact,
  node,
}: {
  readonly colors: MarkdownColors;
  readonly compact: boolean;
  readonly node: Paragraph;
}) {
  return (
    <Text style={[compact ? styles.compact : styles.paragraph, { color: colors.foreground }]}>
      <Phrases colors={colors} nodes={node.children} />
    </Text>
  );
}

function ListView({ colors, node }: { readonly colors: MarkdownColors; readonly node: List }) {
  const ordered = node.ordered === true;
  const start = node.start ?? 1;
  return (
    <View style={styles.list}>
      {node.children.map((item, index) => (
        <ListItemView
          key={`${ordered ? "ordered" : "bullet"}-${index}`}
          colors={colors}
          index={index}
          node={item}
          ordered={ordered}
          start={start}
        />
      ))}
    </View>
  );
}

function ListItemView({
  colors,
  index,
  node,
  ordered,
  start,
}: {
  readonly colors: MarkdownColors;
  readonly index: number;
  readonly node: ListItem;
  readonly ordered: boolean;
  readonly start: number;
}) {
  const marker = listMarker(node, ordered, start + index);
  return (
    <View style={styles.listItem}>
      <Text style={[styles.marker, { color: colors.foreground }]}>{marker}</Text>
      <View style={styles.listBody}>
        {node.children.map((child, childIndex) => (
          <BlockView key={childIndex} colors={colors} compact node={child} />
        ))}
      </View>
    </View>
  );
}

const listMarker = (node: ListItem, ordered: boolean, number: number): string => {
  if (node.checked === true) {
    return "☑";
  }
  if (node.checked === false) {
    return "☐";
  }
  if (ordered) {
    return `${number}.`;
  }
  return "•";
};

function QuoteView({ colors, node }: { readonly colors: MarkdownColors; readonly node: Blockquote }) {
  return (
    <View style={[styles.quote, { borderLeftColor: colors.border }]}>
      {node.children.map((child, index) => (
        <BlockView key={index} colors={colors} compact={false} node={child} />
      ))}
    </View>
  );
}

function TableView({ colors, node }: { readonly colors: MarkdownColors; readonly node: Table }) {
  return (
    <ScrollView
      contentContainerStyle={styles.tableScroll}
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator
    >
      <View style={[styles.table, { borderColor: colors.border }]}>
        {node.children.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
            {row.children.map((cell, cellIndex) => (
              <TableCellView
                key={`cell-${rowIndex}-${cellIndex}`}
                align={cellAlign(node.align?.[cellIndex])}
                colors={colors}
                header={rowIndex === 0}
                node={cell}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function TableCellView({
  align,
  colors,
  header,
  node,
}: {
  readonly align: "left" | "center" | "right";
  readonly colors: MarkdownColors;
  readonly header: boolean;
  readonly node: TableCell;
}) {
  return (
    <View
      style={[
        styles.cell,
        {
          backgroundColor: header ? colors.secondary : "transparent",
          borderRightColor: colors.border,
        },
      ]}
    >
      <Text style={[header ? styles.cellHeader : styles.cellText, { color: colors.foreground, textAlign: align }]}>
        <Phrases colors={colors} nodes={node.children} />
      </Text>
    </View>
  );
}

function FootnoteView({
  colors,
  node,
}: {
  readonly colors: MarkdownColors;
  readonly node: FootnoteDefinition;
}) {
  return (
    <View style={styles.footnoteBlock}>
      <Text style={[styles.footnoteLabel, { color: colors.muted }]}>{node.identifier}</Text>
      {node.children.map((child, index) => (
        <BlockView key={index} colors={colors} compact={false} node={child} />
      ))}
    </View>
  );
}

function CodeSample({ code, language }: { readonly code: string; readonly language: HighlightLanguage }) {
  const { colors } = useTheme();
  const { palette } = useCodeTheme();
  const [lines, setLines] = useState<readonly RunLine[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showRun = runnable(language);

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
    <View style={[styles.codeCard, { backgroundColor: palette.background, borderColor: palette.border }]}>
      <ScrollView
        contentContainerStyle={styles.codeScroll}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
      >
        <View style={styles.codeLines}>
          <PlainCodeLines code={code} language={language} />
        </View>
      </ScrollView>
      {showRun ? (
        <Pressable accessibilityRole="button" onPress={() => void run()} style={styles.run}>
          <Text style={[styles.runLabel, { color: palette.foreground }]}>{pending ? "Running…" : "Run"}</Text>
        </Pressable>
      ) : null}
      {error === null ? null : <Text style={[styles.runOutput, { color: colors.destructive }]}>{error}</Text>}
      {lines === null
        ? null
        : lines.map((line, index) => (
            <Text
              key={`${line.text}-${index}`}
              style={[styles.runOutput, { color: line.kind === "error" ? colors.destructive : palette.muted }]}
            >
              {line.text}
            </Text>
          ))}
    </View>
  );
}

function CodeView({ node }: { readonly node: Code }) {
  const language = fenceLanguage(node.lang);
  if (language === "mermaid") {
    return <MermaidBlock chart={node.value} />;
  }
  if (language === "visualization") {
    return <VisualizationBlock source={node.value} />;
  }
  return <CodeSample code={node.value} language={language} />;
}

function BlockView({
  colors,
  compact,
  node,
}: {
  readonly colors: MarkdownColors;
  readonly compact: boolean;
  readonly node: RootContent;
}): ReactNode {
  switch (node.type) {
    case "heading": {
      return <HeadingView colors={colors} node={node} />;
    }
    case "paragraph": {
      return <ParagraphView colors={colors} compact={compact} node={node} />;
    }
    case "list": {
      return <ListView colors={colors} node={node} />;
    }
    case "listItem": {
      return <ListItemView colors={colors} index={0} node={node} ordered={false} start={1} />;
    }
    case "table": {
      return <TableView colors={colors} node={node} />;
    }
    case "blockquote": {
      return <QuoteView colors={colors} node={node} />;
    }
    case "code": {
      return <CodeView node={node} />;
    }
    case "thematicBreak": {
      return <View style={[styles.hr, { backgroundColor: colors.border }]} />;
    }
    case "footnoteDefinition": {
      return <FootnoteView colors={colors} node={node} />;
    }
    case "tableRow": {
      return (
        <View>
          {node.children.map((cell, index) => (
            <TableCellView key={index} align="left" colors={colors} header={false} node={cell} />
          ))}
        </View>
      );
    }
    case "tableCell": {
      return <TableCellView align="left" colors={colors} header={false} node={node} />;
    }
    case "text":
    case "emphasis":
    case "strong":
    case "delete":
    case "inlineCode":
    case "link":
    case "linkReference":
    case "break":
    case "image":
    case "imageReference":
    case "footnoteReference":
    case "html": {
      return (
        <Text style={[styles.paragraph, { color: colors.foreground }]}>
          <Phrase colors={colors} node={node} />
        </Text>
      );
    }
    case "definition":
    case "yaml": {
      return null;
    }
    default: {
      return unused(node);
    }
  }
}

export function Reading({ markdown }: { readonly markdown: string }) {
  const { colors } = useTheme();
  const markdownColors: MarkdownColors = {
    foreground: colors.foreground,
    muted: colors.mutedForeground,
    border: colors.border,
    secondary: colors.secondary,
  };
  const tree = parseLesson(markdown);
  return (
    <View style={styles.reading}>
      {tree.children.map((node, index) => (
        <BlockView key={index} colors={markdownColors} compact={false} node={node} />
      ))}
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
  h3: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
    marginTop: 4,
  },
  paragraph: {
    fontFamily: "Geist_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  compact: {
    fontFamily: "Geist_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    fontFamily: "Geist_600SemiBold",
  },
  emphasis: {
    fontFamily: "Geist_400Regular_Italic",
  },
  delete: {
    textDecorationLine: "line-through",
  },
  inlineCode: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 14,
  },
  link: {
    textDecorationLine: "underline",
  },
  footnote: {
    fontFamily: "Geist_500Medium",
    fontSize: 12,
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
  },
  marker: {
    fontFamily: "Geist_500Medium",
    fontSize: 16,
    lineHeight: 24,
    minWidth: 22,
  },
  listBody: {
    flex: 1,
    gap: 4,
  },
  quote: {
    borderLeftWidth: 3,
    gap: 8,
    paddingLeft: 12,
  },
  hr: {
    height: 1,
    marginVertical: 4,
  },
  tableScroll: {
    alignItems: "flex-start",
  },
  table: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  tableRow: {
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "nowrap",
  },
  cell: {
    borderRightWidth: 1,
    justifyContent: "center",
    maxWidth: 240,
    minWidth: 132,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cellHeader: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
  },
  cellText: {
    fontFamily: "Geist_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  footnoteBlock: {
    gap: 4,
  },
  footnoteLabel: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 12,
  },
  image: {
    borderRadius: 8,
    height: 180,
    width: 280,
  },
  codeCard: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    paddingBottom: 12,
  },
  codeScroll: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  codeLines: {
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  run: {
    alignSelf: "flex-start",
    marginLeft: 12,
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
    marginHorizontal: 12,
  },
});

import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { WebView } from "react-native-webview";
import {
  parseVisualization,
  type ArrayVisualization,
  type GraphVisualization,
  type LinkedListVisualization,
  type VisualizationState,
} from "../../../api/src/content/visualizations";
import { useTheme } from "@/theme/theme";

const stateColor = (
  state: VisualizationState | undefined,
  foreground: string,
  muted: string,
  success: string,
): string => {
  if (state === "muted") {
    return muted;
  }
  if (state === "visited") {
    return success;
  }
  return foreground;
};

function Frame({
  kicker,
  title,
  caption,
  children,
}: {
  readonly kicker: string;
  readonly title: string | undefined;
  readonly caption: string | undefined;
  readonly children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.frame, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <View style={[styles.heading, { borderBottomColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.mutedForeground }]}>{kicker}</Text>
        {title === undefined ? null : (
          <Text style={[styles.frameTitle, { color: colors.foreground }]}>{title}</Text>
        )}
      </View>
      {children}
      {caption === undefined ? null : (
        <Text style={[styles.caption, { color: colors.mutedForeground, borderTopColor: colors.border }]}>
          {caption}
        </Text>
      )}
    </View>
  );
}

function ArrayDiagram({ visualization }: { readonly visualization: ArrayVisualization }) {
  const { colors } = useTheme();
  const [step, setStep] = useState(visualization.activeStep ?? 0);
  const steps = visualization.items.reduce((highest, item) => {
    return Math.max(highest, item.step ?? 0);
  }, 0);
  return (
    <Frame kicker="Array" title={visualization.title} caption={visualization.caption}>
      <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
        {visualization.items.map((item, index) => {
          const hidden = item.step !== undefined && item.step > step;
          const active = item.state === "active" || item.step === step;
          return (
            <Animated.View
              entering={FadeIn.duration(280).delay(index * 40)}
              key={`${item.value ?? "empty"}-${index}`}
              style={[
                styles.cell,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.secondary : colors.background,
                  opacity: hidden ? 0.35 : 1,
                },
              ]}
            >
              <Text style={[styles.cellIndex, { color: colors.mutedForeground }]}>{index}</Text>
              <Text
                style={[
                  styles.cellValue,
                  { color: stateColor(item.state, colors.foreground, colors.mutedForeground, colors.success) },
                ]}
              >
                {item.value === null ? "null" : String(item.value)}
              </Text>
              {item.label === undefined ? null : (
                <Text style={[styles.cellLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              )}
            </Animated.View>
          );
        })}
      </ScrollView>
      {steps > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setStep((current) => (current >= steps ? 0 : current + 1))}
          style={styles.play}
        >
          <Text style={[styles.playLabel, { color: colors.foreground }]}>
            {step >= steps ? "Replay" : `Step ${step + 1}`}
          </Text>
        </Pressable>
      ) : null}
    </Frame>
  );
}

function LinkedListDiagram({ visualization }: { readonly visualization: LinkedListVisualization }) {
  const { colors } = useTheme();
  return (
    <Frame kicker="Linked list" title={visualization.title} caption={visualization.caption}>
      <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>
        {visualization.nodes.map((node, index) => (
          <Animated.View entering={FadeIn.duration(280).delay(index * 50)} key={node.id} style={styles.listItem}>
            <View
              style={[
                styles.cell,
                {
                  borderColor: node.state === "active" ? colors.primary : colors.border,
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Text style={[styles.cellValue, { color: colors.foreground }]}>
                {node.value === null ? "null" : String(node.value)}
              </Text>
            </View>
            {index < visualization.nodes.length - 1 ? (
              <Text style={[styles.arrow, { color: colors.mutedForeground }]}>→</Text>
            ) : null}
          </Animated.View>
        ))}
      </ScrollView>
    </Frame>
  );
}

function GraphDiagram({ visualization }: { readonly visualization: GraphVisualization }) {
  const { colors } = useTheme();
  const width = 320;
  const height = 220;
  const maxX = visualization.nodes.reduce((highest, node) => Math.max(highest, node.x), 1);
  const maxY = visualization.nodes.reduce((highest, node) => Math.max(highest, node.y), 1);
  return (
    <Frame kicker="Graph" title={visualization.title} caption={visualization.caption}>
      <View style={[styles.graph, { width, height }]}>
        {visualization.edges.map((edge) => {
          const from = visualization.nodes.find((node) => node.id === edge.from);
          const to = visualization.nodes.find((node) => node.id === edge.to);
          if (from === undefined || to === undefined) {
            return null;
          }
          const x1 = (from.x / maxX) * (width - 48) + 24;
          const y1 = (from.y / maxY) * (height - 48) + 24;
          const x2 = (to.x / maxX) * (width - 48) + 24;
          const y2 = (to.y / maxY) * (height - 48) + 24;
          const length = Math.hypot(x2 - x1, y2 - y1);
          const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          return (
            <View
              key={`${edge.from}-${edge.to}`}
              style={[
                styles.edge,
                {
                  width: length,
                  backgroundColor: edge.state === "active" ? colors.primary : colors.border,
                  left: (x1 + x2) / 2 - length / 2,
                  top: (y1 + y2) / 2,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}
        {visualization.nodes.map((node, index) => (
          <Animated.View
            entering={FadeIn.duration(280).delay(index * 40)}
            key={node.id}
            style={[
              styles.node,
              {
                left: (node.x / maxX) * (width - 48) + 8,
                top: (node.y / maxY) * (height - 48) + 8,
                borderColor: node.state === "active" ? colors.primary : colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <Text style={[styles.nodeLabel, { color: colors.foreground }]}>{node.label}</Text>
          </Animated.View>
        ))}
      </View>
    </Frame>
  );
}

export function VisualizationBlock({ source }: { readonly source: string }) {
  const parsed = parseVisualization(source);
  if (!parsed.ok) {
    return null;
  }
  if (parsed.visualization.type === "array") {
    return <ArrayDiagram visualization={parsed.visualization} />;
  }
  if (parsed.visualization.type === "linked-list") {
    return <LinkedListDiagram visualization={parsed.visualization} />;
  }
  return <GraphDiagram visualization={parsed.visualization} />;
}

export function MermaidBlock({ chart }: { readonly chart: string }) {
  const { colors, scheme } = useTheme();
  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  html, body { margin: 0; background: ${colors.card}; color: ${colors.foreground}; }
  #root { padding: 12px; }
  svg { max-width: 100%; height: auto; }
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
  import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
  mermaid.initialize({ startOnLoad: false, theme: ${JSON.stringify(scheme === "dark" ? "dark" : "neutral")}, securityLevel: "strict" });
  const source = ${JSON.stringify(chart)};
  try {
    const drawn = await mermaid.render("diagram", source);
    document.getElementById("root").innerHTML = drawn.svg;
  } catch (error) {
    document.getElementById("root").textContent = "The diagram could not be drawn.";
  }
</script>
</body>
</html>`;
  return (
    <View style={[styles.mermaid, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <WebView
        originWhitelist={["*"]}
        scrollEnabled={false}
        source={{ html }}
        style={{ backgroundColor: "transparent", height: 240 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 8,
  },
  heading: {
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  kicker: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  frameTitle: {
    fontFamily: "Geist_500Medium",
    fontSize: 16,
  },
  caption: {
    borderTopWidth: 1,
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    lineHeight: 18,
    padding: 12,
  },
  row: {
    alignItems: "center",
    gap: 0,
    padding: 16,
  },
  cell: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 72,
    minWidth: 72,
    padding: 8,
  },
  cellIndex: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 11,
  },
  cellValue: {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize: 16,
  },
  cellLabel: {
    fontFamily: "Geist_400Regular",
    fontSize: 11,
  },
  listItem: {
    alignItems: "center",
    flexDirection: "row",
  },
  arrow: {
    fontSize: 18,
    marginHorizontal: 6,
  },
  play: {
    alignSelf: "flex-start",
    marginBottom: 12,
    marginLeft: 16,
  },
  playLabel: {
    fontFamily: "Geist_500Medium",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  graph: {
    margin: 12,
    position: "relative",
  },
  edge: {
    height: 2,
    position: "absolute",
  },
  node: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    width: 36,
  },
  nodeLabel: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 13,
  },
  mermaid: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 8,
  },
});

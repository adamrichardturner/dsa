export interface DiagramReady {
  readonly ok: true;
  readonly width: number;
  readonly height: number;
}

export interface DiagramFailed {
  readonly ok: false;
}

export type DiagramMessage = DiagramReady | DiagramFailed;

export interface DiagramDocumentInput {
  readonly chart: string;
  readonly theme: "dark" | "neutral";
  readonly background: string;
  readonly foreground: string;
}

const mermaidSource = "https://cdn.jsdelivr.net/npm/mermaid@12.2.0/dist/mermaid.min.js";

const cssColor = (value: string): string => {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }
  return "#ffffff";
};

const scriptString = (value: string): string => {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const readJson = (raw: string): unknown => {
  try {
    const value: unknown = JSON.parse(raw);
    return value;
  } catch {
    return undefined;
  }
};

const readPositive = (value: unknown): number | null => {
  if (typeof value !== "number") {
    return null;
  }
  if (!Number.isFinite(value)) {
    return null;
  }
  if (value <= 0 || value > 16000) {
    return null;
  }
  return Math.ceil(value);
};

export const readDiagramMessage = (raw: string): DiagramMessage | null => {
  const parsed = readJson(raw);
  if (!isRecord(parsed)) {
    return null;
  }
  if (parsed.ok === false) {
    return { ok: false };
  }
  if (parsed.ok !== true) {
    return null;
  }
  const width = readPositive(parsed.width);
  const height = readPositive(parsed.height);
  if (width === null || height === null) {
    return { ok: false };
  }
  return { ok: true, width, height };
};

/**
 * Builds a Mermaid document that keeps the diagram's intrinsic size and posts
 * that size back to React Native. The WebView can then match the drawing
 * instead of squeezing it into a fixed box.
 */
export const diagramDocument = ({
  chart,
  theme,
  background,
  foreground,
}: DiagramDocumentInput): string => {
  const colorScheme = theme === "dark" ? "dark" : "light";
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
<style>
  html, body {
    margin: 0;
    background: ${cssColor(background)};
    color: ${cssColor(foreground)};
    color-scheme: ${colorScheme};
  }
  body { overflow: hidden; }
  #root { display: inline-block; line-height: 0; }
  #root svg { display: block; max-width: none !important; overflow: visible; }
</style>
</head>
<body>
<div id="root"></div>
<script src="${mermaidSource}"></script>
<script>
  const source = ${scriptString(chart)};
  const theme = ${JSON.stringify(theme)};
  const background = ${JSON.stringify(background)};

  const post = (message) => {
    const bridge = window.ReactNativeWebView;
    if (!bridge) {
      return;
    }
    bridge.postMessage(JSON.stringify(message));
  };

  const viewBoxSize = (svg) => {
    const raw = svg.getAttribute("viewBox");
    if (raw === null) {
      return null;
    }
    const parts = raw.trim().split(/[\\s,]+/);
    if (parts.length !== 4) {
      return null;
    }
    const width = Number(parts[2]);
    const height = Number(parts[3]);
    if (!Number.isFinite(width) || width <= 0) {
      return null;
    }
    if (!Number.isFinite(height) || height <= 0) {
      return null;
    }
    return { width: width, height: height };
  };

  const applySize = (svg, size) => {
    svg.style.maxWidth = "none";
    svg.style.width = size.width + "px";
    svg.style.height = size.height + "px";
    svg.setAttribute("width", String(size.width));
    svg.setAttribute("height", String(size.height));
  };

  const measuredSize = (svg) => {
    const fromViewBox = viewBoxSize(svg);
    if (fromViewBox === null) {
      const box = svg.getBoundingClientRect();
      return {
        width: Math.ceil(box.width + 8),
        height: Math.ceil(box.height + 8),
      };
    }
    applySize(svg, fromViewBox);
    const box = svg.getBoundingClientRect();
    return {
      width: Math.ceil(Math.max(fromViewBox.width, box.width) + 8),
      height: Math.ceil(Math.max(fromViewBox.height, box.height) + 8),
    };
  };

  const draw = async () => {
    if (typeof mermaid === "undefined") {
      post({ ok: false });
      return;
    }
    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: theme,
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        htmlLabels: false,
        suppressErrorRendering: true,
        flowchart: { useMaxWidth: false },
        sequence: { useMaxWidth: false },
        state: { useMaxWidth: false },
        class: { useMaxWidth: false },
        er: { useMaxWidth: false },
        themeVariables: { background: background },
      });
      const drawn = await mermaid.render("diagram", source);
      const root = document.getElementById("root");
      if (root === null) {
        post({ ok: false });
        return;
      }
      root.innerHTML = drawn.svg;
      const svg = root.querySelector("svg");
      if (svg === null) {
        post({ ok: false });
        return;
      }
      const size = measuredSize(svg);
      if (size.width <= 8 || size.height <= 8) {
        post({ ok: false });
        return;
      }
      post({ ok: true, width: size.width, height: size.height });
    } catch {
      post({ ok: false });
    }
  };

  draw();
</script>
</body>
</html>`;
};

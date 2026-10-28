"use client";

import { useEffect, useId, useState } from "react";

type DiagramTheme = "dark" | "neutral";

let configuredTheme: DiagramTheme | null = null;

const diagramTheme = (): DiagramTheme => {
  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }
  return "neutral";
};

const loadMermaid = async (theme: DiagramTheme) => {
  const mermaidModule = await import("mermaid");
  const mermaid = mermaidModule.default;
  if (configuredTheme === theme) {
    return mermaid;
  }
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme,
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    htmlLabels: false,
    suppressErrorRendering: true,
  });
  configuredTheme = theme;
  return mermaid;
};

export function MermaidDiagram({ chart }: { readonly chart: string }) {
  const reactId = useId().replaceAll(":", "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let renderGeneration = 0;
    let drawnTheme: DiagramTheme | null = null;

    const draw = async () => {
      const theme = diagramTheme();
      if (theme === drawnTheme) {
        return;
      }
      const generation = renderGeneration + 1;
      renderGeneration = generation;
      drawnTheme = theme;
      try {
        const mermaid = await loadMermaid(theme);
        const renderId = `diagram-${reactId}-${generation}`;
        const result = await mermaid.render(renderId, chart);
        if (cancelled || generation !== renderGeneration) {
          return;
        }
        setFailed(false);
        setSvg(result.svg);
      } catch {
        if (generation !== renderGeneration) {
          return;
        }
        drawnTheme = null;
        if (cancelled) {
          return;
        }
        setSvg(null);
        setFailed(true);
      }
    };

    const observer = new MutationObserver(() => {
      void draw();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    void draw();

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [chart, reactId]);

  if (failed) {
    return (
      <div className="mermaid-frame">
        <p className="text-sm text-muted-foreground">
          Diagram failed to render.
        </p>
      </div>
    );
  }
  if (svg === null) {
    return <div className="mermaid-frame" aria-busy="true" />;
  }
  return (
    <div
      className="mermaid-frame"
      role="img"
      aria-label="Diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

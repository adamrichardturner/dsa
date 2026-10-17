"use client";

import { useEffect, useId, useState } from "react";

let configured = false;

const loadMermaid = async () => {
  const mermaidModule = await import("mermaid");
  const mermaid = mermaidModule.default;
  if (!configured) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "neutral",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      htmlLabels: false,
      suppressErrorRendering: true,
    });
    configured = true;
  }
  return mermaid;
};

export function MermaidDiagram({ chart }: { readonly chart: string }) {
  const reactId = useId().replaceAll(":", "");
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const renderId = `diagram-${reactId}-${Math.random().toString(36).slice(2)}`;

    const draw = async () => {
      const mermaid = await loadMermaid();
      const result = await mermaid.render(renderId, chart);
      if (cancelled) {
        return;
      }
      setFailed(false);
      setSvg(result.svg);
    };

    draw().catch(() => {
      if (cancelled) {
        return;
      }
      setSvg(null);
      setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (failed) {
    return (
      <div className="mermaid-frame">
        <p className="text-sm text-muted-foreground">Diagram failed to render.</p>
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

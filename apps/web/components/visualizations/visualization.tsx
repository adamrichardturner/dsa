"use client";

import { useId, type ReactNode } from "react";
import {
  parseVisualization,
  type ArrayVisualization,
  type GraphEdge,
  type GraphNode,
  type GraphVisualization,
  type LinkedListVisualization,
  type VisualizationState,
} from "@/components/visualizations/types";

const displayValue = (value: string | number | null): string => {
  if (value === null) {
    return "null";
  }
  return String(value);
};

const stateClassName = (state: VisualizationState | undefined): string => {
  return `visualization-state-${state ?? "default"}`;
};

const isActiveStep = (
  step: number | undefined,
  activeStep: number | undefined,
): boolean => {
  return step !== undefined && step === activeStep;
};

const isFutureStep = (
  step: number | undefined,
  activeStep: number | undefined,
): boolean => {
  return step !== undefined && activeStep !== undefined && step > activeStep;
};

function VisualizationFrame({
  title,
  caption,
  kind,
  children,
}: {
  readonly title: string | undefined;
  readonly caption: string | undefined;
  readonly kind: string;
  readonly children: ReactNode;
}) {
  const accessibleTitle = title ?? `${kind} visualization`;
  return (
    <figure className="visualization-frame" aria-label={accessibleTitle}>
      <div className="visualization-heading">
        <p className="visualization-kicker">{kind}</p>
        {title === undefined ? null : (
          <h3 className="visualization-title">{title}</h3>
        )}
      </div>
      {children}
      {caption === undefined ? null : (
        <figcaption className="visualization-caption">{caption}</figcaption>
      )}
    </figure>
  );
}

function ArrayDiagram({
  visualization,
}: {
  readonly visualization: ArrayVisualization;
}) {
  const windowLabel = visualization.window?.label ?? "Selected window";
  return (
    <VisualizationFrame
      title={visualization.title}
      caption={visualization.caption}
      kind="Array"
    >
      {visualization.window === undefined ? null : (
        <p className="visualization-window-label">
          {windowLabel}: indices {visualization.window.start}–
          {visualization.window.end}
        </p>
      )}
      <div className="array-visualization-scroll">
        <ol className="array-visualization" aria-label="Array values">
          {visualization.items.map((item, index) => {
            const pointers =
              visualization.pointers?.filter(
                (pointer) => pointer.index === index,
              ) ?? [];
            const inWindow =
              visualization.window !== undefined &&
              index >= visualization.window.start &&
              index <= visualization.window.end;
            return (
              <li
                key={index}
                className={`visualization-step array-cell ${stateClassName(item.state)}`}
                data-active-step={isActiveStep(
                  item.step,
                  visualization.activeStep,
                )}
                data-future-step={isFutureStep(
                  item.step,
                  visualization.activeStep,
                )}
                data-in-window={inWindow}
                aria-label={`Index ${index}, value ${displayValue(item.value)}${item.label === undefined ? "" : `, ${item.label}`}`}
              >
                {visualization.showIndices === false ? null : (
                  <span className="array-index" aria-hidden="true">
                    {index}
                  </span>
                )}
                <span className="array-value">{displayValue(item.value)}</span>
                {item.label === undefined ? null : (
                  <span className="array-label">{item.label}</span>
                )}
                {pointers.map((pointer, pointerIndex) => (
                  <span
                    key={`${pointer.label}-${pointerIndex}`}
                    className={`visualization-step array-pointer ${stateClassName(pointer.state)}`}
                    data-active-step={isActiveStep(
                      pointer.step,
                      visualization.activeStep,
                    )}
                    data-future-step={isFutureStep(
                      pointer.step,
                      visualization.activeStep,
                    )}
                  >
                    <span aria-hidden="true">↑</span> {pointer.label}
                  </span>
                ))}
              </li>
            );
          })}
        </ol>
      </div>
    </VisualizationFrame>
  );
}

function LinkedListDiagram({
  visualization,
}: {
  readonly visualization: LinkedListVisualization;
}) {
  return (
    <VisualizationFrame
      title={visualization.title}
      caption={visualization.caption}
      kind="Linked list"
    >
      <div className="linked-list-scroll">
        <ol
          className="linked-list-visualization"
          aria-label="Linked list nodes"
        >
          {visualization.nodes.map((node) => {
            const pointers =
              visualization.pointers?.filter(
                (pointer) => pointer.target === node.id,
              ) ?? [];
            return (
              <li
                key={node.id}
                className={`visualization-step linked-list-item ${stateClassName(node.state)}`}
                data-active-step={isActiveStep(
                  node.step,
                  visualization.activeStep,
                )}
                data-future-step={isFutureStep(
                  node.step,
                  visualization.activeStep,
                )}
              >
                <div className="linked-list-pointers">
                  {pointers.map((pointer, pointerIndex) => (
                    <span
                      key={`${pointer.label}-${pointerIndex}`}
                      className={`visualization-step linked-list-pointer ${stateClassName(pointer.state)}`}
                      data-active-step={isActiveStep(
                        pointer.step,
                        visualization.activeStep,
                      )}
                      data-future-step={isFutureStep(
                        pointer.step,
                        visualization.activeStep,
                      )}
                    >
                      {pointer.label} ↓
                    </span>
                  ))}
                </div>
                <div
                  className="linked-list-node"
                  aria-label={`Node ${node.id}, value ${displayValue(node.value)}, next ${node.next ?? "null"}`}
                >
                  <span className="linked-list-id">{node.id}</span>
                  <span className="linked-list-value">
                    {displayValue(node.value)}
                  </span>
                  <span className="linked-list-next">
                    next: {node.next ?? "∅"}
                  </span>
                </div>
                <span className="linked-list-arrow" aria-hidden="true">
                  {node.next === undefined || node.next === null
                    ? "∅"
                    : `→ ${node.next}`}
                </span>
              </li>
            );
          })}
        </ol>
        {visualization.pointers
          ?.filter((pointer) => pointer.target === null)
          .map((pointer, pointerIndex) => (
            <p
              key={`${pointer.label}-${pointerIndex}`}
              className={`visualization-step linked-list-null-pointer ${stateClassName(pointer.state)}`}
              data-active-step={isActiveStep(
                pointer.step,
                visualization.activeStep,
              )}
              data-future-step={isFutureStep(
                pointer.step,
                visualization.activeStep,
              )}
            >
              {pointer.label} → null
            </p>
          ))}
      </div>
    </VisualizationFrame>
  );
}

const graphX = (node: GraphNode): number => {
  return 50 + node.x * 9;
};

const graphY = (node: GraphNode): number => {
  return 50 + node.y * 5;
};

const findNode = (
  nodes: readonly GraphNode[],
  id: string,
): GraphNode | undefined => {
  return nodes.find((node) => node.id === id);
};

function GraphEdgeLine({
  edge,
  nodes,
  activeStep,
  markerId,
  directed,
}: {
  readonly edge: GraphEdge;
  readonly nodes: readonly GraphNode[];
  readonly activeStep: number | undefined;
  readonly markerId: string;
  readonly directed: boolean;
}) {
  const from = findNode(nodes, edge.from);
  const to = findNode(nodes, edge.to);
  if (from === undefined || to === undefined) {
    return null;
  }
  const x1 = graphX(from);
  const y1 = graphY(from);
  const x2 = graphX(to);
  const y2 = graphY(to);
  const className = `visualization-step graph-edge ${stateClassName(edge.state)}`;
  const active = isActiveStep(edge.step, activeStep);
  const future = isFutureStep(edge.step, activeStep);
  if (from.id === to.id) {
    return (
      <g
        className={className}
        data-active-step={active}
        data-future-step={future}
      >
        <path
          className="graph-edge-loop"
          d={`M ${x1 - 20} ${y1 - 30} C ${x1 - 75} ${y1 - 100}, ${x1 + 75} ${y1 - 100}, ${x1 + 20} ${y1 - 30}`}
          markerEnd={directed ? `url(#${markerId})` : undefined}
        />
        {edge.label === undefined ? null : (
          <text x={x1} y={y1 - 92}>
            {edge.label}
          </text>
        )}
      </g>
    );
  }
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const xDirection = (x2 - x1) / distance;
  const yDirection = (y2 - y1) / distance;
  const startX = x1 + xDirection * 38;
  const startY = y1 + yDirection * 38;
  const endX = x2 - xDirection * 45;
  const endY = y2 - yDirection * 45;
  return (
    <g
      className={className}
      data-active-step={active}
      data-future-step={future}
    >
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        markerEnd={directed ? `url(#${markerId})` : undefined}
      />
      {edge.label === undefined ? null : (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10}>
          {edge.label}
        </text>
      )}
    </g>
  );
}

function GraphDiagram({
  visualization,
}: {
  readonly visualization: GraphVisualization;
}) {
  const markerId = `visualization-arrow-${useId().replaceAll(":", "")}`;
  const directed = visualization.directed ?? true;
  return (
    <VisualizationFrame
      title={visualization.title}
      caption={visualization.caption}
      kind={directed ? "Directed graph" : "Graph"}
    >
      <div className="graph-visualization-scroll">
        <svg
          className="graph-visualization"
          viewBox="0 0 1000 600"
          role="img"
          aria-label={visualization.title ?? "Node and edge graph"}
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              markerUnits="userSpaceOnUse"
              orient="auto-start-reverse"
            >
              <path className="graph-arrowhead" d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <g aria-hidden="true">
            {visualization.edges.map((edge, index) => (
              <GraphEdgeLine
                key={`${edge.from}-${edge.to}-${index}`}
                edge={edge}
                nodes={visualization.nodes}
                activeStep={visualization.activeStep}
                markerId={markerId}
                directed={directed}
              />
            ))}
            {visualization.nodes.map((node) => (
              <g
                key={node.id}
                className={`visualization-step graph-node ${stateClassName(node.state)}`}
                data-active-step={isActiveStep(
                  node.step,
                  visualization.activeStep,
                )}
                data-future-step={isFutureStep(
                  node.step,
                  visualization.activeStep,
                )}
                transform={`translate(${graphX(node)} ${graphY(node)})`}
              >
                <circle r="36" />
                <text textAnchor="middle" dominantBaseline="central">
                  {node.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
        <div className="visualization-sr-only">
          <p>Nodes:</p>
          <ul>
            {visualization.nodes.map((node) => (
              <li key={node.id}>
                {node.id}: {node.label}
              </li>
            ))}
          </ul>
          <p>Edges:</p>
          <ul>
            {visualization.edges.map((edge, index) => (
              <li key={`${edge.from}-${edge.to}-${index}`}>
                {edge.from} {directed ? "to" : "and"} {edge.to}
                {edge.label === undefined ? "" : `: ${edge.label}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VisualizationFrame>
  );
}

export function VisualizationFence({ source }: { readonly source: string }) {
  const result = parseVisualization(source);
  if (!result.ok) {
    return (
      <aside className="visualization-error" role="note">
        <p>
          <strong>Visualization unavailable.</strong> {result.message}
        </p>
        <pre>
          <code className="language-json">{source}</code>
        </pre>
      </aside>
    );
  }
  if (result.visualization.type === "array") {
    return <ArrayDiagram visualization={result.visualization} />;
  }
  if (result.visualization.type === "linked-list") {
    return <LinkedListDiagram visualization={result.visualization} />;
  }
  return <GraphDiagram visualization={result.visualization} />;
}

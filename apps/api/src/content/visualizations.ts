export type VisualizationState = "active" | "visited" | "muted";

interface VisualizationBase {
  readonly title?: string;
  readonly caption?: string;
  readonly activeStep?: number;
}

export interface ArrayItem {
  readonly value: string | number | null;
  readonly label?: string;
  readonly state?: VisualizationState;
  readonly step?: number;
}

export interface ArrayPointer {
  readonly label: string;
  readonly index: number;
  readonly state?: VisualizationState;
  readonly step?: number;
}

export interface ArrayWindow {
  readonly start: number;
  readonly end: number;
  readonly label?: string;
}

export interface ArrayVisualization extends VisualizationBase {
  readonly type: "array";
  readonly items: readonly ArrayItem[];
  readonly pointers?: readonly ArrayPointer[];
  readonly window?: ArrayWindow;
  readonly showIndices?: boolean;
}

export interface LinkedListNode {
  readonly id: string;
  readonly value: string | number | null;
  readonly next?: string | null;
  readonly state?: VisualizationState;
  readonly step?: number;
}

export interface LinkedListPointer {
  readonly label: string;
  readonly target: string | null;
  readonly state?: VisualizationState;
  readonly step?: number;
}

export interface LinkedListVisualization extends VisualizationBase {
  readonly type: "linked-list";
  readonly nodes: readonly LinkedListNode[];
  readonly pointers?: readonly LinkedListPointer[];
}

export interface GraphNode {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly state?: VisualizationState;
  readonly step?: number;
}

export interface GraphEdge {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
  readonly state?: VisualizationState;
  readonly step?: number;
}

export interface GraphVisualization extends VisualizationBase {
  readonly type: "graph";
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly directed?: boolean;
}

export type Visualization =
  ArrayVisualization | LinkedListVisualization | GraphVisualization;

export type VisualizationParseResult =
  | {
      readonly ok: true;
      readonly visualization: Visualization;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

type JsonObject = {
  readonly [key: string]: unknown;
};

const MAX_SOURCE_LENGTH = 50_000;
const MAX_TEXT_LENGTH = 160;
const MAX_ITEMS = 64;
const MAX_GRAPH_NODES = 50;
const MAX_GRAPH_EDGES = 100;

const isObject = (value: unknown): value is JsonObject => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const hasOnlyKeys = (
  value: JsonObject,
  allowedKeys: readonly string[],
): boolean => {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) {
      return false;
    }
  }
  return true;
};

const isText = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= MAX_TEXT_LENGTH
  );
};

const isOptionalText = (value: unknown): value is string | undefined => {
  return value === undefined || isText(value);
};

const isFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

const isNonNegativeInteger = (value: unknown): value is number => {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
};

const isOptionalStep = (value: unknown): value is number | undefined => {
  return value === undefined || isNonNegativeInteger(value);
};

const isState = (value: unknown): value is VisualizationState => {
  return value === "active" || value === "visited" || value === "muted";
};

const isOptionalState = (
  value: unknown,
): value is VisualizationState | undefined => {
  return value === undefined || isState(value);
};

const isDisplayValue = (value: unknown): value is string | number | null => {
  return (
    value === null ||
    isFiniteNumber(value) ||
    (typeof value === "string" && value.length <= MAX_TEXT_LENGTH)
  );
};

const isVisualizationBase = (value: JsonObject): boolean => {
  if (!isOptionalText(value.title)) {
    return false;
  }
  if (!isOptionalText(value.caption)) {
    return false;
  }
  return isOptionalStep(value.activeStep);
};

const isArrayItem = (value: unknown): value is ArrayItem => {
  if (!isObject(value)) {
    return false;
  }
  if (!hasOnlyKeys(value, ["value", "label", "state", "step"])) {
    return false;
  }
  if (!("value" in value) || !isDisplayValue(value.value)) {
    return false;
  }
  if (!isOptionalText(value.label)) {
    return false;
  }
  if (!isOptionalState(value.state)) {
    return false;
  }
  return isOptionalStep(value.step);
};

const isArrayPointer = (value: unknown): value is ArrayPointer => {
  if (!isObject(value)) {
    return false;
  }
  if (!hasOnlyKeys(value, ["label", "index", "state", "step"])) {
    return false;
  }
  if (!isText(value.label) || !isNonNegativeInteger(value.index)) {
    return false;
  }
  if (!isOptionalState(value.state)) {
    return false;
  }
  return isOptionalStep(value.step);
};

const isArrayWindow = (value: unknown): value is ArrayWindow => {
  if (!isObject(value)) {
    return false;
  }
  if (!hasOnlyKeys(value, ["start", "end", "label"])) {
    return false;
  }
  if (!isNonNegativeInteger(value.start) || !isNonNegativeInteger(value.end)) {
    return false;
  }
  if (value.start > value.end) {
    return false;
  }
  return isOptionalText(value.label);
};

const isArrayVisualization = (value: unknown): value is ArrayVisualization => {
  if (!isObject(value)) {
    return false;
  }
  if (
    !hasOnlyKeys(value, [
      "type",
      "title",
      "caption",
      "activeStep",
      "items",
      "pointers",
      "window",
      "showIndices",
    ])
  ) {
    return false;
  }
  if (!isVisualizationBase(value) || value.type !== "array") {
    return false;
  }
  if (
    !Array.isArray(value.items) ||
    value.items.length === 0 ||
    value.items.length > MAX_ITEMS ||
    !value.items.every(isArrayItem)
  ) {
    return false;
  }
  const itemCount = value.items.length;
  if (
    value.pointers !== undefined &&
    (!Array.isArray(value.pointers) ||
      value.pointers.length > MAX_ITEMS ||
      !value.pointers.every(isArrayPointer))
  ) {
    return false;
  }
  if (value.window !== undefined && !isArrayWindow(value.window)) {
    return false;
  }
  if (
    value.showIndices !== undefined &&
    typeof value.showIndices !== "boolean"
  ) {
    return false;
  }
  if (
    value.pointers !== undefined &&
    !value.pointers.every((pointer) => pointer.index < itemCount)
  ) {
    return false;
  }
  if (value.window !== undefined && value.window.end >= itemCount) {
    return false;
  }
  return true;
};

const isLinkedListNode = (value: unknown): value is LinkedListNode => {
  if (!isObject(value)) {
    return false;
  }
  if (!hasOnlyKeys(value, ["id", "value", "next", "state", "step"])) {
    return false;
  }
  if (!isText(value.id) || !("value" in value)) {
    return false;
  }
  if (!isDisplayValue(value.value)) {
    return false;
  }
  if (value.next !== undefined && value.next !== null && !isText(value.next)) {
    return false;
  }
  if (!isOptionalState(value.state)) {
    return false;
  }
  return isOptionalStep(value.step);
};

const isLinkedListPointer = (value: unknown): value is LinkedListPointer => {
  if (!isObject(value)) {
    return false;
  }
  if (!hasOnlyKeys(value, ["label", "target", "state", "step"])) {
    return false;
  }
  if (!isText(value.label)) {
    return false;
  }
  if (value.target !== null && !isText(value.target)) {
    return false;
  }
  if (!isOptionalState(value.state)) {
    return false;
  }
  return isOptionalStep(value.step);
};

const hasUniqueIds = (nodes: readonly LinkedListNode[]): boolean => {
  const ids: string[] = [];
  for (const node of nodes) {
    if (ids.includes(node.id)) {
      return false;
    }
    ids.push(node.id);
  }
  return true;
};

const hasValidLinkedListReferences = (
  nodes: readonly LinkedListNode[],
  pointers: readonly LinkedListPointer[] | undefined,
): boolean => {
  const ids = nodes.map((node) => node.id);
  for (const node of nodes) {
    if (
      node.next !== undefined &&
      node.next !== null &&
      !ids.includes(node.next)
    ) {
      return false;
    }
  }
  if (pointers === undefined) {
    return true;
  }
  for (const pointer of pointers) {
    if (pointer.target !== null && !ids.includes(pointer.target)) {
      return false;
    }
  }
  return true;
};

const isLinkedListVisualization = (
  value: unknown,
): value is LinkedListVisualization => {
  if (!isObject(value)) {
    return false;
  }
  if (
    !hasOnlyKeys(value, [
      "type",
      "title",
      "caption",
      "activeStep",
      "nodes",
      "pointers",
    ])
  ) {
    return false;
  }
  if (!isVisualizationBase(value) || value.type !== "linked-list") {
    return false;
  }
  if (
    !Array.isArray(value.nodes) ||
    value.nodes.length === 0 ||
    value.nodes.length > MAX_ITEMS ||
    !value.nodes.every(isLinkedListNode)
  ) {
    return false;
  }
  if (
    value.pointers !== undefined &&
    (!Array.isArray(value.pointers) ||
      value.pointers.length > MAX_ITEMS ||
      !value.pointers.every(isLinkedListPointer))
  ) {
    return false;
  }
  if (!hasUniqueIds(value.nodes)) {
    return false;
  }
  return hasValidLinkedListReferences(value.nodes, value.pointers);
};

const isGraphNode = (value: unknown): value is GraphNode => {
  if (!isObject(value)) {
    return false;
  }
  if (!hasOnlyKeys(value, ["id", "label", "x", "y", "state", "step"])) {
    return false;
  }
  if (!isText(value.id) || !isText(value.label)) {
    return false;
  }
  if (
    !isFiniteNumber(value.x) ||
    value.x < 0 ||
    value.x > 100 ||
    !isFiniteNumber(value.y) ||
    value.y < 0 ||
    value.y > 100
  ) {
    return false;
  }
  if (!isOptionalState(value.state)) {
    return false;
  }
  return isOptionalStep(value.step);
};

const isGraphEdge = (value: unknown): value is GraphEdge => {
  if (!isObject(value)) {
    return false;
  }
  if (!hasOnlyKeys(value, ["from", "to", "label", "state", "step"])) {
    return false;
  }
  if (!isText(value.from) || !isText(value.to)) {
    return false;
  }
  if (!isOptionalText(value.label)) {
    return false;
  }
  if (!isOptionalState(value.state)) {
    return false;
  }
  return isOptionalStep(value.step);
};

const hasUniqueGraphIds = (nodes: readonly GraphNode[]): boolean => {
  const ids: string[] = [];
  for (const node of nodes) {
    if (ids.includes(node.id)) {
      return false;
    }
    ids.push(node.id);
  }
  return true;
};

const hasValidGraphEdges = (
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
): boolean => {
  const ids = nodes.map((node) => node.id);
  return edges.every(
    (edge) => ids.includes(edge.from) && ids.includes(edge.to),
  );
};

const isGraphVisualization = (value: unknown): value is GraphVisualization => {
  if (!isObject(value)) {
    return false;
  }
  if (
    !hasOnlyKeys(value, [
      "type",
      "title",
      "caption",
      "activeStep",
      "nodes",
      "edges",
      "directed",
    ])
  ) {
    return false;
  }
  if (!isVisualizationBase(value) || value.type !== "graph") {
    return false;
  }
  if (
    !Array.isArray(value.nodes) ||
    value.nodes.length === 0 ||
    value.nodes.length > MAX_GRAPH_NODES ||
    !value.nodes.every(isGraphNode)
  ) {
    return false;
  }
  if (
    !Array.isArray(value.edges) ||
    value.edges.length > MAX_GRAPH_EDGES ||
    !value.edges.every(isGraphEdge)
  ) {
    return false;
  }
  if (value.directed !== undefined && typeof value.directed !== "boolean") {
    return false;
  }
  if (!hasUniqueGraphIds(value.nodes)) {
    return false;
  }
  return hasValidGraphEdges(value.nodes, value.edges);
};

const isVisualization = (value: unknown): value is Visualization => {
  if (!isObject(value)) {
    return false;
  }
  if (value.type === "array") {
    return isArrayVisualization(value);
  }
  if (value.type === "linked-list") {
    return isLinkedListVisualization(value);
  }
  if (value.type === "graph") {
    return isGraphVisualization(value);
  }
  return false;
};

const parseJson = (source: string): unknown => {
  return JSON.parse(source);
};

export const parseVisualization = (
  source: string,
): VisualizationParseResult => {
  if (source.length > MAX_SOURCE_LENGTH) {
    return {
      ok: false,
      message: "The visualization is too large to render safely.",
    };
  }

  let parsed: unknown;
  try {
    parsed = parseJson(source);
  } catch {
    return {
      ok: false,
      message: "The visualization fence does not contain valid JSON.",
    };
  }

  if (!isVisualization(parsed)) {
    return {
      ok: false,
      message:
        "The visualization JSON does not match the supported array, linked-list, or graph schema.",
    };
  }

  return { ok: true, visualization: parsed };
};

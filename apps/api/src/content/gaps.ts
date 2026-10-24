import ts from "typescript";
import { isRecord } from "../lib/guards.js";
import { referenceCode } from "./references.js";

export const walkthroughLockedMessage =
  "Try the exercise twice before opening the walkthrough.";

export interface GapPart {
  readonly kind: "text" | "gap";
  readonly text: string;
  readonly gapId: string | null;
}

export interface GapChip {
  readonly id: string;
  readonly text: string;
}

export interface GapReveal {
  readonly gapId: string;
  readonly text: string;
}

/**
 * A fill-in exercise built from the reference solution.
 * `answers` stays on the server. The client receives `parts` and `chips` only.
 */
export interface GapPuzzle {
  readonly parts: readonly GapPart[];
  readonly chips: readonly GapChip[];
  readonly answers: Readonly<Record<string, string>>;
  readonly reveals: readonly GapReveal[];
  readonly source: string;
}

interface Candidate {
  readonly start: number;
  readonly end: number;
  readonly text: string;
  readonly line: number;
  readonly score: number;
}

const minLength = 4;
const maxLength = 72;

const replacementRules: readonly (readonly [string, string])[] = [
  ["<=", "<"],
  [">=", ">"],
  ["<=", ">="],
  [">=", "<="],
  ["===", "!=="],
  ["!==", "==="],
  ["&&", "||"],
  ["||", "&&"],
  ["+= 1", "= 1"],
  ["+= 1", "+= 2"],
  ["-= 1", "= 1"],
  ["+=", "-="],
  ["-=", "+="],
  ["length - 1", "length"],
  ["length - 1", "length + 1"],
  ["length + 1", "length - 1"],
  [".push(", ".unshift("],
  [".pop()", ".shift()"],
  [".shift()", ".pop()"],
  [".slice(", ".splice("],
  [".get(", ".has("],
  ["Math.floor", "Math.ceil"],
  ["Math.ceil", "Math.floor"],
  ["Math.min", "Math.max"],
  ["Math.max", "Math.min"],
  ["Math.round", "Math.floor"],
  [" < ", " > "],
  [" > ", " < "],
  [" < ", " <= "],
  [" > ", " >= "],
  [" + ", " - "],
  [" - ", " + "],
  [" * ", " + "],
  [" % ", " / "],
  [" / ", " % "],
  ["??", "||"],
  ["true", "false"],
  ["false", "true"],
];

const lineAt = (source: string, index: number): number => {
  let line = 1;
  const end = Math.min(index, source.length);
  for (let cursor = 0; cursor < end; cursor += 1) {
    if (source[cursor] === "\n") {
      line += 1;
    }
  }
  return line;
};

const isConsoleLog = (expression: ts.Expression): boolean => {
  if (!ts.isCallExpression(expression)) {
    return false;
  }
  const callee = expression.expression;
  if (!ts.isPropertyAccessExpression(callee)) {
    return false;
  }
  if (!ts.isIdentifier(callee.expression)) {
    return false;
  }
  return callee.expression.text === "console" && callee.name.text === "log";
};

const visit = (node: ts.Node, sourceFile: ts.SourceFile, accept: (node: ts.Node) => void): void => {
  accept(node);
  const children = node.getChildren(sourceFile);
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    if (child === undefined) {
      continue;
    }
    visit(child, sourceFile, accept);
  }
};

const stripConsoleLogs = (source: string): string => {
  const sourceFile = ts.createSourceFile(
    "solution.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const ranges: { readonly start: number; readonly end: number }[] = [];
  visit(sourceFile, sourceFile, (node) => {
    if (!ts.isExpressionStatement(node)) {
      return;
    }
    if (!isConsoleLog(node.expression)) {
      return;
    }
    ranges.push({ start: node.getStart(sourceFile), end: node.getEnd() });
  });

  let next = source;
  for (let index = ranges.length - 1; index >= 0; index -= 1) {
    const range = ranges[index];
    if (range === undefined) {
      continue;
    }
    let end = range.end;
    if (next[end] === "\r") {
      end += 1;
    }
    if (next[end] === "\n") {
      end += 1;
    }
    next = next.slice(0, range.start) + next.slice(end);
  }
  return `${next.trimEnd()}\n`;
};

const functionBody = (node: ts.Node): ts.Node | undefined => {
  if (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  ) {
    return node.body;
  }
  return undefined;
};

const inFunctionBody = (node: ts.Node): boolean => {
  let current: ts.Node | undefined = node.parent;
  while (current !== undefined) {
    const body = functionBody(current);
    if (body !== undefined) {
      return node.getStart() >= body.getStart() && node.getEnd() <= body.getEnd();
    }
    current = current.parent;
  }
  return false;
};

const comparisonKind = (kind: ts.SyntaxKind): boolean => {
  switch (kind) {
    case ts.SyntaxKind.LessThanToken:
    case ts.SyntaxKind.LessThanEqualsToken:
    case ts.SyntaxKind.GreaterThanToken:
    case ts.SyntaxKind.GreaterThanEqualsToken:
    case ts.SyntaxKind.EqualsEqualsEqualsToken:
    case ts.SyntaxKind.ExclamationEqualsEqualsToken:
    case ts.SyntaxKind.AmpersandAmpersandToken:
    case ts.SyntaxKind.BarBarToken: {
      return true;
    }
    default: {
      return false;
    }
  }
};

const arithmeticKind = (kind: ts.SyntaxKind): boolean => {
  switch (kind) {
    case ts.SyntaxKind.PlusToken:
    case ts.SyntaxKind.MinusToken:
    case ts.SyntaxKind.AsteriskToken:
    case ts.SyntaxKind.SlashToken:
    case ts.SyntaxKind.PercentToken:
    case ts.SyntaxKind.PlusEqualsToken:
    case ts.SyntaxKind.MinusEqualsToken:
    case ts.SyntaxKind.AsteriskEqualsToken: {
      return true;
    }
    default: {
      return false;
    }
  }
};

const scoreNode = (node: ts.Node, text: string): number => {
  if (text.includes("undefined") || mutationsOf(text).length === 0) {
    return 0;
  }
  let score = 0;
  if (ts.isBinaryExpression(node)) {
    const kind = node.operatorToken.kind;
    if (comparisonKind(kind)) {
      score = 9;
    } else if (arithmeticKind(kind)) {
      score = 7;
    } else {
      score = 5;
    }
  } else if (ts.isCallExpression(node)) {
    if (isConsoleLog(node)) {
      return 0;
    }
    score = 8;
  } else if (ts.isNewExpression(node)) {
    score = 7;
  } else if (ts.isElementAccessExpression(node)) {
    score = 6;
  } else if (ts.isConditionalExpression(node)) {
    score = 6;
  } else if (ts.isPrefixUnaryExpression(node)) {
    score = 4;
  }
  if (score === 0) {
    return 0;
  }
  if (text.length >= 8 && text.length <= 64) {
    return score + 2;
  }
  return score;
};

const collectCandidates = (source: string): readonly Candidate[] => {
  const sourceFile = ts.createSourceFile(
    "solution.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const candidates: Candidate[] = [];
  visit(sourceFile, sourceFile, (node) => {
    if (!inFunctionBody(node)) {
      return;
    }
    const start = node.getStart(sourceFile);
    const end = node.getEnd();
    const text = source.slice(start, end);
    if (text.length < minLength || text.length > maxLength) {
      return;
    }
    if (text.includes("\n") || text.includes("{") || text.includes("}")) {
      return;
    }
    const score = scoreNode(node, text);
    if (score === 0) {
      return;
    }
    candidates.push({
      start,
      end,
      text,
      line: lineAt(source, start),
      score,
    });
  });
  return candidates;
};

const targetCount = (candidateCount: number): number => {
  if (candidateCount <= 1) {
    return candidateCount;
  }
  if (candidateCount <= 6) {
    return 2;
  }
  if (candidateCount <= 12) {
    return 3;
  }
  return 4;
};

const overlaps = (left: Candidate, right: Candidate): boolean => {
  return left.start < right.end && right.start < left.end;
};

const selectGaps = (candidates: readonly Candidate[]): readonly Candidate[] => {
  const ranked = [...candidates].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    if (right.text.length !== left.text.length) {
      return right.text.length - left.text.length;
    }
    return left.start - right.start;
  });
  const target = targetCount(ranked.length);
  const strong = ranked.some((candidate) => candidate.score >= 2);
  const selected: Candidate[] = [];

  const take = (allowSameLine: boolean): void => {
    for (const candidate of ranked) {
      if (selected.length >= target) {
        return;
      }
      if (strong && candidate.score < 2) {
        continue;
      }
      const blocked = selected.some((item) => overlaps(candidate, item));
      if (blocked) {
        continue;
      }
      const sameLine = selected.some((item) => item.line === candidate.line);
      if (!allowSameLine && sameLine) {
        continue;
      }
      selected.push(candidate);
    }
  };

  take(false);
  take(true);
  return selected.sort((left, right) => left.start - right.start);
};

const applyRule = (text: string, from: string, to: string): string | null => {
  const index = text.indexOf(from);
  if (index < 0) {
    return null;
  }
  return text.slice(0, index) + to + text.slice(index + from.length);
};

const swapArguments = (text: string): string | null => {
  const open = text.indexOf("(");
  const close = text.lastIndexOf(")");
  if (open < 0 || close !== text.length - 1 || close <= open) {
    return null;
  }
  const inside = text.slice(open + 1, close);
  const comma = inside.indexOf(",");
  if (comma < 0 || inside.indexOf(",", comma + 1) >= 0) {
    return null;
  }
  const left = inside.slice(0, comma).trim();
  const right = inside.slice(comma + 1).trim();
  if (left.length === 0 || right.length === 0 || left === right) {
    return null;
  }
  return `${text.slice(0, open + 1)}${right}, ${left})`;
};

const pushUnique = (results: string[], text: string, next: string | null): void => {
  if (next === null || next === text || next.includes("\n") || results.includes(next)) {
    return;
  }
  results.push(next);
};

const mutationsOf = (text: string): readonly string[] => {
  const results: string[] = [];
  for (const rule of replacementRules) {
    const from = rule[0];
    const to = rule[1];
    pushUnique(results, text, applyRule(text, from, to));
  }
  pushUnique(results, text, swapArguments(text));
  return results;
};

const expandedMutations = (text: string): readonly string[] => {
  const results = [...mutationsOf(text)];
  for (const item of results) {
    const deeper = mutationsOf(item);
    for (const next of deeper) {
      pushUnique(results, text, next);
    }
  }
  return results;
};

const distractorsPerGap = (gapCount: number): number => {
  if (gapCount <= 1) {
    return 3;
  }
  if (gapCount === 2) {
    return 2;
  }
  return 1;
};

const usableDistractor = (
  text: string,
  answers: readonly string[],
  chosen: readonly string[],
  visible: string,
): boolean => {
  if (text.length < minLength || text.length > maxLength) {
    return false;
  }
  if (answers.includes(text) || chosen.includes(text)) {
    return false;
  }
  return !visible.includes(text);
};

const hashText = (value: string): string => {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash, 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
};

const seedFrom = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const shuffle = <T>(items: readonly T[], seedKey: string): T[] => {
  const next = [...items];
  let state = seedFrom(seedKey);
  const random = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = next[index];
    const other = next[swap];
    if (current === undefined || other === undefined) {
      continue;
    }
    next[index] = other;
    next[swap] = current;
  }
  return next;
};

const buildPuzzle = (problemId: string, original: string): GapPuzzle | null => {
  const source = stripConsoleLogs(original);
  const candidates = collectCandidates(source);
  const selected = selectGaps(candidates);
  if (selected.length === 0) {
    return null;
  }

  const answers: Record<string, string> = {};
  const reveals: GapReveal[] = [];
  const answerTexts: string[] = [];
  for (let index = 0; index < selected.length; index += 1) {
    const gap = selected[index];
    if (gap === undefined) {
      continue;
    }
    const gapId = `g${index}`;
    answers[gapId] = gap.text;
    reveals.push({ gapId, text: gap.text });
    answerTexts.push(gap.text);
  }

  let visible = source;
  for (let index = selected.length - 1; index >= 0; index -= 1) {
    const gap = selected[index];
    if (gap === undefined) {
      continue;
    }
    const blank = " ".repeat(gap.end - gap.start);
    visible = visible.slice(0, gap.start) + blank + visible.slice(gap.end);
  }

  const wanted = distractorsPerGap(selected.length);
  const distractors: string[] = [];
  for (const gap of selected) {
    let added = 0;
    const mutations = expandedMutations(gap.text);
    for (const mutation of mutations) {
      if (added >= wanted) {
        break;
      }
      if (!usableDistractor(mutation, answerTexts, distractors, visible)) {
        continue;
      }
      distractors.push(mutation);
      added += 1;
    }
  }

  const seenIds: Record<string, number> = {};
  const chipFor = (text: string): GapChip => {
    const base = `c${hashText(text)}`;
    const count = seenIds[base] ?? 0;
    seenIds[base] = count + 1;
    const id = count === 0 ? base : `${base}${count}`;
    return { id, text };
  };

  const chips = shuffle(
    [...answerTexts, ...distractors].map((text) => chipFor(text)),
    problemId,
  );

  const parts: GapPart[] = [];
  let cursor = 0;
  for (let index = 0; index < selected.length; index += 1) {
    const gap = selected[index];
    if (gap === undefined) {
      continue;
    }
    if (gap.start > cursor) {
      parts.push({
        kind: "text",
        text: source.slice(cursor, gap.start),
        gapId: null,
      });
    }
    parts.push({ kind: "gap", text: "", gapId: `g${index}` });
    cursor = gap.end;
  }
  if (cursor < source.length) {
    parts.push({ kind: "text", text: source.slice(cursor), gapId: null });
  }

  return { parts, chips, answers, reveals, source };
};

const puzzles: Record<string, GapPuzzle> = {};

for (const problemId of Object.keys(referenceCode)) {
  const code = referenceCode[problemId];
  if (code === undefined) {
    continue;
  }
  const puzzle = buildPuzzle(problemId, code);
  if (puzzle === null) {
    continue;
  }
  puzzles[problemId] = puzzle;
}

export const puzzleForProblem = (problemId: string): GapPuzzle | null => {
  return puzzles[problemId] ?? null;
};

export const chipText = (puzzle: GapPuzzle, chipId: string): string | null => {
  for (const chip of puzzle.chips) {
    if (chip.id === chipId) {
      return chip.text;
    }
  }
  return null;
};

export const assembleGap = (
  puzzle: GapPuzzle,
  fills: Readonly<Record<string, string>>,
): string => {
  let code = "";
  for (const part of puzzle.parts) {
    if (part.kind === "text") {
      code += part.text;
      continue;
    }
    const gapId = part.gapId ?? "";
    const chipId = fills[gapId];
    const text = chipId === undefined ? null : chipText(puzzle, chipId);
    code += text ?? "/* missing */";
  }
  return code;
};

export interface GapGrade {
  readonly gapId: string;
  readonly correct: boolean;
}

export const readFills = (value: string): Record<string, string> | null => {
  if (value.length > 8000) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) {
    return null;
  }
  const keys = Object.keys(parsed);
  if (keys.length > 8) {
    return null;
  }
  const fills: Record<string, string> = {};
  for (const key of keys) {
    if (!/^g\d$/.test(key)) {
      return null;
    }
    const chip = parsed[key];
    if (typeof chip !== "string" || chip.length === 0 || chip.length > 64) {
      return null;
    }
    fills[key] = chip;
  }
  return fills;
};

export const gradeGap = (
  puzzle: GapPuzzle,
  fills: Readonly<Record<string, string>>,
): readonly GapGrade[] => {
  const grades: GapGrade[] = [];
  for (const reveal of puzzle.reveals) {
    const chipId = fills[reveal.gapId];
    const text = chipId === undefined ? null : chipText(puzzle, chipId);
    grades.push({
      gapId: reveal.gapId,
      correct: text === puzzle.answers[reveal.gapId],
    });
  }
  return grades;
};

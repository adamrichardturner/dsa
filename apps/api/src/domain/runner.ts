import vm from "node:vm";
import { transform } from "sucrase";
import type { CompareMode } from "../content/types.js";
import { isRecord } from "../lib/guards.js";

export interface RunTest {
  readonly name: string;
  readonly args: readonly unknown[];
  readonly expected: unknown;
  readonly compare: CompareMode;
}

export interface TestResult {
  readonly name: string;
  readonly passed: boolean;
  readonly input: string;
  readonly expected: string;
  readonly received: string;
  readonly error: string | null;
}

export interface RunOutput {
  readonly passed: boolean;
  readonly testsPassed: number;
  readonly testsTotal: number;
  readonly feedback: string;
  readonly results: readonly TestResult[];
}

interface RunnerContext {
  exports: Record<string, unknown>;
  module: { exports: Record<string, unknown> };
  console: { log: (...args: readonly unknown[]) => void };
  __fn?: (...args: readonly unknown[]) => unknown;
  __args?: readonly unknown[];
  __result?: unknown;
}

const blockedPatterns: readonly { readonly pattern: RegExp; readonly reason: string }[] = [
  { pattern: /\brequire\s*\(/, reason: "require is not available in the runner." },
  { pattern: /\bimport\s/, reason: "Imports are not available in the runner." },
  { pattern: /\bprocess\b/, reason: "process is not available in the runner." },
  { pattern: /\bglobalThis\b/, reason: "globalThis is not available in the runner." },
  { pattern: /\beval\s*\(/, reason: "eval is not available in the runner." },
  { pattern: /\bFunction\s*\(/, reason: "The Function constructor is not available in the runner." },
];

const isFunction = (value: unknown): value is (...args: readonly unknown[]) => unknown => {
  return typeof value === "function";
};

const preview = (value: unknown): string => {
  try {
    const text = JSON.stringify(value) ?? "undefined";
    if (text.length <= 500) {
      return text;
    }
    return `${text.slice(0, 500)}…`;
  } catch {
    return "unserialisable value";
  }
};

const normalize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  const keys = Object.keys(value).sort();
  const sorted: Record<string, unknown> = {};

  for (const key of keys) {
    sorted[key] = normalize(value[key]);
  }

  return sorted;
};

const canonical = (value: unknown, compare: CompareMode): string => {
  if (compare === "set" && Array.isArray(value)) {
    const items = value.map((item) => canonical(item, "set")).sort();
    return JSON.stringify(items);
  }

  return JSON.stringify(normalize(value)) ?? "undefined";
};

export interface PreviewCase {
  readonly args: readonly unknown[];
}

export type PreviewLineKind = "log" | "prompt" | "result" | "error";

export interface PreviewLine {
  readonly kind: PreviewLineKind;
  readonly text: string;
}

const formatCall = (functionName: string, args: readonly unknown[]): string => {
  const rendered = args.map((arg) => JSON.stringify(arg) ?? "undefined").join(", ");
  return `${functionName}(${rendered})`;
};

const callText = (functionName: string, args: readonly unknown[]): string => {
  const text = formatCall(functionName, args);
  if (text.length <= 500) {
    return text;
  }
  return `${text.slice(0, 500)}…`;
};

const failed = (
  functionName: string,
  tests: readonly RunTest[],
  feedback: string,
): RunOutput => {
  return {
    passed: false,
    testsPassed: 0,
    testsTotal: tests.length,
    feedback,
    results: tests.map((test) => ({
      name: test.name,
      passed: false,
      input: callText(functionName, test.args),
      expected: preview(test.expected),
      received: "",
      error: feedback,
    })),
  };
};

const formatLog = (args: readonly unknown[]): string => {
  const parts: string[] = [];
  for (const arg of args) {
    if (typeof arg === "string") {
      parts.push(arg);
      continue;
    }
    parts.push(preview(arg));
  }
  return parts.join(" ");
};

const rejection = (code: string, disallow: readonly string[]): string | null => {
  if (code.length > 20_000) {
    return "The solution is too long to run.";
  }

  for (const blocked of blockedPatterns) {
    if (blocked.pattern.test(code)) {
      return blocked.reason;
    }
  }

  for (const snippet of disallow) {
    if (code.includes(snippet)) {
      return `This exercise asks you not to use ${snippet}. Use the approach from the lesson.`;
    }
  }

  return null;
};

const compileSolution = (
  code: string,
): { readonly compiled: string } | { readonly message: string } => {
  try {
    return {
      compiled: transform(code, {
        transforms: ["typescript", "imports"],
        production: true,
      }).code,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The solution failed to compile.";
    return { message };
  }
};

const createContext = (onLog: (args: readonly unknown[]) => void): RunnerContext => {
  const exportsObject: Record<string, unknown> = {};
  return {
    exports: exportsObject,
    module: { exports: exportsObject },
    console: {
      log: (...args: readonly unknown[]) => {
        onLog(args);
      },
    },
  };
};

const errorText = (error: unknown, fallback: string): string => {
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  if (isRecord(error) && typeof error.message === "string" && error.message.length > 0) {
    return error.message;
  }
  return fallback;
};

const takeLogs = (lines: PreviewLine[], logs: readonly string[], cursor: { index: number }) => {
  while (cursor.index < logs.length) {
    const text = logs[cursor.index] ?? "";
    cursor.index += 1;
    lines.push({ kind: "log", text });
  }
};

/**
 * Transpiles a student solution and runs each test in a fresh `node:vm` context.
 * The context has no `require`, and each script is killed after one second.
 * This is a course runner, not a hardened sandbox.
 */
export const runSolution = (
  code: string,
  functionName: string,
  tests: readonly RunTest[],
  disallow: readonly string[],
): RunOutput => {
  const reason = rejection(code, disallow);
  if (reason !== null) {
    return failed(functionName, tests, reason);
  }

  const compiled = compileSolution(code);
  if ("message" in compiled) {
    return failed(functionName, tests, compiled.message);
  }

  const context = createContext(() => undefined);
  vm.createContext(context);

  try {
    const script = new vm.Script(compiled.compiled, { filename: "solution.ts" });
    script.runInContext(context, { timeout: 1000 });
  } catch (error) {
    return failed(functionName, tests, errorText(error, "The solution failed to run."));
  }

  const exported = context.module.exports[functionName];
  if (!isFunction(exported)) {
    return failed(functionName, tests, `Export a function named ${functionName}.`);
  }

  const results: TestResult[] = [];
  let testsPassed = 0;

  for (const test of tests) {
    context.__fn = exported;
    context.__args = test.args;
    context.__result = undefined;

    try {
      const call = new vm.Script("__result = __fn(...__args);", { filename: "call.js" });
      call.runInContext(context, { timeout: 1000 });
      const received = context.__result;
      const passed = canonical(received, test.compare) === canonical(test.expected, test.compare);
      if (passed) {
        testsPassed += 1;
      }
      results.push({
        name: test.name,
        passed,
        input: callText(functionName, test.args),
        expected: preview(test.expected),
        received: preview(received),
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "The test threw.";
      results.push({
        name: test.name,
        passed: false,
        input: callText(functionName, test.args),
        expected: preview(test.expected),
        received: "",
        error: message,
      });
    }
  }

  const passed = testsPassed === tests.length;
  const feedback = passed
    ? "All tests passed."
    : `${testsPassed} of ${tests.length} tests passed.`;

  return {
    passed,
    testsPassed,
    testsTotal: tests.length,
    feedback,
    results,
  };
};

/**
 * Runs a solution against the public examples and returns a terminal transcript.
 * Console output from the student code is included. Nothing is saved.
 */
export const previewSolution = (
  code: string,
  functionName: string,
  cases: readonly PreviewCase[],
  disallow: readonly string[],
): readonly PreviewLine[] => {
  const reason = rejection(code, disallow);
  if (reason !== null) {
    return [{ kind: "error", text: reason }];
  }

  const compiled = compileSolution(code);
  if ("message" in compiled) {
    return [{ kind: "error", text: compiled.message }];
  }

  const logs: string[] = [];
  const cursor = { index: 0 };
  const context = createContext((args) => {
    logs.push(formatLog(args));
  });
  vm.createContext(context);

  try {
    const script = new vm.Script(compiled.compiled, { filename: "solution.ts" });
    script.runInContext(context, { timeout: 1000 });
  } catch (error) {
    const lines: PreviewLine[] = [];
    takeLogs(lines, logs, cursor);
    lines.push({ kind: "error", text: errorText(error, "The solution failed to run.") });
    return lines;
  }

  const exported = context.module.exports[functionName];
  if (!isFunction(exported)) {
    const lines: PreviewLine[] = [];
    takeLogs(lines, logs, cursor);
    lines.push({ kind: "error", text: `Export a function named ${functionName}.` });
    return lines;
  }

  const lines: PreviewLine[] = [];
  takeLogs(lines, logs, cursor);

  for (const testCase of cases) {
    lines.push({ kind: "prompt", text: formatCall(functionName, testCase.args) });
    context.__fn = exported;
    context.__args = testCase.args;
    context.__result = undefined;

    try {
      const call = new vm.Script("__result = __fn(...__args);", { filename: "call.js" });
      call.runInContext(context, { timeout: 1000 });
      takeLogs(lines, logs, cursor);
      lines.push({ kind: "result", text: preview(context.__result) });
    } catch (error) {
      takeLogs(lines, logs, cursor);
      lines.push({ kind: "error", text: errorText(error, "The call threw.") });
    }
  }

  if (lines.length > 0) {
    return lines;
  }

  return [{ kind: "log", text: "The code ran. This exercise has no public examples." }];
};

const logLimit = 100;

/**
 * Runs a TypeScript snippet in the same sandbox as a lesson.
 * Returns console output. Nothing is saved, and there is no exercise to grade.
 */
export const runSnippet = (code: string): readonly PreviewLine[] => {
  if (code.trim().length === 0) {
    return [{ kind: "error", text: "Write some code before running it." }];
  }

  const reason = rejection(code, []);
  if (reason !== null) {
    return [{ kind: "error", text: reason }];
  }

  const compiled = compileSolution(code);
  if ("message" in compiled) {
    return [{ kind: "error", text: compiled.message }];
  }

  const logs: string[] = [];
  let truncated = false;
  const context = createContext((args) => {
    if (logs.length >= logLimit) {
      truncated = true;
      return;
    }
    logs.push(formatLog(args));
  });
  vm.createContext(context);

  try {
    const script = new vm.Script(compiled.compiled, { filename: "example.ts" });
    script.runInContext(context, { timeout: 1000 });
  } catch (error) {
    const lines: PreviewLine[] = [];
    takeLogs(lines, logs, { index: 0 });
    lines.push({ kind: "error", text: errorText(error, "The code failed to run.") });
    return lines;
  }

  if (logs.length === 0) {
    return [{ kind: "log", text: "The code ran. Nothing was printed." }];
  }

  const lines: PreviewLine[] = [];
  takeLogs(lines, logs, { index: 0 });
  if (truncated) {
    lines.push({ kind: "log", text: "Further logs were omitted." });
  }
  return lines;
};

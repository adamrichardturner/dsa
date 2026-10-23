import vm from "node:vm";
import { transform } from "sucrase";
import {
  createScanner,
  LanguageVariant,
  ScriptTarget,
  SyntaxKind,
} from "typescript";
import type { CompareMode } from "../content/types.js";
import { isRecord } from "../lib/guards.js";

export interface RunTest {
  readonly name: string;
  readonly args: readonly unknown[];
  readonly expected: unknown;
  readonly compare: CompareMode;
  readonly timeoutMs?: number;
  readonly immutableArgs?: readonly number[];
  readonly distinctArrayReturnFromArg?: number;
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

const scriptTimeoutMs = 10_000;
const minimumTimeoutMs = 10;

interface SourceToken {
  readonly kind: SyntaxKind;
  readonly text: string;
  readonly value: string;
}

const equalTokens = (
  left: SourceToken | undefined,
  right: SourceToken | undefined,
): boolean => {
  if (left === undefined || right === undefined) {
    return false;
  }
  return left.kind === right.kind && left.text === right.text;
};

const tokens = (code: string): readonly SourceToken[] => {
  const scanner = createScanner(
    ScriptTarget.Latest,
    true,
    LanguageVariant.Standard,
    code,
  );
  const result: SourceToken[] = [];

  while (true) {
    const kind = scanner.scan();
    if (kind === SyntaxKind.EndOfFileToken) {
      return result;
    }
    result.push({
      kind,
      text: scanner.getTokenText(),
      value: scanner.getTokenValue(),
    });
  }
};

const containsTokenSequence = (
  sourceTokens: readonly SourceToken[],
  restriction: string,
): boolean => {
  const restrictedTokens = tokens(restriction);
  if (restrictedTokens.length === 0) {
    return false;
  }

  const lastStart = sourceTokens.length - restrictedTokens.length;
  for (let start = 0; start <= lastStart; start += 1) {
    let matches = true;
    for (let offset = 0; offset < restrictedTokens.length; offset += 1) {
      const source = sourceTokens[start + offset];
      const restricted = restrictedTokens[offset];
      if (equalTokens(source, restricted)) {
        continue;
      }
      matches = false;
      break;
    }
    if (matches) {
      return true;
    }
  }

  return false;
};

const isToken = (
  token: SourceToken | undefined,
  kind: SyntaxKind,
  value?: string,
): boolean => {
  if (token?.kind !== kind) {
    return false;
  }
  if (value === undefined) {
    return true;
  }
  if (token === undefined) {
    return false;
  }
  return token.value === value;
};

const isName = (token: SourceToken | undefined, name: string): boolean => {
  return token?.text === name;
};

const memberEnd = (
  sourceTokens: readonly SourceToken[],
  start: number,
  name: string,
): number | null => {
  const accessor = sourceTokens[start];
  if (
    isToken(accessor, SyntaxKind.DotToken) ||
    isToken(accessor, SyntaxKind.QuestionDotToken)
  ) {
    if (isName(sourceTokens[start + 1], name)) {
      return start + 2;
    }
    if (isToken(accessor, SyntaxKind.QuestionDotToken)) {
      return memberEnd(sourceTokens, start + 1, name);
    }
    return null;
  }

  if (
    !isToken(accessor, SyntaxKind.OpenBracketToken) ||
    !isToken(sourceTokens[start + 1], SyntaxKind.StringLiteral, name) ||
    !isToken(sourceTokens[start + 2], SyntaxKind.CloseBracketToken)
  ) {
    return null;
  }
  return start + 3;
};

const restrictedMember = (
  sourceTokens: readonly SourceToken[],
  name: string,
): boolean => {
  for (let index = 0; index < sourceTokens.length; index += 1) {
    const end = memberEnd(sourceTokens, index, name);
    if (end === null) {
      continue;
    }
    return true;
  }
  return false;
};

const restrictedDestructure = (
  sourceTokens: readonly SourceToken[],
  name: string,
): boolean => {
  for (let start = 0; start < sourceTokens.length; start += 1) {
    if (!isToken(sourceTokens[start], SyntaxKind.OpenBraceToken)) {
      continue;
    }
    let containsName = false;
    for (let index = start + 1; index < sourceTokens.length; index += 1) {
      const token = sourceTokens[index];
      if (isToken(token, SyntaxKind.CloseBraceToken)) {
        if (
          containsName &&
          isToken(sourceTokens[index + 1], SyntaxKind.EqualsToken)
        ) {
          return true;
        }
        break;
      }
      if (isName(token, name)) {
        containsName = true;
      }
    }
  }
  return false;
};

const restrictedConstructor = (
  sourceTokens: readonly SourceToken[],
  name: string,
): boolean => {
  const aliases: Record<string, true> = { [name]: true };
  for (let index = 1; index < sourceTokens.length - 1; index += 1) {
    const alias = sourceTokens[index - 1];
    const equals = sourceTokens[index];
    const original = sourceTokens[index + 1];
    if (
      alias !== undefined &&
      alias.kind === SyntaxKind.Identifier &&
      isToken(equals, SyntaxKind.EqualsToken) &&
      original !== undefined &&
      aliases[original.text] === true
    ) {
      aliases[alias.text] = true;
    }
  }

  for (let index = 0; index < sourceTokens.length - 1; index += 1) {
    if (
      isToken(sourceTokens[index], SyntaxKind.NewKeyword) &&
      aliases[sourceTokens[index + 1]?.text ?? ""] === true
    ) {
      return true;
    }
  }
  return false;
};

const restrictedQualifiedMember = (
  sourceTokens: readonly SourceToken[],
  ownerName: string,
  memberName: string,
): boolean => {
  for (let index = 0; index < sourceTokens.length; index += 1) {
    if (!isName(sourceTokens[index], ownerName)) {
      continue;
    }
    if (memberEnd(sourceTokens, index + 1, memberName) !== null) {
      return true;
    }
  }
  return false;
};

const violatesRestriction = (
  sourceTokens: readonly SourceToken[],
  restriction: string,
): boolean => {
  const memberMatch = /^\.([A-Za-z_$][\w$]*)(\()?$/.exec(restriction);
  if (memberMatch !== null) {
    const name = memberMatch[1];
    if (name !== undefined) {
      return (
        restrictedMember(sourceTokens, name) ||
        restrictedDestructure(sourceTokens, name)
      );
    }
  }

  const constructorMatch = /^new\s+([A-Za-z_$][\w$]*)$/.exec(restriction);
  if (constructorMatch !== null) {
    const name = constructorMatch[1];
    if (name !== undefined) {
      return restrictedConstructor(sourceTokens, name);
    }
  }

  const qualifiedMatch = /^([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)$/.exec(
    restriction,
  );
  if (qualifiedMatch !== null) {
    const ownerName = qualifiedMatch[1];
    const memberName = qualifiedMatch[2];
    if (ownerName !== undefined && memberName !== undefined) {
      return restrictedQualifiedMember(sourceTokens, ownerName, memberName);
    }
  }

  return containsTokenSequence(sourceTokens, restriction);
};

const blockedReason = (sourceTokens: readonly SourceToken[]): string | null => {
  for (let index = 0; index < sourceTokens.length; index += 1) {
    const token = sourceTokens[index];
    const next = sourceTokens[index + 1];
    if (isToken(token, SyntaxKind.ImportKeyword)) {
      return "Imports are not available in the runner.";
    }
    if (isName(token, "require") && isToken(next, SyntaxKind.OpenParenToken)) {
      return "require is not available in the runner.";
    }
    if (isName(token, "eval") && isToken(next, SyntaxKind.OpenParenToken)) {
      return "eval is not available in the runner.";
    }
    const callsFunction =
      isName(token, "Function") && isToken(next, SyntaxKind.OpenParenToken);
    const constructsFunction =
      isToken(token, SyntaxKind.NewKeyword) && isName(next, "Function");
    if (callsFunction || constructsFunction) {
      return "The Function constructor is not available in the runner.";
    }
    if (isName(token, "process")) {
      return "process is not available in the runner.";
    }
    if (isName(token, "globalThis")) {
      return "globalThis is not available in the runner.";
    }
  }
  return null;
};

const isFunction = (
  value: unknown,
): value is (...args: readonly unknown[]) => unknown => {
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

const contractFailure = (
  test: RunTest,
  args: readonly unknown[],
  originalArgs: readonly unknown[],
  received: unknown,
): string | null => {
  const immutableArgs = test.immutableArgs ?? [];
  for (const index of immutableArgs) {
    if (
      canonical(args[index], "exact") !==
      canonical(originalArgs[index], "exact")
    ) {
      return `Argument ${index + 1} must not be mutated.`;
    }
  }

  const distinctIndex = test.distinctArrayReturnFromArg;
  if (distinctIndex === undefined || !Array.isArray(received)) {
    return null;
  }
  if (received === args[distinctIndex]) {
    return `The returned array must be a new object, not argument ${distinctIndex + 1}.`;
  }
  return null;
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
  const rendered = args
    .map((arg) => JSON.stringify(arg) ?? "undefined")
    .join(", ");
  return `${functionName}(${rendered})`;
};

const callText = (functionName: string, args: readonly unknown[]): string => {
  const text = formatCall(functionName, args);
  if (text.length <= 500) {
    return text;
  }
  return `${text.slice(0, 500)}…`;
};

const copyValue = (value: unknown): unknown => {
  if (
    isRecord(value) &&
    value.fixture === "number-sequence" &&
    typeof value.length === "number" &&
    typeof value.start === "number" &&
    typeof value.step === "number" &&
    Number.isSafeInteger(value.length) &&
    value.length >= 0 &&
    value.length <= 100_000
  ) {
    const generated: number[] = [];
    for (let index = 0; index < value.length; index += 1) {
      generated.push(value.start + index * value.step);
    }
    return generated;
  }
  try {
    return structuredClone(value);
  } catch {
    return value;
  }
};

const copyArgs = (args: readonly unknown[]): unknown[] => {
  const copied: unknown[] = [];
  for (let index = 0; index < args.length; index += 1) {
    copied.push(copyValue(args[index]));
  }
  return copied;
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

const rejection = (
  code: string,
  disallow: readonly string[],
): string | null => {
  if (code.length > 20_000) {
    return "The solution is too long to run.";
  }

  const sourceTokens = tokens(code);
  const blocked = blockedReason(sourceTokens);
  if (blocked !== null) {
    return blocked;
  }

  for (const snippet of disallow) {
    if (violatesRestriction(sourceTokens, snippet)) {
      return `This exercise asks you not to use ${snippet}. Use the approach from the lesson.`;
    }
  }

  return null;
};

const testTimeout = (test: RunTest): number => {
  const requested = test.timeoutMs ?? scriptTimeoutMs;
  if (!Number.isFinite(requested)) {
    return scriptTimeoutMs;
  }
  return Math.floor(
    Math.max(minimumTimeoutMs, Math.min(scriptTimeoutMs, requested)),
  );
};

const compileSolution = (
  code: string,
): { readonly compiled: string } | { readonly message: string } => {
  try {
    return {
      compiled: transform(code, {
        transforms: ["typescript", "imports"],
        // Leave current syntax in place. The Node runtime executes it.
        disableESTransforms: true,
        production: true,
      }).code,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The solution failed to compile.";
    return { message };
  }
};

const createContext = (
  onLog: (args: readonly unknown[]) => void,
): RunnerContext => {
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
  if (
    isRecord(error) &&
    typeof error.message === "string" &&
    error.message.length > 0
  ) {
    return error.message;
  }
  return fallback;
};

const isScriptTimeout = (error: unknown): boolean => {
  if (!isRecord(error)) {
    return false;
  }
  if (error.code === "ERR_SCRIPT_EXECUTION_TIMEOUT") {
    return true;
  }
  if (typeof error.message !== "string") {
    return false;
  }
  return error.message.startsWith("Script execution timed out");
};

const durationText = (timeoutMs: number): string => {
  const wholeSeconds = timeoutMs >= 1000 && timeoutMs % 1000 === 0;
  if (!wholeSeconds) {
    return `${timeoutMs}ms`;
  }
  const seconds = timeoutMs / 1000;
  if (seconds === 1) {
    return "1 second";
  }
  return `${seconds} seconds`;
};

const timeoutText = (timeoutMs: number): string => {
  const duration = durationText(timeoutMs);
  if (timeoutMs >= scriptTimeoutMs) {
    return `Execution timed out after ${duration}.\nThe code was stopped. Check for an infinite loop.`;
  }
  return `Execution timed out after ${duration}. This case needs to finish faster.`;
};

const executionError = (
  error: unknown,
  timeoutMs: number,
  fallback: string,
): string => {
  if (isScriptTimeout(error)) {
    return timeoutText(timeoutMs);
  }
  return errorText(error, fallback);
};

const takeLogs = (
  lines: PreviewLine[],
  logs: readonly string[],
  cursor: { index: number },
) => {
  while (cursor.index < logs.length) {
    const text = logs[cursor.index] ?? "";
    cursor.index += 1;
    lines.push({ kind: "log", text });
  }
};

/**
 * Transpiles a student solution and runs each test in a fresh `node:vm` context.
 * The context has no `require`, and each script is stopped after ten seconds.
 * A test can request a shorter limit. This is a course runner, not a hardened sandbox.
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
    const script = new vm.Script(compiled.compiled, {
      filename: "solution.ts",
    });
    script.runInContext(context, { timeout: scriptTimeoutMs });
  } catch (error) {
    return failed(
      functionName,
      tests,
      executionError(error, scriptTimeoutMs, "The solution failed to run."),
    );
  }

  const exported = context.module.exports[functionName];
  if (!isFunction(exported)) {
    return failed(
      functionName,
      tests,
      `Export a function named ${functionName}.`,
    );
  }

  const results: TestResult[] = [];
  let testsPassed = 0;

  for (const test of tests) {
    const input = callText(functionName, test.args);
    context.__fn = exported;
    context.__args = copyArgs(test.args);
    const originalArgs = copyArgs(context.__args);
    context.__result = undefined;

    const timeoutMs = testTimeout(test);

    try {
      const call = new vm.Script("__result = __fn(...__args);", {
        filename: "call.js",
      });
      call.runInContext(context, { timeout: timeoutMs });
      const received = context.__result;
      const valueMatches =
        canonical(received, test.compare) ===
        canonical(test.expected, test.compare);
      const contractError = contractFailure(
        test,
        context.__args,
        originalArgs,
        received,
      );
      const passed = valueMatches && contractError === null;
      if (passed) {
        testsPassed += 1;
      }
      results.push({
        name: test.name,
        passed,
        input,
        expected: preview(test.expected),
        received: preview(received),
        error: contractError,
      });
    } catch (error) {
      const message = executionError(error, timeoutMs, "The test threw.");
      results.push({
        name: test.name,
        passed: false,
        input,
        expected: preview(test.expected),
        received: "",
        error: message,
      });
      if (isScriptTimeout(error) && timeoutMs >= scriptTimeoutMs) {
        return {
          passed: false,
          testsPassed,
          testsTotal: tests.length,
          feedback: message,
          results,
        };
      }
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
    const script = new vm.Script(compiled.compiled, {
      filename: "solution.ts",
    });
    script.runInContext(context, { timeout: scriptTimeoutMs });
  } catch (error) {
    const lines: PreviewLine[] = [];
    takeLogs(lines, logs, cursor);
    lines.push({
      kind: "error",
      text: executionError(
        error,
        scriptTimeoutMs,
        "The solution failed to run.",
      ),
    });
    return lines;
  }

  const exported = context.module.exports[functionName];
  if (!isFunction(exported)) {
    const lines: PreviewLine[] = [];
    takeLogs(lines, logs, cursor);
    lines.push({
      kind: "error",
      text: `Export a function named ${functionName}.`,
    });
    return lines;
  }

  const lines: PreviewLine[] = [];
  takeLogs(lines, logs, cursor);

  for (const testCase of cases) {
    lines.push({
      kind: "prompt",
      text: formatCall(functionName, testCase.args),
    });
    context.__fn = exported;
    context.__args = testCase.args;
    context.__result = undefined;

    try {
      const call = new vm.Script("__result = __fn(...__args);", {
        filename: "call.js",
      });
      call.runInContext(context, { timeout: scriptTimeoutMs });
      takeLogs(lines, logs, cursor);
      lines.push({ kind: "result", text: preview(context.__result) });
    } catch (error) {
      takeLogs(lines, logs, cursor);
      lines.push({
        kind: "error",
        text: executionError(error, scriptTimeoutMs, "The call threw."),
      });
      if (isScriptTimeout(error)) {
        break;
      }
    }
  }

  if (lines.length > 0) {
    return lines;
  }

  return [
    {
      kind: "log",
      text: "The code ran. This exercise has no public examples.",
    },
  ];
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
    script.runInContext(context, { timeout: scriptTimeoutMs });
  } catch (error) {
    const lines: PreviewLine[] = [];
    takeLogs(lines, logs, { index: 0 });
    lines.push({
      kind: "error",
      text: executionError(error, scriptTimeoutMs, "The code failed to run."),
    });
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

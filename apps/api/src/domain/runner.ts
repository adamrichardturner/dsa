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

const failed = (tests: readonly RunTest[], feedback: string): RunOutput => {
  return {
    passed: false,
    testsPassed: 0,
    testsTotal: tests.length,
    feedback,
    results: tests.map((test) => ({
      name: test.name,
      passed: false,
      expected: preview(test.expected),
      received: "",
      error: feedback,
    })),
  };
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
  if (code.length > 20_000) {
    return failed(tests, "The solution is too long to run.");
  }

  for (const blocked of blockedPatterns) {
    if (blocked.pattern.test(code)) {
      return failed(tests, blocked.reason);
    }
  }

  for (const snippet of disallow) {
    if (code.includes(snippet)) {
      return failed(
        tests,
        `This exercise asks you not to use ${snippet}. Use the approach from the lesson.`,
      );
    }
  }

  const compiled = transform(code, {
    transforms: ["typescript", "imports"],
    production: true,
  }).code;

  const exportsObject: Record<string, unknown> = {};
  const context: RunnerContext = {
    exports: exportsObject,
    module: { exports: exportsObject },
    console: {
      log: () => undefined,
    },
  };

  vm.createContext(context);

  try {
    const script = new vm.Script(compiled, { filename: "solution.ts" });
    script.runInContext(context, { timeout: 1000 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The solution failed to run.";
    return failed(tests, message);
  }

  const exported = context.module.exports[functionName];
  if (!isFunction(exported)) {
    return failed(tests, `Export a function named ${functionName}.`);
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
        expected: preview(test.expected),
        received: preview(received),
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "The test threw.";
      results.push({
        name: test.name,
        passed: false,
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

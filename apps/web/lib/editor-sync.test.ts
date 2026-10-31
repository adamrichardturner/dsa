import assert from "node:assert/strict";
import test from "node:test";
import { planEditorSync } from "./editor-sync.ts";

test("typing that is already in the model does not rewrite the editor", () => {
  assert.equal(
    planEditorSync({
      modelValue: "const value = 1;\n",
      propValue: "const value = 1;\n",
      emittedValue: "const value = 1;\n",
      revision: 0,
      appliedRevision: 0,
    }),
    "keep",
  );
});

test("a stale parent value does not pull the caret back to the start", () => {
  assert.equal(
    planEditorSync({
      modelValue: "const value = 12;\n",
      propValue: "const value = 1;\n",
      emittedValue: "const value = 12;\n",
      revision: 1,
      appliedRevision: 1,
    }),
    "echo",
  );
});

test("a revision bump replaces the document on purpose", () => {
  assert.equal(
    planEditorSync({
      modelValue: "const value = 12;\n",
      propValue: "export function solve(): number {\n  return 0;\n}\n",
      emittedValue: "const value = 12;\n",
      revision: 2,
      appliedRevision: 1,
    }),
    "replace",
  );
});

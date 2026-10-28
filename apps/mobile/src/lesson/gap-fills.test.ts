import assert from "node:assert/strict";
import test from "node:test";
import { gapFillsFromRecord, initialGapFills } from "./gap-fills.ts";

const parts = [
  { kind: "text", text: "return ", gapId: null },
  { kind: "gap", text: "", gapId: "g0" },
  { kind: "text", text: " + ", gapId: null },
  { kind: "gap", text: "", gapId: "g1" },
];

const chips = [
  { id: "c1", text: "left" },
  { id: "c2", text: "right" },
];

test("saved gap fills prefill the gaps that still exist", () => {
  const fills = initialGapFills(parts, chips, [
    { gapId: "g0", chipId: "c1" },
    { gapId: "g1", chipId: "c2" },
  ]);
  assert.deepEqual(fills, { g0: "c1", g1: "c2" });
});

test("a lesson with no saved fills leaves every gap empty", () => {
  assert.deepEqual(initialGapFills(parts, chips, null), {});
  assert.deepEqual(initialGapFills(parts, chips, []), {});
});

test("unknown chips and gaps are not restored", () => {
  const fills = initialGapFills(parts, chips, [
    { gapId: "g0", chipId: "missing" },
    { gapId: "g9", chipId: "c1" },
    { gapId: "g1", chipId: "c2" },
  ]);
  assert.deepEqual(fills, { g1: "c2" });
});

test("a chip is only placed in the first gap that saved it", () => {
  const fills = initialGapFills(parts, chips, [
    { gapId: "g0", chipId: "c1" },
    { gapId: "g1", chipId: "c1" },
    { gapId: "g0", chipId: "c2" },
  ]);
  assert.deepEqual(fills, { g0: "c1" });
});

test("submitted fills become the list the lesson stores", () => {
  const saved = gapFillsFromRecord({ g0: "c1", g1: "c2" });
  assert.deepEqual(saved, [
    { gapId: "g0", chipId: "c1" },
    { gapId: "g1", chipId: "c2" },
  ]);
  assert.deepEqual(initialGapFills(parts, chips, saved), { g0: "c1", g1: "c2" });
  assert.deepEqual(gapFillsFromRecord({}), []);
});

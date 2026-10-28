import type { GapChip, GapFill, GapPart } from "../api/types";

export const initialGapFills = (
  parts: readonly GapPart[],
  chips: readonly GapChip[],
  saved: readonly GapFill[] | null,
): Record<string, string> => {
  if (saved === null) {
    return {};
  }

  const gapIds: Record<string, true> = {};
  for (const part of parts) {
    if (part.kind !== "gap" || part.gapId === null) {
      continue;
    }
    gapIds[part.gapId] = true;
  }

  const chipIds: Record<string, true> = {};
  for (const chip of chips) {
    chipIds[chip.id] = true;
  }

  const fills: Record<string, string> = {};
  const used: Record<string, true> = {};
  for (const fill of saved) {
    if (gapIds[fill.gapId] !== true) {
      continue;
    }
    if (chipIds[fill.chipId] !== true) {
      continue;
    }
    if (fills[fill.gapId] !== undefined) {
      continue;
    }
    if (used[fill.chipId] === true) {
      continue;
    }
    fills[fill.gapId] = fill.chipId;
    used[fill.chipId] = true;
  }
  return fills;
};

export const gapFillsFromRecord = (
  fills: Readonly<Record<string, string>>,
): readonly GapFill[] => {
  const saved: GapFill[] = [];
  for (const gapId of Object.keys(fills)) {
    const chipId = fills[gapId];
    if (chipId === undefined) {
      continue;
    }
    saved.push({ gapId, chipId });
  }
  return saved;
};

import { solutionForProblem } from "../../../web/lib/solutions/content.js";
import type { SolutionBlock } from "../../../web/lib/solutions/types.js";
import { puzzleForProblem, type GapReveal } from "./gaps.js";

export interface GuideBlockView {
  readonly kind: string;
  readonly text: string | null;
  readonly items: readonly string[] | null;
  readonly chart: string | null;
}

export interface SolutionGuideView {
  readonly blocks: readonly GuideBlockView[];
  readonly code: string;
  readonly reveals: readonly GapReveal[];
}

const blockView = (block: SolutionBlock): GuideBlockView => {
  if (block.kind === "list") {
    return { kind: block.kind, text: null, items: block.items, chart: null };
  }
  if (block.kind === "diagram") {
    return { kind: block.kind, text: null, items: null, chart: block.chart };
  }
  if (block.kind === "code") {
    return { kind: block.kind, text: null, items: null, chart: null };
  }
  return { kind: block.kind, text: block.text, items: null, chart: null };
};

export const solutionGuideFor = (problemId: string): SolutionGuideView | null => {
  const solution = solutionForProblem("", problemId);
  const puzzle = puzzleForProblem(problemId);
  if (solution === null || puzzle === null) {
    return null;
  }
  const blocks: GuideBlockView[] = [];
  for (const block of solution.blocks) {
    blocks.push(blockView(block));
  }
  return {
    blocks,
    code: puzzle.source,
    reveals: puzzle.reveals,
  };
};

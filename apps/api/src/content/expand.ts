import type { SeedLesson, SeedModule, SeedProblem } from "./types.js";
import { extras } from "./extra-problems.js";
import { followUps } from "./follow-ups.js";
import { reading } from "./reading.js";
import { stressTests } from "./stress-tests.js";

const withStressTest = (problem: SeedProblem): SeedProblem => {
  const stressTest = stressTests[problem.id];
  if (stressTest === undefined) {
    return problem;
  }
  return { ...problem, tests: [...problem.tests, stressTest] };
};

const withStressTests = (lesson: SeedLesson): SeedLesson => {
  const problems: SeedProblem[] = [];
  for (const problem of lesson.problems) {
    problems.push(withStressTest(problem));
  }
  return { ...lesson, problems };
};

/**
 * Keeps every original lesson id, replaces the reading with shorter steps,
 * adds a second exercise, and inserts one follow-up lesson after each.
 * Progress stays keyed by the ids that already exist.
 */
export const expandCourse = (
  modules: readonly SeedModule[],
): readonly SeedModule[] => {
  const expanded: SeedModule[] = [];

  for (const module of modules) {
    const lessons: SeedLesson[] = [];

    for (const lesson of module.lessons) {
      const extra = extras[lesson.id];
      const before = extra?.before ?? [];
      const after = extra?.after ?? [];
      const contentMd = reading[lesson.id] ?? lesson.contentMd;

      lessons.push(
        withStressTests({
          ...lesson,
          contentMd,
          problems: [...before, ...lesson.problems, ...after],
        }),
      );

      const follow = followUps[lesson.id];
      if (follow === undefined) {
        continue;
      }
      lessons.push(withStressTests(follow));
    }

    expanded.push({
      id: module.id,
      title: module.title,
      summary: module.summary,
      weekNumber: module.weekNumber,
      lessons,
    });
  }

  return expanded;
};

export type NextExercise =
  | { readonly kind: "problem"; readonly id: string }
  | { readonly kind: "lesson"; readonly slug: string };

export const nextExerciseTarget = (
  problems: readonly { readonly id: string }[],
  currentId: string,
  nextSlug: string | null,
  nextAvailable: boolean,
): NextExercise | null => {
  let index = -1;
  for (let position = 0; position < problems.length; position += 1) {
    const problem = problems[position];
    if (problem === undefined) {
      continue;
    }
    if (problem.id !== currentId) {
      continue;
    }
    index = position;
    break;
  }
  const upcoming = problems[index + 1];
  if (index >= 0 && upcoming !== undefined) {
    return { kind: "problem", id: upcoming.id };
  }
  if (nextSlug === null) {
    return null;
  }
  if (!nextAvailable) {
    return null;
  }
  return { kind: "lesson", slug: nextSlug };
};

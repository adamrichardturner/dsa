interface ExerciseRef {
  readonly id: string;
  readonly solved: boolean;
}

export const selectProblem = <T extends ExerciseRef>(
  problems: readonly T[],
  requestedId: string | null,
): T | undefined => {
  if (problems.length === 0) {
    return undefined;
  }
  if (requestedId !== null) {
    for (const problem of problems) {
      if (problem.id === requestedId) {
        return problem;
      }
    }
  }
  for (const problem of problems) {
    if (!problem.solved) {
      return problem;
    }
  }
  return problems[0];
};

export const followingProblem = <T extends { readonly id: string }>(
  problems: readonly T[],
  currentId: string,
): T | undefined => {
  let seen = false;
  for (const problem of problems) {
    if (!seen) {
      if (problem.id === currentId) {
        seen = true;
      }
      continue;
    }
    return problem;
  }
  return undefined;
};

export const allExercisesSolved = (
  problems: readonly ExerciseRef[],
  activeId: string,
  activeSolved: boolean,
): boolean => {
  if (problems.length === 0) {
    return false;
  }
  for (const problem of problems) {
    if (problem.id === activeId) {
      if (!activeSolved) {
        return false;
      }
      continue;
    }
    if (!problem.solved) {
      return false;
    }
  }
  return true;
};

export const otherExercisesSolved = (
  problems: readonly ExerciseRef[],
  activeId: string,
): boolean => {
  for (const problem of problems) {
    if (problem.id === activeId) {
      continue;
    }
    if (!problem.solved) {
      return false;
    }
  }
  return true;
};

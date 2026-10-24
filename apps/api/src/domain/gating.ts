export interface GateLesson {
  readonly id: string;
  readonly slug: string;
}

/**
 * A lesson is open when every earlier lesson has been passed or skipped.
 * A skip is not a pass: it only lets the learner move to the next lesson.
 * Lessons opened another way stay closed once this walk is used on its own.
 */
export const openLessonSlugs = (
  lessons: readonly GateLesson[],
  solvedByLesson: Record<string, boolean>,
  skippedByLesson: Record<string, boolean>,
  auditMode: boolean,
): Record<string, boolean> => {
  const open: Record<string, boolean> = {};
  let reachable = true;

  for (const lesson of lessons) {
    open[lesson.slug] = auditMode || reachable;
    const solved = solvedByLesson[lesson.id] === true;
    const skipped = skippedByLesson[lesson.id] === true;
    reachable = solved || skipped;
  }

  return open;
};

export interface CourseAccess {
  readonly emailVerified: boolean;
  readonly oauthVerified: boolean;
}

export const appUseAllowed = (account: CourseAccess): boolean => {
  if (account.emailVerified) {
    return true;
  }
  return account.oauthVerified;
};

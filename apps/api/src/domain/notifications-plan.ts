const dayMs = 86_400_000;
const returnAfterDays = 7;

export const returnQuietDays = 14;

export type StudyNotificationKind = "achievement" | "habit";

export interface PlannedNotification {
  readonly key: string;
  readonly kind: StudyNotificationKind;
  readonly title: string;
  readonly body: string;
  readonly href: string;
}

export interface LessonProgress {
  readonly slug: string;
  readonly weekNumber: number;
  readonly moduleTitle: string;
  readonly solved: number;
  readonly total: number;
}

export interface ProgressSnapshot {
  readonly now: Date;
  readonly lessonsCompleted: number;
  readonly lessonsTotal: number;
  readonly problemsSolved: number;
  readonly attempts: number;
  readonly streak: number;
  readonly lastActiveDay: string | null;
  readonly lessons: readonly LessonProgress[];
}

export interface StoredReturn {
  readonly key: string;
  readonly dismissed: boolean;
  readonly createdAt: string;
}

interface WeekAcc {
  weekNumber: number;
  moduleTitle: string;
  lessonsCompleted: number;
  lessonsTotal: number;
}

const utcStart = (now: Date): number =>
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

const daysSinceDay = (day: string, now: Date): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (match === null) {
    return null;
  }
  const yearText = match[1];
  const monthText = match[2];
  const dayText = match[3];
  if (yearText === undefined || monthText === undefined || dayText === undefined) {
    return null;
  }
  const year = Number(yearText);
  const month = Number(monthText);
  const date = Number(dayText);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(date)) {
    return null;
  }
  return Math.round((utcStart(now) - Date.UTC(year, month - 1, date)) / dayMs);
};

const daysSinceIso = (iso: string, now: Date): number | null => {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return Math.round((utcStart(now) - utcStart(new Date(parsed))) / dayMs);
};

const latestReturn = (existing: readonly StoredReturn[]): StoredReturn | null => {
  let latest: StoredReturn | null = null;
  for (const row of existing) {
    if (latest === null || row.createdAt > latest.createdAt) {
      latest = row;
    }
  }
  return latest;
};

/**
 * One return note at a time. Dismissing an absence does not send it again.
 * A later absence waits until the previous note is two weeks old.
 */
export const allowReturn = (
  existing: readonly StoredReturn[],
  draftKey: string,
  now: Date,
): boolean => {
  const latest = latestReturn(existing);
  if (latest === null) {
    return true;
  }
  if (!latest.dismissed) {
    return latest.key === draftKey;
  }
  if (latest.key === draftKey) {
    return false;
  }
  const age = daysSinceIso(latest.createdAt, now);
  if (age === null) {
    return false;
  }
  return age >= returnQuietDays;
};

const continueHref = (lessons: readonly LessonProgress[]): string => {
  for (const lesson of lessons) {
    if (lesson.total > 0 && lesson.solved === lesson.total) {
      continue;
    }
    return `/course/${lesson.slug}`;
  }
  return "/progress";
};

const weeksOf = (lessons: readonly LessonProgress[]): WeekAcc[] => {
  const weeks: WeekAcc[] = [];
  for (const lesson of lessons) {
    const complete = lesson.total > 0 && lesson.solved === lesson.total;
    const current = weeks[weeks.length - 1];
    if (current !== undefined && current.weekNumber === lesson.weekNumber) {
      current.lessonsTotal += 1;
      current.lessonsCompleted += complete ? 1 : 0;
      continue;
    }
    weeks.push({
      weekNumber: lesson.weekNumber,
      moduleTitle: lesson.moduleTitle,
      lessonsCompleted: complete ? 1 : 0,
      lessonsTotal: 1,
    });
  }
  return weeks;
};

const push = (notes: PlannedNotification[], note: PlannedNotification | null): void => {
  if (note === null) {
    return;
  }
  notes.push(note);
};

const firstPass = (snapshot: ProgressSnapshot, href: string): PlannedNotification | null => {
  if (snapshot.problemsSolved < 1) {
    return null;
  }
  return {
    key: "achievement:first-pass",
    kind: "achievement",
    title: "First exercise passed",
    body: "That pass is saved on your account. One exercise at a time is enough.",
    href,
  };
};

const firstLesson = (snapshot: ProgressSnapshot, href: string): PlannedNotification | null => {
  if (snapshot.lessonsCompleted < 1) {
    return null;
  }
  return {
    key: "achievement:first-lesson",
    kind: "achievement",
    title: "First lesson finished",
    body: "The lesson is marked done. The next one stays where you left it.",
    href,
  };
};

const weekNote = (week: WeekAcc, href: string): PlannedNotification | null => {
  if (week.lessonsTotal === 0 || week.lessonsCompleted < week.lessonsTotal) {
    return null;
  }
  return {
    key: `achievement:week:${week.weekNumber}`,
    kind: "achievement",
    title: `Week ${week.weekNumber} finished`,
    body: `${week.moduleTitle} is complete.`,
    href,
  };
};

const halfway = (snapshot: ProgressSnapshot, href: string): PlannedNotification | null => {
  if (snapshot.lessonsTotal === 0) {
    return null;
  }
  if (snapshot.lessonsCompleted >= snapshot.lessonsTotal) {
    return null;
  }
  if (snapshot.lessonsCompleted * 2 < snapshot.lessonsTotal) {
    return null;
  }
  return {
    key: "achievement:halfway",
    kind: "achievement",
    title: "Halfway through the lessons",
    body: `${snapshot.lessonsCompleted} of ${snapshot.lessonsTotal} lessons have a passing solution.`,
    href,
  };
};

const streakNote = (
  snapshot: ProgressSnapshot,
  href: string,
  days: 3 | 7,
): PlannedNotification | null => {
  if (snapshot.attempts < 1 || snapshot.streak < days) {
    return null;
  }
  if (days === 3) {
    return {
      key: "achievement:streak:3",
      kind: "achievement",
      title: "Three days in a row",
      body: "A short session counts. There is no need to finish more than one lesson.",
      href,
    };
  }
  return {
    key: "achievement:streak:7",
    kind: "achievement",
    title: "Seven days in a row",
    body: "A week of practice, kept on the account.",
    href,
  };
};

const courseFinished = (snapshot: ProgressSnapshot): PlannedNotification | null => {
  if (snapshot.lessonsTotal === 0) {
    return null;
  }
  if (snapshot.lessonsCompleted < snapshot.lessonsTotal) {
    return null;
  }
  return {
    key: "achievement:course",
    kind: "achievement",
    title: "Course finished",
    body: "Every lesson has a passing solution. The articles stay available when you want a longer explanation.",
    href: "/progress",
  };
};

const returnNote = (snapshot: ProgressSnapshot, href: string): PlannedNotification | null => {
  if (snapshot.streak > 0 || snapshot.attempts < 1 || snapshot.lastActiveDay === null) {
    return null;
  }
  const gap = daysSinceDay(snapshot.lastActiveDay, snapshot.now);
  if (gap === null) {
    return null;
  }
  if (gap < returnAfterDays) {
    return null;
  }
  const title =
    gap < 14 ? "A week since the last session" : "A few weeks since the last session";
  return {
    key: `habit:return:${snapshot.lastActiveDay}`,
    kind: "habit",
    title,
    body: "Your place in the course is saved. One exercise is enough to pick it up.",
    href,
  };
};

/**
 * Milestones worth keeping, plus one note after a week away.
 * Keys are permanent, so a dismissed note is not created again.
 * Nothing here is per submission or per day.
 */
export const planNotifications = (snapshot: ProgressSnapshot): readonly PlannedNotification[] => {
  const href = continueHref(snapshot.lessons);
  const notes: PlannedNotification[] = [];
  push(notes, firstPass(snapshot, href));
  push(notes, firstLesson(snapshot, href));
  for (const week of weeksOf(snapshot.lessons)) {
    push(notes, weekNote(week, href));
  }
  push(notes, halfway(snapshot, href));
  push(notes, streakNote(snapshot, href, 3));
  push(notes, streakNote(snapshot, href, 7));
  push(notes, courseFinished(snapshot));
  push(notes, returnNote(snapshot, href));
  return notes;
};

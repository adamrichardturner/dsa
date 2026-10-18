import type {
  ActivityDay,
  AnalyticsView,
  DifficultyStat,
  Improvement,
  LessonStat,
  SkippedLesson,
  TopicStat,
} from "./models.js";

export interface InsightProblem {
  readonly id: string;
  readonly lessonId: string;
  readonly topic: string;
  readonly difficulty: string;
  readonly slug: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly moduleTitle: string;
  readonly moduleOrder: number;
  readonly lessonOrder: number;
}

export interface InsightStat {
  readonly problemId: string;
  readonly solved: boolean;
  readonly attempts: number;
}

export interface InsightInput {
  readonly now: Date;
  readonly problems: readonly InsightProblem[];
  readonly stats: readonly InsightStat[];
  readonly skippedLessonIds: readonly string[];
  readonly attempts: number;
  readonly passes: number;
  readonly days: readonly ActivityDay[];
}

const dayMs = 86_400_000;
const windowDays = 30;
const improvementLimit = 5;
const difficultyOrder = ["easy", "medium"];

const difficultyLabels: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
};

interface LessonAcc {
  slug: string;
  title: string;
  weekNumber: number;
  moduleTitle: string;
  solved: number;
  total: number;
}

interface TopicAcc {
  topic: string;
  solved: number;
  total: number;
  attempted: number;
  href: string;
  openHref: string | null;
}

const describe = (
  problemsSolved: number,
  problemsTotal: number,
  attempts: number,
  focusAreas: readonly string[],
): string => {
  if (attempts === 0) {
    return "You have not submitted a solution yet. Start with The cost of a loop. The first exercises are short on purpose.";
  }
  if (problemsSolved === problemsTotal) {
    return "You have solved every exercise. The same patterns show up in longer problems.";
  }
  if (focusAreas.length === 0) {
    return "Everything you have attempted so far has passed. Move on to the next unsolved lesson while the previous pattern is still fresh.";
  }
  if (focusAreas.length === 1) {
    const topic = focusAreas[0];
    if (topic === undefined) {
      return "Spend the next session on the topic that has an attempt that has not passed.";
    }
    return `Spend the next session on ${topic}. That topic has an attempt that has not passed.`;
  }
  return "A few topics have an attempt that has not passed. The areas below are the useful order to go back through them.";
};

const recentDays = (now: Date, count: number): readonly string[] => {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    days.push(new Date(start - offset * dayMs).toISOString().slice(0, 10));
  }
  return days;
};

const dayKey = (time: number): string => new Date(time).toISOString().slice(0, 10);

const streakFrom = (days: readonly ActivityDay[], now: Date): number => {
  const active: Record<string, boolean> = {};
  for (const day of days) {
    if (day.submissions > 0) {
      active[day.day] = true;
    }
  }
  let cursor = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (active[dayKey(cursor)] !== true) {
    cursor -= dayMs;
  }
  let count = 0;
  while (active[dayKey(cursor)] === true) {
    count += 1;
    cursor -= dayMs;
  }
  return count;
};

const difficultyLabel = (difficulty: string): string => {
  const known = difficultyLabels[difficulty];
  if (known !== undefined) {
    return known;
  }
  if (difficulty.length === 0) {
    return difficulty;
  }
  return `${difficulty.charAt(0).toUpperCase()}${difficulty.slice(1)}`;
};

const exerciseCount = (count: number): string => {
  if (count === 1) {
    return "1 exercise";
  }
  return `${count} exercises`;
};

const improvementsFor = (
  attempts: number,
  topics: readonly TopicAcc[],
  lessons: readonly LessonStat[],
): readonly Improvement[] => {
  const first = lessons[0];
  if (attempts === 0) {
    if (first === undefined) {
      return [];
    }
    return [
      {
        kind: "start",
        title: first.title,
        detail: "The first exercises are short on purpose.",
        href: `/course/${first.slug}`,
      },
    ];
  }

  const improvements: Improvement[] = [];
  const seen: Record<string, boolean> = {};
  const push = (item: Improvement): boolean => {
    if (improvements.length >= improvementLimit) {
      return false;
    }
    if (seen[item.href] === true) {
      return false;
    }
    seen[item.href] = true;
    improvements.push(item);
    return true;
  };

  let stuck = 0;
  for (const topic of topics) {
    if (stuck >= 2) {
      break;
    }
    if (topic.attempted === 0 || topic.solved >= topic.total) {
      continue;
    }
    const verb = topic.solved === 1 || topic.total === 1 ? "is" : "are";
    const added = push({
      kind: "stuck",
      title: topic.topic,
      detail: `${topic.topic} has a submission that has not passed. ${topic.solved} of ${exerciseCount(topic.total)} ${verb} solved.`,
      href: topic.openHref ?? topic.href,
    });
    if (added) {
      stuck += 1;
    }
  }

  let skipped = 0;
  for (const lesson of lessons) {
    if (skipped >= 2) {
      break;
    }
    const complete = lesson.total > 0 && lesson.solved === lesson.total;
    if (!lesson.skipped || complete) {
      continue;
    }
    const added = push({
      kind: "skipped",
      title: lesson.title,
      detail: `You skipped ${lesson.title}. A skip does not count as a pass.`,
      href: `/course/${lesson.slug}`,
    });
    if (added) {
      skipped += 1;
    }
  }

  if (stuck === 0 && skipped === 0) {
    for (const lesson of lessons) {
      const complete = lesson.total > 0 && lesson.solved === lesson.total;
      if (complete || lesson.skipped) {
        continue;
      }
      push({
        kind: "continue",
        title: lesson.title,
        detail: `${lesson.title} is the next unfinished lesson.`,
        href: `/course/${lesson.slug}`,
      });
      break;
    }
  }

  return improvements;
};

/** Turns problem rows and submission stats into the progress page view. */
export const buildInsights = (input: InsightInput): AnalyticsView => {
  const byProblem: Record<string, InsightStat> = {};
  for (const stat of input.stats) {
    byProblem[stat.problemId] = stat;
  }

  const skippedIds: Record<string, boolean> = {};
  for (const lessonId of input.skippedLessonIds) {
    skippedIds[lessonId] = true;
  }

  const topics: Record<string, TopicAcc> = {};
  const topicOrder: string[] = [];
  const lessons: Record<string, LessonAcc> = {};
  const lessonOrder: string[] = [];
  const difficulties: Record<string, { solved: number; total: number }> = {};
  const difficultyKeys: string[] = [];

  for (const problem of input.problems) {
    const stat = byProblem[problem.id];
    const solved = stat?.solved ?? false;
    const attempted = (stat?.attempts ?? 0) > 0;

    const topic = topics[problem.topic] ?? {
      topic: problem.topic,
      solved: 0,
      total: 0,
      attempted: 0,
      href: `/course/${problem.slug}`,
      openHref: null,
    };
    if (topics[problem.topic] === undefined) {
      topicOrder.push(problem.topic);
    }
    topic.solved += solved ? 1 : 0;
    topic.total += 1;
    topic.attempted += attempted ? 1 : 0;
    if (!solved && topic.openHref === null) {
      topic.openHref = `/course/${problem.slug}`;
    }
    topics[problem.topic] = topic;

    const lesson = lessons[problem.lessonId] ?? {
      slug: problem.slug,
      title: problem.title,
      weekNumber: problem.weekNumber,
      moduleTitle: problem.moduleTitle,
      solved: 0,
      total: 0,
    };
    if (lessons[problem.lessonId] === undefined) {
      lessonOrder.push(problem.lessonId);
    }
    lesson.solved += solved ? 1 : 0;
    lesson.total += 1;
    lessons[problem.lessonId] = lesson;

    const difficulty = difficulties[problem.difficulty] ?? { solved: 0, total: 0 };
    if (difficulties[problem.difficulty] === undefined) {
      difficultyKeys.push(problem.difficulty);
    }
    difficulty.solved += solved ? 1 : 0;
    difficulty.total += 1;
    difficulties[problem.difficulty] = difficulty;
  }

  const topicList: TopicAcc[] = [];
  for (const key of topicOrder) {
    const topic = topics[key];
    if (topic === undefined) {
      continue;
    }
    topicList.push(topic);
  }

  const lessonList: LessonStat[] = [];
  const skippedLessons: SkippedLesson[] = [];
  let lessonsCompleted = 0;
  let problemsSolved = 0;

  for (const topic of topicList) {
    problemsSolved += topic.solved;
  }

  for (const lessonId of lessonOrder) {
    const lesson = lessons[lessonId];
    if (lesson === undefined) {
      continue;
    }
    const skipped = skippedIds[lessonId] === true;
    const complete = lesson.total > 0 && lesson.solved === lesson.total;
    if (complete) {
      lessonsCompleted += 1;
    }
    if (skipped && !complete) {
      skippedLessons.push({ slug: lesson.slug, title: lesson.title });
    }
    lessonList.push({
      slug: lesson.slug,
      title: lesson.title,
      weekNumber: lesson.weekNumber,
      moduleTitle: lesson.moduleTitle,
      solved: lesson.solved,
      total: lesson.total,
      skipped: skipped && !complete,
    });
  }

  const focusAreas: string[] = [];
  const topicStats: TopicStat[] = [];
  for (const topic of topicList) {
    if (topic.attempted > 0 && topic.solved < topic.total) {
      focusAreas.push(topic.topic);
    }
    topicStats.push({
      topic: topic.topic,
      solved: topic.solved,
      total: topic.total,
      attempted: topic.attempted,
    });
  }

  const orderedDifficulties = [...difficultyOrder];
  for (const key of difficultyKeys) {
    if (!orderedDifficulties.includes(key)) {
      orderedDifficulties.push(key);
    }
  }
  const difficultyStats: DifficultyStat[] = [];
  for (const key of orderedDifficulties) {
    const row = difficulties[key];
    if (row === undefined || row.total === 0) {
      continue;
    }
    difficultyStats.push({
      difficulty: key,
      label: difficultyLabel(key),
      solved: row.solved,
      total: row.total,
    });
  }

  const byDay: Record<string, ActivityDay> = {};
  for (const day of input.days) {
    byDay[day.day] = day;
  }
  const activity: ActivityDay[] = [];
  let activeDays = 0;
  for (const day of recentDays(input.now, windowDays)) {
    const row = byDay[day];
    const point = {
      day,
      submissions: row?.submissions ?? 0,
      passes: row?.passes ?? 0,
    };
    if (point.submissions > 0) {
      activeDays += 1;
    }
    activity.push(point);
  }

  const passRate = input.attempts === 0 ? 0 : input.passes / input.attempts;

  return {
    lessonsCompleted,
    lessonsTotal: lessonOrder.length,
    problemsSolved,
    problemsTotal: input.problems.length,
    attempts: input.attempts,
    passRate,
    streak: streakFrom(input.days, input.now),
    activeDays,
    topics: topicStats,
    focusAreas,
    summary: describe(problemsSolved, input.problems.length, input.attempts, focusAreas),
    lessonsSkipped: skippedLessons.length,
    skippedLessons,
    activity,
    difficulties: difficultyStats,
    lessons: lessonList,
    improvements: improvementsFor(input.attempts, topicList, lessonList),
  };
};

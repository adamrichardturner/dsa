import type {
  AdminAuthSlice,
  AdminDayPoint,
  AdminOverview,
  AdminProgressBucket,
  AdminTopicStat,
  AdminUserRow,
  AdminUserTopic,
  OauthProvider,
} from "./models.js";
import { adminDeleteBlock } from "./admin-access.js";

export interface AdminOverviewUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly hasPassword: boolean;
  readonly providers: readonly OauthProvider[];
  readonly createdAt: string;
}

export interface AdminOverviewProblem {
  readonly id: string;
  readonly lessonId: string;
  readonly topic: string;
}

export interface AdminOverviewProblemStat {
  readonly userId: string;
  readonly problemId: string;
  readonly solved: boolean;
  readonly attempts: number;
}

export interface AdminOverviewActivity {
  readonly userId: string;
  readonly attempts: number;
  readonly passes: number;
  readonly lastActiveAt: string;
}

export interface AdminOverviewDay {
  readonly day: string;
  readonly submissions: number;
  readonly passes: number;
}

export interface AdminOverviewInput {
  readonly now: Date;
  readonly users: readonly AdminOverviewUser[];
  readonly problems: readonly AdminOverviewProblem[];
  readonly problemStats: readonly AdminOverviewProblemStat[];
  readonly activity: readonly AdminOverviewActivity[];
  readonly daily: readonly AdminOverviewDay[];
}

const dayMs = 86_400_000;
const windowDays = 30;

const recentDays = (now: Date, count: number): readonly string[] => {
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days: string[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    days.push(new Date(start - offset * dayMs).toISOString().slice(0, 10));
  }
  return days;
};

const withinDays = (iso: string, now: Date, days: number): boolean => {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return false;
  }
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const earliest = start - (days - 1) * dayMs;
  return time >= earliest && time < start + dayMs;
};

type AuthMethod = "password" | "google" | "github" | "apple" | "mixed";

const authMethod = (user: AdminOverviewUser): AuthMethod => {
  const google = user.providers.includes("google");
  const github = user.providers.includes("github");
  const apple = user.providers.includes("apple");
  const count =
    (user.hasPassword ? 1 : 0) + (google ? 1 : 0) + (github ? 1 : 0) + (apple ? 1 : 0);
  if (count > 1) {
    return "mixed";
  }
  if (google) {
    return "google";
  }
  if (github) {
    return "github";
  }
  if (apple) {
    return "apple";
  }
  return "password";
};

const methodLabels: Record<AuthMethod, string> = {
  password: "Email and password",
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  mixed: "More than one method",
};

const progressLabels = [
  "Not started",
  "Attempted",
  "1–25%",
  "26–50%",
  "51–75%",
  "76–99%",
  "Finished",
] as const;

type ProgressLabel = (typeof progressLabels)[number];

const progressLabel = (solved: number, total: number, attempts: number): ProgressLabel => {
  if (attempts === 0 || total === 0) {
    return "Not started";
  }
  const ratio = solved / total;
  if (ratio >= 1) {
    return "Finished";
  }
  if (ratio >= 0.75) {
    return "76–99%";
  }
  if (ratio >= 0.5) {
    return "51–75%";
  }
  if (ratio >= 0.25) {
    return "26–50%";
  }
  if (ratio > 0) {
    return "1–25%";
  }
  return "Attempted";
};

const average = (total: number, count: number): number => {
  if (count === 0) {
    return 0;
  }
  return Math.round((total / count) * 10) / 10;
};

/**
 * Rolls account, submission, and curriculum rows into the admin dashboard.
 * Day buckets are UTC, and the series always covers the last 30 days.
 */
export const buildAdminOverview = (input: AdminOverviewInput): AdminOverview => {
  const days = recentDays(input.now, windowDays);
  const activityByUser: Record<string, AdminOverviewActivity> = {};
  for (const row of input.activity) {
    activityByUser[row.userId] = row;
  }

  const statsByUser: Record<string, AdminOverviewProblemStat[]> = {};
  for (const stat of input.problemStats) {
    const existing = statsByUser[stat.userId] ?? [];
    existing.push(stat);
    statsByUser[stat.userId] = existing;
  }

  const topicTotals: Record<string, number> = {};
  const lessons: Record<string, true> = {};
  for (const problem of input.problems) {
    topicTotals[problem.topic] = (topicTotals[problem.topic] ?? 0) + 1;
    lessons[problem.lessonId] = true;
  }
  const lessonsTotal = Object.keys(lessons).length;
  const problemsTotal = input.problems.length;
  const topicNames = Object.keys(topicTotals);

  const topicAttempted: Record<string, number> = {};
  const topicSolved: Record<string, number> = {};
  const buckets: Record<ProgressLabel, number> = {
    "Not started": 0,
    Attempted: 0,
    "1–25%": 0,
    "26–50%": 0,
    "51–75%": 0,
    "76–99%": 0,
    Finished: 0,
  };

  let lessonsCompletedSum = 0;
  let problemsSolvedSum = 0;
  let submissionsTotal = 0;
  let passesTotal = 0;
  let activeLast7Days = 0;
  let activeLast30Days = 0;
  const users: AdminUserRow[] = [];

  for (const user of input.users) {
    const stats = statsByUser[user.id] ?? [];
    const activity = activityByUser[user.id];
    const attempts = activity?.attempts ?? 0;
    const passes = activity?.passes ?? 0;
    const lastActiveAt = activity?.lastActiveAt ?? null;
    submissionsTotal += attempts;
    passesTotal += passes;

    if (lastActiveAt !== null && withinDays(lastActiveAt, input.now, 7)) {
      activeLast7Days += 1;
    }
    if (lastActiveAt !== null && withinDays(lastActiveAt, input.now, 30)) {
      activeLast30Days += 1;
    }

    const solvedByProblem: Record<string, AdminOverviewProblemStat> = {};
    for (const stat of stats) {
      solvedByProblem[stat.problemId] = stat;
    }

    const lessonProgress: Record<string, { total: number; solved: number }> = {};
    const userTopics: Record<string, AdminUserTopic> = {};
    const touchedTopics: Record<string, { attempted: boolean; solved: boolean }> = {};
    let problemsSolved = 0;

    for (const problem of input.problems) {
      const stat = solvedByProblem[problem.id];
      const solved = stat?.solved ?? false;
      const attempted = (stat?.attempts ?? 0) > 0;
      if (solved) {
        problemsSolved += 1;
      }

      const lesson = lessonProgress[problem.lessonId] ?? { total: 0, solved: 0 };
      lessonProgress[problem.lessonId] = {
        total: lesson.total + 1,
        solved: lesson.solved + (solved ? 1 : 0),
      };

      const topic = userTopics[problem.topic] ?? { topic: problem.topic, solved: 0, total: 0 };
      userTopics[problem.topic] = {
        topic: problem.topic,
        solved: topic.solved + (solved ? 1 : 0),
        total: topic.total + 1,
      };

      const touch = touchedTopics[problem.topic] ?? { attempted: false, solved: false };
      touchedTopics[problem.topic] = {
        attempted: touch.attempted || attempted,
        solved: touch.solved || solved,
      };
    }

    for (const topic of topicNames) {
      const touch = touchedTopics[topic];
      if (touch?.attempted === true) {
        topicAttempted[topic] = (topicAttempted[topic] ?? 0) + 1;
      }
      if (touch?.solved === true) {
        topicSolved[topic] = (topicSolved[topic] ?? 0) + 1;
      }
    }

    let lessonsCompleted = 0;
    for (const lessonId of Object.keys(lessonProgress)) {
      const lesson = lessonProgress[lessonId];
      if (lesson !== undefined && lesson.total > 0 && lesson.solved === lesson.total) {
        lessonsCompleted += 1;
      }
    }

    lessonsCompletedSum += lessonsCompleted;
    problemsSolvedSum += problemsSolved;
    const label = progressLabel(problemsSolved, problemsTotal, attempts);
    buckets[label] += 1;

    const topics: AdminUserTopic[] = [];
    for (const topic of topicNames) {
      const row = userTopics[topic];
      if (row === undefined) {
        continue;
      }
      topics.push(row);
    }

    users.push({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      hasPassword: user.hasPassword,
      providers: user.providers,
      createdAt: user.createdAt,
      lastActiveAt,
      lessonsCompleted,
      lessonsTotal,
      problemsSolved,
      problemsTotal,
      attempts,
      passes,
      passRate: attempts === 0 ? 0 : passes / attempts,
      deletable: adminDeleteBlock(user.email) === null,
      topics,
    });
  }

  const signupCounts: Record<string, number> = {};
  for (const user of input.users) {
    const day = user.createdAt.slice(0, 10);
    signupCounts[day] = (signupCounts[day] ?? 0) + 1;
  }

  const dailyCounts: Record<string, AdminOverviewDay> = {};
  for (const row of input.daily) {
    dailyCounts[row.day] = row;
  }

  const series: AdminDayPoint[] = [];
  let signupsLast7Days = 0;
  let signupsLast30Days = 0;
  for (let index = 0; index < days.length; index += 1) {
    const day = days[index];
    if (day === undefined) {
      continue;
    }
    const signups = signupCounts[day] ?? 0;
    const activity = dailyCounts[day];
    signupsLast30Days += signups;
    if (index >= days.length - 7) {
      signupsLast7Days += signups;
    }
    series.push({
      day,
      signups,
      submissions: activity?.submissions ?? 0,
      passes: activity?.passes ?? 0,
    });
  }

  const methodCounts: Record<AuthMethod, number> = {
    password: 0,
    google: 0,
    github: 0,
    apple: 0,
    mixed: 0,
  };
  for (const user of input.users) {
    methodCounts[authMethod(user)] += 1;
  }

  const authMethods: AdminAuthSlice[] = [];
  const methodOrder: readonly AuthMethod[] = ["password", "google", "github", "apple", "mixed"];
  for (const method of methodOrder) {
    const count = methodCounts[method];
    if (count === 0) {
      continue;
    }
    authMethods.push({
      method,
      label: methodLabels[method],
      count,
    });
  }

  const topics: AdminTopicStat[] = [];
  for (const topic of topicNames) {
    topics.push({
      topic,
      problems: topicTotals[topic] ?? 0,
      attempters: topicAttempted[topic] ?? 0,
      solvers: topicSolved[topic] ?? 0,
    });
  }

  const progress: AdminProgressBucket[] = [];
  for (const label of progressLabels) {
    progress.push({ label, count: buckets[label] });
  }

  const usersTotal = input.users.length;

  return {
    usersTotal,
    activeLast7Days,
    activeLast30Days,
    signupsLast7Days,
    signupsLast30Days,
    submissionsTotal,
    passesTotal,
    passRate: submissionsTotal === 0 ? 0 : passesTotal / submissionsTotal,
    lessonsCompletedAverage: average(lessonsCompletedSum, usersTotal),
    problemsSolvedAverage: average(problemsSolvedSum, usersTotal),
    series,
    authMethods,
    topics,
    progress,
    users,
  };
};

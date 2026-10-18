import type { TestResult } from "./runner.js";

export type OauthProvider = "google" | "github";

export interface PublicUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly hasPassword: boolean;
  readonly providers: readonly OauthProvider[];
  readonly isAdmin: boolean;
}

export interface AuthResult {
  readonly token: string;
  readonly user: PublicUser;
}

export interface ExampleView {
  readonly call: string;
  readonly output: string;
}

export interface ProblemView {
  readonly id: string;
  readonly title: string;
  readonly promptMd: string;
  readonly starterCode: string;
  readonly difficulty: string;
  readonly topic: string;
  readonly examples: readonly ExampleView[];
  readonly bestStars: number;
  readonly solved: boolean;
  readonly attempts: number;
  readonly failedAttempts: number;
  readonly passingCode: string | null;
  readonly latestCode: string | null;
}

export interface LessonSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly estimatedMinutes: number;
  readonly completed: boolean;
  readonly skipped: boolean;
  readonly available: boolean;
  readonly stars: number;
  readonly maxStars: number;
}

export interface ModuleView {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly weekNumber: number;
  readonly lessons: readonly LessonSummary[];
}

export interface LessonView {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly contentMd: string;
  readonly estimatedMinutes: number;
  readonly weekNumber: number;
  readonly moduleTitle: string;
  readonly completed: boolean;
  readonly skipped: boolean;
  readonly previousSlug: string | null;
  readonly nextSlug: string | null;
  readonly nextAvailable: boolean;
  readonly problems: readonly ProblemView[];
}

export interface SubmissionView {
  readonly id: string;
  readonly passed: boolean;
  readonly stars: number;
  readonly testsPassed: number;
  readonly testsTotal: number;
  readonly feedback: string;
  readonly results: readonly TestResult[];
  readonly createdAt: string;
}

export interface TopicStat {
  readonly topic: string;
  readonly solved: number;
  readonly total: number;
  readonly attempted: number;
  readonly stars: number;
  readonly maxStars: number;
}

export interface AnalyticsView {
  readonly lessonsCompleted: number;
  readonly lessonsTotal: number;
  readonly problemsSolved: number;
  readonly problemsTotal: number;
  readonly stars: number;
  readonly maxStars: number;
  readonly attempts: number;
  readonly passRate: number;
  readonly topics: readonly TopicStat[];
  readonly focusAreas: readonly string[];
  readonly summary: string;
  readonly lessonsSkipped: number;
  readonly skippedLessons: readonly SkippedLesson[];
}

export interface SkippedLesson {
  readonly slug: string;
  readonly title: string;
}

export interface SkipResult {
  readonly slug: string;
  readonly skipped: boolean;
  readonly nextSlug: string | null;
  readonly nextAvailable: boolean;
}

export interface AdminDayPoint {
  readonly day: string;
  readonly signups: number;
  readonly submissions: number;
  readonly passes: number;
}

export interface AdminAuthSlice {
  readonly method: string;
  readonly label: string;
  readonly count: number;
}

export interface AdminTopicStat {
  readonly topic: string;
  readonly problems: number;
  readonly attempters: number;
  readonly solvers: number;
}

export interface AdminProgressBucket {
  readonly label: string;
  readonly count: number;
}

export interface AdminUserTopic {
  readonly topic: string;
  readonly solved: number;
  readonly total: number;
}

export interface AdminUserRow {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly hasPassword: boolean;
  readonly providers: readonly OauthProvider[];
  readonly createdAt: string;
  readonly lastActiveAt: string | null;
  readonly lessonsCompleted: number;
  readonly lessonsTotal: number;
  readonly problemsSolved: number;
  readonly problemsTotal: number;
  readonly stars: number;
  readonly maxStars: number;
  readonly attempts: number;
  readonly passes: number;
  readonly passRate: number;
  readonly deletable: boolean;
  readonly topics: readonly AdminUserTopic[];
}

export interface AdminOverview {
  readonly usersTotal: number;
  readonly activeLast7Days: number;
  readonly activeLast30Days: number;
  readonly signupsLast7Days: number;
  readonly signupsLast30Days: number;
  readonly submissionsTotal: number;
  readonly passesTotal: number;
  readonly passRate: number;
  readonly lessonsCompletedAverage: number;
  readonly problemsSolvedAverage: number;
  readonly series: readonly AdminDayPoint[];
  readonly authMethods: readonly AdminAuthSlice[];
  readonly topics: readonly AdminTopicStat[];
  readonly progress: readonly AdminProgressBucket[];
  readonly users: readonly AdminUserRow[];
}

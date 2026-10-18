export type OauthProvider = "google" | "github";

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly hasPassword: boolean;
  readonly providers: readonly OauthProvider[];
  readonly isAdmin: boolean;
}

export interface AuthPayload {
  readonly token: string;
  readonly user: User;
}

export interface LessonSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly estimatedMinutes: number;
  readonly completed: boolean;
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
  readonly passingCode: string | null;
  readonly latestCode: string | null;
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
  readonly previousSlug: string | null;
  readonly nextSlug: string | null;
  readonly nextAvailable: boolean;
  readonly problems: readonly ProblemView[];
}

export interface TestResultView {
  readonly name: string;
  readonly passed: boolean;
  readonly expected: string;
  readonly received: string;
  readonly error: string | null;
}

export type RunLineKind = "log" | "prompt" | "result" | "error";

export interface RunLineView {
  readonly kind: RunLineKind;
  readonly text: string;
}

export interface SubmissionView {
  readonly id: string;
  readonly passed: boolean;
  readonly stars: number;
  readonly testsPassed: number;
  readonly testsTotal: number;
  readonly feedback: string;
  readonly results: readonly TestResultView[];
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

export interface AdminUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly hasPassword: boolean;
  readonly providers: readonly string[];
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
  readonly users: readonly AdminUser[];
}

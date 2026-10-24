export type OauthProvider = "google" | "github" | "apple";

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly hasPassword: boolean;
  readonly providers: readonly OauthProvider[];
  readonly isAdmin: boolean;
  readonly auditMode: boolean;
  readonly onboardingCompleted: boolean;
  readonly emailVerified: boolean;
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
  readonly skipped: boolean;
  readonly available: boolean;
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

export interface GapPart {
  readonly kind: string;
  readonly text: string;
  readonly gapId: string | null;
}

export interface GapChip {
  readonly id: string;
  readonly text: string;
}

export interface GapPuzzle {
  readonly parts: readonly GapPart[];
  readonly chips: readonly GapChip[];
}

export interface ProblemView {
  readonly id: string;
  readonly title: string;
  readonly promptMd: string;
  readonly starterCode: string;
  readonly difficulty: string;
  readonly topic: string;
  readonly examples: readonly ExampleView[];
  readonly solved: boolean;
  readonly attempts: number;
  readonly failedAttempts: number;
  readonly passingCode: string | null;
  readonly latestCode: string | null;
  readonly gap: GapPuzzle | null;
}

export interface LessonView {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly contentMd: string;
  readonly bitesizeMd: string;
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

export interface GapGrade {
  readonly gapId: string;
  readonly correct: boolean;
}

export interface GapSubmission {
  readonly passed: boolean;
  readonly gaps: readonly GapGrade[];
  readonly submission: {
    readonly passed: boolean;
    readonly feedback: string;
    readonly testsPassed: number;
    readonly testsTotal: number;
  };
}

export interface GuideBlock {
  readonly kind: string;
  readonly text: string | null;
  readonly items: readonly string[] | null;
  readonly chart: string | null;
}

export interface SolutionGuide {
  readonly blocks: readonly GuideBlock[];
  readonly code: string;
  readonly reveals: readonly { readonly gapId: string; readonly text: string }[];
}

export interface SkipResult {
  readonly slug: string;
  readonly skipped: boolean;
  readonly nextSlug: string | null;
  readonly nextAvailable: boolean;
}

export interface RunLine {
  readonly kind: string;
  readonly text: string;
}

export interface TopicStat {
  readonly topic: string;
  readonly solved: number;
  readonly total: number;
  readonly attempted: number;
}

export interface AnalyticsView {
  readonly lessonsCompleted: number;
  readonly lessonsTotal: number;
  readonly problemsSolved: number;
  readonly problemsTotal: number;
  readonly attempts: number;
  readonly passRate: number;
  readonly lessonsSkipped: number;
  readonly summary: string;
  readonly skippedLessons: readonly { readonly slug: string; readonly title: string }[];
  readonly topics: readonly TopicStat[];
}

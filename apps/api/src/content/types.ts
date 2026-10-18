export type Difficulty = "easy" | "medium";

export type CompareMode = "exact" | "set";

export interface SeedTest {
  readonly name: string;
  readonly args: readonly unknown[];
  readonly expected: unknown;
  readonly public: boolean;
  readonly compare?: CompareMode;
}

export interface SeedProblem {
  readonly id: string;
  readonly title: string;
  readonly promptMd: string;
  readonly starterCode: string;
  readonly functionName: string;
  readonly difficulty: Difficulty;
  readonly topic: string;
  readonly disallow: readonly string[];
  readonly tests: readonly SeedTest[];
}

export interface SeedLesson {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly contentMd: string;
  readonly bitesizeMd: string;
  readonly estimatedMinutes: number;
  readonly problems: readonly SeedProblem[];
}

export interface SeedModule {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly weekNumber: number;
  readonly lessons: readonly SeedLesson[];
}

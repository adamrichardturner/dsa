import { Schema } from "effect";

export type ProgressClient = "web" | "mobile";

export const ProgressClientSchema = Schema.Literals(["web", "mobile"]);

export const progressClientFrom = (value: unknown): ProgressClient => {
  if (value === "mobile") {
    return "mobile";
  }
  return "web";
};

export interface ProgressTables {
  readonly submissions: "submissions" | "mobile_submissions";
  readonly drafts: "drafts" | "mobile_drafts";
  readonly lessonSkips: "lesson_skips" | "mobile_lesson_skips";
}

const webTables: ProgressTables = {
  submissions: "submissions",
  drafts: "drafts",
  lessonSkips: "lesson_skips",
};

const mobileTables: ProgressTables = {
  submissions: "mobile_submissions",
  drafts: "mobile_drafts",
  lessonSkips: "mobile_lesson_skips",
};

export const progressTables = (client: ProgressClient): ProgressTables => {
  if (client === "mobile") {
    return mobileTables;
  }
  return webTables;
};

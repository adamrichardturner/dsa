import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowReturn,
  planNotifications,
  returnQuietDays,
  type LessonProgress,
  type ProgressSnapshot,
  type StoredReturn,
} from "./notifications-plan.js";

const now = new Date("2026-10-28T12:00:00.000Z");

const lessons = (): LessonProgress[] => [
  { slug: "complexity", weekNumber: 1, moduleTitle: "Foundations", solved: 0, total: 2 },
  { slug: "arrays", weekNumber: 1, moduleTitle: "Foundations", solved: 0, total: 2 },
  { slug: "hash-maps", weekNumber: 2, moduleTitle: "Structures", solved: 0, total: 2 },
  { slug: "trees", weekNumber: 2, moduleTitle: "Structures", solved: 0, total: 2 },
];

const snapshot = (patch: Partial<ProgressSnapshot> = {}): ProgressSnapshot => ({
  now,
  lessonsCompleted: 0,
  lessonsTotal: 4,
  problemsSolved: 0,
  attempts: 0,
  streak: 0,
  lastActiveDay: null,
  lessons: lessons(),
  ...patch,
});

const solved = (
  source: readonly LessonProgress[],
  slugs: readonly string[],
): LessonProgress[] => {
  const done: Record<string, true> = {};
  for (const slug of slugs) {
    done[slug] = true;
  }
  const next: LessonProgress[] = [];
  for (const lesson of source) {
    if (done[lesson.slug] !== true) {
      next.push(lesson);
      continue;
    }
    next.push({ ...lesson, solved: lesson.total });
  }
  return next;
};

const keysOf = (value: ProgressSnapshot): string[] => {
  const keys: string[] = [];
  for (const note of planNotifications(value)) {
    keys.push(note.key);
  }
  return keys;
};

const titleFor = (value: ProgressSnapshot, keyPrefix: string): string | null => {
  for (const note of planNotifications(value)) {
    if (note.key.startsWith(keyPrefix)) {
      return note.title;
    }
  }
  return null;
};

describe("planNotifications", () => {
  it("stays quiet until there is something to mark", () => {
    assert.deepEqual(keysOf(snapshot()), []);
    assert.deepEqual(
      keysOf(snapshot({ streak: 5, lastActiveDay: "2026-10-01" })),
      [],
    );
  });

  it("records the first pass without a note per exercise", () => {
    const notes = planNotifications(
      snapshot({ problemsSolved: 1, attempts: 3, lessonsCompleted: 0 }),
    );
    assert.deepEqual(
      notes.map((note) => note.key),
      ["achievement:first-pass"],
    );
    assert.equal(notes[0]?.href, "/course/complexity");
    assert.equal(notes[0]?.kind, "achievement");
  });

  it("marks a finished lesson and a finished week once", () => {
    const value = snapshot({
      problemsSolved: 4,
      attempts: 5,
      lessonsCompleted: 2,
      lessons: solved(lessons(), ["complexity", "arrays"]),
    });
    assert.deepEqual(keysOf(value), [
      "achievement:first-pass",
      "achievement:first-lesson",
      "achievement:week:1",
      "achievement:halfway",
    ]);
    assert.equal(titleFor(value, "achievement:week:1"), "Week 1 finished");
  });

  it("does not emit a note for every lesson in a finished week", () => {
    const value = snapshot({
      problemsSolved: 6,
      attempts: 6,
      lessonsCompleted: 3,
      lessonsTotal: 4,
      lessons: solved(lessons(), ["complexity", "arrays", "hash-maps"]),
    });
    const keys = keysOf(value);
    assert.equal(keys.includes("achievement:week:2"), false);
    assert.equal(keys.filter((key) => key.startsWith("achievement:week:")).length, 1);
    assert.equal(keys.includes("achievement:course"), false);
  });

  it("replaces the halfway note when the course is finished", () => {
    const value = snapshot({
      problemsSolved: 8,
      attempts: 8,
      lessonsCompleted: 4,
      lessons: solved(lessons(), ["complexity", "arrays", "hash-maps", "trees"]),
    });
    assert.deepEqual(keysOf(value), [
      "achievement:first-pass",
      "achievement:first-lesson",
      "achievement:week:1",
      "achievement:week:2",
      "achievement:course",
    ]);
    const notes = planNotifications(value);
    const course = notes[notes.length - 1];
    assert.equal(course?.href, "/progress");
  });

  it("keeps streak notes to three days and seven days", () => {
    assert.deepEqual(
      keysOf(snapshot({ problemsSolved: 1, attempts: 2, streak: 2 })),
      ["achievement:first-pass"],
    );
    assert.deepEqual(
      keysOf(snapshot({ problemsSolved: 1, attempts: 4, streak: 3 })),
      ["achievement:first-pass", "achievement:streak:3"],
    );
    assert.deepEqual(
      keysOf(snapshot({ problemsSolved: 1, attempts: 8, streak: 7 })),
      ["achievement:first-pass", "achievement:streak:3", "achievement:streak:7"],
    );
  });

  it("sends one return note after a week away, and a quieter title after two", () => {
    const recent = snapshot({
      problemsSolved: 1,
      attempts: 2,
      lastActiveDay: "2026-10-22",
    });
    assert.equal(keysOf(recent).some((key) => key.startsWith("habit:return:")), false);

    const week = snapshot({
      problemsSolved: 1,
      attempts: 2,
      lastActiveDay: "2026-10-21",
    });
    assert.equal(titleFor(week, "habit:return:"), "A week since the last session");
    assert.equal(
      planNotifications(week).find((note) => note.kind === "habit")?.href,
      "/course/complexity",
    );

    const later = snapshot({
      problemsSolved: 1,
      attempts: 2,
      lastActiveDay: "2026-10-08",
    });
    assert.equal(titleFor(later, "habit:return:"), "A few weeks since the last session");
  });

  it("does not stack a return note on an active streak", () => {
    const value = snapshot({
      problemsSolved: 1,
      attempts: 4,
      streak: 3,
      lastActiveDay: "2026-10-01",
    });
    assert.equal(keysOf(value).some((key) => key.startsWith("habit:return:")), false);
    assert.equal(keysOf(value).includes("achievement:streak:3"), true);
  });
});

describe("allowReturn", () => {
  const nowDate = new Date("2026-10-28T12:00:00.000Z");

  const row = (key: string, dismissed: boolean, createdAt: string): StoredReturn => ({
    key,
    dismissed,
    createdAt,
  });

  it("allows the first absence", () => {
    assert.equal(allowReturn([], "habit:return:2026-10-21", nowDate), true);
  });

  it("keeps a single undismissed return note", () => {
    const existing = [row("habit:return:2026-10-01", false, "2026-10-08T00:00:00Z")];
    assert.equal(allowReturn(existing, "habit:return:2026-10-01", nowDate), true);
    assert.equal(allowReturn(existing, "habit:return:2026-10-21", nowDate), false);
  });

  it("does not repeat a dismissed absence", () => {
    const existing = [row("habit:return:2026-10-21", true, "2026-10-21T00:00:00Z")];
    assert.equal(allowReturn(existing, "habit:return:2026-10-21", nowDate), false);
  });

  it("waits two weeks before a later absence", () => {
    const recent = [row("habit:return:2026-10-01", true, "2026-10-25T00:00:00Z")];
    assert.equal(allowReturn(recent, "habit:return:2026-10-21", nowDate), false);

    const quiet = [row("habit:return:2026-10-01", true, "2026-10-01T00:00:00Z")];
    assert.equal(returnQuietDays, 14);
    assert.equal(allowReturn(quiet, "habit:return:2026-10-21", nowDate), true);
  });
});

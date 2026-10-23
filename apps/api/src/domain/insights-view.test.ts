import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildInsights, type InsightProblem } from "./insights-view.js";

const now = new Date("2026-10-18T15:00:00.000Z");

const problem = (
  id: string,
  lessonId: string,
  topic: string,
  slug: string,
  title: string,
  difficulty: string,
  lessonOrder: number,
): InsightProblem => ({
  id,
  lessonId,
  topic,
  difficulty,
  slug,
  title,
  weekNumber: 1,
  moduleTitle: "Foundations",
  moduleOrder: 1,
  lessonOrder,
});

describe("buildInsights", () => {
  it("points a new account at the first lesson", () => {
    const view = buildInsights({
      now,
      problems: [
        problem("p1", "l1", "Complexity", "complexity", "Time complexity and Big O", "easy", 1),
        problem("p2", "l2", "Arrays", "arrays", "Arrays", "easy", 2),
      ],
      stats: [],
      skippedLessonIds: [],
      attempts: 0,
      passes: 0,
      days: [],
    });

    assert.equal(view.attempts, 0);
    assert.equal(view.streak, 0);
    assert.equal(view.activeDays, 0);
    assert.equal(view.activity.length, 30);
    assert.equal(view.activity[0]?.day, "2026-09-19");
    assert.equal(view.activity[29]?.day, "2026-10-18");
    assert.equal(view.improvements.length, 1);
    assert.equal(view.improvements[0]?.kind, "start");
    assert.equal(view.improvements[0]?.href, "/course/complexity");
    assert.match(view.summary, /not submitted a solution yet/);
  });

  it("ranks a stuck topic ahead of a skip, and keeps a streak across today", () => {
    const view = buildInsights({
      now,
      problems: [
        problem("p1", "l1", "Arrays", "arrays", "Arrays", "easy", 1),
        problem("p2", "l1", "Arrays", "arrays", "Arrays", "medium", 1),
        problem("p3", "l2", "Two pointers", "two-pointers", "Two pointers", "easy", 2),
      ],
      stats: [
        { problemId: "p1", solved: true, attempts: 1 },
        { problemId: "p2", solved: false, attempts: 2 },
      ],
      skippedLessonIds: ["l2"],
      attempts: 3,
      passes: 1,
      days: [
        { day: "2026-10-17", submissions: 1, passes: 1 },
        { day: "2026-10-18", submissions: 2, passes: 0 },
      ],
    });

    assert.equal(view.problemsSolved, 1);
    assert.equal(view.lessonsCompleted, 0);
    assert.equal(view.passRate, 1 / 3);
    assert.equal(view.streak, 2);
    assert.equal(view.activeDays, 2);
    assert.equal(view.activity[28]?.submissions, 1);
    assert.equal(view.activity[29]?.passes, 0);
    assert.deepEqual(view.focusAreas, ["Arrays"]);
    assert.equal(view.improvements[0]?.kind, "stuck");
    assert.equal(view.improvements[0]?.href, "/course/arrays");
    assert.match(view.improvements[0]?.detail ?? "", /1 of 2 exercises is solved/);
    assert.equal(view.improvements[1]?.kind, "skipped");
    assert.equal(view.lessonsSkipped, 1);
    assert.equal(view.lessons[1]?.skipped, true);
    assert.equal(view.difficulties[0]?.solved, 1);
    assert.equal(view.difficulties[1]?.difficulty, "medium");
    assert.match(view.summary, /Spend the next session on Arrays/);
  });

  it("counts a streak from yesterday when today is still empty", () => {
    const view = buildInsights({
      now,
      problems: [
        problem("p1", "l1", "Arrays", "arrays", "Arrays", "easy", 1),
        problem("p2", "l2", "Hash maps", "hash-maps", "Hash maps", "easy", 2),
      ],
      stats: [{ problemId: "p1", solved: true, attempts: 2 }],
      skippedLessonIds: [],
      attempts: 2,
      passes: 1,
      days: [
        { day: "2026-10-16", submissions: 1, passes: 0 },
        { day: "2026-10-17", submissions: 1, passes: 1 },
      ],
    });

    assert.equal(view.streak, 2);
    assert.equal(view.lessonsCompleted, 1);
    assert.equal(view.improvements[0]?.kind, "continue");
    assert.equal(view.improvements[0]?.href, "/course/hash-maps");
  });

  it("treats a finished lesson as complete after several attempts", () => {
    const view = buildInsights({
      now,
      problems: [problem("p1", "l1", "Arrays", "arrays", "Arrays", "easy", 1)],
      stats: [{ problemId: "p1", solved: true, attempts: 4 }],
      skippedLessonIds: ["l1"],
      attempts: 4,
      passes: 1,
      days: [{ day: "2026-10-18", submissions: 4, passes: 1 }],
    });

    assert.equal(view.lessons[0]?.skipped, false);
    assert.equal(view.lessonsSkipped, 0);
    assert.equal(view.improvements.length, 0);
    assert.match(view.summary, /solved every exercise/);
  });

  it("stays quiet when every exercise is solved", () => {
    const view = buildInsights({
      now,
      problems: [
        problem("p1", "l1", "Arrays", "arrays", "Arrays", "easy", 1),
        problem("p2", "l2", "Hash maps", "hash-maps", "Hash maps", "medium", 2),
      ],
      stats: [
        { problemId: "p1", solved: true, attempts: 1 },
        { problemId: "p2", solved: true, attempts: 1 },
      ],
      skippedLessonIds: [],
      attempts: 2,
      passes: 2,
      days: [],
    });

    assert.equal(view.improvements.length, 0);
    assert.equal(view.focusAreas.length, 0);
  });

  it("does not treat a gap as a streak", () => {
    const view = buildInsights({
      now,
      problems: [
        problem("p1", "l1", "Arrays", "arrays", "Arrays", "easy", 1),
        problem("p2", "l2", "Hash maps", "hash-maps", "Hash maps", "easy", 2),
      ],
      stats: [
        { problemId: "p1", solved: false, attempts: 1 },
        { problemId: "p2", solved: false, attempts: 1 },
      ],
      skippedLessonIds: [],
      attempts: 2,
      passes: 0,
      days: [
        { day: "2026-10-16", submissions: 1, passes: 0 },
        { day: "2026-10-18", submissions: 1, passes: 0 },
      ],
    });

    assert.equal(view.streak, 1);
    assert.match(view.summary, /useful order/);
  });
});

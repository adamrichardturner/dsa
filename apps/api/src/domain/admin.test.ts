import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Unauthorized } from "./errors.js";
import { adminDeleteBlock, isAdminEmail } from "./admin-access.js";
import { buildAdminOverview } from "./admin-overview.js";
import { classifyError } from "../graphql/public-error.js";

const now = new Date("2026-10-18T15:00:00.000Z");

describe("admin access", () => {
  it("recognises only the admin email", () => {
    assert.equal(isAdminEmail("hello@adamrichardturner.dev"), true);
    assert.equal(isAdminEmail("  Hello@AdamRichardTurner.dev "), true);
    assert.equal(isAdminEmail("someone@example.com"), false);
  });

  it("refuses to delete the admin account", () => {
    assert.equal(
      adminDeleteBlock("hello@adamrichardturner.dev"),
      "The admin account cannot be deleted from here.",
    );
    assert.equal(adminDeleteBlock("student@example.com"), null);
  });

  it("publishes a distinct code when the caller is not an admin", () => {
    assert.equal(
      classifyError(
        new Unauthorized({ message: "You do not have access to the admin panel." }),
      ),
      "ADMIN_FORBIDDEN",
    );
  });
});

describe("admin overview", () => {
  it("summarises accounts, progress, and the last 30 days", () => {
    const overview = buildAdminOverview({
      now,
      users: [
        {
          id: "ada",
          email: "ada@example.com",
          name: "Ada",
          avatarUrl: null,
          hasPassword: true,
          providers: ["google"],
          createdAt: "2026-10-18T09:00:00Z",
        },
        {
          id: "grace",
          email: "grace@example.com",
          name: "Grace",
          avatarUrl: null,
          hasPassword: false,
          providers: ["github"],
          createdAt: "2026-09-01T09:00:00Z",
        },
      ],
      problems: [
        { id: "p1", lessonId: "l1", topic: "Arrays" },
        { id: "p2", lessonId: "l1", topic: "Arrays" },
        { id: "p3", lessonId: "l2", topic: "Graphs" },
      ],
      problemStats: [
        { userId: "ada", problemId: "p1", solved: true, attempts: 2 },
        { userId: "ada", problemId: "p2", solved: true, attempts: 1 },
        { userId: "ada", problemId: "p3", solved: false, attempts: 1 },
      ],
      activity: [
        {
          userId: "ada",
          attempts: 4,
          passes: 3,
          lastActiveAt: "2026-10-17T12:00:00Z",
        },
      ],
      daily: [{ day: "2026-10-17", submissions: 4, passes: 3 }],
    });

    assert.equal(overview.usersTotal, 2);
    assert.equal(overview.series.length, 30);
    assert.equal(overview.series[29]?.day, "2026-10-18");
    assert.equal(overview.series[29]?.signups, 1);
    assert.equal(overview.series[28]?.submissions, 4);
    assert.equal(overview.series[28]?.passes, 3);
    assert.equal(overview.signupsLast7Days, 1);
    assert.equal(overview.signupsLast30Days, 1);
    assert.equal(overview.activeLast7Days, 1);
    assert.equal(overview.activeLast30Days, 1);
    assert.equal(overview.submissionsTotal, 4);
    assert.equal(overview.passesTotal, 3);
    assert.equal(overview.passRate, 0.75);
    assert.equal(overview.authMethods.length, 2);
    assert.equal(overview.authMethods[0]?.method, "github");
    assert.equal(overview.authMethods[1]?.method, "mixed");

    const ada = overview.users[0];
    assert.ok(ada);
    assert.equal(ada.lessonsCompleted, 1);
    assert.equal(ada.lessonsTotal, 2);
    assert.equal(ada.problemsSolved, 2);
    assert.equal(ada.topics[0]?.topic, "Arrays");
    assert.equal(ada.topics[0]?.solved, 2);
    assert.equal(ada.deletable, true);

    const grace = overview.users[1];
    assert.ok(grace);
    assert.equal(grace.problemsSolved, 0);
    assert.equal(grace.lastActiveAt, null);

    const notStarted = overview.progress.find((bucket) => bucket.label === "Not started");
    const inRange = overview.progress.find((bucket) => bucket.label === "51–75%");
    assert.equal(notStarted?.count, 1);
    assert.equal(inRange?.count, 1);
    assert.equal(overview.topics[0]?.solvers, 1);
    assert.equal(overview.topics[1]?.attempters, 1);
    assert.equal(overview.topics[1]?.solvers, 0);
    assert.equal(overview.lessonsCompletedAverage, 0.5);
    assert.equal(overview.problemsSolvedAverage, 1);
  });
});

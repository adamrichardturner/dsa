import assert from "node:assert/strict";
import test from "node:test";
import {
  progressClientFrom,
  progressTables,
  type ProgressClient,
} from "./progress-client.js";

interface PassBook {
  submissions: Record<string, boolean>;
  mobile_submissions: Record<string, boolean>;
}

const emptyBook = (): PassBook => ({
  submissions: {},
  mobile_submissions: {},
});

const writePass = (book: PassBook, client: ProgressClient, problemId: string): void => {
  const table = progressTables(client).submissions;
  if (table === "mobile_submissions") {
    book.mobile_submissions[problemId] = true;
    return;
  }
  book.submissions[problemId] = true;
};

const readSolved = (book: PassBook, client: ProgressClient, problemId: string): boolean => {
  const table = progressTables(client).submissions;
  if (table === "mobile_submissions") {
    return book.mobile_submissions[problemId] ?? false;
  }
  return book.submissions[problemId] ?? false;
};

test("a mobile pass does not mark the web problem solved and a web pass does not mark the mobile problem solved", () => {
  const book = emptyBook();

  writePass(book, "mobile", "two-pointers");
  assert.equal(readSolved(book, "web", "two-pointers"), false);
  assert.equal(readSolved(book, "mobile", "two-pointers"), true);

  writePass(book, "web", "binary-search");
  assert.equal(readSolved(book, "mobile", "binary-search"), false);
  assert.equal(readSolved(book, "web", "binary-search"), true);
  assert.equal(readSolved(book, "mobile", "two-pointers"), true);
  assert.equal(readSolved(book, "web", "two-pointers"), false);
});

test("an omitted or unknown client uses the web progress tables", () => {
  assert.equal(progressClientFrom(undefined), "web");
  assert.equal(progressClientFrom(null), "web");
  assert.equal(progressClientFrom(""), "web");
  assert.equal(progressClientFrom("phone"), "web");
  assert.equal(progressClientFrom("mobile"), "mobile");

  const web = progressTables("web");
  const mobile = progressTables("mobile");
  assert.equal(web.submissions, "submissions");
  assert.equal(web.drafts, "drafts");
  assert.equal(web.lessonSkips, "lesson_skips");
  assert.equal(mobile.submissions, "mobile_submissions");
  assert.equal(mobile.drafts, "mobile_drafts");
  assert.equal(mobile.lessonSkips, "mobile_lesson_skips");
  assert.notEqual(web.submissions, mobile.submissions);
  assert.notEqual(web.drafts, mobile.drafts);
  assert.notEqual(web.lessonSkips, mobile.lessonSkips);
});

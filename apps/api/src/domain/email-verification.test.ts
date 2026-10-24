import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decideVerificationToken,
  hashVerificationToken,
  issueVerification,
  planVerifyLogin,
  verificationLifetimeMs,
  verificationUrl,
  type IssuedVerification,
} from "./email-verification.js";

const issuedAtMs = Date.parse("2026-10-24T10:00:00.000Z");

const issue = (token = "raw-token-value"): IssuedVerification =>
  issueVerification({
    userId: "user-1",
    token,
    issuedAtMs,
  });

describe("email verification tokens", () => {
  it("issues a hashed single-use token that expires later", () => {
    const token = "plain-token";
    const record = issue(token);
    assert.equal(record.userId, "user-1");
    assert.equal(record.consumed, false);
    assert.equal(record.expiresAtMs - issuedAtMs, verificationLifetimeMs);
    assert.equal(record.tokenHash, hashVerificationToken(token));
    assert.equal(record.tokenHash === token, false);
  });

  it("rejects an expired token", () => {
    const record = issue();
    const decision = decideVerificationToken(record, record.expiresAtMs);
    assert.equal(decision.type, "reject");
    if (decision.type === "reject") {
      assert.equal(decision.reason, "expired");
    }
  });

  it("rejects a token that was already used", () => {
    const record = issue();
    const used: IssuedVerification = {
      userId: record.userId,
      tokenHash: record.tokenHash,
      expiresAtMs: record.expiresAtMs,
      consumed: true,
    };
    const decision = decideVerificationToken(used, issuedAtMs);
    assert.equal(decision.type, "reject");
    if (decision.type === "reject") {
      assert.equal(decision.reason, "used");
    }
  });

  it("logs the account in when the token is still valid", () => {
    const record = issue();
    const plan = planVerifyLogin(record, record.expiresAtMs - 1);
    assert.deepEqual(plan, { type: "login", userId: "user-1" });
  });

  it("does not log the account in when the token is missing, expired, or reused", () => {
    assert.equal(planVerifyLogin(null, issuedAtMs).type, "reject");
    const record = issue();
    assert.equal(planVerifyLogin(record, record.expiresAtMs).type, "reject");
    const used: IssuedVerification = {
      userId: record.userId,
      tokenHash: record.tokenHash,
      expiresAtMs: record.expiresAtMs,
      consumed: true,
    };
    const again = planVerifyLogin(used, issuedAtMs);
    assert.equal(again.type, "reject");
    if (again.type === "reject") {
      assert.equal(again.reason, "used");
    }
  });

  it("puts the token in a same-site verification url", () => {
    assert.equal(
      verificationUrl("https://datastructuresandalgorithms.com", "abc def"),
      "https://datastructuresandalgorithms.com/verify-email?token=abc%20def",
    );
  });
});

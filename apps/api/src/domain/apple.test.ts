import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { appleNameFromUser, appleNonceMatches, readAppleAccount } from "./apple.js";

describe("Apple sign-in", () => {
  it("matches the nonce Apple puts in the identity token", () => {
    const raw = "raw-nonce-value";
    const digest = createHash("sha256").update(raw).digest("hex");
    assert.equal(appleNonceMatches(digest, raw), true);
    assert.equal(appleNonceMatches(digest.toUpperCase(), raw), true);
    assert.equal(appleNonceMatches(raw, raw), false);
    assert.equal(appleNonceMatches(digest, "short"), false);
  });

  it("reads the name Apple sends once, on the first sign-in", () => {
    assert.equal(
      appleNameFromUser(JSON.stringify({ name: { firstName: "Ada", lastName: "Lovelace" } })),
      "Ada Lovelace",
    );
    assert.equal(appleNameFromUser("not-json"), null);
    assert.equal(appleNameFromUser(null), null);
  });

  it("keeps a verified Apple email and ignores an unverified one", () => {
    const verified = readAppleAccount(
      { sub: "apple-subject", email: "Ada@Example.com", email_verified: "true" },
      "Ada Lovelace",
    );
    assert.ok(verified !== null);
    if (verified === null) {
      return;
    }
    assert.equal(verified.providerUserId, "apple-subject");
    assert.equal(verified.primaryEmail, "ada@example.com");
    assert.deepEqual(verified.verifiedEmails, ["ada@example.com"]);
    assert.equal(verified.name, "Ada Lovelace");

    const unverified = readAppleAccount(
      { sub: "apple-subject", email: "ada@example.com", email_verified: "false" },
      null,
    );
    assert.ok(unverified !== null);
    if (unverified === null) {
      return;
    }
    assert.deepEqual(unverified.verifiedEmails, []);
  });
});
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { appleNameFromUser, appleNonceMatches, readAppleAccount } from "./apple.js";
import { planOAuthAccount, type OauthAccountMatch } from "./oauth-plan.js";

const existingUser = (id: string, email: string, providerLinked = false): OauthAccountMatch => ({
  id,
  email,
  providerLinked,
});

const planApple = (
  payload: unknown,
  identity: { readonly userId: string } | null,
  users: readonly OauthAccountMatch[],
  name: string | null = null,
) => {
  const account = readAppleAccount(payload, name);
  assert.ok(account !== null);
  if (account === null) {
    throw new Error("Expected a readable Apple identity token.");
  }
  return planOAuthAccount(account, identity, users);
};

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
    assert.equal(unverified.primaryEmail, null);
  });
});

describe("Apple account linking", () => {
  it("signs into the account already linked to this Apple subject", () => {
    const plan = planApple({ sub: "apple-subject" }, { userId: "user-a" }, [
      existingUser("user-b", "other@example.com"),
    ]);
    assert.deepEqual(plan, { type: "use-identity" });
  });

  it("still finds that account when a later Apple sign-in omits the email", () => {
    const plan = planApple({ sub: "apple-subject" }, { userId: "user-a" }, []);
    assert.deepEqual(plan, { type: "use-identity" });
  });

  it("links a verified Apple email to the existing account instead of creating one", () => {
    const plan = planApple(
      { sub: "apple-subject", email: "Ada@Example.com", email_verified: true },
      null,
      [existingUser("user-a", "ada@example.com")],
      "Ada Lovelace",
    );
    assert.deepEqual(plan, { type: "link", userId: "user-a" });
  });

  it("creates an account when the verified Apple email matches nobody", () => {
    const plan = planApple(
      { sub: "apple-subject", email: "ada@example.com", email_verified: "true" },
      null,
      [],
      "Ada Lovelace",
    );
    assert.deepEqual(plan, {
      type: "create",
      email: "ada@example.com",
      name: "Ada Lovelace",
    });
  });

  it("does not link or create from an unverified Apple email", () => {
    const plan = planApple(
      { sub: "apple-subject", email: "ada@example.com", email_verified: "false" },
      null,
      [existingUser("user-a", "ada@example.com")],
    );
    assert.deepEqual(plan, { type: "reject", code: "email" });
  });

  it("does not link when the token includes an email but no verified claim", () => {
    const plan = planApple({ sub: "apple-subject", email: "ada@example.com" }, null, [
      existingUser("user-a", "ada@example.com"),
    ]);
    assert.deepEqual(plan, { type: "reject", code: "email" });
  });

  it("links a private relay address the same way as any other verified email", () => {
    const relay = "hide.me@privaterelay.appleid.com";
    const linked = planApple(
      { sub: "apple-subject", email: relay, email_verified: true, is_private_email: true },
      null,
      [existingUser("user-a", relay)],
    );
    assert.deepEqual(linked, { type: "link", userId: "user-a" });

    const created = planApple(
      { sub: "apple-subject", email: relay, email_verified: "true", is_private_email: "true" },
      null,
      [],
    );
    assert.deepEqual(created, {
      type: "create",
      email: relay,
      name: "hide.me",
    });
  });

  it("does not create a duplicate when that email is already linked to a different Apple subject", () => {
    const plan = planApple(
      { sub: "other-apple-subject", email: "ada@example.com", email_verified: true },
      null,
      [existingUser("user-a", "ada@example.com", true)],
    );
    assert.deepEqual(plan, { type: "reject", code: "linked" });
  });

  it("does not open a second account when this Apple subject is already linked", () => {
    const plan = planApple(
      { sub: "apple-subject", email: "other@example.com", email_verified: true },
      { userId: "user-a" },
      [existingUser("user-b", "other@example.com")],
    );
    assert.deepEqual(plan, { type: "use-identity" });
  });
});
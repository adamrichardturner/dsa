import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { verificationLandingPath } from "./email-verification.js";
import {
  allowedWebOrigin,
  callbackUrl,
  identityEmail,
  mobileOriginSentinel,
  oauthResultRedirect,
  oauthSkipsEmailVerification,
  planOAuthAccount,
  readGitHubAccount,
  readGoogleAccount,
  safeReturnPath,
  type OauthAccountMatch,
  type ProviderAccount,
} from "./oauth-plan.js";

const account = (overrides: Partial<ProviderAccount> = {}): ProviderAccount => ({
  providerUserId: "google-subject",
  name: "Ada Lovelace",
  avatarUrl: null,
  verifiedEmails: ["ada@example.com"],
  primaryEmail: "ada@example.com",
  emailsKnown: true,
  ...overrides,
});

const user = (id: string, email: string, providerLinked = false): OauthAccountMatch => ({
  id,
  email,
  providerLinked,
});

describe("planOAuthAccount", () => {
  it("signs into an existing provider subject even when the email changed", () => {
    const plan = planOAuthAccount(
      account({
        verifiedEmails: ["new@example.com"],
        primaryEmail: "new@example.com",
      }),
      { userId: "user-a" },
      [user("user-b", "new@example.com")],
    );
    assert.deepEqual(plan, { type: "use-identity" });
  });

  it("rejects a profile with no verified email", () => {
    const plan = planOAuthAccount(account({ verifiedEmails: [], primaryEmail: null, emailsKnown: true }), null, []);
    assert.deepEqual(plan, { type: "reject", code: "email" });
  });

  it("creates an account from a verified email", () => {
    const plan = planOAuthAccount(account(), null, []);
    assert.deepEqual(plan, {
      type: "create",
      email: "ada@example.com",
      name: "Ada Lovelace",
    });
  });

  it("links a verified email to the existing password account", () => {
    const plan = planOAuthAccount(account(), null, [user("user-a", "Ada@Example.com")]);
    assert.deepEqual(plan, { type: "link", userId: "user-a" });
  });

  it("keeps the primary email's account when another verified email matches someone else", () => {
    const plan = planOAuthAccount(
      account({
        verifiedEmails: ["ada@example.com", "grace@example.com"],
        primaryEmail: "ada@example.com",
      }),
      null,
      [user("user-a", "ada@example.com"), user("user-b", "grace@example.com")],
    );
    assert.deepEqual(plan, { type: "link", userId: "user-a" });
  });

  it("links a secondary email when the primary matches nobody", () => {
    const plan = planOAuthAccount(
      account({
        verifiedEmails: ["ada@example.com", "grace@example.com"],
        primaryEmail: "ada@example.com",
      }),
      null,
      [user("user-b", "grace@example.com")],
    );
    assert.deepEqual(plan, { type: "link", userId: "user-b" });
  });

  it("refuses to guess when verified emails match more than one account", () => {
    const plan = planOAuthAccount(
      account({
        verifiedEmails: ["ada@example.com", "grace@example.com"],
        primaryEmail: null,
      }),
      null,
      [user("user-a", "ada@example.com"), user("user-b", "grace@example.com")],
    );
    assert.deepEqual(plan, { type: "reject", code: "conflict" });
  });

  it("does not replace a provider already linked on the matched account", () => {
    const plan = planOAuthAccount(account(), null, [user("user-a", "ada@example.com", true)]);
    assert.deepEqual(plan, { type: "reject", code: "linked" });
  });

  it("prefers a real email over a GitHub noreply address", () => {
    const profile = account({
      verifiedEmails: ["123+ada@users.noreply.github.com", "ada@example.com"],
      primaryEmail: "123+ada@users.noreply.github.com",
    });
    const plan = planOAuthAccount(profile, null, []);
    assert.deepEqual(plan, {
      type: "create",
      email: "ada@example.com",
      name: "Ada Lovelace",
    });
    assert.equal(identityEmail(profile), "ada@example.com");
  });

  it("creates with a noreply address when that is the only verified email", () => {
    const plan = planOAuthAccount(
      account({
        verifiedEmails: ["123+ada@users.noreply.github.com"],
        primaryEmail: "123+ada@users.noreply.github.com",
        name: "",
      }),
      null,
      [],
    );
    assert.equal(plan.type, "create");
    if (plan.type !== "create") {
      return;
    }
    assert.equal(plan.email, "123+ada@users.noreply.github.com");
    assert.equal(plan.name, "123 ada");
  });

  it("ignores a primary email that was not verified", () => {
    const plan = planOAuthAccount(
      account({
        verifiedEmails: ["ada@example.com"],
        primaryEmail: "other@example.com",
      }),
      null,
      [user("user-b", "other@example.com")],
    );
    assert.equal(plan.type, "create");
    if (plan.type !== "create") {
      return;
    }
    assert.equal(plan.email, "ada@example.com");
  });
});

describe("provider profiles", () => {
  it("reads a verified Google profile and drops an unsafe picture", () => {
    const profile = readGoogleAccount({
      sub: "sub-1",
      email: "Ada@Example.com",
      email_verified: true,
      name: "Ada",
      picture: "javascript:alert(1)",
    });
    assert.deepEqual(profile, {
      providerUserId: "sub-1",
      name: "Ada",
      avatarUrl: null,
      verifiedEmails: ["ada@example.com"],
      primaryEmail: "ada@example.com",
      emailsKnown: true,
    });
  });

  it("does not treat an unverified Google email as verified", () => {
    const profile = readGoogleAccount({
      sub: "sub-1",
      email: "ada@example.com",
      email_verified: false,
      name: "Ada",
    });
    assert.equal(profile?.verifiedEmails.length, 0);
    assert.equal(profile?.emailsKnown, true);
  });

  it("accepts Google's string form of email_verified", () => {
    const profile = readGoogleAccount({
      sub: "sub-1",
      email: "ada@example.com",
      email_verified: "true",
    });
    assert.deepEqual(profile?.verifiedEmails, ["ada@example.com"]);
  });

  it("rejects a Google payload without a subject", () => {
    assert.equal(readGoogleAccount({ email: "ada@example.com", email_verified: true }), null);
  });

  it("uses the verified GitHub primary email and ignores unverified ones", () => {
    const profile = readGitHubAccount(
      {
        id: 42,
        login: "ada",
        name: null,
        avatar_url: "https://avatars.githubusercontent.com/u/42",
      },
      [
        {
          email: "hidden@users.noreply.github.com",
          primary: true,
          verified: false,
        },
        { email: "Ada@Example.com", primary: false, verified: true },
        { email: "not-an-email", primary: false, verified: true },
      ],
    );
    assert.equal(profile?.providerUserId, "42");
    assert.equal(profile?.name, "ada");
    assert.equal(profile?.emailsKnown, true);
    assert.deepEqual(profile?.verifiedEmails, ["ada@example.com"]);
    assert.equal(profile?.primaryEmail, null);
    assert.equal(profile?.avatarUrl, "https://avatars.githubusercontent.com/u/42");
  });

  it("keeps a GitHub subject when the email API did not answer", () => {
    const profile = readGitHubAccount({ id: 7, login: "ada", name: "Ada" }, null);
    assert.equal(profile?.emailsKnown, false);
    assert.deepEqual(profile?.verifiedEmails, []);
    assert.equal(profile?.providerUserId, "7");
  });

  it("skips a second verification email when the provider already verified the address", () => {
    const verified = account();
    assert.equal(oauthSkipsEmailVerification(verified), true);
    const plan = planOAuthAccount(verified, null, []);
    assert.equal(plan.type, "create");

    const missing = account({
      verifiedEmails: [],
      primaryEmail: null,
      emailsKnown: true,
    });
    assert.equal(oauthSkipsEmailVerification(missing), false);
    assert.deepEqual(planOAuthAccount(missing, null, []), {
      type: "reject",
      code: "email",
    });
  });
});

describe("redirect safety", () => {
  it("keeps same-site paths and rejects open redirects", () => {
    assert.equal(safeReturnPath(null), "/course");
    assert.equal(safeReturnPath(verificationLandingPath), "/course");
    assert.equal(safeReturnPath("/course/lists"), "/course/lists");
    assert.equal(safeReturnPath("https://evil.example/phish"), "/course");
    assert.equal(safeReturnPath("//evil.example"), "/course");
    assert.equal(safeReturnPath("/%2F%2Fevil.example"), "/course");
    assert.equal(safeReturnPath("/\\evil.example"), "/course");
  });

  it("uses an allowlisted web origin", () => {
    const allowed = ["http://localhost:3000", "https://preview.example"];
    assert.equal(allowedWebOrigin("https://preview.example", allowed), "https://preview.example");
    assert.equal(allowedWebOrigin("https://evil.example", allowed), "http://localhost:3000");
    assert.equal(allowedWebOrigin(null, allowed), "http://localhost:3000");
    assert.equal(allowedWebOrigin("http://localhost:3000", []), null);
  });

  it("builds the provider callback from the API origin", () => {
    assert.equal(callbackUrl("http://localhost:4000", "google"), "http://localhost:4000/auth/google/callback");
    assert.equal(callbackUrl("http://localhost:4000", "apple"), "http://localhost:4000/auth/apple/callback");
    assert.equal(callbackUrl("not a url", "github"), null);
  });

  it("sends a mobile sign-in back to the app scheme", () => {
    const web = oauthResultRedirect("http://localhost:3000", "dsa", {
      code: "abc",
      returnTo: "/course",
    });
    assert.equal(web, "http://localhost:3000/auth/callback?code=abc&returnTo=%2Fcourse");
    const mobile = oauthResultRedirect(mobileOriginSentinel, "dsa", {
      error: "expired",
      provider: "google",
    });
    assert.equal(mobile, "dsa://auth/callback?error=expired&provider=google");
    assert.equal(oauthResultRedirect(mobileOriginSentinel, "Bad Scheme", { code: "abc" }), null);
  });
});

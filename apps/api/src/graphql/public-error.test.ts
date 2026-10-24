import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GraphQLError } from "graphql";
import { unverifiedSignInMessage } from "../domain/email-verification.js";
import { BadInput, OauthFlowError, Unexpected } from "../domain/errors.js";
import { classifyError, maskPublicError, maskValidationResult, publicGraphQLError } from "./public-error.js";

const serialized = (error: GraphQLError): string => JSON.stringify(error.toJSON());

describe("public GraphQL errors", () => {
  it("replaces a known validation error with a code and a fixed message", () => {
    const error = maskPublicError(new BadInput({ message: "Enter a valid email address." }), "Unexpected error.", true);
    assert.equal(error.message, "Request failed.");
    assert.equal(error.extensions.code, "BAD_EMAIL");
    assert.equal(serialized(error).includes("Enter a valid email"), false);
  });

  it("keeps an actionable failure that was raised as an unexpected error", () => {
    assert.equal(classifyError(new Unexpected({ message: "Write a solution before submitting." })), "SOLUTION_EMPTY");
  });

  it("hides internal failure text", () => {
    const secret = "relation users does not exist scrypt$salt$hash";
    const error = maskPublicError(new Unexpected({ message: secret }), "Unexpected error.", true);
    assert.equal(error.extensions.code, "UNEXPECTED");
    assert.equal(error.message, "Request failed.");
    assert.equal(serialized(error).includes("users"), false);
    assert.equal(serialized(error).includes("scrypt"), false);
  });

  it("uses the OAuth flow code and drops the provider message", () => {
    const secret = "token exchange body from the provider";
    const error = maskPublicError(new OauthFlowError({ code: "linked", message: secret }), "Unexpected error.");
    assert.equal(error.extensions.code, "OAUTH_LINKED");
    assert.equal(serialized(error).includes("token exchange"), false);
  });

  it("reads a code already published by the API", () => {
    const published = publicGraphQLError("EMAIL_TAKEN");
    assert.equal(maskPublicError(published, "Unexpected error."), published);
  });

  it("recovers a code wrapped around the original error", () => {
    const wrapped = new GraphQLError("Request failed.", {
      originalError: publicGraphQLError("LESSON_LOCKED"),
    });
    assert.equal(classifyError(wrapped), "LESSON_LOCKED");
    const masked = maskPublicError(wrapped, "Unexpected error.", true);
    assert.equal(masked.extensions.code, "LESSON_LOCKED");
    assert.equal(masked.originalError, undefined);
  });

  it("publishes a code when sign-in is waiting on email verification", () => {
    const error = maskPublicError(new BadInput({ message: unverifiedSignInMessage }), "Unexpected error.", true);
    assert.equal(error.extensions.code, "EMAIL_UNVERIFIED");
    assert.equal(serialized(error).includes("inbox"), false);
  });

  it("classifies plain resolver errors by their known message", () => {
    assert.equal(classifyError(new Error("Missing code.")), "MISSING_CODE");
    assert.equal(classifyError(new Error("syntax error at or near")), "UNEXPECTED");
  });

  it("strips schema details from validation errors", () => {
    const masked = maskValidationResult([
      new GraphQLError('Cannot query field "passwordHash" on type "User".', {
        extensions: { code: "GRAPHQL_VALIDATION_FAILED" },
      }),
    ]);
    const error = masked[0];
    assert.ok(error);
    assert.equal(error.extensions.code, "UNEXPECTED");
    assert.equal(serialized(error).includes("passwordHash"), false);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  accountCreatedMessage,
  courseFromAddress,
  escapeHtml,
  linkOrigin,
  passwordResetMessage,
  resendBody,
} from "./mail.js";

describe("course mail", () => {
  it("sends from the course address", () => {
    assert.equal(
      courseFromAddress,
      "Data Structures and Algorithms <noreply@datastructuresandalgorithms.com>",
    );
    assert.equal(courseFromAddress.includes("archflow"), false);
    const body = resendBody(
      accountCreatedMessage({
        name: "Ada",
        email: "ada@example.com",
        courseUrl: "https://datastructuresandalgorithms.com/course",
      }),
    );
    assert.equal(body.from, courseFromAddress);
    assert.equal(
      body.reply_to,
      "Data Structures and Algorithms <hello@datastructuresandalgorithms.com>",
    );
    assert.equal(JSON.stringify(body).includes("archflow"), false);
  });

  it("escapes names before they enter the html", () => {
    const message = accountCreatedMessage({
      name: "Ada <script>",
      email: "ada@example.com",
      courseUrl: "https://datastructuresandalgorithms.com/course",
    });
    assert.equal(message.html.includes("Ada &lt;script&gt;"), true);
    assert.equal(message.html.includes("<script>"), false);
    assert.equal(message.to, "ada@example.com");
    assert.equal(escapeHtml(`Tom & "Ada"`), "Tom &amp; &quot;Ada&quot;");
  });

  it("puts the reset link in the message", () => {
    const message = passwordResetMessage({
      name: "Ada",
      email: "ada@example.com",
      resetUrl: "https://datastructuresandalgorithms.com/reset-password?token=abc",
    });
    assert.equal(
      message.html.includes(
        "https://datastructuresandalgorithms.com/reset-password?token=abc",
      ),
      true,
    );
    assert.equal(message.text.includes("Choose a new password"), true);
  });

  it("uses the public site when it is an allowed origin", () => {
    assert.equal(
      linkOrigin([
        "https://dsa-wheat-phi.vercel.app",
        "https://datastructuresandalgorithms.com",
      ]),
      "https://datastructuresandalgorithms.com",
    );
    assert.equal(linkOrigin(["http://localhost:3000"]), "http://localhost:3000");
  });
});

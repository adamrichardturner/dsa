import { Context, Effect, Layer, Redacted } from "effect";
import { AppConfig } from "../config.js";
import { Unexpected } from "./errors.js";

export const courseFromAddress =
  "Data Structures and Algorithms <noreply@datastructuresandalgorithms.com>";

const replyToAddress = "Data Structures and Algorithms <hello@datastructuresandalgorithms.com>";

export const resendBody = (message: OutboundMessage) => ({
  from: courseFromAddress,
  to: [message.to],
  subject: message.subject,
  html: message.html,
  text: message.text,
  reply_to: replyToAddress,
});
const logoUrl = "https://datastructuresandalgorithms.com/email-mark.png";
const siteName = "Data Structures and Algorithms";

export interface OutboundMessage {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
}

export const linkOrigin = (origins: readonly string[]): string => {
  const site = "https://datastructuresandalgorithms.com";
  if (origins.includes(site)) {
    return site;
  }
  for (const origin of origins) {
    if (origin.startsWith("http://localhost")) {
      return origin;
    }
  }
  return origins[0] ?? site;
};

export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

interface Letter {
  readonly to: string;
  readonly subject: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly actionLabel: string;
  readonly actionUrl: string;
  readonly footnote: string;
}

const renderLetter = (letter: Letter): OutboundMessage => {
  let htmlParagraphs = "";
  let textParagraphs = "";
  for (const paragraph of letter.paragraphs) {
    htmlParagraphs += `<p style="margin:0 0 16px;font-family:Georgia,'Iowan Old Style',Palatino,'Palatino Linotype',serif;font-size:16px;line-height:1.6;color:#171717;">${escapeHtml(paragraph)}</p>`;
    textParagraphs += `${paragraph}\n\n`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f4f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;">
            <tr>
              <td style="padding:28px 28px 8px;">
                <img src="${logoUrl}" width="40" height="40" alt="" style="display:block;border:0;outline:none;" />
                <p style="margin:16px 0 0;font-family:Georgia,'Iowan Old Style',Palatino,'Palatino Linotype',serif;font-size:13px;letter-spacing:0.01em;color:#52525b;">${siteName}</p>
                <h1 style="margin:8px 0 0;font-family:Georgia,'Iowan Old Style',Palatino,'Palatino Linotype',serif;font-size:28px;line-height:1.25;font-weight:500;color:#171717;">${escapeHtml(letter.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 0;">${htmlParagraphs}</td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px;">
                <a href="${escapeHtml(letter.actionUrl)}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;font-family:Georgia,'Iowan Old Style',Palatino,'Palatino Linotype',serif;font-size:16px;line-height:1;padding:14px 18px;border-radius:10px;">${escapeHtml(letter.actionLabel)}</a>
                <p style="margin:20px 0 0;font-family:Georgia,'Iowan Old Style',Palatino,'Palatino Linotype',serif;font-size:13px;line-height:1.5;color:#71717a;">${escapeHtml(letter.footnote)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${siteName}\n\n${letter.title}\n\n${textParagraphs}${letter.actionLabel}: ${letter.actionUrl}\n\n${letter.footnote}\n`;

  return {
    to: letter.to,
    subject: letter.subject,
    html,
    text,
  };
};

export const accountCreatedMessage = (input: {
  readonly name: string;
  readonly email: string;
  readonly courseUrl: string;
}): OutboundMessage =>
  renderLetter({
    to: input.email,
    subject: "Your account is ready",
    title: "Your account is ready",
    paragraphs: [
      `Hello ${input.name},`,
      "Your account for Data Structures and Algorithms is ready.",
      "The course is four weeks of TypeScript. Each lesson opens beside the editor, and your progress stays on this account.",
    ],
    actionLabel: "Open the course",
    actionUrl: input.courseUrl,
    footnote: `You received this because an account was created for ${input.email}. If that was not you, you can ignore this message.`,
  });

export const passwordResetMessage = (input: {
  readonly name: string;
  readonly email: string;
  readonly resetUrl: string;
}): OutboundMessage =>
  renderLetter({
    to: input.email,
    subject: "Reset your password",
    title: "Reset your password",
    paragraphs: [
      `Hello ${input.name},`,
      `We received a request to reset the password for ${input.email}.`,
      "This link lasts one hour and can be used once.",
    ],
    actionLabel: "Choose a new password",
    actionUrl: input.resetUrl,
    footnote:
      "If you did not ask for this, ignore the message. Your password will stay the same.",
  });

export const passwordChangedMessage = (input: {
  readonly name: string;
  readonly email: string;
  readonly signInUrl: string;
}): OutboundMessage =>
  renderLetter({
    to: input.email,
    subject: "Your password was changed",
    title: "Your password was changed",
    paragraphs: [
      `Hello ${input.name},`,
      `The password for ${input.email} was just changed.`,
      "If you made this change, sign in with the new password. If you did not, reset the password from the sign-in page.",
    ],
    actionLabel: "Sign in",
    actionUrl: input.signInUrl,
    footnote: "This message confirms a password change. We will not ask you to send a password back.",
  });

const readResendFailure = (value: unknown): string => {
  if (typeof value !== "object" || value === null || !("message" in value)) {
    return "Could not send that email.";
  }
  const message: unknown = value.message;
  if (typeof message !== "string" || message.trim().length === 0) {
    return "Could not send that email.";
  }
  return "Could not send that email. Try again in a moment.";
};

export class Mail extends Context.Service<
  Mail,
  {
    readonly send: (message: OutboundMessage) => Effect.Effect<void, Unexpected>;
  }
>()("app/Mail") {
  static readonly layer = Layer.effect(
    Mail,
    Effect.gen(function* () {
      const config = yield* AppConfig;
      const send = (message: OutboundMessage) =>
        Effect.gen(function* () {
          const apiKey = Redacted.value(config.resendApiKey).trim();
          if (apiKey.length === 0) {
            return yield* new Unexpected({ message: "Email is not configured." });
          }

          const response = yield* Effect.tryPromise({
            try: () =>
              fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(resendBody(message)),
              }),
            catch: () => new Unexpected({ message: "Could not send that email." }),
          });
          if (response.ok) {
            return;
          }

          const body: unknown = yield* Effect.tryPromise({
            try: () => response.json(),
            catch: () => new Unexpected({ message: "Could not send that email." }),
          });
          yield* Effect.logError("Resend rejected the email.", body);
          return yield* new Unexpected({ message: readResendFailure(body) });
        });

      return Mail.of({ send });
    }),
  );
}

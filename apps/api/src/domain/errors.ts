import { Schema } from "effect";

export class BadInput extends Schema.TaggedError<BadInput>()("BadInput", {
  message: Schema.String,
}) {}

export class EmailTaken extends Schema.TaggedError<EmailTaken>()("EmailTaken", {
  message: Schema.String,
}) {}

export class InvalidCredentials extends Schema.TaggedError<InvalidCredentials>()(
  "InvalidCredentials",
  {
    message: Schema.String,
  },
) {}

export class Unauthorized extends Schema.TaggedError<Unauthorized>()("Unauthorized", {
  message: Schema.String,
}) {}

export class NotFound extends Schema.TaggedError<NotFound>()("NotFound", {
  message: Schema.String,
}) {}

export class Unexpected extends Schema.TaggedError<Unexpected>()("Unexpected", {
  message: Schema.String,
}) {}

export class OauthFlowError extends Schema.TaggedError<OauthFlowError>()("OauthFlowError", {
  code: Schema.Literals([
    "email",
    "conflict",
    "linked",
    "provider",
    "expired",
    "access_denied",
    "unavailable",
  ]),
  message: Schema.String,
}) {}

export type AppError =
  | BadInput
  | EmailTaken
  | InvalidCredentials
  | Unauthorized
  | NotFound
  | Unexpected
  | OauthFlowError;

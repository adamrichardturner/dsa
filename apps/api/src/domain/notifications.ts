import { randomUUID } from "node:crypto";
import { Context, Effect, Layer, Schema } from "effect";
import { SqlClient, SqlSchema } from "effect/sql";
import { Unexpected } from "./errors.js";
import { Insights } from "./insights.js";
import type { NotificationCentre, StudyNotification } from "./models.js";
import {
  allowReturn,
  planNotifications,
  type PlannedNotification,
} from "./notifications-plan.js";
import {
  progressClientFrom,
  progressTables,
  ProgressClientSchema,
  type ProgressClient,
} from "./progress-client.js";

const failUnexpected = (message: string) => <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(
    Effect.tapError((error) => Effect.logError(message, error)),
    Effect.mapError(() => new Unexpected({ message })),
  );

const VisibleRow = Schema.Struct({
  id: Schema.String,
  kind: Schema.String,
  title: Schema.String,
  body: Schema.String,
  href: Schema.NullOr(Schema.String),
  createdAt: Schema.String,
  read: Schema.Boolean,
});

const ReturnRow = Schema.Struct({
  key: Schema.String,
  dismissed: Schema.Boolean,
  createdAt: Schema.String,
});

const LastDayRow = Schema.Struct({
  day: Schema.NullOr(Schema.String),
});

const UserClient = Schema.Struct({
  userId: Schema.String,
  client: ProgressClientSchema,
});

interface Visible {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly body: string;
  readonly href: string | null;
  readonly createdAt: string;
  readonly read: boolean;
}

const kindFrom = (value: string): StudyNotification["kind"] => {
  if (value === "habit") {
    return "habit";
  }
  return "achievement";
};

const toCentre = (rows: readonly Visible[]): NotificationCentre => {
  const items: StudyNotification[] = [];
  let unreadCount = 0;
  for (const row of rows) {
    if (!row.read) {
      unreadCount += 1;
    }
    const rawHref = row.href ?? "";
    items.push({
      id: row.id,
      kind: kindFrom(row.kind),
      title: row.title,
      body: row.body,
      href: rawHref.length === 0 ? null : rawHref,
      createdAt: row.createdAt,
      read: row.read,
    });
  }
  return { unreadCount, items };
};

export class Notifications extends Context.Service<
  Notifications,
  {
    centre(
      userId: string,
      client: ProgressClient,
    ): Effect.Effect<NotificationCentre, Unexpected, Insights>;
    dismiss(
      userId: string,
      client: ProgressClient,
      id: string,
    ): Effect.Effect<NotificationCentre, Unexpected, Insights>;
    clear(
      userId: string,
      client: ProgressClient,
    ): Effect.Effect<NotificationCentre, Unexpected, Insights>;
    markRead(
      userId: string,
      client: ProgressClient,
    ): Effect.Effect<NotificationCentre, Unexpected, Insights>;
  }
>()("app/Notifications") {
  static readonly layer = Layer.effect(
    Notifications,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const lastActive = SqlSchema.findAll({
        Request: UserClient,
        Result: LastDayRow,
        execute: (request) => {
          const tables = progressTables(progressClientFrom(request.client));
          return sql`
            SELECT to_char(MAX(created_at) AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day
            FROM ${sql(tables.submissions)}
            WHERE user_id = ${request.userId}
          `;
        },
      });

      const listReturns = SqlSchema.findAll({
        Request: UserClient,
        Result: ReturnRow,
        execute: (request) => sql`
          SELECT
            dedupe_key AS "key",
            dismissed_at IS NOT NULL AS "dismissed",
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
          FROM notifications
          WHERE user_id = ${request.userId}
            AND client = ${request.client}
            AND dedupe_key LIKE 'habit:return:%'
        `,
      });

      const listVisible = SqlSchema.findAll({
        Request: UserClient,
        Result: VisibleRow,
        execute: (request) => sql`
          SELECT
            id,
            kind,
            title,
            body,
            href,
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt",
            read_at IS NOT NULL AS "read"
          FROM notifications
          WHERE user_id = ${request.userId}
            AND client = ${request.client}
            AND dismissed_at IS NULL
          ORDER BY created_at DESC, id DESC
        `,
      });

      const insertNotification = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          userId: Schema.String,
          client: ProgressClientSchema,
          kind: Schema.String,
          key: Schema.String,
          title: Schema.String,
          body: Schema.String,
          href: Schema.String,
          createdAt: Schema.String,
        }),
        execute: (request) => sql`
          INSERT INTO notifications (
            id,
            user_id,
            client,
            kind,
            dedupe_key,
            title,
            body,
            href,
            created_at
          )
          VALUES (
            ${request.id},
            ${request.userId},
            ${request.client},
            ${request.kind},
            ${request.key},
            ${request.title},
            ${request.body},
            ${request.href},
            ${request.createdAt}
          )
          ON CONFLICT (user_id, client, dedupe_key) DO NOTHING
        `,
      });

      const dismissRow = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          userId: Schema.String,
          client: ProgressClientSchema,
        }),
        execute: (request) => sql`
          UPDATE notifications
          SET dismissed_at = NOW()
          WHERE id = ${request.id}
            AND user_id = ${request.userId}
            AND client = ${request.client}
            AND dismissed_at IS NULL
        `,
      });

      const dismissAll = SqlSchema.void({
        Request: UserClient,
        execute: (request) => sql`
          UPDATE notifications
          SET dismissed_at = NOW()
          WHERE user_id = ${request.userId}
            AND client = ${request.client}
            AND dismissed_at IS NULL
        `,
      });

      const markReadRows = SqlSchema.void({
        Request: UserClient,
        execute: (request) => sql`
          UPDATE notifications
          SET read_at = NOW()
          WHERE user_id = ${request.userId}
            AND client = ${request.client}
            AND dismissed_at IS NULL
            AND read_at IS NULL
        `,
      });

      const load = Effect.fn("Notifications.load")(function* (
        userId: string,
        client: ProgressClient,
      ) {
        const insights = yield* Insights;
        const view = yield* insights
          .forUser(userId, client)
          .pipe(failUnexpected("Could not load your notifications."));
        const days = yield* lastActive({ userId, client }).pipe(
          failUnexpected("Could not load your notifications."),
        );
        const day = days[0]?.day ?? null;
        const now = new Date();
        const drafts = planNotifications({
          now,
          lessonsCompleted: view.lessonsCompleted,
          lessonsTotal: view.lessonsTotal,
          problemsSolved: view.problemsSolved,
          attempts: view.attempts,
          streak: view.streak,
          lastActiveDay: day === "" ? null : day,
          lessons: view.lessons,
        });
        const prior = yield* listReturns({ userId, client }).pipe(
          failUnexpected("Could not load your notifications."),
        );
        const kept: PlannedNotification[] = [];
        for (const draft of drafts) {
          if (!draft.key.startsWith("habit:return:")) {
            kept.push(draft);
            continue;
          }
          if (!allowReturn(prior, draft.key, now)) {
            continue;
          }
          kept.push(draft);
        }

        const base = Date.now();
        let offset = 0;
        for (const draft of kept) {
          yield* insertNotification({
            id: randomUUID(),
            userId,
            client,
            kind: draft.kind,
            key: draft.key,
            title: draft.title,
            body: draft.body,
            href: draft.href,
            createdAt: new Date(base + offset).toISOString(),
          }).pipe(failUnexpected("Could not save your notifications."));
          offset += 1;
        }

        const rows = yield* listVisible({ userId, client }).pipe(
          failUnexpected("Could not load your notifications."),
        );
        return toCentre(rows);
      });

      const dismiss = Effect.fn("Notifications.dismiss")(function* (
        userId: string,
        client: ProgressClient,
        id: string,
      ) {
        yield* dismissRow({ id, userId, client }).pipe(
          failUnexpected("Could not update your notifications."),
        );
        return yield* load(userId, client);
      });

      const clear = Effect.fn("Notifications.clear")(function* (
        userId: string,
        client: ProgressClient,
      ) {
        yield* dismissAll({ userId, client }).pipe(
          failUnexpected("Could not update your notifications."),
        );
        return yield* load(userId, client);
      });

      const markRead = Effect.fn("Notifications.markRead")(function* (
        userId: string,
        client: ProgressClient,
      ) {
        yield* markReadRows({ userId, client }).pipe(
          failUnexpected("Could not update your notifications."),
        );
        return yield* load(userId, client);
      });

      return Notifications.of({
        centre: load,
        dismiss,
        clear,
        markRead,
      });
    }),
  );
}

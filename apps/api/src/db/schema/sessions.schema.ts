import { index, pgTable } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "./users.schema";

export const sessions = pgTable(
  "sessions",
  (t) => ({
    id: t
      .uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),

    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // SHA-256 hex digest of the raw refresh JWT — 64 chars
    refreshTokenHash: t.varchar("refresh_token_hash", { length: 64 }).notNull().unique(),

    expiresAt: t
      .timestamp("expires_at", {
        mode: "date",
        precision: 3,
        withTimezone: true,
      })
      .notNull(),

    // NULL  → session is active
    // non-NULL → session was revoked at this timestamp
    revokedAt: t.timestamp("revoked_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    }),

    userAgent: t.varchar("user_agent", { length: 255 }),

    createdAt: t
      .timestamp("created_at", {
        mode: "date",
        precision: 3,
        withTimezone: true,
      })
      .defaultNow()
      .notNull(),
  }),
  (table) => [index("sessions_user_id_index").on(table.userId)],
);

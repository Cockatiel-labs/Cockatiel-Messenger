import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import { sessions, users } from "../../db/schema";

export async function isUsernameAvailable(username: string) {
  const user = await db.query.users.findFirst({
    columns: { id: true },
    where: (user, { eq }) => eq(user.username, username),
  });

  return user === undefined;
}

export async function findUserById(userId: string) {
  return db.query.users.findFirst({
    columns: {
      id: true,
      username: true,
    },
    where: (user, { eq }) => eq(user.id, userId),
  });
}

/** Like `findUserById` but also `returns the password hash` for credential checks. */
export async function findUserByIdWithPassword(userId: string) {
  return db.query.users.findFirst({
    columns: {
      id: true,
      username: true,
      password: true,
    },
    where: (user, { eq }) => eq(user.id, userId),
  });
}

export async function findUserByUsername(username: string) {
  return db.query.users.findFirst({
    columns: {
      id: true,
      username: true,
      password: true,
    },
    where: (user, { eq }) => eq(user.username, username),
  });
}

export async function createUser(data: { username: string; password: string }) {
  const [user] = await db.insert(users).values(data).returning({
    id: users.id,
    username: users.username,
  });

  return user;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  await db.update(users).set({ password: passwordHash }).where(eq(users.id, userId));
}

export async function insertSession(data: { userId: string; refreshTokenHash: string; expiresAt: Date }) {
  const [session] = await db
    .insert(sessions)
    .values({
      userId: data.userId,
      refreshTokenHash: data.refreshTokenHash,
      expiresAt: data.expiresAt,
    })
    .returning({ id: sessions.id });

  return session;
}

export async function findSessionByRefreshTokenHash(refreshTokenHash: string) {
  return db.query.sessions.findFirst({
    where: (session, { eq }) => eq(session.refreshTokenHash, refreshTokenHash),
  });
}

/** Mark a single session revoked (used on single-device logout). */
export async function revokeSessionById(sessionId: string) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, sessionId));
}

/**
 * Revoke every active session that belongs to a user.
 * Used by: logout-all, change-password, reuse-detection.
 */

export async function revokeAllUserSessions(userId: string) {
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
}

/**
 * Atomically revoke the old session and create a replacement keyed to the
 * new refresh token.  A transaction guarantees both writes succeed together
 * — no window where the old token is still live but the new one isn't tracked.
 */
export async function rotateSessiontransaction(data: {
  oldSessionId: string;
  userId: string;
  newRefreshTokenHash: string;
  expiresAt: Date;
}) {
  return db.transaction(async (transaction) => {
    await transaction.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.id, data.oldSessionId));

    const [newSession] = await transaction
      .insert(sessions)
      .values({
        userId: data.userId,
        refreshTokenHash: data.newRefreshTokenHash,
        expiresAt: data.expiresAt,
      })
      .returning({ id: sessions.id });

    return newSession;
  });
}

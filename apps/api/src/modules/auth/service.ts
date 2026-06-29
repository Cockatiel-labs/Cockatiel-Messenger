import type { ChangePasswordInput, SigninInput, SignupInput } from "@joo-joo/shared/schemas/auth/auth.schema";
import { hashPassword, hashToken } from "../../libs/helpers/hash";
import * as repository from "./repository";

export async function getIsUsernameAvailable(username: string) {
  return repository.isUsernameAvailable(username);
}

export async function signIn(body: SigninInput) {
  const user = await repository.findUserByUsername(body.username);

  if (!user) return null;

  const isMatch = await Bun.password.verify(body.password, user.password);

  if (!isMatch) return null;

  return user;
}

export async function signup(body: SignupInput) {
  const isUsernameAvailable = await repository.isUsernameAvailable(body.username);

  if (!isUsernameAvailable) return null;

  const passwordHash = await hashPassword(body.password);

  try {
    const user = await repository.createUser({
      username: body.username,
      password: passwordHash,
    });
    return user;
  } catch (error) {
    console.error(error);

    return null;
  }
}

export async function createSession(data: { userId: string; refreshToken: string; expiresAt: Date }) {
  const refreshTokenHash = await hashToken(data.refreshToken);

  await repository.insertSession({
    userId: data.userId,
    refreshTokenHash: refreshTokenHash,
    expiresAt: data.expiresAt,
  });
}

export async function revokeSessionByRefreshToken(refreshToken: string) {
  const refreshTokenHash = await hashToken(refreshToken);

  const session = await repository.findSessionByRefreshTokenHash(refreshTokenHash);

  if (session && !session.revokedAt) {
    await repository.revokeSessionById(session.id);
  }
}

export async function getSessionByRefreshToken(refreshToken: string) {
  const refreshTokenHash = await hashToken(refreshToken);

  return await repository.findSessionByRefreshTokenHash(refreshTokenHash);
}

export async function changePassword(userId: string, body: ChangePasswordInput) {
  const user = await repository.findUserByIdWithPassword(userId);

  if (!user) return null;

  const isMatch = await Bun.password.verify(body.currentPassword, user.password);

  //   false  – current password incorrect
  if (!isMatch) return false;

  const passwordHash = await hashPassword(body.newPassword);

  await repository.updateUserPassword(userId, passwordHash);
  await repository.revokeAllUserSessions(userId);

  //   true   – password changed and all sessions revoked
  return true;
}

export async function logoutAll(userId: string) {
  await repository.revokeAllUserSessions(userId);
}

export async function rotateSession(data: {
  oldSessionId: string;
  userId: string;
  newRefreshToken: string;
  expiresAt: Date;
}) {
  const refreshTokenHash = await hashToken(data.newRefreshToken);

  await repository.rotateSessiontransaction({
    oldSessionId: data.oldSessionId,
    userId: data.userId,
    newRefreshTokenHash: refreshTokenHash,
    expiresAt: data.expiresAt,
  });
}

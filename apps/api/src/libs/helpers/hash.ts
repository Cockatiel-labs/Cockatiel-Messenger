import crypto from "node:crypto";
import { argon2IdOptions } from "../../config/hash";

export async function hashPassword(password: string) {
  return Bun.password.hash(password, argon2IdOptions);
}

export async function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

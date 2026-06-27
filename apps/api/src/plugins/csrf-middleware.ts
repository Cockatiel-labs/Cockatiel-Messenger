import { Elysia } from "elysia";
import { csrfCookieOptions } from "../constants/cookie";
import { csrf } from "./csrf";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"] as const;

/** Parse a named cookie value from a Cookie header string. */
function parseCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const pair of header.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key === name) {
      const value = rest.join("=");
      if (value) return decodeURIComponent(value);
    }
  }
  return undefined;
}

/**
 * Build a `Set-Cookie` header string for the CSRF token cookie.
 */
function buildSetCookie(token: string): string {
  const parts = [`csrf_token=${encodeURIComponent(token)}`, `Path=${csrfCookieOptions.path}`];

  if (csrfCookieOptions.sameSite) {
    parts.push(`SameSite=${csrfCookieOptions.sameSite}`);
  }
  if (csrfCookieOptions.secure) {
    parts.push("Secure");
  }
  if (typeof csrfCookieOptions.maxAge === "number") {
    parts.push(`Max-Age=${csrfCookieOptions.maxAge}`);
  }
  // httpOnly is intentionally omitted (cookie must be readable by JS).

  return parts.join("; ");
}

/**
 * Elysia plugin that enforces CSRF protection using the double-submit-cookie pattern.
 *
 * Flow:
 *  - On safe requests (GET/HEAD/OPTIONS): ensure a `csrf_token` cookie exists, generating
 *    one if missing. No verification is performed.
 *  - On state-changing requests (POST/PUT/PATCH/DELETE): require an `x-csrf-token` header
 *    whose value verifies against the `csrf_token` cookie. On success the token is rotated
 *    via csrf.update() and the cookie is refreshed.
 *
 * Returns 403 with a clear error message when verification fails.
 */
export const csrfProtection = new Elysia({ name: "csrfProtection" })
  .derive(async () => {
    // Pre-generate a fresh token for use when no cookie exists yet.
    const freshToken = await csrf.create();
    return { csrfFreshToken: freshToken };
  })
  .onBeforeHandle({ as: "global" }, async ({ request, set, csrfFreshToken }) => {
    const method = request.method.toUpperCase();
    const cookieHeader = request.headers.get("cookie");
    const existingToken = parseCookie(cookieHeader, "csrf_token");

    if (!SAFE_METHODS.includes(method as (typeof SAFE_METHODS)[number])) {
      // State-changing request — enforce verification.
      const headerToken = request.headers.get("x-csrf-token");

      if (!headerToken || !existingToken) {
        set.status = 403;
        set.headers["set-cookie"] = buildSetCookie(csrfFreshToken);
        return {
          success: false,
          message: "CSRF token missing. Include the x-csrf-token header.",
        };
      }

      const isValid = await csrf.verify(headerToken, existingToken);

      if (!isValid) {
        set.status = 403;
        set.headers["set-cookie"] = buildSetCookie(csrfFreshToken);
        return {
          success: false,
          message: "CSRF token invalid. Request rejected.",
        };
      }

      // Rotate the token after successful verification (BREACH mitigation).
      const rotatedToken = csrf.update(existingToken);
      set.headers["set-cookie"] = buildSetCookie(rotatedToken);
    } else {
      // Safe request — ensure the cookie is set so the client has a token for
      // subsequent state-changing requests.
      if (!existingToken) {
        set.headers["set-cookie"] = buildSetCookie(csrfFreshToken);
      }
    }
  });

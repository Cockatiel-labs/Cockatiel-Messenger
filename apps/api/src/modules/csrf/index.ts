import { Elysia } from "elysia";
import { csrfCookieOptions } from "../../constants/cookie";
import { csrf } from "../../plugins/csrf";

/**
 * CSRF token bootstrap endpoint.
 *
 * This route exists to solve the "first-request problem": a fresh browser that
 * navigates directly to a sign-up/sign-in page has no CSRF cookie yet, so the
 * first state-changing POST would be rejected. The frontend calls this endpoint
 * on app load to ensure a CSRF token cookie is always present before any
 * mutation is attempted.
 *
 * GET /api/v1/csrf-token
 *  - Always generates a fresh token
 *  - Sets it as a non-httpOnly cookie readable by the frontend
 *  - Also returns the token in the response body for convenience
 */
export const csrfModule = new Elysia({ prefix: "/v1" })
  .derive(async () => {
    const token = await csrf.create();
    return { csrfBootstrapToken: token };
  })
  .get("/csrf-token", ({ set, csrfBootstrapToken }) => {
    const parts = [
      `csrf_token=${encodeURIComponent(csrfBootstrapToken)}`,
      `Path=${csrfCookieOptions.path}`,
      `SameSite=${csrfCookieOptions.sameSite}`,
    ];
    if (csrfCookieOptions.secure) parts.push("Secure");
    if (typeof csrfCookieOptions.maxAge === "number") {
      parts.push(`Max-Age=${csrfCookieOptions.maxAge}`);
    }

    set.headers["set-cookie"] = parts.join("; ");

    return {
      success: true,
      csrfToken: csrfBootstrapToken,
    };
  });

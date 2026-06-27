import Csrf from "modern-csrf";

/**
 * CSRF token manager built on top of the `modern-csrf` package.
 *
 * Token format: "<secret>-<salt>"
 *  - create(): generates a new token (async, uses crypto.randomBytes for the secret)
 *  - update(token): rotates only the salt part (fast, synchronous)
 *  - verify(token1, token2): returns true when both tokens share the same secret
 *
 * We use a double-submit-cookie pattern:
 *  - Server sets a non-httpOnly `csrf_token` cookie.
 *  - Client reads the cookie and echoes it back via the `x-csrf-token` header.
 *  - Server verifies the header token against the cookie token using verify().
 */
const csrf = Csrf();

export { csrf };

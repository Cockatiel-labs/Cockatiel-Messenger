import { clearAccessTokenCookieOptions, clearRefreshTokenCookieOptions } from "../../config/cookie";

export function clearAuthCookies(
  accessToken: { set: (opts: object) => void },
  refreshToken: { set: (opts: object) => void },
) {
  accessToken.set({ value: "", ...clearAccessTokenCookieOptions });
  refreshToken.set({ value: "", ...clearRefreshTokenCookieOptions });
}

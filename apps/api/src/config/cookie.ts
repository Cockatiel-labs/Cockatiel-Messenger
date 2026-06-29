import { ACCESS_TOKEN_EXP, Access_COOKIE_PATH, REFRESH_COOKIE_PATH, REFRESH_TOKEN_EXP } from "../constants/cookie";
import { envConfig } from "./env";

const sameSite = envConfig.NODE_ENV === "production" ? "strict" : "lax";

export const accessTokenCookieOptions = {
  httpOnly: true,
  maxAge: ACCESS_TOKEN_EXP,
  secure: envConfig.NODE_ENV === "production",
  sameSite: sameSite,
  path: Access_COOKIE_PATH,
} as const;

export const refreshTokenCookieOptions = {
  httpOnly: true,
  maxAge: REFRESH_TOKEN_EXP,
  secure: envConfig.NODE_ENV === "production",
  sameSite: sameSite,
  path: REFRESH_COOKIE_PATH,
} as const;

export const clearAccessTokenCookieOptions = {
  httpOnly: true,
  maxAge: 0,
  expires: new Date(0),
  secure: envConfig.NODE_ENV === "production",
  sameSite: sameSite,
  path: Access_COOKIE_PATH,
};

export const clearRefreshTokenCookieOptions = {
  httpOnly: true,
  maxAge: 0,
  expires: new Date(0),
  secure: envConfig.NODE_ENV === "production",
  sameSite: sameSite,
  path: REFRESH_COOKIE_PATH,
} as const;

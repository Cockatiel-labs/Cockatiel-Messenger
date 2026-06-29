import { usernameRegex } from "@joo-joo/shared/constants/regex";
import { checkUsernameQuery, cookieSchema, signinSchema, signupSchema } from "@joo-joo/shared/schemas/auth/auth.schema";
import Elysia, { status } from "elysia";
import { accessTokenCookieOptions, refreshTokenCookieOptions } from "../../config/cookie";
import { accessJwtConfig, refreshJwtConfig } from "../../config/jwt";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../../constants/cookie";
import { authGuard } from "../../guards/auth.guard";
import { clearAuthCookies } from "../../libs/helpers/cookie";
import { AuthResult } from "./model";
import { findUserById, revokeAllUserSessions } from "./repository";
import {
  createSession,
  getIsUsernameAvailable,
  getSessionByRefreshToken,
  logoutAll,
  revokeSessionByRefreshToken,
  rotateSession,
  signIn,
  signup,
} from "./service";

export const auth = new Elysia({ prefix: "/v1/auth" })
  .use(accessJwtConfig)
  .use(refreshJwtConfig)

  // ── GET /check-username
  .group("", (app) =>
    app.get(
      "/check-username",
      async ({ query: { username }, set }) => {
        if (!usernameRegex.test(username)) {
          set.status = 400;

          return {
            success: false,
            message: "Username must start with a letter and contain only letters, numbers, and underscores",
          };
        }

        try {
          return getIsUsernameAvailable(username);
        } catch (error) {
          console.error("Check-username error:", error);

          set.status = 500;
          return {
            success: false,
            message: "Internal server error",
          };
        }
      },
      {
        query: checkUsernameQuery,
        response: {
          200: AuthResult.checkUsernameResponse,
          400: AuthResult.errorResponse,
          500: AuthResult.errorResponse,
        },
      },
    ),
  )

  // ── GET /profile
  .group("/profile", (app) =>
    app.use(authGuard).get("/", async ({ payload }) => {
      const { sub } = payload;

      const user = await findUserById(sub);

      if (!user) throw status(404, "User not found");

      return user;
    }),
  )

  // ── POST /sign-up  &  POST /sign-in
  .group("", (app) =>
    app
      .post(
        "/sign-up",
        async ({ accessJwt, refreshJwt, body, set, cookie: { accessToken, refreshToken } }) => {
          try {
            const user = await signup(body);

            if (!user) {
              set.status = 409;

              return {
                success: false,
                message: "Username already exists",
              };
            }

            const accessTokenValue = await accessJwt.sign({
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
            });

            const refreshTokenValue = await refreshJwt.sign({
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP,
            });

            await createSession({
              userId: user.id,
              refreshToken: refreshTokenValue,
              expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXP * 1000),
            });

            accessToken.set({
              value: accessTokenValue,
              ...accessTokenCookieOptions,
            });
            refreshToken.set({
              value: refreshTokenValue,
              ...refreshTokenCookieOptions,
            });

            set.status = 201;
            return {
              success: true,
              message: "User created Successfully",
              data: {
                user: {
                  id: user.id,
                  username: user.username,
                },
              },
            };
          } catch (error) {
            console.error("Sign-up error:", error);

            set.status = 500;
            return {
              success: false,
              message: "Internal server error",
            };
          }
        },
        {
          body: signupSchema,
          response: {
            201: AuthResult.authResponse,
            409: AuthResult.errorResponse,
            500: AuthResult.errorResponse,
          },
        },
      )
      .post(
        "/sign-in",
        async ({ accessJwt, refreshJwt, body, set, cookie: { accessToken, refreshToken } }) => {
          try {
            const user = await signIn(body);

            if (!user) {
              set.status = 401;
              return {
                success: false,
                message: "Invalid username or password",
              };
            }

            const accessTokenValue = await accessJwt.sign({
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
            });

            const refreshTokenValue = await refreshJwt.sign({
              sub: user.id,
              exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP,
            });

            await createSession({
              userId: user.id,
              refreshToken: refreshTokenValue,
              expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXP * 1000),
            });

            accessToken.set({
              value: accessTokenValue,
              ...accessTokenCookieOptions,
            });
            refreshToken.set({
              value: refreshTokenValue,
              ...refreshTokenCookieOptions,
            });

            return {
              success: true,
              message: "Login Successfully",
              data: {
                user: {
                  id: user.id,
                  username: user.username,
                },
              },
            };
          } catch (error) {
            console.error("Sign-in error:", error);

            set.status = 500;
            return {
              success: false,
              message: "Internal server error",
            };
          }
        },
        {
          body: signinSchema,
          response: {
            201: AuthResult.authResponse,
            401: AuthResult.errorResponse,
            500: AuthResult.errorResponse,
          },
        },
      ),
  )

  // ── POST /logout
  .post(
    "/logout",
    async ({ refreshJwt, cookie: { accessToken, refreshToken } }) => {
      const token = refreshToken.value;

      if (token) {
        const payload = await refreshJwt.verify(token);

        if (payload) {
          await revokeSessionByRefreshToken(token);
        }
      }

      clearAuthCookies(accessToken, refreshToken);

      return {
        success: true,
        message: "Logged out successfully",
      };
    },
    {
      cookie: cookieSchema,
      response: {
        200: AuthResult.logoutResponse,
      },
    },
  )
  // ── POST /logout-all
  .group("", (app) =>
    app.use(authGuard).post("/logout-all", async ({ payload, cookie: { accessToken, refreshToken } }) => {
      await logoutAll(payload.sub);

      clearAuthCookies(accessToken, refreshToken);

      return {
        success: true,
        message: "Logged out from all devices successfully",
      };
    }),
  )

  // ── POST /change-password
  // .post()
  // ── POST /refresh
  .group("", (app) =>
    app.post(
      "/refresh",
      async ({ accessJwt, refreshJwt, set, cookie: { accessToken, refreshToken } }) => {
        const token = refreshToken.value;

        if (!token) {
          set.status = 401;

          return {
            success: false,
            message: "Refresh token missing",
          };
        }

        const payload = await refreshJwt.verify(token);

        if (!payload) {
          set.status = 401;

          return {
            success: false,
            message: "Invalid refresh token",
          };
        }

        const session = await getSessionByRefreshToken(token);

        if (!session) {
          set.status = 401;

          return {
            success: false,
            message: "Session not found. Please sign in again.",
          };
        }

        if (session.refreshTokenHash !== null) {
          console.warn(`[SECURITY] Refresh token reuse detected for user ${payload.sub}. Revoking all sessions.`);

          await revokeAllUserSessions(payload.sub);
          clearAuthCookies(accessToken, refreshToken);

          set.status = 401;

          return {
            success: false,
            message: "Token reuse detected. All sessions have been revoked. Please sign in again.",
          };
        }

        const newRefreshJwtValue = await refreshJwt.sign({
          sub: payload.sub,
          exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXP,
        });

        const newAccessTokenValue = await accessJwt.sign({
          sub: payload.sub,
          exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
        });

        await rotateSession({
          userId: payload.sub,
          oldSessionId: session.id,
          newRefreshToken: newRefreshJwtValue,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXP * 1000),
        });

        accessToken.set({
          value: newAccessTokenValue,
          ...accessTokenCookieOptions,
        });
        refreshToken.set({
          value: newRefreshJwtValue,
          ...refreshTokenCookieOptions,
        });

        return {
          success: true,
          message: "Tokens refreshed successfully",
        };
      },
      {
        cookie: cookieSchema,
        response: {
          200: AuthResult.refreshResponse,
          401: AuthResult.errorResponse,
        },
      },
    ),
  );

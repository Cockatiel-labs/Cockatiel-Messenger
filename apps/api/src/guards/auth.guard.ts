import Elysia, { t } from "elysia";
import { accessJwtConfig } from "../config/jwt";

export const authGuard = new Elysia({ name: "authGuard" })
  .use(accessJwtConfig)
  .guard({
    cookie: t.Cookie({
      accessToken: t.String(),
    }),
  })
  .resolve({ as: "global" }, async ({ accessJwt, cookie: { accessToken }, status }) => {
    const token = accessToken.value as string | undefined;

    if (!token) {
      throw status(401, "Unauthorized");
    }

    const payload: { sub: string; sid: string; exp: number; iat: number } | false = await accessJwt.verify(token);

    if (!payload) {
      throw status(401, "Unauthorized");
    }

    return { payload };
  });

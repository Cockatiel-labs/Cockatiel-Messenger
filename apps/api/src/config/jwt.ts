import jwt from "@elysia/jwt";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "../constants/cookie";
import { envConfig } from "./env";

export const accessJwtConfig = jwt({
  name: "accessJwt",
  secret: envConfig.ACCESS_JWT_SECRET,
  exp: ACCESS_TOKEN_EXP,
});

export const refreshJwtConfig = jwt({
  name: "refreshJwt",
  secret: envConfig.REFRESH_JWT_SECRET,
  exp: REFRESH_TOKEN_EXP,
});

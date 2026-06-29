import * as z from "zod";
import { originsAllowlistSchema } from "../constants/cors";

export const backendEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.url(),
  ORIGINS: originsAllowlistSchema,
  PORT: z.coerce.number().int().positive().default(4000),
  ACCESS_JWT_SECRET: z.string(),
  REFRESH_JWT_SECRET: z.string(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

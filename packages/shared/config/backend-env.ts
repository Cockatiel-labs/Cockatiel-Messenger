import * as z from "zod";

const originAllowlistSchema = z
  .string()
  .default("http://localhost:3000")
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url()).nonempty("ORIGIN_ALLOWLIST must contain at least one origin"));

export const backendEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.url(),
  ORIGIN_ALLOWLIST: originAllowlistSchema,
  PORT: z.coerce.number().int().positive().default(4000),
  ACCESS_JWT_SECRET: z.string(),
  REFRESH_JWT_SECRET: z.string(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

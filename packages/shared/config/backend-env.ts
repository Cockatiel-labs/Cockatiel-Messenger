import * as z from "zod";

/**
 * Parse a comma-separated list of allowed origins into a validated array.
 * Each origin must be a valid URL. Empty strings are filtered out.
 *
 * Using an explicit allowlist (never "*") is required because the API uses
 * credentials (cookies), and wildcard origins are rejected by browsers when
 * credentials: true is set.
 */
const originAllowlistSchema = z
  .string()
  .default("http://localhost:3000")
  .transform((value) =>
    value
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  )
  .refine((origins) => origins.length > 0, {
    message: "ORIGIN_ALLOWLIST must contain at least one origin",
  })
  .refine(
    (origins) =>
      origins.every((origin) => {
        try {
          new URL(origin);
          return true;
        } catch {
          return false;
        }
      }),
    {
      message: "Every origin in ORIGIN_ALLOWLIST must be a valid URL (e.g. https://example.com)",
    },
  );

export const backendEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.url(),
  ORIGIN_ALLOWLIST: originAllowlistSchema,
  PORT: z.coerce.number().int().positive().default(4000),
  ACCESS_JWT_SECRET: z.string(),
  REFRESH_JWT_SECRET: z.string(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

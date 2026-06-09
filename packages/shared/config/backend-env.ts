import * as z from "zod";

export const backendEnvSchema = z.object({
  DATABASE_URL: z.url(),
  ORIGIN: z.string().default("*"),
  PORT: z.coerce.number().int().positive().default(4000),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;
